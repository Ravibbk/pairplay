import { Router } from 'express';
import { GameController } from '../controllers/game.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.post('/start', GameController.startGame);
router.get('/session/:id', GameController.getSession);
router.post('/answer', GameController.submitAnswer);
router.post('/session/:id/next', GameController.nextQuestion);
router.post('/reaction', GameController.reactToAnswer);
router.get('/history', GameController.getHistory);

export default router;
