export type UserRole = 'admin' | 'manager' | 'moderator' | 'user';
export type RegistrationStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: RegistrationStatus;
  bio?: string;
  points?: number; // Fan reward & bonus points balance
  registeredAt: string;
  rejectionReason?: string;
  approvedAt?: string;
}

export interface PointTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'bonus_gift' | 'order_reward' | 'signup_bonus';
  title: string;
  note?: string;
  timestamp: string;
  sender: string;
}

export interface PhotoItem {
  id: string;
  title: string;
  category: 'concert' | 'studio' | 'portrait' | 'cultural';
  imageUrl: string;
  caption: string;
  date: string;
  location: string;
  photographer?: string;
  views: number;
  likes: number;
  tags: string[];
}

export interface Track {
  id: string;
  title: string;
  duration: string;
  durationSec: number;
  composer: string;
  lyricist: string;
  plays: number;
  audioFrequency?: number; // for synthetic real audio preview
  lyrics?: string;
}

export interface Album {
  id: string;
  title: string;
  releaseYear: number;
  coverUrl: string;
  genre: string;
  description: string;
  tracks: Track[];
  streamingLinks: {
    spotify?: string;
    appleMusic?: string;
    youtubeMusic?: string;
    amazonMusic?: string;
  };
}

export interface VideoItem {
  id: string;
  title: string;
  youtubeId: string;
  category: 'Music Video' | 'Live Performance' | 'Acoustic Session' | 'Behind The Scenes';
  thumbnailUrl: string;
  duration: string;
  description: string;
  releaseDate: string;
  views: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImage: string;
  publishDate: string;
  category: string;
  author: string;
  readTime: string;
}

export interface TourEvent {
  id: string;
  title: string;
  venue: string;
  city: string;
  country: string;
  date: string;
  time: string;
  ticketStatus: 'available' | 'sold_out' | 'vip_only';
  ticketUrl: string;
}

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  inquiryType: 'Concert Performance' | 'Corporate Event' | 'Playback Singing' | 'Media & Interview' | 'Other';
  eventDate?: string;
  location?: string;
  budget?: string;
  message: string;
  createdAt: string;
  status: 'new' | 'reviewed' | 'contacted' | 'archived';
}

export interface UserMessage {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  subject: string;
  message: string;
  category: 'Fan Mail' | 'Booking Query' | 'Song Request' | 'Technical Support' | 'Gift Points' | 'System Notification';
  reply?: string;
  repliedAt?: string;
  repliedBy?: string;
  status: 'pending' | 'replied';
  createdAt: string;
}

export interface AdsterraConfig {
  enabled: boolean;
  publisherId: string;
  socialBarEnabled: boolean;
  testMode: boolean; // false for live ads, true for preview
  bannerKeys: {
    leaderboard728x90: string;
    banner468x60: string;
    mediumRectangle300x250: string;
    mobileBanner320x50: string;
    skyscraper160x600: string;
    halfSkyscraper160x300: string;
    socialBarKey: string;
  };
  pagePlacements: {
    home: boolean;
    about: boolean;
    gallery: boolean;
    photoDetail: boolean;
    music: boolean;
    news: boolean;
    contact: boolean;
    dashboard: boolean;
    shop: boolean;
    videos: boolean;
  };
  customScriptHeader?: string;
}

export interface AnalyticsStats {
  pageViewsToday: number;
  uniqueVisitorsToday: number;
  totalGalleryImpressions: number;
  totalSongPlays: number;
  adImpressions: number;
  topPages: { path: string; label: string; views: number }[];
}

export interface Product {
  id: string;
  title: string;
  price: number;
  offerPrice?: number; // Discounted promotional price
  currency: string;
  category: 'merch' | 'vinyl' | 'tickets' | 'digital' | 'gear' | 'dress';
  imageUrl: string;
  additionalImages?: string[]; // Up to 3 additional product photos
  description: string;
  buyUrl?: string; // custom external link or direct checkout
  inStock: boolean;
  badge?: string;
  sizes?: string[]; // S, M, L, XL, XXL, Free Size
  createdAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productTitle: string;
  productPrice: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  quantity: number;
  size?: string; // selected dress / apparel size
  totalAmount: number;
  paymentMethod: 'Cash on Delivery' | 'bKash' | 'Nagad' | 'Card';
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: string;
  userId?: string;
  notes?: string;
}

export interface HomepageSettings {
  artistProfileImage?: string;
  artistProfileSquare?: string;
  heroTagline: string;
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  heroImageUrl: string;
  heroEventBadge: string;
  heroEventTitle: string;
  heroEventSubtitle: string;
  stat1Value: string;
  stat1Label: string;
  stat2Value: string;
  stat2Label: string;
  stat3Value: string;
  stat3Label: string;
  stat4Value: string;
  stat4Label: string;
  aboutHeadline?: string;
  aboutBio1?: string;
  aboutBio2?: string;
  aboutImageUrl?: string;
  aboutCity?: string;
  aboutVillage?: string;
  aboutEducation?: string;
  // Distribution Page Editable Content
  distHeadline?: string;
  distTagline?: string;
  distDescription?: string;
  distBannerUrl?: string;
  // Music Section Editable Content
  musicHeadline?: string;
  musicSubtitle?: string;
  featuredAlbumTitle?: string;
  featuredAlbumCover?: string;
  // Fan Club & Rewards Editable Content
  fanClubHeadline?: string;
  fanClubDescription?: string;
  annualGiftTitle?: string;
  annualGiftDescription?: string;
  annualGiftImage?: string;
  // Recent Success & Milestones section
  milestonesTitle?: string;
  milestonesDescription?: string;
  milestone1Title?: string;
  milestone1Badge?: string;
  milestone1Desc?: string;
  milestone2Title?: string;
  milestone2Badge?: string;
  milestone2Desc?: string;
  milestone3Title?: string;
  milestone3Badge?: string;
  milestone3Desc?: string;
  milestone4Title?: string;
  milestone4Badge?: string;
  milestone4Desc?: string;
  // Booking Page Representation & WhatsApp
  bookingWhatsapp?: string;
  bookingEmail?: string;
  bookingPhone?: string;
  bookingAddress?: string;
  bookingResponseTime?: string;
  bookingNotice?: string;
  // Contact & Social Links
  contactEmail?: string;
  contactPhone?: string;
  contactWhatsapp?: string;
  contactAddress?: string;
  socialFacebook?: string;
  socialYoutube?: string;
  socialSpotify?: string;
  socialInstagram?: string;
  // Footer
  footerCopyright?: string;
  footerTagline?: string;
}

export interface DistributionInquiry {
  id: string;
  artistName: string;
  email: string;
  phone: string;
  releaseTitle: string;
  genre: string;
  platforms: string[];
  demoLink?: string;
  message: string;
  status: 'new' | 'reviewed' | 'approved' | 'contacted';
  createdAt: string;
  reply?: string;
  repliedAt?: string;
  adminNotes?: string;
}

export interface AnnualGiftConfig {
  year: number;
  giftTitle: string;
  giftDescription: string;
  giftImageUrl?: string;
  prizeValue: string;
  winnerUserId?: string;
  winnerName?: string;
  winnerAwardedAt?: string;
  winnerPoints?: number;
  status: 'active' | 'awarded';
}

