import { guard, send, readJson } from "../_server.js";

/**
 * Safar Groups.
 *
 * Everything under /api/groups/… in one function, because Vercel's Hobby plan
 * allows twelve of them and this project has to live inside that.
 *
 *   GET  list                     browse and search — open to anyone
 *   GET  detail?id=               one group, its members and your membership
 *   POST create                   start a group
 *   POST join / leave             membership, capacity-checked
 *   GET  messages?id=             the group's conversation
 *   POST message                  say something
 *   GET  expenses?id=             what the trip has cost and who owes whom
 *   POST expense                  add a shared cost
 *
 * Browsing is public; anything that writes needs a verified Clerk token, and
 * every write is scoped to the user that token names.
 */

/* Member counts are seed_members (travellers who joined before SafarX) plus
   everyone who has actually joined here, so a curated group reads honestly
   rather than resetting to zero. */
const countMembers = async (db, groupIds) => {
  if (!groupIds.length) return {};
  const { data } = await db.from("group_members").select("group_id").in("group_id", groupIds);
  return (data || []).reduce((acc, row) => {
    acc[row.group_id] = (acc[row.group_id] || 0) + 1;
    return acc;
  }, {});
};

const shape = (row, joinedCount = 0, isMember = false) => ({
  groupId: row.id,
  name: row.name,
  description: row.description,
  destination: {
    city: row.city,
    country: row.country,
    coordinates: { lat: row.lat, lng: row.lng },
  },
  travelDates: { startDate: row.start_date, endDate: row.end_date },
  category: row.category,
  type: row.visibility,
  maxMembers: row.max_members,
  memberCount: (row.seed_members || 0) + joinedCount,
  joinedCount,
  image: row.cover_image,
  verified: row.verified,
  createdBy: row.created_by,
  isMember,
});

/** A stable, readable id for a group somebody starts. */
const slug = (name) =>
  `grp_${String(name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40)}_${Date.now().toString(36)}`;

const listGroups = async (req, res, { db, userId }) => {
  const { query = "", category = "", city = "" } = req.query || {};

  let q = db.from("groups").select("*").order("start_date", { ascending: true });
  if (category && category !== "all") q = q.eq("category", category);
  if (city) q = q.ilike("city", `%${city}%`);
  if (query) q = q.or(`name.ilike.%${query}%,description.ilike.%${query}%,city.ilike.%${query}%`);

  const { data, error } = await q;
  if (error) return send(res, 500, { error: error.message });

  const ids = (data || []).map((r) => r.id);
  const counts = await countMembers(db, ids);

  let mine = new Set();
  if (userId && ids.length) {
    const { data: rows } = await db
      .from("group_members").select("group_id").eq("user_id", userId).in("group_id", ids);
    mine = new Set((rows || []).map((r) => r.group_id));
  }

  return send(res, 200, {
    data: (data || []).map((row) => shape(row, counts[row.id] || 0, mine.has(row.id))),
  });
};

const groupDetail = async (req, res, { db, userId }) => {
  const id = req.query?.id;
  if (!id) return send(res, 400, { error: "Which group?" });

  const { data: row, error } = await db.from("groups").select("*").eq("id", id).maybeSingle();
  if (error) return send(res, 500, { error: error.message });
  if (!row) return send(res, 404, { error: "That group no longer exists." });

  const { data: members } = await db
    .from("group_members").select("user_id, display_name, avatar_url, role, joined_at")
    .eq("group_id", id).order("joined_at", { ascending: true });

  const list = members || [];
  return send(res, 200, {
    data: {
      ...shape(row, list.length, list.some((m) => m.user_id === userId)),
      members: list.map((m) => ({
        userId: m.user_id, name: m.display_name, avatar: m.avatar_url, role: m.role,
      })),
    },
  });
};

