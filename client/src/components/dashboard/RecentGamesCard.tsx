import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../common/Card.js';
import { Badge } from '../common/Badge.js';
import { api } from '../../lib/api.js';
import { formatDate } from '../../lib/utils.js';
import { BookOpen, ChevronRight, Sparkles } from 'lucide-react';

export const RecentGamesCard: React.FC = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/games/history');
        setHistory(res.history || []);
      } catch (err) {
        console.warn('Failed to load recent games:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <Card className="bg-white border border-cream-200/80 p-6 sm:p-7 shadow-soft">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-plum-100 text-plum-900 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-plum-700" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-plum-950 font-serif">Recent Games</h3>
            <span className="text-[11px] text-plum-400">Your shared discovery log</span>
          </div>
        </div>

        <Link
          to="/history"
          className="text-xs font-semibold text-plum-700 hover:text-plum-950 flex items-center gap-1 transition-colors"
        >
          View all
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="h-14 bg-cream-100 rounded-2xl animate-pulse" />
          <div className="h-14 bg-cream-100 rounded-2xl animate-pulse" />
        </div>
      ) : history.length === 0 ? (
        <div className="p-8 text-center bg-cream-50/50 rounded-2xl border border-dashed border-cream-300">
          <Sparkles className="w-8 h-8 text-plum-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-plum-900">No played games yet</p>
          <p className="text-xs text-plum-400 max-w-xs mx-auto mt-1">
            Create a private room to start your very first game together!
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {history.slice(0, 3).map((game) => (
            <Link
              key={game.id}
              to="/history"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-cream-50/60 hover:bg-cream-100 border border-cream-200 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-coral-400" />
                <div>
                  <h4 className="text-xs font-bold text-plum-900">{game.category}</h4>
                  <p className="text-[11px] text-plum-400">
                    {formatDate(game.completedAt || game.startedAt)} • {game.questions?.length || 5} Questions
                  </p>
                </div>
              </div>
              <Badge variant="plum" size="sm">
                Completed ✨
              </Badge>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
};
