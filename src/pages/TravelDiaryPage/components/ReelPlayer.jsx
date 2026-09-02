import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, RotateCcw, Volume2, VolumeX,
  Download, Music, Sparkles, Share2,
  Upload, ChevronDown, ChevronUp, Check,
  Layers, Clapperboard, Wand2, Smartphone,
  Search, Scissors, Sliders, X, Loader2
} from 'lucide-react';
import { ReelRenderer, EDIT_PRESETS } from '../utils/reelRenderer';
import { CURATED_TRACKS, fetchSongStreamUrl, searchOnlineSongs } from '../utils/audioTracks';
import { REEL_RATIOS, detectBestRatio } from '../utils/reelRatios';
import { exportReelVideo } from '../utils/videoExporter';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

const formatTime = (secs) => {
  const s = Math.max(0, Math.floor(secs || 0));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${rem.toString().padStart(2, '0')}`;
};

// ─── Ratio Selector ───────────────────────────────────────────────────────────
const RatioSelector = ({ selectedRatio, onSelect }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
    {REEL_RATIOS.map(r => (
      <button key={r.id} onClick={() => onSelect(r)}
        className={`relative flex flex-col items-center gap-1 p-2.5 rounded-xl border transition-all ${
          selectedRatio.id === r.id
            ? 'bg-amber-500/15 border-amber-500 text-amber-400 shadow-md shadow-amber-500/10'
            : 'bg-[#070a13] border-white/8 text-slate-400 hover:border-white/20 hover:text-slate-200'
        }`}>
        <span className="text-base">{r.emoji}</span>
        <span className="text-[11px] font-bold">{r.label}</span>
        <span className="text-[10px] opacity-70 leading-tight text-center">{r.desc}</span>
        {r.popular && <span className="absolute -top-1.5 -right-1.5 text-[8px] font-bold bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded-full">TOP</span>}
        {selectedRatio.id === r.id && <div className="absolute bottom-1.5 right-1.5 w-3 h-3 rounded-full bg-amber-500 flex items-center justify-center"><Check size={8} strokeWidth={3} className="text-slate-950" /></div>}
      </button>
    ))}
  </div>
);

// ─── Style Preset Selector ───────────────────────────────────────────────────
const StyleSelector = ({ selectedStyle, onSelect }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
    {EDIT_PRESETS.map(preset => (
      <button key={preset.id} onClick={() => onSelect(preset)}
        className={`relative flex flex-col text-left p-3 rounded-xl border transition-all ${
          selectedStyle.id === preset.id
            ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/10 border-amber-500 text-white shadow-md shadow-amber-500/10'
            : 'bg-[#070a13] border-white/8 text-slate-400 hover:border-white/20 hover:bg-white/5'
        }`}>
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-base">{preset.emoji}</span>
          <span className="text-xs font-bold text-white">{preset.label}</span>
        </div>
        <span className="text-[11px] text-slate-400 leading-tight">{preset.desc}</span>
        {selectedStyle.id === preset.id && (
          <div className="absolute top-2 right-2 w-3.5 h-3.5 rounded-full bg-amber-500 flex items-center justify-center">
            <Check size={9} strokeWidth={3} className="text-slate-950" />
          </div>
        )}
      </button>
    ))}
  </div>
);

// ─── Track Card ───────────────────────────────────────────────────────────────
const TrackCard = ({ track, isSelected, onSelect, isPlaying }) => (
  <div onClick={() => onSelect(track)}
    className={`flex items-center gap-2.5 p-2 rounded-xl border cursor-pointer transition-all ${
      isSelected
        ? 'bg-amber-500/15 border-amber-500 text-white shadow-md shadow-amber-500/10'
        : 'bg-[#070a13] border-white/8 text-slate-400 hover:border-white/20 hover:bg-white/5'
    }`}>
    {track.image ? (
      <img src={track.image} alt={track.title} className="w-9 h-9 rounded-lg object-cover shrink-0" />
    ) : (
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-base shrink-0 ${isSelected ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5'}`}>
        {track.emoji || '🎵'}
      </div>
    )}
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-1">
        <p className="text-xs font-bold text-white truncate">{track.title}</p>
        {track.tag && <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/15 text-amber-400 font-semibold shrink-0">{track.tag}</span>}
      </div>
      <p className="text-[10px] text-slate-400 truncate mt-0.5">
        {track.movie ? `${track.movie} · ${track.artist}` : track.artist || track.subtitle}
      </p>
    </div>
    {isSelected && isPlaying && (
      <div className="flex items-end gap-0.5 h-3.5 shrink-0">
        {[1, 2, 3].map(i => (
          <div key={i} className="w-1 bg-amber-500 rounded-full animate-bounce"
            style={{ height: `${5 + i * 3}px`, animationDelay: `${i * 0.1}s` }} />
        ))}
      </div>
    )}
  </div>
);

