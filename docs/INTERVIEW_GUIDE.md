# PairPlay — Technical Architecture & Interview Guide

This guide is designed to help you confidently explain the architecture, engineering trade-offs, and systems decisions of **PairPlay** in a senior software engineering interview (e.g., at consumer tech companies like Kulfi).

---

## 1. Problem Space & Product Vision
PairPlay addresses remote relationship communication fatigue. While standard messengers facilitate asynchronous logistical chatting, they lack the intentional, gamified structure required to spark emotional vulnerability and playfulness. 

Key product principles:
- **Zero Third Wheels:** The application is architected strictly for pairs ($N=2$).
- **Simultaneous Private Submissions:** Prevents anchoring bias where one partner's answer influences the other's.
- **Server-Authoritative Synchronization:** Answers stay masked on the server until both players lock in their responses.

---

## 2. Architecture Decisions & Trade-Offs

### A. Monorepo with Workspaces
- **Decision:** Used npm workspaces (`client` and `server`) under a single Git repository.
- **Trade-off:** Simpler to maintain, test, coordinate types, and deploy than separate repositories, while avoiding unnecessary microservice overhead for a two-person development team.

### B. REST vs. WebSocket Responsibilities
- **REST Endpoints:**
  - Account lifecycle (Signup, Login, Logout, Cookie handling).
  - Profile customization and partner pairing.
  - History querying and aggregated analytics retrieval.
- **WebSocket (Socket.IO):**
  - Ephemeral room presence (connected, typing, disconnected).
  - Synchronized question reveals.
  - Low-latency emoji reaction broadcasts.
- **Why not WebSockets for everything?**
  REST handles caching, idempotency, rate limiting, and HTTP-only cookie security much better than raw socket frames. WebSockets are reserved for real-time state synchronization where low latency is essential.

### C. Server-Authoritative State Machine
- **State Flow:** `PREPARING` ➔ `IN_PROGRESS` ➔ `REVEALING` ➔ `COMPLETED`.
- **Security Guarantee:** The client cannot advance question indices, forge revealed answers, or skip turn order. The server verifies:
  1. Is the socket authenticated with a valid JWT?
  2. Does the user belong to the room as Host or Partner?
  3. Has the player already submitted an answer for this question index?
  4. Have both players submitted? Only when both have submitted does the server transition to `REVEALING` and emit the plaintext answer.

---

## 3. Database Schema & Data Integrity (Prisma ORM)

### Relational Design
- **`User`**: Core identity, bcrypt password hash, unique `partnerCode`.
- **`Couple`**: Unique composite constraint `@@unique([user1Id, user2Id])` to enforce mutual pairing.
- **`Room`**: Unique 6-character room code `code`, indexed for quick lobby lookups.
- **`GameSession`**: Foreign key to `Room`, tracks `currentQuestionIndex` and `totalQuestions`.
- **`GameQuestion`**: Stores the question prompt and sequence order `orderIndex`.
- **`GameAnswer`**: Crucial unique constraint:
  ```prisma
  @@unique([gameSessionId, gameQuestionId, userId])
  ```
  This database-level constraint makes it physically impossible for race conditions or duplicate HTTP/socket events to insert multiple answers for the same player on the same question.

---

## 4. Real-Time Synchronization & Reconnection Resilience

### How Reconnection Works:
1. When a client momentarily drops connection (e.g. mobile Wi-Fi to cellular handover):
   - Socket.IO client automatically initiates reconnect attempts with exponential backoff.
   - Handshake authentication re-validates the user's JWT.
2. Upon reconnection, the client dispatches `room:join` with the room code.
3. The server looks up the active `GameSession` in PostgreSQL/SQLite and returns a **sanitized state snapshot**:
   - If the current question has been answered by only one player, the server masks the other player's answer (`•••••••• (Locked until both reveal)`).
   - If both players have answered, both plaintext answers are returned.
4. The frontend UI immediately hydrates back into the exact game step without data loss.

---

## 5. Duplicate-Submission Protection & Race Condition Handling

- **Level 1 (UI):** Submission button enters `isLoading` and disables text inputs immediately upon submission.
- **Level 2 (Application Service):** `GameService.submitAnswer` checks for existing answer records before creating a new one, throwing `AppError('You have already submitted an answer', 400)`.
- **Level 3 (Database Constraint):** Prisma enforces the composite unique index `[gameSessionId, gameQuestionId, userId]`. If two identical requests hit the server concurrently within 1ms, PostgreSQL will safely reject the second with a `P2002` unique constraint violation.

---

## 6. AI Integration & Resilient Fallback Strategy

### The AI Pipeline:
1. **Request:** Prompt sent to Google Gemini 1.5 Flash via REST API with a strict system prompt.
2. **Structured Output:** Configured `responseMimeType: 'application/json'` asking for a list of structured question objects.
3. **Zod Validation:** Server validates the response against `aiGeneratedQuestionsResponseSchema`.
4. **Timeout & Abort Controller:** A 6-second timeout ensures slow LLM responses never hang the game session.
5. **Fallback:** If `GEMINI_API_KEY` is omitted, the network fails, or the response fails schema validation, the system seamlessly pulls from the **28-question curated database bank**. The user experience is 100% uninterrupted.

---

## 7. Testing Strategy

PairPlay features a 2-tier automated test suite:
1. **Backend Integration Tests (Vitest + Supertest):**
   - Tests authentication flows, password complexity, duplicate emails, and unauthorized guards.
   - Tests full 2-player room joining, third-player rejection, duplicate answer rejection, private answer masking, and AI fallback.
2. **Frontend Component Tests (Vitest + React Testing Library + JSDOM):**
   - Tests interactive buttons, inputs with validation states, question cards, and answer reveal states.

---

## 8. Scalability & Production Readiness

### Horizontal Scaling Trade-Off:
- **Current Architecture:** Single-instance Node.js with in-memory Socket.IO adapter and persistent database storage in PostgreSQL.
- **Scaling to 100,000+ Concurrent Rooms:**
  1. Add **Redis Pub/Sub** via `@socket.io/redis-adapter` so sockets connected across multiple server containers can seamlessly communicate within the same room.
  2. Implement **Redis caching** for active room states to relieve database reads on frequent typing/presence events.
  3. Serve frontend assets via a global CDN (Vercel, Cloudflare Pages, or AWS CloudFront).
  4. Use managed PostgreSQL (Neon / Supabase / AWS RDS) with PgBouncer connection pooling.
