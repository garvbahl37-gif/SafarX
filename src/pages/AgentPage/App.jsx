import { useState, useEffect, useCallback } from 'react';
import { motion as Motion, AnimatePresence, useReducedMotion } from 'framer-motion';

import Chat from './components/Chat';
import BookingResults from './components/BookingResults';
import AILoadingScreen from './components/LoadingScreen';
import FlightBookingPanel from './components/FlightBookingPanel';
import HotelBookingPanel from './components/HotelBookingPanel';

import './index.css';

/* The full "Safar → SafarX" film already played on the main app shell.
   The agent only needs a short handoff, not a second feature presentation. */
const MIN_LOADER_DURATION = 1500;

const EASE = [0.22, 1, 0.36, 1];

function App() {
  const reduce = useReducedMotion();
  const [searchResults, setSearchResults] = useState(null);

  /* ── Booking panel state: null | 'flight' | 'hotel' | 'results' ── */
  const [activePanel, setActivePanel] = useState(null);

  /* ── Loading state ── */
  const [isLoading, setIsLoading] = useState(true);
  const [appReady, setAppReady] = useState(false);

  /* Determine when to dismiss the loader:
     - Just wait for MIN_LOADER_DURATION since the document is already loaded
       when routing to this page from the main App.jsx */
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, MIN_LOADER_DURATION);

    return () => clearTimeout(timer);
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
      {/* ── Agent boot screen ── */}
      <AnimatePresence onExitComplete={handleLoadingComplete}>
        {isLoading && <AILoadingScreen key="ai-loader" />}
      </AnimatePresence>

      {/* ── Main Application ── */}
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: appReady ? 1 : 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="agent-root min-h-screen overflow-hidden relative font-sans"
      >
        {/* ── Ambient atmosphere ── */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          {/* Gold horizon glow, top-left */}
          <Motion.div
            animate={
              reduce
                ? undefined
                : { opacity: [0.5, 0.75, 0.5], scale: [1, 1.12, 1], x: [0, 40, 0], y: [0, 24, 0] }
            }
            transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-[-22%] left-[-12%] w-[760px] h-[760px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(212,168,67,0.13) 0%, transparent 68%)',
              filter: 'blur(50px)',
            }}
          />

          {/* Jade counterweight, bottom-right — used sparingly */}
          <Motion.div
            animate={
              reduce
                ? undefined
                : { opacity: [0.4, 0.62, 0.4], scale: [1, 1.16, 1], x: [0, -28, 0], y: [0, -40, 0] }
            }
            transition={{ duration: 27, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
            className="absolute bottom-[-20%] right-[-10%] w-[640px] h-[640px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(46,139,116,0.1) 0%, transparent 70%)',
              filter: 'blur(60px)',
            }}
          />

          {/* Deep gold ember, mid-right */}
          <Motion.div
            animate={reduce ? undefined : { opacity: [0.3, 0.5, 0.3], scale: [1, 1.08, 1] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 9 }}
            className="absolute top-[32%] right-[18%] w-[380px] h-[380px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(166,126,43,0.12) 0%, transparent 70%)',
              filter: 'blur(50px)',
            }}
          />

          {/* Waypoint grid */}
          <div className="agent-grid absolute inset-0 opacity-40" />
        </div>

        {/* Main Application Container */}
        <div className="relative z-10 flex flex-col h-screen max-w-[1920px] mx-auto p-3 sm:p-4 md:p-6 lg:p-8 gap-4 md:gap-6">

          {/* Main Content Area — flex row with chat + optional side panel */}
          <div className="flex-1 flex gap-4 md:gap-6 min-h-0 items-stretch">

            {/* Chat Window — shrinks when panel is open */}
            <Motion.div
              layout
              transition={{ duration: 0.45, ease: EASE }}
              className="flex flex-col min-h-0 min-w-0"
              style={{
                flex: panelOpen ? '1 1 0%' : '1 1 100%',
                maxWidth: panelOpen ? '100%' : '56rem',
                marginLeft: 'auto',
                marginRight: panelOpen ? 0 : 'auto',
              }}
            >
              <Motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE }}
                className="h-full flex flex-col"
              >
                <div className="agent-panel flex-1 rounded-2xl md:rounded-3xl overflow-hidden relative flex flex-col shadow-[0_24px_64px_rgba(0,0,0,0.45)]">
                  {/* Gold filament along the top edge */}
                  <div
                    className="absolute top-0 left-0 right-0 h-px z-20 bg-gradient-to-r from-transparent via-saffron/50 to-transparent"
                    aria-hidden="true"
                  />
                  <Chat
                    onSearchResults={(results) => {
                      setSearchResults(results);
                      setActivePanel('results');
                    }}
                    onOpenFlightPanel={openFlightPanel}
                    onOpenHotelPanel={openHotelPanel}
                  />
                </div>
              </Motion.div>
            </Motion.div>

            {/* Booking Side Panel */}
            <AnimatePresence mode="wait">
              {panelOpen && (
                <Motion.div
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
                </Motion.div>
              )}
            </AnimatePresence>

          </div>

        </div>

      </Motion.div>
    </>
  );
}

export default App;
