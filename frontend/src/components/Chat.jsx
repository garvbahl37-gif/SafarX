import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send,
    Mic,
    Sparkles,
    MapPin,
    Plane,
    Compass,
    User,
    Bot,
    Plus,
    Image,
    Paperclip,
    Globe,
    Zap
} from 'lucide-react';
import { sendMessage } from '../api';

const Chat = ({ onItineraryUpdate, onSearchResults }) => {

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


            if (response.itinerary) onItineraryUpdate?.(response.itinerary);
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
        { icon: <Compass size={14} />, text: "Plan a trip to Bali", color: "from-teal to-emerald" },
        { icon: <MapPin size={14} />, text: "Hidden gems in Italy", color: "from-coral to-rose" },
        { icon: <Plane size={14} />, text: "Weekend in Tokyo", color: "from-violet to-purple-400" },
    ];

    const formatMessage = (content) => {
        return content
            .replace(/\n/g, '<br/>')
            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
    };

    return (
        <div className="flex flex-col h-full relative">

            {/* Chat Header */}
            <div className="p-4 md:p-5 border-b border-white/5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal to-ocean flex items-center justify-center">
                                <Bot size={20} className="text-white" />
                            </div>
                            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald rounded-full border-2 border-slate-900" />
                        </div>
                        <div>
                            <h3 className="text-white font-semibold text-xl">Safar<span className="text-teal">X</span> </h3>
                            <p className="text-slate-400 text-xs flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-emerald rounded-full animate-pulse" />
                                Online & ready
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        <button className="p-2 rounded-lg hover:bg-white/5 transition-colors text-slate-400 hover:text-white">
                            <Globe size={16} />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-white/5 transition-colors text-slate-400 hover:text-white">
                            <Zap size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-6 scrollbar-hide">
                <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                            className={`flex gap-3 ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                        >
                            {/* Avatar */}
                            <div className="flex-shrink-0">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${msg.type === 'user'
                                    ? 'bg-gradient-to-br from-ocean to-violet'
                                    : 'bg-slate-800 border border-white/10'
                                    }`}>
                                    {msg.type === 'user'
                                        ? <User size={14} className="text-white" />
                                        : <Bot size={14} className="text-teal" />
                                    }
                                </div>
                            </div>

                            {/* Message Content */}
                            <div className={`flex flex-col gap-2 max-w-[85%] ${msg.type === 'user' ? 'items-end' : 'items-start'}`}>
                                <div
                                    className={`relative px-4 py-3 rounded-2xl ${msg.type === 'user'
                                        ? 'message-user rounded-tr-md'
                                        : 'message-ai rounded-tl-md'
                                        } ${msg.isError ? 'border-coral/50' : ''}`}
                                >
                                    <div
                                        className="text-sm leading-relaxed text-slate-200"
                                        dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                                    />
                                </div>



                                {/* Timestamp */}
                                <span className="text-[10px] text-slate-500 px-1">
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </motion.div>
                    ))}

                    {/* Typing Indicator */}
                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex gap-3"
                        >
                            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center">
                                <Bot size={14} className="text-teal" />
                            </div>
                            <div className="px-4 py-3 rounded-2xl rounded-tl-md message-ai">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 bg-teal rounded-full typing-dot" />
                                    <span className="w-2 h-2 bg-ocean rounded-full typing-dot" />
                                    <span className="w-2 h-2 bg-violet rounded-full typing-dot" />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 md:p-5 border-t border-white/5 bg-gradient-to-t from-slate-900/50 to-transparent">

                {/* Suggestion Chips */}
                <AnimatePresence>
                    {messages.length < 3 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide"
                        >
                            {suggestions.map((s, i) => (
                                <motion.button
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    onClick={() => setInput(s.text)}
                                    className="chip group whitespace-nowrap"
                                >
                                    <span className={`p-1 rounded-md bg-gradient-to-br ${s.color} text-white`}>
                                        {s.icon}
                                    </span>
                                    {s.text}
                                </motion.button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Input Container */}
                <div className="relative">
                    {/* Gradient Border Glow */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-ocean via-violet to-teal rounded-2xl opacity-0 focus-within:opacity-50 transition-opacity duration-500 blur-sm" />

                    <div className="relative glass-input flex items-center gap-2 p-2 rounded-2xl">
                        {/* Attachment Button */}
                        <button className="p-2 rounded-xl hover:bg-white/5 transition-colors text-slate-400 hover:text-white">
                            <Plus size={20} />
                        </button>

                        {/* Text Input */}
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                            placeholder="Ask me anything about travel..."
                            className="flex-1 bg-transparent border-none text-white placeholder-slate-500 focus:outline-none text-sm font-light px-2"
                            disabled={isLoading}
                        />

                        {/* Voice Button */}
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsRecording(!isRecording)}
                            className={`p-2 rounded-xl transition-all ${isRecording
                                ? 'bg-coral/20 text-coral'
                                : 'hover:bg-white/5 text-slate-400 hover:text-white'
                                }`}
                        >
                            <Mic size={20} />
                        </motion.button>

                        {/* Send Button */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading}
                            className="p-3 rounded-xl bg-gradient-to-r from-ocean to-violet text-white shadow-lg shadow-ocean/25 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all"
                        >
                            <Send size={18} />
                        </motion.button>
                    </div>
                </div>

                {/* Footer Note */}
                <p className="text-center text-[10px] text-slate-600 mt-3">
                    SafarX can make mistakes. Verify important information.
                </p>
            </div>
        </div>
    );
};

export default Chat;