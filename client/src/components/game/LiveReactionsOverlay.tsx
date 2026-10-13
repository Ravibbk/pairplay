import React from 'react';
import { useGameStore } from '../../stores/gameStore.js';

export const LiveReactionsOverlay: React.FC = () => {
  const { liveReactions } = useGameStore();

  if (liveReactions.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {liveReactions.map((r, i) => (
        <div
          key={r.id}
          className="absolute bottom-12 right-12 animate-slide-up flex items-center gap-2 px-4 py-2 bg-white/95 rounded-full shadow-soft-lg border border-lavender-200"
          style={{
            transform: `translateY(-${i * 55}px)`,
            transition: 'transform 0.3s ease-out',
          }}
        >
          <span className="text-2xl">{r.reaction}</span>
          <span className="text-xs font-semibold text-plum-900">
            {r.displayName} reacted
          </span>
        </div>
      ))}
    </div>
  );
};
