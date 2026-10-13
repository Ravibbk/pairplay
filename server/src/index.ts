import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { env } from './config/env.js';
import { setupSocketHandlers } from './sockets/socketHandler.js';
import { prisma } from './lib/prisma.js';

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => callback(null, true),
    credentials: true,
    methods: ['GET', 'POST'],
  },
  pingInterval: 10000,
  pingTimeout: 5000,
});

setupSocketHandlers(io);

const serverInstance = server.listen(env.PORT, () => {
  console.log(`
  ✨ ============================================== ✨
     🎮 PairPlay Backend Server is Running!
     🌐 HTTP API:       http://localhost:${env.PORT}/api
     ⚡ Real-time WS:   ws://localhost:${env.PORT}
     🩺 Health check:   http://localhost:${env.PORT}/api/health
     📦 Environment:    ${env.NODE_ENV}
  ✨ ============================================== ✨
  `);
});

// Graceful shutdown
const shutdown = async () => {
  console.log('\n🛑 Gracefully shutting down PairPlay server...');
  serverInstance.close(async () => {
    await prisma.$disconnect();
    console.log('✅ Connections closed. Goodbye!');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
