import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  onSnapshot,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './config';
import { PhotoItem, Product, VideoItem, HomepageSettings, NewsArticle } from '../types';

/**
 * Remove any undefined values recursively before passing to Firestore
 * to prevent 'Unsupported field value: undefined' errors.
 */
function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeForFirestore(item)) as unknown as T;
  }
  if (typeof data === 'object') {
    const clean: Record<string, any> = {};
    for (const [key, value] of Object.entries(data as Record<string, any>)) {
      if (value !== undefined) {
        clean[key] = sanitizeForFirestore(value);
      }
    }
    return clean as T;
  }
  return data;
}

// ---------------------------------------------------------------------------
// Homepage Settings & Artist Profile Photo
// ---------------------------------------------------------------------------
const SETTINGS_DOC_REF = doc(db, 'settings', 'homepage');

export function subscribeToHomepageSettings(
  onUpdate: (settings: HomepageSettings) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  return onSnapshot(
    SETTINGS_DOC_REF,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data() as HomepageSettings;
        onUpdate(data);
      }
    },
    (error) => {
      console.warn('Firestore settings subscription error:', error);
      if (onError) onError(error);
    }
  );
}

export async function fetchHomepageSettingsFromFirestore(): Promise<HomepageSettings | null> {
  try {
    const snap = await getDoc(SETTINGS_DOC_REF);
    if (snap.exists()) {
      return snap.data() as HomepageSettings;
    }
    return null;
  } catch (error) {
    console.warn('Failed to fetch settings from Firestore:', error);
    return null;
  }
}

export async function saveHomepageSettingsToFirestore(
  settings: Partial<HomepageSettings>
): Promise<{ success: boolean; message?: string }> {
  try {
    const sanitized = sanitizeForFirestore(settings);
    await setDoc(SETTINGS_DOC_REF, sanitized, { merge: true });
    return {
      success: true,
      message: 'সেটিংস সফলভাবে গুগল ক্লাউড ফায়ারবেসে সংরক্ষিত হয়েছে এবং সব ভিজিটর ও ডিভাইসের জন্য রিয়েল-টাইমে আপডেট হয়েছে!',
    };
  } catch (err: any) {
    console.error('saveHomepageSettingsToFirestore failed:', err);
    return {
      success: false,
      message: 'ফায়ারবেসে সংরক্ষণ ব্যর্থ হয়েছে: ' + (err?.message || 'Unknown Firestore error'),
    };
  }
}

// ---------------------------------------------------------------------------
// Gallery Photos (Real-Time across all browsers, mobile & desktop)
// ---------------------------------------------------------------------------
const PHOTOS_COLLECTION = collection(db, 'photos');

