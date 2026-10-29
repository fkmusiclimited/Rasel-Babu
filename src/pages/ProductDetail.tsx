import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { AdSlot } from '../components/ads/AdSlot';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Share2,
  Check,
  Truck,
  ShieldCheck,
  Eye,
  Camera,
  ExternalLink,
  Sparkles,
  Phone,
  Tag,
  Package,
  MapPin,
  X,
  CreditCard,
  CheckCircle2,
} from 'lucide-react';
import { Product, OrderItem } from '../types';

interface ProductDetailProps {
  productId: string;
  onNavigate: (path: string, param?: string) => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ productId, onNavigate }) => {
  const { products, placeOrder } = useData();
  const { currentUser } = useAuth();

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Fast Order Modal inside ProductDetail
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [custName, setCustName] = useState(currentUser?.name || '');
  const [custPhone, setCustPhone] = useState(currentUser?.phone || '');
  const [custAddress, setCustAddress] = useState('');
  const [custPayment, setCustPayment] = useState<'Cash on Delivery' | 'bKash' | 'Nagad' | 'Card'>('Cash on Delivery');
  const [custNotes, setCustNotes] = useState('');
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  // Find target product
  const product = products.find((p) => p.id === productId) || products[0];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActivePhotoIndex(0);
    if (product) {
      document.title = `${product.title} | Rasel Babu Official Store`;
      if (product.sizes && product.sizes.length > 0) {
        setSelectedSize(product.sizes[0]);
      } else {
        setSelectedSize('');
      }
    }
  }, [productId, product]);

  if (!product) {
    return (
      <div className="min-h-screen bg-[#08080a] text-zinc-100 flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-md">
          <Package className="w-12 h-12 text-zinc-600 mx-auto" />
          <h2 className="text-xl font-bold text-white">Product Not Found (পণ্যটি পাওয়া যায়নি)</h2>
          <p className="text-sm text-zinc-400">
            The requested product may have been updated or removed from the official store archive.
          </p>
          <button
            onClick={() => onNavigate('/shop')}
            className="px-6 py-2.5 bg-amber-400 text-black font-semibold rounded-xl text-xs uppercase tracking-wider hover:bg-amber-300 transition-colors cursor-pointer"
          >
            Return to Shop (শপে ফিরে যান)
          </button>
        </div>
      </div>
    );
  }

  // Collect all photos: main photo + up to 3 additional photos
  const allImages = [
    product.imageUrl,
    ...(product.additionalImages?.filter((img) => img && img.trim().length > 0) || []),
  ];

  const hasOffer = product.offerPrice && product.offerPrice > 0 && product.offerPrice < product.price;
  const discountPercent = hasOffer
    ? Math.round(((product.price - (product.offerPrice as number)) / product.price) * 100)
    : 0;
  const effectivePrice = hasOffer ? (product.offerPrice as number) : product.price;

  // Share URL for WhatsApp, Facebook and direct link
  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/?product=${encodeURIComponent(product.id)}`
      : `https://raselbabu.com/?product=${encodeURIComponent(product.id)}`;

  const handleCopyShare = async () => {
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
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (err) {
      console.warn('Failed to copy share link:', err);
    }
  };

  const handleShareWhatsApp = () => {
    const priceText = typeof effectivePrice === 'number' ? `৳${effectivePrice.toLocaleString()}` : '';
    const text = encodeURIComponent(
      `${product.title}${priceText ? ' - ' + priceText : ''}\nRasel Babu Official Store\n\n${shareUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  // Order submission
  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName || !custPhone || !custAddress) {
      alert('Please fill in Name, Phone, and Delivery Address.');
      return;
    }

    placeOrder({
      userId: currentUser?.id,
      customerName: custName,
      customerEmail: currentUser?.email || 'guest@fan.raselbabu.com',
      customerPhone: custPhone,
      deliveryAddress: custAddress,
      productId: product.id,
      productTitle: product.title,
      productPrice: effectivePrice,
      size: selectedSize || undefined,
      quantity: 1,
      totalAmount: effectivePrice,
      paymentMethod: custPayment,
      notes: custNotes || undefined,
    });

    setOrderSuccess(`Order placed successfully! Total: ৳${effectivePrice.toLocaleString()} BDT.`);
  };

  // Related products from the same category or general catalog
  const relatedProducts = products
    .filter((p) => p.id !== product.id && (p.category === product.category || products.length <= 4))
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Top Navigation Bar & Breadcrumb */}
        <div className="flex items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
          <button
            onClick={() => onNavigate('/shop')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-semibold transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400 group-hover:-translate-x-1 transition-transform" />
            <span>Return to Shop (শপে ফিরে যান)</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareWhatsApp}
              className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Share to WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">WhatsApp Share</span>
            </button>

            <button
              onClick={handleCopyShare}
              className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Copy Product Link"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Main Product Presentation Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start bg-gradient-to-b from-zinc-900/60 via-zinc-950 to-black p-6 sm:p-10 rounded-3xl border border-amber-500/20 shadow-2xl">
          
          {/* LEFT: Multi-Photo Gallery (Large Active Photo + Thumbnails) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-square sm:aspect-[4/3] rounded-2xl overflow-hidden bg-black border border-zinc-800 flex items-center justify-center group shadow-2xl">
              <img
                src={allImages[activePhotoIndex] || product.imageUrl}
                alt={`${product.title} - Photo ${activePhotoIndex + 1}`}
                className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
              />

              {/* Offer Discount Badge on Image */}
              {hasOffer && (
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-gradient-to-r from-red-600 to-pink-600 text-white font-extrabold text-xs shadow-lg uppercase tracking-wider">
                  {discountPercent}% OFF (ছাড়)
                </span>
              )}

              {/* Stock Status Badge */}
              <span
                className={`absolute top-4 right-4 px-3 py-1 rounded-lg text-xs font-mono uppercase tracking-wider backdrop-blur-md shadow-md ${
                  product.inStock
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                    : 'bg-red-950/80 text-red-300 border border-red-500/40'
                }`}
              >
                {product.inStock ? '● In Stock' : '● Sold Out'}
              </span>

              {/* Photo Navigation Arrows */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setActivePhotoIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/70 hover:bg-black text-white hover:text-amber-400 transition-all border border-zinc-700 cursor-pointer shadow-lg"
                    title="Previous Photo"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setActivePhotoIndex((prev) => (prev + 1) % allImages.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/70 hover:bg-black text-white hover:text-amber-400 transition-all border border-zinc-700 cursor-pointer shadow-lg"
                    title="Next Photo"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-zinc-700 text-[11px] font-mono text-zinc-200">
                    ছবি {activePhotoIndex + 1} / {allImages.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail Row */}
            {allImages.length > 1 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400 px-1">
                  <span>PRODUCT PHOTOS ({allImages.length} টি ছবি)</span>
                  <span className="text-amber-400 text-[11px]">ক্লিক করে ভিউ পরিবর্তন করুন</span>
                </div>
                <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActivePhotoIndex(idx)}
                      className={`relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                        activePhotoIndex === idx
                          ? 'border-amber-400 ring-2 ring-amber-400/50 scale-105 shadow-md shadow-amber-400/20'
                          : 'border-zinc-800 opacity-60 hover:opacity-100 hover:border-zinc-600'
                      }`}
                    >
                      <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                      <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[10px] font-mono text-center text-zinc-300 py-0.5">
                        {idx === 0 ? 'Main' : `Photo ${idx + 1}`}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Product Details & Purchase Actions */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              
              {/* Category & Badge */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-mono uppercase tracking-wider font-semibold">
                  {product.category === 'dress'
                    ? 'Dresses & Three-Piece (থ্রি-পিস ও পোশাক)'
                    : product.category === 'merch'
                    ? 'Apparel & Merch (টি-শার্ট ও মার্চ)'
                    : product.category === 'vinyl'
                    ? 'Vinyl & CD (ভিনাইল ও সিডি)'
                    : product.category}
                </span>
                {product.badge && (
                  <span className="px-3 py-1 rounded-full bg-amber-400 text-black text-xs font-bold uppercase tracking-wider shadow-md">
                    {product.badge}
                  </span>
                )}
              </div>

              {/* Product Title */}
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
                {product.title}
              </h1>

              {/* Price & Offer Display Box */}
              <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-baseline justify-between shadow-inner">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-1">
                    Price (মূল্য)
                  </span>
                  {hasOffer ? (
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <span className="font-mono text-3xl sm:text-4xl font-extrabold text-amber-300">
                        ৳{product.offerPrice?.toLocaleString()}
                      </span>
                      <del className="font-mono text-base text-zinc-500">
                        ৳{product.price.toLocaleString()}
                      </del>
                      <span className="text-xs font-bold font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                        Save ৳{((product.price || 0) - (product.offerPrice || 0)).toLocaleString()}
                      </span>
                    </div>
                  ) : (
                    <span className="font-mono text-3xl sm:text-4xl font-extrabold text-white text-gold-gradient">
                      ৳{product.price.toLocaleString()} {product.currency}
                    </span>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">
                    Delivery
                  </span>
                  <span className="text-xs font-semibold text-amber-400">All Bangladesh</span>
                </div>
              </div>

              {/* Size Selector */}
              {(product.category === 'dress' || (product.sizes && product.sizes.length > 0)) && (
                <div className="space-y-2.5 p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80">
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
                  <div className="flex flex-wrap gap-2.5">
                    {(product.sizes && product.sizes.length > 0
                      ? product.sizes
                      : ['36', '38', '40', '42', '44']
                    ).map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSelectedSize(sz)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                          selectedSize === sz
                            ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/25 ring-2 ring-amber-300'
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
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                  Product Description (পণ্যের বিবরণ):
                </span>
                <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-950/60 p-5 rounded-2xl border border-zinc-800/60 whitespace-pre-line">
                  {product.description}
                </p>
              </div>

              {/* Delivery & Assurance Perks */}
              <div className="grid grid-cols-2 gap-3 text-xs text-zinc-400 font-mono">
                <div className="flex items-center gap-2 p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                  <Truck className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>ক্যাশ অন ডেলিভারি / বিকাশ</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>১০০% অরিজিনাল কোয়ালিটি</span>
                </div>
              </div>
            </div>

            {/* Purchase & Share Action Buttons */}
            <div className="space-y-4 pt-4 border-t border-zinc-800/80">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() => setIsOrderModalOpen(true)}
                  disabled={!product.inStock}
                  className={`w-full sm:flex-1 py-4 px-8 rounded-2xl text-sm font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-2xl ${
                    product.inStock
                      ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 text-black shadow-amber-400/25 cursor-pointer ring-1 ring-amber-300'
                      : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  }`}
                >
                  <ShoppingBag className="w-5 h-5 text-black" />
                  <span>{product.inStock ? 'Order Now (এখনই অর্ডার করুন)' : 'Sold Out (স্টক শেষ)'}</span>
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleShareWhatsApp}
                    className="flex-1 sm:flex-initial px-4 py-3.5 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    title="Share to WhatsApp"
                  >
                    <Share2 className="w-4 h-4 text-emerald-400" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleShareFacebook}
                    className="flex-1 sm:flex-initial px-4 py-3.5 rounded-2xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    title="Share to Facebook"
                  >
                    <span>Facebook</span>
                  </button>
                </div>
              </div>

              {product.buyUrl && (
                <a
                  href={product.buyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-amber-400 text-xs font-mono flex items-center justify-center gap-2 transition-colors"
                >
                  <span>Open External Store Link</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* RELATED PRODUCTS SECTION */}
        {relatedProducts.length > 0 && (
          <div className="space-y-6 pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold font-display text-white">
                  Related Products (অন্যান্য পণ্যসমূহ)
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Explore more exclusive items from Rasel Babu Official Store.
                </p>
              </div>

              <button
                onClick={() => onNavigate('/shop')}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>View All Shop</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {relatedProducts.map((rel) => {
                const relHasOffer = rel.offerPrice && rel.offerPrice > 0 && rel.offerPrice < rel.price;
                return (
                  <div
                    key={rel.id}
                    onClick={() => onNavigate('/product-detail', rel.id)}
                    className="group rounded-2xl overflow-hidden bg-zinc-900/50 border border-zinc-800 hover:border-amber-500/40 p-4 space-y-3 cursor-pointer transition-all hover:bg-zinc-900 shadow-xl"
                  >
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-zinc-950">
                      <img
                        src={rel.imageUrl}
                        alt={rel.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {rel.badge && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-amber-400 text-black text-[9px] font-bold uppercase tracking-wider">
                          {rel.badge}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-semibold text-white text-sm group-hover:text-amber-200 transition-colors line-clamp-1">
                        {rel.title}
                      </h4>
                      <div className="flex items-baseline gap-2">
                        {relHasOffer ? (
                          <>
                            <span className="font-mono text-sm font-bold text-amber-400">
                              ৳{rel.offerPrice?.toLocaleString()}
                            </span>
                            <del className="font-mono text-xs text-zinc-500">
                              ৳{rel.price.toLocaleString()}
                            </del>
                          </>
                        ) : (
                          <span className="font-mono text-sm font-bold text-white">
                            ৳{rel.price.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-1 flex items-center justify-between text-xs text-zinc-400 group-hover:text-amber-400">
                      <span>View Details &rarr;</span>
                      <Eye className="w-3.5 h-3.5" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Adsterra Monetization Slot */}
        <div className="pt-6">
          <AdSlot format="728x90" page="shop" responsive />
        </div>

      </div>

      {/* FAST ORDER MODAL */}
      {isOrderModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in"
          onClick={() => setIsOrderModalOpen(false)}
        >
          <div
            className="relative w-full max-w-lg bg-zinc-950 border border-amber-500/40 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-400" />
                <h3 className="font-display text-lg font-bold text-white">
                  Place Customer Order / অর্ডার করুন
                </h3>
              </div>
              <button
                onClick={() => setIsOrderModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Product summary banner */}
            <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center gap-3">
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-16 h-16 rounded-lg object-cover shrink-0 border border-zinc-700"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-semibold text-white truncate">{product.title}</h4>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-sm text-amber-400 font-mono font-bold">
                    ৳{effectivePrice.toLocaleString()} {product.currency}
                  </span>
                  {hasOffer && (
                    <del className="text-xs text-zinc-500 font-mono">
                      ৳{product.price.toLocaleString()}
                    </del>
                  )}
                </div>
                {selectedSize && (
                  <span className="text-[11px] font-mono text-zinc-400 block mt-0.5">
                    Size: <strong className="text-amber-300">{selectedSize}</strong>
                  </span>
                )}
              </div>
            </div>

            {orderSuccess ? (
              <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white">ধন্যবাদ! আপনার অর্ডার গৃহীত হয়েছে।</h4>
                  <p className="text-xs text-emerald-300 font-mono">{orderSuccess}</p>
                  <p className="text-xs text-zinc-400">
                    আমাদের সাপোর্ট টিম শীঘ্রই ডেলিভারি কনফার্মেশনের জন্য কল করবে।
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      setIsOrderModalOpen(false);
                      setOrderSuccess(null);
                    }}
                    className="px-5 py-2 rounded-xl bg-zinc-800 text-xs font-semibold text-white hover:bg-zinc-700 transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setIsOrderModalOpen(false);
                      setOrderSuccess(null);
                      onNavigate('/shop');
                    }}
                    className="px-5 py-2 rounded-xl bg-amber-400 text-black font-bold text-xs hover:bg-amber-300 transition-colors cursor-pointer"
                  >
                    Track in Shop &rarr;
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                {/* Size Selector for Dress & Three Piece */}
                {(product.category === 'dress' || (product.sizes && product.sizes.length > 0)) && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-zinc-400">Select Size (সাইজ):</label>
                    <div className="flex flex-wrap gap-2">
                      {(product.sizes || ['36', '38', '40', '42']).map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setSelectedSize(sz)}
                          className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                            selectedSize === sz
                              ? 'bg-amber-400 text-black ring-1 ring-amber-300'
                              : 'bg-zinc-900 text-zinc-300 border border-zinc-800 hover:border-zinc-700'
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-zinc-400">Your Full Name (আপনার নাম) *</label>
                  <input
                    type="text"
                    required
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    placeholder="e.g. Shakil Ahmed"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-zinc-400">Mobile Phone (মোবাইল নম্বর) *</label>
                  <input
                    type="tel"
                    required
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    placeholder="e.g. 017XXXXXXXX"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-zinc-400">Delivery Address (সম্পূর্ণ ঠিকানা) *</label>
                  <textarea
                    required
                    rows={2}
                    value={custAddress}
                    onChange={(e) => setCustAddress(e.target.value)}
                    placeholder="House/Road, Thana, District (বাসা/রোড, থানা, জেলা)"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-zinc-400">Payment Option (পেমেন্ট পদ্ধতি):</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['Cash on Delivery', 'bKash', 'Nagad', 'Card'] as const).map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setCustPayment(method)}
                        className={`p-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                          custPayment === method
                            ? 'bg-amber-400/20 text-amber-300 border-amber-400/50'
                            : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                        }`}
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>{method}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-zinc-400">Special Instructions (ঐচ্ছিক নোট):</label>
                  <input
                    type="text"
                    value={custNotes}
                    onChange={(e) => setCustNotes(e.target.value)}
                    placeholder="Any specific delivery instructions..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-amber-400/25 transition-all cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Confirm Order (৳{effectivePrice.toLocaleString()} BDT)</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
