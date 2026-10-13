import React, { useEffect, useState } from 'react';
import { Card } from '../components/common/Card.js';
import { Badge } from '../components/common/Badge.js';
import { api } from '../lib/api.js';
import { formatDate, formatTimeAgo } from '../lib/utils.js';
import {
  BarChart3,
  Users,
  Gamepad2,
  CheckCircle2,
  TrendingUp,
  Brain,
  RotateCw,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await api.get('/analytics/metrics');
        setMetrics(res);
      } catch (err) {
        console.warn('Failed to load metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-6">
        <div className="h-8 bg-cream-200 rounded w-1/4 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-cream-100 rounded-3xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const kpis = metrics?.kpis || {};
  const recentEvents = metrics?.recentEvents || [];

  const cards = [
    {
      label: 'Room-to-Game Conversion',
      value: kpis.roomToGameConversion || '0%',
      desc: `${kpis.gamesStarted || 0} games / ${kpis.roomsCreated || 0} rooms`,
      icon: TrendingUp,
      color: 'bg-plum-100 text-plum-800',
    },
    {
      label: 'Game Completion Rate',
      value: kpis.gameCompletionRate || '0%',
      desc: `${kpis.gamesCompleted || 0} finished sessions`,
      icon: CheckCircle2,
      color: 'bg-emerald-50 text-emerald-800',
    },
    {
      label: 'Avg Questions Answered',
      value: kpis.avgQuestionsPerGame || '0.0',
      desc: `${kpis.totalQuestionsAnswered || 0} total player answers`,
      icon: Gamepad2,
      color: 'bg-lavender-100 text-lavender-800',
    },
    {
      label: 'AI Fallback / Failure Rate',
      value: kpis.aiFailureRate || '0%',
      desc: 'Seamless fallback active',
      icon: Brain,
      color: 'bg-coral-50 text-coral-800',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-plum-500 mb-1">
          <BarChart3 className="w-3.5 h-3.5 text-lavender-500" />
          <span>Product Engineering Analytics</span>
        </div>
        <h1 className="text-3xl font-serif font-bold text-plum-950">
          Live Product Metrics Dashboard
        </h1>
        <p className="text-sm text-plum-600 mt-1">
          Real database metrics aggregated across user registrations, room creation, game completion, and real-time Socket.IO events.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <Card key={i} className="p-6 bg-white border border-cream-200/90 shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-plum-500">{c.label}</span>
                <div className={`p-2 rounded-xl ${c.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-plum-950 font-serif">
                {c.value}
              </div>
              <p className="text-[11px] text-plum-400 mt-1 font-medium">{c.desc}</p>
            </Card>
          );
        })}
      </div>

      {/* Detailed Platform Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 p-6 bg-white border border-cream-200/90 shadow-soft space-y-4">
          <h3 className="text-sm font-bold text-plum-950 font-serif mb-2">
            Platform Totals
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-cream-200">
              <span className="text-plum-600">Total Registered Users</span>
              <span className="font-bold text-plum-950">{kpis.totalUsers || 0}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-cream-200">
              <span className="text-plum-600">Rooms Created</span>
              <span className="font-bold text-plum-950">{kpis.roomsCreated || 0}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-cream-200">
              <span className="text-plum-600">Invitations Accepted</span>
              <span className="font-bold text-plum-950">{kpis.invitationsAccepted || 0}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-cream-200">
              <span className="text-plum-600">Games Started</span>
              <span className="font-bold text-plum-950">{kpis.gamesStarted || 0}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-cream-200">
              <span className="text-plum-600">Games Completed</span>
              <span className="font-bold text-plum-950">{kpis.gamesCompleted || 0}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-plum-600">WebSocket Reconnect Recoveries</span>
              <span className="font-bold text-plum-950">{kpis.reconnectRecoveryCount || 0}</span>
            </div>
          </div>
        </Card>

        {/* Real-Time Product Event Audit Log */}
        <Card className="lg:col-span-2 p-6 bg-white border border-cream-200/90 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-plum-950 font-serif">
                Recent Product Events Log
              </h3>
              <p className="text-[11px] text-plum-400">
                Privacy-conscious audit log (no private answers ever logged)
              </p>
            </div>
            <Badge variant="lavender" size="sm">
              Live DB Events
            </Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-cream-300 text-plum-400">
                  <th className="py-2.5 font-semibold">Event Type</th>
                  <th className="py-2.5 font-semibold">Metadata Summary</th>
                  <th className="py-2.5 font-semibold text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200 text-plum-800">
                {recentEvents.map((e: any) => (
                  <tr key={e.id} className="hover:bg-cream-50/60">
                    <td className="py-2.5 font-mono text-[11px] text-plum-900 font-semibold">
                      {e.eventType}
                    </td>
                    <td className="py-2.5 text-plum-500 font-mono text-[10px] max-w-xs truncate">
                      {JSON.stringify(e.metadata)}
                    </td>
                    <td className="py-2.5 text-right text-plum-400 text-[11px] whitespace-nowrap">
                      {formatTimeAgo(e.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};
