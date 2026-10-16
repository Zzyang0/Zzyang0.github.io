import { profile, contact, education, experience, projects, skills, log, footprints, learning, contactInfo } from "./data.js";
import { t, ui, getLang, setLang } from "./i18n.js";
import { startLoader } from "./loader.js";
import { trackView, loadGoatCounter } from "./track.js";
import { runSQL, SqlError } from "./sql.js";
import { buildIndex, search } from "./search.js";
import { renderHeatmap } from "./viz.js";
import { config } from "./config.js";

// Resume PDFs and diploma scans are only shown when config.showPrivateDocs is true.
const DOCS = !!config.showPrivateDocs;

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const T = (v) => esc(t(v));
const pad2 = (n) => String(n).padStart(2, "0");
const BASE_TITLE = document.title;

// README screenshots: ?shot=1 = no loader and no 3D, ?shot=3d = no loader but 3D on
const SHOTV = new URLSearchParams(location.search).get("shot");
const SHOT = SHOTV !== null && SHOTV !== "3d";
const loader = startLoader();
if (SHOTV !== null) { $("#loader").style.display = "none"; if (SHOT) document.body.classList.add("shot"); }
loadGoatCounter();

/* ---------------- sections ---------------- */
const SECTIONS = [
  { id: "top", key: "nav.home", icon: "fa-solid fa-house", count: null },
  { id: "profile", key: "nav.profile", icon: "fa-solid fa-id-badge", count: 1 },
  { id: "footprints", key: "nav.footprints", icon: "fa-solid fa-earth-asia", count: footprints.length },
  { id: "experience", key: "nav.experience", icon: "fa-solid fa-briefcase", count: experience.length + education.length },
  { id: "projects", key: "nav.projects", icon: "fa-solid fa-flask", count: projects.length },
  { id: "skills", key: "nav.skills", icon: "fa-solid fa-screwdriver-wrench", count: skills.reduce((n, g) => n + g.items.length, 0) + learning.length },
  { id: "resume", key: "nav.resume", icon: "fa-solid fa-file-pdf", count: config.showPrivateDocs ? profile.resumes.length : 0 },
  { id: "log", key: "nav.log", icon: "fa-solid fa-camera-retro", count: log.length },
  { id: "contact", key: "nav.contact", icon: "fa-solid fa-satellite-dish", count: contact.length },
];
const PAGE_IDS = SECTIONS.map((s) => s.id);
const sec = (id) => SECTIONS.find((s) => s.id === id);

// words people might type, in either language, mapped to a section
const ALIASES = {
  top: ["home", "top", "首页", "主页"],
  profile: ["profile", "about", "me", "bio", "关于", "关于我", "简介", "个人"],
  footprints: ["footprints", "footprint", "map", "globe", "travel", "places", "cities", "足迹", "地图", "城市", "地球"],
  experience: ["experience", "work", "jobs", "job", "career", "education", "school", "diploma", "degree", "经历", "工作", "经验", "教育", "学校", "毕业证"],
  projects: ["projects", "project", "portfolio", "github", "heatmap", "项目", "作品", "热力图"],
  skills: ["skills", "skill", "tools", "stack", "learning", "技能", "工具", "学习"],
  resume: ["resume", "cv", "pdf", "download", "简历", "下载"],
  log: ["log", "blog", "photos", "photo", "posts", "articles", "日志", "照片", "博客", "文章"],
  contact: ["contact", "email", "mail", "linkedin", "instagram", "联系", "联系方式", "邮箱"],
};
const TABLE_PAGE = { profile: "profile", footprints: "footprints", experience: "experience", education: "experience", projects: "projects", skills: "skills", learning: "skills", log: "log", contact: "contact", resume: "resume" };

/* ---------------- state ---------------- */
let mode = "simple";
try { if (localStorage.getItem("mode") === "sql") mode = "sql"; } catch {}
let current = "top";
let lastCount = null;
let projFilter = "*";
// shareable links: ?mode=sql · ?lang=zh · ?pv=heatmap (also used for the README screenshots)
const qs = new URLSearchParams(location.search);
if (qs.get("mode") === "sql" || qs.get("mode") === "simple") mode = qs.get("mode");
let projView = mode === "sql" ? "table" : "cards";
if (["cards", "heatmap", "table"].includes(qs.get("pv"))) projView = qs.get("pv");
let projSel = null;
let heatFit = qs.has("fit");
let gh;                       // GitHub snapshot: undefined = not loaded, null = unavailable
const openProjects = new Set();
const openExp = new Set();
let resumeLang = null;
let globeApi = null;

function setMode(m) {
  if (m === mode) return;
  mode = m;
  try { localStorage.setItem("mode", m); } catch {}
  projView = m === "sql" ? "table" : "cards";
  document.body.classList.toggle("mode-sql", m === "sql");
  $("#mode-simple").classList.toggle("on", m === "simple");
  $("#mode-sql").classList.toggle("on", m === "sql");
  $("#q").value = "";
  clearOut();
  applyHero();
  renderProjects();
}

/* ---------------- navigation (page view only) ---------------- */
function go(id) {
  const target = id === "education" ? "experience" : id;
  if (!PAGE_IDS.includes(target)) return;
  const hash = target === "top" ? "" : `#${target}`;
  if (location.hash !== hash) history.pushState(null, "", hash || location.pathname + location.search);
  showPage(target);
}
addEventListener("popstate", () => {
  const id = location.hash.slice(1);
  showPage(PAGE_IDS.includes(id) ? id : "top");
});

function showPage(id) {
  current = id;
  $$(".page").forEach((p) => p.classList.toggle("current", p.id === id));
  document.body.classList.toggle("on-home", id === "top");
  $$("[data-go]").forEach((a) => a.classList.toggle("active", a.dataset.go === id));
  renderPager();
  document.title = id === "top" ? BASE_TITLE : `${ui(sec(id).key)} · FRANK.DB`;
  if (id === "resume") renderResume();
  scrollTo({ top: 0, behavior: "instant" });
  $("#mobile-nav").classList.remove("open");
  if (mode === "sql") {
    const q = $(`#${id} .query`);
    if (q) { q.classList.add("run"); setTimeout(() => q.classList.remove("run"), 1200); }
  }
  if (id === "projects") { if (heatFit && projView === "heatmap") renderProjects(); queueMicrotask(fixHeatScroll); }
  trackView(id, { lang: getLang(), mode }).then(setVisits);
}

