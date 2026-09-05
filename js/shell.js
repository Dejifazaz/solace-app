/* Solace — shared sidebar/topbar shell, injected into every page */

const ICONS = {
  home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h3v-6h6v6h3a1 1 0 0 0 1-1V9.5"/>',
  target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="0.5" fill="currentColor"/>',
  folder: '<path d="M3 7a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7Z"/>',
  check: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4M16 2v4M3 9h18"/><path d="m8.5 13 2 2 4-4"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',
  docs: '<path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 16.5h6"/>',
  users: '<circle cx="9" cy="8" r="3"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17.5" cy="9" r="2.5"/><path d="M15 20a5.5 5.5 0 0 1 8-4.9"/>',
  building: '<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M9 8h1M14 8h1M9 12h1M14 12h1M9 16h1M14 16h1"/>',
  wrench: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.8 2.8-2-2 2.8-2.8Z"/>',
  megaphone: '<path d="M3 11v2a2 2 0 0 0 2 2h1l1 5h2l-1-5h3l6 4V7l-6 4H6a2 2 0 0 0-2 2Z" transform="translate(0,-2)"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
};

function icon(name, extraClass) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="${extraClass || "w-5 h-5"}">${ICONS[name] || ""}</svg>`;
}

const NAV_SECTIONS = [
  {
    label: "Main Hub",
    items: [
      { key: "dashboard", label: "Home", href: "index.html", icon: "home" },
      { key: "goals", label: "OKR Goals", href: "goals.html", icon: "target" },
      { key: "projects", label: "Projects", href: "projects.html", icon: "folder" },
      { key: "tasks", label: "Tasks", href: "tasks.html", icon: "check" },
      { key: "calendar", label: "Calendar", href: "calendar.html", icon: "calendar" },
      { key: "docs", label: "Docs", href: "docs.html", icon: "docs" },
      { key: "crm", label: "CRM", href: "crm.html", icon: "users" },
    ],
  },
  {
    label: "Teamspaces",
    items: [
      { key: "team-acquisition", label: "Property Acquisition", href: "team-acquisition.html", icon: "building" },
      { key: "team-operations", label: "Operations", href: "team-operations.html", icon: "wrench" },
      { key: "team-marketing", label: "Marketing", href: "team-marketing.html", icon: "megaphone" },
    ],
  },
];

function renderSidebar(activeKey) {
  const sections = NAV_SECTIONS.map((section) => {
    const items = section.items
      .map((item) => {
        const isActive = item.key === activeKey;
        const activeClasses = isActive ? "bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-card" : "text-ink-600 hover:bg-brand-50";
        return `
          <a href="${item.href}" class="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${activeClasses}">
            ${icon(item.icon, "w-[18px] h-[18px] shrink-0")}
            <span>${item.label}</span>
          </a>
        `;
      })
      .join("");
    return `
      <div class="mb-6">
        <p class="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-400">${section.label}</p>
        <nav class="flex flex-col gap-1">${items}</nav>
      </div>
    `;
  }).join("");

  return `
    <div id="solace-overlay" class="fixed inset-0 bg-ink-900/50 z-30 lg:hidden hidden"></div>
    <aside id="solace-sidebar-panel" class="fixed left-0 top-0 h-screen w-72 sm:w-64 bg-white border-r border-brand-100 px-4 py-5 flex flex-col z-40 -translate-x-full lg:translate-x-0 transition-transform duration-200 ease-out">
      <div class="flex items-center justify-between mb-8">
        <a href="index.html" class="flex items-center gap-2 px-2">
          <span class="relative w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center shrink-0">
            <img src="assets/logo.png" alt="Solace" class="w-full h-full rounded-lg object-cover" onerror="this.style.display='none';" />
            <span class="absolute inset-0 flex items-center justify-center text-white text-sm font-semibold" style="z-index:-1">S</span>
          </span>
          <span class="text-lg font-semibold text-ink tracking-tight">Solace</span>
        </a>
        <button id="solace-sidebar-close" class="lg:hidden w-8 h-8 flex items-center justify-center text-ink-400 hover:text-ink-600" aria-label="Close menu">
          ${icon("x", "w-5 h-5")}
        </button>
      </div>
      <div class="flex-1 overflow-y-auto">${sections}</div>
      <div class="px-3 pt-4 border-t border-brand-100">
        <p class="text-xs text-ink-400">Property Acquisition &amp; Ops</p>
      </div>
    </aside>
  `;
}

function renderTopbar(title) {
  const dateLabel = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  return `
    <header id="solace-topbar-bar" class="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-white/90 backdrop-blur border-b border-brand-100 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-20 transition-[left] duration-200">
      <div class="flex items-center gap-3 min-w-0">
        <button id="solace-sidebar-open" class="lg:hidden w-9 h-9 shrink-0 flex items-center justify-center text-ink-600 rounded-lg hover:bg-brand-50" aria-label="Open menu">
          ${icon("menu", "w-5 h-5")}
        </button>
        <div class="min-w-0">
          <h1 class="text-base sm:text-lg font-semibold text-ink truncate">${title}</h1>
          <p class="text-xs text-ink-400 hidden sm:block">${dateLabel}</p>
        </div>
      </div>
      <div class="flex items-center gap-3 shrink-0">
        <div class="w-9 h-9 rounded-full bg-brand-500 text-white flex items-center justify-center text-sm font-semibold">DJ</div>
      </div>
    </header>
  `;
}

function applySafeAreaInsets() {
  // Account for the iOS status bar / notch when this app runs inside a
  // native WebView (Capacitor). env() resolves to 0 in regular browsers,
  // so this is a no-op there — only real devices/simulators with an inset
  // are affected.
  const header = document.getElementById("solace-topbar-bar");
  const sidebar = document.getElementById("solace-sidebar-panel");
  const main = document.querySelector("main");

  if (header) {
    header.style.paddingTop = "env(safe-area-inset-top)";
    header.style.height = "calc(4rem + env(safe-area-inset-top))";
  }
  if (sidebar) {
    sidebar.style.paddingTop = "calc(1.25rem + env(safe-area-inset-top))";
  }
  if (main) {
    main.style.paddingTop = "calc(4rem + env(safe-area-inset-top))";
    main.style.paddingBottom = "calc(2.5rem + env(safe-area-inset-bottom))";
  }
}

function bindMobileNav() {
  const panel = document.getElementById("solace-sidebar-panel");
  const overlay = document.getElementById("solace-overlay");
  const openBtn = document.getElementById("solace-sidebar-open");
  const closeBtn = document.getElementById("solace-sidebar-close");
  if (!panel || !overlay) return;

  const open = () => {
    panel.classList.remove("-translate-x-full");
    overlay.classList.remove("hidden");
  };
  const close = () => {
    panel.classList.add("-translate-x-full");
    overlay.classList.add("hidden");
  };

  openBtn && openBtn.addEventListener("click", open);
  closeBtn && closeBtn.addEventListener("click", close);
  overlay.addEventListener("click", close);
  panel.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));
  window.addEventListener("resize", () => {
    if (window.innerWidth >= 1024) close();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // Nav is static and doesn't need Store data, so it renders immediately —
  // Store.ready (kicked off by store.js as soon as it loaded) resolves
  // separately for each page's own content.
  const sidebarMount = document.getElementById("solace-sidebar");
  const topbarMount = document.getElementById("solace-topbar");
  const activeKey = document.body.getAttribute("data-page");
  const title = document.body.getAttribute("data-title") || "Solace";
  if (sidebarMount) sidebarMount.outerHTML = renderSidebar(activeKey);
  if (topbarMount) topbarMount.outerHTML = renderTopbar(title);
  bindMobileNav();
  applySafeAreaInsets();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }
});
