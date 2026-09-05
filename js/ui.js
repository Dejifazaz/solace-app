/* Solace — small shared UI helpers */

function initials(name) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function statCard({ label, value, sub, accent }) {
  const accentClasses = accent || "bg-brand-500 text-white";
  return `
    <div class="rounded-card bg-white shadow-card p-5 flex flex-col gap-3">
      <div class="w-10 h-10 rounded-xl ${accentClasses} flex items-center justify-center text-sm font-semibold">
        ${value.toString().charAt(0)}
      </div>
      <div>
        <p class="text-2xl font-semibold text-ink">${value}</p>
        <p class="text-sm text-ink-400">${label}</p>
        ${sub ? `<p class="text-xs text-brand-600 mt-1">${sub}</p>` : ""}
      </div>
    </div>
  `;
}

function statusPill(status) {
  const meta = CALL_STATUS_META[status] || { label: status, classes: "bg-ink-50 text-ink-400" };
  return `<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${meta.classes}">${meta.label}</span>`;
}

function taskStatusPill(status) {
  const map = {
    todo: { label: "To Do", classes: "bg-ink-50 text-ink-400" },
    in_progress: { label: "In Progress", classes: "bg-amber-100 text-amber-800" },
    done: { label: "Done", classes: "bg-brand-100 text-brand-700" },
  };
  const meta = map[status] || map.todo;
  return `<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${meta.classes}">${meta.label}</span>`;
}

function sourcePill(source) {
  const meta = LEAD_SOURCE_META[source] || LEAD_SOURCE_META.other;
  return `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${meta.classes}">${meta.label}</span>`;
}

function formatMoney(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return "$" + Math.round(value).toLocaleString("en-US");
}

function teamBadge(team) {
  const map = {
    acquisition: { label: "Acquisition", classes: "bg-brand-100 text-brand-700" },
    operations: { label: "Operations", classes: "bg-ink-50 text-ink-600" },
    marketing: { label: "Marketing", classes: "bg-amber-100 text-amber-800" },
  };
  const meta = map[team] || { label: team, classes: "bg-ink-50 text-ink-400" };
  return `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${meta.classes}">${meta.label}</span>`;
}

function progressBar(percent, colorClasses) {
  // Guard against 0-target math (0/0 = NaN, x/0 = Infinity) — a blank
  // template with no target set yet should render an empty bar, not a
  // broken CSS width.
  const pct = Number.isFinite(percent) ? Math.max(0, Math.min(100, percent)) : 0;
  return `
    <div class="w-full h-2 rounded-full bg-brand-100 overflow-hidden">
      <div class="h-full rounded-full ${colorClasses || "bg-brand-500"}" style="width:${pct}%"></div>
    </div>
  `;
}

function formatDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function daysBetween(a, b) {
  const ms = new Date(b) - new Date(a);
  return Math.round(ms / (1000 * 60 * 60 * 24));
}
