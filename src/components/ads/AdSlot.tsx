import React, { useEffect, useRef } from 'react';
import { useData } from '../../context/DataContext';
import { AdsterraConfig } from '../../types';

export type AdFormat = '728x90' | '468x60' | '300x250' | '160x600' | '320x50' | '160x300';

interface AdSlotProps {
  format: AdFormat;
  page: keyof AdsterraConfig['pagePlacements'];
  className?: string;
  adKeyOverride?: string;
  responsive?: boolean; // When true for 728x90, automatically serves 320x50 on mobile screens
}

interface FormatMeta {
  width: number;
  height: number;
  cssWidth: string;
  cssHeight: string;
  label: string;
  getKey: (config: AdsterraConfig) => string;
}

const FORMAT_CONFIG: Record<AdFormat, FormatMeta> = {
  '728x90': {
    width: 728,
    height: 90,
    cssWidth: 'w-full max-w-[728px]',
    cssHeight: 'h-[90px]',
    label: 'Leaderboard (728×90)',
    getKey: (cfg) => cfg.bannerKeys.leaderboard728x90 || '1fe9cd4f9a13d2eb6bf668247a7c5e55',
  },
  '468x60': {
    width: 468,
    height: 60,
    cssWidth: 'w-full max-w-[468px]',
    cssHeight: 'h-[60px]',
    label: 'Standard Banner (468×60)',
    getKey: (cfg) => cfg.bannerKeys.banner468x60 || '992e5c073cd17ad7d1ee02e15f6a74d7',
  },
  '300x250': {
    width: 300,
    height: 250,
    cssWidth: 'w-[300px]',
    cssHeight: 'h-[250px]',
    label: 'Medium Rectangle (300×250)',
    getKey: (cfg) => cfg.bannerKeys.mediumRectangle300x250 || 'dd011d8b361d79661b6de3d5632ce1d5',
  },
  '160x600': {
    width: 160,
    height: 600,
    cssWidth: 'w-[160px]',
    cssHeight: 'h-[600px]',
    label: 'Wide Skyscraper (160×600)',
    getKey: (cfg) => cfg.bannerKeys.skyscraper160x600 || 'ca15548b4e78cc2ea6271d78c0e5c208',
  },
  '320x50': {
    width: 320,
    height: 50,
    cssWidth: 'w-[320px]',
    cssHeight: 'h-[50px]',
    label: 'Mobile Banner (320×50)',
    getKey: (cfg) => cfg.bannerKeys.mobileBanner320x50 || 'a78db685879426319374cf7d5a8d7bed',
  },
  '160x300': {
    width: 160,
    height: 300,
    cssWidth: 'w-[160px]',
    cssHeight: 'h-[300px]',
    label: 'Half Skyscraper (160×300)',
    getKey: (cfg) => cfg.bannerKeys.halfSkyscraper160x300 || 'efd18937fec14299ab3536a4e698fd8b',
  },
};

