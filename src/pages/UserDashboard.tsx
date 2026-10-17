import React, { useState } from 'react';
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
  Phone,
  Search,
  AlertCircle,
} from 'lucide-react';
import { UserMessage, PhotoItem, OrderItem } from '../types';
import { YearlyPointsGraph } from '../components/points/YearlyPointsGraph';

interface UserDashboardProps {
  onNavigate: (path: string, param?: string) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ onNavigate }) => {
  const { currentUser, logout, updateProfile, isAdminOrManager, changePassword } = useAuth();
  const { photos, userMessages, sendUserMessage, likePhoto, orders, products, pointTransactions, openProductView } = useData();

  // Active Tab inside User Account
  const [activeAccountTab, setActiveAccountTab] = useState<'overview' | 'points' | 'leaderboard' | 'messages' | 'shopping' | 'gallery' | 'profile'>('overview');


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

  // Password change modal state
  const [passwordModal, setPasswordModal] = useState<{
    open: boolean;
    currentPass: string;
    newPass: string;
    confirmPass: string;
    loading: boolean;
    error: string | null;
    success: string | null;
  }>({
    open: false,
    currentPass: '',
    newPass: '',
    confirmPass: '',
    loading: false,
    error: null,
    success: null,
  });

  // Shopping Order Live Tracking Search Query
  const [orderTrackingSearch, setOrderTrackingSearch] = useState('');

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
              className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-black font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Sign In to Your Account / লগইন
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

            <div className="flex justify-center pt-2">
              <button
                onClick={logout}
                className="px-6 py-2.5 rounded-xl border border-zinc-800 text-zinc-300 hover:text-white bg-zinc-900 text-xs transition-colors cursor-pointer"
              >
                Sign Out
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
    <div className="min-h-screen bg-[#08080a] text-zinc-100 py-10 relative overflow-hidden">
      {/* Background ambient artist glow */}
      <div className="absolute top-0 right-1/4 w-[30rem] h-[30rem] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-10 w-[26rem] h-[26rem] bg-pink-700/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
        
        {/* TOP PROFILE HERO BANNER */}
        <div className="relative rounded-3xl overflow-hidden border border-zinc-800 bg-gradient-to-r from-zinc-950 via-zinc-900 to-black p-6 sm:p-8 shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-amber-400/80 shadow-xl shrink-0 group">
                <img
                  src="/src/assets/images/rasel_babu_portrait_1791912893579.jpg"
                  alt="Rasel Babu"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute bottom-1 right-1 p-1 rounded-full bg-amber-400 text-black">
                  <Sparkles className="w-3 h-3" />
                </span>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                    Official Fan Club Member
                  </span>
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Verified {currentUser.role.toUpperCase()}</span>
                  </span>
                </div>
                <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                  Welcome, {currentUser.name}
                </h1>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
                  {currentUser.email} {currentUser.phone ? `· ${currentUser.phone}` : ''}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {isAdminOrManager && (
                <button
                  onClick={() => onNavigate('/admin')}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-black font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-400/20 transition-all cursor-pointer"
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin Panel Console</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setPasswordModal({ open: true, currentPass: '', newPass: '', confirmPass: '', loading: false, error: null, success: null })}
                className="px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs font-medium text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>Change Password</span>
              </button>
              <button
                onClick={logout}
                className="px-3.5 py-2.5 rounded-xl bg-red-950/40 border border-red-500/30 text-xs font-medium text-red-400 hover:bg-red-900/40 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>

        {profileSaved && (
          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Profile details updated successfully!</span>
          </div>
        )}

        {/* =========================================================================
            TWO-COLUMN RESPONSIVE LAYOUT: LEFT SIDEBAR + RIGHT WORKSPACE
            (ইউজার ড্যাশবোর্ডে admin dashboard-এর মতো সিরিয়াল করে বাঁ পাশে মেনুবার)
           ========================================================================= */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* LEFT SIDEBAR (বা পাশে সিরিয়াল মেনুবার) */}
          <aside className="w-full lg:w-80 shrink-0 lg:sticky lg:top-20 space-y-4">
            {/* User Profile Mini Badge Card */}
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/90 shadow-xl space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-pink-600 text-black font-display font-black text-lg flex items-center justify-center shrink-0 shadow-md shadow-amber-400/20">
                  {currentUser.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-white truncate">{currentUser.name}</div>
                  <div className="text-[11px] text-zinc-400 font-mono truncate">{currentUser.email}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] text-emerald-400 font-mono font-medium">Fan Club Active Member</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-800/80 grid grid-cols-3 gap-1.5 text-center">
                <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase block">Points</span>
                  <span className="text-xs font-mono font-bold text-amber-400">{myPoints}</span>
                </div>
                <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase block">Orders</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">{myOrders.length}</span>
                </div>
                <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase block">Messages</span>
                  <span className="text-xs font-mono font-bold text-pink-400">{myMessages.length}</span>
                </div>
              </div>
            </div>

            {/* Serialized Navigation Menu (বা পাশে সিরিয়াল মেনু) */}
            <div className="p-3.5 rounded-2xl bg-zinc-950/90 border border-zinc-800 space-y-1.5 shadow-xl">
              <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold flex items-center justify-between">
                <span>FAN DASHBOARD MENU (মেনু অপশন)</span>
                <span className="text-amber-400">7 SECTIONS</span>
              </div>

              <nav className="space-y-1" aria-label="User Navigation">
                {[
                  {
                    id: 'overview' as const,
                    serial: '01',
                    label: 'Account Overview',
                    labelBn: 'অ্যাকাউন্ট ওভারভিউ ও সামারি',
                    icon: LayoutDashboard,
                  },
                  {
                    id: 'leaderboard' as const,
                    serial: '02',
                    label: '1-Year Graph & Mega Gift',
                    labelBn: '১ বছরের পয়েন্ট গ্রাফ ও মেগা উপহার',
                    icon: Trophy,
                    badge: '🏆 Mega Gift',
                    badgeColor: 'bg-amber-400 text-black font-bold',
                  },
                  {
                    id: 'points' as const,
                    serial: '03',
                    label: 'Point & Bonus Gift',
                    labelBn: 'পয়েন্ট ব্যালেন্স ও উপহার হিস্ট্রি',
                    icon: Gift,
                    badge: `${myPoints} pts`,
                    badgeColor: 'bg-amber-400/20 text-amber-300 font-mono',
                  },
                  {
                    id: 'messages' as const,
                    serial: '04',
                    label: 'Message & Reply',
                    labelBn: 'মেসেজ সিন ও অফিশিয়াল রিপ্লাই',
                    icon: Mail,
                    badge: repliedMessages.length > 0 ? `${repliedMessages.length} replied` : myMessages.length || undefined,
                    badgeColor: 'bg-pink-500/20 text-pink-300 font-mono',
                  },
                  {
                    id: 'shopping' as const,
                    serial: '05',
                    label: 'Shopping Order',
                    labelBn: 'শপিং অর্ডার ও পার্সেল ট্র্যাকিং',
                    icon: ShoppingBag,
                    badge: myOrders.length || undefined,
                    badgeColor: 'bg-emerald-500/20 text-emerald-300',
                  },
                  {
                    id: 'gallery' as const,
                    serial: '06',
                    label: 'Exclusive Gallery & Media',
                    labelBn: 'এক্সক্লুসিভ ফটো ও ভিডিও',
                    icon: Camera,
                  },
                  {
                    id: 'profile' as const,
                    serial: '07',
                    label: 'Profile Settings',
                    labelBn: 'ব্যক্তিগত তথ্য ও পাসওয়ার্ড',
                    icon: Edit3,
                  },
                ].map((item) => {
                  const isActive = activeAccountTab === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveAccountTab(item.id)}
                      className={`w-full p-2.5 rounded-xl text-left transition-all flex items-center justify-between group cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-black font-bold shadow-lg shadow-amber-400/20'
                          : 'bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${
                            isActive ? 'bg-black text-amber-300' : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          {item.serial}
                        </span>
                        <div className="min-w-0">
                          <div className="text-xs font-bold truncate flex items-center gap-1.5">
                            <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-black' : 'text-amber-400'}`} />
                            <span className="truncate">{item.label}</span>
                          </div>
                          <div
                            className={`text-[10px] truncate ${
                              isActive ? 'text-black/75 font-medium' : 'text-zinc-500'
                            }`}
                          >
                            {item.labelBn}
                          </div>
                        </div>
                      </div>

                      {item.badge !== undefined && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono shrink-0 ml-1.5 ${
                            isActive ? 'bg-black text-amber-300 font-bold' : item.badgeColor
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* FK Music & Rasel Babu Desk Help Card */}
            <div className="p-4 rounded-2xl bg-[#190215] border border-pink-500/30 space-y-2.5 shadow-xl">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300 font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Need Support or Inquiry?</span>
              </span>
              <p className="text-[11px] text-pink-200/80 leading-snug">
                ফ্যান পয়েন্ট, অর্ডার ডেলিভারি বা যেকোনো সহায়তায় সরাসরি যোগাযোগ করুন:
              </p>
              <div className="space-y-1.5 pt-1 text-xs font-mono">
                <a
                  href="https://wa.me/8801723138736"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 flex items-center gap-2 hover:bg-emerald-900/80 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>WhatsApp: 01723138736</span>
                </a>
                <a
                  href="mailto:raselbabu@fkmusicltd.com"
                  className="px-3 py-1.5 rounded-lg bg-pink-950/80 border border-pink-500/40 text-pink-300 flex items-center gap-2 hover:bg-pink-900/80 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>raselbabu@fkmusicltd.com</span>
                </a>
                <a
                  href="mailto:support@fkmusicltd.com"
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 flex items-center gap-2 hover:bg-zinc-800 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>support@fkmusicltd.com</span>
                </a>
              </div>
            </div>
          </aside>

          {/* RIGHT WORKSPACE (ডান পাশে মূল কন্টেন্ট) */}
          <div className="flex-1 min-w-0 w-full space-y-8">
            {/* 3 PRIMARY HIGHLIGHT CARDS: TOTAL POINTS, TOTAL MESSAGES, TOTAL SHOPPING */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* 1. TOTAL POINTS (মোট পয়েন্ট) */}
              <div
                onClick={() => setActiveAccountTab('points')}
                className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group shadow-xl ${
                  activeAccountTab === 'points'
                    ? 'bg-gradient-to-br from-amber-950/60 via-zinc-900 to-black border-amber-400 ring-1 ring-amber-400/50'
                    : 'bg-zinc-900/60 hover:bg-zinc-800/80 border-zinc-800 hover:border-amber-500/50'
                }`}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-amber-300 flex items-center gap-1.5 font-bold">
                    <Gift className="w-3.5 h-3.5 text-amber-400" />
                    <span>TOTAL POINTS</span>
                  </span>
                  <span className="px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-mono text-[9px] font-bold">
                    REWARDS
                  </span>
                </div>

                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="text-3xl sm:text-4xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-white">
                    {myPoints.toLocaleString()}
                  </span>
                  <span className="text-xs font-mono text-amber-400 font-bold uppercase">PTS</span>
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-400 border-t border-zinc-800/80 pt-2">
                  <span className="truncate text-emerald-400">
                    {myTransactions.length} Transactions
                  </span>
                  <span className="text-amber-400 group-hover:translate-x-0.5 transition-transform">
                    History →
                  </span>
                </div>
              </div>

              {/* 2. TOTAL MESSAGES (মোট মেসেজ) */}
              <div
                onClick={() => setActiveAccountTab('messages')}
                className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group shadow-xl ${
                  activeAccountTab === 'messages'
                    ? 'bg-gradient-to-br from-pink-950/60 via-zinc-900 to-black border-pink-400 ring-1 ring-pink-400/50'
                    : 'bg-zinc-900/60 hover:bg-zinc-800/80 border-zinc-800 hover:border-pink-500/50'
                }`}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-pink-300 flex items-center gap-1.5 font-bold">
                    <Mail className="w-3.5 h-3.5 text-pink-400" />
                    <span>TOTAL MESSAGES</span>
                  </span>
                  <span className="px-1.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-mono text-[9px] font-bold">
                    INBOX
                  </span>
                </div>

                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="text-3xl sm:text-4xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-200 to-white">
                    {myMessages.length}
                  </span>
                  <span className="text-xs font-mono text-pink-300 font-bold uppercase">NOTICES</span>
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-400 border-t border-zinc-800/80 pt-2">
                  <span className="truncate text-pink-300">
                    {repliedMessages.length} Replied
                  </span>
                  <span className="text-pink-400 group-hover:translate-x-0.5 transition-transform">
                    Inbox →
                  </span>
                </div>
              </div>

              {/* 3. TOTAL SHOPPING (মোট শপিং) */}
              <div
                onClick={() => setActiveAccountTab('shopping')}
                className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group shadow-xl ${
                  activeAccountTab === 'shopping'
                    ? 'bg-gradient-to-br from-emerald-950/60 via-zinc-900 to-black border-emerald-400 ring-1 ring-emerald-400/50'
                    : 'bg-zinc-900/60 hover:bg-zinc-800/80 border-zinc-800 hover:border-emerald-500/50'
                }`}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-300 flex items-center gap-1.5 font-bold">
                    <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
                    <span>TOTAL SHOPPING</span>
                  </span>
                  <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[9px] font-bold">
                    ORDERS
                  </span>
                </div>

                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="text-3xl sm:text-4xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-white">
                    {myOrders.length}
                  </span>
                  <span className="text-xs font-mono text-emerald-400 font-bold uppercase">
                    {myOrders.length === 1 ? 'ORDER' : 'ORDERS'}
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-400 border-t border-zinc-800/80 pt-2">
                  <span className="font-mono text-amber-300 font-bold truncate">
                    ৳{totalShoppingSpent.toLocaleString()} Spent
                  </span>
                  <span className="text-emerald-400 group-hover:translate-x-0.5 transition-transform">
                    Track →
                  </span>
                </div>
              </div>
            </div>

        {/* =========================================================================
            TAB 1: OVERVIEW (সংক্ষিপ্ত সারসংক্ষেপ)
           ========================================================================= */}
        {activeAccountTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            {/* Recent Highlights Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Left: Latest Point Bonus or Gifts */}
              <div className="p-6 rounded-3xl bg-zinc-900/50 border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                    <Gift className="w-4 h-4 text-amber-400" />
                    <span>Fan Reward Points Balance</span>
                  </h3>
                  <button
                    onClick={() => setActiveAccountTab('points')}
                    className="text-xs text-amber-400 hover:underline cursor-pointer"
                  >
                    View All →
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-zinc-950 to-black border border-amber-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-amber-300/80">Current Point Balance</span>
                    <div className="text-3xl font-black font-mono text-amber-300">{myPoints} PTS</div>
                    <span className="text-[11px] text-zinc-400">Can be redeemed for concert discounts &amp; exclusive merchandise.</span>
                  </div>
                  <button
                    onClick={() => onNavigate('/shop')}
                    className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs transition-colors cursor-pointer"
                  >
                    Use Points
                  </button>
                </div>

                {giftMessages.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">Latest Gift Letter from Management:</span>
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

              {/* Right: Latest Shopping Activity */}
              <div className="p-6 rounded-3xl bg-zinc-900/50 border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-emerald-400" />
                    <span>My Shopping &amp; Orders</span>
                  </h3>
                  <button
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
                onClick={() => onNavigate('/shop')}
                className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-emerald-500/40 transition-all cursor-pointer flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Official Merchandise</h4>
                  <p className="text-[11px] text-zinc-400">Three-piece dress, vinyl, tour t-shirts</p>
                </div>
              </div>

              <div
                onClick={() => onNavigate('/distribution')}
                className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-cyan-500/40 transition-all cursor-pointer flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">FK Music Distribution</h4>
                  <p className="text-[11px] text-zinc-400">150+ Stores &amp; 4 HD dashboard previews</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB: 1-YEAR POINTS GRAPH & ANNUAL MEGA GIFT LEADERBOARD
            (১ বছরের পয়েন্ট গ্রাফ, বার্ষিক র‍্যাংকিং ও মেগা গিফট শোকেস)
           ========================================================================= */}
        {activeAccountTab === 'leaderboard' && (
          <div className="space-y-6 animate-fade-in">
            <YearlyPointsGraph isAdminView={false} />
          </div>
        )}

        {/* =========================================================================
            TAB 2: POINTS & BONUS GIFTS (পয়েন্ট ও উপহার হিস্ট্রি)
           ========================================================================= */}
        {activeAccountTab === 'points' && (
          <div className="space-y-6 animate-fade-in">
            {/* Top 1-Year Points Tracking Graph & Annual Mega Gift */}
            <YearlyPointsGraph isAdminView={false} />

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
                  <p className="text-xs sm:text-sm text-zinc-300 max-w-xl">
                    Every member receives initial points and bonus points gifted by Rasel Babu management for loyalty, concert ticket purchases, and active community participation.
                  </p>
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={() => onNavigate('/shop')}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-black font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-400/20 transition-all cursor-pointer"
                  >
                    Redeem in Fan Shop
                  </button>
                  <button
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
            TAB 3: MESSAGES & REPLIES (মেসেজ ও অ্যাডমিন রিপ্লাই ইনবক্স)
           ========================================================================= */}
        {activeAccountTab === 'messages' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
            {/* Left: Compose Message */}
            <div className="lg:col-span-5 bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-4">
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
            <div className="lg:col-span-7 bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-4">
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
            TAB 4: SHOPPING & ORDERS (শপিং ও অর্ডার ট্র্যাকিং)
           ========================================================================= */}
        {activeAccountTab === 'shopping' && (() => {
          const filteredOrders = myOrders.filter((ord) => {
            const q = orderTrackingSearch.toLowerCase().trim();
            if (!q) return true;
            return (
              ord.id.toLowerCase().includes(q) ||
              ord.productTitle.toLowerCase().includes(q) ||
              ord.customerPhone.toLowerCase().includes(q) ||
              ord.deliveryAddress.toLowerCase().includes(q) ||
              ord.paymentMethod.toLowerCase().includes(q)
            );
          });

          const getStatusInfo = (status: OrderItem['status']) => {
            switch (status) {
              case 'pending':
                return { step: 1, label: 'Order Placed (অর্ডার গৃহীত)', bg: 'bg-amber-400/10 text-amber-300 border-amber-400/40' };
              case 'confirmed':
                return { step: 2, label: 'Confirmed (প্যাকিং চলছে)', bg: 'bg-blue-400/10 text-blue-300 border-blue-400/40' };
              case 'shipped':
                return { step: 3, label: 'In Transit (শিপিং চলছে)', bg: 'bg-purple-400/10 text-purple-300 border-purple-400/40' };
              case 'delivered':
                return { step: 4, label: 'Delivered (ডেলিভার্ড)', bg: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/40' };
              case 'cancelled':
                return { step: 0, label: 'Cancelled (বাতিলকৃত)', bg: 'bg-red-400/10 text-red-300 border-red-400/40' };
              default:
                return { step: 1, label: status, bg: 'bg-zinc-800 text-zinc-300 border-zinc-700' };
            }
          };

          return (
            <div className="space-y-6 animate-fade-in">
              {/* Header with Live Status & Search Banner */}
              <div className="p-6 rounded-3xl bg-zinc-900/60 border border-amber-500/30 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-display text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                      <Truck className="w-6 h-6 text-amber-400" />
                      <span>Track My Orders &amp; Live Status (অর্ডার ট্র্যাকিং ও লাইভ স্ট্যাটাস)</span>
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1">
                      আপনার অর্ডারকৃত টি-শার্ট, এক্সক্লুসিভ থ্রি-পিস, অ্যালবাম ও মার্চেন্ডাইজের রিয়েলটাইম ডেলিভারি স্ট্যাটাস ট্র্যাক করুন।
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] font-mono uppercase text-zinc-400 block">Total Shopping</span>
                      <span className="text-lg font-bold font-mono text-amber-300">৳ {totalShoppingSpent.toLocaleString()} BDT</span>
                    </div>

                    <button
                      onClick={() => onNavigate('/shop')}
                      className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Store Catalog &rarr;
                    </button>
                  </div>
                </div>

                {/* Lookup / Search Bar */}
                <div className="flex items-center gap-2 pt-2 border-t border-zinc-800/80">
                  <div className="relative flex-1 sm:max-w-xs">
                    <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search by Order ID or Item..."
                      value={orderTrackingSearch}
                      onChange={(e) => setOrderTrackingSearch(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                  {orderTrackingSearch && (
                    <button
                      onClick={() => setOrderTrackingSearch('')}
                      className="px-3 py-2 rounded-xl bg-zinc-800 text-xs text-zinc-400 hover:text-white"
                    >
                      Clear
                    </button>
                  )}
                  <span className="text-[11px] font-mono text-zinc-500 hidden sm:inline">
                    Showing {filteredOrders.length} of {myOrders.length} orders
                  </span>
                </div>
              </div>

              {/* Orders List with 4-Step Visual Progress Bar */}
              {filteredOrders.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-zinc-950 border border-zinc-800 space-y-4">
                  <Package className="w-12 h-12 text-zinc-600 mx-auto" />
                  <div className="space-y-1">
                    <h4 className="text-base font-semibold text-white">No Orders Found</h4>
                    <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                      {orderTrackingSearch
                        ? 'No orders matched your search query. Try clearing your search.'
                        : 'You have not placed any orders yet. Visit our official store to order exclusive apparel and merchandise.'}
                    </p>
                  </div>
                  <button
                    onClick={() => onNavigate('/shop')}
                    className="px-5 py-2.5 rounded-xl bg-amber-400 text-black font-bold text-xs hover:bg-amber-300 transition-colors cursor-pointer"
                  >
                    Explore Merch Shop &rarr;
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  {filteredOrders.map((ord) => {
                    const statusInfo = getStatusInfo(ord.status);
                    const associatedProduct = products.find((p) => p.id === ord.productId);

                    return (
                      <div
                        key={ord.id}
                        className="p-6 rounded-3xl bg-zinc-900/50 border border-zinc-800 space-y-5 shadow-xl relative overflow-hidden"
                      >
                        {/* Top Bar: Order ID, Date & Live Status Badge */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold font-mono text-amber-400">
                                Order #{ord.id.slice(-6).toUpperCase()}
                              </span>
                              <span className="text-xs text-zinc-400 font-mono">
                                · {new Date(ord.orderDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                            <p className="text-xs text-zinc-400 mt-0.5">
                              Recipient: <strong className="text-zinc-200">{ord.customerName}</strong> ({ord.customerPhone})
                            </p>
                          </div>

                          <div className="flex items-center gap-2.5">
                            <span className={`px-3 py-1 rounded-full border text-xs font-bold font-mono ${statusInfo.bg}`}>
                              {statusInfo.label}
                            </span>
                            <a
                              href={`https://wa.me/8801723138736?text=Hello%20Rasel%20Babu%20Store%20Desk,%20Inquiry%20regarding%20Order%20%23${ord.id.slice(-6).toUpperCase()}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              <span>Inquire</span>
                            </a>
                          </div>
                        </div>

                        {/* 4-Step Progress Tracker */}
                        {ord.status !== 'cancelled' && (
                          <div className="space-y-2 py-1">
                            <span className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider">
                              Shipment &amp; Delivery Progress (ডেলিভারি ট্র্যাকিং ধাপসমূহ):
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
                                      } ${isCurrent ? 'animate-pulse ring-2 ring-amber-400/40' : ''}`}
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

                        {/* Product & Payment Details */}
                        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div
                            onClick={() => associatedProduct && openProductView(associatedProduct)}
                            className="flex items-center gap-3 min-w-0 cursor-pointer group/prod"
                            title="Click to view product details and all photos (ছবি ও বিস্তারিত দেখতে ক্লিক করুন)"
                          >
                            {associatedProduct?.imageUrl ? (
                              <img
                                src={associatedProduct.imageUrl}
                                alt={ord.productTitle}
                                className="w-14 h-14 rounded-xl object-cover border border-zinc-700 group-hover/prod:border-amber-400 shrink-0 transition-colors"
                              />
                            ) : (
                              <div className="w-14 h-14 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-400 shrink-0">
                                <Package className="w-6 h-6" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <h5 className="font-semibold text-white text-xs truncate group-hover/prod:text-amber-300 underline decoration-zinc-700 group-hover/prod:decoration-amber-400 transition-colors">
                                {ord.productTitle}
                              </h5>
                              <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                                Qty: <strong className="text-white">{ord.quantity}</strong> {ord.size ? `· Size: ${ord.size}` : ''}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 font-mono inline-block">
                                  Payment: {ord.paymentMethod}
                                </span>
                                <span className="text-[10px] text-amber-400/90 font-mono flex items-center gap-0.5">
                                  <Eye className="w-3 h-3" /> View Product
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="sm:text-right shrink-0 border-t sm:border-t-0 border-zinc-800/80 pt-2 sm:pt-0">
                            <span className="text-[10px] font-mono uppercase text-zinc-400 block">Total Amount</span>
                            <span className="text-base font-bold font-mono text-emerald-400 block">
                              ৳{ord.totalAmount.toLocaleString()} BDT
                            </span>
                          </div>
                        </div>

                        {/* Delivery Address & Note */}
                        <div className="text-xs text-zinc-400 space-y-1 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/80">
                          <div className="flex items-start gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                            <span>Delivery Address: <strong className="text-zinc-200">{ord.deliveryAddress}</strong></span>
                          </div>
                          {ord.notes && (
                            <div className="text-[11px] text-zinc-500 italic pl-5">
                              Note: {ord.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}

        {/* =========================================================================
            TAB 5: EXCLUSIVE MEDIA (ফটো গ্যালারি)
           ========================================================================= */}
        {activeAccountTab === 'gallery' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-800 pb-4">
              <div>
                <div className="flex items-center gap-2 text-amber-400 text-xs font-mono uppercase tracking-wider mb-1">
                  <Camera className="w-4 h-4" />
                  <span>Rasel Babu Official Artist Photos</span>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
        )}

        {/* =========================================================================
            TAB 6: PROFILE SETTINGS (প্রোফাইল সেটিংস)
           ========================================================================= */}
        {activeAccountTab === 'profile' && (
          <div className="max-w-2xl mx-auto bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-400" />
                <span>Member Profile &amp; Contact Information</span>
              </h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs text-amber-400 hover:underline cursor-pointer"
              >
                {isEditing ? 'Cancel' : 'Edit Information'}
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
              <div className="space-y-4 text-xs">
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
                  <span className="text-amber-400 font-mono capitalize">{currentUser.role} · Fan Club</span>
                </div>

                <div>
                  <span className="text-zinc-500 block">Fan Note / Bio</span>
                  <p className="text-zinc-300 mt-1 leading-relaxed bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/80">
                    {currentUser.bio || 'Passionate listener of Rasel Babu acoustic melodies and live performances.'}
                  </p>
                </div>

                {/* Dedicated Security & Password Change Card */}
                <div className="pt-4 border-t border-zinc-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-zinc-950/80 rounded-2xl border border-zinc-800">
                    <div>
                      <span className="text-zinc-200 font-semibold block text-xs flex items-center gap-1.5">
                        <KeyRound className="w-4 h-4 text-amber-400" />
                        <span>Account Password / পাসওয়ার্ড পরিবর্তন</span>
                      </span>
                      <p className="text-zinc-500 text-[11px] mt-0.5">
                        Update your password to keep your member account secure.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPasswordModal({ open: true, currentPass: '', newPass: '', confirmPass: '', loading: false, error: null, success: null })}
                      className="px-3.5 py-2 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Change Password</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal for Full-Res Artist Photo Viewing */}
        {selectedPhotoModal && (
          <div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in"
            onClick={() => setSelectedPhotoModal(null)}
          >
            <div
              className="relative max-w-4xl w-full bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/80">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-mono text-[10px] uppercase">
                    {selectedPhotoModal.category}
                  </span>
                  <h3 className="font-display text-lg font-bold text-white truncate max-w-md">
                    {selectedPhotoModal.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedPhotoModal(null)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative overflow-hidden bg-black flex items-center justify-center max-h-[60vh]">
                <img
                  src={selectedPhotoModal.imageUrl}
                  alt={selectedPhotoModal.title}
                  className="w-full h-full max-h-[60vh] object-contain"
                />
              </div>

              <div className="p-5 space-y-3 bg-zinc-900/60 overflow-y-auto">
                <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed">
                  {selectedPhotoModal.caption}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400 pt-2 border-t border-zinc-800">
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      <span>{selectedPhotoModal.location}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-pink-400" />
                      <span>{selectedPhotoModal.date}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        likePhoto(selectedPhotoModal.id);
                        setSelectedPhotoModal({
                          ...selectedPhotoModal,
                          likes: selectedPhotoModal.likes + 1,
                        });
                      }}
                      className="px-3 py-1.5 rounded-lg bg-pink-950/40 border border-pink-500/40 text-pink-300 hover:bg-pink-900/50 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Heart className="w-3.5 h-3.5 fill-pink-500" />
                      <span>{selectedPhotoModal.likes} Likes</span>
                    </button>
                    <button
                      onClick={() => onNavigate('/photo-detail', selectedPhotoModal.id)}
                      className="px-3.5 py-1.5 rounded-lg bg-amber-400 text-black font-semibold text-xs hover:bg-amber-300 transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Photo Page</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: Change Member Password */}
        {passwordModal.open && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl animate-fade-in">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2 text-amber-400">
                  <KeyRound className="w-5 h-5" />
                  <h3 className="font-display text-lg font-bold text-white">
                    Change Account Password
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setPasswordModal((prev) => ({ ...prev, open: false }))}
                  className="text-zinc-500 hover:text-white text-xs cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>

              {passwordModal.error && (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{passwordModal.error}</span>
                </div>
              )}

              {passwordModal.success && (
                <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{passwordModal.success}</span>
                </div>
              )}

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setPasswordModal((prev) => ({ ...prev, error: null, success: null }));

                  if (passwordModal.newPass.length < 6) {
                    setPasswordModal((prev) => ({ ...prev, error: 'New password must be at least 6 characters long.' }));
                    return;
                  }

                  if (passwordModal.newPass !== passwordModal.confirmPass) {
                    setPasswordModal((prev) => ({ ...prev, error: 'New passwords do not match.' }));
                    return;
                  }

                  setPasswordModal((prev) => ({ ...prev, loading: true }));
                  const res = await changePassword(passwordModal.currentPass, passwordModal.newPass);
                  setPasswordModal((prev) => ({
                    ...prev,
                    loading: false,
                    error: res.success ? null : res.message,
                    success: res.success ? 'Your password has been updated successfully!' : null,
                    currentPass: res.success ? '' : prev.currentPass,
                    newPass: res.success ? '' : prev.newPass,
                    confirmPass: res.success ? '' : prev.confirmPass,
                  }));
                }}
                className="space-y-3.5 text-xs"
              >
                <div className="space-y-1">
                  <label className="text-zinc-300 font-medium">Current Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={passwordModal.currentPass}
                    onChange={(e) => setPasswordModal((prev) => ({ ...prev, currentPass: e.target.value }))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-medium">New Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Minimum 6 characters"
                    value={passwordModal.newPass}
                    onChange={(e) => setPasswordModal((prev) => ({ ...prev, newPass: e.target.value }))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-medium">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Repeat new password"
                    value={passwordModal.confirmPass}
                    onChange={(e) => setPasswordModal((prev) => ({ ...prev, confirmPass: e.target.value }))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="submit"
                    disabled={passwordModal.loading}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-black font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    {passwordModal.loading ? 'Updating Password...' : 'Save New Password'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPasswordModal((prev) => ({ ...prev, open: false }))}
                    className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

          </div>
        </div>

      </div>
    </div>
  );
};
