/* Atelier – motor de randare: tipografie, forme, imagini, texturi */
(function (A) {
  'use strict';
  const C = A.C;
  const E = (A.E = {});

  // Generator aleator determinist: aceleași date produc mereu aceeași compoziție.
  E.rng = function (seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  E.hash = function (s) {
    let h = 2166136261;
    for (const c of String(s)) {
      h ^= c.charCodeAt(0);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  };

  // ș și ț corecte (virgulă dedesubt), nu variantele cu sedilă.
  E.fixRo = (s) => String(s || '').replace(/ş/g, 'ș').replace(/Ş/g, 'Ș').replace(/ţ/g, 'ț').replace(/Ţ/g, 'Ț');
  E.upper = (s) => String(s || '').toLocaleUpperCase('ro-RO');
  E.plain = (s) => E.fixRo(s).replace(/\*/g, '').replace(/\s*\n\s*/g, ' ').trim();

  const hasLS = typeof CanvasRenderingContext2D !== 'undefined' && 'letterSpacing' in CanvasRenderingContext2D.prototype;
  E.font = (f, size) =>
    `${f.style || 'normal'} ${f.weight || 400} ${Math.max(1, +size.toFixed(2))}px "${f.family}", ${f.fallback || 'sans-serif'}`;
  E.setFont = function (ctx, f, size, track) {
    ctx.font = E.font(f, size);
    if (hasLS) ctx.letterSpacing = ((track || 0) * size).toFixed(2) + 'px';
  };
  E.resetFont = (ctx) => {
    if (hasLS) ctx.letterSpacing = '0px';
  };

  // Text -> cuvinte formate din segmente; *între steluțe* = evidențiat.
  E.words = function (text, upper) {
    let s = E.fixRo(text).replace(/\r/g, '');
    if (upper) s = E.upper(s);
    if ((s.match(/\*/g) || []).length % 2) {
      const i = s.lastIndexOf('*');
      s = s.slice(0, i) + s.slice(i + 1);
    }
    const out = [];
    let hl = false, word = null;
    const end = () => {
      if (word) out.push(word);
      word = null;
    };
    for (const ch of s) {
      if (ch === '*') { hl = !hl; continue; }
      if (ch === ' ' || ch === '\t') { end(); continue; }
      if (ch === '\n') { end(); out.push({ br: true }); continue; }
      if (!word) word = { segs: [{ t: '', hl }] };
      let seg = word.segs[word.segs.length - 1];
      if (seg.hl !== hl) {
        seg = { t: '', hl };
        word.segs.push(seg);
      }
      seg.t += ch;
    }
    end();
    while (out.length && out[out.length - 1].br) out.pop();
    while (out.length && out[0].br) out.shift();
    return out;
  };

  /*
   * Așază textul în cutia dată: cea mai mare mărime care încape (căutare binară),
   * apoi echilibrează rândurile ca să nu rămână un cuvânt singur pe ultimul rând.
   * Înălțimea blocului = de la vârful majusculelor până la ultima linie de bază,
   * ca alinierea să fie optică, nu matematică.
   */
  E.layout = function (ctx, text, o) {
    const words = E.words(text, o.upper);
    if (!words.some((w) => !w.br)) return null;
    const lh = o.lh || 1.1, track = o.track || 0;
    const it = o.hlMode === 'italic' && o.hlFace;
    let spaceW = 0, capH = 0;

    const measure = (size) => {
      for (const w of words) {
        if (w.br) continue;
        w.w = 0;
        for (const s of w.segs) {
          const useIt = it && s.hl;
          s.f = useIt ? o.hlFace : o.face;
          s.size = useIt ? size * (o.hlFace.scale || 1) : size;
          s.tr = useIt ? 0 : track;
          E.setFont(ctx, s.f, s.size, s.tr);
          s.w = ctx.measureText(s.t).width;
          w.w += s.w;
        }
      }
      E.setFont(ctx, o.face, size, track);
      spaceW = ctx.measureText(' ').width;
      const m = ctx.measureText('H');
      capH = m.actualBoundingBoxAscent || size * 0.7;
    };
    const wrap = (maxW) => {
      const lines = [];
      let cur = { words: [], w: 0 };
      for (const w of words) {
        if (w.br) {
          lines.push(cur);
          cur = { words: [], w: 0 };
          continue;
        }
        const add = (cur.words.length ? spaceW : 0) + w.w;
        if (cur.words.length && cur.w + add > maxW + 0.01) {
          lines.push(cur);
          cur = { words: [w], w: w.w };
        } else {
          cur.words.push(w);
          cur.w += add;
        }
      }
      lines.push(cur);
      return lines;
    };
    const height = (n, size) => capH + (n - 1) * size * lh;
    const fits = (size) => {
      measure(size);
      for (const w of words) if (!w.br && w.w > o.maxW) return false;
      const ls = wrap(o.maxW);
      if (o.maxLines && ls.length > o.maxLines) return false;
      return height(ls.length, size) <= o.maxH;
    };

    let size = o.max, over = false;
    if (!fits(size)) {
      let lo = o.min, hi = o.max;
      if (!fits(lo)) {
        size = lo;
        over = true;
      } else {
        for (let i = 0; i < 18 && hi - lo > 0.2; i++) {
          const mid = (lo + hi) / 2;
          if (fits(mid)) lo = mid;
          else hi = mid;
        }
        size = lo;
      }
    }
    measure(size);
    let lines = wrap(o.maxW);
    if (o.maxLines && lines.length > o.maxLines) lines = lines.slice(0, o.maxLines);
    if (o.balance !== false && lines.length > 1 && !over) {
      const n = lines.length;
      let lo = o.maxW * 0.3, hi = o.maxW;
      for (let i = 0; i < 16; i++) {
        const mid = (lo + hi) / 2;
        if (wrap(mid).length <= n) hi = mid;
        else lo = mid;
      }
      lines = wrap(hi);
    }
    const w = Math.max(...lines.map((l) => l.w));
    E.resetFont(ctx);
    return { size, lines, w, h: height(lines.length, size), capH, lh, spaceW, o, over };
  };

  // Formă puțin neregulată, ca trasă de mână.
  function roughRect(ctx, x, y, w, h, rng, j) {
    const r = () => (rng() - 0.5) * j;
    ctx.beginPath();
    ctx.moveTo(x + r(), y + r());
    ctx.lineTo(x + w + r(), y + r() * 0.6);
    ctx.lineTo(x + w + r(), y + h + r());
    ctx.lineTo(x + r(), y + h + r() * 0.6);
    ctx.closePath();
  }
  function scribble(ctx, x0, x1, y, size, color, rng) {
    const j = () => (rng() - 0.5) * size * 0.05;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineCap = 'round';
    ctx.lineWidth = Math.max(1.5, size * 0.065);
    ctx.beginPath();
    ctx.moveTo(x0 - size * 0.04, y + j());
    ctx.bezierCurveTo(x0 + (x1 - x0) * 0.3, y + size * 0.05 + j(), x0 + (x1 - x0) * 0.7, y - size * 0.04 + j(), x1 + size * 0.06, y - size * 0.01 + j());
    ctx.stroke();
    ctx.restore();
  }

  E.drawText = function (ctx, lay, x, y, p) {
    if (!lay) return;
    const { size, lh, capH, o } = lay;
    const align = p.align || 'left';
    const mode = o.hlMode || 'color';
    const rng = p.rng || Math.random;
    ctx.save();
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';
    lay.lines.forEach((ln, i) => {
      const by = y + capH + i * size * lh;
      let cx = align === 'center' ? x + (lay.w - ln.w) / 2 : align === 'right' ? x + lay.w - ln.w : x;
      const pos = [];
      ln.words.forEach((w, wi) => {
        if (wi) cx += lay.spaceW;
        for (const s of w.segs) {
          pos.push({ x: cx, w: s.w, s });
          cx += s.w;
        }
      });
      const runs = [];
      let run = null;
      pos.forEach((pp) => {
        if (pp.s.hl) {
          if (run) run.x1 = pp.x + pp.w;
          else runs.push((run = { x0: pp.x, x1: pp.x + pp.w }));
        } else run = null;
      });
      if (mode === 'marker') {
        runs.forEach((r) => {
          const pad = size * 0.09, top = by - capH * 0.66, bot = by + size * 0.1;
          ctx.save();
          ctx.translate((r.x0 + r.x1) / 2, (top + bot) / 2);
          ctx.rotate((rng() - 0.5) * 0.035);
          ctx.fillStyle = p.marker;
          roughRect(ctx, -(r.x1 - r.x0) / 2 - pad, -(bot - top) / 2, r.x1 - r.x0 + pad * 2, bot - top, rng, size * 0.05);
          ctx.fill();
          ctx.restore();
        });
      }
      pos.forEach((pp) => {
        const s = pp.s;
        E.setFont(ctx, s.f, s.size, s.tr);
        if (s.hl && mode === 'outline') {
          ctx.lineWidth = Math.max(1, size * 0.03);
          ctx.lineJoin = 'round';
          ctx.strokeStyle = p.color;
          ctx.strokeText(s.t, pp.x, by);
        } else {
          ctx.fillStyle = !s.hl ? p.color : mode === 'color' ? p.hlColor : mode === 'marker' && p.markerInk ? p.markerInk : mode === 'italic' && p.italicColor ? p.italicColor : p.color;
          ctx.fillText(s.t, pp.x, by);
        }
      });
      if (mode === 'underline') runs.forEach((r) => scribble(ctx, r.x0, r.x1, by + size * 0.14, size, p.hlColor, rng));
    });
    E.resetFont(ctx);
    ctx.restore();
  };

  // ---------- forme ----------
  E.rr = function (ctx, x, y, w, h, r) {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };
  E.arrow = function (ctx, x, y, len, head, color, lw) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = lw;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + len, y);
    ctx.moveTo(x + len - head, y - head);
    ctx.lineTo(x + len, y);
    ctx.lineTo(x + len - head, y + head);
    ctx.stroke();
    ctx.restore();
  };
  // Ștampilă tip „preț” cu zimți.
  E.burst = function (ctx, cx, cy, r, inner, n) {
    ctx.beginPath();
    for (let i = 0; i < n * 2; i++) {
      const a = (i * Math.PI) / n - Math.PI / 2;
      const rr = i % 2 ? r * inner : r;
      ctx[i ? 'lineTo' : 'moveTo'](cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
    }
    ctx.closePath();
  };
  // Floare cu petale rotunjite (sticker moale).
  E.scallop = function (ctx, cx, cy, r, n) {
    ctx.beginPath();
    const step = (Math.PI * 2) / n;
    const rIn = r * 0.9;
    for (let i = 0; i <= n; i++) {
      const a = i * step - Math.PI / 2;
      const px = cx + Math.cos(a) * rIn, py = cy + Math.sin(a) * rIn;
      if (!i) ctx.moveTo(px, py);
      else {
        const am = a - step / 2;
        ctx.quadraticCurveTo(cx + Math.cos(am) * r * 1.1, cy + Math.sin(am) * r * 1.1, px, py);
      }
    }
    ctx.closePath();
  };

  // ---------- imagini ----------
  E.cover = function (ctx, img, x, y, w, h, fx, fy, zoom, radius) {
    if (!img) return;
    const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
    const s = Math.max(w / iw, h / ih) * (zoom || 1);
    const dw = iw * s, dh = ih * s;
    const dx = x + (w - dw) * (fx ?? 0.5), dy = y + (h - dh) * (fy ?? 0.5);
    ctx.save();
    if (radius) E.rr(ctx, x, y, w, h, radius);
    else {
      ctx.beginPath();
      ctx.rect(x, y, w, h);
    }
    ctx.clip();
    ctx.drawImage(img, dx, dy, dw, dh);
    ctx.restore();
  };

  const cache = new Map();
  function cached(key, make) {
    if (cache.has(key)) return cache.get(key);
    const v = make();
    cache.set(key, v);
    if (cache.size > 40) cache.delete(cache.keys().next().value);
    return v;
  }
  function toCanvas(img, max) {
    const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
    const k = Math.min(1, max / Math.max(iw, ih));
    const c = document.createElement('canvas');
    c.width = Math.round(iw * k);
    c.height = Math.round(ih * k);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    return c;
  }

  // Filtre foto aplicate o singură dată și păstrate în memorie.
  E.photo = function (img, filter, th, id) {
    if (!img || !filter || filter === 'none') return img;
    const key = ['p', id, filter, filter === 'duo' ? th.text + th.accent + th.bg : ''].join('|');
    return cached(key, () => {
      const c = toCanvas(img, 2400);
      const g = c.getContext('2d');
      const d = g.getImageData(0, 0, c.width, c.height);
      const px = d.data;
      let dark, light;
      if (filter === 'duo') {
        const a = C.lum(th.text) < C.lum(th.bg) ? th.text : th.bg;
        dark = C.rgb(C.mix(a, '#000000', 0.25));
        light = C.rgb(C.contrast(th.accent, a) > 2.2 ? th.accent : C.mix(th.accent, '#FFFFFF', 0.6));
      }
      for (let i = 0; i < px.length; i += 4) {
        const r = px[i], gg = px[i + 1], b = px[i + 2];
        let l = (0.299 * r + 0.587 * gg + 0.114 * b) / 255;
        if (filter === 'bw') {
          l = C.clamp((l - 0.5) * 1.18 + 0.5);
          px[i] = px[i + 1] = px[i + 2] = l * 255;
        } else if (filter === 'duo') {
          l = C.clamp((l - 0.5) * 1.25 + 0.5);
          px[i] = dark[0] + (light[0] - dark[0]) * l;
          px[i + 1] = dark[1] + (light[1] - dark[1]) * l;
          px[i + 2] = dark[2] + (light[2] - dark[2]) * l;
        } else if (filter === 'film') {
          // negru ridicat, culori calde, saturație mai mică: aspect de peliculă
          const m = (r + gg + b) / 3;
          px[i] = 18 + (r + (m - r) * 0.18) * 0.93 + 6;
          px[i + 1] = 16 + (gg + (m - gg) * 0.18) * 0.9;
          px[i + 2] = 22 + (b + (m - b) * 0.18) * 0.82;
        }
      }
      g.putImageData(d, 0, 0);
      return c;
    });
  };

  // Logo recolorat în culoarea textului (pentru logouri închise pe fundal închis).
  E.tint = function (img, color, id) {
    return cached(['t', id, color].join('|'), () => {
      const c = toCanvas(img, 1200);
      const g = c.getContext('2d');
      g.globalCompositeOperation = 'source-in';
      g.fillStyle = color;
      g.fillRect(0, 0, c.width, c.height);
      return c;
    });
  };

  // Granulație fină: scoate imaginea din zona „prea perfect digital”.
  let noise = null;
  E.grain = function (ctx, W, H, amount) {
    if (!amount) return;
    if (!noise) {
      noise = document.createElement('canvas');
      noise.width = noise.height = 256;
      const g = noise.getContext('2d');
      const d = g.createImageData(256, 256);
      const r = E.rng(7);
      for (let i = 0; i < d.data.length; i += 4) {
        const v = 128 + (r() - 0.5) * 180;
        d.data[i] = d.data[i + 1] = d.data[i + 2] = v;
        d.data[i + 3] = 255;
      }
      g.putImageData(d, 0, 0);
    }
    ctx.save();
    ctx.globalAlpha = amount;
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = ctx.createPattern(noise, 'repeat');
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  };

  // Gradient „mesh” moale din culorile temei.
  E.mesh = function (ctx, x, y, w, h, base, blobs, rng) {
    ctx.fillStyle = base;
    ctx.fillRect(x, y, w, h);
    const R = Math.max(w, h);
    const spots = [[0.12, 0.15], [0.92, 0.32], [0.25, 0.9], [0.85, 0.95]];
    blobs.forEach((c, i) => {
      const [px, py] = spots[i % spots.length];
      const cx = x + (px + (rng() - 0.5) * 0.25) * w, cy = y + (py + (rng() - 0.5) * 0.25) * h;
      const r = R * (0.5 + rng() * 0.3);
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, C.rgba(c.c, c.a));
      g.addColorStop(0.55, C.rgba(c.c, c.a * 0.45));
      g.addColorStop(1, C.rgba(c.c, 0));
      ctx.fillStyle = g;
      ctx.fillRect(x, y, w, h);
    });
  };

  E.pattern = function (ctx, x, y, w, h, kind, color, u) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    if (kind === 'dots') {
      const st = u * 4.2, r = u * 0.38;
      for (let yy = y + st / 2; yy < y + h; yy += st)
        for (let xx = x + st / 2; xx < x + w; xx += st) {
          ctx.beginPath();
          ctx.arc(xx, yy, r, 0, Math.PI * 2);
          ctx.fill();
        }
    } else if (kind === 'grid') {
      const st = u * 6.25;
      ctx.lineWidth = Math.max(1, u * 0.14);
      ctx.beginPath();
      for (let xx = x; xx <= x + w; xx += st) { ctx.moveTo(xx, y); ctx.lineTo(xx, y + h); }
      for (let yy = y; yy <= y + h; yy += st) { ctx.moveTo(x, yy); ctx.lineTo(x + w, yy); }
      ctx.stroke();
    } else if (kind === 'lines') {
      const st = u * 3.4;
      ctx.lineWidth = u * 0.55;
      ctx.beginPath();
      for (let k = -h; k < w + h; k += st) { ctx.moveTo(x + k, y); ctx.lineTo(x + k + h, y + h); }
      ctx.stroke();
    } else if (kind === 'rings') {
      const cx = x + w * 0.85, cy = y + h * 0.15, st = u * 4.5;
      ctx.lineWidth = Math.max(1, u * 0.22);
      for (let r = st; r < Math.hypot(w, h) * 1.1; r += st) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.restore();
  };
})(window.A = window.A || {});
