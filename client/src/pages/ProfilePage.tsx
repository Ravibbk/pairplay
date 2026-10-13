import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore.js';
import { Card } from '../components/common/Card.js';
import { Button } from '../components/common/Button.js';
import { Input } from '../components/common/Input.js';
import { api } from '../lib/api.js';
import {
  User as UserIcon,
  Heart,
  Sparkles,
  Link2,
  Copy,
  Check,
  Save,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuthStore();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [loveLanguage, setLoveLanguage] = useState(user?.loveLanguage || 'Quality Time');
  const [interests, setInterests] = useState<string[]>(user?.interests || []);
  const [partnerCodeToLink, setPartnerCodeToLink] = useState('');

  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);

  if (!user) return null;

  const curatedAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=256&q=80',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80',
  ];

  const availableInterests = [
    'Travel & Roadtrips',
    'Deep Questions',
    'Cooking & Foodie',
    'Indie Music',
    'Board Games',
    'Movies & Cinema',
    'Camping & Nature',
    'Late Night Talks',
    'Photography',
  ];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(user.partnerCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleInterest = (tag: string) => {
    if (interests.includes(tag)) {
      setInterests(interests.filter((i) => i !== tag));
    } else {
      setInterests([...interests, tag]);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);
    try {
      const res = await api.put('/auth/profile', {
        displayName,
        bio,
        avatarUrl,
        loveLanguage,
        interests,
      });
      updateUser(res.user);
      setStatusMessage('Profile details saved successfully! ✨');
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLinkPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerCodeToLink.trim()) return;

    setIsLinking(true);
    setLinkError(null);
    try {
      await api.post('/auth/partner/connect', { partnerCode: partnerCodeToLink.trim() });
      const refreshed = await api.get('/auth/me');
      updateUser(refreshed.user);
      setPartnerCodeToLink('');
      setStatusMessage('Partner connected successfully! 🎉');
    } catch (err: any) {
      setLinkError(err.message || 'Failed to connect partner.');
    } finally {
      setIsLinking(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8 animate-fade-in">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-plum-500 mb-1">
          <UserIcon className="w-3.5 h-3.5 text-lavender-500" />
          <span>Profile & Couple Connection</span>
        </div>
        <h1 className="text-3xl font-serif font-bold text-plum-950">
          Personalize Your Space
        </h1>
        <p className="text-sm text-plum-600 mt-1">
          Update how you appear to your partner and customize your shared interests.
        </p>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 animate-fade-in">
          {statusMessage}
        </div>
      )}

      {/* Partner Connection Card */}
      <Card className="p-6 sm:p-8 bg-gradient-to-r from-plum-900 to-lavender-900 text-white shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-coral-300">
              Partner Synchronization
            </span>
            <h2 className="text-xl font-bold font-serif mt-1">
              {user.partner ? `Linked to ${user.partner.displayName}` : 'Connect with Your Partner'}
            </h2>
            <p className="text-xs text-lavender-200 mt-1 max-w-md">
              {user.partner
                ? 'Your accounts are securely linked. Every game, prompt, and answer is shared privately.'
                : 'Share your personal invite code with your partner or enter theirs below.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Code: {user.partnerCode}</span>
            </button>
          </div>
        </div>

        {!user.partner && (
          <form onSubmit={handleLinkPartner} className="mt-6 pt-5 border-t border-white/15 flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Enter Partner's Code (e.g. PAIR-7X9B)"
              value={partnerCodeToLink}
              onChange={(e) => setPartnerCodeToLink(e.target.value.toUpperCase())}
              className="flex-1 px-4 py-2.5 rounded-2xl bg-white text-plum-950 text-sm focus:outline-none"
              required
            />
            <Button type="submit" variant="coral" isLoading={isLinking}>
              <Link2 className="w-4 h-4" />
              Link Partner
            </Button>
            {linkError && (
              <p className="text-xs text-coral-300 mt-1 sm:w-full">{linkError}</p>
            )}
          </form>
        )}
      </Card>

      {/* Main Profile Form */}
      <Card className="p-6 sm:p-8 bg-white border border-cream-200/90 shadow-soft">
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />

            <div>
              <label className="text-xs font-semibold text-plum-900 tracking-wide block mb-1.5">
                Primary Love Language
              </label>
              <select
                value={loveLanguage}
                onChange={(e) => setLoveLanguage(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-cream-300 rounded-2xl text-sm text-plum-950 focus:outline-none focus:ring-2 focus:ring-plum-300"
              >
                <option value="Quality Time">Quality Time</option>
                <option value="Words of Affirmation">Words of Affirmation</option>
                <option value="Acts of Service">Acts of Service</option>
                <option value="Physical Touch">Physical Touch</option>
                <option value="Receiving Gifts">Receiving Gifts</option>
              </select>
            </div>
          </div>

          <Input
            label="Short Bio / Note"
            placeholder="A tiny note for your partner..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={180}
          />

          {/* Avatar selector */}
          <div>
            <label className="text-xs font-semibold text-plum-900 tracking-wide block mb-2">
              Choose Avatar
            </label>
            <div className="flex flex-wrap items-center gap-3">
              {curatedAvatars.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setAvatarUrl(url)}
                  className={`w-12 h-12 rounded-2xl overflow-hidden border-2 transition-all ${
                    avatarUrl === url
                      ? 'border-plum-800 ring-2 ring-plum-300 scale-105'
                      : 'border-cream-300 hover:border-plum-300 opacity-80 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt={`Avatar ${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Interest tags */}
          <div>
            <label className="text-xs font-semibold text-plum-900 tracking-wide block mb-2">
              Shared Topics & Interests (Used to tailor AI questions)
            </label>
            <div className="flex flex-wrap gap-2">
              {availableInterests.map((tag) => {
                const isSelected = interests.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleInterest(tag)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-plum-800 text-white shadow-sm'
                        : 'bg-cream-100 text-plum-700 hover:bg-cream-200'
                    }`}
                  >
                    {tag} {isSelected ? '✓' : '+'}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-cream-200 flex justify-end">
            <Button type="submit" variant="primary" size="lg" isLoading={isSaving}>
              <Save className="w-4 h-4" />
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
