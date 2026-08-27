import React, { useState } from "react";
import { motion as Motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { Check, Minus, Plus, Pencil, Trash2, FolderLock, Sparkles } from "lucide-react";
import { PRIORITIES } from "../../utils/checklistGenerator";

const PRIORITY_STYLES = {
  critical: "border-saffron/45 bg-saffron/15 text-saffron",
  high: "border-white/15 bg-white/[0.06] text-ivory-muted",
  normal: "border-white/[0.07] bg-transparent text-ivory-faint",
};

const PRIORITY_CYCLE = ["normal", "high", "critical"];

/**
 * One packing item. Everything is a real <button> or labelled control so the
 * whole row is keyboard operable without a single div-with-onClick.
 */
const ChecklistItemRow = ({ item, onToggle, onUpdate, onDelete }) => {
  const reduce = useReducedMotion();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ label: item.label, notes: item.notes });
  const [error, setError] = useState("");

  const nextPriority = () =>
    PRIORITY_CYCLE[(PRIORITY_CYCLE.indexOf(item.priority) + 1) % PRIORITY_CYCLE.length];

  const saveEdit = () => {
    const label = draft.label.trim();
    if (!label) {
      setError("Give the item a name, or cancel the edit.");
      return;
    }
    onUpdate(item.id, { label, notes: draft.notes.trim() });
    setError("");
    setEditing(false);
  };

  const changeQty = (delta) =>
    onUpdate(item.id, { quantity: Math.max(1, Math.min(99, item.quantity + delta)) });

  const weight = item.weightGrams * item.quantity;

  return (
    <li
      className={`group rounded-xl border px-3 py-3 transition-colors duration-300 sm:px-4 ${
        item.packed
          ? "border-white/[0.05] bg-white/[0.015]"
          : "border-white/[0.07] bg-ink-800/60 hover:border-saffron/35"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* ---- check ---- */}
        <button
          type="button"
          onClick={() => onToggle(item.id)}
          aria-pressed={item.packed}
          aria-label={`${item.packed ? "Unpack" : "Pack"} ${item.label}`}
          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border transition-colors duration-300 ${
            item.packed
              ? "border-saffron bg-saffron text-ink-950"
              : "border-white/20 bg-transparent text-transparent hover:border-saffron/70"
          }`}
        >
          <AnimatePresence initial={false}>
            {item.packed && (
              <Motion.span
                key="tick"
                initial={reduce ? { opacity: 0 } : { scale: 0.4, opacity: 0 }}
                animate={reduce ? { opacity: 1 } : { scale: 1, opacity: 1 }}
                exit={reduce ? { opacity: 0 } : { scale: 0.4, opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              >
                <Check size={16} strokeWidth={3} />
              </Motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* ---- body ---- */}
        <div className="min-w-0 flex-1">
          {editing ? (
            <div className="space-y-2">
              <label className="sr-only" htmlFor={`label-${item.id}`}>
                Item name
              </label>
              <input
                id={`label-${item.id}`}
                className="glass-input !py-2 !text-sm"
                value={draft.label}
                onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && saveEdit()}
              />
              <label className="sr-only" htmlFor={`notes-${item.id}`}>
                Note for {item.label}
              </label>
              <input
                id={`notes-${item.id}`}
                className="glass-input !py-2 !text-sm"
                placeholder="Add a note — why, where, which one"
                value={draft.notes}
                onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && saveEdit()}
              />
              {error && (
                <p role="alert" className="font-data text-[11px] uppercase tracking-[0.18em] text-saffron">
                  {error}
                </p>
              )}
              <div className="flex gap-2">
                <button type="button" onClick={saveEdit} className="btn-primary !px-4 !py-1.5 !text-xs">
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDraft({ label: item.label, notes: item.notes });
                    setError("");
                    setEditing(false);
                  }}
                  className="btn-ghost !px-4 !py-1.5 !text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span
                  className={`text-[0.9375rem] leading-snug transition-colors duration-300 ${
                    item.packed ? "text-ivory-faint line-through" : "text-ivory"
                  }`}
                >
                  {item.label}
                </span>
                {item.quantity > 1 && (
                  <span className="font-data text-[11px] tracking-[0.12em] text-saffron/80">
                    ×{item.quantity}
                  </span>
                )}
                {!item.autoAdded && (
                  <span
                    className="inline-flex items-center gap-1 font-data text-[10px] uppercase tracking-[0.18em] text-ivory-faint"
                    title="Added by you"
                  >
                    <Sparkles size={10} /> yours
                  </span>
                )}
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-data text-[11px] tracking-[0.1em] text-ivory-faint">
                {weight > 0 && <span>{weight >= 1000 ? `${(weight / 1000).toFixed(1)} kg` : `${weight} g`}</span>}
                {item.isDocument && (
                  <Link
                    to="/vault"
                    className="inline-flex items-center gap-1 uppercase text-saffron/75 transition-colors hover:text-saffron"
                  >
                    <FolderLock size={11} />
                    Store in vault
                  </Link>
                )}
                {item.notes && (
                  <span className="font-sans normal-case tracking-normal text-ivory-muted">{item.notes}</span>
                )}
              </div>
            </>
          )}
        </div>

        {/* ---- controls ---- */}
        {!editing && (
          <div className="flex shrink-0 items-center gap-1">
            <div className="hidden items-center rounded-lg border border-white/[0.07] sm:flex">
              <button
                type="button"
                onClick={() => changeQty(-1)}
                disabled={item.quantity <= 1}
                aria-label={`Decrease quantity of ${item.label}`}
                className="px-1.5 py-1.5 text-ivory-faint transition-colors hover:text-ivory disabled:opacity-30"
              >
                <Minus size={13} />
              </button>
              <span className="min-w-[1.5rem] text-center font-data text-xs text-ivory">{item.quantity}</span>
              <button
                type="button"
                onClick={() => changeQty(1)}
                aria-label={`Increase quantity of ${item.label}`}
                className="px-1.5 py-1.5 text-ivory-faint transition-colors hover:text-ivory"
              >
                <Plus size={13} />
              </button>
            </div>

            <button
              type="button"
              onClick={() => onUpdate(item.id, { priority: nextPriority() })}
              aria-label={`Priority for ${item.label} is ${PRIORITIES[item.priority].label}. Change to ${
                PRIORITIES[nextPriority()].label
              }.`}
              className={`rounded-md border px-1.5 py-1 font-data text-[10px] tracking-[0.12em] transition-colors ${
                PRIORITY_STYLES[item.priority]
              }`}
            >
              {PRIORITIES[item.priority].short}
            </button>

            <button
              type="button"
              onClick={() => setEditing(true)}
              aria-label={`Edit ${item.label}`}
              className="rounded-md p-1.5 text-ivory-faint transition-colors hover:text-ivory"
            >
              <Pencil size={14} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(item.id)}
              aria-label={`Remove ${item.label}`}
              className="rounded-md p-1.5 text-ivory-faint transition-colors hover:text-saffron"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Quantity stepper moves below the label on very narrow screens */}
      {!editing && (
        <div className="mt-2 flex items-center gap-2 sm:hidden">
          <span className="font-data text-[10px] uppercase tracking-[0.18em] text-ivory-faint">Qty</span>
          <div className="flex items-center rounded-lg border border-white/[0.07]">
            <button
              type="button"
              onClick={() => changeQty(-1)}
              disabled={item.quantity <= 1}
              aria-label={`Decrease quantity of ${item.label}`}
              className="px-2.5 py-1.5 text-ivory-faint disabled:opacity-30"
            >
              <Minus size={13} />
            </button>
            <span className="min-w-[1.75rem] text-center font-data text-xs text-ivory">{item.quantity}</span>
            <button
              type="button"
              onClick={() => changeQty(1)}
              aria-label={`Increase quantity of ${item.label}`}
              className="px-2.5 py-1.5 text-ivory-faint"
            >
              <Plus size={13} />
            </button>
          </div>
        </div>
      )}
    </li>
  );
};

export default ChecklistItemRow;
