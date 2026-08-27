/**
 * SearchPanel — the floating search capsule and its combobox.
 *
 * Sources, in order of confidence:
 *   1. SafarX's own curated content (instant, no network)
 *   2. Photon / the landmark database via `placesService` (debounced)
 * Everything is filtered to India — this is an India-only product.
 */

import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { motion as Motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Search, X, Loader2, MapPin, Compass } from "lucide-react";

import { placesService } from "../../services/placesService";
import { searchSafarxContent } from "./safarxData";
import { EASE, isInIndia } from "./mapUtils";

const DEBOUNCE_MS = 280;

const SearchPanel = ({ onSelect, onFocusChange, placeholder = "Search a place across India" }) => {
  const reduce = useReducedMotion();
  const listboxId = useId();

  const [query, setQuery] = useState("");
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const inputRef = useRef(null);
  const abortRef = useRef(null);
  const requestRef = useRef(0);

  const localMatches = useMemo(() => searchSafarxContent(query, 4), [query]);

  /* ── Remote lookup, debounced and abortable ─────────────────────── */
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      abortRef.current?.abort();
      setItems([]);
      setLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;
    const requestId = requestRef.current + 1;
    requestRef.current = requestId;

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const predictions = await placesService.getPredictions(trimmed, 12);
        if (controller.signal.aborted || requestRef.current !== requestId) return;

        let mapped = (predictions || [])
          .filter((p) => p?._coords && isInIndia(p._coords.lat, p._coords.lng))
          .map((p) => ({
            key: p.place_id,
            name: p.structured_formatting?.main_text || p.description,
            subtitle: p.structured_formatting?.secondary_text || "",
            lat: p._coords.lat,
            lng: p._coords.lng,
            source: p._source,
          }));

        /* Nothing Indian came back — bias the query and retry once. */
        if (mapped.length === 0 && !/india/i.test(trimmed)) {
          const retry = await placesService.getPredictions(`${trimmed}, India`, 10);
          if (controller.signal.aborted || requestRef.current !== requestId) return;
          mapped = (retry || [])
            .filter((p) => p?._coords && isInIndia(p._coords.lat, p._coords.lng))
            .map((p) => ({
              key: p.place_id,
              name: p.structured_formatting?.main_text || p.description,
              subtitle: p.structured_formatting?.secondary_text || "",
              lat: p._coords.lat,
              lng: p._coords.lng,
              source: p._source,
            }));
        }

        setItems(mapped.slice(0, 7));
      } catch {
        if (!controller.signal.aborted) setItems([]);
      } finally {
        if (requestRef.current === requestId) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const options = useMemo(
    () => [
      ...localMatches.map((point) => ({
        key: point.id,
        name: point.name,
        subtitle: point.subtitle,
        lat: point.lat,
        lng: point.lng,
        source: "safarx",
        point,
      })),
      ...items,
    ],
    [localMatches, items]
  );

  useEffect(() => setActiveIndex(-1), [options.length, query]);

  const choose = useCallback(
    (option) => {
      if (!option) return;
      setQuery(option.name);
      setOpen(false);
      setActiveIndex(-1);
      inputRef.current?.blur();
      onSelect?.(option);
    },
    [onSelect]
  );

  const onKeyDown = (event) => {
    if (event.key === "Escape") {
      if (open) {
        setOpen(false);
        setActiveIndex(-1);
      } else {
        setQuery("");
      }
      return;
    }
    if (!options.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((i) => (i + 1) % options.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((i) => (i <= 0 ? options.length - 1 : i - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      choose(options[activeIndex >= 0 ? activeIndex : 0]);
    } else if (event.key === "Tab") {
      setOpen(false);
    }
  };

  const showList = open && (options.length > 0 || (loading && query.trim().length >= 2));

  return (
    <div className="relative">
      <div className="flex items-center gap-2 rounded-full border border-white/[0.09] bg-ink-950/85 px-4 py-2.5 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.8)] backdrop-blur-xl transition-colors focus-within:border-saffron/45">
        <Search className="h-4 w-4 shrink-0 text-saffron" aria-hidden="true" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          role="combobox"
          aria-expanded={showList}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-label="Search places across India"
          aria-activedescendant={
            activeIndex >= 0 && options[activeIndex]
              ? `${listboxId}-opt-${activeIndex}`
              : undefined
          }
          autoComplete="off"
          placeholder={placeholder}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            setOpen(true);
            onFocusChange?.(true);
          }}
          onBlur={() => {
            window.setTimeout(() => setOpen(false), 140);
            onFocusChange?.(false);
          }}
          onKeyDown={onKeyDown}
          className="w-full bg-transparent text-[15px] text-ivory placeholder:text-ivory-faint focus:outline-none"
        />
        {loading && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-ivory-faint" aria-hidden="true" />}
        {query && !loading && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setItems([]);
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            className="shrink-0 rounded-full p-1 text-ivory-faint transition-colors hover:bg-white/[0.08] hover:text-ivory"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {showList && (
          <Motion.ul
            id={listboxId}
            role="listbox"
            aria-label="Search suggestions"
            initial={reduce ? false : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: EASE }}
            className="absolute inset-x-0 top-full z-30 mt-2 max-h-[19rem] overflow-y-auto rounded-2xl border border-white/[0.09] bg-ink-900/95 p-1.5 shadow-[0_28px_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl"
          >
            {options.length === 0 && loading && (
              <li className="px-3 py-3 font-data text-[11px] uppercase tracking-[0.16em] text-ivory-faint">
                Searching
              </li>
            )}
            {options.map((option, index) => (
              <li
                key={option.key}
                id={`${listboxId}-opt-${index}`}
                role="option"
                aria-selected={index === activeIndex}
              >
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => choose(option)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                    index === activeIndex ? "bg-white/[0.07]" : "hover:bg-white/[0.05]"
                  }`}
                >
                  {option.source === "safarx" ? (
                    <Compass className="mt-0.5 h-4 w-4 shrink-0 text-saffron" aria-hidden="true" />
                  ) : (
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ivory-faint" aria-hidden="true" />
                  )}
                  <span className="min-w-0">
                    <span className="block truncate text-sm text-ivory">{option.name}</span>
                    {option.subtitle && (
                      <span className="mt-0.5 block truncate font-data text-[10px] uppercase tracking-[0.12em] text-ivory-faint">
                        {option.subtitle}
                      </span>
                    )}
                  </span>
                  {option.source === "safarx" && (
                    <span className="ml-auto shrink-0 self-center font-data text-[9px] uppercase tracking-[0.18em] text-saffron/80">
                      SafarX
                    </span>
                  )}
                </button>
              </li>
            ))}
          </Motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchPanel;
