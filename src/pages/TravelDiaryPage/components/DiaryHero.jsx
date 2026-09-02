import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Share2, Upload, ChevronDown } from 'lucide-react';

/**
 * The opening of the diary.
 *
 * The page used to begin with a heading squeezed against the navbar and a
 * button floating off to the right — it read as a form, not as the place you
 * come back to after a trip. It opens on somewhere now, with the two things
 * you can actually do here stated once, in the middle, where they are easy to
 * find.
 *
 * Still first, film second: the photograph is up immediately so the hero is
 * never a flat colour while four megabytes arrive, and the video only fades in
 * once it can play. Reduced motion never loads it at all.
 */

const EASE = [0.22, 1, 0.36, 1];

const STILL =
  'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=2000&q=80&auto=format&fit=crop';
/* Mehrangarh at 1080p, 4.4MB — curl-checked. Deliberately not one of the 4K
   files elsewhere in the app: this sits under a heavy scrim at low opacity. */
const FILM = 'https://videos.pexels.com/video-files/17453762/17453762-hd_1920_1080_24fps.mp4';

const DiaryHero = ({ photoCount, onShare, onScrollToContent }) => {
  const reduce = useReducedMotion();
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    videoRef.current?.play?.().catch(() => {});
  }, []);

  return (
    <header className="relative isolate flex min-h-[60vh] items-center justify-center overflow-hidden">
      <img src={STILL} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover opacity-45" />

      {!reduce && (
        <motion.video
          ref={videoRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: playing ? 0.45 : 0 }}
          transition={{ duration: 1.6, ease: EASE }}
          src={FILM}
          poster={STILL}
          muted
          loop
          playsInline
          preload="auto"
          onCanPlay={() => setPlaying(true)}
          onError={() => setPlaying(false)}
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      {/* Ink from every edge, so the type sits on ground rather than on film. */}
      <div className="absolute inset-0 bg-gradient-to-b from-ink-950 via-ink-950/70 to-ink-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_25%,rgba(6,20,18,0.85)_100%)]" />

      <motion.div
        initial={{ opacity: 0, y: reduce ? 0 : 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE }}
        className="relative mx-auto max-w-3xl px-6 pb-12 pt-28 text-center"
      >
        <p className="mb-5 flex items-center justify-center gap-3">
          <span className="route-line w-10 hidden sm:inline-block" aria-hidden="true" />
          <span className="route-dot" aria-hidden="true" />
          <span className="eyebrow">Digital diary</span>
          <span className="route-dot" aria-hidden="true" />
          <span className="route-line w-10 hidden sm:inline-block" aria-hidden="true" />
        </p>

        <h1 className="font-display text-4xl font-light leading-[1.05] tracking-tight text-ivory sm:text-5xl lg:text-6xl">
          The trip is over.{' '}
          <em className="not-italic font-display italic text-saffron">The film isn&apos;t.</em>
        </h1>

        <p className="mx-auto mt-5 max-w-xl font-sans text-[15px] leading-relaxed text-ivory-muted">
          Drop in the photographs you came home with. SafarX cuts them into a
          cinematic reel with music, and gives you a link and a QR code to send
          to everyone who was there.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button onClick={onScrollToContent} className="btn-primary w-full sm:w-auto">
            <Upload size={15} aria-hidden="true" />
            {photoCount ? `Edit your ${photoCount} photos` : 'Add your photos'}
          </button>
          <button onClick={onShare} className="btn-ghost w-full sm:w-auto">
            <Share2 size={15} aria-hidden="true" />
            Share this journey
          </button>
        </div>

        {/* Where the page continues, said once rather than left to guesswork. */}
        <button
          onClick={onScrollToContent}
          aria-label="Scroll to your journey"
          className="mx-auto mt-10 flex flex-col items-center gap-1.5 font-data text-[9.5px] uppercase tracking-[0.22em] text-ivory-faint transition-colors hover:text-saffron"
        >
          Your journey
          <ChevronDown size={14} className={reduce ? '' : 'animate-bounce'} aria-hidden="true" />
        </button>
      </motion.div>
    </header>
  );
};

export default DiaryHero;
