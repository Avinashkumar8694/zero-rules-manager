import { Router } from 'express';
import { CategoryController } from '../controllers/CategoryController';

const router = Router();
const categoryController = new CategoryController();

// Create a new rule category
router.post('/', categoryController.create.bind(categoryController));

// Get all rule categories
router.get('/', categoryController.getAll.bind(categoryController));

// Get a specific rule category by ID
router.get('/:id', categoryController.getById.bind(categoryController));

// Get all versions for a specific category
router.get('/:id/versions', categoryController.getVersions.bind(categoryController));

// Upload a new version for a specific category
router.post('/:id/versions', categoryController.uploadVersion.bind(categoryController));

// Update a category
router.put('/:id', categoryController.update.bind(categoryController));

// Delete a category
router.delete('/:id', categoryController.delete.bind(categoryController));

export default router;