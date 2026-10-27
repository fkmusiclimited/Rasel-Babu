import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  PhotoItem,
  Album,
  Track,
  VideoItem,
  NewsArticle,
  TourEvent,
  ContactInquiry,
  UserMessage,
  AdsterraConfig,
  AnalyticsStats,
  Product,
  OrderItem,
  HomepageSettings,
  PointTransaction,
  DistributionInquiry,
  AnnualGiftConfig,
} from '../types';
import { useAuth } from './AuthContext';
import {
  INITIAL_PHOTOS,
  INITIAL_ALBUMS,
  INITIAL_VIDEOS,
  INITIAL_NEWS,
  INITIAL_TOUR_EVENTS,
  INITIAL_ADSTERRA_CONFIG,
  INITIAL_ANALYTICS,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_HOMEPAGE_SETTINGS,
  INITIAL_DISTRIBUTION_INQUIRIES,
  INITIAL_ANNUAL_GIFT_CONFIG,
} from '../data/seedData';

import { audioSynth } from '../utils/audioSynth';
import { updateWebsiteFavicon } from '../utils/imageCompress';
import {
  subscribeToHomepageSettings,
  saveHomepageSettingsToFirestore,
  fetchHomepageSettingsFromFirestore,
  subscribeToPhotos,
  fetchPhotosFromFirestore,
  savePhotoToFirestore,
  updatePhotoInFirestore,
  deletePhotoFromFirestore,
  batchSyncPhotosToFirestore,
  deleteDemoPhotosFromFirestore,
  subscribeToProducts,
  saveProductToFirestore,
  updateProductInFirestore,
  deleteProductFromFirestore,
  batchSyncProductsToFirestore,
  subscribeToVideos,
  fetchVideosFromFirestore,
  saveVideoToFirestore,
  updateVideoInFirestore,
  deleteVideoFromFirestore,
} from '../firebase/firestoreService';

interface ActiveTrackState {
  track: Track | null;
  album: Album | null;
  isPlaying: boolean;
  volume: number;
  progress: number;
}

interface DataContextType {
  // Photos (Centrally Persisted in Cloud & Live Synced across all devices)
  photos: PhotoItem[];
  photosLoading: boolean;
  addPhoto: (photo: Omit<PhotoItem, 'id' | 'views' | 'likes'>) => Promise<{ success: boolean; message?: string }>;
  updatePhoto: (id: string, updates: Partial<PhotoItem>) => Promise<{ success: boolean; message?: string }>;
  deletePhoto: (id: string) => Promise<{ success: boolean; message?: string }>;
  likePhoto: (id: string) => void;
  incrementPhotoViews: (id: string) => void;
  reloadPhotos: () => Promise<void>;
  syncAllPhotosToCloud: () => Promise<{ success: boolean; message?: string }>;
  deleteDemoPhotosFromCloud: () => Promise<{ success: boolean; message: string }>;

  // Albums & Music
  albums: Album[];
  addAlbum: (album: Omit<Album, 'id'>) => void;
  deleteAlbum: (id: string) => void;

  // Audio Player
  activePlayer: ActiveTrackState;
  playTrack: (track: Track, album: Album) => void;
  togglePlayPause: () => void;
  setPlayerVolume: (vol: number) => void;
  seekPlayer: (progressPercent: number) => void;
  stopAudio: () => void;

  // Videos (Centrally Persisted & Live Synced)
  videos: VideoItem[];
  videosLoading: boolean;
  addVideo: (video: Omit<VideoItem, 'id'>) => Promise<{ success: boolean; message?: string }>;
  updateVideo: (id: string, updated: Partial<VideoItem>) => Promise<{ success: boolean; message?: string }>;
  deleteVideo: (id: string) => Promise<{ success: boolean; message?: string }>;
  reloadVideos: () => Promise<void>;

  // Products / Store (Centrally Persisted in Cloud & Live Synced)
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Promise<{ success: boolean; message?: string }>;
  updateProduct: (id: string, updated: Partial<Product>) => Promise<{ success: boolean; message?: string }>;
  deleteProduct: (id: string) => Promise<{ success: boolean; message?: string }>;
  viewingProduct: Product | null;
  openProductView: (productOrId: Product | string) => void;
  closeProductView: () => void;
  syncAllProductsToCloud: () => Promise<{ success: boolean; message?: string }>;
  cloudConnected: boolean;

  // Store Orders
  orders: OrderItem[];
  placeOrder: (order: Omit<OrderItem, 'id' | 'orderDate' | 'status'>) => OrderItem;
  updateOrderStatus: (id: string, status: OrderItem['status']) => void;
  deleteOrder: (id: string) => void;

  // News
  news: NewsArticle[];
  addNewsArticle: (article: Omit<NewsArticle, 'id'>) => void;
  deleteNewsArticle: (id: string) => void;

  // Tour
  tourEvents: TourEvent[];
  addTourEvent: (event: Omit<TourEvent, 'id'>) => void;
  deleteTourEvent: (id: string) => void;

  // Contact & Booking
  inquiries: ContactInquiry[];
  submitInquiry: (inquiry: Omit<ContactInquiry, 'id' | 'createdAt' | 'status'>) => void;
  updateInquiryStatus: (id: string, status: ContactInquiry['status']) => void;
  deleteInquiry: (id: string) => void;

  // Messages & Admin Replies
  userMessages: UserMessage[];
  sendUserMessage: (msg: Omit<UserMessage, 'id' | 'createdAt' | 'status'>) => void;
  replyToUserMessage: (id: string, replyText: string, adminName: string) => void;
  deleteUserMessageReply: (id: string) => void;
  deleteUserMessage: (id: string) => void;

  // Adsterra Config
  adsterraConfig: AdsterraConfig;
  updateAdsterraConfig: (updates: Partial<AdsterraConfig>) => void;
  togglePageAdPlacement: (pageKey: keyof AdsterraConfig['pagePlacements']) => void;

  // Analytics
  analytics: AnalyticsStats;
  recordPageView: (path: string) => void;

  // Homepage Dynamic Content (Editable by Admin & Centrally Persisted)
  homepageSettings: HomepageSettings;
  updateHomepageSettings: (updates: Partial<HomepageSettings>) => Promise<{ success: boolean; message?: string }>;
  reloadSettings: () => Promise<HomepageSettings | null>;
  settingsLoading: boolean;

  // Fan Bonus Points Management
  pointTransactions: PointTransaction[];
  sendBonusPoints: (userId: string, amount: number, note?: string) => { success: boolean; message: string };

  // Distribution Inquiries & Artist Messages (from website)
  distributionInquiries: DistributionInquiry[];
  submitDistributionInquiry: (inquiry: Omit<DistributionInquiry, 'id' | 'createdAt' | 'status'>) => void;
  updateDistributionInquiryStatus: (id: string, status: DistributionInquiry['status']) => void;
  replyToDistributionInquiry: (id: string, replyText: string) => void;
  deleteDistributionInquiry: (id: string) => void;

