import 'reflect-metadata';
import express from 'express';
import { DatabaseService } from './services/DatabaseService';
import { CleanupService } from './services/CleanupService';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes

// Initialize application
const initializeApp = async () => {
  try {
    const dbService = DatabaseService.getInstance();
    await dbService.initialize();

    // Initialize CleanupService
    CleanupService.getInstance();

    // Dynamically import routes after DB initialization
    const { default: categoryRoutes } = await import('./routes/categoryRoutes');
    const { default: versionRoutes } = await import('./routes/versionRoutes');
    const { default: executionRoutes } = await import('./routes/executionRoutes');
    const { default: versionExecutionRoutes } = await import('./routes/versionExecutionRoutes');
    const { default: flowVersionRoutes } = await import('./routes/flowVersionRoutes');
    const { default: nodeRoutes } = await import('./routes/nodeRoutes');

    app.use('/api/categories', categoryRoutes);
    app.use('/api/versions', versionRoutes);
    app.use('/api/execute', executionRoutes);
    app.use('/api', versionExecutionRoutes);
    app.use('/api/categories', flowVersionRoutes);
    app.use('/api/nodes', nodeRoutes);

    // Start server
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Error initializing application:', error);
    process.exit(1);
  }
};

initializeApp();

export default app;