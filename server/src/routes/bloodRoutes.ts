import express from 'express';
import { createBloodRequest, getBloodRequests, respondToRequest, updateBloodRequestStatus } from '../controllers/bloodController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', protect, createBloodRequest as any);
router.get('/', protect, getBloodRequests as any);
router.put('/:id/respond', protect, respondToRequest as any);
router.patch('/:id/status', protect, updateBloodRequestStatus as any);

export default router;
