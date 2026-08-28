import { useState, useEffect, useCallback } from 'react';
import { motion as Motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Plane, Hotel, TrainFront, MessageSquarePlus, ArrowLeft, Compass, History,
} from 'lucide-react';

import Chat from './components/Chat';
import BookingResults from './components/BookingResults';
import AILoadingScreen from './components/LoadingScreen';
import FlightBookingPanel from './components/FlightBookingPanel';
import HotelBookingPanel from './components/HotelBookingPanel';
import TrainBookingPanel from './components/TrainBookingPanel';
import { clearSession } from './api';

import './index.css';

/* The full "Safar → SafarX" film already played on the main app shell.
   The agent only needs a short handoff, not a second feature presentation. */
const MIN_LOADER_DURATION = 1500;

const EASE = [0.22, 1, 0.36, 1];

function App() {
    const navigate = useNavigate();
    const reduce = useReducedMotion();
    const [searchResults, setSearchResults] = useState(null);

    /* ── Booking panel state: null | 'flight' | 'hotel' | 'results' ── */
    const [activePanel, setActivePanel] = useState(null);

    /* ── Rail state ── */
    const [history, setHistory] = useState([]);
    const [focusMessageId, setFocusMessageId] = useState(null);
    const [sessionKey, setSessionKey] = useState(0);

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
    const openTrainPanel = useCallback(() => setActivePanel('train'), []);
    const closePanel = useCallback(() => {
        setActivePanel(null);
        setSearchResults(null);
    }, []);

    const startNewChat = useCallback(() => {
        clearSession().catch(() => {
            /* the transcript is cleared locally either way */
        });
        setHistory([]);
        setFocusMessageId(null);
        setSessionKey((k) => k + 1);
        closePanel();
    }, [closePanel]);

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
                {/* ══════════ Ambient backdrop ══════════ */}
                <div
                    className="fixed inset-0 pointer-events-none overflow-hidden film-grain vignette"
                    aria-hidden="true"
                >
                    {/* Gold horizon bloom, top-left */}
                    <Motion.div
                        animate={
                            reduce
                                ? undefined
                                : { opacity: [0.5, 0.78, 0.5], scale: [1, 1.12, 1], x: [0, 40, 0], y: [0, 24, 0] }
                        }
                        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute top-[-24%] left-[-14%] w-[820px] h-[820px] rounded-full"
                        style={{
                            background: 'radial-gradient(circle, rgba(212,168,67,0.14) 0%, transparent 68%)',
                            filter: 'blur(50px)',
                        }}
                    />

                    {/* Jade counterweight, bottom-right — used sparingly */}
                    <Motion.div
                        animate={
                            reduce
                                ? undefined
                                : { opacity: [0.38, 0.6, 0.38], scale: [1, 1.16, 1], x: [0, -28, 0], y: [0, -40, 0] }
                        }
                        transition={{ duration: 27, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
                        className="absolute bottom-[-22%] right-[-12%] w-[680px] h-[680px] rounded-full"
                        style={{
                            background: 'radial-gradient(circle, rgba(46,139,116,0.1) 0%, transparent 70%)',
                            filter: 'blur(60px)',
                        }}
                    />

                    {/* Deep gold ember, mid-right */}
                    <Motion.div
                        animate={reduce ? undefined : { opacity: [0.28, 0.48, 0.28], scale: [1, 1.08, 1] }}
                        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 9 }}
                        className="absolute top-[34%] right-[20%] w-[400px] h-[400px] rounded-full"
                        style={{
                            background: 'radial-gradient(circle, rgba(166,126,43,0.12) 0%, transparent 70%)',
                            filter: 'blur(50px)',
                        }}
                    />

                    {/* Dotted atlas grid */}
                    <div className="agent-grid absolute inset-0 opacity-45" />
                </div>

                {/* ══════════ Layout ══════════ */}
                <div className="relative z-10 flex h-screen max-w-[1920px] mx-auto p-3 sm:p-4 md:p-6 gap-4 md:gap-5">

                    {/* ══════════ Left rail ══════════ */}
                    <Motion.aside
                        initial={{ opacity: 0, x: -18 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, ease: EASE }}
                        className="agent-rail agent-filament hidden lg:flex flex-col w-[248px] shrink-0
                                   rounded-3xl overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.45)]"
                        aria-label="SafarX Agent navigation"
                    >
                        {/* Identity */}
                        <div className="px-5 pt-6 pb-5 border-b border-white/[0.07]">
                            <button
                                onClick={() => navigate('/')}
                                className="flex items-baseline gap-0.5 cursor-pointer group"
                                aria-label="Back to SafarX home"
                            >
                                <span className="font-display italic font-medium text-[1.5rem] leading-none text-ivory tracking-tight">
                                    Safar
                                </span>
                                <span className="font-data text-[1.25rem] leading-none font-bold text-saffron tracking-[0.04em]">
                                    X
                                </span>
                            </button>
                            <p className="eyebrow-muted mt-3">Agent</p>

                            <div className="flex items-center gap-2 mt-4" aria-hidden="true">
                                <span className="route-dot" />
                                <span className="route-line flex-1" />
                                <span className="route-dot" />
                            </div>
                        </div>

                        {/* Quick tools */}
                        <nav className="px-3 py-4 space-y-1" aria-label="Agent tools">
                            <button onClick={startNewChat} className="agent-rail-item px-3 py-2.5 text-[13px]">
                                <MessageSquarePlus size={15} className="text-saffron shrink-0" aria-hidden="true" />
                                New conversation
                            </button>
                            <button
                                onClick={openFlightPanel}
                                className={`agent-rail-item px-3 py-2.5 text-[13px] ${activePanel === 'flight' ? 'agent-rail-item-active' : ''}`}
                            >
                                <Plane size={15} className="text-saffron shrink-0" aria-hidden="true" />
                                Flights
                            </button>
                            <button
                                onClick={openHotelPanel}
                                className={`agent-rail-item px-3 py-2.5 text-[13px] ${activePanel === 'hotel' ? 'agent-rail-item-active' : ''}`}
                            >
                                <Hotel size={15} className="text-saffron shrink-0" aria-hidden="true" />
                                Stays
                            </button>
                            <button
                                onClick={openTrainPanel}
                                className={`agent-rail-item px-3 py-2.5 text-[13px] ${activePanel === 'train' ? 'agent-rail-item-active' : ''}`}
                            >
                                <TrainFront size={15} className="text-saffron shrink-0" aria-hidden="true" />
                                Trains
                            </button>
                            <button onClick={() => navigate('/')} className="agent-rail-item px-3 py-2.5 text-[13px]">
                                <ArrowLeft size={15} className="text-saffron shrink-0" aria-hidden="true" />
                                Back to SafarX
                            </button>
                        </nav>

                        {/* Session history */}
                        <div className="flex-1 min-h-0 flex flex-col px-3 pb-2">
                            <p className="flex items-center gap-2 px-3 pt-3 pb-2">
                                <History size={11} className="text-ivory-faint" aria-hidden="true" />
                                <span className="eyebrow-muted">This session</span>
                            </p>

                            <div className="agent-scroll flex-1 min-h-0 overflow-y-auto space-y-0.5 pr-1">
                                {history.length === 0 ? (
                                    <p className="px-3 py-2 text-[12px] leading-relaxed text-ivory-faint">
                                        Your prompts will collect here.
                                    </p>
                                ) : (
                                    history.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => setFocusMessageId({ id: item.id, at: Date.now() })}
                                            className="agent-rail-item px-3 py-2 text-[12.5px] leading-snug"
                                            title={item.text}
                                        >
                                            <span className="route-dot shrink-0" aria-hidden="true" />
                                            <span className="agent-clamp-1 min-w-0">{item.text}</span>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-5 py-4 border-t border-white/[0.07]">
                            <p className="flex items-center gap-2">
                                <Compass size={11} className="text-saffron" aria-hidden="true" />
                                <span className="font-data text-[9px] uppercase tracking-[0.2em] text-ivory-faint">
                                    Incredible India
                                </span>
                            </p>
                        </div>
                    </Motion.aside>

                    {/* ══════════ Main column + side panel ══════════ */}
                    <div className="flex-1 flex gap-4 md:gap-5 min-h-0 min-w-0 items-stretch">

                        {/* Chat Window — shrinks when panel is open */}
                        <Motion.div
                            layout
                            transition={{ duration: 0.45, ease: EASE }}
                            className="flex flex-col min-h-0 min-w-0"
                            style={{
                                flex: panelOpen ? '1 1 0%' : '1 1 100%',
                                maxWidth: panelOpen ? '100%' : '58rem',
                                marginLeft: 'auto',
                                marginRight: panelOpen ? 0 : 'auto',
                            }}
                        >
                            <Motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, ease: EASE, delay: 0.08 }}
                                className="h-full flex flex-col"
                            >
                                <div className="agent-panel agent-filament flex-1 rounded-2xl md:rounded-3xl overflow-hidden relative flex flex-col shadow-[0_24px_64px_rgba(0,0,0,0.45)]">
                                    <Chat
                                        key={sessionKey}
                                        onSearchResults={(results) => {
                                            setSearchResults(results);
                                            setActivePanel('results');
                                        }}
                                        onOpenFlightPanel={openFlightPanel}
                                        onOpenHotelPanel={openHotelPanel}
                                        onOpenTrainPanel={openTrainPanel}
                                        onHistoryChange={setHistory}
                                        focusMessageId={focusMessageId}
                                        onNewChat={startNewChat}
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
                                    {activePanel === 'train' && (
                                        <TrainBookingPanel onClose={closePanel} />
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
