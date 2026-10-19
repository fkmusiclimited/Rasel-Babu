import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { AdSlot } from '../components/ads/AdSlot';
import { Play, Pause, Disc, ExternalLink, Music2, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { Album, Track } from '../types';

export const Music: React.FC = () => {
  const { albums, activePlayer, playTrack } = useData();
  const [selectedLyricsTrack, setSelectedLyricsTrack] = useState<Track | null>(null);

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="max-w-3xl space-y-3">
          <span className="text-xs font-mono uppercase tracking-widest text-amber-400">
            Official Discography & Releases
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white tracking-tight">
            Albums & Original Compositions
          </h1>
          <p className="text-sm text-zinc-400">
            Explore studio albums, acoustic folk sessions, and live recordings composed and voiced by Rasel Babu. Click any track to preview audio with the integrated sound engine.
          </p>
        </div>

        {/* Adsterra Top Leaderboard */}
        <AdSlot format="728x90" page="music" responsive />

        {/* Albums List */}
        <div className="space-y-16">
          {albums.map((album) => (
            <div
              key={album.id}
              className="rounded-3xl bg-zinc-900/40 border border-zinc-800 p-6 sm:p-8 lg:p-10 space-y-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Album Cover & Links */}
                <div className="lg:col-span-4 flex flex-col items-center sm:items-start space-y-4">
                  <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-2xl overflow-hidden border border-amber-500/20 shadow-2xl relative group bg-zinc-950">
                    <img
                      src={album.coverUrl}
                      alt={album.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div className="w-full space-y-2 text-center sm:text-left">
                    <span className="text-xs font-mono text-amber-400 block">
                      Release Year {album.releaseYear} · {album.genre}
                    </span>
                    <h2 className="font-display text-2xl font-bold text-white">
                      {album.title}
                    </h2>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {album.description}
                    </p>
                  </div>

                  {/* Streaming Platforms */}
                  <div className="w-full pt-2">
                    <span className="text-[10px] uppercase tracking-wider font-mono text-zinc-500 block mb-2">
                      Official Streaming Outlets:
                    </span>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {album.streamingLinks.spotify && (
                        <a
                          href={album.streamingLinks.spotify}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-emerald-950/50 hover:text-emerald-400 border border-zinc-700 flex items-center gap-1.5 transition-colors"
                        >
                          <Music2 className="w-3.5 h-3.5" />
                          <span>Spotify</span>
                        </a>
                      )}
                      {album.streamingLinks.appleMusic && (
                        <a
                          href={album.streamingLinks.appleMusic}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-pink-950/50 hover:text-pink-400 border border-zinc-700 flex items-center gap-1.5 transition-colors"
                        >
                          <Music2 className="w-3.5 h-3.5" />
                          <span>Apple Music</span>
                        </a>
                      )}
                      {album.streamingLinks.youtubeMusic && (
                        <a
                          href={album.streamingLinks.youtubeMusic}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-red-950/50 hover:text-red-400 border border-zinc-700 flex items-center gap-1.5 transition-colors"
                        >
                          <Music2 className="w-3.5 h-3.5" />
                          <span>YouTube Music</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tracklist */}
                <div className="lg:col-span-8 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-xs font-mono text-zinc-500">
                    <span>TRACK TITLE</span>
                    <span>DURATION / PLAYS</span>
                  </div>

                  <div className="space-y-2">
                    {album.tracks.map((track, idx) => {
                      const isCurrent = activePlayer.track?.id === track.id && activePlayer.isPlaying;

                      return (
                        <div
                          key={track.id}
                          className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                            isCurrent
                              ? 'bg-amber-400/10 border-amber-400/50 shadow-md'
                              : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700'
                          }`}
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <button
                              onClick={() => playTrack(track, album)}
                              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                                isCurrent
                                  ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/30'
                                  : 'bg-zinc-800 text-zinc-200 hover:bg-amber-400 hover:text-black'
                              }`}
                              title={isCurrent ? 'Pause' : 'Play Track'}
                            >
                              {isCurrent ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black ml-0.5" />}
                            </button>

                            <div className="min-w-0">
                              <h4 className="text-sm font-semibold text-white truncate">
                                {idx + 1}. {track.title}
                              </h4>
                              <p className="text-xs text-zinc-400 truncate">
                                Composer: {track.composer} · Lyrics: {track.lyricist}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            {track.lyrics && (
                              <button
                                onClick={() => setSelectedLyricsTrack(selectedLyricsTrack?.id === track.id ? null : track)}
                                className="text-xs text-zinc-400 hover:text-amber-400 flex items-center gap-1 cursor-pointer"
                                title="View Bengali Lyrics"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Lyrics</span>
                              </button>
                            )}

                            <span className="text-xs font-mono text-zinc-500 tabular-nums">
                              {track.duration}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Lyrics Drawer if selected */}
              {selectedLyricsTrack && (
                <div className="p-6 rounded-2xl bg-zinc-950 border border-amber-500/30 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono uppercase text-amber-400">Song Lyrics (গানটির কথা)</span>
                      <h4 className="text-lg font-bold text-white">{selectedLyricsTrack.title}</h4>
                    </div>
                    <button
                      onClick={() => setSelectedLyricsTrack(null)}
                      className="text-xs text-zinc-400 hover:text-white px-2 py-1"
                    >
                      Close
                    </button>
                  </div>
                  <pre className="text-xs sm:text-sm text-zinc-300 font-sans whitespace-pre-wrap leading-relaxed bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                    {selectedLyricsTrack.lyrics}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom Adsterra Leaderboard Slot */}
        <AdSlot format="728x90" page="music" responsive />
      </div>
    </div>
  );
};
