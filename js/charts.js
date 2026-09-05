/* Solace — small dependency-free SVG line chart */

function renderLineChart(containerId, points, opts) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const width = (opts && opts.width) || 600;
  const height = (opts && opts.height) || 220;
  const padX = 24;
  const padY = 24;
  const values = points.map((p) => p.value);
  const max = Math.max(...values, 1) * 1.15;
  const min = 0;
  const stepX = (width - padX * 2) / (points.length - 1);

  const coords = points.map((p, i) => {
    const x = padX + i * stepX;
    const y = height - padY - ((p.value - min) / (max - min)) * (height - padY * 2);
    return { x, y, ...p };
  });

  const linePath = coords.map((c, i) => (i === 0 ? `M${c.x},${c.y}` : `L${c.x},${c.y}`)).join(" ");
  const areaPath = `${linePath} L${coords[coords.length - 1].x},${height - padY} L${coords[0].x},${height - padY} Z`;

  const lastPoint = coords[coords.length - 1];

  const dots = coords
    .map((c) => `<circle cx="${c.x}" cy="${c.y}" r="2.5" class="fill-brand-500" />`)
    .join("");

  const labels = coords
    .map(
      (c) =>
        `<text x="${c.x}" y="${height - 4}" text-anchor="middle" class="fill-ink-400" style="font-size:10px">${c.label}</text>`
    )
    .join("");

  el.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" class="w-full h-full">
      <defs>
        <linearGradient id="${containerId}-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#8B9A8C" stop-opacity="0.35" />
          <stop offset="100%" stop-color="#8B9A8C" stop-opacity="0" />
        </linearGradient>
      </defs>
      <path d="${areaPath}" fill="url(#${containerId}-grad)" />
      <path d="${linePath}" fill="none" stroke="#8B9A8C" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
      ${dots}
      <circle cx="${lastPoint.x}" cy="${lastPoint.y}" r="5" fill="#111312" stroke="white" stroke-width="2" />
      ${labels}
    </svg>
  `;
}
