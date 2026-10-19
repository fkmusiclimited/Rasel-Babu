import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { AdSlot } from '../components/ads/AdSlot';
import { Play, Youtube, Eye, Calendar, X, Edit, Plus, Check, Link, Sparkles } from 'lucide-react';
import { VideoItem } from '../types';

export function extractYouTubeId(urlOrId: string): string {
  const trimmed = urlOrId.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  const match = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : trimmed;
}

export const Videos: React.FC = () => {
  const { videos, addVideo, updateVideo, deleteVideo } = useData();
  const { isAdminOrManager } = useAuth();
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeVideoModal, setActiveVideoModal] = useState<VideoItem | null>(null);

  // Edit Video Modal state
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editUrlOrId, setEditUrlOrId] = useState('');
  const [editCategory, setEditCategory] = useState<VideoItem['category']>('Music Video');
  const [editDescription, setEditDescription] = useState('');
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  // Add Video Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrlOrId, setNewUrlOrId] = useState('');
  const [newCategory, setNewCategory] = useState<VideoItem['category']>('Music Video');
  const [newDescription, setNewDescription] = useState('');

  const categories = ['all', 'Music Video', 'Live Performance', 'Acoustic Session', 'Behind The Scenes'];

  const filteredVideos = videos.filter(
    (v) => selectedCategory === 'all' || v.category === selectedCategory
  );

  const handleOpenEdit = (video: VideoItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingVideo(video);
    setEditTitle(video.title);
    setEditUrlOrId(`https://www.youtube.com/watch?v=${video.youtubeId}`);
    setEditCategory(video.category);
    setEditDescription(video.description);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideo) return;

    const extractedId = extractYouTubeId(editUrlOrId);
    if (!extractedId) return;

    updateVideo(editingVideo.id, {
      title: editTitle,
      youtubeId: extractedId,
      category: editCategory,
      description: editDescription,
      // Auto-fallback thumbnail if YouTube ID changed
      thumbnailUrl: `https://img.youtube.com/vi/${extractedId}/hqdefault.jpg`,
    });

    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 3000);
    setEditingVideo(null);
  };

  const handleCreateVideo = (e: React.FormEvent) => {
    e.preventDefault();
    const extractedId = extractYouTubeId(newUrlOrId);
    if (!extractedId || !newTitle) return;

    addVideo({
      title: newTitle,
      youtubeId: extractedId,
      category: newCategory,
      description: newDescription,
      thumbnailUrl: `https://img.youtube.com/vi/${extractedId}/hqdefault.jpg`,
      duration: '04:30',
      releaseDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      views: '10K',
    });

    setShowAddModal(false);
    setNewTitle('');
    setNewUrlOrId('');
    setNewDescription('');
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header & Quick Action */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-800 pb-6">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400">
              Official Visual Catalog
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-white tracking-tight">
              Music Videos & YouTube Releases
            </h1>
            <p className="text-sm text-zinc-400">
              Stream official 4K music videos, unplugged acoustic jam sessions, and concert broadcasts from Rasel Babu's archives.
            </p>
          </div>

          {isAdminOrManager && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-black font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-400/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add YouTube Video (অ্যাডমিন)</span>
              </button>
            </div>
          )}
        </div>

        {/* Success toast */}
        {saveSuccessNotice && (
          <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2 animate-fade-in shadow-lg">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>YouTube video information updated successfully!</span>
          </div>
        )}

        {/* Filter categories */}
        <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800/80 pb-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-amber-400 text-black font-semibold'
                  : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              {cat === 'all' ? 'All Videos' : cat}
            </button>
          ))}
        </div>

        {/* Adsterra Top Leaderboard */}
        <AdSlot format="728x90" page="videos" responsive />

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              className="rounded-2xl overflow-hidden bg-zinc-900/60 border border-zinc-800 hover:border-amber-500/40 transition-all flex flex-col group relative shadow-xl"
            >
              {/* Video Thumbnail Stage */}
              <div
                onClick={() => setActiveVideoModal(video)}
                className="relative aspect-video bg-black cursor-pointer overflow-hidden"
              >
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 fill-white ml-1" />
                  </div>
                </div>

                <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-black/80 font-mono text-[11px] text-zinc-200">
                  {video.duration}
                </span>

                {/* Edit YouTube Link Button on Video Card - Only for Admin */}
                {isAdminOrManager && (
                  <button
                    onClick={(e) => handleOpenEdit(video, e)}
                    className="absolute top-3 right-3 px-2.5 py-1.5 rounded-lg bg-black/85 hover:bg-amber-400 hover:text-black text-amber-300 border border-amber-400/40 text-xs font-medium flex items-center gap-1.5 backdrop-blur-md transition-all shadow-md cursor-pointer"
                    title="Edit YouTube Video Link (Admin Only)"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit Link</span>
                  </button>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono mb-1">
                    <span className="text-amber-400">{video.category}</span>
                    <span>·</span>
                    <span>{video.releaseDate}</span>
                  </div>
                  <h3
                    onClick={() => setActiveVideoModal(video)}
                    className="text-base font-semibold text-white group-hover:text-amber-200 cursor-pointer line-clamp-1"
                  >
                    {video.title}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                    {video.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-500">
                  <span className="flex items-center gap-1 font-mono">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{video.views} views</span>
                  </span>
                  <div className="flex items-center gap-3">
                    {isAdminOrManager && (
                      <button
                        onClick={(e) => handleOpenEdit(video, e)}
                        className="text-zinc-400 hover:text-amber-400 text-xs flex items-center gap-1 cursor-pointer font-medium"
                      >
                        <Link className="w-3 h-3 text-amber-400" />
                        <span>Edit Link</span>
                      </button>
                    )}
                    <button
                      onClick={() => setActiveVideoModal(video)}
                      className="text-amber-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                    >
                      <Youtube className="w-3.5 h-3.5 text-red-500" />
                      <span>Watch</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal: Edit Existing YouTube Video Link */}
        {editingVideo && (
          <div
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in"
            onClick={() => setEditingVideo(null)}
          >
            <div
              className="relative w-full max-w-lg bg-zinc-950 border border-amber-500/40 rounded-2xl p-6 sm:p-8 space-y-5 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <Youtube className="w-5 h-5 text-red-500" />
                  <h3 className="text-base font-bold text-white">
                    Edit YouTube Video Link & Details
                  </h3>
                </div>
                <button
                  onClick={() => setEditingVideo(null)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300">
                    YouTube Video URL or Video ID
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="https://www.youtube.com/watch?v=... or youtu.be/..."
                    value={editUrlOrId}
                    onChange={(e) => setEditUrlOrId(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                  <p className="text-[11px] text-zinc-500">
                    Paste any YouTube URL or 11-character video ID.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300">Video Title</label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Music Video">Official Music Video</option>
                    <option value="Live Performance">Live Performance</option>
                    <option value="Acoustic Session">Acoustic Session</option>
                    <option value="Behind The Scenes">Behind The Scenes</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300">Description</label>
                  <textarea
                    rows={3}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-black font-bold text-xs transition-colors cursor-pointer"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingVideo(null)}
                    className="px-4 py-2.5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Add New YouTube Video */}
        {showAddModal && (
          <div
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in"
            onClick={() => setShowAddModal(false)}
          >
            <div
              className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-5 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <Youtube className="w-5 h-5 text-red-500" />
                  <h3 className="text-base font-bold text-white">
                    Publish New YouTube Video
                  </h3>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateVideo} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300">
                    YouTube URL or ID
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={newUrlOrId}
                    onChange={(e) => setNewUrlOrId(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300">Video Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rasel Babu - Notun Gaan (Official Video)"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Music Video">Official Music Video</option>
                    <option value="Live Performance">Live Performance</option>
                    <option value="Acoustic Session">Acoustic Session</option>
                    <option value="Behind The Scenes">Behind The Scenes</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Describe the track, music director, and recording story..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-black font-bold text-xs transition-colors cursor-pointer"
                  >
                    Add to Video Catalog
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Video Player Modal */}
        {activeVideoModal && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in">
            <div className="relative w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl space-y-4 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white truncate pr-4">
                  {activeVideoModal.title}
                </h3>
                <button
                  onClick={() => setActiveVideoModal(null)}
                  className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-zinc-800">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${activeVideoModal.youtubeId}?autoplay=1`}
                  title={activeVideoModal.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              <div className="flex items-center justify-between text-xs text-zinc-400">
                <p className="max-w-xl">{activeVideoModal.description}</p>
                {isAdminOrManager && (
                  <button
                    onClick={(e) => {
                      const v = activeVideoModal;
                      setActiveVideoModal(null);
                      handleOpenEdit(v, e);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-amber-500/40 text-amber-300 hover:bg-amber-400 hover:text-black transition-colors flex items-center gap-1.5 cursor-pointer font-semibold"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit Link</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
