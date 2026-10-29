import React, { useEffect, useState } from 'react';
import { useData } from '../context/DataContext';
import { AdSlot } from '../components/ads/AdSlot';
import { ArrowLeft, ChevronLeft, ChevronRight, Heart, Eye, Share2, MapPin, Calendar, Camera, Check } from 'lucide-react';

interface PhotoDetailProps {
  photoId: string;
  onNavigate: (path: string, param?: string) => void;
}

export const PhotoDetail: React.FC<PhotoDetailProps> = ({ photoId, onNavigate }) => {
  const { photos, likePhoto } = useData();
  const [copied, setCopied] = useState(false);

  // Find target photo
  const currentIndex = photos.findIndex((p) => p.id === photoId);
  const currentPhoto = currentIndex !== -1 ? photos[currentIndex] : photos[0];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (currentPhoto) {
      document.title = `${currentPhoto.title} | Rasel Babu Official Gallery`;
    }
  }, [photoId, currentPhoto]);

  if (!currentPhoto) {
    return (
      <div className="min-h-screen bg-[#08080a] text-zinc-100 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <p className="text-zinc-400">Photo not found in official archive.</p>
          <button
            onClick={() => onNavigate('/gallery')}
            className="px-4 py-2 bg-amber-400 text-black font-semibold rounded-lg text-sm"
          >
            Return to Gallery
          </button>
        </div>
      </div>
    );
  }

  const prevPhoto = currentIndex > 0 ? photos[currentIndex - 1] : photos[photos.length - 1];
  const nextPhoto = currentIndex < photos.length - 1 ? photos[currentIndex + 1] : photos[0];
  const relatedPhotos = photos.filter((p) => p.id !== currentPhoto.id && p.category === currentPhoto.category).slice(0, 3);

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/?photo=${encodeURIComponent(currentPhoto.id)}`
      : `https://raselbabu.com/?photo=${encodeURIComponent(currentPhoto.id)}`;

  const handleShare = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.warn('Failed to copy share link:', err);
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`${currentPhoto.title} | Rasel Babu Official Photo Gallery\n\n${shareUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <button
            onClick={() => onNavigate('/gallery')}
            className="flex items-center gap-2 text-xs font-medium text-zinc-300 hover:text-amber-400 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Photographs</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => prevPhoto && onNavigate('/photo-detail', prevPhoto.id)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-zinc-300 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
            <span className="text-xs font-mono text-zinc-500 px-2">
              {currentIndex + 1} / {photos.length}
            </span>
            <button
              onClick={() => nextPhoto && onNavigate('/photo-detail', nextPhoto.id)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-zinc-300 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Top Adsterra Leaderboard Placement */}
        <AdSlot format="728x90" page="photoDetail" responsive />

        {/* Main Photo Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Photo Visual (High Resolution) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="relative rounded-2xl overflow-hidden bg-black border border-zinc-800 shadow-2xl flex items-center justify-center">
              <img
                src={currentPhoto.imageUrl}
                alt={currentPhoto.title}
                referrerPolicy="no-referrer"
                className="max-h-[75vh] w-full object-contain mx-auto"
              />
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-amber-400 font-mono mb-1">
                    <span className="uppercase">{currentPhoto.category}</span>
                    <span>·</span>
                    <span>Archival Series</span>
                  </div>
                  <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
                    {currentPhoto.title}
                  </h1>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => likePhoto(currentPhoto.id)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-pink-950/40 border border-zinc-700 hover:border-pink-500/50 text-xs font-medium text-pink-400 transition-colors cursor-pointer"
                  >
                    <Heart className="w-3.5 h-3.5 fill-pink-500/30" />
                    <span className="tabular-nums font-mono">{currentPhoto.likes}</span>
                  </button>

                  <button
                    onClick={handleShareWhatsApp}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-xs font-medium text-emerald-300 transition-colors cursor-pointer"
                    title="Share to WhatsApp (হোয়াটসঅ্যাপে শেয়ার করুন)"
                  >
                    <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={handleShareFacebook}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-xs font-medium text-blue-300 transition-colors cursor-pointer"
                    title="Share to Facebook (ফেসবুকে শেয়ার করুন)"
                  >
                    <span>Facebook</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-medium text-zinc-200 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Link Copied' : 'Copy Link'}</span>
                  </button>
                </div>
              </div>

              <p className="text-sm text-zinc-300 leading-relaxed">
                {currentPhoto.caption}
              </p>

              {/* Tags */}
              <div className="pt-2 flex flex-wrap gap-2 text-xs text-zinc-400">
                {currentPhoto.tags.map((tag) => (
                  <span key={tag} className="text-zinc-400">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar: Details, EXIF & Dedicated Adsterra Rectangle Slot */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                Archival Specifications
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <Camera className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-zinc-500 block">Resolution &amp; Aspect</span>
                    <span className="text-zinc-200 font-mono font-medium">3000 × 3000 px (1:1 Ultra HD Square)</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-zinc-500 block">Location</span>
                    <span className="text-zinc-200 font-medium">{currentPhoto.location}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Calendar className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-zinc-500 block">Capture Date</span>
                    <span className="text-zinc-200 font-medium">
                      {new Date(currentPhoto.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Camera className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-zinc-500 block">Photographer Credit</span>
                    <span className="text-zinc-200 font-medium">
                      {currentPhoto.photographer || 'Official Artist Media Bureau'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Eye className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-zinc-500 block">Verified Impressions</span>
                    <span className="text-zinc-200 font-mono tabular-nums">
                      {currentPhoto.views.toLocaleString()} views
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dedicated Adsterra 300x250 Medium Rectangle in sidebar */}
            <div className="flex flex-col items-center">
              <AdSlot format="300x250" page="photoDetail" />
            </div>
          </div>
        </div>

        {/* Related Photos Section */}
        {relatedPhotos.length > 0 && (
          <div className="pt-10 border-t border-zinc-800 space-y-6">
            <h3 className="font-display text-2xl font-bold text-white">
              Related Photographs in {currentPhoto.category}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedPhotos.map((photo) => (
                <div
                  key={photo.id}
                  onClick={() => onNavigate('/photo-detail', photo.id)}
                  className="group rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 cursor-pointer aspect-[4/3] relative"
                >
                  <img
                    src={photo.imageUrl}
                    alt={photo.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-3 flex flex-col justify-end">
                    <p className="text-xs font-semibold text-white truncate">{photo.title}</p>
                    <p className="text-[10px] text-zinc-400">{photo.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
