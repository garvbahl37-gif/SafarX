import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { Compass, MapPin, Search, Sparkles, Tag, X } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1];

/* Popular searches shown when the field is empty and focused. */
const POPULAR_SEARCHES = [
  { label: "Meghalaya", query: "Meghalaya" },
  { label: "Living root bridges", query: "root bridge" },
  { label: "Ladakh", query: "Ladakh" },
  { label: "Stepwells", query: "stepwell" },
  { label: "Ghost towns", query: "ghost" },
  { label: "Monsoon escapes", query: "monsoon" },
];

const KIND_ICON = {
  place: MapPin,
  state: Compass,
  region: Compass,
  category: Tag,
};

/**
 * 0 — exact match, 1 — prefix match, 2 — starts a later word, 3 — anywhere.
 * Returns null when the haystack does not contain the query at all.
 */
const matchRank = (haystack, query) => {
  const text = haystack.toLowerCase();
  const at = text.indexOf(query);
  if (at === -1) return null;
  if (text === query) return 0;
  if (at === 0) return 1;
  return /\s|[-,/]/.test(text[at - 1]) ? 2 : 3;
};

/** Splits a label around the matched substring so it can be highlighted. */
const splitOnMatch = (label, query) => {
  if (!query) return [label, "", ""];
  const at = label.toLowerCase().indexOf(query);
  if (at === -1) return [label, "", ""];
  return [
    label.slice(0, at),
    label.slice(at, at + query.length),
    label.slice(at + query.length),
  ];
};

const Highlight = ({ label, query }) => {
  const [before, hit, after] = splitOnMatch(label, query);
  if (!hit) return <>{label}</>;
  return (
    <>
      {before}
      <mark className="bg-transparent text-saffron font-semibold">{hit}</mark>
      {after}
    </>
  );
};

/**
 * Search field with live grid filtering plus shortcut suggestions:
 * states/regions and
 * categories. Keyboard driven, ARIA-complete, and styled as dark glass.
 */