export const AdSlot: React.FC<AdSlotProps> = ({
  format,
  page,
  className = '',
  adKeyOverride,
  responsive = false,
}) => {
  const { adsterraConfig } = useData();
  const containerRef = useRef<HTMLDivElement>(null);

  // 1-Click Master switch check & page-level toggle check
  const isAllowedOnPage = Boolean(
    adsterraConfig.enabled && adsterraConfig.pagePlacements?.[page]
  );

  const meta = FORMAT_CONFIG[format] || FORMAT_CONFIG['728x90'];
  const activeKey = adKeyOverride || meta.getKey(adsterraConfig);

  useEffect(() => {
    if (!isAllowedOnPage || adsterraConfig.testMode || !containerRef.current) return;

    const container = containerRef.current;
    container.innerHTML = '';

    // Create a sandboxed iframe to isolate atOptions and bicea.org scripts
    const iframe = document.createElement('iframe');
    iframe.width = `${meta.width}`;
    iframe.height = `${meta.height}`;
    iframe.style.width = `${meta.width}px`;
    iframe.style.height = `${meta.height}px`;
    iframe.style.maxWidth = '100%';
    iframe.style.border = 'none';
    iframe.style.overflow = 'hidden';
    iframe.setAttribute('scrolling', 'no');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('title', `Advertisement ${format}`);

    container.appendChild(iframe);

    // Write Adsterra script inside iframe document
    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <base target="_blank">
              <style>
                html, body {
                  margin: 0;
                  padding: 0;
                  width: ${meta.width}px;
                  height: ${meta.height}px;
                  overflow: hidden;
                  background: transparent;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                }
              </style>
            </head>
            <body>
              <script type="text/javascript">
                atOptions = {
                  'key' : '${activeKey}',
                  'format' : 'iframe',
                  'height' : ${meta.height},
                  'width' : ${meta.width},
                  'params' : {}
                };
              <\/script>
              <script type="text/javascript" src="https://bicea.org/22/${activeKey}"><\/script>
            </body>
          </html>
        `);
        doc.close();
      }
    } catch (err) {
      console.warn('Adsterra iframe injection notice:', err);
    }

    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [isAllowedOnPage, adsterraConfig.testMode, format, activeKey, meta.width, meta.height]);

  if (!isAllowedOnPage) {
    return null;
  }

  // If responsive is enabled on 728x90, render 728x90 on md+ and 320x50 on mobile
  if (responsive && format === '728x90') {
    return (
      <div className={`my-6 flex flex-col items-center justify-center overflow-hidden ${className}`}>
        <div className="hidden md:flex flex-col items-center justify-center w-full">
          <AdSlot format="728x90" page={page} adKeyOverride={adKeyOverride} responsive={false} />
        </div>
        <div className="flex md:hidden flex-col items-center justify-center w-full">
          <AdSlot format="320x50" page={page} adKeyOverride={adsterraConfig.bannerKeys.mobileBanner320x50} responsive={false} />
        </div>
      </div>
    );
  }

  return (
    <div className={`my-6 flex flex-col items-center justify-center overflow-hidden ${className}`}>
      {/* Policy-compliant subtle advertisement label */}
      <div className={`mb-1 flex items-center justify-between ${meta.cssWidth} px-1 select-none`}>
        <span className="text-[10px] font-mono tracking-wider uppercase text-zinc-500">
          Advertisement · Adsterra
        </span>
        <span className="text-[10px] font-mono text-zinc-600">
          {meta.label}
        </span>
      </div>

      {/* Ad Container */}
      <div
        className={`relative ${meta.cssWidth} min-h-[${meta.height}px] bg-gradient-to-br from-zinc-950/80 to-zinc-900/60 border border-zinc-800/80 rounded-xl flex items-center justify-center p-1 overflow-hidden transition-all duration-200 hover:border-amber-500/30`}
        style={{ minHeight: `${meta.height}px` }}
      >
        {adsterraConfig.testMode ? (
          /* Safe preview slot when test mode is enabled */
          <div
            className="w-full flex flex-col items-center justify-center px-4 py-2 bg-zinc-900/40 rounded-lg border border-dashed border-amber-500/30 select-none text-center"
            style={{ minHeight: `${meta.height - 8}px` }}
          >
            <div className="flex items-center gap-2 mb-0.5">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs font-semibold text-zinc-200 tracking-wide">
                Adsterra Monetization Slot
              </span>
              <span className="text-[9px] uppercase tracking-wider text-amber-400 bg-amber-950/50 border border-amber-500/40 px-1.5 py-0.5 rounded font-mono">
                {format}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 max-w-md truncate">
              Key: <span className="font-mono text-zinc-300">{activeKey}</span> · Clean Monetization Active
            </p>
          </div>
        ) : (
          /* Real Live Ad Iframe Container */
          <div ref={containerRef} className="w-full flex items-center justify-center overflow-hidden" />
        )}
      </div>
    </div>
  );
};
