import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Lock, UserPlus } from 'lucide-react';
import Avatar from './Avatar';
import { useGroups } from '../../hooks/social/useGroups';

/**
 * Who is actually going.
 *
 * Every face here belongs to somebody who joined — the photograph comes from
 * their Clerk profile, looked up server-side, and the fallback initials are
 * drawn locally from the palette. Nothing is generated to fill the grid.
 *
 * The roster is only served to members, so the sign-in prompt below is what a
 * visitor sees rather than a directory of strangers' names and faces.
 */

const joinedWhen = (iso) => {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

const GroupMembers = ({ group, isJoined }) => {
  const { getGroup, signedIn } = useGroups();
  const [members, setMembers] = useState([]);
  const [ready, setReady] = useState(false);

  const load = useCallback(async () => {
    try {
      const full = await getGroup(group.groupId);
      setMembers(full?.members || []);
    } catch {
      setMembers([]);
    } finally {
      setReady(true);
    }
  }, [getGroup, group.groupId]);

  useEffect(() => { load(); }, [load]);

  const seatsTaken = group.memberCount || 0;
  const capacity = group.maxMembers || 0;
  /* Travellers who signed up before SafarX existed are a number, not a row —
     so the count and the faces deliberately do not have to match. */
  const beforeSafarX = Math.max(0, seatsTaken - members.length);

  if (!isJoined) {
    return (
      <div className="rounded-2xl border border-white/[0.08] bg-ink-900/50 p-10 text-center">
        <Lock size={20} className="mx-auto mb-4 text-saffron/70" aria-hidden="true" />
        <p className="font-display text-[1.35rem] text-ivory">
          {seatsTaken} travelling, {Math.max(0, capacity - seatsTaken)} places left
        </p>
        <p className="mx-auto mt-2 max-w-sm font-sans text-[14px] leading-relaxed text-ivory-muted">
          {signedIn
            ? 'Join the group and you will see who else is going.'
            : 'Sign in and join the group to see who else is going.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <p className="eyebrow whitespace-nowrap">
          {seatsTaken} of {capacity} travelling
        </p>
        <span className="route-line flex-1" aria-hidden="true" />
      </div>

      {!ready && <p className="font-sans text-[13.5px] text-ivory-faint">Loading the group…</p>}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((m, i) => (
          <motion.div
            key={m.userId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.3), ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-ink-900/50 p-4"
          >
            <Avatar src={m.avatar} name={m.name} size={42} />
            <div className="min-w-0">
              <p className="truncate font-sans text-[14.5px] text-ivory">{m.name || 'Traveller'}</p>
              <p className="mt-0.5 flex items-center gap-1.5 font-data text-[9.5px] uppercase tracking-[0.16em] text-ivory-faint">
                {m.role === 'organiser' && <Crown size={10} className="text-saffron" aria-hidden="true" />}
                {m.role === 'organiser' ? 'Organiser' : 'Member'}
                {joinedWhen(m.joinedAt) ? ` · joined ${joinedWhen(m.joinedAt)}` : ''}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {ready && !members.length && (
        <div className="rounded-2xl border border-dashed border-white/[0.12] bg-ink-900/30 p-8 text-center">
          <UserPlus size={18} className="mx-auto mb-3 text-saffron/70" aria-hidden="true" />
          <p className="font-sans text-[14px] text-ivory-muted">
            You are the first here from SafarX. The rest of the group booked before we existed.
          </p>
        </div>
      )}

      {Boolean(beforeSafarX) && Boolean(members.length) && (
        <p className="font-sans text-[13px] text-ivory-faint">
          Plus {beforeSafarX} traveller{beforeSafarX > 1 ? 's' : ''} who booked before SafarX — they are
          on the operator's list rather than here.
        </p>
      )}
    </div>
  );
};

export default GroupMembers;
