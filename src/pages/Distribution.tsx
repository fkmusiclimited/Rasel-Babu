import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { AdSlot } from '../components/ads/AdSlot';
import { FKMusicLogo } from '../components/brand/FKMusicLogo';
import {
  Globe,
  ShieldCheck,
  TrendingUp,
  Headphones,
  CheckCircle2,
  ExternalLink,
  MessageCircle,
  Sparkles,
  Zap,
  Disc,
  Mail,
  Youtube,
  Phone,
} from 'lucide-react';

export const Distribution: React.FC = () => {
  const { submitDistributionInquiry, homepageSettings } = useData();

  // Form states for artist inquiry
  const [formArtistName, setFormArtistName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formReleaseTitle, setFormReleaseTitle] = useState('');
  const [formGenre, setFormGenre] = useState('Bengali Folk Pop');
  const [formDemoLink, setFormDemoLink] = useState('');
  const [formPlatforms, setFormPlatforms] = useState<string[]>([
    'Spotify',
    'Apple Music',
    'YouTube Music & Content ID',
    'Amazon Music',
  ]);
  const [formMessage, setFormMessage] = useState('');
  const [submittedAlert, setSubmittedAlert] = useState(false);

  const togglePlatform = (plat: string) => {
    setFormPlatforms((prev) =>
      prev.includes(plat) ? prev.filter((p) => p !== plat) : [...prev, plat]
    );
  };

  const handleDistributionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitDistributionInquiry({
      artistName: formArtistName,
      email: formEmail,
      phone: formPhone,
      releaseTitle: formReleaseTitle,
      genre: formGenre,
      platforms: formPlatforms,
      demoLink: formDemoLink,
      message: formMessage,
    });
    setSubmittedAlert(true);
    setFormArtistName('');
    setFormEmail('');
    setFormPhone('');
    setFormReleaseTitle('');
    setFormDemoLink('');
    setFormMessage('');
    setTimeout(() => setSubmittedAlert(false), 8000);
  };

  const dspStores = [
    { name: 'Spotify', icon: '🎧', status: 'Global Store Active' },
    { name: 'Apple Music', icon: '🍎', status: 'Spatial & Lossless' },
    { name: 'YouTube Music', icon: '▶️', status: 'Official Content ID' },
    { name: 'Amazon Music', icon: '📦', status: 'HD Worldwide' },
    { name: 'TikTok & ByteDance', icon: '🎵', status: 'Sound Library' },
    { name: 'Instagram & Facebook', icon: '📸', status: 'Audio Reels Meta' },
    { name: 'Deezer', icon: '🔊', status: '180+ Countries' },
    { name: 'Tidal HiFi', icon: '💎', status: 'Master Sound' },
    { name: 'JioSaavn', icon: '📻', status: 'South Asian Reach' },
    { name: 'Gaana & Wynk', icon: '🎶', status: 'Regional Stores' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#12010e] via-[#1c0217] to-[#0a0008] text-zinc-100 py-12 relative overflow-hidden">
      {/* Ambient background glow matching FK Music Limited official Magenta & Gold palette */}
      <div className="absolute top-0 left-1/4 w-[36rem] h-[36rem] bg-pink-700/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[30rem] h-[30rem] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[28rem] h-[28rem] bg-fuchsia-800/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        
        {/* Top Header & Official FK Music Limited Branding (Matching 000111.jpg) */}
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-[#21031c]/90 via-[#2d0526]/85 to-[#190215]/90 border border-pink-500/30 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          {/* Subtle gold shimmer line on top border */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4 max-w-3xl">
              {/* Partner Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-950/80 border border-amber-400/40 text-amber-300 text-xs font-mono uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Official Music Distribution Partner</span>
              </div>

              {/* Official FK Music Limited Logo (Direct reproduction of 000111.jpg) */}
              <div className="pt-1 flex items-center gap-4">
                <FKMusicLogo size="lg" />
              </div>

              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                {homepageSettings.distHeadline || (
                  <>
                    Rasel Babu &amp;{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-pink-300 to-amber-200">
                      FK Music Limited
                    </span>
                  </>
                )}
              </h1>

              <p className="text-sm sm:text-base text-pink-100/80 leading-relaxed max-w-2xl">
                {homepageSettings.distDescription || (
                  <>
                    Official global music distribution infrastructure for artist <strong>Rasel Babu</strong>. 
                    Delivering master tracks directly to 150+ international digital streaming stores with automated Content ID and transparent royalty reporting under the official <strong>FK Music Limited</strong> label.
                  </>
                )}
              </p>
            </div>

            {/* Direct Connect & Action Buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              {/* 1. Join FK Music Distribution Button -> https://fkmusicltd.com/ */}
              <a
                href="https://fkmusicltd.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-amber-400/30 transition-all cursor-pointer group"
              >
                <Disc className="w-4 h-4 text-black group-hover:rotate-90 transition-transform duration-500" />
                <span>Join FK Music Distribution</span>
                <ExternalLink className="w-3.5 h-3.5 text-black" />
              </a>

              {/* 2. Contact FK Music Desk (WhatsApp: 01723138736) */}
              <a
                href="https://wa.me/8801723138736?text=Hello%20Rasel%20Babu%20/%20FK%20Music%20Desk,%20I%20want%20to%20distribute%20my%20music"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/25 transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-white" />
                <span>Contact FK Music Desk (01723138736)</span>
              </a>

              {/* 3. FK Music Support Email */}
              <a
                href="mailto:support@fkmusicltd.com?subject=Music%20Distribution%20Inquiry%20via%20Rasel%20Babu%20Portal"
                className="px-6 py-2.5 rounded-xl bg-[#2b0424] hover:bg-[#38062e] text-amber-200 border border-amber-400/30 text-xs font-mono font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>support@fkmusicltd.com</span>
              </a>
            </div>
          </div>
        </div>

        {/* 150+ DSP Stores Grid Section with Magenta-Gold Theme */}
        <div className="p-8 rounded-3xl bg-[#1d0319]/70 border border-pink-500/25 backdrop-blur-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-pink-500/20 pb-4">
            <div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-white">
                Worldwide Store Ingestion Network (১৫০+ গ্লোবাল স্টোর)
              </h3>
              <p className="text-xs text-pink-200/70 mt-0.5">
                Every release through FK Music Limited is automatically ingested into 150+ DSPs across 200 countries worldwide.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Global Ingestion Active</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
            {dspStores.map((dsp) => (
              <div
                key={dsp.name}
                className="p-4 rounded-xl bg-[#280422]/80 border border-pink-500/20 flex items-center gap-3 hover:border-amber-400/50 transition-colors"
              >
                <span className="text-xl">{dsp.icon}</span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{dsp.name}</p>
                  <p className="text-[10px] text-pink-200/70 truncate">{dsp.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3 Core Pillars of FK Music Limited with Logo Grading */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#20031b]/80 border border-pink-500/20 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="font-display text-lg font-bold text-white">
              150+ Global Streaming DSPs
            </h3>
            <p className="text-xs text-pink-100/70 leading-relaxed">
              Fast delivery to Spotify, Apple Music, Amazon, YouTube Music, Deezer, TikTok, Instagram, and telecom caller-tunes in Bangladesh and overseas.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#20031b]/80 border border-pink-500/20 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/30 text-pink-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-display text-lg font-bold text-white">
              100% Master Ownership
            </h3>
            <p className="text-xs text-pink-100/70 leading-relaxed">
              Artists maintain complete intellectual property and master rights. FK Music Limited provides clean licensing and official YouTube Content ID.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#20031b]/80 border border-pink-500/20 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-display text-lg font-bold text-white">
              Transparent Royalty Accounting
            </h3>
            <p className="text-xs text-pink-100/70 leading-relaxed">
              Detailed monthly earnings reports with direct local payouts via bKash, Bangladeshi bank transfer, and international wire transfer.
            </p>
          </div>
        </div>

        {/* ARTIST DISTRIBUTION APPLICATION & MESSAGE FORM (ওয়েবসাইট থেকে সরাসরি মেসেজ পাঠান) */}
        <div id="distribution-inquiry-form" className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-[#20031c]/95 via-[#2b0524]/90 to-[#180215]/95 border-2 border-pink-500/40 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-pink-500/25 pb-5">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/40 text-amber-300 text-xs font-mono uppercase">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Direct Ingestion Desk · FK Music Limited</span>
              </div>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-white">
                Submit Music for Global Distribution (ডিস্ট্রিবিউশন মেসেজ ও ট্র‍্যাক সাবমিশন)
              </h3>
              <p className="text-xs sm:text-sm text-pink-200/80">
                আপনার একক গান, অ্যালবাম বা মিউজিক ভিডিও বিশ্বব্যাপী ১৫০+ ডিজিটাল স্টোরে রিলিজ করতে নিচের ফর্মটি পূরণ করুন। আমাদের অ্যাডমিন টিম সরাসরি মেসেজ দেখে আপনার সাথে যোগাযোগ করবে।
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-pink-950/80 border border-amber-400/30 text-amber-300 text-xs font-mono shrink-0">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Official Review Within 24 Hours</span>
            </div>
          </div>

          {submittedAlert && (
            <div className="p-5 rounded-2xl bg-emerald-950/90 border border-emerald-400 text-emerald-100 flex items-start gap-3 shadow-xl animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-white">আপনার ডিস্ট্রিবিউশন মেসেজ সফলভাবে জমা হয়েছে!</p>
                <p className="text-xs text-emerald-200">
                  ধন্যবাদ! FK Music Limited অ্যাডমিন টিম আপনার ট্র‍্যাক ও তথ্য পর্যালোচনা করে দ্রুত রেসপন্স পাঠাবে। অ্যাডমিন ড্যাশবোর্ডে আপনার মেসেজটি তালিকাভুক্ত হয়েছে।
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleDistributionSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-pink-200">শিল্পী / ব্যান্ডের নাম (Artist/Band Name) *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: শান্ত ইসলাম / দ্য অ্যাকোস্টিক ব্যান্ড"
                  value={formArtistName}
                  onChange={(e) => setFormArtistName(e.target.value)}
                  className="w-full bg-[#150212] border border-pink-500/30 rounded-xl px-4 py-2.5 text-xs text-white placeholder-pink-300/40 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-pink-200">ইমেইল ঠিকানা (Email Address) *</label>
                <input
                  type="email"
                  required
                  placeholder="artist@gmail.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full bg-[#150212] border border-pink-500/30 rounded-xl px-4 py-2.5 text-xs text-white placeholder-pink-300/40 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-pink-200">ফোন / হোয়াটসঅ্যাপ নম্বর (Phone/WhatsApp) *</label>
                <input
                  type="tel"
                  required
                  placeholder="+880 1700-000000"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full bg-[#150212] border border-pink-500/30 rounded-xl px-4 py-2.5 text-xs text-white placeholder-pink-300/40 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-pink-200">গান বা অ্যালবামের শিরোনাম (Track/Album Title) *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: মেঘের দেশে (Original Track)"
                  value={formReleaseTitle}
                  onChange={(e) => setFormReleaseTitle(e.target.value)}
                  className="w-full bg-[#150212] border border-pink-500/30 rounded-xl px-4 py-2.5 text-xs text-white placeholder-pink-300/40 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-pink-200">মিউজিক জনরা (Music Genre) *</label>
                <select
                  value={formGenre}
                  onChange={(e) => setFormGenre(e.target.value)}
                  className="w-full bg-[#150212] border border-pink-500/30 rounded-xl px-4 py-2.5 text-xs text-amber-300 focus:outline-none focus:border-amber-400"
                >
                  <option value="Bengali Folk Pop">Bengali Folk Pop (বাংলা ফোক পপ)</option>
                  <option value="Acoustic Rock">Acoustic Rock (অ্যাকোস্টিক রক)</option>
                  <option value="Modern Melody">Modern Melody (আধুনিক মেলোডি)</option>
                  <option value="Sufi & Devotional">Sufi &amp; Spiritual (সুফি ও মরমি গান)</option>
                  <option value="Cinema Playback">Cinema Playback (চলচ্চিত্রের গান)</option>
                  <option value="Hip Hop & Rap">Hip Hop &amp; Urban (হিপহপ)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-pink-200 flex items-center gap-1.5">
                  <Youtube className="w-3.5 h-3.5 text-red-500" />
                  <span>ইউটিউব চ্যানেল লিংক (YouTube Channel Link)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/@yourchannel or video link..."
                  value={formDemoLink}
                  onChange={(e) => setFormDemoLink(e.target.value)}
                  className="w-full bg-[#150212] border border-pink-500/30 rounded-xl px-4 py-2.5 text-xs text-white placeholder-pink-300/40 focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>
            </div>

            {/* Platform Selection Checkboxes */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-pink-200 block">
                কোন কোন প্ল্যাটফর্মে ডিস্ট্রিবিউট করতে চান? (Select Target Platforms)
              </label>
              <div className="flex flex-wrap gap-2.5">
                {[
                  'Spotify',
                  'Apple Music',
                  'YouTube Music & Content ID',
                  'Amazon Music',
                  'TikTok & ByteDance',
                  'Instagram & Facebook Reels',
                  'JioSaavn',
                  'Telecom Caller Tunes (BD)',
                ].map((plat) => {
                  const isChecked = formPlatforms.includes(plat);
                  return (
                    <button
                      key={plat}
                      type="button"
                      onClick={() => togglePlatform(plat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5 ${
                        isChecked
                          ? 'bg-amber-400 text-black font-bold border border-amber-300'
                          : 'bg-[#1a0217] hover:bg-[#280424] text-pink-200/80 border border-pink-500/25'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${isChecked ? 'bg-black' : 'bg-pink-500/50'}`} />
                      <span>{plat}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Message Details */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-pink-200">
                ডিস্ট্রিবিউশন সংক্রান্ত বিশেষ বার্তা বা নোট (Message / Special Notes) *
              </label>
              <textarea
                rows={3}
                required
                placeholder="আপনার গান বা রিলিজ সম্পর্কিত প্রয়োজনীয় তথ্য, কপিরাইট স্ট্যাটাস অথবা অন্য যেকোনো প্রশ্ন লিখুন..."
                value={formMessage}
                onChange={(e) => setFormMessage(e.target.value)}
                className="w-full bg-[#150212] border border-pink-500/30 rounded-xl p-4 text-xs text-white placeholder-pink-300/40 focus:outline-none focus:border-amber-400 leading-relaxed"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <p className="text-[11px] text-pink-200/60 font-mono">
                * Submitted messages are routed directly to the FK Music Limited Administration Desk.
              </p>

              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-amber-400/30 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-black" />
                <span>Submit Distribution Message (মেসেজ পাঠান)</span>
              </button>
            </div>
          </form>
        </div>

        {/* FK Music Limited Official Support Desk & Global Website Banner */}
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-[#21031c]/95 via-[#2d0526]/90 to-[#190215]/95 border border-pink-500/30 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-950/80 border border-pink-500/40 text-pink-300 text-xs font-mono uppercase">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>FK Music Limited Official Helpdesk &amp; Support</span>
              </div>
              <h3 className="font-display text-2xl font-bold text-white">
                FK Music Limited Support &amp; Official Portal
              </h3>
              <p className="text-xs sm:text-sm text-pink-100/70 max-w-xl leading-relaxed">
                ডিস্ট্রিবিউশন সংক্রান্ত যেকোনো প্রশ্ন, রয়্যালটি সাপোর্ট বা স্পন্সরশিপের জন্য FK Music Limited-এর অফিশিয়াল সাপোর্ট ইমেইল অথবা হোয়াটসঅ্যাপে যোগাযোগ করুন।
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href="https://fkmusicltd.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 text-black font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-amber-400/25 transition-all cursor-pointer group"
              >
                <Disc className="w-4 h-4 text-black group-hover:rotate-90 transition-transform" />
                <span>Join FK Music Distribution</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <a
                href="mailto:support@fkmusicltd.com?subject=FK%20Music%20Support%20Inquiry"
                className="px-5 py-3.5 rounded-xl bg-[#2b0424] hover:bg-[#38062e] text-amber-200 border border-pink-500/40 text-xs font-mono font-medium flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Mail className="w-4 h-4 text-pink-400" />
                <span>support@fkmusicltd.com</span>
              </a>

              <a
                href="https://wa.me/8801723138736?text=Hello%20Rasel%20Babu,%20FK%20Music%20Support"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3.5 rounded-xl bg-emerald-700/80 hover:bg-emerald-600 text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-white" />
                <span>WhatsApp: 01723138736</span>
              </a>
            </div>
          </div>
        </div>

        {/* Adsterra Bottom Placement */}
        <div className="pt-4">
          <AdSlot format="728x90" page="home" />
        </div>

      </div>
    </div>
  );
};

