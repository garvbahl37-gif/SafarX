// src/components/safety/FloatingSOSWidget.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Radio, PhoneCall } from "lucide-react";
import SOSBeaconModal from "./SOSBeaconModal";

export default function FloatingSOSWidget({ defaultDestination = "Current Location" }) {
 const [isOpen, setIsOpen] = useState(false);
 const [isHovered, setIsHovered] = useState(false);

 return (<>
 {/* The corner itself, vacated by the music toggle. It used to sit at
     bottom-20, stacked above it — the emergency control shunted upward by a
     speaker button. */}
 <div className="fixed bottom-6 left-6 z-40 flex items-center gap-3">
 {/* SOS Action Button */}
 <motion.button
 whileHover={{ scale: 1.08 }}
 whileTap={{ scale: 0.92 }}
 onMouseEnter={() => setIsHovered(true)}
 onMouseLeave={() => setIsHovered(false)}
 onClick={() => setIsOpen(true)}
 aria-label="Emergency SOS Beacon"
 className="relative group flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-danger via-danger to-saffron text-ivory shadow-2xl shadow-danger-900/50 border-2 border-white/20 focus:outline-none focus:ring-4 focus:ring-danger/40 cursor-pointer"
 >
 {/* Subtle Outer Radar Pulse */}
 <span className="absolute -inset-1 rounded-full bg-danger/30 animate-ping pointer-events-none" />
          
 <div className="relative flex flex-col items-center justify-center">
 <ShieldAlert className="w-6 h-6 text-ivory group-hover:animate-pulse" />
 <span className="text-[9px] font-black tracking-widest uppercase font-data mt-0.5">
 SOS
 </span>
 </div>
 </motion.button>

 {/* Expanded Tooltip / Badge on Hover */}
 <AnimatePresence>
 {isHovered && (<motion.div
 initial={{ opacity: 0, x: -10, scale: 0.95 }}
 animate={{ opacity: 1, x: 0, scale: 1 }}
 exit={{ opacity: 0, x: -10, scale: 0.95 }}
 className="hidden sm:flex items-center gap-2 bg-ink-900/90 backdrop-blur-xl border border-danger/30 text-ivory text-xs px-3.5 py-2 rounded-2xl shadow-xl whitespace-nowrap pointer-events-none"
 >
 <span className="w-2 h-2 rounded-full bg-danger animate-ping" />
 <span>
 <strong>Tourist Safety & SOS</strong> · 1-Click WhatsApp Live Broadcast
 </span>
 </motion.div>
 )}
 </AnimatePresence>
 </div>

 {/* SOS Modal */}
 <SOSBeaconModal
 isOpen={isOpen}
 onClose={() => setIsOpen(false)}
 defaultDestination={defaultDestination}
 />
 </>
 );
}
