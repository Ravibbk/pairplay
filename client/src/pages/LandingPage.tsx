import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button.js';
import { Card } from '../components/common/Card.js';
import { Badge } from '../components/common/Badge.js';
import {
  Heart,
  Sparkles,
  Gamepad2,
  Lock,
  ArrowRight,
  ShieldCheck,
  Zap,
  Users,
  Smile,
  Compass,
  CalendarHeart,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [demoRevealed, setDemoRevealed] = useState(false);

  return (
    <div className="min-h-screen bg-cream-100 selection:bg-lavender-200 selection:text-plum-900">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-32 overflow-hidden">
        {/* Subtle background ambient gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-lavender-200/40 via-plum-100/30 to-coral-100/40 blur-3xl -z-10 rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-lavender-100/80 border border-lavender-200/60 text-xs font-bold text-plum-900 mb-6 shadow-sm animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-lavender-600" />
            <span>A playful, private real-time experience for couples</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-bold text-plum-950 tracking-tight leading-[1.1] max-w-4xl mx-auto">
            Closer, one game <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-plum-800 via-plum-600 to-coral-500">
              at a time.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-plum-600 max-w-2xl mx-auto leading-relaxed">
            PairPlay connects couples through private, interactive questions and real-time reveals. Answer independently, discover each other’s thoughts, and rediscover intimacy wherever you are.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/auth?mode=signup')}
              className="w-full sm:w-auto shadow-md shadow-plum-900/10"
            >
              Start Playing Free
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/auth?mode=login')}
              className="w-full sm:w-auto"
            >
              Sign In to Your Space
            </Button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-xs text-plum-500 font-medium">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              100% Private Room
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              Live Real-Time Sync
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-lavender-600" />
              AI & Curated Prompts
            </span>
          </div>

          {/* Interactive Interactive Preview Card */}
          <div className="mt-14 max-w-3xl mx-auto">
            <Card className="bg-white/90 backdrop-blur-md border border-cream-300 shadow-soft-lg p-6 sm:p-8 text-left rounded-4xl">
              <div className="flex items-center justify-between border-b border-cream-200 pb-4 mb-5">
                <div className="flex items-center gap-2.5">
                  <Badge variant="plum" size="sm">
                    Interactive Preview
                  </Badge>
                  <span className="text-xs text-plum-400 font-medium">
                    Question 2 of 5 • Deep Connections
                  </span>
                </div>
                <button
                  onClick={() => setDemoRevealed(!demoRevealed)}
                  className="text-xs font-bold text-plum-700 hover:text-plum-950 flex items-center gap-1 transition-colors bg-lavender-50 px-3 py-1 rounded-full border border-lavender-200"
                >
                  {demoRevealed ? 'Hide Answers 🔒' : 'Simulate Reveal ✨'}
                </button>
              </div>

              <h3 className="text-xl sm:text-2xl font-serif font-bold text-plum-950 mb-6">
                “If we had an entire week completely off with zero obligations, what would our dream itinerary look like?”
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Player 1 Card */}
                <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-plum-800 text-white font-bold text-xs flex items-center justify-center">
                      A
                    </div>
                    <span className="text-xs font-bold text-plum-900">Alex</span>
                  </div>
                  <p className="text-sm text-plum-800 leading-relaxed">
                    {demoRevealed
                      ? 'Rent a quiet seaside cottage in Maine, cook seafood together every night, and read books with no alarms.'
                      : '•••••••••••••••••••••••••••• (Locked until both reveal)'}
                  </p>
                </div>

                {/* Player 2 Card */}
                <div className="p-4 rounded-2xl bg-lavender-50/70 border border-lavender-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-lavender-600 text-white font-bold text-xs flex items-center justify-center">
                      S
                    </div>
                    <span className="text-xs font-bold text-plum-900">Sam</span>
                  </div>
                  <p className="text-sm text-plum-800 leading-relaxed font-medium">
                    {demoRevealed
                      ? 'Drive up the coast, find a cozy cabin with a fireplace, drink morning coffee on the porch, and completely unplug.'
                      : '•••••••••••••••••••••••••••• (Locked until both reveal)'}
                  </p>
                </div>
              </div>

              {demoRevealed && (
                <div className="mt-4 pt-3 border-t border-cream-200 flex items-center justify-between text-xs text-emerald-700 font-medium animate-fade-in">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Answers revealed simultaneously! Both wanted seaside cabin trips.
                  </span>
                  <span className="text-base">❤️ 😂 ✨</span>
                </div>
              )}
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-cream-50 border-y border-cream-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="plum" size="sm" className="mb-3">
            Simple & Effortless
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-plum-950">
            How PairPlay Works
          </h2>
          <p className="mt-3 text-sm sm:text-base text-plum-500 max-w-xl mx-auto">
            Designed specifically for two people. No public feed, no third wheels, no distractions.
          </p>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <Card className="p-8 bg-white border border-cream-300 text-left relative flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-plum-100 text-plum-800 flex items-center justify-center font-bold text-lg mb-6">
                  01
                </div>
                <h3 className="text-xl font-bold font-serif text-plum-950 mb-2">
                  Create a Private Room
                </h3>
                <p className="text-xs sm:text-sm text-plum-500 leading-relaxed">
                  Generate a secure 6-character room code. Send it to your partner via message, and you’ll enter the same private space instantly.
                </p>
              </div>
            </Card>

            {/* Step 2 */}
            <Card className="p-8 bg-white border border-cream-300 text-left relative flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-lavender-100 text-lavender-800 flex items-center justify-center font-bold text-lg mb-6">
                  02
                </div>
                <h3 className="text-xl font-bold font-serif text-plum-950 mb-2">
                  Answer Privately
                </h3>
                <p className="text-xs sm:text-sm text-plum-500 leading-relaxed">
                  Both of you receive the exact same question. Take your time to write your honest answer without being influenced by what your partner writes.
                </p>
              </div>
            </Card>

            {/* Step 3 */}
            <Card className="p-8 bg-white border border-cream-300 text-left relative flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-coral-100 text-coral-800 flex items-center justify-center font-bold text-lg mb-6">
                  03
                </div>
                <h3 className="text-xl font-bold font-serif text-plum-950 mb-2">
                  Reveal & Discover
                </h3>
                <p className="text-xs sm:text-sm text-plum-500 leading-relaxed">
                  The moment both answers are submitted, the server reveals them simultaneously. React in real time, laugh, and discuss your discoveries.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge variant="lavender" size="sm" className="mb-3">
            Core Features
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-plum-950">
            Tailored for Genuine Remote Connection
          </h2>
          <p className="mt-3 text-sm sm:text-base text-plum-500">
            Everything you need to turn a quiet evening into a memorable, laugh-filled date night.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 bg-white border border-cream-200">
            <div className="w-10 h-10 rounded-2xl bg-plum-100 text-plum-800 flex items-center justify-center mb-4">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-plum-950 mb-1.5 font-serif">
              “How Well Do You Know Me?”
            </h3>
            <p className="text-xs text-plum-500 leading-relaxed">
              Curated rounds across fun quirks, memories, life goals, and deep connection.
            </p>
          </Card>

          <Card className="p-6 bg-white border border-cream-200">
            <div className="w-10 h-10 rounded-2xl bg-lavender-100 text-lavender-800 flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-plum-950 mb-1.5 font-serif">
              AI Daily Spark
            </h3>
            <p className="text-xs text-plum-500 leading-relaxed">
              Smart LLM-powered prompts tailored to your shared interests, with a rock-solid curated fallback.
            </p>
          </Card>

          <Card className="p-6 bg-white border border-cream-200">
            <div className="w-10 h-10 rounded-2xl bg-coral-100 text-coral-800 flex items-center justify-center mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-plum-950 mb-1.5 font-serif">
              Real-Time WebSocket Sync
            </h3>
            <p className="text-xs text-plum-500 leading-relaxed">
              Instant answer locking, synchronized reveals, presence status, and live emoji reactions.
            </p>
          </Card>

          <Card className="p-6 bg-white border border-cream-200">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-4">
              <CalendarHeart className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-plum-950 mb-1.5 font-serif">
              Shared Memories Archive
            </h3>
            <p className="text-xs text-plum-500 leading-relaxed">
              Every completed game is safely archived so you can look back on your relationship journey anytime.
            </p>
          </Card>
        </div>
      </section>

      {/* Privacy Guarantee Section */}
      <section id="privacy" className="py-20 bg-plum-950 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="w-14 h-14 rounded-3xl bg-lavender-500/20 border border-lavender-400/30 text-lavender-300 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-serif font-bold">
            Your Conversations Belong Only to the Two of You
          </h2>

          <p className="text-sm sm:text-base text-plum-200 max-w-2xl mx-auto leading-relaxed">
            PairPlay is built on a private-first architecture. There is no social feed, no public directory, no ads, and no selling of your personal thoughts. Every game session is strictly scoped to your private authenticated room.
          </p>

          <div className="pt-4">
            <Button
              variant="coral"
              size="lg"
              onClick={() => navigate('/auth?mode=signup')}
              className="font-semibold"
            >
              Start Your Private Space Today
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
