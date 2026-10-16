import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Mail } from 'lucide-react';

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
  onError?: (msg: string) => void;
  buttonText?: string;
  className?: string;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onSuccess,
  onError,
  buttonText = 'Sign in with Google',
  className = '',
}) => {
  const { loginWithGoogle } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGoogleSignIn = async (emailToUse: string, nameToUse: string) => {
    setIsSubmitting(true);
    const res = await loginWithGoogle({
      email: emailToUse,
      name: nameToUse,
    });
    setIsSubmitting(false);

    if (res.success) {
      setShowModal(false);
      onSuccess?.();
    } else {
      onError?.(res.message);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className={`w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700/80 hover:border-zinc-500 font-medium text-xs flex items-center justify-center gap-2.5 shadow-sm transition-all cursor-pointer ${className}`}
      >
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
          />
        </svg>
        <span>{buttonText}</span>
      </button>

      {/* Google Account Selection Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-2xl p-6 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <h3 className="font-display text-base font-bold text-white">Google Sign-In</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-zinc-500 hover:text-white text-xs cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs text-zinc-300">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                Choose or Enter Google Account:
              </span>

              {/* Verified Owner / Admin Fast Pick */}
              <button
                type="button"
                onClick={() => handleGoogleSignIn('fkbabu01@gmail.com', 'Rasel Babu (Executive)')}
                disabled={isSubmitting}
                className="w-full p-3 rounded-xl bg-zinc-950 hover:bg-zinc-800/80 border border-amber-500/30 text-left flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-amber-400/20 text-amber-400 font-bold flex items-center justify-center font-mono text-xs">
                    RB
                  </div>
                  <div>
                    <div className="font-semibold text-white text-xs">Rasel Babu</div>
                    <div className="text-[11px] text-zinc-400 font-mono">fkbabu01@gmail.com</div>
                  </div>
                </div>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-mono">
                  Primary Admin
                </span>
              </button>

              {/* Custom Google Account Form */}
              <div className="pt-2 border-t border-zinc-800 space-y-2.5">
                <label className="text-[11px] text-zinc-400 block font-medium flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <span>Or enter your Google Email address:</span>
                </label>
                <input
                  type="email"
                  required
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Your Full Name (Optional)"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={() => handleGoogleSignIn(customEmail.trim(), customName.trim() || customEmail.split('@')[0])}
                  disabled={isSubmitting || !customEmail.trim()}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold text-xs hover:from-amber-300 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-amber-400/20"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Authenticating...' : 'Sign In with This Google Account'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
