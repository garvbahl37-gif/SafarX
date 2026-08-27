/**
 * checklistGenerator.js — SafarX smart packing engine
 * =============================================================================
 * A PURE, dependency-free rules engine. Nothing in this file touches React,
 * the DOM or localStorage, so it can be unit-tested or reused by the itinerary
 * planner / agent without dragging UI along.
 *
 * The single entry point is `generateChecklist(tripConfig)`. It layers four
 * kinds of rules on top of each other, most-general first:
 *
 *   1. BASE          — what every Indian trip needs (ID, cash, charger, meds)
 *   2. TRIP TYPE     — trek / beach / heritage / pilgrimage / business /
 *                      roadtrip / wildlife
 *   3. DESTINATION   — resolved to a region profile with terrain "traits"
 *                      (high-altitude, coastal, desert, monsoon-heavy …)
 *   4. SEASON        — winter / summer / monsoon / post-monsoon, from the
 *                      departure month
 *   5. TRAVELLER MIX — adults, children, and gender-sensitive essentials
 *
 * Later layers can raise (never lower) an item's priority and can raise its
 * quantity — see `mergeItem`. That means "Warm jacket" added as `normal` by the
 * winter rule becomes `critical` when the Ladakh rule asks for it again.
 * =============================================================================
 */

/* ---------------------------------------------------------------------------
 * Vocabulary
 * ------------------------------------------------------------------------ */

/** Categories, in the order they should render. `icon` is a lucide-react name. */
export const CATEGORIES = [
  { id: "documents", label: "Documents", icon: "FileText" },
  { id: "clothing", label: "Clothing", icon: "Shirt" },
  { id: "toiletries", label: "Toiletries", icon: "Droplets" },
  { id: "electronics", label: "Electronics", icon: "Plug" },
  { id: "health", label: "Health & Medicine", icon: "HeartPulse" },
  { id: "money", label: "Money", icon: "Wallet" },
  { id: "gear", label: "Gear", icon: "Backpack" },
  { id: "food", label: "Food & Snacks", icon: "Coffee" },
  { id: "misc", label: "Miscellaneous", icon: "Sparkles" },
];

export const CATEGORY_MAP = CATEGORIES.reduce((acc, c) => {
  acc[c.id] = c;
  return acc;
}, {});

/** Priority ladder. `rank` is used when merging duplicate items. */
export const PRIORITIES = {
  critical: { id: "critical", label: "Critical", rank: 3, short: "CRIT" },
  high: { id: "high", label: "High", rank: 2, short: "HIGH" },
  normal: { id: "normal", label: "Normal", rank: 1, short: "STD" },
};

export const TRIP_TYPES = [
  { id: "trek", label: "Trek / Mountains", icon: "Mountain" },
  { id: "beach", label: "Beach / Islands", icon: "Waves" },
  { id: "heritage", label: "Heritage & Culture", icon: "Landmark" },
  { id: "pilgrimage", label: "Pilgrimage / Yatra", icon: "Sun" },
  { id: "business", label: "Business", icon: "Briefcase" },
  { id: "roadtrip", label: "Road trip", icon: "Car" },
  { id: "wildlife", label: "Wildlife safari", icon: "Binoculars" },
  { id: "general", label: "General travel", icon: "Compass" },
];

export const SEASONS = {
  winter: { id: "winter", label: "Winter", months: [11, 0, 1] },
  summer: { id: "summer", label: "Summer", months: [2, 3, 4] },
  monsoon: { id: "monsoon", label: "Monsoon", months: [5, 6, 7, 8] },
  autumn: { id: "autumn", label: "Post-monsoon", months: [9, 10] },
};

/**
 * Season from a 0-indexed month. Indian calendar, not meteorological:
 * Dec–Feb winter, Mar–May summer, Jun–Sep monsoon, Oct–Nov post-monsoon.
 */
export function getSeason(month) {
  if (month == null || Number.isNaN(month)) return "autumn";
  const m = ((month % 12) + 12) % 12;
  const hit = Object.values(SEASONS).find((s) => s.months.includes(m));
  return hit ? hit.id : "autumn";
}

/* ---------------------------------------------------------------------------
 * Destination profiles
 * Each profile carries terrain "traits" that the rules below switch on, so we
 * never have to write `if (destination === 'Leh' || destination === 'Nubra')`.
 * ------------------------------------------------------------------------ */

