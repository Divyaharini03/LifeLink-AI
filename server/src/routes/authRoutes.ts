import express from 'express';
import { register, login } from '../controllers/authController';

const router = express.Router();

// @route   POST api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', register as any);

// @route   POST api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', login as any);

export default router;
