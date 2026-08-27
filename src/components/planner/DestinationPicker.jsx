import React, { useMemo, useRef, useState } from "react";
import { motion as Motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Search, MapPin, Check, X, Pencil } from "lucide-react";
import { globalDestinations } from "../../data/globalDestinations";
import { indianStates } from "../../data/itineraryData";
import { POPULAR_DESTINATIONS, EASE } from "./plannerOptions";

/**
 * Searchable Indian destination picker.
 *
 * Emits the same `"<Place>, India"` string the old country/city select pair
 * produced, so the Gemini payload is unchanged. Anything typed that isn't in
 * the list is passed through verbatim as a custom destination.
 */

const INDIA_CITIES = globalDestinations.find((c) => c.country === "India")?.cities ?? [];

const CATALOGUE = [
  ...INDIA_CITIES.map((city) => ({ key: `city-${city}`, name: city, kind: "City or region" })),
  ...indianStates
    .filter((s) => !INDIA_CITIES.includes(s.name))
    .map((s) => ({ key: `state-${s.id}`, name: s.name, kind: "State / UT" })),
];

const DestinationPicker = ({ value, onChange, inputId = "planner-destination" }) => {
  const reduce = useReducedMotion();
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef(null);

  const trimmed = query.trim();

  const matches = useMemo(() => {
    if (!trimmed) return [];
    const q = trimmed.toLowerCase();
    return CATALOGUE.filter((item) => item.name.toLowerCase().includes(q))
      .sort((a, b) => {
        const aStarts = a.name.toLowerCase().startsWith(q) ? 0 : 1;
        const bStarts = b.name.toLowerCase().startsWith(q) ? 0 : 1;
        return aStarts - bStarts || a.name.localeCompare(b.name);
      })
      .slice(0, 7);
  }, [trimmed]);

  const exactMatch = matches.some((m) => m.name.toLowerCase() === trimmed.toLowerCase());
  const options = trimmed && !exactMatch
    ? [...matches, { key: "custom", name: trimmed, kind: "Use exactly as typed", custom: true }]
    : matches;

  const pick = (name, custom = false) => {
    onChange(custom ? name : `${name}, India`);
    setQuery("");
    setHighlight(0);
  };

  const clear = () => {
    onChange("");
    setQuery("");
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const onKeyDown = (e) => {
    if (!options.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => (h + 1) % options.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => (h - 1 + options.length) % options.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      const opt = options[Math.min(highlight, options.length - 1)];
      if (opt) pick(opt.name, opt.custom);
    } else if (e.key === "Escape") {
      setQuery("");
    }
  };

  /* ---------------- selected state ---------------- */
  if (value) {
    const popular = POPULAR_DESTINATIONS.find((p) => value.startsWith(p.city));
    return (
      <Motion.div
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="relative overflow-hidden rounded-2xl border border-saffron/35 bg-ink-800"
      >
        {popular && (
          <div className="absolute inset-0" aria-hidden="true">
            <img src={popular.thumb} alt="" className="w-full h-full object-cover opacity-30" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-r from-ink-900 via-ink-900/85 to-ink-900/40" />
          </div>
        )}
        <div className="relative flex items-center gap-4 p-5 sm:p-6">
          <span className="w-11 h-11 shrink-0 rounded-xl bg-saffron/15 border border-saffron/40 flex items-center justify-center">
            <MapPin size={18} className="text-saffron" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="eyebrow mb-1.5">{popular?.coords || "Destination locked"}</p>
            <p className="font-display italic text-2xl sm:text-3xl font-medium text-ivory truncate">
              {value.replace(/, India$/, "")}
            </p>
          </div>
          <button
            type="button"
            onClick={clear}
            className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/[0.06] border border-white/[0.1] text-ivory-muted hover:text-ivory hover:border-saffron/35 transition-colors font-data text-[10px] uppercase tracking-[0.18em]"
          >
            <X size={13} aria-hidden="true" />
            Change
          </button>
        </div>
      </Motion.div>
    );
  }

  /* ---------------- picker ---------------- */
  return (
    <div>
      <label htmlFor={inputId} className="form-label">Search Indian states, cities, or regions</label>
      <div className="relative">
        <Search
          size={17}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-ivory-faint pointer-events-none"
          aria-hidden="true"
        />
        <input
          id={inputId}
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={options.length > 0}
          aria-controls="planner-destination-results"
          aria-autocomplete="list"
          autoComplete="off"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setHighlight(0); }}
          onKeyDown={onKeyDown}
          placeholder="Try Jaisalmer, Meghalaya, Spiti Valley…"
          className="glass-input w-full !pl-11"
        />
      </div>

      <AnimatePresence initial={false}>
        {options.length > 0 && (
          <Motion.ul
            id="planner-destination-results"
            role="listbox"
            aria-label="Destination results"
            initial={reduce ? false : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="mt-3 rounded-2xl border border-white/[0.07] bg-ink-800 overflow-hidden divide-y divide-white/[0.05]"
          >
            {options.map((opt, i) => (
              <li key={opt.key} role="option" aria-selected={i === highlight}>
                <button
                  type="button"
                  onMouseEnter={() => setHighlight(i)}
                  onClick={() => pick(opt.name, opt.custom)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                    i === highlight ? "bg-saffron/10" : "hover:bg-white/[0.04]"
                  }`}
                >
                  {opt.custom
                    ? <Pencil size={14} className="text-saffron shrink-0" aria-hidden="true" />
                    : <MapPin size={14} className="text-saffron shrink-0" aria-hidden="true" />}
                  <span className="text-ivory text-sm truncate">{opt.name}</span>
                  <span className="ml-auto font-data text-[10px] uppercase tracking-[0.16em] text-ivory-faint shrink-0">
                    {opt.kind}
                  </span>
                </button>
              </li>
            ))}
          </Motion.ul>
        )}
      </AnimatePresence>

      {/* Popular destination chips */}
      <div className="mt-8">
        <p className="flex items-center gap-3 mb-4">
          <span className="route-dot" aria-hidden="true" />
          <span className="eyebrow-muted">Travellers usually start here</span>
          <span className="route-line flex-1 hidden sm:block" aria-hidden="true" />
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {POPULAR_DESTINATIONS.map((place, i) => {
            const selected = value === `${place.city}, India`;
            return (
              <Motion.button
                key={place.city}
                type="button"
                aria-pressed={selected}
                onClick={() => pick(place.city)}
                initial={reduce ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: reduce ? 0 : i * 0.04, ease: EASE }}
                whileHover={reduce ? undefined : { y: -4 }}
                className={`group relative overflow-hidden rounded-xl border text-left transition-colors duration-300 ${
                  selected ? "border-saffron/60" : "border-white/[0.07] hover:border-saffron/35"
                }`}
              >
                <div className="relative aspect-[4/3]">
                  <img
                    src={place.thumb}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/45 to-transparent" />
                  {selected && (
                    <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-saffron flex items-center justify-center">
                      <Check size={13} className="text-ink-950" aria-hidden="true" />
                    </span>
                  )}
                  <div className="absolute inset-x-0 bottom-0 p-3">
                    <p className="font-display italic text-base font-medium text-ivory leading-tight">
                      {place.city.replace(" (Region)", "")}
                    </p>
                    <p className="font-data text-[9px] uppercase tracking-[0.16em] text-ivory-faint mt-0.5 truncate">
                      {place.region} · {place.note}
                    </p>
                  </div>
                </div>
              </Motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DestinationPicker;
