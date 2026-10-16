import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserPlus, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { GoogleSignInButton } from '../components/auth/GoogleSignInButton';

interface SignupProps {
  onNavigate: (path: string) => void;
}

export const Signup: React.FC<SignupProps> = ({ onNavigate }) => {
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    bio: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!formData.name || !formData.email || !formData.password) {
      setError('Please provide full name, email, and password.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    const res = await signup(formData.name, formData.email, formData.password, formData.phone, formData.bio);
    setIsLoading(false);

    if (!res.success) {
      setError(res.message);
    } else {
      setSuccessMessage(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="text-xs font-mono uppercase tracking-widest text-amber-400">
            Exclusive Artist Community
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white">
            Register for Member Access
          </h1>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Join the verified Rasel Babu community. Note: All new registrations are subject to manual administrative review.
          </p>
        </div>

        {/* Approval Protocol Notice */}
        <div className="p-4 rounded-xl bg-zinc-900/80 border border-amber-500/30 flex items-start gap-3 text-xs text-zinc-300">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-white">Admin Approval Required</p>
            <p className="text-zinc-400 leading-relaxed">
              To protect community authenticity and prevent spam, new accounts remain in <span className="text-amber-400 font-mono">PENDING</span> status until verified by artist management. Once approved, full member features become active.
            </p>
          </div>
        </div>

        {/* Success Banner */}
        {successMessage ? (
          <div className="bg-zinc-900/60 border border-emerald-500/40 rounded-2xl p-6 sm:p-8 space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="font-display text-2xl font-bold text-white">
              Application Submitted
            </h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {successMessage}
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
              <button
                onClick={() => onNavigate('/login')}
                className="px-5 py-2.5 rounded-xl bg-amber-400 text-black font-semibold text-xs hover:bg-amber-300 transition-colors cursor-pointer"
              >
                Proceed to Sign In
              </button>
              <button
                onClick={() => onNavigate('/')}
                className="px-5 py-2.5 rounded-xl bg-zinc-800 text-zinc-200 text-xs hover:bg-zinc-700 transition-colors cursor-pointer"
              >
                Return to Home
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-3">
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block text-center">
                Quick Registration with Google:
              </span>
              <GoogleSignInButton
                buttonText="Register with Google Identity"
                onSuccess={() => onNavigate('/dashboard')}
                onError={(msg) => setError(msg)}
              />
            </div>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-zinc-800 w-full" />
              <span className="bg-[#08080a] px-3 text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
                or complete application form
              </span>
              <div className="border-t border-zinc-800 w-full" />
            </div>

            <form onSubmit={handleSubmit} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
              {error && (
                <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">
                  Full Name <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Farhan Kabir"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">
                  Email Address <span className="text-amber-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                placeholder="+880 1XXXXXXXXX"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">
                  Password <span className="text-amber-400">*</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">
                  Confirm Password <span className="text-amber-400">*</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="Repeat password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">
                Why would you like to join? (Fan note / Media background)
              </label>
              <textarea
                rows={2}
                placeholder="Share your favorite song or why you are applying for access..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-semibold text-xs tracking-wide transition-all shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{isLoading ? 'Submitting Application...' : 'Submit Registration for Review'}</span>
            </button>

            <div className="pt-2 text-center text-xs text-zinc-400">
              Already registered?{' '}
              <button
                type="button"
                onClick={() => onNavigate('/login')}
                className="text-amber-400 hover:underline font-medium ml-1 cursor-pointer"
              >
                Sign In Instead
              </button>
            </div>
          </form>
        </div>
      )}
      </div>
    </div>
  );
};
