import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';

/**
 * Safar Groups, against the real thing.
 *
 * This used to hand back six objects from a mock file with local storage
 * deliberately switched off "for demo purity", so nothing anyone did survived
 * a refresh and no two people ever saw the same group. Groups are now rows:
 * joining is a row, a message is a row, and a shared cost is a row.
 *
 * The exported shape is unchanged, so every component built against the mock
 * keeps working.
 */

const API = '/api/groups';

/** The server's own words where it has them — they are written to be read. */
const explain = async (res, fallback) => {
  const body = await res.json().catch(() => ({}));
  return new Error(body.error || fallback);
};

export const useGroups = () => {
  const { getToken, isSignedIn } = useAuth();

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* Deliberately no identity is sent. The server looks your name and picture
     up from Clerk against the token you presented: a client that could supply
     its own display name could post a message rendering as somebody else,
     with their photograph, under a user id that was technically correct. */

  const authHeaders = useCallback(async () => {
    if (!isSignedIn) return {};
    const token = await getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [getToken, isSignedIn]);

  const fetchGroups = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      if (filters.searchQuery) query.set('query', filters.searchQuery);
      if (filters.destination) query.set('city', filters.destination);
      if (filters.category && filters.category !== 'all') query.set('category', filters.category);

      const res = await fetch(`${API}/list?${query}`, { headers: await authHeaders() });
      if (!res.ok) throw await explain(res, 'Groups could not be loaded.');
      const body = await res.json();
      setGroups(body.data || []);
    } catch (err) {
      setError(err.message);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => { fetchGroups(); }, [fetchGroups]);

  /** One group with its members. */
  const getGroup = useCallback(async (groupId) => {
    const res = await fetch(`${API}/detail?id=${encodeURIComponent(groupId)}`, {
      headers: await authHeaders(),
    });
    if (!res.ok) throw await explain(res, 'That group could not be opened.');
    return (await res.json()).data;
  }, [authHeaders]);

  /* Synchronous, for components that render straight from the loaded list. */
  const getGroupById = useCallback(
    (id) => groups.find((g) => g.groupId === id) || null,
    [groups]
  );

  const addGroup = useCallback(async (data) => {
    const res = await fetch(`${API}/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw await explain(res, 'The group could not be created.');
    const { data: created } = await res.json();
    await fetchGroups();
    return { groupId: created.groupId };
  }, [authHeaders, fetchGroups]);

  const setMembership = useCallback(async (groupId, join) => {
    const res = await fetch(`${API}/${join ? 'join' : 'leave'}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
      body: JSON.stringify({ groupId }),
    });
    if (!res.ok) throw await explain(res, join ? 'You could not be added.' : 'You could not be removed.');

    // Reflect it immediately; the list refreshes behind the change.
    setGroups((prev) => prev.map((g) => (
      g.groupId === groupId
        ? { ...g, isMember: join, memberCount: g.memberCount + (join ? 1 : -1) }
        : g
    )));
    return join;
  }, [authHeaders]);

  const toggleJoinGroup = useCallback(async (groupId) => {
    const current = groups.find((g) => g.groupId === groupId);
    return setMembership(groupId, !current?.isMember);
  }, [groups, setMembership]);

  const isGroupJoined = useCallback(
    (groupId) => Boolean(groups.find((g) => g.groupId === groupId)?.isMember),
    [groups]
  );

  const getJoinedGroups = useCallback(() => groups.filter((g) => g.isMember), [groups]);

  /* ── The conversation ─────────────────────────────────────────────── */

  const getMessages = useCallback(async (groupId) => {
    const res = await fetch(`${API}/messages?id=${encodeURIComponent(groupId)}`, {
      headers: await authHeaders(),
    });
    if (!res.ok) throw await explain(res, 'The conversation could not be loaded.');
    return (await res.json()).data || [];
  }, [authHeaders]);

  const sendMessage = useCallback(async (groupId, body) => {
    const res = await fetch(`${API}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
      body: JSON.stringify({ groupId, body }),
    });
    if (!res.ok) throw await explain(res, 'That message did not send.');
  }, [authHeaders]);

  /* ── What the trip costs ──────────────────────────────────────────── */

  const getExpenses = useCallback(async (groupId) => {
    const res = await fetch(`${API}/expenses?id=${encodeURIComponent(groupId)}`, {
      headers: await authHeaders(),
    });
    if (!res.ok) throw await explain(res, 'The costs could not be loaded.');
    return (await res.json()).data;
  }, [authHeaders]);

  const addExpense = useCallback(async (groupId, description, amount) => {
    const res = await fetch(`${API}/expense`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
      body: JSON.stringify({ groupId, description, amount }),
    });
    if (!res.ok) throw await explain(res, 'That cost was not added.');
  }, [authHeaders]);

  return {
    groups,
    loading,
    error,
    fetchGroups,
    getGroup,
    getGroupById,
    addGroup,
    toggleJoinGroup,
    isGroupJoined,
    getJoinedGroups,
    joinedGroupIds: groups.filter((g) => g.isMember).map((g) => g.groupId),
    getMessages,
    sendMessage,
    getExpenses,
    addExpense,
    signedIn: Boolean(isSignedIn),
  };
};
