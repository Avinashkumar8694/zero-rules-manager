import { Request, Response } from 'express';
import { DatabaseService } from '../services/DatabaseService';
import { FlowVersion } from '../models/FlowVersion';

export class FlowVersionController {
  private flowVersionRepository: any;

  private async initialize() {
    const dbService = DatabaseService.getInstance();
    this.flowVersionRepository = dbService.getDataSource().getRepository(FlowVersion);
  }

  constructor() {
    this.initialize().catch(error => {
      console.error('FlowVersionController initialization failed:', error);
      process.exit(1);
    });
  }

  async create(req: Request, res: Response) {
    try {
      const categoryId = req.params.id;
      const { name, description, inputColumns, outputColumns, variables, flow } = req.body;

      // Validate required fields
      if (!name || !flow || !flow.nodes || !flow.connections) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Validate node configurations
      for (const node of flow.nodes) {
        if (!node.id || !node.type || !node.config) {
          return res.status(400).json({ error: 'Invalid node configuration' });
        }

        if (node.config.mode === 'reference' && !node.config.version_id) {
          return res.status(400).json({ error: 'Referenced version ID is required for reference mode' });
        }

        if (node.config.mode === 'inline') {
          if (node.type === 'excel' && !node.config.excel_file) {
            return res.status(400).json({ error: 'Excel file path is required for inline Excel node' });
          }
          if (node.type === 'code' && !node.config.code) {
            return res.status(400).json({ error: 'Code is required for inline Code node' });
          }
        }
      }

      // Create new flow version
      const flowVersion = this.flowVersionRepository.create({
        categoryId,
        version: name,
        description,
        inputColumns,
        outputColumns,
        variables,
        flow,
        isActive: false
      });

      await this.flowVersionRepository.save(flowVersion);

      return res.status(201).json(flowVersion);
    } catch (error) {
      console.error('Flow version creation error:', error);
      return res.status(500).json({ error: 'Failed to create flow version' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const versionId = req.params.id;
      const { name, description, inputColumns, outputColumns, variables, flow } = req.body;

      const existingVersion = await this.flowVersionRepository.findOne({
        where: { id: versionId }
      });

      if (!existingVersion) {
        return res.status(404).json({ error: 'Flow version not found' });
      }

      // Update version
      Object.assign(existingVersion, {
        version: name || existingVersion.version,
        description: description || existingVersion.description,
        inputColumns: inputColumns || existingVersion.inputColumns,
        outputColumns: outputColumns || existingVersion.outputColumns,
        variables: variables || existingVersion.variables,
        flow: flow || existingVersion.flow
      });

      await this.flowVersionRepository.save(existingVersion);

      return res.json(existingVersion);
    } catch (error) {
      console.error('Flow version update error:', error);
      return res.status(500).json({ error: 'Failed to update flow version' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const versionId = req.params.id;

      const existingVersion = await this.flowVersionRepository.findOne({
        where: { id: versionId }
      });

      if (!existingVersion) {
        return res.status(404).json({ error: 'Flow version not found' });
      }

      await this.flowVersionRepository.remove(existingVersion);

      return res.status(204).send();
    } catch (error) {
      console.error('Flow version deletion error:', error);
      return res.status(500).json({ error: 'Failed to delete flow version' });
    }
  }
}