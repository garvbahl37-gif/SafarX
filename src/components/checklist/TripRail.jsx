import React, { useState } from "react";
import { motion as Motion, useReducedMotion } from "framer-motion";
import { Plus, Pencil, Trash2, Check, X, MapPin } from "lucide-react";
import { getChecklistStats, formatDate, daysUntil } from "../../utils/checklistGenerator";

/**
 * The left trip rail — switch, rename and delete trips. Collapses into a
 * horizontally scrolling strip below the lg breakpoint so it still works at
 * 375px without stealing the whole viewport.
 */
const TripRail = ({ trips, activeTripId, onSelect, onCreate, onRename, onDelete }) => {
  const reduce = useReducedMotion();
  const [renamingId, setRenamingId] = useState(null);
  const [draft, setDraft] = useState("");

  const startRename = (trip) => {
    setRenamingId(trip.id);
    setDraft(trip.name);
  };

  const commitRename = (id) => {
    const name = draft.trim();
    if (name) onRename(id, name);
    setRenamingId(null);
  };

  return (
    <aside className="lg:sticky lg:top-24 lg:self-start" aria-label="Your trips">
      <div className="mb-4 flex items-center gap-3">
        <span className="eyebrow whitespace-nowrap">Trips · {trips.length}</span>
        <span className="route-line flex-1" aria-hidden="true" />
      </div>

      <ul className="flex gap-3 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
        {trips.map((trip, i) => {
          const stats = getChecklistStats(trip.items || []);
          const active = trip.id === activeTripId;
          const countdown = daysUntil(trip.startDate);
          const renaming = renamingId === trip.id;

          return (
            <Motion.li
              key={trip.id}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: Math.min(i * 0.05, 0.3), ease: [0.22, 1, 0.36, 1] }}
              className={`relative w-[240px] shrink-0 overflow-hidden rounded-xl border transition-colors duration-300 lg:w-auto ${
                active
                  ? "border-saffron/45 bg-saffron/[0.07]"
                  : "border-white/[0.07] bg-ink-800/60 hover:border-saffron/30"
              }`}
            >
              {renaming ? (
                <div className="p-3">
                  <label className="sr-only" htmlFor={`rename-${trip.id}`}>
                    New name for {trip.name}
                  </label>
                  <input
                    id={`rename-${trip.id}`}
                    autoFocus
                    className="glass-input !py-2 !text-sm"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitRename(trip.id);
                      if (e.key === "Escape") setRenamingId(null);
                    }}
                  />
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => commitRename(trip.id)}
                      aria-label="Save name"
                      className="rounded-md border border-saffron/40 bg-saffron/15 p-1.5 text-saffron"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setRenamingId(null)}
                      aria-label="Cancel rename"
                      className="rounded-md border border-white/[0.07] p-1.5 text-ivory-faint"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => onSelect(trip.id)}
                    aria-pressed={active}
                    aria-label={`Open ${trip.name}`}
                    className="block w-full px-4 pb-2 pr-16 pt-3.5 text-left"
                  >
                    <span className="flex items-center gap-1.5 font-data text-[10px] uppercase tracking-[0.18em] text-ivory-faint">
                      <MapPin size={10} />
                      <span className="truncate">{trip.destination || "Destination not set"}</span>
                    </span>
                    <span
                      className={`mt-1.5 block truncate font-display text-lg leading-tight ${
                        active ? "text-saffron" : "text-ivory"
                      }`}
                    >
                      {trip.name}
                    </span>
                    <span className="mt-1 block font-data text-[11px] tracking-[0.12em] text-ivory-faint">
                      {formatDate(trip.startDate)}
                      {countdown !== null && countdown >= 0 ? ` · T-${countdown}` : ""}
                    </span>
                  </button>

                  {/* Progress lives outside the button so the progressbar role
                      is not swallowed by the button's accessible name. */}
                  <div className="px-4 pb-3.5">
                    <div
                      role="progressbar"
                      aria-valuenow={stats.percent}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${trip.name} packing progress`}
                      className="h-1 w-full overflow-hidden rounded-full bg-white/[0.07]"
                    >
                      <span
                        className="block h-full rounded-full bg-gradient-to-r from-saffron-bright to-saffron transition-[width] duration-700"
                        style={{ width: `${stats.percent}%` }}
                      />
                    </div>
                    <p className="mt-1.5 flex items-center justify-between font-data text-[10px] tracking-[0.14em] text-ivory-faint">
                      <span>
                        {stats.packed}/{stats.total} packed
                      </span>
                      {stats.criticalReady && <span className="text-saffron">READY</span>}
                    </p>
                  </div>

                  <div className="absolute right-2 top-2.5 flex gap-0.5">
                    <button
                      type="button"
                      onClick={() => startRename(trip)}
                      aria-label={`Rename ${trip.name}`}
                      className="rounded-md p-1.5 text-ivory-faint transition-colors hover:text-ivory"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(trip.id)}
                      aria-label={`Delete ${trip.name}`}
                      className="rounded-md p-1.5 text-ivory-faint transition-colors hover:text-saffron"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </>
              )}
            </Motion.li>
          );
        })}

        <li className="w-[240px] shrink-0 lg:w-auto">
          <button
            type="button"
            onClick={onCreate}
            className="flex h-full min-h-[92px] w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/[0.12] px-4 py-4 text-sm text-ivory-muted transition-colors duration-300 hover:border-saffron/45 hover:text-saffron"
          >
            <Plus size={16} />
            New trip
          </button>
        </li>
      </ul>
    </aside>
  );
};

export default TripRail;
