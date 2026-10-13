import React from 'react';
import { Card } from '../common/Card.js';
import { Badge } from '../common/Badge.js';
import { GameQuestion } from '../../types/index.js';
import { Sparkles, Lock } from 'lucide-react';

interface QuestionCardProps {
  question: GameQuestion;
  currentIndex: number;
  totalQuestions: number;
  category: string;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  currentIndex,
  totalQuestions,
  category,
}) => {
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  return (
    <Card className="bg-white border border-cream-200/90 shadow-soft p-6 sm:p-8 relative overflow-hidden">
      {/* Background soft glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-plum-100/30 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Badge variant="plum" size="md">
            <Sparkles className="w-3 h-3 text-lavender-500" />
            {category}
          </Badge>
          <div className="flex items-center gap-1 text-xs text-plum-400 font-medium">
            <Lock className="w-3 h-3 text-plum-400" />
            <span>Private answers</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-plum-800 tracking-wide">
            Question {currentIndex + 1} of {totalQuestions}
          </span>
          <div className="w-24 h-2 bg-cream-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-plum-700 to-lavender-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Question Text */}
      <div className="py-4">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-plum-950 leading-snug">
          “{question.questionText}”
        </h2>
      </div>

      <div className="pt-4 border-t border-cream-200 flex items-center justify-between text-xs text-plum-400">
        <span>Take your time. Speak from the heart.</span>
        <span>Answers stay hidden until both lock in.</span>
      </div>
    </Card>
  );
};
