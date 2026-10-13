import { prisma } from '../lib/prisma.js';

export class AnalyticsService {
  /**
   * Records a privacy-conscious product event (no private answers logged)
   */
  static async recordEvent(eventType: string, userId?: string | null, metadata: Record<string, any> = {}) {
    try {
      await prisma.productEvent.create({
        data: {
          eventType,
          userId: userId || null,
          metadata: JSON.stringify(metadata),
        },
      });
    } catch (e) {
      console.error('Failed to log analytics event:', e);
    }
  }

  /**
   * Aggregates real metrics from the database
   */
  static async getDashboardMetrics() {
    const totalUsers = await prisma.user.count();
    const totalRooms = await prisma.room.count();
    const totalGamesStarted = await prisma.gameSession.count();
    const totalGamesCompleted = await prisma.gameSession.count({
      where: { status: 'COMPLETED' },
    });
    const totalQuestionsAnswered = await prisma.gameAnswer.count();

    // Event counts
    const events = await prisma.productEvent.groupBy({
      by: ['eventType'],
      _count: {
        id: true,
      },
    });

    const eventCounts: Record<string, number> = {};
    for (const e of events) {
      eventCounts[e.eventType] = e._count.id;
    }

    const roomsCreated = Math.max(totalRooms, eventCounts['room_created'] || 0);
    const gamesStarted = Math.max(totalGamesStarted, eventCounts['game_started'] || 0);
    const gamesCompleted = Math.max(totalGamesCompleted, eventCounts['game_completed'] || 0);
    const invitationsAccepted = eventCounts['invitation_accepted'] || 0;

    // Room-to-game conversion
    const roomToGameConversion = roomsCreated > 0
      ? Math.min(100, Math.round((gamesStarted / roomsCreated) * 100))
      : 0;

    // Game completion rate
    const gameCompletionRate = gamesStarted > 0
      ? Math.min(100, Math.round((gamesCompleted / gamesStarted) * 100))
      : 0;

    // Average questions answered per game
    const avgQuestionsPerGame = gamesStarted > 0
      ? (totalQuestionsAnswered / (gamesStarted * 2)).toFixed(1)
      : '0.0';

    // AI failure rate
    const aiSuccess = eventCounts['ai_generation_succeeded'] || 0;
    const aiFailed = eventCounts['ai_generation_failed'] || 0;
    const aiTotal = aiSuccess + aiFailed;
    const aiFailureRate = aiTotal > 0
      ? Math.round((aiFailed / aiTotal) * 100)
      : 0;

    // Reconnection recovery count
    const reconnectRecoveryCount = eventCounts['reconnect_succeeded'] || 0;

    // Recent events log
    const recentEvents = await prisma.productEvent.findMany({
      orderBy: { timestamp: 'desc' },
      take: 15,
      select: {
        id: true,
        eventType: true,
        timestamp: true,
        metadata: true,
      },
    });

    return {
      kpis: {
        totalUsers,
        roomsCreated,
        gamesStarted,
        gamesCompleted,
        totalQuestionsAnswered,
        roomToGameConversion: `${roomToGameConversion}%`,
        gameCompletionRate: `${gameCompletionRate}%`,
        avgQuestionsPerGame,
        aiFailureRate: `${aiFailureRate}%`,
        reconnectRecoveryCount,
        invitationsAccepted,
      },
      recentEvents: recentEvents.map((e) => ({
        ...e,
        metadata: JSON.parse(e.metadata || '{}'),
      })),
    };
  }
}
