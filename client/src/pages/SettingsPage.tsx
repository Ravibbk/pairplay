import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore.js';
import { Card } from '../components/common/Card.js';
import { Button } from '../components/common/Button.js';
import { Modal } from '../components/common/Modal.js';
import { api } from '../lib/api.js';
import {
  Settings,
  ShieldCheck,
  UserX,
  Trash2,
  Lock,
  LogOut,
  AlertTriangle,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, logout, updateUser } = useAuthStore();
  const navigate = useNavigate();

  const [unpairModalOpen, setUnpairModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleUnpair = async () => {
    setIsProcessing(true);
    try {
      await api.post('/auth/partner/disconnect');
      const refreshed = await api.get('/auth/me');
      updateUser(refreshed.user);
      setUnpairModalOpen(false);
      setMessage('Successfully uncoupled from partner.');
    } catch (err: any) {
      setMessage(`Failed to unpair: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsProcessing(true);
    try {
      await api.delete('/auth/account');
      await logout();
      navigate('/');
    } catch (err: any) {
      setMessage(`Failed to delete account: ${err.message}`);
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8 animate-fade-in">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-plum-500 mb-1">
          <Settings className="w-3.5 h-3.5 text-lavender-500" />
          <span>Account & Privacy</span>
        </div>
        <h1 className="text-3xl font-serif font-bold text-plum-950">
          Settings & Data Controls
        </h1>
        <p className="text-sm text-plum-600 mt-1">
          Manage your account security, partner pairing, and privacy preferences.
        </p>
      </div>

      {message && (
        <div className="p-3.5 rounded-2xl bg-cream-200 border border-cream-300 text-xs font-semibold text-plum-900 animate-fade-in">
          {message}
        </div>
      )}

      {/* Privacy Architecture Guarantee */}
      <Card className="p-6 sm:p-8 bg-white border border-cream-200/90 shadow-soft space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-bold font-serif text-plum-950">
            Privacy & Data Storage Guarantee
          </h2>
        </div>
        <div className="text-xs sm:text-sm text-plum-600 space-y-2.5 leading-relaxed">
          <p>
            <strong>What we store:</strong> Your display name, email, encrypted password hash, and the answers you submit during your private couples sessions.
          </p>
          <p>
            <strong>What we never do:</strong> We do not track your location, sell your responses, or expose your private answers to public feeds or analytics logs.
          </p>
          <p>
            <strong>Security:</strong> All game sessions are strictly server-authoritative and scoped to authenticated room members.
          </p>
        </div>
      </Card>

      {/* Partner Connection Management */}
      <Card className="p-6 sm:p-8 bg-white border border-cream-200/90 shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold font-serif text-plum-950">
              Partner Connection
            </h3>
            <p className="text-xs text-plum-500 mt-0.5">
              {user?.partner
                ? `Currently linked to ${user.partner.displayName}. Unpairing removes mutual room shortcuts.`
                : 'No partner is currently paired to this account.'}
            </p>
          </div>

          {user?.partner && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setUnpairModalOpen(true)}
              className="text-coral-600 border-coral-200 hover:bg-coral-50 self-start sm:self-center"
            >
              <UserX className="w-3.5 h-3.5" />
              Disconnect Partner
            </Button>
          )}
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="p-6 sm:p-8 bg-coral-50/40 border border-coral-200/70 shadow-soft space-y-6">
        <div>
          <h3 className="text-base font-bold font-serif text-coral-900">
            Danger Zone
          </h3>
          <p className="text-xs text-coral-700/80 mt-0.5">
            Irreversible actions regarding your account and saved session history.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-coral-200/60">
          <div>
            <div className="text-xs font-bold text-plum-900">Sign Out of All Sessions</div>
            <p className="text-[11px] text-plum-500">
              Clears authentication cookies and local device tokens.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => logout()}>
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-coral-200/60">
          <div>
            <div className="text-xs font-bold text-coral-900">Delete Account & Saved Data</div>
            <p className="text-[11px] text-coral-600">
              Permanently delete your user profile and decouple from your partner.
            </p>
          </div>
          <Button
            variant="coral"
            size="sm"
            onClick={() => setDeleteModalOpen(true)}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Account
          </Button>
        </div>
      </Card>

      {/* Unpair Modal */}
      <Modal
        isOpen={unpairModalOpen}
        onClose={() => setUnpairModalOpen(false)}
        title="Disconnect from Partner?"
        description="Are you sure you want to disconnect? You can always reconnect in the future using a new invite code."
      >
        <div className="pt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setUnpairModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="coral"
            onClick={handleUnpair}
            isLoading={isProcessing}
          >
            Confirm Disconnect
          </Button>
        </div>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Permanently Delete Account?"
        description="This action cannot be undone. All your profile data and relationship records will be erased."
      >
        <div className="pt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="coral"
            onClick={handleDeleteAccount}
            isLoading={isProcessing}
          >
            Yes, Permanently Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};
