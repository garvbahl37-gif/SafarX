import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * The moving backdrop behind Safar Groups.
 *
 * Still first, film second — the same order the sign-in page uses, and for the
 * same reason. The photograph is up immediately at full quality, so the page
 * is never a flat colour while nine megabytes arrive, and the video fades in
 * only once it can actually play. A slow connection therefore degrades to a
 * good photograph rather than to nothing, and reduced-motion never loads the
 * video at all.
 *
 * It sits under a heavy ink scrim at low opacity, which is the whole point:
 * it should register as movement in the corner of your eye, not compete with
 * the cards in front of it.
 */

const STILL =
  'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=2000&q=80&auto=format&fit=crop';
/* Jaipur at street level, 1080p at 9.4MB — curl-checked. Deliberately not one
   of the 4K files elsewhere in the app: this is a backdrop at a quarter
   opacity, and nobody should pay 25MB for something they half-see. */
const FILM = 'https://videos.pexels.com/video-files/37056813/15698517_1920_1080_50fps.mp4';

const GroupsBackdrop = () => {
  const reduce = useReducedMotion();
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    videoRef.current?.play?.().catch(() => {});
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
      <img src={STILL} alt="" className="h-full w-full object-cover opacity-25" />

      {!reduce && (
        <motion.video
          ref={videoRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: playing ? 0.25 : 0 }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
          src={FILM}
          poster={STILL}
          muted
          loop
          playsInline
          preload="auto"
          onCanPlay={() => setPlaying(true)}
          onError={() => setPlaying(false)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-b from-ink-950/80 via-ink-950/70 to-ink-950" />
    </div>
  );
};

export default GroupsBackdrop;
