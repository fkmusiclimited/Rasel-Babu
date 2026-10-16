import React from 'react';
import { useData } from '../../context/DataContext';
import { Play, Pause, Volume2, VolumeX, X, Disc3, Music2 } from 'lucide-react';

export const PersistentPlayer: React.FC = () => {
  const { activePlayer, togglePlayPause, setPlayerVolume, stopAudio } = useData();

  if (!activePlayer.track || !activePlayer.album) {
    return null;
  }

  const { track, album, isPlaying, volume, progress } = activePlayer;

  // Format seconds into mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const currentSec = (progress / 100) * track.durationSec;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0d0d12]/95 backdrop-blur-xl border-t border-amber-500/30 shadow-2xl shadow-black px-4 py-3 sm:px-6 animate-slide-up">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Track Info */}
        <div className="flex items-center gap-3 min-w-0 max-w-[240px] sm:max-w-xs">
          <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-zinc-800 border border-zinc-700">
            <img
              src={album.coverUrl}
              alt={album.title}
              referrerPolicy="no-referrer"
              className={`w-full h-full object-cover ${isPlaying ? 'animate-spin-slow' : ''}`}
            />
            {isPlaying && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <Disc3 className="w-5 h-5 text-amber-400 animate-spin" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-zinc-100 truncate">
              {track.title}
            </p>
            <p className="text-xs text-amber-400 truncate">
              Rasel Babu · {album.title}
            </p>
          </div>
        </div>

        {/* Center: Controls & Scrubber */}
        <div className="flex-1 max-w-xl flex flex-col items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlayPause}
              className="p-2.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black shadow-lg shadow-amber-500/25 transition-transform active:scale-95 cursor-pointer"
              title={isPlaying ? 'Pause' : 'Play'}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black ml-0.5" />}
            </button>
            <span className="text-[11px] font-mono text-zinc-400 hidden sm:inline">
              {isPlaying ? 'Synthesizing Audio Preview' : 'Paused'}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full flex items-center gap-2 mt-1">
            <span className="text-[10px] font-mono tabular-nums text-zinc-400">
              {formatTime(currentSec)}
            </span>
            <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-pink-500 transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[10px] font-mono tabular-nums text-zinc-400">
              {track.duration}
            </span>
          </div>
        </div>

        {/* Right side: Volume & Close */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => setPlayerVolume(volume > 0 ? 0 : 0.8)}
              className="text-zinc-400 hover:text-white"
            >
              {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setPlayerVolume(parseFloat(e.target.value))}
              className="w-18 accent-amber-400 cursor-pointer h-1 bg-zinc-800 rounded-lg"
            />
          </div>

          <button
            onClick={stopAudio}
            className="p-1.5 text-zinc-400 hover:text-white rounded-md hover:bg-zinc-800"
            title="Close Audio Bar"
            aria-label="Close Audio Bar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
