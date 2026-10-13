import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore.js';
import { useGameStore } from '../stores/gameStore.js';
import { getSocket } from '../lib/socket.js';
import { api } from '../lib/api.js';
import { Card } from '../components/common/Card.js';
import { Button } from '../components/common/Button.js';
import { Badge } from '../components/common/Badge.js';
import { Room } from '../types/index.js';
import {
  Copy,
  Check,
  Users,
  Gamepad2,
  Sparkles,
  ArrowLeft,
  Loader2,
  Share2,
} from 'lucide-react';

export const RoomLobbyPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { setRoom, setSession } = useGameStore();

  const [room, setRoomState] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code || !user) return;

    const socket = getSocket();

    // Join room via socket
    socket.emit(
      'room:join',
      { roomCode: code.toUpperCase() },
      (res: { success: boolean; room?: Room; session?: any; message?: string }) => {
        if (!res.success) {
          setError(res.message || 'Unable to join room');
          setLoading(false);
          return;
        }

        if (res.room) {
          setRoomState(res.room);
          setRoom(res.room);
        }

        if (res.session && res.session.status === 'IN_PROGRESS') {
          setSession(res.session);
          navigate(`/room/${code}/play`);
        }

        setLoading(false);
      }
    );

    // Listen for room state updates
    const handleRoomState = (data: { room: Room; session?: any }) => {
      setRoomState(data.room);
      setRoom(data.room);
      if (data.session && data.session.status === 'IN_PROGRESS') {
        setSession(data.session);
        navigate(`/room/${code}/play`);
      }
    };

    const handleGameStarted = (data: { session: any }) => {
      setSession(data.session);
      navigate(`/room/${code}/play`);
    };

    socket.on('room:state', handleRoomState);
    socket.on('game:started', handleGameStarted);

    return () => {
      socket.off('room:state', handleRoomState);
      socket.off('game:started', handleGameStarted);
    };
  }, [code, user, navigate, setRoom, setSession]);

  const handleCopyCode = () => {
    if (!code) return;
    navigator.clipboard.writeText(code.toUpperCase());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartGame = () => {
    if (!room || !user) return;
    setStarting(true);
    const socket = getSocket();

    socket.emit(
      'game:start',
      {
        roomId: room.id,
        category: room.category,
        totalQuestions: 5,
      },
      (res: { success: boolean; session?: any; message?: string }) => {
        if (!res.success) {
          setError(res.message || 'Failed to start game');
          setStarting(false);
          return;
        }
        setSession(res.session);
        navigate(`/room/${room.code}/play`);
      }
    );
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-plum-700" />
        <p className="text-sm text-plum-600 font-medium">Entering private room...</p>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="max-w-md mx-auto my-16 text-center space-y-4 px-4">
        <Card className="p-8 bg-white border border-coral-200 shadow-soft">
          <h2 className="text-xl font-bold font-serif text-plum-950 mb-2">Room Error</h2>
          <p className="text-sm text-coral-600 mb-6">{error || 'Room not found.'}</p>
          <Button variant="primary" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const isHost = room.hostId === user?.id;
  const hasPartner = !!room.partnerId;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8 animate-fade-in">
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-1.5 text-xs font-semibold text-plum-600 hover:text-plum-950 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      {/* Main Room Card */}
      <Card className="bg-white border border-cream-200/90 shadow-soft-lg p-6 sm:p-10 rounded-4xl text-center space-y-6">
        <div>
          <Badge variant="plum" size="sm" className="mb-3">
            <Sparkles className="w-3.5 h-3.5 text-lavender-500" />
            Category: {room.category}
          </Badge>

          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-plum-950">
            Couples Game Room
          </h1>
          <p className="text-xs sm:text-sm text-plum-500 mt-1 max-w-md mx-auto">
            Share this room code with your partner. Once both players are present, launch the game!
          </p>
        </div>

        {/* Big Room Code Banner */}
        <div className="max-w-xs mx-auto p-4 rounded-3xl bg-cream-50 border border-cream-300 flex items-center justify-between">
          <div className="text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-plum-400">
              Room Code
            </span>
            <div className="text-3xl font-mono font-extrabold tracking-wider text-plum-950">
              {room.code}
            </div>
          </div>

          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-plum-800 hover:bg-plum-700 text-white text-xs font-semibold transition-all shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* 2-Player Presence Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto pt-4">
          {/* Host Card */}
          <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-plum-800 text-white font-bold flex items-center justify-center text-sm shadow-sm">
              {room.host.displayName.charAt(0).toUpperCase()}
            </div>
            <div className="text-left flex-1">
              <div className="text-xs font-bold text-plum-950">{room.host.displayName}</div>
              <span className="text-[11px] text-plum-400">Host (Ready)</span>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>

          {/* Partner Card */}
          <div className={`p-4 rounded-2xl border flex items-center gap-3 ${
            hasPartner
              ? 'bg-cream-50 border-cream-200'
              : 'bg-cream-100/50 border-dashed border-cream-300'
          }`}>
            <div className={`w-10 h-10 rounded-xl font-bold flex items-center justify-center text-sm ${
              hasPartner ? 'bg-lavender-600 text-white shadow-sm' : 'bg-cream-200 text-plum-300'
            }`}>
              {room.partner ? room.partner.displayName.charAt(0).toUpperCase() : '?'}
            </div>
            <div className="text-left flex-1">
              <div className="text-xs font-bold text-plum-950">
                {room.partner ? room.partner.displayName : 'Waiting for partner...'}
              </div>
              <span className="text-[11px] text-plum-400">
                {hasPartner ? 'Connected' : 'Share code above'}
              </span>
            </div>
            {hasPartner && <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />}
          </div>
        </div>

        {/* Start Game Action */}
        <div className="pt-6 border-t border-cream-200 flex flex-col items-center gap-3">
          {isHost ? (
            <Button
              variant="coral"
              size="lg"
              onClick={handleStartGame}
              isLoading={starting}
              disabled={!hasPartner}
              className="px-8 shadow-md"
            >
              <Gamepad2 className="w-5 h-5" />
              {hasPartner ? 'Start Game Now ✨' : 'Waiting for Partner to Join'}
            </Button>
          ) : (
            <div className="p-3.5 rounded-2xl bg-lavender-50 border border-lavender-200 text-xs font-semibold text-plum-800">
              You are connected! Waiting for host ({room.host.displayName}) to start the game...
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
