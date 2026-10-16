// ============================================================
//  Site search for the home page ("normal" mode).
//  Looks through every section in both languages, so "西雅图" and "Seattle" find the same thing.
// ============================================================
import { profile, contact, education, experience, projects, skills, log, footprints, learning } from "./data.js";
import { t, ui, getLang, UI } from "./i18n.js";

const both = (v) => {
  if (v == null) return "";
  if (Array.isArray(v)) return v.map(both).join(" ");
  if (typeof v === "object") return "en" in v ? `${both(v.en)} ${both(v.zh)}` : Object.values(v).map(both).join(" ");
  return String(v);
};
const cut = (s, n = 120) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

let cache = { lang: null, items: [] };

export function buildIndex(sections, aliases) {
  const lang = getLang();
  if (cache.lang === lang) return cache.items;
  const items = [];
  const add = (e) => items.push({ ...e, hay: `${e.title} ${e.extra || ""}`.toLowerCase() });

  sections.filter((s) => s.id !== "top").forEach((s) => add({
    kind: "page", icon: s.icon, title: ui(s.key), snip: ui(`sec.${s.id}.sub`),
    extra: `${(aliases[s.id] || []).join(" ")} ${UI.en["nav." + s.id]} ${UI.zh["nav." + s.id]}`, go: s.id, rank: 2,
  }));
  add({ kind: "about", icon: "fa-solid fa-id-badge", title: ui("sec.profile.title"), snip: cut(t(profile.bio)[0]), extra: `${both(profile.bio)} ${both(profile.titles)} ${both(profile.motto)}`, go: "profile" });
  footprints.forEach((f, i) => add({ kind: "place", icon: "fa-solid fa-location-dot", title: `${t(f.city)} · ${t(f.region)}`, snip: `${t(f.when)} — ${t(f.note)}`, extra: both(f.city) + " " + both(f.region) + " " + both(f.note), go: "footprints", fp: i }));
  experience.forEach((e) => add({ kind: "job", icon: "fa-solid fa-briefcase", title: `${t(e.title)} @ ${t(e.company)}`, snip: cut(t(e.points)[0]), extra: `${both(e.company)} ${both(e.title)} ${both(e.points)} ${e.tags.join(" ")} ${e.period}`, go: "experience" }));
  education.forEach((e, i) => add({ kind: "school", icon: "fa-solid fa-graduation-cap", title: t(e.school), snip: `${t(e.degree)} · GPA ${e.gpa}/${e.scale}`, extra: `${both(e.school)} ${both(e.degree)} ${both(e.courses)} diploma ${e.period}`, go: "experience", diploma: i }));
  projects.forEach((p) => add({ kind: "project", icon: "fa-solid fa-flask", title: t(p.name), snip: cut(t(p.summary)), extra: `${both(p.name)} ${both(p.summary)} ${p.stack.join(" ")} ${p.tags.join(" ")} ${p.year}`, go: "projects", pid: p.id }));
  skills.forEach((g) => g.items.forEach(([name, lvl]) => add({ kind: "skill", icon: g.icon, title: t(name), snip: `${t(g.group)} · ${lvl}/5`, extra: `${both(name)} ${both(g.group)}`, go: "skills" })));
  learning.forEach((l) => add({ kind: "learning", icon: l.icon, title: l.name, snip: ui("learn.status"), extra: `learning ongoing ${ui("learn.title")} 学习`, go: "skills" }));
  profile.resumes.forEach((r) => add({ kind: "resume", icon: "fa-solid fa-file-pdf", title: `${ui("nav.resume")} · ${r.label}`, snip: r.download, extra: `resume cv pdf download 简历 ${r.label}`, go: "resume" }));
  log.forEach((e) => add({ kind: "log", icon: e.icon || (e.type === "photo" ? "fa-solid fa-camera" : "fa-solid fa-pen-nib"), title: t(e.title), snip: cut(t(e.excerpt)), extra: `${both(e.title)} ${both(e.excerpt)} ${(e.tags || []).join(" ")}`, go: "log", log: e.id }));
  contact.forEach((c) => add({ kind: "contact", icon: c.icon, title: `${c.key} · ${t(c.label)}`, snip: c.url.replace(/^mailto:/, ""), extra: `${c.key} ${both(c.label)} ${c.url}`, go: "contact" }));

  cache = { lang, items };
  return items;
}

export function search(query, items, limit = 8) {
  const q = query.trim().toLowerCase();
  if (!q) return { tokens: [], hits: [] };
  const tokens = q.split(/\s+/).filter(Boolean);
  const scored = [];
  items.forEach((it, order) => {
    let score = 0;
    for (const tok of tokens) {
      if (!it.hay.includes(tok)) return;
      score += it.title.toLowerCase().includes(tok) ? 5 : 1;
    }
    if (it.kind === "page" && it.hay.split(/\s+/).includes(q)) score += 20;
    score += it.rank || 0;
    scored.push({ it, score, order });
  });
  scored.sort((a, b) => b.score - a.score || a.order - b.order);
  return { tokens, hits: scored.slice(0, limit).map((s) => s.it) };
}
