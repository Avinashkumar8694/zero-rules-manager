import 'reflect-metadata';
import express from 'express';
import { AppDataSource } from './config/ormconfig';
import categoryRoutes from './routes/categoryRoutes';
import versionRoutes from './routes/versionRoutes';
import executionRoutes from './routes/executionRoutes';
import versionExecutionRoutes from './routes/versionExecutionRoutes';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.use('/api/categories', categoryRoutes);
app.use('/api/versions', versionRoutes);
app.use('/api/execute', executionRoutes);
app.use('/api', versionExecutionRoutes);

// Initialize database connection
AppDataSource.initialize()
  .then(() => {
    console.log('Database connection established');
    
    // Start server
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to database:', error);
  });

export default app;