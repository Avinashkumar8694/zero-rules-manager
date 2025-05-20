export type InputColumnType = 'string' | 'number' | 'boolean' | 'file' | 'date' | 'email' | 'url' | 'object';

export interface InputColumn {
  name: string;
  type: InputColumnType;
  required?: boolean;
  allowed_types?: string[];  // For file types e.g. ['.pdf', '.docx']
  max_size?: string;        // e.g. '5MB'
  description?: string;
}

export interface FileUploadResult {
  originalName: string;
  path: string;
  size: number;
  mimetype: string;
}