import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import {
  Users,
  Shield,
  FileText,
  DollarSign,
  BarChart3,
  CheckCircle,
  XCircle,
  Search,
  Plus,
  Trash2,
  Send,
  Sliders,
  Settings,
  AlertTriangle,
  Music,
  Camera,
  Video,
  Eye,
  Calendar,
  ShoppingBag,
  Truck,
  Package,
  Edit,
  ExternalLink,
  Youtube,
  Link as LinkIcon,
  Check,
  X,
  Tag,
  Phone,
  MapPin,
  CreditCard,
  Globe,
  Upload,
  Image as ImageIcon,
  Sparkles,
  Film,
  LayoutDashboard,
  Disc,
  MessageCircle,
  Layers,
  ChevronRight,
  TrendingUp,
  Gift,
  Mail,
  MessageSquare,
  CheckCircle2,
  Clock,
  KeyRound,
  Copy,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { UserRole, PhotoItem, NewsArticle, VideoItem, TourEvent, Product, OrderItem, HomepageSettings, DistributionInquiry, User } from '../types';
import { extractYouTubeId } from './Videos';
import { YearlyPointsGraph } from '../components/points/YearlyPointsGraph';
import { compressImageFile, createSquareCrop, updateWebsiteFavicon } from '../utils/imageCompress';
import { DeleteConfirmModal } from '../components/common/DeleteConfirmModal';
import { HERO_STAGE_IMAGE, TRADITIONAL_PUNJABI_IMAGE, PORTRAIT_IMAGE, STUDIO_IMAGE } from '../data/seedData';

interface AdminPanelProps {
  onNavigate: (path: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onNavigate }) => {
  const { currentUser, users, approveUser, rejectUser, updateUserRole, isSuperAdmin, isAdminOrManager, login, initiatePasswordReset, changePassword } = useAuth();
  const {
    photos,
    photosLoading,
    addPhoto,
    updatePhoto,
    deletePhoto,
    reloadPhotos,
    albums,
    deleteAlbum,
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
    openProductView,
    orders,
    updateOrderStatus,
    deleteOrder,
    news,
    addNewsArticle,
    deleteNewsArticle,
    tourEvents,
    addTourEvent,
    deleteTourEvent,
    inquiries,
    updateInquiryStatus,
    deleteInquiry,
    userMessages,
    replyToUserMessage,
    deleteUserMessageReply,
    deleteUserMessage,
    adsterraConfig,
    updateAdsterraConfig,
    togglePageAdPlacement,
    analytics,
    homepageSettings,
    updateHomepageSettings,
    reloadSettings,
    settingsLoading,
    pointTransactions,
    sendBonusPoints,
    distributionInquiries,
    updateDistributionInquiryStatus,
    replyToDistributionInquiry,
    deleteDistributionInquiry,
    submitDistributionInquiry,
  } = useData();


  // Admin login states for direct guard authentication
  const [adminEmailInput, setAdminEmailInput] = useState('');
  const [adminPassInput, setAdminPassInput] = useState('');
  const [adminLoginError, setAdminLoginError] = useState<string | null>(null);

  // Admin-initiated user password reset modal state
  const [resetModalData, setResetModalData] = useState<{
    open: boolean;
    user?: User;
    resetLink?: string;
    expiresAt?: number;
    copied?: boolean;
    loading?: boolean;
    error?: string;
    success?: string;
  }>({ open: false });

  // Admin password change modal state
  const [adminPasswordModal, setAdminPasswordModal] = useState<{
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

  type AdminTab =
    | 'overview'
    | 'fan_orders'
    | 'shop'
    | 'products'
    | 'users'
    | 'messages'
    | 'gallery_video'
    | 'homepage'
    | 'videos'
    | 'photos'
    | 'distribution'
    | 'monetization'
    | 'news'
    | 'analytics';

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Bonus Points Gift Tool State (পয়েন্ট বোনাস গিফট পাঠানোর স্টেট)
  const [selectedBonusUserId, setSelectedBonusUserId] = useState<string>('');
  const [bonusPointsInput, setBonusPointsInput] = useState<number>(100);
  const [bonusGiftNoteInput, setBonusGiftNoteInput] = useState<string>('');
  const [bonusSendAlert, setBonusSendAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Overview Filters
  const [overviewOrderFilter, setOverviewOrderFilter] = useState<'all' | 'pending' | 'shipped' | 'delivered'>('all');
  const [overviewMessageFilter, setOverviewMessageFilter] = useState<'all' | 'pending' | 'replied'>('all');

  // User search & filter
  const [userSearch, setUserSearch] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Reply state
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});
  const [messageSearchQuery, setMessageSearchQuery] = useState('');
  const [messagesSubTab, setMessagesSubTab] = useState<'fan_messages' | 'booking_inquiries'>('fan_messages');

  // Gallery & Video Management State
  const [gallerySubTab, setGallerySubTab] = useState<'photos' | 'videos'>('photos');
  const [editingPhotoItem, setEditingPhotoItem] = useState<PhotoItem | null>(null);
  const [photoEditTitle, setPhotoEditTitle] = useState('');
  const [photoEditCategory, setPhotoEditCategory] = useState<PhotoItem['category']>('concert');
  const [photoEditImageUrl, setPhotoEditImageUrl] = useState('');
  const [photoEditLocation, setPhotoEditLocation] = useState('');
  const [photoNotice, setPhotoNotice] = useState<string | null>(null);
  const [photoSaving, setPhotoSaving] = useState(false);
  const [videoSaving, setVideoSaving] = useState(false);

  // New Content Forms
  const [showAddPhoto, setShowAddPhoto] = useState(false);
  const [newPhotoData, setNewPhotoData] = useState({
    title: '',
    category: 'concert' as PhotoItem['category'],
    imageUrl: '',
    caption: '',
    location: '',
    photographer: '',
    tags: '',
  });

  const [showAddNews, setShowAddNews] = useState(false);
  const [newNewsData, setNewNewsData] = useState({
    title: '',
    slug: '',
    summary: '',
    content: '',
    coverImage: '',
    category: 'Tour & Live',
    author: 'Management Media Desk',
    readTime: '3 min read',
  });

  // Video Releases & YouTube Link Management
  const [editingVideoItem, setEditingVideoItem] = useState<VideoItem | null>(null);
  const [videoEditUrl, setVideoEditUrl] = useState('');
  const [videoEditTitle, setVideoEditTitle] = useState('');
  const [videoEditCategory, setVideoEditCategory] = useState<VideoItem['category']>('Music Video');
  const [videoEditDesc, setVideoEditDesc] = useState('');
  const [showAddVideoModal, setShowAddVideoModal] = useState(false);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoCategory, setNewVideoCategory] = useState<VideoItem['category']>('Music Video');
  const [newVideoDesc, setNewVideoDesc] = useState('');
  const [videoNotice, setVideoNotice] = useState<string | null>(null);

  // Shop Product & Orders Management
  const [editingProductItem, setEditingProductItem] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [productFormTitle, setProductFormTitle] = useState('');
  const [productFormPrice, setProductFormPrice] = useState(1500);
  const [productFormCurrency, setProductFormCurrency] = useState('BDT');
  const [productFormCategory, setProductFormCategory] = useState<Product['category']>('merch');
  const [productFormImageUrl, setProductFormImageUrl] = useState('');
  const [productFormOfferPrice, setProductFormOfferPrice] = useState<number | ''>(1250);
  const [productFormSizes, setProductFormSizes] = useState('36, 38, 40, 42');
  const [productFormDescription, setProductFormDescription] = useState('');
  const [productFormBuyUrl, setProductFormBuyUrl] = useState('');
  const [productFormBadge, setProductFormBadge] = useState('');
  const [productFormInStock, setProductFormInStock] = useState(true);
  const [orderFilterStatus, setOrderFilterStatus] = useState<string>('all');
  const [shopNotice, setShopNotice] = useState<string | null>(null);

  const [productExtraImg1, setProductExtraImg1] = useState('');
  const [productExtraImg2, setProductExtraImg2] = useState('');
  const [productExtraImg3, setProductExtraImg3] = useState('');
  const [adminShopSearch, setAdminShopSearch] = useState('');
  const [adminShopCategory, setAdminShopCategory] = useState('all');

  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    titleBn?: string;
    message?: string;
    itemName: string;
    onConfirm: () => void;
  } | null>(null);
  const [isPhotoUploading, setIsPhotoUploading] = useState(false);

  // Product photo file upload with smart compression to prevent quota exceed
  const handleProductPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsPhotoUploading(true);
        const compressed = await compressImageFile(file, 1000, 0.75);
        if (compressed) {
          setProductFormImageUrl(compressed);
        }
      } catch (err) {
        console.error('Failed to process image:', err);
      } finally {
        setIsPhotoUploading(false);
      }
    }
  };

  const handleProductExtraPhotoUpload = async (slot: 1 | 2 | 3, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsPhotoUploading(true);
        const compressed = await compressImageFile(file, 1000, 0.75);
        if (compressed) {
          if (slot === 1) setProductExtraImg1(compressed);
          if (slot === 2) setProductExtraImg2(compressed);
          if (slot === 3) setProductExtraImg3(compressed);
        }
      } catch (err) {
        console.error('Failed to process extra photo:', err);
      } finally {
        setIsPhotoUploading(false);
      }
    }
  };

  // Official Artist Profile Photo & Favicon State
  const [homeArtistProfileImage, setHomeArtistProfileImage] = useState(
    homepageSettings.artistProfileImage || PORTRAIT_IMAGE
  );
  const [homeArtistProfileSquare, setHomeArtistProfileSquare] = useState(
    homepageSettings.artistProfileSquare || homepageSettings.artistProfileImage || PORTRAIT_IMAGE
  );
  const [isProfilePhotoUploading, setIsProfilePhotoUploading] = useState(false);
  const [profilePhotoSaveNotice, setProfilePhotoSaveNotice] = useState<string | null>(null);

  const [isSavingCMS, setIsSavingCMS] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);
  const [isReloadingSettings, setIsReloadingSettings] = useState(false);

  // Sync state when homepageSettings updates from persistent storage
  React.useEffect(() => {
    if (!homepageSettings) return;
    if (homepageSettings.artistProfileImage) {
      setHomeArtistProfileImage(homepageSettings.artistProfileImage);
    }
    if (homepageSettings.artistProfileSquare) {
      setHomeArtistProfileSquare(homepageSettings.artistProfileSquare);
    }
    if (homepageSettings.heroTagline !== undefined) setHomeHeroTagline(homepageSettings.heroTagline);
    if (homepageSettings.heroTitle !== undefined) setHomeHeroTitle(homepageSettings.heroTitle);
    if (homepageSettings.heroSubtitle !== undefined) setHomeHeroSubtitle(homepageSettings.heroSubtitle);
    if (homepageSettings.heroDescription !== undefined) setHomeHeroDesc(homepageSettings.heroDescription);
    if (homepageSettings.heroImageUrl !== undefined) setHomeHeroImageUrl(homepageSettings.heroImageUrl);
    if (homepageSettings.heroEventBadge !== undefined) setHomeEventBadge(homepageSettings.heroEventBadge);
    if (homepageSettings.heroEventTitle !== undefined) setHomeEventTitle(homepageSettings.heroEventTitle);
    if (homepageSettings.heroEventSubtitle !== undefined) setHomeEventSubtitle(homepageSettings.heroEventSubtitle);
    if (homepageSettings.stat1Value !== undefined) setHomeStat1Val(homepageSettings.stat1Value);
    if (homepageSettings.stat1Label !== undefined) setHomeStat1Lbl(homepageSettings.stat1Label);
    if (homepageSettings.stat2Value !== undefined) setHomeStat2Val(homepageSettings.stat2Value);
    if (homepageSettings.stat2Label !== undefined) setHomeStat2Lbl(homepageSettings.stat2Label);
    if (homepageSettings.stat3Value !== undefined) setHomeStat3Val(homepageSettings.stat3Value);
    if (homepageSettings.stat3Label !== undefined) setHomeStat3Lbl(homepageSettings.stat3Label);
    if (homepageSettings.stat4Value !== undefined) setHomeStat4Val(homepageSettings.stat4Value);
    if (homepageSettings.stat4Label !== undefined) setHomeStat4Lbl(homepageSettings.stat4Label);
    if (homepageSettings.aboutHeadline !== undefined) setHomeAboutHeadline(homepageSettings.aboutHeadline);
    if (homepageSettings.aboutBio1 !== undefined) setHomeAboutBio1(homepageSettings.aboutBio1);
    if (homepageSettings.aboutBio2 !== undefined) setHomeAboutBio2(homepageSettings.aboutBio2);
    if (homepageSettings.aboutImageUrl !== undefined) setHomeAboutImageUrl(homepageSettings.aboutImageUrl);
    if (homepageSettings.aboutCity !== undefined) setHomeAboutCity(homepageSettings.aboutCity);
    if (homepageSettings.aboutVillage !== undefined) setHomeAboutVillage(homepageSettings.aboutVillage);
    if (homepageSettings.aboutEducation !== undefined) setHomeAboutEducation(homepageSettings.aboutEducation);
    if (homepageSettings.distHeadline !== undefined) setHomeDistHeadline(homepageSettings.distHeadline);
    if (homepageSettings.distTagline !== undefined) setHomeDistTagline(homepageSettings.distTagline);
    if (homepageSettings.distDescription !== undefined) setHomeDistDesc(homepageSettings.distDescription);
    if (homepageSettings.distBannerUrl !== undefined) setHomeDistBannerUrl(homepageSettings.distBannerUrl);
    if (homepageSettings.musicHeadline !== undefined) setHomeMusicHeadline(homepageSettings.musicHeadline);
    if (homepageSettings.musicSubtitle !== undefined) setHomeMusicSubtitle(homepageSettings.musicSubtitle);
    if (homepageSettings.featuredAlbumTitle !== undefined) setHomeFeaturedAlbumTitle(homepageSettings.featuredAlbumTitle);
    if (homepageSettings.featuredAlbumCover !== undefined) setHomeFeaturedAlbumCover(homepageSettings.featuredAlbumCover);
    if (homepageSettings.fanClubHeadline !== undefined) setHomeFanClubHeadline(homepageSettings.fanClubHeadline);
    if (homepageSettings.fanClubDescription !== undefined) setHomeFanClubDesc(homepageSettings.fanClubDescription);
    if (homepageSettings.annualGiftTitle !== undefined) setHomeAnnualGiftTitle(homepageSettings.annualGiftTitle);
    if (homepageSettings.annualGiftDescription !== undefined) setHomeAnnualGiftDesc(homepageSettings.annualGiftDescription);
    if (homepageSettings.annualGiftImage !== undefined) setHomeAnnualGiftImage(homepageSettings.annualGiftImage);
    if (homepageSettings.contactEmail !== undefined) setHomeContactEmail(homepageSettings.contactEmail);
    if (homepageSettings.contactPhone !== undefined) setHomeContactPhone(homepageSettings.contactPhone);
    if (homepageSettings.contactWhatsapp !== undefined) setHomeContactWhatsapp(homepageSettings.contactWhatsapp);
    if (homepageSettings.contactAddress !== undefined) setHomeContactAddress(homepageSettings.contactAddress);
    if (homepageSettings.socialFacebook !== undefined) setHomeSocialFacebook(homepageSettings.socialFacebook);
    if (homepageSettings.socialYoutube !== undefined) setHomeSocialYoutube(homepageSettings.socialYoutube);
    if (homepageSettings.socialSpotify !== undefined) setHomeSocialSpotify(homepageSettings.socialSpotify);
    if (homepageSettings.socialInstagram !== undefined) setHomeSocialInstagram(homepageSettings.socialInstagram);
    if (homepageSettings.footerCopyright !== undefined) setHomeFooterCopyright(homepageSettings.footerCopyright);
    if (homepageSettings.footerTagline !== undefined) setHomeFooterTagline(homepageSettings.footerTagline);
  }, [homepageSettings]);

  // Website Homepage Live CMS editor state
  const [homeHeroTagline, setHomeHeroTagline] = useState(homepageSettings.heroTagline);
  const [homeHeroTitle, setHomeHeroTitle] = useState(homepageSettings.heroTitle);
  const [homeHeroSubtitle, setHomeHeroSubtitle] = useState(homepageSettings.heroSubtitle);
  const [homeHeroDesc, setHomeHeroDesc] = useState(homepageSettings.heroDescription);
  const [homeHeroImageUrl, setHomeHeroImageUrl] = useState(homepageSettings.heroImageUrl);
  const [homeEventBadge, setHomeEventBadge] = useState(homepageSettings.heroEventBadge);
  const [homeEventTitle, setHomeEventTitle] = useState(homepageSettings.heroEventTitle);
  const [homeEventSubtitle, setHomeEventSubtitle] = useState(homepageSettings.heroEventSubtitle);
  const [homeStat1Val, setHomeStat1Val] = useState(homepageSettings.stat1Value);
  const [homeStat1Lbl, setHomeStat1Lbl] = useState(homepageSettings.stat1Label);
  const [homeStat2Val, setHomeStat2Val] = useState(homepageSettings.stat2Value);
  const [homeStat2Lbl, setHomeStat2Lbl] = useState(homepageSettings.stat2Label);
  const [homeStat3Val, setHomeStat3Val] = useState(homepageSettings.stat3Value);
  const [homeStat3Lbl, setHomeStat3Lbl] = useState(homepageSettings.stat3Label);
  const [homeStat4Val, setHomeStat4Val] = useState(homepageSettings.stat4Value);
  const [homeStat4Lbl, setHomeStat4Lbl] = useState(homepageSettings.stat4Label);
  const [homeAboutHeadline, setHomeAboutHeadline] = useState(homepageSettings.aboutHeadline || 'About Rasel Babu');
  const [homeAboutBio1, setHomeAboutBio1] = useState(homepageSettings.aboutBio1 || '');
  const [homeAboutBio2, setHomeAboutBio2] = useState(homepageSettings.aboutBio2 || '');
  const [homeAboutImageUrl, setHomeAboutImageUrl] = useState(homepageSettings.aboutImageUrl || '');
  const [homeAboutCity, setHomeAboutCity] = useState(homepageSettings.aboutCity || 'Rangpur, Bangladesh');
  const [homeAboutVillage, setHomeAboutVillage] = useState(homepageSettings.aboutVillage || 'Kashipur, Fulbari, Kurigram, Bangladesh');
  const [homeAboutEducation, setHomeAboutEducation] = useState(homepageSettings.aboutEducation || 'BA (2026) · Kurigram Govt College');

  // Distribution Page CMS
  const [homeDistHeadline, setHomeDistHeadline] = useState(homepageSettings.distHeadline || 'Rasel Babu & FK Music Limited');
  const [homeDistTagline, setHomeDistTagline] = useState(homepageSettings.distTagline || 'Official Global Music Distribution');
  const [homeDistDesc, setHomeDistDesc] = useState(homepageSettings.distDescription || 'Delivering master audio recordings directly to 150+ international digital streaming stores with automated Content ID and transparent royalty reporting under FK Music Limited.');
  const [homeDistBannerUrl, setHomeDistBannerUrl] = useState(homepageSettings.distBannerUrl || '/000111.svg');

  // Music Section CMS
  const [homeMusicHeadline, setHomeMusicHeadline] = useState(homepageSettings.musicHeadline || 'Discography & Studio Releases');
  const [homeMusicSubtitle, setHomeMusicSubtitle] = useState(homepageSettings.musicSubtitle || 'Listen to master tracks across major international streaming platforms');
  const [homeFeaturedAlbumTitle, setHomeFeaturedAlbumTitle] = useState(homepageSettings.featuredAlbumTitle || 'Melodies of Bengal (অমর সুরের গান)');
  const [homeFeaturedAlbumCover, setHomeFeaturedAlbumCover] = useState(homepageSettings.featuredAlbumCover || '');

  // Fan Club & Rewards CMS
  const [homeFanClubHeadline, setHomeFanClubHeadline] = useState(homepageSettings.fanClubHeadline || 'Rasel Babu VIP Fan Club & Reward Points');
  const [homeFanClubDesc, setHomeFanClubDesc] = useState(homepageSettings.fanClubDescription || 'Earn reward points through website engagement and bonus gifts. The top point earner wins the Annual Grand Mega Gift!');
  const [homeAnnualGiftTitle, setHomeAnnualGiftTitle] = useState(homepageSettings.annualGiftTitle || '🏆 Annual Fan of the Year Mega Gift (বার্ষিক সেরা ফ্যান মেগা গিফট)');
  const [homeAnnualGiftDesc, setHomeAnnualGiftDesc] = useState(homepageSettings.annualGiftDescription || 'Autographed Fender Acoustic Guitar + Lifetime VIP All-Access Concert Pass + ৳৫০,০০০ গ্র্যান্ড গিফট হ্যাম্পার');
  const [homeAnnualGiftImage, setHomeAnnualGiftImage] = useState(homepageSettings.annualGiftImage || '');

  // Contact & Social CMS
  const [homeContactEmail, setHomeContactEmail] = useState(homepageSettings.contactEmail || 'fkbabu01@gmail.com');
  const [homeContactPhone, setHomeContactPhone] = useState(homepageSettings.contactPhone || '+880 1711-000000');
  const [homeContactWhatsapp, setHomeContactWhatsapp] = useState(homepageSettings.contactWhatsapp || '+880 1711-000000');
  const [homeContactAddress, setHomeContactAddress] = useState(homepageSettings.contactAddress || 'House 14, Road 7, Dhanmondi, Dhaka-1205, Bangladesh');
  const [homeSocialFacebook, setHomeSocialFacebook] = useState(homepageSettings.socialFacebook || 'https://facebook.com/raselbabuofficial');
  const [homeSocialYoutube, setHomeSocialYoutube] = useState(homepageSettings.socialYoutube || 'https://youtube.com/@raselbabu');
  const [homeSocialSpotify, setHomeSocialSpotify] = useState(homepageSettings.socialSpotify || 'https://open.spotify.com/artist/raselbabu');
  const [homeSocialInstagram, setHomeSocialInstagram] = useState(homepageSettings.socialInstagram || 'https://instagram.com/raselbabu.music');

  // Footer CMS
  const [homeFooterCopyright, setHomeFooterCopyright] = useState(homepageSettings.footerCopyright || '© 2026 Rasel Babu. All Intellectual Rights Reserved.');
  const [homeFooterTagline, setHomeFooterTagline] = useState(homepageSettings.footerTagline || 'Official Artist Web Experience powered by FK Music Limited.');

  // Website CMS Feedback Alert
  const [homeSaveSuccess, setHomeSaveSuccess] = useState<string | null>(null);

  // Distribution Inquiries Admin State (শিল্পী ও ব্যান্ডের ওয়েবসাইট মেসেজ)
  const [distFilter, setDistFilter] = useState<'all' | 'new' | 'reviewed' | 'contacted' | 'approved'>('all');
  const [distSearch, setDistSearch] = useState('');
  const [replyDistInqId, setReplyDistInqId] = useState<string | null>(null);
  const [replyDistText, setReplyDistText] = useState('');
  const [distNotice, setDistNotice] = useState<string | null>(null);

  const handleHeroPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setHomeHeroImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAboutPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setHomeAboutImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDistBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setHomeDistBannerUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAlbumCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setHomeFeaturedAlbumCover(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnnualGiftImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setHomeAnnualGiftImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfilePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProfilePhotoUploading(true);
    try {
      // 1. High-resolution compressed profile image
      const compressedProfile = await compressImageFile(file, 1000, 0.85);
      // 2. Exact 1:1 square crop for favicon and avatars
      const squareCrop = await createSquareCrop(file, 256);

      let profileUrl = compressedProfile || squareCrop;
      let squareUrl = squareCrop || compressedProfile;

      // Attempt to save to persistent server disk if /api/upload is available
      try {
        const upRes = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: profileUrl, name: 'profile_photo' }),
        });
        const upData = await upRes.json().catch(() => ({}));
        if (upRes.ok && upData?.success && upData.url) {
          profileUrl = upData.url;
        }
      } catch {}

      try {
        const sqRes = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: squareUrl, name: 'favicon_square' }),
        });
        const sqData = await sqRes.json().catch(() => ({}));
        if (sqRes.ok && sqData?.success && sqData.url) {
          squareUrl = sqData.url;
        }
      } catch {}

      setHomeArtistProfileImage(profileUrl);
      setHomeArtistProfileSquare(squareUrl);
    } catch (err) {
      console.error('Error processing profile photo:', err);
    } finally {
      setIsProfilePhotoUploading(false);
    }
  };

  const handleProfilePhotoUrlChange = async (url: string) => {
    setHomeArtistProfileImage(url);
    if (url.trim()) {
      try {
        const square = await createSquareCrop(url.trim(), 256);
        setHomeArtistProfileSquare(square);
      } catch {
        setHomeArtistProfileSquare(url);
      }
    }
  };

  const handleSelectProfilePreset = async (presetPath: string) => {
    setHomeArtistProfileImage(presetPath);
    try {
      const square = await createSquareCrop(presetPath, 256);
      setHomeArtistProfileSquare(square);
    } catch {
      setHomeArtistProfileSquare(presetPath);
    }
  };

  const handleSaveArtistProfilePhoto = async () => {
    setIsSavingProfile(true);
    setSaveErrorMessage(null);
    try {
      const res = await updateHomepageSettings({
        artistProfileImage: homeArtistProfileImage,
        artistProfileSquare: homeArtistProfileSquare,
      });
      if (res.success) {
        setProfilePhotoSaveNotice('✅ রাসেল বাবুর অফিসিয়াল প্রোফাইল ছবি ও ব্রাউজার ফেভিকন সফলভাবে ডাটাবেজে সংরক্ষিত হয়েছে! (Live centrally across all browsers and devices)');
        setTimeout(() => setProfilePhotoSaveNotice(null), 6000);
      } else {
        setSaveErrorMessage(res.message || 'প্রোফাইল ছবি সংরক্ষণ ব্যর্থ হয়েছে। সার্ভার সংযোগ পরীক্ষা করুন।');
      }
    } catch (err: any) {
      setSaveErrorMessage('সংরক্ষণ ত্রুটি: ' + (err?.message || 'সার্ভার সেভ ব্যর্থ হয়েছে'));
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveHomepageCMS = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingCMS(true);
    setSaveErrorMessage(null);
    try {
      const res = await updateHomepageSettings({
        artistProfileImage: homeArtistProfileImage,
        artistProfileSquare: homeArtistProfileSquare,
        heroTagline: homeHeroTagline,
        heroTitle: homeHeroTitle,
        heroSubtitle: homeHeroSubtitle,
        heroDescription: homeHeroDesc,
        heroImageUrl: homeHeroImageUrl,
        heroEventBadge: homeEventBadge,
        heroEventTitle: homeEventTitle,
        heroEventSubtitle: homeEventSubtitle,
        stat1Value: homeStat1Val,
        stat1Label: homeStat1Lbl,
        stat2Value: homeStat2Val,
        stat2Label: homeStat2Lbl,
        stat3Value: homeStat3Val,
        stat3Label: homeStat3Lbl,
        stat4Value: homeStat4Val,
        stat4Label: homeStat4Lbl,
        aboutHeadline: homeAboutHeadline,
        aboutBio1: homeAboutBio1,
        aboutBio2: homeAboutBio2,
        aboutImageUrl: homeAboutImageUrl,
        aboutCity: homeAboutCity,
        aboutVillage: homeAboutVillage,
        aboutEducation: homeAboutEducation,
        distHeadline: homeDistHeadline,
        distTagline: homeDistTagline,
        distDescription: homeDistDesc,
        distBannerUrl: homeDistBannerUrl,
        musicHeadline: homeMusicHeadline,
        musicSubtitle: homeMusicSubtitle,
        featuredAlbumTitle: homeFeaturedAlbumTitle,
        featuredAlbumCover: homeFeaturedAlbumCover,
        fanClubHeadline: homeFanClubHeadline,
        fanClubDescription: homeFanClubDesc,
        annualGiftTitle: homeAnnualGiftTitle,
        annualGiftDescription: homeAnnualGiftDesc,
        annualGiftImage: homeAnnualGiftImage,
        contactEmail: homeContactEmail,
        contactPhone: homeContactPhone,
        contactWhatsapp: homeContactWhatsapp,
        contactAddress: homeContactAddress,
        socialFacebook: homeSocialFacebook,
        socialYoutube: homeSocialYoutube,
        socialSpotify: homeSocialSpotify,
        socialInstagram: homeSocialInstagram,
        footerCopyright: homeFooterCopyright,
        footerTagline: homeFooterTagline,
      });

      if (res.success) {
        setHomeSaveSuccess('✅ ওয়েবসাইটের সকল টেক্সট, ফটো ও সেটিংস কেন্দ্রীয় ডাটাবেজে সফলভাবে সংরক্ষিত হয়েছে! সমস্ত ব্রাউজার, কম্পিউটার ও মোবাইলে পরিবর্তন কার্যকর। (Live centrally across all browsers and devices)');
        setTimeout(() => setHomeSaveSuccess(null), 6000);
      } else {
        setSaveErrorMessage(res.message || 'সেটিংস সংরক্ষণ ব্যর্থ হয়েছে। সার্ভার সংযোগ পরীক্ষা করুন।');
      }
    } catch (err: any) {
      setSaveErrorMessage('সার্ভার সেভ ত্রুটি: ' + (err?.message || 'সংরক্ষণ ব্যর্থ হয়েছে'));
    } finally {
      setIsSavingCMS(false);
    }
  };

  const handleSendDistributionReply = (id: string) => {
    if (!replyDistText.trim()) return;
    replyToDistributionInquiry(id, replyDistText.trim());
    setReplyDistText('');
    setReplyDistInqId(null);
    setDistNotice('শিল্পীকে সফলভাবে অফিসিয়াল রিপ্লাই প্রদান করা হয়েছে (Reply transmitted to artist)');
    setTimeout(() => setDistNotice(null), 4000);
  };

  const handleSimulateWebsiteMessage = () => {
    submitDistributionInquiry({
      artistName: 'Shuvro Ahmed & Band',
      email: 'shuvro.music@gmail.com',
      phone: '+880 1819-456789',
      releaseTitle: 'Brishti Bheja Shondha (বৃষ্টি ভেজা সন্ধ্যা)',
      genre: 'Bengali Alternative Rock',
      platforms: ['Spotify', 'Apple Music', 'YouTube Music', 'TikTok & ByteDance'],
      demoLink: 'https://www.youtube.com/@shuvroahmedmusic',
      message: 'আমাদের নতুন ব্যান্ডের অরিজিনাল ট্র্যাক FK Music Limited এর মাধ্যমে বিশ্বব্যাপী রিলিজ করতে চাই। মিক্স এবং মাস্টার রেডি আছে। অনুগ্রহ করে ISRC ও ডিস্ট্রিবিউশন প্রসেস জানাবেন।',
    });
    setDistNotice('ওয়েবসাইট থেকে একটি নতুন টেস্ট মেসেজ ও ট্র্যাক আবেদন যুক্ত করা হয়েছে!');
    setTimeout(() => setDistNotice(null), 4000);
  };

  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginError(null);
    const res = await login(adminEmailInput, adminPassInput);
    if (!res.success) {
      setAdminLoginError(res.message);
    }
  };

  // Guard for protected admin area with full interactive sign-in
  if (!isAdminOrManager) {
    return (
      <div className="min-h-screen bg-[#08080a] text-zinc-100 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-zinc-900/90 border border-amber-500/40 p-6 sm:p-8 rounded-3xl space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
              <Shield className="w-7 h-7" />
            </div>
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400 block">
              Rasel Babu Official Portal
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
              Admin Panel Sign In / অ্যাডমিন লগইন
            </h2>
            <p className="text-xs text-zinc-400">
              Sign in with administrative credentials to manage registrations, photos, albums, and Adsterra monetization.
            </p>
          </div>

          {adminLoginError && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{adminLoginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLoginSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-300">Admin Email</label>
              <input
                type="email"
                required
                placeholder="raselbabuwebsiteshop@gmail.com"
                value={adminEmailInput}
                onChange={(e) => setAdminEmailInput(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-300">Admin Password</label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={adminPassInput}
                onChange={(e) => setAdminPassInput(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-black font-bold text-xs transition-all shadow-md shadow-amber-400/20 cursor-pointer"
            >
              Sign In to Admin Panel
            </button>
          </form>

          <div className="pt-2 border-t border-zinc-800/80">
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="w-full py-2 rounded-xl text-zinc-500 hover:text-zinc-300 text-xs transition-colors cursor-pointer text-center block"
            >
              Return to Website Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filter users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.role.toLowerCase().includes(userSearch.toLowerCase());
    const matchesStatus = userStatusFilter === 'all' || u.status === userStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = users.filter((u) => u.status === 'pending').length;

  const handleCreatePhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoData.title || !newPhotoData.imageUrl) return;
    setPhotoSaving(true);

    try {
      const res = await addPhoto({
        title: newPhotoData.title,
        category: newPhotoData.category,
        imageUrl: newPhotoData.imageUrl,
        caption: newPhotoData.caption,
        date: new Date().toISOString().split('T')[0],
        location: newPhotoData.location || 'Dhaka, Bangladesh',
        photographer: newPhotoData.photographer || 'Official Media Team',
        tags: newPhotoData.tags.split(',').map((t) => t.trim()).filter(Boolean),
      });

      if (res && res.success) {
        setNewPhotoData({
          title: '',
          category: 'concert',
          imageUrl: '',
          caption: '',
          location: '',
          photographer: '',
          tags: '',
        });
        setShowAddPhoto(false);
        setPhotoNotice('✅ নতুন ফটো সফলভাবে গ্যালারিতে আপলোড ও সেন্ট্রাল ডাটাবেজে সংরক্ষিত হয়েছে! (Live centrally across all visitors)');
        setTimeout(() => setPhotoNotice(null), 5000);
      } else {
        setPhotoNotice(`❌ ফটো সংরক্ষণ ব্যর্থ হয়েছে: ${res?.message || 'Error saving photo to server'}`);
      }
    } catch (err: any) {
      setPhotoNotice(`❌ ফটো সংরক্ষণ ত্রুটি: ${err.message || 'Error saving photo'}`);
    } finally {
      setPhotoSaving(false);
    }
  };

  const handleOpenEditPhoto = (p: PhotoItem) => {
    setEditingPhotoItem(p);
    setPhotoEditTitle(p.title);
    setPhotoEditCategory(p.category);
    setPhotoEditImageUrl(p.imageUrl);
    setPhotoEditLocation(p.location || '');
  };

  const handleSaveEditPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPhotoItem) return;
    setPhotoSaving(true);
    try {
      const res = await updatePhoto(editingPhotoItem.id, {
        title: photoEditTitle,
        category: photoEditCategory,
        imageUrl: photoEditImageUrl,
        location: photoEditLocation,
      });
      if (res && res.success) {
        setEditingPhotoItem(null);
        setPhotoNotice('✅ ফটো তথ্য সফলভাবে আপডেট হয়েছে এবং সব ভিজিটরের জন্য লাইভ হয়েছে!');
        setTimeout(() => setPhotoNotice(null), 5000);
      } else {
        setPhotoNotice(`❌ ফটো এডিট সংরক্ষণ ব্যর্থ: ${res?.message || 'Error saving edit'}`);
      }
    } catch (err: any) {
      setPhotoNotice(`❌ ফটো এডিট ত্রুটি: ${err.message}`);
    } finally {
      setPhotoSaving(false);
    }
  };

  const handleCreateNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNewsData.title || !newNewsData.content) return;

    addNewsArticle({
      title: newNewsData.title,
      slug: newNewsData.slug || newNewsData.title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      summary: newNewsData.summary,
      content: newNewsData.content,
      coverImage: newNewsData.coverImage || HERO_STAGE_IMAGE,
      category: newNewsData.category,
      author: newNewsData.author,
      readTime: newNewsData.readTime,
      publishDate: new Date().toISOString().split('T')[0],
    });

    setNewNewsData({
      title: '',
      slug: '',
      summary: '',
      content: '',
      coverImage: '',
      category: 'Tour & Live',
      author: 'Management Media Desk',
      readTime: '3 min read',
    });
    setShowAddNews(false);
  };

  const handleSendReply = (messageId: string) => {
    const text = replyTextMap[messageId];
    if (!text) return;
    replyToUserMessage(messageId, text, currentUser?.name || 'Rasel Babu Management');
    setReplyTextMap((prev) => ({ ...prev, [messageId]: '' }));
  };

  // Video Management Handlers (Edit YouTube link anytime)
  const handleOpenEditVideo = (v: VideoItem) => {
    setEditingVideoItem(v);
    setVideoEditTitle(v.title);
    setVideoEditUrl(`https://www.youtube.com/watch?v=${v.youtubeId}`);
    setVideoEditCategory(v.category);
    setVideoEditDesc(v.description);
  };

  const handleSaveEditVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideoItem) return;
    const extractedId = extractYouTubeId(videoEditUrl);
    if (!extractedId) return;
    setVideoSaving(true);

    try {
      const res = await updateVideo(editingVideoItem.id, {
        title: videoEditTitle,
        youtubeId: extractedId,
        category: videoEditCategory,
        description: videoEditDesc,
        thumbnailUrl: `https://img.youtube.com/vi/${extractedId}/hqdefault.jpg`,
      });

      if (res && res.success) {
        setVideoNotice(`✅ YouTube video "${videoEditTitle}" successfully updated & live centrally for all visitors!`);
        setTimeout(() => setVideoNotice(null), 5000);
        setEditingVideoItem(null);
      } else {
        setVideoNotice(`❌ ভিডিও আপডেট সংরক্ষণ ব্যর্থ: ${res?.message || 'Error updating video'}`);
      }
    } catch (err: any) {
      setVideoNotice(`❌ ভিডিও আপডেট ত্রুটি: ${err.message}`);
    } finally {
      setVideoSaving(false);
    }
  };

  const handleCreateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    const extractedId = extractYouTubeId(newVideoUrl);
    if (!extractedId || !newVideoTitle) return;
    setVideoSaving(true);

    try {
      const res = await addVideo({
        title: newVideoTitle,
        youtubeId: extractedId,
        category: newVideoCategory,
        description: newVideoDesc,
        thumbnailUrl: `https://img.youtube.com/vi/${extractedId}/hqdefault.jpg`,
        duration: '04:15',
        releaseDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        views: '12K',
      });

      if (res && res.success) {
        setShowAddVideoModal(false);
        setNewVideoTitle('');
        setNewVideoUrl('');
        setNewVideoDesc('');
        setVideoNotice('✅ নতুন YouTube ভিডিও সফলভাবে সেন্ট্রাল ডাটাবেজে যুক্ত ও সবার জন্য লাইভ হয়েছে!');
        setTimeout(() => setVideoNotice(null), 5000);
      } else {
        setVideoNotice(`❌ ভিডিও যুক্ত করা ব্যর্থ: ${res?.message || 'Error saving video'}`);
      }
    } catch (err: any) {
      setVideoNotice(`❌ ভিডিও যোগ করার ত্রুটি: ${err.message}`);
    } finally {
      setVideoSaving(false);
    }
  };

  // Shop Product Handlers
  const handleOpenAddProduct = () => {
    setEditingProductItem(null);
    setProductFormTitle('');
    setProductFormPrice(3200);
    setProductFormOfferPrice(2750);
    setProductFormCurrency('BDT');
    setProductFormCategory('dress');
    setProductFormImageUrl(TRADITIONAL_PUNJABI_IMAGE);
    setProductExtraImg1('');
    setProductExtraImg2('');
    setProductExtraImg3('');
    setProductFormSizes('36, 38, 40, 42, 44');
    setProductFormDescription('Handcrafted traditional cotton three-piece with elegant block print and chiffon dupatta.');
    setProductFormBuyUrl('');
    setProductFormBadge('New Three-Piece');
    setProductFormInStock(true);
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProductItem(prod);
    setProductFormTitle(prod.title);
    setProductFormPrice(prod.price);
    setProductFormOfferPrice(prod.offerPrice ?? '');
    setProductFormCurrency(prod.currency);
    setProductFormCategory(prod.category);
    setProductFormImageUrl(prod.imageUrl);
    setProductExtraImg1(prod.additionalImages?.[0] || '');
    setProductExtraImg2(prod.additionalImages?.[1] || '');
    setProductExtraImg3(prod.additionalImages?.[2] || '');
    setProductFormSizes(prod.sizes ? prod.sizes.join(', ') : '');
    setProductFormDescription(prod.description);
    setProductFormBuyUrl(prod.buyUrl || '');
    setProductFormBadge(prod.badge || '');
    setProductFormInStock(prod.inStock);
    setShowProductModal(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = productFormTitle.trim();
    if (!cleanTitle) {
      alert('Please enter a product title (পণ্যের নাম লিখুন)');
      return;
    }

    const parsedSizes = productFormSizes
      ? productFormSizes.split(',').map((s) => s.trim()).filter(Boolean)
      : undefined;
    const numericOffer = (productFormOfferPrice !== '' && Number(productFormOfferPrice) > 0)
      ? Number(productFormOfferPrice)
      : undefined;
    const additionalImages = [productExtraImg1, productExtraImg2, productExtraImg3].filter(
      (img) => img && img.trim().length > 0
    );

    const safeImageUrl = productFormImageUrl.trim() || TRADITIONAL_PUNJABI_IMAGE;

    if (editingProductItem) {
      updateProduct(editingProductItem.id, {
        title: cleanTitle,
        price: Number(productFormPrice) || 0,
        offerPrice: numericOffer,
        currency: productFormCurrency || 'BDT',
        category: productFormCategory,
        imageUrl: safeImageUrl,
        additionalImages,
        sizes: parsedSizes,
        description: productFormDescription || '',
        buyUrl: productFormBuyUrl || '',
        badge: productFormBadge || '',
        inStock: productFormInStock,
      });
      setShopNotice(`Product "${cleanTitle}" updated successfully!`);
    } else {
      addProduct({
        title: cleanTitle,
        price: Number(productFormPrice) || 0,
        offerPrice: numericOffer,
        currency: productFormCurrency || 'BDT',
        category: productFormCategory,
        imageUrl: safeImageUrl,
        additionalImages,
        sizes: parsedSizes,
        description: productFormDescription || '',
        buyUrl: productFormBuyUrl || '',
        badge: productFormBadge || '',
        inStock: productFormInStock,
      });
      setShopNotice(`New product "${cleanTitle}" added to store!`);
    }

    setTimeout(() => setShopNotice(null), 3500);
    setShowProductModal(false);
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-widest text-amber-400">
                Administration Console
              </span>
              <span className="text-zinc-600">·</span>
              <span className="text-xs text-zinc-400">Rasel Babu Official Operations</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mt-1">
              Executive Management & Monetization Center
            </h1>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300">
              Role: <strong className="text-amber-400 uppercase">{currentUser?.role}</strong>
            </span>
            <button
              type="button"
              onClick={() => setAdminPasswordModal({ open: true, currentPass: '', newPass: '', confirmPass: '', loading: false, error: null, success: null })}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-amber-500/30 text-amber-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>Change Password</span>
            </button>
          </div>
        </div>

        {/* Two-Column Responsive Layout: Left Sidebar + Right Workspace */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* LEFT SIDEBAR (বা পাশে সিরিয়াল মেনুবার) */}
          <aside className="w-full lg:w-80 shrink-0 lg:sticky lg:top-20 space-y-4">
            {/* Admin Profile Card */}
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/90 shadow-xl space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-pink-600 text-black font-display font-black text-base flex items-center justify-center shrink-0 shadow-md shadow-amber-400/20 overflow-hidden">
                  {homeArtistProfileSquare || homeArtistProfileImage || homepageSettings.artistProfileSquare || homepageSettings.artistProfileImage ? (
                    <img
                      src={homeArtistProfileSquare || homeArtistProfileImage || homepageSettings.artistProfileSquare || homepageSettings.artistProfileImage}
                      alt="Rasel Babu"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    'RB'
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-white truncate">{currentUser?.name || 'Rasel Babu Admin'}</div>
                  <div className="text-[11px] text-zinc-400 font-mono truncate">{currentUser?.email || 'raselbabuwebsiteshop@gmail.com'}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] text-emerald-400 font-mono font-medium">Super Admin Online</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
                <span className="font-mono text-[10px] uppercase text-zinc-500">Console Mode</span>
                <span className="px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/30 text-amber-300 font-mono font-bold text-[10px]">
                  FULL CONTROL
                </span>
              </div>

              <button
                type="button"
                onClick={() => setAdminPasswordModal({ open: true, currentPass: '', newPass: '', confirmPass: '', loading: false, error: null, success: null })}
                className="w-full py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-amber-500/20 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>Change Admin Password</span>
              </button>
            </div>

            {/* Serialized Main Menu Options (বা পাশে সিরিয়াল মেনু) */}
            <div className="p-3.5 rounded-2xl bg-zinc-950/90 border border-zinc-800 space-y-1.5 shadow-xl">
              <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold flex items-center justify-between">
                <span>MAIN OPTIONS (মূল অপশনসমূহ)</span>
                <span className="text-amber-400">9 SECTIONS</span>
              </div>

              <nav className="space-y-1" aria-label="Admin Navigation">
                {[
                  {
                    id: 'overview' as const,
                    serial: '01',
                    label: 'Dashboard Overview',
                    labelBn: 'শপিং, পয়েন্ট ও মেসেজ রিপ্লাই',
                    icon: LayoutDashboard,
                  },
                  {
                    id: 'fan_orders' as const,
                    serial: '02',
                    label: 'Fan Orders',
                    labelBn: 'ফ্যান অর্ডার ও ডেলিভারি ট্র্যাকিং',
                    icon: Truck,
                    badge: orders.length,
                    badgeColor: 'bg-cyan-400 text-black font-bold',
                  },
                  {
                    id: 'shop' as const,
                    serial: '03',
                    label: 'Shop',
                    labelBn: 'সকল প্রোডাক্ট ও নতুন পণ্য অ্যাড',
                    icon: ShoppingBag,
                    badge: products.length,
                    badgeColor: 'bg-amber-400 text-black font-bold',
                  },
                  {
                    id: 'users' as const,
                    serial: '04',
                    label: 'Fan Accounts & Points',
                    labelBn: 'ফ্যান অ্যাকাউন্ট ও বোনাস পয়েন্ট',
                    icon: Users,
                    badge: pendingCount > 0 ? `${pendingCount} new` : users.length,
                    badgeColor: pendingCount > 0 ? 'bg-pink-600 text-white animate-pulse' : 'bg-zinc-800 text-zinc-300',
                  },
                  {
                    id: 'messages' as const,
                    serial: '05',
                    label: 'Fan Messages & Replies',
                    labelBn: 'মেসেজ সিন ও সরাসরি রিপ্লাই',
                    icon: Send,
                    badge: userMessages.filter((m) => m.status === 'pending').length || undefined,
                    badgeColor: 'bg-cyan-500 text-black font-bold',
                  },
                  {
                    id: 'gallery_video' as const,
                    serial: '06',
                    label: 'Gallery & Video',
                    labelBn: 'ফটো ও ভিডিও ম্যানেজমেন্ট',
                    icon: Film,
                    badge: `${photos.length + videos.length}`,
                    badgeColor: 'bg-amber-400 text-black font-bold',
                  },
                  {
                    id: 'homepage' as const,
                    serial: '07',
                    label: 'Edit Website',
                    labelBn: 'সকল টেক্সট ও ফটো এডিট',
                    icon: Globe,
                    badge: 'CMS Live',
                    badgeColor: 'bg-amber-400 text-black font-bold',
                  },
                  {
                    id: 'distribution' as const,
                    serial: '08',
                    label: 'FK Music Distribution',
                    labelBn: 'ওয়েবসাইট মেসেজ ও আবেদন',
                    icon: Disc,
                    badge: distributionInquiries.filter((d) => d.status === 'new').length > 0
                      ? `${distributionInquiries.filter((d) => d.status === 'new').length} new`
                      : `${distributionInquiries.length} msgs`,
                    badgeColor: distributionInquiries.filter((d) => d.status === 'new').length > 0
                      ? 'bg-pink-600 text-white animate-pulse'
                      : 'bg-pink-950 text-pink-300 border border-pink-800',
                  },
                  {
                    id: 'monetization' as const,
                    serial: '09',
                    label: 'Adsterra Monetization',
                    labelBn: 'বিজ্ঞাপন ও মনেটাইজেশন',
                    icon: DollarSign,
                  },
                ].map((item) => {
                  const isActive = activeTab === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between group cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-amber-400 via-amber-400 to-amber-500 text-black font-bold shadow-lg shadow-amber-400/20'
                          : 'bg-zinc-900/60 hover:bg-zinc-800/90 text-zinc-300 hover:text-white border border-zinc-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded ${
                            isActive
                              ? 'bg-black text-amber-300'
                              : 'bg-zinc-800 text-zinc-400 group-hover:text-amber-400'
                          }`}
                        >
                          {item.serial}
                        </span>
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-black' : 'text-amber-400'}`} />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold truncate leading-tight">{item.label}</p>
                          <p className={`text-[10px] truncate ${isActive ? 'text-black/80 font-normal' : 'text-zinc-500'}`}>
                            {item.labelBn}
                          </p>
                        </div>
                      </div>

                      {item.badge !== undefined && (
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono shrink-0 ml-1.5 ${
                            item.badgeColor || (isActive ? 'bg-black text-amber-300' : 'bg-zinc-800 text-zinc-300')
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* Quick Website View Link */}
              <div className="pt-2 border-t border-zinc-800/80">
                <button
                  onClick={() => onNavigate('/')}
                  className="w-full p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>View Public Website (ওয়েবসাইট দেখুন)</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          </aside>

          {/* RIGHT MAIN WORKSPACE (প্রতি অপশনের পূর্ণ পেজ) */}
          <main className="flex-1 min-w-0 w-full space-y-6">

            {/* TAB 01: DASHBOARD OVERVIEW (শপিং, ফ্যান অ্যাকাউন্ট ও পয়েন্ট বোনাস, মেসেজ সিন ও রিপ্লাই) */}
            {activeTab === 'overview' && (
              <div className="space-y-8 animate-fade-in">
                {/* Top Quick Status Banner */}
                <div className="p-6 rounded-3xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-black border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-mono uppercase">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Rasel Babu Official Artist Control Center · raselbabuwebsiteshop@gmail.com</span>
                    </div>
                    <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
                      Dashboard Overview (মূল ড্যাশবোর্ড)
                    </h2>
                    <p className="text-xs text-zinc-300 max-w-xl">
                      স্বাগতম অ্যাডমিন প্যানেলে। এখান থেকে আপনি সরাসরি <strong>শপিং ও অর্ডার ট্র্যাকিং</strong>, <strong>ফ্যান অ্যাকাউন্ট ও ইনস্ট্যান্ট পয়েন্ট বোনাস উপহার</strong> এবং <strong>ইউজারদের মেসেজ সিন ও রিপ্লাই</strong> প্রদান করতে পারবেন।
                    </p>
                  </div>
                </div>

                {/* 3 Core Essential KPI Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* KPI 1: Shopping & Orders */}
                  <div
                    onClick={() => setActiveTab('shop')}
                    className="p-5 rounded-2xl bg-zinc-900/60 hover:bg-zinc-800/80 border border-amber-500/30 transition-all cursor-pointer group shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono uppercase text-amber-300 font-bold flex items-center gap-1.5">
                        <ShoppingBag className="w-4 h-4 text-amber-400" />
                        <span>1. SHOPPING &amp; ORDERS</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-mono font-bold">
                        {orders.filter((o) => o.status === 'pending').length} Pending
                      </span>
                    </div>
                    <div className="text-3xl font-bold font-mono text-white mt-3 group-hover:text-amber-400 transition-colors">
                      {orders.length} <span className="text-base font-normal text-zinc-400">Orders</span>
                    </div>
                    <div className="text-xs font-mono mt-1.5 flex items-center justify-between text-zinc-400">
                      <span className="text-amber-300 font-bold">
                        ৳ {orders.reduce((acc, o) => acc + o.totalAmount, 0).toLocaleString()} BDT Revenue
                      </span>
                      <span className="text-zinc-500 group-hover:text-zinc-300">View Details →</span>
                    </div>
                  </div>

                  {/* KPI 2: Fan Accounts & Points */}
                  <div
                    onClick={() => setActiveTab('users')}
                    className="p-5 rounded-2xl bg-zinc-900/60 hover:bg-zinc-800/80 border border-pink-500/30 transition-all cursor-pointer group shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono uppercase text-pink-300 font-bold flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-pink-400" />
                        <span>2. FAN ACCOUNTS &amp; POINTS</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 text-[10px] font-mono font-bold">
                        {users.reduce((acc, u) => acc + (u.points || 0), 0).toLocaleString()} Pts Total
                      </span>
                    </div>
                    <div className="text-3xl font-bold font-mono text-white mt-3 group-hover:text-pink-400 transition-colors">
                      {users.length} <span className="text-base font-normal text-zinc-400">Fans</span>
                    </div>
                    <div className="text-xs font-mono mt-1.5 flex items-center justify-between text-zinc-400">
                      {pendingCount > 0 ? (
                        <span className="text-pink-400 font-bold animate-pulse">● {pendingCount} Pending Approvals</span>
                      ) : (
                        <span className="text-emerald-400 font-semibold">● 100% Verified Members</span>
                      )}
                      <span className="text-zinc-500 group-hover:text-zinc-300">Send Points →</span>
                    </div>
                  </div>

                  {/* KPI 3: Messages Seen & Reply */}
                  <div
                    onClick={() => setActiveTab('messages')}
                    className="p-5 rounded-2xl bg-zinc-900/60 hover:bg-zinc-800/80 border border-cyan-500/30 transition-all cursor-pointer group shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono uppercase text-cyan-300 font-bold flex items-center gap-1.5">
                        <Mail className="w-4 h-4 text-cyan-400" />
                        <span>3. USER MESSAGES &amp; REPLIES</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold">
                        {userMessages.filter((m) => m.status === 'pending').length} Awaiting
                      </span>
                    </div>
                    <div className="text-3xl font-bold font-mono text-white mt-3 group-hover:text-cyan-400 transition-colors">
                      {userMessages.length} <span className="text-base font-normal text-zinc-400">Messages</span>
                    </div>
                    <div className="text-xs font-mono mt-1.5 flex items-center justify-between text-zinc-400">
                      <span className="text-emerald-400 font-semibold">
                        {userMessages.filter((m) => m.status === 'replied').length} Replied
                      </span>
                      <span className="text-zinc-500 group-hover:text-zinc-300">Reply Now →</span>
                    </div>
                  </div>
                </div>

                {/* =========================================================================
                    SUBJECT 1: SHOPPING & ORDERS MANAGEMENT (শপিং ও ফ্যান অর্ডার ট্র্যাকিং)
                   ========================================================================= */}
                <div className="p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                    <div>
                      <div className="inline-flex items-center gap-2 text-amber-400 text-xs font-mono uppercase tracking-wider mb-1 font-bold">
                        <ShoppingBag className="w-4 h-4" />
                        <span>SUBJECT 1: SHOPPING &amp; FAN MERCH ORDERS (শপিং ও অর্ডার ট্র্যাকিং)</span>
                      </div>
                      <h3 className="font-display text-xl font-bold text-white">
                        Customer Orders &amp; Delivery Tracking
                      </h3>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Monitor live fan orders, customer shipping addresses, payment methods, and update delivery statuses in real-time.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-xl p-1 text-xs">
                        {(['all', 'pending', 'shipped', 'delivered'] as const).map((filter) => (
                          <button
                            key={filter}
                            onClick={() => setOverviewOrderFilter(filter)}
                            className={`px-3 py-1 rounded-lg capitalize transition-colors cursor-pointer ${
                              overviewOrderFilter === filter
                                ? 'bg-amber-400 text-black font-bold'
                                : 'text-zinc-400 hover:text-white'
                            }`}
                          >
                            {filter}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => setActiveTab('shop')}
                        className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-300 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span>Full Shop</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Orders Cards Grid */}
                  {(() => {
                    const filteredOrders =
                      overviewOrderFilter === 'all'
                        ? orders
                        : orders.filter((o) => o.status === overviewOrderFilter);

                    if (filteredOrders.length === 0) {
                      return (
                        <div className="p-8 rounded-2xl bg-zinc-950 border border-zinc-800 text-center text-xs text-zinc-500">
                          No orders found matching the filter "{overviewOrderFilter}".
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-3 font-mono text-xs">
                        {filteredOrders.map((order) => (
                          <div
                            key={order.id}
                            className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3 hover:border-zinc-700 transition-all shadow-md"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-2.5">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-white text-sm">Order #{order.id}</span>
                                  <span className="text-[11px] text-zinc-500 font-sans">
                                    {new Date(order.orderDate).toLocaleDateString()}
                                  </span>
                                </div>
                                <span className="font-sans font-semibold text-zinc-200 text-xs mt-0.5 block">
                                  {order.productTitle} (Qty: {order.quantity}{order.size ? ` · Size: ${order.size}` : ''})
                                </span>
                              </div>

                              <div className="flex items-center gap-3">
                                <span className="text-base font-bold text-amber-300">৳ {order.totalAmount} BDT</span>
                                <span
                                  className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold ${
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

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-zinc-400 font-sans text-xs">
                              <div>
                                <span className="text-[10px] font-mono uppercase text-zinc-500 block">Customer</span>
                                <span className="text-zinc-200 font-medium">{order.customerName}</span>
                                <span className="text-zinc-400 block text-[11px]">{order.customerPhone}</span>
                              </div>

                              <div>
                                <span className="text-[10px] font-mono uppercase text-zinc-500 block">Delivery Address</span>
                                <span className="text-zinc-200 block truncate">{order.deliveryAddress}</span>
                                <span className="text-[11px] text-amber-300/90 font-mono">Pay: {order.paymentMethod}</span>
                              </div>

                              <div className="flex flex-col sm:items-end justify-center">
                                <span className="text-[10px] font-mono uppercase text-zinc-500 mb-1">Update Status:</span>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {(['pending', 'confirmed', 'shipped', 'delivered'] as const).map((st) => (
                                    <button
                                      key={st}
                                      onClick={() => updateOrderStatus(order.id, st)}
                                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase transition-colors cursor-pointer ${
                                        order.status === st
                                          ? 'bg-amber-400 text-black font-bold'
                                          : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800'
                                      }`}
                                    >
                                      {st}
                                    </button>
                                  ))}
                                  <button
                                    onClick={() => deleteOrder(order.id)}
                                    title="Delete Order"
                                    className="p-1 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-500/30 cursor-pointer ml-1"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                {/* =========================================================================
                    SUBJECT 2: FAN ACCOUNTS & SEND POINTS BONUS TOOL (পয়েন্ট বোনাস গিফট)
                   ========================================================================= */}
                <div className="p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                    <div>
                      <div className="inline-flex items-center gap-2 text-pink-400 text-xs font-mono uppercase tracking-wider mb-1 font-bold">
                        <Gift className="w-4 h-4 text-amber-400" />
                        <span>SUBJECT 2: FAN ACCOUNTS &amp; SEND POINTS BONUS (পয়েন্ট বোনাস গিফট টুল)</span>
                      </div>
                      <h3 className="font-display text-xl font-bold text-white">
                        Admin Point Bonus Generator &amp; Fan Registrations
                      </h3>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        অ্যাডমিন অ্যাকাউন্ট থেকে যেকোনো সময় যেকোনো ইউজারকে পয়েন্ট বোনাস পাঠাতে পারবেন। ইউজার সাথে সাথে অভিনন্দন ও গিফট মেসেজ পাবে।
                      </p>
                    </div>

                    <button
                      onClick={() => setActiveTab('users')}
                      className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-pink-300 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                    >
                      <span>All {users.length} Users</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Bonus Send Alert Banner */}
                  {bonusSendAlert && (
                    <div
                      className={`p-4 rounded-2xl border text-xs flex items-center gap-2.5 animate-fade-in ${
                        bonusSendAlert.type === 'success'
                          ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                          : 'bg-red-950/60 border-red-500/50 text-red-200'
                      }`}
                    >
                      {bonusSendAlert.type === 'success' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                      )}
                      <span className="font-medium">{bonusSendAlert.message}</span>
                    </div>
                  )}

                  {/* Two Sub-Columns: Send Bonus Tool & User List / Transactions */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* Left: Send Points Bonus Form Card */}
                    <div className="lg:col-span-7 bg-gradient-to-br from-zinc-950 via-[#180f12] to-black border border-amber-500/40 rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-40 h-40 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
                      
                      <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                          <Sparkles className="w-4 h-4 text-amber-400" />
                          <span>Send Points Bonus to Fan Member</span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-mono font-bold">
                          INSTANT DELIVERY
                        </span>
                      </div>

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!selectedBonusUserId) {
                            setBonusSendAlert({
                              type: 'error',
                              message: 'দয়া করে একজন ফ্যান মেম্বার নির্বাচন করুন (Please select a fan member).',
                            });
                            return;
                          }
                          if (!bonusPointsInput || bonusPointsInput <= 0) {
                            setBonusSendAlert({
                              type: 'error',
                              message: 'সঠিক পয়েন্টের পরিমাণ দিন (Enter a valid points amount).',
                            });
                            return;
                          }
                          const res = sendBonusPoints(selectedBonusUserId, bonusPointsInput, bonusGiftNoteInput);
                          if (res.success) {
                            setBonusSendAlert({ type: 'success', message: res.message });
                            setBonusGiftNoteInput('');
                            setTimeout(() => setBonusSendAlert(null), 6000);
                          } else {
                            setBonusSendAlert({ type: 'error', message: res.message });
                          }
                        }}
                        className="space-y-4 relative z-10"
                      >
                        {/* User Select */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                            <span>Select Target User Account (ইউজার সিলেক্ট করুন)</span>
                            <span className="text-[11px] text-zinc-400 font-normal">
                              {users.filter((u) => u.status === 'approved').length} Active Fans
                            </span>
                          </label>
                          <select
                            value={selectedBonusUserId}
                            onChange={(e) => setSelectedBonusUserId(e.target.value)}
                            required
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 font-sans"
                          >
                            <option value="">-- Choose User / ফ্যান মেম্বার নির্বাচন করুন --</option>
                            {users.map((u) => (
                              <option key={u.id} value={u.id}>
                                {u.name} ({u.email}) · Current: {u.points || 0} pts [{u.role.toUpperCase()}]
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Points Amount with Preset Buttons */}
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                            <span>Bonus Points Amount (পয়েন্টের পরিমাণ)</span>
                            <span className="text-[11px] font-mono text-amber-300 font-bold">
                              {bonusPointsInput} Points to Transfer
                            </span>
                          </label>

                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={10}
                              max={100000}
                              step={10}
                              required
                              value={bonusPointsInput}
                              onChange={(e) => setBonusPointsInput(Number(e.target.value))}
                              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:border-amber-400"
                            />
                          </div>

                          {/* Quick Preset Buttons */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] text-zinc-400 font-mono">Quick Presets:</span>
                            {[50, 100, 250, 500, 1000].map((preset) => (
                              <button
                                key={preset}
                                type="button"
                                onClick={() => setBonusPointsInput(preset)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                                  bonusPointsInput === preset
                                    ? 'bg-amber-400 text-black'
                                    : 'bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-zinc-800'
                                }`}
                              >
                                +{preset} pts
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Custom Gift Note */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-zinc-300">
                            Congratulatory Gift Note (অভিনন্দন ও বিশেষ বার্তা)
                          </label>
                          <textarea
                            rows={2}
                            placeholder="e.g. Congratulations! Gift bonus for your ongoing love and support for Rasel Babu."
                            value={bonusGiftNoteInput}
                            onChange={(e) => setBonusGiftNoteInput(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 leading-relaxed font-sans"
                          />
                          <p className="text-[10px] text-zinc-400 leading-normal">
                            * ইউজার তৎক্ষণাৎ একটি অফিসিয়াল নোটিফিকেশন মেসেজ পাবে: "🎉 Congratulations! You received {bonusPointsInput} Gift Points".
                          </p>
                        </div>

                        {/* Submit Button */}
                        <button
                          type="submit"
                          className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 text-black font-bold text-xs uppercase tracking-wider transition-all shadow-xl shadow-amber-400/25 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Gift className="w-4 h-4 text-black" />
                          <span>Send Points Bonus &amp; Notify Fan (বোনাস পাঠান)</span>
                        </button>
                      </form>
                    </div>

                    {/* Right: Pending Approvals & Recent Points Dispatched */}
                    <div className="lg:col-span-5 space-y-4">
                      
                      {/* Pending Approvals */}
                      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-3">
                        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            <span>Pending Fan Approvals ({pendingCount})</span>
                          </span>
                          {pendingCount > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 text-[10px] font-mono font-bold">
                              Needs Action
                            </span>
                          )}
                        </div>

                        {pendingCount > 0 ? (
                          <div className="space-y-2.5">
                            {users
                              .filter((u) => u.status === 'pending')
                              .map((u) => (
                                <div
                                  key={u.id}
                                  className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2 text-xs"
                                >
                                  <div>
                                    <span className="font-bold text-white block">{u.name}</span>
                                    <span className="text-[11px] text-zinc-400 block">{u.email}</span>
                                  </div>
                                  <div className="flex items-center gap-2 pt-1">
                                    <button
                                      onClick={() => approveUser(u.id)}
                                      className="flex-1 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-colors cursor-pointer"
                                    >
                                      Approve Fan
                                    </button>
                                    <button
                                      onClick={() => rejectUser(u.id)}
                                      className="px-3 py-1 rounded-lg bg-red-950/40 hover:bg-red-900 text-red-400 text-[11px] border border-red-500/30 transition-colors cursor-pointer"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/50 text-center text-xs text-zinc-400">
                            All user registrations are currently approved and verified.
                          </div>
                        )}
                      </div>

                      {/* Recent Bonus Transactions Log */}
                      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-3">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5 border-b border-zinc-800/80 pb-2.5">
                          <Gift className="w-3.5 h-3.5 text-amber-400" />
                          <span>Recent Bonus Gifts Sent (সম্প্রতি প্রেরিত বোনাস)</span>
                        </span>

                        {pointTransactions.length > 0 ? (
                          <div className="space-y-2 font-mono text-xs max-h-56 overflow-y-auto">
                            {pointTransactions.slice(0, 4).map((tx) => {
                              const recipient = users.find((u) => u.id === tx.userId);
                              return (
                                <div
                                  key={tx.id}
                                  className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between"
                                >
                                  <div className="min-w-0 pr-2">
                                    <span className="font-bold text-white truncate block text-[11px]">
                                      {recipient?.name || 'Fan Member'}
                                    </span>
                                    <span className="text-[10px] text-zinc-400 truncate block font-sans">
                                      {tx.note || 'Bonus points gift'}
                                    </span>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <span className="text-emerald-400 font-bold block text-xs">+{tx.amount} pts</span>
                                    <span className="text-[9px] text-zinc-500 font-sans">
                                      {new Date(tx.timestamp).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-xs text-zinc-500 italic py-2 text-center">
                            No point bonuses dispatched yet. Use the tool beside to send points anytime!
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* =========================================================================
                    SUBJECT 3: USER MESSAGES & OFFICIAL REPLIES (FAN MESSAGES & REPLIES পেজে লিংক)
                   ========================================================================= */}
                <div className="p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-2 text-cyan-400 text-xs font-mono uppercase tracking-wider font-bold">
                        <Mail className="w-4 h-4" />
                        <span>SUBJECT 3: USER MESSAGES SEEN &amp; DIRECT REPLY</span>
                      </div>
                      <h3 className="font-display text-xl font-bold text-white">
                        Fan Messages &amp; Replies Desk ({userMessages.length} messages)
                      </h3>
                      <p className="text-xs text-zinc-400 max-w-xl">
                        {userMessages.filter((m) => m.status === 'pending').length > 0 ? (
                          <span className="text-amber-400 font-semibold">
                            ⚠️ {userMessages.filter((m) => m.status === 'pending').length} টি নতুন ফ্যান মেসেজের উত্তর দেওয়া বাকি আছে।
                          </span>
                        ) : (
                          <span className="text-emerald-400 font-semibold">
                            ✓ সকল ফ্যান মেসেজের সিন ও উত্তর সম্পন্ন হয়েছে।
                          </span>
                        )}
                        {' '}সকল মেসেজ পড়া, রিপ্লাই পাঠানো এবং রিপ্লাই মুছে ফেলার জন্য পাশের "Fan Messages &amp; Replies" পেজ ব্যবহার করুন।
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab('messages')}
                      className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20 cursor-pointer shrink-0"
                    >
                      <Send className="w-3.5 h-3.5 text-black" />
                      <span>Go to Fan Messages &amp; Replies (মেসেজ পেজে যান) →</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

        {/* TAB: USERS, 1-YEAR POINTS GRAPH & APPROVALS */}
        {activeTab === 'users' && (
          <div className="space-y-8 animate-fade-in">
            {/* 1-YEAR USER POINTS GRAPH, ANNUAL MEGA GIFT AWARD & RANKING TABLE */}
            <YearlyPointsGraph
              isAdminView={true}
              onOpenBonusModal={(uid) => {
                setSelectedBonusUserId(uid);
                window.scrollTo({ top: 400, behavior: 'smooth' });
              }}
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase text-zinc-400">Filter Status:</span>

                {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setUserStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs capitalize transition-colors ${
                      userStatusFilter === st
                        ? 'bg-zinc-700 text-white font-semibold'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {st} {st === 'pending' && pendingCount > 0 ? `(${pendingCount})` : ''}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search user by name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900/40">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950/80 text-zinc-400 font-mono uppercase border-b border-zinc-800">
                  <tr>
                    <th className="p-4">User / Email</th>
                    <th className="p-4">Registration Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Role</th>
                    <th className="p-4 text-right">Approval Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="p-4">
                        <div className="font-semibold text-white">{u.name}</div>
                        <div className="text-zinc-400 font-mono text-[11px]">{u.email}</div>
                        {u.bio && <div className="text-zinc-500 text-[11px] italic mt-0.5 max-w-xs truncate">{u.bio}</div>}
                      </td>
                      <td className="p-4 font-mono text-zinc-400">
                        {new Date(u.registeredAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider ${
                            u.status === 'approved'
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50'
                              : u.status === 'pending'
                              ? 'bg-amber-950/60 text-amber-400 border border-amber-800/50 animate-pulse'
                              : 'bg-red-950/60 text-red-400 border border-red-800/50'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="p-4">
                        {isSuperAdmin ? (
                          <select
                            value={u.role}
                            onChange={(e) => updateUserRole(u.id, e.target.value as UserRole)}
                            className="bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs text-amber-400 focus:outline-none"
                          >
                            <option value="user">User / Fan</option>
                            <option value="moderator">Moderator</option>
                            <option value="manager">Manager</option>
                            <option value="admin">Admin</option>
                          </select>
                        ) : (
                          <span className="font-mono text-zinc-300 capitalize">{u.role}</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={async () => {
                              setResetModalData({ open: true, user: u, loading: true });
                              const res = await initiatePasswordReset(u.email, u.id);
                              if (res.success) {
                                setResetModalData({
                                  open: true,
                                  user: u,
                                  resetLink: res.resetLink,
                                  expiresAt: res.expiresAt,
                                  loading: false,
                                  success: res.message,
                                });
                              } else {
                                setResetModalData({
                                  open: true,
                                  user: u,
                                  loading: false,
                                  error: res.message,
                                });
                              }
                            }}
                            className="px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-medium text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                            title="Generate & Dispatch Secure Password Reset Email Link"
                          >
                            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                            <span>Reset Password</span>
                          </button>

                          {u.status === 'pending' && (
                            <>
                              <button
                                onClick={() => approveUser(u.id)}
                                className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                                title="Approve Registration"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => rejectUser(u.id, 'Did not satisfy verification criteria')}
                                className="px-2.5 py-1 rounded bg-red-950 hover:bg-red-900 border border-red-800/60 text-red-300 font-medium text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                                title="Reject Registration"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Reject</span>
                              </button>
                            </>
                          )}
                          {u.status === 'rejected' && (
                            <button
                              onClick={() => approveUser(u.id)}
                              className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px]"
                            >
                              Re-Approve
                            </button>
                          )}
                          {u.status === 'approved' &&
                            u.email !== 'raselbabuwebsiteshop@gmail.com' &&
                            u.email !== 'fkbabu01@gmail.com' && (
                            <button
                              onClick={() => rejectUser(u.id, 'Access revoked by administration')}
                              className="text-[11px] text-zinc-500 hover:text-red-400"
                            >
                              Revoke
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 04: PHOTO GALLERY & FILM REELS */}
        {/* TAB 05: GALLERY & VIDEO MANAGEMENT (ফটো ও ভিডিও ম্যানেজমেন্ট) */}
        {(activeTab === 'gallery_video' || activeTab === 'photos' || activeTab === 'videos') && (
          <div className="space-y-6 animate-fade-in">
            {/* Top Header & Sub-tab Switcher */}
            <div className="p-6 rounded-3xl bg-zinc-900/50 border border-zinc-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-1 max-w-2xl">
                <div className="inline-flex items-center gap-2 text-amber-400 text-xs font-mono uppercase tracking-wider font-bold">
                  <Film className="w-4 h-4" />
                  <span>OPTION 05: GALLERY &amp; VIDEO MANAGEMENT · ফটো ও ভিডিও কন্ট্রোল</span>
                </div>
                <h3 className="font-display text-2xl font-bold text-white">
                  Gallery Photos &amp; Video Releases Desk
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  গ্যালারি পেজের ফটো ও অ্যালবাম এবং ভিডিও পেজের ইউটিউব ভিডিও নতুন করে যুক্ত করুন, টাইটেল, লিংক বা ক্যাটেগরি এডিট করুন অথবা অপ্রয়োজনীয় কন্টেন্ট ডিলিট করুন।
                </p>
              </div>

              {/* Sub-tab pills */}
              <div className="flex items-center gap-2 p-1.5 bg-zinc-950 border border-zinc-800 rounded-2xl shrink-0">
                <button
                  type="button"
                  onClick={() => setGallerySubTab('photos')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    gallerySubTab === 'photos'
                      ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Photo Gallery ({photos.length} photos)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGallerySubTab('videos')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    gallerySubTab === 'videos'
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Youtube className="w-3.5 h-3.5" />
                  <span>YouTube Videos ({videos.length} videos)</span>
                </button>
              </div>
            </div>

            {/* =========================================================================
                SUB-SECTION 1: PHOTO GALLERY MANAGER (ফটো যোগ ও এডিট)
               ========================================================================= */}
            {gallerySubTab === 'photos' && (
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                  <div>
                    <h4 className="font-display text-xl font-bold text-white flex flex-wrap items-center gap-2">
                      <Camera className="w-5 h-5 text-amber-400" />
                      <span>Official Photo Gallery &amp; Albums ({photos.length} photos)</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 font-medium">
                        ● Live Sync: Central Storage Active
                      </span>
                    </h4>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Add concert moments, studio session captures, and red-carpet portraits. Updates are instantly live across all visitors, devices, and browsers.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => reloadPhotos()}
                      className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-zinc-700"
                      title="Sync with central server database"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${photosLoading ? 'animate-spin' : ''}`} />
                      <span>{photosLoading ? 'Syncing...' : 'Sync Server'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddPhoto(!showAddPhoto)}
                      className="px-4 py-2 rounded-xl bg-amber-400 text-black font-bold text-xs flex items-center gap-2 hover:bg-amber-300 transition-all cursor-pointer shadow-md shadow-amber-400/20"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{showAddPhoto ? 'Close Form' : 'Add New Photo (নতুন ফটো যোগ করুন)'}</span>
                    </button>
                  </div>
                </div>

                {photoNotice && (
                  <div className="p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-200 text-xs flex items-center justify-between gap-3 shadow-lg animate-fade-in">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="font-medium">{photoNotice}</span>
                    </div>
                    <button type="button" onClick={() => setPhotoNotice(null)} className="text-emerald-400 hover:text-white cursor-pointer">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Edit Photo Modal */}
                {editingPhotoItem && (
                  <form
                    onSubmit={handleSaveEditPhoto}
                    className="p-5 bg-zinc-950 rounded-2xl border-2 border-amber-500/50 space-y-4 shadow-2xl animate-fade-in"
                  >
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Edit className="w-4 h-4 text-amber-400" />
                        <span>Edit Gallery Photo (ফটো তথ্য পরিবর্তন করুন)</span>
                      </h4>
                      <button
                        type="button"
                        onClick={() => setEditingPhotoItem(null)}
                        className="text-zinc-500 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] text-zinc-400">Photo Title (ছবির শিরোনাম) *</label>
                        <input
                          type="text"
                          required
                          value={photoEditTitle}
                          onChange={(e) => setPhotoEditTitle(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-zinc-400">Category (ক্যাটেগরি) *</label>
                        <select
                          value={photoEditCategory}
                          onChange={(e) => setPhotoEditCategory(e.target.value as any)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-amber-300 focus:outline-none focus:border-amber-400"
                        >
                          <option value="concert">Concert & Live Stage (কনসার্ট)</option>
                          <option value="studio">Recording Studio (রেকর্ডিং স্টুডিও)</option>
                          <option value="portrait">Portrait & Red Carpet (পোর্ট্রেট)</option>
                          <option value="cultural">Cultural & Heritage (সাংস্কৃতিক)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] text-zinc-400">Photo Image (ছবির লিংক বা ডিভাইস থেকে আপলোড) *</label>
                          <label className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-semibold cursor-pointer border border-zinc-700 flex items-center gap-1.5 transition-all">
                            <Upload className="w-3 h-3 text-amber-400" />
                            <span>Upload Device File</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const compressed = await compressImageFile(file, 1400, 0.82);
                                  if (compressed) setPhotoEditImageUrl(compressed);
                                }
                              }}
                              className="hidden"
                            />
                          </label>
                        </div>
                        <input
                          type="text"
                          required
                          value={photoEditImageUrl}
                          onChange={(e) => setPhotoEditImageUrl(e.target.value)}
                          placeholder="https://... or upload photo from device"
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-zinc-400">Location (লোকেশন)</label>
                        <input
                          type="text"
                          value={photoEditLocation}
                          onChange={(e) => setPhotoEditLocation(e.target.value)}
                          placeholder="e.g. Dhaka Army Stadium, Kurigram"
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>

                    {photoEditImageUrl && (
                      <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center gap-4">
                        <img
                          src={photoEditImageUrl}
                          alt="Preview"
                          className="w-16 h-16 rounded-lg object-cover border border-amber-400/40"
                        />
                        <span className="text-xs text-zinc-400">Live preview of selected photo image.</span>
                      </div>
                    )}

                    <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                      <button
                        type="button"
                        onClick={() => setEditingPhotoItem(null)}
                        className="px-4 py-2 rounded-xl bg-zinc-900 text-zinc-400 text-xs hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-amber-400 text-black font-bold text-xs hover:bg-amber-300"
                      >
                        Save Photo Changes (সংরক্ষণ করুন)
                      </button>
                    </div>
                  </form>
                )}

                {/* Add Photo Form */}
                {showAddPhoto && (
                  <form onSubmit={handleCreatePhoto} className="p-5 bg-zinc-950 rounded-2xl border border-amber-500/40 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                      <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                        <Plus className="w-4 h-4 text-amber-400" />
                        <span>Add New Photo to Official Gallery (নতুন ছবি যোগ করুন)</span>
                      </h4>
                      <button type="button" onClick={() => setShowAddPhoto(false)} className="text-zinc-500 hover:text-white">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        required
                        placeholder="Photo Title (e.g. Acoustic Symphony Live 2026)"
                        value={newPhotoData.title}
                        onChange={(e) => setNewPhotoData({ ...newPhotoData, title: e.target.value })}
                        className="bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-white"
                      />
                      <select
                        value={newPhotoData.category}
                        onChange={(e) => setNewPhotoData({ ...newPhotoData, category: e.target.value as any })}
                        className="bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-amber-300"
                      >
                        <option value="concert">Concert & Live Stage</option>
                        <option value="studio">Recording Studio</option>
                        <option value="portrait">Portrait & Red Carpet</option>
                        <option value="cultural">Cultural & Heritage</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <label className="px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium cursor-pointer border border-zinc-700 flex items-center gap-2">
                          <Upload className="w-3.5 h-3.5 text-amber-400" />
                          <span>Upload Image File from Device</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const compressed = await compressImageFile(file, 1400, 0.82);
                                if (compressed) {
                                  setNewPhotoData((prev) => ({ ...prev, imageUrl: compressed }));
                                }
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                        <span className="text-[11px] text-zinc-400 font-mono">or paste direct image URL below:</span>
                      </div>

                      <input
                        type="text"
                        required
                        placeholder="https://... or upload file"
                        value={newPhotoData.imageUrl}
                        onChange={(e) => setNewPhotoData({ ...newPhotoData, imageUrl: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-white font-mono"
                      />
                    </div>

                    <textarea
                      rows={2}
                      placeholder="Caption & story about this moment..."
                      value={newPhotoData.caption}
                      onChange={(e) => setNewPhotoData({ ...newPhotoData, caption: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-white"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder="Location (e.g. Army Stadium, Dhaka)"
                        value={newPhotoData.location}
                        onChange={(e) => setNewPhotoData({ ...newPhotoData, location: e.target.value })}
                        className="bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-white"
                      />
                      <input
                        type="text"
                        placeholder="Photographer credit"
                        value={newPhotoData.photographer}
                        onChange={(e) => setNewPhotoData({ ...newPhotoData, photographer: e.target.value })}
                        className="bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-white"
                      />
                      <input
                        type="text"
                        placeholder="Tags (comma-separated)"
                        value={newPhotoData.tags}
                        onChange={(e) => setNewPhotoData({ ...newPhotoData, tags: e.target.value })}
                        className="bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-white"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                      <button
                        type="button"
                        onClick={() => setShowAddPhoto(false)}
                        className="px-4 py-2 rounded-xl bg-zinc-900 text-zinc-400 text-xs hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold rounded-xl text-xs hover:from-amber-300"
                      >
                        Publish Photo to Gallery
                      </button>
                    </div>
                  </form>
                )}

                {/* Photos Grid with Edit and Delete */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {photos.map((p) => (
                    <div key={p.id} className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 group hover:border-zinc-700 transition-all shadow-md">
                      <div className="aspect-[4/3] overflow-hidden bg-black relative">
                        <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-black/80 text-amber-400 border border-amber-400/30">
                          {p.category}
                        </span>
                      </div>
                      <div className="p-3">
                        <p className="text-xs font-semibold text-white truncate">{p.title}</p>
                        <p className="text-[10px] text-zinc-400 mt-0.5 truncate">{p.location || 'Official Archive'}</p>
                        <div className="flex items-center justify-between pt-2 mt-2 border-t border-zinc-800/80">
                          <button
                            type="button"
                            onClick={() => handleOpenEditPhoto(p)}
                            className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                            title="Edit photo details"
                          >
                            <Edit className="w-3 h-3 text-amber-400" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteConfirmModal({
                                isOpen: true,
                                title: 'Delete Gallery Photo',
                                titleBn: 'গ্যালারি ফটো ডিলিট নিশ্চিতকরণ',
                                itemName: p.title,
                                message: 'আপনি কি নিশ্চিত যে গ্যালারি থেকে এই ফটোটি স্থায়ীভাবে ডিলিট করতে চান?',
                                onConfirm: async () => {
                                  const res = await deletePhoto(p.id);
                                  if (res && res.success) {
                                    setPhotoNotice(`✅ Photo "${p.title}" deleted and updated centrally for all visitors.`);
                                    setTimeout(() => setPhotoNotice(null), 4000);
                                  } else {
                                    setPhotoNotice(`❌ ফটো ডিলিট ব্যর্থ হয়েছে: ${res?.message || 'Error deleting photo'}`);
                                  }
                                },
                              });
                            }}
                            className="p-1 rounded hover:bg-red-950 text-zinc-500 hover:text-red-400 cursor-pointer"
                            title="Delete photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* =========================================================================
                SUB-SECTION 2: YOUTUBE VIDEOS MANAGER (ভিডিও যোগ ও এডিট)
               ========================================================================= */}
            {gallerySubTab === 'videos' && (
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                  <div>
                    <h4 className="font-display text-xl font-bold text-white flex flex-wrap items-center gap-2">
                      <Youtube className="w-5 h-5 text-red-500" />
                      <span>Official YouTube Releases &amp; Video Manager ({videos.length} videos)</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 font-medium">
                        ● Live Sync: Central Storage Active
                      </span>
                    </h4>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Add and edit YouTube video releases. Changes are immediately embedded live on the /videos page across all devices.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => reloadVideos()}
                      className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-zinc-700"
                      title="Sync with central server database"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-red-400 ${videosLoading ? 'animate-spin' : ''}`} />
                      <span>{videosLoading ? 'Syncing...' : 'Sync Server'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddVideoModal(true)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 text-white font-bold text-xs flex items-center gap-2 hover:from-red-500 hover:to-amber-400 cursor-pointer shadow-md"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add YouTube Video (ভিডিও যোগ করুন)</span>
                    </button>
                  </div>
                </div>

                {videoNotice && (
                  <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{videoNotice}</span>
                  </div>
                )}

                {/* Edit Video Modal */}
                {editingVideoItem && (
                  <form
                    onSubmit={handleSaveEditVideo}
                    className="p-5 bg-zinc-950 rounded-2xl border-2 border-red-500/40 space-y-4 shadow-xl"
                  >
                    <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                      <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                        <Edit className="w-4 h-4 text-amber-400" />
                        <span>Edit YouTube Video Release</span>
                      </h4>
                      <button
                        type="button"
                        onClick={() => setEditingVideoItem(null)}
                        className="text-zinc-500 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] text-zinc-400">Video Title</label>
                        <input
                          type="text"
                          required
                          value={videoEditTitle}
                          onChange={(e) => setVideoEditTitle(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-zinc-400">Category</label>
                        <select
                          value={videoEditCategory}
                          onChange={(e) => setVideoEditCategory(e.target.value as any)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                        >
                          <option value="Music Video">Music Video</option>
                          <option value="Live Performance">Live Performance</option>
                          <option value="Acoustic Session">Acoustic Session</option>
                          <option value="Behind The Scenes">Behind The Scenes</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-zinc-400">YouTube URL or ID</label>
                      <input
                        type="text"
                        required
                        value={videoEditUrl}
                        onChange={(e) => setVideoEditUrl(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-zinc-400">Description</label>
                      <textarea
                        rows={2}
                        value={videoEditDesc}
                        onChange={(e) => setVideoEditDesc(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800/80">
                      <button
                        type="button"
                        onClick={() => setEditingVideoItem(null)}
                        className="px-4 py-2 rounded-lg bg-zinc-900 text-zinc-400 text-xs hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-lg bg-amber-400 text-black font-bold text-xs hover:bg-amber-300"
                      >
                        Save Video Changes
                      </button>
                    </div>
                  </form>
                )}

                {/* Add Video Modal Form */}
                {showAddVideoModal && (
                  <form onSubmit={handleCreateVideo} className="p-5 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-4">
                    <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                      <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                        <Plus className="w-4 h-4 text-amber-400" />
                        <span>Add New YouTube Video Release</span>
                      </h4>
                      <button
                        type="button"
                        onClick={() => setShowAddVideoModal(false)}
                        className="text-zinc-500 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] text-zinc-400">Video Title</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Tomar Chokhe - Official Music Video"
                          value={newVideoTitle}
                          onChange={(e) => setNewVideoTitle(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] text-zinc-400">Category</label>
                        <select
                          value={newVideoCategory}
                          onChange={(e) => setNewVideoCategory(e.target.value as any)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                        >
                          <option value="Music Video">Music Video</option>
                          <option value="Live Performance">Live Performance</option>
                          <option value="Acoustic Session">Acoustic Session</option>
                          <option value="Behind The Scenes">Behind The Scenes</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-zinc-400">
                        YouTube URL or Video ID
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="https://www.youtube.com/watch?v=kXYiU_JCYtU"
                        value={newVideoUrl}
                        onChange={(e) => setNewVideoUrl(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-zinc-400">Description</label>
                      <textarea
                        rows={2}
                        placeholder="Song details, lyricist, composer..."
                        value={newVideoDesc}
                        onChange={(e) => setNewVideoDesc(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800/80">
                      <button
                        type="button"
                        onClick={() => setShowAddVideoModal(false)}
                        className="px-4 py-2 rounded-lg bg-zinc-900 text-zinc-400 text-xs hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-lg bg-gradient-to-r from-red-600 to-amber-500 text-white font-bold text-xs hover:from-red-500"
                      >
                        Publish Video Release
                      </button>
                    </div>
                  </form>
                )}

                {/* Videos Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {videos.map((vid) => {
                    const ytId = extractYouTubeId(vid.youtubeId || '');
                    return (
                      <div
                        key={vid.id}
                        className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden space-y-3 hover:border-zinc-700 transition-all shadow-md"
                      >
                        <div className="relative aspect-video bg-black overflow-hidden">
                          {ytId ? (
                            <iframe
                              src={`https://www.youtube-nocookie.com/embed/${ytId}?rel=0`}
                              title={vid.title}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              className="w-full h-full border-0"
                              allowFullScreen
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-zinc-500 font-mono">
                              No preview available
                            </div>
                          )}
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-mono bg-red-600 text-white font-bold">
                            {vid.category}
                          </span>
                        </div>

                        <div className="p-4 pt-1 space-y-2">
                          <h4 className="text-xs font-bold text-white line-clamp-1">{vid.title}</h4>
                          <p className="text-[11px] text-zinc-400 line-clamp-2">{vid.description}</p>
                          <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                            <button
                              type="button"
                              onClick={() => handleOpenEditVideo(vid)}
                              className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs flex items-center gap-1 cursor-pointer"
                            >
                              <Edit className="w-3 h-3 text-amber-400" />
                              <span>Edit Video</span>
                            </button>
                            <div className="flex items-center gap-2">
                              {ytId && (
                                <a
                                  href={`https://www.youtube.com/watch?v=${ytId}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 text-zinc-400 hover:text-red-400"
                                  title="Watch on YouTube"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setDeleteConfirmModal({
                                    isOpen: true,
                                    title: 'Delete YouTube Video',
                                    titleBn: 'ভিডিও ডিলিট নিশ্চিতকরণ',
                                    itemName: vid.title,
                                    message: 'আপনি কি নিশ্চিত যে ভিডিও তালিকা থেকে এই ভিডিওটি ডিলিট করতে চান?',
                                    onConfirm: async () => {
                                      const res = await deleteVideo(vid.id);
                                      if (res && res.success) {
                                        setVideoNotice(`✅ Video "${vid.title}" deleted and removed centrally for all visitors.`);
                                        setTimeout(() => setVideoNotice(null), 4000);
                                      } else {
                                        setVideoNotice(`❌ ভিডিও ডিলিট ব্যর্থ হয়েছে: ${res?.message || 'Error deleting video'}`);
                                      }
                                    },
                                  });
                                }}
                                className="p-1 text-zinc-500 hover:text-red-400 cursor-pointer"
                                title="Delete video"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}


        {/* TAB 10: ARTICLES & TOUR EVENTS */}
        {activeTab === 'news' && (
          <div className="space-y-6">
            {/* News & Announcements CRUD */}
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-pink-400" />
                    <span>Articles & Press Releases ({news.length} total)</span>
                  </h3>
                  <p className="text-xs text-zinc-400">Publish news, announcements, and tour diaries.</p>
                </div>
                <button
                  onClick={() => setShowAddNews(!showAddNews)}
                  className="px-3.5 py-1.5 rounded-lg bg-pink-600 text-white font-semibold text-xs flex items-center gap-1.5 hover:bg-pink-500 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{showAddNews ? 'Cancel' : 'Post Article'}</span>
                </button>
              </div>

              {showAddNews && (
                <form onSubmit={handleCreateNews} className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-3">
                  <input
                    type="text"
                    required
                    placeholder="Article Headline"
                    value={newNewsData.title}
                    onChange={(e) => setNewNewsData({ ...newNewsData, title: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                  />
                  <input
                    type="text"
                    placeholder="Summary"
                    value={newNewsData.summary}
                    onChange={(e) => setNewNewsData({ ...newNewsData, summary: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                  />
                  <textarea
                    rows={4}
                    required
                    placeholder="Full article content..."
                    value={newNewsData.content}
                    onChange={(e) => setNewNewsData({ ...newNewsData, content: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-pink-600 text-white font-semibold rounded-lg text-xs"
                  >
                    Publish Article
                  </button>
                </form>
              )}

              <div className="space-y-2">
                {news.map((item) => (
                  <div key={item.id} className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-white">{item.title}</p>
                      <p className="text-zinc-500 font-mono text-[10px]">{item.publishDate} · {item.category}</p>
                    </div>
                    <button
                      onClick={() => deleteNewsArticle(item.id)}
                      className="p-1 text-zinc-500 hover:text-red-400"
                      title="Delete article"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 03: OFFICIAL VIDEOS & YOUTUBE LINK MANAGER */}

        {/* TAB 02: FAN ORDERS MANAGEMENT */}
        {activeTab === 'fan_orders' && (
          <div className="space-y-8 animate-fade-in">
            {shopNotice && (
              <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{shopNotice}</span>
              </div>
            )}

            {/* FAN STORE ORDERS */}
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
                    <Truck className="w-5 h-5 text-cyan-400" />
                    <span>Fan Orders &amp; Delivery Management ({orders.length} total)</span>
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Review orders placed by fans from the Official Store, confirm payments (bKash/Nagad/Cash), and manage courier delivery statuses.
                  </p>
                </div>

                {/* Filter buttons */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setOrderFilterStatus(st)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-colors cursor-pointer ${
                        orderFilterStatus === st
                          ? 'bg-cyan-400 text-black font-semibold'
                          : 'bg-zinc-950 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Orders Table */}
              <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-zinc-900/80 text-[11px] font-mono text-zinc-400 uppercase tracking-wider border-b border-zinc-800">
                    <tr>
                      <th className="p-3.5">Order ID &amp; Date</th>
                      <th className="p-3.5">Customer &amp; Contact</th>
                      <th className="p-3.5">Delivery Address</th>
                      <th className="p-3.5">Item &amp; Qty (ক্লিক করে ভিউ)</th>
                      <th className="p-3.5">Total &amp; Payment</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/80 font-sans">
                    {orders
                      .filter((o) => orderFilterStatus === 'all' || o.status === orderFilterStatus)
                      .map((o) => {
                        const associatedProduct = products.find((p) => p.id === o.productId);
                        return (
                          <tr key={o.id} className="hover:bg-zinc-900/40 transition-colors">
                            <td className="p-3.5 font-mono text-zinc-400">
                              <span className="font-bold text-cyan-400 block">#{o.id.slice(-6).toUpperCase()}</span>
                              <span className="text-[10px] text-zinc-500">{new Date(o.orderDate).toLocaleDateString()}</span>
                            </td>

                            <td className="p-3.5">
                              <span className="font-semibold text-white block">{o.customerName}</span>
                              <span className="text-[11px] text-zinc-400 font-mono flex items-center gap-1 mt-0.5">
                                <Phone className="w-3 h-3 text-cyan-400" />
                                <a href={`tel:${o.customerPhone}`} className="hover:text-cyan-300">{o.customerPhone}</a>
                              </span>
                              {o.customerEmail && (
                                <span className="text-[10px] text-zinc-500 block truncate max-w-[140px]">{o.customerEmail}</span>
                              )}
                            </td>

                            <td className="p-3.5 max-w-[180px]">
                              <span className="text-zinc-300 text-xs block leading-snug truncate" title={o.deliveryAddress}>
                                {o.deliveryAddress}
                              </span>
                              {o.notes && (
                                <span className="text-[10px] text-zinc-500 italic block mt-0.5 truncate" title={o.notes}>
                                  Note: {o.notes}
                                </span>
                              )}
                            </td>

                            <td className="p-3.5">
                              <button
                                type="button"
                                onClick={() => {
                                  if (associatedProduct) openProductView(associatedProduct);
                                }}
                                className="text-left group/item cursor-pointer block"
                                title="Click to view product details & photos"
                              >
                                <span className="font-medium text-white group-hover/item:text-cyan-300 transition-colors block truncate max-w-[160px] underline decoration-zinc-700 hover:decoration-cyan-400">
                                  {o.productTitle}
                                </span>
                                <span className="text-[10px] text-cyan-400/90 hover:text-cyan-300 flex items-center gap-1 mt-0.5 font-mono">
                                  <Eye className="w-3 h-3" /> View Product
                                </span>
                              </button>
                              <span className="text-[11px] text-zinc-500 font-mono mt-0.5 block">Qty: {o.quantity} {o.size ? `· Size: ${o.size}` : ''}</span>
                            </td>

                            <td className="p-3.5 font-mono">
                              <span className="font-bold text-emerald-400 text-sm block">৳{o.totalAmount.toLocaleString()}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 inline-block mt-0.5">
                                {o.paymentMethod}
                              </span>
                            </td>

                            <td className="p-3.5">
                              <select
                                value={o.status}
                                onChange={(e) => updateOrderStatus(o.id, e.target.value as any)}
                                className={`bg-zinc-900 border rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none cursor-pointer ${
                                  o.status === 'delivered'
                                    ? 'border-emerald-500 text-emerald-300'
                                    : o.status === 'shipped'
                                    ? 'border-cyan-500 text-cyan-300'
                                    : o.status === 'confirmed'
                                    ? 'border-amber-500 text-amber-300'
                                    : o.status === 'cancelled'
                                    ? 'border-red-500 text-red-300'
                                    : 'border-zinc-700 text-zinc-300'
                                }`}
                              >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </td>

                            <td className="p-3.5 text-right">
                              <button
                                onClick={() => deleteOrder(o.id)}
                                className="p-1.5 rounded hover:bg-red-950 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                                title="Delete Order"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 03: SHOP & PRODUCT CATALOG MANAGEMENT (পণ্য দেখা ও নতুন পণ্য অ্যাড) */}
        {activeTab === 'shop' && (
          <div className="space-y-8 animate-fade-in">
            {shopNotice && (
              <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{shopNotice}</span>
              </div>
            )}

            {/* Header & Quick Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/60 p-6 rounded-2xl border border-amber-500/30 shadow-xl">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
                  Official Store &amp; Apparel Catalog
                </span>
                <h3 className="font-display text-2xl font-bold text-white flex items-center gap-2 mt-1">
                  <ShoppingBag className="w-6 h-6 text-amber-400" />
                  <span>Shop &amp; Products Management (সকল প্রোডাক্ট ও নতুন পণ্য অ্যাড)</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  এখান থেকে স্টোরের সকল প্রোডাক্ট দেখতে পারবেন, নতুন প্রোডাক্ট ও অতিরিক্ত ৩টি ছবি যুক্ত করতে পারবেন এবং ইন-স্টক স্ট্যাটাস পরিবর্তন করতে পারবেন।
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenAddProduct}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-400 to-amber-500 hover:from-amber-300 text-black font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-400/20 transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Product (নতুন প্রোডাক্ট যোগ করুন)</span>
              </button>
            </div>

            {/* KPI Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-[11px] font-mono uppercase text-zinc-400">Total Products</span>
                <div className="text-2xl font-bold font-mono text-white mt-1">{products.length}</div>
              </div>
              <div className="p-4 rounded-xl bg-zinc-950 border border-emerald-500/30">
                <span className="text-[11px] font-mono uppercase text-emerald-400">In Stock (স্টকে আছে)</span>
                <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                  {products.filter((p) => p.inStock).length}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-zinc-950 border border-red-500/30">
                <span className="text-[11px] font-mono uppercase text-red-400">Sold Out (স্টক শেষ)</span>
                <div className="text-2xl font-bold font-mono text-red-400 mt-1">
                  {products.filter((p) => !p.inStock).length}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-zinc-950 border border-amber-500/30">
                <span className="text-[11px] font-mono uppercase text-amber-400">Active Offers (ছাড়)</span>
                <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
                  {products.filter((p) => p.offerPrice && p.offerPrice > 0).length}
                </div>
              </div>
            </div>

            {/* Search and Category Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {[
                  { id: 'all', label: 'All Products' },
                  { id: 'dress', label: 'Dresses & Three-Piece' },
                  { id: 'merch', label: 'Merch' },
                  { id: 'vinyl', label: 'Vinyl & CD' },
                  { id: 'tickets', label: 'Passes' },
                  { id: 'digital', label: 'Digital' },
                  { id: 'gear', label: 'Gear' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setAdminShopCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                      adminShopCategory === cat.id
                        ? 'bg-amber-400 text-black font-semibold'
                        : 'bg-zinc-950 text-zinc-400 hover:text-white'
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
                  placeholder="Search products by title..."
                  value={adminShopSearch}
                  onChange={(e) => setAdminShopSearch(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products
                .filter((p) => {
                  const matchCat = adminShopCategory === 'all' || p.category === adminShopCategory;
                  const matchSearch =
                    (p.title || '').toLowerCase().includes(adminShopSearch.toLowerCase()) ||
                    (p.description || '').toLowerCase().includes(adminShopSearch.toLowerCase());
                  return matchCat && matchSearch;
                })
                .map((prod) => {
                  const hasOffer = prod.offerPrice && prod.offerPrice > 0 && prod.offerPrice < prod.price;
                  const discountPercent = hasOffer
                    ? Math.round(((prod.price - (prod.offerPrice as number)) / prod.price) * 100)
                    : 0;
                  const extraPhotosCount = prod.additionalImages?.filter((img) => img && img.trim().length > 0).length || 0;

                  return (
                    <div
                      key={prod.id}
                      className="rounded-2xl overflow-hidden bg-zinc-900/60 border border-zinc-800 hover:border-amber-500/40 transition-all flex flex-col justify-between shadow-xl group"
                    >
                      {/* Product Image & Badges */}
                      <div className="relative aspect-[4/3] bg-zinc-950 overflow-hidden">
                        <img
                          src={prod.imageUrl}
                          alt={prod.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                        {/* Category Badge */}
                        <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-black/80 backdrop-blur-md text-amber-300 border border-amber-500/40 text-[10px] font-mono uppercase tracking-wider font-semibold">
                          {prod.category}
                        </span>

                        {/* Extra Photos Count Badge */}
                        {extraPhotosCount > 0 && (
                          <span className="absolute top-9 left-3 px-2 py-0.5 rounded-full bg-cyan-950/80 backdrop-blur-md text-cyan-300 border border-cyan-500/40 text-[10px] font-mono flex items-center gap-1 shadow-md">
                            <Camera className="w-3 h-3 text-cyan-400" />
                            <span>+{extraPhotosCount} Extra Photos</span>
                          </span>
                        )}

                        {/* Discount Badge */}
                        {hasOffer && (
                          <span className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-red-600 to-pink-600 text-white font-extrabold text-[10px] uppercase tracking-wider shadow-md">
                            {discountPercent}% OFF
                          </span>
                        )}

                        {/* Stock Toggle Switch */}
                        <button
                          type="button"
                          onClick={() => updateProduct(prod.id, { inStock: !prod.inStock })}
                          className={`absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase tracking-wider backdrop-blur-md transition-colors cursor-pointer border ${
                            prod.inStock
                              ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900'
                              : 'bg-red-950/90 text-red-300 border-red-500/40 hover:bg-red-900'
                          }`}
                          title="Click to toggle stock status"
                        >
                          {prod.inStock ? '● In Stock' : '● Sold Out'}
                        </button>
                      </div>

                      {/* Product Info */}
                      <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                        <div className="space-y-1.5">
                          <div className="flex items-baseline justify-between">
                            <span className="text-[10px] font-mono uppercase text-zinc-500">
                              {prod.badge || 'Official Product'}
                            </span>
                            {hasOffer ? (
                              <div className="flex items-baseline gap-1.5 font-mono">
                                <span className="text-amber-300 font-bold text-base">
                                  ৳{prod.offerPrice?.toLocaleString()}
                                </span>
                                <del className="text-zinc-500 text-xs">
                                  ৳{prod.price.toLocaleString()}
                                </del>
                              </div>
                            ) : (
                              <span className="font-mono text-white font-bold text-base">
                                ৳{prod.price.toLocaleString()}
                              </span>
                            )}
                          </div>

                          <h4 className="font-semibold text-white text-sm line-clamp-1 group-hover:text-amber-300 transition-colors">
                            {prod.title}
                          </h4>

                          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                            {prod.description}
                          </p>

                          {/* Sizes */}
                          {prod.sizes && prod.sizes.length > 0 && (
                            <div className="flex items-center gap-1 flex-wrap pt-1">
                              <span className="text-[10px] font-mono text-zinc-500">Sizes:</span>
                              {prod.sizes.map((sz) => (
                                <span
                                  key={sz}
                                  className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] font-mono text-zinc-300"
                                >
                                  {sz}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Action Buttons: View, Edit, Delete */}
                        <div className="pt-3 border-t border-zinc-800/80 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openProductView(prod)}
                            className="flex-1 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            title="Preview all photos and customer view"
                          >
                            <Eye className="w-3.5 h-3.5 text-amber-400" />
                            <span>View (প্রিভিউ)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEditProduct(prod)}
                            className="px-3 py-2 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                            title="Edit product details & photos"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setDeleteConfirmModal({
                                isOpen: true,
                                title: 'Delete Product from Store',
                                titleBn: 'স্টোর থেকে প্রোডাক্ট ডিলিট নিশ্চিতকরণ',
                                itemName: prod.title,
                                message: 'আপনি কি নিশ্চিত যে এই প্রোডাক্টটি স্টোর ও ওয়েবসাইট থেকে স্থায়ীভাবে মুছে ফেলতে চান?',
                                onConfirm: () => {
                                  deleteProduct(prod.id);
                                  setShopNotice(`Product "${prod.title}" deleted.`);
                                  setTimeout(() => setShopNotice(null), 3000);
                                },
                              });
                            }}
                            className="p-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-500/30 text-xs transition-colors cursor-pointer"
                            title="Delete product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* TAB: WEBSITE HOMEPAGE & CMS CONTENT EDITOR */}
        {activeTab === 'homepage' && (
          <div className="space-y-8 animate-fade-in">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/60 p-6 rounded-2xl border border-amber-500/30">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-amber-400">
                  Live Website Content Management System (CMS)
                </span>
                <h3 className="font-display text-2xl font-bold text-white flex items-center gap-2 mt-1">
                  <Globe className="w-6 h-6 text-amber-400" />
                  <span>Homepage &amp; Website Content Editor (ওয়েবসাইট ও হোমপেজ এডিটর)</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Edit all website texts, headlines, bio, statistics, and photos dynamically at any time. Changes take effect on the live website immediately upon saving.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={async () => {
                    setIsReloadingSettings(true);
                    setSaveErrorMessage(null);
                    try {
                      const res = await reloadSettings();
                      if (res) {
                        setHomeSaveSuccess('✅ সার্ভার ডাটাবেজ থেকে সর্বশেষ সেটিংস রিলোড সম্পন্ন হয়েছে! (Reloaded from central database)');
                        setTimeout(() => setHomeSaveSuccess(null), 4000);
                      }
                    } finally {
                      setIsReloadingSettings(false);
                    }
                  }}
                  disabled={isReloadingSettings}
                  className="px-3.5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-amber-500/30 text-xs font-medium flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors shadow-sm"
                  title="Reload latest live data from server database"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isReloadingSettings ? 'animate-spin' : ''}`} />
                  <span>{isReloadingSettings ? 'রিলোড হচ্ছে...' : 'Reload Server Data (ডাটা রিলোড)'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('/')}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Preview Home Page</span>
                </button>
              </div>
            </div>

            {homeSaveSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs sm:text-sm flex items-center gap-2 shadow-xl animate-fade-in">
                <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{homeSaveSuccess}</span>
              </div>
            )}

            {saveErrorMessage && (
              <div className="p-4 rounded-2xl bg-red-950/70 border border-red-500/60 text-red-200 text-xs sm:text-sm flex items-center gap-2.5 shadow-xl animate-fade-in">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                <span className="font-medium">{saveErrorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSaveHomepageCMS} className="space-y-8">
              {/* SECTION 0: RASEL BABU OFFICIAL PROFILE PHOTO & WEBSITE FAVICON MANAGEMENT */}
              <div
                id="artist-profile-photo-cms-section"
                className="bg-gradient-to-br from-zinc-900/90 via-zinc-900/70 to-amber-950/20 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 font-mono text-[11px] font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>OFFICIAL ARTIST PROFILE PHOTO &amp; FAVICON (প্রধান প্রোফাইল ছবি ও ফেভিকন)</span>
                    </span>
                    <h4 className="text-xl font-bold text-white flex items-center gap-2 mt-2">
                      <Camera className="w-5 h-5 text-amber-400" />
                      <span>Rasel Babu Profile Photo &amp; Website Tab Favicon Setting</span>
                    </h4>
                    <p className="text-xs text-zinc-300 leading-relaxed max-w-2xl">
                      আপলোড করুন, প্রিভিউ দেখুন, পরিবর্তন করুন এবং সংরক্ষণ করুন। এই ছবিটি স্থায়ীভাবে ডাটাবেজ ও সার্ভারে সংরক্ষিত থাকবে এবং পেজ রিফ্রেশ করার পরেও অক্ষুণ্ণ থাকবে। পুরো ওয়েবসাইটে যেখানে যেখানে রাসেল বাবুর প্রোফাইল ছবি রয়েছে (যেমন: About পেজ, হোমপেজ সাফল্য, ফ্যান ড্যাশবোর্ড ইত্যাদি) সেখানে এই ছবি প্রদর্শিত হবে এবং এর ১:১ স্কয়ার ক্রপটি স্বয়ংক্রিয়ভাবে ওয়েবসাইটের ব্রাউজার ফেভিকন (Tab Favicon) হিসেবে ব্যবহৃত হবে।
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleSaveArtistProfilePhoto}
                      disabled={isSavingProfile}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 text-black font-bold text-xs shadow-lg shadow-amber-400/25 flex items-center gap-2 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                    >
                      {isSavingProfile ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-black" />
                          <span>সংরক্ষণ হচ্ছে... (Saving)</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Save Profile &amp; Favicon (সেভ করুন)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {profilePhotoSaveNotice && (
                  <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/60 text-emerald-200 text-xs sm:text-sm flex items-center gap-2.5 shadow-xl animate-fade-in">
                    <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span className="font-medium">{profilePhotoSaveNotice}</span>
                  </div>
                )}

                {saveErrorMessage && (
                  <div className="p-4 rounded-xl bg-rose-950/70 border border-rose-500/60 text-rose-200 text-xs sm:text-sm flex items-center gap-2.5 shadow-xl animate-fade-in">
                    <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                    <span className="font-medium">{saveErrorMessage}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Column: Upload Controls & Direct Path */}
                  <div className="lg:col-span-7 space-y-5">
                    {/* Upload from Device */}
                    <div className="p-4.5 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-3">
                      <label className="block text-xs font-bold text-white uppercase tracking-wider font-mono">
                        1. Upload Profile Photo from Device (ডিভাইস থেকে ছবি আপলোড)
                      </label>
                      <p className="text-[11px] text-zinc-400">
                        সরাসরি মোবাইল বা কম্পিউটার থেকে রাসেল বাবুর যেকোনো হাই-কোয়ালিটি ছবি সিলেক্ট করুন। সিস্টেম স্বয়ংক্রিয়ভাবে অপটিমাইজ করে একটি ফুল প্রোফাইল ইমেজ এবং নিখুঁত ১:১ স্কয়ার ফেভিকন তৈরি করবে।
                      </p>
                      <div className="flex flex-wrap items-center gap-3 pt-1">
                        <label className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-black font-bold text-xs cursor-pointer flex items-center gap-2.5 shadow-md shadow-amber-400/20 active:scale-95 transition-all">
                          {isProfilePhotoUploading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                              <span>Processing &amp; Cropping Photo...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4" />
                              <span>Select Image to Upload (ফটো পছন্দ করুন)</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleProfilePhotoUpload}
                            disabled={isProfilePhotoUploading}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => handleSelectProfilePreset(PORTRAIT_IMAGE)}
                          className="px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium border border-zinc-700 cursor-pointer transition-colors"
                        >
                          Reset to Original Portrait
                        </button>
                      </div>
                    </div>

                    {/* Direct Image URL input */}
                    <div className="p-4.5 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-2">
                      <label className="block text-xs font-bold text-white uppercase tracking-wider font-mono">
                        2. Or Enter Photo URL / Cloud Link (অথবা ইমেজের সরাসরি লিংক দিন)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={homeArtistProfileImage}
                          onChange={(e) => handleProfilePhotoUrlChange(e.target.value)}
                          placeholder="https://... or /assets/images/..."
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                        />
                      </div>
                    </div>

                    {/* Quick Official Presets */}
                    <div className="p-4.5 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-2.5">
                      <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider font-bold block">
                        3. Quick Official Artist Photo Presets (অফিসিয়াল ফটো প্রিসেট):
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { label: 'Celebrity Portrait (ডিফল্ট পোর্ট্রেট)', path: PORTRAIT_IMAGE },
                          { label: 'Concert Stage Live (মঞ্চের ছবি)', path: HERO_STAGE_IMAGE },
                          { label: 'Traditional Kurta (পাঞ্জাবি পরিহিত)', path: TRADITIONAL_PUNJABI_IMAGE },
                          { label: 'Studio Session (স্টুডিও সেশন)', path: STUDIO_IMAGE },
                        ].map((pr) => (
                          <button
                            key={pr.path}
                            type="button"
                            onClick={() => handleSelectProfilePreset(pr.path)}
                            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs border border-zinc-700 hover:border-amber-400/50 cursor-pointer transition-all flex items-center gap-1.5"
                          >
                            <Sparkles className="w-3 h-3 text-amber-400" />
                            <span>{pr.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Live Previews (Dual: Public Artist Profile Card + Real Browser Tab Favicon Simulation) */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="p-4.5 rounded-2xl bg-zinc-950/90 border border-zinc-800 space-y-4 shadow-xl">
                      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5" />
                          <span>Live Multi-Placement Previews</span>
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                          Active Sync
                        </span>
                      </div>

                      {/* Preview A: Browser Tab & Favicon Simulation */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-mono text-zinc-400">
                          A. Browser Tab Favicon Preview (ব্রাউজার ট্যাবে যেমন দেখাবে):
                        </span>
                        <div className="bg-[#1e1f22] rounded-t-xl p-2.5 border border-zinc-700 shadow-md">
                          <div className="flex items-center gap-2 max-w-[240px] bg-[#2b2d30] px-3 py-1.5 rounded-lg border-t-2 border-amber-400">
                            {/* Favicon Icon */}
                            <div className="w-4 h-4 rounded shrink-0 overflow-hidden bg-black flex items-center justify-center">
                              <img
                                src={homeArtistProfileSquare || homeArtistProfileImage}
                                alt="Favicon"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="text-[11px] font-medium text-zinc-200 truncate flex-1">
                              Rasel Babu | Official Artist...
                            </span>
                            <span className="text-[11px] text-zinc-500 hover:text-white cursor-default">×</span>
                          </div>
                        </div>
                      </div>

                      {/* Preview B: Main Artist Portrait Profile Card */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-mono text-zinc-400">
                          B. Website Public Profile Photo (About ও ড্যাশবোর্ডে যেমন দেখাবে):
                        </span>
                        <div className="flex items-center gap-4 p-3 bg-zinc-900/60 rounded-xl border border-zinc-800">
                          {/* Portrait preview card */}
                          <div className="w-24 h-32 rounded-xl overflow-hidden border-2 border-amber-500/40 shadow-lg shrink-0 relative bg-black group">
                            <img
                              src={homeArtistProfileImage}
                              alt="Profile Preview"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1.5">
                              <span className="text-[8px] font-mono text-amber-300">Public Card</span>
                            </div>
                          </div>

                          {/* 1:1 Square Avatar Preview */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-amber-400 shadow-md shrink-0 bg-black">
                                <img
                                  src={homeArtistProfileSquare || homeArtistProfileImage}
                                  alt="Square Avatar"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-white truncate">Rasel Babu</p>
                                <p className="text-[10px] text-amber-400 font-mono">1:1 Square Favicon</p>
                                <span className="inline-block mt-0.5 text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                                  256×256 High-Res
                                </span>
                              </div>
                            </div>

                            <p className="text-[11px] text-zinc-400 leading-tight">
                              This photo represents Rasel Babu globally across all pages and the browser tab.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Dedicated Save Action */}
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={handleSaveArtistProfilePhoto}
                          disabled={isSavingProfile}
                          className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 text-black font-bold text-xs shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
                        >
                          {isSavingProfile ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin text-black" />
                              <span>ডাটাবেজে সংরক্ষণ হচ্ছে... (Saving to Database)</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-4 h-4" />
                              <span>Save Rasel Babu Profile Photo &amp; Favicon Now</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 1: HERO HEADER TEXTS */}
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 space-y-4">
                <h4 className="text-base font-bold text-white flex items-center gap-2 border-b border-zinc-800/80 pb-3">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>1. Hero Section Texts &amp; Headings (হোমপেজ প্রধান টেক্সট ও শিরোনাম)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-300">Top Tagline / Kicker</label>
                    <input
                      type="text"
                      required
                      value={homeHeroTagline}
                      onChange={(e) => setHomeHeroTagline(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-300">Artist Main Title (প্রধান নাম)</label>
                    <input
                      type="text"
                      required
                      value={homeHeroTitle}
                      onChange={(e) => setHomeHeroTitle(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300">Hero Subtitle / Designation (উপশিরোনাম / পরিচয়)</label>
                  <input
                    type="text"
                    required
                    value={homeHeroSubtitle}
                    onChange={(e) => setHomeHeroSubtitle(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300">Hero Bio &amp; Artist Description (প্রধান বিবরণ ও বায়োগ্রাফি প্যারাগ্রাফ)</label>
                  <textarea
                    rows={3}
                    required
                    value={homeHeroDesc}
                    onChange={(e) => setHomeHeroDesc(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3.5 text-xs text-white focus:outline-none focus:border-amber-400 leading-relaxed"
                  />
                </div>
              </div>

              {/* SECTION 2: HERO PHOTO & LIVE PREVIEW */}
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 space-y-4">
                <h4 className="text-base font-bold text-white flex items-center gap-2 border-b border-zinc-800/80 pb-3">
                  <Camera className="w-4 h-4 text-amber-400" />
                  <span>2. Hero Main Photo Management (হোমপেজ প্রধান ছবি পরিবর্তন ও আপলোড)</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-8 space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-black font-bold text-xs cursor-pointer flex items-center gap-2 shadow-md shadow-amber-400/20">
                        <Upload className="w-4 h-4" />
                        <span>Upload Hero Photo from Device (ডিভাইস থেকে ছবি আপলোড)</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleHeroPhotoUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-zinc-300">Or Enter Photo URL / Asset Path</label>
                      <input
                        type="text"
                        value={homeHeroImageUrl}
                        onChange={(e) => setHomeHeroImageUrl(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                      />
                    </div>

                    {/* Quick Presets */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-mono text-zinc-400">Quick Image Presets:</span>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { label: 'Concert Stage Live', path: HERO_STAGE_IMAGE },
                          { label: 'Celebrity Portrait', path: PORTRAIT_IMAGE },
                          { label: 'Traditional Kurta', path: TRADITIONAL_PUNJABI_IMAGE },
                          { label: 'Studio Session', path: STUDIO_IMAGE },
                        ].map((pr) => (
                          <button
                            key={pr.path}
                            type="button"
                            onClick={() => setHomeHeroImageUrl(pr.path)}
                            className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] border border-zinc-700 cursor-pointer"
                          >
                            {pr.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Photo Preview Card */}
                  <div className="md:col-span-4 flex flex-col items-center">
                    <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-2xl overflow-hidden border-2 border-amber-500/40 shadow-xl relative group bg-black">
                      <img
                        src={homeHeroImageUrl}
                        alt="Hero Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                        <span className="text-[10px] text-amber-300 font-mono">Live Homepage Preview</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: EVENT RIBBON BADGE & DETAILS */}
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 space-y-4">
                <h4 className="text-base font-bold text-white flex items-center gap-2 border-b border-zinc-800/80 pb-3">
                  <Calendar className="w-4 h-4 text-pink-400" />
                  <span>3. Concert &amp; Event Spotlight Badge (ইভেন্ট ও কনসার্ট স্পটলাইট)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-300">Badge Label</label>
                    <input
                      type="text"
                      value={homeEventBadge}
                      onChange={(e) => setHomeEventBadge(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-300">Event Title</label>
                    <input
                      type="text"
                      value={homeEventTitle}
                      onChange={(e) => setHomeEventTitle(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-300">Event Subtitle</label>
                    <input
                      type="text"
                      value={homeEventSubtitle}
                      onChange={(e) => setHomeEventSubtitle(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: 4 STATS VALUES & LABELS */}
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 space-y-4">
                <h4 className="text-base font-bold text-white flex items-center gap-2 border-b border-zinc-800/80 pb-3">
                  <BarChart3 className="w-4 h-4 text-amber-400" />
                  <span>4. Key Impact Numbers &amp; Statistics (হোমপেজ পরিসংখ্যান ৪টি)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2">
                    <span className="text-[10px] text-zinc-500 font-mono uppercase block">Stat 1</span>
                    <input
                      type="text"
                      value={homeStat1Val}
                      onChange={(e) => setHomeStat1Val(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1 text-sm font-bold text-amber-400 font-mono"
                    />
                    <input
                      type="text"
                      value={homeStat1Lbl}
                      onChange={(e) => setHomeStat1Lbl(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-zinc-300"
                    />
                  </div>

                  <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2">
                    <span className="text-[10px] text-zinc-500 font-mono uppercase block">Stat 2</span>
                    <input
                      type="text"
                      value={homeStat2Val}
                      onChange={(e) => setHomeStat2Val(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1 text-sm font-bold text-pink-400 font-mono"
                    />
                    <input
                      type="text"
                      value={homeStat2Lbl}
                      onChange={(e) => setHomeStat2Lbl(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-zinc-300"
                    />
                  </div>

                  <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2">
                    <span className="text-[10px] text-zinc-500 font-mono uppercase block">Stat 3</span>
                    <input
                      type="text"
                      value={homeStat3Val}
                      onChange={(e) => setHomeStat3Val(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1 text-sm font-bold text-amber-400 font-mono"
                    />
                    <input
                      type="text"
                      value={homeStat3Lbl}
                      onChange={(e) => setHomeStat3Lbl(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-zinc-300"
                    />
                  </div>

                  <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2">
                    <span className="text-[10px] text-zinc-500 font-mono uppercase block">Stat 4</span>
                    <input
                      type="text"
                      value={homeStat4Val}
                      onChange={(e) => setHomeStat4Val(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1 text-sm font-bold text-white font-mono"
                    />
                    <input
                      type="text"
                      value={homeStat4Lbl}
                      onChange={(e) => setHomeStat4Lbl(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-zinc-300"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 5: ABOUT SECTION BIO & PHOTO */}
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 space-y-4">
                <h4 className="text-base font-bold text-white flex items-center gap-2 border-b border-zinc-800/80 pb-3">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>5. About Rasel Babu Bio &amp; Details (বায়োগ্রাফি ও পরিচিতি তথ্য)</span>
                </h4>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300">About Section Headline</label>
                  <input
                    type="text"
                    value={homeAboutHeadline}
                    onChange={(e) => setHomeAboutHeadline(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300">Biography Paragraph 1 (জন্মস্থান, শিক্ষা, বাদ্যযন্ত্র ও একাডেমিক তথ্য)</label>
                  <textarea
                    rows={3}
                    value={homeAboutBio1}
                    onChange={(e) => setHomeAboutBio1(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3.5 text-xs text-white focus:outline-none focus:border-amber-400 leading-relaxed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300">Biography Paragraph 2 (মডেলিং, গান, এফকে মিউজিক কোলাবোরেশন ও ভবিষ্যৎ পরিকল্পনা)</label>
                  <textarea
                    rows={3}
                    value={homeAboutBio2}
                    onChange={(e) => setHomeAboutBio2(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3.5 text-xs text-white focus:outline-none focus:border-amber-400 leading-relaxed"
                  />
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-zinc-300">About Photo / Portrait</label>
                    <label className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-[11px] font-medium cursor-pointer border border-zinc-700 flex items-center gap-1.5">
                      <Upload className="w-3 h-3 text-amber-400" />
                      <span>Upload About Photo (ছবি আপলোড)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAboutPhotoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    value={homeAboutImageUrl}
                    onChange={(e) => setHomeAboutImageUrl(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              </div>

              {/* SECTION 6: FK MUSIC DISTRIBUTION PAGE TEXTS & BANNER */}
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 space-y-4">
                <h4 className="text-base font-bold text-white flex items-center gap-2 border-b border-zinc-800/80 pb-3">
                  <Disc className="w-4 h-4 text-cyan-400" />
                  <span>6. FK Music Distribution Page Editor (ডিস্ট্রিবিউশন পেজের টেক্সট ও ব্যানার ফটো)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-300">Distribution Headline</label>
                    <input
                      type="text"
                      value={homeDistHeadline}
                      onChange={(e) => setHomeDistHeadline(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-300">Tagline / Kicker</label>
                    <input
                      type="text"
                      value={homeDistTagline}
                      onChange={(e) => setHomeDistTagline(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300">Distribution Description (বিস্তারিত বিবরণ)</label>
                  <textarea
                    rows={3}
                    value={homeDistDesc}
                    onChange={(e) => setHomeDistDesc(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3.5 text-xs text-white focus:outline-none focus:border-cyan-400 leading-relaxed"
                  />
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-zinc-300">Distribution Banner Photo (ব্যানার ফটো)</label>
                    <label className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-[11px] font-medium cursor-pointer border border-zinc-700 flex items-center gap-1.5">
                      <Upload className="w-3 h-3 text-cyan-400" />
                      <span>Upload Distribution Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleDistBannerUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    value={homeDistBannerUrl}
                    onChange={(e) => setHomeDistBannerUrl(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
              </div>

              {/* SECTION 7: MUSIC & DISCOGRAPHY */}
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 space-y-4">
                <h4 className="text-base font-bold text-white flex items-center gap-2 border-b border-zinc-800/80 pb-3">
                  <Music className="w-4 h-4 text-pink-400" />
                  <span>7. Music &amp; Releases Section (মিউজিক রিলিজ ও কভার ফটো)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-300">Music Headline</label>
                    <input
                      type="text"
                      value={homeMusicHeadline}
                      onChange={(e) => setHomeMusicHeadline(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-pink-400 font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-300">Featured Album Title</label>
                    <input
                      type="text"
                      value={homeFeaturedAlbumTitle}
                      onChange={(e) => setHomeFeaturedAlbumTitle(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-pink-400"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300">Music Subtitle</label>
                  <input
                    type="text"
                    value={homeMusicSubtitle}
                    onChange={(e) => setHomeMusicSubtitle(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-pink-400"
                  />
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-zinc-300">Featured Album Cover Photo</label>
                    <label className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-[11px] font-medium cursor-pointer border border-zinc-700 flex items-center gap-1.5">
                      <Upload className="w-3 h-3 text-pink-400" />
                      <span>Upload Album Cover</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAlbumCoverUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    value={homeFeaturedAlbumCover}
                    onChange={(e) => setHomeFeaturedAlbumCover(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-pink-400 font-mono"
                    placeholder="Photo URL or leave empty for default cover"
                  />
                </div>
              </div>

              {/* SECTION 8: VIP FAN CLUB & ANNUAL MEGA GIFT */}
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 space-y-4">
                <h4 className="text-base font-bold text-white flex items-center gap-2 border-b border-zinc-800/80 pb-3">
                  <Gift className="w-4 h-4 text-amber-400" />
                  <span>8. VIP Fan Club &amp; Annual Grand Gift (বার্ষিক সেরা ফ্যান মেগা গিফট তথ্য ও ফটো)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-300">Fan Club Headline</label>
                    <input
                      type="text"
                      value={homeFanClubHeadline}
                      onChange={(e) => setHomeFanClubHeadline(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-300">Annual Gift Title (বার্ষিক মেগা গিফটের নাম)</label>
                    <input
                      type="text"
                      value={homeAnnualGiftTitle}
                      onChange={(e) => setHomeAnnualGiftTitle(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-bold text-amber-300"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300">Fan Club Description</label>
                  <textarea
                    rows={2}
                    value={homeFanClubDesc}
                    onChange={(e) => setHomeFanClubDesc(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3.5 text-xs text-white focus:outline-none focus:border-amber-400 leading-relaxed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300">Annual Mega Gift Prize Description (পুরস্কারের বিবরণ ও সুবিধা)</label>
                  <textarea
                    rows={2}
                    value={homeAnnualGiftDesc}
                    onChange={(e) => setHomeAnnualGiftDesc(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3.5 text-xs text-white focus:outline-none focus:border-amber-400 leading-relaxed"
                  />
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-zinc-300">Annual Gift Prize Photo (গিফট ফটো)</label>
                    <label className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-[11px] font-medium cursor-pointer border border-zinc-700 flex items-center gap-1.5">
                      <Upload className="w-3 h-3 text-amber-400" />
                      <span>Upload Gift Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAnnualGiftImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    value={homeAnnualGiftImage}
                    onChange={(e) => setHomeAnnualGiftImage(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                    placeholder="Photo URL or leave blank"
                  />
                </div>
              </div>

              {/* SECTION 9: OFFICIAL CONTACT & SOCIAL MEDIA */}
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 space-y-4">
                <h4 className="text-base font-bold text-white flex items-center gap-2 border-b border-zinc-800/80 pb-3">
                  <Mail className="w-4 h-4 text-emerald-400" />
                  <span>9. Official Contact &amp; Social Links (অফিসিয়াল যোগাযোগ ও সোশ্যাল মিডিয়া)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-300">Contact Email</label>
                    <input
                      type="email"
                      value={homeContactEmail}
                      onChange={(e) => setHomeContactEmail(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-400 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-300">Contact Phone</label>
                    <input
                      type="text"
                      value={homeContactPhone}
                      onChange={(e) => setHomeContactPhone(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-400 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-300">WhatsApp Number</label>
                    <input
                      type="text"
                      value={homeContactWhatsapp}
                      onChange={(e) => setHomeContactWhatsapp(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-400 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300">Official Office / Studio Address</label>
                  <input
                    type="text"
                    value={homeContactAddress}
                    onChange={(e) => setHomeContactAddress(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-zinc-400">Facebook URL</label>
                    <input
                      type="text"
                      value={homeSocialFacebook}
                      onChange={(e) => setHomeSocialFacebook(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-zinc-400">YouTube URL</label>
                    <input
                      type="text"
                      value={homeSocialYoutube}
                      onChange={(e) => setHomeSocialYoutube(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-zinc-400">Spotify URL</label>
                    <input
                      type="text"
                      value={homeSocialSpotify}
                      onChange={(e) => setHomeSocialSpotify(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-zinc-400">Instagram URL</label>
                    <input
                      type="text"
                      value={homeSocialInstagram}
                      onChange={(e) => setHomeSocialInstagram(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 10: FOOTER & COPYRIGHT */}
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 space-y-4">
                <h4 className="text-base font-bold text-white flex items-center gap-2 border-b border-zinc-800/80 pb-3">
                  <FileText className="w-4 h-4 text-zinc-400" />
                  <span>10. Website Footer &amp; Copyright Notice (ফুটার টেক্সট ও কপিরাইট)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-300">Footer Copyright Text</label>
                    <input
                      type="text"
                      value={homeFooterCopyright}
                      onChange={(e) => setHomeFooterCopyright(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-300">Footer Tagline</label>
                    <input
                      type="text"
                      value={homeFooterTagline}
                      onChange={(e) => setHomeFooterTagline(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Master Save Button Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-950 border border-amber-500/40 shadow-2xl">
                <div>
                  <h5 className="text-sm font-bold text-white">Ready to Publish Changes?</h5>
                  <p className="text-xs text-zinc-400">All updates will immediately render live across Home and About pages.</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={isSavingCMS}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 text-black font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-amber-400/25 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50 active:scale-95"
                  >
                    {isSavingCMS ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-black" />
                        <span>সার্ভার ডাটাবেজে সংরক্ষণ হচ্ছে... (Saving to Database)</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Save Homepage Changes (হোমপেজ পরিবর্তন সংরক্ষণ করুন)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* TAB 4: INQUIRIES & USER MESSAGES */}
        {/* TAB 04: SUBJECT 3 - FAN MESSAGES SEEN & DIRECT REPLY */}
        {activeTab === 'messages' && (() => {
          const pendingCount = userMessages.filter((m) => m.status === 'pending').length;
          const repliedCount = userMessages.filter((m) => m.status === 'replied').length;

          const filteredMessages = userMessages.filter((msg) => {
            const matchesFilter = overviewMessageFilter === 'all' || msg.status === overviewMessageFilter;
            const q = messageSearchQuery.toLowerCase().trim();
            const matchesSearch =
              !q ||
              msg.userName.toLowerCase().includes(q) ||
              msg.userEmail.toLowerCase().includes(q) ||
              msg.subject.toLowerCase().includes(q) ||
              msg.message.toLowerCase().includes(q) ||
              (msg.reply && msg.reply.toLowerCase().includes(q));
            return matchesFilter && matchesSearch;
          });

          return (
            <div className="space-y-6 animate-fade-in">
              {/* Top Banner with Subject 3 Header */}
              <div className="p-6 rounded-3xl bg-zinc-900/50 border border-zinc-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-1 max-w-2xl">
                  <div className="inline-flex items-center gap-2 text-cyan-400 text-xs font-mono uppercase tracking-wider font-bold">
                    <Mail className="w-4 h-4" />
                    <span>SUBJECT 3: USER MESSAGES SEEN &amp; DIRECT REPLY (মেসেজ সিন ও রিপ্লাই)</span>
                  </div>
                  <h3 className="font-display text-2xl font-bold text-white">
                    Fan Messages Inbox &amp; Official Reply Desk
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    ইউজারদের পাঠানো প্রতিটি মেসেজ সিন করুন, সরাসরি অফিশিয়াল রিপ্লাই ট্রান্সমিট করুন এবং যেকোনো ভুল রিপ্লাই ডিলিট করুন। আপনার পাঠানো রিপ্লাই ফ্যানরা তাদের ইউজার ড্যাশবোর্ডে দেখতে পাবে।
                  </p>
                </div>

                {/* Subtab switcher */}
                <div className="flex items-center gap-2 p-1.5 bg-zinc-950 border border-zinc-800 rounded-2xl shrink-0">
                  <button
                    type="button"
                    onClick={() => setMessagesSubTab('fan_messages')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                      messagesSubTab === 'fan_messages'
                        ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Fan Messages ({userMessages.length})</span>
                    {pendingCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-red-600 text-white font-mono animate-pulse">
                        {pendingCount} new
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setMessagesSubTab('booking_inquiries')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                      messagesSubTab === 'booking_inquiries'
                        ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Concert Booking ({inquiries.length})</span>
                  </button>
                </div>
              </div>

              {/* VIEW 1: FAN MESSAGES INBOX WITH FULL SUBJECT 3 FEATURES */}
              {messagesSubTab === 'fan_messages' && (
                <div className="p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800 space-y-5">
                  {/* Filter and Search Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                    {/* Status filters */}
                    <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 rounded-xl p-1 text-xs">
                      <button
                        type="button"
                        onClick={() => setOverviewMessageFilter('all')}
                        className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                          overviewMessageFilter === 'all'
                            ? 'bg-cyan-500 text-black font-bold'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        All ({userMessages.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setOverviewMessageFilter('pending')}
                        className={`px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                          overviewMessageFilter === 'pending'
                            ? 'bg-amber-400 text-black font-bold'
                            : 'text-amber-400 hover:text-white'
                        }`}
                      >
                        <span>Needs Reply (উত্তর বাকি)</span>
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-amber-500/20 text-amber-300">
                          {pendingCount}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setOverviewMessageFilter('replied')}
                        className={`px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                          overviewMessageFilter === 'replied'
                            ? 'bg-emerald-500 text-black font-bold'
                            : 'text-emerald-400 hover:text-white'
                        }`}
                      >
                        <span>Replied (উত্তর সম্পন্ন)</span>
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300">
                          {repliedCount}
                        </span>
                      </button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full sm:w-72">
                      <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search fan, email or subject..."
                        value={messageSearchQuery}
                        onChange={(e) => setMessageSearchQuery(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  {/* Empty state */}
                  {filteredMessages.length === 0 ? (
                    <div className="p-12 rounded-2xl bg-zinc-950 border border-zinc-800 text-center space-y-2">
                      <Mail className="w-8 h-8 text-zinc-600 mx-auto" />
                      <p className="text-sm text-zinc-300 font-semibold">No fan messages found</p>
                      <p className="text-xs text-zinc-500">
                        {messageSearchQuery ? 'Try clearing your search query.' : 'There are no messages under this status filter.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`p-5 rounded-2xl border space-y-4 text-xs shadow-xl transition-all ${
                            msg.status === 'pending'
                              ? 'bg-zinc-950 border-amber-500/40 ring-1 ring-amber-500/20'
                              : 'bg-zinc-950 border-zinc-800/80 hover:border-zinc-700'
                          }`}
                        >
                          {/* Card Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-white text-sm">{msg.subject}</span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300">
                                {msg.category}
                              </span>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="text-[11px] font-mono text-zinc-400">
                                {new Date(msg.createdAt).toLocaleDateString()}
                              </span>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                                  msg.status === 'replied'
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                                }`}
                              >
                                {msg.status === 'replied' ? 'Replied (সিন ও উত্তর সম্পন্ন)' : 'Needs Reply (উত্তর বাকি)'}
                              </span>
                            </div>
                          </div>

                          {/* Sender Info & Fan Message Content */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                              <span>
                                From: <strong className="text-zinc-200">{msg.userName}</strong> ({msg.userEmail})
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`Are you sure you want to delete this fan message from ${msg.userName}?`)) {
                                    deleteUserMessage(msg.id);
                                  }
                                }}
                                className="text-zinc-500 hover:text-red-400 text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                                title="Delete this message completely"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Delete Message</span>
                              </button>
                            </div>
                            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-zinc-200 leading-relaxed font-sans">
                              {msg.message}
                            </div>
                          </div>

                          {/* Existing Reply Display with Delete Reply option */}
                          {msg.reply && (
                            <div className="p-4 rounded-xl bg-emerald-950/25 border border-emerald-500/30 space-y-2.5">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Official Reply by {msg.repliedBy || 'Rasel Babu Official Management'}</span>
                                </span>
                                <div className="flex items-center gap-3">
                                  <span className="font-mono text-[10px] text-zinc-400">
                                    {msg.repliedAt ? new Date(msg.repliedAt).toLocaleDateString() : ''}
                                  </span>
                                  {/* Delete Reply Button */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (window.confirm('Delete this official reply? The message status will be reverted to pending so you can write a fresh response.')) {
                                        deleteUserMessageReply(msg.id);
                                      }
                                    }}
                                    className="px-2.5 py-1 rounded bg-red-950/70 hover:bg-red-900 border border-red-500/30 text-red-300 text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                    title="Delete official reply"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    <span>Delete Reply (রিপ্লাই মুছে ফেলুন)</span>
                                  </button>
                                </div>
                              </div>
                              <p className="text-zinc-100 text-xs leading-relaxed bg-black/40 p-3 rounded-lg border border-emerald-500/20">
                                {msg.reply}
                              </p>
                            </div>
                          )}

                          {/* Inline Reply Composer */}
                          <div className="pt-2 border-t border-zinc-800/80 space-y-2">
                            <label className="text-[11px] font-semibold text-zinc-300 flex items-center justify-between">
                              <span>
                                {msg.reply
                                  ? 'Update or Send New Reply (নতুন উত্তর পাঠান):'
                                  : 'Write Official Reply to User (ইউজারকে সরাসরি রিপ্লাই লিখুন):'}
                              </span>
                              <span className="text-[10px] font-mono text-zinc-500">
                                Member will view this in Member Dashboard
                              </span>
                            </label>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <textarea
                                rows={2}
                                placeholder="Type your official answer to this fan..."
                                value={replyTextMap[msg.id] ?? ''}
                                onChange={(e) =>
                                  setReplyTextMap({ ...replyTextMap, [msg.id]: e.target.value })
                                }
                                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 font-sans"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const text = replyTextMap[msg.id];
                                  if (!text || !text.trim()) return;
                                  replyToUserMessage(msg.id, text.trim(), 'Rasel Babu Official Management');
                                  setReplyTextMap({ ...replyTextMap, [msg.id]: '' });
                                }}
                                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-lg shadow-cyan-500/20"
                              >
                                <Send className="w-3.5 h-3.5 text-black" />
                                <span>{msg.reply ? 'Update Reply' : 'Send Reply (রিপ্লাই দিন)'}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* VIEW 2: BOOKING & CONCERT INQUIRIES */}
              {messagesSubTab === 'booking_inquiries' && (
                <div className="p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800 space-y-4">
                  <div className="border-b border-zinc-800 pb-3">
                    <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-amber-400" />
                      <span>Booking &amp; Concert Inquiries ({inquiries.length} total)</span>
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Review event, wedding, festival, and corporate concert booking proposals from the Contact page.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {inquiries.length === 0 ? (
                      <p className="text-xs text-zinc-500 py-6 text-center">No booking inquiries submitted yet.</p>
                    ) : (
                      inquiries.map((inq) => (
                        <div key={inq.id} className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-white text-sm">{inq.name}</span>
                            <select
                              value={inq.status}
                              onChange={(e) => updateInquiryStatus(inq.id, e.target.value as any)}
                              className="bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-xs text-amber-400 cursor-pointer"
                            >
                              <option value="new">New (নতুন)</option>
                              <option value="reviewed">Reviewed (পর্যালোচিত)</option>
                              <option value="contacted">Contacted (যোগাযোগকৃত)</option>
                              <option value="archived">Archived (সংরক্ষিত)</option>
                            </select>
                          </div>

                          <p className="text-zinc-400 font-mono text-[11px]">
                            {inq.inquiryType} · {inq.email} {inq.phone ? `· ${inq.phone}` : ''}
                          </p>

                          <p className="text-zinc-300 bg-zinc-900/50 p-3 rounded-lg border border-zinc-800 leading-relaxed font-sans">
                            {inq.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })()}


        {/* TAB 08: FK MUSIC DISTRIBUTION MANAGEMENT - WEBSITE MESSAGES ONLY */}
        {activeTab === 'distribution' && (() => {
          const newCount = distributionInquiries.filter((d) => d.status === 'new').length;
          const reviewedCount = distributionInquiries.filter((d) => d.status === 'reviewed').length;
          const contactedCount = distributionInquiries.filter((d) => d.status === 'contacted').length;
          const approvedCount = distributionInquiries.filter((d) => d.status === 'approved').length;

          const filteredDistInquiries = distributionInquiries.filter((inq) => {
            const matchesFilter = distFilter === 'all' || inq.status === distFilter;
            const q = distSearch.toLowerCase();
            const matchesSearch =
              !distSearch ||
              inq.artistName.toLowerCase().includes(q) ||
              inq.releaseTitle.toLowerCase().includes(q) ||
              inq.email.toLowerCase().includes(q) ||
              inq.phone.toLowerCase().includes(q) ||
              inq.genre.toLowerCase().includes(q) ||
              inq.message.toLowerCase().includes(q);
            return matchesFilter && matchesSearch;
          });

          return (
            <div className="space-y-6 animate-fade-in">
              {/* Header Banner */}
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#190215] via-[#2d0526] to-[#12010e] border border-pink-500/30 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-2xl">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-950/80 border border-pink-500/40 text-pink-300 text-xs font-mono uppercase">
                    <Disc className="w-3.5 h-3.5 text-amber-400" />
                    <span>FK Music Limited · Artist Submission Desk</span>
                  </div>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
                    FK Music Distribution — Website Messages &amp; Applications
                  </h2>
                  <p className="text-xs sm:text-sm text-pink-100/70 max-w-2xl leading-relaxed">
                    ওয়েবসাইট থেকে শিল্পীদের প্রেরিত সকল ট্র্যাক ডিস্ট্রিবিউশন মেসেজ, যোগাযোগের তথ্য, ডেমো লিংক ও রিলিজ আবেদন এখানে প্রদর্শিত হচ্ছে।
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleSimulateWebsiteMessage}
                    className="px-4 py-2.5 rounded-xl bg-pink-950 hover:bg-pink-900 text-pink-200 border border-pink-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="নতুন টেস্ট মেসেজ যোগ করুন"
                  >
                    <Plus className="w-4 h-4 text-amber-400" />
                    <span>Simulate Test Message (টেস্ট মেসেজ)</span>
                  </button>
                  <button
                    onClick={() => onNavigate('/distribution')}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 text-black font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-amber-400/20 cursor-pointer"
                  >
                    <span>Public Submission Page</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {distNotice && (
                <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-200 text-xs sm:text-sm flex items-center gap-2 shadow-xl animate-fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>{distNotice}</span>
                </div>
              )}

              {/* Metric Counters Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
                  <span className="text-[10px] font-mono uppercase text-zinc-400">Total Website Messages</span>
                  <p className="text-2xl font-bold text-white font-mono mt-1">{distributionInquiries.length}</p>
                  <span className="text-[10px] text-zinc-500">মোট ওয়েবসাইট আবেদন</span>
                </div>
                <div className="p-4 rounded-2xl bg-pink-950/30 border border-pink-500/40">
                  <span className="text-[10px] font-mono uppercase text-pink-300">New / Unread</span>
                  <p className="text-2xl font-bold text-pink-400 font-mono mt-1">{newCount}</p>
                  <span className="text-[10px] text-pink-300/70">নতুন অপঠিত আবেদন</span>
                </div>
                <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/40">
                  <span className="text-[10px] font-mono uppercase text-cyan-300">Contacted Artists</span>
                  <p className="text-2xl font-bold text-cyan-400 font-mono mt-1">{contactedCount}</p>
                  <span className="text-[10px] text-cyan-300/70">যোগাযোগ সম্পন্ন</span>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40">
                  <span className="text-[10px] font-mono uppercase text-emerald-300">Approved Releases</span>
                  <p className="text-2xl font-bold text-emerald-400 font-mono mt-1">{approvedCount}</p>
                  <span className="text-[10px] text-emerald-300/70">অনুমোদিত ডিস্ট্রিবিউশন</span>
                </div>
              </div>

              {/* Filter and Search Bar */}
              <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  {(
                    [
                      { key: 'all', label: 'All Messages', count: distributionInquiries.length },
                      { key: 'new', label: 'New / Unread', count: newCount },
                      { key: 'reviewed', label: 'Reviewed', count: reviewedCount },
                      { key: 'contacted', label: 'Contacted', count: contactedCount },
                      { key: 'approved', label: 'Approved', count: approvedCount },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setDistFilter(tab.key)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                        distFilter === tab.key
                          ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold shadow'
                          : 'bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                          distFilter === tab.key ? 'bg-black text-amber-300' : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="relative min-w-[240px]">
                  <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search artist, song, phone..."
                    value={distSearch}
                    onChange={(e) => setDistSearch(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Inquiries Cards List */}
              {filteredDistInquiries.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-zinc-900/30 border border-zinc-800 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-pink-950/60 border border-pink-500/30 text-pink-400 flex items-center justify-center mx-auto">
                    <Mail className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white">কোনো ডিস্ট্রিবিউশন মেসেজ পাওয়া যায়নি</h3>
                  <p className="text-xs text-zinc-400 max-w-md mx-auto">
                    শিল্পী বা ব্যান্ড যখন ওয়েবসাইট থেকে তাদের ট্র্যাক ডিস্ট্রিবিউশন আবেদন বা মেসেজ পাঠাবে, তা সরাসরি এই ইনবক্সে জমা হবে।
                  </p>
                  <div className="pt-2 flex justify-center gap-3">
                    <button
                      onClick={handleSimulateWebsiteMessage}
                      className="px-4 py-2 rounded-xl bg-pink-950 hover:bg-pink-900 border border-pink-500/40 text-pink-300 text-xs font-semibold cursor-pointer"
                    >
                      টেস্ট মেসেজ পাঠিয়ে যাচাই করুন
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredDistInquiries.map((inq) => {
                    const isReplying = replyDistInqId === inq.id;
                    return (
                      <div
                        key={inq.id}
                        className={`p-6 rounded-3xl bg-zinc-900/40 border transition-all space-y-4 ${
                          inq.status === 'new'
                            ? 'border-pink-500/50 shadow-lg shadow-pink-950/20 bg-gradient-to-r from-[#170313]/40 via-zinc-900/60 to-zinc-900/40'
                            : inq.status === 'approved'
                            ? 'border-emerald-500/40'
                            : inq.status === 'contacted'
                            ? 'border-cyan-500/40'
                            : 'border-zinc-800'
                        }`}
                      >
                        {/* Header row */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-500/20 to-amber-500/20 border border-pink-500/40 flex items-center justify-center text-amber-400 font-bold shrink-0">
                              <Music className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-base font-bold text-white leading-tight">{inq.artistName}</h3>
                                {inq.status === 'new' && (
                                  <span className="px-2 py-0.5 rounded-full bg-pink-600 text-white font-mono text-[10px] font-bold animate-pulse">
                                    NEW
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-amber-400 font-medium mt-0.5">
                                Track: <span className="text-white font-bold">{inq.releaseTitle}</span> · <span className="text-zinc-400">{inq.genre}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-mono">
                              <Clock className="w-3.5 h-3.5 text-zinc-500" />
                              <span>{new Date(inq.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                            </div>

                            {/* Status Dropdown */}
                            <select
                              value={inq.status}
                              onChange={(e) => updateDistributionInquiryStatus(inq.id, e.target.value as any)}
                              className={`text-xs font-semibold px-3 py-1.5 rounded-xl border focus:outline-none cursor-pointer ${
                                inq.status === 'new'
                                  ? 'bg-pink-950 text-pink-300 border-pink-500/50'
                                  : inq.status === 'reviewed'
                                  ? 'bg-amber-950 text-amber-300 border-amber-500/50'
                                  : inq.status === 'contacted'
                                  ? 'bg-cyan-950 text-cyan-300 border-cyan-500/50'
                                  : 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                              }`}
                            >
                              <option value="new">New (নতুন)</option>
                              <option value="reviewed">Reviewed (পর্যালোচিত)</option>
                              <option value="contacted">Contacted (যোগাযোগকৃত)</option>
                              <option value="approved">Approved (অনুমোদিত)</option>
                            </select>

                            <button
                              onClick={() => deleteDistributionInquiry(inq.id)}
                              className="p-2 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                              title="মেসেজ মুছুন"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Contact Strip */}
                        <div className="flex flex-wrap items-center gap-3 p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 text-xs">
                          <a
                            href={`mailto:${inq.email}?subject=FK%20Music%20Distribution%20Update%20for%20${encodeURIComponent(inq.releaseTitle)}`}
                            className="inline-flex items-center gap-1.5 text-zinc-300 hover:text-amber-400 transition-colors font-mono"
                          >
                            <Mail className="w-3.5 h-3.5 text-amber-400" />
                            <span>{inq.email}</span>
                          </a>

                          <span className="text-zinc-600">·</span>

                          <a
                            href={`tel:${inq.phone}`}
                            className="inline-flex items-center gap-1.5 text-zinc-300 hover:text-amber-400 transition-colors font-mono"
                          >
                            <Phone className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{inq.phone}</span>
                          </a>

                          <span className="text-zinc-600">·</span>

                          <a
                            href={`https://wa.me/${inq.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                              `Hello ${inq.artistName}, regarding your track "${inq.releaseTitle}" submitted for FK Music Distribution:`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/40 text-[11px] font-semibold transition-colors"
                          >
                            <MessageCircle className="w-3 h-3 text-emerald-400" />
                            <span>Chat on WhatsApp (সরাসরি চ্যাট)</span>
                          </a>

                          {inq.demoLink && (
                            <>
                              <span className="text-zinc-600">·</span>
                              <a
                                href={inq.demoLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-950/50 hover:bg-red-900/70 text-red-300 border border-red-500/40 text-[11px] font-semibold transition-colors"
                              >
                                <Youtube className="w-3.5 h-3.5 text-red-500" />
                                <span>YouTube Channel / Link (ইউটিউব চ্যানেল দেখুন)</span>
                              </a>
                            </>
                          )}
                        </div>

                        {/* Requested DSP platforms pills */}
                        {inq.platforms && inq.platforms.length > 0 && (
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[11px] font-mono uppercase text-zinc-500">Requested Stores:</span>
                            {inq.platforms.map((plat) => (
                              <span
                                key={plat}
                                className="px-2.5 py-0.5 rounded-full bg-zinc-950 border border-zinc-700 text-zinc-300 text-[11px] font-medium"
                              >
                                {plat}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Artist's Message Body */}
                        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-1.5">
                          <span className="text-[10px] font-mono uppercase text-amber-400/90 font-bold block">
                            Website Message / Submission Proposal:
                          </span>
                          <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed whitespace-pre-line">
                            {inq.message}
                          </p>
                        </div>

                        {/* Admin Reply History */}
                        {inq.reply && (
                          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/30 to-zinc-950 border border-amber-500/30 space-y-1.5">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-amber-400 flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Official Reply Transmitted (প্রেরিত উত্তর):</span>
                              </span>
                              {inq.repliedAt && (
                                <span className="text-zinc-500 font-mono">
                                  {new Date(inq.repliedAt).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line">
                              {inq.reply}
                            </p>
                          </div>
                        )}

                        {/* Reply Composer */}
                        <div className="pt-2 border-t border-zinc-800/80">
                          {isReplying ? (
                            <div className="space-y-3">
                              <div className="space-y-1">
                                <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                                  <Send className="w-3.5 h-3.5 text-amber-400" />
                                  <span>শিল্পী {inq.artistName}-কে অফিসিয়াল রিপ্লাই লিখুন:</span>
                                </label>
                                <textarea
                                  rows={3}
                                  placeholder={`Type official reply to ${inq.artistName} regarding "${inq.releaseTitle}"...`}
                                  value={replyDistText}
                                  onChange={(e) => setReplyDistText(e.target.value)}
                                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-400 leading-relaxed"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleSendDistributionReply(inq.id)}
                                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-black font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-400/20 cursor-pointer"
                                >
                                  <Send className="w-3.5 h-3.5" />
                                  <span>Send Reply to Artist</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setReplyDistInqId(null);
                                    setReplyDistText('');
                                  }}
                                  className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setReplyDistInqId(inq.id);
                                setReplyDistText(inq.reply || '');
                              }}
                              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                            >
                              <Send className="w-3.5 h-3.5 text-amber-400" />
                              <span>{inq.reply ? 'Edit / Send Another Reply' : 'Reply to Artist (রিপ্লাই দিন)'}</span>
                            </button>
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

        {/* TAB 09: ADSTERRA MONETIZATION ENGINE */}
        {activeTab === 'monetization' && (
          <div className="space-y-8 bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 sm:p-10">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-amber-400">
                Primary Revenue Infrastructure
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mt-1 flex items-center gap-3">
                <DollarSign className="w-7 h-7 text-amber-400" />
                <span>Adsterra Monetization Engine</span>
              </h2>
              <p className="text-xs text-zinc-400 max-w-xl mt-1">
                Configure your verified Adsterra Publisher ID, zone placements, and page-level delivery. Ads are policy-compliant, layout-shift free, and fully controllable.
              </p>
            </div>

            {/* 1-Click Master Control Hero Banner */}
            <div className={`p-6 sm:p-8 rounded-3xl border transition-all duration-300 shadow-2xl ${
              adsterraConfig.enabled
                ? 'bg-gradient-to-r from-emerald-950/40 via-zinc-950 to-zinc-900 border-emerald-500/50 shadow-emerald-950/30'
                : 'bg-gradient-to-r from-rose-950/40 via-zinc-950 to-zinc-900 border-rose-500/50 shadow-rose-950/30'
            }`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`inline-block w-3 h-3 rounded-full ${
                      adsterraConfig.enabled ? 'bg-emerald-400 animate-ping' : 'bg-rose-500'
                    }`} />
                    <span className={`text-xs font-mono uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full ${
                      adsterraConfig.enabled
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    }`}>
                      {adsterraConfig.enabled ? 'ALL ADS ACTIVE · সকল বিজ্ঞাপন চালু' : 'ALL ADS DISABLED · সকল বিজ্ঞাপন বন্ধ'}
                    </span>
                  </div>
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-white">
                    Master Ads Switch / বিজ্ঞাপন মাস্টার কন্ট্রোল
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-300 max-w-xl leading-relaxed">
                    ১ ক্লিকে পুরো ওয়েবসাইটের সকল ব্যানার (Leaderboard, 468x60, 300x250, 160x600, 320x50, 160x300) এবং সোশ্যাল বার অন বা অফ করুন।
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    type="button"
                    onClick={() => updateAdsterraConfig({ enabled: !adsterraConfig.enabled })}
                    className={`px-6 py-3.5 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2.5 shadow-xl cursor-pointer ${
                      adsterraConfig.enabled
                        ? 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white shadow-rose-900/40'
                        : 'bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 text-black shadow-emerald-900/40'
                    }`}
                  >
                    {adsterraConfig.enabled ? (
                      <>
                        <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                        <span>১-ক্লিকে সব বিজ্ঞাপন বন্ধ করুন (Turn OFF All Ads)</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2.5 h-2.5 rounded-full bg-black animate-pulse" />
                        <span>১-ক্লিকে সব বিজ্ঞাপন চালু করুন (Turn ON All Ads)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Secondary Controls (Social Bar & Live/Test Mode) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-white block">Social Bar Widget</span>
                  <span className="text-[11px] text-zinc-400">bicea.org floating discreet social bar</span>
                </div>
                <input
                  type="checkbox"
                  checked={adsterraConfig.socialBarEnabled}
                  onChange={(e) => updateAdsterraConfig({ socialBarEnabled: e.target.checked })}
                  className="w-5 h-5 accent-amber-400 cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-white block">Safe Preview / Test Mode</span>
                  <span className="text-[11px] text-zinc-400">
                    {adsterraConfig.testMode ? 'Mock placeholder preview' : 'Real live Adsterra scripts running'}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={adsterraConfig.testMode}
                  onChange={(e) => updateAdsterraConfig({ testMode: e.target.checked })}
                  className="w-5 h-5 accent-amber-400 cursor-pointer"
                />
              </div>
            </div>

            {/* Publisher Credentials & All 7 Zone Keys */}
            <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Adsterra Zone Keys & Script Placements
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Your verified Adsterra script keys from bicea.org:
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    updateAdsterraConfig({
                      bannerKeys: {
                        leaderboard728x90: '1fe9cd4f9a13d2eb6bf668247a7c5e55',
                        banner468x60: '992e5c073cd17ad7d1ee02e15f6a74d7',
                        mediumRectangle300x250: 'dd011d8b361d79661b6de3d5632ce1d5',
                        mobileBanner320x50: 'a78db685879426319374cf7d5a8d7bed',
                        skyscraper160x600: 'ca15548b4e78cc2ea6271d78c0e5c208',
                        halfSkyscraper160x300: 'efd18937fec14299ab3536a4e698fd8b',
                        socialBarKey: 'b1064cd1b5e0c41b0e67eb50417ae390',
                      },
                    })
                  }
                  className="px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-mono transition-colors cursor-pointer self-start sm:self-auto"
                >
                  Apply Official 7 Adsterra Keys
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                {/* 1. 728x90 Leaderboard */}
                <div className="space-y-1 bg-zinc-900/50 p-3.5 rounded-xl border border-zinc-800/80">
                  <div className="flex items-center justify-between">
                    <label className="text-zinc-300 font-semibold">Leaderboard (728×90)</label>
                    <span className="text-[10px] text-amber-400 font-mono">Desktop / Tablet</span>
                  </div>
                  <input
                    type="text"
                    value={adsterraConfig.bannerKeys.leaderboard728x90}
                    onChange={(e) =>
                      updateAdsterraConfig({
                        bannerKeys: { ...adsterraConfig.bannerKeys, leaderboard728x90: e.target.value },
                      })
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 font-mono text-zinc-200 text-xs focus:border-amber-400 focus:outline-none"
                  />
                  <span className="text-[10px] text-zinc-500">Key: 1fe9cd4f9a13d2eb6bf668247a7c5e55</span>
                </div>

                {/* 2. 468x60 Banner */}
                <div className="space-y-1 bg-zinc-900/50 p-3.5 rounded-xl border border-zinc-800/80">
                  <div className="flex items-center justify-between">
                    <label className="text-zinc-300 font-semibold">Standard Banner (468×60)</label>
                    <span className="text-[10px] text-amber-400 font-mono">Mid-Page</span>
                  </div>
                  <input
                    type="text"
                    value={adsterraConfig.bannerKeys.banner468x60}
                    onChange={(e) =>
                      updateAdsterraConfig({
                        bannerKeys: { ...adsterraConfig.bannerKeys, banner468x60: e.target.value },
                      })
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 font-mono text-zinc-200 text-xs focus:border-amber-400 focus:outline-none"
                  />
                  <span className="text-[10px] text-zinc-500">Key: 992e5c073cd17ad7d1ee02e15f6a74d7</span>
                </div>

                {/* 3. 300x250 Medium Rectangle */}
                <div className="space-y-1 bg-zinc-900/50 p-3.5 rounded-xl border border-zinc-800/80">
                  <div className="flex items-center justify-between">
                    <label className="text-zinc-300 font-semibold">Medium Rectangle (300×250)</label>
                    <span className="text-[10px] text-amber-400 font-mono">Sidebar / In-Article</span>
                  </div>
                  <input
                    type="text"
                    value={adsterraConfig.bannerKeys.mediumRectangle300x250}
                    onChange={(e) =>
                      updateAdsterraConfig({
                        bannerKeys: { ...adsterraConfig.bannerKeys, mediumRectangle300x250: e.target.value },
                      })
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 font-mono text-zinc-200 text-xs focus:border-amber-400 focus:outline-none"
                  />
                  <span className="text-[10px] text-zinc-500">Key: dd011d8b361d79661b6de3d5632ce1d5</span>
                </div>

                {/* 4. 160x600 Wide Skyscraper */}
                <div className="space-y-1 bg-zinc-900/50 p-3.5 rounded-xl border border-zinc-800/80">
                  <div className="flex items-center justify-between">
                    <label className="text-zinc-300 font-semibold">Skyscraper (160×600)</label>
                    <span className="text-[10px] text-amber-400 font-mono">Vertical Sidebar</span>
                  </div>
                  <input
                    type="text"
                    value={adsterraConfig.bannerKeys.skyscraper160x600}
                    onChange={(e) =>
                      updateAdsterraConfig({
                        bannerKeys: { ...adsterraConfig.bannerKeys, skyscraper160x600: e.target.value },
                      })
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 font-mono text-zinc-200 text-xs focus:border-amber-400 focus:outline-none"
                  />
                  <span className="text-[10px] text-zinc-500">Key: ca15548b4e78cc2ea6271d78c0e5c208</span>
                </div>

                {/* 5. 320x50 Mobile Banner */}
                <div className="space-y-1 bg-zinc-900/50 p-3.5 rounded-xl border border-zinc-800/80">
                  <div className="flex items-center justify-between">
                    <label className="text-zinc-300 font-semibold">Mobile Banner (320×50)</label>
                    <span className="text-[10px] text-emerald-400 font-mono">Smartphones</span>
                  </div>
                  <input
                    type="text"
                    value={adsterraConfig.bannerKeys.mobileBanner320x50}
                    onChange={(e) =>
                      updateAdsterraConfig({
                        bannerKeys: { ...adsterraConfig.bannerKeys, mobileBanner320x50: e.target.value },
                      })
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 font-mono text-zinc-200 text-xs focus:border-amber-400 focus:outline-none"
                  />
                  <span className="text-[10px] text-zinc-500">Key: a78db685879426319374cf7d5a8d7bed</span>
                </div>

                {/* 6. 160x300 Half Skyscraper */}
                <div className="space-y-1 bg-zinc-900/50 p-3.5 rounded-xl border border-zinc-800/80">
                  <div className="flex items-center justify-between">
                    <label className="text-zinc-300 font-semibold">Half Skyscraper (160×300)</label>
                    <span className="text-[10px] text-amber-400 font-mono">Compact Sidebar</span>
                  </div>
                  <input
                    type="text"
                    value={adsterraConfig.bannerKeys.halfSkyscraper160x300}
                    onChange={(e) =>
                      updateAdsterraConfig({
                        bannerKeys: { ...adsterraConfig.bannerKeys, halfSkyscraper160x300: e.target.value },
                      })
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 font-mono text-zinc-200 text-xs focus:border-amber-400 focus:outline-none"
                  />
                  <span className="text-[10px] text-zinc-500">Key: efd18937fec14299ab3536a4e698fd8b</span>
                </div>

                {/* 7. Social Bar */}
                <div className="space-y-1 bg-zinc-900/50 p-3.5 rounded-xl border border-zinc-800/80 sm:col-span-2 lg:col-span-3">
                  <div className="flex items-center justify-between">
                    <label className="text-zinc-300 font-semibold">Social Bar Widget Script Key</label>
                    <span className="text-[10px] text-pink-400 font-mono">Global Sticky Bar</span>
                  </div>
                  <input
                    type="text"
                    value={adsterraConfig.bannerKeys.socialBarKey}
                    onChange={(e) =>
                      updateAdsterraConfig({
                        bannerKeys: { ...adsterraConfig.bannerKeys, socialBarKey: e.target.value },
                      })
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 font-mono text-zinc-200 text-xs focus:border-amber-400 focus:outline-none"
                  />
                  <span className="text-[10px] text-zinc-500">
                    Script URL: https://bicea.org/14/b1064cd1b5e0c41b0e67eb50417ae390
                  </span>
                </div>
              </div>
            </div>

            {/* Page-Level Ad Placements */}
            <div className="space-y-3">
              <h3 className="text-xs font-mono uppercase text-zinc-400">
                Page-by-Page Monetization Toggles
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {(Object.keys(adsterraConfig.pagePlacements) as Array<keyof typeof adsterraConfig.pagePlacements>).map(
                  (pageKey) => {
                    const isChecked = adsterraConfig.pagePlacements[pageKey];
                    return (
                      <label
                        key={pageKey}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-amber-400/10 border-amber-400/40 text-amber-300 font-semibold'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-500'
                        }`}
                      >
                        <span className="capitalize">{pageKey} Page</span>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => togglePageAdPlacement(pageKey)}
                          className="accent-amber-400 cursor-pointer"
                        />
                      </label>
                    );
                  }
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: PRIVACY-CONSCIOUS ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-8 bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 sm:p-10">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-amber-400">
                Privacy-Conscious Audience Telemetry
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mt-1">
                Real-Time Traffic & Monetization Overview
              </h2>
            </div>

            {/* 4-Stat Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800">
                <span className="text-xs text-zinc-500 block uppercase font-mono">Page Views (Today)</span>
                <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-white mt-1 block">
                  {analytics.pageViewsToday.toLocaleString()}
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800">
                <span className="text-xs text-zinc-500 block uppercase font-mono">Unique Visitors</span>
                <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-amber-400 mt-1 block">
                  {analytics.uniqueVisitorsToday.toLocaleString()}
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800">
                <span className="text-xs text-zinc-500 block uppercase font-mono">Gallery Impressions</span>
                <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-pink-400 mt-1 block">
                  {analytics.totalGalleryImpressions.toLocaleString()}
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800">
                <span className="text-xs text-zinc-500 block uppercase font-mono">Ad Impressions</span>
                <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-emerald-400 mt-1 block">
                  {analytics.adImpressions.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Popular Pages Table */}
            <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
              <h3 className="text-xs font-mono uppercase text-zinc-400">
                High-Traffic Content Paths
              </h3>

              <div className="space-y-2">
                {analytics.topPages.map((pg, idx) => (
                  <div key={pg.path} className="flex items-center justify-between text-xs p-2.5 rounded bg-zinc-900/60 border border-zinc-800">
                    <span className="font-medium text-zinc-200">
                      {idx + 1}. {pg.label} <span className="text-zinc-500 font-mono text-[11px]">({pg.path})</span>
                    </span>
                    <span className="font-mono tabular-nums text-amber-400 font-semibold">
                      {pg.views.toLocaleString()} views
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
          </main>
        </div>
      </div>

      {/* MODAL 1: Admin-Initiated User Password Reset Result Modal */}
      {resetModalData.open && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2 text-amber-400">
                <KeyRound className="w-5 h-5" />
                <h3 className="font-display text-lg font-bold text-white">
                  Admin-Initiated Password Reset Link
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setResetModalData({ open: false })}
                className="text-zinc-500 hover:text-white text-xs cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            {resetModalData.loading && (
              <div className="py-8 text-center space-y-3">
                <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-zinc-400">Generating cryptographically secure single-use token...</p>
              </div>
            )}

            {resetModalData.error && (
              <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Reset Link Generation Failed</p>
                  <p className="text-zinc-400 mt-0.5">{resetModalData.error}</p>
                </div>
              </div>
            )}

            {!resetModalData.loading && resetModalData.resetLink && (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Secure password reset link generated and dispatched to user email!</span>
                </div>

                <div className="p-3.5 bg-black/60 rounded-xl border border-zinc-800 space-y-1.5 font-mono">
                  <div className="flex justify-between items-center text-zinc-400 text-[11px]">
                    <span>Recipient Member:</span>
                    <span className="text-white font-sans font-semibold">{resetModalData.user?.name}</span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-400 text-[11px]">
                    <span>Email Address:</span>
                    <span className="text-amber-300 font-bold">{resetModalData.user?.email}</span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-400 text-[11px]">
                    <span>Link Validity:</span>
                    <span className="text-emerald-400">24 Hours (Single-Use Only)</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-zinc-400 text-[11px] font-semibold uppercase font-mono">
                      Secure Reset URL:
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        if (resetModalData.resetLink) {
                          navigator.clipboard.writeText(resetModalData.resetLink);
                          setResetModalData((prev) => ({ ...prev, copied: true }));
                          setTimeout(() => setResetModalData((prev) => ({ ...prev, copied: false })), 2000);
                        }
                      }}
                      className="text-amber-400 hover:text-amber-300 text-[11px] font-medium flex items-center gap-1 cursor-pointer bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20"
                    >
                      {resetModalData.copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{resetModalData.copied ? 'Copied to Clipboard!' : 'Copy Link'}</span>
                    </button>
                  </div>
                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-[11px] text-zinc-300 font-mono break-all select-all">
                    {resetModalData.resetLink}
                  </div>
                </div>

                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  The user can click this link from their email or browser to set their new password. The token is cryptographically verified on the server and expires automatically.
                </p>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setResetModalData({ open: false })}
                className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Change Admin Password Modal */}
      {adminPasswordModal.open && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2 text-amber-400">
                <Shield className="w-5 h-5" />
                <h3 className="font-display text-lg font-bold text-white">
                  Change Administrator Password
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAdminPasswordModal((prev) => ({ ...prev, open: false }))}
                className="text-zinc-500 hover:text-white text-xs cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            {adminPasswordModal.error && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{adminPasswordModal.error}</span>
              </div>
            )}

            {adminPasswordModal.success && (
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{adminPasswordModal.success}</span>
              </div>
            )}

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setAdminPasswordModal((prev) => ({ ...prev, error: null, success: null }));

                if (adminPasswordModal.newPass.length < 6) {
                  setAdminPasswordModal((prev) => ({ ...prev, error: 'New password must be at least 6 characters long.' }));
                  return;
                }

                if (adminPasswordModal.newPass !== adminPasswordModal.confirmPass) {
                  setAdminPasswordModal((prev) => ({ ...prev, error: 'New passwords do not match.' }));
                  return;
                }

                setAdminPasswordModal((prev) => ({ ...prev, loading: true }));
                const res = await changePassword(adminPasswordModal.currentPass, adminPasswordModal.newPass);
                setAdminPasswordModal((prev) => ({
                  ...prev,
                  loading: false,
                  error: res.success ? null : res.message,
                  success: res.success ? 'Admin password updated successfully!' : null,
                  currentPass: res.success ? '' : prev.currentPass,
                  newPass: res.success ? '' : prev.newPass,
                  confirmPass: res.success ? '' : prev.confirmPass,
                }));
              }}
              className="space-y-3.5 text-xs"
            >
              <div className="space-y-1">
                <label className="text-zinc-300 font-medium">Current Admin Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={adminPasswordModal.currentPass}
                  onChange={(e) => setAdminPasswordModal((prev) => ({ ...prev, currentPass: e.target.value }))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-300 font-medium">New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={adminPasswordModal.newPass}
                  onChange={(e) => setAdminPasswordModal((prev) => ({ ...prev, newPass: e.target.value }))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-300 font-medium">Confirm New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Repeat new password"
                  value={adminPasswordModal.confirmPass}
                  onChange={(e) => setAdminPasswordModal((prev) => ({ ...prev, confirmPass: e.target.value }))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  disabled={adminPasswordModal.loading}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-black font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {adminPasswordModal.loading ? 'Updating Password...' : 'Save New Password'}
                </button>
                <button
                  type="button"
                  onClick={() => setAdminPasswordModal((prev) => ({ ...prev, open: false }))}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Add / Edit Product Modal with 3 Additional Photos */}
      {showProductModal && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowProductModal(false);
            }
          }}
        >
          <div
            className="w-full max-w-2xl bg-zinc-900 border border-zinc-700 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-5 h-5 text-amber-400" />
                <h3 className="font-display text-xl font-bold text-white">
                  {editingProductItem ? 'Edit Product Details (প্রোডাক্ট এডিট করুন)' : 'Add New Store Product (নতুন পণ্য যোগ করুন)'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowProductModal(false)}
                className="p-1.5 rounded-full bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              {/* Title & Badge */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300">Product Title (পণ্যের নাম) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rasel Babu Exclusive Three-Piece Collection"
                  value={productFormTitle}
                  onChange={(e) => setProductFormTitle(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Price, Offer Price, Currency */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300">Regular Price (মূল দাম) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={productFormPrice}
                    onChange={(e) => setProductFormPrice(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-amber-300">Offer / Sale Price (ছাড়ের দাম)</label>
                  <input
                    type="number"
                    min={0}
                    value={productFormOfferPrice}
                    onChange={(e) => setProductFormOfferPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-amber-500/60 rounded-xl px-3.5 py-2 text-xs text-amber-300 focus:outline-none focus:border-amber-400 font-mono font-bold"
                    placeholder="e.g. 2750 (ঐচ্ছিক)"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300">Currency</label>
                  <input
                    type="text"
                    value={productFormCurrency}
                    onChange={(e) => setProductFormCurrency(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              </div>

              {/* Category & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300">Category (ক্যাটেগরি)</label>
                  <select
                    value={productFormCategory}
                    onChange={(e) => setProductFormCategory(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
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
                    placeholder="New Three-Piece / Hot Deal"
                    value={productFormBadge}
                    onChange={(e) => setProductFormBadge(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Available Sizes & In Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-medium text-zinc-300">
                    Available Sizes (সাইজসমূহ - কমা দিয়ে লিখুন):
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 36, 38, 40, 42, 44 or S, M, L, XL"
                    value={productFormSizes}
                    onChange={(e) => setProductFormSizes(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                  <span className="text-xs text-zinc-300 font-medium">In Stock</span>
                  <input
                    type="checkbox"
                    checked={productFormInStock}
                    onChange={(e) => setProductFormInStock(e.target.checked)}
                    className="w-4 h-4 text-amber-500 rounded focus:ring-amber-400 cursor-pointer"
                  />
                </div>
              </div>

              {/* MAIN PRODUCT PHOTO */}
              <div className="space-y-2 p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
                <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-amber-400" />
                  <span>Main Product Photo (মূল প্রধান ছবি):</span>
                </label>

                <div className="flex items-center gap-3">
                  <label className="px-4 py-2 rounded-xl bg-gradient-to-r from-zinc-800 to-zinc-700 hover:from-zinc-700 text-white text-xs font-medium cursor-pointer flex items-center gap-2 border border-zinc-600 transition-all">
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    <span>Upload from Device (ডিভাইস থেকে আপলোড)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProductPhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="space-y-1 pt-1">
                  <span className="text-[11px] text-zinc-400">Or enter Image URL:</span>
                  <input
                    type="text"
                    placeholder="/src/assets/images/... or https://..."
                    value={productFormImageUrl}
                    onChange={(e) => setProductFormImageUrl(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                {productFormImageUrl && (
                  <div className="flex items-center gap-3 pt-2 border-t border-zinc-800">
                    <img
                      src={productFormImageUrl}
                      alt="Main Preview"
                      className="w-16 h-16 rounded-lg object-cover border border-amber-500/40"
                    />
                    <div className="text-xs text-zinc-400">
                      <span className="text-emerald-400 font-semibold block">Main Photo Active</span>
                      <span className="text-[10px] text-zinc-500">Primary display image in catalog</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 3 ADDITIONAL PHOTOS (১ম অতিরিক্ত ছবি, ২য় অতিরিক্ত ছবি, ৩য় অতিরিক্ত ছবি) */}
              <div className="space-y-3 p-4 rounded-xl bg-zinc-950 border border-amber-500/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-amber-400" />
                    <span>Additional 3 Photos (আরো ৩টি অতিরিক্ত ছবি যোগ করুন):</span>
                  </span>
                  <span className="text-[10px] font-mono text-amber-400">Up to 3 Extra Photos</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  প্রতিটি প্রোডাক্টে আরও ৩টি ফটো যুক্ত করা যাবে। ক্রেতারা ওয়েবসাইটের যেকোনো পেজ থেকে প্রোডাক্টে ক্লিক করলে সবগুলো ছবি গ্যালারিতে দেখতে পাবে।
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  {/* Extra Photo 1 */}
                  <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-zinc-300">
                      <span>১ম অতিরিক্ত ছবি</span>
                      {productExtraImg1 && (
                        <button
                          type="button"
                          onClick={() => setProductExtraImg1('')}
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
                        onChange={(e) => handleProductExtraPhotoUpload(1, e)}
                        className="hidden"
                      />
                    </label>

                    <input
                      type="text"
                      placeholder="Image URL"
                      value={productExtraImg1}
                      onChange={(e) => setProductExtraImg1(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-[11px] text-white focus:outline-none focus:border-amber-400 font-mono"
                    />

                    {productExtraImg1 && (
                      <div className="relative aspect-video rounded-lg overflow-hidden border border-amber-500/40">
                        <img src={productExtraImg1} alt="Extra 1" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  {/* Extra Photo 2 */}
                  <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-zinc-300">
                      <span>২য় অতিরিক্ত ছবি</span>
                      {productExtraImg2 && (
                        <button
                          type="button"
                          onClick={() => setProductExtraImg2('')}
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
                        onChange={(e) => handleProductExtraPhotoUpload(2, e)}
                        className="hidden"
                      />
                    </label>

                    <input
                      type="text"
                      placeholder="Image URL"
                      value={productExtraImg2}
                      onChange={(e) => setProductExtraImg2(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-[11px] text-white focus:outline-none focus:border-amber-400 font-mono"
                    />

                    {productExtraImg2 && (
                      <div className="relative aspect-video rounded-lg overflow-hidden border border-amber-500/40">
                        <img src={productExtraImg2} alt="Extra 2" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  {/* Extra Photo 3 */}
                  <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-zinc-300">
                      <span>৩য় অতিরিক্ত ছবি</span>
                      {productExtraImg3 && (
                        <button
                          type="button"
                          onClick={() => setProductExtraImg3('')}
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
                        onChange={(e) => handleProductExtraPhotoUpload(3, e)}
                        className="hidden"
                      />
                    </label>

                    <input
                      type="text"
                      placeholder="Image URL"
                      value={productExtraImg3}
                      onChange={(e) => setProductExtraImg3(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-[11px] text-white focus:outline-none focus:border-amber-400 font-mono"
                    />

                    {productExtraImg3 && (
                      <div className="relative aspect-video rounded-lg overflow-hidden border border-amber-500/40">
                        <img src={productExtraImg3} alt="Extra 3" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300">Product Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe fabric, material, embroidery, packaging, delivery details..."
                  value={productFormDescription}
                  onChange={(e) => setProductFormDescription(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Buy URL (optional) */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300">External Buy URL (ঐচ্ছিক এক্সটার্নাল লিংক)</label>
                <input
                  type="text"
                  placeholder="https://... (Optional)"
                  value={productFormBuyUrl}
                  onChange={(e) => setProductFormBuyUrl(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-400 to-amber-500 hover:from-amber-300 text-black font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-amber-400/20"
                >
                  {editingProductItem ? 'Update Product (প্রোডাক্ট আপডেট করুন)' : 'Add to Catalog (পণ্য সেভ করুন)'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-5 py-3 rounded-xl border border-zinc-700 text-zinc-400 hover:text-white text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Universal In-App Delete Confirmation Modal (ইন্টারফেস কনফার্মেশন মোডাল) */}
      {deleteConfirmModal && (
        <DeleteConfirmModal
          isOpen={deleteConfirmModal.isOpen}
          title={deleteConfirmModal.title}
          titleBn={deleteConfirmModal.titleBn}
          itemName={deleteConfirmModal.itemName}
          message={deleteConfirmModal.message}
          onConfirm={deleteConfirmModal.onConfirm}
          onClose={() => setDeleteConfirmModal(null)}
        />
      )}
    </div>
  );
};
