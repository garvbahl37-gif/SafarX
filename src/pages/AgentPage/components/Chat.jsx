import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { motion as Motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
    Send,
    Mic,
    MapPin,
    Plane,
    Compass,
    Hotel,
    TrainFront,
    ArrowLeft,
    Sparkle,
    Copy,
    Check,
    RefreshCw,
    MessageSquarePlus,
    IndianRupee,
    CalendarRange,
    Route,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { streamAgent, placePhotos } from '../services/agentStream';
import { useSpeechInput } from '../../../hooks/useSpeechInput';
import ListeningOrb from '../../../components/ui/ListeningOrb';

const EASE = [0.22, 1, 0.36, 1];

/* ── Openers, grouped by intent. All Indian, all in ₹ ── */
const PROMPT_GROUPS = [
    { id: 'plan', label: 'Plan', icon: Compass, prompt: 'Plan 5 days in Kerala under ₹30k' },
    { id: 'flights', label: 'Find flights', icon: Plane, prompt: 'Flights Delhi to Leh in June' },
    { id: 'stays', label: 'Find stays', icon: Hotel, prompt: 'Hotels near the Taj under ₹4,000' },
    { id: 'discover', label: 'Discover', icon: Sparkle, prompt: 'What can I do in Meghalaya in October?' },
];

/* ── What the agent actually does ── */
const CAPABILITIES = [
    { icon: Route, label: 'Day-by-day itineraries' },
    { icon: IndianRupee, label: 'Live fares in ₹' },
    { icon: Hotel, label: 'Stays from heritage to homestay' },
    { icon: CalendarRange, label: 'Season windows' },
];

const FLIGHT_KEYWORDS = /book.*flight|flight.*book|book.*ticket|fly\s+to|flights?\s+(to|from)|search.*flight/;
const HOTEL_KEYWORDS = /book.*hotel|hotel.*book|find.*hotel|stay\s+in|accommodation|where.*stay|search.*hotel/;
const TRAIN_KEYWORDS = /train|rail(way)?s?\b|irctc|rajdhani|shatabdi|vande\s*bharat|duronto|tejas|express\s+to/;

/* Each tool announces its work as a sequence of steps */
const TOOL_STEPS = {
    flight: ['Searching flights', 'Reading live fares', 'Ranking by price'],
    hotel: ['Searching stays', 'Checking availability', 'Ranking by value'],
    train: ['Searching trains', 'Reading the timetable', 'Checking running days'],
};

/* Markdown-lite: bold spans are gilded by .agent-msg-* rules in index.css */
/* Escape first: the model's output is untrusted text, and it goes through
   dangerouslySetInnerHTML below. */
const escapeHtml = (raw) =>
    String(raw ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        /* Quotes matter too: link URLs below are interpolated into an href
           attribute, so an unescaped " would break out of it. */
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

/* Inline marks, applied after escaping. */
const inlineMarkdown = (line) =>
    line
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/(^|[\s(])\*([^*\n]+?)\*(?=[\s.,;:!?)]|$)/g, '$1<em>$2</em>')
        .replace(/`([^`\n]+?)`/g, '<code>$1</code>')
        .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
                 '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

/**
 * The model answers in markdown — bullet lists, bold day headings, the odd
 * numbered step. Rendering it raw left literal asterisks all over the reply,
 * so parse the block structure into real elements.
 */
const formatMessage = (content) => {
    const lines = escapeHtml(content).split('\n');
    const out = [];
    let list = null;                       // 'ul' | 'ol' | null

    const closeList = () => {
        if (list) { out.push(`</${list}>`); list = null; }
    };
    const openList = (kind) => {
        if (list !== kind) { closeList(); out.push(`<${kind}>`); list = kind; }
    };

    for (const raw of lines) {
        const line = raw.trimEnd();
        if (!line.trim()) { closeList(); continue; }

        const heading = line.match(/^\s*#{1,4}\s+(.*)$/);
        if (heading) {
            closeList();
            out.push(`<h4>${inlineMarkdown(heading[1])}</h4>`);
            continue;
        }

        // "* item", "- item", "• item" — any indent
        const bullet = line.match(/^\s*[*\-•]\s+(.*)$/);
        if (bullet) {
            openList('ul');
            out.push(`<li>${inlineMarkdown(bullet[1])}</li>`);
            continue;
        }

        // "1. item"
        const numbered = line.match(/^\s*\d+[.)]\s+(.*)$/);
        if (numbered) {
            openList('ol');
            out.push(`<li>${inlineMarkdown(numbered[1])}</li>`);
            continue;
        }

        closeList();
        out.push(`<p>${inlineMarkdown(line)}</p>`);
    }
    closeList();
    return out.join('');
};

/* A mid-stream slice can end on an unclosed ** — close it so no raw asterisks show */
const balanceBold = (text) =>
    (text.match(/\*\*/g)?.length ?? 0) % 2 ? `${text}**` : text;

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

/* ── Tool-step chip ── */
const StepChip = (props) => {
    const { label, done } = props;
    const Glyph = props.icon;
    return (
        <span className={`agent-tag ${done ? 'agent-tag-jade' : 'agent-tag-gold'} px-2.5 py-1 text-[10px]`}>
            {done ? <Check size={10} aria-hidden="true" /> : <Glyph size={10} aria-hidden="true" />}
            {label}
        </span>
    );
};

/* ── Progressive reveal of a finished reply ── */
const StreamedBody = memo(function StreamedBody({ content, stream, onAdvance }) {
    const [shown, setShown] = useState(stream ? '' : content);

    useEffect(() => {
        if (!stream) {
            setShown(content);
            return;
        }
        const parts = String(content ?? '').split(/(\s+)/);
        const total = parts.length;
        const step = Math.max(1, Math.ceil(total / 55));
        let i = 0;
        const id = setInterval(() => {
            i += step;
            if (i >= total) {
                setShown(content);
                clearInterval(id);
            } else {
                setShown(balanceBold(parts.slice(0, i).join('')));
            }
            onAdvance?.();
        }, 22);
        return () => clearInterval(id);
    }, [content, stream, onAdvance]);

    const streaming = stream && shown !== content;

    return (
        <>
            <span className="agent-prose" dangerouslySetInnerHTML={{ __html: formatMessage(shown) }} />
            {streaming && <span className="agent-caret" aria-hidden="true" />}
        </>
    );
});

let messageSeq = 0;
const nextMessageId = () => `m${Date.now().toString(36)}-${(messageSeq += 1)}`;

const Chat = ({
    onSearchResults,
    onOpenFlightPanel,
    onOpenHotelPanel,
    onOpenTrainPanel,
    onHistoryChange,
    focusMessageId,
    onNewChat,
}) => {
    const navigate = useNavigate();
    const reduce = useReducedMotion();

    /* The model reasons on a separate channel before it writes anything; that
       gap is what the panel reports while it lasts. */
    const [isThinking, setIsThinking] = useState(false);
    const abortRef = useRef(null);
    /* The turn reads history without re-creating itself on every token. */
    const messagesRef = useRef([]);

    const [messages, setMessages] = useState([]);
    /* Kept in a ref so the send handler can read the transcript without
       being rebuilt on every streamed token. */
    messagesRef.current = messages;
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    /* Dictation. Finals are appended to whatever is already typed so you can
       start a sentence with the keyboard and finish it out loud; the interim
       text is shown separately rather than written into the box, because
       watching your own words get rewritten mid-phrase is unpleasant. */
    const {
        listening,
        starting: micStarting,
        interim,
        error: speechError,
        toggle: toggleDictation,
        stop: stopDictation,
        getLevel,
        supported: speechSupported,
    } = useSpeechInput({
        onFinal: (text) => {
            if (!text) return;
            setInput((prev) => (prev ? `${prev.replace(/\s+$/, '')} ${text}` : text));
        },
    });
    const [activeTool, setActiveTool] = useState(null);
    const [stepIndex, setStepIndex] = useState(0);
    const [copiedId, setCopiedId] = useState(null);
    const [justSent, setJustSent] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToEnd = useCallback(
        (smooth = true) => {
            messagesEndRef.current?.scrollIntoView({
                behavior: smooth && !reduce ? 'smooth' : 'auto',
                block: 'end',
            });
        },
        [reduce]
    );

    /* During a stream we tick often — keep it instant so it never fights itself */
    const scrollToEndInstant = useCallback(() => scrollToEnd(false), [scrollToEnd]);

    useEffect(() => {
        scrollToEnd();
    }, [messages, isLoading, scrollToEnd]);

    /* Report the session's prompts up to the rail */
    useEffect(() => {
        onHistoryChange?.(
            messages
                .filter((m) => m.type === 'user')
                .map((m) => ({ id: m.id, text: m.content }))
        );
    }, [messages, onHistoryChange]);

    /* Rail click — bring that prompt back into view (repeat clicks re-scroll) */
    useEffect(() => {
        const targetId = focusMessageId?.id;
        if (!targetId) return;
        const el = document.getElementById(`agent-msg-${targetId}`);
        el?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    }, [focusMessageId, reduce]);

    /* Walk the active tool through its steps while the request is in flight */
    useEffect(() => {
        if (!activeTool || !isLoading) return;
        const steps = TOOL_STEPS[activeTool] || [];
        const id = setInterval(() => {
            setStepIndex((i) => Math.min(i + 1, steps.length - 1));
        }, 1100);
        return () => clearInterval(id);
    }, [activeTool, isLoading]);

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

    /* ── The agent turn ── */
    const runAgent = async (text) => {
        setIsLoading(true);

        /* Route the request to the matching booking tool and surface the work */
        const lower = text.toLowerCase();
        let tool = null;
        if (FLIGHT_KEYWORDS.test(lower)) {
            tool = 'flight';
            onOpenFlightPanel?.();
        } else if (HOTEL_KEYWORDS.test(lower)) {
            tool = 'hotel';
            onOpenHotelPanel?.();
        } else if (TRAIN_KEYWORDS.test(lower)) {
            tool = 'train';
            onOpenTrainPanel?.();
        }
        setActiveTool(tool);
        setStepIndex(0);

        /* Completed steps travel with the reply so the trail stays visible */
        const steps = [];
        if (tool === 'flight') steps.push({ icon: Plane, label: 'Flight search ready' });
        if (tool === 'hotel') steps.push({ icon: Hotel, label: 'Stay search ready' });

        /* The bubble is placed empty and filled as the tokens land, rather
           than held back until the model has finished writing. */
        const replyId = nextMessageId();
        setMessages((prev) => [
            ...prev,
            { id: replyId, type: 'ai', content: '', steps, streaming: true, timestamp: new Date() },
        ]);

        const controller = new AbortController();
        abortRef.current = controller;

        try {
            const history = [...messagesRef.current, { role: 'user', content: text }]
                .slice(-12)
                .map((m) => (m.role ? m : { role: m.type === 'user' ? 'user' : 'assistant', content: m.content }))
                .filter((m) => m.content);

            const reply = await streamAgent(history, {
                signal: controller.signal,
                onThinking: () => setIsThinking(true),
                onToken: (_chunk, whole) => {
                    setIsThinking(false);
                    setMessages((prev) =>
                        prev.map((m) => (m.id === replyId ? { ...m, content: whole } : m))
                    );
                },
            });

            setMessages((prev) =>
                prev.map((m) => (m.id === replyId ? { ...m, content: reply, streaming: false } : m))
            );

            /* Photographs of whatever places the answer actually named. Fetched
               after the text so they never hold the words back. */
            const photos = await placePhotos(reply);
            if (photos.length) {
                setMessages((prev) =>
                    prev.map((m) => (m.id === replyId ? { ...m, photos } : m))
                );
            }
        } catch (err) {
            /* Stopping generation is a choice, not a failure: keep whatever
               was written and drop the bubble only if it is still empty. */
            if (err.name === 'AbortError') {
                setMessages((prev) =>
                    prev
                        .map((m) => (m.id === replyId ? { ...m, streaming: false } : m))
                        .filter((m) => m.id !== replyId || m.content)
                );
            } else {
                setMessages((prev) =>
                    prev.map((m) =>
                        m.id === replyId
                            ? {
                                ...m,
                                content:
                                    err.message ||
                                    "I couldn't reach the network just now. Give it a moment and send that again.",
                                isError: true,
                                streaming: false,
                            }
                            : m
                    )
                );
            }
        } finally {
            abortRef.current = null;
            setIsThinking(false);
            setIsLoading(false);
            setActiveTool(null);
            setStepIndex(0);
        }
    };

    const submit = async (raw) => {
        const text = (raw ?? '').trim();
        if (!text || isLoading) return;

        setMessages((prev) => [
            ...prev,
            { id: nextMessageId(), type: 'user', content: text, timestamp: new Date() },
        ]);
        setInput('');
        setJustSent(true);
        setTimeout(() => setJustSent(false), 520);

        await runAgent(text);
    };

    /* Sending closes the microphone. Leaving it open after a message is away
       means the agent's own reply gets dictated back into the next one. */
    const handleSend = () => {
        if (listening) stopDictation();
        submit(input);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleCopy = async (msg) => {
        try {
            await navigator.clipboard.writeText(msg.content);
            setCopiedId(msg.id);
            setTimeout(() => setCopiedId(null), 1600);
        } catch {
            /* clipboard unavailable — nothing to recover from */
        }
    };

    const handleRegenerate = async (msg) => {
        if (isLoading) return;
        const idx = messages.findIndex((m) => m.id === msg.id);
        if (idx < 1) return;
        const prevUser = [...messages.slice(0, idx)].reverse().find((m) => m.type === 'user');
        if (!prevUser) return;
        setMessages((prev) => prev.filter((m) => m.id !== msg.id));
        await runAgent(prevUser.content);
    };

    const isEmpty = messages.length === 0;
    const canSend = input.trim().length > 0 && !isLoading;
    const toolSteps = activeTool ? TOOL_STEPS[activeTool] : null;
    const toolIcon = activeTool === 'hotel' ? Hotel : activeTool === 'train' ? TrainFront : Plane;

    return (
        <div className="flex flex-col h-full relative overflow-hidden">

            {/* ══════════ Header ══════════ */}
            <div className="relative z-10 flex items-center justify-between gap-3 px-4 md:px-6 py-3.5 border-b border-white/[0.07] bg-ink-950/40">
                <div className="flex items-center gap-3 min-w-0">
                    <button
                        onClick={() => navigate('/')}
                        className="agent-icon-btn p-2 shrink-0 lg:hidden"
                        aria-label="Back to SafarX home"
                    >
                        <ArrowLeft size={16} />
                    </button>

                    <div className="min-w-0">
                        <p className="flex items-baseline gap-0.5 leading-none lg:hidden">
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
                        <p className="hidden lg:block font-display text-[17px] leading-tight text-ivory">
                            Conversation
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
                        onClick={() => onNewChat?.()}
                        className="agent-icon-btn p-2 inline-flex lg:hidden"
                        aria-label="Start a new conversation"
                    >
                        <MessageSquarePlus size={16} />
                    </button>
                    <button
                        onClick={() => onOpenFlightPanel?.()}
                        className="agent-chip px-3 py-1.5 text-xs font-medium lg:hidden"
                        aria-label="Open flight search"
                    >
                        <Plane size={13} className="text-saffron" aria-hidden="true" />
                        <span className="hidden sm:inline">Flights</span>
                    </button>
                    <button
                        onClick={() => onOpenHotelPanel?.()}
                        className="agent-chip px-3 py-1.5 text-xs font-medium lg:hidden"
                        aria-label="Open hotel search"
                    >
                        <Hotel size={13} className="text-saffron" aria-hidden="true" />
                        <span className="hidden sm:inline">Hotels</span>
                    </button>
                    <button
                        onClick={() => onOpenTrainPanel?.()}
                        className="agent-chip px-3 py-1.5 text-xs font-medium lg:hidden"
                        aria-label="Open train search"
                    >
                        <TrainFront size={13} className="text-saffron" aria-hidden="true" />
                        <span className="hidden sm:inline">Trains</span>
                    </button>
                    <span className="hidden lg:flex items-center gap-2 font-data text-[9px] uppercase tracking-[0.2em] text-ivory-faint">
                        {messages.filter((m) => m.type === 'user').length} prompts
                    </span>
                </div>
            </div>

            {/* ══════════ Message canvas ══════════ */}
            <div
                className="agent-scroll flex-1 overflow-y-auto px-4 md:px-8 py-6"
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
                        className="h-full flex flex-col items-center justify-center text-center px-1 py-4"
                    >
                        <span className="eyebrow-muted">27.17° N · 78.04° E</span>

                        <h1 className="mt-5 font-display text-[clamp(2rem,5vw,3.1rem)] leading-[1.08] tracking-tight text-ivory">
                            Where shall we <em className="italic text-saffron">go?</em>
                        </h1>

                        <p className="mt-4 max-w-md text-sm md:text-[15px] leading-relaxed text-ivory-muted">
                            Itineraries, fares, stays and seasons across India — ask in plain
                            language and I'll work it out.
                        </p>

                        <div className="mt-7 flex items-center gap-3 w-full max-w-lg" aria-hidden="true">
                            <span className="route-dot" />
                            <span className="route-line flex-1" />
                            <Plane size={12} className="text-saffron rotate-45" />
                            <span className="route-line flex-1" />
                            <span className="route-dot" />
                        </div>

                        {/* Intent cards */}
                        <div className="mt-7 grid sm:grid-cols-2 gap-2.5 w-full max-w-xl">
                            {PROMPT_GROUPS.map((g, i) => (
                                <Motion.button
                                    key={g.id}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.45, delay: 0.15 + i * 0.07, ease: EASE }}
                                    whileHover={reduce ? undefined : { y: -3 }}
                                    onClick={() => submit(g.prompt)}
                                    className="agent-card agent-card-lift cursor-pointer rounded-2xl p-4 text-left group"
                                >
                                    <span className="flex items-center gap-2 mb-2.5">
                                        <g.icon size={13} className="text-saffron shrink-0" aria-hidden="true" />
                                        <span className="font-data text-[9.5px] uppercase tracking-[0.2em] text-saffron">
                                            {g.label}
                                        </span>
                                        <span className="route-line flex-1" aria-hidden="true" />
                                    </span>
                                    <span className="block text-[13.5px] leading-snug text-ivory-muted group-hover:text-ivory transition-colors">
                                        {g.prompt}
                                    </span>
                                </Motion.button>
                            ))}
                        </div>

                        {/* Capability strip */}
                        <Motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                            className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2.5 max-w-xl"
                        >
                            {CAPABILITIES.map((c) => (
                                <span key={c.label} className="flex items-center gap-1.5">
                                    <c.icon size={11} className="text-saffron/70" aria-hidden="true" />
                                    <span className="font-data text-[9px] uppercase tracking-[0.16em] text-ivory-faint">
                                        {c.label}
                                    </span>
                                </span>
                            ))}
                        </Motion.div>
                    </Motion.div>
                )}

                {/* ── Messages ── */}
                <div className="space-y-7">
                    <AnimatePresence initial={false}>
                        {messages.map((msg) => (
                            <Motion.div
                                key={msg.id}
                                id={`agent-msg-${msg.id}`}
                                initial={{ opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.26, ease: EASE }}
                                className={`agent-msg-row flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'
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
                                <div
                                    className={`max-w-[86%] px-4 py-3.5 text-[14.5px] text-ivory ${msg.type === 'user' ? 'agent-msg-user' : 'agent-msg-assistant'
                                        } ${msg.isError ? 'agent-msg-error' : ''}`}
                                >
                                    {msg.type === 'ai' ? (
                                        <StreamedBody
                                            content={msg.content}
                                            stream={Boolean(msg.stream) && !reduce}
                                            onAdvance={scrollToEndInstant}
                                        />
                                    ) : (
                                        <span className="agent-prose" dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
                                    )}
                                </div>

                                {/* Photographs of the places the reply named.
                                    Wikipedia summaries, so they are pictures of
                                    the actual place rather than stock travel
                                    imagery chosen by keyword. */}
                                {msg.photos?.length > 0 && (
                                    <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1 -mx-0.5 px-0.5">
                                        {msg.photos.map((photo) => (
                                            <a
                                                key={photo.name}
                                                href={photo.link || undefined}
                                                target={photo.link ? '_blank' : undefined}
                                                rel="noreferrer"
                                                className="group/photo relative w-40 shrink-0 overflow-hidden rounded-2xl border border-white/[0.08] bg-ink-900"
                                            >
                                                <img
                                                    src={photo.image}
                                                    alt={photo.title}
                                                    loading="lazy"
                                                    className="h-24 w-full object-cover transition-transform duration-500 group-hover/photo:scale-[1.06]"
                                                />
                                                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950 via-ink-950/80 to-transparent px-2.5 pb-1.5 pt-5 block">
                                                    <span className="block truncate font-sans text-[11.5px] font-semibold text-ivory">
                                                        {photo.title}
                                                    </span>
                                                </span>
                                            </a>
                                        ))}
                                    </div>
                                )}

                                {/* Completed tool steps */}
                                {msg.steps?.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                                        {msg.steps.map((step) => (
                                            <StepChip key={step.label} icon={step.icon} label={step.label} done />
                                        ))}
                                    </div>
                                )}

                                {/* Hover-revealed actions */}
                                {msg.type === 'ai' && !msg.isError && (
                                    <div className="agent-msg-actions flex items-center gap-1 mt-2">
                                        <button
                                            onClick={() => handleCopy(msg)}
                                            className="agent-icon-btn p-1.5"
                                            aria-label={copiedId === msg.id ? 'Reply copied' : 'Copy reply'}
                                        >
                                            {copiedId === msg.id ? (
                                                <Check size={13} className="text-saffron" />
                                            ) : (
                                                <Copy size={13} />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleRegenerate(msg)}
                                            disabled={isLoading}
                                            className="agent-icon-btn p-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                                            aria-label="Ask again"
                                        >
                                            <RefreshCw size={13} />
                                        </button>
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

                                <div className="agent-msg-assistant px-4 py-3.5 space-y-3 min-w-[220px]">
                                    <RouteThinking
                                        label={activeTool ? 'Running tools' : 'Plotting a route'}
                                    />

                                    {toolSteps && (
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            <AnimatePresence mode="wait">
                                                <Motion.span
                                                    key={stepIndex}
                                                    initial={{ opacity: 0, y: 6 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -6 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <StepChip icon={toolIcon} label={`${toolSteps[stepIndex]}…`} />
                                                </Motion.span>
                                            </AnimatePresence>
                                            <span className="font-data text-[9px] uppercase tracking-[0.16em] text-ivory-faint">
                                                step {stepIndex + 1}/{toolSteps.length}
                                            </span>
                                        </div>
                                    )}

                                    <span className="agent-route-live block w-44" aria-hidden="true" />
                                </div>
                            </Motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div ref={messagesEndRef} />
            </div>

            {/* ══════════ Composer ══════════ */}
            <div className="relative z-10 px-4 md:px-8 pt-3 pb-4 border-t border-white/[0.07] bg-ink-950/40">

                {/* While dictating, the orb takes over the composer's airspace.
                    It sits above the field rather than replacing it so the text
                    you have already typed stays visible behind the decision. */}
                <AnimatePresence>
                    {listening && (
                        <Motion.div
                            initial={{ opacity: 0, y: 14, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.97 }}
                            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                            className="absolute inset-x-4 md:inset-x-8 bottom-full mb-3 z-20 overflow-hidden
                                       rounded-[22px] border border-saffron/25 bg-ink-900/[0.97] backdrop-blur-xl
                                       shadow-[0_20px_60px_rgba(6,20,18,0.75)]"
                            role="status"
                            aria-live="polite"
                        >
                            <div className="flex items-center gap-5 px-5 py-4">
                                <ListeningOrb level={getLevel} size={92} className="shrink-0" />

                                <div className="min-w-0 flex-1">
                                    <p className="eyebrow mb-1.5">Listening</p>
                                    <p className="font-sans text-[14.5px] leading-relaxed text-ivory min-h-[1.4em]">
                                        {interim || (
                                            <span className="text-ivory-faint">
                                                Say where you want to go — I&apos;m writing it down.
                                            </span>
                                        )}
                                    </p>
                                    <p className="mt-2 font-data text-[9.5px] uppercase tracking-[0.18em] text-ivory-faint">
                                        Pauses are fine · stops on its own after a silence
                                    </p>
                                </div>

                                <button
                                    onClick={stopDictation}
                                    className="btn-ghost shrink-0 !px-4 !py-2 text-[12.5px]"
                                >
                                    Done
                                </button>
                            </div>
                        </Motion.div>
                    )}
                </AnimatePresence>

                {speechError && !listening && (
                    <p className="mb-2 font-sans text-[12.5px] text-danger-bright" role="alert">
                        {speechError}
                    </p>
                )}

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
                        onClick={toggleDictation}
                        disabled={!speechSupported || isLoading}
                        className={`agent-icon-btn relative p-2 mb-0.5 shrink-0 ${listening ? 'text-ink-950 border-saffron bg-saffron' : ''
                            } ${micStarting ? 'text-saffron border-saffron/50' : ''
                            } ${!speechSupported ? 'opacity-40 cursor-not-allowed' : ''}`}
                        aria-label={
                            !speechSupported
                                ? 'Voice input is not available in this browser'
                                : listening
                                    ? 'Stop dictating'
                                    : micStarting
                                        ? 'Waiting for microphone access'
                                        : 'Dictate your message'
                        }
                        title={speechSupported ? undefined : 'This browser has no speech recognition'}
                        aria-pressed={listening}
                    >
                        {(listening || micStarting) && !reduce && (
                            <span
                                className={`absolute inset-0 rounded-xl border border-saffron ${listening ? 'animate-ping opacity-60' : 'animate-pulse opacity-40'
                                    }`}
                                aria-hidden="true"
                            />
                        )}
                        <Mic size={17} />
                    </button>

                    <span className="relative mb-0.5 shrink-0">
                        {/* Gold ring pulse on dispatch */}
                        <AnimatePresence>
                            {justSent && !reduce && (
                                <Motion.span
                                    initial={{ opacity: 0.6, scale: 1 }}
                                    animate={{ opacity: 0, scale: 1.9 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.5, ease: 'easeOut' }}
                                    className="absolute inset-0 rounded-full border border-saffron pointer-events-none"
                                    aria-hidden="true"
                                />
                            )}
                        </AnimatePresence>

                        <Motion.button
                            whileTap={canSend ? { scale: 0.92 } : undefined}
                            onClick={handleSend}
                            disabled={!canSend}
                            className="agent-send"
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
                        </Motion.button>
                    </span>
                </div>

                <p className="mt-2.5 text-center font-data text-[9.5px] uppercase tracking-[0.18em] text-ivory-faint">
                    SafarX Agent · Enter to send · Shift + Enter for a new line
                </p>
            </div>
        </div>
    );
};

export default Chat;
