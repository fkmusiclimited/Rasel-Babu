import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Bell, X, ExternalLink, Sparkles } from 'lucide-react';

export const SocialBarAd: React.FC = () => {
  const { adsterraConfig } = useData();
  const [dismissed, setDismissed] = useState(false);

  if (!adsterraConfig.enabled || !adsterraConfig.socialBarEnabled || dismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-24 right-4 z-40 max-w-sm w-[90vw] sm:w-88 animate-fade-in">
      <div className="relative bg-zinc-900/95 backdrop-blur-md border border-amber-500/30 rounded-xl p-3.5 shadow-2xl shadow-black/80 flex items-start gap-3">
        {/* Close Button */}
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-2 right-2 p-1 text-zinc-400 hover:text-white rounded-md hover:bg-zinc-800 transition-colors"
          title="Dismiss notification"
          aria-label="Dismiss notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500/20 to-pink-500/20 border border-amber-500/30 text-amber-400 shrink-0">
          <Bell className="w-4 h-4 animate-bounce" />
        </div>

        <div className="flex-1 pr-4">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400">
              Adsterra Social Bar
            </span>
            <span className="text-[10px] text-zinc-500">· Sponsored</span>
          </div>
          <p className="text-xs font-semibold text-zinc-100 leading-snug">
            Rasel Babu "Shonar Sure" 2026 Tour VIP Passes
          </p>
          <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
            Exclusive early access acoustic sessions & front-row stadium reservation perks.
          </p>

          <div className="mt-2.5 flex items-center gap-2">
            <a
              href="#booking"
              onClick={() => setDismissed(true)}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-black bg-amber-400 hover:bg-amber-300 px-2.5 py-1 rounded transition-colors"
            >
              <Sparkles className="w-3 h-3" />
              Check Availability
            </a>
            <button
              onClick={() => setDismissed(true)}
              className="text-[11px] text-zinc-400 hover:text-zinc-200 px-2 py-1"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
