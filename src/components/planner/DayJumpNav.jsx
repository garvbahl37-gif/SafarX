import React, { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { ChevronsDownUp, ChevronsUpDown } from "lucide-react";

/**
 * Sticky day-jump rail for long itineraries — scrolls to a day and tracks
 * which one is currently in view.
 */
const DayJumpNav = ({ days, allExpanded, onToggleAll, onJump }) => {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(days[0]?.dayNumber);

  useEffect(() => {
    const targets = days
      .map((d) => document.getElementById(`itinerary-day-${d.dayNumber}`))
      .filter(Boolean);
    if (!targets.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) {
          const n = Number(visible.target.id.replace("itinerary-day-", ""));
          if (!Number.isNaN(n)) setActive(n);
        }
      },
      { rootMargin: "-140px 0px -60% 0px", threshold: 0 }
    );

    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, [days]);

  const jump = (dayNumber) => {
    onJump?.(dayNumber);
    const el = document.getElementById(`itinerary-day-${dayNumber}`);
    if (!el) return;
    window.scrollTo({
      top: el.getBoundingClientRect().top + window.pageYOffset - 130,
      behavior: reduce ? "auto" : "smooth",
    });
  };

  return (
    <nav
      aria-label="Jump to a day"
      data-html2canvas-ignore="true"
      className="sticky top-20 z-30 -mx-1 px-1 py-3 bg-ink-950/85 backdrop-blur-xl border-b border-white/[0.07]"
    >
      <div className="flex items-center gap-3">
        <ul className="flex-1 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {days.map((day) => {
            const isActive = active === day.dayNumber;
            return (
              <li key={day.dayNumber} className="shrink-0">
                <button
                  type="button"
                  onClick={() => jump(day.dayNumber)}
                  aria-current={isActive ? "true" : undefined}
                  className={`px-3.5 py-2 rounded-full border font-data text-[10px] uppercase tracking-[0.16em] whitespace-nowrap transition-colors ${
                    isActive
                      ? "bg-saffron/15 border-saffron/55 text-saffron"
                      : "bg-white/[0.04] border-white/[0.08] text-ivory-muted hover:border-saffron/35 hover:text-ivory"
                  }`}
                >
                  Day {String(day.dayNumber).padStart(2, "0")}
                </button>
              </li>
            );
          })}
        </ul>

        <button
          type="button"
          onClick={onToggleAll}
          className="shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-full border border-white/[0.08] bg-white/[0.04] text-ivory-muted hover:text-ivory hover:border-saffron/35 transition-colors font-data text-[10px] uppercase tracking-[0.16em]"
        >
          {allExpanded
            ? <ChevronsDownUp size={13} aria-hidden="true" />
            : <ChevronsUpDown size={13} aria-hidden="true" />}
          <span className="hidden sm:inline">{allExpanded ? "Collapse all" : "Expand all"}</span>
        </button>
      </div>
    </nav>
  );
};

export default DayJumpNav;
