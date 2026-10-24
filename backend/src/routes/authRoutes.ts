import { Router } from 'express';
import { login, getMe, updateProfile, getDemoAccounts } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/login', login);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);
router.get('/demo-accounts', getDemoAccounts);

export default router;
