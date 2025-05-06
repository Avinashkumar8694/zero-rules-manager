import { Request, Response } from 'express';
import { DatabaseService } from '../services/DatabaseService';
import { RuleVersion } from '../models/RuleVersion';
import { ExcelService } from '../services/ExcelService';

export class ExecutionController {
  private versionRepository: any;
  private excelService = new ExcelService();

  private async initialize() {
    const dbService = DatabaseService.getInstance();
    this.versionRepository = dbService.getDataSource().getRepository(RuleVersion);
  }

  constructor() {
    this.initialize().catch(error => {
      console.error('ExecutionController initialization failed:', error);
      process.exit(1);
    });
  }

  async execute(req: Request, res: Response) {
    try {
      // await this.ensureInitialized();
      const categoryId = req.params.categoryId;
      const inputs = req.body;

      if (!inputs || Object.keys(inputs).length === 0) {
        return res.status(400).json({ error: 'Input parameters are required' });
      }

      // Find active version for the category
      const activeVersion = await this.versionRepository.findOne({
        where: { categoryId, isActive: true }
      });

      if (!activeVersion) {
        return res.status(404).json({ error: 'No active rule version found for this category' });
      }

      return this.executeRules(activeVersion, inputs, res);
    } catch (error) {
      console.error('Rule execution error:', error);
      return res.status(500).json({ error: 'Failed to execute rules' });
    }
  }

  async executeLatestVersion(req: Request, res: Response) {
    try {
      // await this.ensureInitialized();
      const categoryId = req.params.categoryId;
      const inputs = req.body;

      if (!inputs || Object.keys(inputs).length === 0) {
        return res.status(400).json({ error: 'Input parameters are required' });
      }

      // Find latest version for the category
      const latestVersion = await this.versionRepository.findOne({
        where: { categoryId },
        order: { version: 'DESC' }
      });

      if (!latestVersion) {
        return res.status(404).json({ error: 'No version found for this category' });
      }

      return this.executeRules(latestVersion, inputs, res);
    } catch (error) {
      console.error('Rule execution error:', error);
      return res.status(500).json({ error: 'Failed to execute rules' });
    }
  }

  async executeSpecificVersion(req: Request, res: Response) {
    try {
      const { categoryId, versionId } = req.params;
      const inputs = req.body;

      if (!inputs || Object.keys(inputs).length === 0) {
        return res.status(400).json({ error: 'Input parameters are required' });
      }

      // Find specific version for the category
      const version = await this.versionRepository.findOne({
        where: { id: versionId, categoryId }
      });

      if (!version) {
        return res.status(404).json({ error: 'Version not found' });
      }

      return this.executeRules(version, inputs, res);
    } catch (error) {
      console.error('Rule execution error:', error);
      return res.status(500).json({ error: 'Failed to execute rules' });
    }
  }

  private async executeRules(version: RuleVersion, inputs: Record<string, any>, res: Response) {
    try {
      // Validate input parameters against version schema
      const requiredInputs = version.inputColumns || {};
      const missingInputs = Object.keys(requiredInputs).filter(key => !(key in inputs));

      if (missingInputs.length > 0) {
        return res.status(400).json({
          error: 'Missing required input parameters',
          missingParams: missingInputs
        });
      }

      // Execute rules using Excel service
      const results = await this.excelService.executeRules(version.filePath, inputs);

      return res.json({
        version: version.version,
        results
      });
    } catch (error) {
      console.error('Rule execution error:', error);
      return res.status(500).json({ error: 'Failed to execute rules' });
    }
  }
}