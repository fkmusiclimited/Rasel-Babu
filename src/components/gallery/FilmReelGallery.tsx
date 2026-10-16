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
  Play,
  Pause,
  ArrowRight,
  Sparkles,
  Film,
} from 'lucide-react';

interface FilmReelGalleryProps {
  onNavigate: (path: string, param?: string) => void;
}

export const FilmReelGallery: React.FC<FilmReelGalleryProps> = ({ onNavigate }) => {
  const { photos, likePhoto, incrementPhotoViews } = useData();

  // Selected photo for Lightbox modal
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [isAnimationPaused, setIsAnimationPaused] = useState(false);
  const [activeFrameHoverId, setActiveFrameHoverId] = useState<string | null>(null);

  // Divide photos into distinct reel strips so every frame is unique
  // If fewer than 12 photos, distribute safely across 3 strips
  const reel1Photos = photos.filter((_, i) => i % 3 === 0);
  const reel2Photos = photos.filter((_, i) => i % 3 === 1);
  const reel3Photos = photos.filter((_, i) => i % 3 === 2);

  // Fallback to all photos if a column is empty
  const strip1 = reel1Photos.length > 0 ? reel1Photos : photos;
  const strip2 = reel2Photos.length > 0 ? reel2Photos : photos;
  const strip3 = reel3Photos.length > 0 ? reel3Photos : photos;

  // Double the array for seamless infinite looping (0% -> -50%)
  const loopStrip1 = [...strip1, ...strip1];
  const loopStrip2 = [...strip2, ...strip2];
  const loopStrip3 = [...strip3, ...strip3];

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

  // Helper component to render a single film strip column
  const renderFilmStrip = (
    items: PhotoItem[],
    animationClass: string,
    stripLabel: string,
    speedLabel: string
  ) => {
    return (
      <div className="relative flex-1 min-w-[240px] max-w-[340px] h-[580px] sm:h-[660px] overflow-hidden rounded-2xl bg-[#09090d] border border-zinc-800/80 shadow-2xl shadow-black/80">
        {/* Top Vignette Overlay for smooth fade */}
        <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-[#09090d] via-[#09090d]/80 to-transparent z-20 pointer-events-none" />

        {/* Bottom Vignette Overlay for smooth fade */}
        <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-[#09090d] via-[#09090d]/80 to-transparent z-20 pointer-events-none" />

        {/* Film Header Branding Tag */}
        <div className="absolute top-3 inset-x-0 z-20 flex items-center justify-between px-5 pointer-events-none">
          <span className="text-[10px] font-mono tracking-widest text-amber-400/80 uppercase font-semibold bg-black/60 px-2 py-0.5 rounded border border-amber-500/20 backdrop-blur-xs">
            {stripLabel}
          </span>
          <span className="text-[9px] font-mono text-zinc-500 bg-black/60 px-1.5 py-0.5 rounded">
            {speedLabel}
          </span>
        </div>

        {/* Left Sprocket Holes Strip */}
        <div className="absolute top-0 bottom-0 left-0 w-6 z-10 flex flex-col justify-around py-4 pointer-events-none bg-gradient-to-r from-black via-black/80 to-transparent">
          {Array.from({ length: 26 }).map((_, i) => (
            <div key={`left-sprocket-${i}`} className="film-sprocket-hole" />
          ))}
        </div>

        {/* Right Sprocket Holes Strip */}
        <div className="absolute top-0 bottom-0 right-0 w-6 z-10 flex flex-col justify-around py-4 pointer-events-none bg-gradient-to-l from-black via-black/80 to-transparent">
          {Array.from({ length: 26 }).map((_, i) => (
            <div key={`right-sprocket-${i}`} className="film-sprocket-hole" />
          ))}
        </div>

        {/* Continuous Animated Vertical Strip */}
        <div
          className={`px-7 py-4 space-y-6 ${animationClass} ${
            isAnimationPaused ? '[animation-play-state:paused!important]' : ''
          }`}
          style={{ willChange: 'transform' }}
        >
          {items.map((photo, index) => {
            const frameNumber = `${(index % items.length) + 1}A`;
            const isHovered = activeFrameHoverId === `${photo.id}-${index}`;

            return (
              <div
                key={`${photo.id}-${index}`}
                onMouseEnter={() => setActiveFrameHoverId(`${photo.id}-${index}`)}
                onMouseLeave={() => setActiveFrameHoverId(null)}
                onClick={() => handleOpenLightbox(photo)}
                className="group relative cursor-pointer block rounded-xl overflow-hidden bg-black border border-zinc-800 transition-all duration-300 hover:border-amber-400 hover:scale-[1.02] hover:shadow-xl hover:shadow-amber-500/20"
              >
                {/* 35mm Frame Header / Metadata Bar */}
                <div className="px-3 py-1.5 bg-zinc-950/90 border-b border-zinc-800 flex items-center justify-between text-[10px] font-mono text-zinc-400">
                  <span className="text-amber-400/90 font-bold">{frameNumber}</span>
                  <span className="truncate max-w-[140px] text-zinc-300">{photo.title}</span>
                  <span className="text-pink-400 text-[9px] uppercase">{photo.category}</span>
                </div>

                {/* Photo Frame Container */}
                <div className="relative aspect-[16/10] sm:aspect-[4/3] w-full overflow-hidden bg-zinc-900">
                  <img
                    src={photo.imageUrl}
                    alt={photo.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
                  />

                  {/* Gradient & Hover Information Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-60 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                    <p className="text-xs font-semibold text-white truncate drop-shadow-md">
                      {photo.title}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-zinc-300 mt-1">
                      <span className="flex items-center gap-1 text-zinc-400 truncate">
                        <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                        <span className="truncate max-w-[120px]">{photo.location}</span>
                      </span>
                      <span className="flex items-center gap-1 font-mono text-amber-300 bg-black/60 px-1.5 py-0.5 rounded border border-amber-400/20">
                        <Maximize2 className="w-3 h-3" />
                        <span>View</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Film Frame Footer */}
                <div className="px-3 py-1 bg-zinc-950 flex items-center justify-between text-[9px] font-mono text-zinc-500">
                  <span>ISO 500T · 35MM</span>
                  <span className="flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <Eye className="w-2.5 h-2.5 text-zinc-400" />
                      <span>{photo.views}</span>
                    </span>
                    <span className="flex items-center gap-1 text-pink-400">
                      <Heart className="w-2.5 h-2.5 fill-pink-500/20" />
                      <span>{photo.likes}</span>
                    </span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <section className="relative w-full py-10 sm:py-14 bg-gradient-to-b from-[#08080a] via-[#0d0d12] to-[#08080a] border-y border-zinc-800/80 overflow-hidden">
      {/* Background Ambience Glow */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-32 right-1/4 w-[500px] h-[300px] bg-pink-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-500/30 text-amber-400 text-xs font-mono uppercase tracking-widest">
              <Film className="w-3.5 h-3.5 text-amber-400" />
              <span>Cinematic 35mm Visual Chronicles</span>
            </div>

            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
              Rasel Babu <span className="text-gold-gradient">Motion Film Reels</span>
            </h2>

            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
              Experience Rasel Babu&apos;s musical voyage through living 35mm film strips. Hover over any frame to pause the reel, and click any frame to inspect the photograph in full resolution or explore stage archives.
            </p>
          </div>

          {/* Interactive Reel Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsAnimationPaused(!isAnimationPaused)}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/80 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-md"
              title={isAnimationPaused ? 'Resume Reel Motion' : 'Pause Reel Motion'}
            >
              {isAnimationPaused ? (
                <>
                  <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>Resume Reels (প্লে করুন)</span>
                </>
              ) : (
                <>
                  <Pause className="w-3.5 h-3.5 text-amber-400" />
                  <span>Pause Motion (পজ করুন)</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => onNavigate('/gallery')}
              className="px-4 py-2 rounded-xl bg-amber-400/15 hover:bg-amber-400/25 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Explore All Archive</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Animated Film Strips Carousel Container */}
        <div className="pause-on-hover relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
            {/* Strip 1: Downward Slow Reel */}
            {renderFilmStrip(
              loopStrip1,
              'animate-film-scroll-down',
              'FK REEL 01 · CONCERT STAGE',
              '35mm 24fps'
            )}

            {/* Strip 2: Upward / Counter Smooth Reel (Hidden on tiny phones, visible from md up) */}
            <div className="hidden md:block flex-1 min-w-[240px] max-w-[340px]">
              {renderFilmStrip(
                loopStrip2,
                'animate-film-scroll-up',
                'FK REEL 02 · STUDIO ACOUSTIC',
                '35mm 24fps'
              )}
            </div>

            {/* Strip 3: Downward Gentle Reel (Desktop) */}
            <div className="hidden lg:block flex-1 min-w-[240px] max-w-[340px]">
              {renderFilmStrip(
                loopStrip3,
                'animate-film-scroll-down-slow',
                'FK REEL 03 · HERITAGE & GALA',
                '35mm 24fps'
              )}
            </div>
          </div>

          {/* Subtext info */}
          <div className="mt-4 flex items-center justify-between text-[11px] font-mono text-zinc-500 px-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Continuous 35mm negative film loop · Click any frame to inspect</span>
            </span>
            <span className="hidden sm:inline">
              Hover to hold frame · Supports keyboard ← / → in lightbox
            </span>
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
            className="relative w-full max-w-5xl max-h-[92vh] flex flex-col lg:flex-row bg-[#0c0c10] border border-amber-500/40 rounded-3xl overflow-hidden shadow-2xl shadow-black"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button Top Right */}
            <button
              type="button"
              onClick={handleCloseLightbox}
              className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-black/70 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/80 transition-colors cursor-pointer"
              aria-label="Close Lightbox"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left Column: High Resolution Image with Prev / Next Navigation */}
            <div className="relative flex-1 bg-black flex items-center justify-center min-h-[320px] max-h-[55vh] lg:max-h-[82vh] overflow-hidden group">
              <img
                src={activePhoto.imageUrl}
                alt={activePhoto.title}
                className="w-full h-full object-contain"
              />

              {/* Prev Navigation Button */}
              <button
                type="button"
                onClick={handlePrevPhoto}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-black/70 hover:bg-zinc-800 text-white border border-zinc-700 transition-all cursor-pointer opacity-80 group-hover:opacity-100 hover:scale-110"
                aria-label="Previous photograph"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              {/* Next Navigation Button */}
              <button
                type="button"
                onClick={handleNextPhoto}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-black/70 hover:bg-zinc-800 text-white border border-zinc-700 transition-all cursor-pointer opacity-80 group-hover:opacity-100 hover:scale-110"
                aria-label="Next photograph"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              {/* Frame counter badge */}
              <div className="absolute bottom-3 left-4 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-xs border border-zinc-800 text-[11px] font-mono text-zinc-300">
                Frame {selectedPhotoIndex! + 1} of {photos.length}
              </div>
            </div>

            {/* Right Column: Photograph Story, Metadata & Actions */}
            <div className="w-full lg:w-88 xl:w-96 p-5 sm:p-6 flex flex-col justify-between overflow-y-auto space-y-6 border-t lg:border-t-0 lg:border-l border-zinc-800 bg-[#0e0e14]">
              <div className="space-y-4">
                {/* Header Tag */}
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-amber-400/15 border border-amber-500/30 text-amber-300 text-[11px] font-mono uppercase tracking-wider font-semibold">
                    {activePhoto.category}
                  </span>
                  <span className="text-[11px] font-mono text-zinc-400">
                    ID: {activePhoto.id}
                  </span>
                </div>

                <h3 className="font-display text-2xl font-bold text-white leading-snug">
                  {activePhoto.title}
                </h3>

                <p className="text-xs text-zinc-300 leading-relaxed">
                  {activePhoto.caption || 'Rasel Babu official archive photograph captured during musical performance and media events.'}
                </p>

                {/* Metadata List */}
                <div className="space-y-2.5 pt-2 text-xs border-t border-zinc-800/80">
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
                    <span>Photography: {activePhoto.photographer || 'FK Music Media'}</span>
                  </div>
                </div>

                {/* Tags */}
                {activePhoto.tags && activePhoto.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {activePhoto.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Actions Bar */}
              <div className="space-y-3 pt-4 border-t border-zinc-800">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => likePhoto(activePhoto.id)}
                    className="flex-1 py-2.5 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 text-pink-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Heart className="w-4 h-4 fill-pink-500" />
                    <span>Applaud ({activePhoto.likes})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleCloseLightbox();
                      onNavigate('/photo-detail', activePhoto.id);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Full Detail Page</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-center">
                  <span className="text-[10px] font-mono text-zinc-500">
                    Press Left / Right arrows to switch photo · Esc to exit
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
