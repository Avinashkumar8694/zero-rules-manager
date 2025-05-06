import { Router } from 'express';
import { VersionController } from '../controllers/VersionController';

const router = Router();
const versionController = new VersionController();

// Update version status (enable/disable)
router.patch('/:id', versionController.updateStatus.bind(versionController));

// Get version details
router.get('/:id', versionController.getById.bind(versionController));

// Delete version
router.delete('/:id', versionController.delete.bind(versionController));

// Update version with new Excel file
router.put('/:id', versionController.update.bind(versionController));

export default router;