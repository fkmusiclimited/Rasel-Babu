import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Share2,
  Check,
  ShieldCheck,
  Truck,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Product } from '../../types';

interface ProductDetailModalProps {
  onOrderNow?: (product: Product, size?: string) => void;
  onNavigate?: (path: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ onOrderNow, onNavigate }) => {
  const { viewingProduct, closeProductView } = useData();
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>('');

  // Collect all photos: main photo + up to 3 additional photos
  const allImages = viewingProduct
    ? [
        viewingProduct.imageUrl,
        ...(viewingProduct.additionalImages?.filter((img) => img && img.trim().length > 0) || []),
      ]
    : [];

  useEffect(() => {
    setActivePhotoIndex(0);
    if (viewingProduct?.sizes && viewingProduct.sizes.length > 0) {
      setSelectedSize(viewingProduct.sizes[0]);
    } else {
      setSelectedSize('');
    }
  }, [viewingProduct]);

  // Keyboard navigation & ESC close
  useEffect(() => {
    if (!viewingProduct) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeProductView();
      } else if (e.key === 'ArrowRight' && allImages.length > 1) {
        setActivePhotoIndex((prev) => (prev + 1) % allImages.length);
      } else if (e.key === 'ArrowLeft' && allImages.length > 1) {
        setActivePhotoIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewingProduct, allImages.length, closeProductView]);

  if (!viewingProduct) return null;

  const hasOffer =
    viewingProduct.offerPrice &&
    viewingProduct.offerPrice > 0 &&
    viewingProduct.offerPrice < viewingProduct.price;

  const discountPercent = hasOffer
    ? Math.round(
        ((viewingProduct.price - (viewingProduct.offerPrice as number)) / viewingProduct.price) * 100
      )
    : 0;

  const effectivePrice = hasOffer ? viewingProduct.offerPrice : viewingProduct.price;

  const handleCopyShare = () => {
    const shareText = `${viewingProduct.title} - ${effectivePrice} ${viewingProduct.currency} | Rasel Babu Official Store`;
    navigator.clipboard?.writeText(window.location.origin + '/shop?product=' + viewingProduct.id);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleOrderClick = () => {
    closeProductView();
    if (onOrderNow) {
      onOrderNow(viewingProduct, selectedSize);
    } else if (onNavigate) {
      onNavigate('/shop');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in"
      onClick={closeProductView}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-4xl bg-gradient-to-b from-zinc-900 via-zinc-950 to-black border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/80">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-mono uppercase tracking-wider font-semibold">
              {viewingProduct.category === 'dress'
                ? 'Dresses & Three-Piece (থ্রি-পিস ও পোশাক)'
                : viewingProduct.category === 'merch'
                ? 'Apparel & Merch (টি-শার্ট ও মার্চ)'
                : viewingProduct.category === 'vinyl'
                ? 'Vinyl & CD (ভিনাইল ও সিডি)'
                : viewingProduct.category}
            </span>
            {viewingProduct.badge && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-black text-[10px] font-bold uppercase tracking-wider">
                {viewingProduct.badge}
              </span>
            )}
          </div>

          <button
            onClick={closeProductView}
            className="p-1.5 rounded-full bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors cursor-pointer"
            title="Close (বন্ধ করুন)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 sm:p-8 max-h-[82vh] overflow-y-auto">
          {/* LEFT: Multi-Photo Gallery (মেইন ছবি + ৩টি অতিরিক্ত ছবি) */}
          <div className="md:col-span-6 space-y-4">
            {/* Active Large Image Display */}
            <div className="relative aspect-square sm:aspect-[4/3] rounded-2xl overflow-hidden bg-black border border-zinc-800 flex items-center justify-center group shadow-xl">
              <img
                src={allImages[activePhotoIndex] || viewingProduct.imageUrl}
                alt={`${viewingProduct.title} - Photo ${activePhotoIndex + 1}`}
                className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
              />

              {/* Offer Discount Badge on Image */}
              {hasOffer && (
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-gradient-to-r from-red-600 to-pink-600 text-white font-extrabold text-xs shadow-lg uppercase tracking-wider">
                  {discountPercent}% OFF (ছাড়)
                </span>
              )}

              {/* Stock Status Badge */}
              <span
                className={`absolute top-3 right-3 px-2.5 py-1 rounded-lg text-xs font-mono uppercase tracking-wider backdrop-blur-md shadow-md ${
                  viewingProduct.inStock
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                    : 'bg-red-950/80 text-red-300 border border-red-500/40'
                }`}
              >
                {viewingProduct.inStock ? '● In Stock' : '● Sold Out'}
              </span>

              {/* Photo Navigation Arrows (if more than 1 photo) */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setActivePhotoIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
                    }
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 hover:bg-black text-white hover:text-amber-400 transition-all border border-zinc-700 cursor-pointer shadow-lg"
                    title="Previous Photo (পূর্ববর্তী ছবি)"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setActivePhotoIndex((prev) => (prev + 1) % allImages.length)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 hover:bg-black text-white hover:text-amber-400 transition-all border border-zinc-700 cursor-pointer shadow-lg"
                    title="Next Photo (পরবর্তী ছবি)"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  {/* Photo Counter Pill */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-zinc-700 text-[11px] font-mono text-zinc-200">
                    ছবি {activePhotoIndex + 1} / {allImages.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail Row: Main Photo + Up to 3 Additional Photos */}
            {allImages.length > 1 && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 px-1">
                  <span>PRODUCT PHOTOS ({allImages.length} টি ছবি)</span>
                  <span className="text-amber-400 text-[10px]">ক্লিক করে ছবি পরিবর্তন করুন</span>
                </div>
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 pt-0.5">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActivePhotoIndex(idx)}
                      className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                        activePhotoIndex === idx
                          ? 'border-amber-400 ring-2 ring-amber-400/50 scale-105 shadow-md shadow-amber-400/20'
                          : 'border-zinc-800 opacity-60 hover:opacity-100 hover:border-zinc-600'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[9px] font-mono text-center text-zinc-300 py-0.5">
                        {idx === 0 ? 'Main' : `Photo ${idx + 1}`}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Product Details & Purchase Actions */}
          <div className="md:col-span-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Product Title */}
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug">
                  {viewingProduct.title}
                </h2>
              </div>

              {/* Price & Offer Display */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 flex items-baseline justify-between">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-0.5">
                    Price (মূল্য)
                  </span>
                  {hasOffer ? (
                    <div className="flex items-baseline gap-3">
                      <span className="font-mono text-3xl font-extrabold text-amber-300">
                        ৳{viewingProduct.offerPrice?.toLocaleString()}
                      </span>
                      <del className="font-mono text-base text-zinc-500">
                        ৳{viewingProduct.price.toLocaleString()}
                      </del>
                      <span className="text-xs font-bold font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                        Save ৳{((viewingProduct.price || 0) - (viewingProduct.offerPrice || 0)).toLocaleString()}
                      </span>
                    </div>
                  ) : (
                    <span className="font-mono text-3xl font-extrabold text-white text-gold-gradient">
                      ৳{viewingProduct.price.toLocaleString()} {viewingProduct.currency}
                    </span>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">
                    Delivery
                  </span>
                  <span className="text-xs font-medium text-amber-400">All Bangladesh</span>
                </div>
              </div>

              {/* Available Sizes for Dresses, Three-Piece & Merch */}
              {(viewingProduct.category === 'dress' ||
                (viewingProduct.sizes && viewingProduct.sizes.length > 0)) && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-zinc-300">
                      Select Size (সাইজ নির্বাচন করুন):
                    </span>
                    {selectedSize && (
                      <span className="font-mono text-amber-400 font-bold">
                        Selected: {selectedSize}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(viewingProduct.sizes && viewingProduct.sizes.length > 0
                      ? viewingProduct.sizes
                      : ['36', '38', '40', '42', '44']
                    ).map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSelectedSize(sz)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                          selectedSize === sz
                            ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20 ring-1 ring-amber-300'
                            : 'bg-zinc-900 text-zinc-300 border border-zinc-800 hover:border-zinc-600'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="space-y-1.5">
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                  Product Description (পণ্যের বিবরণ):
                </span>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed bg-zinc-950/60 p-4 rounded-xl border border-zinc-800/60 whitespace-pre-line">
                  {viewingProduct.description}
                </p>
              </div>

              {/* Delivery & Assurance Perks */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-400 font-mono">
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-zinc-950 border border-zinc-900">
                  <Truck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>ক্যাশ অন ডেলিভারি / বিকাশ</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-zinc-950 border border-zinc-900">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>১০০% অরিজিনাল কোয়ালিটি</span>
                </div>
              </div>
            </div>

            {/* Bottom Action Buttons */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleOrderClick}
                  disabled={!viewingProduct.inStock}
                  className={`flex-1 py-3 px-6 rounded-2xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xl ${
                    viewingProduct.inStock
                      ? 'bg-gradient-to-r from-amber-400 via-amber-400 to-amber-500 hover:from-amber-300 text-black shadow-amber-400/20 cursor-pointer'
                      : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{viewingProduct.inStock ? 'Order Now (এখনই অর্ডার করুন)' : 'Sold Out'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyShare}
                  className="p-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                  title="Share Product (প্রোডাক্ট লিংক কপি)"
                >
                  {copiedLink ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Share2 className="w-4 h-4" />
                  )}
                </button>
              </div>

              {viewingProduct.buyUrl && (
                <a
                  href={viewingProduct.buyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-4 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-amber-400 text-xs font-mono flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>External Store Link</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
