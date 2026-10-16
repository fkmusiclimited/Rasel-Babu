import React, { useEffect, useRef } from 'react';
import { useData } from '../../context/DataContext';
import { AdsterraConfig } from '../../types';

export type AdFormat = '728x90' | '300x250' | '160x600' | '320x50' | '468x60';

interface AdSlotProps {
  format: AdFormat;
  page: keyof AdsterraConfig['pagePlacements'];
  className?: string;
  adKeyOverride?: string;
}

const AD_DIMENSIONS: Record<AdFormat, { width: string; height: string; minHeight: string; label: string }> = {
  '728x90': {
    width: 'max-w-[728px] w-full',
    height: 'h-[90px]',
    minHeight: 'min-h-[90px]',
    label: 'Leaderboard (728×90)',
  },
  '300x250': {
    width: 'w-[300px]',
    height: 'h-[250px]',
    minHeight: 'min-h-[250px]',
    label: 'Medium Rectangle (300×250)',
  },
  '160x600': {
    width: 'w-[160px]',
    height: 'h-[600px]',
    minHeight: 'min-h-[600px]',
    label: 'Skyscraper (160×600)',
  },
  '320x50': {
    width: 'w-[320px]',
    height: 'h-[50px]',
    minHeight: 'min-h-[50px]',
    label: 'Mobile Banner (320×50)',
  },
  '468x60': {
    width: 'max-w-[468px] w-full',
    height: 'h-[60px]',
    minHeight: 'min-h-[60px]',
    label: 'Banner (468×60)',
  },
};

export const AdSlot: React.FC<AdSlotProps> = ({ format, page, className = '', adKeyOverride }) => {
  const { adsterraConfig } = useData();
  const adContainerRef = useRef<HTMLDivElement>(null);

  // Check if globally enabled and allowed on this page
  const isAllowedOnPage = adsterraConfig.enabled && adsterraConfig.pagePlacements[page];

  const dim = AD_DIMENSIONS[format];
  const adKey = adKeyOverride || adsterraConfig.bannerKeys.leaderboard728x90;

  useEffect(() => {
    // If not allowed or in test mode, do not inject external third-party scripts
    if (!isAllowedOnPage || adsterraConfig.testMode || !adContainerRef.current) return;

    // Real Adsterra Script Injection Pipeline
    // Adsterra banners typically use an invoke script or iframe container
    const container = adContainerRef.current;
    const scriptId = `adsterra-slot-${format}-${adKey}`;

    // Clean previous scripts if any to prevent duplicate execution
    container.innerHTML = '';

    try {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.id = scriptId;
      script.async = true;
      // Adsterra publisher script invocation template
      script.src = `https://www.highperformanceformat.com/${adKey}/invoke.js`;
      container.appendChild(script);
    } catch (err) {
      console.warn('Adsterra script initialization deferred:', err);
    }

    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [isAllowedOnPage, adsterraConfig.testMode, format, adKey]);

  if (!isAllowedOnPage) {
    return null;
  }

  return (
    <div className={`my-6 flex flex-col items-center justify-center overflow-hidden ${className}`}>
      {/* Policy-compliant advertisement label */}
      <div className="mb-1 flex items-center justify-between w-full max-w-[728px] px-1">
        <span className="text-[10px] font-mono tracking-wider uppercase text-zinc-500">
          Advertisement · Adsterra Network
        </span>
        <span className="text-[10px] font-mono text-zinc-600">
          {dim.label}
        </span>
      </div>

      {/* Ad Container Box - Layout Shift Free */}
      <div
        className={`relative ${dim.width} ${dim.height} ${dim.minHeight} bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 border border-zinc-800/80 rounded-lg flex items-center justify-center p-2 text-center transition-all duration-200 hover:border-amber-500/30`}
      >
        {adsterraConfig.testMode ? (
          /* Compliant Preview / Monetization Slot when Live Publisher ID is in testing */
          <div className="w-full h-full flex flex-col items-center justify-center px-4 bg-zinc-900/40 rounded border border-dashed border-zinc-800/60 select-none">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-xs font-semibold text-zinc-200 tracking-wide">
                Adsterra Monetization Partner
              </span>
              <span className="text-[9px] uppercase tracking-wider text-amber-400/90 bg-amber-950/40 border border-amber-800/40 px-1.5 py-0.5 rounded">
                Verified Slot
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 max-w-md line-clamp-1">
              Official Artist Tour Sponsor & Streaming Audio Equipment · Clean Compliant Delivery
            </p>
            <div className="mt-1 flex items-center gap-3 text-[10px] text-zinc-500">
              <span>Slot: {format}</span>
              <span>·</span>
              <span>Pub ID: {adsterraConfig.publisherId}</span>
              <span>·</span>
              <span className="text-zinc-400">Zero Pop-Under Traps</span>
            </div>
          </div>
        ) : (
          /* Live Ad Container */
          <div ref={adContainerRef} className="w-full h-full flex items-center justify-center" />
        )}
      </div>
    </div>
  );
};