function renderPager() {
  const i = PAGE_IDS.indexOf(current);
  const prev = SECTIONS[i - 1], next = SECTIONS[i + 1];
  $("#pager").innerHTML = `
    <button class="btn" data-go="${prev?.id || ""}" ${prev ? "" : "disabled"}><i class="fa-solid fa-arrow-left"></i><span><small>${ui("prev")}</small>${prev ? esc(ui(prev.key)) : ""}</span></button>
    <button class="btn next" data-go="${next?.id || ""}" ${next ? "" : "disabled"}><span><small>${ui("next")}</small>${next ? esc(ui(next.key)) : ""}</span><i class="fa-solid fa-arrow-right"></i></button>`;
}

function setVisits(c) {
  if (c) lastCount = c;
  if (!lastCount) return;
  $$(".js-visits").forEach((el) => {
    el.textContent = ui("visit.label", (lastCount.visits ?? 0).toLocaleString());
    el.parentElement.title = ui("visit.tip");
  });
  $("#visit-badge").hidden = false;
  $("#foot-visits").hidden = false;
}

/* ---------------- static text + hero ---------------- */
function applyUI() {
  $$("[data-i18n]").forEach((el) => { el.textContent = ui(el.dataset.i18n); });
  $("#mode-simple").title = ui("mode.tip.simple");
  $("#mode-sql").title = ui("mode.tip.sql");
  $("#lang-en").classList.toggle("on", getLang() === "en");
  $("#lang-zh").classList.toggle("on", getLang() === "zh");

  const navItems = SECTIONS.filter((s) => s.id !== "top");
  $("#topnav").innerHTML = navItems.map((s) => `<a href="#${s.id}" data-go="${s.id}" title="${esc(ui(s.key))}"><i class="${s.icon}"></i><span>${esc(ui(s.key))}</span></a>`).join("");
  $("#mobile-nav").innerHTML = SECTIONS.map((s) => `<a href="#${s.id}" data-go="${s.id}"><i class="${s.icon}"></i>${esc(ui(s.key))}</a>`).join("");
  $("#schema-list").innerHTML = SECTIONS.map((s) => `
    <li><a href="#${s.id}" data-go="${s.id}"><i class="${s.icon}"></i><span class="name">${esc(ui(s.key))}</span>${s.count != null ? `<span class="count">${s.count}</span>` : ""}</a></li>`).join("");
  $("#titles").innerHTML = profile.titles.map((x) => `<span>${T(x)}</span>`).join('<span class="sep">//</span>');
  applyHero();
  $$("[data-go]").forEach((a) => a.classList.toggle("active", a.dataset.go === current));
}

function applyHero() {
  $("#q").placeholder = ui(mode === "sql" ? "hero.placeholder.sql" : "hero.placeholder.simple");
  $("#q").setAttribute("aria-label", ui(mode === "sql" ? "hero.placeholder.sql" : "hero.placeholder.simple"));
}

/* ---------------- content renderers: every section has a simple and a tech view ---------------- */
const tbl = (cols, body) => `<div class="table-scroll"><table class="grid"><thead><tr>${cols.map((c) => `<th>${esc(c)}</th>`).join("")}</tr></thead><tbody>${body}</tbody></table></div>`;
const gpa = (e) => `${e.gpa}/${e.scale}`;

function renderProfile() {
  $("#bio").innerHTML = t(profile.bio).map((p) => `<p>${esc(p)}</p>`).join("");
  $("#profile-titles").innerHTML = profile.titles.map((x) => `<span class="tag-pill">${T(x)}</span>`).join("");
  $("#profile-table").innerHTML = profile.fields.map(([k, v]) => `<tr><td>${T(k)}</td><td>${T(v)}</td></tr>`).join("");
  $("#profile-meta").textContent = ui("rows", 1);
}

function renderFootprints() {
  $("#fp-list").innerHTML = footprints.map((f, i) => `
    <li class="fp-item" data-fp="${i}">
      <span class="fp-dot">${pad2(i + 1)}</span>
      <div>
        <div class="fp-city">${T(f.city)}<small>${T(f.region)}</small></div>
        <div class="fp-when">${T(f.when)}</div>
        <div class="fp-note">${T(f.note)}</div>
      </div>
    </li>`).join("");
  $("#fp-table").innerHTML = tbl(ui("tbl.fp"), footprints.map((f, i) => `
    <tr class="row" data-fp="${i}"><td class="t-id">${pad2(i + 1)}</td><td class="t-name">${T(f.city)}</td><td class="t-dim">${T(f.region)}</td><td class="t-hl">${T(f.when)}</td></tr>`).join(""));
  $("#fp-meta").textContent = ui("rows", footprints.length);
}

function renderExperience() {
  $("#experience-list").innerHTML = experience.map((e, i) => `
    <details class="record" style="--i:${i}" ${i === 0 ? "open" : ""}>
      <summary>
        <div class="r-title">${T(e.title)} <span class="at">@</span> <span class="co">${T(e.company)}</span></div>
        <div class="r-period">${esc(e.period)}<i class="fa-solid fa-chevron-down chev"></i></div>
        <div class="r-place"><i class="fa-solid fa-location-dot"></i>${T(e.place)}</div>
        <div class="r-tags">${e.tags.map((x) => `<span class="pill">${esc(x)}</span>`).join("")}</div>
      </summary>
      <ul>${t(e.points).map((p) => `<li>${esc(p)}</li>`).join("")}</ul>
    </details>`).join("");

  $("#experience-table").innerHTML = tbl(ui("tbl.exp"), experience.map((e, i) => {
    const open = openExp.has(i);
    return `<tr class="row" data-exp="${i}"><td class="t-id">${pad2(i + 1)}</td><td class="t-name">${T(e.company)}</td><td>${T(e.title)}</td>
      <td class="t-hl">${esc(e.period)}</td><td class="t-dim">${T(e.place)}</td><td class="t-open"><i class="fa-solid ${open ? "fa-minus" : "fa-plus"}"></i></td></tr>
      ${open ? `<tr class="detail"><td colspan="6"><ul>${t(e.points).map((p) => `<li>${esc(p)}</li>`).join("")}</ul><div class="links"><span class="private"><i class="fa-solid fa-tags"></i> ${e.tags.join(", ")}</span></div></td></tr>` : ""}`;
  }).join(""));
  $("#exp-meta").textContent = ui("rows", experience.length);

  $("#education-list").innerHTML = education.map((e, i) => `
    <article class="edu-card" style="--i:${i}">
      ${DOCS ? `<button class="diploma-thumb" data-diploma="${i}" aria-label="${esc(ui("edu.diploma"))}">
        <img src="${e.diploma}" alt="${T(e.school)}" loading="lazy">
        <span class="zoom"><i class="fa-solid fa-magnifying-glass-plus"></i>${esc(ui("edu.diploma"))}</span>
      </button>` : `<div class="diploma-lock"><i class="fa-solid fa-user-lock"></i><span>${esc(ui("docs.diploma"))}</span></div>`}
      <div class="edu-body">
        <div class="gpa"><em>GPA</em>${e.gpa}<span>/${e.scale}</span></div>
        <div class="school">${T(e.school)}</div>
        <div class="deg">${T(e.degree)}</div>
        <div class="meta"><i class="fa-solid fa-location-dot"></i> ${T(e.place)} · ${esc(e.period)}</div>
        <div class="courses">${T(e.courses)}</div>
      </div>
    </article>`).join("");
  $("#education-table").innerHTML = tbl(ui("tbl.edu"), education.map((e, i) => `
    <tr><td class="t-name">${T(e.school)}</td><td>${T(e.degree)}</td><td class="t-hl">${gpa(e)}</td><td class="t-dim">${esc(e.period)}</td>
    <td>${DOCS ? `<button class="link-btn" data-diploma="${i}"><i class="fa-regular fa-image"></i> ${esc(ui("edu.diploma"))}</button>` : `<span class="c-dim">${esc(ui("docs.diploma"))}</span>`}</td></tr>`).join(""));
  $("#edu-meta").textContent = ui("rows", education.length);
}

