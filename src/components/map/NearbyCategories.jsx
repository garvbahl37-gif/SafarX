/**
 * NearbyCategories — the horizontal rail of live Overpass categories.
 * Behaves as a single-select radio group: picking one runs a fresh query.
 */

import React from "react";
import { NEARBY_CATEGORIES } from "./categories";

const NearbyCategories = ({ activeId, onSelect, disabled = false }) => (
  <div
    role="radiogroup"
    aria-label="Explore nearby"
    className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
  >
    {NEARBY_CATEGORIES.map((category) => {
      const Icon = category.icon;
      const active = category.id === activeId;
      return (
        <button
          key={category.id}
          type="button"
          role="radio"
          aria-checked={active}
          disabled={disabled}
          title={category.long}
          onClick={() => onSelect?.(active ? null : category.id)}
          className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-[13px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
            active
              ? "border-saffron/50 bg-saffron/15 text-saffron"
              : "border-white/[0.09] bg-ink-950/70 text-ivory-muted hover:border-saffron/35 hover:text-ivory"
          }`}
        >
          <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
          {category.label}
        </button>
      );
    })}
  </div>
);

export default NearbyCategories;
