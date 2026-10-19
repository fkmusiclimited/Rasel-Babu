import React, { useEffect, useState } from 'react';
import { useData } from '../../context/DataContext';
import { Bell, X, Sparkles } from 'lucide-react';

export const SocialBarAd: React.FC = () => {
  const { adsterraConfig } = useData();
  const [previewDismissed, setPreviewDismissed] = useState(false);

  // 1-Click Master Control check + Social Bar specific switch
  const isEnabled = Boolean(adsterraConfig.enabled && adsterraConfig.socialBarEnabled);

  useEffect(() => {
    const scriptId = 'adsterra-socialbar-real-script';

    // If disabled or in preview mode, remove real script
    if (!isEnabled || adsterraConfig.testMode) {
      const existing = document.getElementById(scriptId);
      if (existing) existing.remove();
      return;
    }

    // Inject real Adsterra Social Bar script from bicea.org
    const activeKey = adsterraConfig.bannerKeys.socialBarKey || 'b1064cd1b5e0c41b0e67eb50417ae390';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'text/javascript';
      script.setAttribute('data-cfasync', 'false');
      script.src = `https://bicea.org/14/${activeKey}`;
      document.body.appendChild(script);
    }

    return () => {
      const el = document.getElementById(scriptId);
      if (el) el.remove();
    };
  }, [isEnabled, adsterraConfig.testMode, adsterraConfig.bannerKeys.socialBarKey]);

  if (!isEnabled) {
    return null;
  }

  // If in test/preview mode, show a preview notification badge
  if (adsterraConfig.testMode && !previewDismissed) {
    return (
      <div className="fixed bottom-24 right-4 z-40 max-w-sm w-[90vw] sm:w-88 animate-fade-in">
        <div className="relative bg-zinc-900/95 backdrop-blur-md border border-amber-500/30 rounded-xl p-3.5 shadow-2xl shadow-black/80 flex items-start gap-3">
          <button
            onClick={() => setPreviewDismissed(true)}
            className="absolute top-2 right-2 p-1 text-zinc-400 hover:text-white rounded-md hover:bg-zinc-800 transition-colors"
            title="Dismiss preview"
            aria-label="Dismiss preview"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500/20 to-pink-500/20 border border-amber-500/30 text-amber-400 shrink-0">
            <Bell className="w-4 h-4 animate-bounce" />
          </div>

          <div className="flex-1 pr-4">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400">
                Adsterra Social Bar (Preview)
              </span>
              <span className="text-[10px] text-zinc-500">· Active</span>
            </div>
            <p className="text-xs font-semibold text-zinc-100 leading-snug">
              Official Social Bar Script Verified
            </p>
            <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed font-mono">
              bicea.org/14/{adsterraConfig.bannerKeys.socialBarKey || 'b1064cd1b5e0c41b0e67eb50417ae390'}
            </p>

            <div className="mt-2 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded">
                <Sparkles className="w-3 h-3" /> Live Ready
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
