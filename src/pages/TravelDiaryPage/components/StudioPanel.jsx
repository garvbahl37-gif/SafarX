import React from 'react';

/**
 * One panel of the reel studio.
 *
 * The three panels — style, size, soundtrack — each built their own header
 * inline: a coloured square holding an icon, a title at text-xs font-bold,
 * and a subtitle at 10px. Written out three times, so they were three
 * chances to drift apart, and the title was the only heading in the app set
 * in small bold sans rather than the display face.
 *
 * The icon square is gone. It appeared identically above every panel
 * regardless of content, which makes it decoration rather than information —
 * and with three of them stacked down one screen it was the loudest repeated
 * element in the studio. What a person needs from a panel header is its name
 * and what is currently set, so that is what is left.
 *
 * @param {string} title what the panel controls
 * @param {string} [status] what is set right now, e.g. "35mm Film"
 */
const StudioPanel = ({ title, status, children, className = '' }) => (
  <section className={`rounded-[26px] border border-white/[0.07] bg-ink-900 p-5 shadow-xl ${className}`}>
    <header className="mb-4 border-b border-white/[0.07] pb-3.5">
      <h3 className="font-display text-[1.05rem] font-medium leading-snug text-ivory">
        {title}
      </h3>
      {status && (
        /* The data face, because this is a setting's current value — the same
           treatment the tracker gives a time or a platform number. */
        <p className="mt-1 truncate font-data text-[11px] tracking-[0.04em] text-saffron-bright">
          {status}
        </p>
      )}
    </header>
    {children}
  </section>
);

export default StudioPanel;
