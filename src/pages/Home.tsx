import React from 'react';
import { useData } from '../context/DataContext';
import { AdSlot } from '../components/ads/AdSlot';
import { HeroHorizontalFilmReel } from '../components/gallery/HeroHorizontalFilmReel';
import {
  Play,
  Calendar,
  MapPin,
  Sparkles,
  ArrowRight,
  Music,
  Radio,
  Disc,
  Mic2,
  UserPlus,
  ShoppingBag,
  Trophy,
  Award,
  GraduationCap,
  CheckCircle2,
  TrendingUp,
  Eye,
  Camera,
} from 'lucide-react';

interface HomeProps {
  onNavigate: (path: string, param?: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const { photos, albums, homepageSettings, products, openProductView } = useData();

  const featuredAlbum = albums[0];
  const featuredPhotos = photos.slice(0, 4);

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100">
      {/* 1. Hero Split Section */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:py-20 border-b border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Typographic Hierarchy */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-widest text-amber-400 font-mono">
                  {homepageSettings.heroTagline}
                </span>
              </div>

              <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-tight">
                {homepageSettings.heroTitle}
                <span className="block text-2xl sm:text-3xl lg:text-4xl font-normal text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-pink-500 mt-2">
                  {homepageSettings.heroSubtitle}
                </span>
              </h1>

              <p className="text-base sm:text-lg text-zinc-300 leading-relaxed max-w-xl">
                {homepageSettings.heroDescription}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => onNavigate('/signup')}
                  className="px-6 py-3.5 text-sm font-bold text-black bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 rounded-xl transition-all shadow-lg shadow-amber-500/25 flex items-center gap-2 cursor-pointer group"
                >
                  <UserPlus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Create Fan Account</span>
                </button>

                <button
                  onClick={() => onNavigate('/videos')}
                  className="px-6 py-3.5 text-sm font-medium text-zinc-200 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 rounded-xl transition-all flex items-center gap-2 cursor-pointer group"
                >
                  <Play className="w-4 h-4 text-amber-400 fill-amber-400 group-hover:scale-110 transition-transform" />
                  <span>Watch Video (ভিডিও দেখুন)</span>
                </button>
              </div>

              {/* Streaming Badges */}
              <div className="pt-4 flex items-center gap-4 text-xs text-zinc-400">
                <span className="uppercase tracking-wider font-mono text-[11px] text-zinc-500">Official Links:</span>
                <span className="hover:text-amber-400 cursor-pointer" onClick={() => onNavigate('/videos')}>YouTube Videos</span>
                <span>·</span>
                <span className="hover:text-amber-400 cursor-pointer" onClick={() => onNavigate('/distribution')}>Music Distribution</span>
                <span>·</span>
                <span className="hover:text-amber-400 cursor-pointer" onClick={() => onNavigate('/shop')}>Official Store</span>
              </div>

              {/* White-Border Animated 35mm Motion Film Reel Strip */}
              <HeroHorizontalFilmReel onNavigate={onNavigate} />
            </div>

            {/* Right Column: Large Hero Visual Container at Matching Height */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-[4/5] sm:aspect-[16/11] lg:aspect-[4/5] rounded-2xl overflow-hidden border border-amber-500/30 shadow-2xl shadow-black group">
                <img
                  src={homepageSettings.heroImageUrl}
                  alt={homepageSettings.heroTitle}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex flex-col justify-end p-6">
                  <div className="flex items-center gap-2 text-xs text-amber-400 font-mono mb-1">
                    <Radio className="w-3.5 h-3.5 animate-pulse" />
                    <span>{homepageSettings.heroEventBadge}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    {homepageSettings.heroEventTitle}
                  </h3>
                  <p className="text-xs text-zinc-300 mt-1">
                    {homepageSettings.heroEventSubtitle}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 4-Column Metric Strip below the split */}
          <div className="mt-14 pt-8 border-t border-zinc-800/80 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800">
              <p className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-amber-400">
                {homepageSettings.stat1Value}
              </p>
              <p className="text-xs text-zinc-400 mt-1 uppercase tracking-wider">
                {homepageSettings.stat1Label}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800">
              <p className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-pink-400">
                {homepageSettings.stat2Value}
              </p>
              <p className="text-xs text-zinc-400 mt-1 uppercase tracking-wider">
                {homepageSettings.stat2Label}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800">
              <p className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-amber-400">
                {homepageSettings.stat3Value}
              </p>
              <p className="text-xs text-zinc-400 mt-1 uppercase tracking-wider">
                {homepageSettings.stat3Label}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800">
              <p className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-zinc-100">
                {homepageSettings.stat4Value}
              </p>
              <p className="text-xs text-zinc-400 mt-1 uppercase tracking-wider">
                {homepageSettings.stat4Label}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Primary Adsterra Placement: Homepage Leaderboard */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <AdSlot format="728x90" page="home" />
      </div>

      {/* 3. Recent Success & Career Victories Section */}
      <section className="py-16 border-b border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-amber-400 flex items-center gap-1.5 font-bold">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Artist Victories &amp; Honors · সাফল্য ও অর্জনের গল্প</span>
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mt-1">
                Rasel Babu Recent Success &amp; Milestones
              </h2>
            </div>
            <button
              onClick={() => onNavigate('/videos')}
              className="inline-flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 font-medium cursor-pointer"
            >
              <Play className="w-4 h-4 fill-amber-400" />
              <span>Watch Official Videos (ভিডিও দেখুন)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 sm:p-8">
            {/* Photo Column */}
            <div className="lg:col-span-4 flex flex-col items-center">
              <div className="w-full max-w-[280px] aspect-[4/5] rounded-2xl overflow-hidden border-2 border-amber-500/30 shadow-2xl relative group bg-black">
                <img
                  src={homepageSettings.aboutImageUrl || featuredAlbum.coverUrl}
                  alt="Rasel Babu Recent Success"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex flex-col justify-end p-4">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300 font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Official Verified Artist</span>
                  </span>
                  <p className="text-sm font-bold text-white">Rasel Babu</p>
                  <p className="text-[11px] text-zinc-300">Singer, Actor, Lyricist &amp; Model</p>
                </div>
              </div>
              <p className="text-xs text-zinc-400 mt-3 font-mono text-center">
                Rangpur · Kurigram · Dhaka · FK Music
              </p>
            </div>

            {/* Right Column: Rasel Babu's Recent Success & Victories (সাফল্য ও বিজয়ের বিবরণ) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <span>
                    {homepageSettings.milestonesTitle || 'সাম্প্রতিক সাফল্য ও বিজয়ের মাইলফলক (Recent Victories & Achievements)'}
                  </span>
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {homepageSettings.milestonesDescription ||
                    'রাসেল বাবু সঙ্গীত, মডেলিং, অভিনয় এবং একাডেমিক ক্ষেত্রে ধারাবাহিক সাফল্য ও বিজয়ের মাধ্যমে তরুণ প্রজন্মের এক উজ্জ্বল অনুপ্রেরণা। তাঁর সাম্প্রতিক উল্লেখযোগ্য অর্জনসমূহ:'}
                </p>
              </div>

              {/* 4 Success Achievement Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {/* 1. Arena Concert Victory */}
                <div className="p-4 rounded-xl bg-zinc-950/80 border border-amber-500/30 hover:border-amber-400/60 transition-colors space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-400/10 text-amber-400 flex items-center justify-center shrink-0">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white leading-tight">
                        {homepageSettings.milestone1Title || 'জাতীয় যুব সাংস্কৃতিক কনসার্ট বিজয়'}
                      </h4>
                      <span className="text-[10px] text-amber-400 font-mono">
                        {homepageSettings.milestone1Badge || '15,000+ Crowd Milestone'}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-300 leading-relaxed">
                    {homepageSettings.milestone1Desc ||
                      'ঢাকা আর্মি স্টেডিয়াম ফেস্টিভ্যালে ১৫,০০০+ দর্শকের সামনে একক লাইভ সিম্ফনি পরিবেশন করে দর্শক নন্দিত সাফল্য ও বিশেষ শিল্পী সম্মাননা লাভ।'}
                  </p>
                </div>

                {/* 2. BA Graduation Academic Success */}
                <div className="p-4 rounded-xl bg-zinc-950/80 border border-pink-500/30 hover:border-pink-400/60 transition-colors space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-pink-500/10 text-pink-400 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white leading-tight">
                        {homepageSettings.milestone2Title || 'বিএ (BA) ডিগ্রি সফল অর্জন (২০২৬)'}
                      </h4>
                      <span className="text-[10px] text-pink-400 font-mono">
                        {homepageSettings.milestone2Badge || 'Kurigram Govt. College'}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-300 leading-relaxed">
                    {homepageSettings.milestone2Desc ||
                      'কুড়িগ্রাম সরকারি কলেজ থেকে ২০২৬ সালে সফলভাবে ব্যাচেলর অব আর্টস (BA) ডিগ্রি সমাপ্ত। এর আগে কাশিপুর ডিগ্রি কলেজ (HSC \'22) ও হাই স্কুল (SSC \'19) থেকে কৃতিত্বের সাথে উত্তীর্ণ।'}
                  </p>
                </div>

                {/* 3. Global Distribution Deal */}
                <div className="p-4 rounded-xl bg-zinc-950/80 border border-cyan-500/30 hover:border-cyan-400/60 transition-colors space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
                      <Disc className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white leading-tight">
                        {homepageSettings.milestone3Title || 'FK Music Limited গ্লোবাল ডিস্ট্রিবিউশন'}
                      </h4>
                      <span className="text-[10px] text-cyan-400 font-mono">
                        {homepageSettings.milestone3Badge || '150+ Digital Streaming Stores'}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-300 leading-relaxed">
                    {homepageSettings.milestone3Desc ||
                      'আন্তর্জাতিক লেবেল FK Music Limited-এর আওতায় Spotify, Apple Music, YouTube Content ID, Amazon ও TikTok-এ বিশ্বব্যাপী গান ইনজেশন ও রয়্যালটি পার্টনারশিপ।'}
                  </p>
                </div>

                {/* 4. Streaming Hit & Playback Success */}
                <div className="p-4 rounded-xl bg-zinc-950/80 border border-emerald-500/30 hover:border-emerald-400/60 transition-colors space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white leading-tight">
                        {homepageSettings.milestone4Title || '৩৫ লক্ষ+ ডিজিটাল অডিও স্ট্রিম'}
                      </h4>
                      <span className="text-[10px] text-emerald-400 font-mono">
                        {homepageSettings.milestone4Badge || '3.5M+ Streams & Playback'}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-300 leading-relaxed">
                    {homepageSettings.milestone4Desc ||
                      'ইউটিউব ও স্পটিফাইতে ৩৫ লক্ষাধিক স্ট্রিম পার করে নতুন রেকর্ড। চলচ্চিত্র প্লেব্যাক ও মিউজিক ভিডিওতে দর্শকপ্রিয় অভিনয় ও মডেলিংয়ে ব্যাপক জনপ্রিয়তা অর্জন।'}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800/80">
                <button
                  onClick={() => onNavigate('/signup')}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 text-black font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-400/20 transition-all cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Join Fan Club &amp; Win Mega Gift (ফ্যান একাউন্ট তৈরি করুন)</span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onNavigate('/videos')}
                    className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>Watch Videos (ভিডিও দেখুন)</span>
                  </button>
                  <button
                    onClick={() => onNavigate('/distribution')}
                    className="px-4 py-2.5 rounded-xl bg-pink-950/60 hover:bg-pink-900/60 border border-pink-500/40 text-pink-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>FK Music Distribution</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Featured Photo Gallery Bento Preview */}

