import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { Card } from '../common/Card.js';
import { Button } from '../common/Button.js';
import { Badge } from '../common/Badge.js';
import { GameSession, User } from '../../types/index.js';
import { Sparkles, Heart, RotateCcw, Home, MessageSquare } from 'lucide-react';

interface GameRecapProps {
  session: GameSession;
  currentUser: User;
  onPlayAgain: () => void;
}

export const GameRecap: React.FC<GameRecapProps> = ({
  session,
  currentUser,
  onPlayAgain,
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Launch delightful celebratory confetti
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#7E3E8C', '#9B71F8', '#FC8080', '#F55757', '#F1E5F3'],
    });
  }, []);

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto pb-12">
      {/* Header Celebration Card */}
      <Card className="bg-gradient-to-r from-plum-900 via-plum-800 to-lavender-900 text-white p-8 sm:p-10 rounded-4xl shadow-soft-lg text-center relative overflow-hidden">
        <div className="w-16 h-16 rounded-3xl bg-coral-500/20 border border-coral-400/40 text-coral-300 flex items-center justify-center mx-auto mb-4">
          <Heart className="w-8 h-8 fill-coral-400 text-coral-400" />
        </div>

        <Badge variant="lavender" size="sm" className="mb-3">
          Session Complete ✨
        </Badge>

        <h1 className="text-3xl sm:text-4xl font-serif font-bold mb-3">
          Closer, One Game at a Time
        </h1>
        <p className="text-sm sm:text-base text-lavender-200 max-w-lg mx-auto leading-relaxed">
          You and your partner completed all {session.totalQuestions} questions in{' '}
          <span className="text-white font-semibold">“{session.category}”</span>. All answers have been safely preserved in your Shared Memories.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button
            variant="coral"
            size="lg"
            onClick={onPlayAgain}
            className="font-semibold"
          >
            <RotateCcw className="w-4 h-4" />
            Play Another Round
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/dashboard')}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            <Home className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </div>
      </Card>

      {/* Recap of All Questions & Answers */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl font-bold font-serif text-plum-950 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-plum-600" />
            Complete Conversation Recap
          </h2>
          <span className="text-xs text-plum-400">
            {session.questions.length} questions revealed
          </span>
        </div>

        {session.questions.map((q, idx) => {
          const userAns = q.answers.find((a) => a.userId === currentUser.id);
          const partnerAns = q.answers.find((a) => a.userId !== currentUser.id);

          return (
            <Card key={q.id} className="p-6 bg-white border border-cream-200 shadow-soft">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-plum-100 text-plum-800 font-bold text-xs flex items-center justify-center">
                  {idx + 1}
                </span>
                <h3 className="text-base font-bold font-serif text-plum-900">
                  “{q.questionText}”
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-3 border-t border-cream-200">
                {/* You */}
                <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200">
                  <div className="text-[11px] font-semibold text-plum-400 uppercase tracking-wider mb-1">
                    Your Answer
                  </div>
                  <p className="text-sm text-plum-900 leading-relaxed font-sans">
                    {userAns?.answerText || '—'}
                  </p>
                </div>

                {/* Partner */}
                <div className="p-4 rounded-2xl bg-lavender-50/70 border border-lavender-200">
                  <div className="text-[11px] font-semibold text-lavender-700 uppercase tracking-wider mb-1">
                    Partner’s Answer
                  </div>
                  <p className="text-sm text-plum-900 leading-relaxed font-sans font-medium">
                    {partnerAns?.answerText || '—'}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