/* ---------- projects: cards · timeline · heatmap · table ---------- */
const PROJ_VIEWS = [
  ["cards", "fa-solid fa-table-cells-large"],
  ["heatmap", "fa-solid fa-calendar-days"],
  ["table", "fa-solid fa-table"],
];

async function loadGH() {
  if (gh !== undefined) return gh;
  try { const r = await fetch("data/github.json"); gh = r.ok ? await r.json() : null; } catch { gh = null; }
  return gh;
}

const projLink = (p) => p.url
  ? `<a class="btn sm" href="${p.url}" target="_blank" rel="noopener"><i class="fa-brands fa-github"></i>${esc(ui("proj.view"))}</a>`
  : `<span class="p-private"><i class="fa-solid fa-lock"></i> ${esc(ui("proj.private"))}</span>`;

function projectDetail(p) {
  if (!p) return "";
  return `<div class="p-detail">
    <div class="pd-head"><span class="p-year">${p.date}</span><h3>${T(p.name)}</h3><button class="icon-btn" data-pclose aria-label="${esc(ui("proj.close"))}"><i class="fa-solid fa-xmark"></i></button></div>
    <p>${T(p.summary)}</p>
    <div class="p-stack">${p.stack.map((s) => `<span class="pill">${esc(s)}</span>`).join("")}</div>
    <div class="p-actions">${projLink(p)}</div>
  </div>`;
}

function renderProjects() {
  $("#proj-views").innerHTML = PROJ_VIEWS.map(([v, icon]) => `<button class="${v === projView ? "on" : ""}" data-pv="${v}" role="tab"><i class="${icon}"></i><span>${esc(ui("proj.v." + v))}</span></button>`).join("");
  const tags = ["*", "python", "r", "ml", "viz", "etl", "web"];
  if (!tags.includes(projFilter)) tags.push(projFilter);
  $("#proj-chips").innerHTML = tags.map((x) => `<button class="btn sm ${x === projFilter ? "on" : ""}" data-tag="${x}">${x === "*" ? esc(ui("proj.all")) : x}</button>`).join("");
  $("#proj-filter-label").textContent = `'${projFilter}'`;
  const rows = projects.filter((p) => projFilter === "*" || p.tags.includes(projFilter)).sort((a, b) => b.date.localeCompare(a.date));
  if (!projSel || !rows.some((p) => p.id === projSel)) projSel = rows[0]?.id ?? null;
  const sel = projects.find((p) => p.id === projSel);

  const oldHm = $("#hm-scroll");
  const keep = oldHm && oldHm.dataset.init === "1" ? oldHm.scrollLeft : null;
  let html = "", detail = "";

  if (projView === "cards") {
    html = `<div class="p-grid stagger">${rows.map((p, i) => `
      <article class="p-card" data-pid="${p.id}" style="--i:${i}">
        <span class="p-year">${p.date.slice(0, 7)}</span>
        <h3>${T(p.name)}</h3>
        <p>${T(p.summary)}</p>
        <div class="p-stack">${p.stack.map((s) => `<span class="pill">${esc(s)}</span>`).join("")}</div>
        <div class="p-actions">${projLink(p)}</div>
      </article>`).join("")}</div>`;
  } else if (projView === "heatmap") {
    if (gh === undefined) { html = `<p class="viz-note">${esc(ui("log.loading"))}</p>`; loadGH().then(() => renderProjects()); }
    else html = renderHeatmap(gh, rows, projSel, { fit: heatFit, width: $("#proj-view").clientWidth }); 
    detail = projectDetail(sel);
  } else {
    html = `<div class="table-scroll"><table class="grid" id="proj-table"><thead><tr>${ui("tbl.proj").map((c, i) => `<th class="${i === 2 ? "hide-sm" : ""}">${esc(c)}</th>`).join("")}</tr></thead><tbody>${rows.map((p, i) => {
      const open = openProjects.has(p.id);
      return `
      <tr class="row" data-id="${p.id}" data-pid="${p.id}" tabindex="0" aria-expanded="${open}">
        <td class="t-id">${pad2(i + 1)}</td><td class="t-name">${T(p.name)}</td>
        <td class="t-dim hide-sm">${p.stack.map(esc).join(" · ")}</td><td class="t-hl">${p.year}</td>
        <td class="t-open"><i class="fa-solid ${open ? "fa-minus" : "fa-plus"}"></i></td>
      </tr>
      ${open ? `<tr class="detail"><td colspan="5">${T(p.summary)}
        <div class="links">${p.url ? `<a href="${p.url}" target="_blank" rel="noopener"><i class="fa-brands fa-github"></i> ${esc(ui("proj.view"))}</a>` : `<span class="private"><i class="fa-solid fa-lock"></i> ${esc(ui("proj.private"))}</span>`}
        <span class="private"><i class="fa-solid fa-tags"></i> ${p.tags.join(", ")}</span></div></td></tr>` : ""}`;
    }).join("")}</tbody></table></div>`;
  }
  $("#proj-view").innerHTML = html;
  $("#proj-detail").innerHTML = detail;
  $("#proj-meta").textContent = ui("rows", rows.length);

  // the heatmap opens on the latest weeks; keep your place when a marker is selected
  const hm = $("#hm-scroll");
  if (hm) {
    if (keep != null) { hm.scrollLeft = keep; hm.dataset.init = "1"; }
    else if (hm.offsetWidth > 0) { hm.scrollLeft = hm.scrollWidth; hm.dataset.init = "1"; }
  }
}
function fixHeatScroll() {
  const hm = $("#hm-scroll");
  if (hm && hm.dataset.init !== "1" && hm.offsetWidth > 0) { hm.scrollLeft = hm.scrollWidth; hm.dataset.init = "1"; }
}

