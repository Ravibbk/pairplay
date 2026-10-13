import { Router, Request, Response } from 'express';
import authRoutes from './auth.routes.js';
import roomRoutes from './room.routes.js';
import gameRoutes from './game.routes.js';
import aiRoutes from './ai.routes.js';
import analyticsRoutes from './analytics.routes.js';

const router = Router();

// Health check endpoint
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'PairPlay API',
    version: '1.0.0',
  });
});

router.use('/auth', authRoutes);
router.use('/rooms', roomRoutes);
router.use('/games', gameRoutes);
router.use('/ai', aiRoutes);
router.use('/analytics', analyticsRoutes);

export default router;
