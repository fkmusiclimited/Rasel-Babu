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

interface ActiveTrackState {
  track: Track | null;
  album: Album | null;
  isPlaying: boolean;
  volume: number;
  progress: number;
}

interface DataContextType {
  // Photos
  photos: PhotoItem[];
  addPhoto: (photo: Omit<PhotoItem, 'id' | 'views' | 'likes'>) => void;
  updatePhoto: (id: string, updates: Partial<PhotoItem>) => void;
  deletePhoto: (id: string) => void;
  likePhoto: (id: string) => void;
  incrementPhotoViews: (id: string) => void;

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

  // Videos
  videos: VideoItem[];
  addVideo: (video: Omit<VideoItem, 'id'>) => void;
  updateVideo: (id: string, updated: Partial<VideoItem>) => void;
  deleteVideo: (id: string) => void;

  // Products / Store
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, updated: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  viewingProduct: Product | null;
  openProductView: (productOrId: Product | string) => void;
  closeProductView: () => void;

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

  // Homepage Dynamic Content (Editable by Admin)
  homepageSettings: HomepageSettings;
  updateHomepageSettings: (updates: Partial<HomepageSettings>) => void;

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

  // Photos
  const [photos, setPhotos] = useState<PhotoItem[]>(() => {
    try {
      const saved = localStorage.getItem(PHOTOS_KEY);
      if (saved) {
        const parsed: PhotoItem[] = JSON.parse(saved);
        return parsed.map((p) => {
          if (p.imageUrl?.startsWith('/src/assets/images/')) {
            const match = INITIAL_PHOTOS.find((ip) => ip.id === p.id);
            if (match) return { ...p, imageUrl: match.imageUrl };
          }
          return p;
        });
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PHOTOS;
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

  // Videos
  const [videos, setVideos] = useState<VideoItem[]>(() => {
    try {
      const saved = localStorage.getItem(VIDEOS_KEY);
      if (saved) return JSON.parse(saved);
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

  // Adsterra Config
  const [adsterraConfig, setAdsterraConfig] = useState<AdsterraConfig>(() => {
    try {
      const saved = localStorage.getItem(ADS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_ADSTERRA_CONFIG,
          ...parsed,
          bannerKeys: {
            ...INITIAL_ADSTERRA_CONFIG.bannerKeys,
            ...(parsed.bannerKeys || {}),
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
    return INITIAL_ADSTERRA_CONFIG;
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

  // Homepage Dynamic Editable Settings
  const [homepageSettings, setHomepageSettings] = useState<HomepageSettings>(() => {
    try {
      const saved = localStorage.getItem(HOMEPAGE_SETTINGS_KEY);
      if (saved) {
        const parsed: HomepageSettings = JSON.parse(saved);
        if (parsed.heroImageUrl?.startsWith('/src/assets/images/')) {
          parsed.heroImageUrl = INITIAL_HOMEPAGE_SETTINGS.heroImageUrl;
        }
        if (parsed.aboutImageUrl?.startsWith('/src/assets/images/')) {
          parsed.aboutImageUrl = INITIAL_HOMEPAGE_SETTINGS.aboutImageUrl;
        }
        if (parsed.annualGiftImage?.startsWith('/src/assets/images/')) {
          parsed.annualGiftImage = INITIAL_HOMEPAGE_SETTINGS.annualGiftImage;
        }
        return { ...INITIAL_HOMEPAGE_SETTINGS, ...parsed };
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_HOMEPAGE_SETTINGS;
  });

  const updateHomepageSettings = (updates: Partial<HomepageSettings>) => {
    setHomepageSettings((prev) => ({ ...prev, ...updates }));
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

  // Photo handlers
  const addPhoto = (photo: Omit<PhotoItem, 'id' | 'views' | 'likes'>) => {
    const newPhoto: PhotoItem = {
      ...photo,
      id: `photo-${Date.now()}`,
      views: 0,
      likes: 0,
    };
    setPhotos((prev) => [newPhoto, ...prev]);
  };

  const updatePhoto = (id: string, updates: Partial<PhotoItem>) => {
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const deletePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
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

  // Video handlers
  const addVideo = (video: Omit<VideoItem, 'id'>) => {
    const newVideo: VideoItem = { ...video, id: `video-${Date.now()}` };
    setVideos((prev) => [newVideo, ...prev]);
  };

  const updateVideo = (id: string, updated: Partial<VideoItem>) => {
    setVideos((prev) => prev.map((v) => (v.id === id ? { ...v, ...updated } : v)));
  };

  const deleteVideo = (id: string) => {
    setVideos((prev) => prev.filter((v) => v.id !== id));
  };

  // Products handlers
  const addProduct = (prod: Omit<Product, 'id' | 'createdAt'>) => {
    const newProd: Product = {
      ...prod,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setProducts((prev) => [newProd, ...prev]);
  };

  const updateProduct = (id: string, updated: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updated } : p)));
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
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
        addPhoto,
        updatePhoto,
        deletePhoto,
        likePhoto,
        incrementPhotoViews,
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
        addVideo,
        updateVideo,
        deleteVideo,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        viewingProduct,
        openProductView,
        closeProductView,
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
