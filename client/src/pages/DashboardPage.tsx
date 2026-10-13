import React from 'react';
import { useAuthStore } from '../stores/authStore.js';
import { PartnerBanner } from '../components/dashboard/PartnerBanner.js';
import { DailySparkCard } from '../components/dashboard/DailySparkCard.js';
import { QuickActions } from '../components/dashboard/QuickActions.js';
import { RecentGamesCard } from '../components/dashboard/RecentGamesCard.js';
import { Card } from '../components/common/Card.js';
import { Sparkles, Heart, Flame, Shield, CheckCircle } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8 animate-fade-in">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-plum-500 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-lavender-500" />
            <span>Couples Sanctuary</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-plum-950">
            Welcome, {user.displayName} {user.partner ? `& ${user.partner.displayName}` : ''} ✨
          </h1>
          <p className="text-sm text-plum-600 mt-1">
            Your private space for fun questions, deep conversations, and shared discoveries.
          </p>
        </div>

        {/* Quick Connection Stats Card */}
        <div className="flex items-center gap-3">
          <Card className="px-4 py-2.5 bg-white border border-cream-200/90 shadow-sm flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-coral-50 text-coral-600 flex items-center justify-center">
              <Flame className="w-4 h-4 fill-coral-500 text-coral-500" />
            </div>
            <div>
              <div className="text-xs font-bold text-plum-950">Active Streak</div>
              <div className="text-[11px] text-plum-400">Day 1 • Starting strong</div>
            </div>
          </Card>
        </div>
      </div>

      {/* Partner Status Banner */}
      <PartnerBanner user={user} />

      {/* Main Grid: Quick Actions & Today's Daily Spark */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Quick Actions & Recent Games */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="text-lg font-bold font-serif text-plum-950 mb-3">
              Play & Connect
            </h2>
            <QuickActions />
          </div>

          <div>
            <RecentGamesCard />
          </div>
        </div>

        {/* Right Col: Today's Daily Spark & Relationship Tips */}
        <div className="space-y-6">
          <DailySparkCard />

          <Card className="bg-gradient-to-br from-cream-50 to-white border border-cream-300 p-6 shadow-soft space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-plum-100 text-plum-800 flex items-center justify-center">
                <Heart className="w-4 h-4 text-plum-700" />
              </div>
              <h3 className="text-sm font-bold text-plum-950 font-serif">
                How to Play Together
              </h3>
            </div>
            <ul className="text-xs text-plum-600 space-y-2.5 leading-relaxed">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Create a room and share the 6-character code with your partner.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Answer each question honestly—answers are hidden until both submit.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Celebrate surprising answers and react with live emojis!</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};
