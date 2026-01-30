import express from 'express';
import { createUnit, getUnits, updateUnitStatus } from '../controllers/unitController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', protect, getUnits as any);
router.post('/', protect, createUnit as any);
router.patch('/:id/status', protect, updateUnitStatus as any);

export default router;