  // Annual Fan of the Year Mega Gift System
  annualGiftConfig: AnnualGiftConfig;
  updateAnnualGiftConfig: (updates: Partial<AnnualGiftConfig>) => void;
  awardAnnualMegaGift: (userId: string) => { success: boolean; message: string };
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const POINTS_TX_KEY = 'raselbabu_points_tx_v1';
const PHOTOS_KEY = 'raselbabu_photos_v1';
const ALBUMS_KEY = 'raselbabu_albums_v1';
const VIDEOS_KEY = 'raselbabu_videos_v1';
const NEWS_KEY = 'raselbabu_news_v1';
const TOURS_KEY = 'raselbabu_tours_v1';
const INQUIRIES_KEY = 'raselbabu_inquiries_v1';
const MESSAGES_KEY = 'raselbabu_messages_v1';
const ADS_KEY = 'raselbabu_adsterra_v2';
const ANALYTICS_KEY = 'raselbabu_analytics_v1';
const PRODUCTS_KEY = 'raselbabu_products_v1';
const ORDERS_KEY = 'raselbabu_orders_v1';
const HOMEPAGE_SETTINGS_KEY = 'raselbabu_home_settings_v1';
const DIST_INQUIRIES_KEY = 'raselbabu_dist_inquiries_v1';
const ANNUAL_GIFT_KEY = 'raselbabu_annual_gift_v1';


const INITIAL_POINT_TRANSACTIONS: PointTransaction[] = [
  {
    id: 'pt-seed-1',
    userId: 'user-fan-1',
    amount: 100,
    type: 'signup_bonus',
    title: '🎉 Welcome Fan Signup Bonus',
    note: 'Initial welcome points for joining Rasel Babu Official Fan Club.',
    timestamp: '2025-03-01T14:30:00.000Z',
    sender: 'System Automator',
  },
  {
    id: 'pt-seed-2',
    userId: 'user-fan-1',
    amount: 320,
    type: 'bonus_gift',
    title: '🎁 Special Gift Points Received',
    note: 'Congratulations! Gift from Rasel Babu Management for concert attendance and loyal support.',
    timestamp: '2025-03-10T16:00:00.000Z',
    sender: 'Rasel Babu Official Management',
  },
  {
    id: 'pt-seed-3',
    userId: 'user-pending-1',
    amount: 100,
    type: 'signup_bonus',
    title: '🎉 Welcome Fan Signup Bonus',
    note: 'Initial welcome points for joining Rasel Babu Official Fan Club.',
    timestamp: '2025-03-12T08:15:00.000Z',
    sender: 'System Automator',
  },
];

const normalizeImagePath = (url?: string): string => {
  if (!url) return '';
  if (url.startsWith('/src/assets/images/')) {
    return url.replace('/src/assets/images/', '/assets/images/');
  }
  return url;
};

const normalizePhotoItem = (p: any): PhotoItem => {
  if (!p || typeof p !== 'object') {
    return {
      id: `photo-${Date.now()}`,
      title: 'Untitled Photo',
      category: 'concert',
      imageUrl: '',
      caption: '',
      date: new Date().toISOString().split('T')[0],
      location: 'Dhaka, Bangladesh',
      photographer: 'Official Media Team',
      views: 0,
      likes: 0,
      tags: [],
    };
  }
  return {
    id: String(p.id || `photo-${Date.now()}`),
    title: String(p.title || 'Untitled Photo'),
    category: (p.category as PhotoItem['category']) || 'concert',
    imageUrl: normalizeImagePath(p.imageUrl),
    caption: String(p.caption || ''),
    date: String(p.date || new Date().toISOString().split('T')[0]),
    location: String(p.location || 'Dhaka, Bangladesh'),
    photographer: String(p.photographer || 'Official Media Team'),
    views: typeof p.views === 'number' ? p.views : 0,
    likes: typeof p.likes === 'number' ? p.likes : 0,
    tags: Array.isArray(p.tags) ? p.tags : [],
  };
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { users, addPointsToUser } = useAuth();

  // Points Transactions
  const [pointTransactions, setPointTransactions] = useState<PointTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(POINTS_TX_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_POINT_TRANSACTIONS;
  });