export const DESTINATION_PROFILES = [
  {
    id: "ladakh",
    label: "Ladakh",
    region: "Ladakh (UT)",
    match: ["ladakh", "leh", "nubra", "pangong", "zanskar", "kargil", "turtuk", "hanle"],
    traits: ["high-altitude", "extreme-cold", "arid", "remote", "permit"],
  },
  {
    id: "spiti",
    label: "Spiti & Lahaul",
    region: "Himachal Pradesh",
    match: ["spiti", "lahaul", "kaza", "kibber", "chandratal", "keylong", "kinnaur", "kalpa"],
    traits: ["high-altitude", "extreme-cold", "arid", "remote"],
  },
  {
    id: "sikkim",
    label: "Sikkim & Darjeeling",
    region: "Sikkim / West Bengal hills",
    match: ["sikkim", "gangtok", "lachung", "lachen", "tsomgo", "pelling", "darjeeling", "yumthang", "nathula"],
    traits: ["high-altitude", "hill", "monsoon-heavy", "permit"],
  },
  {
    id: "himachal",
    label: "Himachal hills",
    region: "Himachal Pradesh",
    match: ["himachal", "manali", "shimla", "dharamshala", "mcleodganj", "kasol", "dalhousie", "kullu", "bir", "billing", "chail"],
    traits: ["hill", "cold", "monsoon-heavy"],
  },
  {
    id: "uttarakhand",
    label: "Uttarakhand",
    region: "Uttarakhand",
    match: ["uttarakhand", "rishikesh", "haridwar", "kedarnath", "badrinath", "gangotri", "yamunotri", "nainital", "mussoorie", "auli", "chopta", "valley of flowers", "dehradun"],
    traits: ["hill", "cold", "monsoon-heavy", "pilgrim-circuit"],
  },
  {
    id: "kashmir",
    label: "Kashmir",
    region: "Jammu & Kashmir",
    match: ["kashmir", "srinagar", "gulmarg", "pahalgam", "sonmarg", "vaishno devi", "katra", "jammu", "doodhpathri"],
    traits: ["hill", "cold", "pilgrim-circuit"],
  },
  {
    id: "northeast",
    label: "North East",
    region: "North East India",
    match: ["meghalaya", "shillong", "cherrapunji", "sohra", "dawki", "assam", "guwahati", "kaziranga", "arunachal", "tawang", "ziro", "nagaland", "kohima", "mizoram", "manipur", "tripura", "majuli", "north east", "northeast"],
    traits: ["hill", "monsoon-heavy", "humid", "remote", "permit", "wildlife-country"],
  },
  {
    id: "kerala",
    label: "Kerala",
    region: "Kerala",
    match: ["kerala", "kochi", "cochin", "alleppey", "alappuzha", "munnar", "wayanad", "kumarakom", "varkala", "kovalam", "thekkady", "periyar", "trivandrum"],
    traits: ["coastal", "humid", "monsoon-heavy", "tropical"],
  },
  {
    id: "goa",
    label: "Goa & Konkan",
    region: "Goa / Konkan",
    match: ["goa", "panaji", "panjim", "anjuna", "palolem", "baga", "arambol", "gokarna", "konkan", "malvan", "tarkarli", "ratnagiri"],
    traits: ["coastal", "humid", "beach-country", "monsoon-heavy"],
  },
  {
    id: "andaman",
    label: "Andaman & Lakshadweep",
    region: "Island territories",
    match: ["andaman", "havelock", "neil island", "port blair", "lakshadweep", "agatti", "nicobar", "radhanagar"],
    traits: ["coastal", "humid", "beach-country", "remote", "tropical", "dry-state"],
  },
  {
    id: "tamilnadu",
    label: "Tamil Nadu coast",
    region: "Tamil Nadu / Puducherry",
    match: ["tamil nadu", "chennai", "pondicherry", "puducherry", "mahabalipuram", "rameswaram", "kanyakumari", "madurai", "thanjavur", "ooty", "kodaikanal"],
    traits: ["coastal", "humid", "hot", "temple-country"],
  },
  {
    id: "rajasthan",
    label: "Rajasthan",
    region: "Rajasthan",
    match: ["rajasthan", "jaipur", "jodhpur", "jaisalmer", "udaipur", "bikaner", "pushkar", "ranthambore", "mount abu", "thar", "chittorgarh", "bundi"],
    traits: ["desert", "hot", "arid", "heritage-country"],
  },
  {
    id: "gujarat",
    label: "Gujarat",
    region: "Gujarat",
    match: ["gujarat", "kutch", "rann", "ahmedabad", "bhuj", "gir", "somnath", "dwarka", "statue of unity", "saurashtra"],
    traits: ["desert", "hot", "arid", "dry-state", "wildlife-country"],
  },
  {
    id: "wildlife",
    label: "Tiger country",
    region: "Central India",
    match: ["jim corbett", "corbett", "bandhavgarh", "kanha", "pench", "tadoba", "satpura", "sundarban", "sunderban", "nagarhole", "bandipur", "kabini", "sariska"],
    traits: ["wildlife-country", "humid", "hot"],
  },
  {
    id: "heartland",
    label: "Heritage heartland",
    region: "North & Central India",
    match: ["delhi", "agra", "varanasi", "kashi", "lucknow", "khajuraho", "orchha", "gwalior", "bhopal", "sanchi", "ayodhya", "prayagraj", "allahabad", "mathura", "vrindavan", "amritsar", "chandigarh", "bodh gaya", "patna", "hampi", "badami", "aurangabad", "ajanta", "ellora"],
    traits: ["heritage-country", "hot", "temple-country"],
  },
  {
    id: "metro",
    label: "Metro India",
    region: "Metro",
    match: ["mumbai", "bombay", "bengaluru", "bangalore", "hyderabad", "pune", "kolkata", "calcutta", "gurgaon", "gurugram", "noida", "ahmedabad city"],
    traits: ["metro", "humid"],
  },
];

const norm = (v) => String(v || "").toLowerCase().trim();

/**
 * Resolve a free-text destination ("Leh, Ladakh") to a profile.
 * Falls back to a neutral "India" profile so generation never fails.
 */
export function resolveDestination(destination) {
  const q = norm(destination);
  if (q) {
    // Longest keyword wins, so "north east" beats a stray "assam" substring.
    let best = null;
    let bestLen = 0;
    for (const profile of DESTINATION_PROFILES) {
      for (const key of profile.match) {
        if (q.includes(key) && key.length > bestLen) {
          best = profile;
          bestLen = key.length;
        }
      }
    }
    if (best) return best;
  }
  return {
    id: "india",
    label: "India",
    region: "India",
    match: [],
    traits: ["heritage-country"],
  };
}

/* ---------------------------------------------------------------------------
 * Item helpers
 * ------------------------------------------------------------------------ */

