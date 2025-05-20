import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';

export class FileHandler {
  private static UPLOAD_DIR = path.join(process.cwd(), 'tmp');

  static async initialize() {
    await fs.mkdir(FileHandler.UPLOAD_DIR, { recursive: true });
  }

  static getUploadMiddleware() {
    const storage = multer.diskStorage({
      destination: FileHandler.UPLOAD_DIR,
      filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
      }
    });

    return multer({ storage });
  }

  static async cleanup(filePath: string) {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error(`Failed to cleanup file ${filePath}:`, error);
    }
  }

  static parseFileSize(size: string): number {
    const units = { B: 1, KB: 1024, MB: 1024 * 1024, GB: 1024 * 1024 * 1024 };
    const match = size.match(/^(\d+)(B|KB|MB|GB)$/);
    if (!match) throw new Error('Invalid file size format');
    const [, value, unit] = match;
    return Number(value) * units[unit as keyof typeof units];
  }
}