const createGroup = async (req, res, { db, userId }) => {
  const body = await readJson(req);
  const name = String(body.name || "").trim();
  const city = String(body.city || body.destination || "").trim();
  if (!name || !city) return send(res, 400, { error: "A group needs a name and a destination." });

  const id = slug(name);
  const { error } = await db.from("groups").insert({
    id,
    name,
    description: String(body.description || "").slice(0, 1200),
    city,
    country: "India",
    lat: body.lat ?? null,
    lng: body.lng ?? null,
    start_date: body.startDate || null,
    end_date: body.endDate || null,
    category: body.category || "general",
    visibility: body.visibility === "private" ? "private" : "public",
    max_members: Math.min(200, Math.max(2, Number(body.maxMembers) || 20)),
    cover_image: body.image || null,
    created_by: userId,
  });
  if (error) return send(res, 500, { error: error.message });

  // Whoever starts a group is in it.
  await db.from("group_members").insert({
    group_id: id, user_id: userId, role: "organiser",
    display_name: body.displayName || null, avatar_url: body.avatarUrl || null,
  });

  return send(res, 201, { data: { groupId: id } });
};

const joinGroup = async (req, res, { db, userId }) => {
  const body = await readJson(req);
  const id = body.groupId;
  if (!id) return send(res, 400, { error: "Which group?" });

  const { data: row } = await db.from("groups").select("max_members, seed_members").eq("id", id).maybeSingle();
  if (!row) return send(res, 404, { error: "That group no longer exists." });

  const counts = await countMembers(db, [id]);
  const taken = (row.seed_members || 0) + (counts[id] || 0);
  if (taken >= row.max_members) {
    return send(res, 409, { error: "This group is full." });
  }

  const { error } = await db.from("group_members").upsert({
    group_id: id, user_id: userId,
    display_name: body.displayName || null, avatar_url: body.avatarUrl || null,
  }, { onConflict: "group_id,user_id" });
  if (error) return send(res, 500, { error: error.message });

  return send(res, 200, { data: { joined: true } });
};

const leaveGroup = async (req, res, { db, userId }) => {
  const { groupId } = await readJson(req);
  if (!groupId) return send(res, 400, { error: "Which group?" });
  const { error } = await db
    .from("group_members").delete().eq("group_id", groupId).eq("user_id", userId);
  if (error) return send(res, 500, { error: error.message });
  return send(res, 200, { data: { joined: false } });
};

/** Only members see or add to a group's conversation. */
const isMember = async (db, groupId, userId) => {
  const { data } = await db
    .from("group_members").select("user_id").eq("group_id", groupId).eq("user_id", userId).maybeSingle();
  return Boolean(data);
};

const listMessages = async (req, res, { db, userId }) => {
  const id = req.query?.id;
  if (!id) return send(res, 400, { error: "Which group?" });
  if (!(await isMember(db, id, userId))) return send(res, 403, { error: "Join the group to read its messages." });

  const { data, error } = await db
    .from("group_messages").select("*").eq("group_id", id)
    .order("created_at", { ascending: false }).limit(200);
  if (error) return send(res, 500, { error: error.message });

  return send(res, 200, {
    data: (data || []).reverse().map((m) => ({
      id: m.id, userId: m.user_id, name: m.display_name, avatar: m.avatar_url,
      body: m.body, at: m.created_at, mine: m.user_id === userId,
    })),
  });
};

const postMessage = async (req, res, { db, userId }) => {
  const body = await readJson(req);
  const text = String(body.body || "").trim().slice(0, 2000);
  if (!body.groupId || !text) return send(res, 400, { error: "Nothing to say." });
  if (!(await isMember(db, body.groupId, userId))) {
    return send(res, 403, { error: "Join the group before posting." });
  }
  const { error } = await db.from("group_messages").insert({
    group_id: body.groupId, user_id: userId, body: text,
    display_name: body.displayName || null, avatar_url: body.avatarUrl || null,
  });
  if (error) return send(res, 500, { error: error.message });
  return send(res, 201, { data: { posted: true } });
};

