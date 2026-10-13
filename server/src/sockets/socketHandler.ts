import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../lib/prisma.js';
import { GameService } from '../services/game.service.js';
import { RoomService } from '../services/room.service.js';
import { AnalyticsService } from '../services/analytics.service.js';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
  };
}

export const setupSocketHandlers = (io: Server) => {
  // Middleware: Authenticate socket connections
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(' ')[1] ||
        socket.handshake.headers?.cookie?.match(/token=([^;]+)/)?.[1];

      if (!token) {
        return next(new Error('Authentication required for real-time connection.'));
      }

      const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string };
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, displayName: true, avatarUrl: true },
      });

      if (!user) {
        return next(new Error('User account not found.'));
      }

      socket.userId = user.id;
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid or expired socket authentication token.'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.userId!;
    const user = socket.user!;

    console.log(`🔌 Player connected: ${user.displayName} (${userId}) [socket: ${socket.id}]`);

    /**
     * room:join
     * Client joins a specific room
     */
    socket.on('room:join', async (data: { roomCode: string }, callback) => {
      try {
        const { roomCode } = data;
        if (!roomCode) {
          if (callback) callback({ success: false, message: 'Room code is required' });
          return;
        }

        const room = await RoomService.getRoomByCode(roomCode);

        // Verify player is host or partner
        if (room.hostId !== userId && room.partnerId !== userId) {
          // If room has no partner yet, assign this user as partner
          if (!room.partnerId) {
            await RoomService.joinRoom(userId, roomCode);
          } else {
            if (callback) callback({ success: false, message: 'This room already has 2 players.' });
            return;
          }
        }

        // Join Socket.IO room channel
        socket.join(`room:${room.id}`);

        // Notify room of player arrival
        io.to(`room:${room.id}`).emit('player:connected', {
          userId,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
        });

        // Get latest room state
        const updatedRoom = await RoomService.getRoomByCode(roomCode);

        // Fetch active session if any
        let activeSessionState = null;
        if (updatedRoom.gameSessions && updatedRoom.gameSessions.length > 0) {
          const latestSession = updatedRoom.gameSessions[0];
          if (latestSession.status !== 'ABANDONED') {
            activeSessionState = await GameService.getSessionState(latestSession.id, userId);
          }
        }

        if (callback) {
          callback({
            success: true,
            room: updatedRoom,
            session: activeSessionState,
          });
        }

        // Broadcast room state to both players
        io.to(`room:${room.id}`).emit('room:state', {
          room: updatedRoom,
          session: activeSessionState,
        });
      } catch (err: any) {
        if (callback) callback({ success: false, message: err.message });
      }
    });

    /**
     * game:start
     * Host starts a game session
     */
    socket.on(
      'game:start',
      async (
        data: { roomId: string; category?: string; totalQuestions?: number },
        callback
      ) => {
        try {
          const { roomId, category = 'Deep Connections', totalQuestions = 5 } = data;
          const session = await GameService.startSession(roomId, userId, category, totalQuestions);

          await AnalyticsService.recordEvent('game_started', userId, {
            roomId,
            category,
            totalQuestions,
          });

          // Broadcast game:started and session state to all players in the room
          io.to(`room:${roomId}`).emit('game:started', { session });

          if (callback) callback({ success: true, session });
        } catch (err: any) {
          socket.emit('error:occurred', { message: err.message });
          if (callback) callback({ success: false, message: err.message });
        }
      }
    );

    /**
     * answer:submit
     * Player submits their answer to the current question
     */
    socket.on(
      'answer:submit',
      async (
        data: { gameSessionId: string; answerText: string },
        callback
      ) => {
        try {
          const { gameSessionId, answerText } = data;
          if (!answerText || !answerText.trim()) {
            if (callback) callback({ success: false, message: 'Answer text cannot be empty.' });
            return;
          }

          const result = await GameService.submitAnswer(gameSessionId, userId, answerText);

          // Acknowledge submission to the submitting player
          if (callback) {
            callback({
              success: true,
              isBothAnswered: result.isBothAnswered,
              session: result.sessionState,
            });
          }

          const session = await prisma.gameSession.findUnique({
            where: { id: gameSessionId },
          });

          if (!session) return;

          if (result.isBothAnswered) {
            // Both answered! Fetch revealed states for both players and broadcast reveal
            const hostSession = await GameService.getSessionState(gameSessionId, session.roomId);
            io.to(`room:${session.roomId}`).emit('game:reveal', {
              gameSessionId,
              questionIndex: result.currentQuestionIndex,
              session: hostSession,
            });
          } else {
            // Only 1 player answered so far: notify room that partner has answered (without leaking text)
            io.to(`room:${session.roomId}`).emit('answer:accepted', {
              gameSessionId,
              answeredUserId: userId,
              questionIndex: result.currentQuestionIndex,
            });
          }
        } catch (err: any) {
          socket.emit('error:occurred', { message: err.message });
          if (callback) callback({ success: false, message: err.message });
        }
      }
    );

    /**
     * game:next
     * Move to next question or complete game
     */
    socket.on('game:next', async (data: { gameSessionId: string }, callback) => {
      try {
        const { gameSessionId } = data;
        const result = await GameService.nextQuestion(gameSessionId, userId);

        const session = await prisma.gameSession.findUnique({
          where: { id: gameSessionId },
        });

        if (!session) return;

        if (result.isCompleted) {
          await AnalyticsService.recordEvent('game_completed', userId, {
            gameSessionId,
          });

          io.to(`room:${session.roomId}`).emit('game:complete', {
            gameSessionId,
            session: result.sessionState,
          });
        } else {
          io.to(`room:${session.roomId}`).emit('game:question', {
            gameSessionId,
            session: result.sessionState,
          });
        }

        if (callback) callback({ success: true, ...result });
      } catch (err: any) {
        socket.emit('error:occurred', { message: err.message });
        if (callback) callback({ success: false, message: err.message });
      }
    });

    /**
     * reaction:send
     * Real-time reaction floating icon
     */
    socket.on('reaction:send', async (data: { roomId: string; reaction: string }) => {
      io.to(`room:${data.roomId}`).emit('reaction:received', {
        userId,
        displayName: user.displayName,
        reaction: data.reaction,
      });
    });

    /**
     * disconnect
     */
    socket.on('disconnect', () => {
      console.log(`🔌 Player disconnected: ${user.displayName} (${userId})`);
      io.emit('player:disconnected', {
        userId,
        displayName: user.displayName,
      });
    });
  });
};
