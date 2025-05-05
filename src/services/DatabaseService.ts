import { DataSource } from 'typeorm';
import { AppDataSource } from '../config/ormconfig';

export class DatabaseService {
  private static instance: DatabaseService;
  private isInitialized = false;
  private static initializationLock: Promise<void> | null = null;

  private constructor() {}

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await AppDataSource.initialize();
      this.isInitialized = true;
      console.log('Database connection established');
    } catch (error: unknown) {
      console.error('Error initializing database:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Database connection failed: ${errorMessage}`);
    }
  }

  static async initializeDatabase(): Promise<void> {
    if (!this.initializationLock) {
      this.initializationLock = (async () => {
        if (!this.instance) {
          this.instance = new DatabaseService();
        }
        try {
          await this.instance.initialize();
        } finally {
          this.initializationLock = null;
        }
      })();
    }
    return this.initializationLock;
  }

  public getDataSource(): DataSource {
    if (!this.isInitialized) {
      throw new Error('Database not initialized - call initializeDatabase first');
    }
    return AppDataSource;
  }
}