// ============================================================
//  Site settings you may want to change.
// ============================================================
export const config = {
  // false = the public site shows "available on request" instead of the resume PDFs and diploma scans
  // (those files are also git-ignored). Set true locally to see them.
  showPrivateDocs: false,

  // true = show the diploma display copies (small, watermarked, view-only) from assets/diploma-preview/.
  // The original scans in assets/diplomas/ are git-ignored and never published.
  showDiplomas: true,

  // true = show the resume viewer and downloads. The PDFs in assets/resume-public/ are built from tools/resume/*.html.
  showResume: true,

  // Visit counter backend. serve.ps1 provides /api locally.
  // On static hosting (GitHub Pages) there is no backend, so the counter hides itself.
  api: "/api",

  // Optional hosted analytics for the live site: create a free account at goatcounter.com
  // and put your site code here (e.g. "frank" for frank.goatcounter.com). Leave empty to skip.
  goatcounter: "",
};

// Local-only overrides (git-ignored): create js/config.local.js containing
//   export default { showPrivateDocs: true };
// to see the diploma scans while running serve.ps1 on your own machine. The published site never loads it.
if (["localhost", "127.0.0.1", "[::1]"].includes(location.hostname)) {
  try { Object.assign(config, (await import("./config.local.js")).default || {}); } catch { /* no local file: nothing to do */ }
}