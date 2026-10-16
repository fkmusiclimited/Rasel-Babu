import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { AdSlot } from '../components/ads/AdSlot';
import { Calendar, Clock, ArrowRight, User, X } from 'lucide-react';
import { NewsArticle } from '../types';

export const News: React.FC = () => {
  const { news } = useData();
  const [activeArticle, setActiveArticle] = useState<NewsArticle | null>(null);

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="max-w-3xl space-y-3">
          <span className="text-xs font-mono uppercase tracking-widest text-amber-400">
            Press Desk & Announcements
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white tracking-tight">
            News, Releases & Tour Diaries
          </h1>
          <p className="text-sm text-zinc-400">
            Stay updated with official press statements, concert tour dates, studio milestones, and interviews from Rasel Babu Management.
          </p>
        </div>

        {/* Adsterra Top Slot */}
        <AdSlot format="728x90" page="news" />

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {news.map((article) => (
            <article
              key={article.id}
              onClick={() => setActiveArticle(article)}
              className="group rounded-2xl overflow-hidden bg-zinc-900/50 border border-zinc-800 hover:border-amber-400/40 transition-all flex flex-col cursor-pointer"
            >
              <div className="aspect-[16/10] overflow-hidden bg-zinc-950 relative">
                <img
                  src={article.coverImage}
                  alt={article.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded bg-black/80 font-mono text-[10px] text-amber-400 uppercase tracking-wider">
                  {article.category}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{article.publishDate}</span>
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{article.readTime}</span>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-amber-200 transition-colors line-clamp-2">
                    {article.title}
                  </h3>

                  <p className="text-xs text-zinc-400 line-clamp-3">
                    {article.summary}
                  </p>
                </div>

                <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs text-amber-400">
                  <span className="font-semibold flex items-center gap-1">
                    Read Article
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-[11px] text-zinc-500">{article.author}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Article Full Modal */}
        {activeArticle && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in">
            <div className="relative w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6 my-8">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
                  <span>{activeArticle.category}</span>
                  <span>·</span>
                  <span>{activeArticle.publishDate}</span>
                </div>
                <button
                  onClick={() => setActiveArticle(null)}
                  className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
                {activeArticle.title}
              </h2>

              <div className="aspect-[16/9] rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800">
                <img
                  src={activeArticle.coverImage}
                  alt={activeArticle.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="text-sm text-zinc-300 leading-relaxed space-y-4 whitespace-pre-wrap">
                {activeArticle.content}
              </div>

              <div className="pt-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
                <span>By {activeArticle.author}</span>
                <button
                  onClick={() => setActiveArticle(null)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 text-white font-medium hover:bg-zinc-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
