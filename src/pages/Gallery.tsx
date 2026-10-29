import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { AdSlot } from '../components/ads/AdSlot';
import { Search, Heart, Eye, ArrowRight, Camera, Sparkles, Share2, Check } from 'lucide-react';

interface GalleryProps {
  onNavigate: (path: string, param?: string) => void;
}

export const Gallery: React.FC<GalleryProps> = ({ onNavigate }) => {
  const { photos, likePhoto, incrementPhotoViews } = useData();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [visibleCount, setVisibleCount] = useState<number>(6);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyPhotoShare = async (e: React.MouseEvent, photoId: string) => {
    e.stopPropagation();
    const url = typeof window !== 'undefined'
      ? `${window.location.origin}/?photo=${encodeURIComponent(photoId)}`
      : `https://raselbabu.com/?photo=${encodeURIComponent(photoId)}`;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setCopiedId(photoId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  };

  const categories = [
    { id: 'all', label: 'All Photos' },
    { id: 'concert', label: 'Live Concerts' },
    { id: 'studio', label: 'Studio Sessions' },
    { id: 'portrait', label: 'Portraits & Red Carpet' },
    { id: 'cultural', label: 'Cultural & Heritage' },
  ];

  const filteredPhotos = photos.filter((photo) => {
    const matchesCategory = selectedCategory === 'all' || (photo.category || '').toLowerCase() === selectedCategory.toLowerCase();
    const query = searchQuery.trim().toLowerCase();
    if (!query) return matchesCategory;
    const title = (photo.title || '').toLowerCase();
    const loc = (photo.location || '').toLowerCase();
    const tags = Array.isArray(photo.tags) ? photo.tags : [];
    const matchesQuery =
      title.includes(query) ||
      loc.includes(query) ||
      tags.some((t) => (t || '').toLowerCase().includes(query));
    return matchesCategory && matchesQuery;
  });

  const visiblePhotos = filteredPhotos.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPhotos.length;

  const handlePhotoClick = (photoId: string) => {
    incrementPhotoViews(photoId);
    onNavigate('/photo-detail', photoId);
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400">
              Official Media Archive
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-white tracking-tight">
              Photo Gallery & Stage Moments
            </h1>
            <p className="text-sm text-zinc-400 max-w-xl">
              High-resolution concert photography, behind-the-scenes recording sessions, editorial portraits, and cultural festival appearances of Rasel Babu.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by venue, city, tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Filter Tabs (Interactive button controls permitted by design constitution) */}
        <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800/80 pb-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setVisibleCount(6);
              }}
              className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-amber-400 text-black font-semibold'
                  : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
          <span className="text-xs font-mono text-zinc-500 ml-auto hidden sm:inline">
            Showing {visiblePhotos.length} of {filteredPhotos.length} photos
          </span>
        </div>

        {/* Top Adsterra Leaderboard Slot */}
        <AdSlot format="728x90" page="gallery" responsive />

        {/* Photo Grid */}
        {visiblePhotos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visiblePhotos.map((photo) => (
              <div
                key={photo.id}
                className="group rounded-2xl overflow-hidden border border-zinc-800/90 bg-zinc-900/60 flex flex-col transition-all hover:border-amber-400/50 hover:shadow-2xl hover:shadow-black"
              >
                {/* Image Container with Natural Click (3000x3000 Square Ratio) */}
                <div
                  onClick={() => handlePhotoClick(photo.id)}
                  className="relative aspect-square overflow-hidden cursor-pointer bg-zinc-950"
                  title="Click to view full 3000×3000 ultra high-resolution photo"
                >
                  <img
                    src={photo.imageUrl}
                    alt={photo.title}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* 3000x3000 Ultra HD badge */}
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-amber-300 border border-amber-500/30 text-[10px] font-mono shadow-md flex items-center gap-1">
                    <Camera className="w-3 h-3 text-amber-400" />
                    <span>3000×3000 UHD</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                    <span className="text-xs text-amber-300 font-semibold flex items-center gap-1.5 drop-shadow">
                      <span>View Full 3000×3000 Photo</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>

                {/* Content Details (Clean Unboxed Typography) */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-500 mb-1">
                      <span className="capitalize text-amber-400/90 font-mono">{photo.category}</span>
                      <span>·</span>
                      <span>{photo.location}</span>
                    </div>

                    <h3
                      onClick={() => handlePhotoClick(photo.id)}
                      className="text-base font-semibold text-white group-hover:text-amber-200 transition-colors cursor-pointer line-clamp-1"
                    >
                      {photo.title}
                    </h3>

                    <p className="text-xs text-zinc-400 line-clamp-2 mt-1">
                      {photo.caption}
                    </p>
                  </div>

                  {/* Clean unboxed footer with stats and like */}
                  <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-500 font-mono">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        <span className="tabular-nums">{photo.views.toLocaleString()}</span>
                      </span>
                      <span>·</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          likePhoto(photo.id);
                        }}
                        className="flex items-center gap-1 text-zinc-400 hover:text-pink-400 transition-colors cursor-pointer"
                        title="Like photo"
                      >
                        <Heart className="w-3.5 h-3.5 fill-pink-500/20" />
                        <span className="tabular-nums">{photo.likes.toLocaleString()}</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={(e) => handleCopyPhotoShare(e, photo.id)}
                        className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-amber-400 transition-colors cursor-pointer"
                        title="Copy photo share link (ছবি শেয়ার লিংক কপি করুন)"
                      >
                        {copiedId === photo.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Share2 className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedId === photo.id ? 'Copied' : 'Share'}</span>
                      </button>

                      <button
                        onClick={() => handlePhotoClick(photo.id)}
                        className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                      >
                        Details & EXIF
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center space-y-3 bg-zinc-900/30 rounded-2xl border border-zinc-800">
            <Camera className="w-8 h-8 text-zinc-500 mx-auto" />
            <h3 className="text-base font-semibold text-white">No photographs match your search</h3>
            <p className="text-xs text-zinc-400">Try adjusting your category filter or search keywords.</p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="mt-2 text-xs text-amber-400 hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Load More Button */}
        {hasMore && (
          <div className="text-center pt-6">
            <button
              onClick={() => setVisibleCount((prev) => prev + 6)}
              className="px-6 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-sm font-semibold text-zinc-200 transition-colors shadow-lg cursor-pointer"
            >
              Load More Photographs ({filteredPhotos.length - visibleCount} remaining)
            </button>
          </div>
        )}

        {/* Bottom Adsterra Medium Rectangle / Banner */}
        <div className="pt-6">
          <AdSlot format="728x90" page="gallery" responsive />
        </div>
      </div>
    </div>
  );
};
