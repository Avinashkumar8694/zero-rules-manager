import { Router } from 'express';
import { NodeController } from '../controllers/NodeController';

const router = Router();
const nodeController = new NodeController();

// Get all available nodes with their configurations
router.get('/', nodeController.getNodes.bind(nodeController));

// Get configuration for a specific node type
router.get('/:type', nodeController.getNodeConfig.bind(nodeController));

export default router;