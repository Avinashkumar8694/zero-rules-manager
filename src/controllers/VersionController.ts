import { Request, Response } from 'express';
import { DatabaseService } from '../services/DatabaseService';
import { RuleVersion } from '../models/RuleVersion';
import { Not } from 'typeorm';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ExcelService } from '../services/ExcelService';

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage }).single('file');

export class VersionController {
  private versionRepository: any;
  private excelService: ExcelService;

  private async initialize() {
    const dbService = DatabaseService.getInstance();
    this.versionRepository = dbService.getDataSource().getRepository(RuleVersion);
  }

  constructor() {
    // Bind methods to ensure correct 'this' context
    this.updateStatus = this.updateStatus.bind(this);
    this.getById = this.getById.bind(this);
    this.delete = this.delete.bind(this);
    this.update = this.update.bind(this);
    this.excelService = new ExcelService();
    this.initialize().catch(error => {
      console.error('VersionController initialization failed:', error);
      process.exit(1);
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
      if (isActive) {
        await this.versionRepository.update(
          { categoryId: version.categoryId, id: Not(version.id) },
          { isActive: false }
        );
      }

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
    upload(req, res, async (err: any) => {
      if (err) {
        return res.status(400).json({ error: 'File upload failed' });
      }

      try {
        const file = req.file;
        if (!file) {
          return res.status(400).json({ error: 'No file provided' });
        }

        const { id } = req.params;
        const version = await this.versionRepository.findOne({ where: { id } });
        if (!version) {
          return res.status(404).json({ error: 'Version not found' });
        }

        // Process the new Excel file
        const { inputs, outputs } = await this.excelService.processExcelFile(file.path);
        if (!inputs.length && !outputs.length) {
          return res.status(400).json({ error: 'No valid parameters found in the file' });
        }

        // Update version with new parameters
        version.filePath = file.path;
        version.inputs = inputs;
        version.outputs = outputs;
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
  }
}