import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card.js';
import { Button } from '../common/Button.js';
import { Badge } from '../common/Badge.js';
import { DailySpark } from '../../types/index.js';
import { api } from '../../lib/api.js';
import { Sparkles, MessageCircleHeart, Check, Send } from 'lucide-react';

export const DailySparkCard: React.FC = () => {
  const [spark, setSpark] = useState<DailySpark | null>(null);
  const [loading, setLoading] = useState(true);
  const [myAnswer, setMyAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchSpark = async () => {
      try {
        const data = await api.get('/ai/daily-spark');
        setSpark(data.spark);
      } catch (err) {
        console.warn('Failed to load Daily Spark:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSpark();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!myAnswer.trim()) return;
    setSubmitted(true);
  };

  if (loading) {
    return (
      <Card className="animate-pulse bg-cream-50 h-56 flex flex-col justify-between">
        <div className="h-4 bg-cream-200 rounded w-1/4" />
        <div className="h-6 bg-cream-200 rounded w-3/4" />
        <div className="h-10 bg-cream-200 rounded w-full" />
      </Card>
    );
  }

  if (!spark) return null;

  return (
    <Card className="bg-gradient-to-br from-white to-lavender-50/50 border border-lavender-100/80 shadow-soft p-6 sm:p-7 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-lavender-200/30 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-lavender-100 text-plum-800 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-lavender-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-plum-950 font-serif">Today’s Spark</h3>
            <span className="text-[11px] text-plum-400">Daily Question for Couples</span>
          </div>
        </div>

        <Badge variant="lavender" size="sm">
          {spark.category}
        </Badge>
      </div>

      <div className="mb-5">
        <p className="text-base sm:text-lg font-serif font-bold text-plum-900 leading-snug">
          “{spark.questionText}”
        </p>
      </div>

      {!submitted ? (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="Type your quick thought..."
            value={myAnswer}
            onChange={(e) => setMyAnswer(e.target.value)}
            className="flex-1 px-4 py-2 bg-white rounded-xl text-sm border border-cream-300 focus:outline-none focus:ring-2 focus:ring-lavender-400 text-plum-900"
          />
          <Button type="submit" variant="primary" size="sm">
            <Send className="w-3.5 h-3.5" />
            Share
          </Button>
        </form>
      ) : (
        <div className="p-3.5 rounded-2xl bg-lavender-100/60 border border-lavender-200/80 text-xs text-plum-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Answer saved! Waiting for partner to unlock today’s spark.</span>
          </div>
        </div>
      )}
    </Card>
  );
};
