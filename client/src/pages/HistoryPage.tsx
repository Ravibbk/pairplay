import React, { useEffect, useState } from 'react';
import { Card } from '../components/common/Card.js';
import { Badge } from '../components/common/Badge.js';
import { api } from '../lib/api.js';
import { formatDate } from '../lib/utils.js';
import { useAuthStore } from '../stores/authStore.js';
import {
  BookOpen,
  Calendar,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Heart,
} from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const { user } = useAuthStore();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/games/history');
        setHistory(res.history || []);
      } catch (err) {
        console.warn('Failed to load history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const categories = ['All', 'Deep Connections', 'Fun & Quirky', 'Preferences & Cozy', 'Memories & Milestones', 'Future & Dreams'];

  const filteredHistory =
    selectedCategory === 'All'
      ? history
      : history.filter((h) => h.category === selectedCategory);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-plum-500 mb-1">
          <BookOpen className="w-3.5 h-3.5 text-lavender-500" />
          <span>Shared Memories</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-plum-950">
          Your Relationship Timeline
        </h1>
        <p className="text-sm text-plum-600 mt-1">
          Revisit completed games, reread each other’s answers, and see how your connection has grown.
        </p>
      </div>

      {/* Category filter tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-plum-800 text-white shadow-sm'
                : 'bg-white text-plum-700 border border-cream-300 hover:bg-cream-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="h-24 bg-cream-100 rounded-3xl animate-pulse" />
          <div className="h-24 bg-cream-100 rounded-3xl animate-pulse" />
        </div>
      ) : filteredHistory.length === 0 ? (
        <Card className="p-12 text-center bg-white border border-cream-300 shadow-soft">
          <Sparkles className="w-10 h-10 text-plum-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold font-serif text-plum-950">
            No memories found
          </h3>
          <p className="text-xs sm:text-sm text-plum-500 max-w-sm mx-auto mt-1">
            Complete a game session together to begin building your shared memory archive!
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredHistory.map((game) => {
            const isExpanded = expandedId === game.id;
            return (
              <Card
                key={game.id}
                className="p-6 bg-white border border-cream-200/90 shadow-soft hover:border-plum-200 transition-all"
              >
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : game.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-plum-100 text-plum-800 flex items-center justify-center font-serif font-bold text-sm">
                      <Heart className="w-5 h-5 text-coral-500 fill-coral-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="text-base font-bold font-serif text-plum-950">
                          {game.category}
                        </h3>
                        <Badge variant="plum" size="sm">
                          {game.questions?.length || 5} Questions
                        </Badge>
                      </div>
                      <p className="text-xs text-plum-400 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(game.completedAt || game.startedAt)} • Room {game.room?.code}
                      </p>
                    </div>
                  </div>

                  <button
                    className="p-2 text-plum-400 hover:text-plum-800 rounded-xl hover:bg-cream-100 transition-colors"
                    aria-label="Expand memory questions"
                  >
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>

                {/* Expanded Questions and Answers */}
                {isExpanded && (
                  <div className="mt-6 pt-5 border-t border-cream-200 space-y-5 animate-slide-up">
                    {game.questions?.map((q: any, idx: number) => {
                      const hostAns = q.answers?.find((a: any) => a.userId === game.room?.hostId);
                      const partnerAns = q.answers?.find((a: any) => a.userId === game.room?.partnerId);

                      return (
                        <div key={q.id} className="p-4 rounded-2xl bg-cream-50/70 border border-cream-200 space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-plum-800 text-white font-bold text-[10px] flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <h4 className="text-sm font-bold font-serif text-plum-900">
                              “{q.questionText}”
                            </h4>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div className="p-3 bg-white rounded-xl border border-cream-200">
                              <span className="font-semibold text-plum-400 text-[10px] uppercase block mb-1">
                                {game.room?.host?.displayName}
                              </span>
                              <p className="text-plum-900">{hostAns?.answerText || '—'}</p>
                            </div>
                            <div className="p-3 bg-lavender-50/70 rounded-xl border border-lavender-200">
                              <span className="font-semibold text-lavender-700 text-[10px] uppercase block mb-1">
                                {game.room?.partner?.displayName || 'Partner'}
                              </span>
                              <p className="text-plum-900 font-medium">{partnerAns?.answerText || '—'}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
