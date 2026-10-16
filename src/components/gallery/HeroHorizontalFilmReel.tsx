import React, { useState, useEffect, useCallback } from 'react';
import { useData } from '../../context/DataContext';
import { PhotoItem } from '../../types';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Heart,
  Eye,
  MapPin,
  Calendar,
  Camera,
  ArrowRight,
  Film,
  Sparkles,
} from 'lucide-react';

interface HeroHorizontalFilmReelProps {
  onNavigate: (path: string, param?: string) => void;
}

export const HeroHorizontalFilmReel: React.FC<HeroHorizontalFilmReelProps> = ({ onNavigate }) => {
  const { photos, likePhoto, incrementPhotoViews } = useData();

  // Selected photo for Lightbox modal
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Use all gallery photos, and double the array for seamless infinite marquee loop (0% to -50%)
  const displayPhotos = photos.length > 0 ? photos : [];
  const loopedPhotos = [...displayPhotos, ...displayPhotos];

  const handleOpenLightbox = (photo: PhotoItem) => {
    incrementPhotoViews(photo.id);
    const index = photos.findIndex((p) => p.id === photo.id);
    setSelectedPhotoIndex(index !== -1 ? index : 0);
  };

  const handleCloseLightbox = () => {
    setSelectedPhotoIndex(null);
  };

  const handleNextPhoto = useCallback(() => {
    if (selectedPhotoIndex === null) return;
    const nextIdx = (selectedPhotoIndex + 1) % photos.length;
    incrementPhotoViews(photos[nextIdx].id);
    setSelectedPhotoIndex(nextIdx);
  }, [selectedPhotoIndex, photos, incrementPhotoViews]);

  const handlePrevPhoto = useCallback(() => {
    if (selectedPhotoIndex === null) return;
    const prevIdx = (selectedPhotoIndex - 1 + photos.length) % photos.length;
    incrementPhotoViews(photos[prevIdx].id);
    setSelectedPhotoIndex(prevIdx);
  }, [selectedPhotoIndex, photos, incrementPhotoViews]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (selectedPhotoIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleCloseLightbox();
      if (e.key === 'ArrowRight') handleNextPhoto();
      if (e.key === 'ArrowLeft') handlePrevPhoto();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhotoIndex, handleNextPhoto, handlePrevPhoto]);

  const activePhoto = selectedPhotoIndex !== null ? photos[selectedPhotoIndex] : null;

  if (displayPhotos.length === 0) return null;

  return (
    <div className="w-full pt-5 pb-2">
      {/* Film Reel Label / Status bar */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-300">
          <Film className="w-3.5 h-3.5 text-white" />
          <span className="font-semibold text-white tracking-wider uppercase">35mm Motion Film Reel</span>
          <span className="text-zinc-400">·</span>
          <span className="text-zinc-400 text-[10px]">Photo Strip</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-zinc-400 hidden sm:inline">
            Hover to pause · Click frame to view
          </span>
          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/80 cursor-pointer"
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>
        </div>
      </div>

      {/* Cinematic White-Border Horizontal Film Strip (Matches user sketch) */}
      <div
        className="relative w-full overflow-hidden rounded-xl bg-black border-2 border-white/90 shadow-2xl shadow-black pause-on-hover"
        title="Continuous 35mm Artist Film Reel (Hover to hold frame)"
      >
        {/* Left & Right gradient vignettes for seamless cinematic edges */}
        <div className="absolute left-0 inset-y-0 w-8 bg-gradient-to-r from-black via-black/80 to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 inset-y-0 w-8 bg-gradient-to-l from-black via-black/80 to-transparent z-20 pointer-events-none" />

        {/* Top Sprocket Perforations Row */}
        <div className="relative z-10 w-full py-1.5 px-2 bg-black border-b border-white/40 flex items-center justify-between overflow-hidden pointer-events-none select-none">
          <div className="flex items-center gap-3 w-full justify-around opacity-75">
            {Array.from({ length: 40 }).map((_, i) => (
              <div key={`top-sprocket-${i}`} className="film-sprocket-hole-h" />
            ))}
          </div>
        </div>

        {/* Animated Horizontal Track */}
        <div
          className={`flex items-center py-2 bg-[#060608] ${
            isPaused ? '[animation-play-state:paused!important]' : 'animate-film-horizontal'
          }`}
          style={{ width: 'max-content' }}
        >
          {loopedPhotos.map((photo, index) => {
            const frameNum = `${(index % displayPhotos.length) + 1}A`;

            return (
              <div
                key={`${photo.id}-${index}`}
                onClick={() => handleOpenLightbox(photo)}
                className="group relative shrink-0 mx-1.5 cursor-pointer block"
                style={{ width: '138px' }}
              >
                {/* White Frame Box ("ghor" as drawn by user) */}
                <div className="rounded-lg overflow-hidden bg-black border-2 border-white/90 group-hover:border-amber-400 group-hover:scale-105 transition-all duration-300 shadow-md">
                  {/* Frame Top Header */}
                  <div className="px-1.5 py-0.5 bg-black/90 border-b border-white/30 flex items-center justify-between text-[9px] font-mono text-zinc-300">
                    <span className="text-white font-bold">{frameNum}</span>
                    <span className="truncate max-w-[70px] text-zinc-300 text-[8px]">{photo.title}</span>
                  </div>

                  {/* Photograph Container */}
                  <div className="relative aspect-[4/3] w-full bg-zinc-900 overflow-hidden">
                    <img
                      src={photo.imageUrl}
                      alt={photo.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-1 text-center">
                      <Maximize2 className="w-4 h-4 text-amber-300 mb-0.5" />
                      <span className="text-[9px] font-semibold text-white leading-tight line-clamp-1">
                        {photo.title}
                      </span>
                      <span className="text-[8px] font-mono text-amber-400 uppercase mt-0.5">
                        {photo.category}
                      </span>
                    </div>
                  </div>

                  {/* Frame Bottom Footer */}
                  <div className="px-1.5 py-0.5 bg-black/90 border-t border-white/30 flex items-center justify-between text-[8px] font-mono text-zinc-400">
                    <span>35MM</span>
                    <span className="flex items-center gap-1 text-pink-400">
                      <Heart className="w-2 h-2 fill-pink-500" />
                      <span>{photo.likes}</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Sprocket Perforations Row */}
        <div className="relative z-10 w-full py-1.5 px-2 bg-black border-t border-white/40 flex items-center justify-between overflow-hidden pointer-events-none select-none">
          <div className="flex items-center gap-3 w-full justify-around opacity-75">
            {Array.from({ length: 40 }).map((_, i) => (
              <div key={`bottom-sprocket-${i}`} className="film-sprocket-hole-h" />
            ))}
          </div>
        </div>
      </div>

      {/* LIGHTBOX MODAL */}
      {activePhoto && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/95 backdrop-blur-md animate-fade-in"
          onClick={handleCloseLightbox}
        >
          {/* Modal Card */}
          <div
            className="relative w-full max-w-4xl max-h-[92vh] flex flex-col md:flex-row bg-[#0c0c10] border-2 border-white/80 rounded-3xl overflow-hidden shadow-2xl shadow-black"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button Top Right */}
            <button
              type="button"
              onClick={handleCloseLightbox}
              className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-black/80 hover:bg-zinc-800 text-white border border-zinc-700 transition-colors cursor-pointer"
              aria-label="Close Lightbox"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left Column: High Resolution Image with Prev / Next Navigation */}
            <div className="relative flex-1 bg-black flex items-center justify-center min-h-[280px] max-h-[50vh] md:max-h-[80vh] overflow-hidden group">
              <img
                src={activePhoto.imageUrl}
                alt={activePhoto.title}
                className="w-full h-full object-contain"
              />

              {/* Prev Navigation Button */}
              <button
                type="button"
                onClick={handlePrevPhoto}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/80 hover:bg-zinc-800 text-white border border-zinc-700 transition-all cursor-pointer opacity-80 group-hover:opacity-100 hover:scale-110"
                aria-label="Previous photograph"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Next Navigation Button */}
              <button
                type="button"
                onClick={handleNextPhoto}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/80 hover:bg-zinc-800 text-white border border-zinc-700 transition-all cursor-pointer opacity-80 group-hover:opacity-100 hover:scale-110"
                aria-label="Next photograph"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Frame counter badge */}
              <div className="absolute bottom-3 left-4 px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-xs border border-white/20 text-[11px] font-mono text-white">
                Frame {selectedPhotoIndex! + 1} of {photos.length}
              </div>
            </div>

            {/* Right Column: Photograph Story & Details */}
            <div className="w-full md:w-80 p-5 flex flex-col justify-between overflow-y-auto space-y-4 border-t md:border-t-0 md:border-l border-zinc-800 bg-[#0e0e14]">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/30 text-white text-[10px] font-mono uppercase tracking-wider font-semibold">
                    {activePhoto.category}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400">
                    ID: {activePhoto.id}
                  </span>
                </div>

                <h3 className="font-display text-xl font-bold text-white leading-snug">
                  {activePhoto.title}
                </h3>

                <p className="text-xs text-zinc-300 leading-relaxed">
                  {activePhoto.caption || 'Rasel Babu official archive photograph captured during musical performance.'}
                </p>

                <div className="space-y-2 pt-2 text-xs border-t border-zinc-800">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">{activePhoto.location || 'Bangladesh'}</span>
                  </div>

                  <div className="flex items-center gap-2 text-zinc-400">
                    <Calendar className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                    <span>{activePhoto.date || '2025 - 2026'}</span>
                  </div>

                  <div className="flex items-center gap-2 text-zinc-400">
                    <Camera className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>Photo: {activePhoto.photographer || 'FK Music'}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2.5 pt-3 border-t border-zinc-800">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => likePhoto(activePhoto.id)}
                    className="flex-1 py-2 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 text-pink-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Heart className="w-3.5 h-3.5 fill-pink-500" />
                    <span>Like ({activePhoto.likes})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleCloseLightbox();
                      onNavigate('/photo-detail', activePhoto.id);
                    }}
                    className="flex-1 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>Full Detail</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="text-center">
                  <span className="text-[10px] font-mono text-zinc-500">
                    ← / → arrows to browse · Esc to close
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
