/* Solace — data layer. Hydrates once from the server (SQLite-backed) into an
   in-memory cache, so Store.get/set stay synchronous for every page's
   rendering code — only hydrate() and the background sync in set() are
   actually async. */

const Store = {
  _cache: {},
  _hasKey(key) {
    return Object.prototype.hasOwnProperty.call(Store._cache, key);
  },
  async hydrate() {
    const res = await fetch("/api/store");
    if (res.status === 401) {
      window.location.href = "/login.html?next=" + encodeURIComponent(location.pathname);
      return new Promise(() => {}); // never resolves — we're navigating away
    }
    Store._cache = await res.json();
  },
  get(key, fallback) {
    return Store._hasKey(key) ? Store._cache[key] : fallback;
  },
  set(key, value) {
    Store._cache[key] = value;
    fetch("/api/store/" + encodeURIComponent(key), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(value),
    }).catch((err) => console.error("Failed to save " + key, err));
  },
  update(key, updaterFn, fallback) {
    const current = Store.get(key, fallback);
    const next = updaterFn(current);
    Store.set(key, next);
    return next;
  },
  ensureSeeded() {
    // One-time purge of the old demo dataset (Jane Okafor, etc.) so every
    // install — including ones that already have data — starts from a clean
    // template. Runs once; anything added afterward is safe.
    const storedSeedVersion = parseInt(Store.get("seedVersion", 1), 10);
    if (storedSeedVersion < SEED_VERSION) {
      Store.set("contacts", []);
      Store.set("calls", []);
      Store.set("properties", []);
      Store.set("projects", []);
      Store.set("tasks", []);
      Store.set("seedVersion", SEED_VERSION);
    }

    if (!Store._hasKey("goals")) Store.set("goals", seedGoals());
    if (!Store._hasKey("calls")) Store.set("calls", seedCalls());
    if (!Store._hasKey("properties")) Store.set("properties", seedProperties());
    if (!Store._hasKey("contacts")) Store.set("contacts", seedContacts());
    if (!Store._hasKey("projects")) Store.set("projects", seedProjects());
    if (!Store._hasKey("tasks")) Store.set("tasks", seedTasks());
    if (!Store._hasKey("transactions")) Store.set("transactions", seedTransactions());
    if (!Store._hasKey("leases")) Store.set("leases", seedLeases());
    if (!Store._hasKey("workOrders")) Store.set("workOrders", seedWorkOrders());
    // Docs have no create/edit UI in the app, so there's no user data to
    // preserve here — always resync so content-page fixes reach everyone.
    Store.set("docs", seedDocs());
    Store.migrate();
  },
  // Backfills fields added after a user's first visit, without touching
  // anything they've already entered through the UI.
  migrate() {
    const legacyStatusToStage = {
      acquired: "closed",
      active: "closed",
      "under offer": "under_contract",
      negotiating: "negotiating",
      prospecting: "contacted",
    };
    Store.update("properties", (properties) =>
      properties.map((p) => ({
        ...p,
        stage: p.stage || (p.type === "owned" ? "closed" : legacyStatusToStage[p.status] || "lead"),
        arv: p.arv ?? null,
        repairEstimate: p.repairEstimate ?? null,
        offerPrice: p.offerPrice ?? (p.type === "target" ? p.estValue : null),
        // Unknown close date for pre-existing owned properties — leave null
        // (not "this month") rather than guessing, so the monthly stat stays honest.
        closedAt: p.closedAt !== undefined ? p.closedAt : null,
        comps: p.comps || [],
      })),
      []
    );
    Store.update("contacts", (contacts) => contacts.map((c) => ({ ...c, source: c.source || "other" })), []);
  },
};

const SEED_VERSION = 2;

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function mondayOfWeekStr() {
  const d = new Date();
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1) - day);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const TODAY = todayStr();
const FOLLOWUP_THRESHOLD_DAYS = 3;

const CALL_STATUS_META = {
  will_get_back: { label: "Will Get Back To Us", classes: "bg-brand-100 text-brand-700" },
  in_progress: { label: "In Progress", classes: "bg-amber-100 text-amber-800" },
  not_in_progress: { label: "Not In Progress", classes: "bg-ink-50 text-ink-400" },
  callback: { label: "Callback", classes: "bg-ink-900 text-white" },
};

const PROPERTY_STAGES = [
  { key: "lead", label: "Lead" },
  { key: "contacted", label: "Contacted" },
  { key: "negotiating", label: "Negotiating" },
  { key: "under_contract", label: "Under Contract" },
  { key: "closed", label: "Closed" },
];