function focusProject(id) {
  projFilter = "*";
  projSel = id;
  if (projView === "table") openProjects.add(id);
  renderProjects();
  requestAnimationFrame(() => {
    const el = $(`#proj-view [data-pid="${id}"]`);
    if (el) { el.scrollIntoView({ block: "center", behavior: "smooth" }); el.classList.add("flash"); setTimeout(() => el.classList.remove("flash"), 1800); }
  });
}

/* ---------- skills + learning ---------- */
function renderSkills() {
  $("#skills-grid").innerHTML = skills.map((g, i) => `
    <div class="skill-group" style="--i:${i}">
      <h3><i class="${g.icon}"></i>${T(g.group)}</h3>
      ${g.items.map(([name, lvl]) => `
        <div class="skill"><span>${T(name)}</span>
          <span class="bar" title="${lvl}/5">${[1, 2, 3, 4, 5].map((n) => `<i class="${n <= lvl ? "on" : ""}"></i>`).join("")}</span>
        </div>`).join("")}
    </div>`).join("");

  $("#learning").innerHTML = `
    <div class="learn-head"><span class="pulse"></span><div><h3>${esc(ui("learn.title"))}</h3><p>${esc(ui("learn.sub"))}</p></div></div>
    <div class="learn-grid stagger">${learning.map((l, i) => `
      <div class="learn-card" style="--i:${i}">
        <div class="lc-top"><i class="${l.icon}"></i><b>${esc(l.name)}</b></div>
        ${l.note ? `<p>${T(l.note)}</p>` : ""}
        <div class="lc-bar ${l.progress != null ? "" : "busy"}"><span style="${l.progress != null ? `width:${l.progress}%` : ""}"></span></div>
        <small>${esc(ui("learn.status"))}${l.progress != null ? ` · ${l.progress}%` : ""}</small>
      </div>`).join("")}</div>`;

  const rows = skills.flatMap((g) => g.items.map(([name, lvl]) => `
    <tr><td class="t-dim">${T(g.group)}</td><td class="t-name">${T(name)}</td>
    <td><span class="lvl">${"█".repeat(lvl)}${"░".repeat(5 - lvl)}<em>${lvl}/5</em></span></td></tr>`));
  const learnRows = learning.map((l) => `
    <tr><td class="t-dim">${esc(ui("learn.title"))}</td><td class="t-name">${esc(l.name)}</td>
    <td><span class="lvl">▒▒▒░░<em>${esc(ui("learn.status"))}</em></span></td></tr>`);
  $("#skills-table").innerHTML = tbl(ui("tbl.skills"), [...rows, ...learnRows].join(""));
  $("#skills-meta").textContent = ui("rows", rows.length + learnRows.length);
}

/* ---------- resume ---------- */
function renderResume() {
  const sec_ = $("#resume");
  sec_.classList.toggle("resume-private", !DOCS);
  if (!DOCS) {
    // no files are published: offer the same information on request instead
    $("#resume-private").innerHTML = `
      <i class="fa-solid fa-file-shield"></i>
      <h3>${esc(ui("docs.resume.title"))}</h3>
      <p>${esc(ui("docs.resume.text"))}</p>
      <div class="c-actions">
        <a class="btn primary" href="mailto:${esc(contactInfo.email)}?subject=${encodeURIComponent("Resume request")}"><i class="fa-solid fa-paper-plane"></i>${esc(ui("contact.email"))}</a>
        <a class="btn" href="${contact.find((c) => c.key === "linkedin").url}" target="_blank" rel="noopener"><i class="fa-brands fa-linkedin"></i>LinkedIn</a>
      </div>`;
    $("#resume-meta").textContent = ui("rows", 0);
    return;
  }
  const cur = resumeLang || getLang();
  const r = profile.resumes.find((x) => x.lang === cur) || profile.resumes[0];
  $("#resume-tabs").innerHTML = profile.resumes.map((x) => `<button class="${x.lang === r.lang ? "on" : ""}" data-rl="${x.lang}"><i class="fa-solid fa-file-lines"></i>${esc(x.label)}</button>`).join("");
  $("#resume-actions").innerHTML =
    `<a class="btn" href="${r.file}" target="_blank" rel="noopener"><i class="fa-solid fa-up-right-from-square"></i>${esc(ui("resume.open"))}</a>` +
    profile.resumes.map((x) => `<a class="btn ${x.lang === r.lang ? "primary" : "gold"}" href="${x.file}" download="${x.download}"><i class="fa-solid fa-download"></i>${esc(ui("resume.dl"))} · ${esc(x.label)}</a>`).join("");
  $("#resume-meta").textContent = ui("rows", profile.resumes.length);
  if (current === "resume") {
    const frame = $("#resume-frame");
    const src = `${r.file}#view=FitH`;
    if (frame.dataset.src !== src) { frame.dataset.src = src; frame.src = src; }
  }
}

