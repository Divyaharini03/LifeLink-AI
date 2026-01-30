import express from 'express';
import { createEmergency, getEmergencies, updateEmergencyStatus } from '../controllers/emergencyController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', protect, createEmergency as any);
router.get('/', protect, getEmergencies as any);
router.patch('/:id', protect, updateEmergencyStatus as any);

export default router;
