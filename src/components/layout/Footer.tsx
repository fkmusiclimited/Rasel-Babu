import React from 'react';
import { Youtube, Facebook, Instagram, Music, MessageCircle, ExternalLink, ShieldCheck } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { PORTRAIT_IMAGE } from '../../data/seedData';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { homepageSettings } = useData();

  const youtubeUrl = homepageSettings.socialYoutube || 'https://www.youtube.com/@RaselBabuOfficial';
  const facebookUrl = homepageSettings.socialFacebook || 'https://www.facebook.com/RaselBabuOfficial';
  const instagramUrl = homepageSettings.socialInstagram || 'https://www.instagram.com/RaselBabuOfficial';
  const spotifyUrl = homepageSettings.socialSpotify || 'https://open.spotify.com/artist/RaselBabu';
  const copyrightText = homepageSettings.footerCopyright || '© 2026 Rasel Babu Official Artist Website. All Rights Reserved.';
  const taglineText = homepageSettings.footerTagline || 'Official artist website for Bangladeshi vocalist, composer, and live stage performer Rasel Babu. Connecting audiences worldwide through the soulful depth of Bengali melody and modern acoustic soundscapes.';

  return (
    <footer className="w-full bg-[#050507] border-t border-zinc-800/80 pt-16 pb-28 text-zinc-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-zinc-800/60">
          {/* Col 1 & 2: Brand & Artist Statement */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-amber-400/40 shrink-0 bg-zinc-900">
                <img
                  src={homepageSettings.websiteLogo || homepageSettings.artistProfileSquare || homepageSettings.artistProfileImage || PORTRAIT_IMAGE}
                  alt="Rasel Babu Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-display text-3xl font-bold tracking-tight text-white">
                RASEL BABU
              </span>
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-sm">
              {taglineText}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-red-400 hover:border-red-400/40 transition-colors"
                title="YouTube Official"
                aria-label="YouTube Official"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href={facebookUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-blue-400 hover:border-blue-400/40 transition-colors"
                title="Facebook Page"
                aria-label="Facebook Page"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-pink-400 hover:border-pink-400/40 transition-colors"
                title="Instagram"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={spotifyUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-emerald-400 hover:border-emerald-400/40 transition-colors"
                title="Spotify"
                aria-label="Spotify"
              >
                <Music className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/8801700000000?text=Booking%20Inquiry%20for%20Rasel%20Babu"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-green-400 hover:border-green-400/40 transition-colors"
                title="Direct WhatsApp Booking"
                aria-label="Direct WhatsApp Booking"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 3: Navigation */}
          <div>
            <h4 className="text-xs font-semibold text-zinc-100 uppercase tracking-wider mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button onClick={() => onNavigate('/')} className="hover:text-amber-400 transition-colors">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/about')} className="hover:text-amber-400 transition-colors">
                  About Rasel Babu
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/gallery')} className="hover:text-amber-400 transition-colors">
                  Photo Gallery
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/videos')} className="hover:text-amber-400 transition-colors">
                  Watch Videos (মিউজিক ভিডিও)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/shop')} className="hover:text-amber-400 transition-colors">
                  Official Store &amp; Merch (শপ)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/distribution')} className="hover:text-amber-400 transition-colors">
                  Music Distribution (মিউজিক ডিস্ট্রিবিউশন)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/news')} className="hover:text-amber-400 transition-colors">
                  News &amp; Tour Dates
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Fan Portal & Booking */}
          <div>
            <h4 className="text-xs font-semibold text-zinc-100 uppercase tracking-wider mb-4">
              Portal & Management
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button onClick={() => onNavigate('/contact')} className="hover:text-amber-400 transition-colors">
                  Concert Booking & Press
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/dashboard')} className="hover:text-amber-400 transition-colors">
                  Fan Member Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/login')} className="hover:text-amber-400 transition-colors">
                  Sign In
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/signup')} className="hover:text-amber-400 transition-colors">
                  Request Fan Registration
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/admin')} className="text-amber-400/80 hover:text-amber-400 transition-colors">
                  Administrative Console
                </button>
              </li>
            </ul>
          </div>

          {/* Col 5: Legal & Monetization Compliance */}
          <div>
            <h4 className="text-xs font-semibold text-zinc-100 uppercase tracking-wider mb-4">
              Legal & Compliance
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button onClick={() => onNavigate('/privacy')} className="hover:text-zinc-200 transition-colors">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/terms')} className="hover:text-zinc-200 transition-colors">
                  Terms of Service
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/cookies')} className="hover:text-zinc-200 transition-colors">
                  Cookie Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/ad-disclosure')} className="hover:text-zinc-200 transition-colors">
                  Adsterra & AdSense Disclosure
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <p>{copyrightText}</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-zinc-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Verified Artist Brand
            </span>
            <span>·</span>
            <span>Adsterra High Performance Partner</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
