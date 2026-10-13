import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'PP';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export class RoomService {
  static async createRoom(hostId: string, category: string = 'Deep Connections') {
    let code = generateRoomCode();
    while (await prisma.room.findUnique({ where: { code } })) {
      code = generateRoomCode();
    }

    const room = await prisma.room.create({
      data: {
        code,
        hostId,
        category,
        status: 'WAITING',
      },
      include: {
        host: {
          select: { id: true, displayName: true, avatarUrl: true, partnerCode: true },
        },
        partner: {
          select: { id: true, displayName: true, avatarUrl: true, partnerCode: true },
        },
      },
    });

    return room;
  }

  static async getRoomByCode(code: string) {
    const cleanCode = code.trim().toUpperCase();
    const room = await prisma.room.findUnique({
      where: { code: cleanCode },
      include: {
        host: {
          select: { id: true, displayName: true, avatarUrl: true, partnerCode: true },
        },
        partner: {
          select: { id: true, displayName: true, avatarUrl: true, partnerCode: true },
        },
        gameSessions: {
          orderBy: { startedAt: 'desc' },
          take: 1,
          include: {
            questions: {
              orderBy: { orderIndex: 'asc' },
            },
            answers: true,
          },
        },
      },
    });

    if (!room) {
      throw new AppError(`Room with code "${cleanCode}" was not found or has expired.`, 404);
    }

    return room;
  }

  static async joinRoom(userId: string, code: string) {
    const cleanCode = code.trim().toUpperCase();
    const room = await prisma.room.findUnique({
      where: { code: cleanCode },
    });

    if (!room) {
      throw new AppError(`Room with code "${cleanCode}" was not found.`, 404);
    }

    if (room.status === 'FINISHED' || room.status === 'ABANDONED') {
      throw new AppError('This game room has already ended.', 400);
    }

    // If user is already the host, they are in the room
    if (room.hostId === userId) {
      return this.getRoomByCode(cleanCode);
    }

    // If partner is already set and not this user, room is full (2-player couples room)
    if (room.partnerId && room.partnerId !== userId) {
      throw new AppError('This room already has 2 players. Only 2 players can join a couples room.', 403);
    }

    // Assign user as partner
    const updated = await prisma.room.update({
      where: { id: room.id },
      data: {
        partnerId: userId,
      },
      include: {
        host: {
          select: { id: true, displayName: true, avatarUrl: true, partnerCode: true },
        },
        partner: {
          select: { id: true, displayName: true, avatarUrl: true, partnerCode: true },
        },
      },
    });

    return updated;
  }

  static async getActiveRoomsForUser(userId: string) {
    return prisma.room.findMany({
      where: {
        OR: [{ hostId: userId }, { partnerId: userId }],
        status: { in: ['WAITING', 'IN_GAME'] },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        host: { select: { id: true, displayName: true, avatarUrl: true } },
        partner: { select: { id: true, displayName: true, avatarUrl: true } },
      },
    });
  }
}
