// ============================================================
//  GitHub-style contribution heatmap: every year in ONE continuous
//  strip (one column per week), with a diamond where each project began.
// ============================================================
import { t, ui } from "./i18n.js";

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export function renderHeatmap(gh, projects, selected, opts = {}) {
  if (!gh || !gh.years) return `<p class="viz-note">${esc(ui("heat.none"))}</p>`;

  const marks = {};
  projects.forEach((p) => { marks[p.date] = p; });

  // all years from the first one with activity, glued together and trimmed at today
  const firstWithData = Object.entries(gh.years).find(([, v]) => v.total > 0)?.[0];
  const yrs = Object.keys(gh.years).sort().filter((y) => !firstWithData || y >= firstWithData);
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const days = yrs.flatMap((y) => gh.years[y].days).filter((d) => d[0] <= today);
  if (!days.length) return `<p class="viz-note">${esc(ui("heat.none"))}</p>`;

  const total = days.reduce((n, d) => n + d[1], 0);
  const active = days.filter((d) => d[1] > 0).length;
  const startWd = new Date(days[0][0] + "T00:00:00").getDay();
  const weeks = Math.floor((startWd + days.length - 1) / 7) + 1;
  const MONTHS = ui("heat.months");
  // "fit" shrinks the cells so the whole history sits in one view; otherwise 12px cells and a sideways scroll
  const gap = opts.fit ? 1 : 3;
  const cell = opts.fit ? Math.max(3, Math.min(12, Math.floor(((opts.width || 700) - 28) / weeks) - gap)) : 12;
  const yearTotal = (y) => days.filter((d) => d[0].startsWith(y)).reduce((n, d) => n + d[1], 0);

  let cells = "", monthRow = "", yearRow = "";
  let lastMonth = "", lastYear = "";
  days.forEach(([date, n, lvl], i) => {
    const wd = (startWd + i) % 7;
    const wk = Math.floor((startWd + i) / 7);
    const y = date.slice(0, 4), mo = date.slice(0, 7);
    if (y !== lastYear) {
      lastYear = y;
      yearRow += `<span class="hm-yr" style="grid-column:${wk + 1} / span 9"><b>${y}</b><small>${esc(ui("heat.total", yearTotal(y)))}</small></span>`;
    }
    if (mo !== lastMonth) {
      lastMonth = mo;
      monthRow += `<span class="hm-mo" style="grid-column:${wk + 1} / span 3">${esc(MONTHS[Number(date.slice(5, 7)) - 1])}</span>`;
    }
    const p = marks[date];
    const tip = `${ui("heat.tip", n, date)}${p ? ` · ★ ${t(p.name)}` : ""}`;
    const pos = `grid-column:${wk + 1};grid-row:${wd + 3}`;
    cells += p
      ? `<button class="hm-cell lv${lvl} mk ${p.id === selected ? "sel" : ""}" data-pid="${p.id}" style="${pos}" title="${esc(tip)}"></button>`
      : `<i class="hm-cell lv${lvl}" style="${pos}" title="${esc(tip)}"></i>`;
  });

  return `
    <div class="hm-head">
      <div class="hm-stat"><b>${total}</b><small>${esc(ui("heat.contrib"))}</small></div>
      <div class="hm-stat"><b>${active}</b><small>${esc(ui("heat.days"))}</small></div>
      <div class="hm-stat"><b>${gh.repos?.length ?? 0}</b><small>${esc(ui("heat.repos"))}</small></div>
      <div class="hm-legend"><span>${esc(ui("heat.less"))}</span><i class="hm-cell lv0"></i><i class="hm-cell lv1"></i><i class="hm-cell lv2"></i><i class="hm-cell lv3"></i><i class="hm-cell lv4"></i><span>${esc(ui("heat.more"))}</span><span class="hm-key"><i class="hm-diamond"></i>${esc(ui("heat.project"))}</span></div>
      <button type="button" class="btn sm" data-hmfit><i class="fa-solid ${opts.fit ? "fa-magnifying-glass-plus" : "fa-down-left-and-up-right-to-center"}"></i>${esc(ui(opts.fit ? "heat.detail" : "heat.fit"))}</button>
    </div>
    <div class="hm-scroll ${opts.fit ? "fit" : ""}" id="hm-scroll"><div class="hm-grid" style="--weeks:${weeks};--cell:${cell}px;--gap:${gap}px">${yearRow}${monthRow}${cells}</div></div>
    <p class="viz-note">${esc(ui("heat.source", gh.updated))}</p>`;
}
