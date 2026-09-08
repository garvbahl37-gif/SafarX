import React, { useCallback, useEffect, useRef, useState } from 'react';

/**
 * A background video that loops without showing the join.
 *
 * The `loop` attribute cuts from the last frame straight back to the first.
 * That is invisible only if a clip was shot to loop, and almost none are — so
 * every twelve seconds the picture jumps and reads as the video restarting,
 * which is exactly what it is doing.
 *
 * This keeps two copies of the same file stacked on top of each other and
 * hands over between them. Shortly before the playing one runs out, the other
 * starts from the beginning and the two cross-fade; the outgoing copy is then
 * reset, ready to be the incoming one next time. What you see is a dissolve
 * rather than a cut, and there is no moment where the frame jumps.
 *
 * The second copy costs nothing extra to download — same URL, so the browser
 * serves it from cache — and both are muted, so nothing is audible either way.
 *
 * Falls back honestly: if metadata never arrives, `duration` stays unknown, no
 * handover is ever scheduled, and the first copy simply plays to its end.
 * Reduced-motion callers should not use this at all; pass a still instead.
 *
 * @param {string} src        the video file
 * @param {number} [fade]     seconds of overlap; 0.9 hides a hard cut without
 *                            reading as a deliberate dissolve
 * @param {string} [className] applied to both layers
 */
const LoopVideo = ({ src, fade = 0.9, className = '', ...rest }) => {
  const refs = [useRef(null), useRef(null)];
  const [front, setFront] = useState(0);
  const swapping = useRef(false);

  /* Both copies start muted and inline; only the front one is playing. */
  useEffect(() => {
    const a = refs[0].current;
    if (a) a.play?.().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  const onTime = useCallback((index) => (event) => {
    if (index !== front || swapping.current) return;
    const el = event.currentTarget;
    const { duration, currentTime } = el;
    // No duration yet means no handover can be scheduled — see the note above.
    if (!Number.isFinite(duration) || duration <= fade) return;
    if (duration - currentTime > fade) return;

    swapping.current = true;
    const next = refs[1 - index].current;
    if (next) {
      next.currentTime = 0;
      next.play?.().catch(() => {});
    }
    setFront(1 - index);

    /* Rewind the outgoing copy only once it is fully hidden, so the rewind
       itself is never on screen. */
    window.setTimeout(() => {
      el.pause?.();
      el.currentTime = 0;
      swapping.current = false;
    }, fade * 1000);
  }, [front, fade]);

  return (
    <>
      {[0, 1].map((i) => (
        <video
          key={i}
          ref={refs[i]}
          src={src}
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          onTimeUpdate={onTime(i)}
          style={{
            opacity: front === i ? 1 : 0,
            transition: `opacity ${fade}s linear`,
          }}
          className={className}
          {...rest}
        />
      ))}
    </>
  );
};

export default LoopVideo;
