import { Request, Response, NextFunction } from 'express';
import { RoomService } from '../services/room.service.js';
import { AnalyticsService } from '../services/analytics.service.js';
import { createRoomSchema, joinRoomSchema } from '../schemas/room.schema.js';

export class RoomController {
  static async createRoom(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createRoomSchema.parse(req.body);
      const room = await RoomService.createRoom(req.user!.id, validated.category);

      await AnalyticsService.recordEvent('room_created', req.user!.id, {
        roomCode: room.code,
        category: validated.category,
      });

      res.status(201).json({
        success: true,
        message: 'Room created successfully',
        room,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getRoom(req: Request, res: Response, next: NextFunction) {
    try {
      const code = String(req.params.code);
      const room = await RoomService.getRoomByCode(code);
      res.status(200).json({
        success: true,
        room,
      });
    } catch (error) {
      next(error);
    }
  }

  static async joinRoom(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = joinRoomSchema.parse(req.body);
      const room = await RoomService.joinRoom(req.user!.id, validated.code);

      await AnalyticsService.recordEvent('invitation_accepted', req.user!.id, {
        roomCode: validated.code,
      });

      res.status(200).json({
        success: true,
        message: 'Joined room successfully',
        room,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getActiveRooms(req: Request, res: Response, next: NextFunction) {
    try {
      const rooms = await RoomService.getActiveRoomsForUser(req.user!.id);
      res.status(200).json({
        success: true,
        rooms,
      });
    } catch (error) {
      next(error);
    }
  }
}
