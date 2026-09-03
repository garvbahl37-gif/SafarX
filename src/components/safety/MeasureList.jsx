import React from 'react';

/**
 * The advisories on a safety tab.
 *
 * These were three bordered cards per tab, and each tab drew them slightly
 * differently — the post-trip set put its tag on a line of its own, the
 * during-trip set ran it inline — so the same information looked like two
 * components. Descriptions of unequal length then left the boxes ragged.
 *
 * They are one panel now, divided rather than boxed. That matters beyond
 * tidiness: on the post-trip tab these sit directly above the review form,
 * and three heavy cards competed with the thing a person is actually there to
 * do. Explanations should be quieter than the action they explain.
 *
 * @param {{title: string, desc: string, tag: string}[]} items
 * @param {"horizon"|"danger"} [tone] which state the tab is describing
 */
/* A column count the item count divides into. Four advisories in a
   three-column grid leave a ragged 3-and-1 row, which the dividers make
   worse by drawing a rule against empty space. */
const COLUMNS = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
};

const TONES = {
  horizon: 'text-horizon-bright',
  danger: 'text-danger-bright',
};

const MeasureList = ({ items = [], tone = 'horizon' }) => {
  if (!items.length) return null;
  /* Three items sit in three columns, four in two — a count the items
     divide into, so no row ends against empty space. */
  const cols = items.length % 3 === 0 ? 3 : 2;

  return (
    <div className="overflow-hidden rounded-[22px] border border-white/[0.08] bg-ink-950/60">
      {/* Dividers only between, never around: the panel already has an edge.
          Vertical rules appear once the columns do. */}
      <div
        className={`grid divide-y divide-white/[0.06] sm:divide-x ${COLUMNS[cols]} ${
          /* Two rows need a rule between them; one row does not. */
          items.length > cols ? 'sm:divide-y' : 'sm:divide-y-0'
        }`}
      >
        {items.map((item) => (
          <div key={item.title} className="flex flex-col gap-2 p-5">
            <p className={`font-data text-[10px] font-medium uppercase tracking-[0.18em] ${TONES[tone] || TONES.horizon}`}>
              {item.tag}
            </p>
            <p className="font-display text-[1.05rem] font-medium leading-snug text-ivory">
              {item.title}
            </p>
            <p className="font-sans text-[13px] leading-relaxed text-ivory-muted">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MeasureList;
