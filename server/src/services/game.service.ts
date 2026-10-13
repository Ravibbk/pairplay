import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { AiService } from './ai.service.js';

export class GameService {
  /**
   * Initializes and starts a new game session with questions
   */
  static async startSession(roomId: string, userId: string, category: string = 'Deep Connections', totalQuestions: number = 5) {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { host: true, partner: true },
    });

    if (!room) {
      throw new AppError('Room not found', 404);
    }

    if (room.hostId !== userId && room.partnerId !== userId) {
      throw new AppError('Unauthorized: You are not a participant in this room.', 403);
    }

    if (!room.partnerId) {
      throw new AppError('Cannot start game until your partner has joined the room.', 400);
    }

    // Generate or fetch questions
    const generated = await AiService.generateQuestions({
      category,
      count: totalQuestions,
      partnerName: room.partner?.displayName,
    });

    // Create session & questions in database transaction
    const session = await prisma.$transaction(async (tx) => {
      const gameSession = await tx.gameSession.create({
        data: {
          roomId: room.id,
          category,
          status: 'IN_PROGRESS',
          currentQuestionIndex: 0,
          totalQuestions: generated.questions.length,
          startedAt: new Date(),
        },
      });

      for (let i = 0; i < generated.questions.length; i++) {
        await tx.gameQuestion.create({
          data: {
            gameSessionId: gameSession.id,
            questionText: generated.questions[i].text,
            category: generated.questions[i].category || category,
            orderIndex: i,
          },
        });
      }

      await tx.room.update({
        where: { id: room.id },
        data: { status: 'IN_GAME' },
      });

      return gameSession;
    });

    return this.getSessionState(session.id, userId);
  }

  /**
   * Submits an answer for the current question
   */
  static async submitAnswer(sessionId: string, userId: string, answerText: string) {
    const session = await prisma.gameSession.findUnique({
      where: { id: sessionId },
      include: {
        room: true,
        questions: { orderBy: { orderIndex: 'asc' } },
      },
    });

    if (!session) {
      throw new AppError('Game session not found', 404);
    }

    if (session.status !== 'IN_PROGRESS' && session.status !== 'REVEALING') {
      throw new AppError('Game session is not active or has already ended.', 400);
    }

    // Verify player is member of this room
    if (session.room.hostId !== userId && session.room.partnerId !== userId) {
      throw new AppError('Unauthorized: You are not a player in this game.', 403);
    }

    const currentQuestion = session.questions[session.currentQuestionIndex];
    if (!currentQuestion) {
      throw new AppError('Current question not found.', 404);
    }

    // Check if player has already submitted an answer for this question
    const existingAnswer = await prisma.gameAnswer.findUnique({
      where: {
        gameSessionId_gameQuestionId_userId: {
          gameSessionId: session.id,
          gameQuestionId: currentQuestion.id,
          userId,
        },
      },
    });

    if (existingAnswer) {
      throw new AppError('You have already submitted an answer for this question.', 400);
    }

    // Create answer
    await prisma.gameAnswer.create({
      data: {
        gameSessionId: session.id,
        gameQuestionId: currentQuestion.id,
        userId,
        answerText: answerText.trim(),
      },
    });

    // Check if both players have now submitted answers
    const allAnswersForQuestion = await prisma.gameAnswer.findMany({
      where: {
        gameSessionId: session.id,
        gameQuestionId: currentQuestion.id,
      },
      include: {
        user: { select: { id: true, displayName: true, avatarUrl: true } },
      },
    });

    const isBothAnswered = allAnswersForQuestion.length >= 2;

    if (isBothAnswered && session.status !== 'REVEALING') {
      await prisma.gameSession.update({
        where: { id: session.id },
        data: { status: 'REVEALING' },
      });
    }

    return {
      isBothAnswered,
      currentQuestionIndex: session.currentQuestionIndex,
      answersCount: allAnswersForQuestion.length,
      sessionState: await this.getSessionState(session.id, userId),
    };
  }

  /**
   * Advances to next question or completes game
   */
  static async nextQuestion(sessionId: string, userId: string) {
    const session = await prisma.gameSession.findUnique({
      where: { id: sessionId },
      include: { room: true },
    });

    if (!session) {
      throw new AppError('Game session not found', 404);
    }

    if (session.room.hostId !== userId && session.room.partnerId !== userId) {
      throw new AppError('Unauthorized', 403);
    }

    const nextIndex = session.currentQuestionIndex + 1;
    const isCompleted = nextIndex >= session.totalQuestions;

    if (isCompleted) {
      await prisma.$transaction([
        prisma.gameSession.update({
          where: { id: session.id },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(),
          },
        }),
        prisma.room.update({
          where: { id: session.roomId },
          data: { status: 'FINISHED' },
        }),
      ]);
    } else {
      await prisma.gameSession.update({
        where: { id: session.id },
        data: {
          currentQuestionIndex: nextIndex,
          status: 'IN_PROGRESS',
        },
      });
    }

    return {
      isCompleted,
      sessionState: await this.getSessionState(session.id, userId),
    };
  }

  /**
   * Adds reaction (e.g. "❤️", "😂") to a partner's answer
   */
  static async reactToAnswer(answerId: string, reaction: string) {
    return prisma.gameAnswer.update({
      where: { id: answerId },
      data: { reaction },
    });
  }

  /**
   * Server-authoritative session state sanitizer:
   * Hides partner's private answer until BOTH players have answered (status === 'REVEALING' or 'COMPLETED')
   */
  static async getSessionState(sessionId: string, requestingUserId: string) {
    const session = await prisma.gameSession.findUnique({
      where: { id: sessionId },
      include: {
        room: {
          include: {
            host: { select: { id: true, displayName: true, avatarUrl: true } },
            partner: { select: { id: true, displayName: true, avatarUrl: true } },
          },
        },
        questions: {
          orderBy: { orderIndex: 'asc' },
          include: {
            answers: {
              include: {
                user: { select: { id: true, displayName: true, avatarUrl: true } },
              },
            },
          },
        },
      },
    });

    if (!session) {
      throw new AppError('Game session not found', 404);
    }

    const isFinished = session.status === 'COMPLETED';

    const sanitizedQuestions = session.questions.map((q, idx) => {
      const isPastOrCurrentRevealed =
        isFinished || idx < session.currentQuestionIndex || (idx === session.currentQuestionIndex && session.status === 'REVEALING');

      // Check which players have answered
      const userHasAnswered = q.answers.some((a) => a.userId === requestingUserId);
      const partnerHasAnswered = q.answers.some((a) => a.userId !== requestingUserId);

      let sanitizedAnswers = q.answers;
      if (!isPastOrCurrentRevealed) {
        // HIDE partner's answer text, but keep player's own answer
        sanitizedAnswers = q.answers.map((a) => {
          if (a.userId === requestingUserId) {
            return a;
          }
          return {
            ...a,
            answerText: '•••••••• (Locked until both reveal)',
          };
        });
      }

      return {
        id: q.id,
        orderIndex: q.orderIndex,
        questionText: q.questionText,
        category: q.category,
        userHasAnswered,
        partnerHasAnswered,
        isRevealed: isPastOrCurrentRevealed,
        answers: sanitizedAnswers,
      };
    });

    return {
      id: session.id,
      roomId: session.roomId,
      roomCode: session.room.code,
      category: session.category,
      status: session.status,
      currentQuestionIndex: session.currentQuestionIndex,
      totalQuestions: session.totalQuestions,
      startedAt: session.startedAt,
      completedAt: session.completedAt,
      players: {
        host: session.room.host,
        partner: session.room.partner,
      },
      currentQuestion: sanitizedQuestions[session.currentQuestionIndex] || null,
      questions: sanitizedQuestions,
    };
  }

  /**
   * Returns completed game history for a user
   */
  static async getUserGameHistory(userId: string) {
    const sessions = await prisma.gameSession.findMany({
      where: {
        room: {
          OR: [{ hostId: userId }, { partnerId: userId }],
        },
        status: 'COMPLETED',
      },
      orderBy: { completedAt: 'desc' },
      take: 20,
      include: {
        room: {
          include: {
            host: { select: { id: true, displayName: true, avatarUrl: true } },
            partner: { select: { id: true, displayName: true, avatarUrl: true } },
          },
        },
        questions: {
          orderBy: { orderIndex: 'asc' },
          include: {
            answers: {
              include: {
                user: { select: { id: true, displayName: true, avatarUrl: true } },
              },
            },
          },
        },
      },
    });

    return sessions;
  }
}
