/* Atelier – culoare: contrast WCAG, amestecuri, teme derivate */
(function (A) {
  'use strict';
  const C = (A.C = {});

  C.clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  C.rgb = function (hex) {
    let h = String(hex || '#000').replace('#', '').trim();
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    const n = parseInt(h.slice(0, 6), 16);
    if (isNaN(n)) return [0, 0, 0];
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  C.hex = (rgb) => '#' + rgb.map((v) => Math.round(C.clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('').toUpperCase();
  C.mix = function (a, b, t) {
    const x = C.rgb(a), y = C.rgb(b);
    return C.hex(x.map((v, i) => v + (y[i] - v) * t));
  };
  C.rgba = function (hex, a) {
    const [r, g, b] = C.rgb(hex);
    return `rgba(${r},${g},${b},${a})`;
  };
  C.lum = function (hex) {
    const c = C.rgb(hex).map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  C.contrast = function (a, b) {
    const x = C.lum(a), y = C.lum(b);
    return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
  };
  C.best = (bg, list) => list.reduce((p, c) => (C.contrast(bg, c) > C.contrast(bg, p) ? c : p));
  C.firstOk = (bg, list, min) => list.find((c) => C.contrast(bg, c) >= min) || C.best(bg, list);
  C.isLight = (hex) => C.lum(hex) > 0.36;

  C.toHsl = function (hex) {
    let [r, g, b] = C.rgb(hex).map((v) => v / 255);
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h /= 6;
    }
    return [h, s, l];
  };
  C.fromHsl = function (h, s, l) {
    const f = (n) => {
      const k = (n + h * 12) % 12;
      const a = s * Math.min(l, 1 - l);
      return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    };
    return C.hex([f(0) * 255, f(8) * 255, f(4) * 255]);
  };

  // Paletă armonioasă dintr-o singură culoare de brand: neutre nuanțate spre accent, nu gri morți.
  C.fromBase = function (hex, dark) {
    const [h, s, l] = C.toHsl(hex);
    let accent = hex;
    if (!dark && l > 0.72) accent = C.fromHsl(h, s, 0.5);
    if (dark && l < 0.3) accent = C.fromHsl(h, Math.max(s, 0.5), 0.62);
    const ns = Math.min(s, 0.55);
    if (dark) {
      return { bg: C.fromHsl(h, ns * 0.45, 0.12), surface: C.fromHsl(h, ns * 0.4, 0.19), text: C.fromHsl(h, ns * 0.35, 0.94), accent };
    }
    return { bg: C.fromHsl(h, ns * 0.55, 0.95), surface: C.fromHsl(h, ns * 0.6, 0.86), text: C.fromHsl(h, ns * 0.7, 0.13), accent };
  };

  // Rolurile de culoare folosite de șabloane, cu corecții automate de lizibilitate.
  C.theme = function (colors, variant, autoFix) {
    let { bg, surface, text, accent } = colors;
    const orig = { bg, surface, text, accent };
    if (variant === 'inv') {
      bg = orig.text;
      text = orig.bg;
      surface = C.mix(bg, text, 0.13);
    } else if (variant === 'accent') {
      bg = orig.accent;
      text = C.firstOk(bg, [orig.text, orig.bg, '#FFFFFF', '#121212'], 4.5);
      accent = text === orig.text ? orig.bg : orig.text;
      if (C.contrast(accent, bg) < 2) accent = C.best(bg, [orig.bg, orig.text, orig.surface]);
      surface = C.mix(bg, text, 0.12);
    }
    let fixed = false;
    if (autoFix && C.contrast(text, bg) < 4.5) {
      const towards = C.isLight(bg) ? '#000000' : '#FFFFFF';
      let t = text;
      for (let k = 0.15; k <= 1.001 && C.contrast(t, bg) < 4.5; k += 0.1) t = C.mix(text, towards, k);
      text = t;
      fixed = true;
    }
    const th = { bg, surface, text, accent, fixed };
    th.onAccent = C.firstOk(accent, [bg, text, '#FFFFFF', '#141414'], 4.5);
    th.onSurface = C.firstOk(surface, [text, bg, '#141414', '#FFFFFF'], 4.5);
    th.muted = C.mix(text, bg, 0.22);
    th.line = C.rgba(text, 0.16);
    th.hl = C.contrast(accent, bg) >= 2.6 ? accent : C.mix(accent, text, 0.55);
    th.accentText = C.contrast(accent, bg) >= 4.5 ? accent : text; // text mic
    th.accentLarge = C.contrast(accent, bg) >= 3 ? accent : text; // cifre mari
    th.marker = accent;
    th.markerInk = C.contrast(text, accent) >= 3 ? text : th.onAccent;
    th.ink = C.lum(text) < C.lum(bg) ? text : C.mix(bg, '#000000', 0.82);
    return th;
  };
})(window.A = window.A || {});
