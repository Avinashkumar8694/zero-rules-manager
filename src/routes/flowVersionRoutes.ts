import { Router } from 'express';
import { FlowVersionController } from '../controllers/FlowVersionController';

const router = Router();
const flowVersionController = new FlowVersionController();

// Create a new flow version for a category
router.post('/:id/versions/flow', flowVersionController.create.bind(flowVersionController));

// Update a flow version
router.put('/versions/:id', flowVersionController.update.bind(flowVersionController));

// Delete a flow version
router.delete('/versions/:id', flowVersionController.delete.bind(flowVersionController));

export default router;