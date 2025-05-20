import { Router } from 'express';
import { ExecutionController } from '../controllers/ExecutionController';
import { FileUploadMiddleware } from '../middleware/fileUploadMiddleware';

const router = Router();
const executionController = new ExecutionController();

// Execute rules for a specific category
router.post('/:categoryId', 
  async (req, res, next) => {
    const middleware = await FileUploadMiddleware.getUploadMiddleware(req.params.categoryId);
    await middleware(req, res, next);
  },
  executionController.execute.bind(executionController)
);

export default router;