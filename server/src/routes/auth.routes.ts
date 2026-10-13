import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authLimiter, inviteLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/signup', authLimiter, AuthController.signup);
router.post('/login', authLimiter, AuthController.login);
router.post('/logout', AuthController.logout);

router.get('/me', authenticate, AuthController.getMe);
router.put('/profile', authenticate, AuthController.updateProfile);
router.post('/partner/connect', authenticate, inviteLimiter, AuthController.connectPartner);
router.post('/partner/disconnect', authenticate, AuthController.disconnectPartner);
router.delete('/account', authenticate, AuthController.deleteAccount);

export default router;
