import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { KeyRound, CheckCircle2, AlertCircle, Lock, ShieldCheck, ArrowRight } from 'lucide-react';

interface ResetPasswordProps {
  onNavigate: (path: string) => void;
}

export const ResetPassword: React.FC<ResetPasswordProps> = ({ onNavigate }) => {
  const { verifyResetToken, resetPasswordWithToken } = useAuth();
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Extract query parameters from URL
    const params = new URLSearchParams(window.location.search);
    const qToken = params.get('token') || '';
    const qEmail = params.get('email') || '';

    setToken(qToken);
    setEmail(qEmail);

    if (!qToken || !qEmail) {
      setIsVerifying(false);
      setIsValidToken(false);
      setVerifyError('Missing password reset token or email address in link.');
      return;
    }

    verifyResetToken(qToken, qEmail).then((res) => {
      setIsVerifying(false);
      if (res.valid) {
        setIsValidToken(true);
      } else {
        setIsValidToken(false);
        setVerifyError(res.message || 'This password reset link is invalid, expired, or has already been used.');
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (newPassword.length < 6) {
      setSubmitError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setSubmitError('Passwords do not match. Please verify your entry.');
      return;
    }

    setSubmitting(true);
    const res = await resetPasswordWithToken(token, email, newPassword);
    setSubmitting(false);

    if (res.success) {
      setIsSuccess(true);
    } else {
      setSubmitError(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-mono uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Secure Password Reset</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-white">
            Set New Password / নতুন পাসওয়ার্ড
          </h1>
          <p className="text-xs text-zinc-400">
            Official Rasel Babu Artist Portal Security Verification
          </p>
        </div>

        {/* Verifying Token State */}
        {isVerifying && (
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-8 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-zinc-400">Validating single-use security token...</p>
          </div>
        )}

        {/* Invalid or Expired Token State */}
        {!isVerifying && !isValidToken && (
          <div className="bg-zinc-900/60 border border-red-500/40 rounded-2xl p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-white">Invalid or Expired Link</h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {verifyError}
            </p>
            <p className="text-[11px] text-zinc-500">
              For security, password reset links expire after 24 hours and can only be used once. Please contact artist management to generate a fresh reset link.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => onNavigate('/login')}
                className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium cursor-pointer transition-colors"
              >
                Return to Sign In
              </button>
            </div>
          </div>
        )}

        {/* Success State */}
        {!isVerifying && isSuccess && (
          <div className="bg-zinc-900/60 border border-emerald-500/40 rounded-2xl p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-display text-xl font-bold text-white">Password Reset Complete!</h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Your account password has been updated securely. You can now sign in with your new credentials.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => onNavigate('/login')}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-black font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-400/20"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Reset Form */}
        {!isVerifying && isValidToken && !isSuccess && (
          <form
            onSubmit={handleSubmit}
            className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl"
          >
            <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-xs">
              <span className="text-zinc-500 block uppercase text-[10px]">Account Email:</span>
              <span className="text-amber-300 font-mono font-medium">{email}</span>
            </div>

            {submitError && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>New Password (পাসওয়ার্ড)</span>
              </label>
              <input
                type="password"
                required
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>Confirm New Password (পাসওয়ার্ড নিশ্চিত করুন)</span>
              </label>
              <input
                type="password"
                required
                placeholder="Re-type new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-black font-bold text-xs tracking-wide transition-all shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{submitting ? 'Saving New Password...' : 'Save & Secure Account'}</span>
            </button>

            <div className="pt-2 text-center text-xs text-zinc-500">
              <button
                type="button"
                onClick={() => onNavigate('/login')}
                className="text-zinc-400 hover:text-white underline cursor-pointer"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
