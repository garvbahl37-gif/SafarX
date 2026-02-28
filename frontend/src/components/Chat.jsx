import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send,
    Mic,
    MapPin,
    Plane,
    Compass,
    User,
    Bot,
    Plus,
    Globe,
    Zap,
    Hotel,
    Sparkles,
} from 'lucide-react';
import { sendMessage } from '../api';

const Chat = ({ onSearchResults, onOpenFlightPanel, onOpenHotelPanel }) => {

    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'ai',
            content: "Hello, traveler! 🌍✨\n\nI'm **Safar**, your AI travel companion. I can help you discover amazing destinations, plan detailed itineraries, and even show you places in immersive 3D.\n\nWhere shall we explore today?",
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: input,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        const lower = input.toLowerCase();
        const flightKeywords = /book.*flight|flight.*book|book.*ticket|fly\s+to|flights?\s+(to|from)|search.*flight/;
        const hotelKeywords = /book.*hotel|hotel.*book|find.*hotel|stay\s+in|accommodation|where.*stay|search.*hotel/;
        if (flightKeywords.test(lower)) onOpenFlightPanel?.();
        else if (hotelKeywords.test(lower)) onOpenHotelPanel?.();

        try {
            const response = await sendMessage(input);
            const aiMessage = {
                id: Date.now() + 1,
                type: 'ai',
                content: response.response,
                search_results: response.search_results,
                itinerary: response.itinerary,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMessage]);

            if (response.search_results) onSearchResults?.(response.search_results);
        } catch (error) {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                type: 'ai',
                content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
                isError: true,
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const suggestions = [
        { icon: <Compass size={14} />, text: "Plan a trip to Bali", gradient: "from-emerald-400 to-teal-500", bg: "bg-gradient-to-br from-emerald-50 to-teal-50", border: "border-emerald-200" },
        { icon: <MapPin size={14} />, text: "Hidden gems in Italy", gradient: "from-rose-400 to-orange-400", bg: "bg-gradient-to-br from-rose-50 to-orange-50", border: "border-rose-200" },
        { icon: <Plane size={14} />, text: "Weekend in Tokyo", gradient: "from-violet-400 to-purple-500", bg: "bg-gradient-to-br from-violet-50 to-purple-50", border: "border-violet-200" },
    ];

    const formatMessage = (content) => {
        return content
            .replace(/\n/g, '<br/>')
            .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-sky-700">$1</strong>');
    };

    return (
        <div className="flex flex-col h-full relative overflow-hidden">

            {/* Decorative background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-20"
                    style={{ background: 'radial-gradient(circle, #0EA5E9, transparent 70%)' }} />
                <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full opacity-15"
                    style={{ background: 'radial-gradient(circle, #8B5CF6, transparent 70%)' }} />
            </div>

            {/* Chat Header */}
            <div className="relative p-4 md:p-5 border-b border-white/60"
                style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(240,249,255,0.95) 100%)' }}>

                {/* Rainbow top line */}
                <div className="absolute top-0 left-0 right-0 h-0.5"
                    style={{ background: 'linear-gradient(90deg, #0EA5E9, #8B5CF6, #EC4899, #F97316, #10B981)' }} />

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <motion.div
                            className="relative"
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                        >
                            {/* Glow ring */}
                            <div className="absolute inset-0 rounded-xl opacity-40 blur-md"
                                style={{ background: 'linear-gradient(135deg, #0EA5E9, #8B5CF6)' }} />
                            <div className="relative w-11 h-11 rounded-xl flex items-center justify-center shadow-lg"
                                style={{ background: 'linear-gradient(135deg, #0EA5E9 0%, #8B5CF6 100%)' }}>
                                <Bot size={20} className="text-white" />
                            </div>
                            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white shadow-sm" />
                        </motion.div>
                        <div>
                            <h3 className="font-bold text-xl" style={{ color: '#0f172a' }}>
                                Safar<span style={{ color: '#0EA5E9' }}>X</span>
                                <span className="ml-1.5 text-xs font-semibold px-2 py-0.5 rounded-full"
                                    style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.12), rgba(139,92,246,0.12))', color: '#7C3AED', border: '1px solid rgba(139,92,246,0.2)' }}>
                                    AI
                                </span>
                            </h3>
                            <p className="text-xs flex items-center gap-1.5" style={{ color: '#64748b' }}>
                                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                Online & ready to explore
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2 rounded-xl transition-all"
                            style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.9)' }}
                        >
                            <Globe size={15} style={{ color: '#64748b' }} />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2 rounded-xl transition-all"
                            style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.9)' }}
                        >
                            <Sparkles size={15} style={{ color: '#F59E0B' }} />
                        </motion.button>

                        <div className="w-px h-5 mx-0.5" style={{ background: 'rgba(0,0,0,0.08)' }} />

                        {/* Flight Button */}
                        <motion.button
                            whileHover={{ scale: 1.06, y: -1 }}
                            whileTap={{ scale: 0.94 }}
                            onClick={() => onOpenFlightPanel?.()}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                            style={{
                                background: 'linear-gradient(135deg, rgba(14,165,233,0.12) 0%, rgba(56,189,248,0.08) 100%)',
                                border: '1.5px solid rgba(14,165,233,0.25)',
                                color: '#0284C7',
                                boxShadow: '0 2px 8px rgba(14,165,233,0.15)',
                            }}
                        >
                            <Plane size={13} />
                            <span>Flights</span>
                        </motion.button>

                        {/* Hotel Button */}
                        <motion.button
                            whileHover={{ scale: 1.06, y: -1 }}
                            whileTap={{ scale: 0.94 }}
                            onClick={() => onOpenHotelPanel?.()}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                            style={{
                                background: 'linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(167,139,250,0.08) 100%)',
                                border: '1.5px solid rgba(139,92,246,0.25)',
                                color: '#7C3AED',
                                boxShadow: '0 2px 8px rgba(139,92,246,0.15)',
                            }}
                        >
                            <Hotel size={13} />
                            <span>Hotels</span>
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-5 scrollbar-hide"
                style={{ background: 'linear-gradient(180deg, rgba(240,249,255,0.3) 0%, rgba(255,255,255,0.1) 100%)' }}>
                <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 16, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
                            className={`flex gap-3 ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                        >
                            {/* Avatar */}
                            <motion.div
                                className="flex-shrink-0"
                                whileHover={{ scale: 1.1 }}
                                transition={{ type: 'spring', stiffness: 400 }}
                            >
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm ${msg.type === 'user'
                                    ? 'text-white'
                                    : ''
                                    }`}
                                    style={msg.type === 'user'
                                        ? { background: 'linear-gradient(135deg, #0EA5E9, #8B5CF6)', boxShadow: '0 4px 12px rgba(14,165,233,0.3)' }
                                        : { background: 'rgba(255,255,255,0.9)', border: '1.5px solid rgba(14,165,233,0.2)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }
                                    }
                                >
                                    {msg.type === 'user'
                                        ? <User size={15} className="text-white" />
                                        : <Bot size={15} style={{ color: '#0EA5E9' }} />
                                    }
                                </div>
                            </motion.div>

                            {/* Message Content */}
                            <div className={`flex flex-col gap-1.5 max-w-[85%] ${msg.type === 'user' ? 'items-end' : 'items-start'}`}>
                                <motion.div
                                    className={`relative px-4 py-3 rounded-2xl ${msg.type === 'user'
                                        ? 'message-user rounded-tr-md text-white'
                                        : 'message-ai rounded-tl-md'
                                        } ${msg.isError ? 'ring-1 ring-red-300' : ''}`}
                                    whileHover={{ scale: 1.01 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                >
                                    <div
                                        className={`text-sm leading-relaxed ${msg.type === 'user' ? 'text-white' : 'text-slate-700'}`}
                                        dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                                    />
                                </motion.div>

                                {/* Timestamp */}
                                <span className="text-[10px] px-1" style={{ color: '#94a3b8' }}>
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </motion.div>
                    ))}

                    {/* Typing Indicator */}
                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex gap-3"
                        >
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                                style={{ background: 'rgba(255,255,255,0.9)', border: '1.5px solid rgba(14,165,233,0.2)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                                <Bot size={15} style={{ color: '#0EA5E9' }} />
                            </div>
                            <div className="px-4 py-3.5 rounded-2xl rounded-tl-md message-ai">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full typing-dot"
                                        style={{ background: 'linear-gradient(135deg, #0EA5E9, #06B6D4)' }} />
                                    <span className="w-2.5 h-2.5 rounded-full typing-dot"
                                        style={{ background: 'linear-gradient(135deg, #8B5CF6, #A78BFA)' }} />
                                    <span className="w-2.5 h-2.5 rounded-full typing-dot"
                                        style={{ background: 'linear-gradient(135deg, #10B981, #34D399)' }} />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="relative p-4 md:p-5 border-t border-white/60"
                style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(248,250,252,0.95) 100%)' }}>

                {/* Suggestion Chips */}
                <AnimatePresence>
                    {messages.length < 3 && (
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide"
                        >
                            {suggestions.map((s, i) => (
                                <motion.button
                                    key={i}
                                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ delay: i * 0.08, type: 'spring', stiffness: 300 }}
                                    whileHover={{ scale: 1.04, y: -2 }}
                                    whileTap={{ scale: 0.96 }}
                                    onClick={() => setInput(s.text)}
                                    className={`chip whitespace-nowrap ${s.bg} ${s.border}`}
                                    style={{ border: `1.5px solid` }}
                                >
                                    <span className={`p-1 rounded-lg bg-gradient-to-br ${s.gradient} text-white`}>
                                        {s.icon}
                                    </span>
                                    <span className="text-slate-600 font-medium">{s.text}</span>
                                </motion.button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Input Container */}
                <div className="relative">
                    {/* Focus glow */}
                    <div className="absolute -inset-0.5 rounded-2xl opacity-0 focus-within:opacity-100 transition-opacity duration-500 blur-sm"
                        style={{ background: 'linear-gradient(135deg, #0EA5E9, #8B5CF6, #06B6D4)' }} />

                    <div className="relative flex items-center gap-2 p-2 rounded-2xl"
                        style={{
                            background: 'rgba(255,255,255,0.9)',
                            border: '1.5px solid rgba(255,255,255,0.95)',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,1)',
                        }}>

                        {/* Attachment */}
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 45 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 rounded-xl transition-colors"
                            style={{ background: 'rgba(14,165,233,0.08)', color: '#0EA5E9' }}
                        >
                            <Plus size={18} />
                        </motion.button>

                        {/* Text Input */}
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                            placeholder="Ask me anything about travel..."
                            className="flex-1 bg-transparent border-none focus:outline-none text-sm px-2 font-medium"
                            style={{ color: '#1e293b' }}
                            disabled={isLoading}
                        />

                        {/* Voice */}
                        <motion.button
                            whileTap={{ scale: 0.92 }}
                            whileHover={{ scale: 1.08 }}
                            onClick={() => setIsRecording(!isRecording)}
                            className="p-2 rounded-xl transition-all"
                            style={isRecording
                                ? { background: 'rgba(249,115,22,0.12)', color: '#F97316' }
                                : { background: 'rgba(100,116,139,0.08)', color: '#64748b' }
                            }
                        >
                            <Mic size={18} />
                        </motion.button>

                        {/* Send */}
                        <motion.button
                            whileHover={{ scale: 1.06 }}
                            whileTap={{ scale: 0.94 }}
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading}
                            className="p-3 rounded-xl text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{
                                background: input.trim() && !isLoading
                                    ? 'linear-gradient(135deg, #0EA5E9, #8B5CF6)'
                                    : 'rgba(148,163,184,0.3)',
                                boxShadow: input.trim() && !isLoading
                                    ? '0 4px 16px rgba(14,165,233,0.4)'
                                    : 'none',
                            }}
                        >
                            <Send size={17} />
                        </motion.button>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-[10px] mt-3 font-medium" style={{ color: '#94a3b8' }}>
                    ✨ SafarX AI · Verify important travel information independently
                </p>
            </div>
        </div>
    );
};

export default Chat;