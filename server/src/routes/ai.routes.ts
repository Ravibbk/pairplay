import { Router } from 'express';
import { AiController } from '../controllers/ai.controller.js';
import { authenticate } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.use(authenticate);

router.post('/generate', aiLimiter, AiController.generateQuestions);
router.get('/daily-spark', AiController.getDailySpark);

export default router;
