import React, { useState } from 'react';
import { Pin, MessageCircle, ThumbsUp, PlusCircle, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ThreadCard = ({ thread, isPinned }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-5 bg-ink-800 rounded-xl border ${isPinned ? 'border-saffron/20' : 'border-white/[0.07]'} hover:border-saffron/35 hover:bg-ink-700 transition-all cursor-pointer group`}
    >
        <div className="flex items-start gap-4">

            {/* Author Avatar */}
            <img
                src={thread.authorAvatar}
                alt={thread.author}
                className="w-10 h-10 rounded-full object-cover border border-white/[0.07] shadow-sm"
            />

            <div className="flex-1 min-w-0">
                {isPinned && (
                    <div className="flex items-center gap-1 text-[10px] font-data font-bold text-saffron mb-2 uppercase tracking-wide">
                        <Pin size={10} className="fill-current" /> Pinned
                    </div>
                )}

                <h3 className="text-base font-bold text-ivory mb-1 group-hover:text-saffron transition-colors line-clamp-1">
                    {thread.title}
                </h3>

                <p className="text-ivory-muted text-xs leading-relaxed line-clamp-2 mb-3 font-medium">
                    {thread.preview}
                </p>

                <div className="flex items-center justify-between text-[11px] text-ivory-faint font-medium">
                    <div className="flex items-center gap-3">
                        <span className="text-ivory-muted">by {thread.author}</span>
                        <span>• {thread.date}</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 hover:text-saffron transition-colors">
                            <MessageCircle size={12} />
                            <span>{thread.replies}</span>
                        </div>
                        <div className="flex items-center gap-1 hover:text-saffron transition-colors">
                            <ThumbsUp size={12} />
                            <span>{thread.likes}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </motion.div>
);

const GroupDiscussions = ({ group }) => {
    // Use group ID to seed data or fetch real data
    const [threads, setThreads] = useState([]);

    // Reset/Fetch threads when group changes
    React.useEffect(() => {
        // In a real app, fetch from API. Here, reset to mock data seeded with group ID.
        setThreads([
            {
                id: 1,
                title: `Welcome to ${group.name}!`,
                preview: 'We are so excited to have you here. This group is all about connecting with people who share your interests.',
                author: 'Admin',
                authorAvatar: `https://ui-avatars.com/api/?name=${group.name.substring(0, 2)}&background=D4A843&color=fff`,
                date: '2 days ago',
                replies: Math.floor(Math.random() * 50),
                likes: Math.floor(Math.random() * 200),
                pinned: true
            },
            {
                id: 2,
                title: `Tips for visiting ${group.destination?.city || 'this place'}?`,
                preview: 'I am planning to go next week but heard line waiting times are crazy.',
                author: 'Sarah M.',
                authorAvatar: 'https://i.pravatar.cc/150?u=32',
                date: '5 hours ago',
                replies: 8,
                likes: 12,
                pinned: false
            }
        ]);
    }, [group.groupId]);

    const [isExpanded, setIsExpanded] = useState(false);
    const [newTopic, setNewTopic] = useState({ title: '', content: '' });

    const handlePost = (e) => {
        e.preventDefault();
        if (!newTopic.title || !newTopic.content) return;

        const newThread = {
            id: Date.now(),
            title: newTopic.title,
            preview: newTopic.content,
            author: 'You',
            authorAvatar: 'https://ui-avatars.com/api/?name=You&background=D4A843&color=fff',
            date: 'Just now',
            replies: 0,
            likes: 0,
            pinned: false
        };

        setThreads([newThread, ...threads]);
        setNewTopic({ title: '', content: '' });
        setIsExpanded(false);
    };

    return (
        <div className="max-w-4xl mx-auto py-6 px-4">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-display font-semibold text-ivory tracking-tight">Discussions</h2>
                    <p className="text-sm text-ivory-muted font-medium">Join the conversation</p>
                </div>
            </div>

            {/* Compact Creation Form */}
            <div className="mb-8">
                {!isExpanded ? (
                    <motion.div
                        layoutId="create-box"
                        onClick={() => setIsExpanded(true)}
                        className="bg-ink-800 border border-white/[0.07] rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:border-saffron/35 transition-all"
                    >
                        <div className="w-10 h-10 rounded-full bg-white/[0.06] overflow-hidden border border-white/[0.07]">
                            <img src="https://ui-avatars.com/api/?name=You&background=random" alt="You" />
                        </div>
                        <div className="flex-1 bg-white/[0.04] rounded-full h-10 flex items-center px-4 text-sm text-ivory-faint font-medium">
                            Start a new discussion...
                        </div>
                        <button className="p-2 bg-white/[0.04] text-ivory-faint rounded-full hover:bg-white/[0.08] hover:text-ivory-muted transition-colors" aria-label="New discussion">
                            <PlusCircle size={20} />
                        </button>
                    </motion.div>
                ) : (
                    <motion.form
                        layoutId="create-box"
                        className="bg-ink-800 border border-white/[0.07] rounded-xl p-4 shadow-lg"
                        onSubmit={handlePost}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-sm font-bold text-ivory">Create New Topic</h3>
                            <button type="button" onClick={() => setIsExpanded(false)} className="text-ivory-faint hover:text-ivory-muted" aria-label="Close form">
                                <X size={18} />
                            </button>
                        </div>

                        <input
                            className="glass-input w-full text-sm font-bold mb-3"
                            placeholder="Topic Title"
                            value={newTopic.title}
                            onChange={e => setNewTopic({ ...newTopic, title: e.target.value })}
                            autoFocus
                        />

                        <textarea
                            className="glass-input w-full text-sm mb-4 resize-none h-24"
                            placeholder="What's on your mind?"
                            value={newTopic.content}
                            onChange={e => setNewTopic({ ...newTopic, content: e.target.value })}
                        />

                        <div className="flex items-center justify-between border-t border-white/[0.07] pt-3">
                            <div className="text-xs text-ivory-faint font-medium">
                                Posting to <span className="text-ivory font-bold">{group.name}</span>
                            </div>
                            <button
                                type="submit"
                                disabled={!newTopic.title || !newTopic.content}
                                className="flex items-center gap-2 bg-gradient-to-r from-saffron-bright to-saffron disabled:from-white/10 disabled:to-white/10 disabled:text-ivory-faint disabled:cursor-not-allowed text-ink-950 px-6 py-2 rounded-lg text-xs font-bold hover:from-saffron hover:to-saffron-bright transition-colors shadow-md shadow-saffron/20"
                            >
                                Post Topic <Send size={12} />
                            </button>
                        </div>
                    </motion.form>
                )}
            </div>

            <div className="space-y-3">
                {threads.map(thread => (
                    <ThreadCard key={thread.id} thread={thread} isPinned={thread.pinned} />
                ))}
            </div>

        </div>
    );
};

export default GroupDiscussions;
