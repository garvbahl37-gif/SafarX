import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Lock, AlertCircle } from 'lucide-react';
import Avatar from './Avatar';
import { useGroups } from '../../hooks/social/useGroups';

/**
 * The group's conversation.
 *
 * Messages are rows, not component state: leave the page, come back, and the
 * conversation is still there — and so is everyone else's half of it. Only
 * members can read or post, which the server enforces rather than the UI.
 *
 * Polling rather than sockets, deliberately. A trip conversation moves at the
 * speed of people deciding where to eat, and five seconds of latency costs
 * nothing next to a socket that has to be held open, reconnected and paid for.
 */

const POLL_MS = 5000;

/** "14:32" for today, "12 Oct" for anything older. */
const when = (iso) => {
  const at = new Date(iso);
  const sameDay = new Date().toDateString() === at.toDateString();
  return sameDay
    ? at.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })
    : at.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

const GroupChat = ({ group, isJoined }) => {
  const { getMessages, sendMessage, signedIn } = useGroups();
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [ready, setReady] = useState(false);
  const endRef = useRef(null);
  const atBottomRef = useRef(true);

  const load = useCallback(async () => {
    if (!isJoined) return;
    try {
      setMessages(await getMessages(group.groupId));
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setReady(true);
    }
  }, [getMessages, group.groupId, isJoined]);

  useEffect(() => {
    load();
    if (!isJoined) return undefined;
    const timer = setInterval(load, POLL_MS);
    return () => clearInterval(timer);
  }, [load, isJoined]);

  /* Follow the conversation only if the reader is already at the bottom —
     yanking someone away from what they were reading is worse than a
     notification they can act on when they choose. */
  useEffect(() => {
    if (atBottomRef.current) endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  const onScroll = (e) => {
    const el = e.currentTarget;
    atBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  const submit = async (e) => {
    e.preventDefault();
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    setError(null);
    setDraft('');
    try {
      await sendMessage(group.groupId, body);
      atBottomRef.current = true;
      await load();
    } catch (err) {
      setError(err.message);
      setDraft(body); // give them their words back
    } finally {
      setSending(false);
    }
  };

  if (!isJoined) {
    return (
      <div className="rounded-2xl border border-white/[0.08] bg-ink-900/50 p-10 text-center">
        <Lock size={20} className="mx-auto mb-4 text-saffron/70" aria-hidden="true" />
        <p className="font-display text-[1.35rem] text-ivory">Members only</p>
        <p className="mx-auto mt-2 max-w-sm font-sans text-[14px] leading-relaxed text-ivory-muted">
          {signedIn
            ? 'Join the group and the conversation opens up.'
            : 'Sign in and join the group to read what everyone is planning.'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-[min(60vh,520px)] flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-ink-900/50">
      <div onScroll={onScroll} className="flex-1 space-y-4 overflow-y-auto p-5">
        {!ready && <p className="eyebrow-muted text-center">Loading the conversation…</p>}

        {ready && !messages.length && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <span className="route-line mb-5 w-24" aria-hidden="true" />
            <p className="font-display text-[1.3rem] text-ivory">Nobody has said anything yet</p>
            <p className="mt-2 max-w-xs font-sans text-[13.5px] text-ivory-muted">
              Open with where you are coming from and when you land.
            </p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className={`flex gap-3 ${m.mine ? 'flex-row-reverse' : ''}`}
            >
              <Avatar src={m.avatar} name={m.name} size={30} />
              <div className={`max-w-[76%] ${m.mine ? 'text-right' : ''}`}>
                <p className="mb-1 font-data text-[9.5px] uppercase tracking-[0.16em] text-ivory-faint">
                  {m.mine ? 'You' : m.name || 'Traveller'} · {when(m.at)}
                </p>
                <p
                  className={`inline-block whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2.5 text-left font-sans text-[14px] leading-relaxed ${
                    m.mine
                      ? 'bg-saffron/[0.14] text-ivory shadow-[inset_0_0_0_1px_rgba(212,168,67,0.28)]'
                      : 'bg-white/[0.05] text-ivory-muted shadow-[inset_0_0_0_1px_rgba(242,239,230,0.07)]'
                  }`}
                >
                  {m.body}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={endRef} />
      </div>

      {error && (
        <p role="alert" className="flex items-center gap-2 border-t border-[#E05252]/25 bg-[#E05252]/[0.07] px-5 py-2.5 font-sans text-[13px] text-[#F0A8A8]">
          <AlertCircle size={14} aria-hidden="true" />
          {error}
        </p>
      )}

      <form onSubmit={submit} className="flex items-center gap-2 border-t border-white/[0.07] p-3">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Say something to the group"
          aria-label="Message the group"
          maxLength={2000}
          className="glass-input flex-1 !py-2.5"
        />
        <button
          type="submit"
          disabled={!draft.trim() || sending}
          aria-label="Send"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-saffron-bright to-saffron text-ink-950 transition-opacity disabled:opacity-40"
        >
          <Send size={15} aria-hidden="true" />
        </button>
      </form>
    </div>
  );
};

export default GroupChat;
