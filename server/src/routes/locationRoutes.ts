import express from 'express';
import { getNearbyHospitals } from '../controllers/locationController';

const router = express.Router();

router.get('/hospitals', getNearbyHospitals as any);

export default router;
