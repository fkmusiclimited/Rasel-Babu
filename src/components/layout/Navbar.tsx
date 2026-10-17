import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, Shield, User as UserIcon, LogOut, Music2, Sparkles } from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate }) => {
  const { currentUser, logout, isAdminOrManager } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/gallery', label: 'Gallery' },
    { path: '/videos', label: 'Videos' },
    { path: '/shop', label: 'Shop' },
    { path: '/distribution', label: 'Music Distribution' },
    { path: '/news', label: 'News' },
    { path: '/contact', label: 'Booking' },
  ];

  const handleNavClick = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#08080a]/90 backdrop-blur-md border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6 px-4 sm:px-6 lg:px-8 h-18">
        {/* Zone 1: Brand wordmark with subtle music wave animation */}
        <button
          onClick={() => handleNavClick('/')}
          className="text-left group flex items-center gap-2 cursor-pointer focus:outline-none shrink-0"
        >
          <span className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors whitespace-nowrap">
            RASEL BABU
          </span>
          <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-pink-500" />
          {/* Subtle Live Music Soundwave Animation */}
          <div className="flex items-end gap-0.5 h-4 ml-0.5" title="Live Music Audio Waves">
            <span className="w-0.5 bg-amber-400 rounded-full animate-music-pulse-1" />
            <span className="w-0.5 bg-pink-500 rounded-full animate-music-pulse-2" />
            <span className="w-0.5 bg-cyan-400 rounded-full animate-music-pulse-3" />
            <span className="w-0.5 bg-amber-300 rounded-full animate-music-pulse-4" />
          </div>
        </button>

        {/* Zone 2: Navigation links */}
        <nav className="hidden lg:flex items-center gap-4.5 xl:gap-6 text-sm font-medium tracking-wide">
          {navLinks.map((link) => {
            const isActive = currentPath === link.path;
            return (
              <button
                key={link.path}
                onClick={() => handleNavClick(link.path)}
                className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'text-amber-400 font-semibold'
                    : 'text-zinc-300 hover:text-white'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions & Account */}
        <div className="hidden sm:flex items-center gap-2.5 shrink-0">
          {currentUser ? (
            <div className="flex items-center gap-2">
              {isAdminOrManager && (
                <button
                  onClick={() => handleNavClick('/admin')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                    currentPath === '/admin'
                      ? 'bg-amber-400 text-black font-semibold shadow-md shadow-amber-400/20'
                      : 'bg-zinc-900 text-amber-400 border border-amber-500/30 hover:bg-zinc-800 hover:border-amber-400/60'
                  }`}
                  title="Executive Administration Panel"
                >
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span>Admin Panel</span>
                </button>
              )}

              <button
                onClick={() => handleNavClick('/dashboard')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  currentPath === '/dashboard'
                    ? 'bg-pink-600 text-white font-semibold'
                    : 'bg-zinc-800 text-zinc-200 hover:text-white hover:bg-zinc-700'
                }`}
              >
                <UserIcon className="w-3.5 h-3.5 text-pink-400" />
                <span className="max-w-[100px] truncate">{currentUser.name.split(' ')[0]}</span>
              </button>

              <button
                onClick={logout}
                className="p-1.5 text-zinc-400 hover:text-red-400 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Log Out"
                aria-label="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleNavClick('/login')}
                className="px-3.5 py-1.5 text-xs font-medium text-zinc-200 hover:text-white bg-zinc-900 border border-zinc-700 hover:border-zinc-500 rounded-lg transition-colors cursor-pointer"
              >
                Sign In / লগইন
              </button>
              <button
                onClick={() => handleNavClick('/contact')}
                className="px-3.5 py-1.5 text-xs font-semibold text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-lg transition-all shadow-md shadow-amber-500/20 whitespace-nowrap shrink-0 cursor-pointer"
              >
                Book Artist
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={() => handleNavClick('/contact')}
            className="sm:hidden px-2.5 py-1 text-xs font-medium text-black bg-amber-400 rounded-md whitespace-nowrap"
          >
            Booking
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-zinc-300 hover:text-white rounded-md hover:bg-zinc-800"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-zinc-800 bg-[#0c0c10] px-4 pt-3 pb-6 space-y-2 animate-fade-in">
          <div className="grid grid-cols-2 gap-2 pt-1 pb-3 border-b border-zinc-800">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => handleNavClick(link.path)}
                className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  currentPath === link.path
                    ? 'bg-amber-400/10 text-amber-400 font-semibold border border-amber-400/30'
                    : 'text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="pt-2 flex flex-col gap-2">
            {currentUser && isAdminOrManager && (
              <button
                onClick={() => handleNavClick('/admin')}
                className={`w-full text-left px-3 py-2 text-sm rounded-lg flex items-center justify-between font-medium cursor-pointer ${
                  currentPath === '/admin'
                    ? 'bg-amber-400 text-black font-semibold'
                    : 'bg-zinc-900 text-amber-400 border border-amber-500/40 hover:bg-zinc-800'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span>Admin Panel (Executive Portal)</span>
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300">
                  ADMIN
                </span>
              </button>
            )}

            {currentUser ? (
              <>
                <button
                  onClick={() => handleNavClick('/dashboard')}
                  className="w-full text-left px-3 py-2 text-sm text-zinc-200 bg-zinc-800/80 rounded-lg flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-pink-400" />
                    User Dashboard ({currentUser.name})
                  </span>
                  <span className="text-xs uppercase text-zinc-400">{currentUser.status}</span>
                </button>

                <button
                  onClick={logout}
                  className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-zinc-800/80 rounded-lg flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleNavClick('/login')}
                  className="px-3 py-2 text-center text-sm font-medium text-zinc-200 bg-zinc-800 rounded-lg"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNavClick('/signup')}
                  className="px-3 py-2 text-center text-sm font-medium text-black bg-amber-400 rounded-lg font-semibold"
                >
                  Join Fan Club
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