export function subscribeToPhotos(
  onUpdate: (photos: PhotoItem[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  return onSnapshot(
    PHOTOS_COLLECTION,
    (snapshot) => {
      const list: PhotoItem[] = [];
      snapshot.forEach((d) => {
        const item = d.data() as PhotoItem;
        list.push({ ...item, id: d.id || item.id });
      });
      // Sort newest first if dates are available
      list.sort((a, b) => {
        const tA = new Date(a.date || 0).getTime();
        const tB = new Date(b.date || 0).getTime();
        return tB - tA;
      });
      onUpdate(list);
    },
    (error) => {
      console.warn('Firestore photos subscription error:', error);
      if (onError) onError(error);
    }
  );
}

export async function fetchPhotosFromFirestore(): Promise<PhotoItem[] | null> {
  try {
    const snapshot = await getDocs(PHOTOS_COLLECTION);
    const list: PhotoItem[] = [];
    snapshot.forEach((d) => {
      const item = d.data() as PhotoItem;
      list.push({ ...item, id: d.id || item.id });
    });
    list.sort((a, b) => {
      const tA = new Date(a.date || 0).getTime();
      const tB = new Date(b.date || 0).getTime();
      return tB - tA;
    });
    return list;
  } catch (err) {
    console.warn('Failed to fetch photos from Firestore:', err);
    return null;
  }
}

export async function savePhotoToFirestore(
  photo: PhotoItem
): Promise<{ success: boolean; message?: string }> {
  try {
    const sanitized = sanitizeForFirestore(photo);
    await setDoc(doc(db, 'photos', photo.id), sanitized, { merge: true });
    return {
      success: true,
      message: 'ছবি সফলভাবে ক্লাউডে সেভ হয়েছে এবং সব ভিজিটরের স্ক্রিনে প্রদর্শিত হচ্ছে!',
    };
  } catch (err: any) {
    console.error('savePhotoToFirestore error:', err);
    return {
      success: false,
      message: 'ছবি ক্লাউডে সেভ করতে ব্যর্থ: ' + (err?.message || 'Firestore error'),
    };
  }
}

export async function updatePhotoInFirestore(
  id: string,
  updates: Partial<PhotoItem>
): Promise<{ success: boolean; message?: string }> {
  try {
    const sanitized = sanitizeForFirestore(updates);
    await updateDoc(doc(db, 'photos', id), sanitized);
    return {
      success: true,
      message: 'ছবির তথ্য ক্লাউডে আপডেট হয়েছে!',
    };
  } catch (err: any) {
    console.error('updatePhotoInFirestore error:', err);
    return {
      success: false,
      message: 'ছবির তথ্য আপডেট করতে ব্যর্থ: ' + (err?.message || 'Firestore error'),
    };
  }
}

export async function deletePhotoFromFirestore(
  id: string
): Promise<{ success: boolean; message?: string }> {
  try {
    await deleteDoc(doc(db, 'photos', id));
    return {
      success: true,
      message: 'ছবি সফলভাবে ক্লাউড থেকে মুছে ফেলা হয়েছে!',
    };
  } catch (err: any) {
    console.error('deletePhotoFromFirestore error:', err);
    return {
      success: false,
      message: 'ছবি মুছতে ব্যর্থ: ' + (err?.message || 'Firestore error'),
    };
  }
}

export async function batchSyncPhotosToFirestore(
  photos: PhotoItem[]
): Promise<{ success: boolean; count: number; message?: string }> {
  try {
    const batch = writeBatch(db);
    for (const p of photos) {
      const sanitized = sanitizeForFirestore(p);
      const ref = doc(db, 'photos', p.id);
      batch.set(ref, sanitized, { merge: true });
    }
    await batch.commit();
    return {
      success: true,
      count: photos.length,
      message: `${photos.length} টি ছবি সফলভাবে ক্লাউড ফায়ারবেসে সংরক্ষিত হয়েছে!`,
    };
  } catch (err: any) {
    console.error('batchSyncPhotosToFirestore error:', err);
    return {
      success: false,
      count: 0,
      message: 'ক্লাউড সিঙ্ক ব্যর্থ হয়েছে: ' + (err?.message || 'Firestore batch error'),
    };
  }
}

export async function deleteDemoPhotosFromFirestore(): Promise<{ success: boolean; message: string }> {
  try {
    const demoIds = ['photo-1', 'photo-2', 'photo-3', 'photo-4', 'photo-5', 'photo-6', 'photo-7', 'photo-8'];
    const batch = writeBatch(db);
    for (const id of demoIds) {
      batch.delete(doc(db, 'photos', id));
    }
    await batch.commit();
    return {
      success: true,
      message: 'সব ডেমো ছবি সফলভাবে ক্লাউড থেকে মুছে ফেলা হয়েছে!',
    };
  } catch (err: any) {
    return {
      success: false,
      message: 'ডেমো ছবি মুছতে ব্যর্থ: ' + (err?.message || 'Firestore error'),
    };
  }
}

// ---------------------------------------------------------------------------
// Shop Products (Merchandise, Fan Apparel, Dress, etc.)
// ---------------------------------------------------------------------------
const PRODUCTS_COLLECTION = collection(db, 'products');

export function subscribeToProducts(
  onUpdate: (products: Product[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  return onSnapshot(
    PRODUCTS_COLLECTION,
    (snapshot) => {
      if (!snapshot.empty) {
        const list: Product[] = [];
        snapshot.forEach((d) => {
          const item = d.data() as Product;
          list.push({ ...item, id: d.id || item.id });
        });
        onUpdate(list);
      }
    },
    (error) => {
      console.warn('Firestore products subscription error:', error);
      if (onError) onError(error);
    }
  );
}

export async function fetchProductsFromFirestore(): Promise<Product[] | null> {
  try {
    const snapshot = await getDocs(PRODUCTS_COLLECTION);
    if (!snapshot.empty) {
      const list: Product[] = [];
      snapshot.forEach((d) => {
        const item = d.data() as Product;
        list.push({ ...item, id: d.id || item.id });
      });
      return list;
    }
    return null;
  } catch (err) {
    console.warn('Failed to fetch products from Firestore:', err);
    return null;
  }
}

export async function saveProductToFirestore(
  prod: Product
): Promise<{ success: boolean; message?: string }> {
  try {
    const sanitized = sanitizeForFirestore(prod);
    await setDoc(doc(db, 'products', prod.id), sanitized, { merge: true });
    return {
      success: true,
      message: 'প্রোডাক্ট ক্লাউড স্টোরে সফলভাবে যোগ হয়েছে এবং সব ক্রেতার জন্য দৃশ্যমান!',
    };
  } catch (err: any) {
    console.error('saveProductToFirestore error:', err);
    return {
      success: false,
      message: 'প্রোডাক্ট ক্লাউডে সংরক্ষণ ব্যর্থ: ' + (err?.message || 'Firestore error'),
    };
  }
}

export async function updateProductInFirestore(
  id: string,
  updates: Partial<Product>
): Promise<{ success: boolean; message?: string }> {
  try {
    const sanitized = sanitizeForFirestore(updates);
    await updateDoc(doc(db, 'products', id), sanitized);
    return {
      success: true,
      message: 'প্রোডাক্ট সফলভাবে আপডেট হয়েছে!',
    };
  } catch (err: any) {
    console.error('updateProductInFirestore error:', err);
    return {
      success: false,
      message: 'প্রোডাক্ট আপডেট ব্যর্থ: ' + (err?.message || 'Firestore error'),
    };
  }
}

export async function deleteProductFromFirestore(
  id: string
): Promise<{ success: boolean; message?: string }> {
  try {
    await deleteDoc(doc(db, 'products', id));
    return {
      success: true,
      message: 'প্রোডাক্ট সফলভাবে মুছে ফেলা হয়েছে!',
    };
  } catch (err: any) {
    console.error('deleteProductFromFirestore error:', err);
    return {
      success: false,
      message: 'প্রোডাক্ট ডিলিট ব্যর্থ: ' + (err?.message || 'Firestore error'),
    };
  }
}

export async function batchSyncProductsToFirestore(
  products: Product[]
): Promise<{ success: boolean; count: number; message?: string }> {
  try {
    const batch = writeBatch(db);
    for (const p of products) {
      const sanitized = sanitizeForFirestore(p);
      const ref = doc(db, 'products', p.id);
      batch.set(ref, sanitized, { merge: true });
    }
    await batch.commit();
    return {
      success: true,
      count: products.length,
      message: `${products.length} টি প্রোডাক্ট ক্লাউডে সংরক্ষিত হয়েছে!`,
    };
  } catch (err: any) {
    console.error('batchSyncProductsToFirestore error:', err);
    return {
      success: false,
      count: 0,
      message: 'প্রোডাক্ট ক্লাউড সিঙ্ক ব্যর্থ: ' + (err?.message || 'Firestore batch error'),
    };
  }
}

// ---------------------------------------------------------------------------
// Videos (YouTube Videos catalog)
// ---------------------------------------------------------------------------
const VIDEOS_COLLECTION = collection(db, 'videos');

export function subscribeToVideos(
  onUpdate: (videos: VideoItem[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  return onSnapshot(
    VIDEOS_COLLECTION,
    (snapshot) => {
      if (!snapshot.empty) {
        const list: VideoItem[] = [];
        snapshot.forEach((d) => {
          const item = d.data() as VideoItem;
          list.push({ ...item, id: d.id || item.id });
        });
        onUpdate(list);
      }
    },
    (error) => {
      console.warn('Firestore videos subscription error:', error);
      if (onError) onError(error);
    }
  );
}

export async function fetchVideosFromFirestore(): Promise<VideoItem[] | null> {
  try {
    const snapshot = await getDocs(VIDEOS_COLLECTION);
    if (!snapshot.empty) {
      const list: VideoItem[] = [];
      snapshot.forEach((d) => {
        const item = d.data() as VideoItem;
        list.push({ ...item, id: d.id || item.id });
      });
      return list;
    }
    return null;
  } catch (err) {
    console.warn('Failed to fetch videos from Firestore:', err);
    return null;
  }
}

export async function saveVideoToFirestore(
  video: VideoItem
): Promise<{ success: boolean; message?: string }> {
  try {
    const sanitized = sanitizeForFirestore(video);
    await setDoc(doc(db, 'videos', video.id), sanitized, { merge: true });
    return {
      success: true,
      message: 'ভিডিও সফলভাবে ক্লাউডে সংরক্ষিত হয়েছে!',
    };
  } catch (err: any) {
    console.error('saveVideoToFirestore error:', err);
    return {
      success: false,
      message: 'ভিডিও সংরক্ষণ ব্যর্থ: ' + (err?.message || 'Firestore error'),
    };
  }
}

export async function updateVideoInFirestore(
  id: string,
  updates: Partial<VideoItem>
): Promise<{ success: boolean; message?: string }> {
  try {
    const sanitized = sanitizeForFirestore(updates);
    await updateDoc(doc(db, 'videos', id), sanitized);
    return {
      success: true,
      message: 'ভিডিও সফলভাবে আপডেট হয়েছে!',
    };
  } catch (err: any) {
    console.error('updateVideoInFirestore error:', err);
    return {
      success: false,
      message: 'ভিডিও আপডেট ব্যর্থ: ' + (err?.message || 'Firestore error'),
    };
  }
}

export async function deleteVideoFromFirestore(
  id: string
): Promise<{ success: boolean; message?: string }> {
  try {
    await deleteDoc(doc(db, 'videos', id));
    return {
      success: true,
      message: 'ভিডিও মুছে ফেলা হয়েছে!',
    };
  } catch (err: any) {
    console.error('deleteVideoFromFirestore error:', err);
    return {
      success: false,
      message: 'ভিডিও মুছতে ব্যর্থ: ' + (err?.message || 'Firestore error'),
    };
  }
}

// ---------------------------------------------------------------------------
// News & Press Releases (Live synced across all devices and visitors)
// ---------------------------------------------------------------------------
const NEWS_COLLECTION = collection(db, 'news');

export function subscribeToNews(
  onUpdate: (news: NewsArticle[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  return onSnapshot(
    NEWS_COLLECTION,
    (snapshot) => {
      if (!snapshot.empty) {
        const list: NewsArticle[] = [];
        snapshot.forEach((d) => {
          const item = d.data() as NewsArticle;
          list.push({ ...item, id: d.id || item.id });
        });
        // Sort newest first by publishDate or id
        list.sort((a, b) => (b.publishDate || '').localeCompare(a.publishDate || '') || b.id.localeCompare(a.id));
        onUpdate(list);
      }
    },
    (error) => {
      console.warn('Firestore news subscription error:', error);
      if (onError) onError(error);
    }
  );
}

export async function fetchNewsFromFirestore(): Promise<NewsArticle[] | null> {
  try {
    const snapshot = await getDocs(NEWS_COLLECTION);
    if (!snapshot.empty) {
      const list: NewsArticle[] = [];
      snapshot.forEach((d) => {
        const item = d.data() as NewsArticle;
        list.push({ ...item, id: d.id || item.id });
      });
      list.sort((a, b) => (b.publishDate || '').localeCompare(a.publishDate || '') || b.id.localeCompare(a.id));
      return list;
    }
    return null;
  } catch (err) {
    console.warn('Failed to fetch news from Firestore:', err);
    return null;
  }
}

export async function saveNewsToFirestore(
  article: NewsArticle
): Promise<{ success: boolean; message?: string }> {
  try {
    const sanitized = sanitizeForFirestore(article);
    await setDoc(doc(db, 'news', article.id), sanitized, { merge: true });
    return {
      success: true,
      message: 'নিউজ সফলভাবে ক্লাউড ডাটাবেজে সংরক্ষিত হয়েছে এবং সব ভিজিটরের জন্য লাইভ হয়েছে!',
    };
  } catch (err: any) {
    console.error('saveNewsToFirestore error:', err);
    return {
      success: false,
      message: 'নিউজ সংরক্ষণ ব্যর্থ: ' + (err?.message || 'Firestore error'),
    };
  }
}

export async function updateNewsInFirestore(
  id: string,
  updates: Partial<NewsArticle>
): Promise<{ success: boolean; message?: string }> {
  try {
    const sanitized = sanitizeForFirestore(updates);
    await updateDoc(doc(db, 'news', id), sanitized);
    return {
      success: true,
      message: 'নিউজ সফলভাবে ক্লাউডে আপডেট হয়েছে!',
    };
  } catch (err: any) {
    console.error('updateNewsInFirestore error:', err);
    return {
      success: false,
      message: 'নিউজ আপডেট ব্যর্থ: ' + (err?.message || 'Firestore error'),
    };
  }
}

export async function deleteNewsFromFirestore(
  id: string
): Promise<{ success: boolean; message?: string }> {
  try {
    await deleteDoc(doc(db, 'news', id));
    return {
      success: true,
      message: 'নিউজ আর্টিকেল সফলভাবে ক্লাউড ডাটাবেজ থেকে মুছে ফেলা হয়েছে!',
    };
  } catch (err: any) {
    console.error('deleteNewsFromFirestore error:', err);
    return {
      success: false,
      message: 'নিউজ মুছতে ব্যর্থ: ' + (err?.message || 'Firestore error'),
    };
  }
}

export async function batchSyncNewsToFirestore(
  articles: NewsArticle[]
): Promise<{ success: boolean; message?: string }> {
  try {
    const batch = writeBatch(db);
    articles.forEach((article) => {
      const docRef = doc(db, 'news', article.id);
      const sanitized = sanitizeForFirestore(article);
      batch.set(docRef, sanitized, { merge: true });
    });
    await batch.commit();
    return {
      success: true,
      message: `${articles.length} টি নিউজ আর্টিকেল সফলভাবে ক্লাউডে সিঙ্ক হয়েছে!`,
    };
  } catch (err: any) {
    console.error('batchSyncNewsToFirestore error:', err);
    return {
      success: false,
      message: 'ক্লাউড সিঙ্ক ব্যর্থ: ' + (err?.message || 'Firestore error'),
    };
  }
}