let seq = 0;
/** Collision-resistant id that does not need a uuid dependency. */
export function makeId(prefix = "itm") {
  seq += 1;
  return `${prefix}_${Date.now().toString(36)}_${seq.toString(36)}${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

/**
 * The canonical item shape. Every field is always present so the UI never has
 * to guard against `undefined`.
 */
export function createItem(partial = {}) {
  return {
    id: partial.id || makeId(),
    label: partial.label || "Untitled item",
    category: CATEGORY_MAP[partial.category] ? partial.category : "misc",
    quantity: Math.max(1, Math.round(Number(partial.quantity) || 1)),
    priority: PRIORITIES[partial.priority] ? partial.priority : "normal",
    packed: Boolean(partial.packed),
    notes: partial.notes || "",
    weightGrams: Math.max(0, Math.round(Number(partial.weightGrams) || 0)),
    isDocument: Boolean(partial.isDocument) || partial.category === "documents",
    autoAdded: partial.autoAdded !== undefined ? Boolean(partial.autoAdded) : true,
  };
}

const dedupeKey = (item) => `${item.category}::${norm(item.label)}`;

/**
 * Merge an incoming rule item into the accumulator.
 * Rules run general → specific, so a later rule may only ESCALATE: higher
 * priority wins, larger quantity wins, and a fresh note is appended.
 */
function mergeItem(map, partial) {
  const item = createItem(partial);
  const key = dedupeKey(item);
  const existing = map.get(key);
  if (!existing) {
    map.set(key, item);
    return;
  }
  if (PRIORITIES[item.priority].rank > PRIORITIES[existing.priority].rank) {
    existing.priority = item.priority;
  }
  existing.quantity = Math.max(existing.quantity, item.quantity);
  existing.weightGrams = Math.max(existing.weightGrams, item.weightGrams);
  if (item.notes && !existing.notes.includes(item.notes)) {
    existing.notes = existing.notes ? `${existing.notes} · ${item.notes}` : item.notes;
  }
  existing.isDocument = existing.isDocument || item.isDocument;
}

/** Quantity scaler: `scale(7, 0.7, { plus: 1, max: 8 })` → 6 shirts for a week. */
export function scale(days, factor, { min = 1, max = 99, plus = 0 } = {}) {
  const n = Math.ceil((Number(days) || 1) * factor) + plus;
  return Math.max(min, Math.min(max, n));
}

/* ---------------------------------------------------------------------------
 * Normalising the trip config
 * ------------------------------------------------------------------------ */

/**
 * Accepts whatever the form produced and returns a fully-resolved config:
 * days, month, season, profile and traveller counts are all guaranteed.
 */
export function normalizeTripConfig(tripConfig = {}) {
  const start = tripConfig.startDate ? new Date(tripConfig.startDate) : null;
  const validStart = start && !Number.isNaN(start.getTime()) ? start : null;
  const days = Math.max(1, Math.min(60, Math.round(Number(tripConfig.days) || 3)));
  const month = validStart ? validStart.getMonth() : new Date().getMonth();
  const profile = resolveDestination(tripConfig.destination);
  const adults = Math.max(1, Math.round(Number(tripConfig.adults) || 1));
  const children = Math.max(0, Math.round(Number(tripConfig.children) || 0));

  return {
    name: tripConfig.name || "Untitled trip",
    destination: tripConfig.destination || "",
    tripType: TRIP_TYPES.some((t) => t.id === tripConfig.tripType)
      ? tripConfig.tripType
      : "general",
    startDate: tripConfig.startDate || "",
    days,
    month,
    season: getSeason(month),
    adults,
    children,
    travellers: adults + children,
    hasFemaleTravellers: Boolean(tripConfig.hasFemaleTravellers),
    profile,
    traits: profile.traits,
  };
}

const has = (cfg, trait) => cfg.traits.includes(trait);

/* ---------------------------------------------------------------------------
 * RULE LAYER 1 — the universal Indian-travel base kit
 * ------------------------------------------------------------------------ */

function baseRules(cfg, add) {
  const { days, travellers } = cfg;

  // Documents — physical copies still rule Indian hotel check-in desks.
  add({ label: "Government photo ID (Aadhaar / Passport)", category: "documents", priority: "critical", isDocument: true, weightGrams: 10, notes: "Original, on your person" });
  add({ label: "Photocopies of ID", category: "documents", quantity: 2, priority: "high", isDocument: true, weightGrams: 10, notes: "Hotels still ask for a physical copy" });
  add({ label: "Ticket / PNR printout", category: "documents", priority: "critical", isDocument: true, weightGrams: 10 });
  add({ label: "Hotel booking confirmation", category: "documents", priority: "high", isDocument: true, weightGrams: 10 });
  add({ label: "Travel insurance policy", category: "documents", priority: "normal", isDocument: true, weightGrams: 10 });
  add({ label: "Passport-size photographs", category: "documents", quantity: 4, priority: "normal", isDocument: true, weightGrams: 5, notes: "Permits, SIM cards, entry registers" });

  // Money
  add({ label: "Cash in small denominations", category: "money", priority: "critical", weightGrams: 40, notes: "₹10/₹20/₹50 for autos, tolls, chai" });
  add({ label: "Debit / credit card", category: "money", priority: "critical", weightGrams: 10 });
  add({ label: "UPI apps tested and logged in", category: "money", priority: "high", weightGrams: 0 });
  add({ label: "Emergency cash reserve", category: "money", priority: "normal", weightGrams: 20, notes: "Keep separate from your wallet" });

  // Clothing — scaled by duration, quantities are per person.
  add({ label: "T-shirts / kurtas", category: "clothing", quantity: scale(days, 0.7, { plus: 1, max: 10 }), priority: "high", weightGrams: 180, notes: "Per person" });
  add({ label: "Innerwear", category: "clothing", quantity: scale(days, 1, { plus: 1, max: 12 }), priority: "high", weightGrams: 60, notes: "Per person" });
  add({ label: "Socks", category: "clothing", quantity: scale(days, 0.8, { plus: 1, max: 10 }), priority: "normal", weightGrams: 50 });
  add({ label: "Trousers / bottoms", category: "clothing", quantity: scale(days, 0.35, { min: 2, max: 5 }), priority: "high", weightGrams: 400 });
  add({ label: "Sleepwear", category: "clothing", quantity: days > 6 ? 2 : 1, priority: "normal", weightGrams: 250 });
  add({ label: "Comfortable walking shoes", category: "clothing", priority: "high", weightGrams: 800 });
  add({ label: "Slip-on sandals", category: "clothing", priority: "normal", weightGrams: 300 });

  // Toiletries
  add({ label: "Toothbrush & toothpaste", category: "toiletries", priority: "high", weightGrams: 120 });
  add({ label: "Soap / body wash", category: "toiletries", priority: "normal", weightGrams: 150 });
  add({ label: "Shampoo sachets", category: "toiletries", quantity: scale(days, 0.5, { min: 2, max: 12 }), priority: "normal", weightGrams: 12 });
  add({ label: "Moisturiser", category: "toiletries", priority: "normal", weightGrams: 100 });
  add({ label: "Deodorant", category: "toiletries", priority: "normal", weightGrams: 120 });
  add({ label: "Quick-dry towel", category: "toiletries", priority: "normal", weightGrams: 200 });
  add({ label: "Hand sanitiser", category: "toiletries", priority: "high", weightGrams: 80 });
  add({ label: "Wet wipes & tissue roll", category: "toiletries", priority: "high", weightGrams: 180, notes: "Highway washrooms rarely stock either" });

  // Electronics
  add({ label: "Phone charger & cable", category: "electronics", priority: "critical", weightGrams: 100 });
  add({ label: "Power bank (10,000 mAh+)", category: "electronics", priority: "high", weightGrams: 250, notes: "Carry in cabin bag, never checked-in" });
  add({ label: "Extension board / multi-plug", category: "electronics", priority: "normal", weightGrams: 220, notes: "Indian hotel rooms have one socket per wall" });
  add({ label: "Earphones", category: "electronics", priority: "normal", weightGrams: 40 });

  // Health
  add({ label: "Personal prescription medicine", category: "health", priority: "critical", weightGrams: 120, notes: "Carry the prescription too" });
  add({ label: "Paracetamol", category: "health", priority: "high", weightGrams: 30 });
  add({ label: "ORS sachets", category: "health", quantity: Math.max(4, travellers * 2), priority: "high", weightGrams: 20, notes: "Dehydration is the #1 trip-ruiner" });
  add({ label: "Anti-diarrhoeal & antacid", category: "health", priority: "high", weightGrams: 40, notes: "New water, new food" });
  add({ label: "Band-aids & antiseptic cream", category: "health", priority: "high", weightGrams: 90 });
  add({ label: "Motion-sickness tablets", category: "health", priority: "normal", weightGrams: 15 });

  // Gear & food
  add({ label: "Reusable water bottle", category: "gear", quantity: travellers, priority: "high", weightGrams: 320 });
  add({ label: "Daypack", category: "gear", priority: "high", weightGrams: 600 });
  add({ label: "Luggage lock", category: "gear", quantity: 2, priority: "normal", weightGrams: 90 });
  add({ label: "Laundry / wet-clothes bag", category: "gear", priority: "normal", weightGrams: 60 });
  add({ label: "Dry snacks (namkeen, biscuits, dry fruit)", category: "food", priority: "normal", weightGrams: 400 });
  add({ label: "Sunglasses", category: "misc", priority: "normal", weightGrams: 40 });
  add({ label: "Pen (for forms & registers)", category: "misc", priority: "normal", weightGrams: 10 });
}

/* ---------------------------------------------------------------------------
 * RULE LAYER 2 — trip type
 * ------------------------------------------------------------------------ */

const TRIP_TYPE_RULES = {
  trek: (cfg, add) => {
    add({ label: "Trekking shoes (broken in)", category: "clothing", priority: "critical", weightGrams: 1100, notes: "Never wear a brand-new pair on day one" });
    add({ label: "Quick-dry trek trousers", category: "clothing", quantity: 2, priority: "high", weightGrams: 350 });
    add({ label: "Fleece / insulated mid-layer", category: "clothing", priority: "high", weightGrams: 450 });
    add({ label: "Rain poncho or shell", category: "clothing", priority: "high", weightGrams: 300 });
    add({ label: "Rucksack with rain cover", category: "gear", priority: "critical", weightGrams: 1500 });
    add({ label: "Trekking pole", category: "gear", priority: "high", weightGrams: 250 });
    add({ label: "Head torch + spare batteries", category: "gear", priority: "critical", weightGrams: 160 });
    add({ label: "Energy bars / glucose", category: "food", quantity: scale(cfg.days, 2, { max: 20 }), priority: "high", weightGrams: 45 });
    add({ label: "Blister plasters & crepe bandage", category: "health", priority: "high", weightGrams: 80 });
    add({ label: "Offline trail maps downloaded", category: "electronics", priority: "high", weightGrams: 0 });
    add({ label: "Whistle", category: "gear", priority: "normal", weightGrams: 15 });
  },
  beach: (cfg, add) => {
    add({ label: "Reef-safe sunscreen SPF 50", category: "toiletries", priority: "critical", weightGrams: 200, notes: "Reef-safe keeps the coral alive" });
    add({ label: "Swimwear", category: "clothing", quantity: 2, priority: "high", weightGrams: 180 });
    add({ label: "Flip-flops", category: "clothing", priority: "high", weightGrams: 250 });
    add({ label: "Beach cover-up / light shirt", category: "clothing", priority: "normal", weightGrams: 180 });
    add({ label: "Wide-brim hat", category: "clothing", priority: "high", weightGrams: 120 });
    add({ label: "Dry bag for phone & wallet", category: "gear", priority: "high", weightGrams: 120 });
    add({ label: "Beach towel / sarong", category: "gear", priority: "normal", weightGrams: 300 });
    add({ label: "After-sun aloe gel", category: "health", priority: "normal", weightGrams: 150 });
    add({ label: "Waterproof phone pouch", category: "electronics", priority: "normal", weightGrams: 40 });
  },
  heritage: (cfg, add) => {
    add({ label: "Comfortable socks for barefoot zones", category: "clothing", quantity: 2, priority: "high", weightGrams: 50, notes: "Marble courtyards get scorching by noon" });
    add({ label: "Modest full-length clothing", category: "clothing", priority: "high", weightGrams: 350, notes: "Many monuments and temples enforce a dress code" });
    add({ label: "Camera + spare memory card", category: "electronics", priority: "normal", weightGrams: 700 });
    add({ label: "Small foldable umbrella", category: "gear", priority: "normal", weightGrams: 300 });
    add({ label: "Monument entry passes / QR tickets", category: "documents", priority: "high", isDocument: true, weightGrams: 5, notes: "ASI tickets are cheaper booked online" });
    add({ label: "Refillable water bottle", category: "gear", priority: "high", weightGrams: 320 });
  },
  pilgrimage: (cfg, add) => {
    add({ label: "Modest full-cover clothing", category: "clothing", quantity: 2, priority: "critical", weightGrams: 350, notes: "Shoulders and knees covered at the shrine" });
    add({ label: "Easily removable footwear", category: "clothing", priority: "high", weightGrams: 300, notes: "You will take them off a dozen times a day" });
    add({ label: "Cloth bag for footwear & offerings", category: "gear", priority: "normal", weightGrams: 60 });
    add({ label: "Walking stick", category: "gear", priority: "high", weightGrams: 250 });
    add({ label: "Yatra registration / ID for darshan", category: "documents", priority: "critical", isDocument: true, weightGrams: 10, notes: "Registration is mandatory on most yatra routes" });
    add({ label: "Prasad / offering box", category: "misc", priority: "normal", weightGrams: 120 });
    add({ label: "Knee cap or ankle support", category: "health", priority: "normal", weightGrams: 90, notes: "Long stepped climbs" });
    add({ label: "Cash for donations & local transport", category: "money", priority: "high", weightGrams: 30, notes: "Card machines are rare on shrine routes" });
  },
  business: (cfg, add) => {
    add({ label: "Formal shirts", category: "clothing", quantity: scale(cfg.days, 1, { max: 7 }), priority: "high", weightGrams: 220 });
    add({ label: "Formal trousers / suit", category: "clothing", quantity: scale(cfg.days, 0.4, { min: 1, max: 3 }), priority: "high", weightGrams: 500 });
    add({ label: "Formal shoes & belt", category: "clothing", priority: "high", weightGrams: 900 });
    add({ label: "Laptop + charger", category: "electronics", priority: "critical", weightGrams: 2000 });
    add({ label: "Visiting cards", category: "documents", quantity: 30, priority: "high", isDocument: true, weightGrams: 2 });
    add({ label: "Presentation backup on cloud & pen drive", category: "electronics", priority: "high", weightGrams: 20 });
    add({ label: "GST invoices / expense folder", category: "documents", priority: "normal", isDocument: true, weightGrams: 40, notes: "Ask hotels for a GST bill at check-out" });
    add({ label: "Travel iron / wrinkle spray", category: "misc", priority: "normal", weightGrams: 200 });
    add({ label: "Noise-cancelling earphones", category: "electronics", priority: "normal", weightGrams: 220 });
  },
  roadtrip: (cfg, add) => {
    add({ label: "Driving licence", category: "documents", priority: "critical", isDocument: true, weightGrams: 10 });
    add({ label: "Vehicle RC, insurance & PUC", category: "documents", priority: "critical", isDocument: true, weightGrams: 30, notes: "Digital copies in mParivahan count as valid" });
    add({ label: "FASTag recharged", category: "money", priority: "critical", weightGrams: 0, notes: "Cash lanes at tolls charge double" });
    add({ label: "Car phone mount & charger", category: "electronics", priority: "high", weightGrams: 200 });
    add({ label: "Puncture kit & foot pump", category: "gear", priority: "high", weightGrams: 1200 });
    add({ label: "Jumper cables & tow rope", category: "gear", priority: "normal", weightGrams: 1500 });
    add({ label: "Spare tyre checked", category: "gear", priority: "critical", weightGrams: 0 });
    add({ label: "Offline maps downloaded", category: "electronics", priority: "high", weightGrams: 0, notes: "Ghat sections lose signal for hours" });
    add({ label: "Road snacks & thermos of chai", category: "food", priority: "normal", weightGrams: 900 });
    add({ label: "Torch & reflective triangle", category: "gear", priority: "high", weightGrams: 400 });
  },
  wildlife: (cfg, add) => {
    add({ label: "Earth-toned clothing (olive / khaki)", category: "clothing", quantity: 2, priority: "high", weightGrams: 220, notes: "No bright colours or white on safari" });
    add({ label: "Binoculars", category: "gear", priority: "high", weightGrams: 700 });
    add({ label: "Telephoto lens / zoom camera", category: "electronics", priority: "normal", weightGrams: 1200 });
    add({ label: "Safari permit & park entry ID", category: "documents", priority: "critical", isDocument: true, weightGrams: 10, notes: "The ID must match the permit name exactly" });
    add({ label: "Mosquito repellent", category: "health", priority: "high", weightGrams: 120 });
    add({ label: "Windproof jacket for open jeep", category: "clothing", priority: "high", weightGrams: 500, notes: "Dawn safaris are freezing at 40 km/h" });
    add({ label: "Cap & neck buff for dust", category: "clothing", priority: "normal", weightGrams: 90 });
    add({ label: "Silent snacks (no crinkly wrappers)", category: "food", priority: "normal", weightGrams: 300 });
  },
  general: () => {},
};

/* ---------------------------------------------------------------------------
 * RULE LAYER 3 — destination traits
 * ------------------------------------------------------------------------ */

function destinationRules(cfg, add) {
  if (has(cfg, "high-altitude")) {
    add({ label: "Diamox (consult your doctor)", category: "health", priority: "critical", weightGrams: 25, notes: "Acute Mountain Sickness prophylaxis — start before you ascend" });
    add({ label: "Thermal base layers", category: "clothing", quantity: 2, priority: "critical", weightGrams: 260 });
    add({ label: "Lip balm with SPF", category: "toiletries", priority: "high", weightGrams: 15, notes: "Dry high-altitude air cracks lips within a day" });
    add({ label: "Heavy sunscreen SPF 50", category: "toiletries", priority: "high", weightGrams: 200, notes: "UV is brutal above 3,000 m" });
    add({ label: "Extra power bank", category: "electronics", priority: "high", weightGrams: 250, notes: "Cold drains phone batteries roughly twice as fast" });
    add({ label: "Pulse oximeter", category: "health", priority: "normal", weightGrams: 60, notes: "Track SpO2 on acclimatisation days" });
    add({ label: "Insulated flask", category: "gear", priority: "normal", weightGrams: 380 });
  }

  if (has(cfg, "extreme-cold")) {
    add({ label: "Down jacket", category: "clothing", priority: "critical", weightGrams: 900 });
    add({ label: "Woollen cap, gloves & neck warmer", category: "clothing", priority: "critical", weightGrams: 260 });
    add({ label: "Woollen socks", category: "clothing", quantity: 3, priority: "high", weightGrams: 90 });
    add({ label: "Hand warmers", category: "gear", priority: "normal", weightGrams: 40 });
  } else if (has(cfg, "cold") || has(cfg, "hill")) {
    add({ label: "Warm jacket", category: "clothing", priority: "high", weightGrams: 700 });
    add({ label: "Woollen cap", category: "clothing", priority: "normal", weightGrams: 90 });
  }

  if (has(cfg, "remote")) {
    add({ label: "Offline maps & downloaded playlists", category: "electronics", priority: "high", weightGrams: 0 });
    add({ label: "Printed emergency contacts", category: "documents", priority: "high", isDocument: true, weightGrams: 5, notes: "Networks vanish for whole valleys" });
    add({ label: "Extra cash — ATMs are scarce", category: "money", priority: "critical", weightGrams: 40 });
  }

  if (has(cfg, "permit")) {
    add({ label: "Inner Line Permit / protected-area permit", category: "documents", priority: "critical", isDocument: true, weightGrams: 10, notes: "Apply online before you travel; carry printouts" });
    add({ label: "Permit photocopies", category: "documents", quantity: 3, priority: "high", isDocument: true, weightGrams: 5, notes: "Checkposts keep one copy each" });
  }

  if (has(cfg, "coastal") || has(cfg, "humid")) {
    add({ label: "Quick-dry clothing", category: "clothing", quantity: scale(cfg.days, 0.4, { min: 2, max: 6 }), priority: "high", weightGrams: 180, notes: "Cotton never dries in coastal humidity" });
    add({ label: "Mosquito repellent", category: "health", priority: "high", weightGrams: 120 });
    add({ label: "Anti-fungal powder", category: "toiletries", priority: "normal", weightGrams: 100 });
    add({ label: "Silica gel packs for camera bag", category: "gear", priority: "normal", weightGrams: 30 });
  }

  if (has(cfg, "desert") || has(cfg, "arid")) {
    add({ label: "Cotton scarf / shemagh", category: "clothing", priority: "high", weightGrams: 120, notes: "Sun by day, dust on the dunes" });
    add({ label: "Heavy moisturiser & lip balm", category: "toiletries", priority: "high", weightGrams: 130 });
    add({ label: "Electrolyte sachets", category: "health", quantity: Math.max(6, cfg.travellers * 3), priority: "high", weightGrams: 20 });
    add({ label: "Layer for cold desert nights", category: "clothing", priority: "high", weightGrams: 500, notes: "Thar nights drop 20°C below the daytime high" });
  }

  if (has(cfg, "monsoon-heavy")) {
    add({ label: "Dry bags for electronics", category: "gear", quantity: 2, priority: "high", weightGrams: 120 });
    add({ label: "Rain jacket or poncho", category: "clothing", priority: "high", weightGrams: 300 });
  }

  if (has(cfg, "wildlife-country")) {
    add({ label: "Mosquito repellent", category: "health", priority: "high", weightGrams: 120 });
    add({ label: "Full-sleeve earth-toned shirt", category: "clothing", priority: "normal", weightGrams: 200 });
  }

  if (has(cfg, "temple-country") || has(cfg, "pilgrim-circuit")) {
    add({ label: "Cloth bag for footwear", category: "gear", priority: "normal", weightGrams: 60, notes: "Shoe stands charge per pair" });
    add({ label: "Scarf / stole to cover head", category: "clothing", priority: "normal", weightGrams: 120 });
  }

  if (has(cfg, "dry-state")) {
    add({ label: "Liquor permit (if required)", category: "documents", priority: "normal", isDocument: true, weightGrams: 5, notes: "Alcohol is restricted in this state" });
  }

  if (has(cfg, "metro")) {
    add({ label: "Metro card / transit app", category: "money", priority: "normal", weightGrams: 10 });
    add({ label: "N95 or anti-pollution mask", category: "health", priority: "normal", weightGrams: 20 });
  }
}

/* ---------------------------------------------------------------------------
 * RULE LAYER 4 — season
 * ------------------------------------------------------------------------ */

function seasonRules(cfg, add) {
  switch (cfg.season) {
    case "winter":
      add({ label: "Warm jacket", category: "clothing", priority: "high", weightGrams: 700 });
      add({ label: "Woollen inner layer", category: "clothing", quantity: 2, priority: "high", weightGrams: 250 });
      add({ label: "Cold cream / heavy moisturiser", category: "toiletries", priority: "normal", weightGrams: 120 });
      add({ label: "Buffer for fog delays", category: "misc", priority: "normal", weightGrams: 0, notes: "North Indian trains and flights run late Dec–Jan" });
      break;
    case "summer":
      add({ label: "Sunscreen SPF 50", category: "toiletries", priority: "high", weightGrams: 200 });
      add({ label: "Cotton loose clothing", category: "clothing", quantity: scale(cfg.days, 0.5, { min: 2, max: 7 }), priority: "high", weightGrams: 180 });
      add({ label: "Wide-brim hat or cap", category: "clothing", priority: "high", weightGrams: 110 });
      add({ label: "Electrolyte / glucose sachets", category: "health", quantity: Math.max(6, cfg.travellers * 3), priority: "high", weightGrams: 20 });
      add({ label: "Handheld fan or cooling towel", category: "misc", priority: "normal", weightGrams: 150 });
      break;
    case "monsoon":
      add({ label: "Compact umbrella", category: "gear", priority: "high", weightGrams: 300 });
      add({ label: "Rain jacket or poncho", category: "clothing", priority: "high", weightGrams: 300 });
      add({ label: "Waterproof sandals", category: "clothing", priority: "high", weightGrams: 350, notes: "Leather shoes will not survive the rain" });
      add({ label: "Zip-lock bags for documents", category: "gear", quantity: 4, priority: "high", weightGrams: 15 });
      add({ label: "Anti-fungal powder", category: "toiletries", priority: "normal", weightGrams: 100 });
      add({ label: "Extra pair of dry socks", category: "clothing", quantity: 2, priority: "normal", weightGrams: 50 });
      break;
    default:
      add({ label: "Light jacket for evenings", category: "clothing", priority: "normal", weightGrams: 400 });
      add({ label: "Compact umbrella", category: "gear", priority: "normal", weightGrams: 300 });
      break;
  }
}

/* ---------------------------------------------------------------------------
 * RULE LAYER 5 — traveller mix
 * ------------------------------------------------------------------------ */

function travellerRules(cfg, add) {
  if (cfg.children > 0) {
    const kids = cfg.children;
    add({ label: "Children's medicine & fever syrup", category: "health", priority: "critical", weightGrams: 200, notes: "Paediatric dosage, with the prescription" });
    add({ label: "Kids' spare clothes", category: "clothing", quantity: scale(cfg.days, 1.2 * kids, { max: 20 }), priority: "high", weightGrams: 140 });
    add({ label: "Wet wipes (extra packs)", category: "toiletries", quantity: kids * 2, priority: "high", weightGrams: 180 });
    add({ label: "Favourite snacks & juice boxes", category: "food", quantity: kids * 3, priority: "high", weightGrams: 250 });
    add({ label: "Travel games / tablet with downloads", category: "misc", priority: "normal", weightGrams: 400 });
    add({ label: "Child ID card with your phone number", category: "documents", quantity: kids, priority: "critical", isDocument: true, weightGrams: 5, notes: "In a pocket, in case you get separated in a crowd" });
    add({ label: "Sunhat for each child", category: "clothing", quantity: kids, priority: "normal", weightGrams: 90 });
  }

  if (cfg.hasFemaleTravellers) {
    add({ label: "Sanitary products", category: "toiletries", quantity: scale(cfg.days, 0.6, { min: 4, max: 20 }), priority: "high", weightGrams: 15, notes: "Stock up — remote stops rarely carry your brand" });
    add({ label: "Disposable toilet-seat covers / she-funnel", category: "toiletries", priority: "normal", weightGrams: 80 });
    add({ label: "Dupatta / stole", category: "clothing", priority: "normal", weightGrams: 150, notes: "Sun cover, temple cover, dust cover" });
    add({ label: "Personal safety alarm", category: "misc", priority: "normal", weightGrams: 40 });
  }

  if (cfg.travellers > 2) {
    add({ label: "Shared first-aid kit", category: "health", priority: "high", weightGrams: 500 });
    add({ label: "Group expense tracker (Splitwise etc.)", category: "money", priority: "normal", weightGrams: 0 });
  }

  if (cfg.days >= 7) {
    add({ label: "Detergent sachets", category: "toiletries", quantity: 3, priority: "normal", weightGrams: 30, notes: "Long trips need a laundry day" });
    add({ label: "Nail cutter & grooming kit", category: "toiletries", priority: "normal", weightGrams: 120 });
  }
}

/* ---------------------------------------------------------------------------
 * PUBLIC API
 * ------------------------------------------------------------------------ */

/**
 * Build a smart packing list from a trip configuration.
 *
 * @param {Object} tripConfig
 * @param {string} tripConfig.destination        Free text, e.g. "Leh, Ladakh"
 * @param {string} tripConfig.tripType           One of TRIP_TYPES ids
 * @param {string} tripConfig.startDate          ISO date string (yyyy-mm-dd)
 * @param {number} tripConfig.days               Duration in days
 * @param {number} tripConfig.adults
 * @param {number} tripConfig.children
 * @param {boolean} tripConfig.hasFemaleTravellers
 * @returns {Array<Object>} fully-formed checklist items, sorted by category
 */
export function generateChecklist(tripConfig = {}) {
  const cfg = normalizeTripConfig(tripConfig);
  const map = new Map();
  const add = (partial) => mergeItem(map, { ...partial, autoAdded: true });

  baseRules(cfg, add);
  (TRIP_TYPE_RULES[cfg.tripType] || TRIP_TYPE_RULES.general)(cfg, add);
  destinationRules(cfg, add);
  seasonRules(cfg, add);
  travellerRules(cfg, add);

  return sortItems(Array.from(map.values()));
}

/** Category order first, then priority, then alphabetical — stable for the UI. */
export function sortItems(items) {
  const catOrder = CATEGORIES.reduce((acc, c, i) => {
    acc[c.id] = i;
    return acc;
  }, {});
  return [...items].sort((a, b) => {
    const c = (catOrder[a.category] ?? 99) - (catOrder[b.category] ?? 99);
    if (c !== 0) return c;
    const p = PRIORITIES[b.priority].rank - PRIORITIES[a.priority].rank;
    if (p !== 0) return p;
    return a.label.localeCompare(b.label);
  });
}

/* ---------------------------------------------------------------------------
 * Starter templates
 * A template is just a trip-shaped preset, so applying one runs the exact same
 * engine — no second source of truth.
 * ------------------------------------------------------------------------ */

export const TEMPLATES = [
  {
    id: "himalayan-trek",
    name: "Himalayan trek",
    blurb: "High passes, cold nights, thin air. Built around a 6-day Himachal trek.",
    icon: "Mountain",
    preset: { destination: "Spiti, Himachal Pradesh", tripType: "trek", days: 6, adults: 2, children: 0 },
  },
  {
    id: "beach-getaway",
    name: "Beach getaway",
    blurb: "Sun, salt and sand — Goa and the Konkan coast, four easy days.",
    icon: "Waves",
    preset: { destination: "Goa", tripType: "beach", days: 4, adults: 2, children: 0 },
  },
  {
    id: "heritage-circuit",
    name: "Heritage circuit",
    blurb: "Delhi–Agra–Jaipur style monument hopping with early starts.",
    icon: "Landmark",
    preset: { destination: "Agra, Uttar Pradesh", tripType: "heritage", days: 5, adults: 2, children: 0 },
  },
  {
    id: "pilgrimage",
    name: "Pilgrimage / yatra",
    blurb: "Modest dress, long climbs and registration paperwork sorted.",
    icon: "Sun",
    preset: { destination: "Kedarnath, Uttarakhand", tripType: "pilgrimage", days: 4, adults: 2, children: 0 },
  },
  {
    id: "business-trip",
    name: "Business trip",
    blurb: "Three formal days in a metro — laptop, invoices, wrinkle-free.",
    icon: "Briefcase",
    preset: { destination: "Bengaluru, Karnataka", tripType: "business", days: 3, adults: 1, children: 0 },
  },
  {
    id: "wildlife-safari",
    name: "Wildlife safari",
    blurb: "Dawn jeep runs in tiger country — earth tones and long lenses.",
    icon: "Binoculars",
    preset: { destination: "Bandhavgarh, Madhya Pradesh", tripType: "wildlife", days: 3, adults: 2, children: 0 },
  },
];

/**
 * Items for a template, merged onto the trip's own context where sensible.
 * The user's real destination/date win; the template supplies the shape.
 */
export function generateFromTemplate(templateId, tripConfig = {}) {
  const template = TEMPLATES.find((t) => t.id === templateId);
  if (!template) return [];
  return generateChecklist({
    ...template.preset,
    ...Object.fromEntries(
      Object.entries(tripConfig).filter(([, v]) => v !== undefined && v !== null && v !== "")
    ),
    tripType: template.preset.tripType,
  });
}

/* ---------------------------------------------------------------------------
 * India-specific advisories
 * ------------------------------------------------------------------------ */

/**
 * Contextual notes shown above the checklist. Tone drives the UI colour:
 * "critical" (gold-red), "warning" (gold), "info" (muted).
 */
export function getTripInsights(tripConfig = {}) {
  const cfg = normalizeTripConfig(tripConfig);
  const notes = [];
  const monsoonMonth = [5, 6, 7, 8].includes(cfg.month); // Jun–Sep

  if (monsoonMonth && (has(cfg, "coastal") || has(cfg, "hill") || has(cfg, "monsoon-heavy"))) {
    notes.push({
      id: "monsoon",
      tone: "warning",
      icon: "CloudRain",
      title: "Monsoon window — travelling Jun to Sep",
      body: `${cfg.profile.label} takes the full force of the southwest monsoon. Expect landslide closures, ferry cancellations and days of continuous rain. Pack everything electronic in dry bags, keep a buffer day, and check road status the morning you travel.`,
    });
  }

  if (has(cfg, "high-altitude")) {
    notes.push({
      id: "altitude",
      tone: "critical",
      icon: "Mountain",
      title: "High altitude — acclimatise before you climb",
      body: `${cfg.profile.label} sits well above 3,000 m. Give yourself 24–48 hours at the first stop before going higher, drink far more water than feels necessary, avoid alcohol on day one, and talk to a doctor about Diamox. Cold also halves your power bank's useful capacity.`,
    });
  }

  notes.push({
    id: "id-copies",
    tone: "info",
    icon: "IdCard",
    title: "Carry physical ID copies",
    body: "Indian hotels, homestays and checkposts still ask for a printed photo-ID copy at check-in, and network coverage is not guaranteed. Carry two photocopies per traveller plus four passport photos for permits and SIM cards.",
  });

  if (has(cfg, "permit")) {
    notes.push({
      id: "permit",
      tone: "warning",
      icon: "Stamp",
      title: "Protected area — permit required",
      body: `${cfg.profile.region} needs an Inner Line or protected-area permit for most visitors. Apply online in advance and carry at least three printouts — every checkpost keeps a copy.`,
    });
  }

  if (has(cfg, "desert") && cfg.season === "summer") {
    notes.push({
      id: "heat",
      tone: "warning",
      icon: "Thermometer",
      title: "Peak desert heat",
      body: "Daytime highs cross 45°C. Plan sightseeing before 10am and after 5pm, carry 3–4 litres of water per person per day, and keep electrolytes on hand.",
    });
  }

  if (has(cfg, "dry-state")) {
    notes.push({
      id: "dry-state",
      tone: "info",
      icon: "Info",
      title: "Alcohol is restricted here",
      body: `${cfg.profile.region} restricts the sale and carriage of alcohol. If you need a permit, apply through the state excise portal or your hotel before arriving.`,
    });
  }

  return notes;
}

