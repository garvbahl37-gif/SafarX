import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import Chat from './components/Chat';
import BookingResults from './components/BookingResults';
import AILoadingScreen from './components/LoadingScreen';
import FlightBookingPanel from './components/FlightBookingPanel';
import HotelBookingPanel from './components/HotelBookingPanel';

import './index.css';

const MIN_LOADER_DURATION = 4500; // ms – ensures the animation is visible even on fast loads

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [searchResults, setSearchResults] = useState(null);

  /* ── Booking panel state: null | 'flight' | 'hotel' ── */
  const [activePanel, setActivePanel] = useState(null);

  /* ── Loading state ── */
  const [isLoading, setIsLoading] = useState(true);
  const [appReady, setAppReady] = useState(false);

  /* Determine when to dismiss the loader:
     - document is fully loaded (or already was)
     - AND at least MIN_LOADER_DURATION has elapsed */
  useEffect(() => {
    const start = Date.now();

    const dismiss = () => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, MIN_LOADER_DURATION - elapsed);
      setTimeout(() => setIsLoading(false), remaining);
    };

    if (document.readyState === 'complete') {
      dismiss();
    } else {
      window.addEventListener('load', dismiss, { once: true });
      return () => window.removeEventListener('load', dismiss);
    }
  }, []);

  /* Called after the loader exit animation finishes */
  const handleLoadingComplete = useCallback(() => {
    setAppReady(true);
    // Remove inline HTML loader if it still exists
    const inlineLoader = document.getElementById('ai-inline-loader');
    if (inlineLoader) inlineLoader.remove();
  }, []);

  const openFlightPanel = useCallback(() => setActivePanel('flight'), []);
  const openHotelPanel = useCallback(() => setActivePanel('hotel'), []);
  const closePanel = useCallback(() => {
    setActivePanel(null);
    setSearchResults(null);
  }, []);

  const panelOpen = activePanel !== null || searchResults !== null;

  return (
    <>
      {/* ── AI Loading Screen ── */}
      <AnimatePresence onExitComplete={handleLoadingComplete}>
        {isLoading && (
          <AILoadingScreen
            key="ai-loader"
          />
        )}
      </AnimatePresence>

      {/* ── Main Application ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: appReady ? 1 : 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="min-h-screen bg-mesh-gradient bg-grid text-white overflow-hidden relative font-sans"
      >

        {/* Ambient Background Orbs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {/* Primary Ocean Orb */}
          <motion.div
            animate={{
              opacity: [0.15, 0.25, 0.15],
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, 30, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(0, 102, 255, 0.3) 0%, transparent 70%)',
              filter: 'blur(60px)',
            }}
          />

          {/* Violet Orb */}
          <motion.div
            animate={{
              opacity: [0.1, 0.2, 0.1],
              scale: [1, 1.3, 1],
              x: [0, -30, 0],
              y: [0, -50, 0],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 5 }}
            className="absolute bottom-[-20%] right-[-10%] w-[700px] h-[700px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.25) 0%, transparent 70%)',
              filter: 'blur(60px)',
            }}
          />

          {/* Teal Accent Orb */}
          <motion.div
            animate={{
              opacity: [0.08, 0.15, 0.08],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 10 }}
            className="absolute top-[30%] right-[20%] w-[400px] h-[400px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(0, 229, 255, 0.2) 0%, transparent 70%)',
              filter: 'blur(50px)',
            }}
          />

          {/* Subtle Grid Overlay */}
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '100px 100px',
            }}
          />
        </div>

        {/* Main Application Container */}
        <div className="relative z-10 flex flex-col h-screen max-w-[1920px] mx-auto p-3 sm:p-4 md:p-6 lg:p-8 gap-4 md:gap-6">

          {/* Main Content Area — flex row with chat + optional side panel */}
          <div className="flex-1 flex gap-4 md:gap-6 min-h-0 items-stretch">

            {/* Chat Window — shrinks when panel is open */}
            <motion.div
              layout
              transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
              className="flex flex-col min-h-0 min-w-0"
              style={{
                flex: panelOpen ? '1 1 0%' : '1 1 100%',
                maxWidth: panelOpen ? '100%' : '56rem',
                marginLeft: 'auto',
                marginRight: panelOpen ? 0 : 'auto',
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                className="h-full flex flex-col"
              >
                <div className="flex-1 glass-panel rounded-2xl md:rounded-3xl overflow-hidden relative flex flex-col">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  <Chat
                    onSearchResults={(results) => {
                      setSearchResults(results);
                      setActivePanel('results');
                    }}
                    onOpenFlightPanel={openFlightPanel}
                    onOpenHotelPanel={openHotelPanel}
                  />
                </div>
              </motion.div>
            </motion.div>

            {/* Booking Side Panel */}
            <AnimatePresence mode="wait">
              {panelOpen && (
                <motion.div
                  key={activePanel || (searchResults ? 'results' : 'none')}
                  initial={{ opacity: 0, x: 80, width: 0 }}
                  animate={{ opacity: 1, x: 0, width: '420px' }}
                  exit={{ opacity: 0, x: 80, width: 0 }}
                  transition={{ type: 'spring', damping: 28, stiffness: 260 }}
                  className="relative flex-shrink-0 min-h-0"
                  style={{ width: '420px', minWidth: '340px', maxWidth: '440px', overflow: 'hidden' }}
                >
                  {activePanel === 'flight' && (
                    <FlightBookingPanel onClose={closePanel} />
                  )}
                  {activePanel === 'hotel' && (
                    <HotelBookingPanel onClose={closePanel} />
                  )}
                  {(activePanel === 'results' || searchResults) && (
                    <BookingResults results={searchResults} onClose={closePanel} />
                  )}
                </motion.div>
              )}
            </AnimatePresence>

          </div>

        </div>

      </motion.div>
    </>
  );
}

export default App;