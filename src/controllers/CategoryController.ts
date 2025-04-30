import { Request, Response } from 'express';
import { AppDataSource } from '../config/ormconfig';
import { RuleCategory } from '../models/RuleCategory';
import { RuleVersion } from '../models/RuleVersion';
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

export class CategoryController {
  private categoryRepository = AppDataSource.getRepository(RuleCategory);
  private versionRepository = AppDataSource.getRepository(RuleVersion);
  private excelService = new ExcelService();

  async create(req: Request, res: Response) {
    try {
      const { name, description } = req.body;
      const category = this.categoryRepository.create({ name, description });
      await this.categoryRepository.save(category);
      return res.status(201).json(category);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to create category' });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const categories = await this.categoryRepository.find();
      return res.json(categories);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch categories' });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const category = await this.categoryRepository.findOne({
        where: { id: req.params.id },
        relations: ['versions']
      });
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
      return res.json(category);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch category' });
    }
  }

  async getVersions(req: Request, res: Response) {
    try {
      const versions = await this.versionRepository.find({
        where: { categoryId: req.params.id },
        order: { createdAt: 'DESC' }
      });
      return res.json(versions);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch versions' });
    }
  }

  async uploadVersion(req: Request, res: Response) {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: 'File upload failed' });
      }

      try {
        const file = req.file;
        if (!file) {
          return res.status(400).json({ error: 'No file provided' });
        }

        const { inputColumns, outputColumns } = await this.excelService.processExcelFile(file.path);

        const version = this.versionRepository.create({
          categoryId: req.params.id,
          version: new Date().toISOString(),
          filePath: file.path,
          inputColumns,
          outputColumns,
          isActive: false
        });

        await this.versionRepository.save(version);
        return res.status(201).json(version);
      } catch (error) {
        return res.status(500).json({ error: 'Failed to process file' });
      }
    });
  }
}