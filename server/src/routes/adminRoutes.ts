import express from 'express';
import { protect } from '../middleware/authMiddleware';
import {
    createEquipmentRequest,
    getEquipmentRequests,
    createTransferRequest,
    getTransferRequests,
    updateTransferStatus,
    updateEquipmentStatus
} from '../controllers/adminController';

const router = express.Router();

// Equipment routes
router.post('/equipment', protect, createEquipmentRequest as any);
router.get('/equipment', protect, getEquipmentRequests as any);
router.patch('/equipment/:id', protect, updateEquipmentStatus as any);

// Transfer routes
router.post('/transfer', protect, createTransferRequest as any);
router.get('/transfer', protect, getTransferRequests as any);
router.patch('/transfer/:id', protect, updateTransferStatus as any);

export default router;