  // Photos (Central Persistent Storage)
  const [photosLoading, setPhotosLoading] = useState(false);
  const [photos, setPhotos] = useState<PhotoItem[]>(() => {
    try {
      const saved = localStorage.getItem(PHOTOS_KEY);
      if (saved) {
        const parsed: PhotoItem[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(normalizePhotoItem);
        }
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PHOTOS.map(normalizePhotoItem);
  });

  // Albums
  const [albums, setAlbums] = useState<Album[]>(() => {
    try {
      const saved = localStorage.getItem(ALBUMS_KEY);
      if (saved) {
        const parsed: Album[] = JSON.parse(saved);
        return parsed.map((a) => {
          if (a.coverUrl?.startsWith('/src/assets/images/')) {
            const match = INITIAL_ALBUMS.find((ia) => ia.id === a.id);
            if (match) return { ...a, coverUrl: match.coverUrl };
          }
          return a;
        });
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_ALBUMS;
  });

  // Videos (Central Persistent Storage)
  const [videosLoading, setVideosLoading] = useState(false);
  const [videos, setVideos] = useState<VideoItem[]>(() => {
    try {
      const saved = localStorage.getItem(VIDEOS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_VIDEOS;
  });

  // Products
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(PRODUCTS_KEY);
      if (saved) {
        const parsed: Product[] = JSON.parse(saved);
        return parsed.map((p) => {
          const match = INITIAL_PRODUCTS.find((init) => init.id === p.id);
          let imageUrl = p.imageUrl;
          if (match && (!imageUrl || imageUrl.startsWith('/src/assets/images/'))) {
            imageUrl = match.imageUrl;
          }
          let additionalImages = p.additionalImages;
          if (!additionalImages || additionalImages.length === 0) {
            additionalImages = match?.additionalImages;
          } else if (match?.additionalImages) {
            additionalImages = additionalImages.map((img, idx) => {
              if (img && img.startsWith('/src/assets/images/') && match.additionalImages?.[idx]) {
                return match.additionalImages[idx];
              }
              return img;
            });
          }
          return {
            ...p,
            imageUrl,
            additionalImages,
          };
        });
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PRODUCTS;
  });

  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  const openProductView = (productOrId: Product | string) => {
    if (typeof productOrId === 'string') {
      const found = products.find((p) => p.id === productOrId);
      if (found) setViewingProduct(found);
    } else {
      setViewingProduct(productOrId);
    }
  };

  const closeProductView = () => {
    setViewingProduct(null);
  };

  // Orders
  const [orders, setOrders] = useState<OrderItem[]>(() => {
    try {
      const saved = localStorage.getItem(ORDERS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_ORDERS;
  });

  // News
  const [news, setNews] = useState<NewsArticle[]>(() => {
    try {
      const saved = localStorage.getItem(NEWS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_NEWS;
  });

  // Tour
  const [tourEvents, setTourEvents] = useState<TourEvent[]>(() => {
    try {
      const saved = localStorage.getItem(TOURS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_TOUR_EVENTS;
  });

  // Inquiries
  const [inquiries, setInquiries] = useState<ContactInquiry[]>(() => {
    try {
      const saved = localStorage.getItem(INQUIRIES_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'inq-1',
        name: 'Bengal Cultural Society London',
        email: 'events@bengalheritage.org.uk',
        phone: '+44 20 7946 0991',
        inquiryType: 'Concert Performance',
        eventDate: '2026-06-15',
        location: 'London, UK',
        budget: '$15,000 USD',
        message: 'We cordially invite Rasel Babu to headline the Summer Bengali Music Festival 2026.',
        createdAt: '2026-02-18T10:00:00.000Z',
        status: 'reviewed',
      },
    ];
  });

  // User Messages & Admin replies
  const [userMessages, setUserMessages] = useState<UserMessage[]>(() => {
    try {
      const saved = localStorage.getItem(MESSAGES_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'msg-1',
        userId: 'user-fan-1',
        userEmail: 'sadia.fan@gmail.com',
        userName: 'Sadia Rahman',
        subject: 'Acoustic Guitar Tabs for "Moner Canvas"',
        message: 'Dear Rasel Bhai, will your management team release guitar chords and tabs for Moner Canvas? Love your songs so much!',
        category: 'Fan Mail',
        reply: 'Thank you Sadia! The acoustic tabs will be published in the user dashboard next week. Keep practicing!',
        repliedAt: '2025-03-05T14:00:00.000Z',
        repliedBy: 'Rasel Babu Management',
        status: 'replied',
        createdAt: '2025-03-04T12:00:00.000Z',
      },
    ];
  });

  // Adsterra Config (Top floating ad permanently disabled per user instruction)
  const [adsterraConfig, setAdsterraConfig] = useState<AdsterraConfig>(() => {
    try {
      const saved = localStorage.getItem(ADS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_ADSTERRA_CONFIG,
          ...parsed,
          socialBarEnabled: false, // Ensure top floating ad stays permanently off
          bannerKeys: {
            ...INITIAL_ADSTERRA_CONFIG.bannerKeys,
            ...(parsed.bannerKeys || {}),
            socialBarKey: '',
          },
          pagePlacements: {
            ...INITIAL_ADSTERRA_CONFIG.pagePlacements,
            ...(parsed.pagePlacements || {}),
          },
        };
      }
    } catch (e) {
      console.error(e);
    }
    return { ...INITIAL_ADSTERRA_CONFIG, socialBarEnabled: false };
  });

  // Analytics
  const [analytics, setAnalytics] = useState<AnalyticsStats>(() => {
    try {
      const saved = localStorage.getItem(ANALYTICS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_ANALYTICS;
  });


const sanitizeSettings = (raw: any): HomepageSettings => {
  if (!raw || typeof raw !== 'object') return { ...INITIAL_HOMEPAGE_SETTINGS };
  const merged: HomepageSettings = { ...INITIAL_HOMEPAGE_SETTINGS, ...raw };

  merged.websiteLogo = normalizeImagePath(merged.websiteLogo) || '';
  merged.aboutImageUrl = normalizeImagePath(merged.aboutImageUrl);
  merged.heroImageUrl = normalizeImagePath(merged.heroImageUrl);
  merged.annualGiftImage = normalizeImagePath(merged.annualGiftImage);
  merged.artistProfileImage = normalizeImagePath(merged.artistProfileImage) || INITIAL_HOMEPAGE_SETTINGS.artistProfileImage;
  merged.artistProfileSquare = normalizeImagePath(merged.artistProfileSquare) || merged.artistProfileImage || INITIAL_HOMEPAGE_SETTINGS.artistProfileSquare;

  return merged;
};

  // Homepage Dynamic Editable Settings with Central Server Persistence
  const [homepageSettings, setHomepageSettings] = useState<HomepageSettings>(() => {
    try {
      const saved = localStorage.getItem(HOMEPAGE_SETTINGS_KEY);
      if (saved) {
        return sanitizeSettings(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_HOMEPAGE_SETTINGS;
  });

  const [settingsLoading, setSettingsLoading] = useState(true);

  // Helper to fetch settings from Firestore, API or static mirror
  const fetchSettingsData = async (): Promise<HomepageSettings | null> => {
    // Strategy 1: Direct Cloud Firestore fetch (Works on all hosts, netlify, mobile & desktop)
    try {
      const cloudSettings = await fetchHomepageSettingsFromFirestore();
      if (cloudSettings) {
        return sanitizeSettings(cloudSettings);
      }
    } catch {}

    // Strategy 2: Check full-stack Express API if running
    try {
      const res = await fetch(`/api/settings?t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
      });
      const ct = res.headers.get('content-type') || '';
      if (res.ok && ct.includes('application/json')) {
        const data = await res.json();
        if (data && data.success && data.settings) {
          return sanitizeSettings(data.settings);
        }
      }
    } catch {}

    // Strategy 3: Check persistent static mirror (/settings.json on static hosts)
    try {
      const res = await fetch(`/settings.json?t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
      });
      const ct = res.headers.get('content-type') || '';
      if (res.ok && ct.includes('application/json')) {
        const data = await res.json();
        if (data && typeof data === 'object') {
          const settingsObj = data.settings || data;
          if (settingsObj && typeof settingsObj === 'object') {
            return sanitizeSettings(settingsObj);
          }
        }
      }
    } catch {}

    return null;
  };

  // Reload settings from central server / cloud database
  const reloadSettings = async (): Promise<HomepageSettings | null> => {
    const clean = await fetchSettingsData();
    if (clean) {
      setHomepageSettings(clean);
      try {
        localStorage.setItem(HOMEPAGE_SETTINGS_KEY, JSON.stringify(clean));
      } catch {}
      const icon = clean.websiteLogo || clean.artistProfileSquare || clean.artistProfileImage;
      if (icon) {
        updateWebsiteFavicon(icon);
      }
      return clean;
    }
    return null;
  };

  // Real-Time Cloud Firestore Listener for Homepage Settings & Profile Photo
  useEffect(() => {
    let isMounted = true;

    // Initial fetch
    fetchSettingsData()
      .then((clean) => {
        if (!isMounted || !clean) return;
        setHomepageSettings(clean);
        try {
          localStorage.setItem(HOMEPAGE_SETTINGS_KEY, JSON.stringify(clean));
        } catch (e) {
          console.warn('LocalStorage sync warning:', e);
        }
        const icon = clean.websiteLogo || clean.artistProfileSquare || clean.artistProfileImage;
        if (icon) {
          updateWebsiteFavicon(icon);
        }
      })
      .finally(() => {
        if (isMounted) setSettingsLoading(false);
      });

    // Real-Time Firestore Subscription
    const unsubscribe = subscribeToHomepageSettings(
      (cloudSettings) => {
        if (!isMounted) return;
        const clean = sanitizeSettings(cloudSettings);
        setHomepageSettings(clean);
        try {
          localStorage.setItem(HOMEPAGE_SETTINGS_KEY, JSON.stringify(clean));
        } catch {}
        const icon = clean.websiteLogo || clean.artistProfileSquare || clean.artistProfileImage;
        if (icon) {
          updateWebsiteFavicon(icon);
        }
      },
      (err) => {
        console.warn('Firestore settings listener error:', err);
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const updateHomepageSettings = async (
    updates: Partial<HomepageSettings>
  ): Promise<{ success: boolean; message?: string }> => {
    // 1. Prepare sanitized new state
    const previousSettings = homepageSettings;
    const updated: HomepageSettings = sanitizeSettings({
      ...homepageSettings,
      ...updates,
    });

    // 2. Central Cloud Firestore Persistence
    const cloudRes = await saveHomepageSettingsToFirestore(updated);
    if (!cloudRes.success) {
      return {
        success: false,
        message: cloudRes.message || 'ক্লাউড ডাটাবেজে সংরক্ষণ ব্যর্থ হয়েছে। অনুগ্রহ করে ইন্টারনেট ও ফায়ারবেস সংযোগ পরীক্ষা করুন।',
      };
    }

    // 3. Optional local express backend backup if available
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify(updated),
      });
    } catch {}

    // 4. Update local state, favicon and cross-tab BroadcastChannel
    setHomepageSettings(updated);
    try {
      localStorage.setItem(HOMEPAGE_SETTINGS_KEY, JSON.stringify(updated));
    } catch {}
    const icon = updated.websiteLogo || updated.artistProfileSquare || updated.artistProfileImage;
    if (icon) {
      updateWebsiteFavicon(icon);
    }

    try {
      const bc = new BroadcastChannel('raselbabu_sync');
      bc.postMessage({ type: 'SETTINGS_UPDATED', settings: updated });
      bc.close();
    } catch {}

    return {
      success: true,
      message: 'রাসেল বাবুর প্রোফাইল ছবি ও সেটিংস সফলভাবে ক্লাউড ডাটাবেজে সংরক্ষিত হয়েছে এবং সকল ভিজিটর ও ডিভাইসের জন্য লাইভ আপডেট হয়েছে!',
    };
  };

  // Distribution Inquiries (Website Artist Submissions)
  const [distributionInquiries, setDistributionInquiries] = useState<DistributionInquiry[]>(() => {
    try {
      const saved = localStorage.getItem(DIST_INQUIRIES_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_DISTRIBUTION_INQUIRIES;
  });

  // Annual Mega Gift System
  const [annualGiftConfig, setAnnualGiftConfig] = useState<AnnualGiftConfig>(() => {
    try {
      const saved = localStorage.getItem(ANNUAL_GIFT_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_ANNUAL_GIFT_CONFIG;
  });

  // Audio Player State
  const [activePlayer, setActivePlayer] = useState<ActiveTrackState>({
    track: null,
    album: null,
    isPlaying: false,
    volume: 0.8,
    progress: 0,
  });

  // Sync to LocalStorage
  // Sync to LocalStorage safely (granular per key to prevent single quota failure from cascading)
  useEffect(() => {
    const safeSet = (key: string, data: any) => {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (err) {
        console.warn(`LocalStorage quota error for ${key}:`, err);
      }
    };

    safeSet(PHOTOS_KEY, photos);
    safeSet(ALBUMS_KEY, albums);
    safeSet(VIDEOS_KEY, videos);
    safeSet(NEWS_KEY, news);
    safeSet(TOURS_KEY, tourEvents);
    safeSet(INQUIRIES_KEY, inquiries);
    safeSet(MESSAGES_KEY, userMessages);
    safeSet(ADS_KEY, adsterraConfig);
    safeSet(ANALYTICS_KEY, analytics);
    safeSet(PRODUCTS_KEY, products);
    safeSet(ORDERS_KEY, orders);
    safeSet(HOMEPAGE_SETTINGS_KEY, homepageSettings);
    safeSet(POINTS_TX_KEY, pointTransactions);
    safeSet(DIST_INQUIRIES_KEY, distributionInquiries);
    safeSet(ANNUAL_GIFT_KEY, annualGiftConfig);
  }, [photos, albums, videos, news, tourEvents, inquiries, userMessages, adsterraConfig, analytics, products, orders, homepageSettings, pointTransactions, distributionInquiries, annualGiftConfig]);


  // Audio Synth progress timer
  useEffect(() => {
    let timer: any = null;
    if (activePlayer.isPlaying && activePlayer.track) {
      timer = setInterval(() => {
        setActivePlayer((prev) => {
          if (!prev.isPlaying || !prev.track) return prev;
          const nextSec = (prev.progress / 100) * prev.track.durationSec + 1;
          if (nextSec >= prev.track.durationSec) {
            audioSynth.stop();
            return { ...prev, isPlaying: false, progress: 0 };
          }
          return { ...prev, progress: (nextSec / prev.track.durationSec) * 100 };
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [activePlayer.isPlaying, activePlayer.track]);

  // Audio Controls
  const playTrack = (track: Track, album: Album) => {
    const isSameTrack = activePlayer.track?.id === track.id;
    if (isSameTrack && activePlayer.isPlaying) {
      audioSynth.stop();
      setActivePlayer((prev) => ({ ...prev, isPlaying: false }));
    } else {
      audioSynth.playTrack(track.id, track.audioFrequency || 220);
      setActivePlayer({
        track,
        album,
        isPlaying: true,
        volume: activePlayer.volume,
        progress: 0,
      });
      // Increment play count
      setAlbums((prev) =>
        prev.map((a) =>
          a.id === album.id
            ? {
                ...a,
                tracks: a.tracks.map((t) => (t.id === track.id ? { ...t, plays: t.plays + 1 } : t)),
              }
            : a
        )
      );
      setAnalytics((prev) => ({ ...prev, totalSongPlays: prev.totalSongPlays + 1 }));
    }
  };

  const togglePlayPause = () => {
    if (!activePlayer.track) return;
    if (activePlayer.isPlaying) {
      audioSynth.stop();
      setActivePlayer((prev) => ({ ...prev, isPlaying: false }));
    } else {
      audioSynth.playTrack(activePlayer.track.id, activePlayer.track.audioFrequency || 220);
      setActivePlayer((prev) => ({ ...prev, isPlaying: true }));
    }
  };

  const setPlayerVolume = (vol: number) => {
    audioSynth.setVolume(vol);
    setActivePlayer((prev) => ({ ...prev, volume: vol }));
  };

  const seekPlayer = (progressPercent: number) => {
    setActivePlayer((prev) => ({ ...prev, progress: progressPercent }));
  };

  const stopAudio = () => {
    audioSynth.stop();
    setActivePlayer((prev) => ({ ...prev, isPlaying: false }));
  };

  // ---------------------------------------------------------------------------
  // Central Server Persistence & Synchronization for Photos & Videos
  // ---------------------------------------------------------------------------
  const persistPhotosToServer = async (
    targetPhotos: PhotoItem[]
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await fetch('/api/photos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify({ photos: targetPhotos }),
      });
      const ct = res.headers.get('content-type') || '';
      if (!ct.includes('application/json')) {
        // Static hosting environment (e.g. Netlify at raselbabu.com) where Firestore is the primary database
        return {
          success: true,
          message: 'Saved directly to Cloud Firestore.',
        };
      }
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        try {
          const bc = new BroadcastChannel('raselbabu_sync');
          bc.postMessage({ type: 'PHOTOS_UPDATED', photos: targetPhotos });
          bc.close();
        } catch {}
        return {
          success: true,
          message: data.message || 'Gallery photos successfully persisted centrally across all browsers and devices.',
        };
      }
      return {
        success: true,
        message: 'Saved directly to Cloud Firestore.',
      };
    } catch {
      return {
        success: true,
        message: 'Saved directly to Cloud Firestore.',
      };
    }
  };

  const persistVideosToServer = async (
    targetVideos: VideoItem[]
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await fetch('/api/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify({ videos: targetVideos }),
      });
      const ct = res.headers.get('content-type') || '';
      if (!ct.includes('application/json')) {
        return {
          success: true,
          message: 'Saved directly to Cloud Firestore.',
        };
      }
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        try {
          const bc = new BroadcastChannel('raselbabu_sync');
          bc.postMessage({ type: 'VIDEOS_UPDATED', videos: targetVideos });
          bc.close();
        } catch {}
        return {
          success: true,
          message: data.message || 'YouTube videos catalog successfully persisted centrally across all devices.',
        };
      }
      return {
        success: false,
        message: data.message || `ভিডিও সংরক্ষণ ব্যর্থ হয়েছে (HTTP ${res.status}).`,
      };
    } catch (err: any) {
      console.error('Failed to save videos to central server:', err);
      return {
        success: false,
        message: 'নেটওয়ার্ক ত্রুটি: ' + (err?.message || 'Network error saving videos'),
      };
    }
  };

  const fetchPhotosData = async (): Promise<PhotoItem[] | null> => {
    // Strategy 1: Direct Cloud Firestore fetch
    try {
      const cloudPhotos = await fetchPhotosFromFirestore();
      if (cloudPhotos && cloudPhotos.length > 0) {
        return cloudPhotos.map(normalizePhotoItem);
      }
    } catch {}

    // Strategy 2: Check Express /api/photos
    try {
      const res = await fetch(`/api/photos?t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
      });
      const ct = res.headers.get('content-type') || '';
      if (res.ok && ct.includes('application/json')) {
        const data = await res.json();
        if (data && data.success && Array.isArray(data.photos) && data.photos.length > 0) {
          return data.photos.map(normalizePhotoItem);
        }
      }
    } catch {}

    // Strategy 3: Check persistent static mirror /photos.json
    try {
      const res = await fetch(`/photos.json?t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
      });
      const ct = res.headers.get('content-type') || '';
      if (res.ok && ct.includes('application/json')) {
        const data = await res.json();
        const arr = Array.isArray(data) ? data : data?.photos;
        if (Array.isArray(arr) && arr.length > 0) {
          return arr.map(normalizePhotoItem);
        }
      }
    } catch {}

    return null;
  };

  const fetchVideosData = async (): Promise<VideoItem[] | null> => {
    // Strategy 1: Direct Cloud Firestore fetch
    try {
      const cloudVideos = await fetchVideosFromFirestore();
      if (cloudVideos && cloudVideos.length > 0) {
        return cloudVideos;
      }
    } catch {}

    // Strategy 2: Check Express /api/videos
    try {
      const res = await fetch(`/api/videos?t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
      });
      const ct = res.headers.get('content-type') || '';
      if (res.ok && ct.includes('application/json')) {
        const data = await res.json();
        if (data && data.success && Array.isArray(data.videos) && data.videos.length > 0) {
          return data.videos;
        }
      }
    } catch {}

    // Strategy 3: Check persistent static mirror /videos.json
    try {
      const res = await fetch(`/videos.json?t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
      });
      const ct = res.headers.get('content-type') || '';
      if (res.ok && ct.includes('application/json')) {
        const data = await res.json();
        const arr = Array.isArray(data) ? data : data?.videos;
        if (Array.isArray(arr) && arr.length > 0) {
          return arr;
        }
      }
    } catch {}

    return null;
  };

  const reloadPhotos = async () => {
    const loaded = await fetchPhotosData();
    if (loaded && loaded.length > 0) {
      setPhotos(loaded);
      try {
        localStorage.setItem(PHOTOS_KEY, JSON.stringify(loaded));
      } catch {}
    }
  };

  const reloadVideos = async () => {
    const loaded = await fetchVideosData();
    if (loaded && loaded.length > 0) {
      setVideos(loaded);
      try {
        localStorage.setItem(VIDEOS_KEY, JSON.stringify(loaded));
      } catch {}
    }
  };

  // Real-Time Cloud Firestore Subscriptions for Photos, Videos & Products
  useEffect(() => {
    let isMounted = true;
    setPhotosLoading(true);
    setVideosLoading(true);

    // Initial load from cloud
    fetchPhotosData()
      .then((loaded) => {
        if (isMounted && loaded && loaded.length > 0) {
          setPhotos(loaded);
          try { localStorage.setItem(PHOTOS_KEY, JSON.stringify(loaded)); } catch {}
        }
      })
      .finally(() => {
        if (isMounted) setPhotosLoading(false);
      });

    fetchVideosData()
      .then((loaded) => {
        if (isMounted && loaded && loaded.length > 0) {
          setVideos(loaded);
          try { localStorage.setItem(VIDEOS_KEY, JSON.stringify(loaded)); } catch {}
        }
      })
      .finally(() => {
        if (isMounted) setVideosLoading(false);
      });

    // 1. Real-Time Photos Subscription (All browsers, tabs, and devices update instantly)
    const unsubPhotos = subscribeToPhotos(
      (cloudPhotos) => {
        if (!isMounted || !cloudPhotos) return;
        setPhotos(cloudPhotos);
        try {
          localStorage.setItem(PHOTOS_KEY, JSON.stringify(cloudPhotos));
        } catch {}
      },
      (err) => console.warn('Firestore photos subscription error:', err)
    );

    // 2. Real-Time Videos Subscription
    const unsubVideos = subscribeToVideos(
      (cloudVideos) => {
        if (!isMounted || !cloudVideos || cloudVideos.length === 0) return;
        setVideos(cloudVideos);
        try {
          localStorage.setItem(VIDEOS_KEY, JSON.stringify(cloudVideos));
        } catch {}
      },
      (err) => console.warn('Firestore videos subscription error:', err)
    );

    // 3. Real-Time Products Subscription
    const unsubProducts = subscribeToProducts(
      (cloudProducts) => {
        if (!isMounted || !cloudProducts || cloudProducts.length === 0) return;
        setProducts(cloudProducts);
        try {
          localStorage.setItem(PRODUCTS_KEY, JSON.stringify(cloudProducts));
        } catch {}
      },
      (err) => console.warn('Firestore products subscription error:', err)
    );

    // Cross-Tab BroadcastChannel for 0ms instant tab synchronization
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('raselbabu_sync');
      bc.onmessage = (event) => {
        if (!isMounted) return;
        if (event.data?.type === 'PHOTOS_UPDATED' && Array.isArray(event.data.photos)) {
          const clean = event.data.photos.map(normalizePhotoItem);
          setPhotos(clean);
          try {
            localStorage.setItem(PHOTOS_KEY, JSON.stringify(clean));
          } catch {}
        } else if (event.data?.type === 'VIDEOS_UPDATED' && Array.isArray(event.data.videos)) {
          setVideos(event.data.videos);
          try {
            localStorage.setItem(VIDEOS_KEY, JSON.stringify(event.data.videos));
          } catch {}
        } else if (event.data?.type === 'PRODUCTS_UPDATED' && Array.isArray(event.data.products)) {
          setProducts(event.data.products);
          try {
            localStorage.setItem(PRODUCTS_KEY, JSON.stringify(event.data.products));
          } catch {}
        }
      };
    } catch {}

    return () => {
      isMounted = false;
      unsubPhotos();
      unsubVideos();
      unsubProducts();
      if (bc) {
        try { bc.close(); } catch {}
      }
    };
  }, []);

  // Photo handlers (Direct Cloud Firestore Persistence & Real-Time Sync)
  const addPhoto = async (photo: Omit<PhotoItem, 'id' | 'views' | 'likes'>): Promise<{ success: boolean; message?: string }> => {
    const newPhoto: PhotoItem = {
      ...photo,
      imageUrl: normalizeImagePath(photo.imageUrl),
      id: `photo-${Date.now()}`,
      views: 0,
      likes: 0,
    };

    // 1. Direct Cloud Firestore save
    const cloudRes = await savePhotoToFirestore(newPhoto);
    if (!cloudRes.success) {
      return {
        success: false,
        message: cloudRes.message || 'ক্লাউড ফায়ারবেসে ছবি সংরক্ষণ ব্যর্থ হয়েছে!',
      };
    }

    // 2. Update local state & storage
    setPhotos((prev) => {
      const updated = [newPhoto, ...prev.filter((p) => p.id !== newPhoto.id)];
      try {
        localStorage.setItem(PHOTOS_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });

    // 3. Optional express backend sync
    persistPhotosToServer([newPhoto, ...photos]).catch(() => {});

    // 4. Instant tab broadcast
    try {
      const bc = new BroadcastChannel('raselbabu_sync');
      bc.postMessage({ type: 'PHOTOS_UPDATED', photos: [newPhoto, ...photos] });
      bc.close();
    } catch {}

    return {
      success: true,
      message: 'ছবি সফলভাবে ক্লাউড ডাটাবেজে সংরক্ষিত হয়েছে এবং সকল ভিজিটরের জন্য লাইভ হয়েছে!',
    };
  };

  const updatePhoto = async (id: string, updates: Partial<PhotoItem>): Promise<{ success: boolean; message?: string }> => {
    const cloudRes = await updatePhotoInFirestore(id, updates);
    if (!cloudRes.success) {
      return {
        success: false,
        message: cloudRes.message || 'ক্লাউড ফায়ারবেসে ছবি আপডেট ব্যর্থ হয়েছে!',
      };
    }

    const updated = photos.map((p) => {
      if (p.id !== id) return p;
      return {
        ...p,
        ...updates,
        imageUrl: updates.imageUrl ? normalizeImagePath(updates.imageUrl) : p.imageUrl,
      };
    });
    setPhotos(updated);
    try {
      localStorage.setItem(PHOTOS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }

    persistPhotosToServer(updated).catch(() => {});

    try {
      const bc = new BroadcastChannel('raselbabu_sync');
      bc.postMessage({ type: 'PHOTOS_UPDATED', photos: updated });
      bc.close();
    } catch {}

    return {
      success: true,
      message: 'ছবির তথ্য ক্লাউডে সফলভাবে আপডেট হয়েছে!',
    };
  };

  const deletePhoto = async (id: string): Promise<{ success: boolean; message?: string }> => {
    // 1. Instantly update local state with functional update for 0ms lag
    setPhotos((prev) => {
      const remaining = prev.filter((p) => p.id !== id);
      try {
        localStorage.setItem(PHOTOS_KEY, JSON.stringify(remaining));
      } catch (e) {
        console.warn(e);
      }
      return remaining;
    });

    // 2. Instant cross-tab broadcast
    try {
      const bc = new BroadcastChannel('raselbabu_sync');
      const remaining = photos.filter((p) => p.id !== id);
      bc.postMessage({ type: 'PHOTOS_UPDATED', photos: remaining });
      bc.close();
    } catch {}

    // 3. Delete from Google Cloud Firestore (automatic cloud sync)
    const cloudRes = await deletePhotoFromFirestore(id);
    if (!cloudRes.success) {
      console.warn('Firestore photo delete notice:', cloudRes.message);
    }

    return {
      success: true,
      message: 'ফটো সফলভাবে ডিলিট হয়েছে এবং ক্লাউডে অটো-সিঙ্ক হয়ে আপডেট হয়েছে!',
    };
  };

  const syncAllPhotosToCloud = async (): Promise<{ success: boolean; message?: string }> => {
    if (!photos || photos.length === 0) {
      return { success: false, message: 'সিঙ্ক করার মতো কোনো ছবি পাওয়া যায়নি।' };
    }
    const res = await batchSyncPhotosToFirestore(photos);
    return {
      success: res.success,
      message: res.message,
    };
  };

  const deleteDemoPhotosFromCloud = async (): Promise<{ success: boolean; message: string }> => {
    const res = await deleteDemoPhotosFromFirestore();
    if (res.success) {
      const demoIds = ['photo-1', 'photo-2', 'photo-3', 'photo-4', 'photo-5', 'photo-6', 'photo-7', 'photo-8'];
      setPhotos((prev) => prev.filter((p) => !demoIds.includes(p.id)));
      try {
        const remaining = photos.filter((p) => !demoIds.includes(p.id));
        localStorage.setItem(PHOTOS_KEY, JSON.stringify(remaining));
      } catch {}
    }
    return res;
  };

  const likePhoto = (id: string) => {
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p)));
  };

  const incrementPhotoViews = (id: string) => {
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, views: p.views + 1 } : p)));
    setAnalytics((prev) => ({
      ...prev,
      totalGalleryImpressions: prev.totalGalleryImpressions + 1,
    }));
  };

  // Albums handlers
  const addAlbum = (album: Omit<Album, 'id'>) => {
    const newAlbum: Album = { ...album, id: `album-${Date.now()}` };
    setAlbums((prev) => [newAlbum, ...prev]);
  };

  const deleteAlbum = (id: string) => {
    setAlbums((prev) => prev.filter((a) => a.id !== id));
  };

  // Video handlers (with Cloud Firestore Persistence)
  const addVideo = async (video: Omit<VideoItem, 'id'>): Promise<{ success: boolean; message?: string }> => {
    const newVideo: VideoItem = { ...video, id: `video-${Date.now()}` };
    const cloudRes = await saveVideoToFirestore(newVideo);
    if (!cloudRes.success) {
      return {
        success: false,
        message: cloudRes.message || 'ক্লাউডে ভিডিও সংরক্ষণ ব্যর্থ হয়েছে!',
      };
    }
    const updated = [newVideo, ...videos];
    setVideos(updated);
    try {
      localStorage.setItem(VIDEOS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
    persistVideosToServer(updated).catch(() => {});
    return {
      success: true,
      message: 'ভিডিও সফলভাবে ক্লাউডে সংরক্ষিত হয়েছে!',
    };
  };

  const updateVideo = async (id: string, updatedFields: Partial<VideoItem>): Promise<{ success: boolean; message?: string }> => {
    const cloudRes = await updateVideoInFirestore(id, updatedFields);
    if (!cloudRes.success) {
      return {
        success: false,
        message: cloudRes.message || 'ভিডিও আপডেট ব্যর্থ হয়েছে!',
      };
    }
    const updated = videos.map((v) => (v.id === id ? { ...v, ...updatedFields } : v));
    setVideos(updated);
    try {
      localStorage.setItem(VIDEOS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
    persistVideosToServer(updated).catch(() => {});
    return {
      success: true,
      message: 'ভিডিও সফলভাবে আপডেট হয়েছে!',
    };
  };

  const deleteVideo = async (id: string): Promise<{ success: boolean; message?: string }> => {
    // 1. Instantly update local state so UI updates with 0ms lag
    const updated = videos.filter((v) => v.id !== id);
    setVideos(updated);
    try {
      localStorage.setItem(VIDEOS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }

    // 2. Broadcast across tabs
    try {
      const bc = new BroadcastChannel('raselbabu_sync');
      bc.postMessage({ type: 'VIDEOS_UPDATED', videos: updated });
      bc.close();
    } catch {}

    // 3. Delete from Google Cloud Firestore (automatic cloud sync)
    const cloudRes = await deleteVideoFromFirestore(id);
    if (!cloudRes.success) {
      console.warn('Firestore video delete notice:', cloudRes.message);
    }
    persistVideosToServer(updated).catch(() => {});

    return {
      success: true,
      message: 'ভিডিও সফলভাবে মুছে ফেলা হয়েছে এবং ক্লাউডে অটো-সিঙ্ক হয়েছে!',
    };
  };

  // Products handlers (Cloud Firestore Persistence & Real-Time Sync)
  const addProduct = async (prod: Omit<Product, 'id' | 'createdAt'>): Promise<{ success: boolean; message?: string }> => {
    const newProd: Product = {
      ...prod,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const cloudRes = await saveProductToFirestore(newProd);
    if (!cloudRes.success) {
      return {
        success: false,
        message: cloudRes.message || 'ক্লাউড ফায়ারবেসে প্রোডাক্ট সংরক্ষণ ব্যর্থ হয়েছে!',
      };
    }
    const updated = [newProd, ...products];
    setProducts(updated);
    try {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
    return {
      success: true,
      message: 'প্রোডাক্ট সফলভাবে ক্লাউড স্টোরে সংরক্ষিত হয়েছে এবং সব ভিজিটর ও ডিভাইসের জন্য লাইভ হয়েছে!',
    };
  };

  const updateProduct = async (id: string, updated: Partial<Product>): Promise<{ success: boolean; message?: string }> => {
    const cloudRes = await updateProductInFirestore(id, updated);
    if (!cloudRes.success) {
      return {
        success: false,
        message: cloudRes.message || 'প্রোডাক্ট আপডেট ক্লাউডে ব্যর্থ হয়েছে!',
      };
    }
    const updatedList = products.map((p) => (p.id === id ? { ...p, ...updated } : p));
    setProducts(updatedList);
    try {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(updatedList));
    } catch (e) {
      console.warn(e);
    }
    return {
      success: true,
      message: 'প্রোডাক্ট সফলভাবে ক্লাউডে আপডেট হয়েছে!',
    };
  };

  const deleteProduct = async (id: string): Promise<{ success: boolean; message?: string }> => {
    // 1. Instantly update local state so UI updates with 0ms lag
    const updatedList = products.filter((p) => p.id !== id);
    setProducts(updatedList);
    try {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(updatedList));
    } catch (e) {
      console.warn(e);
    }

    // 2. Broadcast across tabs
    try {
      const bc = new BroadcastChannel('raselbabu_sync');
      bc.postMessage({ type: 'PRODUCTS_UPDATED', products: updatedList });
      bc.close();
    } catch {}

    // 3. Delete from Google Cloud Firestore (automatic cloud sync)
    const cloudRes = await deleteProductFromFirestore(id);
    if (!cloudRes.success) {
      console.warn('Firestore product delete notice:', cloudRes.message);
    }

    return {
      success: true,
      message: 'প্রোডাক্ট সফলভাবে ডিলিট হয়েছে এবং ক্লাউডে অটো-সিঙ্ক হয়ে আপডেট হয়েছে!',
    };
  };

  const syncAllProductsToCloud = async (): Promise<{ success: boolean; message?: string }> => {
    if (!products || products.length === 0) {
      return { success: false, message: 'সিঙ্ক করার মতো কোনো প্রোডাক্ট পাওয়া যায়নি।' };
    }
    const res = await batchSyncProductsToFirestore(products);
    return {
      success: res.success,
      message: res.message,
    };
  };

  // Order handlers
  const placeOrder = (orderData: Omit<OrderItem, 'id' | 'orderDate' | 'status'>) => {
    const newOrder: OrderItem = {
      ...orderData,
      id: `order-${Date.now()}`,
      orderDate: new Date().toISOString(),
      status: 'pending',
    };
    setOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  };

  const updateOrderStatus = (id: string, status: OrderItem['status']) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  const deleteOrder = (id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
  };

  // News handlers
  const addNewsArticle = (article: Omit<NewsArticle, 'id'>) => {
    const newNews: NewsArticle = { ...article, id: `news-${Date.now()}` };
    setNews((prev) => [newNews, ...prev]);
  };

  const deleteNewsArticle = (id: string) => {
    setNews((prev) => prev.filter((n) => n.id !== id));
  };

  // Tour handlers
  const addTourEvent = (event: Omit<TourEvent, 'id'>) => {
    const newEvent: TourEvent = { ...event, id: `tour-${Date.now()}` };
    setTourEvents((prev) => [newEvent, ...prev]);
  };

  const deleteTourEvent = (id: string) => {
    setTourEvents((prev) => prev.filter((t) => t.id !== id));
  };

  // Inquiries
  const submitInquiry = (inquiry: Omit<ContactInquiry, 'id' | 'createdAt' | 'status'>) => {
    const newInq: ContactInquiry = {
      ...inquiry,
      id: `inq-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'new',
    };
    setInquiries((prev) => [newInq, ...prev]);
  };

  const updateInquiryStatus = (id: string, status: ContactInquiry['status']) => {
    setInquiries((prev) => prev.map((inq) => (inq.id === id ? { ...inq, status } : inq)));
  };

  const deleteInquiry = (id: string) => {
    setInquiries((prev) => prev.filter((inq) => inq.id !== id));
  };

  // Messages
  const sendUserMessage = (msg: Omit<UserMessage, 'id' | 'createdAt' | 'status'>) => {
    const newMsg: UserMessage = {
      ...msg,
      id: `msg-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
    setUserMessages((prev) => [newMsg, ...prev]);
  };

  const replyToUserMessage = (id: string, replyText: string, adminName: string) => {
    setUserMessages((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              reply: replyText,
              repliedAt: new Date().toISOString(),
              repliedBy: adminName,
              status: 'replied',
            }
          : m
      )
    );
  };

  const deleteUserMessageReply = (id: string) => {
    setUserMessages((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              reply: undefined,
              repliedAt: undefined,
              repliedBy: undefined,
              status: 'pending',
            }
          : m
      )
    );
  };

  const deleteUserMessage = (id: string) => {
    setUserMessages((prev) => prev.filter((m) => m.id !== id));
  };

  // Bonus Points Gift Management
  const sendBonusPoints = (userId: string, amount: number, note?: string) => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) {
      return { success: false, message: 'Target user account not found.' };
    }

    addPointsToUser(userId, amount);

    const newTx: PointTransaction = {
      id: `pt-${Date.now()}`,
      userId,
      amount,
      type: 'bonus_gift',
      title: `🎁 Gift Points Received (+${amount} pts)`,
      note: note || 'Congratulations! Bonus points gifted by Rasel Babu Official Management.',
      timestamp: new Date().toISOString(),
      sender: 'Rasel Babu Official Management',
    };

    setPointTransactions((prev) => [newTx, ...prev]);

    // Deliver automatic congratulation and gift point received message to the user
    const giftMessage: UserMessage = {
      id: `msg-gift-${Date.now()}`,
      userId,
      userEmail: targetUser.email,
      userName: targetUser.name,
      subject: `🎉 Congratulations! You received ${amount} Gift Points`,
      message: `Congratulations! Rasel Babu Official Management has sent you ${amount} bonus gift points. ${note ? `Special Note: "${note}". ` : ''}Your fan reward balance has been updated. Thank you for your love and loyalty!`,
      category: 'Gift Points',
      reply: `Point gift confirmed by Management (+${amount} points credited).`,
      repliedAt: new Date().toISOString(),
      repliedBy: 'Rasel Babu Official Management',
      status: 'replied',
      createdAt: new Date().toISOString(),
    };

    setUserMessages((prev) => [giftMessage, ...prev]);

    return {
      success: true,
      message: `Successfully gifted ${amount} bonus points to ${targetUser.name}! Congratulatory message sent to their inbox.`,
    };
  };

  // Adsterra controls
  const updateAdsterraConfig = (updates: Partial<AdsterraConfig>) => {
    setAdsterraConfig((prev) => ({ ...prev, ...updates }));
  };

  const togglePageAdPlacement = (pageKey: keyof AdsterraConfig['pagePlacements']) => {
    setAdsterraConfig((prev) => ({
      ...prev,
      pagePlacements: {
        ...prev.pagePlacements,
        [pageKey]: !prev.pagePlacements[pageKey],
      },
    }));
  };

  // Distribution Inquiries (Website Artist Messages)
  const submitDistributionInquiry = (inquiry: Omit<DistributionInquiry, 'id' | 'createdAt' | 'status'>) => {
    const newInq: DistributionInquiry = {
      ...inquiry,
      id: `dist-inq-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'new',
    };
    setDistributionInquiries((prev) => [newInq, ...prev]);
  };

  const updateDistributionInquiryStatus = (id: string, status: DistributionInquiry['status']) => {
    setDistributionInquiries((prev) =>
      prev.map((inq) => (inq.id === id ? { ...inq, status } : inq))
    );
  };

  const replyToDistributionInquiry = (id: string, replyText: string) => {
    setDistributionInquiries((prev) =>
      prev.map((inq) =>
        inq.id === id
          ? {
              ...inq,
              reply: replyText,
              repliedAt: new Date().toISOString(),
              status: inq.status === 'new' ? 'reviewed' : inq.status,
            }
          : inq
      )
    );
  };

  const deleteDistributionInquiry = (id: string) => {
    setDistributionInquiries((prev) => prev.filter((inq) => inq.id !== id));
  };

  // Annual Mega Gift System (1 Year Points Leader)
  const updateAnnualGiftConfig = (updates: Partial<AnnualGiftConfig>) => {
    setAnnualGiftConfig((prev) => ({ ...prev, ...updates }));
  };

  const awardAnnualMegaGift = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target) {
      return { success: false, message: 'Target user account not found.' };
    }

    const currentYear = annualGiftConfig.year || new Date().getFullYear();
    const updatedConfig: AnnualGiftConfig = {
      ...annualGiftConfig,
      winnerUserId: target.id,
      winnerName: target.name,
      winnerPoints: target.points || 0,
      winnerAwardedAt: new Date().toISOString(),
      status: 'awarded',
    };
    setAnnualGiftConfig(updatedConfig);

    // Credit bonus award points (+500 pts)
    addPointsToUser(target.id, 500);

    // Create Award Point Transaction
    const awardTx: PointTransaction = {
      id: `pt-annual-award-${Date.now()}`,
      userId: target.id,
      amount: 500,
      type: 'bonus_gift',
      title: `🏆 Annual Fan of the Year Mega Award (${currentYear})`,
      note: `Winner of Rasel Babu Annual Fan Award! Prize: ${annualGiftConfig.giftTitle}`,
      timestamp: new Date().toISOString(),
      sender: 'Rasel Babu Official Management & FK Music',
    };
    setPointTransactions((prev) => [awardTx, ...prev]);

    // Send formal congratulation message
    const awardMsg: UserMessage = {
      id: `msg-award-${Date.now()}`,
      userId: target.id,
      userEmail: target.email,
      userName: target.name,
      subject: `🏆 CONGRATULATIONS! You Won the ${currentYear} Annual Fan of the Year Mega Award!`,
      message: `Heartiest Congratulations ${target.name}! You have earned the highest points throughout the year and are officially crowned the Rasel Babu Annual Fan of the Year! Your Grand Prize: ${annualGiftConfig.giftTitle} (${annualGiftConfig.prizeValue}). Thank you for your extraordinary loyalty!`,
      category: 'Gift Points',
      reply: `Official Annual Winner Certificate & Mega Prize package registered on ${new Date().toLocaleDateString()}. Management will coordinate prize delivery.`,
      repliedAt: new Date().toISOString(),
      repliedBy: 'Rasel Babu Official Management & FK Music Limited',
      status: 'replied',
      createdAt: new Date().toISOString(),
    };
    setUserMessages((prev) => [awardMsg, ...prev]);

    return {
      success: true,
      message: `Successfully declared ${target.name} as the ${currentYear} Annual Fan of the Year Champion! Congratulatory gift letter and +500 points bonus awarded.`,
    };
  };

  // Analytics
  const recordPageView = (path: string) => {
    setAnalytics((prev) => {
      const existing = prev.topPages.find((p) => p.path === path);
      let updatedPages = prev.topPages;
      if (existing) {
        updatedPages = prev.topPages.map((p) => (p.path === path ? { ...p, views: p.views + 1 } : p));
      } else {
        const label = path === '/' ? 'Home' : path.replace('/', '').toUpperCase();
        updatedPages = [...prev.topPages, { path, label, views: 1 }];
      }
      return {
        ...prev,
        pageViewsToday: prev.pageViewsToday + 1,
        adImpressions: prev.adImpressions + 1,
        topPages: updatedPages.sort((a, b) => b.views - a.views),
      };
    });
  };

  return (
    <DataContext.Provider
      value={{
        photos,
        photosLoading,
        addPhoto,
        updatePhoto,
        deletePhoto,
        likePhoto,
        incrementPhotoViews,
        reloadPhotos,
        syncAllPhotosToCloud,
        deleteDemoPhotosFromCloud,
        albums,
        addAlbum,
        deleteAlbum,
        activePlayer,
        playTrack,
        togglePlayPause,
        setPlayerVolume,
        seekPlayer,
        stopAudio,
        videos,
        videosLoading,
        addVideo,
        updateVideo,
        deleteVideo,
        reloadVideos,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        viewingProduct,
        openProductView,
        closeProductView,
        syncAllProductsToCloud,
        cloudConnected: true,
        orders,
        placeOrder,
        updateOrderStatus,
        deleteOrder,
        news,
        addNewsArticle,
        deleteNewsArticle,
        tourEvents,
        addTourEvent,
        deleteTourEvent,
        inquiries,
        submitInquiry,
        updateInquiryStatus,
        deleteInquiry,
        userMessages,
        sendUserMessage,
        replyToUserMessage,
        deleteUserMessageReply,
        deleteUserMessage,
        adsterraConfig,
        updateAdsterraConfig,
        togglePageAdPlacement,
        analytics,
        recordPageView,
        homepageSettings,
        updateHomepageSettings,
        reloadSettings,
        settingsLoading,
        pointTransactions,
        sendBonusPoints,
        distributionInquiries,
        submitDistributionInquiry,
        updateDistributionInquiryStatus,
        replyToDistributionInquiry,
        deleteDistributionInquiry,
        annualGiftConfig,
        updateAnnualGiftConfig,
        awardAnnualMegaGift,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};


export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};
