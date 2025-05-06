import { Router } from 'express';
import { CategoryController } from '../controllers/CategoryController';

const router = Router();
const categoryController = new CategoryController();

// Create a new rule category
router.post('/', categoryController.create);

// Get all rule categories
router.get('/', categoryController.getAll);

// Get a specific rule category by ID
router.get('/:id', categoryController.getById);

// Get all versions for a specific category
router.get('/:id/versions', categoryController.getVersions);

// Upload a new version for a specific category
router.post('/:id/versions', categoryController.uploadVersion);

// Update a category
router.put('/:id', categoryController.update);

// Delete a category
router.delete('/:id', categoryController.delete);

export default router;