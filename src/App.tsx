/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { PersistentPlayer } from './components/audio/PersistentPlayer';
import { SocialBarAd } from './components/ads/SocialBarAd';
import { updateWebsiteFavicon } from './utils/imageCompress';

// Pages
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Gallery } from './pages/Gallery';
import { PhotoDetail } from './pages/PhotoDetail';
import { Music } from './pages/Music';
import { Videos } from './pages/Videos';
import { Shop } from './pages/Shop';
import { Distribution } from './pages/Distribution';
import { News } from './pages/News';
import { NewsDetail } from './pages/NewsDetail';
import { Contact } from './pages/Contact';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { UserDashboard } from './pages/UserDashboard';
import { AdminPanel } from './pages/AdminPanel';
import { ResetPassword } from './pages/ResetPassword';
import { LegalPages } from './pages/legal/LegalPages';
import { WaterRipple } from './components/effects/WaterRipple';
import { MusicAnimation } from './components/effects/MusicAnimation';
import { ProductDetailModal } from './components/shop/ProductDetailModal';

const MainContent: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('news')) {
        return '/news-detail';
      }
      if (window.location.pathname === '/reset-password') {
        return '/reset-password';
      }
      if (window.location.pathname === '/news-detail') {
        return '/news-detail';
      }
    }
    return '/';
  });
  const [currentParam, setCurrentParam] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const newsId = urlParams.get('news');
      if (newsId) return newsId;
    }
    return 'photo-1';
  });
  const { recordPageView, homepageSettings } = useData();

  const handleNavigate = (path: string, param?: string) => {
    setCurrentPath(path);
    if (param) setCurrentParam(param);
    recordPageView(path);
    if (typeof window !== 'undefined') {
      if (path === '/news-detail' && param) {
        window.history.pushState(null, '', `/?news=${encodeURIComponent(param)}`);
      } else if (path === '/news' && window.location.search.includes('news=')) {
        window.history.pushState(null, '', '/news');
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    recordPageView('/');
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const newsId = urlParams.get('news');
      if (newsId) {
        setCurrentPath('/news-detail');
        setCurrentParam(newsId);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Persist & sync website favicon to artist profile photo
  useEffect(() => {
    const iconUrl = homepageSettings.artistProfileSquare || homepageSettings.artistProfileImage;
    if (iconUrl) {
      updateWebsiteFavicon(iconUrl);
    }
  }, [homepageSettings.artistProfileSquare, homepageSettings.artistProfileImage]);

  return (
    <div className="min-h-screen flex flex-col bg-[#08080a] text-zinc-100 selection:bg-pink-600 selection:text-white">
      {/* Top Bar Navigation */}
      <Navbar currentPath={currentPath} onNavigate={handleNavigate} />

      {/* Main Page Body */}
      <main className="flex-1">
        {currentPath === '/' && <Home onNavigate={handleNavigate} />}
        {currentPath === '/about' && <About onNavigate={handleNavigate} />}
        {currentPath === '/gallery' && <Gallery onNavigate={handleNavigate} />}
        {currentPath === '/photo-detail' && (
          <PhotoDetail photoId={currentParam} onNavigate={handleNavigate} />
        )}
        {currentPath === '/music' && <Music />}
        {currentPath === '/videos' && <Videos />}
        {currentPath === '/shop' && <Shop />}
        {currentPath === '/distribution' && <Distribution />}
        {currentPath === '/news' && <News onNavigate={handleNavigate} />}
        {currentPath === '/news-detail' && (
          <NewsDetail newsId={currentParam} onNavigate={handleNavigate} />
        )}
        {currentPath === '/contact' && <Contact />}
        {currentPath === '/login' && <Login onNavigate={handleNavigate} />}
        {currentPath === '/signup' && <Signup onNavigate={handleNavigate} />}
        {currentPath === '/reset-password' && <ResetPassword onNavigate={handleNavigate} />}
        {currentPath === '/dashboard' && <UserDashboard onNavigate={handleNavigate} />}
        {currentPath === '/admin' && <AdminPanel onNavigate={handleNavigate} />}
        {currentPath === '/privacy' && <LegalPages page="privacy" onNavigate={handleNavigate} />}
        {currentPath === '/terms' && <LegalPages page="terms" onNavigate={handleNavigate} />}
        {currentPath === '/cookies' && <LegalPages page="cookies" onNavigate={handleNavigate} />}
        {currentPath === '/ad-disclosure' && (
          <LegalPages page="ad-disclosure" onNavigate={handleNavigate} />
        )}
      </main>

      {/* Background Subtle Music & Soundwave Ambient Animation */}
      <MusicAnimation />

      {/* Fluid Water Ripple Click Effect */}
      <WaterRipple />

      {/* Persistent Audio Player Bar */}
      <PersistentPlayer />

      {/* Adsterra Social Bar Widget */}
      <SocialBarAd />

      {/* Universal Product Detail Modal (যেকোনো পেজ থেকে প্রোডাক্ট ভিউ) */}
      <ProductDetailModal onNavigate={handleNavigate} />

      {/* Global Artist Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <MainContent />
      </DataProvider>
    </AuthProvider>
  );
}
