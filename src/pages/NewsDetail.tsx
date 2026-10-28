import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { AdSlot } from '../components/ads/AdSlot';
import {
  Calendar,
  Clock,
  ArrowLeft,
  User,
  Share2,
  Copy,
  Check,
  Tag,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface NewsDetailProps {
  newsId?: string;
  onNavigate: (path: string, param?: string) => void;
}

export const NewsDetail: React.FC<NewsDetailProps> = ({ newsId, onNavigate }) => {
  const { news } = useData();
  const [copied, setCopied] = useState(false);

  // Find the selected article by id or slug
  const article = news.find((n) => n.id === newsId || n.slug === newsId) || news[0];

  // Related articles (excluding current)
  const relatedNews = news.filter((n) => n.id !== article?.id).slice(0, 3);

  // Compute shareable URL
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/?news=${encodeURIComponent(article?.id || '')}`
    : `https://raselbabu.com/?news=${encodeURIComponent(article?.id || '')}`;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [newsId]);

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.warn('Failed to copy share link:', err);
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`${article?.title}\n\nRead full article:\n${shareUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(article?.title || 'Rasel Babu Official News');
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  if (!article) {
    return (
      <div className="min-h-screen bg-[#08080a] text-zinc-100 py-16 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md px-4">
          <p className="text-zinc-400">কোনো খবর পাওয়া যায়নি (Article Not Found)</p>
          <button
            onClick={() => onNavigate('/news')}
            className="px-5 py-2.5 rounded-xl bg-amber-400 text-black font-bold text-xs hover:bg-amber-300 transition-colors cursor-pointer"
          >
            ← সব খবরে ফিরে যান
          </button>
        </div>
      </div>
    );
  }

  // Format paragraphs
  const paragraphs = article.content
    ? article.content.split('\n\n').filter((p) => p.trim().length > 0)
    : [];

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <button
            onClick={() => onNavigate('/news')}
            className="inline-flex items-center gap-2 text-xs font-mono font-medium text-zinc-400 hover:text-amber-400 transition-colors group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>সব খবর (Back to All News)</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-amber-400/50 text-xs font-mono text-zinc-300 hover:text-white transition-colors cursor-pointer"
              title="Copy share link"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">লিংক কপি হয়েছে!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-amber-400" />
                  <span>শেয়ার লিংক</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Adsterra Top Ad Banner */}
        <div className="flex justify-center">
          <AdSlot format="728x90" page="news" responsive />
        </div>

        {/* Article Header */}
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 font-mono text-xs font-semibold uppercase tracking-wider">
              {article.category || 'Official Press'}
            </span>
            <span className="text-zinc-600">·</span>
            <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>{article.publishDate}</span>
            </div>
            <span className="text-zinc-600">·</span>
            <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{article.readTime || '3 min read'}</span>
            </div>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            {article.title}
          </h1>

          <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 to-pink-600 flex items-center justify-center text-black font-bold text-xs">
                RB
              </div>
              <div>
                <span className="text-white font-medium block">{article.author || 'Rasel Babu Official Media'}</span>
                <span className="text-[11px] text-zinc-500 font-mono">Verified Press Desk · FK Music</span>
              </div>
            </div>

            {/* Quick Share Buttons */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono text-zinc-500 hidden sm:inline">Share:</span>
              <button
                onClick={handleShareWhatsApp}
                className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400 flex items-center justify-center transition-colors cursor-pointer"
                title="Share via WhatsApp"
              >
                <span className="text-[11px] font-bold">WA</span>
              </button>
              <button
                onClick={handleShareFacebook}
                className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20 text-blue-400 flex items-center justify-center transition-colors cursor-pointer"
                title="Share on Facebook"
              >
                <span className="text-[11px] font-bold">FB</span>
              </button>
              <button
                onClick={handleShareTwitter}
                className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Share on X"
              >
                <span className="text-[11px] font-bold">𝕏</span>
              </button>
            </div>
          </div>
        </header>

        {/* Featured Cover Image */}
        <div className="rounded-3xl overflow-hidden bg-zinc-950 border border-zinc-800/90 shadow-2xl relative aspect-[16/9]">
          <img
            src={article.coverImage}
            alt={article.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Lead Summary Callout */}
        {article.summary && (
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-zinc-900/60 to-zinc-900/40 border-l-4 border-amber-400 border-y border-r border-zinc-800">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Executive Summary (মূল সারাংশ)</span>
            </div>
            <p className="text-base sm:text-lg text-zinc-200 font-medium leading-relaxed italic">
              "{article.summary}"
            </p>
          </div>
        )}

        {/* Article Body Content */}
        <article className="prose prose-invert max-w-none space-y-6 text-zinc-300 text-base sm:text-lg leading-relaxed">
          {paragraphs.length > 0 ? (
            paragraphs.map((p, idx) => (
              <React.Fragment key={idx}>
                <p className="whitespace-pre-line leading-relaxed text-zinc-300">
                  {p}
                </p>

                {/* In-Article Adsterra Placement (300x250) after paragraph 2 */}
                {idx === 1 && (
                  <div className="my-8 p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 flex flex-col items-center justify-center space-y-2 not-prose">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                      Sponsored Advertisement · বিজ্ঞাপন
                    </span>
                    <AdSlot format="300x250" page="news" />
                  </div>
                )}
              </React.Fragment>
            ))
          ) : (
            <p className="whitespace-pre-line leading-relaxed text-zinc-300">
              {article.content}
            </p>
          )}
        </article>

        {/* Article Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="pt-4 border-t border-zinc-800 flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-zinc-500 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-amber-400" />
              <span>ট্যাগসমূহ:</span>
            </span>
            {article.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400 hover:text-amber-300 transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Social Share Box */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Share2 className="w-4 h-4 text-amber-400" />
                <span>খবরটি বন্ধুদের সাথে শেয়ার করুন (Share This Article)</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                রাসেল বাবুর অফিসিয়াল প্রেস বিজ্ঞপ্তি সোশ্যাল মিডিয়ায় ছড়িয়ে দিন।
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-amber-400/20"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-black" />
                    <span>কপি সম্পন্ন!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-black" />
                    <span>লিংক কপি করুন</span>
                  </>
                )}
              </button>
              <button
                onClick={handleShareWhatsApp}
                className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
              >
                WhatsApp
              </button>
              <button
                onClick={handleShareFacebook}
                className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
              >
                Facebook
              </button>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-black/60 border border-zinc-800/80 flex items-center justify-between text-xs font-mono text-zinc-400">
            <span className="truncate mr-3 select-all">{shareUrl}</span>
            <button
              onClick={handleCopyLink}
              className="text-amber-400 hover:text-amber-300 shrink-0 font-semibold cursor-pointer"
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Adsterra Bottom Ad Banner */}
        <div className="flex justify-center pt-4">
          <AdSlot format="728x90" page="news" responsive />
        </div>

        {/* Related News Section */}
        {relatedNews.length > 0 && (
          <div className="pt-8 border-t border-zinc-800/80 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-amber-400">
                  More Updates
                </span>
                <h3 className="font-display text-2xl font-bold text-white">
                  আরও খবর ও প্রেস রিলিজ (Related Articles)
                </h3>
              </div>
              <button
                onClick={() => onNavigate('/news')}
                className="text-xs font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
              >
                <span>সব দেখুন</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {relatedNews.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onNavigate('/news-detail', item.id)}
                  className="group rounded-2xl overflow-hidden bg-zinc-950/80 border border-zinc-800/80 hover:border-amber-400/50 transition-all cursor-pointer flex flex-col"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-zinc-900 relative">
                    <img
                      src={item.coverImage}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 font-mono text-[9px] text-amber-400 uppercase">
                      {item.category}
                    </span>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                    <div className="space-y-1">
                      <div className="text-[10px] font-mono text-zinc-500 flex items-center gap-2">
                        <span>{item.publishDate}</span>
                        <span>·</span>
                        <span>{item.readTime}</span>
                      </div>
                      <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-2">
                        {item.title}
                      </h4>
                    </div>
                    <span className="text-[11px] font-mono text-amber-400 flex items-center gap-1 pt-1">
                      পড়ুন <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
