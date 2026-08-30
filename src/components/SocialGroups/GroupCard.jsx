import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Check, Users } from 'lucide-react';
import Avatar from './Avatar';

/**
 * One group, as a card.
 *
 * It used to invent its own members — four generated avatars reading "L0",
 * "L1", "L2" — and a match score from Math.random() that changed on every
 * render. Everything here is now the group's actual data or it is not shown.
 *
 * The one piece of chrome that earns its place is the capacity meter: it is
 * the app's dashed route line with the taken portion filled in gold, so how
 * full a group is reads at a glance and in SafarX's own vocabulary. A group
 * that is nearly full is the single most decision-changing fact on the card.
 */

/** "15 Jan – 24 Jan" — the year only when it is not the coming one. */
const dateRange = (start, end) => {
  if (!start) return null;
  const opts = { day: 'numeric', month: 'short' };
  const from = new Date(start);
  const to = end ? new Date(end) : null;
  const thisYear = new Date().getFullYear();
  const year = from.getFullYear() !== thisYear ? ` ${from.getFullYear()}` : '';
  return to
    ? `${from.toLocaleDateString('en-IN', opts)} – ${to.toLocaleDateString('en-IN', opts)}${year}`
    : `${from.toLocaleDateString('en-IN', opts)}${year}`;
};

const GroupCard = ({ group, onClick }) => {
  const taken = group.memberCount || 0;
  const capacity = group.maxMembers || 0;
  const fullness = capacity ? Math.min(1, taken / capacity) : 0;
  const placesLeft = Math.max(0, capacity - taken);
  const members = group.members || [];
  const dates = dateRange(group.travelDates?.startDate, group.travelDates?.endDate);

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      onClick={() => onClick(group.groupId)}
      className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-ink-800 transition-colors duration-300 hover:border-saffron/35"
    >
      <div className="relative h-52 overflow-hidden bg-ink-900">
        <img
          src={group.image}
          alt=""
          aria-hidden="true"
          loading="lazy"
          onError={(e) => { e.currentTarget.style.opacity = 0; }}
          className="h-full w-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-800 via-ink-950/25 to-transparent" />

        <div className="absolute left-4 top-4 flex items-center gap-2">
          {group.verified && (
            <span className="inline-flex items-center gap-1 rounded-full border border-saffron/35 bg-ink-950/70 px-2.5 py-1 font-data text-[9.5px] uppercase tracking-[0.16em] text-saffron backdrop-blur-md">
              <Check size={10} aria-hidden="true" /> Verified
            </span>
          )}
          {group.isMember && (
            <span className="rounded-full border border-horizon/40 bg-ink-950/70 px-2.5 py-1 font-data text-[9.5px] uppercase tracking-[0.16em] text-horizon-bright backdrop-blur-md">
              Joined
            </span>
          )}
        </div>

        {dates && (
          <span className="absolute right-4 top-4 rounded-full bg-ink-950/70 px-2.5 py-1 font-data text-[9.5px] uppercase tracking-[0.14em] text-ivory-muted backdrop-blur-md">
            {dates}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="mb-2 flex items-center gap-1.5 font-data text-[9.5px] uppercase tracking-[0.18em] text-saffron">
          <MapPin size={11} aria-hidden="true" />
          {group.destination?.city}
          {group.category ? <span className="text-ivory-faint">· {group.category}</span> : null}
        </p>

        <h3 className="font-display text-[1.2rem] leading-snug text-ivory transition-colors group-hover:text-saffron-bright">
          {group.name}
        </h3>

        <p className="mt-2 line-clamp-2 font-sans text-[13.5px] font-light leading-relaxed text-ivory-faint">
          {group.description}
        </p>

        {/* How full it is — the route line, filled to the group's capacity. */}
        <div className="mt-5">
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <span className="font-data text-[9.5px] uppercase tracking-[0.16em] text-ivory-faint">
              {taken} of {capacity} travelling
            </span>
            <span className={`font-data text-[9.5px] uppercase tracking-[0.16em] ${placesLeft <= 3 ? 'text-saffron' : 'text-ivory-faint'}`}>
              {placesLeft === 0 ? 'Full' : `${placesLeft} left`}
            </span>
          </div>
          <div className="relative h-[3px] overflow-hidden rounded-full bg-white/[0.07]">
            <span
              style={{ width: `${fullness * 100}%` }}
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-saffron/70 to-saffron-bright"
            />
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          {/* Only real people appear here. */}
          {members.length ? (
            <div className="flex items-center -space-x-2">
              {members.slice(0, 4).map((m) => (
                <Avatar
                  key={m.userId}
                  src={m.avatar}
                  name={m.name}
                  size={28}
                  className="ring-2 ring-ink-800"
                />
              ))}
              {taken > 4 && (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-saffron/15 font-data text-[10px] font-bold text-saffron ring-2 ring-ink-800">
                  +{taken - 4}
                </span>
              )}
            </div>
          ) : (
            <span className="flex items-center gap-1.5 font-data text-[10px] uppercase tracking-[0.16em] text-ivory-faint">
              <Users size={12} aria-hidden="true" /> {taken} travelling
            </span>
          )}

          <span
            className={`shrink-0 rounded-full px-4 py-1.5 font-sans text-[12px] font-bold transition-colors ${
              group.isMember
                ? 'border border-white/[0.12] text-ivory-muted'
                : 'bg-gradient-to-r from-saffron-bright to-saffron text-ink-950'
            }`}
          >
            {group.isMember ? 'Open' : 'View & join'}
          </span>
        </div>
      </div>
    </motion.article>
  );
};

export default GroupCard;
