import React, { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

/**
 * A gem's photograph, or its photographs.
 *
 * Where a place has more than one picture the thumbnail cycles them, which is
 * the difference between a card and a window. Two rules keep it from becoming
 * noise: a card with a single photograph never animates, and neither does
 * anything off screen — an observer pauses cards that have scrolled away, so
 * a page of ninety-seven gems is not running ninety-seven timers.
 *
 * Reduced motion stops the cycling entirely and shows the first frame.
 *
 * @param {string[]} images already-resolved URLs, first one leading
 * @param {number} [interval] ms between frames
 */
const GemThumbnail = ({ images = [], video = null, alt, fallback, interval = 2600, className = '' }) => {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);

  const frames = images.length ? images : [fallback];
  const cycles = frames.length > 1 && !reduce;

  /* One timer per multi-photo card, unconditionally.
     This was gated behind an IntersectionObserver so that off-screen cards
     did not tick — a saving worth nothing, since the observer never reported
     and no card ever cycled at all. Browsers already throttle timers in
     background tabs, which is the case that actually mattered. */
  useEffect(() => {
    if (!cycles) return undefined;
    const id = setInterval(() => setIndex((n) => (n + 1) % frames.length), interval);
    return () => clearInterval(id);
  }, [cycles, frames.length, interval]);

  return (
    <div className={`relative h-full w-full ${className}`}>
      {frames.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={i === 0 ? alt : ''}
          aria-hidden={i === 0 ? undefined : true}
          /* Every frame lazy, not just the first. This said the opposite —
             frame one deferred and the other five fetched eagerly — which on
             a grid of ninety-six cards is well over five hundred images
             requested up front. */
          loading="lazy"
          decoding="async"
          /* Stacked and cross-faded rather than swapped, so a slow image
             never leaves a hole where the picture was. */
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            i === index ? 'opacity-100' : 'opacity-0'
          }`}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = fallback;
          }}
        />
      ))}

      {/* Commons footage of the place, over the stills, muted and looping.
          It is an extra rather than the picture: Safari plays neither webm
          nor ogv, so the photographs underneath are what everyone is
          guaranteed to see, and onError simply leaves them showing. */}
      {video && !reduce && (
        <video
          src={video.url}
          poster={frames[0]}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
          onError={(e) => e.currentTarget.remove()}
        />
      )}

      {/* Which frame, for anyone counting. Hidden when there is only one. */}
      {frames.length > 1 && (
        <span className="absolute bottom-3 right-3 z-10 flex gap-1.5" aria-hidden="true">
          {frames.map((src, i) => (
            <span
              key={src}
              className={`h-1 rounded-full transition-all duration-500 ${
                i === index ? 'w-4 bg-ivory/90' : 'w-1 bg-ivory/40'
              }`}
            />
          ))}
        </span>
      )}
    </div>
  );
};

export default GemThumbnail;
