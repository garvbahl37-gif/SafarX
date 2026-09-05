// src/components/safety/FloatingSOSWidget.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert } from "lucide-react";
import SOSQuickPanel from "./SOSQuickPanel";
import SOSBeaconModal from "./SOSBeaconModal";

/**
 * The emergency corner. Two depths, deliberately:
 *
 *   tap  → SOSQuickPanel, a popover anchored here that carries the call
 *          and the location send and nothing else
 *   then → SOSBeaconModal, the full beacon, for the things that need
 *          configuring rather than pressing
 *
 * The button used to open the full beacon directly, which meant every
 * accidental brush of a red button blacked out the entire page.
 */
export default function FloatingSOSWidget({ defaultDestination = "Current Location" }) {
  const [panelOpen, setPanelOpen] = useState(false);
  const [fullOpen, setFullOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <>
      {/* The corner itself, vacated by the music toggle. It used to sit at
          bottom-20, stacked above it — the emergency control shunted upward
          by a speaker button. */}
      <div className="fixed bottom-6 left-6 z-40 flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={() => setPanelOpen((v) => !v)}
          aria-label="Emergency SOS"
          aria-expanded={panelOpen}
          className="group relative flex h-14 w-14 cursor-pointer items-center justify-center
                     rounded-full border-2 border-white/20 bg-gradient-to-tr from-danger
                     via-danger to-saffron text-ivory shadow-2xl shadow-danger-900/50
                     focus:outline-none focus:ring-4 focus:ring-danger/40"
        >
          {/* The radar ping is the resting state's whole job. Once the panel
              is open it is just noise behind a live control. */}
          {!panelOpen && (
            <span className="pointer-events-none absolute -inset-1 animate-ping rounded-full bg-danger/30" />
          )}

          <div className="relative flex flex-col items-center justify-center">
            <ShieldAlert className="h-6 w-6 text-ivory group-hover:animate-pulse" />
            <span className="mt-0.5 font-data text-[9px] font-black uppercase tracking-widest">
              SOS
            </span>
          </div>
        </motion.button>

        {/* Hover hint — suppressed once the panel says it better */}
        <AnimatePresence>
          {hovered && !panelOpen && (
            <motion.div
              initial={{ opacity: 0, x: -10, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -10, scale: 0.95 }}
              className="pointer-events-none hidden items-center gap-2 whitespace-nowrap
                         rounded-2xl border border-danger/30 bg-ink-900/90 px-3.5 py-2
                         text-xs text-ivory shadow-xl backdrop-blur-xl sm:flex"
            >
              <span className="h-2 w-2 animate-ping rounded-full bg-danger" />
              <span>
                <strong>Emergency</strong> · call 112 or send your location
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {panelOpen && (
          <SOSQuickPanel
            key="sos-quick"
            defaultDestination={defaultDestination}
            onClose={() => setPanelOpen(false)}
            onOpenFull={() => {
              setPanelOpen(false);
              setFullOpen(true);
            }}
          />
        )}
      </AnimatePresence>

      <SOSBeaconModal
        isOpen={fullOpen}
        onClose={() => setFullOpen(false)}
        defaultDestination={defaultDestination}
      />
    </>
  );
}
