import React from 'react';

/**
 * The SafarX wordmark.
 *
 * There is no logo file in this project — the mark has always been set in
 * type: "Safar" in the display face, italic, and the X in the data face in
 * saffron, the same pairing the header uses. It was written out by hand
 * wherever it appeared, so this is that markup in one place.
 *
 * @param {"sm"|"md"|"lg"} [size]
 * @param {boolean} [working] draw an arc turning around it, for long waits
 */

const SIZES = {
  sm: { safar: 'text-[1rem]', x: 'text-[0.85rem]', ring: 44 },
  md: { safar: 'text-[1.3rem]', x: 'text-[1.1rem]', ring: 58 },
  lg: { safar: 'text-[2rem]', x: 'text-[1.7rem]', ring: 84 },
};

const SafarXMark = ({ size = 'md', working = false, className = '' }) => {
  const s = SIZES[size] || SIZES.md;

  const wordmark = (
    <span className="flex items-baseline gap-0.5" aria-label="SafarX">
      <span className={`font-display italic font-medium ${s.safar} text-ivory tracking-tight`}>
        Safar
      </span>
      <span className={`font-data ${s.x} text-saffron tracking-[0.04em] font-bold`}>X</span>
    </span>
  );

  if (!working) return <span className={className}>{wordmark}</span>;

  /* The letters stay still and an arc turns around them. Spinning a wordmark
     makes it unreadable, which rather defeats the point of showing it. */
  return (
    <span className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={s.ring}
        height={s.ring}
        viewBox="0 0 100 100"
        className="absolute animate-spin [animation-duration:2.4s]"
        aria-hidden="true"
      >
        <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(212,168,67,0.16)" strokeWidth="3" />
        <circle
          cx="50" cy="50" r="46" fill="none"
          stroke="rgb(229,190,92)" strokeWidth="3" strokeLinecap="round"
          strokeDasharray="70 219"
        />
      </svg>
      {wordmark}
    </span>
  );
};

export default SafarXMark;
