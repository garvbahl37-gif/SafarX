import React, { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { originalFrom } from '../../utils/imageCdn';

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
const GemThumbnail = ({ images = [], video = null, alt, fallback, interval = 2600, priority = false, className = '' }) => {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  /* Nothing but the first picture exists until the card has ticked once.
     Mounting the queued and outgoing frames up front tripled the number of
     images the page asks for before it can show anything — 270 requests for
     90 cards, when 90 would have done. The extra frames are only needed once
     something is actually cycling, and by then the visible one has arrived. */
  const [cycled, setCycled] = useState(false);

  const frames = images.length ? images : [fallback];
  const cycles = frames.length > 1 && !reduce;

  /* Three frames stay mounted: the one leaving, the one showing, and the one
     queued behind it. The outgoing frame matters — drop it and there is
     nothing to cross-fade *from*, so the picture blinks through the empty
     card instead of dissolving. */
  const n = frames.length;
  const visible = (i) =>
    !cycled
      ? i === index
      : i === index || i === (index + 1) % n || i === (index - 1 + n) % n;

  /* Cards tick only while they are on screen.
     This was tried once before, never reported, and was removed because no
     card cycled at all. It is back because it turned out to matter: a card
     that advances off screen mounts its next frame, and a mounted frame near
     the viewport gets fetched, so ninety-six cards quietly pulled 129 images
     for the nine anybody could see. The difference this time is that the
     observer watches a ref on this component's own root, and that the effect
     re-runs when that ref is attached — the earlier version observed a node
     that did not exist yet, which is why it never fired. */
  const rootRef = useRef(null);
  const [onScreen, setOnScreen] = useState(false);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return undefined;
    if (typeof IntersectionObserver === 'undefined') {
      setOnScreen(true);            // no observer, no gating
      return undefined;
    }
    const io = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      /* A margin, so a card starts cycling just before it is scrolled to
         rather than visibly waking up once it arrives. */
      { rootMargin: '200px' }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!cycles || !onScreen) return undefined;
    const id = setInterval(() => {
      setCycled(true);
      setIndex((n) => (n + 1) % frames.length);
    }, interval);
    return () => clearInterval(id);
  }, [cycles, onScreen, frames.length, interval]);

  return (
    <div ref={rootRef} className={`relative h-full w-full ${className}`}>
      {frames.map((src, i) => (
        /* Only the frame showing and the one after it are in the DOM.
           Stacking all of them put 504 <img> elements on the gems page — six
           per card across ninety-six cards — and the browser will not decode
           five hundred images quickly however small each one is, so the grid
           filled in slowly even once the photographs themselves were fast.
           Two is all a cross-fade needs: the next frame is already loaded by
           the time it becomes the current one. */
        !visible(i) ? null : (
        <img
          key={src}
          src={src}
          /* The alt belongs to whichever frame is actually showing. Pinning
             it to frame 0 left the card unnamed whenever frame 0 was one of
             the ones no longer mounted. */
          alt={i === index ? alt : ''}
          aria-hidden={i === index ? undefined : true}
          /* Lazy everywhere except the cards already on screen. Marking those
             lazy too is what made the grid look slow: the browser treats a
             lazy image as low priority and starts it after the rest of the
             page, so the first row — the only part anyone is looking at —
             arrived last. */
          loading={priority ? 'eager' : 'lazy'}
          fetchpriority={priority && i === index ? 'high' : 'auto'}
          decoding="async"
          /* Stacked and cross-faded rather than swapped, so a slow image
             never leaves a hole where the picture was. */
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            i === index ? 'opacity-100' : 'opacity-0'
          }`}
          /* Three steps down, not one. The CDN first; if that fails, the
             original Wikimedia file, which is slower but real; only then the
             placeholder. Going straight to the placeholder made a proxy
             outage look identical to having no photograph at all. */
          onError={(e) => {
            const el = e.currentTarget;
            const source = originalFrom(el.src);
            if (source) {
              el.src = source;
              return;
            }
            el.onerror = null;
            el.src = fallback;
          }}
        />
        )
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
