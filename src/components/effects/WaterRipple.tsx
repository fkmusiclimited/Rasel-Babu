import React, { useEffect, useState } from 'react';

interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

export const WaterRipple: React.FC = () => {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Create ripple centered at click
      const newRipple: Ripple = {
        id: Date.now() + Math.random(),
        x: e.clientX,
        y: e.clientY,
        size: 180,
      };

      setRipples((prev) => [...prev.slice(-12), newRipple]);

      // Remove after animation finishes
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, 900);
    };

    window.addEventListener('pointerdown', handleClick, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', handleClick);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden select-none">
      {ripples.map((ripple) => (
        <div
          key={ripple.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: `${ripple.size}px`,
            height: `${ripple.size}px`,
          }}
        >
          {/* Outer primary water wave ring */}
          <div
            className="absolute inset-0 rounded-full border border-cyan-400/50 bg-gradient-to-r from-cyan-500/10 via-amber-400/15 to-blue-500/10 backdrop-blur-[0.5px] animate-water-wave"
            style={{
              boxShadow: '0 0 20px rgba(56, 189, 248, 0.35), inset 0 0 15px rgba(251, 191, 36, 0.25)',
            }}
          />

          {/* Secondary echoing ripple ring */}
          <div
            className="absolute inset-2 rounded-full border border-amber-300/40 animate-water-wave-secondary"
            style={{
              boxShadow: '0 0 12px rgba(251, 191, 36, 0.3)',
            }}
          />

          {/* Tertiary soft ambient outer ripple ring */}
          <div
            className="absolute -inset-2 rounded-full border border-sky-400/25 animate-water-wave-tertiary"
            style={{
              boxShadow: '0 0 25px rgba(56, 189, 248, 0.2)',
            }}
          />

          {/* Center droplet splash core */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-gradient-to-br from-white via-cyan-200 to-amber-300 animate-water-droplet shadow-md shadow-cyan-400/50" />
        </div>
      ))}
    </div>
  );
};
