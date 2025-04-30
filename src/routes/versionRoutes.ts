import { Router } from 'express';
import { VersionController } from '../controllers/VersionController';

const router = Router();
const versionController = new VersionController();

// Update version status (enable/disable)
router.patch('/:id', versionController.updateStatus);

// Get version details
router.get('/:id', versionController.getById);

// Delete version
router.delete('/:id', versionController.delete);

export default router;