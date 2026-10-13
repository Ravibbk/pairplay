import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore.js';
import { Button } from './Button.js';
import {
  Heart,
  Sparkles,
  Gamepad2,
  BookOpen,
  BarChart3,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Link2,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: Gamepad2 },
    { name: 'Shared Memories', href: '/history', icon: BookOpen },
    { name: 'Product Analytics', href: '/analytics', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-cream-100/90 backdrop-blur-md border-b border-cream-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-plum-800 to-lavender-600 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform duration-200">
            <Heart className="w-5 h-5 fill-coral-400 text-coral-400" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-bold text-xl tracking-tight text-plum-950 group-hover:text-plum-700 transition-colors">
              PairPlay
            </span>
            <span className="text-[10px] tracking-wider uppercase font-semibold text-plum-400 -mt-1">
              Closer together
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        {isAuthenticated ? (
          <nav className="hidden md:flex items-center gap-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-plum-100 text-plum-900 font-semibold'
                      : 'text-plum-700 hover:text-plum-950 hover:bg-cream-200/60'
                  }`}
                >
                  <Icon className="w-4 h-4 opacity-75" />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        ) : (
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-plum-700">
            <a href="#how-it-works" className="hover:text-plum-950 transition-colors">
              How it works
            </a>
            <a href="#features" className="hover:text-plum-950 transition-colors">
              Features
            </a>
            <a href="#privacy" className="hover:text-plum-950 transition-colors">
              Privacy & Security
            </a>
          </nav>
        )}

        {/* Right Section: Auth & Profile */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              {/* Partner Status Pill */}
              {user.partner ? (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-lavender-50 border border-lavender-200 text-xs font-semibold text-plum-900">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>With {user.partner.displayName}</span>
                </div>
              ) : (
                <Link
                  to="/profile"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-coral-50 border border-coral-200 text-xs font-semibold text-coral-700 hover:bg-coral-100 transition-colors"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>Connect partner</span>
                </Link>
              )}

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1 rounded-2xl hover:bg-cream-200/80 transition-colors focus:outline-none"
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.displayName}
                      className="w-9 h-9 rounded-xl object-cover border border-plum-200"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-plum-800 text-white font-semibold flex items-center justify-center text-sm shadow-sm">
                      {user.displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-semibold text-plum-900 hidden lg:inline">
                    {user.displayName}
                  </span>
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-soft-lg border border-cream-300 py-1.5 z-50 animate-slide-up"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-cream-200">
                      <p className="text-xs font-semibold text-plum-950 truncate">
                        {user.displayName}
                      </p>
                      <p className="text-[11px] text-plum-400 font-mono mt-0.5">
                        Code: {user.partnerCode}
                      </p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-plum-800 hover:bg-cream-100 transition-colors"
                    >
                      <User className="w-3.5 h-3.5" />
                      Edit Profile & Partner
                    </Link>

                    <Link
                      to="/settings"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-plum-800 hover:bg-cream-100 transition-colors"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      Settings & Privacy
                    </Link>

                    <div className="border-t border-cream-200 my-1" />

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-coral-600 hover:bg-coral-50 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/auth?mode=login')}
              >
                Sign In
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/auth?mode=signup')}
              >
                Get Started Free
              </Button>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-plum-800 rounded-xl hover:bg-cream-200"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-cream-300 bg-cream-50 px-4 py-4 space-y-3">
          {isAuthenticated ? (
            <>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-plum-900 hover:bg-cream-200"
                >
                  <link.icon className="w-4 h-4" />
                  {link.name}
                </Link>
              ))}
              <div className="border-t border-cream-300 pt-3">
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-plum-800"
                >
                  <User className="w-4 h-4" />
                  Profile & Partner
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-plum-800"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-coral-600 mt-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/auth?mode=login');
                }}
              >
                Sign In
              </Button>
              <Button
                variant="primary"
                className="w-full"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/auth?mode=signup');
                }}
              >
                Get Started Free
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
