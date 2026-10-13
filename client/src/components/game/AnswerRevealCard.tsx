import React, { useState } from 'react';
import { Card } from '../common/Card.js';
import { Button } from '../common/Button.js';
import { GameQuestion, User } from '../../types/index.js';
import { CheckCircle2, Lock, Sparkles, Send, Heart, Smile, MessageCircle } from 'lucide-react';

interface AnswerRevealCardProps {
  question: GameQuestion;
  currentUser: User;
  partnerUser: { id: string; displayName: string; avatarUrl?: string | null } | null;
  onSubmitAnswer: (text: string) => Promise<void>;
  onSendReaction: (reaction: string) => void;
  isSubmitting: boolean;
}

export const AnswerRevealCard: React.FC<AnswerRevealCardProps> = ({
  question,
  currentUser,
  partnerUser,
  onSubmitAnswer,
  onSendReaction,
  isSubmitting,
}) => {
  const [answerInput, setAnswerInput] = useState('');

  const myAnswer = question.answers.find((a) => a.userId === currentUser.id);
  const partnerAnswer = partnerUser
    ? question.answers.find((a) => a.userId === partnerUser.id)
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerInput.trim() || isSubmitting) return;
    await onSubmitAnswer(answerInput.trim());
    setAnswerInput('');
  };

  const reactionEmojis = ['❤️', '😂', '✨', '🤔', '🥺', '🔥'];

  return (
    <div className="space-y-6">
      {/* 2-Player Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Current User Card */}
        <Card className={`p-6 transition-all ${myAnswer ? 'bg-white border-plum-200 shadow-soft' : 'bg-cream-50 border-cream-300'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.displayName}
                  className="w-10 h-10 rounded-2xl object-cover border border-plum-200"
                />
              ) : (
                <div className="w-10 h-10 rounded-2xl bg-plum-800 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                  {currentUser.displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="text-sm font-bold text-plum-950 font-serif">
                  {currentUser.displayName} (You)
                </h3>
                <span className="text-[11px] text-plum-400">
                  {myAnswer ? 'Answer Locked In' : 'Drafting answer...'}
                </span>
              </div>
            </div>

            {myAnswer && (
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Submitted
              </span>
            )}
          </div>

          {/* Form or Submitted Display */}
          {!myAnswer ? (
            <form onSubmit={handleSubmit} className="space-y-3">
              <textarea
                rows={4}
                value={answerInput}
                onChange={(e) => setAnswerInput(e.target.value)}
                placeholder="Write your honest, thoughtful answer..."
                maxLength={800}
                className="w-full p-4 bg-white rounded-2xl border border-cream-300 text-sm text-plum-950 placeholder:text-plum-300 focus:outline-none focus:ring-2 focus:ring-plum-300 transition-all resize-none shadow-sm"
                required
                autoFocus
              />
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-plum-400">
                  {answerInput.length}/800 characters
                </span>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSubmitting}
                  disabled={!answerInput.trim()}
                >
                  <Send className="w-3.5 h-3.5" />
                  Lock In Answer
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-2">
              <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 text-sm text-plum-900 leading-relaxed font-sans">
                {myAnswer.answerText}
              </div>
              <p className="text-[11px] text-plum-400 text-right">
                Your answer is safely recorded.
              </p>
            </div>
          )}
        </Card>

        {/* Partner Card */}
        <Card className={`p-6 transition-all ${partnerAnswer ? 'bg-white border-lavender-200 shadow-soft' : 'bg-cream-50 border-cream-300'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {partnerUser?.avatarUrl ? (
                <img
                  src={partnerUser.avatarUrl}
                  alt={partnerUser.displayName}
                  className="w-10 h-10 rounded-2xl object-cover border border-lavender-200"
                />
              ) : (
                <div className="w-10 h-10 rounded-2xl bg-lavender-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                  {partnerUser?.displayName ? partnerUser.displayName.charAt(0).toUpperCase() : '?'}
                </div>
              )}
              <div>
                <h3 className="text-sm font-bold text-plum-950 font-serif">
                  {partnerUser ? partnerUser.displayName : 'Partner'}
                </h3>
                <span className="text-[11px] text-plum-400">
                  {question.partnerHasAnswered ? 'Answer Locked In' : 'Thinking & writing...'}
                </span>
              </div>
            </div>

            {question.partnerHasAnswered ? (
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Submitted
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs font-semibold text-plum-400 bg-cream-100 px-2.5 py-1 rounded-full border border-cream-200">
                <Lock className="w-3.5 h-3.5" />
                Typing...
              </span>
            )}
          </div>

          {/* Partner Answer Content */}
          {question.isRevealed && partnerAnswer ? (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-lavender-50/70 border border-lavender-200 text-sm text-plum-900 leading-relaxed font-sans font-medium animate-fade-in">
                {partnerAnswer.answerText}
              </div>

              {/* Reaction bar */}
              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-plum-400 font-medium">React to partner:</span>
                <div className="flex items-center gap-1">
                  {reactionEmojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => onSendReaction(emoji)}
                      className="p-1.5 hover:scale-125 hover:bg-cream-200 rounded-xl transition-all text-base focus:outline-none"
                      title={`React with ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-cream-100/60 rounded-2xl border border-dashed border-cream-300 flex flex-col items-center justify-center space-y-2">
              <Lock className="w-6 h-6 text-plum-300" />
              <p className="text-xs font-semibold text-plum-700">
                {question.partnerHasAnswered
                  ? 'Answer is locked in! Awaiting your answer to reveal together.'
                  : 'Waiting for partner to lock in their answer...'}
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
