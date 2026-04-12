/**
 * Parametric crest marks for ids 80–319 (deterministic from id).
 * Complements hand-drawn 0–79 in gfx-0.js.
 */
(function () {
  function mix(s) {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return s >>> 0;
  }

  function seedFromGid(gid) {
    return mix((gid >>> 0) * 0x9e3779b9);
  }

  function polyPath(cx, cy, r, n, rotDeg) {
    var i;
    var pts = [];
    var rad = (rotDeg * Math.PI) / 180;
    for (i = 0; i < n; i++) {
      var t = rad + (i * 2 * Math.PI) / n;
      pts.push((cx + r * Math.cos(t)).toFixed(2) + ',' + (cy + r * Math.sin(t)).toFixed(2));
    }
    return 'M' + pts.join(' L') + ' Z';
  }

  function starPath(cx, cy, ro, ri, n, rotDeg) {
    var i;
    var pts = [];
    var rad = (rotDeg * Math.PI) / 180;
    for (i = 0; i < n * 2; i++) {
      var t = rad + (i * Math.PI) / n;
      var rr = i % 2 === 0 ? ro : ri;
      pts.push((cx + rr * Math.cos(t)).toFixed(2) + ',' + (cy + rr * Math.sin(t)).toFixed(2));
    }
    return 'M' + pts.join(' L') + ' Z';
  }

  window.teamLogoGfxProcedural = function (gid, a, b, tx) {
    var s0 = seedFromGid(gid);
    var s = s0;
    function next() {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
      return s;
    }

    var kind = next() % 38;
    var cx = 18;
    var cy = 16;
    var out = '';
    var n;
    var r;
    var rot;
    var i;
    var d;
    var r2;

    switch (kind) {
      case 0:
        n = 3 + (next() % 9);
        r = 9 + (next() % 4);
        rot = (next() % 360) / 3;
        out = '<path d="' + polyPath(cx, cy, r, n, rot) + '" fill="' + a + '" opacity=".92"/><path d="' + polyPath(cx, cy, r * 0.55, n, rot + 180 / n) + '" fill="' + b + '" opacity=".35"/>';
        break;
      case 1:
        n = 5 + (next() % 4);
        r = 10 + (next() % 3);
        rot = next() % 72;
        out =
          '<path d="' +
          starPath(cx, cy, r, r * (0.38 + (next() % 20) / 100), n, rot) +
          '" fill="' +
          a +
          '"/><circle cx="' +
          cx +
          '" cy="' +
          cy +
          '" r="2.2" fill="' +
          tx +
          '" opacity=".35"/>';
        break;
      case 2:
        n = 8 + (next() % 9);
        r = 11;
        d = '';
        for (i = 0; i < n; i++) {
          var ang = ((i * 360) / n + (next() % 30)) * (Math.PI / 180);
          var x2 = cx + r * Math.cos(ang);
          var y2 = cy + r * Math.sin(ang);
          d += '<line x1="' + cx + '" y1="' + cy + '" x2="' + x2.toFixed(2) + '" y2="' + y2.toFixed(2) + '" stroke="' + a + '" stroke-width="1.6" stroke-linecap="round"/>';
        }
        out = d + '<circle cx="' + cx + '" cy="' + cy + '" r="2.5" fill="' + b + '"/>';
        break;
      case 3:
        r = 10;
        n = 16 + (next() % 12);
        d = '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + a + '" stroke-width="1.4"/>';
        for (i = 0; i < n; i++) {
          var t = (i * 360) / n;
          var rad = (t * Math.PI) / 180;
          var ix = cx + (r - 1.5) * Math.cos(rad);
          var iy = cy + (r - 1.5) * Math.sin(rad);
          d += '<line x1="' + ix.toFixed(2) + '" y1="' + iy.toFixed(2) + '" x2="' + (ix + 2.2 * Math.cos(rad)).toFixed(2) + '" y2="' + (iy + 2.2 * Math.sin(rad)).toFixed(2) + '" stroke="' + b + '" stroke-width="1"/>';
        }
        out = d;
        break;
      case 4:
        n = 3 + (next() % 3);
        d = '';
        for (i = 0; i < n; i++) {
          var ox = ((next() % 7) - 3) * 1.2;
          var oy = ((next() % 7) - 3) * 1.2;
          var rr = 5 + (next() % 3);
          d += '<circle cx="' + (cx + ox) + '" cy="' + (cy + oy) + '" r="' + rr + '" fill="' + (i % 2 ? b : a) + '" opacity=".85"/>';
        }
        out = d;
        break;
      case 5:
        d = '';
        for (i = 0; i < 4; i++) {
          var py = 10 + i * 3.5 + (next() % 2);
          var ph = 2 + (next() % 2);
          d +=
            '<path d="M5 ' +
            py +
            ' Q18 ' +
            (py - 2 - (next() % 2)) +
            ' 31 ' +
            py +
            ' L31 ' +
            (py + ph) +
            ' Q18 ' +
            (py + ph + 2) +
            ' 5 ' +
            (py + ph) +
            ' Z" fill="' +
            (i % 2 ? a : b) +
            '" opacity="' +
            (0.55 + (next() % 25) / 100) +
            '"/>';
        }
        out = d;
        break;
      case 6:
        rot = 45 + (next() % 45);
        out =
          '<path d="' +
          polyPath(cx, cy, 11, 4, rot) +
          '" fill="' +
          b +
          '" opacity=".5"/><path d="' +
          polyPath(cx, cy, 7, 4, rot) +
          '" fill="' +
          a +
          '"/><path d="M18 11v10M13 16h10" stroke="' + tx + '" stroke-width=".8" opacity=".4"/>';
        break;
      case 7:
        r = 8 + (next() % 3);
        out =
          '<path d="M18 8 L24 14 L22 22 L14 22 L12 14 Z" fill="' +
          a +
          '"/><path d="M18 10 L22 14 L21 19 L15 19 L14 14 Z" fill="' +
          b +
          '" opacity=".45"/><circle cx="18" cy="15" r="1.2" fill="' + tx + '"/>';
        break;
      case 8:
        d = '';
        for (i = 0; i < 5; i++) {
          var yy = 11 + i * 3;
          d += '<path d="M8 ' + yy + ' L28 ' + (yy + 1 + (next() % 2)) + '" stroke="' + (i % 2 ? a : b) + '" stroke-width="1.4" stroke-linecap="round"/>';
        }
        out = d;
        break;
      case 9:
        n = 6 + (next() % 5);
        d = 'M18 8 ';
        for (i = 1; i <= n; i++) {
          var px = 18 + (8 + (next() % 4)) * Math.sin((i * 6.28) / n);
          var py = 16 + (i * 18) / n;
          d += 'L' + px.toFixed(1) + ' ' + py.toFixed(1) + ' ';
        }
        d += 'Z';
        out = '<path d="' + d + '" fill="' + a + '" opacity=".88"/><path d="' + d + '" fill="none" stroke="' + b + '" stroke-width=".6"/>';
        break;
      case 10:
        d = '';
        for (i = 0; i < 3; i++) {
          rot = i * 120 + (next() % 40);
          d +=
            '<ellipse cx="' +
            (cx + 4 * Math.cos((rot * Math.PI) / 180)).toFixed(2) +
            '" cy="' +
            (cy + 4 * Math.sin((rot * Math.PI) / 180)).toFixed(2) +
            '" rx="6" ry="4" fill="' +
            (i % 2 ? a : b) +
            '" opacity=".45" transform="rotate(' +
            rot +
            ' ' +
            cx +
            ' ' +
            cy +
            ')"/>';
        }
        out = d + '<circle cx="' + cx + '" cy="' + cy + '" r="3" fill="' + a + '"/>';
        break;
      case 11:
        d = '';
        for (i = 0; i < 6; i++) {
          var hx = 18 + (i % 3) * 5 - 5;
          var hy = 12 + Math.floor(i / 3) * 6;
          d += '<polygon points="' + hx + ',' + (hy + 3) + ' ' + (hx + 2.5) + ',' + hy + ' ' + (hx + 5) + ',' + (hy + 3) + '" fill="' + (i % 2 ? a : b) + '"/>';
        }
        out = d;
        break;
      case 12:
        n = 5 + (next() % 4);
        d = '<circle cx="' + cx + '" cy="' + cy + '" r="9" fill="none" stroke="' + a + '" stroke-width="1.2"/>';
        for (i = 0; i < n; i++) {
          var a0 = (i * 360) / n;
          var a1 = ((i + 0.7) * 360) / n;
          d +=
            '<path d="M' +
            cx +
            ' ' +
            cy +
            ' L' +
            (cx + 9 * Math.cos((a0 * Math.PI) / 180)).toFixed(2) +
            ' ' +
            (cy + 9 * Math.sin((a0 * Math.PI) / 180)).toFixed(2) +
            ' A9 9 0 0 1 ' +
            (cx + 9 * Math.cos((a1 * Math.PI) / 180)).toFixed(2) +
            ' ' +
            (cy + 9 * Math.sin((a1 * Math.PI) / 180)).toFixed(2) +
            ' Z" fill="' +
            b +
            '" opacity=".25"/>';
        }
        out = d;
        break;
      case 13:
        n = 8 + (next() % 6);
        d = '';
        for (i = 0; i < n; i++) {
          var ang2 = ((i * 360) / n + (next() % 20)) * (Math.PI / 180);
          var x0 = cx + 5 * Math.cos(ang2);
          var y0 = cy + 5 * Math.sin(ang2);
          var x1 = cx + 11 * Math.cos(ang2);
          var y1 = cy + 11 * Math.sin(ang2);
          d += '<line x1="' + x0.toFixed(2) + '" y1="' + y0.toFixed(2) + '" x2="' + x1.toFixed(2) + '" y2="' + y1.toFixed(2) + '" stroke="' + a + '" stroke-width="2.2" stroke-linecap="square"/>';
        }
        out = d + '<circle cx="' + cx + '" cy="' + cy + '" r="4" fill="' + b + '" opacity=".4"/>';
        break;
      case 14:
        out =
          '<path d="M10 10 L26 10 L24 24 L12 24 Z" fill="' +
          b +
          '" opacity=".6"/><path d="M12 12 L24 12 L23 22 L13 22 Z" fill="' +
          a +
          '"/><path d="M14 14h8M14 17h8M14 20h5" stroke="' + tx + '" stroke-width=".55" opacity=".4"/>';
        break;
      case 15:
        out =
          '<path d="M8 22 Q12 10 18 12 Q24 10 28 22 Q18 26 8 22 Z" fill="' +
          a +
          '"/><path d="M12 20 Q18 14 24 20" fill="none" stroke="' + b + '" stroke-width="1.2"/>';
        break;
      case 16:
        rot = next() % 40;
        out =
          '<path d="M12 8 L24 8 L26 18 L18 28 L10 18 Z" fill="' +
          b +
          '" opacity=".55" transform="rotate(' +
          rot +
          ' 18 16)"/><path d="M14 10 L22 10 L23 17 L18 24 L13 17 Z" fill="' + a + '" transform="rotate(' +
          rot +
          ' 18 16)"/>';
        break;
      case 17:
        d = '';
        var hx0 = 12 + (next() % 3);
        var hy0 = 12 + (next() % 3);
        for (i = 0; i < 7; i++) {
          var col = i % 3;
          var row = Math.floor(i / 3);
          if (i === 6) row = 2;
          d +=
            '<polygon points="' +
            (hx0 + col * 5) +
            ',' +
            (hy0 + row * 4 + 2) +
            ' ' +
            (hx0 + col * 5 + 2.5) +
            ',' +
            (hy0 + row * 4) +
            ' ' +
            (hx0 + col * 5 + 5) +
            ',' +
            (hy0 + row * 4 + 2) +
            '" fill="' +
            (i % 2 ? a : b) +
            '" opacity=".8"/>';
        }
        out = d;
        break;
      case 18:
        r = 4 + (next() % 2);
        out =
          '<path d="M8 8 L12 8 L12 12 L8 12 Z M24 8 L28 8 L28 12 L24 12 Z M8 24 L12 24 L12 28 L8 28 Z M24 24 L28 24 L28 28 L24 28 Z" fill="' +
          a +
          '" opacity=".75"/><circle cx="18" cy="18" r="' +
          r +
          '" fill="' +
          b +
          '"/>';
        break;
      case 19:
        out =
          '<circle cx="18" cy="16" r="9" fill="none" stroke="' +
          a +
          '" stroke-width="1.3"/><path d="M9 9 L27 27 M27 9 L9 27" stroke="' +
          b +
          '" stroke-width="1.4" opacity=".45"/><circle cx="18" cy="16" r="3" fill="' + a + '" opacity=".5"/>';
        break;
      case 20:
        out =
          '<path d="M6 20 Q18 8 30 20 Q18 28 6 20 Z" fill="' +
          a +
          '"/><path d="M10 20 Q18 12 26 20" fill="none" stroke="' + b + '" stroke-width="1"/><path d="M14 22 Q18 24 22 22" fill="none" stroke="' + tx + '" stroke-width=".6" opacity=".5"/>';
        break;
      case 21:
        d = '';
        for (i = 0; i < 4; i++) {
          for (var j = 0; j < 4; j++) {
            if ((i + j + gid) % 3 === 0) {
              d += '<path d="M' + (10 + j * 4) + ' ' + (10 + i * 4) + ' h2 v2 h-2 z" fill="' + a + '" opacity=".7"/>';
            }
          }
        }
        out = d || '<rect x="12" y="12" width="12" height="12" fill="' + a + '"/>';
        break;
      case 22:
        n = 10 + (next() % 8);
        d = '';
        for (i = 0; i < n; i++) {
          var ang3 = (i * 360) / n;
          var rr = 7 + (next() % 4);
          var bx = cx + rr * Math.cos((ang3 * Math.PI) / 180);
          var by = cy + rr * Math.sin((ang3 * Math.PI) / 180);
          d += '<circle cx="' + bx.toFixed(2) + '" cy="' + by.toFixed(2) + '" r="1.4" fill="' + (i % 2 ? a : b) + '"/>';
        }
        out = d + '<circle cx="' + cx + '" cy="' + cy + '" r="2.5" fill="' + tx + '" opacity=".4"/>';
        break;
      case 23:
        out =
          '<path d="M18 9 C12 9 10 14 12 18 C10 22 12 27 18 27 C24 27 26 22 24 18 C26 14 24 9 18 9" fill="' +
          b +
          '" opacity=".4"/><path d="M18 11 C14 11 12 15 13 18 C12 21 14 25 18 25 C22 25 24 21 23 18 C24 15 22 11 18 11" fill="' +
          a +
          '"/><circle cx="16" cy="17" r="0.8" fill="' + tx + '"/><circle cx="20" cy="17" r="0.8" fill="' + tx + '"/>';
        break;
      case 24:
        out =
          '<path d="M14 8 L16 14 L10 12 L14 16 L8 18 L14 20 L10 24 L16 22 L14 28 L18 24 L22 28 L20 22 L26 24 L22 20 L28 18 L22 16 L26 12 L20 14 L18 8 Z" fill="' +
          a +
          '"/><circle cx="18" cy="18" r="2.5" fill="' + b + '" opacity=".5"/>';
        break;
      /* --- Hockey-realism families: motion, minimal, slick, memorial, etc. --- */
      case 25: {
        /* Speed / action — forward streaks */
        var ang = (next() % 50) - 25;
        out =
          '<g transform="rotate(' +
          ang +
          ' 18 16)">' +
          '<path d="M4 16 L14 12 L32 14 L14 18 Z" fill="' +
          a +
          '" opacity=".88"/><path d="M6 19 L16 15 L30 17 L16 21 Z" fill="' +
          b +
          '" opacity=".55"/><path d="M8 22 L18 18 L28 20 L18 24 Z" fill="' +
          tx +
          '" opacity=".25"/></g>';
        break;
      }
      case 26:
        /* Uniform / clean — one ring + badge dot */
        out =
          '<circle cx="' +
          cx +
          '" cy="' +
          cy +
          '" r="11" fill="none" stroke="' +
          a +
          '" stroke-width="2.4"/><circle cx="' +
          cx +
          '" cy="' +
          cy +
          '" r="6.5" fill="' +
          b +
          '" opacity=".22"/><circle cx="' +
          cx +
          '" cy="' +
          cy +
          '" r="2.8" fill="' +
          a +
          '"/>';
        break;
      case 27:
        /* Slick — twin chevrons */
        out =
          '<path d="M6 16 L14 10 L14 13 L9 16 L14 19 L14 22 Z" fill="' +
          a +
          '" opacity=".95"/><path d="M12 16 L22 8 L22 12 L15 16 L22 20 L22 24 Z" fill="' +
          b +
          '" opacity=".75"/><path d="M20 16 L30 10 L30 14 L23 16 L30 18 L30 22 Z" fill="' +
          a +
          '" opacity=".55"/>';
        break;
      case 28:
        /* Memorial / classic — simple laurel suggestion */
        out =
          '<path d="M6 18 Q10 8 14 14 Q10 12 6 18" fill="none" stroke="' +
          b +
          '" stroke-width="1.4" stroke-linecap="round"/><path d="M30 18 Q26 8 22 14 Q26 12 30 18" fill="none" stroke="' +
          b +
          '" stroke-width="1.4" stroke-linecap="round"/><ellipse cx="18" cy="17" rx="5" ry="4" fill="' +
          a +
          '" opacity=".85"/><path d="M15 17 h6" stroke="' +
          tx +
          '" stroke-width=".6" opacity=".5"/>';
        break;
      case 29:
        /* Energy bolt */
        rot = (next() % 24) - 12;
        out =
          '<path d="M22 6 L14 16 L18 16 L12 28 L24 14 L19 14 Z" fill="' +
          a +
          '" transform="rotate(' +
          rot +
          ' 18 16)"/><path d="M22 6 L14 16 L18 16 L12 28 L24 14 L19 14 Z" fill="none" stroke="' +
          tx +
          '" stroke-width=".35" opacity=".4" transform="rotate(' +
          rot +
          ' 18 16)"/>';
        break;
      case 30:
        /* Abstract stick + blade */
        out =
          '<path d="M10 26 L16 8 L19 8 L13 26 Z" fill="' +
          b +
          '" opacity=".65"/><path d="M13 24 Q18 22 26 20 Q28 22 27 25 Q22 27 12 28 Z" fill="' +
          a +
          '"/><line x1="16" y1="10" x2="12" y2="26" stroke="' +
          tx +
          '" stroke-width=".45" opacity=".35"/>';
        break;
      case 31:
        /* Championship ribbon */
        out =
          '<path d="M6 12 H30 V20 H22 L18 24 L14 20 H6 Z" fill="' +
          a +
          '"/><path d="M8 14 H28 V18 H8 Z" fill="' +
          b +
          '" opacity=".35"/><circle cx="18" cy="16" r="2" fill="' +
          tx +
          '" opacity=".4"/>';
        break;
      case 32:
        /* Crossed clash — rivalry energy */
        out =
          '<path d="M8 8 L28 28" stroke="' +
          a +
          '" stroke-width="3" stroke-linecap="round"/><path d="M28 8 L8 28" stroke="' +
          b +
          '" stroke-width="3" stroke-linecap="round"/><circle cx="18" cy="18" r="4" fill="none" stroke="' +
          tx +
          '" stroke-width=".6" opacity=".45"/>';
        break;
      case 33:
        /* Inner shield (like shoulder patch) */
        out =
          '<path d="M18 7 L28 11 V22 Q28 28 18 31 Q8 28 8 22 V11 Z" fill="' +
          b +
          '" opacity=".4"/><path d="M18 9 L26 12.5 V21 Q26 26 18 28.5 Q10 26 10 21 V12.5 Z" fill="' +
          a +
          '"/><path d="M18 14 v8 M14 18 h8" stroke="' +
          tx +
          '" stroke-width=".5" opacity=".35"/>';
        break;
      case 34:
        /* Mountain peak mark */
        out =
          '<path d="M4 28 L12 12 L18 18 L24 10 L32 28 Z" fill="' +
          a +
          '" opacity=".9"/><path d="M10 28 L16 16 L22 22 L28 28 Z" fill="' +
          b +
          '" opacity=".45"/><path d="M16 28 L18 20 L20 28" fill="none" stroke="' +
          tx +
          '" stroke-width=".6" opacity=".4"/>';
        break;
      case 35:
        /* Wing / motion arc */
        out =
          '<path d="M6 20 Q18 6 30 14 Q22 12 14 18 Q22 16 30 22 Q18 18 6 24 Z" fill="' +
          a +
          '" opacity=".88"/><path d="M8 21 Q18 10 28 16" fill="none" stroke="' +
          b +
          '" stroke-width="1.1" opacity=".5"/>';
        break;
      case 36:
        /* Split-circle duotone */
        out =
          '<circle cx="18" cy="16" r="10" fill="' +
          b +
          '" opacity=".35"/><path d="M18 6 A10 10 0 0 1 18 26 Z" fill="' +
          a +
          '"/><circle cx="18" cy="16" r="10" fill="none" stroke="' +
          tx +
          '" stroke-width=".55" opacity=".4"/>';
        break;
      case 37:
        /* Hex cluster lockup */
        out =
          '<polygon points="18,9.5 22.2,12 22.2,16.8 18,19.3 13.8,16.8 13.8,12" fill="' +
          a +
          '"/><polygon points="11.5,14 15.7,16.5 15.7,21.3 11.5,23.8 7.3,21.3 7.3,16.5" fill="' +
          b +
          '" opacity=".78"/><polygon points="24.5,14 28.7,16.5 28.7,21.3 24.5,23.8 20.3,21.3 20.3,16.5" fill="' +
          b +
          '" opacity=".78"/>';
        break;
      default:
        r = 6 + (next() % 5);
        r2 = 3 + (next() % 3);
        n = 4 + (next() % 5);
        out =
          '<path d="' +
          polyPath(cx, cy, r, n, next() % 90) +
          '" fill="' +
          a +
          '" opacity=".75"/><path d="' +
          starPath(cx, cy, r2 + 4, r2, 5 + (next() % 2), next() % 36) +
          '" fill="' +
          b +
          '" opacity=".4"/><path d="M18 12v8M14 16h8" stroke="' + tx + '" stroke-width=".5" opacity=".35"/>';
        break;
    }

    return out;
  };
})();
