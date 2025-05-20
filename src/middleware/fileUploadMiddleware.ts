import { Request, Response, NextFunction } from 'express';
import { FileHandler } from '../utils/file-handler';
import { RuleVersion } from '../models/RuleVersion';
import { DatabaseService } from '../services/DatabaseService';

export class FileUploadMiddleware {
  private static versionRepository: any;

  static async initialize() {
    if (!FileUploadMiddleware.versionRepository) {
      const dbService = DatabaseService.getInstance();
      FileUploadMiddleware.versionRepository = dbService.getDataSource().getRepository(RuleVersion);
    }
  }

  static async getUploadMiddleware(categoryId: string, versionId?: string) {
    await FileUploadMiddleware.initialize();

    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        let version: RuleVersion | null;

        if (versionId) {
          version = await FileUploadMiddleware.versionRepository.findOne({
            where: { id: versionId, categoryId }
          });
        } else {
          version = await FileUploadMiddleware.versionRepository.findOne({
            where: { categoryId, isActive: true }
          });
        }

        if (!version) {
          return res.status(404).json({ error: 'Version not found' });
        }

        if (!version.inputColumns) {
          return res.status(400).json({ error: 'No input columns defined for this version' });
        }

        const fileFields = Object.entries(version.inputColumns)
          .filter(([_, config]) => config.type === 'file')
          .map(([field, config]) => ({
            name: field,
            maxSize: config.validation?.maxSize || 5 * 1024 * 1024, // Default 5MB
            allowedExtensions: config.validation?.allowedExtensions || [],
            mimeTypes: config.validation?.mimeTypes || [],
            maxCount: config.validation?.maxCount || 1 // Default to single file if not specified
          }));

        if (fileFields.length === 0) {
          return next();
        }

        const upload = FileHandler.getUploadMiddleware();
        const uploadFields = fileFields.map(field => ({ name: field.name, maxCount: field.maxCount }));

        upload.fields(uploadFields)(req, res, (err: any) => {
          if (err) {
            return res.status(400).json({ error: err.message });
          }

          const files = req.files as { [fieldname: string]: Express.Multer.File[] };
          if (!files) return next();

          // Validate files
          for (const [fieldName, fieldFiles] of Object.entries(files)) {
            const fieldConfig = fileFields.find(f => f.name === fieldName);
            if (!fieldConfig) continue;

            // Process all files in the field
            for (const file of fieldFiles) {
            
            // Validate file size
            if (file.size > fieldConfig.maxSize) {
              return res.status(400).json({
                error: `File ${fieldName} exceeds maximum size of ${fieldConfig.maxSize} bytes`
              });
            }

            // Validate file extension
            if (fieldConfig.allowedExtensions.length > 0) {
              const ext = file.originalname.split('.').pop()?.toLowerCase();
              if (!ext || !fieldConfig.allowedExtensions.includes(`.${ext}`)) {
                return res.status(400).json({
                  error: `File ${fieldName} has invalid extension. Allowed: ${fieldConfig.allowedExtensions.join(', ')}`
                });
              }
            }

            // Validate MIME type
            if (fieldConfig.mimeTypes.length > 0 && !fieldConfig.mimeTypes.includes(file.mimetype)) {
              return res.status(400).json({
                error: `File ${fieldName} has invalid MIME type. Allowed: ${fieldConfig.mimeTypes.join(', ')}`
              });
            }

              // Add file info to request body
              if (!req.body) req.body = {};
              if (!req.body[fieldName]) req.body[fieldName] = [];
              req.body[fieldName].push({
                originalName: file.originalname,
                path: file.path,
                size: file.size,
                mimetype: file.mimetype
              });
            }
          }

          next();
        });
      } catch (error) {
        next(error);
      }
    };
  }
}