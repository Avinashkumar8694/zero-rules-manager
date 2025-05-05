import { Request, Response } from 'express';
import { DatabaseService } from '../services/DatabaseService';
import { RuleVersion } from '../models/RuleVersion';
import { Not } from 'typeorm';

export class VersionController {
  private versionRepository: any;

  private async initialize() {
    const dbService = DatabaseService.getInstance();
    this.versionRepository = dbService.getDataSource().getRepository(RuleVersion);
  }

  constructor() {
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
      const version = await this.versionRepository.findOne({
        where: { id: req.params.id }
      });

      if (!version) {
        return res.status(404).json({ error: 'Version not found' });
      }

      await this.versionRepository.remove(version);
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: 'Failed to delete version' });
    }
  }
}