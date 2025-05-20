import { Router } from 'express';
import { ExecutionController } from '../controllers/ExecutionController';
import { FileUploadMiddleware } from '../middleware/fileUploadMiddleware';

const router = Router();
const executionController = new ExecutionController();

// Execute specific version of a category
router.post('/categories/:categoryId/versions/:versionId/execute', 
  async (req, res, next) => {
    const middleware = await FileUploadMiddleware.getUploadMiddleware(req.params.categoryId, req.params.versionId);
    await middleware(req, res, next);
  },
  executionController.executeSpecificVersion.bind(executionController)
);

// Execute latest version of a category
router.post('/categories/:categoryId/latest/execute', 
  async (req, res, next) => {
    const middleware = await FileUploadMiddleware.getUploadMiddleware(req.params.categoryId);
    await middleware(req, res, next);
  },
  executionController.executeLatestVersion.bind(executionController)
);

export default router;