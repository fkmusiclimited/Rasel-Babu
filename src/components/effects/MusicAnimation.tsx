import React, { useEffect, useState } from 'react';

interface FloatingMusicElement {
  id: number;
  symbol: string;
  left: number;
  delay: number;
  duration: number;
  size: number;
  color: string;
  rotate: number;
}

const MUSICAL_SYMBOLS = ['♪', '♫', '♬', '𝄞', '♩', '♭', '♯', '𝄢'];

const MUSICAL_COLORS = [
  'text-amber-400/40',
  'text-amber-300/45',
  'text-pink-400/35',
  'text-purple-400/30',
  'text-cyan-400/35',
  'text-yellow-300/40',
];

/**
 * Halka Music Type Animation (হালকা মিউজিক্যাল ব্যাকগ্রাউন্ড অ্যানিমেশন)
 * Replaces text watermarks with serene, professional floating music notes,
 * gentle acoustic waves, and ambient vinyl grooves across all website pages.
 */
export const MusicAnimation: React.FC = () => {
  const [elements, setElements] = useState<FloatingMusicElement[]>([]);

  useEffect(() => {
    // Generate a distributed array of floating musical notes across the screen
    const items: FloatingMusicElement[] = Array.from({ length: 16 }).map((_, i) => ({
      id: i,
      symbol: MUSICAL_SYMBOLS[i % MUSICAL_SYMBOLS.length],
      left: 4 + (i * 6) + ((i * 3.7) % 8),
      delay: -(i * 1.8), // negative delay so animation is already active on page load
      duration: 18 + (i % 7) * 2.5,
      size: 18 + (i % 5) * 6,
      color: MUSICAL_COLORS[i % MUSICAL_COLORS.length],
      rotate: ((i * 15) % 40) - 20,
    }));
    setElements(items);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none"
    >
      {/* 1. Subtle Background Vinyl Grooves (Top Right Corner - ultra-faint acoustic ring) */}
      <div
        className="absolute -top-32 -right-32 w-[38rem] h-[38rem] rounded-full border border-amber-400/5 opacity-40 pointer-events-none"
        style={{ animation: 'vinylSpinSlow 75s linear infinite' }}
      >
        <div className="absolute inset-8 rounded-full border border-amber-400/5" />
        <div className="absolute inset-20 rounded-full border border-pink-500/5" />
        <div className="absolute inset-36 rounded-full border border-cyan-400/5" />
        <div className="absolute inset-56 rounded-full border border-amber-300/5" />
      </div>

      {/* 2. Floating Melodic Notes (♪ ♫ ♬ 𝄞 ♩ ♭) across all pages */}
      {elements.map((note) => (
        <span
          key={note.id}
          className={`absolute font-serif select-none ${note.color}`}
          style={{
            left: `${note.left}%`,
            fontSize: `${note.size}px`,
            animation: `musicDrift ${note.duration}s ease-in-out infinite ${note.delay}s`,
            filter: 'drop-shadow(0 0 10px rgba(251, 191, 36, 0.25))',
            willChange: 'transform',
          }}
        >
          {note.symbol}
        </span>
      ))}

      {/* 3. Subtle Ambient Soundwave Equalizer Spectrum at Bottom (0.06 opacity) */}
      <div className="absolute bottom-0 left-0 right-0 h-16 flex items-end justify-between px-6 opacity-[0.06] overflow-hidden">
        {Array.from({ length: 36 }).map((_, i) => (
          <div
            key={i}
            className="w-1 sm:w-1.5 rounded-t-full bg-gradient-to-t from-amber-400 via-pink-400 to-cyan-400"
            style={{
              height: `${20 + ((i * 17) % 65)}%`,
              animation: `musicWaveGentle ${1.2 + ((i * 3) % 7) * 0.25}s ease-in-out infinite ${i * 0.1}s`,
              transformOrigin: 'bottom',
            }}
          />
        ))}
      </div>

      {/* 4. Soft Musical Staff Ribbon (Ultra-subtle flowing horizontal lines) */}
      <div
        className="absolute top-1/3 left-0 right-0 h-20 opacity-[0.035] flex flex-col justify-between"
        style={{ animation: 'musicStaffDrift 24s ease-in-out infinite' }}
      >
        <div className="h-[1px] bg-gradient-to-r from-transparent via-amber-400 to-transparent w-full" />
        <div className="h-[1px] bg-gradient-to-r from-transparent via-pink-400 to-transparent w-full" />
        <div className="h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent w-full" />
        <div className="h-[1px] bg-gradient-to-r from-transparent via-amber-300 to-transparent w-full" />
        <div className="h-[1px] bg-gradient-to-r from-transparent via-amber-400 to-transparent w-full" />
      </div>
    </div>
  );
};
