// ============================================================
//  Loading screen: soft digital rain behind a HUD ring.
//  Progress is driven by real tasks (fonts, 3D modules, textures).
// ============================================================
const GLYPHS = "01アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEF{}<>=*";

export function startLoader() {
  const el = document.getElementById("loader");
  const canvas = document.getElementById("rain");
  const ring = document.getElementById("ring-progress");
  const pctEl = document.getElementById("hud-pct");
  const g = canvas.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  let seen = false;
  try { seen = !!sessionStorage.getItem("booted"); } catch {}

  let cols = [], fs = 16, raf = 0;
  function size() {
    canvas.width = innerWidth; canvas.height = innerHeight;
    fs = innerWidth < 600 ? 13 : 16;
    cols = Array.from({ length: Math.ceil(innerWidth / fs) }, () => Math.random() * -50);
  }
  size();
  addEventListener("resize", size);

  function draw() {
    // translucent fill leaves fading trails; low alpha = low contrast
    g.fillStyle = "rgba(3,6,7,0.14)";
    g.fillRect(0, 0, canvas.width, canvas.height);
    g.font = `${fs}px "JetBrains Mono", monospace`;
    cols.forEach((y, i) => {
      const ch = GLYPHS[(Math.random() * GLYPHS.length) | 0];
      const x = i * fs;
      g.fillStyle = Math.random() < 0.04 ? "rgba(220,255,250,0.75)" : "rgba(79,214,170,0.55)";
      g.fillText(ch, x, y * fs);
      cols[i] = y * fs > canvas.height && Math.random() > 0.975 ? 0 : y + 0.6;
    });
    raf = requestAnimationFrame(draw);
  }
  if (!reduce) draw();

  // progress bookkeeping
  const tasks = new Map();
  let shown = 0;
  const CIRC = 653;
  function update() {
    const vals = [...tasks.values()];
    const target = vals.length ? vals.filter(Boolean).length / vals.length : 0;
    shown = Math.max(shown, target);
    ring.style.strokeDashoffset = String(CIRC * (1 - shown));
    pctEl.textContent = `${Math.round(shown * 100)}%`;
  }

  const minTime = new Promise((r) => setTimeout(r, seen || reduce ? 300 : 1800));
  const all = [];

  return {
    track(name, promise) {
      tasks.set(name, false); update();
      const p = Promise.resolve(promise).catch(() => {}).then(() => { tasks.set(name, true); update(); });
      all.push(p);
      return promise;
    },
    async finish() {
      // never block the site for more than 6s, even on a slow network
      await Promise.race([Promise.all([...all, minTime]), new Promise((r) => setTimeout(r, 6000))]);
      shown = 1; update();
      setTimeout(() => {
        el.classList.add("done");
        try { sessionStorage.setItem("booted", "1"); } catch {}
        setTimeout(() => cancelAnimationFrame(raf), 800);
      }, 250);
    },
  };
}
