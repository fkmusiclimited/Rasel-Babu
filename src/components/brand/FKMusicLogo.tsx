import React from 'react';

interface FKMusicLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showSubtitle?: boolean;
  variant?: 'full' | 'icon' | 'badge';
}

export const FKMusicLogo: React.FC<FKMusicLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
  variant = 'full',
}) => {
  const iconDimensions = {
    sm: 'w-9 h-9',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
    xl: 'w-28 h-28',
    '2xl': 'w-36 h-36',
  };

  const titleSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl',
    '2xl': 'text-4xl',
  };

  const subtitleSizes = {
    sm: 'text-[9px]',
    md: 'text-[11px]',
    lg: 'text-xs',
    xl: 'text-sm',
    '2xl': 'text-base',
  };

  return (
    <div className={`inline-flex items-center gap-3.5 select-none ${className}`}>
      {/* Official FK Music Limited Circular Badge (Exact replica of 000111.jpg) */}
      <div
        className={`relative ${iconDimensions[size]} rounded-full shrink-0 shadow-xl shadow-pink-900/40 transition-transform duration-300 hover:scale-105 overflow-hidden`}
      >
        <img
          src="/000111.svg"
          onError={(e) => {
            // Fallback if svg fails
            (e.currentTarget as HTMLImageElement).src = '/fk_music_logo.svg';
          }}
          alt="FK Music Limited Official Logo (000111)"
          className="w-full h-full object-contain"
        />
      </div>

      {variant !== 'icon' && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span
              className={`font-display font-black tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-white ${titleSizes[size]}`}
            >
              FK MUSIC
            </span>
            <span className="px-2 py-0.5 rounded-full bg-pink-950/80 border border-pink-500/40 text-pink-300 font-mono font-bold uppercase tracking-widest text-[9px]">
              LIMITED
            </span>
          </div>
          {showSubtitle && (
            <span
              className={`font-mono uppercase tracking-widest text-amber-200/80 font-medium ${subtitleSizes[size]}`}
            >
              Global Music Distribution &amp; Rights
            </span>
          )}
        </div>
      )}
    </div>
  );
};
