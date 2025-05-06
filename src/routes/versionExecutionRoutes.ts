import { Router } from 'express';
import { ExecutionController } from '../controllers/ExecutionController';

const router = Router();
const executionController = new ExecutionController();

// Execute specific version of a category
router.post('/categories/:categoryId/versions/:versionId/execute', executionController.executeSpecificVersion.bind(executionController));

// Execute latest version of a category
router.post('/categories/:categoryId/latest/execute', executionController.executeLatestVersion.bind(executionController));

export default router;