/* ---------- log ---------- */
function renderLog() {
  const sorted = [...log].sort((a, b) => b.date.localeCompare(a.date));
  $("#log-grid").innerHTML = sorted.map((e, i) => `
    <button class="entry" style="--i:${i}" data-log="${e.id}">
      ${e.type === "photo"
        ? `<div class="thumb" style="background-image:url('${e.photos[0]}')"></div>${e.photos.length > 1 ? `<span class="count"><i class="fa-regular fa-images"></i> ${e.photos.length}</span>` : ""}`
        : `<div class="thumb text ${e.tags?.includes("food") ? "food" : ""}"><div><i class="${e.icon || "fa-regular fa-file-lines"}"></i>${T(e.title)}</div></div>`}
      <div class="e-body">
        <div class="e-meta"><span class="e-type"><i class="fa-solid ${e.type === "photo" ? "fa-camera" : "fa-pen-nib"}"></i>${esc(ui("log." + e.type))}</span><span>${e.date}</span></div>
        <div class="e-title">${T(e.title)}</div>
        <div class="e-excerpt">${T(e.excerpt)}</div>
      </div>
    </button>`).join("");
  $("#log-table").innerHTML = tbl(ui("tbl.log"), sorted.map((e) => `
    <tr class="row" data-log="${e.id}"><td class="t-hl">${e.date}</td><td class="t-dim">${esc(ui("log." + e.type))}</td><td class="t-name">${T(e.title)}</td><td class="t-dim">${(e.tags || []).join(", ")}</td></tr>`).join(""));
  $("#log-meta").textContent = ui("rows", log.length);
}

/* ---------- contact ---------- */
function renderContact() {
  const social = contact.filter((c) => c.key !== "email");
  $("#contact-wrap").innerHTML = `
    <div class="c-hero">
      <div class="c-eyebrow"><span class="pulse"></span>// contact</div>
      <h3>${esc(ui("contact.headline"))}</h3>
      <p>${esc(ui("contact.lead"))}</p>
      <div class="c-mail"><i class="fa-solid fa-envelope"></i><span>${esc(contactInfo.email)}</span>
        <button class="btn sm" data-copy="${esc(contactInfo.email)}"><i class="fa-regular fa-copy"></i><span>${esc(ui("contact.copy"))}</span></button></div>
      <div class="c-actions">
        <a class="btn primary" href="mailto:${esc(contactInfo.email)}"><i class="fa-solid fa-paper-plane"></i>${esc(ui("contact.email"))}</a>
        <a class="btn gold" href="#resume" data-go="resume"><i class="fa-solid fa-file-pdf"></i>${esc(ui("nav.resume"))}</a>
      </div>
      <div class="c-meta">
        <div><small>${esc(ui("contact.where"))}</small><b>${T(contactInfo.city)}</b></div>
        <div><small>${esc(ui("contact.time"))}</small><b id="c-clock">--:--</b></div>
        <div><small>${esc(ui("contact.lang"))}</small><b>${esc(contactInfo.languages)}</b></div>
      </div>
    </div>
    <div class="c-side">
      <h4>${esc(ui("contact.find"))}</h4>
      <div class="c-tiles">${social.map((c, i) => `
        <a class="c-tile" data-k="${c.key}" style="--i:${i}" href="${c.url}" target="_blank" rel="noopener">
          <i class="${c.icon} c-ico"></i>
          <span class="c-name">${esc(c.key)}</span>
          <span class="c-handle">${T(c.label)}</span>
          <i class="fa-solid fa-arrow-up-right-from-square c-go"></i>
        </a>`).join("")}</div>
    </div>`;
  tickContactClock();
  $("#contact-table").innerHTML = tbl(ui("tbl.contact"), contact.map((c) => `
    <tr><td class="t-dim">${c.key}</td><td><a href="${c.url}" ${c.url.startsWith("http") ? 'target="_blank" rel="noopener"' : ""}>${T(c.label)}</a></td></tr>`).join(""));
  $("#contact-meta").textContent = ui("rows", contact.length);
}

function tickContactClock() {
  const el = $("#c-clock");
  if (!el) return;
  try {
    const parts = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: contactInfo.timezone, timeZoneName: "short" }).formatToParts(new Date());
    const get = (k) => parts.find((p) => p.type === k)?.value || "";
    el.textContent = `${get("hour")}:${get("minute")} · ${get("timeZoneName")}`;
  } catch { el.textContent = "--:--"; }
}

function renderAll() {
  applyUI();
  renderProfile();
  renderFootprints();
  renderExperience();
  renderProjects();
  renderSkills();
  renderResume();
  renderLog();
  renderContact();
  renderPager();
  setVisits();
  typeTagline();
}

/* ---------------- modal: log entries and diplomas ---------------- */
async function openEntry(id) {
  const e = log.find((x) => x.id === id);
  if (!e) return;
  $("#modal-title").textContent = `SELECT * FROM log WHERE id = '${e.id}';`;
  const body = $("#modal-body");
  if (e.type === "photo") {
    body.innerHTML = `<h1>${T(e.title)}</h1><p class="caption">${e.date} · ${T(e.excerpt)}</p>
      <div class="gallery">${e.photos.map((p) => `<img src="${p}" alt="${T(e.title)}" loading="lazy">`).join("")}</div>`;
  } else {
    body.innerHTML = `<p class="caption">${esc(ui("log.loading"))}</p>`;
    try {
      let res = await fetch(t(e.file));
      if (!res.ok) res = await fetch(e.file.en);
      const md = await res.text();
      body.innerHTML = window.marked ? window.marked.parse(md) : `<pre>${esc(md)}</pre>`;
    } catch {
      body.innerHTML = `<p class="caption">ERROR: ${esc(t(e.file))}</p>`;
    }
  }
  $("#modal").showModal();
}

function openDiploma(i) {
  const e = education[i];
  if (!e || !DOCS) return;
  $("#modal-title").textContent = `SELECT diploma FROM education WHERE school = '${t(e.school)}';`;
  $("#modal-body").innerHTML = `<img class="diploma" src="${e.diploma}" alt="${T(e.school)}">`;
  $("#modal").showModal();
}

/* ---------------- home console: site search (simple) or SQL (tech) ---------------- */
const out = () => $("#console-out");
let hits = [], selHit = -1;
function setOut(html, cls = "", kind = "result") { const o = out(); o.className = `console-out open ${cls}`; o.dataset.kind = kind; o.innerHTML = html; }
function clearOut() { const o = out(); o.className = "console-out"; o.dataset.kind = ""; o.innerHTML = ""; hits = []; selHit = -1; sugg = []; suggSel = -1; }

const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
function hl(text, tokens) {
  if (!tokens.length) return esc(text);
  const re = new RegExp(`(${tokens.map(escRe).join("|")})`, "gi");
  return String(text).split(re).map((part, i) => (i % 2 ? `<mark>${esc(part)}</mark>` : esc(part))).join("");
}