/* ---------------------------------------------------------------------------
 * Derived stats & exports
 * ------------------------------------------------------------------------ */

/** Total estimated pack weight in grams (quantity-aware). */
export function estimateTotalWeight(items = []) {
  return items.reduce((sum, i) => sum + (i.weightGrams || 0) * (i.quantity || 1), 0);
}

/** 1250 → "1.25 kg", 640 → "640 g" */
export function formatWeight(grams) {
  if (!grams) return "0 g";
  if (grams < 1000) return `${Math.round(grams)} g`;
  return `${(grams / 1000).toFixed(grams < 10000 ? 2 : 1)} kg`;
}

/** Whole days from today until departure. Negative once the trip has started. */
export function daysUntil(startDate) {
  if (!startDate) return null;
  const target = new Date(startDate);
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date();
  target.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.round((target - today) / 86400000);
}

/** Everything the readiness panel needs, in one pass. */
export function getChecklistStats(items = []) {
  const total = items.length;
  const packed = items.filter((i) => i.packed).length;
  const critical = items.filter((i) => i.priority === "critical");
  const criticalPacked = critical.filter((i) => i.packed).length;
  const documents = items.filter((i) => i.isDocument);
  return {
    total,
    packed,
    remaining: total - packed,
    percent: total ? Math.round((packed / total) * 100) : 0,
    criticalTotal: critical.length,
    criticalPacked,
    criticalPercent: critical.length ? Math.round((criticalPacked / critical.length) * 100) : 100,
    criticalReady: critical.length > 0 && criticalPacked === critical.length,
    allReady: total > 0 && packed === total,
    documentsTotal: documents.length,
    documentsPacked: documents.filter((i) => i.packed).length,
    packedWeight: estimateTotalWeight(items.filter((i) => i.packed)),
    totalWeight: estimateTotalWeight(items),
  };
}

