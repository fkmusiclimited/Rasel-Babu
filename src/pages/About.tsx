import React from 'react';
import { useData } from '../context/DataContext';
import { AdSlot } from '../components/ads/AdSlot';
import { Award, Music, Film, Mic, Sparkles, HeartHandshake, CheckCircle, Play } from 'lucide-react';
import { PORTRAIT_IMAGE, STUDIO_IMAGE } from '../data/seedData';

interface AboutProps {
  onNavigate: (path: string) => void;
}

export const About: React.FC<AboutProps> = ({ onNavigate }) => {
  const { homepageSettings } = useData();
  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header Kicker & Title */}
        <div className="max-w-3xl space-y-4">
          <span className="text-xs font-mono uppercase tracking-widest text-amber-400">
            Artist Biography & Journey
          </span>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight">
            Rasel Babu
          </h1>
          <p className="text-lg text-zinc-300 leading-relaxed">
            A distinctive vocal presence celebrating the rich poetic traditions of Bangladesh while exploring bold contemporary expressions across playback, stage concerts, and acoustic arts.
          </p>
        </div>

        {/* 1. Main Bio Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-amber-500/30 shadow-2xl shadow-black">
              <img
                src={homepageSettings.aboutImageUrl || homepageSettings.heroImageUrl || PORTRAIT_IMAGE}
                alt="Rasel Babu Celebrity Portrait"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6">
                <p className="font-display text-2xl font-bold text-white">Rasel Babu</p>
                <p className="text-xs text-amber-300">Vocalist · Composer · Cultural Performer</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6 text-zinc-300 text-sm sm:text-base leading-relaxed">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
              {homepageSettings.aboutHeadline || 'About Rasel Babu'}
            </h2>

            <p>
              {homepageSettings.aboutBio1 || 'Rasel Babu is a Bangladeshi Actor, Singer, Lyricist, Model, and Music Artist associated with FK Music. He was born and raised in Kashipur, Fulbari, Kurigram, Bangladesh, and his city is Rangpur. He completed his Secondary School Certificate (SSC) from Kashipur High School in 2019 and completed his Higher Secondary education from Kashipur Degree College in 2022. In 2026, he completed his Bachelor of Arts (BA) degree from Kurigram Government College.'}
            </p>

            <p>
              {homepageSettings.aboutBio2 || 'Alongside his academic journey, Rasel Babu has been actively involved in modeling, singing, acting, songwriting, and various creative entertainment projects. He continues to pursue his passion for music and the entertainment industry, working on new songs, music videos, stage performances, and collaborations through FK Music.'}
            </p>

            {/* Personal Information Card */}
            <div className="p-6 rounded-2xl bg-zinc-900/70 border border-amber-500/30 space-y-4">
              <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>Personal Information</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800">
                  <span className="text-zinc-500 uppercase font-mono text-[10px] block">Full Name</span>
                  <span className="text-white font-semibold text-sm">Rasel Babu</span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800">
                  <span className="text-zinc-500 uppercase font-mono text-[10px] block">Profession</span>
                  <span className="text-amber-400 font-semibold text-sm">Actor, Singer, Lyricist &amp; Model</span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800">
                  <span className="text-zinc-500 uppercase font-mono text-[10px] block">Music Affiliation</span>
                  <span className="text-pink-400 font-semibold text-sm">FK Music</span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800">
                  <span className="text-zinc-500 uppercase font-mono text-[10px] block">City</span>
                  <span className="text-zinc-200 font-medium text-sm">Rangpur, Bangladesh</span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 sm:col-span-2">
                  <span className="text-zinc-500 uppercase font-mono text-[10px] block">Village &amp; Homeland</span>
                  <span className="text-zinc-200 font-medium text-sm">Kashipur, Fulbari, Kurigram, Bangladesh</span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800">
                  <span className="text-zinc-500 uppercase font-mono text-[10px] block">Secondary School Certificate (SSC)</span>
                  <span className="text-zinc-200 font-medium">Kashipur High School — 2019</span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800">
                  <span className="text-zinc-500 uppercase font-mono text-[10px] block">Higher Secondary Certificate (HSC)</span>
                  <span className="text-zinc-200 font-medium">Kashipur Degree College — 2022</span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 sm:col-span-2">
                  <span className="text-zinc-500 uppercase font-mono text-[10px] block">Bachelor's Degree</span>
                  <span className="text-amber-300 font-semibold text-sm">Bachelor of Arts (BA) — 2026</span>
                  <span className="text-zinc-400 text-xs block mt-0.5">Kurigram Government College</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Adsterra Placement: About Page Banner */}
        <AdSlot format="728x90" page="about" />

        {/* 2. Artistic Dimensions (Voice Acting, Stage, Playback) */}
        <div className="space-y-8">
          <div className="max-w-2xl">
            <span className="text-xs font-mono uppercase tracking-widest text-pink-400">
              Multi-Faceted Craft
            </span>
            <h2 className="font-display text-3xl font-bold text-white mt-1">
              Performance, Cinema & Voice Artistry
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-amber-400/40 transition-colors space-y-3">
              <div className="w-10 h-10 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                <Mic className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Film Playback Vocalist</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Featured playback singer for cinematic releases, delivering deeply emotional title tracks and duet themes for Bangladeshi feature films and telefilms.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-pink-400/40 transition-colors space-y-3">
              <div className="w-10 h-10 rounded-lg bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400">
                <Film className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Voice Acting & Narration</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Recognized voice artist lending resonant baritone narrative voiceovers to cultural documentaries, national television specials, and theatrical audio projects.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-amber-400/40 transition-colors space-y-3">
              <div className="w-10 h-10 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Global Stage Performer</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Headlined international festivals in the UK, UAE, and India, bringing traditional Bangladeshi instruments onto world-class audio production stages.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Studio Craft Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center bg-zinc-900/30 border border-zinc-800 rounded-3xl p-8 sm:p-12">
          <div className="lg:col-span-7 space-y-5">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400">
              In The Sound Laboratory
            </span>
            <h2 className="font-display text-3xl font-bold text-white">
              Studio Precision & Acoustic Purity
            </h2>
            <p className="text-sm text-zinc-300 leading-relaxed">
              Every arrangement recorded under Rasel Babu's supervision prioritizes organic instruments: custom handmade dotaras from Kushtia, deep bass percussion from Chittagong, and warm analog tubes.
            </p>
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-xs text-zinc-300">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero synthetic auto-tuning shortcuts; 100% genuine vocal delivery</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-300">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Collaboration with master Bengali folk instrumentalists and lyricists</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-300">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Dedicated mastering tailored for audiophile headphone listeners and stadiums alike</span>
              </div>
            </div>
            <div className="pt-4">
              <button
                onClick={() => onNavigate('/videos')}
                className="px-5 py-2.5 rounded-xl bg-amber-400 text-black font-semibold text-xs hover:bg-amber-300 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-black" />
                <span>Watch Official Videos (ভিডিও দেখুন)</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-2xl overflow-hidden border border-zinc-700 shadow-xl aspect-[4/3]">
              <img
                src={STUDIO_IMAGE}
                alt="Rasel Babu in Studio"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
