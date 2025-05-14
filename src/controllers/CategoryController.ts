import { Request, Response } from 'express';
import { DatabaseService } from '../services/DatabaseService';
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
  private categoryRepository: any;
  private versionRepository: any;
  private excelService: ExcelService;

  private async ensureInitialized() {
    if (!this.categoryRepository) {
      await this.initialize();
    }
  }

  private async initialize() {
    try {
      if (!DatabaseService.getInstance().getDataSource().isInitialized) {
        await DatabaseService.initializeDatabase();
      }
      const dataSource = DatabaseService.getInstance().getDataSource();
      this.categoryRepository = dataSource.getRepository(RuleCategory);
      this.versionRepository = dataSource.getRepository(RuleVersion);
    } catch (error) {
      console.error('Database initialization error:', error);
      throw new Error('Failed to initialize database connection');
    }
  }

  constructor() {
    // Initialize services
    this.excelService = new ExcelService();

    // Bind methods to ensure correct 'this' context
    // this.create = this.create.bind(this);
    // this.getAll = this.getAll.bind(this);
    // this.getById = this.getById.bind(this);
    // this.update = this.update.bind(this);
    // this.delete = this.delete.bind(this);
    // this.uploadVersion = this.uploadVersion.bind(this);
    // this.ensureInitialized = this.ensureInitialized.bind(this);
    // Initialize database connection
    this.initialize().catch(error => {
      console.error('CategoryController initialization failed:', error);
    });
  }

  async create(req: Request, res: Response) {
    try {
      await this.ensureInitialized();
      const { name, description } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: 'Category name is required' });
      }

      const existingCategory = await this.categoryRepository.findOne({ where: { name } });
      if (existingCategory) {
        return res.status(409).json({ error: 'Category name already exists' });
      }

      const category = this.categoryRepository.create({ 
        name: name.trim(), 
        description: description?.trim() 
      });
      
      await this.categoryRepository.save(category);
      return res.status(201).json(category);
    } catch (error:any) {
      console.error('Category creation error:', error);
      return res.status(500).json({ 
        error: 'Failed to create category', 
        details: error.message 
      });
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
      await this.ensureInitialized();
      
      const category = await this.categoryRepository.findOne({
        where: { id: req.params.id }
      });

      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }

      const versions = await this.versionRepository.find({
        where: { categoryId: req.params.id },
        order: { createdAt: 'DESC' }
      });

      return res.json({ versions });
    } catch (error: any) {
      console.error('Version fetch error:', error);
      return res.status(500).json({
        error: 'Failed to fetch versions',
        details: error.message
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      await this.ensureInitialized();
      const { id } = req.params;
      const { name, description } = req.body;

      const category = await this.categoryRepository.findOne({ where: { id } });
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }

      if (name && name !== category.name) {
        const existingCategory = await this.categoryRepository.findOne({ where: { name: name.trim() } });
        if (existingCategory) {
          return res.status(409).json({ error: 'Category name already exists' });
        }
        category.name = name.trim();
      }

      if (description !== undefined) {
        category.description = description?.trim();
      }

      await this.categoryRepository.save(category);
      return res.json(category);
    } catch (error: any) {
      console.error('Category update error:', error);
      return res.status(500).json({
        error: 'Failed to update category',
        details: error.message
      });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await this.ensureInitialized();
      const { id } = req.params;

      const category = await this.categoryRepository.findOne({
        where: { id },
        relations: ['versions']
      });

      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }

      // Delete associated versions first
      if (category.versions && category.versions.length > 0) {
        await this.versionRepository.remove(category.versions);
      }

      await this.categoryRepository.remove(category);
      return res.status(204).send();
    } catch (error: any) {
      console.error('Category deletion error:', error);
      return res.status(500).json({
        error: 'Failed to delete category',
        details: error.message
      });
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

        const { inputs, outputs } = await this.excelService.processExcelFile(file.path);

        const version = this.versionRepository.create({
          categoryId: req.params.id,
          version: await this.generateNextVersion(req.params.id),
          filePath: file.path,
          name: req.body.name,
          description: req.body.description,
          type: 'excel',
          inputColumns: inputs.reduce((acc, param) => ({ ...acc, [param.name]: param }), {}),
          outputColumns: outputs.reduce((acc, param) => ({ ...acc, [param.name]: param }), {}),
          isActive: false
        });

        await this.versionRepository.save(version);
        return res.status(201).json(version);
      } catch (error) {
        return res.status(500).json({ error: 'Failed to process file' });
      }
    });
  }

  async createCodeVersion(req: Request, res: Response) {
    try {
      await this.ensureInitialized();
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

      const version = this.versionRepository.create({
        categoryId: req.params.id,
        version: await this.generateNextVersion(req.params.id),
        inputColumns,
        outputColumns,
        name: req.body.name,
        description: req.body.description,
        type: 'code',
        isActive: false
      });

      await this.versionRepository.save(version);
      return res.status(201).json(version);
    } catch (error: any) {
      console.error('Code version creation error:', error);
      return res.status(500).json({
        error: 'Failed to create code version',
        details: error.message
      });
    }
  }
  
  private async generateNextVersion(categoryId: string, isNewUpload: boolean = true): Promise<string> {
    const versions = await this.versionRepository.find({
      where: { categoryId },
      order: { createdAt: 'DESC' }
    });
  
    if (versions.length === 0) {
      return '1.0.0';
    }
  
    const latestVersion = versions[0].version;
    const [major, minor, patch] = latestVersion.split('.').map(Number);
    
    // For new uploads, increment major version
    // For updates, increment minor version
    return isNewUpload ? `${major + 1}.0.0` : `${major}.${minor + 1}.0`;
  }
}
