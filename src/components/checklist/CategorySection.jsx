import React from "react";
import { motion as Motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronDown, CheckCheck, RotateCcw } from "lucide-react";
import ChecklistItemRow from "./ChecklistItemRow";
import { getIcon } from "./icons";

/**
 * A collapsible category block with its own packed count and progress bar.
 */
const CategorySection = ({
  category,
  items,
  expanded,
  onToggleExpanded,
  onToggleItem,
  onUpdateItem,
  onDeleteItem,
  onMarkAll,
  index = 0,
}) => {
  const reduce = useReducedMotion();
  const Icon = getIcon(category.icon);
  const packed = items.filter((i) => i.packed).length;
  const percent = items.length ? Math.round((packed / items.length) * 100) : 0;
  const allPacked = items.length > 0 && packed === items.length;
  const panelId = `cat-panel-${category.id}`;
  const headingId = `cat-heading-${category.id}`;

  return (
    <Motion.section
      initial={reduce ? false : { opacity: 0, y: 18 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay: Math.min(index * 0.04, 0.24), ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden rounded-2xl border border-white/[0.07] bg-ink-900/60"
      aria-labelledby={headingId}
    >
      <div className="flex items-center gap-2 px-3 py-3 sm:px-4">
        <button
          type="button"
          onClick={onToggleExpanded}
          aria-expanded={expanded}
          aria-controls={panelId}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors duration-300 ${
              allPacked
                ? "border-saffron/40 bg-saffron/15 text-saffron"
                : "border-white/[0.07] bg-white/[0.03] text-ivory-muted"
            }`}
          >
            <Icon size={16} />
          </span>

          <span className="min-w-0 flex-1">
            <span id={headingId} className="block truncate font-display text-lg text-ivory">
              {category.label}
            </span>
            <span className="mt-1 flex items-center gap-2">
              <span className="font-data text-[11px] tracking-[0.16em] text-ivory-faint">
                {packed}/{items.length} packed
              </span>
              {/* Decorative: the "3/12 packed" text above already carries the
                  value for assistive tech, and a role inside a button would
                  pollute the button's accessible name. */}
              <span
                aria-hidden="true"
                className="hidden h-1 w-24 overflow-hidden rounded-full bg-white/[0.07] sm:block"
              >
                <Motion.span
                  className="block h-full rounded-full bg-gradient-to-r from-saffron-bright to-saffron"
                  initial={reduce ? false : { width: 0 }}
                  animate={{ width: `${percent}%` }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                />
              </span>
            </span>
          </span>

          <Motion.span
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: reduce ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="shrink-0 text-ivory-faint"
          >
            <ChevronDown size={18} />
          </Motion.span>
        </button>

        <button
          type="button"
          onClick={() => onMarkAll(category.id, !allPacked)}
          aria-label={
            allPacked ? `Unpack everything in ${category.label}` : `Mark everything in ${category.label} as packed`
          }
          className="shrink-0 rounded-lg border border-white/[0.07] p-2 text-ivory-faint transition-colors hover:border-saffron/35 hover:text-saffron"
        >
          {allPacked ? <RotateCcw size={15} /> : <CheckCheck size={15} />}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <Motion.div
            id={panelId}
            key="panel"
            initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduce ? { opacity: 1 } : { height: "auto", opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <ul className="space-y-2 px-3 pb-4 sm:px-4">
              {items.map((item) => (
                <ChecklistItemRow
                  key={item.id}
                  item={item}
                  onToggle={onToggleItem}
                  onUpdate={onUpdateItem}
                  onDelete={onDeleteItem}
                />
              ))}
              {items.length === 0 && (
                <li className="rounded-xl border border-dashed border-white/[0.07] px-4 py-6 text-center text-sm text-ivory-faint">
                  Nothing here yet. Add an item above and pick this category.
                </li>
              )}
            </ul>
          </Motion.div>
        )}
      </AnimatePresence>
    </Motion.section>
  );
};

export default CategorySection;
