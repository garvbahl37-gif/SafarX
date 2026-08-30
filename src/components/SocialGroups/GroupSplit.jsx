import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import Avatar from './Avatar';
import { useGroups } from '../../hooks/social/useGroups';

/**
 * What the trip has cost, and who owes whom.
 *
 * The part of group travel that actually causes arguments. Everything is
 * counted in integer paise on the server — a group splitting a bill will
 * eventually notice a rupee that floating point lost — and the remainder from
 * an uneven split is handed to the earliest members rather than dropped, so
 * the parts add back up to the whole.
 *
 * The settlement below is the useful bit: rather than listing twenty debts, it
 * matches the people who are owed against the people who owe, largest first,
 * which clears the whole group in at most one transfer per person.
 */

const rupees = (paise) =>
  `₹${(paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

/**
 * The fewest transfers that settle everyone.
 * @param {Array<{userId:string,name:string,netPaise:number,you:boolean}>} balances
 * @returns {Array<{from:object,to:object,paise:number}>}
 */
const settle = (balances) => {
  const owed = balances.filter((b) => b.netPaise > 0).map((b) => ({ ...b })).sort((a, b) => b.netPaise - a.netPaise);
  const owing = balances.filter((b) => b.netPaise < 0).map((b) => ({ ...b })).sort((a, b) => a.netPaise - b.netPaise);
  const transfers = [];

  let i = 0;
  let j = 0;
  while (i < owing.length && j < owed.length) {
    const amount = Math.min(-owing[i].netPaise, owed[j].netPaise);
    if (amount > 0) transfers.push({ from: owing[i], to: owed[j], paise: amount });
    owing[i].netPaise += amount;
    owed[j].netPaise -= amount;
    if (owing[i].netPaise === 0) i += 1;
    if (owed[j].netPaise === 0) j += 1;
  }
  return transfers;
};

const GroupSplit = ({ group, isJoined }) => {
  const { getExpenses, addExpense, signedIn } = useGroups();
  const [state, setState] = useState(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ description: '', amount: '' });

  const load = useCallback(async () => {
    if (!isJoined) return;
    try {
      setState(await getExpenses(group.groupId));
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setReady(true);
    }
  }, [getExpenses, group.groupId, isJoined]);

  useEffect(() => { load(); }, [load]);

  const submit = async (e) => {
    e.preventDefault();
    const amount = Number(form.amount);
    if (!form.description.trim() || !Number.isFinite(amount) || amount <= 0 || adding) return;
    setAdding(true);
    setError(null);
    try {
      await addExpense(group.groupId, form.description.trim(), amount);
      setForm({ description: '', amount: '' });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  };

  if (!isJoined) {
    return (
      <div className="rounded-2xl border border-white/[0.08] bg-ink-900/50 p-10 text-center">
        <Lock size={20} className="mx-auto mb-4 text-saffron/70" aria-hidden="true" />
        <p className="font-display text-[1.35rem] text-ivory">Members only</p>
        <p className="mx-auto mt-2 max-w-sm font-sans text-[14px] leading-relaxed text-ivory-muted">
          {signedIn ? 'Join the group to share costs with it.' : 'Sign in and join the group to split what the trip costs.'}
        </p>
      </div>
    );
  }

  const transfers = state ? settle(state.balances) : [];
  const you = state?.balances.find((b) => b.you);

  return (
    <div className="space-y-6">
      {/* Where you stand — the one number most people open this for. */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: 'Trip total', value: state ? rupees(state.totalPaise) : '—' },
          { label: 'Each person', value: state ? rupees(state.perHeadPaise) : '—' },
          {
            label: you && you.netPaise < 0 ? 'You owe' : 'You are owed',
            value: you ? rupees(Math.abs(you.netPaise)) : '—',
            accent: true,
          },
        ].map((tile) => (
          <div key={tile.label} className="rounded-2xl border border-white/[0.08] bg-ink-900/50 p-5">
            <p className="eyebrow-muted mb-2">{tile.label}</p>
            <p className={`font-data text-[1.7rem] tabular-nums leading-none ${tile.accent ? 'text-saffron' : 'text-ivory'}`}>
              {tile.value}
            </p>
          </div>
        ))}
      </div>

      {/* Settling up */}
      <div className="rounded-2xl border border-white/[0.08] bg-ink-900/50 p-5">
        <div className="mb-4 flex items-center gap-3">
          <p className="eyebrow whitespace-nowrap">Settling up</p>
          <span className="route-line flex-1" aria-hidden="true" />
        </div>

        {!ready && <p className="font-sans text-[13.5px] text-ivory-faint">Working it out…</p>}

        {ready && !transfers.length && (
          <p className="font-sans text-[14px] text-ivory-muted">
            {state?.totalPaise ? 'Everyone is square. Nothing to settle.' : 'No costs yet — add the first one below.'}
          </p>
        )}

        <div className="space-y-2.5">
          {transfers.map((t, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl bg-white/[0.03] px-4 py-3">
              <Avatar name={t.from.name} size={26} />
              <span className="min-w-0 flex-1 truncate font-sans text-[13.5px] text-ivory">
                {t.from.you ? 'You' : t.from.name || 'Traveller'}
              </span>
              <ArrowRight size={14} className="shrink-0 text-ivory-faint" aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate text-right font-sans text-[13.5px] text-ivory">
                {t.to.you ? 'You' : t.to.name || 'Traveller'}
              </span>
              <Avatar name={t.to.name} size={26} />
              <span className="w-20 shrink-0 text-right font-data text-[13.5px] tabular-nums text-saffron">
                {rupees(t.paise)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Add a cost */}
      <form onSubmit={submit} className="rounded-2xl border border-white/[0.08] bg-ink-900/50 p-5">
        <div className="mb-4 flex items-center gap-3">
          <p className="eyebrow whitespace-nowrap">Add a cost</p>
          <span className="route-line flex-1" aria-hidden="true" />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Houseboat deposit"
            aria-label="What was it for"
            className="glass-input flex-1"
          />
          <input
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value.replace(/[^\d.]/g, '') }))}
            placeholder="₹ amount"
            inputMode="decimal"
            aria-label="Amount in rupees"
            className="glass-input sm:w-40"
          />
          <button
            type="submit"
            disabled={adding || !form.description.trim() || !form.amount}
            className="btn-primary shrink-0 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={15} aria-hidden="true" />
            {adding ? 'Adding…' : 'Add'}
          </button>
        </div>
      </form>

      {error && (
        <p role="alert" className="flex items-center gap-2 rounded-xl border border-[#E05252]/30 bg-[#E05252]/[0.08] px-4 py-3 font-sans text-[13.5px] text-[#F0A8A8]">
          <AlertCircle size={14} aria-hidden="true" />
          {error}
        </p>
      )}

      {/* What has been spent */}
      {Boolean(state?.expenses?.length) && (
        <div className="rounded-2xl border border-white/[0.08] bg-ink-900/50 p-5">
          <div className="mb-4 flex items-center gap-3">
            <p className="eyebrow whitespace-nowrap">{state.expenses.length} entries</p>
            <span className="route-line flex-1" aria-hidden="true" />
          </div>
          <AnimatePresence initial={false}>
            {state.expenses.map((e) => (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 border-b border-white/[0.05] py-3 last:border-0"
              >
                <Avatar name={e.paidByName} size={26} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-sans text-[14px] text-ivory">{e.description}</p>
                  <p className="font-data text-[9.5px] uppercase tracking-[0.16em] text-ivory-faint">
                    {e.mine ? 'You paid' : `${e.paidByName || 'A member'} paid`}
                  </p>
                </div>
                <span className="font-data text-[14px] tabular-nums text-ivory">{rupees(e.amountPaise)}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default GroupSplit;
