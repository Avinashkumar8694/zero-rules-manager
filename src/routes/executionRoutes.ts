import { Router } from 'express';
import { ExecutionController } from '../controllers/ExecutionController';

const router = Router();
const executionController = new ExecutionController();

// Execute rules for a specific category
router.post('/:categoryId', executionController.execute);

export default router;