import React, { useCallback, useMemo, useState } from "react";
import { motion as Motion, AnimatePresence, useReducedMotion } from "framer-motion";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import {
  Copy,
  Printer,
  FileDown,
  RotateCcw,
  Settings2,
  LayoutTemplate,
  Search,
  Plus,
  Luggage,
  FolderLock,
  MapPin,
  CalendarDays,
  Users,
  X,
} from "lucide-react";

import { useLocalStorage } from "../hooks/useLocalStorage";
import SectionHeading from "./ui/SectionHeading";
import TripRail from "./checklist/TripRail";
import TripForm from "./checklist/TripForm";
import ReadinessPanel from "./checklist/ReadinessPanel";
import InsightNotes from "./checklist/InsightNotes";
import CategorySection from "./checklist/CategorySection";
import AddItemForm from "./checklist/AddItemForm";
import TemplateGallery from "./checklist/TemplateGallery";
import { getIcon } from "./checklist/icons";
import {
  CATEGORIES,
  TEMPLATES,
  TRIP_TYPES,
  createItem,
  formatDate,
  generateChecklist,
  generateFromTemplate,
  getChecklistStats,
  getTripInsights,
  makeId,
  sortItems,
} from "../utils/checklistGenerator";
import { copyChecklistAsText, downloadChecklistPdf, printChecklist } from "../utils/checklistExport";

const TRIPS_KEY = "safarx.checklist.trips.v2";
const ACTIVE_KEY = "safarx.checklist.activeTrip.v2";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "unpacked", label: "To pack" },
  { id: "critical", label: "Critical" },
  { id: "documents", label: "Documents" },
];

/** Trip fields the generator cares about, pulled off a stored trip. */
const configOf = (trip) => ({
  name: trip.name,
  destination: trip.destination,
  tripType: trip.tripType,
  startDate: trip.startDate,
  days: trip.days,
  adults: trip.adults,
  children: trip.children,
  hasFemaleTravellers: trip.hasFemaleTravellers,
});

const keyOf = (item) => `${item.category}::${item.label.toLowerCase().trim()}`;

/**
 * Regenerate the auto items for a trip while preserving what the traveller has
 * already done: packed state and notes survive, custom items are never lost.
 */
function regenerateItems(trip, config) {
  const previous = new Map((trip.items || []).map((i) => [keyOf(i), i]));
  const fresh = generateChecklist(config).map((item) => {
    const old = previous.get(keyOf(item));
    if (!old) return item;
    return {
      ...item,
      id: old.id,
      packed: old.packed,
      notes: old.notes || item.notes,
      quantity: old.autoAdded ? item.quantity : old.quantity,
      priority: old.autoAdded ? item.priority : old.priority,
    };
  });
  const freshKeys = new Set(fresh.map(keyOf));
  const custom = (trip.items || []).filter((i) => !i.autoAdded && !freshKeys.has(keyOf(i)));
  return sortItems([...fresh, ...custom]);
}

