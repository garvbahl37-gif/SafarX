import React, { useState } from 'react';
import { Pin, MessageCircle, ThumbsUp, PlusCircle, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ThreadCard = ({ thread, isPinned }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-5 bg-white rounded-xl border ${isPinned ? 'border-sky-100 bg-sky-50/10' : 'border-gray-100'} hover:border-sky-500/30 hover:shadow-md transition-all cursor-pointer group dark:bg-[#121622] dark:border-white/5 dark:hover:border-white/20`}
    >
        <div className="flex items-start gap-4">

            {/* Author Avatar */}
            <img
                src={thread.authorAvatar}
                alt={thread.author}
                className="w-10 h-10 rounded-full object-cover border border-gray-100 shadow-sm"
            />

            <div className="flex-1 min-w-0">
                {isPinned && (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-sky-500 mb-2 uppercase tracking-wide dark:text-cyan-400">
                        <Pin size={10} className="fill-current" /> Pinned
                    </div>
                )}

                <h3 className="text-base font-bold text-gray-900 mb-1 group-hover:text-sky-500 transition-colors line-clamp-1 dark:text-white dark:group-hover:text-cyan-400">
                    {thread.title}
                </h3>

                <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mb-3 font-medium dark:text-gray-400">
                    {thread.preview}
                </p>

                <div className="flex items-center justify-between text-[11px] text-gray-400 font-medium">
                    <div className="flex items-center gap-3">
                        <span className="text-gray-900 dark:text-gray-300">by {thread.author}</span>
                        <span className="dark:text-gray-500">• {thread.date}</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 hover:text-cyan-500 transition-colors dark:hover:text-cyan-400">
                            <MessageCircle size={12} />
                            <span>{thread.replies}</span>
                        </div>
                        <div className="flex items-center gap-1 hover:text-sky-500 transition-colors dark:hover:text-sky-400">
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
                authorAvatar: `https://ui-avatars.com/api/?name=${group.name.substring(0, 2)}&background=0ea5e9&color=fff`,
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
            authorAvatar: 'https://ui-avatars.com/api/?name=You&background=06b6d4&color=fff',
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
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight dark:text-white">Discussions</h2>
                    <p className="text-sm text-gray-500 font-medium dark:text-gray-400">Join the conversation</p>
                </div>
            </div>

            {/* Compact Creation Form */}
            <div className="mb-8">
                {!isExpanded ? (
                    <motion.div
                        layoutId="create-box"
                        onClick={() => setIsExpanded(true)}
                        className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:border-gray-300 hover:shadow-sm transition-all shadow-sm dark:bg-[#121622] dark:border-white/5 dark:hover:border-white/20"
                    >
                        <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden border border-gray-200 dark:border-transparent">
                            <img src="https://ui-avatars.com/api/?name=You&background=random" alt="You" />
                        </div>
                        <div className="flex-1 bg-gray-50 rounded-full h-10 flex items-center px-4 text-sm text-gray-400 font-medium dark:bg-white/5 dark:text-gray-500">
                            Start a new discussion...
                        </div>
                        <button className="p-2 bg-gray-50 text-gray-400 rounded-full hover:bg-gray-100 hover:text-gray-600 dark:bg-white/5 dark:hover:bg-white/10 dark:hover:text-gray-300">
                            <PlusCircle size={20} />
                        </button>
                    </motion.div>
                ) : (
                    <motion.form
                        layoutId="create-box"
                        className="bg-white border border-gray-200 rounded-xl p-4 shadow-lg ring-1 ring-black/5 dark:bg-[#121622] dark:border-white/5 dark:ring-0"
                        onSubmit={handlePost}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Create New Topic</h3>
                            <button type="button" onClick={() => setIsExpanded(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                <X size={18} />
                            </button>
                        </div>

                        <input
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-bold text-gray-900 focus:bg-white focus:border-cyan-500 outline-none mb-3 transition-colors placeholder-gray-400 dark:bg-[#0B0E14] dark:border-white/10 dark:text-white dark:focus:border-cyan-500/50"
                            placeholder="Topic Title"
                            value={newTopic.title}
                            onChange={e => setNewTopic({ ...newTopic, title: e.target.value })}
                            autoFocus
                        />

                        <textarea
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 focus:bg-white focus:border-cyan-500 outline-none mb-4 resize-none h-24 transition-colors placeholder-gray-400 dark:bg-[#0B0E14] dark:border-white/10 dark:text-gray-300 dark:focus:border-cyan-500/50"
                            placeholder="What's on your mind?"
                            value={newTopic.content}
                            onChange={e => setNewTopic({ ...newTopic, content: e.target.value })}
                        />

                        <div className="flex items-center justify-between border-t border-gray-100 pt-3 dark:border-white/5">
                            <div className="text-xs text-gray-400 font-medium">
                                Posting to <span className="text-gray-900 font-bold dark:text-white">{group.name}</span>
                            </div>
                            <button
                                type="submit"
                                disabled={!newTopic.title || !newTopic.content}
                                className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-sky-600 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg text-xs font-bold hover:from-sky-600 hover:to-sky-700 transition-colors shadow-md shadow-sky-500/30 dark:disabled:from-white/10 dark:disabled:to-white/10 dark:disabled:text-white/30"
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
