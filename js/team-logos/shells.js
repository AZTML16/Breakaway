/**
 * Crest outer shapes + stripe overlays (viewBox 0 0 36 36).
 * Loaded before the main game script; no dependencies.
 */
function teamLogoShellSVG(shell, bg, bd, sw) {
  var s = shell % 16;

  if (s === 0) {
    return '<path d="M18 5 L30 10 V24 Q30 29 18 32.5 Q6 29 6 24 V10 Z" fill="' + bg + '" stroke="' + bd + '" stroke-width="' + sw + '"/>';
  }
  if (s === 1) {
    return '<circle cx="18" cy="18" r="14.5" fill="' + bg + '" stroke="' + bd + '" stroke-width="' + sw + '"/>';
  }
  if (s === 2) {
    return '<rect x="4" y="5" width="28" height="26" rx="4" fill="' + bg + '" stroke="' + bd + '" stroke-width="' + sw + '"/>';
  }
  if (s === 3) {
    return '<path d="M18 4.5 L31 8.5 V22 Q31 28 18 32 Q5 28 5 22 V8.5 Z" fill="' + bg + '" stroke="' + bd + '" stroke-width="' + sw + '"/>';
  }
  if (s === 4) {
    return '<polygon points="18,4 32,12 32,24 18,32 4,24 4,12" fill="' + bg + '" stroke="' + bd + '" stroke-width="' + sw + '" stroke-linejoin="round"/>';
  }
  if (s === 5) {
    return '<path d="M18 4 L31 12 V24 L18 32 L5 24 V12 Z" fill="' + bg + '" stroke="' + bd + '" stroke-width="' + sw + '" stroke-linejoin="round"/>';
  }
  if (s === 6) {
    return '<path d="M6 8 L32 5 L30 28 L4 31 Z" fill="' + bg + '" stroke="' + bd + '" stroke-width="' + sw + '"/>';
  }
  if (s === 7) {
    return '<ellipse cx="18" cy="18" rx="15" ry="12" fill="' + bg + '" stroke="' + bd + '" stroke-width="' + sw + '"/>';
  }
  if (s === 8) {
    return '<path d="M18 5 L31 18 L18 31 L5 18 Z" fill="' + bg + '" stroke="' + bd + '" stroke-width="' + sw + '" stroke-linejoin="round"/>';
  }
  if (s === 9) {
    return '<path d="M18 3 L29 9 V25 L18 33 L7 25 V9 Z" fill="' + bg + '" stroke="' + bd + '" stroke-width="' + sw + '"/>';
  }
  if (s === 10) {
    return '<circle cx="18" cy="18" r="14.2" fill="' + bg + '" stroke="' + bd + '" stroke-width="' + sw + '"/><circle cx="18" cy="18" r="11.5" fill="none" stroke="' + bd + '" stroke-width="' + (sw * 0.55) + '" opacity=".45"/>';
  }
  if (s === 11) {
    return '<path d="M4 10 Q18 5 32 10 V26 Q18 31 4 26 Z" fill="' + bg + '" stroke="' + bd + '" stroke-width="' + sw + '"/>';
  }
  if (s === 12) {
    return '<path d="M8 5 L28 5 L32 11 V23 L25 31 L11 31 L4 23 V11 Z" fill="' + bg + '" stroke="' + bd + '" stroke-width="' + sw + '"/>';
  }
  if (s === 13) {
    return '<path d="M6 8 Q18 4 30 8 V22 Q24 30 18 31 Q12 30 6 22 Z" fill="' + bg + '" stroke="' + bd + '" stroke-width="' + sw + '"/>';
  }
  if (s === 14) {
    return '<rect x="2" y="3" width="32" height="30" rx="3" fill="' + bg + '" stroke="' + bd + '" stroke-width="' + sw + '"/>';
  }
  return '<path d="M10 6 H26 L30 12 V22 L26 30 H10 L6 22 V12 Z" fill="' + bg + '" stroke="' + bd + '" stroke-width="' + sw + '"/>';
}

function teamLogoStripeSVG(stripe, ac, sc) {
  var t = stripe % 8;
  var x = ac;
  var y = sc || x;

  if (t === 0) return '';

  if (t === 1) {
    return '<path d="M-4 40 L40 -4 L44 0 L0 44 Z" fill="' + x + '" opacity=".16"/>';
  }
  if (t === 2) {
    return '<rect x="5" y="6" width="26" height="4.5" fill="' + x + '" opacity=".22"/>';
  }
  if (t === 3) {
    return '<rect x="5" y="6" width="5" height="24" fill="' + x + '" opacity=".2"/>';
  }
  if (t === 4) {
    return '<path d="M18 8 L28 22 L8 22 Z" fill="none" stroke="' + x + '" stroke-width="1.8" opacity=".35"/>';
  }
  if (t === 5) {
    return '<path d="M5 14 H31 M5 22 H31" stroke="' + y + '" stroke-width="1.2" opacity=".28"/>';
  }
  if (t === 6) {
    return '<path d="M5 5 L12 5 L5 12 Z M31 5 L24 5 L31 12 Z" fill="' + x + '" opacity=".18"/>';
  }
  return '<path d="M6 6 L30 30 M30 6 L6 30" stroke="' + x + '" stroke-width=".8" opacity=".14"/>';
}
