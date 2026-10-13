import { Request, Response, NextFunction } from 'express';
import { GameService } from '../services/game.service.js';
import { AnalyticsService } from '../services/analytics.service.js';
import { submitAnswerSchema, reactToAnswerSchema } from '../schemas/game.schema.js';

export class GameController {
  static async startGame(req: Request, res: Response, next: NextFunction) {
    try {
      const { roomId, category, totalQuestions } = req.body;
      const session = await GameService.startSession(
        roomId,
        req.user!.id,
        category || 'Deep Connections',
        totalQuestions || 5
      );

      await AnalyticsService.recordEvent('game_started', req.user!.id, {
        roomId,
        category,
        totalQuestions: session.totalQuestions,
      });

      res.status(201).json({
        success: true,
        message: 'Game session started',
        session,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSession(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const session = await GameService.getSessionState(id, req.user!.id);
      res.status(200).json({
        success: true,
        session,
      });
    } catch (error) {
      next(error);
    }
  }

  static async submitAnswer(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = submitAnswerSchema.parse(req.body);
      const result = await GameService.submitAnswer(
        validated.gameSessionId,
        req.user!.id,
        validated.answerText
      );

      await AnalyticsService.recordEvent('question_answered', req.user!.id, {
        gameSessionId: validated.gameSessionId,
        questionIndex: result.currentQuestionIndex,
      });

      res.status(200).json({
        success: true,
        message: 'Answer submitted successfully',
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async nextQuestion(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const result = await GameService.nextQuestion(id, req.user!.id);

      if (result.isCompleted) {
        await AnalyticsService.recordEvent('game_completed', req.user!.id, {
          gameSessionId: id,
        });
      }

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async reactToAnswer(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = reactToAnswerSchema.parse(req.body);
      const updated = await GameService.reactToAnswer(validated.gameAnswerId, validated.reaction);
      res.status(200).json({
        success: true,
        reaction: updated.reaction,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const history = await GameService.getUserGameHistory(req.user!.id);
      res.status(200).json({
        success: true,
        history,
      });
    } catch (error) {
      next(error);
    }
  }
}