// ─── Main ReelPlayer ──────────────────────────────────────────────────────────
export const ReelPlayer = ({ photos, tripTitle, travelerName, onOpenShareModal }) => {
  const canvasRef = useRef(null);
  const rendererRef = useRef(null);
  const animFrameRef = useRef(null);
  const cancelExportRef = useRef(false);

  const curatedAudioPlayerRef = useRef(null);
  const customAudioPlayerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(30);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoadingImages, setIsLoadingImages] = useState(true);

  const [selectedRatio, setSelectedRatio] = useState(REEL_RATIOS[0]);
  const [autoDetected, setAutoDetected] = useState(false);

  const [selectedStyle, setSelectedStyle] = useState(EDIT_PRESETS[0]);

  const [selectedTrack, setSelectedTrack] = useState(CURATED_TRACKS[0]);
  const [audioMode, setAudioMode] = useState('curated'); // 'curated' | 'custom' | 'none'
  const [customAudioFile, setCustomAudioFile] = useState(null);
  const [customAudioUrl, setCustomAudioUrl] = useState(null);

  // Audio trimming & custom search states
  const [audioStartTime, setAudioStartTime] = useState(0);
  const [songTotalDuration, setSongTotalDuration] = useState(180);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportMessage, setExportMessage] = useState('');
  const [lastVideoBlob, setLastVideoBlob] = useState(null);
  const [isLoadingTrack, setIsLoadingTrack] = useState(false);

  const slideDuration = 2.8;

  // Invalidate cached video only when relevant parameters change
  useEffect(() => {
    setLastVideoBlob(null);
  }, [photos, tripTitle, selectedRatio, selectedStyle, selectedTrack, audioStartTime]);

  // ── Init Audio Players once ───────────────────────────────────────────────
  useEffect(() => {
    const curatedPlayer = new Audio();
    curatedPlayer.loop = false;
    curatedPlayer.volume = 0.8;
    curatedPlayer.onloadedmetadata = () => {
      if (curatedPlayer.duration && !isNaN(curatedPlayer.duration)) {
        setSongTotalDuration(curatedPlayer.duration);
      }
    };
    curatedAudioPlayerRef.current = curatedPlayer;

    const customPlayer = new Audio();
    customPlayer.loop = false;
    customPlayer.volume = 0.8;
    customPlayer.onloadedmetadata = () => {
      if (customPlayer.duration && !isNaN(customPlayer.duration)) {
        setSongTotalDuration(customPlayer.duration);
      }
    };
    customAudioPlayerRef.current = customPlayer;

    return () => {
      curatedPlayer.pause();
      curatedPlayer.src = '';
      customPlayer.pause();
      customPlayer.src = '';
    };
  }, []);

  // ── Renderer setup on photos/ratio/style change ───────────────────────────
  useEffect(() => {
    let cancelled = false;
    const canvas = canvasRef.current;
    if (!canvas || !photos.length) return;

    pauseAudio();
    setIsPlaying(false);

    const renderer = new ReelRenderer(canvas, {
      width: selectedRatio.width,
      height: selectedRatio.height,
      slideDuration,
      tripTitle,
      travelerName,
      stylePreset: selectedStyle.id
    });
    rendererRef.current = renderer;

    setIsLoadingImages(true);
    ReelRenderer.preloadImages(photos).then(loaded => {
      if (cancelled) return;
      renderer.setSlides(loaded, tripTitle, selectedStyle.id);
      setTotalDuration(renderer.totalDuration);

      if (!autoDetected) {
        const detected = detectBestRatio(loaded);
        if (detected.id !== selectedRatio.id) {
          setSelectedRatio(detected);
          toast(`📐 Ratio auto-set to ${detected.label}`, { icon: '✨' });
        }
        setAutoDetected(true);
      }

      setIsLoadingImages(false);
      renderer.renderFrame(0);
    });

    return () => { cancelled = true; if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, [photos, tripTitle, travelerName, selectedRatio, selectedStyle]);

  // ── 60FPS Canvas Loop ─────────────────────────────────────────────────────
  useEffect(() => {
    let lastTime = performance.now();
    const loop = now => {
      if (isPlaying && rendererRef.current) {
        const delta = (now - lastTime) / 1000;
        setCurrentTime(prev => {
          const dur = rendererRef.current?.totalDuration || totalDuration;
          let next = prev + delta;
          if (next >= dur) {
            next = 0;
            if (audioMode === 'custom' && customAudioPlayerRef.current) {
              customAudioPlayerRef.current.currentTime = audioStartTime;
            } else if (audioMode === 'curated' && curatedAudioPlayerRef.current) {
              curatedAudioPlayerRef.current.currentTime = audioStartTime;
            }
          }
          rendererRef.current.renderFrame(next);
          return next;
        });
      }
      lastTime = now;
      animFrameRef.current = requestAnimationFrame(loop);
    };
    animFrameRef.current = requestAnimationFrame(loop);
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, [isPlaying, totalDuration, audioMode, audioStartTime]);

  // ── Audio helpers ─────────────────────────────────────────────────────────
  const pauseAudio = useCallback(() => {
    if (curatedAudioPlayerRef.current) {
      try { curatedAudioPlayerRef.current.pause(); } catch {}
    }
    if (customAudioPlayerRef.current) {
      try {
        customAudioPlayerRef.current.pause();
      } catch {}
    }
  }, []);

  const playAudio = useCallback(() => {
    if (isMuted || audioMode === 'none') return;
    const offset = currentTime > 0 ? (audioStartTime + currentTime) : audioStartTime;
    if (audioMode === 'curated' && curatedAudioPlayerRef.current) {
      try {
        curatedAudioPlayerRef.current.currentTime = offset;
        curatedAudioPlayerRef.current.muted = false;
        curatedAudioPlayerRef.current.play().catch(() => {});
      } catch {}
    } else if (audioMode === 'custom' && customAudioPlayerRef.current) {
      try {
        customAudioPlayerRef.current.currentTime = offset;
        customAudioPlayerRef.current.muted = false;
        customAudioPlayerRef.current.play().catch(() => {});
      } catch {}
    }
  }, [isMuted, audioMode, audioStartTime, currentTime]);

  // ── Toggle Play/Pause ─────────────────────────────────────────────────────
  const togglePlay = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      playAudio();
    } else {
      setIsPlaying(false);
      pauseAudio();
    }
  };

  // ── Seek ─────────────────────────────────────────────────────────────────
  const handleSeek = e => {
    const t = parseFloat(e.target.value);
    setCurrentTime(t);
    if (rendererRef.current) rendererRef.current.renderFrame(t);
    const audioTarget = audioStartTime + t;
    if (audioMode === 'custom' && customAudioPlayerRef.current) {
      customAudioPlayerRef.current.currentTime = audioTarget;
    } else if (audioMode === 'curated' && curatedAudioPlayerRef.current) {
      curatedAudioPlayerRef.current.currentTime = audioTarget;
    }
  };

  // ── Mute Toggle ───────────────────────────────────────────────────────────
  const toggleMute = () => {
    const nowMuted = !isMuted;
    setIsMuted(nowMuted);
    if (nowMuted) {
      pauseAudio();
    } else if (isPlaying) {
      playAudio();
    }
  };

  // ── Track Selection ───────────────────────────────────────────────────────
  const handleSelectTrack = async (track) => {
    setSelectedTrack(track);
    setAudioMode('curated');
    setIsMuted(false);
    setAudioStartTime(0);

    if (track.streamUrl) {
      if (curatedAudioPlayerRef.current) {
        curatedAudioPlayerRef.current.src = track.streamUrl;
        curatedAudioPlayerRef.current.currentTime = 0;
        curatedAudioPlayerRef.current.play().catch(() => {});
      }
      setIsPlaying(true);
      return;
    }

    setIsLoadingTrack(true);
    toast.loading(`🎵 Loading "${track.title}"...`, { id: 'track-loading' });

    try {
      const result = await fetchSongStreamUrl(track);

      if (result?.streamUrl) {
        track.streamUrl = result.streamUrl;
        track.duration = result.duration;

        if (curatedAudioPlayerRef.current) {
          curatedAudioPlayerRef.current.src = result.streamUrl;
          curatedAudioPlayerRef.current.currentTime = 0;
          curatedAudioPlayerRef.current.play().catch(() => {});
        }
        setIsPlaying(true);
        setSongTotalDuration(result.duration || 180);
        toast.success(`🎶 Now playing: ${result.title} — ${result.artist}`, { id: 'track-loading' });
      } else {
        toast.error(`Could not load "${track.title}". Try uploading your own MP3.`, { id: 'track-loading' });
      }
    } catch (err) {
      console.error('Track fetch error:', err);
      toast.error(`Failed to load song. Check if the server is running.`, { id: 'track-loading' });
    } finally {
      setIsLoadingTrack(false);
    }
  };

  // ── Live Debounced Song Search & Auto-Recommendations ─────────────────────
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    if (trimmed.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        // Immediate local matching from curated tracks
        const localMatches = CURATED_TRACKS.filter(t => 
          t.title.toLowerCase().includes(trimmed.toLowerCase()) ||
          t.movie?.toLowerCase().includes(trimmed.toLowerCase()) ||
          t.artist?.toLowerCase().includes(trimmed.toLowerCase())
        );

        // Online live search via proxy
        const onlineResults = await searchOnlineSongs(trimmed);
        
        // Merge seamlessly
        const combined = [...localMatches];
        onlineResults.forEach(o => {
          if (!combined.some(c => c.title.toLowerCase() === o.title.toLowerCase())) {
            combined.push(o);
          }
        });

        setSearchResults(combined.slice(0, 8));
      } catch (err) {
        console.warn('Live song search failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ── Online Song Search Handler ────────────────────────────────────────────
  const handlePerformSongSearch = async (e) => {
    e?.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const results = await searchOnlineSongs(trimmed);
      setSearchResults(results);
      if (!results.length) {
        toast('No songs found. Try another search keyword.', { icon: '🔍' });
      }
    } catch {
      toast.error('Search failed.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchInputChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (!val.trim()) {
      setSearchResults([]);
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
  };

  // ── Custom Audio Upload ───────────────────────────────────────────────────
  const handleCustomAudioUpload = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 30 * 1024 * 1024) { toast.error('Audio file must be under 30 MB.'); return; }

    const p = customAudioPlayerRef.current;
    if (customAudioUrl) URL.revokeObjectURL(customAudioUrl);
    const url = URL.createObjectURL(file);
    setCustomAudioFile(file);
    setCustomAudioUrl(url);
    setAudioMode('custom');
    setAudioStartTime(0);

    curatedAudioPlayerRef.current?.pause();
    if (p) {
      p.src = url;
      p.load();
      if (isPlaying && !isMuted) p.play().catch(() => {});
    }
    toast.success(`🎵 "${file.name}" set as soundtrack!`);
  };

  // ── Audio Start Time Change ───────────────────────────────────────────────
  const handleAudioStartTimeChange = (val) => {
    const newStart = Math.max(0, Math.min(val, Math.max(0, songTotalDuration - totalDuration)));
    setAudioStartTime(newStart);
    if (curatedAudioPlayerRef.current && audioMode === 'curated') {
      curatedAudioPlayerRef.current.currentTime = newStart;
    } else if (customAudioPlayerRef.current && audioMode === 'custom') {
      customAudioPlayerRef.current.currentTime = newStart;
    }
  };

  // ── Ratio Change ──────────────────────────────────────────────────────────
  const handleRatioChange = ratio => {
    setSelectedRatio(ratio);
    setAutoDetected(true);
    toast(`📐 ${ratio.label} — ${ratio.desc}`);
  };

  // ── Style Change ──────────────────────────────────────────────────────────
  const handleStyleChange = style => {
    setSelectedStyle(style);
    if (rendererRef.current) {
      rendererRef.current.setStylePreset(style.id);
      rendererRef.current.renderFrame(currentTime);
    }
    toast(`${style.emoji} Edit Style: ${style.label}`, { icon: '✨' });
  };

  // ── Export Video ──────────────────────────────────────────────────────────
  const handleExport = async () => {
    if (!photos.length || isExporting) return;

    // Immediately stop preview playback
    setIsPlaying(false);
    pauseAudio();

    // Instant download if already rendered
    if (lastVideoBlob) {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(lastVideoBlob);
      a.download = `SafarX_${(tripTitle || 'Reel').replace(/\s+/g, '_')}_${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success('🎬 Reel downloaded!');
      return;
    }

    cancelExportRef.current = false;
    setIsExporting(true);
    setExportProgress(0);
    setExportMessage('Initializing renderer...');

    const audioUrl = audioMode === 'custom' ? customAudioUrl : (selectedTrack?.streamUrl || null);

    try {
      const result = await exportReelVideo(
        photos,
        {
          width: selectedRatio.width,
          height: selectedRatio.height,
          fps: 30,
          slideDuration,
          tripTitle,
          travelerName,
          stylePreset: selectedStyle.id,
          audioUrl: !isMuted ? audioUrl : null,
          audioStartTime: audioStartTime,
          cancelRef: cancelExportRef
        },
        ({ progress, message }) => { setExportProgress(progress); setExportMessage(message); }
      );

      setLastVideoBlob(result.blob);

      const a = document.createElement('a');
      a.href = result.url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      toast.success('🎬 Reel downloaded! Ready to share.');
    } catch (err) {
      if (err.message?.includes('stopped') || err.message?.includes('cancelled')) {
        // user stopped render
      } else {
        console.error(err);
        toast.error('Export failed. Try fewer photos or another browser.');
      }
    } finally {
      setIsExporting(false);
    }
  };

  // ── Share Journey Click ───────────────────────────────────────────────────
  const handleShareClick = async () => {
    // Immediately stop preview playback
    setIsPlaying(false);
    pauseAudio();

    // If already rendered, open share modal instantly without re-rendering!
    if (lastVideoBlob) {
      onOpenShareModal(lastVideoBlob);
      return;
    }

    if (!photos.length || isExporting) return;

    cancelExportRef.current = false;
    toast('🎬 Preparing your reel for sharing...', { icon: '⚡' });
    setIsExporting(true);
    setExportProgress(0);
    setExportMessage('Rendering video for sharing...');

    try {
      const audioUrl = audioMode === 'custom' ? customAudioUrl : (selectedTrack?.streamUrl || null);
      const result = await exportReelVideo(
        photos,
        {
          width: selectedRatio.width,
          height: selectedRatio.height,
          fps: 30,
          slideDuration,
          tripTitle,
          travelerName,
          stylePreset: selectedStyle.id,
          audioUrl: !isMuted ? audioUrl : null,
          audioStartTime: audioStartTime,
          cancelRef: cancelExportRef
        },
        ({ progress, message }) => { setExportProgress(progress); setExportMessage(message); }
      );

      setLastVideoBlob(result.blob);
      setIsExporting(false);
      onOpenShareModal(result.blob);
    } catch (err) {
      setIsExporting(false);
    }
  };

  // Calculate exact preview dimensions based on the selected aspect ratio
  const getPreviewDimensions = (ratio) => {
    const aspect = ratio.width / ratio.height;
    const maxH = 430;
    const maxW = 320;

    let w, h;
    if (aspect <= 1) {
      // Portrait / Square (9:16, 4:5, 3:4, 1:1)
      h = Math.min(maxH, 430);
      w = h * aspect;
      if (w > maxW) {
        w = maxW;
        h = w / aspect;
      }
    } else {
      // Landscape (16:9)
      w = maxW;
      h = w / aspect;
    }
    return { width: Math.round(w), height: Math.round(h) };
  };

  const previewDim = getPreviewDimensions(selectedRatio);

  return (
    <div className="space-y-6">

      {/* ── 3-Column Studio Layout: Left (Preview) | Middle (Style & Ratio) | Right (Soundtrack) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

        {/* ── LEFT COLUMN (lg:col-span-4): Reel Canvas Preview & Player Controls ── */}
        <div className="lg:col-span-4 flex flex-col items-center bg-[#0b0f19] border border-white/8 rounded-3xl p-4 shadow-xl space-y-3 transition-all duration-300">
          {/* Header Badges */}
          <div className="flex items-center justify-between w-full px-1">
            <span className="text-[11px] font-mono text-slate-500">{selectedRatio.width}×{selectedRatio.height}</span>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-bold">
                {selectedRatio.emoji} {selectedRatio.label}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-[10px] font-semibold">
                {selectedStyle.label}
              </span>
            </div>
          </div>

          {/* Canvas frame with dynamic aspect ratio container */}
          <div
            className="relative flex items-center justify-center transition-all duration-300 py-1"
            style={{ width: '100%', minHeight: `${previewDim.height + 10}px` }}
          >
            <div className="absolute -inset-3 bg-gradient-to-tr from-amber-500/10 via-sky-500/8 to-indigo-500/10 rounded-3xl blur-xl pointer-events-none" />
            <motion.div
              layout
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`relative overflow-hidden bg-black shadow-2xl shadow-black/90 transition-all duration-300 ${
                selectedRatio.height > selectedRatio.width
                  ? 'rounded-[24px] border-[4px] border-slate-800'
                  : selectedRatio.width === selectedRatio.height
                    ? 'rounded-2xl border-[3px] border-slate-800'
                    : 'rounded-xl border-[3px] border-slate-800'
              }`}
              style={{ width: `${previewDim.width}px`, height: `${previewDim.height}px` }}
            >
              <canvas ref={canvasRef} className="w-full h-full object-contain block" />

              {isLoadingImages && (
                <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
                  <p className="text-xs text-slate-400">Loading moments…</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Timeline & Controls */}
          <div className="w-full bg-[#070a13] border border-white/8 rounded-2xl p-3 space-y-2">
            {/* Scrubber */}
            <div className="space-y-1">
              <input
                type="range"
                min={0}
                max={totalDuration || 30}
                step={0.05}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(totalDuration)}</span>
              </div>
            </div>

            {/* Buttons Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePlay}
                  className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 flex items-center justify-center font-bold hover:brightness-110 active:scale-95 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
                </button>
                <button
                  onClick={() => {
                    setCurrentTime(0);
                    if (rendererRef.current) rendererRef.current.renderFrame(0);
                    if (curatedAudioPlayerRef.current) curatedAudioPlayerRef.current.currentTime = audioStartTime;
                    if (customAudioPlayerRef.current) customAudioPlayerRef.current.currentTime = audioStartTime;
                  }}
                  className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Restart"
                >
                  <RotateCcw size={14} />
                </button>
              </div>

              {/* Audio status badge & mute toggle */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                  {audioMode === 'custom' ? `📁 ${customAudioFile?.name || 'Custom'}` : audioMode === 'none' ? '🔇 Silent' : `${selectedTrack.emoji} ${selectedTrack.title}`}
                </span>
                <button
                  onClick={toggleMute}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                    isMuted || audioMode === 'none'
                      ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                      : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white'
                  }`}
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted || audioMode === 'none' ? <VolumeX size={14} /> : <Volume2 size={14} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── MIDDLE COLUMN (lg:col-span-4): Editing Style & FX + Reel Size / Ratio ── */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Editing Style & FX Card */}
          <div className="bg-[#0b0f19] border border-white/8 rounded-3xl p-4 shadow-xl space-y-3">
            <div className="flex items-center gap-2.5 pb-2 border-b border-white/6">
              <div className="w-8 h-8 rounded-lg bg-orange-500/15 flex items-center justify-center">
                <Clapperboard size={16} className="text-orange-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Editing Style & FX</p>
                <p className="text-[10px] text-slate-400">{selectedStyle.emoji} {selectedStyle.label} preset active</p>
              </div>
            </div>
            <StyleSelector selectedStyle={selectedStyle} onSelect={handleStyleChange} />
          </div>

          {/* Reel Size / Ratio Card */}
          <div className="bg-[#0b0f19] border border-white/8 rounded-3xl p-4 shadow-xl space-y-3">
            <div className="flex items-center gap-2.5 pb-2 border-b border-white/6">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
                <Layers size={16} className="text-amber-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Reel Size & Aspect Ratio</p>
                <p className="text-[10px] text-slate-400">{selectedRatio.label} ({selectedRatio.desc})</p>
              </div>
            </div>
            <RatioSelector selectedRatio={selectedRatio} onSelect={handleRatioChange} />
          </div>
        </div>

        {/* ── RIGHT COLUMN (lg:col-span-4): Soundtrack, Search & Audio Trimmer ── */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#0b0f19] border border-white/8 rounded-3xl p-4 shadow-xl space-y-3.5">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-white/6">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-500/15 flex items-center justify-center">
                  <Music size={16} className="text-sky-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Soundtrack & Trimmer</p>
                  <p className="text-[10px] text-slate-400 truncate max-w-[160px]">
                    {audioMode === 'custom' ? `🎵 ${customAudioFile?.name || 'Custom'}` : audioMode === 'none' ? 'Silent' : `${selectedTrack.emoji || '🎵'} ${selectedTrack.title}`}
                  </p>
                </div>
              </div>
            </div>

            {/* ✂️ Song Segment Trimmer (Sync with Reel Length) */}
            {audioMode !== 'none' && (
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
                    <Scissors size={12} /> Trim Audio Segment
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-amber-500/30 text-amber-300">
                    Reel Length: {totalDuration.toFixed(1)}s
                  </span>
                </div>

                <div>
                  <input
                    type="range"
                    min={0}
                    max={Math.max(1, songTotalDuration - totalDuration)}
                    step={1}
                    value={audioStartTime}
                    onChange={(e) => handleAudioStartTimeChange(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                    <span>Start: <strong className="text-amber-400">{formatTime(audioStartTime)}</strong></span>
                    <span>End: <strong className="text-white">{formatTime(audioStartTime + totalDuration)}</strong></span>
                  </div>
                </div>

                {/* Quick jumps */}
                <div className="flex items-center gap-1 pt-0.5">
                  <span className="text-[9px] text-slate-500 font-semibold">Jump:</span>
                  {[
                    { label: '0:00 (Intro)', time: 0 },
                    { label: '0:30', time: 30 },
                    { label: '0:45 (Chorus)', time: 45 },
                    { label: '1:15 (Drop)', time: 75 }
                  ].map(q => (
                    <button
                      key={q.label}
                      onClick={() => handleAudioStartTimeChange(q.time)}
                      className={`text-[9px] px-1.5 py-0.5 rounded-md border transition-all ${
                        Math.abs(audioStartTime - q.time) < 3
                          ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                          : 'bg-slate-900/80 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 🔍 Search Online Songs & Live Recommendations */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">🔍 Search Any Song Online</p>
                {isSearching && (
                  <span className="text-[9px] text-amber-400 font-medium flex items-center gap-1">
                    <Loader2 size={10} className="animate-spin" /> Live searching...
                  </span>
                )}
              </div>

              <form onSubmit={handlePerformSongSearch} className="flex gap-1.5">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    placeholder="Type song name (e.g. Kesariya, Pasoori, Ilahi)..."
                    className="w-full bg-[#070a13] border border-white/10 rounded-xl pl-7 pr-7 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                  <Search size={12} className="absolute left-2.5 top-2.5 text-slate-500" />
                  {searchQuery && (
                    <button 
                      type="button" 
                      onClick={handleClearSearch} 
                      className="absolute right-2 top-2 text-slate-400 hover:text-white p-0.5"
                      title="Clear Search"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isSearching || !searchQuery.trim()}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 shrink-0 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSearching ? <Loader2 size={12} className="animate-spin" /> : 'Search'}
                </button>
              </form>

              {/* Quick Recommendation Chips (when search input is empty) */}
              {!searchQuery.trim() && (
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="text-[9px] text-slate-500 font-semibold">Try:</span>
                  {['Kesariya', 'Ilahi', 'Pasoori', 'Safarnama', 'Chaleya', 'Kabira', 'Chaudhary'].map(rec => (
                    <button
                      key={rec}
                      type="button"
                      onClick={() => setSearchQuery(rec)}
                      className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 hover:bg-amber-500/20 text-slate-400 hover:text-amber-300 border border-white/10 hover:border-amber-500/30 transition-all cursor-pointer"
                    >
                      {rec}
                    </button>
                  ))}
                </div>
              )}

              {/* Search Results / Live Recommendations */}
              {searchQuery.trim() && searchResults.length > 0 && (
                <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] text-amber-400 font-semibold">Found {searchResults.length} recommendations:</p>
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="text-[9px] text-slate-500 hover:text-slate-300"
                    >
                      Clear
                    </button>
                  </div>
                  {searchResults.map(song => (
                    <TrackCard
                      key={song.id}
                      track={song}
                      isSelected={audioMode === 'curated' && selectedTrack.title === song.title}
                      isPlaying={isPlaying}
                      onSelect={handleSelectTrack}
                    />
                  ))}
                </div>
              )}

              {/* No results message when user typed a query and search completed */}
              {searchQuery.trim().length >= 2 && !isSearching && searchResults.length === 0 && (
                <p className="text-[10px] text-slate-500 italic py-1">
                  No matching tracks found for "{searchQuery}". Try another keyword or pick from trending below.
                </p>
              )}
            </div>

            {/* Trending Curated Bollywood Tracks */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">🎬 Trending Bollywood Songs</p>
              <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                {CURATED_TRACKS.map(track => (
                  <TrackCard key={track.id} track={track}
                    isSelected={audioMode === 'curated' && selectedTrack.id === track.id}
                    isPlaying={isPlaying}
                    onSelect={handleSelectTrack} />
                ))}
                {/* Silent */}
                <div onClick={() => { setAudioMode('none'); pauseAudio(); }}
                  className={`flex items-center gap-2.5 p-2 rounded-xl border cursor-pointer transition-all ${
                    audioMode === 'none' ? 'bg-slate-700/40 border-slate-600 text-slate-300' : 'bg-[#070a13] border-white/8 text-slate-500 hover:border-white/20'
                  }`}>
                  <VolumeX size={14} />
                  <div><p className="text-xs font-semibold">No Audio (Silent)</p></div>
                  {audioMode === 'none' && <Check size={12} className="ml-auto" />}
                </div>
              </div>
            </div>

            {/* Upload own audio */}
            <div>
              <label htmlFor="custom-audio-upload"
                className={`flex items-center gap-2.5 p-2 rounded-xl border border-dashed cursor-pointer transition-all ${
                  audioMode === 'custom' ? 'border-sky-500/50 bg-sky-500/8 text-sky-400' : 'border-white/15 hover:border-white/30 text-slate-400'
                }`}>
                <Upload size={14} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{customAudioFile ? customAudioFile.name : 'Upload MP3 / WAV'}</p>
                </div>
                {audioMode === 'custom' && <Check size={14} className="ml-auto text-sky-400" />}
              </label>
              <input id="custom-audio-upload" type="file" accept="audio/*" onChange={handleCustomAudioUpload} className="hidden" />
            </div>

          </div>
        </div>

      </div>

      {/* ── BOTTOM ACTION & SHARING BAR (Full Width Spanning Across Bottom) ── */}
      <div className="bg-[#0b0f19] border border-white/8 rounded-3xl p-5 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Journey Stats */}
        <div className="flex items-center gap-3 flex-wrap">
          {[{ label: 'Photos', value: `${photos.length} shots` }, { label: 'Duration', value: `${Math.round(totalDuration)}s` }, { label: 'Style', value: selectedStyle.label }, { label: 'Ratio', value: selectedRatio.label }].map(s => (
            <div key={s.label} className="bg-[#070a13] border border-white/8 rounded-xl px-3.5 py-2 text-left">
              <p className="text-[10px] text-slate-500 uppercase font-semibold">{s.label}</p>
              <p className="text-xs font-bold text-amber-400 truncate">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button onClick={handleShareClick}
            disabled={isExporting || !photos.length}
            className="flex-1 md:flex-initial px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Share2 size={16} />
            Share Reel via App or QR Code
            {lastVideoBlob && <span className="text-[10px] ml-1 bg-slate-950/30 px-2 py-0.5 rounded-full font-bold">✓ Ready</span>}
          </button>
          
          <button onClick={handleExport} disabled={isExporting || !photos.length}
            className="flex-1 md:flex-initial px-5 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs flex items-center justify-center gap-2 border border-white/10 transition-all disabled:opacity-40 cursor-pointer"
          >
            <Download size={14} className="text-sky-400" />
            {isExporting ? `Encoding… ${exportProgress}%` : lastVideoBlob ? `Download Reel (Instant)` : `Download ${selectedRatio.label} Video`}
          </button>
        </div>

      </div>

      {/* Export Progress Modal with Midway Stop / Cut Icon */}
      <AnimatePresence>
        {isExporting && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50"
          >
            <div className="bg-[#0b0f19] border border-white/10 rounded-3xl p-7 max-w-sm w-full text-center space-y-4 shadow-2xl relative">
              {/* Cut / Stop Icon at Top Right */}
              <button
                onClick={() => {
                  cancelExportRef.current = true;
                  setIsExporting(false);
                  toast('Rendering stopped', { icon: '🛑' });
                }}
                className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                title="Stop rendering"
              >
                <X size={16} />
              </button>

              <Sparkles className="animate-spin w-10 h-10 text-amber-500 mx-auto" />
              <div>
                <h4 className="text-lg font-bold text-white">Rendering Cinematic Reel</h4>
                <p className="text-xs text-slate-400 mt-1">{exportMessage}</p>
              </div>

              <div className="space-y-1.5">
                <div className="w-full bg-white/8 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-full transition-all duration-300 rounded-full" style={{ width: `${exportProgress}%` }} />
                </div>
                <p className="text-right text-xs font-mono text-amber-400">{exportProgress}%</p>
              </div>

              {/* Stop Midway Button */}
              <button
                onClick={() => {
                  cancelExportRef.current = true;
                  setIsExporting(false);
                  toast('Rendering stopped', { icon: '🛑' });
                }}
                className="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-red-400 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <X size={14} /> Stop / Cancel Render
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
