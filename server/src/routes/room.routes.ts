import { Router } from 'express';
import { RoomController } from '../controllers/room.controller.js';
import { authenticate } from '../middleware/auth.js';
import { inviteLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.use(authenticate);

router.post('/', RoomController.createRoom);
router.get('/active', RoomController.getActiveRooms);
router.get('/:code', RoomController.getRoom);
router.post('/join', inviteLimiter, RoomController.joinRoom);

export default router;
