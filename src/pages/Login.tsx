import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, AlertCircle, KeyRound, Sparkles, Mail } from 'lucide-react';
import { GoogleSignInButton } from '../components/auth/GoogleSignInButton';

interface LoginProps {
  onNavigate: (path: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onNavigate }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPendingNotice, setIsPendingNotice] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsPendingNotice(false);

    if (!email || !password) {
      setError('Please provide both your registered email and password.');
      return;
    }

    setIsLoading(true);
    const res = await login(email, password);
    setIsLoading(false);

    if (!res.success) {
      if (res.user?.status === 'pending') {
        setIsPendingNotice(true);
      } else {
        setError(res.message);
      }
    } else {
      if (res.user?.role === 'admin' || res.user?.role === 'manager') {
        onNavigate('/admin');
      } else {
        onNavigate('/dashboard');
      }
    }
  };

  const handleGoogleSuccess = () => {
    onNavigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-mono uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Official Portal Access</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white">
            Sign In / লগইন
          </h1>
          <p className="text-xs text-zinc-400">
            Access Fan Member Dashboard or Executive Administration Panel
          </p>
        </div>

        {/* Pending Review Notice Box */}
        {isPendingNotice && (
          <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs space-y-2 animate-fade-in">
            <div className="flex items-center gap-2 font-semibold">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Registration Status: Pending Administrator Review</span>
            </div>
            <p className="leading-relaxed">
              Your registration has been recorded and is currently waiting for approval from artist management. Protected fan dashboard access will be unlocked as soon as an administrator verifies your application.
            </p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-5 shadow-xl">
          
          {/* Google Sign-In Button */}
          <div className="space-y-3">
            <GoogleSignInButton
              buttonText="Continue with Google Account"
              onSuccess={handleGoogleSuccess}
              onError={(msg) => setError(msg)}
            />

            <div className="relative flex items-center justify-center">
              <div className="border-t border-zinc-800 w-full" />
              <span className="bg-zinc-900 px-3 text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
                or sign in with email
              </span>
              <div className="border-t border-zinc-800 w-full" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">
                Email Address / ইমেইল অ্যাড্রেস
              </label>
              <input
                type="email"
                required
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-zinc-300">
                  Password / পাসওয়ার্ড
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-black font-bold text-xs tracking-wide transition-all shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{isLoading ? 'Verifying Credentials...' : 'Sign In to Your Account'}</span>
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-zinc-400 border-t border-zinc-800/60">
            Don't have an account yet?{' '}
            <button
              type="button"
              onClick={() => onNavigate('/signup')}
              className="text-amber-400 hover:underline font-medium ml-1 cursor-pointer"
            >
              Request Fan Registration
            </button>
          </div>
        </div>

      </div>

      {/* Forgot Password Guidance Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2 text-amber-400">
                <KeyRound className="w-5 h-5" />
                <h3 className="font-display text-base font-bold text-white">Password Recovery</h3>
              </div>
              <button
                onClick={() => setShowForgotModal(false)}
                className="text-zinc-500 hover:text-white text-xs cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs text-zinc-300">
              <p>
                To maintain artist community security, user password resets are issued through secure, encrypted single-use email links initiated by site administration.
              </p>
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <span>How to reset your password:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-zinc-400 text-[11px]">
                  <li>Contact artist management at <span className="text-amber-300 select-all font-mono">raselbabu@fkmusicltd.com</span></li>
                  <li>An administrator verifies your identity and generates a secure reset link.</li>
                  <li>Click the link sent to your registered email to set your new password.</li>
                </ol>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
