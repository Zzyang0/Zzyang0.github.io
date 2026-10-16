// ============================================================
//  Site settings you may want to change.
// ============================================================
export const config = {
  // false = the public site shows "available on request" instead of the resume PDFs and diploma scans
  // (those files are also git-ignored). Set true locally to see them.
  showPrivateDocs: false,

  // Visit counter backend. serve.ps1 provides /api locally.
  // On static hosting (GitHub Pages) there is no backend, so the counter hides itself.
  api: "/api",

  // Optional hosted analytics for the live site: create a free account at goatcounter.com
  // and put your site code here (e.g. "frank" for frank.goatcounter.com). Leave empty to skip.
  goatcounter: "",
};