const GemSearchBar = ({
  gems,
  value,
  onValueChange,
  regionLabels,
  categoryLabels,
  onSelectPlace,
  onSelectState,
  onSelectRegion,
  onSelectCategory,
}) => {
  const [debounced, setDebounced] = useState(value);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const wrapRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const baseId = useId();
  const listboxId = `${baseId}-listbox`;
  const optionId = (i) => `${baseId}-option-${i}`;

  /* ---------- debounce the typed query ---------- */
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), 150);
    return () => clearTimeout(t);
  }, [value]);

  /* ---------- index the dataset once ---------- */
  const index = useMemo(() => {
    const states = new Map();
    const cats = new Map();
    const regionCounts = new Map();
    gems.forEach((gem) => {
      states.set(gem.state, (states.get(gem.state) || 0) + 1);
      cats.set(gem.category, (cats.get(gem.category) || 0) + 1);
      regionCounts.set(gem.region, (regionCounts.get(gem.region) || 0) + 1);
    });
    return { states, cats, regionCounts };
  }, [gems]);

  /* ---------- build the grouped suggestions ---------- */
  const groups = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    if (q.length < 1) return [];

    const places = [];
    gems.forEach((gem) => {
      const ranks = [
        matchRank(gem.title, q),
        matchRank(gem.location, q),
        matchRank(gem.state, q),
        matchRank(gem.category, q),
      ].filter((r) => r !== null);
      if (!ranks.length) return;
      // A title hit always outranks a hit that only came from the metadata.
      const titleRank = matchRank(gem.title, q);
      const rank = titleRank === null ? Math.min(...ranks) + 4 : titleRank;
      places.push({
        kind: "place",
        key: `place-${gem.id}`,
        label: gem.title,
        meta: `${gem.state} · ${regionLabels[gem.region] || gem.region}`,
        rank,
        gem,
      });
    });
    places.sort((a, b) => a.rank - b.rank || a.label.localeCompare(b.label));

    const areas = [];
    index.states.forEach((count, state) => {
      const rank = matchRank(state, q);
      if (rank === null) return;
      areas.push({
        kind: "state",
        key: `state-${state}`,
        label: state,
        meta: `${count} ${count === 1 ? "place" : "places"}`,
        rank,
        state,
      });
    });
    index.regionCounts.forEach((count, key) => {
      const label = regionLabels[key] || key;
      const rank = matchRank(label, q) ?? matchRank(key, q);
      if (rank === null || rank === undefined) return;
      areas.push({
        kind: "region",
        key: `region-${key}`,
        label,
        meta: `${count} ${count === 1 ? "place" : "places"}`,
        rank: rank + 1,
        region: key,
      });
    });
    areas.sort((a, b) => a.rank - b.rank || a.label.localeCompare(b.label));

    const cats = [];
    index.cats.forEach((count, key) => {
      const label = categoryLabels[key] || key;
      const rank = matchRank(label, q) ?? matchRank(key, q);
      if (rank === null || rank === undefined) return;
      cats.push({
        kind: "category",
        key: `category-${key}`,
        label,
        meta: `${count} ${count === 1 ? "place" : "places"}`,
        rank,
        category: key,
      });
    });
    cats.sort((a, b) => a.rank - b.rank || a.label.localeCompare(b.label));

    return [
      // Places are deliberately omitted: the results grid already filters live
      // as you type, so repeating them here would hide the very results the
      // search just produced. Only offer shortcuts the grid can't give you.
      { id: "areas", title: "Jump to a state or region", items: areas.slice(0, 4) },
      { id: "categories", title: "Filter by category", items: cats.slice(0, 4) },
    ].filter((g) => g.items.length > 0);
  }, [debounced, gems, index, regionLabels, categoryLabels]);

  const flatItems = useMemo(
    () => groups.flatMap((g) => g.items),
    [groups]
  );

  const query = debounced.trim().toLowerCase();
  // Keyed off the debounced value so the panel does not flicker between the
  // popular chips and the first set of suggestions.
  const showPopular = open && query === "";
  const showSuggestions = open && flatItems.length > 0;
  const showNoMatch =
    open && !showPopular && query.length > 0 && flatItems.length === 0;
  const panelOpen = showPopular || showSuggestions || showNoMatch;

  useEffect(() => {
    setActiveIndex(-1);
  }, [flatItems]);

  /* Keep the highlighted row inside the scroll area. */
  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;
    const el = listRef.current.querySelector(`#${CSS.escape(optionId(activeIndex))}`);
    el?.scrollIntoView({ block: "nearest" });
    // optionId is derived from a stable id, so it is safe to leave out.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  /* ---------- click outside closes ---------- */
  useEffect(() => {
    if (!panelOpen) return;
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [panelOpen]);

  const close = useCallback(() => {
    setOpen(false);
    setActiveIndex(-1);
  }, []);

  const commit = useCallback(
    (item) => {
      if (!item) return;
      close();
      if (item.kind === "place") onSelectPlace(item.gem);
      else if (item.kind === "state") onSelectState(item.state);
      else if (item.kind === "region") onSelectRegion(item.region);
      else if (item.kind === "category") onSelectCategory(item.category);
    },
    [close, onSelectPlace, onSelectState, onSelectRegion, onSelectCategory]
  );

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      close();
      return;
    }
    if (e.key === "Tab") {
      close();
      return;
    }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (!flatItems.length) return;
      e.preventDefault();
      if (!open) {
        setOpen(true);
        setActiveIndex(e.key === "ArrowDown" ? 0 : flatItems.length - 1);
        return;
      }
      setActiveIndex((i) => {
        const step = e.key === "ArrowDown" ? 1 : -1;
        const next = i + step;
        if (next < 0) return flatItems.length - 1;
        if (next >= flatItems.length) return 0;
        return next;
      });
      return;
    }
    if (e.key === "Enter") {
      if (showSuggestions && activeIndex >= 0) {
        e.preventDefault();
        commit(flatItems[activeIndex]);
      } else {
        close();
      }
    }
  };

  const handlePopular = (chip) => {
    onValueChange(chip.query);
    setDebounced(chip.query);
    close();
    inputRef.current?.focus();
  };

  let rowIndex = -1;

  return (
    <div ref={wrapRef} className="relative">
      {/* ---------- the pill ---------- */}
      <div className="relative bg-ink-900/90 backdrop-blur-2xl border border-white/[0.09] rounded-full shadow-2xl flex items-center p-2 pr-4 transition-colors duration-300 focus-within:border-saffron/40">
        <div className="p-2.5 bg-saffron/10 rounded-full mr-3 text-saffron shrink-0">
          <Search className="w-5 h-5" aria-hidden="true" />
        </div>

        <input
          ref={inputRef}
          id={`${baseId}-input`}
          type="text"
          role="combobox"
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={showSuggestions}
          aria-controls={listboxId}
          aria-activedescendant={
            showSuggestions && activeIndex >= 0 ? optionId(activeIndex) : undefined
          }
          aria-label="Search hidden gems"
          placeholder="Search a place, state, or kind of escape"
          className="flex-1 min-w-0 bg-transparent text-base text-ivory placeholder-ivory-faint outline-none border-none ring-0 focus:ring-0"
          value={value}
          onChange={(e) => {
            onValueChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
        />

        {value && (
          <button
            type="button"
            onClick={() => {
              onValueChange("");
              setDebounced("");
              setOpen(true);
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            className="p-1.5 text-ivory-faint hover:text-ivory transition-colors shrink-0"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* ---------- the dropdown ---------- */}
      <AnimatePresence>
        {panelOpen && (
          <Motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: EASE }}
            className="absolute left-0 right-0 top-[calc(100%+0.6rem)] z-40 glass-panel !rounded-2xl border border-white/[0.09] shadow-2xl overflow-hidden"
          >
            {showPopular && (
              <div className="p-5">
                <p className="font-data text-[10px] uppercase tracking-[0.2em] text-saffron flex items-center gap-2 mb-3.5">
                  <Sparkles size={12} aria-hidden="true" />
                  Popular searches
                </p>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_SEARCHES.map((chip) => (
                    <button
                      key={chip.label}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handlePopular(chip)}
                      className="font-data text-[11px] uppercase tracking-[0.12em] px-3.5 py-2 rounded-full border border-saffron/30 text-saffron hover:bg-saffron hover:text-ink-950 hover:border-saffron transition-colors duration-300"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {showNoMatch && (
              <div className="px-5 py-6 text-center">
                <p className="text-ivory text-sm mb-1">
                  Nothing matches “{value.trim()}”
                </p>
                <p className="font-data text-[10px] uppercase tracking-[0.16em] text-ivory-faint">
                  Try a state, a region, or a kind of place
                </p>
              </div>
            )}

            {showSuggestions && (
              <div
                ref={listRef}
                id={listboxId}
                role="listbox"
                aria-label="Search suggestions"
                className="max-h-[22rem] overflow-y-auto py-2"
                onMouseDown={(e) => e.preventDefault()}
              >
                {groups.map((group) => (
                  <div
                    key={group.id}
                    role="group"
                    aria-labelledby={`${baseId}-${group.id}`}
                  >
                    <p
                      id={`${baseId}-${group.id}`}
                      className="font-data text-[10px] uppercase tracking-[0.2em] text-ivory-faint px-5 pt-3 pb-2"
                    >
                      {group.title}
                    </p>
                    {group.items.map((item) => {
                      rowIndex += 1;
                      const i = rowIndex;
                      const active = i === activeIndex;
                      const RowIcon = KIND_ICON[item.kind] || MapPin;
                      return (
                        <div
                          key={item.key}
                          id={optionId(i)}
                          role="option"
                          aria-selected={active}
                          tabIndex={-1}
                          onMouseEnter={() => setActiveIndex(i)}
                          onClick={() => commit(item)}
                          className={`flex items-center gap-3 px-5 py-2.5 cursor-pointer border-l-2 transition-colors duration-200 ${
                            active
                              ? "bg-saffron/10 border-saffron"
                              : "border-transparent hover:bg-white/[0.04]"
                          }`}
                        >
                          <RowIcon
                            size={14}
                            className={active ? "text-saffron" : "text-ivory-faint"}
                            aria-hidden="true"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block text-[14px] text-ivory truncate">
                              <Highlight label={item.label} query={query} />
                            </span>
                            <span className="block font-data text-[10px] uppercase tracking-[0.14em] text-ivory-faint truncate">
                              <Highlight label={item.meta} query={query} />
                            </span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GemSearchBar;
