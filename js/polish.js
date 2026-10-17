// Small finishing touches: a soft spotlight that follows the pointer over cards.
(() => {
  const SEL = ".p-card, .record, .edu-card, .entry, .c-tile, .c-card, .skill-group, .learn-card, .c-hero, .learning";
  let raf = 0;
  addEventListener("pointermove", (e) => {
    if (raf || e.pointerType === "touch") return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      const card = e.target.closest && e.target.closest(SEL);
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  }, { passive: true });
})();
