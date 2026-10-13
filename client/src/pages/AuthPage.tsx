import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Card } from '../components/common/Card.js';
import { Button } from '../components/common/Button.js';
import { Input } from '../components/common/Input.js';
import { useAuthStore } from '../stores/authStore.js';
import { Heart, Sparkles, UserCheck, ArrowRight, ShieldCheck } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, signup, isAuthenticated, error, clearError } = useAuthStore();

  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [partnerCode, setPartnerCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    const urlMode = searchParams.get('mode');
    if (urlMode === 'login' || urlMode === 'signup') {
      setMode(urlMode);
    }
  }, [searchParams]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await signup({
          email,
          password,
          displayName,
          partnerCodeToConnect: partnerCode.trim() || undefined,
        });
      }
      navigate('/dashboard');
    } catch (err: any) {
      setLocalError(err.message || 'Authentication failed. Please verify your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    clearError();
    setLocalError(null);
    setIsSubmitting(true);
    try {
      await login(demoEmail, 'LoveTogether123!');
      navigate('/dashboard');
    } catch (err: any) {
      setLocalError(err.message || 'Demo login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-plum-800 to-lavender-600 flex items-center justify-center text-white shadow-sm">
              <Heart className="w-5 h-5 fill-coral-400 text-coral-400" />
            </div>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-plum-950">
            {mode === 'login' ? 'Welcome back to PairPlay' : 'Create your couple space'}
          </h1>
          <p className="text-xs sm:text-sm text-plum-500">
            {mode === 'login'
              ? 'Sign in to continue playing with your partner'
              : 'Begin your journey with thoughtful questions and games'}
          </p>
        </div>

        {/* Auth Card */}
        <Card className="p-6 sm:p-8 bg-white border border-cream-300 shadow-soft-lg">
          {/* Mode Switcher Tabs */}
          <div className="flex p-1 bg-cream-100 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                clearError();
                setLocalError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'signup'
                  ? 'bg-white text-plum-950 shadow-sm'
                  : 'text-plum-600 hover:text-plum-950'
              }`}
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('login');
                clearError();
                setLocalError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'login'
                  ? 'bg-white text-plum-950 shadow-sm'
                  : 'text-plum-600 hover:text-plum-950'
              }`}
            >
              Log In
            </button>
          </div>

          {(localError || error) && (
            <div className="mb-4 p-3.5 rounded-2xl bg-coral-50 border border-coral-200 text-xs font-medium text-coral-700 animate-fade-in">
              {localError || error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <Input
                label="Your Display Name"
                placeholder="e.g. Alex"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            )}

            <Input
              type="email"
              label="Email Address"
              placeholder="alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              type="password"
              label="Password"
              placeholder={mode === 'signup' ? 'At least 8 chars, 1 uppercase, 1 number' : '••••••••'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              helperText={
                mode === 'signup'
                  ? 'Must have 8+ characters, 1 uppercase, 1 number'
                  : undefined
              }
              required
            />

            {mode === 'signup' && (
              <Input
                label="Partner Code (Optional)"
                placeholder="e.g. PAIR-SAMR (leave blank to invite later)"
                value={partnerCode}
                onChange={(e) => setPartnerCode(e.target.value.toUpperCase())}
                helperText="Enter your partner’s code to automatically link your accounts"
              />
            )}

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full font-semibold"
                isLoading={isSubmitting}
              >
                {mode === 'login' ? 'Sign In' : 'Create Account'}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </form>

          {/* Quick Demo Accounts for Portfolio Testing */}
          <div className="mt-6 pt-5 border-t border-cream-200">
            <div className="text-center mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-plum-400">
                1-Click Demo Testing
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleDemoLogin('alex@pairplay.app')}
                isLoading={isSubmitting}
                className="text-xs"
              >
                <UserCheck className="w-3.5 h-3.5 text-plum-700" />
                Login as Alex
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleDemoLogin('sam@pairplay.app')}
                isLoading={isSubmitting}
                className="text-xs"
              >
                <UserCheck className="w-3.5 h-3.5 text-lavender-700" />
                Login as Sam
              </Button>
            </div>
          </div>
        </Card>

        {/* Footer reassurance */}
        <div className="flex items-center justify-center gap-2 text-xs text-plum-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Encrypted passwords • Strictly private couples space</span>
        </div>
      </div>
    </div>
  );
};