const PreTripChecklist = () => {
  const reduce = useReducedMotion();
  const [trips, setTrips] = useLocalStorage(TRIPS_KEY, []);
  const [activeId, setActiveId] = useLocalStorage(ACTIVE_KEY, null);

  const [mode, setMode] = useState("list"); // list | create | edit
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState({});
  const [showAdd, setShowAdd] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  const activeTrip = useMemo(
    () => trips.find((t) => t.id === activeId) || trips[0] || null,
    [trips, activeId]
  );

  const stats = useMemo(() => getChecklistStats(activeTrip?.items || []), [activeTrip]);
  const insights = useMemo(() => (activeTrip ? getTripInsights(configOf(activeTrip)) : []), [activeTrip]);

  /* ------------------------------------------------------------------ */
  /*  Undo — every destructive action snapshots the whole trip list      */
  /* ------------------------------------------------------------------ */

  const withUndo = useCallback(
    (message, apply) => {
      const snapshot = trips;
      const snapshotActive = activeId;
      apply();
      toast(
        (t) => (
          <span className="flex items-center gap-3">
            <span className="text-sm">{message}</span>
            <button
              type="button"
              onClick={() => {
                setTrips(snapshot);
                setActiveId(snapshotActive);
                toast.dismiss(t.id);
              }}
              className="shrink-0 rounded-full border border-saffron/45 px-3 py-1 font-data text-[11px] uppercase tracking-[0.14em] text-saffron transition-colors hover:bg-saffron/15"
            >
              Undo
            </button>
          </span>
        ),
        { duration: 7000 }
      );
    },
    [trips, activeId, setTrips, setActiveId]
  );

  /* ------------------------------------------------------------------ */
  /*  Trip CRUD                                                          */
  /* ------------------------------------------------------------------ */

  const patchTrip = useCallback(
    (id, patch) =>
      setTrips((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...(typeof patch === "function" ? patch(t) : patch) } : t))
      ),
    [setTrips]
  );

  const createTrip = (config) => {
    const items = generateChecklist(config);
    const trip = { id: makeId("trip"), createdAt: Date.now(), ...config, items };
    setTrips((prev) => [trip, ...prev]);
    setActiveId(trip.id);
    setMode("list");
    setShowTemplates(false);
    toast.success(`${items.length} items generated for ${trip.name}`);
  };

  const saveTripEdits = (config) => {
    if (!activeTrip) return;
    const items = regenerateItems(activeTrip, config);
    patchTrip(activeTrip.id, { ...config, items });
    setMode("list");
    toast.success("Trip updated — checklist re-generated");
  };

  const deleteTrip = (id) => {
    const trip = trips.find((t) => t.id === id);
    withUndo(`Deleted “${trip?.name || "trip"}”`, () => {
      setTrips((prev) => prev.filter((t) => t.id !== id));
      if (activeId === id) setActiveId(null);
    });
  };

  const renameTrip = (id, name) => {
    patchTrip(id, { name });
    toast.success("Trip renamed");
  };

  /* ------------------------------------------------------------------ */
  /*  Item operations                                                    */
  /* ------------------------------------------------------------------ */

  const setItems = useCallback(
    (updater) => activeTrip && patchTrip(activeTrip.id, (t) => ({ items: updater(t.items || []) })),
    [activeTrip, patchTrip]
  );

  const toggleItem = useCallback(
    (id) => setItems((items) => items.map((i) => (i.id === id ? { ...i, packed: !i.packed } : i))),
    [setItems]
  );

  const updateItem = useCallback(
    (id, patch) => setItems((items) => items.map((i) => (i.id === id ? { ...i, ...patch } : i))),
    [setItems]
  );

  const deleteItem = (id) => {
    const item = (activeTrip?.items || []).find((i) => i.id === id);
    withUndo(`Removed “${item?.label || "item"}”`, () => setItems((items) => items.filter((i) => i.id !== id)));
  };

  const addItem = (partial) => {
    setItems((items) => sortItems([...items, createItem(partial)]));
    toast.success(`${partial.label} added`);
  };

  const markCategory = (categoryId, packed) =>
    setItems((items) => items.map((i) => (i.category === categoryId ? { ...i, packed } : i)));

  const resetTrip = () => {
    if (!activeTrip) return;
    withUndo("Checklist reset — nothing packed", () =>
      setItems((items) => items.map((i) => ({ ...i, packed: false })))
    );
  };

  const applyTemplate = (templateId) => {
    const template = TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;

    // No trip open yet → the template becomes a brand new trip.
    if (!activeTrip) {
      createTrip({
        ...template.preset,
        name: template.name,
        startDate: "",
        hasFemaleTravellers: false,
      });
      return;
    }

    const generated = generateFromTemplate(templateId, configOf(activeTrip));
    const existing = new Set((activeTrip.items || []).map(keyOf));
    const additions = generated.filter((i) => !existing.has(keyOf(i)));
    if (!additions.length) {
      toast("Everything from this template is already on your list");
      return;
    }
    setItems((items) => sortItems([...items, ...additions]));
    setShowTemplates(false);
    toast.success(`${additions.length} items added from ${template.name}`);
  };

  /* ------------------------------------------------------------------ */
  /*  Export                                                             */
  /* ------------------------------------------------------------------ */

  const handleCopy = async () => {
    if (!activeTrip) return;
    const ok = await copyChecklistAsText(activeTrip);
    if (ok) toast.success("Checklist copied — paste it into WhatsApp");
    else toast.error("Copy blocked by the browser. Use Print instead.");
  };

  const handlePrint = () => {
    if (!activeTrip) return;
    if (!printChecklist(activeTrip)) toast.error("Allow pop-ups for this site to print the checklist");
  };

  const handlePdf = async () => {
    if (!activeTrip) return;
    const t = toast.loading("Building PDF…");
    const ok = await downloadChecklistPdf(activeTrip);
    toast.dismiss(t);
    if (ok) toast.success("PDF downloaded");
    else toast.error("Could not build the PDF. Try Print instead.");
  };

  /* ------------------------------------------------------------------ */
  /*  Filtering                                                          */
  /* ------------------------------------------------------------------ */

  const visibleItems = useMemo(() => {
    const items = activeTrip?.items || [];
    const q = query.trim().toLowerCase();
    return items.filter((i) => {
      if (filter === "unpacked" && i.packed) return false;
      if (filter === "critical" && i.priority !== "critical") return false;
      if (filter === "documents" && !i.isDocument) return false;
      if (q && !`${i.label} ${i.notes}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [activeTrip, filter, query]);

  const visibleCategories = useMemo(
    () =>
      CATEGORIES.map((cat) => ({ cat, items: sortItems(visibleItems.filter((i) => i.category === cat.id)) })).filter(
        ({ items }) => items.length > 0
      ),
    [visibleItems]
  );

  const tripTypeMeta = activeTrip ? TRIP_TYPES.find((t) => t.id === activeTrip.tripType) : null;
  const TripTypeIcon = getIcon(tripTypeMeta?.icon || "Compass");

  /* ------------------------------------------------------------------ */
  /*  Render                                                             */
  /* ------------------------------------------------------------------ */

  return (
    <div className="relative min-h-screen bg-ink-950">
      {/* ambient gold wash */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_80%_100%_at_50%_0%,rgba(212,168,67,0.08),transparent_70%)]"
      />

      <div className="relative mx-auto w-full max-w-[1440px] px-5 pb-24 pt-8 sm:px-8 md:pt-12">
        {/* ---------------- editorial header ---------------- */}
        <header className="mb-10 md:mb-14">
          <div className="flex items-center gap-4">
            <span className="eyebrow whitespace-nowrap">Pre-trip · packing intelligence</span>
            <span className="route-line hidden flex-1 sm:block" aria-hidden="true" />
            <span className="route-dot hidden sm:block" aria-hidden="true" />
          </div>

          <Motion.h1
            initial={reduce ? false : { opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 max-w-4xl font-display text-4xl font-medium leading-[1.05] tracking-tight text-ivory sm:text-5xl md:text-6xl"
          >
            Pack for the place,
            <br className="hidden sm:block" /> <em className="italic text-saffron">not for the guesswork</em>
          </Motion.h1>

          <Motion.p
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 max-w-2xl text-base leading-relaxed text-ivory-muted"
          >
            Tell SafarX where you are going, when, and with whom. It reads the terrain, the season and your travelling
            party, then builds the list — Diamox for Ladakh in January, dry bags for a Kerala monsoon, modest cover for
            a Kedarnath yatra.
          </Motion.p>
        </header>

        {/* ---------------- body ---------------- */}
        <div className="grid gap-8 lg:grid-cols-[290px_minmax(0,1fr)] lg:gap-10">
          <TripRail
            trips={trips}
            activeTripId={activeTrip?.id || null}
            onSelect={(id) => {
              setActiveId(id);
              setMode("list");
            }}
            onCreate={() => setMode("create")}
            onRename={renameTrip}
            onDelete={deleteTrip}
          />

          <main className="min-w-0">
            <AnimatePresence mode="wait">
              {/* ---------- create / edit ---------- */}
              {mode === "create" || (mode === "edit" && activeTrip) ? (
                <Motion.div
                  key={mode}
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <TripForm
                    mode={mode === "edit" ? "edit" : "create"}
                    initial={mode === "edit" && activeTrip ? configOf(activeTrip) : undefined}
                    onSubmit={mode === "edit" ? saveTripEdits : createTrip}
                    onCancel={trips.length > 0 || mode === "edit" ? () => setMode("list") : undefined}
                  />
                </Motion.div>
              ) : !activeTrip ? (
                /* ---------- empty state ---------- */
                <Motion.div
                  key="empty"
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-12"
                >
                  <div className="glass-panel px-6 py-14 text-center sm:px-10">
                    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-saffron/30 bg-saffron/10 text-saffron">
                      <Luggage size={24} />
                    </span>
                    <SectionHeading
                      className="mt-6"
                      eyebrow="Nothing packed yet"
                      title="Your first list is one form away"
                      lede="Create a trip and SafarX generates a full, prioritised packing list in a second — documents, medicine, gear and the small Indian things people always forget."
                    />
                    <button type="button" onClick={() => setMode("create")} className="btn-primary mt-8">
                      <Plus size={16} />
                      Plan a trip
                    </button>
                  </div>

                  <TemplateGallery
                    onApply={applyTemplate}
                    heading="Or start from a template"
                    lede="Each template spins up a trip with a realistic destination, duration and gear profile. Change the details afterwards — the list re-generates around them."
                  />
                </Motion.div>
              ) : (
                /* ---------- the checklist ---------- */
                <Motion.div
                  key={`trip-${activeTrip.id}`}
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-6"
                >
                  {/* trip identity */}
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="truncate font-display text-3xl leading-tight text-ivory">{activeTrip.name}</h2>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 font-data text-[11px] uppercase tracking-[0.16em] text-ivory-faint">
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin size={11} />
                          {activeTrip.destination || "Destination not set"}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays size={11} />
                          {formatDate(activeTrip.startDate)} · {activeTrip.days}d
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Users size={11} />
                          {activeTrip.adults} adult{activeTrip.adults === 1 ? "" : "s"}
                          {activeTrip.children > 0 ? ` · ${activeTrip.children} child` : ""}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-saffron/80">
                          <TripTypeIcon size={11} />
                          {tripTypeMeta?.label || "General travel"}
                        </span>
                      </div>
                    </div>

                    <Link
                      to="/vault"
                      className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/[0.07] px-4 py-2 font-data text-[11px] uppercase tracking-[0.16em] text-ivory-muted transition-colors hover:border-saffron/35 hover:text-saffron"
                    >
                      <FolderLock size={13} />
                      {stats.documentsPacked}/{stats.documentsTotal} docs · Vault
                    </Link>
                  </div>

                  <ReadinessPanel trip={activeTrip} stats={stats} />

                  <InsightNotes insights={insights} />

                  {/* toolbar */}
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <div
                        role="group"
                        aria-label="Filter items"
                        className="flex rounded-full border border-white/[0.07] p-0.5"
                      >
                        {FILTERS.map((f) => (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => setFilter(f.id)}
                            aria-pressed={filter === f.id}
                            className={`rounded-full px-3 py-1.5 font-data text-[10px] uppercase tracking-[0.16em] transition-colors duration-300 ${
                              filter === f.id ? "bg-saffron text-ink-950" : "text-ivory-faint hover:text-ivory"
                            }`}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>

                      <div className="relative min-w-[180px] flex-1">
                        <label className="sr-only" htmlFor="checklist-search">
                          Search items
                        </label>
                        <Search
                          size={14}
                          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ivory-faint"
                          aria-hidden="true"
                        />
                        <input
                          id="checklist-search"
                          className="glass-input !py-2 !pl-9 !text-sm"
                          placeholder="Search this list"
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                        />
                        {query && (
                          <button
                            type="button"
                            onClick={() => setQuery("")}
                            aria-label="Clear search"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-ivory-faint hover:text-ivory"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAdd((v) => !v)}
                        aria-pressed={showAdd}
                        aria-expanded={showAdd}
                        className="btn-ghost !px-4 !py-2 !text-xs"
                      >
                        <Plus size={14} />
                        Add item
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowTemplates((v) => !v)}
                        aria-pressed={showTemplates}
                        aria-expanded={showTemplates}
                        className="btn-ghost !px-4 !py-2 !text-xs"
                      >
                        <LayoutTemplate size={14} />
                        Templates
                      </button>
                      <button type="button" onClick={() => setMode("edit")} className="btn-ghost !px-4 !py-2 !text-xs">
                        <Settings2 size={14} />
                        Trip details
                      </button>
                      <button type="button" onClick={handleCopy} className="btn-ghost !px-4 !py-2 !text-xs">
                        <Copy size={14} />
                        Copy for WhatsApp
                      </button>
                      <button type="button" onClick={handlePrint} className="btn-ghost !px-4 !py-2 !text-xs">
                        <Printer size={14} />
                        Print
                      </button>
                      <button type="button" onClick={handlePdf} className="btn-ghost !px-4 !py-2 !text-xs">
                        <FileDown size={14} />
                        PDF
                      </button>
                      <button type="button" onClick={resetTrip} className="btn-ghost !px-4 !py-2 !text-xs">
                        <RotateCcw size={14} />
                        Reset
                      </button>
                    </div>
                  </div>

                  <AnimatePresence initial={false}>
                    {showAdd && (
                      <Motion.div
                        key="add"
                        initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                        animate={reduce ? { opacity: 1 } : { height: "auto", opacity: 1 }}
                        exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <AddItemForm onAdd={addItem} />
                      </Motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence initial={false}>
                    {showTemplates && (
                      <Motion.div
                        key="templates"
                        initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                        animate={reduce ? { opacity: 1 } : { height: "auto", opacity: 1 }}
                        exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="pt-2">
                          <TemplateGallery
                            onApply={applyTemplate}
                            heading="Add a template"
                            lede="Only the items you are missing get added — nothing already on your list is duplicated or overwritten."
                          />
                        </div>
                      </Motion.div>
                    )}
                  </AnimatePresence>

                  {/* categories */}
                  {visibleCategories.length > 0 ? (
                    <div className="space-y-3">
                      {visibleCategories.map(({ cat, items }, i) => (
                        <CategorySection
                          key={cat.id}
                          index={i}
                          category={cat}
                          items={items}
                          expanded={!collapsed[cat.id]}
                          onToggleExpanded={() => setCollapsed((c) => ({ ...c, [cat.id]: !c[cat.id] }))}
                          onToggleItem={toggleItem}
                          onUpdateItem={updateItem}
                          onDeleteItem={deleteItem}
                          onMarkAll={markCategory}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-white/[0.12] px-6 py-12 text-center">
                      <p className="font-display text-xl text-ivory">
                        {query || filter !== "all" ? "Nothing matches that filter" : "This list is empty"}
                      </p>
                      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ivory-muted">
                        {query || filter !== "all"
                          ? "Clear the search box or switch back to All to see the rest of your list."
                          : "Add an item of your own, or apply a template to fill the list back up."}
                      </p>
                      {(query || filter !== "all") && (
                        <button
                          type="button"
                          onClick={() => {
                            setQuery("");
                            setFilter("all");
                          }}
                          className="btn-ghost mt-6 !px-5 !py-2 !text-xs"
                        >
                          Show everything
                        </button>
                      )}
                    </div>
                  )}
                </Motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
};

export default PreTripChecklist;
