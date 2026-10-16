// ============================================================
//  Anonymous visit tracking.
//  - a random id lives in this browser only; no IP address is sent or stored
//  - respects "Do Not Track"
//  - fails silently when there is no backend (e.g. static hosting)
// ============================================================
import { config } from "./config.js";

const dnt = navigator.doNotTrack === "1" || window.doNotTrack === "1";

function visitorId() {
  try {
    let id = localStorage.getItem("vid");
    if (!id || !/^[a-f0-9]{16}$/.test(id)) {
      const b = crypto.getRandomValues(new Uint8Array(8));
      id = [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
      localStorage.setItem("vid", id);
    }
    return id;
  } catch {
    return "0000000000000000";
  }
}

function refHost() {
  try {
    const h = new URL(document.referrer).hostname;
    return h && h !== location.hostname ? h.slice(0, 60) : "";
  } catch { return ""; }
}

async function send(body) {
  try {
    const res = await fetch(`${config.api}/hit`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body), keepalive: true,
    });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

export async function fetchCount() {
  try {
    const res = await fetch(`${config.api}/count`, { cache: "no-store" });
    return res.ok ? await res.json() : null;
  } catch { return null; }
}

let started = false;
export async function trackView(page, { lang, mode }) {
  // optional hosted analytics (no-op unless configured)
  if (config.goatcounter && window.goatcounter?.count) {
    window.goatcounter.count({ path: `/${page === "top" ? "" : page}`, title: page });
  }
  if (dnt) return fetchCount();

  const base = {
    v: visitorId(), p: page, l: lang, m: mode,
    w: matchMedia("(max-width: 760px)").matches ? "mobile" : "desktop", ref: refHost(),
  };
  let counts = null;
  let first = false;
  try { first = !sessionStorage.getItem("visited"); } catch { first = !started; }
  if (first) {
    try { sessionStorage.setItem("visited", "1"); } catch {}
    counts = await send({ ...base, k: "visit" });
  }
  started = true;
  const r = await send({ ...base, k: "view" });
  return r || counts;
}

export function loadGoatCounter() {
  if (!config.goatcounter || dnt) return;
  const s = document.createElement("script");
  s.async = true;
  s.src = "https://gc.zgo.at/count.js";
  s.dataset.goatcounter = `https://${config.goatcounter}.goatcounter.com/count`;
  s.dataset.goatcounterSettings = JSON.stringify({ no_onload: true });
  document.head.appendChild(s);
}
