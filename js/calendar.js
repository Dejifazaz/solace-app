/* Solace — dependency-free month-grid calendar renderer */

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function localDateStr(year, month, day) {
  const mm = String(month + 1).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

function renderCalendar(containerId, year, month, events) {
  // month is 0-indexed
  const el = document.getElementById(containerId);
  if (!el) return;

  const firstOfMonth = new Date(year, month, 1);
  const startOffset = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;

  const todayString = todayStr();

  const headerRow = WEEKDAY_LABELS.map(
    (d) => `<div class="text-[11px] font-semibold uppercase tracking-wide text-ink-400 text-center py-2">${d}</div>`
  ).join("");

  let cells = "";
  for (let i = 0; i < totalCells; i++) {
    let dayNum, cellMonth, muted;
    if (i < startOffset) {
      dayNum = daysInPrevMonth - startOffset + i + 1;
      cellMonth = month - 1;
      muted = true;
    } else if (i >= startOffset + daysInMonth) {
      dayNum = i - startOffset - daysInMonth + 1;
      cellMonth = month + 1;
      muted = true;
    } else {
      dayNum = i - startOffset + 1;
      cellMonth = month;
      muted = false;
    }
    const normalizedMonth = ((cellMonth % 12) + 12) % 12;
    const normalizedYear = year + Math.floor(cellMonth / 12);
    const dateStr = localDateStr(normalizedYear, normalizedMonth, dayNum);
    const isToday = dateStr === todayString && !muted;
    const dayEvents = (events[dateStr] || []).slice(0, 3);
    const overflow = (events[dateStr] || []).length - dayEvents.length;

    const chips = dayEvents
      .map(
        (ev) =>
          `<div class="text-[10px] px-1.5 py-0.5 rounded-md truncate ${ev.classes}">${ev.label}</div>`
      )
      .join("");

    cells += `
      <div class="min-h-[92px] border border-brand-100 rounded-lg p-1.5 ${muted ? "bg-brand-50/40" : "bg-white"}">
        <div class="flex justify-end">
          <span class="text-xs w-6 h-6 flex items-center justify-center rounded-full ${isToday ? "bg-brand-500 text-white font-semibold" : muted ? "text-ink-400/60" : "text-ink-600"}">${dayNum}</span>
        </div>
        <div class="flex flex-col gap-1 mt-1">
          ${chips}
          ${overflow > 0 ? `<div class="text-[10px] text-ink-400 px-1">+${overflow} more</div>` : ""}
        </div>
      </div>
    `;
  }

  el.innerHTML = `
    <div class="grid grid-cols-7">${headerRow}</div>
    <div class="grid grid-cols-7 gap-1.5 mt-1">${cells}</div>
  `;
}

function buildCalendarEvents(tasks, calls) {
  const events = {};
  const push = (date, label, classes) => {
    if (!events[date]) events[date] = [];
    events[date].push({ label, classes });
  };
  tasks.forEach((t) => {
    if (t.status === "done") return;
    push(t.dueDate, t.title, "bg-brand-100 text-brand-700");
  });
  calls
    .filter((c) => c.status === "callback")
    .forEach((c) => push(c.date, `Callback: ${c.contactName}`, "bg-ink-900 text-white"));
  return events;
}
