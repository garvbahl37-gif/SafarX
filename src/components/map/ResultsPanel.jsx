/**
 * ResultsPanel — the header + feed pairing shared by the desktop column and
 * the mobile bottom sheet, so both surfaces stay in sync by construction.
 */

import React from "react";
import { ChevronDown, RefreshCw } from "lucide-react";

import ResultsList from "./ResultsList";
import { REGIONS, formatCoords } from "./mapUtils";

const ResultsPanel = ({
  center,
  region,
  onRegionChange,
  metaLine,
  areaMoved = false,
  onSearchArea,
  listProps,
  footer = null,
  className = "",
}) => (
  <div className={`flex min-h-0 flex-col ${className}`}>
    <div className="shrink-0 border-b border-white/[0.07] px-3.5 py-3">
      <div className="flex items-center justify-between gap-3">
        <p className="flex min-w-0 items-center gap-2">
          <span className="route-dot shrink-0" aria-hidden="true" />
          <span className="truncate font-data text-[9px] uppercase tracking-[0.2em] text-saffron">
            {formatCoords(center[0], center[1])}
          </span>
        </p>
        {/* A bare <select> picks up the browser's own box and arrow, which
            broke the pill shape. Keep the native element for behaviour and
            accessibility, but hide its chrome and draw our own caret. */}
        <span className="relative shrink-0">
          <select
            value={region}
            onChange={(event) => onRegionChange?.(event.target.value)}
            aria-label="Filter SafarX places by region"
            className="w-full cursor-pointer appearance-none rounded-full border border-white/[0.09] bg-ink-800 py-1 pl-3 pr-7 font-data text-[10px] uppercase tracking-[0.1em] text-ivory-muted outline-none transition-colors hover:border-white/20 focus:border-saffron/55"
          >
            {REGIONS.map((item) => (
              <option key={item.id} value={item.id} className="bg-ink-900 text-ivory">
                {item.name}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-ivory-faint"
            aria-hidden="true"
          />
        </span>
      </div>

      <p className="mt-1.5 font-data text-[10px] uppercase tracking-[0.14em] text-ivory-faint">
        {metaLine}
      </p>

      {areaMoved && (
        <button
          type="button"
          onClick={onSearchArea}
          className="mt-2.5 inline-flex items-center gap-2 rounded-full border border-saffron/40 bg-saffron/15 px-3 py-1.5 font-data text-[10px] uppercase tracking-[0.14em] text-saffron transition-colors hover:bg-saffron/25"
        >
          <RefreshCw className="h-3 w-3" aria-hidden="true" />
          Search this area
        </button>
      )}
    </div>

    <div className="min-h-0 flex-1 overflow-y-auto px-3 pt-2">
      <ResultsList {...listProps} />
    </div>

    {footer}
  </div>
);

export default ResultsPanel;
