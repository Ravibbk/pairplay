import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore.js';
import { useGameStore } from '../stores/gameStore.js';
import { getSocket } from '../lib/socket.js';
import { api } from '../lib/api.js';
import { QuestionCard } from '../components/game/QuestionCard.js';
import { AnswerRevealCard } from '../components/game/AnswerRevealCard.js';
import { GameRecap } from '../components/game/GameRecap.js';
import { LiveReactionsOverlay } from '../components/game/LiveReactionsOverlay.js';
import { Button } from '../components/common/Button.js';
import { Card } from '../components/common/Card.js';
import { GameSession } from '../types/index.js';
import { Loader2, ArrowRight, ArrowLeft } from 'lucide-react';

export const GameRoomPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentSession, setSession, addLiveReaction } = useGameStore();

  const [session, setSessionState] = useState<GameSession | null>(currentSession);
  const [loading, setLoading] = useState(!currentSession);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code || !user) return;

    const socket = getSocket();

    // Fetch session if not already in store
    const loadSession = async () => {
      try {
        const roomData = await api.get(`/rooms/${code.toUpperCase()}`);
        if (roomData.room.gameSessions && roomData.room.gameSessions.length > 0) {
          const latestId = roomData.room.gameSessions[0].id;
          const sessionData = await api.get(`/games/session/${latestId}`);
          setSessionState(sessionData.session);
          setSession(sessionData.session);
        }
      } catch (err: any) {
        setError(err.message || 'Unable to load game session');
      } finally {
        setLoading(false);
      }
    };

    if (!session) {
      loadSession();
    }

    // Socket Event Listeners
    const handleAnswerAccepted = (data: { answeredUserId: string }) => {
      setSessionState((prev) => {
        if (!prev || !prev.currentQuestion) return prev;
        const updatedQuestions = prev.questions.map((q, idx) => {
          if (idx === prev.currentQuestionIndex) {
            return {
              ...q,
              partnerHasAnswered: data.answeredUserId !== user.id ? true : q.partnerHasAnswered,
              userHasAnswered: data.answeredUserId === user.id ? true : q.userHasAnswered,
            };
          }
          return q;
        });

        return {
          ...prev,
          questions: updatedQuestions,
          currentQuestion: updatedQuestions[prev.currentQuestionIndex],
        };
      });
    };

    const handleReveal = (data: { session: GameSession }) => {
      setSessionState(data.session);
      setSession(data.session);
    };

    const handleNextQuestion = (data: { session: GameSession }) => {
      setSessionState(data.session);
      setSession(data.session);
      setIsAdvancing(false);
    };

    const handleGameComplete = (data: { session: GameSession }) => {
      setSessionState(data.session);
      setSession(data.session);
      setIsAdvancing(false);
    };

    const handleReaction = (data: { userId: string; displayName: string; reaction: string }) => {
      addLiveReaction({
        id: Math.random().toString(),
        userId: data.userId,
        displayName: data.displayName,
        reaction: data.reaction,
      });
    };

    socket.on('answer:accepted', handleAnswerAccepted);
    socket.on('game:reveal', handleReveal);
    socket.on('game:question', handleNextQuestion);
    socket.on('game:complete', handleGameComplete);
    socket.on('reaction:received', handleReaction);

    return () => {
      socket.off('answer:accepted', handleAnswerAccepted);
      socket.off('game:reveal', handleReveal);
      socket.off('game:question', handleNextQuestion);
      socket.off('game:complete', handleGameComplete);
      socket.off('reaction:received', handleReaction);
    };
  }, [code, user, session, setSession, addLiveReaction]);

  const handleSubmitAnswer = async (answerText: string) => {
    if (!session || !user) return;
    setIsSubmitting(true);
    const socket = getSocket();

    socket.emit(
      'answer:submit',
      {
        gameSessionId: session.id,
        answerText,
      },
      (res: { success: boolean; session?: GameSession; message?: string }) => {
        setIsSubmitting(false);
        if (!res.success) {
          setError(res.message || 'Failed to submit answer');
          return;
        }
        if (res.session) {
          setSessionState(res.session);
          setSession(res.session);
        }
      }
    );
  };

  const handleNext = () => {
    if (!session) return;
    setIsAdvancing(true);
    const socket = getSocket();

    socket.emit('game:next', { gameSessionId: session.id }, (res: any) => {
      if (!res.success) {
        setError(res.message || 'Failed to advance');
        setIsAdvancing(false);
      }
    });
  };

  const handleSendReaction = (reaction: string) => {
    if (!session) return;
    const socket = getSocket();
    socket.emit('reaction:send', { roomId: session.roomId, reaction });
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-plum-700" />
        <p className="text-sm text-plum-600 font-medium">Synchronizing game board...</p>
      </div>
    );
  }

  if (error || !session || !user) {
    return (
      <div className="max-w-md mx-auto my-16 text-center space-y-4 px-4">
        <Card className="p-8 bg-white border border-coral-200 shadow-soft">
          <h2 className="text-xl font-bold font-serif text-plum-950 mb-2">Game Error</h2>
          <p className="text-sm text-coral-600 mb-6">{error || 'Session not found'}</p>
          <Button variant="primary" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  // Completed Game View
  if (session.status === 'COMPLETED') {
    return (
      <div className="py-8 px-4 sm:px-6">
        <LiveReactionsOverlay />
        <GameRecap
          session={session}
          currentUser={user}
          onPlayAgain={() => navigate(`/room/${code}`)}
        />
      </div>
    );
  }

  const currentQuestion = session.currentQuestion;
  if (!currentQuestion) {
    return (
      <div className="text-center py-20">
        <p className="text-sm text-plum-500">Preparing next question...</p>
      </div>
    );
  }

  const partnerUser =
    session.players.host.id === user.id
      ? session.players.partner || null
      : session.players.host;

  const isCurrentRevealed = currentQuestion.isRevealed;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in relative">
      <LiveReactionsOverlay />

      {/* Top Navigation / Room Code Indicator */}
      <div className="flex items-center justify-between text-xs text-plum-500">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1 hover:text-plum-900 transition-colors font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Dashboard
        </button>

        <span className="font-mono bg-cream-200/80 px-2.5 py-1 rounded-lg text-plum-800 font-bold">
          Room: {session.roomCode || code}
        </span>
      </div>

      {/* Main Question Card */}
      <QuestionCard
        question={currentQuestion}
        currentIndex={session.currentQuestionIndex}
        totalQuestions={session.totalQuestions}
        category={session.category}
      />

      {/* Answer & Synchronized Reveal Cards */}
      <AnswerRevealCard
        question={currentQuestion}
        currentUser={user}
        partnerUser={partnerUser}
        onSubmitAnswer={handleSubmitAnswer}
        onSendReaction={handleSendReaction}
        isSubmitting={isSubmitting}
      />

      {/* Advance to Next Question Button (when revealed) */}
      {isCurrentRevealed && (
        <div className="pt-4 flex justify-end animate-slide-up">
          <Button
            variant="coral"
            size="lg"
            onClick={handleNext}
            isLoading={isAdvancing}
            className="shadow-md font-semibold"
          >
            {session.currentQuestionIndex + 1 >= session.totalQuestions ? (
              'Complete Game & View Recap 🎉'
            ) : (
              <>
                Next Question
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