const TRANSACTION_CATEGORIES = {
  income: [
    { key: "rent", label: "Rent" },
    { key: "other", label: "Other Income" },
  ],
  expense: [
    { key: "repairs", label: "Repairs & Maintenance" },
    { key: "mortgage", label: "Mortgage" },
    { key: "taxes", label: "Property Taxes" },
    { key: "insurance", label: "Insurance" },
    { key: "utilities", label: "Utilities" },
    { key: "management_fee", label: "Management Fee" },
    { key: "other", label: "Other Expense" },
  ],
};

const WORK_ORDER_STATUS_META = {
  open: { label: "Open", classes: "bg-amber-100 text-amber-800" },
  in_progress: { label: "In Progress", classes: "bg-brand-100 text-brand-700" },
  done: { label: "Done", classes: "bg-ink-50 text-ink-400" },
};

const WORK_ORDER_PRIORITY_META = {
  low: { label: "Low", classes: "bg-ink-50 text-ink-400" },
  medium: { label: "Medium", classes: "bg-amber-100 text-amber-800" },
  high: { label: "High", classes: "bg-red-100 text-red-700" },
};

const LEAD_SOURCE_META = {
  cold_call: { label: "Cold Call", classes: "bg-brand-100 text-brand-700" },
  direct_mail: { label: "Direct Mail", classes: "bg-amber-100 text-amber-800" },
  referral: { label: "Referral", classes: "bg-ink-50 text-ink-600" },
  driving_for_dollars: { label: "Driving for Dollars", classes: "bg-brand-200 text-brand-800" },
  inbound: { label: "Inbound", classes: "bg-ink-900 text-white" },
  other: { label: "Other", classes: "bg-ink-50 text-ink-400" },
};

function uid(prefix) {
  return prefix + "_" + Math.random().toString(36).slice(2, 9);
}

function daysSince(dateStr) {
  return daysBetween(dateStr, TODAY);
}

// Blank template — every number here is 0 and every label is a generic
// placeholder. Nothing is pre-filled with assumed targets; fill it in via
// the OKR Goals page.
function seedGoals() {
  const year = new Date().getFullYear();
  return {
    daily: { callsTarget: 0, label: "Landlord / agent calls", date: TODAY },
    weekly: { callsTarget: 0, dealsTarget: 0, weekStart: mondayOfWeekStr() },
    monthly: { callsTarget: 0, dealsTarget: 0, propertiesAcquiredTarget: 0, month: TODAY.slice(0, 7) },
    threeYear: {
      label: "3-Year Plan",
      targetProperties: 0,
      targetRevenue: 0,
      milestones: [
        { year: year, label: "Year 1", target: 0 },
        { year: year + 1, label: "Year 2", target: 0 },
        { year: year + 2, label: "Year 3", target: 0 },
      ],
    },
  };
}

// No mock records — this is a template. Contacts, calls, properties,
// projects, and tasks all start empty and get filled in through the app's
// own forms (Call Log, Property Pipeline, CRM, Tasks, Projects).
function seedContacts() {
  return [];
}

function seedCalls() {
  return [];
}

function seedProperties() {
  return [];
}

function seedProjects() {
  return [];
}

function seedTasks() {
  return [];
}

function seedTransactions() {
  return [];
}

function seedLeases() {
  return [];
}

function seedWorkOrders() {
  return [];
}

function seedDocs() {
  return [
    { id: "doc_001", title: "Acquisition Playbook", team: "acquisition", summary: "Standard process for evaluating and calling on a target property.", updatedAt: "2026-08-01T00:00:00Z", contentPage: "docs-sample-1.html" },
    { id: "doc_002", title: "Operations Handbook", team: "operations", summary: "Maintenance escalation, vendor contacts, and inspection cadence.", updatedAt: "2026-07-28T00:00:00Z", contentPage: "docs-sample-2.html" },
    { id: "doc_003", title: "Brand & Messaging Guide", team: "marketing", summary: "Voice, tone, and visual guidelines for Solace campaigns.", updatedAt: "2026-07-15T00:00:00Z", contentPage: "docs-sample-3.html" },
  ];
}

// Kicks off as soon as this script runs — every page awaits Store.ready
// before rendering, so hydration overlaps with the rest of page load
// instead of blocking it.
Store.ready = Store.hydrate().then(() => {
  Store.ensureSeeded();
});
