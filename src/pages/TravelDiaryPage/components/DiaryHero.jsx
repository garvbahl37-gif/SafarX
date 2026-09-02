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

/* The Golden Temple at Amritsar, lit gold on black water at night — its own footage rather
   than a clip borrowed from another page, and a palette that happens to be the
   app's own. 1080p at 6.6MB, with its poster from the same source; both
   curl-checked. */
const STILL =
  'https://images.pexels.com/videos/10307864/pexels-photo-10307864.jpeg?auto=compress&cs=tinysrgb&w=1920';
const FILM = 'https://videos.pexels.com/video-files/10307864/10307864-hd_1920_1080_25fps.mp4';

const DiaryHero = ({ photoCount, onShare, onScrollToContent }) => {
  const reduce = useReducedMotion();
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    videoRef.current?.play?.().catch(() => {});
  }, []);

  return (
    <header className="relative isolate flex min-h-[60vh] items-center justify-center overflow-hidden">
      <img src={STILL} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover brightness-[0.42] saturate-[1.15]" />

      {!reduce && (
        <motion.video
          ref={videoRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: playing ? 1 : 0 }}
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
          className="absolute inset-0 h-full w-full object-cover brightness-[0.42] saturate-[1.15]"
        />
      )}

      {/* The film plays at full strength; only the edges are inked, so it
          reads as footage rather than as a tinted texture. The top band
          carries the floating navbar, the bottom hands off to the page, and
          a soft plate sits behind the type so it stays legible without
          greying out the whole frame. */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink-950 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-ink-950 via-ink-950/80 to-transparent" />
      {/* A band, not an ellipse. It runs the full width so it has no edge to
          notice — the earlier radial plate read as a black circle sitting on
          the picture. Darkest through the middle, where the words are. */}
      <div className="absolute inset-x-0 top-[14%] bottom-[18%] bg-gradient-to-b from-transparent via-ink-950/45 to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: reduce ? 0 : 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE }}
        className="relative mx-auto max-w-3xl px-6 pb-12 pt-28 text-center [text-shadow:0_2px_20px_rgba(6,20,18,0.9)]"
      >

        <div className="relative z-10">
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
        </div>
      </motion.div>
    </header>
  );
};

export default DiaryHero;
