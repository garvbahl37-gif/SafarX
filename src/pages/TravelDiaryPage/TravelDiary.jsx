import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Share2, Upload, Trash2, Film, X, Lightbulb } from 'lucide-react';
import { ReelPlayer } from './components/ReelPlayer';
import { ShareModal } from './components/ShareModal';
import DiaryHero from './components/DiaryHero';
import { SAMPLE_RAJASTHAN_JOURNEY, diaryService } from './services/diaryService';
import toast from 'react-hot-toast';

export const TravelDiary = () => {
 /* Where the hero's two buttons send you. */
 const contentRef = useRef(null);
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

 return (<div className="min-h-screen bg-ink-950 text-ivory">
 <DiaryHero
 photoCount={photos.length}
 onShare={() => handleOpenShare(null)}
 onScrollToContent={() =>
 contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
 }
 />

 {/* Ambient blobs */}
 <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
 <div className="absolute top-1/4 -left-48 w-[500px] h-[500px] bg-saffron/5 rounded-full blur-3xl" />
 <div className="absolute bottom-1/3 -right-48 w-[500px] h-[500px] bg-horizon/5 rounded-full blur-3xl" />
 </div>

 <div ref={contentRef} className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-10 pb-24 relative z-10 space-y-12 scroll-mt-24">

 {/* ── Journey Info ── */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="space-y-1.5">
 <label className="eyebrow-muted">Trip Title</label>
 <input
 value={tripTitle}
 onChange={e => setTripTitle(e.target.value)}
 placeholder="e.g. Royal Echoes of Rajasthan"
 className="search-field search-field-bare text-[15px]"
 />
 </div>
 <div className="space-y-1.5">
 <label className="eyebrow-muted">Traveler / Group Name</label>
 <input
 value={travelerName}
 onChange={e => setTravelerName(e.target.value)}
 placeholder="e.g. Aarav & Meera"
 className="search-field search-field-bare text-[15px]"
 />
 </div>
 </div>

 {/* ── Photo Upload Zone ── */}
 <div>
 <div className="flex items-center justify-between mb-4">
 <div className="flex min-w-0 flex-1 items-center gap-3">
 <span className="route-dot shrink-0" aria-hidden="true" />
 <h2 className="eyebrow whitespace-nowrap">Your photographs</h2>
 <span className="font-data text-[10px] tabular-nums text-saffron">{photos.length}</span>
 <span className="route-line hidden flex-1 sm:block" aria-hidden="true" />
 </div>
 <div className="flex items-center gap-2">
 {photos.length > 0 && (<button
 onClick={handleDeleteAll}
 className="flex items-center gap-2 rounded-full border border-danger/30 px-4 py-2 font-sans text-[12.5px] font-semibold text-danger-bright transition-colors hover:bg-danger/10"
 >
 <Trash2 size={12} />
 Delete All
 </button>
 )}
 <label htmlFor="photo-upload"
 className="flex cursor-pointer items-center gap-2 rounded-full bg-gradient-to-br from-saffron-bright to-saffron px-4 py-2 font-sans text-[12.5px] font-bold text-ink-950 transition-transform hover:scale-[1.02]">
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
 className={`transition-all ${dragOver ? 'ring-2 ring-saffron/50 rounded-2xl' : ''}`}
 >
 {photos.length === 0 ? (<label htmlFor="photo-upload" className="flex flex-col items-center justify-center gap-4 border-2 border-dashed border-white/[0.12] rounded-2xl p-16 cursor-pointer hover:border-saffron/40 hover:bg-saffron/3 transition-all">
 <div className="w-14 h-14 rounded-2xl bg-saffron/10 flex items-center justify-center">
 <Upload size={24} className="text-saffron-bright" />
 </div>
 <div className="text-center">
 <p className="text-ivory font-semibold">Drop photos here or click to upload</p>
 <p className="text-sm text-ivory-faint mt-1">JPG, PNG, WEBP — up to 25 photos</p>
 </div>
 </label>
 ) : (<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
 {photos.map((photo, idx) => (<motion.div
 key={photo.id}
 initial={{ opacity: 0, scale: 0.9 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ duration: 0.2, delay: idx * 0.02 }}
 className="group flex flex-col rounded-2xl overflow-hidden bg-ink-900 border border-white/[0.07] hover:border-saffron/40 transition-all shadow-lg"
 >
 {/* Photo Container */}
 <div className="relative aspect-[4/3] bg-ink-950 overflow-hidden">
 <img
 src={photo.url}
 alt={photo.location}
 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
 loading="lazy"
 />
 {/* Delete button */}
 <button
 onClick={() => removePhoto(photo.id)}
 className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/80 text-ivory-muted hover:text-ivory hover:bg-danger flex items-center justify-center transition-colors shadow-md"
 title="Remove photo"
 >
 <X size={12} />
 </button>
 {/* Index badge */}
 <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-saffron text-ink-950 text-[10px] font-bold shadow-md">
 #{idx + 1}
 </div>
 </div>

 {/* Text Box BELOW Image */}
 <div className="p-2.5 bg-ink-800 border-t border-white/[0.07] space-y-1">
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
 className="w-full bg-ink-950 border border-white/[0.07] rounded-lg px-2.5 py-1.5 text-xs text-ivory placeholder-ivory-faint focus:outline-none focus:border-saffron font-medium transition-colors"
 />
 </div>
 </motion.div>
 ))}
 {/* Add more tile */}
 {photos.length < 25 && (<label htmlFor="photo-upload"
 className="aspect-[4/3] rounded-2xl border-2 border-dashed border-white/[0.12] flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-saffron/40 hover:bg-saffron/5 transition-all">
 <Upload size={20} className="text-saffron-bright" />
 <span className="text-xs text-ivory-muted font-medium">Add photo</span>
 </label>
 )}
 </div>
 )}
 </div>
 </div>

 {/* A dashed route, not a rule: the same divider the rest of SafarX uses. */}
 <div className="flex items-center gap-3 pt-2" aria-hidden="true">
 <span className="route-line flex-1" />
 <span className="route-dot" />
 <span className="route-line flex-1" />
 </div>

 {/* ── Reel Creator ── */}
 {/* Wider than the reading column: three panels of controls beside a film
 do not fit a measure meant for text. */}
 {photos.length > 0 && (<div className="pt-10 xl:-mx-[7rem] 2xl:-mx-[10rem]">
 <div className="mb-7">
 <div className="flex items-center gap-3">
 <span className="route-dot shrink-0" aria-hidden="true" />
 <h2 className="eyebrow whitespace-nowrap">Cinematic reel</h2>
 <span className="route-line flex-1" aria-hidden="true" />
 </div>
 <p className="mt-3 font-display text-[1.5rem] font-light leading-snug text-ivory">
 Your trip, cut to music.
 </p>
 <p className="mt-1 font-sans text-[13.5px] text-ivory-muted">
 Choose a look and a ratio, pick a track, then download it or send the link.
 </p>
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
