import { useState, useRef, useEffect, useCallback } from 'react';
import { motion as Motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
    Send,
    Mic,
    MapPin,
    Plane,
    Compass,
    Hotel,
    ArrowLeft,
    CalendarDays,
    Check,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { sendMessage } from '../api';

const EASE = [0.22, 1, 0.36, 1];

/* Four openers, all Indian, all in ₹ */
const SUGGESTIONS = [
    { icon: Compass, text: 'Plan 5 days in Kerala under ₹30k' },
    { icon: Plane, text: 'Flights Delhi to Leh in June' },
    { icon: Hotel, text: 'Hotels near the Taj under ₹4,000' },
    { icon: CalendarDays, text: 'What can I do in Meghalaya in October?' },
];

const FLIGHT_KEYWORDS = /book.*flight|flight.*book|book.*ticket|fly\s+to|flights?\s+(to|from)|search.*flight/;
const HOTEL_KEYWORDS = /book.*hotel|hotel.*book|find.*hotel|stay\s+in|accommodation|where.*stay|search.*hotel/;

/* ── Three waypoints igniting in sequence — the agent is thinking ── */
const RouteThinking = ({ label }) => (
    <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5" aria-hidden="true">
            <span className="agent-waypoint" />
            <span className="agent-waypoint" />
            <span className="agent-waypoint" />
        </span>
        <span className="font-data text-[10px] uppercase tracking-[0.2em] text-ivory-faint">
            {label}
        </span>
    </div>
);

/* ── Tool-step chip: the agent doing visible work ── */
const StepChip = ({ icon: Icon, label, done }) => (
    <span
        className={`agent-tag ${done ? 'agent-tag-jade' : 'agent-tag-gold'} px-2.5 py-1 text-[10px]`}
    >
        {done ? <Check size={10} /> : <Icon size={10} />}
        {label}
    </span>
);

const Chat = ({ onSearchResults, onOpenFlightPanel, onOpenHotelPanel }) => {
    const navigate = useNavigate();
    const reduce = useReducedMotion();

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [activeStep, setActiveStep] = useState(null);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: reduce ? 'auto' : 'smooth',
            block: 'end',
        });
    }, [messages, isLoading, reduce]);

    /* Auto-grow the composer up to ~5 lines */
    const resizeInput = useCallback(() => {
        const el = inputRef.current;
        if (!el) return;
        el.style.height = 'auto';
        el.style.height = `${Math.min(el.scrollHeight, 132)}px`;
    }, []);

    useEffect(() => {
        resizeInput();
    }, [input, resizeInput]);

    const submit = async (raw) => {
        const text = (raw ?? '').trim();
        if (!text || isLoading) return;

        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: text,
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        /* Route the request to the matching booking tool and surface the work */
        const lower = text.toLowerCase();
        let tool = null;
        if (FLIGHT_KEYWORDS.test(lower)) {
            tool = 'flight';
            onOpenFlightPanel?.();
            setActiveStep({ icon: Plane, label: 'Searching flights…' });
        } else if (HOTEL_KEYWORDS.test(lower)) {
            tool = 'hotel';
            onOpenHotelPanel?.();
            setActiveStep({ icon: Hotel, label: 'Searching stays…' });
        } else {
            setActiveStep(null);
        }

        try {
            const response = await sendMessage(text);

            /* Completed steps travel with the reply so the trail stays visible */
            const steps = [];
            if (tool === 'flight') steps.push({ icon: Plane, label: 'Flight search ready' });
            if (tool === 'hotel') steps.push({ icon: Hotel, label: 'Stay search ready' });
            const found = response.search_results?.results?.length;
            if (found) steps.push({ icon: MapPin, label: `Found ${found} sources` });

            const aiMessage = {
                id: Date.now() + 1,
                type: 'ai',
                content: response.response,
                search_results: response.search_results,
                itinerary: response.itinerary,
                steps,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, aiMessage]);

            if (response.search_results) onSearchResults?.(response.search_results);
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now() + 1,
                    type: 'ai',
                    content:
                        "I couldn't reach the network just now. Give it a moment and send that again.",
                    isError: true,
                    timestamp: new Date(),
                },
            ]);
        } finally {
            setIsLoading(false);
            setActiveStep(null);
        }
    };

    const handleSend = () => submit(input);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    /* Markdown-lite: bold spans are gilded by .agent-msg-* rules in index.css */
    const formatMessage = (content) =>
        String(content ?? '')
            .replace(/\n/g, '<br/>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    const isEmpty = messages.length === 0;
    const canSend = input.trim().length > 0 && !isLoading;

    return (
        <div className="flex flex-col h-full relative overflow-hidden">

            {/* ══════════ Header ══════════ */}
            <div className="relative z-10 flex items-center justify-between gap-3 px-4 md:px-6 py-3.5 border-b border-white/[0.07] bg-ink-950/40">
                <div className="flex items-center gap-3 min-w-0">
                    <button
                        onClick={() => navigate('/')}
                        className="agent-icon-btn p-2 shrink-0"
                        aria-label="Back to SafarX home"
                    >
                        <ArrowLeft size={16} />
                    </button>

                    <span className="hidden sm:block w-px h-5 bg-white/10" aria-hidden="true" />

                    <div className="min-w-0">
                        <p className="flex items-baseline gap-0.5 leading-none">
                            <span className="font-display italic font-medium text-[1.15rem] text-ivory tracking-tight">
                                Safar
                            </span>
                            <span className="font-data text-[0.95rem] font-bold text-saffron tracking-[0.04em]">
                                X
                            </span>
                            <span className="ml-2 font-data text-[9px] uppercase tracking-[0.22em] text-ivory-faint">
                                Agent
                            </span>
                        </p>
                        <p className="flex items-center gap-1.5 mt-1">
                            <span className="route-dot" aria-hidden="true" />
                            <span className="font-data text-[9.5px] uppercase tracking-[0.18em] text-ivory-faint">
                                {isLoading ? 'Working' : 'Ready'}
                            </span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={() => onOpenFlightPanel?.()}
                        className="agent-chip px-3 py-1.5 text-xs font-medium"
                        aria-label="Open flight search"
                    >
                        <Plane size={13} className="text-saffron" />
                        <span className="hidden sm:inline">Flights</span>
                    </button>
                    <button
                        onClick={() => onOpenHotelPanel?.()}
                        className="agent-chip px-3 py-1.5 text-xs font-medium"
                        aria-label="Open hotel search"
                    >
                        <Hotel size={13} className="text-saffron" />
                        <span className="hidden sm:inline">Hotels</span>
                    </button>
                </div>
            </div>

            {/* ══════════ Message canvas ══════════ */}
            <div
                className="agent-scroll flex-1 overflow-y-auto px-4 md:px-6 py-6"
                aria-live="polite"
                aria-relevant="additions text"
                aria-label="Conversation with the SafarX Agent"
            >
                {/* ── Empty state ── */}
                {isEmpty && !isLoading && (
                    <Motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: EASE }}
                        className="h-full flex flex-col items-center justify-center text-center px-2"
                    >
                        <span className="eyebrow-muted">27.17° N · 78.04° E</span>

                        <h1 className="mt-5 font-display text-[clamp(1.9rem,5vw,2.9rem)] leading-[1.1] tracking-tight text-ivory">
                            Where shall we <em className="italic text-saffron">go?</em>
                        </h1>

                        <p className="mt-4 max-w-md text-sm md:text-[15px] leading-relaxed text-ivory-muted">
                            Itineraries, fares, stays and seasons across India — ask in plain
                            language and I'll work it out.
                        </p>

                        <div className="mt-8 flex items-center gap-3 w-full max-w-md" aria-hidden="true">
                            <span className="route-dot" />
                            <span className="route-line flex-1" />
                            <span className="route-dot" />
                        </div>

                        <div className="mt-8 grid sm:grid-cols-2 gap-2.5 w-full max-w-xl">
                            {SUGGESTIONS.map((s, i) => (
                                <Motion.button
                                    key={s.text}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: 0.15 + i * 0.06, ease: EASE }}
                                    whileHover={reduce ? undefined : { y: -2 }}
                                    onClick={() => submit(s.text)}
                                    className="agent-chip cursor-pointer px-4 py-3 text-left text-[13px] leading-snug"
                                >
                                    <s.icon size={14} className="text-saffron shrink-0" />
                                    <span>{s.text}</span>
                                </Motion.button>
                            ))}
                        </div>
                    </Motion.div>
                )}

                {/* ── Messages ── */}
                <div className="space-y-6">
                    <AnimatePresence initial={false}>
                        {messages.map((msg) => (
                            <Motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.26, ease: EASE }}
                                className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'
                                    }`}
                            >
                                {/* Attribution row */}
                                <div
                                    className={`flex items-center gap-2 mb-2 ${msg.type === 'user' ? 'flex-row-reverse' : ''
                                        }`}
                                >
                                    {msg.type === 'ai' && <span className="route-dot" aria-hidden="true" />}
                                    <span className="font-data text-[9.5px] uppercase tracking-[0.22em] text-ivory-faint">
                                        {msg.type === 'user' ? 'You' : 'SafarX'}
                                    </span>
                                    <span className="font-data text-[9.5px] tabular-nums text-ivory-faint/70">
                                        {msg.timestamp.toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </span>
                                </div>

                                {/* Bubble */}
                                <Motion.div
                                    whileHover={reduce || msg.type === 'user' ? undefined : { y: -1 }}
                                    transition={{ duration: 0.25, ease: EASE }}
                                    className={`max-w-[85%] px-4 py-3.5 text-[14.5px] text-ivory ${msg.type === 'user' ? 'agent-msg-user' : 'agent-msg-assistant'
                                        } ${msg.isError ? 'agent-msg-error' : ''}`}
                                >
                                    <div dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
                                </Motion.div>

                                {/* Completed tool steps */}
                                {msg.steps?.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                                        {msg.steps.map((step) => (
                                            <StepChip
                                                key={step.label}
                                                icon={step.icon}
                                                label={step.label}
                                                done
                                            />
                                        ))}
                                    </div>
                                )}
                            </Motion.div>
                        ))}
                    </AnimatePresence>

                    {/* ── Working state ── */}
                    <AnimatePresence>
                        {isLoading && (
                            <Motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.24, ease: EASE }}
                                className="flex flex-col items-start"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="route-dot" aria-hidden="true" />
                                    <span className="font-data text-[9.5px] uppercase tracking-[0.22em] text-ivory-faint">
                                        SafarX
                                    </span>
                                </div>

                                <div className="agent-msg-assistant px-4 py-3.5 space-y-3">
                                    <RouteThinking label={activeStep ? 'Running tools' : 'Plotting a route'} />
                                    {activeStep && (
                                        <div className="flex flex-wrap gap-1.5">
                                            <StepChip icon={activeStep.icon} label={activeStep.label} />
                                        </div>
                                    )}
                                    <span className="agent-route-live block w-40" aria-hidden="true" />
                                </div>
                            </Motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div ref={messagesEndRef} />
            </div>

            {/* ══════════ Composer ══════════ */}
            <div className="relative z-10 px-4 md:px-6 pt-3 pb-4 border-t border-white/[0.07] bg-ink-950/40">
                <div className="agent-composer flex items-end gap-2 pl-4 pr-2 py-2">
                    <label htmlFor="agent-composer-input" className="sr-only">
                        Message the SafarX Agent
                    </label>
                    <textarea
                        id="agent-composer-input"
                        ref={inputRef}
                        rows={1}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={
                            isLoading ? 'Working on it…' : 'Ask about routes, fares, stays or seasons'
                        }
                        disabled={isLoading}
                        className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 resize-none
                                   text-[14.5px] leading-relaxed text-ivory placeholder:text-ivory-faint
                                   py-2 max-h-[132px] disabled:cursor-not-allowed disabled:opacity-60"
                    />

                    <button
                        onClick={() => setIsRecording(!isRecording)}
                        className={`agent-icon-btn p-2 mb-0.5 shrink-0 ${isRecording ? 'text-saffron border-saffron/40' : ''
                            }`}
                        aria-label={isRecording ? 'Stop voice input' : 'Start voice input'}
                        aria-pressed={isRecording}
                    >
                        <Mic size={17} />
                    </button>

                    <button
                        onClick={handleSend}
                        disabled={!canSend}
                        className="agent-send mb-0.5 shrink-0"
                        aria-label={isLoading ? 'Sending message' : 'Send message'}
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-1" aria-hidden="true">
                                <span className="agent-waypoint" />
                                <span className="agent-waypoint" />
                                <span className="agent-waypoint" />
                            </span>
                        ) : (
                            <Send size={16} />
                        )}
                    </button>
                </div>

                <p className="mt-2.5 text-center font-data text-[9.5px] uppercase tracking-[0.18em] text-ivory-faint">
                    SafarX Agent · Enter to send · Shift + Enter for a new line
                </p>
            </div>
        </div>
    );
};

export default Chat;
