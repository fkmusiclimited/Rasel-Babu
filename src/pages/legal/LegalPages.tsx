import React from 'react';
import { ShieldCheck, ArrowLeft, Lock, FileText, Cookie, AlertCircle } from 'lucide-react';

interface LegalPageProps {
  page: 'privacy' | 'terms' | 'cookies' | 'ad-disclosure';
  onNavigate: (path: string) => void;
}

export const LegalPages: React.FC<LegalPageProps> = ({ page, onNavigate }) => {
  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <button
          onClick={() => onNavigate('/')}
          className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-amber-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Home</span>
        </button>

        {page === 'privacy' && (
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 sm:p-10 space-y-6">
            <div className="flex items-center gap-3 text-amber-400">
              <Lock className="w-6 h-6" />
              <h1 className="font-display text-3xl font-bold text-white">Privacy Policy</h1>
            </div>
            <p className="text-xs text-zinc-500 font-mono">Last updated: October 2026</p>

            <div className="space-y-4 text-xs sm:text-sm text-zinc-300 leading-relaxed">
              <p>
                Rasel Babu Official Artist Website ("we", "our", or "the Platform") respects the privacy of our visitors, fans, and business partners. This Privacy Policy outlines how information is gathered, managed, and safeguarded.
              </p>
              <h3 className="font-bold text-white text-base pt-2">1. Information We Collect</h3>
              <p>
                We collect personal information that you voluntarily provide when registering for the fan club, booking an event, or messaging administration. This may include your name, email address, telephone number, and message contents.
              </p>
              <h3 className="font-bold text-white text-base pt-2">2. Advertising & Analytics Partners</h3>
              <p>
                Our platform utilizes privacy-conscious analytics and third-party advertising partners, notably the Adsterra Advertising Network. These partners may use cookies or web beacons to serve advertisements based on prior visits to this website. No personal email or sensitive credentials are ever sold or shared with advertising partners.
              </p>
              <h3 className="font-bold text-white text-base pt-2">3. Account Approvals & Protection</h3>
              <p>
                Registrations require administrative verification. Passwords and sensitive user states are maintained securely with role-based protections.
              </p>
            </div>
          </div>
        )}

        {page === 'terms' && (
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 sm:p-10 space-y-6">
            <div className="flex items-center gap-3 text-pink-400">
              <FileText className="w-6 h-6" />
              <h1 className="font-display text-3xl font-bold text-white">Terms of Service</h1>
            </div>
            <p className="text-xs text-zinc-500 font-mono">Last updated: October 2026</p>

            <div className="space-y-4 text-xs sm:text-sm text-zinc-300 leading-relaxed">
              <p>
                By accessing or registering on the official website of Rasel Babu, you agree to comply with and be bound by these Terms of Service.
              </p>
              <h3 className="font-bold text-white text-base pt-2">1. Intellectual Property & Artist Rights</h3>
              <p>
                All music tracks, audio compositions, photographs, logos, and written materials displayed on this website are the intellectual property of Rasel Babu and affiliated rights-holders. Unauthorized commercial redistribution or duplication is prohibited.
              </p>
              <h3 className="font-bold text-white text-base pt-2">2. User Accounts & Approval Process</h3>
              <p>
                Submission of a registration request does not guarantee immediate member status. Management reserves the right to approve, reject, or terminate accounts that violate community decorum or engage in abusive behavior.
              </p>
              <h3 className="font-bold text-white text-base pt-2">3. Advertising Monetization Terms</h3>
              <p>
                Visitors acknowledge that advertisements served via Adsterra help finance original music releases and website operations. Artificial impression generation, click bots, or automated manipulation are strictly prohibited and actively filtered.
              </p>
            </div>
          </div>
        )}

        {page === 'cookies' && (
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 sm:p-10 space-y-6">
            <div className="flex items-center gap-3 text-amber-400">
              <Cookie className="w-6 h-6" />
              <h1 className="font-display text-3xl font-bold text-white">Cookie Policy</h1>
            </div>
            <p className="text-xs text-zinc-500 font-mono">Last updated: October 2026</p>

            <div className="space-y-4 text-xs sm:text-sm text-zinc-300 leading-relaxed">
              <p>
                This Cookie Policy explains how cookies and similar tracking technologies are utilized across our website to ensure smooth functionality and compliant advertising delivery.
              </p>
              <h3 className="font-bold text-white text-base pt-2">1. Essential Session Cookies</h3>
              <p>
                Necessary to maintain user authentication status, save local audio preferences, and protect member dashboard security.
              </p>
              <h3 className="font-bold text-white text-base pt-2">2. Advertising & Analytics Cookies</h3>
              <p>
                Used by Adsterra and future advertising networks to display contextual partner ads and prevent repetitive banner fatigue without generating intrusive pop-up traps.
              </p>
            </div>
          </div>
        )}

        {page === 'ad-disclosure' && (
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 sm:p-10 space-y-6">
            <div className="flex items-center gap-3 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
              <h1 className="font-display text-3xl font-bold text-white">
                Adsterra & Google AdSense Compliance Disclosure
              </h1>
            </div>
            <p className="text-xs text-zinc-500 font-mono">Monetization Integrity Statement</p>

            <div className="space-y-4 text-xs sm:text-sm text-zinc-300 leading-relaxed">
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 space-y-1">
                <span className="font-semibold text-amber-400 block">Strict Compliance Standard</span>
                <p>
                  This official artist website does not fabricate impressions, deploy forced clicks, utilize deceptive button triggers, or generate artificial traffic. All monetization is aligned with Adsterra Publisher Guidelines and Google AdSense technical specifications.
                </p>
              </div>

              <h3 className="font-bold text-white text-base pt-2">1. Reusable Ad Placement Architecture</h3>
              <p>
                All ad slots (728x90 Leaderboard, 300x250 Medium Rectangle, 320x50 Mobile Banner, and Social Bar) are housed in fixed containers with pre-calculated minimum dimensions to completely prevent Cumulative Layout Shift (CLS) and ensure a pristine user reading and listening experience.
              </p>

              <h3 className="font-bold text-white text-base pt-2">2. Clear Advertisement Labeling</h3>
              <p>
                Every advertising unit is distinctly marked with the standard label "ADVERTISEMENT · ADSTERRA NETWORK" to eliminate confusion with editorial artist navigation, albums, or booking controls.
              </p>

              <h3 className="font-bold text-white text-base pt-2">3. Google AdSense Compatibility</h3>
              <p>
                The website architecture maintains strict modularity: if Google AdSense is integrated in the future upon separate account approval, AdSense and Adsterra units operate under segregated publisher tags in compliance with both networks' policies.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
