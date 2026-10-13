import { create } from 'zustand';
import { User } from '../types/index.js';
import { api } from '../lib/api.js';
import { connectSocket, disconnectSocket } from '../lib/socket.js';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: { email: string; password: string; displayName: string; partnerCodeToConnect?: string }) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateUser: (user: User) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('pairplay_token'),
  isAuthenticated: !!localStorage.getItem('pairplay_token'),
  isLoading: true,
  error: null,

  clearError: () => set({ error: null }),

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.post('/auth/login', { email, password });
      localStorage.setItem('pairplay_token', data.token);
      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
      });
      connectSocket();
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  signup: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.post('/auth/signup', formData);
      localStorage.setItem('pairplay_token', data.token);
      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
      });
      connectSocket();
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Continue cleanup on network failure
    }
    localStorage.removeItem('pairplay_token');
    disconnectSocket();
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('pairplay_token');
    if (!token) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      const data = await api.get('/auth/me');
      set({ user: data.user, isAuthenticated: true, isLoading: false });
      connectSocket();
    } catch {
      localStorage.removeItem('pairplay_token');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  updateUser: (user: User) => set({ user }),
}));
