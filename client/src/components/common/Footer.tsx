import React from 'react';
import { Heart, ShieldCheck, Sparkles, Code2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-plum-950 text-cream-200 mt-20 border-t border-plum-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-lavender-500 flex items-center justify-center text-white">
                <Heart className="w-4 h-4 fill-white text-white" />
              </div>
              <span className="font-serif font-bold text-xl text-white">PairPlay</span>
            </div>
            <p className="text-sm text-plum-300 max-w-sm leading-relaxed">
              Closer, one game at a time. A playful, private, real-time web sanctuary for couples to bridge distances and rediscover each other.
            </p>
            <div className="flex items-center gap-2 text-xs text-lavender-300 pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Private — Strictly between you and your partner</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-lavender-200">
              Product
            </h4>
            <ul className="space-y-2 text-sm text-plum-300">
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors">
                  Couples Dashboard
                </Link>
              </li>
              <li>
                <Link to="/history" className="hover:text-white transition-colors">
                  Shared Memories
                </Link>
              </li>
              <li>
                <Link to="/analytics" className="hover:text-white transition-colors">
                  Live Analytics
                </Link>
              </li>
            </ul>
          </div>

          {/* Technology & Portfolio */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-lavender-200">
              Engineering & Stack
            </h4>
            <p className="text-xs text-plum-300 leading-relaxed">
              Engineered with React 18, Vite, TypeScript, Express, Socket.IO, PostgreSQL, Prisma ORM, and Google Gemini AI.
            </p>
            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-plum-900 border border-plum-800 text-[11px] text-lavender-300 font-mono">
                <Code2 className="w-3.5 h-3.5 text-lavender-400" />
                Designed for Kulfi Portfolio
              </span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-plum-900 flex flex-col sm:flex-row items-center justify-between text-xs text-plum-400 gap-4">
          <p>© {new Date().getFullYear()} PairPlay. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/settings" className="hover:text-plum-200 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/settings" className="hover:text-plum-200 transition-colors">
              Terms of Play
            </Link>
            <a
              href="https://github.com/Ravibbk/pairplay"
              target="_blank"
              rel="noreferrer"
              className="hover:text-plum-200 transition-colors"
            >
              GitHub Source
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
