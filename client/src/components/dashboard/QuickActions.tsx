import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../common/Card.js';
import { Button } from '../common/Button.js';
import { Modal } from '../common/Modal.js';
import { Input } from '../common/Input.js';
import { api } from '../../lib/api.js';
import {
  Gamepad2,
  KeyRound,
  HeartHandshake,
  Smile,
  Compass,
  Sparkles,
  CalendarHeart,
} from 'lucide-react';

export const QuickActions: React.FC = () => {
  const navigate = useNavigate();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(false);

  // Create room state
  const [selectedCategory, setSelectedCategory] = useState('Deep Connections');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Join room state
  const [joinCode, setJoinCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  const categories = [
    {
      id: 'Deep Connections',
      name: 'Deep Connections',
      desc: 'Emotional intimacy, values, vulnerability',
      icon: HeartHandshake,
      color: 'bg-plum-100 text-plum-800',
    },
    {
      id: 'Fun & Quirky',
      name: 'Fun & Quirky',
      desc: 'Inside jokes, funny habits, hypotheticals',
      icon: Smile,
      color: 'bg-lavender-100 text-lavender-800',
    },
    {
      id: 'Preferences & Cozy',
      name: 'Preferences & Cozy',
      desc: 'Food favorites, cozy evenings, rituals',
      icon: Compass,
      color: 'bg-coral-100 text-coral-800',
    },
    {
      id: 'Memories & Milestones',
      name: 'Memories & Milestones',
      desc: 'First impressions, cherished trips, milestones',
      icon: CalendarHeart,
      color: 'bg-emerald-50 text-emerald-800',
    },
    {
      id: 'Future & Dreams',
      name: 'Future & Dreams',
      desc: 'Bucket lists, upcoming adventures, life dreams',
      icon: Sparkles,
      color: 'bg-amber-50 text-amber-800',
    },
  ];

  const handleCreateRoom = async () => {
    setIsCreating(true);
    setCreateError(null);
    try {
      const res = await api.post('/rooms', { category: selectedCategory });
      setCreateModalOpen(false);
      navigate(`/room/${res.room.code}`);
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create room.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;

    setIsJoining(true);
    setJoinError(null);
    try {
      const res = await api.post('/rooms/join', { code: joinCode.trim() });
      setJoinModalOpen(false);
      navigate(`/room/${res.room.code}`);
    } catch (err: any) {
      setJoinError(err.message || 'Failed to join room. Verify code.');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Create Room Button Card */}
        <button
          onClick={() => setCreateModalOpen(true)}
          className="text-left group transition-all"
        >
          <Card className="h-full border border-plum-100 bg-white group-hover:border-plum-300 group-hover:shadow-soft-lg p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-plum-800 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <Gamepad2 className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-plum-50 text-plum-700">
                Host Game
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-plum-950 font-serif">
                Create Private Room
              </h3>
              <p className="text-xs text-plum-500 mt-1">
                Start a 2-player “How Well Do You Know Me?” session and get a shareable room code.
              </p>
            </div>
          </Card>
        </button>

        {/* Join Room Button Card */}
        <button
          onClick={() => setJoinModalOpen(true)}
          className="text-left group transition-all"
        >
          <Card className="h-full border border-lavender-200 bg-white group-hover:border-lavender-400 group-hover:shadow-soft-lg p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-lavender-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <KeyRound className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-lavender-50 text-lavender-700">
                Join In
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-plum-950 font-serif">
                Join with Room Code
              </h3>
              <p className="text-xs text-plum-500 mt-1">
                Have a 6-character code from your partner? Enter it to enter their private room.
              </p>
            </div>
          </Card>
        </button>
      </div>

      {/* Create Room Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Start a Couples Game Session"
        description="Select a conversation theme for today’s questions."
        maxWidth="lg"
      >
        <div className="space-y-4 mt-2">
          {createError && (
            <div className="p-3 rounded-2xl bg-coral-50 border border-coral-200 text-xs font-medium text-coral-700">
              {createError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
            {categories.map((c) => {
              const Icon = c.icon;
              const isSelected = selectedCategory === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCategory(c.id)}
                  className={`text-left p-3.5 rounded-2xl border transition-all ${
                    isSelected
                      ? 'border-plum-600 bg-plum-50/60 ring-2 ring-plum-300'
                      : 'border-cream-300 bg-white hover:border-plum-200 hover:bg-cream-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className={`p-1.5 rounded-xl ${c.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-plum-950 font-serif">
                      {c.name}
                    </span>
                  </div>
                  <p className="text-[11px] text-plum-500 leading-tight">
                    {c.desc}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-cream-200 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              isLoading={isCreating}
              onClick={handleCreateRoom}
            >
              Launch Room
            </Button>
          </div>
        </div>
      </Modal>

      {/* Join Room Modal */}
      <Modal
        isOpen={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
        title="Enter Room Code"
        description="Enter the 6-character room code generated by your partner."
      >
        <form onSubmit={handleJoinRoom} className="space-y-4 mt-2">
          {joinError && (
            <div className="p-3 rounded-2xl bg-coral-50 border border-coral-200 text-xs font-medium text-coral-700">
              {joinError}
            </div>
          )}

          <Input
            label="Room Code"
            placeholder="e.g. PP8492"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            required
            autoFocus
          />

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setJoinModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isJoining}
            >
              Join Room
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
