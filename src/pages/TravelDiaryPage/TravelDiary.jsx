import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Share2, Upload, Trash2, Film, X } from 'lucide-react';
import { ReelPlayer } from './components/ReelPlayer';
import { ShareModal } from './components/ShareModal';
import { SAMPLE_RAJASTHAN_JOURNEY, diaryService } from './services/diaryService';
import toast from 'react-hot-toast';

export const TravelDiary = () => {
  const [photos, setPhotos] = useState(SAMPLE_RAJASTHAN_JOURNEY.photos);
  const [tripTitle, setTripTitle] = useState(SAMPLE_RAJASTHAN_JOURNEY.tripTitle);
  const [travelerName, setTravelerName] = useState(SAMPLE_RAJASTHAN_JOURNEY.travelerName);
  const [dragOver, setDragOver] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareVideoBlob, setShareVideoBlob] = useState(null);

  const shareIdRef = useRef(`sfx_${Math.random().toString(36).slice(2, 10)}`);

  const journey = {
    id: shareIdRef.current,
    shareId: shareIdRef.current,
    tripTitle,
    travelerName,
    photos,
    totalSpots: photos.length,
  };

  const handleOpenShare = useCallback((videoBlob) => {
    diaryService.saveJourney(journey);
    setShareVideoBlob(videoBlob || null);
    setIsShareModalOpen(true);
  }, [journey]); // eslint-disable-line

  // ── Photo upload ───────────────────────────────────────────────────────────
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (photos.length + files.length > 25) toast.error('Max 25 photos per journey.');

    const newPhotos = files.slice(0, 25 - photos.length).map((file, idx) => ({
      id: `local_${Date.now()}_${idx}`,
      url: URL.createObjectURL(file),
      file,
      location: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') || 'Travel Spot',
      day: `Day 0${Math.min(Math.floor((photos.length + idx) / 3) + 1, 7)}`,
      tag: 'Travel Photo',
      caption: '',
      date: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
      lat: 26.9124 + (Math.random() - 0.5) * 1.5,
      lng: 75.7873 + (Math.random() - 0.5) * 1.5,
    }));

    setPhotos(prev => [...prev, ...newPhotos]);
    toast.success(`Added ${newPhotos.length} photo${newPhotos.length > 1 ? 's' : ''}!`);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length) handleFileUpload({ target: { files } });
  };

  const handleDeleteAll = () => {
    setPhotos([]);
    setTripTitle('');
    setTravelerName('');
    toast('All photos and journey info cleared.');
  };

  const removePhoto = (id) => setPhotos(prev => prev.filter(p => p.id !== id));

  return (
    <div className="min-h-screen bg-[#070a13] text-slate-100 pt-20 pb-24 px-4 sm:px-6 lg:px-8">
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/4 -left-48 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 -right-48 w-[500px] h-[500px] bg-sky-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 space-y-10">

        {/* ── Hero ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 border-b border-white/8 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-3">
              <Sparkles size={13} />
              Digital Diary
            </div>
            <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight leading-tight">
              Upload Photos,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
                Create Your Reel
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-400 max-w-xl mt-2.5">
              Upload 15–20 travel photos · Auto-generate a cinematic reel · Share via QR or link
            </p>
            <p className="text-xs text-amber-400/90 flex items-center gap-1.5 mt-2 font-medium">
              <span>💡</span>
              <span>For your personalized reel, first delete all photos and add yours.</span>
            </p>
          </div>
          <button
            onClick={() => handleOpenShare(null)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 shrink-0 transition-all"
          >
            <Share2 size={15} />
            Share Journey & QR
          </button>
        </div>

        {/* ── Journey Info ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Trip Title</label>
            <input
              value={tripTitle}
              onChange={e => setTripTitle(e.target.value)}
              placeholder="e.g. Royal Echoes of Rajasthan"
              className="w-full bg-[#0b0f19] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Traveler / Group Name</label>
            <input
              value={travelerName}
              onChange={e => setTravelerName(e.target.value)}
              placeholder="e.g. Aarav & Meera"
              className="w-full bg-[#0b0f19] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
            />
          </div>
        </div>

        {/* ── Photo Upload Zone ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">Photos</h2>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-xs font-bold">{photos.length}</span>
            </div>
            <div className="flex items-center gap-2">
              {photos.length > 0 && (
                <button
                  onClick={handleDeleteAll}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-semibold transition-colors"
                >
                  <Trash2 size={12} />
                  Delete All
                </button>
              )}
              <label htmlFor="photo-upload"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400 hover:bg-amber-500/20 text-xs font-semibold cursor-pointer transition-colors">
                <Upload size={12} />
                Upload Photos
              </label>
              <input id="photo-upload" type="file" accept="image/*" multiple onChange={handleFileUpload} className="hidden" />
            </div>
          </div>

          {/* Drop zone + grid */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`transition-all ${dragOver ? 'ring-2 ring-amber-500/50 rounded-2xl' : ''}`}
          >
            {photos.length === 0 ? (
              <label htmlFor="photo-upload" className="flex flex-col items-center justify-center gap-4 border-2 border-dashed border-white/15 rounded-2xl p-16 cursor-pointer hover:border-amber-500/40 hover:bg-amber-500/3 transition-all">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                  <Upload size={24} className="text-amber-400" />
                </div>
                <div className="text-center">
                  <p className="text-white font-semibold">Drop photos here or click to upload</p>
                  <p className="text-sm text-slate-500 mt-1">JPG, PNG, WEBP — up to 25 photos</p>
                </div>
              </label>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {photos.map((photo, idx) => (
                  <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: idx * 0.02 }}
                    className="group flex flex-col rounded-2xl overflow-hidden bg-[#0b0f19] border border-white/10 hover:border-amber-500/40 transition-all shadow-lg"
                  >
                    {/* Photo Container */}
                    <div className="relative aspect-[4/3] bg-slate-950 overflow-hidden">
                      <img
                        src={photo.url}
                        alt={photo.location}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      {/* Delete button */}
                      <button
                        onClick={() => removePhoto(photo.id)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/80 text-slate-300 hover:text-white hover:bg-red-500 flex items-center justify-center transition-colors shadow-md"
                        title="Remove photo"
                      >
                        <X size={12} />
                      </button>
                      {/* Index badge */}
                      <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold shadow-md">
                        #{idx + 1}
                      </div>
                    </div>

                    {/* Text Box BELOW Image */}
                    <div className="p-2.5 bg-[#0d121f] border-t border-white/5 space-y-1">
                      <input
                        type="text"
                        value={photo.location || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPhotos(prev => prev.map(p =>
                            p.id === photo.id ? { ...p, location: val, caption: val } : p
                          ));
                        }}
                        placeholder="Place name / text..."
                        className="w-full bg-[#070a13] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-medium transition-colors"
                      />
                    </div>
                  </motion.div>
                ))}
                {/* Add more tile */}
                {photos.length < 25 && (
                  <label htmlFor="photo-upload"
                    className="aspect-[4/3] rounded-2xl border-2 border-dashed border-white/15 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-amber-500/40 hover:bg-amber-500/5 transition-all">
                    <Upload size={20} className="text-amber-400" />
                    <span className="text-xs text-slate-400 font-medium">Add photo</span>
                  </label>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Reel Creator ── */}
        {photos.length > 0 && (
          <div className="border-t border-white/8 pt-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center">
                <Film size={16} className="text-amber-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Cinematic Reel</h2>
                <p className="text-xs text-slate-500">Preview, customize ratio & audio, then download or share</p>
              </div>
            </div>
            <ReelPlayer
              photos={photos}
              tripTitle={tripTitle}
              travelerName={travelerName}
              onOpenShareModal={handleOpenShare}
            />
          </div>
        )}
      </div>

      <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} journey={journey} videoBlob={shareVideoBlob} />
    </div>
  );
};

export default TravelDiary;
