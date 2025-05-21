import { Request, Response } from 'express';
import { DatabaseService } from '../services/DatabaseService';
import { RuleVersion } from '../models/RuleVersion';
import { Not } from 'typeorm';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ExcelService } from '../services/ExcelService';
import { BaseController } from './BaseController';
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage }).single('file');

export class VersionController extends BaseController {
  private versionRepository: any;
  private excelService: ExcelService;

  private async initialize() {
    try {
      if (!DatabaseService.getInstance().getDataSource().isInitialized) {
        await DatabaseService.initializeDatabase();
      }
      const dataSource = DatabaseService.getInstance().getDataSource();
      this.versionRepository = dataSource.getRepository(RuleVersion);
    } catch (error) {
      console.error('Database initialization error:', error);
      throw new Error('Failed to initialize database connection');
    }
  }

  constructor() {
    // Initialize services
    super();
    this.excelService = new ExcelService();

    // Bind methods to ensure correct 'this' context
    // this.updateStatus = this.updateStatus.bind(this);
    // this.getById = this.getById.bind(this);
    // this.delete = this.delete.bind(this);
    // this.update = this.update.bind(this);
    
    // Initialize database connection
    this.initialize().catch(error => {
      console.error('VersionController initialization failed:', error);
    });
  }

  private async ensureInitialized() {
    if (!this.versionRepository) {
      await this.initialize();
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      await this.ensureInitialized();
      const { isActive } = req.body;
      const version = await this.versionRepository.findOne({
        where: { id: req.params.id }
      });

      if (!version) {
        return res.status(404).json({ error: 'Version not found' });
      }

      // If enabling this version, disable all other versions in the same category
      // if (isActive) {
      //   await this.versionRepository.update(
      //     { categoryId: version.categoryId, id: Not(version.id) },
      //     { isActive: false }
      //   );
      // }

      version.isActive = isActive;
      await this.versionRepository.save(version);
      return res.json(version);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to update version status' });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      await this.ensureInitialized();
      const version = await this.versionRepository.findOne({
        where: { id: req.params.id },
        relations: ['category']
      });

      if (!version) {
        return res.status(404).json({ error: 'Version not found' });
      }

      return res.json(version);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch version' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await this.ensureInitialized();
      const { id } = req.params;

      const version = await this.versionRepository.findOne({ where: { id } });
      if (!version) {
        return res.status(404).json({ error: 'Version not found' });
      }

      await this.versionRepository.remove(version);
      return res.status(204).send();
    } catch (error: any) {
      console.error('Version deletion error:', error);
      return res.status(500).json({
        error: 'Failed to delete version',
        details: error.message
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const version = await this.versionRepository.findOne({ where: { id } });
      if (!version) {
        return res.status(404).json({ error: 'Version not found' });
      }

      // Handle code-based update
      if (req.body.inputColumns || req.body.outputColumns) {
        const { inputColumns, outputColumns } = req.body;

        if (!inputColumns || !outputColumns || Object.keys(outputColumns).length === 0) {
          return res.status(400).json({ error: 'Input and output columns are required' });
        }

        // Validate that each output column has code
        for (const [key, output] of Object.entries(outputColumns) as [string, { code?: string }][]) {
          if (!output.code) {
            return res.status(400).json({ error: `Output column ${key} is missing code implementation` });
          }
        }

        // Update version with new code parameters
        version.inputColumns = inputColumns;
        version.outputColumns = outputColumns;
        version.updatedAt = new Date();

        await this.versionRepository.save(version);
        return res.json(version);
      }

      // Handle Excel file update
      return upload(req, res, async (err: any) => {
        if (err) {
          return res.status(400).json({ error: 'File upload failed' });
        }

        try {
          const file = req.file;
          if (!file) {
            return res.status(400).json({ error: 'No file provided' });
          }

          // Process the new Excel file
          const { inputs, outputs } = await this.excelService.processExcelFile(file.path);
          if (!inputs.length && !outputs.length) {
            return res.status(400).json({ error: 'No valid parameters found in the file' });
          }

          // Update version with new parameters
          version.filePath = file.path;
          version.inputColumns = inputs.reduce((acc, param) => ({ ...acc, [param.name]: param }), {});
          version.outputColumns = outputs.reduce((acc, param) => ({ ...acc, [param.name]: param }), {});
          version.updatedAt = new Date();

          await this.versionRepository.save(version);
          return res.json(version);
        } catch (error: any) {
          console.error('Version update error:', error);
          return res.status(500).json({
            error: 'Failed to update version',
            details: error.message
          });
        }
      });
    } catch (error: any) {
      console.error('Version update error:', error);
      return res.status(500).json({
        error: 'Failed to update version',
        details: error.message
      });
    }
  }

  async generateNextVersion(categoryId: string): Promise<string> {
    const versions = await this.versionRepository.find({
      where: { categoryId },
      order: { createdAt: 'DESC' }
    });

    if (versions.length === 0) {
      return '1.0.0';
    }

    const latestVersion = versions[0].version;
    const [major, minor, patch] = latestVersion.split('.').map(Number);
    return `${major}.${minor + 1}.0`;
  }
}