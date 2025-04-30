import { Request, Response } from 'express';
import { AppDataSource } from '../config/ormconfig';
import { RuleVersion } from '../models/RuleVersion';

export class VersionController {
  private versionRepository = AppDataSource.getRepository(RuleVersion);

  async updateStatus(req: Request, res: Response) {
    try {
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