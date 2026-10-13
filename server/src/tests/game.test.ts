import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { AiService } from '../services/ai.service.js';

describe('Room & Real-time Game Progression Integration Tests', () => {
  let player1Token: string;
  let player1Id: string;
  let player2Token: string;
  let player2Id: string;
  let roomCode: string;
  let roomId: string;
  let gameSessionId: string;
  let firstQuestionId: string;

  beforeAll(async () => {
    const timestamp = Date.now();

    // Register Player 1
    const p1Res = await request(app)
      .post('/api/auth/signup')
      .send({
        email: `p1_${timestamp}@example.com`,
        password: 'Password123!',
        displayName: 'Player One',
      });
    player1Token = p1Res.body.token;
    player1Id = p1Res.body.user.id;

    // Register Player 2
    const p2Res = await request(app)
      .post('/api/auth/signup')
      .send({
        email: `p2_${timestamp}@example.com`,
        password: 'Password123!',
        displayName: 'Player Two',
      });
    player2Token = p2Res.body.token;
    player2Id = p2Res.body.user.id;
  });

  it('Player 1 creates a private room with 6-char code', async () => {
    const res = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${player1Token}`)
      .send({ category: 'Deep Connections' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.room.code).toBeDefined();
    expect(res.body.room.code.length).toBeGreaterThanOrEqual(6);
    roomCode = res.body.room.code;
    roomId = res.body.room.id;
  });

  it('Player 2 joins the room using room code', async () => {
    const res = await request(app)
      .post('/api/rooms/join')
      .set('Authorization', `Bearer ${player2Token}`)
      .send({ code: roomCode });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.room.partnerId).toBe(player2Id);
  });

  it('rejects a 3rd player joining the full couples room', async () => {
    const p3Res = await request(app)
      .post('/api/auth/signup')
      .send({
        email: `p3_${Date.now()}@example.com`,
        password: 'Password123!',
        displayName: 'Player Three',
      });

    const res = await request(app)
      .post('/api/rooms/join')
      .set('Authorization', `Bearer ${p3Res.body.token}`)
      .send({ code: roomCode });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('Starts a game session with 5 questions', async () => {
    const res = await request(app)
      .post('/api/games/start')
      .set('Authorization', `Bearer ${player1Token}`)
      .send({ roomId, category: 'Deep Connections', totalQuestions: 5 });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.session.questions.length).toBe(5);
    gameSessionId = res.body.session.id;
    firstQuestionId = res.body.session.questions[0].id;
  });

  it('Player 1 submits an answer to the first question', async () => {
    const res = await request(app)
      .post('/api/games/answer')
      .set('Authorization', `Bearer ${player1Token}`)
      .send({
        gameSessionId,
        gameQuestionId: firstQuestionId,
        answerText: 'A quiet cabin in the mountains by a fireplace',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.isBothAnswered).toBe(false);
  });

  it('Rejects duplicate answer submission from Player 1 for the same question', async () => {
    const res = await request(app)
      .post('/api/games/answer')
      .set('Authorization', `Bearer ${player1Token}`)
      .send({
        gameSessionId,
        gameQuestionId: firstQuestionId,
        answerText: 'Another conflicting answer',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('already submitted');
  });

  it('Hides Player 1 answer text from Player 2 before Player 2 has answered', async () => {
    const res = await request(app)
      .get(`/api/games/session/${gameSessionId}`)
      .set('Authorization', `Bearer ${player2Token}`);

    expect(res.status).toBe(200);
    const q1 = res.body.session.questions[0];
    expect(q1.isRevealed).toBe(false);
    // The partner answer text must be obscured
    const partnerAns = q1.answers.find((a: any) => a.userId === player1Id);
    expect(partnerAns.answerText).toContain('Locked until both reveal');
  });

  it('Player 2 submits answer; session immediately unlocks and reveals both answers', async () => {
    const res = await request(app)
      .post('/api/games/answer')
      .set('Authorization', `Bearer ${player2Token}`)
      .send({
        gameSessionId,
        gameQuestionId: firstQuestionId,
        answerText: 'Wandering through a seaside street market drinking matcha',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.isBothAnswered).toBe(true);
    expect(res.body.sessionState.currentQuestion.isRevealed).toBe(true);
  });

  it('AI Service returns curated fallback questions smoothly without API key', async () => {
    const fallback = await AiService.getCuratedFallbackQuestions('Deep Connections', 3);
    expect(fallback.length).toBe(3);
    expect(fallback[0].text).toBeDefined();
    expect(fallback[0].category).toBe('Deep Connections');
  });

  it('Analytics dashboard aggregates metrics correctly', async () => {
    const res = await request(app)
      .get('/api/analytics/metrics')
      .set('Authorization', `Bearer ${player1Token}`);

    expect(res.status).toBe(200);
    expect(res.body.kpis.totalUsers).toBeGreaterThan(0);
    expect(res.body.kpis.roomsCreated).toBeGreaterThan(0);
  });
});
