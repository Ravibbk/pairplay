import { Request, Response, NextFunction } from 'express';
import { AiService } from '../services/ai.service.js';
import { AnalyticsService } from '../services/analytics.service.js';
import { generateQuestionsRequestSchema } from '../schemas/ai.schema.js';

export class AiController {
  static async generateQuestions(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = generateQuestionsRequestSchema.parse(req.body);
      const result = await AiService.generateQuestions({
        category: validated.category,
        count: validated.count,
        interests: validated.interests,
        partnerName: validated.partnerName,
      });

      const eventType =
        result.source === 'gemini_ai'
          ? 'ai_generation_succeeded'
          : 'ai_generation_failed';

      await AnalyticsService.recordEvent(eventType, req.user?.id, {
        source: result.source,
        category: validated.category,
        count: result.questions.length,
      });

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      await AnalyticsService.recordEvent('ai_generation_failed', req.user?.id, {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next(error);
    }
  }

  static async getDailySpark(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      const spark = await AiService.getDailySpark();
      res.status(200).json({
        success: true,
        spark,
      });
    } catch (error) {
      next(error);
    }
  }
}
