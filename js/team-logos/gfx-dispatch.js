/**
 * Routes graphic id → hand-tuned (0–79) or procedural (80–319). Total: 320 marks.
 */
var TEAM_LOGO_GRAPHIC_COUNT = 320;

function teamLogoGraphicSVG(gid, cols) {
  var a = cols.accent;
  var b = cols.secondary || cols.sec || a;
  var tx = cols.text;
  var g = (gid >>> 0) % TEAM_LOGO_GRAPHIC_COUNT;

  if (g < 80 && typeof window.__teamLogoGfxHand0 === 'function') {
    return window.__teamLogoGfxHand0(g, a, b, tx);
  }
  if (typeof window.teamLogoGfxProcedural === 'function') {
    return window.teamLogoGfxProcedural(g, a, b, tx);
  }
  return '<circle cx="18" cy="18" r="8" fill="' + a + '"/>';
}
