import { DatabaseService } from './DatabaseService';
import { RuleVersion } from '../models/RuleVersion';
import fs from 'fs';
import path from 'path';
import cron from 'node-cron';

export class CleanupService {
    private static instance: CleanupService;
    private versionRepository: any;
    private readonly uploadsDir = './uploads';

    private constructor() {
        this.initialize().catch(error => {
            console.error('CleanupService initialization failed:', error);
        });
    }

    public static getInstance(): CleanupService {
        if (!CleanupService.instance) {
            CleanupService.instance = new CleanupService();
        }
        return CleanupService.instance;
    }

    private async initialize() {
        try {
            if (!DatabaseService.getInstance().getDataSource().isInitialized) {
                await DatabaseService.initializeDatabase();
            }
            const dataSource = DatabaseService.getInstance().getDataSource();
            this.versionRepository = dataSource.getRepository(RuleVersion);

            // Start the cleanup cron job
            this.startCleanupCron();
        } catch (error) {
            console.error('Failed to initialize cleanup service:', error);
        }
    }

    private startCleanupCron() {
        const cronSchedule = process.env.CLEANUP_CRON_SCHEDULE || '* * * * *';
        cron.schedule(cronSchedule, () => {
            this.cleanupUnusedFiles().catch(error => {
                console.error('Failed to cleanup unused files:', error);
            });
        });
    }

    private async cleanupUnusedFiles() {
        try {
            const batchSize = 100;
            let skip = 0;
            const usedFilePaths = new Set<string>();

            // Fetch versions in batches
            while (true) {
                const versions = await this.versionRepository.find({
                    select: ['filePath'],
                    skip: skip,
                    take: batchSize
                });

                if (versions.length === 0) break;

                versions.forEach((version: any) => usedFilePaths.add(version.filePath));
                skip += batchSize;
            }

            // Get all files in the uploads directory
            const files = fs.readdirSync(this.uploadsDir);

            let deletedCount = 0;
            for (const file of files) {
                const filePath = path.join(this.uploadsDir, file);
                // Check if the file is not referenced in the database
                if (!usedFilePaths.has(filePath)) {
                    try {
                        fs.unlinkSync(filePath);
                        deletedCount++;
                        console.log(`Deleted unused file: ${filePath}`);
                    } catch (error) {
                        console.error(`Failed to delete file ${filePath}:`, error);
                    }
                }
            }

            console.log(`Cleanup completed. Deleted ${deletedCount} unused files.`);
        } catch (error) {
            console.error('Error during file cleanup:', error);
            throw error;
        }
    }
}