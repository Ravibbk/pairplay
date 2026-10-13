import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    const token = localStorage.getItem('pairplay_token');
    const wsUrl = import.meta.env.VITE_WS_URL || window.location.origin;

    socket = io(wsUrl, {
      auth: { token },
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    socket.on('connect', () => {
      console.log('⚡ Connected to PairPlay real-time server:', socket?.id);
    });

    socket.on('connect_error', (err) => {
      console.warn('⚠️ Real-time connection error:', err.message);
    });

    socket.on('reconnect', (attempt) => {
      console.log(`🔄 Reconnected to PairPlay server on attempt #${attempt}`);
    });
  }

  return socket;
};

export const connectSocket = () => {
  const s = getSocket();
  const token = localStorage.getItem('pairplay_token');
  if (token) {
    s.auth = { token };
  }
  if (!s.connected) {
    s.connect();
  }
  return s;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
