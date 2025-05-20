import { Request, Response } from 'express';
import { DatabaseService } from '../services/DatabaseService';
import { RuleVersion } from '../models/RuleVersion';
import { ExcelService } from '../services/ExcelService';
import { CodeExecutionService } from '../services/CodeExecutionService';
import { FlowExecutionService } from '../services/FlowExecutionService';

export class ExecutionController {
  private ruleVersionRepository: any;
  private excelService: ExcelService;
  private codeExecutionService: CodeExecutionService;
  private flowExecutionService: FlowExecutionService;

  constructor() {
    try {
      const dbService = DatabaseService.getInstance();
      this.ruleVersionRepository = dbService.getDataSource().getRepository(RuleVersion);
      this.excelService = new ExcelService();
      this.codeExecutionService = new CodeExecutionService();
      this.flowExecutionService = new FlowExecutionService();
    } catch (error) {
      console.error('ExecutionController initialization failed:', error);
      throw error;
    }
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
      const activeVersion = await this.ruleVersionRepository.findOne({
        where: { categoryId, isActive: true }
      });

      if (!activeVersion) {
        return res.status(404).json({ error: 'No active rule version found for this category' });
      }

      return this.executeRules(activeVersion, inputs, res, req);
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
      const latestVersion = await this.ruleVersionRepository.findOne({
        where: { categoryId },
        order: { version: 'DESC' }
      });

      if (!latestVersion) {
        return res.status(404).json({ error: 'No version found for this category' });
      }

      return this.executeRules(latestVersion, inputs, res, req);
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
      const version = await this.ruleVersionRepository.findOne({
        where: { id: versionId, categoryId }
      });

      if (!version) {
        return res.status(404).json({ error: 'Version not found' });
      }

      return this.executeRules(version, inputs, res, req);
    } catch (error) {
      console.error('Rule execution error:', error);
      return res.status(500).json({ error: 'Failed to execute rules' });
    }
  }

  private async executeRules(version: RuleVersion, inputs: Record<string, any>, res: Response, req?: Request) {
    try {
      let results: Record<string, any>;
      const requiredInputs = version.inputColumns || {};
      const missingInputs = Object.keys(requiredInputs).filter(key => !(key in inputs));

      if (missingInputs.length > 0) {
        return res.status(400).json({
          error: 'Missing required input parameters',
          missingParams: missingInputs
        });
      }

      switch (version.type) {
        case 'flow':
          if (!version.flowConfig) throw new Error('Flow configuration is missing');
          results = await this.flowExecutionService.executeFlow(version, inputs, req, res);
          break;
        case 'excel':
          if (!version.filePath) throw new Error('Excel file path is missing');
          results = await this.excelService.executeRules(version.filePath, inputs);
          break;
        case 'code':
          if (!version.outputColumns) throw new Error('Code configuration is missing');
          results = await this.codeExecutionService.executeRules(version, inputs);
          break;
        default:
          throw new Error('Invalid rule version type');
      }

      return res.json({
        version: version.version,
        results
      });
    } catch (error) {
      console.error('Rule execution error:', error);
      return res.status(422).json({ error: `Error executing rules: ${error.message}` });
    }
  }
}