function doSearch(q) {
  if (!q.trim()) { clearOut(); return; }
  const idx = buildIndex(SECTIONS, ALIASES);
  const res = search(q, idx);
  hits = res.hits; selHit = hits.length ? 0 : -1;
  if (!hits.length) { setOut(`<div class="s-none"><i class="fa-regular fa-face-frown"></i>${esc(ui("search.none", q.trim().slice(0, 40)))}</div>`, "out-search"); return; }
  setOut(`<div class="s-count">${esc(ui("search.count", hits.length))}</div>` +
    hits.map((h, i) => `
      <button type="button" class="s-item ${i === 0 ? "sel" : ""}" data-hit="${i}">
        <i class="${h.icon}"></i>
        <span class="s-body"><span class="s-title">${hl(h.title, res.tokens)}</span><span class="s-snip">${hl(h.snip || "", res.tokens)}</span></span>
        <span class="s-kind">${esc(ui("kind." + h.kind))}</span>
      </button>`).join("") +
    `<div class="s-foot">${esc(ui("search.hint"))}</div>`, "out-search");
}

function moveSel(d) {
  if (!hits.length) return;
  selHit = (selHit + d + hits.length) % hits.length;
  $$(".s-item", out()).forEach((el, i) => { el.classList.toggle("sel", i === selHit); if (i === selHit) el.scrollIntoView({ block: "nearest" }); });
}

function openHit(h) {
  if (!h) return;
  clearOut(); $("#q").value = "";
  if (h.log) { go("log"); openEntry(h.log); return; }
  if (h.diploma != null) { go("experience"); setTimeout(() => openDiploma(h.diploma), 150); return; }
  if (h.fp != null) { go("footprints"); setTimeout(() => globeApi?.focus(h.fp), 700); return; }
  if (h.pid) { go("projects"); focusProject(h.pid); return; }
  go(h.go);
}

/* ---- SQL side ---- */
function buildDB() {
  const L = (v) => t(v);
  return {
    profile: { cols: ["key", "value"], rows: profile.fields.map(([k, v]) => [L(k), L(v)]) },
    footprints: { cols: ["id", "city", "region", "when"], rows: footprints.map((f) => [f.id, L(f.city), L(f.region), L(f.when)]) },
    experience: { cols: ["company", "title", "period", "place", "tags"], rows: experience.map((e) => [L(e.company), L(e.title), e.period, L(e.place), e.tags]) },
    education: { cols: ["school", "degree", "gpa", "period", "place"], rows: education.map((e) => [L(e.school), L(e.degree), Number(e.gpa), e.period, L(e.place)]) },
    projects: { cols: ["id", "name", "year", "date", "stack", "tags", "url", "summary"], rows: projects.map((p) => [p.id, L(p.name), p.year, p.date, p.stack, p.tags, p.url, L(p.summary)]) },
    skills: { cols: ["category", "skill", "level"], rows: skills.flatMap((g) => g.items.map(([n, l]) => [L(g.group), L(n), l])) },
    learning: { cols: ["topic", "status"], rows: learning.map((l) => [l.name, ui("learn.status")]) },
    log: { cols: ["id", "date", "type", "title", "tags"], rows: log.map((e) => [e.id, e.date, e.type, L(e.title), e.tags || []]) },
    contact: { cols: ["channel", "handle", "url"], rows: contact.map((c) => [c.key, L(c.label), c.url]) },
    resume: { cols: ["lang", "file"], rows: DOCS ? profile.resumes.map((r) => [r.lang, r.file]) : [] },
  };
}

// ---- result tables are drawn as plain-text boxes, like a real SQL client ----
const wide = (ch) => /[ᄀ-ᅟ⺀-꓏가-힣豈-﫿︰-﹯＀-｠￠-￦]/.test(ch);
const vlen = (s) => [...s].reduce((n, ch) => n + (wide(ch) ? 2 : 1), 0);
const padTo = (s, n, right) => (right ? " ".repeat(Math.max(0, n - vlen(s))) + s : s + " ".repeat(Math.max(0, n - vlen(s))));

function asciiTable(res) {
  const MAX = 46;
  const str = (v) => (v == null ? "NULL" : Array.isArray(v) ? v.join(", ") : String(v)).replace(/\s+/g, " ");
  const cut = (s) => ([...s].length > MAX ? [...s].slice(0, MAX - 1).join("") + "…" : s);
  const rows = res.rows.map((r) => r.map((v) => cut(str(v))));
  const isNum = res.cols.map((_, i) => res.rows.length > 0 && res.rows.every((r) => typeof r[i] === "number"));
  const w = res.cols.map((c, i) => Math.max(vlen(c), ...rows.map((r) => vlen(r[i]))));
  const bar = (ch) => `<span class="b">+${w.map((n) => "-".repeat(n + 2)).join("+")}+</span>`;
  const sep = `<span class="b">|</span>`;
  const head = `${sep}${res.cols.map((c, i) => ` <span class="h">${esc(padTo(c, w[i], false))}</span> ${sep}`).join("")}`;
  const isShow = res.table === null;
  const body = rows.map((r) => `${sep}${r.map((v, i) => {
    const cell = padTo(v, w[i], isNum[i]);
    const inner = isShow && i === 0 ? `<button type="button" class="link-btn" data-run="SELECT * FROM ${esc(r[0])};">${esc(v)}</button>${" ".repeat(w[i] - vlen(v))}` : esc(cell);
    return ` ${inner} ${sep}`;
  }).join("")}`);
  return `<pre class="ascii">${[bar(), head, bar(), ...body, res.rows.length ? bar() : ""].filter(Boolean).join("\n")}</pre>`;
}

function sqlResultHtml(res, ms, q) {
  const open = res.table && TABLE_PAGE[res.table] ? `<button type="button" class="btn sm" data-go="${TABLE_PAGE[res.table]}"><i class="fa-solid fa-arrow-up-right-from-square"></i>${esc(ui("sql.open"))}</button>` : "";
  return `<div class="c-dim sql-echo">frank.db=# ${esc(q)}</div>${asciiTable(res)}
    <div class="sql-foot"><span class="c-dim">-- ${esc(res.rows.length ? ui("sql.rows", res.rows.length, ms) : ui("sql.empty"))}</span>${open}</div>`;
}

