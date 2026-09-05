/* Solace — dependency-free CSS Grid Gantt renderer */

function renderGantt(containerId, projects) {
  const el = document.getElementById(containerId);
  if (!el) return;
  if (projects.length === 0) {
    el.innerHTML = `<p class="text-sm text-ink-400 py-6 text-center">No projects yet. Add one to see it on the timeline.</p>`;
    return;
  }

  const starts = projects.map((p) => new Date(p.start));
  const ends = projects.map((p) => new Date(p.end));
  const rangeStart = new Date(Math.min(...starts));
  const rangeEnd = new Date(Math.max(...ends));
  const totalWeeks = Math.max(1, Math.ceil(daysBetween(rangeStart, rangeEnd) / 7)) + 1;

  const today = new Date();
  const todayCol = Math.min(totalWeeks, Math.max(0, daysBetween(rangeStart, today) / 7));

  const weekHeaders = Array.from({ length: totalWeeks }, (_, i) => {
    const d = new Date(rangeStart);
    d.setDate(d.getDate() + i * 7);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  });

  const headerCols = weekHeaders
    .map(
      (label) =>
        `<div class="text-[11px] text-ink-400 font-medium border-l border-brand-100 px-2 py-2">${label}</div>`
    )
    .join("");

  const rows = projects
    .map((p) => {
      const startCol = daysBetween(rangeStart, p.start) / 7;
      const spanWeeks = Math.max(1, daysBetween(p.start, p.end) / 7);
      const leftPct = (startCol / totalWeeks) * 100;
      const widthPct = (spanWeeks / totalWeeks) * 100;
      return `
        <div class="grid items-center border-t border-brand-100" style="grid-template-columns: 220px 1fr;">
          <div class="px-3 py-4 pr-4">
            <p class="text-sm font-medium text-ink truncate">${p.name}</p>
            <div class="flex items-center gap-2 mt-1">${teamBadge(p.team)}<span class="text-xs text-ink-400">${p.owner}</span></div>
          </div>
          <div class="relative h-14 py-4">
            <div class="absolute h-6 rounded-card bg-brand-100 overflow-hidden" style="left:${leftPct}%; width:${widthPct}%;">
              <div class="h-full bg-brand-500" style="width:${p.progress}%"></div>
            </div>
            <div class="absolute h-6 flex items-center px-2" style="left:${leftPct}%; width:${widthPct}%;">
              <span class="text-[11px] font-medium text-ink-900/80 truncate">${p.progress}%</span>
            </div>
          </div>
        </div>
      `;
    })
    .join("");

  el.innerHTML = `
    <div class="min-w-[720px]">
      <div class="grid" style="grid-template-columns: 220px repeat(${totalWeeks}, minmax(64px, 1fr));">
        <div></div>
        ${headerCols}
      </div>
      <div class="relative">
        <div class="absolute top-0 bottom-0 w-px bg-ink-900/40 z-10" style="left: calc(220px + ${todayCol / totalWeeks} * (100% - 220px));"></div>
        ${rows}
      </div>
    </div>
  `;
}
