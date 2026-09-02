import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Film, BookOpen, MapPin, Share2, ArrowLeft, Sparkles } from 'lucide-react';
import { ReelPlayer } from './components/ReelPlayer';
import { StoryTimeline } from './components/StoryTimeline';
import { JourneyMap } from './components/JourneyMap';
import { ShareModal } from './components/ShareModal';
import { diaryService, SAMPLE_RAJASTHAN_JOURNEY } from './services/diaryService';

const TABS = [
 { id: 'reel', label: '1. Watch Cinematic Reel', icon: Film },
 { id: 'journal', label: '2. Travel Diary & Photos', icon: BookOpen },
 { id: 'map', label: '3. Interactive Route Map', icon: MapPin },
];

export const DiaryViewer = () => {
 const { id } = useParams();
 const [searchParams] = useSearchParams();

 const [journey, setJourney] = useState(SAMPLE_RAJASTHAN_JOURNEY);
 const [activeTab, setActiveTab] = useState('reel');
 const [isShareModalOpen, setIsShareModalOpen] = useState(false);
 const [isLoading, setIsLoading] = useState(true);

 useEffect(() => {
 setIsLoading(true);

 // Priority 1: encoded data in URL (cross-device share)
 const dataParam = searchParams.get('data');
 if (dataParam) {
 const decoded = diaryService.decodeFromUrl(dataParam);
 if (decoded) { setJourney(decoded); setIsLoading(false); return; }
 }

 // Priority 2: short ID (same-browser localStorage)
 const idParam = searchParams.get('id') || id;
 if (idParam) {
 const found = diaryService.getJourneyByShareId(idParam);
 if (found) { setJourney(found); setIsLoading(false); return; }
 }

 // Fallback: sample journey
 setJourney(SAMPLE_RAJASTHAN_JOURNEY);
 setIsLoading(false);
 }, [id, searchParams]);

 return (<div className="min-h-screen bg-ink-950 text-ivory pt-20 pb-24 px-4 sm:px-6 lg:px-8">

 {/* Ambient blobs */}
 <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
 <div className="absolute top-1/3 -left-32 w-96 h-96 bg-saffron/6 rounded-full blur-3xl" />
 <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-horizon/6 rounded-full blur-3xl" />
 </div>

 <div className="max-w-6xl mx-auto relative z-10 space-y-8">

 {/* Top nav */}
 <div className="flex items-center justify-between">
 <Link to="/diary"
 className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-ivory-muted hover:text-ivory hover:border-white/20 transition-all">
 <ArrowLeft size={13} />
 Back to Studio
 </Link>
 <button onClick={() => setIsShareModalOpen(true)}
 className="px-4 py-2 rounded-xl bg-saffron/10 border border-saffron/25 text-saffron-bright hover:bg-saffron/20 text-xs font-bold flex items-center gap-2 transition-all">
 <Share2 size={13} />
 Share / QR
 </button>
 </div>

 {/* Journey title */}
 {!isLoading && (<div className="text-center max-w-3xl mx-auto space-y-3 pt-2">
 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-saffron/10 border border-saffron/25 text-saffron-bright text-xs font-semibold uppercase tracking-widest">
 <Sparkles size={12} />
 Shared SafarX Travel Story
 </div>
 <h1 className="text-3xl sm:text-5xl font-display font-light text-ivory tracking-tight">
 {journey.tripTitle}
 </h1>
 <div className="flex items-center justify-center gap-4 text-xs text-ivory-faint">
 {journey.travelerName && <span className="text-saffron-bright/90 font-medium">{journey.travelerName}</span>}
 <span>·</span>
 <span>{journey.photos?.length || 0} Moments</span>
 {journey.destination && <><span>·</span><span>{journey.destination}</span></>}
 </div>
 {journey.summary && (<p className="text-ivory-muted text-sm sm:text-base leading-relaxed italic max-w-2xl mx-auto">
 "{journey.summary}"
 </p>
 )}
 </div>
 )}

 {/* Tabs */}
 <div className="flex items-center justify-center gap-1.5 border-b border-white/8 pb-3 overflow-x-auto">
 {TABS.map(tab => (<button key={tab.id} onClick={() => setActiveTab(tab.id)}
 className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 shrink-0 transition-all ${
 activeTab === tab.id
 ? 'bg-saffron text-ink-950 font-bold shadow-md shadow-saffron/20'
 : 'text-ivory-faint hover:text-ivory hover:bg-white/5'
 }`}>
 <tab.icon size={14} />
 {tab.label}
 </button>
 ))}
 </div>

 {/* Tab content */}
 <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
 {activeTab === 'reel' && (<ReelPlayer photos={journey.photos || []} tripTitle={journey.tripTitle} travelerName={journey.travelerName}
 onOpenShareModal={() => setIsShareModalOpen(true)} />
 )}
 {activeTab === 'journal' && (<StoryTimeline photos={journey.photos || []} tripTitle={journey.tripTitle} summary={journey.summary} travelerName={journey.travelerName} />
 )}
 {activeTab === 'map' && <JourneyMap photos={journey.photos || []} />}
 </motion.div>
 </div>

 <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} journey={journey} />
 </div>
 );
};

export default DiaryViewer;