/**
 * What the trip has cost, and the settlement that clears it.
 *
 * Everything is integer paise: a group splitting a bill will eventually notice
 * a rupee that floating point lost. The remainder from an uneven split is
 * handed to the earliest payers rather than dropped, so the numbers reconcile
 * exactly rather than approximately.
 */
const listExpenses = async (req, res, { db, userId }) => {
  const id = req.query?.id;
  if (!id) return send(res, 400, { error: "Which group?" });
  if (!(await isMember(db, id, userId))) return send(res, 403, { error: "Join the group to see its costs." });

  const [{ data: rows }, { data: members }] = await Promise.all([
    db.from("group_expenses").select("*").eq("group_id", id).order("created_at", { ascending: false }),
    db.from("group_members").select("user_id, display_name").eq("group_id", id),
  ]);

  const expenses = rows || [];
  const people = members || [];
  const total = expenses.reduce((sum, e) => sum + Number(e.amount_paise), 0);

  /* An even split, with the leftover paise given to the first people in the
     list so the parts add back up to the whole. */
  const share = people.length ? Math.floor(total / people.length) : 0;
  let leftover = people.length ? total - share * people.length : 0;

  const balances = people.map((p) => {
    const owes = share + (leftover-- > 0 ? 1 : 0);
    const paid = expenses
      .filter((e) => e.paid_by === p.user_id)
      .reduce((sum, e) => sum + Number(e.amount_paise), 0);
    return {
      userId: p.user_id,
      name: p.display_name,
      paidPaise: paid,
      owesPaise: owes,
      netPaise: paid - owes, // positive: the group owes them
      you: p.user_id === userId,
    };
  });

  return send(res, 200, {
    data: {
      totalPaise: total,
      perHeadPaise: share,
      expenses: expenses.map((e) => ({
        id: e.id, description: e.description, amountPaise: Number(e.amount_paise),
        paidBy: e.paid_by, paidByName: e.paid_by_name, at: e.created_at,
        mine: e.paid_by === userId,
      })),
      balances,
    },
  });
};

const addExpense = async (req, res, { db, userId }) => {
  const body = await readJson(req);
  const rupees = Number(body.amount);
  const description = String(body.description || "").trim().slice(0, 200);
  if (!body.groupId || !description || !Number.isFinite(rupees) || rupees <= 0) {
    return send(res, 400, { error: "An expense needs a description and an amount above zero." });
  }
  if (!(await isMember(db, body.groupId, userId))) {
    return send(res, 403, { error: "Join the group before adding costs." });
  }
  const { error } = await db.from("group_expenses").insert({
    group_id: body.groupId, paid_by: userId, paid_by_name: body.displayName || null,
    description, amount_paise: Math.round(rupees * 100),
  });
  if (error) return send(res, 500, { error: error.message });
  return send(res, 201, { data: { added: true } });
};

/* Browsing is open; everything that writes or reads a private conversation
   needs a signed-in traveller. */
const ROUTES = {
  list:     { methods: ["GET"],  auth: false, run: listGroups },
  detail:   { methods: ["GET"],  auth: false, run: groupDetail },
  create:   { methods: ["POST"], auth: true,  run: createGroup },
  join:     { methods: ["POST"], auth: true,  run: joinGroup },
  leave:    { methods: ["POST"], auth: true,  run: leaveGroup },
  messages: { methods: ["GET"],  auth: true,  run: listMessages },
  message:  { methods: ["POST"], auth: true,  run: postMessage },
  expenses: { methods: ["GET"],  auth: true,  run: listExpenses },
  expense:  { methods: ["POST"], auth: true,  run: addExpense },
};

export default async function handler(req, res) {
  const action = req.query?.action || req.url.split("?")[0].split("/").pop();
  const route = ROUTES[action];
  if (!route) return res.status(404).json({ error: `No groups endpoint called "${action}".` });

  const ctx = await guard(req, res, route.methods, route.auth);
  if (!ctx) return;
  return route.run(req, res, ctx);
}
