import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/metrics', AnalyticsController.getMetrics);
router.post('/event', AnalyticsController.recordClientEvent);

export default router;
