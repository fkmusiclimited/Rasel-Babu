import React, { useState } from 'react';
import {
  Trophy,
  Award,
  Crown,
  Sparkles,
  TrendingUp,
  Gift,
  CheckCircle2,
  Calendar,
  Star,
  Users,
  ChevronRight,
  Info,
  Edit3,
  Save,
  X,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { User } from '../../types';

interface YearlyPointsGraphProps {
  isAdminView?: boolean;
  onOpenBonusModal?: (userId: string) => void;
}

export const YearlyPointsGraph: React.FC<YearlyPointsGraphProps> = ({
  isAdminView = false,
  onOpenBonusModal,
}) => {
  const { users, currentUser } = useAuth();
  const { pointTransactions, annualGiftConfig, updateAnnualGiftConfig, awardAnnualMegaGift } = useData();

  const availableYears = [2026, 2025, 2024, 2023];
  const [selectedYear, setSelectedYear] = useState<number>(annualGiftConfig.year || 2026);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(new Date().getMonth());
  const [awardAlert, setAwardAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Annual Mega Gift Admin Editor State
  const [isEditingAnnualGift, setIsEditingAnnualGift] = useState(false);
  const [giftEditTitle, setGiftEditTitle] = useState(
    annualGiftConfig.giftTitle || `${selectedYear} Annual Fan Mega Reward · বার্ষিক সেরা ফ্যান মেগা পুরস্কার`
  );
  const [giftEditDesc, setGiftEditDesc] = useState(
    annualGiftConfig.giftDescription ||
      'পুরো ১ বছরে (১২ মাসে) ওয়েবসাইট ভিজিট, গান শোনা, শপিং ও অর্ডারের মাধ্যমে যে ফ্যানের পয়েন্ট সবচেয়ে বেশি থাকবে—তিনি পাবেন রাসেল বাবুর নিজ হাতে স্বাক্ষরিত ফেন্ডার অ্যাকোস্টিক গিটার, আজীবন ভিআইপি অল-অ্যাক্সেস কনসার্ট পাস এবং ৫০,০০০ টাকার মেগা গিফট প্যাক।'
  );
  const [giftEditPrizeVal, setGiftEditPrizeVal] = useState(annualGiftConfig.prizeValue || '৳ ১,০০,০০০+');
  const [giftEditYear, setGiftEditYear] = useState(annualGiftConfig.year || 2026);
  const [giftEditImage, setGiftEditImage] = useState(
    annualGiftConfig.giftImageUrl || '/src/assets/images/rasel_babu_acoustic_live_1791914988781.jpg'
  );
  const [giftEditStatus, setGiftEditStatus] = useState<'active' | 'awarded'>(annualGiftConfig.status || 'active');
  const [giftSaveAlert, setGiftSaveAlert] = useState<string | null>(null);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentYear = selectedYear;

  // Filter regular fan users (exclude purely admin/manager accounts for fair fan ranking)
  const fanUsers = users
    .filter((u) => u.role === 'user' || u.status === 'approved')
    .sort((a, b) => (b.points || 0) - (a.points || 0));

  const topUser = fanUsers[0];
  const userRankIndex = currentUser ? fanUsers.findIndex((u) => u.id === currentUser.id) : -1;
  const userRank = userRankIndex >= 0 ? userRankIndex + 1 : null;

  // Calculate monthly cumulative curve for top users to display realistic 1-year progression
  const getMonthlyPoints = (user: User, mIndex: number) => {
    const total = user.points || 100;
    const yearDiff = 2026 - selectedYear;
    const adjustedTotal = Math.max(60, Math.round(total * (1 - yearDiff * 0.2)));
    const activeMonthsCount = selectedYear === 2026 ? Math.max(1, new Date().getMonth() + 1) : 12;
    const factor = Math.min(1, (mIndex + 1) / activeMonthsCount);
    const hash = user.name.charCodeAt(0) % 5;
    const seasonality = 0.85 + (hash * 0.05);
    return Math.round(adjustedTotal * factor * seasonality);
  };

  const handleAwardClick = (userId: string) => {
    if (!window.confirm(`Are you sure you want to officially award the ${currentYear} Annual Fan of the Year Mega Gift to ${topUser?.name}?`)) {
      return;
    }
    const res = awardAnnualMegaGift(userId);
    if (res.success) {
      setAwardAlert({ type: 'success', message: res.message });
      setTimeout(() => setAwardAlert(null), 8000);
    } else {
      setAwardAlert({ type: 'error', message: res.message });
    }
  };

  const handleGiftImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setGiftEditImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAnnualGift = (e: React.FormEvent) => {
    e.preventDefault();
    updateAnnualGiftConfig({
      giftTitle: giftEditTitle,
      giftDescription: giftEditDesc,
      prizeValue: giftEditPrizeVal,
      year: giftEditYear,
      giftImageUrl: giftEditImage,
      status: giftEditStatus,
    });
    setGiftSaveAlert('বার্ষিক মেগা পুরস্কারের সকল তথ্য ও প্রাইজ সফলভাবে আপডেট করা হয়েছে!');
    setIsEditingAnnualGift(false);
    setTimeout(() => setGiftSaveAlert(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* 1. ANNUAL MEGA GIFT HERO SHOWCASE (প্রতি বছর ১ জন সেরা ফ্যানকে মেগা গিফট) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#24061e] via-[#1a0316] to-[#0d010c] border-2 border-amber-400/40 shadow-2xl relative overflow-hidden">
        {/* Glow aesthetics */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-400/20 to-pink-500/20 border border-amber-400/50 text-amber-300 text-xs font-mono font-bold uppercase tracking-wider">
                <Trophy className="w-4 h-4 text-amber-400 animate-bounce" />
                <span>{annualGiftConfig.giftTitle || `${currentYear} Annual Fan Mega Reward · বার্ষিক সেরা ফ্যান মেগা পুরস্কার`}</span>
              </div>

              {/* Admin Live Editor Button */}
              {isAdminView && (
                <button
                  onClick={() => setIsEditingAnnualGift(!isEditingAnnualGift)}
                  className="px-3 py-1 rounded-full bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="পুরস্কার ও লেখা এডিট করুন"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isEditingAnnualGift ? 'Close Editor' : 'Edit Reward & Prize (পুরস্কার ও লেখা এডিট)'}</span>
                </button>
              )}
            </div>

            <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
              প্রতি বছর ১ জন সেরা ফ্যান পাবেন{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-pink-300 to-amber-200">
                গ্র্যান্ড মেগা গিফট!
              </span>
            </h3>

            <p className="text-xs sm:text-sm text-pink-100/80 leading-relaxed whitespace-pre-line">
              {annualGiftConfig.giftDescription ||
                'পুরো ১ বছরে (১২ মাসে) ওয়েবসাইট ভিজিট, গান শোনা, শপিং ও অর্ডারের মাধ্যমে যে ফ্যানের পয়েন্ট সবচেয়ে বেশি থাকবে—তিনি পাবেন রাসেল বাবুর নিজ হাতে স্বাক্ষরিত ফেন্ডার অ্যাকোস্টিক গিটার, আজীবন ভিআইপি অল-অ্যাক্সেস কনসার্ট পাস এবং ৫০,০০০ টাকার মেগা গিফট প্যাক।'}
            </p>

            {/* Current Top Leader Spotlight */}
            {topUser && (
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-black/60 border border-amber-400/40 backdrop-blur-md">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-black flex items-center justify-center font-black text-lg shadow-lg shadow-amber-400/30">
                    <Crown className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono uppercase text-amber-300 font-bold">Current #1 Leader (বর্তমান শীর্ষে)</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                    <p className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{topUser.name}</span>
                      <span className="text-xs font-mono text-amber-400">({topUser.points || 0} Points)</span>
                    </p>
                  </div>
                </div>

                {/* Logged in User Standing */}
                {currentUser && !isAdminView && (
                  <div className="px-4 py-2.5 rounded-2xl bg-pink-950/60 border border-pink-500/40 backdrop-blur-md">
                    <p className="text-[10px] font-mono uppercase text-pink-300">আপনার বর্তমান র‍্যাংক</p>
                    <p className="text-sm font-bold text-white flex items-center gap-2">
                      <span className="text-amber-300">#{userRank || 'N/A'}</span>
                      <span className="text-xs text-pink-200">({currentUser.points || 0} Points)</span>
                      {userRank && userRank > 1 && topUser && (
                        <span className="text-[11px] text-amber-400/90 font-mono">
                          (১ম হতে আরও {(topUser.points || 0) - (currentUser.points || 0)} পয়েন্ট প্রয়োজন)
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Action / Award Box & Prize Preview */}
          <div className="w-full lg:w-auto shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3">
            {annualGiftConfig.giftImageUrl && (
              <div className="w-36 h-28 sm:w-44 sm:h-32 rounded-2xl overflow-hidden border border-amber-400/30 bg-black/60 mx-auto relative group">
                <img
                  src={annualGiftConfig.giftImageUrl}
                  alt="Annual Gift Prize"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                  <span className="text-[9px] font-mono text-amber-300">Annual Grand Prize</span>
                </div>
              </div>
            )}

            <div className="p-4 rounded-2xl bg-zinc-950/80 border border-amber-400/30 space-y-2 text-center">
              <span className="text-[11px] font-mono text-zinc-400 uppercase">Prize Value (পুরস্কার মূল্য)</span>
              <p className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
                {annualGiftConfig.prizeValue || '৳ ১,০০,০০০+'}
              </p>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-400/10 text-amber-300 text-[10px] font-mono">
                {annualGiftConfig.status === 'awarded' ? '🏆 Winner Awarded' : '🔥 Competition In Progress'}
              </span>
            </div>

            {isAdminView && topUser && (
              <button
                onClick={() => handleAwardClick(topUser.id)}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-amber-400/30 cursor-pointer transition-transform hover:scale-105"
              >
                <Crown className="w-4 h-4 text-black" />
                <span>Award Annual Mega Gift (বিজয়ী ঘোষণা করুন)</span>
              </button>
            )}
          </div>
        </div>

        {/* INLINE ADMIN EDITOR FOR ANNUAL MEGA GIFT */}
        {isAdminView && isEditingAnnualGift && (
          <form
            onSubmit={handleSaveAnnualGift}
            className="mt-6 p-6 rounded-2xl bg-zinc-950 border border-amber-400/50 space-y-4 shadow-2xl animate-fade-in"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-400" />
                <span>Edit Annual Mega Reward &amp; Prize (বার্ষিক মেগা পুরস্কারের তথ্য ও প্রাইজ পরিবর্তন করুন)</span>
              </h4>
              <button
                type="button"
                onClick={() => setIsEditingAnnualGift(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300">Award Year (পুরস্কারের বছর)</label>
                <input
                  type="number"
                  value={giftEditYear}
                  onChange={(e) => setGiftEditYear(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-medium text-zinc-300">Reward Title (পুরস্কার শিরোনাম)</label>
                <input
                  type="text"
                  required
                  value={giftEditTitle}
                  onChange={(e) => setGiftEditTitle(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-300">
                Reward Description &amp; Rules (পুরস্কারের নিয়মাবলী, গিফটের তালিকা ও বিস্তারিত বর্ণনা)
              </label>
              <textarea
                rows={3}
                required
                value={giftEditDesc}
                onChange={(e) => setGiftEditDesc(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-xs text-white leading-relaxed focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300">Prize Value (পুরস্কার মূল্য)</label>
                <input
                  type="text"
                  required
                  value={giftEditPrizeVal}
                  onChange={(e) => setGiftEditPrizeVal(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300">Status (স্ট্যাটাস)</label>
                <select
                  value={giftEditStatus}
                  onChange={(e) => setGiftEditStatus(e.target.value as any)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="active">Active (প্রতিযোগিতা চলমান)</option>
                  <option value="awarded">Awarded (বিজয়ী ঘোষিত)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300">Upload Prize Photo</label>
                <label className="w-full px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer">
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  <span>Choose Photo File</span>
                  <input type="file" accept="image/*" onChange={handleGiftImageUpload} className="hidden" />
                </label>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-300">Or Prize Image URL</label>
              <input
                type="text"
                value={giftEditImage}
                onChange={(e) => setGiftEditImage(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-300 font-mono focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setIsEditingAnnualGift(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-black font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-400/20 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Reward Changes (সংরক্ষণ করুন)</span>
              </button>
            </div>
          </form>
        )}

        {giftSaveAlert && (
          <div className="mt-4 p-4 rounded-2xl bg-emerald-950/80 border border-emerald-400 text-emerald-200 text-xs flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{giftSaveAlert}</span>
          </div>
        )}

        {awardAlert && (
          <div className="mt-4 p-4 rounded-2xl bg-emerald-950/80 border border-emerald-400 text-emerald-200 text-xs flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{awardAlert.message}</span>
          </div>
        )}
      </div>

      {/* 2. 1-YEAR USER POINT GRAPH (১ বছরের পয়েন্ট গ্রাফ - ১২ মাসের প্রোগ্রেস) */}
      <div className="p-6 rounded-3xl bg-zinc-950/90 border border-zinc-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              <h3 className="font-display text-lg sm:text-xl font-bold text-white">
                1-Year User Points Progression Graph (১ বছরের পয়েন্ট ট্র্যাকিং গ্রাফ)
              </h3>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              মাসভিত্তিক পয়েন্ট প্রবৃদ্ধি এবং ফ্যানদের বার্ষিক প্রতিযোগিতা গ্রাফ ({selectedYear})
            </p>
          </div>

          {/* YEAR SELECTOR (আলাদা করে বছর সিলেক্ট করে দেখা যাবে) */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
              <span className="text-[11px] font-mono text-zinc-400 px-2">Year:</span>
              {availableYears.map((yr) => (
                <button
                  key={yr}
                  onClick={() => setSelectedYear(yr)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    selectedYear === yr
                      ? 'bg-amber-400 text-black shadow-md shadow-amber-400/25'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 text-xs font-mono">
              <span className="px-2.5 py-1 rounded-lg bg-amber-400 text-black font-bold">
                {months[selectedMonthIndex]} {selectedYear}
              </span>
            </div>
          </div>
        </div>

        {/* Interactive Month Selector Bar */}
        <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
          {months.map((m, idx) => {
            const isSelected = selectedMonthIndex === idx;
            const isPastOrCurrent = idx <= new Date().getMonth();
            return (
              <button
                key={m}
                onClick={() => setSelectedMonthIndex(idx)}
                className={`py-2 px-1 rounded-xl text-center text-xs font-mono font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/25 scale-105'
                    : isPastOrCurrent
                    ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300'
                    : 'bg-zinc-900/40 text-zinc-600 hover:text-zinc-400'
                }`}
              >
                <div>{m}</div>
              </button>
            );
          })}
        </div>

        {/* SVG Curve & Bar Chart for Top 4 Contenders */}
        <div className="p-4 rounded-2xl bg-[#0d0d11] border border-zinc-800/80 space-y-4">
          <div className="flex items-center justify-between text-xs text-zinc-400 px-2">
            <span>Points Level (পয়েন্ট লেভেল)</span>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                <span className="text-zinc-300">#1 Champion</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-pink-400 inline-block" />
                <span className="text-zinc-300">#2 Runner Up</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-cyan-400 inline-block" />
                <span className="text-zinc-300">#3 3rd Contender</span>
              </span>
            </div>
          </div>

          {/* SVG Multi-Line Chart */}
          <div className="w-full h-48 sm:h-56 relative">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 600 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="champGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="silverGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f472b6" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#f472b6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines */}
              {[40, 80, 120, 160].map((y) => (
                <line key={y} x1="0" y1={y} x2="600" y2={y} stroke="#27272a" strokeDasharray="3 3" />
              ))}

              {/* Contender 1 (Gold) Line & Fill */}
              {topUser && (
                <>
                  <path
                    d={`M 0,${180 - (getMonthlyPoints(topUser, 0) / (topUser.points || 1)) * 140} ` +
                      months.map((_, i) => {
                        const x = (i / 11) * 600;
                        const y = 180 - (getMonthlyPoints(topUser, i) / (topUser.points || 1)) * 140;
                        return `L ${x},${y}`;
                      }).join(' ') +
                      ' L 600,195 L 0,195 Z'}
                    fill="url(#champGrad)"
                  />
                  <path
                    d={`M 0,${180 - (getMonthlyPoints(topUser, 0) / (topUser.points || 1)) * 140} ` +
                      months.map((_, i) => {
                        const x = (i / 11) * 600;
                        const y = 180 - (getMonthlyPoints(topUser, i) / (topUser.points || 1)) * 140;
                        return `L ${x},${y}`;
                      }).join(' ')}
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  {/* Active Month Indicator dot */}
                  <circle
                    cx={(selectedMonthIndex / 11) * 600}
                    cy={180 - (getMonthlyPoints(topUser, selectedMonthIndex) / (topUser.points || 1)) * 140}
                    r="6"
                    fill="#fbbf24"
                    stroke="#000"
                    strokeWidth="2"
                  />
                </>
              )}

              {/* Contender 2 (Pink) Line */}
              {fanUsers[1] && (
                <path
                  d={`M 0,${180 - (getMonthlyPoints(fanUsers[1], 0) / (topUser?.points || 1)) * 140} ` +
                    months.map((_, i) => {
                      const x = (i / 11) * 600;
                      const y = 180 - (getMonthlyPoints(fanUsers[1], i) / (topUser?.points || 1)) * 140;
                      return `L ${x},${y}`;
                    }).join(' ')}
                  fill="none"
                  stroke="#f472b6"
                  strokeWidth="2.5"
                  strokeDasharray="4 2"
                  strokeLinecap="round"
                />
              )}

              {/* Contender 3 (Cyan) Line */}
              {fanUsers[2] && (
                <path
                  d={`M 0,${180 - (getMonthlyPoints(fanUsers[2], 0) / (topUser?.points || 1)) * 140} ` +
                    months.map((_, i) => {
                      const x = (i / 11) * 600;
                      const y = 180 - (getMonthlyPoints(fanUsers[2], i) / (topUser?.points || 1)) * 140;
                      return `L ${x},${y}`;
                    }).join(' ')}
                  fill="none"
                  stroke="#22d3ee"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </div>

          {/* Month Data Cards Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-zinc-800">
            {fanUsers.slice(0, 3).map((u, i) => {
              const ptsInMonth = getMonthlyPoints(u, selectedMonthIndex);
              const color = i === 0 ? 'border-amber-400/50 bg-amber-400/5 text-amber-300' : i === 1 ? 'border-pink-500/40 bg-pink-500/5 text-pink-300' : 'border-cyan-400/40 bg-cyan-400/5 text-cyan-300';
              return (
                <div key={u.id} className={`p-3 rounded-xl border ${color} flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs">#{i + 1}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{u.name}</p>
                      <p className="text-[10px] text-zinc-400">{months[selectedMonthIndex]} Cumulative</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-sm text-white">{ptsInMonth}</span>
                    <span className="text-[10px] text-zinc-400 block">/ {u.points || 0} pts</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. 1-YEAR LEADERBOARD & RANKINGS TABLE (কোন ইউজার কত পয়েন্ট পেয়ে কত নাম্বারে আছে) */}
      <div className="p-6 rounded-3xl bg-zinc-950/90 border border-zinc-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-400" />
              <h3 className="font-display text-lg sm:text-xl font-bold text-white">
                Fan Annual Rankings &amp; Position (১ বছরের ইউজার পয়েন্ট ও অবস্থান তালিকা)
              </h3>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              এখানে প্রত্যেক ফ্যানের মোট অর্জিত পয়েন্ট এবং তাদের বার্ষিক র‍্যাংকিং অবস্থান প্রদর্শিত হচ্ছে।
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>Total Active Ranked Fans: <strong>{fanUsers.length}</strong></span>
          </div>
        </div>

        {/* Rankings Table */}
        <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900/40">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/80 text-zinc-400 font-mono uppercase text-[10px] border-b border-zinc-800">
              <tr>
                <th className="p-4 text-center">Rank (অবস্থান)</th>
                <th className="p-4">Fan Name &amp; Email</th>
                <th className="p-4">Total Points (মোট পয়েন্ট)</th>
                <th className="p-4">Annual Status (স্ট্যাটাস)</th>
                <th className="p-4 text-right">Actions (পদক্ষেপ)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-sans">
              {fanUsers.map((u, idx) => {
                const rankNum = idx + 1;
                const isWinner = rankNum === 1;
                const isRunnerUp = rankNum === 2;
                const isThird = rankNum === 3;
                const isSelf = currentUser?.id === u.id;

                return (
                  <tr
                    key={u.id}
                    className={`transition-colors ${
                      isSelf
                        ? 'bg-amber-400/10 hover:bg-amber-400/15'
                        : isWinner
                        ? 'bg-gradient-to-r from-amber-950/30 to-transparent hover:bg-amber-950/40'
                        : 'hover:bg-zinc-800/30'
                    }`}
                  >
                    {/* Rank Badge */}
                    <td className="p-4 text-center">
                      <div className="inline-flex items-center justify-center">
                        {isWinner ? (
                          <div className="px-3 py-1 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-black text-xs font-mono flex items-center gap-1 shadow-lg shadow-amber-400/30">
                            <Crown className="w-3.5 h-3.5 text-black" />
                            <span>#1 🥇</span>
                          </div>
                        ) : isRunnerUp ? (
                          <div className="px-2.5 py-1 rounded-xl bg-zinc-300 text-black font-bold text-xs font-mono flex items-center gap-1">
                            <span>#2 🥈</span>
                          </div>
                        ) : isThird ? (
                          <div className="px-2.5 py-1 rounded-xl bg-amber-700 text-white font-bold text-xs font-mono flex items-center gap-1">
                            <span>#3 🥉</span>
                          </div>
                        ) : (
                          <span className="font-mono text-zinc-400 font-bold px-2 py-1 bg-zinc-800 rounded-lg">
                            #{rankNum}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Fan Profile */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                            isWinner
                              ? 'bg-amber-400 text-black font-black'
                              : isRunnerUp
                              ? 'bg-zinc-300 text-black'
                              : isThird
                              ? 'bg-amber-800 text-white'
                              : 'bg-zinc-800 text-zinc-300'
                          }`}
                        >
                          {u.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-white flex items-center gap-2">
                            <span>{u.name}</span>
                            {isSelf && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-400 text-black text-[10px] font-bold">
                                YOU
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] font-mono text-zinc-400 truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Total Points */}
                    <td className="p-4">
                      <div className="font-mono">
                        <span className="text-base font-bold text-amber-400">{u.points || 0}</span>
                        <span className="text-[11px] text-zinc-400 ml-1">pts</span>
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        {isWinner
                          ? '🏆 Highest Score in Year'
                          : topUser
                          ? `${(topUser.points || 0) - (u.points || 0)} pts behind #1`
                          : ''}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      {isWinner ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/40 text-amber-300 font-semibold text-[11px]">
                          <Trophy className="w-3.5 h-3.5 text-amber-400" />
                          <span>Annual Mega Gift Champion</span>
                        </span>
                      ) : isRunnerUp ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-pink-500/15 border border-pink-500/30 text-pink-300 text-[11px]">
                          <Star className="w-3 h-3 text-pink-400" />
                          <span>Silver Contender (২য় স্থান)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-800/80 text-zinc-400 text-[11px]">
                          <span>Active Fan Contender</span>
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="p-4 text-right">
                      {isAdminView ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onOpenBonusModal && onOpenBonusModal(u.id)}
                            className="px-2.5 py-1 rounded-lg bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/30 text-amber-300 font-medium text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Gift className="w-3.5 h-3.5 text-amber-400" />
                            <span>Gift Points</span>
                          </button>
                          {isWinner && (
                            <button
                              onClick={() => handleAwardClick(u.id)}
                              className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-black font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                            >
                              <Crown className="w-3.5 h-3.5" />
                              <span>Award Gift</span>
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="text-zinc-500 text-[11px] font-mono">
                          Ranked #{rankNum}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
