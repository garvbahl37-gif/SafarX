/**
 * LayerSwitcher — base map segmented control plus SafarX's own overlays.
 * Free providers only; each base layer carries its own attribution string
 * (see TILE_LAYERS in mapUtils) which Leaflet renders in the corner.
 */

import React from "react";
import { motion as Motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";

import { TILE_LAYERS, EASE } from "./mapUtils";
import { SAFARX_LAYERS } from "./categories";
import { SAFARX_POINTS_BY_LAYER } from "./safarxData";

const LayerSwitcher = ({ open, baseLayerId, onBaseLayer, overlays, onToggleOverlay }) => {
  const reduce = useReducedMotion();

  return (
    <AnimatePresence>
      {open && (
        <Motion.div
          initial={reduce ? false : { opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.24, ease: EASE }}
          className="w-60 rounded-2xl border border-white/[0.09] bg-ink-900/95 p-3 shadow-[0_28px_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl"
        >
          <p className="mb-2 font-data text-[9px] uppercase tracking-[0.22em] text-ivory-faint">
            Base map
          </p>
          <div
            role="radiogroup"
            aria-label="Base map style"
            className="flex rounded-full border border-white/[0.07] bg-ink-950/60 p-1"
          >
            {TILE_LAYERS.map((layer) => {
              const active = layer.id === baseLayerId;
              return (
                <button
                  key={layer.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => onBaseLayer?.(layer.id)}
                  className={`flex-1 rounded-full px-2 py-1.5 font-data text-[10px] uppercase tracking-[0.12em] transition-colors ${
                    active
                      ? "bg-saffron/20 text-saffron"
                      : "text-ivory-faint hover:text-ivory"
                  }`}
                >
                  {layer.name}
                </button>
              );
            })}
          </div>

          <p className="mb-2 mt-4 font-data text-[9px] uppercase tracking-[0.22em] text-ivory-faint">
            SafarX layers
          </p>
          <div className="space-y-1">
            {SAFARX_LAYERS.map((layer) => {
              const on = Boolean(overlays?.[layer.id]);
              const count = SAFARX_POINTS_BY_LAYER[layer.id]?.length || 0;
              return (
                <button
                  key={layer.id}
                  type="button"
                  role="switch"
                  aria-checked={on}
                  onClick={() => onToggleOverlay?.(layer.id)}
                  className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left transition-colors hover:bg-white/[0.05]"
                >
                  <span
                    className="flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] border transition-colors"
                    style={{
                      borderColor: on ? layer.color : "rgba(242,239,230,0.2)",
                      backgroundColor: on ? `${layer.color}26` : "transparent",
                    }}
                  >
                    {on && <Check className="h-3 w-3" style={{ color: layer.color }} aria-hidden="true" />}
                  </span>
                  <span className={`text-[13px] ${on ? "text-ivory" : "text-ivory-muted"}`}>
                    {layer.label}
                  </span>
                  <span className="ml-auto font-data text-[10px] tabular-nums tracking-[0.1em] text-ivory-faint">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </Motion.div>
      )}
    </AnimatePresence>
  );
};

export default LayerSwitcher;