      <section className="py-16 border-b border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-amber-400">
                Visual Archive
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mt-1">
                Moments & Stage Presence
              </h2>
            </div>
            <button
              onClick={() => onNavigate('/gallery')}
              className="inline-flex items-center gap-2 text-sm text-pink-400 hover:text-pink-300 font-medium cursor-pointer"
            >
              <span>View All Albums & Photos</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredPhotos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => onNavigate('/photo-detail', photo.id)}
                className="group relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 cursor-pointer aspect-[3/4] transition-all hover:border-amber-400/50 hover:shadow-xl hover:shadow-black"
              >
                <img
                  src={photo.imageUrl}
                  alt={photo.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-4 flex flex-col justify-end">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400">
                    {photo.category}
                  </span>
                  <h4 className="text-sm font-semibold text-white group-hover:text-amber-200 transition-colors line-clamp-1">
                    {photo.title}
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">
                    {photo.location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Official Store & Merchandise Preview (ক্লিক করে ভিউ) */}
      <section className="py-16 border-b border-zinc-800/80 bg-zinc-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
                Official Merchandise &amp; Dresses
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mt-1">
                Rasel Babu Official Store &amp; Apparel
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                থ্রি-পিস ও পোশাক, টি-শার্ট ও মার্চ কালেকশন। যেকোনো প্রোডাক্টে ক্লিক করে একাধিক ছবি ও বিস্তারিত দেখুন।
              </p>
            </div>
            <button
              onClick={() => onNavigate('/shop')}
              className="inline-flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 font-medium cursor-pointer"
            >
              <span>Explore All Products ({products.length})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 4).map((prod) => {
              const hasOffer = prod.offerPrice && prod.offerPrice > 0 && prod.offerPrice < prod.price;
              const extraCount = prod.additionalImages?.filter((img) => img && img.trim().length > 0).length || 0;
              return (
                <div
                  key={prod.id}
                  onClick={() => openProductView(prod)}
                  className="group relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900/60 cursor-pointer flex flex-col justify-between transition-all hover:border-amber-400/50 hover:shadow-xl hover:shadow-black"
                >
                  <div className="relative aspect-[4/3] bg-zinc-950 overflow-hidden">
                    <img
                      src={prod.imageUrl}
                      alt={prod.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    {prod.badge && (
                      <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-amber-400 text-black text-[9px] font-bold uppercase tracking-wider">
                        {prod.badge}
                      </span>
                    )}
                    {extraCount > 0 && (
                      <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/80 text-amber-300 text-[9px] font-mono flex items-center gap-1 border border-amber-500/30">
                        <Camera className="w-2.5 h-2.5 text-amber-400" />
                        <span>+{extraCount} Photos</span>
                      </span>
                    )}
                    <span
                      className={`absolute top-2.5 right-2.5 px-1.5 py-0.5 rounded text-[9px] font-mono uppercase ${
                        prod.inStock ? 'bg-emerald-950/80 text-emerald-300' : 'bg-red-950/80 text-red-300'
                      }`}
                    >
                      {prod.inStock ? 'In Stock' : 'Sold Out'}
                    </span>
                  </div>

                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 block mb-0.5">
                        {prod.category === 'dress' ? 'Dresses & Three-Piece' : prod.category}
                      </span>
                      <h4 className="text-xs font-semibold text-white group-hover:text-amber-200 transition-colors line-clamp-1">
                        {prod.title}
                      </h4>
                    </div>

                    <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                      {hasOffer ? (
                        <div className="flex items-baseline gap-1.5 font-mono text-xs">
                          <span className="text-amber-300 font-bold">৳{prod.offerPrice?.toLocaleString()}</span>
                          <del className="text-zinc-500 text-[10px]">৳{prod.price.toLocaleString()}</del>
                        </div>
                      ) : (
                        <span className="font-mono text-xs font-bold text-white">৳{prod.price.toLocaleString()}</span>
                      )}

                      <span className="text-[11px] text-amber-400 group-hover:translate-x-0.5 transition-transform font-mono flex items-center gap-0.5">
                        <Eye className="w-3 h-3" /> View
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Adsterra 468x60 Banner Placement */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-center">
        <AdSlot format="468x60" page="home" adKeyOverride="5b415df9f7b29bb59457dfbeb59a537b" />
      </div>

      {/* 5. Fan Club & Newsletter Callout */}

      <section className="py-20 bg-gradient-to-b from-zinc-950 to-[#08080a]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Join Rasel Babu VIP Fan Community</span>
          </div>

          <h2 className="font-display text-3xl sm:text-5xl font-bold text-white">
            Exclusive Music Releases, Concert Passes & Fan Updates
          </h2>

          <p className="text-sm sm:text-base text-zinc-300 max-w-xl mx-auto">
            Become a registered member to submit song requests, receive direct responses from artist management, and gain early access to acoustic demo tracks.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('/signup')}
              className="w-full sm:w-auto px-6 py-3.5 text-sm font-semibold text-black bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-lg shadow-amber-400/20 cursor-pointer"
            >
              Create Fan Account
            </button>
            <button
              onClick={() => onNavigate('/login')}
              className="w-full sm:w-auto px-6 py-3.5 text-sm font-medium text-zinc-300 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-xl transition-all cursor-pointer"
            >
              Already Registered? Sign In
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
