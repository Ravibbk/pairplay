import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analytics.service.js';

export class AnalyticsController {
  static async getMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AnalyticsService.getDashboardMetrics();
      res.status(200).json({
        success: true,
        ...data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async recordClientEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const { eventType, metadata } = req.body;
      if (!eventType || typeof eventType !== 'string') {
        res.status(400).json({ success: false, message: 'eventType is required' });
        return;
      }

      await AnalyticsService.recordEvent(eventType, req.user?.id, metadata || {});
      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  }
}
