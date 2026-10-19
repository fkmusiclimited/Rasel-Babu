import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { AdSlot } from '../components/ads/AdSlot';
import {
  ShoppingBag,
  ExternalLink,
  Plus,
  Edit,
  Trash2,
  Check,
  Search,
  Sparkles,
  CreditCard,
  Truck,
  ShieldCheck,
  Phone,
  MapPin,
  X,
  Tag,
  ArrowRight,
  Package,
  Clock,
  CheckCircle2,
  MessageCircle,
  Send,
  Upload,
  Image as ImageIcon,
  User,
  AlertCircle,
  Eye,
  Camera,
} from 'lucide-react';
import { Product, OrderItem, UserMessage } from '../types';
import { TRADITIONAL_PUNJABI_IMAGE } from '../data/seedData';

export const Shop: React.FC = () => {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    openProductView,
    placeOrder,
    orders,
    userMessages,
    sendUserMessage,
  } = useData();
  const { currentUser, isAdminOrManager } = useAuth();

  // Navigation tab within shop: Catalog vs Track Orders
  const [activeView, setActiveView] = useState<'catalog' | 'tracking'>('catalog');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Checkout / Buy Modal state
  const [buyingProduct, setBuyingProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [custName, setCustName] = useState(currentUser?.name || '');
  const [custEmail, setCustEmail] = useState(currentUser?.email || '');
  const [custPhone, setCustPhone] = useState(currentUser?.phone || '');
  const [custAddress, setCustAddress] = useState('');
  const [custPayment, setCustPayment] = useState<'Cash on Delivery' | 'bKash' | 'Nagad' | 'Card'>('bKash');
  const [custNotes, setCustNotes] = useState('');
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  // Tracking query state (for guest or lookup)
  const [trackingSearchQuery, setTrackingSearchQuery] = useState('');

  // Customer Order Messaging Modal
  const [messagingOrder, setMessagingOrder] = useState<OrderItem | null>(null);
  const [orderMsgText, setOrderMsgText] = useState('');
  const [orderMsgSentSuccess, setOrderMsgSentSuccess] = useState<string | null>(null);

  // Admin Add / Edit Product Modal state
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formPrice, setFormPrice] = useState(1500);
  const [formOfferPrice, setFormOfferPrice] = useState<number | ''>(1250);
  const [formCurrency, setFormCurrency] = useState('BDT');
  const [formCategory, setFormCategory] = useState<Product['category']>('dress');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formExtraImg1, setFormExtraImg1] = useState('');
  const [formExtraImg2, setFormExtraImg2] = useState('');
  const [formExtraImg3, setFormExtraImg3] = useState('');
  const [formSizes, setFormSizes] = useState('36, 38, 40, 42');
  const [formDescription, setFormDescription] = useState('');
  const [formBuyUrl, setFormBuyUrl] = useState('');
  const [formBadge, setFormBadge] = useState('Exclusive Three-Piece');
  const [formInStock, setFormInStock] = useState(true);

  const handleExtraPhotoUpload = (slot: 1 | 2 | 3, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          if (slot === 1) setFormExtraImg1(reader.result);
          if (slot === 2) setFormExtraImg2(reader.result);
          if (slot === 3) setFormExtraImg3(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const categories = [
    { id: 'all', label: 'All Items (সকল পণ্য)' },
    { id: 'dress', label: 'Dresses & Three-Piece (থ্রি-পিস ও পোশাক)' },
    { id: 'merch', label: 'Apparel & Merch (টি-শার্ট ও মার্চ)' },
    { id: 'vinyl', label: 'Vinyl & CD (ভিনাইল ও সিডি)' },
    { id: 'tickets', label: 'Concert Passes (কনসার্ট টিকেট)' },
    { id: 'digital', label: 'Digital Music (ডিজিটাল অ্যালবাম)' },
    { id: 'gear', label: 'Sound Gear (সাউন্ড গিয়ার)' },
  ];

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // User's own orders
  const userOrders = orders.filter((o) => {
    if (currentUser) {
      if (o.userId && o.userId === currentUser.id) return true;
      if (o.customerEmail && o.customerEmail.toLowerCase() === currentUser.email.toLowerCase()) return true;
    }
    if (trackingSearchQuery.trim()) {
      const q = trackingSearchQuery.trim().toLowerCase();
      return o.id.toLowerCase().includes(q) || o.customerPhone.includes(q);
    }
    return false;
  });

  const handleOpenBuy = (product: Product) => {
    setBuyingProduct(product);
    setOrderQuantity(1);
    setSelectedSize(product.sizes?.[0] || (product.category === 'dress' ? '38' : 'Standard'));
    setCustName(currentUser?.name || '');
    setCustEmail(currentUser?.email || '');
    setCustPhone(currentUser?.phone || '');
    setOrderSuccess(null);
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyingProduct) return;

    const effectivePrice = (buyingProduct.offerPrice && buyingProduct.offerPrice > 0)
      ? buyingProduct.offerPrice
      : buyingProduct.price;
    const total = effectivePrice * orderQuantity;

    const newOrder = placeOrder({
      productId: buyingProduct.id,
      productTitle: buyingProduct.title,
      productPrice: effectivePrice,
      customerName: custName,
      customerEmail: custEmail || currentUser?.email || '',
      customerPhone: custPhone,
      deliveryAddress: custAddress,
      quantity: orderQuantity,
      size: selectedSize || (buyingProduct.sizes?.[0] || 'Standard'),
      totalAmount: total,
      paymentMethod: custPayment,
      notes: custNotes,
      userId: currentUser?.id,
    });

    setOrderSuccess(
      `Order #${newOrder.id.slice(-6).toUpperCase()} placed successfully! Tracking is active in "Track My Orders".`
    );
    setBuyingProduct(null);
    setCustAddress('');
    setCustNotes('');
  };

  const handleOpenAddProduct = () => {
    setEditingProductId(null);
    setFormTitle('');
    setFormPrice(3200);
    setFormOfferPrice(2700);
    setFormCurrency('BDT');
    setFormCategory('dress');
    setFormImageUrl(TRADITIONAL_PUNJABI_IMAGE);
    setFormExtraImg1('');
    setFormExtraImg2('');
    setFormExtraImg3('');
    setFormSizes('36, 38, 40, 42, 44');
    setFormDescription('Exclusive designer cotton three-piece with authentic embroidery work and pure chiffon dupatta.');
    setFormBuyUrl('');
    setFormBadge('New Three-Piece');
    setFormInStock(true);
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProductId(prod.id);
    setFormTitle(prod.title);
    setFormPrice(prod.price);
    setFormOfferPrice(prod.offerPrice ?? '');
    setFormCurrency(prod.currency);
    setFormCategory(prod.category);
    setFormImageUrl(prod.imageUrl);
    setFormExtraImg1(prod.additionalImages?.[0] || '');
    setFormExtraImg2(prod.additionalImages?.[1] || '');
    setFormExtraImg3(prod.additionalImages?.[2] || '');
    setFormSizes(prod.sizes ? prod.sizes.join(', ') : '');
    setFormDescription(prod.description);
    setFormBuyUrl(prod.buyUrl || '');
    setFormBadge(prod.badge || '');
    setFormInStock(prod.inStock);
    setShowProductModal(true);
  };

  // Image file reader upload
  const handlePhotoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setFormImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProductForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle) return;

    const parsedSizes = formSizes
      ? formSizes.split(',').map((s) => s.trim()).filter(Boolean)
      : undefined;

    const numericOffer = formOfferPrice !== '' ? Number(formOfferPrice) : undefined;
    const additionalImages = [formExtraImg1, formExtraImg2, formExtraImg3].filter(
      (img) => img && img.trim().length > 0
    );

    if (editingProductId) {
      updateProduct(editingProductId, {
        title: formTitle,
        price: Number(formPrice),
        offerPrice: numericOffer,
        currency: formCurrency,
        category: formCategory,
        imageUrl: formImageUrl,
        additionalImages,
        sizes: parsedSizes,
        description: formDescription,
        buyUrl: formBuyUrl,
        badge: formBadge,
        inStock: formInStock,
      });
    } else {
      addProduct({
        title: formTitle,
        price: Number(formPrice),
        offerPrice: numericOffer,
        currency: formCurrency,
        category: formCategory,
        imageUrl: formImageUrl || TRADITIONAL_PUNJABI_IMAGE,
        additionalImages,
        sizes: parsedSizes,
        description: formDescription,
        buyUrl: formBuyUrl,
        badge: formBadge,
        inStock: formInStock,
      });
    }

    setShowProductModal(false);
  };

  // Send message regarding order
  const handleSendOrderMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messagingOrder || !orderMsgText.trim()) return;

    sendUserMessage({
      userId: currentUser?.id || 'guest-' + messagingOrder.customerPhone,
      userName: currentUser?.name || messagingOrder.customerName,
      userEmail: currentUser?.email || messagingOrder.customerEmail || 'buyer@fkmusic.com',
      subject: `Order Inquiry: #${messagingOrder.id.slice(-6).toUpperCase()} - ${messagingOrder.productTitle}`,
      message: orderMsgText.trim(),
      category: 'Technical Support',
    });

    setOrderMsgSentSuccess(`Message sent to Store Admin! Our team will reply shortly.`);
    setOrderMsgText('');
    setTimeout(() => {
      setOrderMsgSentSuccess(null);
      setMessagingOrder(null);
    }, 2500);
  };

  const getStatusBadge = (status: OrderItem['status']) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Pending (যাচাই চলছে)',
          bg: 'bg-amber-950/80 text-amber-300 border-amber-500/40',
          step: 1,
        };
      case 'confirmed':
        return {
          label: 'Confirmed & Packing (অর্ডার নিশ্চিত)',
          bg: 'bg-sky-950/80 text-sky-300 border-sky-500/40',
          step: 2,
        };
      case 'shipped':
        return {
          label: 'Shipped / In Transit (কুরিয়ারে পাঠানো হয়েছে)',
          bg: 'bg-purple-950/80 text-purple-300 border-purple-500/40',
          step: 3,
        };
      case 'delivered':
        return {
          label: 'Delivered (সফলভাবে পৌঁছেছে)',
          bg: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40',
          step: 4,
        };
      case 'cancelled':
        return {
          label: 'Cancelled (বাতিল)',
          bg: 'bg-red-950/80 text-red-300 border-red-500/40',
          step: 0,
        };
      default:
        return {
          label: 'Processing',
          bg: 'bg-zinc-800 text-zinc-300 border-zinc-700',
          step: 1,
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header & Quick Management */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-800 pb-6">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400">
              Official Store &amp; Apparel Catalog
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-white tracking-tight">
              Rasel Babu Official Store &amp; Dresses
            </h1>
            <p className="text-sm text-zinc-400">
              Exclusive traditional three-piece collections (থ্রি-পিস ও পোশাক), autographed concert apparel, limited edition vinyl, and VIP passes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isAdminOrManager && (
              <button
                onClick={handleOpenAddProduct}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-black font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-400/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Product (নতুন পণ্য যোগ করুন)</span>
              </button>
            )}
          </div>
        </div>

        {/* Success toast */}
        {orderSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs sm:text-sm flex items-center justify-between shadow-xl animate-fade-in">
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{orderSuccess}</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setActiveView('tracking');
                  setOrderSuccess(null);
                }}
                className="text-xs font-bold text-amber-400 hover:underline"
              >
                View in Track Orders &rarr;
              </button>
              <button
                onClick={() => setOrderSuccess(null)}
                className="text-xs text-zinc-400 hover:text-white"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* View Switcher: Catalog vs Track My Orders */}
        <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
          <button
            onClick={() => setActiveView('catalog')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeView === 'catalog'
                ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Store Catalog (সকল পণ্য ও থ্রি-পিস)</span>
          </button>

          <button
            onClick={() => setActiveView('tracking')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeView === 'tracking'
                ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Track My Orders &amp; Live Status (অর্ডার ট্র্যাকিং ও মেসেজ)</span>
            {currentUser && userOrders.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-pink-600 text-white text-[10px] font-mono">
                {userOrders.length}
              </span>
            )}
          </button>
        </div>

        {/* =========================================================================
            VIEW 1: STORE CATALOG
        ========================================================================= */}
        {activeView === 'catalog' && (
          <div className="space-y-8 animate-fade-in">
            {/* Store Trust Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80 flex items-center gap-3 text-xs">
                <ShieldCheck className="w-6 h-6 text-amber-400 shrink-0" />
                <div>
                  <p className="font-semibold text-white">100% Authentic Quality</p>
                  <p className="text-zinc-400 text-[11px]">Directly authorized by Rasel Babu management</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80 flex items-center gap-3 text-xs">
                <Truck className="w-6 h-6 text-pink-400 shrink-0" />
                <div>
                  <p className="font-semibold text-white">Nationwide Express Delivery</p>
                  <p className="text-zinc-400 text-[11px]">Home delivery across all districts of Bangladesh</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80 flex items-center gap-3 text-xs">
                <CreditCard className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <p className="font-semibold text-white">bKash, Nagad &amp; Cash on Delivery</p>
                  <p className="text-zinc-400 text-[11px]">Pay on delivery or mobile banking with ease</p>
                </div>
              </div>
            </div>

            {/* Filter Bar & Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-amber-400 text-black font-semibold shadow-md shadow-amber-400/20'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="relative min-w-[220px]">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search dress, three piece, merch..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => {
                const hasOffer = product.offerPrice && product.offerPrice > 0 && product.offerPrice < product.price;
                const discountPercent = hasOffer
                  ? Math.round(((product.price - (product.offerPrice as number)) / product.price) * 100)
                  : 0;

                return (
                  <div
                    key={product.id}
                    className="rounded-2xl overflow-hidden bg-zinc-900/50 border border-zinc-800 hover:border-amber-500/40 transition-all flex flex-col group relative shadow-xl"
                  >
                    {/* Product Image - Click to view */}
                    <div
                      onClick={() => openProductView(product)}
                      className="relative aspect-[4/3] bg-zinc-950 overflow-hidden cursor-pointer"
                      title="Click to view all photos and details (ছবি ও বিস্তারিত দেখতে ক্লিক করুন)"
                    >
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                      {/* Badge */}
                      {product.badge && (
                        <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-amber-400 text-black font-bold text-[10px] uppercase tracking-wider shadow-md">
                          {product.badge}
                        </span>
                      )}

                      {/* Offer Discount Badge */}
                      {hasOffer && (
                        <span className="absolute top-10 left-3 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-red-600 to-pink-600 text-white font-extrabold text-[10px] uppercase tracking-wider shadow-md">
                          {discountPercent}% OFF (ছাড়)
                        </span>
                      )}

                      {/* Additional Photos Count Badge */}
                      {product.additionalImages && product.additionalImages.length > 0 && (
                        <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-amber-300 border border-amber-500/40 text-[10px] font-mono flex items-center gap-1 shadow-md">
                          <Camera className="w-3 h-3 text-amber-400" />
                          <span>+{product.additionalImages.length} Photos</span>
                        </span>
                      )}

                      {/* Stock Status */}
                      <span
                        className={`absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider backdrop-blur-md ${
                          product.inStock
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                            : 'bg-red-950/80 text-red-300 border border-red-500/30'
                        }`}
                      >
                        {product.inStock ? 'In Stock' : 'Sold Out'}
                      </span>

                      {/* Admin Quick Action */}
                      {isAdminOrManager && (
                        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 opacity-90">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditProduct(product);
                            }}
                            className="p-1.5 rounded-lg bg-black/80 text-amber-300 hover:bg-amber-400 hover:text-black transition-colors cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Delete product "${product.title}"?`)) {
                                deleteProduct(product.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-black/80 text-red-400 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400">
                            {product.category === 'dress' ? 'Dresses & Three-Piece' : product.category}
                          </span>

                          {/* Price & Offer Price Display */}
                          <div className="text-right">
                            {hasOffer ? (
                              <div className="flex items-baseline gap-2">
                                <span className="font-mono text-lg font-bold text-amber-300">
                                  ৳{product.offerPrice?.toLocaleString()}
                                </span>
                                <del className="font-mono text-xs text-zinc-500">
                                  ৳{product.price.toLocaleString()}
                                </del>
                              </div>
                            ) : (
                              <span className="font-mono text-base font-bold text-white text-gold-gradient">
                                ৳{product.price.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>

                        <h3
                          onClick={() => openProductView(product)}
                          className="font-semibold text-white group-hover:text-amber-200 transition-colors line-clamp-1 cursor-pointer hover:underline"
                          title="Click to view details (বিস্তারিত দেখুন)"
                        >
                          {product.title}
                        </h3>

                        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>

                        {/* Available Sizes for Dress & Three-Piece */}
                        {(product.category === 'dress' || (product.sizes && product.sizes.length > 0)) && (
                          <div className="pt-1 flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] text-zinc-400 font-mono">Sizes:</span>
                            {(product.sizes || ['36', '38', '40', '42']).map((sz) => (
                              <span
                                key={sz}
                                className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] font-mono text-zinc-300 border border-zinc-700"
                              >
                                {sz}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons: View Details & Buy */}
                      <div className="pt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openProductView(product)}
                          className="px-3 py-2.5 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          title="View all photos and details (ছবি ও বিবরণ দেখুন)"
                        >
                          <Eye className="w-3.5 h-3.5 text-amber-400" />
                          <span>View</span>
                        </button>

                        <button
                          onClick={() => handleOpenBuy(product)}
                          disabled={!product.inStock}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                            product.inStock
                              ? 'bg-amber-400 hover:bg-amber-300 text-black shadow-md shadow-amber-400/20 cursor-pointer'
                              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                          }`}
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>{product.inStock ? 'Order Now / কিনুন' : 'Sold Out'}</span>
                        </button>

                        {product.buyUrl && (
                          <a
                            href={product.buyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors border border-zinc-700"
                            title="Open External Buy Link"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            VIEW 2: TRACK MY ORDERS & MESSAGES (FOR SIGNED UP USERS & GUESTS)
        ========================================================================= */}
        {activeView === 'tracking' && (
          <div className="space-y-8 animate-fade-in">
            {/* Header / Search Banner */}
            <div className="p-6 rounded-3xl bg-zinc-900/60 border border-amber-500/30 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
                    <Truck className="w-6 h-6 text-amber-400" />
                    <span>Customer Order Tracking &amp; Status (অর্ডার ট্র্যাকিং)</span>
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    {currentUser
                      ? `Signed in as ${currentUser.name} (${currentUser.email}). View your orders and dispatch updates.`
                      : 'Signed-up users automatically see their orders here. Guests can search by Order ID or phone.'}
                  </p>
                </div>

                {/* Lookup Bar */}
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Order ID or Phone number..."
                      value={trackingSearchQuery}
                      onChange={(e) => setTrackingSearchQuery(e.target.value)}
                      className="bg-zinc-950 border border-zinc-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 w-56 font-mono"
                    />
                  </div>
                  {trackingSearchQuery && (
                    <button
                      onClick={() => setTrackingSearchQuery('')}
                      className="px-2.5 py-2 rounded-xl bg-zinc-800 text-xs text-zinc-400 hover:text-white"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Orders List */}
            {userOrders.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-zinc-900/30 border border-zinc-800 space-y-4">
                <Package className="w-12 h-12 text-zinc-600 mx-auto" />
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-white">No Orders Found</h3>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                    {currentUser
                      ? "You haven't placed any store orders yet with this account. Explore our products and order online!"
                      : 'Please sign up or log in to track your placed orders, or enter your mobile number above.'}
                  </p>
                </div>
                <button
                  onClick={() => setActiveView('catalog')}
                  className="px-5 py-2.5 rounded-xl bg-amber-400 text-black font-bold text-xs hover:bg-amber-300 transition-colors cursor-pointer"
                >
                  Explore Store Catalog &rarr;
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {userOrders.map((ord) => {
                  const statusInfo = getStatusBadge(ord.status);
                  // Associated product
                  const associatedProduct = products.find((p) => p.id === ord.productId);

                  return (
                    <div
                      key={ord.id}
                      className="p-6 rounded-3xl bg-zinc-900/50 border border-zinc-800 space-y-6 shadow-xl relative overflow-hidden"
                    >
                      {/* Top Bar: Order ID, Date & Live Status */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold font-mono text-amber-400">
                              Order #{ord.id.slice(-6).toUpperCase()}
                            </span>
                            <span className="text-xs text-zinc-500 font-mono">
                              · {new Date(ord.orderDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400 mt-0.5">
                            Customer: <strong className="text-white">{ord.customerName}</strong> ({ord.customerPhone})
                          </p>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full border text-xs font-bold font-mono ${statusInfo.bg}`}>
                            {statusInfo.label}
                          </span>

                          <button
                            onClick={() => setMessagingOrder(ord)}
                            className="px-3.5 py-1 rounded-xl bg-zinc-800 hover:bg-amber-400 hover:text-black text-zinc-300 border border-zinc-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Message Support</span>
                          </button>
                        </div>
                      </div>

                      {/* 4-Step Progress Tracker */}
                      {ord.status !== 'cancelled' && (
                        <div className="space-y-2 py-2">
                          <span className="text-[11px] font-mono uppercase text-zinc-400">
                            Shipment &amp; Delivery Progress:
                          </span>
                          <div className="grid grid-cols-4 gap-2">
                            {[
                              { step: 1, label: 'Order Placed (অর্ডার গৃহীত)' },
                              { step: 2, label: 'Confirmed (প্যাকিং চলছে)' },
                              { step: 3, label: 'In Transit (শিপিং চলছে)' },
                              { step: 4, label: 'Delivered (ডেলিভার্ড)' },
                            ].map((s) => {
                              const isCompleted = statusInfo.step >= s.step;
                              const isCurrent = statusInfo.step === s.step;

                              return (
                                <div key={s.step} className="space-y-1 text-center">
                                  <div
                                    className={`h-2 rounded-full transition-all ${
                                      isCompleted
                                        ? 'bg-amber-400 shadow-sm shadow-amber-400/50'
                                        : 'bg-zinc-800'
                                    } ${isCurrent ? 'animate-pulse' : ''}`}
                                  />
                                  <p
                                    className={`text-[10px] font-mono leading-tight ${
                                      isCompleted ? 'text-amber-300 font-bold' : 'text-zinc-500'
                                    }`}
                                  >
                                    {s.label}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Order Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-zinc-950/60 p-4 rounded-2xl border border-zinc-800/80">
                        {/* Product Thumbnail */}
                        <div className="md:col-span-2">
                          <img
                            src={associatedProduct?.imageUrl || TRADITIONAL_PUNJABI_IMAGE}
                            alt={ord.productTitle}
                            className="w-20 h-20 rounded-xl object-cover border border-zinc-800"
                          />
                        </div>

                        {/* Title, Size, Qty */}
                        <div className="md:col-span-5 space-y-1">
                          <h4 className="text-sm font-bold text-white">{ord.productTitle}</h4>
                          <div className="flex items-center gap-3 text-xs text-zinc-400">
                            {ord.size && (
                              <span className="px-2 py-0.5 rounded bg-zinc-800 text-amber-300 font-mono text-[11px] border border-zinc-700">
                                Selected Size: <strong>{ord.size}</strong>
                              </span>
                            )}
                            <span>Quantity: <strong>{ord.quantity}</strong></span>
                          </div>
                          <p className="text-[11px] text-zinc-400 flex items-center gap-1 mt-1 truncate">
                            <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                            <span>{ord.deliveryAddress}</span>
                          </p>
                        </div>

                        {/* Pricing & Payment Info */}
                        <div className="md:col-span-5 text-left md:text-right space-y-1">
                          <p className="text-xs text-zinc-400">Total Payable Amount</p>
                          <p className="text-xl font-mono font-bold text-emerald-400">
                            ৳{ord.totalAmount.toLocaleString()} BDT
                          </p>
                          <p className="text-[11px] text-zinc-400 font-mono">
                            Payment: <span className="text-white font-medium">{ord.paymentMethod}</span>
                          </p>
                          {ord.notes && (
                            <p className="text-[10px] text-zinc-500 italic">
                              Note: {ord.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            MODAL 1: FAST CHECKOUT / BUY MODAL (WITH SIZE SELECTOR & OFFER PRICE)
        ========================================================================= */}
        {buyingProduct && (
          <div
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in"
            onClick={() => setBuyingProduct(null)}
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
                  onClick={() => setBuyingProduct(null)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Product summary banner */}
              <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center gap-3">
                <img
                  src={buyingProduct.imageUrl}
                  alt={buyingProduct.title}
                  className="w-16 h-16 rounded-lg object-cover shrink-0 border border-zinc-700"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-white truncate">
                    {buyingProduct.title}
                  </h4>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    {buyingProduct.offerPrice && buyingProduct.offerPrice > 0 ? (
                      <>
                        <span className="text-sm text-amber-400 font-mono font-bold">
                          Offer Price: ৳{buyingProduct.offerPrice.toLocaleString()} {buyingProduct.currency}
                        </span>
                        <del className="text-xs text-zinc-500 font-mono">
                          ৳{buyingProduct.price.toLocaleString()}
                        </del>
                      </>
                    ) : (
                      <span className="text-sm text-amber-400 font-mono font-bold">
                        Price: ৳{buyingProduct.price.toLocaleString()} {buyingProduct.currency}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                {/* Size Selector for Dress & Three Piece */}
                {(buyingProduct.category === 'dress' || (buyingProduct.sizes && buyingProduct.sizes.length > 0)) && (
                  <div className="space-y-2 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                    <label className="text-xs font-semibold text-white flex items-center justify-between">
                      <span>Select Size (পোশাক / থ্রি-পিস সাইজ নির্বাচন করুন):</span>
                      <span className="text-amber-400 font-mono font-bold">{selectedSize}</span>
                    </label>
                    <div className="flex items-center gap-2 flex-wrap">
                      {(buyingProduct.sizes && buyingProduct.sizes.length > 0
                        ? buyingProduct.sizes
                        : ['36', '38', '40', '42', '44', 'Free Size']
                      ).map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setSelectedSize(sz)}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                            selectedSize === sz
                              ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
                              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity and Total Payable */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-300">Quantity (পরিমাণ)</label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      required
                      value={orderQuantity}
                      onChange={(e) => setOrderQuantity(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-300">Total Payable</label>
                    <div className="w-full bg-black/60 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-amber-400 font-mono font-bold">
                      {(((buyingProduct.offerPrice && buyingProduct.offerPrice > 0 ? buyingProduct.offerPrice : buyingProduct.price) * orderQuantity)).toLocaleString()} {buyingProduct.currency}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300">Your Full Name (নাম)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shakil Chowdhury"
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-300">Mobile Phone (মোবাইল নম্বর)</label>
                    <input
                      type="tel"
                      required
                      placeholder="+880 17XXXXXXXX"
                      value={custPhone}
                      onChange={(e) => setCustPhone(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-300">Email Address</label>
                    <input
                      type="email"
                      placeholder="your.email@gmail.com"
                      value={custEmail}
                      onChange={(e) => setCustEmail(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300">Delivery Address (ঠিকানা)</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="House/Road/Area, Thana, District..."
                    value={custAddress}
                    onChange={(e) => setCustAddress(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300">Payment Option (পেমেন্ট পদ্ধতি)</label>
                  <select
                    value={custPayment}
                    onChange={(e) => setCustPayment(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-medium"
                  >
                    <option value="bKash">bKash (বিকাশ মার্চেন্ট)</option>
                    <option value="Nagad">Nagad (নগদ পেমেন্ট)</option>
                    <option value="Cash on Delivery">Cash on Delivery (ক্যাশ অন ডেলিভারি)</option>
                    <option value="Card">Online Debit / Credit Card</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300">Order Notes (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    placeholder="Special instructions or color request..."
                    value={custNotes}
                    onChange={(e) => setCustNotes(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-black font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-400/25 flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm Order / অর্ডার কনফার্ম করুন</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* =========================================================================
            MODAL 2: USER ORDER SUPPORT MESSAGING ("Massege Korte Parbe")
        ========================================================================= */}
        {messagingOrder && (
          <div
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in"
            onClick={() => setMessagingOrder(null)}
          >
            <div
              className="relative w-full max-w-lg bg-zinc-950 border border-amber-500/40 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-amber-400" />
                  <h3 className="font-display text-lg font-bold text-white">
                    Message Shop Support (মেসেজ পাঠান)
                  </h3>
                </div>
                <button
                  onClick={() => setMessagingOrder(null)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Order quick info */}
              <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-amber-400 font-bold">
                    Order #{messagingOrder.id.slice(-6).toUpperCase()}
                  </span>
                  <span className="text-zinc-400">{messagingOrder.productTitle}</span>
                </div>
                <p className="text-[11px] text-zinc-500">
                  Direct message to Rasel Babu Store Management. Replies will appear in your member portal.
                </p>
              </div>

              {orderMsgSentSuccess ? (
                <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{orderMsgSentSuccess}</span>
                </div>
              ) : (
                <form onSubmit={handleSendOrderMessage} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-300">Your Message or Query (আপনার মেসেজ)</label>
                    <textarea
                      rows={4}
                      required
                      placeholder="e.g. Can you update me regarding estimated courier arrival in Rangpur? Or size exchange query..."
                      value={orderMsgText}
                      onChange={(e) => setOrderMsgText(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setMessagingOrder(null)}
                      className="px-4 py-2 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-black font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-400/20"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Message (মেসেজ পাঠান)</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            MODAL 3: ADMIN ADD / EDIT PRODUCT (WITH OFFER PRICE, DRESS SIZE, PHOTO UPLOAD)
        ========================================================================= */}
        {showProductModal && (
          <div
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in"
            onClick={() => setShowProductModal(false)}
          >
            <div
              className="relative w-full max-w-xl bg-zinc-950 border border-amber-500/40 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-amber-400" />
                  <span>{editingProductId ? 'Edit Product Details' : 'Add New Store Product & Dresses'}</span>
                </h3>
                <button
                  onClick={() => setShowProductModal(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProductForm} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300">Product Title (পণ্যের নাম)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Exclusive Embroidered Three-Piece (থ্রি-পিস কালেকশন)"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Price AND Offer Price Side by Side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-800">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                      <span>Regular Price (নিয়মিত মূল্য ৳):</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={formPrice}
                      onChange={(e) => setFormPrice(Number(e.target.value))}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                      placeholder="e.g. 3500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" />
                      <span>Offer Price (অফার প্রাইস / ডিসকাউন্ট মূল্য ৳):</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formOfferPrice}
                      onChange={(e) => setFormOfferPrice(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-zinc-950 border border-amber-500/60 rounded-xl px-3.5 py-2 text-xs text-amber-300 focus:outline-none focus:border-amber-400 font-mono font-bold"
                      placeholder="e.g. 2950 (ঐচ্ছিক)"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-300">Category (ক্যাটেগরি)</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as any)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="dress">Dresses & Three-Piece (থ্রি-পিস ও পোশাক)</option>
                      <option value="merch">Apparel & Merch (টি-শার্ট ও মার্চ)</option>
                      <option value="vinyl">Vinyl & CD (ভিনাইল ও সিডি)</option>
                      <option value="tickets">Concert Passes (কনসার্ট টিকেট)</option>
                      <option value="digital">Digital Music (ডিজিটাল মিউজিক)</option>
                      <option value="gear">Sound Gear (সাউন্ড গিয়ার)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-300">Badge (e.g. Best Seller)</label>
                    <input
                      type="text"
                      placeholder="Exclusive Three-Piece / Hot Deal"
                      value={formBadge}
                      onChange={(e) => setFormBadge(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Available Sizes for Dress / Three Piece */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300">
                    Available Sizes (পোশাক / থ্রি-পিস সাইজসমূহ - কমা দিয়ে লিখুন):
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 36, 38, 40, 42, 44 or S, M, L, XL, XXL, Free Size"
                    value={formSizes}
                    onChange={(e) => setFormSizes(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                  <span className="text-[10px] text-zinc-500">
                    ক্রেতারা অর্ডার করার সময় এই সাইজগুলোর যেকোনো একটি নির্বাচন করতে পারবে।
                  </span>
                </div>

                {/* Photo Upload from Device + URL option */}
                <div className="space-y-2 p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <label className="text-xs font-semibold text-white flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-amber-400" />
                      <span>Product Photo (ছবি নির্বাচন বা আপলোড করুন):</span>
                    </span>
                  </label>

                  {/* File upload input button */}
                  <div className="flex items-center gap-3">
                    <label className="px-4 py-2 rounded-xl bg-gradient-to-r from-zinc-800 to-zinc-700 hover:from-zinc-700 hover:to-zinc-600 border border-zinc-600 text-white text-xs font-medium cursor-pointer flex items-center gap-2 transition-all">
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                      <span>Upload Photo from Device (ডিভাইস থেকে ছবি আপলোড)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Or manual URL */}
                  <div className="space-y-1 pt-1">
                    <span className="text-[11px] text-zinc-400">Or enter Image URL:</span>
                    <input
                      type="text"
                      placeholder="/src/assets/images/... or https://..."
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>

                  {/* Live Photo Preview */}
                  {formImageUrl && (
                    <div className="flex items-center gap-3 pt-2 border-t border-zinc-800">
                      <img
                        src={formImageUrl}
                        alt="Preview"
                        className="w-16 h-16 rounded-lg object-cover border border-amber-500/40"
                      />
                      <div className="text-xs text-zinc-400">
                        <span className="text-emerald-400 font-semibold block">Main Photo Ready</span>
                        <span className="text-[10px] text-zinc-500">Image will appear as the primary store photo</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3 Additional Photos (১ম অতিরিক্ত ছবি, ২য় অতিরিক্ত ছবি, ৩য় অতিরিক্ত ছবি) */}
                <div className="space-y-3 p-4 rounded-xl bg-zinc-900/60 border border-amber-500/30">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-amber-400" />
                      <span>Additional 3 Photos (আরো ৩টি অতিরিক্ত ছবি যোগ করুন):</span>
                    </span>
                    <span className="text-[10px] font-mono text-amber-400">Up to 3 Extra Photos</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    প্রতিটি প্রোডাক্টে মূল ছবির পাশাপাশি আরও ৩টি ছবি যুক্ত করতে পারবেন। ক্রেতারা প্রোডাক্টে ক্লিক করলে সবগুলো ছবি গ্যালারিতে দেখতে পাবে।
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    {/* Extra Photo 1 */}
                    <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-300">
                        <span>১ম অতিরিক্ত ছবি</span>
                        {formExtraImg1 && (
                          <button
                            type="button"
                            onClick={() => setFormExtraImg1('')}
                            className="text-red-400 hover:text-red-300 cursor-pointer"
                            title="Remove Photo"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      <label className="w-full py-1.5 px-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] cursor-pointer flex items-center justify-center gap-1.5 transition-colors border border-zinc-700">
                        <Upload className="w-3 h-3 text-amber-400" />
                        <span>আপলোড</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleExtraPhotoUpload(1, e)}
                          className="hidden"
                        />
                      </label>

                      <input
                        type="text"
                        placeholder="Image URL"
                        value={formExtraImg1}
                        onChange={(e) => setFormExtraImg1(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-[11px] text-white focus:outline-none focus:border-amber-400 font-mono"
                      />

                      {formExtraImg1 && (
                        <div className="relative aspect-video rounded-lg overflow-hidden border border-amber-500/40">
                          <img src={formExtraImg1} alt="Extra 1" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>

                    {/* Extra Photo 2 */}
                    <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-300">
                        <span>২য় অতিরিক্ত ছবি</span>
                        {formExtraImg2 && (
                          <button
                            type="button"
                            onClick={() => setFormExtraImg2('')}
                            className="text-red-400 hover:text-red-300 cursor-pointer"
                            title="Remove Photo"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      <label className="w-full py-1.5 px-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] cursor-pointer flex items-center justify-center gap-1.5 transition-colors border border-zinc-700">
                        <Upload className="w-3 h-3 text-amber-400" />
                        <span>আপলোড</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleExtraPhotoUpload(2, e)}
                          className="hidden"
                        />
                      </label>

                      <input
                        type="text"
                        placeholder="Image URL"
                        value={formExtraImg2}
                        onChange={(e) => setFormExtraImg2(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-[11px] text-white focus:outline-none focus:border-amber-400 font-mono"
                      />

                      {formExtraImg2 && (
                        <div className="relative aspect-video rounded-lg overflow-hidden border border-amber-500/40">
                          <img src={formExtraImg2} alt="Extra 2" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>

                    {/* Extra Photo 3 */}
                    <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-300">
                        <span>৩য় অতিরিক্ত ছবি</span>
                        {formExtraImg3 && (
                          <button
                            type="button"
                            onClick={() => setFormExtraImg3('')}
                            className="text-red-400 hover:text-red-300 cursor-pointer"
                            title="Remove Photo"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      <label className="w-full py-1.5 px-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] cursor-pointer flex items-center justify-center gap-1.5 transition-colors border border-zinc-700">
                        <Upload className="w-3 h-3 text-amber-400" />
                        <span>আপলোড</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleExtraPhotoUpload(3, e)}
                          className="hidden"
                        />
                      </label>

                      <input
                        type="text"
                        placeholder="Image URL"
                        value={formExtraImg3}
                        onChange={(e) => setFormExtraImg3(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-[11px] text-white focus:outline-none focus:border-amber-400 font-mono"
                      />

                      {formExtraImg3 && (
                        <div className="relative aspect-video rounded-lg overflow-hidden border border-amber-500/40">
                          <img src={formExtraImg3} alt="Extra 3" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300">Product Description</label>
                  <textarea
                    rows={2}
                    placeholder="Describe material, fabric, embroidery, accessories..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-black font-bold text-xs transition-colors cursor-pointer shadow-lg shadow-amber-400/20"
                  >
                    {editingProductId ? 'Update Product' : 'Add to Catalog (পণ্য সেভ করুন)'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowProductModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Adsterra Banner Slot */}
        <AdSlot format="728x90" page="shop" responsive />

      </div>
    </div>
  );
};
