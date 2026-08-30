import React from 'react';

/**
 * A traveller's face, or a stand-in for it.
 *
 * The stand-in used to come from ui-avatars.com, which meant every group card
 * fired off a handful of requests to a third party and rendered initials like
 * "La 0" and "Ra 3" — placeholder text presented as people. This draws the
 * fallback itself: no network, nothing to fail, and the colour is derived from
 * the name so the same person keeps the same badge everywhere in the app.
 */

/* Drawn from the Peacock & Gold palette rather than random hues, so a row of
   members reads as part of SafarX rather than a bag of sweets. */
const TONES = [
  { bg: 'rgba(212,168,67,0.22)', fg: '#E5BE5C', ring: 'rgba(212,168,67,0.45)' },
  { bg: 'rgba(46,139,116,0.24)', fg: '#3FA98E', ring: 'rgba(46,139,116,0.45)' },
  { bg: 'rgba(242,239,230,0.14)', fg: '#F2EFE6', ring: 'rgba(242,239,230,0.30)' },
  { bg: 'rgba(166,126,43,0.28)', fg: '#E5BE5C', ring: 'rgba(166,126,43,0.5)' },
  { bg: 'rgba(31,95,79,0.34)', fg: '#3FA98E', ring: 'rgba(31,95,79,0.6)' },
];

const toneFor = (seed = '') => {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  return TONES[Math.abs(hash) % TONES.length];
};

/** "Anjali Menon" → "AM"; "anjali" → "A". Never more than two letters. */
const initialsOf = (name = '') => {
  const words = String(name).trim().split(/\s+/).filter(Boolean);
  if (!words.length) return '·';
  const first = words[0][0] || '';
  const last = words.length > 1 ? words[words.length - 1][0] : '';
  return (first + last).toUpperCase();
};

/**
 * @param {object} props
 * @param {string} [props.src] a real photograph, when there is one
 * @param {string} [props.name] used for the initials and the colour
 * @param {number} [props.size] pixels
 */
const Avatar = ({ src, name, size = 32, className = '', title }) => {
  const [broken, setBroken] = React.useState(false);
  const tone = toneFor(name || '');
  const showImage = src && !broken;

  return (
    <span
      title={title || name || undefined}
      style={{
        width: size,
        height: size,
        background: showImage ? 'transparent' : tone.bg,
        boxShadow: `inset 0 0 0 1px ${tone.ring}`,
      }}
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full ${className}`}
    >
      {showImage ? (
        <img
          src={src}
          alt={name ? `${name}` : ''}
          onError={() => setBroken(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span
          aria-hidden={!name}
          style={{ color: tone.fg, fontSize: Math.max(9, size * 0.38) }}
          className="font-data font-bold leading-none tracking-[0.02em]"
        >
          {initialsOf(name)}
        </span>
      )}
    </span>
  );
};

export default Avatar;
