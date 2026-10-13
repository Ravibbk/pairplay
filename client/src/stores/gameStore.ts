import { create } from 'zustand';
import { Room, GameSession } from '../types/index.js';

interface LiveReaction {
  id: string;
  userId: string;
  displayName: string;
  reaction: string;
}

interface GameState {
  currentRoom: Room | null;
  currentSession: GameSession | null;
  partnerOnline: boolean;
  liveReactions: LiveReaction[];
  setRoom: (room: Room | null) => void;
  setSession: (session: GameSession | null) => void;
  setPartnerOnline: (online: boolean) => void;
  addLiveReaction: (reaction: LiveReaction) => void;
  clearGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  currentRoom: null,
  currentSession: null,
  partnerOnline: false,
  liveReactions: [],

  setRoom: (room) => set({ currentRoom: room }),
  setSession: (session) => set({ currentSession: session }),
  setPartnerOnline: (online) => set({ partnerOnline: online }),

  addLiveReaction: (reaction) => {
    set((state) => ({
      liveReactions: [...state.liveReactions, reaction],
    }));

    // Auto-remove reaction after 4 seconds
    setTimeout(() => {
      set((state) => ({
        liveReactions: state.liveReactions.filter((r) => r.id !== reaction.id),
      }));
    }, 4000);
  },

  clearGame: () =>
    set({
      currentRoom: null,
      currentSession: null,
      partnerOnline: false,
      liveReactions: [],
    }),
}));