// ---- command suggestions: open on click/focus, filter while typing ----
const SQL_TIPS = [
  "SHOW TABLES;",
  "SELECT * FROM projects WHERE year >= 2024 ORDER BY year DESC;",
  "SELECT skill, level FROM skills WHERE level >= 4;",
  "SELECT city, region FROM footprints;",
  "SELECT COUNT(*) FROM projects;",
  "DESCRIBE projects;",
];
let sugg = [], suggSel = -1;
const allSqlCommands = () => [...new Set([...SQL_TIPS, ...Object.keys(buildDB()).flatMap((n) => [`SELECT * FROM ${n};`, `DESCRIBE ${n};`])])];

function showSuggestions(typed = "") {
  const p = typed.trim().toLowerCase();
  const list = p ? allSqlCommands().filter((c) => c.toLowerCase().includes(p)).slice(0, 8) : SQL_TIPS;
  if (!list.length) { if (out().dataset.kind === "sugg") clearOut(); return; }
  if (list.join("|") !== sugg.join("|")) suggSel = -1;
  sugg = list;
  setOut(`<div class="s-count">${esc(ui(p ? "sql.match" : "sql.cheat"))}</div>` +
    list.map((q, i) => `<button type="button" class="s-cheat ${i === suggSel ? "sel" : ""}" data-run="${esc(q)}"><span class="c-dim">frank.db=#</span> ${hl(q, p ? [typed.trim()] : [])}</button>`).join("") +
    `<div class="s-foot">${esc(ui("sql.hint"))}</div>`, "out-sql", "sugg");
}
function moveSugg(d) {
  if (out().dataset.kind !== "sugg" || !sugg.length) return false;
  suggSel = (suggSel + d + sugg.length) % sugg.length;
  $$(".s-cheat", out()).forEach((el, i) => { el.classList.toggle("sel", i === suggSel); if (i === suggSel) el.scrollIntoView({ block: "nearest" }); });
  return true;
}
function findSection(text) {
  const words = text.toLowerCase().replace(/[;'"`]/g, " ").split(/[\s,，。.!?？！()=*]+/).filter(Boolean);
  for (const w of words) for (const [id, list] of Object.entries(ALIASES)) if (list.includes(w)) return id;
  for (const [id, list] of Object.entries(ALIASES)) if (list.some((a) => /[一-鿿]/.test(a) && text.includes(a))) return id;
  return null;
}

function runSql(text) {
  const q = text.trim();
  const lower = q.replace(/;+$/, "").toLowerCase();
  if (!q) { showSuggestions(""); return; }
  if (lower === "clear") { clearOut(); return; }
  if (["help", "\\?", "?", "帮助"].includes(lower)) { showSuggestions(""); return; }
  if (/^(drop|delete|truncate|update|insert|alter|create)\b/.test(lower)) {
    setOut(`<div class="c-err">ERROR 1142 (42000): ${esc(ui("con.denied"))}</div>`, "out-sql"); return;
  }
  if (["whoami", "我是谁"].includes(lower)) {
    setOut(`<div class="c-ok">${esc(profile.name)} · ${esc(profile.name_zh)} (${esc(profile.aka)})</div><div>${profile.titles.map((x) => T(x)).join(" · ")}</div><div class="c-dim">${T(profile.motto)}</div>`, "out-sql"); return;
  }
  if (!/^(select|show|desc|describe)\b/.test(lower)) {
    // plain words still work: jump to the page
    const id = findSection(q);
    if (id) { clearOut(); go(id); return; }
    setOut(`<div class="c-err">ERROR 1064 (42000): ${esc(ui("con.notfound", q.slice(0, 30)))}</div>`, "out-sql"); return;
  }
  try {
    const t0 = performance.now();
    const res = runSQL(q, buildDB());
    const ms = ((performance.now() - t0) / 1000 + 0.001).toFixed(3);
    if (res.table === "projects") {
      // keep the Projects page in step with a tag query
      const tag = lower.match(/tag\s*=\s*'([^']+)'/);
      if (tag && projects.some((p) => p.tags.includes(tag[1]))) { projFilter = tag[1]; renderProjects(); }
    }
    setOut(sqlResultHtml(res, ms, q), "out-sql");
  } catch (e) {
    if (e instanceof SqlError) setOut(`<div class="c-dim sql-echo">frank.db=# ${esc(q)}</div><div class="c-err">${esc(e.message)}</div>`, "out-sql");
    else throw e;
  }
}

const hist = [];
let hIdx = 0;
function runConsole(text) {
  if (mode === "sql") {
    if (text.trim()) { hist.push(text); hIdx = hist.length; }
    runSql(text);
  } else {
    if (!hits.length) doSearch(text);
    openHit(hits[Math.max(0, selHit)]);
  }
}

function setupConsole() {
  const form = $("#console"), input = $("#q");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (mode === "sql") {
      // a highlighted suggestion wins over whatever is typed
      if (out().dataset.kind === "sugg" && suggSel >= 0 && sugg[suggSel]) input.value = sugg[suggSel];
      runConsole(input.value);
    } else if (input.value.trim()) runConsole(input.value);
  });
  input.addEventListener("input", () => {
    if (mode === "simple") doSearch(input.value);
    else showSuggestions(input.value);
  });
  // SQL view: clicking or focusing the box opens the command list (unless a result is on screen)
  const openTips = () => { if (mode === "sql" && out().dataset.kind !== "result") showSuggestions(input.value); };
  input.addEventListener("focus", openTips);
  input.addEventListener("pointerdown", openTips);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { input.value = ""; clearOut(); return; }
    if (mode === "simple") {
      if (e.key === "ArrowDown") { e.preventDefault(); moveSel(1); }
      if (e.key === "ArrowUp") { e.preventDefault(); moveSel(-1); }
      return;
    }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const d = e.key === "ArrowDown" ? 1 : -1;
      if (out().dataset.kind !== "sugg") {
        if (d < 0 && hIdx > 0) input.value = hist[--hIdx];
        else if (d > 0 && hIdx < hist.length) input.value = hist[++hIdx] ?? "";
        else showSuggestions(input.value);
      } else moveSugg(d);
    }
    if (e.key === "Tab" && out().dataset.kind === "sugg" && sugg.length) {
      e.preventDefault();
      input.value = sugg[Math.max(0, suggSel)];
      showSuggestions(input.value);
    }
  });
  // anything outside the console closes the panel (pointerdown, so a click never races the render)
  document.addEventListener("pointerdown", (e) => {
    if (!e.target.closest(".console") && !e.target.closest(".console-out") && out().classList.contains("open")) clearOut();
  });
}
/* ---------------- misc ---------------- */
let taglineTimer = 0;
function typeTagline() {
  const el = $("#tagline"), text = t(profile.tagline);
  clearTimeout(taglineTimer);
  el.textContent = "";
  let i = 0;
  const tick = () => { el.textContent = text.slice(0, ++i); if (i < text.length) taglineTimer = setTimeout(tick, getLang() === "zh" ? 60 : 28); };
  taglineTimer = setTimeout(tick, 500);
}