const DATE_FMT = { day: "numeric", month: "short", year: "numeric" };

/** Human date, safely. */
export function formatDate(value) {
  if (!value) return "Date not set";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "Date not set";
  return d.toLocaleDateString("en-IN", DATE_FMT);
}

/**
 * Plain-text checklist — deliberately WhatsApp-shaped: no markdown tables,
 * short lines, emoji-free, checkbox glyphs that survive copy-paste.
 */
export function checklistToText(trip) {
  const items = trip.items || [];
  const stats = getChecklistStats(items);
  const lines = [];

  lines.push(`SafarX — Packing checklist`);
  lines.push(`${trip.name}`);
  const meta = [trip.destination, `${trip.days} day${trip.days === 1 ? "" : "s"}`];
  if (trip.startDate) meta.push(`from ${formatDate(trip.startDate)}`);
  lines.push(meta.filter(Boolean).join(" · "));
  lines.push(
    `Packed ${stats.packed}/${stats.total} · Critical ${stats.criticalPacked}/${stats.criticalTotal} · Approx ${formatWeight(stats.totalWeight)}`
  );
  lines.push("");

  for (const cat of CATEGORIES) {
    const list = items.filter((i) => i.category === cat.id);
    if (!list.length) continue;
    const done = list.filter((i) => i.packed).length;
    lines.push(`${cat.label.toUpperCase()} (${done}/${list.length})`);
    for (const item of sortItems(list)) {
      const box = item.packed ? "[x]" : "[ ]";
      const qty = item.quantity > 1 ? ` x${item.quantity}` : "";
      const flag = item.priority === "critical" ? " (must)" : "";
      const note = item.notes ? ` — ${item.notes}` : "";
      lines.push(`${box} ${item.label}${qty}${flag}${note}`);
    }
    lines.push("");
  }

  lines.push("Generated with SafarX · safarx.app");
  return lines.join("\n");
}
