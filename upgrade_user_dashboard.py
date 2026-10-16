import re

with open('src/pages/UserDashboard.tsx', 'r', encoding='utf-8') as f:
    orig = f.read()

# Let's write the complete updated UserDashboard.tsx
updated_content = '''import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import {
  User,
  CheckCircle2,
  Clock,
  Send,
  MessageSquare,
  KeyRound,
  LogOut,
  Edit3,
  Save,
  Shield,
  Camera,
  Eye,
  Heart,
  Sparkles,
  ExternalLink,
  ShoppingBag,
  Award,
  Package,
  Truck,
  Gift,
  Calendar,
  MapPin,
  X,
  Maximize2,
  ArrowRight,
  TrendingUp,
  Mail,
  ChevronRight,
  Trophy,
  LayoutDashboard,
  Settings,
} from 'lucide-react';
import { UserMessage, PhotoItem, OrderItem } from '../types';
import { YearlyPointsGraph } from '../components/points/YearlyPointsGraph';

interface UserDashboardProps {
  onNavigate: (path: string, param?: string) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ onNavigate }) => {
  const { currentUser, logout, updateProfile, isAdminOrManager } = useAuth();
  const { photos, userMessages, sendUserMessage, likePhoto, orders, pointTransactions } = useData();

  // Active Tab inside User Account: Serialized Left Menu
  type UserAccountTab = 'overview' | 'graph' | 'points' | 'messages' | 'shopping' | 'other';
  const [activeAccountTab, setActiveAccountTab] = useState<UserAccountTab>('overview');

  // Profile Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editPhone, setEditPhone] = useState(currentUser?.phone || '');
  const [editBio, setEditBio] = useState(currentUser?.bio || '');
  const [profileSaved, setProfileSaved] = useState(false);

  // Message to Admin State
  const [msgSubject, setMsgSubject] = useState('');
  const [msgCategory, setMsgCategory] = useState<UserMessage['category']>('Fan Mail');
  const [msgBody, setMsgBody] = useState('');
  const [msgSent, setMsgSent] = useState(false);

  // Gallery filter & modal state
  const [photoFilter, setPhotoFilter] = useState<'all' | 'concert' | 'studio' | 'portrait' | 'cultural'>('all');
  const [selectedPhotoModal, setSelectedPhotoModal] = useState<PhotoItem | null>(null);

  // Password reset notice
  const [passwordNotice, setPasswordNotice] = useState(false);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#08080a] text-zinc-100 flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-amber-400/10 text-amber-400 flex items-center justify-center mx-auto">
            <User className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold font-display text-white">Member Portal Sign-In</h2>
          <p className="text-zinc-400 text-xs leading-relaxed">
            Please sign in to view your fan points balance, gift messages, order tracking, and backstage photo gallery.
          </p>
          <div className="flex gap-3 justify-center pt-2">
            <button
              onClick={() => onNavigate('/login')}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-black font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Sign In to Fan Account
            </button>
            <button
              onClick={() => onNavigate('/admin')}
              className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-amber-500/30 rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Login</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 1. User's Points
  const myPoints = currentUser.points ?? 100;
  const myTransactions = pointTransactions.filter((tx) => tx.userId === currentUser.id);

  // 2. User's Messages & Gift Notifications
  const myMessages = userMessages.filter(
    (m) => m.userId === currentUser.id || m.userEmail?.toLowerCase() === currentUser.email?.toLowerCase()
  );
  const giftMessages = myMessages.filter((m) => m.category === 'Gift Points');
  const repliedMessages = myMessages.filter((m) => m.status === 'replied');

  // 3. User's Shopping Orders
  const myOrders = orders.filter(
    (o) =>
      (o.userId && o.userId === currentUser.id) ||
      (o.customerEmail && o.customerEmail.toLowerCase() === currentUser.email.toLowerCase())
  );
  const totalShoppingSpent = myOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Filtered photos for gallery
  const filteredPhotos = photoFilter === 'all' ? photos : photos.filter((p) => p.category === photoFilter);

  // If user status is PENDING
  if (currentUser.status === 'pending') {
    return (
      <div className="min-h-screen bg-[#08080a] text-zinc-100 py-16 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-zinc-900/60 border border-amber-500/40 rounded-3xl p-8 sm:p-10 space-y-6 text-center shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
              <Clock className="w-8 h-8 animate-pulse" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-widest text-amber-400">
                Account Status: Pending Approval (অপেক্ষমাণ)
              </span>
              <h1 className="font-display text-3xl font-bold text-white">
                Welcome, {currentUser.name}
              </h1>
              <p className="text-sm text-zinc-300 max-w-md mx-auto leading-relaxed">
                Your fan account was registered on {new Date(currentUser.registeredAt).toLocaleDateString()}. Artist management will verify your registration shortly.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-left text-xs space-y-2">
              <p className="font-semibold text-white">Account Details:</p>
              <p className="text-zinc-400">Email: <span className="text-zinc-200">{currentUser.email}</span></p>
              {currentUser.phone && <p className="text-zinc-400">Phone: <span className="text-zinc-200">{currentUser.phone}</span></p>}
              <p className="text-zinc-400">Initial Fan Reward: <span className="text-amber-400 font-bold">{myPoints} Points Reserved</span></p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={() => onNavigate('/admin')}
                className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-amber-400 hover:text-black text-amber-300 border border-amber-500/40 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Shield className="w-4 h-4" />
                <span>Admin Login Portal</span>
              </button>
              <button
                onClick={logout}
                className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition-colors cursor-pointer"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: editName,
      phone: editPhone,
      bio: editBio,
    });
    setIsEditing(false);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgSubject || !msgBody) return;

    sendUserMessage({
      userId: currentUser.id,
      userEmail: currentUser.email,
      userName: currentUser.name,
      subject: msgSubject,
      category: msgCategory,
      message: msgBody,
    });

    setMsgSubject('');
    setMsgBody('');
    setMsgSent(true);
    setTimeout(() => setMsgSent(false), 4000);
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 py-8 relative overflow-hidden">
      {/* Ambient background glow matching artist aesthetics */}
      <div className="absolute top-0 right-1/4 w-[32rem] h-[32rem] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-10 w-[28rem] h-[28rem] bg-pink-700/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">

        {/* Global Notifications */}
        {passwordNotice && (
          <div className="p-4 rounded-2xl bg-zinc-900 border border-amber-500/40 text-xs text-zinc-300 flex items-center justify-between shadow-xl animate-fade-in">
            <span className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span>A password reset email has been dispatched to <strong>{currentUser.email}</strong>. Follow the instructions to update your credentials.</span>
            </span>
            <button
              onClick={() => setPasswordNotice(false)}
              className="text-amber-400 hover:underline font-semibold ml-4 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {profileSaved && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2 animate-fade-in shadow-xl">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Profile details updated successfully! Live across your fan portal.</span>
          </div>
        )}

        {/* =========================================================================
            TWO-COLUMN LAYOUT: LEFT SIDEBAR (বা পাশে সিরিয়াল করা মেনু) + RIGHT CONTENT
           ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT SIDEBAR (বা পাশে সিরিয়াল করা মেনু - col-span-12 lg:col-span-4 xl:col-span-3) */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-4">

            {/* Member Profile Card */}
            <div className="p-5 rounded-2xl bg-zinc-950/90 border border-zinc-800 space-y-3.5 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-xl overflow-hidden border-2 border-amber-400 shrink-0">
                  <img
                    src="/src/assets/images/rasel_babu_portrait_1791912893579.jpg"
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-0 right-0 p-0.5 rounded-full bg-amber-400 text-black">
                    <Sparkles className="w-2.5 h-2.5" />
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-white truncate">{currentUser.name}</div>
                  <div className="text-[11px] text-zinc-400 font-mono truncate">{currentUser.email}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] text-emerald-400 font-mono font-medium">Verified Fan Active</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px]">
                <span className="font-mono text-zinc-400">Total Points:</span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 font-mono font-bold text-xs">
                  {myPoints.toLocaleString()} PTS
                </span>
              </div>
            </div>

            {/* Serialized Main Navigation Options (বা পাশে সিরিয়াল মেনু) */}
            <div className="p-3.5 rounded-2xl bg-zinc-950/90 border border-zinc-800 space-y-1.5 shadow-xl">
              <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold flex items-center justify-between">
                <span>FAN DASHBOARD MENU</span>
                <span className="text-amber-400">6 SECTIONS</span>
              </div>

              <nav className="space-y-1" aria-label="User Dashboard Navigation">
                {[
                  {
                    id: 'overview' as const,
                    serial: '01',
                    label: 'Account Overview',
                    labelBn: 'প্রোফাইল ও সারাংশ',
                    icon: LayoutDashboard,
                  },
                  {
                    id: 'graph' as const,
                    serial: '02',
                    label: '1-Year Points Graph',
                    labelBn: '১ বছরের পয়েন্ট গ্রাফ',
                    icon: Trophy,
                    badge: '🏆 Reward',
                    badgeColor: 'bg-amber-400 text-black font-bold',
                  },
                  {
                    id: 'points' as const,
                    serial: '03',
                    label: 'Point & Bonus Gift',
                    labelBn: 'পয়েন্ট ব্যালেন্স ও উপহার',
                    icon: Gift,
                    badge: `${myPoints} pts`,
                    badgeColor: 'bg-amber-400/20 text-amber-300 border border-amber-400/40',
                  },
                  {
                    id: 'messages' as const,
                    serial: '04',
                    label: 'Message Reply',
                    labelBn: 'মেসেজ ইনবক্স ও উত্তর',
                    icon: Mail,
                    badge: myMessages.length > 0 ? myMessages.length : undefined,
                    badgeColor: 'bg-pink-600 text-white font-bold',
                  },
                  {
                    id: 'shopping' as const,
                    serial: '05',
                    label: 'Shopping Order',
                    labelBn: 'শপিং অর্ডার ও মার্চ',
                    icon: ShoppingBag,
                    badge: myOrders.length > 0 ? myOrders.length : undefined,
                    badgeColor: 'bg-emerald-600 text-white font-bold',
                  },
                  {
                    id: 'other' as const,
                    serial: '06',
                    label: 'Other Options',
                    labelBn: 'গ্যালারি ও সেটিংস',
                    icon: Camera,
                  },
                ].map((item) => {
                  const isActive = activeAccountTab === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveAccountTab(item.id)}
                      className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between group cursor-pointer ${
                        isActive
                          ? 'bg-amber-400 text-black font-bold shadow-lg shadow-amber-400/20'
                          : 'text-zinc-300 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-zinc-800'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`font-mono text-xs px-1.5 py-0.5 rounded font-bold ${
                            isActive
                              ? 'bg-black text-amber-300'
                              : 'bg-zinc-900 text-zinc-500 group-hover:text-amber-400'
                          }`}
                        >
                          {item.serial}
                        </span>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold truncate flex items-center gap-1.5">
                            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-amber-400'}`} />
                            <span>{item.label}</span>
                          </div>
                          <div
                            className={`text-[10px] truncate ${
                              isActive ? 'text-black/80 font-medium' : 'text-zinc-400'
                            }`}
                          >
                            {item.labelBn}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {item.badge !== undefined && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                              isActive
                                ? 'bg-black text-amber-300'
                                : item.badgeColor || 'bg-zinc-800 text-zinc-300'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                        <ChevronRight
                          className={`w-3.5 h-3.5 transition-transform ${
                            isActive ? 'text-black translate-x-0.5' : 'text-zinc-600 group-hover:text-zinc-400'
                          }`}
                        />
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Quick Actions (Password, Admin Portal, Logout) */}
            <div className="p-3.5 rounded-2xl bg-zinc-950/90 border border-zinc-800 space-y-2 shadow-xl">
              <button
                type="button"
                onClick={() => setPasswordNotice(true)}
                className="w-full p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-medium flex items-center justify-between transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  <span>Password Settings</span>
                </span>
                <ChevronRight className="w-3 h-3 text-zinc-600" />
              </button>

              {isAdminOrManager && (
                <button
                  type="button"
                  onClick={() => onNavigate('/admin')}
                  className="w-full p-2 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    <span>Admin Control Console</span>
                  </span>
                  <ExternalLink className="w-3 h-3 text-amber-400" />
                </button>
              )}

              <button
                type="button"
                onClick={logout}
                className="w-full p-2 rounded-xl bg-red-950/30 hover:bg-red-900/40 border border-red-500/20 text-red-400 text-xs font-medium flex items-center justify-between transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <LogOut className="w-3.5 h-3.5 text-red-400" />
                  <span>Sign Out of Account</span>
                </span>
                <ChevronRight className="w-3 h-3 text-red-500/50" />
              </button>
            </div>
          </div>

          {/* RIGHT WORKSPACE (col-span-12 lg:col-span-8 xl:col-span-9) */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-6">

            {/* =========================================================================
                TAB 01: ACCOUNT OVERVIEW (প্রোফাইল ও সারাংশ)
               ========================================================================= */}
            {activeAccountTab === 'overview' && (
              <div className="space-y-6 animate-fade-in">
                {/* 3 Primary Highlight Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Total Points */}
                  <div
                    onClick={() => setActiveAccountTab('points')}
                    className="p-5 rounded-2xl border bg-gradient-to-br from-amber-950/50 via-zinc-900 to-black border-amber-400/50 hover:border-amber-400 transition-all cursor-pointer relative overflow-hidden group shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-amber-300 font-bold flex items-center gap-1.5">
                        <Gift className="w-4 h-4 text-amber-400" />
                        <span>TOTAL POINTS</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-mono text-[10px] font-bold">
                        REWARDS
                      </span>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-white">
                        {myPoints.toLocaleString()}
                      </span>
                      <span className="text-xs font-mono text-amber-400 font-bold uppercase">PTS</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
                      <span>{myTransactions.length} Transactions</span>
                      <span className="text-amber-400 group-hover:translate-x-1 transition-transform">Details →</span>
                    </div>
                  </div>

                  {/* Total Messages */}
                  <div
                    onClick={() => setActiveAccountTab('messages')}
                    className="p-5 rounded-2xl border bg-gradient-to-br from-pink-950/50 via-zinc-900 to-black border-pink-400/50 hover:border-pink-400 transition-all cursor-pointer relative overflow-hidden group shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-pink-300 font-bold flex items-center gap-1.5">
                        <Mail className="w-4 h-4 text-pink-400" />
                        <span>TOTAL MESSAGES</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-mono text-[10px] font-bold">
                        INBOX
                      </span>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-200 to-white">
                        {myMessages.length}
                      </span>
                      <span className="text-xs font-mono text-pink-300 font-bold uppercase">NOTICES</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
                      <span>{repliedMessages.length} Replied</span>
                      <span className="text-pink-400 group-hover:translate-x-1 transition-transform">Inbox →</span>
                    </div>
                  </div>

                  {/* Total Shopping */}
                  <div
                    onClick={() => setActiveAccountTab('shopping')}
                    className="p-5 rounded-2xl border bg-gradient-to-br from-emerald-950/50 via-zinc-900 to-black border-emerald-400/50 hover:border-emerald-400 transition-all cursor-pointer relative overflow-hidden group shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-300 font-bold flex items-center gap-1.5">
                        <ShoppingBag className="w-4 h-4 text-emerald-400" />
                        <span>TOTAL SHOPPING</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                        ORDERS
                      </span>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-white">
                        {myOrders.length}
                      </span>
                      <span className="text-xs font-mono text-emerald-400 font-bold uppercase">ORDERS</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
                      <span className="font-mono text-amber-300 font-bold">৳ {totalShoppingSpent.toLocaleString()} BDT</span>
                      <span className="text-emerald-400 group-hover:translate-x-1 transition-transform">Tracking →</span>
                    </div>
                  </div>
                </div>

                {/* Points & Shopping Quick View */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Fan Points Card */}
                  <div className="p-6 rounded-3xl bg-zinc-900/50 border border-zinc-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                        <Gift className="w-4 h-4 text-amber-400" />
                        <span>Fan Reward Balance</span>
                      </h3>
                      <button
                        type="button"
                        onClick={() => setActiveAccountTab('points')}
                        className="text-xs text-amber-400 hover:underline cursor-pointer"
                      >
                        View History →
                      </button>
                    </div>

                    <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-zinc-950 to-black border border-amber-500/30 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-amber-300/80">Available Points</span>
                        <div className="text-3xl font-black font-mono text-amber-300">{myPoints.toLocaleString()} PTS</div>
                        <span className="text-[11px] text-zinc-400">Redeem for concert passes &amp; fan merchandise.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onNavigate('/shop')}
                        className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs transition-colors cursor-pointer"
                      >
                        Use Points
                      </button>
                    </div>

                    {giftMessages.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">Latest Gift Letter:</span>
                        <div className="p-3.5 rounded-xl bg-zinc-950 border border-amber-500/30 space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-amber-300">{giftMessages[0].subject}</span>
                            <span className="text-[10px] font-mono text-zinc-500">
                              {new Date(giftMessages[0].createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                            {giftMessages[0].message}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Shopping Activity */}
                  <div className="p-6 rounded-3xl bg-zinc-900/50 border border-zinc-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-emerald-400" />
                        <span>My Shopping &amp; Orders</span>
                      </h3>
                      <button
                        type="button"
                        onClick={() => setActiveAccountTab('shopping')}
                        className="text-xs text-emerald-400 hover:underline cursor-pointer"
                      >
                        View All Orders →
                      </button>
                    </div>

                    {myOrders.length > 0 ? (
                      <div className="space-y-3">
                        {myOrders.slice(0, 2).map((order) => (
                          <div
                            key={order.id}
                            className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs"
                          >
                            <div className="space-y-1">
                              <span className="font-bold text-white block">{order.productTitle}</span>
                              <span className="text-[11px] text-zinc-400 block">
                                Order #{order.id} · Qty: {order.quantity} · {order.paymentMethod}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="font-mono font-bold text-amber-300 block">৳ {order.totalAmount} BDT</span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                {order.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 text-center space-y-3">
                        <p className="text-xs text-zinc-400">You haven't ordered any fan merchandise yet.</p>
                        <button
                          type="button"
                          onClick={() => onNavigate('/shop')}
                          className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs transition-colors cursor-pointer"
                        >
                          Browse Official Merch Shop
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Actions Shortcuts */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div
                    onClick={() => setActiveAccountTab('messages')}
                    className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-pink-500/40 transition-all cursor-pointer flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center shrink-0">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Ask Artist Management</h4>
                      <p className="text-[11px] text-zinc-400">Send fan mail, booking or song questions</p>
                    </div>
                  </div>

                  <div
                    onClick={() => setActiveAccountTab('graph')}
                    className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-amber-400/40 transition-all cursor-pointer flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center shrink-0">
                      <Trophy className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">1-Year Points & Mega Reward</h4>
                      <p className="text-[11px] text-zinc-400">Annual Fan of the Year Mega Gift</p>
                    </div>
                  </div>

                  <div
                    onClick={() => onNavigate('/distribution')}
                    className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-pink-500/40 transition-all cursor-pointer flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">FK Music Distribution</h4>
                      <p className="text-[11px] text-zinc-400">150+ Stores & global audio ingestion</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================================
                TAB 02: 1-YEAR POINTS PROGRESSION GRAPH (১ বছরের পয়েন্ট গ্রাফ ও মেগা পুরস্কার)
               ========================================================================= */}
            {activeAccountTab === 'graph' && (
              <div className="space-y-6 animate-fade-in">
                <YearlyPointsGraph isAdminView={false} />
              </div>
            )}

            {/* =========================================================================
                TAB 03: POINTS & BONUS GIFTS (পয়েন্ট ব্যালেন্স ও গিফট ট্রানজ্যাকশন)
               ========================================================================= */}
            {activeAccountTab === 'points' && (
              <div className="space-y-6 animate-fade-in">
                {/* Wallet Big Banner */}
                <div className="p-8 rounded-3xl bg-gradient-to-r from-amber-950/70 via-zinc-900 to-black border border-amber-500/40 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-mono uppercase">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Fan Rewards Wallet · Verified Fan Club</span>
                      </div>
                      <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">
                        Your Point Balance: <span className="text-amber-300 font-mono">{myPoints.toLocaleString()} PTS</span>
                      </h2>
                      <p className="text-xs sm:text-sm text-zinc-300 max-w-xl leading-relaxed">
                        Every member receives initial points and bonus points gifted by Rasel Babu management for loyalty, concert ticket purchases, and active community participation.
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => onNavigate('/shop')}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-black font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-400/20 transition-all cursor-pointer"
                      >
                        Redeem in Fan Shop
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveAccountTab('messages')}
                        className="px-6 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs text-center transition-colors cursor-pointer"
                      >
                        View Gift Letters ({giftMessages.length})
                      </button>
                    </div>
                  </div>
                </div>

                {/* Gift Congratulation Cards Received */}
                <div className="p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800 space-y-4">
                  <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                    <Gift className="w-4 h-4 text-amber-400" />
                    <span>Gift Points &amp; Bonus Transaction History</span>
                  </h3>

                  {myTransactions.length > 0 || giftMessages.length > 0 ? (
                    <div className="space-y-3 font-mono text-xs">
                      {giftMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className="p-4 rounded-2xl bg-zinc-950 border border-amber-500/30 space-y-2 relative overflow-hidden"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-amber-300 flex items-center gap-1.5 font-sans text-sm">
                              <Sparkles className="w-4 h-4 text-amber-400" />
                              <span>{msg.subject}</span>
                            </span>
                            <span className="text-[10px] text-zinc-500">
                              {new Date(msg.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs font-sans text-zinc-200 leading-relaxed bg-amber-950/20 p-3 rounded-xl border border-amber-500/20">
                            {msg.message}
                          </p>
                          <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
                            <span>Sender: <strong>{msg.repliedBy || 'Rasel Babu Official Management'}</strong></span>
                            <span className="text-emerald-400 font-bold">Credited to Balance ✓</span>
                          </div>
                        </div>
                      ))}

                      {myTransactions.map((tx) => (
                        <div
                          key={tx.id}
                          className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-white block">{tx.title}</span>
                            <span className="text-[11px] text-zinc-400 block">{tx.note}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-emerald-400 font-bold block text-sm">+{tx.amount} PTS</span>
                            <span className="text-[10px] text-zinc-500">{new Date(tx.timestamp).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 text-center space-y-2">
                      <p className="text-xs text-zinc-400">No bonus gift transactions recorded yet.</p>
                      <p className="text-[11px] text-zinc-500">
                        When Rasel Babu or site admins send bonus points to your account, you will receive an instant congratulatory notification here!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* =========================================================================
                TAB 04: MESSAGES & REPLIES (মেসেজ ইনবক্স ও আর্টিস্টের উত্তর)
               ========================================================================= */}
            {activeAccountTab === 'messages' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
                {/* Left: Compose Message */}
                <div className="lg:col-span-5 bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-4">
                  <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-amber-400" />
                    <span>Write to Artist Management</span>
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Submit questions regarding concert bookings, lyrics, song requests, or technical support directly to Rasel Babu's official desk.
                  </p>

                  {msgSent && (
                    <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Message dispatched successfully! Check the inbox beside for replies.</span>
                    </div>
                  )}

                  <form onSubmit={handleSendMessage} className="space-y-3.5">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-zinc-300">Subject</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. VIP passes for concert or song question"
                        value={msgSubject}
                        onChange={(e) => setMsgSubject(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-zinc-300">Category</label>
                      <select
                        value={msgCategory}
                        onChange={(e) => setMsgCategory(e.target.value as any)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                      >
                        <option value="Fan Mail">Fan Mail / Song Feedback</option>
                        <option value="Booking Query">Concert &amp; Ticket Question</option>
                        <option value="Song Request">Song Request for Live Tour</option>
                        <option value="Technical Support">Technical &amp; Account Support</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-zinc-300">Your Message</label>
                      <textarea
                        rows={4}
                        required
                        placeholder="Write your note to Rasel Babu and executive management..."
                        value={msgBody}
                        onChange={(e) => setMsgBody(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-black font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-400/20"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Message to Management</span>
                    </button>
                  </form>
                </div>

                {/* Right: Messages List with Admin Replies */}
                <div className="lg:col-span-7 bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <h3 className="font-display text-lg font-bold text-white">
                      Inbox &amp; Replies ({myMessages.length})
                    </h3>
                    <span className="text-xs font-mono text-zinc-400">
                      {repliedMessages.length} Admin Replies Received
                    </span>
                  </div>

                  {myMessages.length > 0 ? (
                    <div className="space-y-4">
                      {myMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`p-4 rounded-xl border space-y-3 text-xs ${
                            msg.category === 'Gift Points'
                              ? 'bg-amber-950/20 border-amber-500/40'
                              : 'bg-zinc-950 border-zinc-800/80'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                                  msg.category === 'Gift Points'
                                    ? 'bg-amber-400/20 text-amber-300 font-bold'
                                    : 'bg-zinc-800 text-zinc-400'
                                }`}
                              >
                                {msg.category}
                              </span>
                              <span className="font-semibold text-white text-sm">{msg.subject}</span>
                            </div>
                            <span className="font-mono text-[10px] text-zinc-500">
                              {new Date(msg.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          <p className="text-zinc-300 leading-relaxed bg-zinc-900/50 p-3 rounded-lg border border-zinc-800">
                            {msg.message}
                          </p>

                          {msg.reply ? (
                            <div className="p-3.5 rounded-lg bg-amber-950/30 border border-amber-500/30 space-y-1 text-zinc-200">
                              <div className="flex items-center justify-between text-[11px] font-semibold text-amber-400">
                                <span>Official Reply from {msg.repliedBy || 'Management'}</span>
                                <span className="font-mono text-[10px] text-zinc-400">
                                  {msg.repliedAt ? new Date(msg.repliedAt).toLocaleDateString() : ''}
                                </span>
                              </div>
                              <p className="leading-relaxed mt-1">{msg.reply}</p>
                            </div>
                          ) : (
                            <div className="text-[11px] font-mono text-zinc-500 flex items-center gap-1.5">
                              <Clock className="w-3 h-3 text-amber-400" />
                              <span>Status: Delivered · Awaiting Management Reply</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500 italic py-6 text-center">
                      You have not received any messages or replies yet. Submit a message using the form to start a conversation.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* =========================================================================
                TAB 05: SHOPPING & ORDERS (শপিং অর্ডার ও ডেলিভারি হিস্ট্রি)
               ========================================================================= */}
            {activeAccountTab === 'shopping' && (
              <div className="space-y-6 animate-fade-in">
                {/* Header with Spend Summary */}
                <div className="p-6 rounded-3xl bg-zinc-900/50 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-emerald-400" />
                      <span>My Merchandise Orders &amp; Shopping Ledger</span>
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1">
                      Track your official t-shirts, exclusive three-piece apparel, vinyl albums, and concert tickets.
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-[10px] font-mono uppercase text-zinc-400">Total Spent</span>
                      <div className="text-xl font-bold font-mono text-amber-300">৳ {totalShoppingSpent.toLocaleString()} BDT</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onNavigate('/shop')}
                      className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Shop More
                    </button>
                  </div>
                </div>

                {/* Orders List */}
                {myOrders.length > 0 ? (
                  <div className="space-y-4">
                    {myOrders.map((order) => (
                      <div
                        key={order.id}
                        className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4 text-xs shadow-lg"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-sm">Order #{order.id}</span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300">
                                {new Date(order.orderDate).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-xs text-zinc-300 font-semibold mt-1">{order.productTitle}</p>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-mono text-base font-bold text-amber-300">৳ {order.totalAmount} BDT</span>
                            <span
                              className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold uppercase ${
                                order.status === 'delivered'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : order.status === 'shipped'
                                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-zinc-400">
                          <div>
                            <span className="text-[10px] font-mono uppercase block text-zinc-500">Quantity &amp; Size</span>
                            <span className="text-zinc-200">Qty: {order.quantity} {order.size ? `· Size: ${order.size}` : ''}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-mono uppercase block text-zinc-500">Payment Method</span>
                            <span className="text-zinc-200">{order.paymentMethod}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-mono uppercase block text-zinc-500">Shipping Address</span>
                            <span className="text-zinc-200 truncate block">{order.deliveryAddress}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 rounded-3xl bg-zinc-950 border border-zinc-800 text-center space-y-4">
                    <ShoppingBag className="w-10 h-10 text-zinc-600 mx-auto" />
                    <h4 className="font-display text-lg font-bold text-white">No Merchandise Orders Yet</h4>
                    <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                      Support artist Rasel Babu by purchasing official stage tour t-shirts, exclusive designer three-piece attire, and autographed vinyl records.
                    </p>
                    <button
                      type="button"
                      onClick={() => onNavigate('/shop')}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-black font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Explore Rasel Babu Merch Shop
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* =========================================================================
                TAB 06: OTHER OPTIONS (এক্সক্লুসিভ গ্যালারি ও প্রোফাইল সেটিংস)
               ========================================================================= */}
            {activeAccountTab === 'other' && (
              <div className="space-y-8 animate-fade-in">
                {/* Profile Settings Box */}
                <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                    <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
                      <Edit3 className="w-5 h-5 text-amber-400" />
                      <span>Member Profile &amp; Contact Settings (প্রোফাইল সেটিংস)</span>
                    </h2>
                    <button
                      type="button"
                      onClick={() => setIsEditing(!isEditing)}
                      className="text-xs text-amber-400 hover:underline cursor-pointer"
                    >
                      {isEditing ? 'Cancel Edit' : 'Edit Information'}
                    </button>
                  </div>

                  {isEditing ? (
                    <form onSubmit={handleSaveProfile} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-zinc-400">Display Name</label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-zinc-400">Phone</label>
                        <input
                          type="tel"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-zinc-400">Bio &amp; Music Interests</label>
                        <textarea
                          rows={3}
                          value={editBio}
                          onChange={(e) => setEditBio(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-xl bg-amber-400 text-black font-semibold text-xs hover:bg-amber-300 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Profile Updates</span>
                      </button>
                    </form>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-zinc-500 block">Full Name</span>
                        <span className="text-zinc-200 font-medium text-sm">{currentUser.name}</span>
                      </div>

                      <div>
                        <span className="text-zinc-500 block">Email Address</span>
                        <span className="text-zinc-200 font-medium">{currentUser.email}</span>
                      </div>

                      <div>
                        <span className="text-zinc-500 block">Contact Phone</span>
                        <span className="text-zinc-200 font-medium">{currentUser.phone || 'Not provided'}</span>
                      </div>

                      <div>
                        <span className="text-zinc-500 block">Member Access Tier</span>
                        <span className="text-amber-400 font-mono capitalize">{currentUser.role} · Verified Fan Club</span>
                      </div>

                      <div className="sm:col-span-2">
                        <span className="text-zinc-500 block">Fan Note / Bio</span>
                        <p className="text-zinc-300 mt-1 leading-relaxed bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/80">
                          {currentUser.bio || 'Passionate listener of Rasel Babu acoustic melodies and live performances.'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Backstage Photo Gallery */}
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-800 pb-4">
                    <div>
                      <div className="flex items-center gap-2 text-amber-400 text-xs font-mono uppercase tracking-wider mb-1">
                        <Camera className="w-4 h-4" />
                        <span>Rasel Babu Exclusive Photos</span>
                      </div>
                      <h2 className="font-display text-2xl font-bold text-white">
                        Backstage &amp; Concert Photo Archive
                      </h2>
                    </div>

                    {/* Filter buttons */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                      {(
                        [
                          { id: 'all', label: 'All Photos' },
                          { id: 'concert', label: 'Concert Stage' },
                          { id: 'studio', label: 'Studio' },
                          { id: 'portrait', label: 'Portraits' },
                          { id: 'cultural', label: 'Heritage' },
                        ] as const
                      ).map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setPhotoFilter(f.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                            photoFilter === f.id
                              ? 'bg-amber-400 text-black font-semibold shadow-md shadow-amber-400/20'
                              : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Photos Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredPhotos.map((photo) => (
                      <div
                        key={photo.id}
                        onClick={() => setSelectedPhotoModal(photo)}
                        className="group relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900/60 hover:border-amber-500/50 transition-all duration-300 shadow-lg cursor-pointer flex flex-col"
                      >
                        <div className="relative aspect-[4/3] overflow-hidden bg-zinc-950">
                          <img
                            src={photo.imageUrl}
                            alt={photo.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/75 border border-zinc-700/80 text-[10px] font-mono uppercase tracking-wider text-amber-300">
                            {photo.category}
                          </span>

                          <div className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/60 text-zinc-300 group-hover:text-amber-400 group-hover:scale-110 transition-all">
                            <Maximize2 className="w-3.5 h-3.5" />
                          </div>

                          <div className="absolute bottom-2.5 left-2.5 right-2.5 text-xs">
                            <h3 className="font-semibold text-white line-clamp-1 group-hover:text-amber-300 transition-colors">
                              {photo.title}
                            </h3>
                            <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-1">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-amber-400/80" />
                                <span className="truncate max-w-[120px]">{photo.location}</span>
                              </span>
                              <span className="flex items-center gap-1 text-pink-400 font-mono">
                                <Heart className="w-3 h-3 fill-pink-500/30" />
                                <span>{photo.likes}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Modal for Full-Res Artist Photo Viewing */}
        {selectedPhotoModal && (
          <div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSelectedPhotoModal(null)}
          >
            <div
              className="relative max-w-4xl w-full bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-[16/10] bg-black">
                <img
                  src={selectedPhotoModal.imageUrl}
                  alt={selectedPhotoModal.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                />
                <button
                  onClick={() => setSelectedPhotoModal(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/80 hover:bg-zinc-800 text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 pt-0 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">{selectedPhotoModal.title}</h3>
                  <button
                    onClick={() => likePhoto(selectedPhotoModal.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-500/10 border border-pink-500/30 text-pink-400 text-xs font-semibold hover:bg-pink-500/20 transition-colors cursor-pointer"
                  >
                    <Heart className="w-4 h-4 fill-pink-500/30" />
                    <span>{selectedPhotoModal.likes} Likes</span>
                  </button>
                </div>
                {selectedPhotoModal.caption && (
                  <p className="text-xs text-zinc-300 leading-relaxed">{selectedPhotoModal.caption}</p>
                )}
                <div className="flex items-center gap-4 text-xs font-mono text-zinc-400 pt-2 border-t border-zinc-800">
                  <span>Category: {selectedPhotoModal.category}</span>
                  {selectedPhotoModal.location && <span>· Location: {selectedPhotoModal.location}</span>}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
'''

with open('src/pages/UserDashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(updated_content)

print("UserDashboard.tsx rewritten successfully with left sidebar layout!")
