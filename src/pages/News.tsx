import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { AdSlot } from '../components/ads/AdSlot';
import {
  Calendar,
  Clock,
  ArrowRight,
  Share2,
  Copy,
  Check,
  Newspaper,
  Sparkles,
} from 'lucide-react';

interface NewsProps {
  onNavigate?: (path: string, param?: string) => void;
}

export const News: React.FC<NewsProps> = ({ onNavigate }) => {
  const { news } = useData();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Extract categories
  const categories = ['all', ...Array.from(new Set(news.map((n) => n.category).filter(Boolean)))];

  const filteredNews = selectedCategory === 'all'
    ? news
    : news.filter((n) => n.category.toLowerCase() === selectedCategory.toLowerCase());

  const handleOpenArticle = (articleId: string) => {
    if (onNavigate) {
      onNavigate('/news-detail', articleId);
    }
  };

  const handleCopyLink = async (e: React.MouseEvent, articleId: string) => {
    e.stopPropagation();
    const shareUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/?news=${encodeURIComponent(articleId)}`
      : `https://raselbabu.com/?news=${encodeURIComponent(articleId)}`;

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
      setCopiedId(articleId);
      setTimeout(() => setCopiedId(null), 2500);
    } catch (err) {
      console.warn('Failed to copy link:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-800/80 pb-8">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-mono uppercase tracking-wider">
              <Newspaper className="w-3.5 h-3.5" />
              <span>Official Press & News Desk · অফিসিয়াল নিউজ ও প্রেস রিলিজ</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
              News, Releases & Tour Diaries
            </h1>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Stay updated with official press statements, concert tour dates, studio milestones, interviews, and media reports from Rasel Babu Official Management & FK Music.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer capitalize ${
                  selectedCategory === cat
                    ? 'bg-amber-400 text-black font-bold shadow-md shadow-amber-400/20'
                    : 'bg-zinc-900/80 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                {cat === 'all' ? 'All Updates (সব)' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Adsterra Top Slot */}
        <div className="flex justify-center">
          <AdSlot format="728x90" page="news" responsive />
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredNews.map((article) => {
            const isCopied = copiedId === article.id;
            return (
              <article
                key={article.id}
                onClick={() => handleOpenArticle(article.id)}
                className="group rounded-3xl overflow-hidden bg-zinc-950/90 border border-zinc-800/80 hover:border-amber-400/50 transition-all duration-300 flex flex-col cursor-pointer shadow-xl hover:shadow-2xl hover:shadow-amber-400/5 hover:-translate-y-1"
              >
                {/* Cover Image Container */}
                <div className="aspect-[16/10] overflow-hidden bg-zinc-900 relative">
                  <img
                    src={article.coverImage}
                    alt={article.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                  {/* Category Badge */}
                  <span className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-amber-400/30 font-mono text-[10px] text-amber-300 font-bold uppercase tracking-wider">
                    {article.category}
                  </span>

                  {/* Share Icon Button on Top-Right */}
                  <button
                    onClick={(e) => handleCopyLink(e, article.id)}
                    className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-black/80 backdrop-blur-md border border-zinc-700 hover:border-amber-400 text-zinc-300 hover:text-white flex items-center justify-center transition-all cursor-pointer z-10"
                    title="Copy Share Link"
                  >
                    {isCopied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Share2 className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {/* Copied Feedback Toast */}
                  {isCopied && (
                    <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-emerald-500 text-black font-bold text-[10px] font-mono animate-fade-in shadow-lg">
                      লিংক কপি হয়েছে!
                    </div>
                  )}
                </div>

                {/* Content Container */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    {/* Meta line */}
                    <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-400">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" />
                        <span>{article.publishDate}</span>
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{article.readTime}</span>
                      </span>
                    </div>

                    {/* Headline */}
                    <h2 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug">
                      {article.title}
                    </h2>

                    {/* Summary */}
                    <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                      {article.summary}
                    </p>
                  </div>

                  {/* Footer actions */}
                  <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between">
                    <div className="text-[11px] text-zinc-400 font-medium">
                      By {article.author}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenArticle(article.id);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400/10 hover:bg-amber-400 text-amber-400 hover:text-black font-bold text-xs transition-all cursor-pointer group-hover:bg-amber-400 group-hover:text-black"
                    >
                      <span>আরও পড়ুন (See More)</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {filteredNews.length === 0 && (
          <div className="py-16 text-center space-y-3 rounded-2xl bg-zinc-950 border border-zinc-800">
            <Newspaper className="w-8 h-8 text-zinc-600 mx-auto" />
            <p className="text-sm text-zinc-400">এই ক্যাটাগরিতে বর্তমানে কোনো খবর পাওয়া যায়নি।</p>
            <button
              onClick={() => setSelectedCategory('all')}
              className="text-xs font-mono text-amber-400 underline cursor-pointer"
            >
              সব খবর দেখুন
            </button>
          </div>
        )}

        {/* Adsterra Bottom Slot */}
        <div className="flex justify-center pt-6">
          <AdSlot format="728x90" page="news" responsive />
        </div>
      </div>
    </div>
  );
};
