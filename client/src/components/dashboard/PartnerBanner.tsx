import React, { useState } from 'react';
import { User } from '../../types/index.js';
import { Card } from '../common/Card.js';
import { Button } from '../common/Button.js';
import { Modal } from '../common/Modal.js';
import { Input } from '../common/Input.js';
import { api } from '../../lib/api.js';
import { useAuthStore } from '../../stores/authStore.js';
import { Heart, Link2, Copy, Check, Users, Sparkles } from 'lucide-react';

interface PartnerBannerProps {
  user: User;
}

export const PartnerBanner: React.FC<PartnerBannerProps> = ({ user }) => {
  const { updateUser } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [partnerCodeInput, setPartnerCodeInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(user.partnerCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerCodeInput.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      await api.post('/auth/partner/connect', { partnerCode: partnerCodeInput.trim() });
      const refreshed = await api.get('/auth/me');
      updateUser(refreshed.user);
      setIsModalOpen(false);
      setPartnerCodeInput('');
    } catch (err: any) {
      setError(err.message || 'Failed to connect partner. Please check the code.');
    } finally {
      setIsLoading(false);
    }
  };

  if (user.partner) {
    return (
      <Card className="bg-gradient-to-r from-plum-900 via-plum-800 to-lavender-900 text-white p-6 sm:p-8 rounded-4xl shadow-soft-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              {user.partner.avatarUrl ? (
                <img
                  src={user.partner.avatarUrl}
                  alt={user.partner.displayName}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-lavender-300 shadow-md"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-lavender-600 flex items-center justify-center font-bold text-xl text-white shadow-md">
                  {user.partner.displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-coral-500 border-2 border-plum-900 flex items-center justify-center text-white text-xs">
                <Heart className="w-3 h-3 fill-white" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold font-serif">
                  Connected with {user.partner.displayName}
                </h2>
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-xs sm:text-sm text-lavender-200 mt-1">
                Your private space is active. Every game, answer, and memory is synced directly between the two of you.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold backdrop-blur-sm transition-colors text-lavender-100"
              title="Copy your personal partner code"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Code: {user.partnerCode}</span>
            </button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-gradient-to-r from-plum-800 to-lavender-900 text-white p-6 sm:p-8 rounded-4xl shadow-soft-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2 text-coral-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Step 1 of 2: Invite Your Partner</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif">
              PairPlay works best with your favorite person
            </h2>
            <p className="text-xs sm:text-sm text-lavender-200 leading-relaxed">
              Share your personal invite code with your partner or enter theirs below to link your private couples dashboard.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-xs font-semibold backdrop-blur-sm transition-colors text-white"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>Your Code: {user.partnerCode}</span>
            </button>

            <Button
              variant="coral"
              size="md"
              onClick={() => setIsModalOpen(true)}
              className="font-semibold"
            >
              <Link2 className="w-4 h-4" />
              Enter Partner’s Code
            </Button>
          </div>
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Connect with Your Partner"
        description="Enter the 8-character partner code found on your partner's profile or invitation."
      >
        <form onSubmit={handleConnect} className="space-y-4 mt-2">
          {error && (
            <div className="p-3 rounded-2xl bg-coral-50 border border-coral-200 text-xs font-medium text-coral-700">
              {error}
            </div>
          )}

          <Input
            label="Partner Invitation Code"
            placeholder="e.g. PAIR-7X9B"
            value={partnerCodeInput}
            onChange={(e) => setPartnerCodeInput(e.target.value.toUpperCase())}
            required
            autoFocus
          />

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
            >
              Link Partner Account
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};