function clockAndUptime() {
  const start = Date.now();
  const tick = () => {
    const d = new Date();
    $("#clock").textContent = `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
    const s = Math.floor((Date.now() - start) / 1000);
    $("#uptime").textContent = s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;
    $("#latency").textContent = 8 + Math.floor(Math.random() * 9);
    tickContactClock();
  };
  tick();
  setInterval(tick, 1000);
  $("#year").textContent = new Date().getFullYear();
}

function setActiveStop(i) {
  $$(".fp-item").forEach((el) => el.classList.toggle("active", Number(el.dataset.fp) === i));
}

function switchLang(l) {
  if (l === getLang()) return;
  setLang(l);
  clearOut();
  renderAll();
  globeApi?.relabel();
  if (current !== "top") document.title = `${ui(sec(current).key)} · FRANK.DB`;
}

async function copyText(text, btn) {
  try { await navigator.clipboard.writeText(text); }
  catch {
    const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); } catch {} ta.remove();
  }
  const label = $("span", btn), old = label.textContent;
  label.textContent = ui("contact.copied");
  setTimeout(() => { label.textContent = old; }, 1600);
}

function wireEvents() {
  // one delegated click handler for every interactive bit
  document.addEventListener("click", (e) => {
    const go_ = e.target.closest("[data-go]");
    if (go_ && go_.dataset.go) { e.preventDefault(); clearOut(); go(go_.dataset.go); return; }
    const hit = e.target.closest("[data-hit]");
    if (hit) { openHit(hits[Number(hit.dataset.hit)]); return; }
    const run = e.target.closest("[data-run]");
    if (run) { $("#q").value = run.dataset.run; runConsole(run.dataset.run); return; }
    const cp = e.target.closest("[data-copy]");
    if (cp) { copyText(cp.dataset.copy, cp); return; }
    const pv = e.target.closest("[data-pv]");
    if (pv) { projView = pv.dataset.pv; renderProjects(); return; }
    if (e.target.closest("[data-hmfit]")) { heatFit = !heatFit; renderProjects(); return; }
    const tag = e.target.closest("[data-tag]");
    if (tag) { projFilter = tag.dataset.tag; renderProjects(); return; }
    if (e.target.closest("[data-pclose]")) { projSel = null; $("#proj-detail").innerHTML = ""; return; }
    const dip = e.target.closest("[data-diploma]");
    if (dip) { openDiploma(Number(dip.dataset.diploma)); return; }
    const rl = e.target.closest("[data-rl]");
    if (rl) { resumeLang = rl.dataset.rl; renderResume(); return; }
    const fp = e.target.closest("[data-fp]");
    if (fp) { globeApi?.focus(Number(fp.dataset.fp)); return; }
    const lg = e.target.closest("[data-log]");
    if (lg) { openEntry(lg.dataset.log); return; }
    const ex = e.target.closest("tr[data-exp]");
    if (ex) { const i = Number(ex.dataset.exp); openExp.has(i) ? openExp.delete(i) : openExp.add(i); renderExperience(); return; }
    // heatmap markers select a project
    const pid = e.target.closest(".hm-cell[data-pid]");
    if (pid) { projSel = pid.dataset.pid; renderProjects(); return; }
    const pr = e.target.closest("#proj-table tr.row");
    if (pr && !e.target.closest("a")) { const id = pr.dataset.id; openProjects.has(id) ? openProjects.delete(id) : openProjects.add(id); renderProjects(); return; }
  });
  $("#proj-view").addEventListener("keydown", (e) => {
    const tr = e.target.closest("tr.row");
    if (tr && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); tr.click(); }
  });

  // drag to scroll the timeline
  let drag = null;
  $("#proj-view").addEventListener("pointerdown", (e) => {
    const el = e.target.closest(".hm-scroll");
    if (!el || e.target.closest("button")) return;
    drag = { el, x: e.clientX, left: el.scrollLeft };
  });
  addEventListener("pointermove", (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (Math.abs(dx) > 3) { drag.el.classList.add("drag"); drag.el.scrollLeft = drag.left - dx; }
  });
  addEventListener("pointerup", () => { if (drag) { drag.el.classList.remove("drag"); drag = null; } });

  $("#mode-simple").addEventListener("click", () => setMode("simple"));
  $("#mode-sql").addEventListener("click", () => setMode("sql"));
  $("#lang-en").addEventListener("click", () => switchLang("en"));
  $("#lang-zh").addEventListener("click", () => switchLang("zh"));
  $("#menu-btn").addEventListener("click", () => $("#mobile-nav").classList.toggle("open"));
  const modal = $("#modal");
  $("#modal-close").addEventListener("click", () => modal.close());
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.close(); });
}

/* ---------------- start ---------------- */
document.body.classList.toggle("mode-sql", mode === "sql");
$("#mode-simple").classList.toggle("on", mode === "simple");
$("#mode-sql").classList.toggle("on", mode === "sql");
renderAll();
clockAndUptime();
wireEvents();
setupConsole();
loader.track("fonts", document.fonts?.ready);
loader.track("github", loadGH());
{
  const id = location.hash.slice(1);
  showPage(PAGE_IDS.includes(id) ? id : "top");
}

// 3D scenes load after the page is usable, so content still works if WebGL fails
const globeLabel = (s, i) => `<b>${pad2(i + 1)}</b>${esc(t(s.city))}`;
loader.track("city", SHOT ? Promise.resolve() : import("./city.js").then((m) => m.initCity($("#city"))).catch((e) => console.warn("city scene disabled:", e)));
loader.track("globe", SHOT ? Promise.resolve() : import("./globe.js")
  .then((m) => m.initGlobe($("#globe"), $("#globe-labels"), footprints, { label: globeLabel, onActive: setActiveStop }))
  .then((api) => { globeApi = api; })
  .catch((e) => console.warn("globe disabled:", e)));
loader.track("badge", SHOT ? Promise.resolve() : import("./card.js").then((m) => m.initBadge($("#badge"), { ...profile, role: profile.role.en, based_in: profile.based_in.en })).catch((e) => console.warn("badge disabled:", e)));
loader.finish();
