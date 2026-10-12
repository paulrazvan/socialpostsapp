/* Atelier – stiluri de design. Fiecare stil se adaptează la orice format (vertical, pătrat, orizontal, copertă). */
(function (A) {
  'use strict';
  const { E, C } = A;
  const TPL = (A.TEMPLATES = []);
  const add = (id, meta, draw) => TPL.push({ id, ...meta, draw });
  const has = (s) => !!(s && String(s).trim());

  // ---------- blocuri de bază ----------
  function txt(L, text, c) {
    if (!has(text)) return null;
    const head = c.role === 'head';
    const face = c.faceObj || (head ? { ...L.fp.head } : { family: L.fp.body.family, weight: c.weight || 400, fallback: 'sans-serif' });
    const lay = E.layout(L.ctx, text, {
      face,
      hlFace: L.fp.it,
      hlMode: c.hl === false ? 'none' : head ? L.o.hlStyle : 'color',
      maxW: Math.max(10, c.maxW),
      maxH: c.maxH || 1e9,
      max: c.size,
      min: Math.min(c.min || c.size * 0.5, c.size),
      lh: c.lh || (head ? L.fp.head.lh : 1.3),
      track: c.track ?? (head ? L.fp.head.track : 0),
      upper: c.upper ?? (head && !!L.fp.head.upper),
      maxLines: c.maxLines,
      balance: c.balance
    });
    if (!lay) return null;
    return {
      w: lay.w, h: lay.h, lay, desc: lay.size * (head ? 0.26 : 0.2),
      draw: (x, y) => E.drawText(L.ctx, lay, x, y, {
        align: c.align, color: c.color || L.th.text, hlColor: c.hlColor || L.th.hl,
        outlineAll: c.outline, outlineColor: c.outlineColor,
        marker: c.marker || L.th.marker, markerInk: c.markerInk || (c.color && c.color !== L.th.text ? null : L.th.markerInk), italicColor: c.italicColor, rng: L.rng
      })
    };
  }
  // Culorile de evidențiere potrivite pentru un text de culoare `ink` pe fundalul `bg`.
  function hlOn(L, bg, ink) {
    const a = L.th.accent;
    return {
      hlColor: C.contrast(a, bg) >= 2.6 ? a : C.mix(a, ink, 0.6),
      marker: a,
      markerInk: C.contrast(ink, a) >= 3 ? ink : L.th.onAccent
    };
  }
  const eyebrow = (L, maxW, align, color, lines = 2) =>
    txt(L, L.d.eyebrow, { role: 'body', weight: 600, size: L.u * 2.3, min: L.u * 1.7, upper: true, track: 0.14,
      maxLines: lines, maxW, align, color: color || L.th.accentText, lh: 1.25 });
  const subtitle = (L, maxW, align, color, k = 1) => {
    const size = L.u * 3.3 * k;
    return txt(L, L.d.subtitle, { role: 'body', size, min: L.u * 2.4, lh: 1.36, maxLines: 4,
      maxW: Math.min(maxW, size * 25), align, color: color || L.th.muted });
  };
  const contact = (L, maxW, align, color) =>
    txt(L, L.d.contact, { role: 'body', weight: 500, size: L.u * 2.2, min: L.u * 1.6, maxLines: 1, maxW, align,
      color: color || L.th.muted, track: 0.01 });
  const headline = (L, maxW, maxH, align, color, k = 1, extra = {}) =>
    txt(L, L.d.headline, { role: 'head', size: L.u * 12.5 * k * (L.o.headScale || 1), min: L.u * 3.8, maxW, maxH, align,
      color: color || L.th.text, ...extra });
  const detail = (L, maxW, align, color) =>
    txt(L, L.d.detail, { role: 'body', weight: 700, size: L.u * 2.5, min: L.u * 1.8, upper: true, track: 0.1, maxLines: 2,
      maxW, align, color: color || L.th.text, lh: 1.25 });
  const offerGiant = (L, maxW, maxH, align, color) =>
    txt(L, L.d.offer, { role: 'head', size: maxH * 1.45, min: L.u * 5, maxW, maxH, maxLines: 2, align,
      color: color || L.th.accentLarge, hl: false, upper: true, lh: 0.92 });

  function cta(L, style, c = {}) {
    if (!has(L.d.cta)) return null;
    const { ctx, u, th } = L;
    let size = c.size || u * 2.75;
    const upper = !!c.upper;
    const face = { family: L.fp.body.family, weight: 700 };
    const label = upper ? E.upper(E.plain(L.d.cta)) : E.plain(L.d.cta);
    const track = upper ? 0.08 : 0.005;
    const link = style === 'link';
    const tw = (s) => { E.setFont(ctx, face, s, track); const w = ctx.measureText(label).width; E.resetFont(ctx); return w; };
    const geom = (s) => {
      const padX = link ? 0 : s * 1.35;
      return { padX, aw: s * 1.45, gap: s * 0.6, h: link ? s * 1.7 : s * 2.75 };
    };
    let g = geom(size), w = tw(size) + g.padX * 2 + g.aw + g.gap;
    if (c.maxW && w > c.maxW) {
      size *= c.maxW / w;
      g = geom(size);
      w = tw(size) + g.padX * 2 + g.aw + g.gap;
    }
    const fill = c.fill || th.accent;
    const ink = c.ink || (link || style === 'outline' ? th.text : style === 'glass' ? th.text : th.onAccent);
    const off = style === 'brutal' ? u * 1.1 : 0;
    return {
      w: w + off, h: g.h + off,
      draw(x, y) {
        const h = g.h;
        ctx.save();
        if (style === 'pill' || style === 'square') {
          E.rr(ctx, x, y, w, h, style === 'pill' ? h / 2 : size * 0.35);
          ctx.fillStyle = fill;
          ctx.fill();
        } else if (style === 'outline') {
          const lw = Math.max(1.5, size * 0.09);
          E.rr(ctx, x + lw / 2, y + lw / 2, w - lw, h - lw, (h - lw) / 2);
          ctx.lineWidth = lw;
          ctx.strokeStyle = ink;
          ctx.stroke();
        } else if (style === 'glass') {
          const lightBg = C.isLight(th.bg);
          E.rr(ctx, x, y, w, h, h / 2);
          ctx.fillStyle = lightBg ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.12)';
          ctx.fill();
          ctx.lineWidth = Math.max(1, size * 0.05);
          ctx.strokeStyle = lightBg ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)';
          ctx.stroke();
        } else if (style === 'brutal') {
          E.rr(ctx, x + off, y + off, w, h, size * 0.3);
          ctx.fillStyle = c.inkLine || th.ink;
          ctx.fill();
          E.rr(ctx, x, y, w, h, size * 0.3);
          ctx.fillStyle = fill;
          ctx.fill();
          ctx.lineWidth = Math.max(2, u * 0.5);
          ctx.strokeStyle = c.inkLine || th.ink;
          ctx.stroke();
        }
        E.setFont(ctx, face, size, track);
        const capH = ctx.measureText('H').actualBoundingBoxAscent || size * 0.7;
        const by = y + h / 2 + capH / 2;
        ctx.fillStyle = ink;
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(label, x + g.padX, by);
        const textW = w - g.padX * 2 - g.aw - g.gap;
        E.resetFont(ctx);
        E.arrow(ctx, x + g.padX + textW + g.gap, y + h / 2, g.aw, size * 0.36, ink, Math.max(1.5, size * 0.1));
        if (link) {
          ctx.fillStyle = ink;
          ctx.fillRect(x, by + size * 0.32, w, Math.max(1, size * 0.07));
        }
        ctx.restore();
      }
    };
  }

  function pill(L, label, c = {}) {
    if (!has(label)) return null;
    const { ctx, u, th } = L;
    const face = { family: L.fp.body.family, weight: 700 };
    const up = E.upper(E.plain(label));
    const track = 0.08;
    let size = c.size || u * 2.2;
    const width = (s) => { E.setFont(ctx, face, s, track); const t = ctx.measureText(up).width; E.resetFont(ctx); return t + s * 2.4; };
    let w = width(size);
    if (c.maxW && w > c.maxW) { size *= c.maxW / w; w = width(size); }
    const h = size * 2.5;
    return {
      w, h,
      draw(x, y) {
        ctx.save();
        E.rr(ctx, x, y, w, h, h / 2);
        if (c.fill) { ctx.fillStyle = c.fill; ctx.fill(); }
        if (c.stroke) { ctx.lineWidth = Math.max(1, size * 0.08); ctx.strokeStyle = c.stroke; ctx.stroke(); }
        E.setFont(ctx, face, size, track);
        const capH = ctx.measureText('H').actualBoundingBoxAscent || size * 0.7;
        ctx.fillStyle = c.ink || th.text;
        ctx.fillText(up, x + size * 1.2, y + h / 2 + capH / 2);
        E.resetFont(ctx);
        ctx.restore();
      }
    };
  }
  const offerLabel = (L) => (has(L.d.offer) ? E.plain(L.d.offer) + (has(L.d.detail) ? '  ·  ' + E.plain(L.d.detail) : '') : '');

  function logo(L, maxH, maxW, color) {
    const img = L.img.logo;
    if (img) {
      const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
      const tall = iw / ih < 1.8;
      let h = tall ? maxH * 1.4 : maxH, w = (iw / ih) * h;
      if (w > maxW) { w = maxW; h = (ih / iw) * w; }
      const src = L.o.logoTint === 'auto' ? E.tint(img, color || L.th.text, L.logoId) : img;
      return { w, h, draw: (x, y) => L.ctx.drawImage(src, x, y, w, h) };
    }
    return txt(L, L.d.brand, { role: 'head', size: maxH * 0.8, min: maxH * 0.4, maxLines: 1, maxW, color: color || L.th.text, hl: false, lh: 1 });
  }

  function offerBadge(L, D, c = {}) {
    if (!has(L.d.offer)) return null;
    const { ctx, th } = L;
    const fill = c.fill || th.accent, ink = c.ink || th.onAccent;
    const shape = c.shape || 'circle';
    const inner = D * (shape === 'circle' ? 0.7 : 0.62);
    const dt = has(L.d.detail);
    const big = txt(L, L.d.offer, { role: 'head', size: D * 0.42, min: D * 0.08, maxW: inner, maxH: D * (dt ? 0.28 : 0.4),
      maxLines: 2, align: 'center', color: ink, hl: false, upper: true, lh: 0.95 });
    const small = dt ? txt(L, L.d.detail, { role: 'body', weight: 700, size: D * 0.066, min: D * 0.045, maxW: inner * 0.92,
      maxLines: 3, align: 'center', color: ink, upper: true, track: 0.06, lh: 1.22 }) : null;
    return {
      w: D, h: D,
      draw(x, y) {
        ctx.save();
        ctx.translate(x + D / 2, y + D / 2);
        ctx.rotate(c.rot || 0);
        const path = () => {
          if (shape === 'burst') E.burst(ctx, 0, 0, D / 2, 0.87, 22);
          else if (shape === 'scallop') E.scallop(ctx, 0, 0, (D / 2) * 0.92, 12);
          else { ctx.beginPath(); ctx.arc(0, 0, D / 2, 0, Math.PI * 2); }
        };
        if (c.shadow) {
          ctx.save();
          ctx.translate(c.shadow, c.shadow);
          path();
          ctx.fillStyle = c.line || th.ink;
          ctx.fill();
          ctx.restore();
        }
        path();
        ctx.fillStyle = fill;
        ctx.fill();
        if (c.stroke) {
          ctx.lineWidth = c.stroke;
          ctx.lineJoin = 'round';
          ctx.strokeStyle = c.line || th.ink;
          ctx.stroke();
        }
        if (c.ring) {
          ctx.beginPath();
          ctx.arc(0, 0, (D / 2) * 0.88, 0, Math.PI * 2);
          ctx.lineWidth = Math.max(1, D * 0.007);
          ctx.setLineDash([D * 0.018, D * 0.016]);
          ctx.strokeStyle = C.rgba(ink, 0.6);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        const gap = small ? D * 0.045 : 0;
        const tot = (big ? big.h : 0) + (small ? gap + small.h : 0);
        let ty = -tot / 2;
        if (big) { big.draw(-big.w / 2, ty); ty += big.h + gap; }
        if (small) small.draw(-small.w / 2, ty);
        ctx.restore();
      }
    };
  }

  // Rând de sus: logo la stânga, eticheta sau contactul la dreapta.
  function topRow(L, tb, c = {}) {
    const { ctx, u, th } = L;
    const lg = c.noLogo ? null : logo(L, c.logoH || u * 5, tb.w * 0.5, c.color || th.text);
    const room = tb.w - (lg ? lg.w + u * 5 : 0);
    let rt = null;
    if (c.right === 'eyebrow') rt = eyebrow(L, room, 'right', c.rightColor, 1);
    if (c.right === 'contact') rt = contact(L, room, 'right', c.rightColor);
    if (rt && rt.lay.over) rt = null;
    const h = Math.max(lg ? lg.h : 0, rt ? rt.h : 0);
    if (lg) lg.draw(c.center ? tb.x + (tb.w - lg.w) / 2 : tb.x, tb.y + (h - lg.h) / 2);
    if (rt) rt.draw(tb.x + tb.w - rt.w, tb.y + (h - rt.h) / 2);
    let bottom = tb.y + h;
    if (c.rule && h) {
      bottom += u * 2.6;
      ctx.fillStyle = c.ruleColor || th.line;
      ctx.fillRect(tb.x, bottom, tb.w, Math.max(1, u * 0.14));
    }
    return { bottom, h, right: rt ? c.right : null };
  }

  // Așază blocuri pe verticală. `flex` primește înălțimea rămasă (de obicei titlul). `g` = spațiu înainte.
  function compose(area, list, align = 'left', v = 'bottom') {
    let items = list.filter((i) => i && (i.flex || i.b));
    // Spațiul de după un text include coborârea literelor (g, p, ț), ca blocurile să nu se lipească.
    const gapOf = (i, k, arr) => (k ? (i.g || 0) + ((arr[k - 1].b && arr[k - 1].b.desc) || 0) : 0);
    const fixed = items.reduce((s, i, k) => s + (i.flex ? 0 : i.b.h) + (k ? (i.g || 0) + (items[k - 1].b ? items[k - 1].b.desc || 0 : 0) : 0), 0);
    const flex = items.find((i) => i.flex);
    const sum = () => items.filter((i) => i.b).reduce((s, i, k, arr) => s + i.b.h + gapOf(i, k, arr), 0);
    if (flex) {
      flex.b = flex.flex(Math.max(10, area.h - fixed));
      const over = sum() - area.h;
      if (flex.b && over > 0.5) flex.b = flex.flex(Math.max(10, area.h - fixed - over));
    }
    items = items.filter((i) => i.b);
    const total = sum();
    let y = v === 'top' ? area.y : v === 'center' ? area.y + (area.h - total) / 2 : area.y + area.h - total;
    items.forEach((i, k) => {
      y += gapOf(i, k, items);
      const a = i.align || align;
      const x = i.dx != null ? area.x + i.dx : a === 'center' ? area.x + (area.w - i.b.w) / 2 : a === 'right' ? area.x + area.w - i.b.w : area.x;
      i.r = { x, y, w: i.b.w, h: i.b.h };
      y += i.b.h;
    });
    return {
      items, h: total,
      top: items.length ? items[0].r.y : area.y,
      bottom: y,
      draw(dx = 0, dy = 0) { items.forEach((i) => i.b.draw(i.r.x + dx, i.r.y + dy)); }
    };
  }
  const spacer = (h) => ({ w: 1, h, draw() {} });

  function paintBg(L, def, c = {}) {
    const { ctx, W, H, th, u, o } = L;
    let m = o.bgMode === 'auto' || !o.bgMode ? def : o.bgMode;
    if (L.img.photo && (o.bgMode === 'auto' || !o.bgMode) && !c.slot) m = 'image';
    if (m === 'image' && (!L.img.photo || c.slot)) m = def === 'image' ? 'solid' : def;
    if (m === 'gradient') {
      const g = ctx.createLinearGradient(0, 0, W * 0.45, H);
      g.addColorStop(0, th.bg);
      g.addColorStop(1, C.mix(th.surface, th.accent, 0.08));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    } else if (m === 'mesh') {
      E.mesh(ctx, 0, 0, W, H, th.bg, [
        { c: th.surface, a: 0.95 },
        { c: th.accent, a: 0.42 },
        { c: C.mix(th.accent, th.surface, 0.55), a: 0.55 },
        { c: th.surface, a: 0.75 }
      ], L.rng);
    } else if (m === 'pattern') {
      ctx.fillStyle = th.bg;
      ctx.fillRect(0, 0, W, H);
      const kind = (o.bgMode === 'auto' || !o.bgMode) && c.pattern ? c.pattern : o.pattern || 'dots';
      E.pattern(ctx, 0, 0, W, H, kind, C.rgba(th.text, 0.09), u);
    } else if (m === 'image') {
      E.cover(ctx, L.img.photo, 0, 0, W, H, o.fx, o.fy, o.zoom);
      ctx.fillStyle = C.rgba(th.bg, o.overlay ?? 0.6);
      ctx.fillRect(0, 0, W, H);
    } else {
      ctx.fillStyle = th.bg;
      ctx.fillRect(0, 0, W, H);
    }
    return m;
  }

  // ======================= 1. EDITORIAL =======================
  add('editorial', { name: 'Editorial', note: 'Titlu mare, mult aer, ofertă discretă', slot: true }, (L) => {
    const { ctx, W, H, u, th, box } = L;
    paintBg(L, 'solid', { slot: true });
    const photo = L.img.photo, offer = has(L.d.offer);
    const tb = { ...box };
    if (L.horiz) {
      const pw = Math.round(W * (L.orient === 'wide' ? 0.36 : 0.42));
      const px = W - pw;
      if (photo) E.cover(ctx, photo, px, 0, pw, H, L.o.fx, L.o.fy, L.o.zoom);
      else {
        ctx.fillStyle = th.surface;
        ctx.fillRect(px, 0, pw, H);
        E.pattern(ctx, px, 0, pw, H, 'rings', C.rgba(th.onSurface, 0.08), u);
      }
      let gap = u * 6;
      if (offer) {
        const D = Math.min(H * (photo ? 0.36 : 0.5), pw * 0.68);
        const b = offerBadge(L, D, { rot: -0.12, ring: true });
        if (photo) {
          b.draw(px - D / 2, (H - D) / 2);
          gap = D / 2 + u * 4;
        } else b.draw(px + (pw - D) / 2, (H - D) / 2);
      }
      tb.w = px - gap - tb.x;
    }
    const tr = topRow(L, tb, { right: 'contact', rule: true });
    const area = { x: tb.x, y: tr.bottom + u * 5, w: tb.w };
    area.h = tb.y + tb.h - area.y;
    if (!L.horiz) {
      if (photo) {
        const ph = area.h * (L.orient === 'tall' ? 0.5 : L.orient === 'square' ? 0.4 : 0.46);
        E.cover(ctx, photo, area.x, area.y, area.w, ph, L.o.fx, L.o.fy, L.o.zoom);
        let skip = u * 5;
        if (offer) {
          const D = Math.min(area.w * 0.3, ph * 0.62);
          offerBadge(L, D, { rot: -0.12, ring: true }).draw(area.x + area.w - D - u * 3, area.y + ph - D * 0.5);
          skip = D * 0.5 + u * 3;
        }
        area.y += ph + skip;
        area.h -= ph + skip;
      } else if (offer) {
        const D = Math.min(area.w * 0.36, area.h * 0.34);
        offerBadge(L, D, { rot: -0.12, ring: true }).draw(area.x + area.w - D, area.y);
        area.y += D + u * 3;
        area.h -= D + u * 3;
      }
    }
    compose(area, [
      { b: eyebrow(L, area.w, 'left') },
      { flex: (h) => headline(L, area.w, h, 'left'), g: u * 2.6 },
      { b: subtitle(L, area.w * 0.92, 'left'), g: u * 2.6 },
      { b: cta(L, 'link', { maxW: area.w }), g: u * 4.2 },
      { b: tr.right ? null : contact(L, area.w, 'left'), g: u * 4 }
    ], 'left', 'bottom').draw();
  });

  // ======================= 2. OFERTĂ MARE =======================
  add('promo', { name: 'Ofertă mare', note: 'Reducerea e eroul imaginii' }, (L) => {
    const { ctx, u, th, box } = L;
    paintBg(L, 'gradient');
    const offer = has(L.d.offer);
    if (!L.horiz) {
      const lg = logo(L, u * 5, box.w * 0.5, th.text);
      if (lg) lg.draw(box.x + (box.w - lg.w) / 2, box.y);
      const ct = contact(L, box.w, 'center');
      if (ct) ct.draw(box.x + (box.w - ct.w) / 2, box.y + box.h - ct.h);
      const area = { x: box.x, y: box.y + (lg ? lg.h + u * 5 : 0), w: box.w };
      area.h = box.y + box.h - (ct ? ct.h + u * 5 : 0) - area.y;
      const og = offer ? offerGiant(L, area.w, area.h * (L.orient === 'tall' ? 0.24 : 0.3), 'center') : null;
      compose(area, [
        { b: eyebrow(L, area.w, 'center') },
        { flex: (h) => headline(L, area.w * 0.92, offer ? Math.min(h, area.h * 0.3) : h, 'center', th.text, offer ? 0.62 : 1.1), g: u * 2.4 },
        { b: og, g: u * 4 },
        { b: offer ? detail(L, area.w, 'center') : null, g: u * 3 },
        { b: subtitle(L, area.w * 0.86, 'center'), g: u * 3.2 },
        { b: cta(L, 'pill', { maxW: area.w }), g: u * 4.4 }
      ], 'center', 'center').draw();
      return;
    }
    const tr = topRow(L, box, { right: 'contact' });
    const area = { x: box.x, y: tr.bottom + u * 5, w: box.w };
    area.h = box.y + box.h - area.y;
    const right = { ...area };
    if (offer) {
      const lw = area.w * 0.44, g = u * 7;
      compose({ ...area, w: lw }, [
        { b: offerGiant(L, lw, area.h * 0.6, 'left') },
        { b: detail(L, lw, 'left'), g: u * 3 }
      ], 'left', 'center').draw();
      ctx.fillStyle = th.line;
      ctx.fillRect(area.x + lw + g / 2, area.y, Math.max(1, u * 0.15), area.h);
      right.x = area.x + lw + g;
      right.w = area.w - lw - g;
    }
    compose(right, [
      { b: eyebrow(L, right.w, 'left') },
      { flex: (h) => headline(L, right.w, h, 'left', th.text, offer ? 0.8 : 1.1), g: u * 2.4 },
      { b: subtitle(L, right.w, 'left'), g: u * 2.6 },
      { b: cta(L, 'pill', { maxW: right.w }), g: u * 4 }
    ], 'left', 'center').draw();
  });

  // ======================= 3. SPLIT =======================
  add('split', { name: 'Split', note: 'Jumătate foto, jumătate mesaj', slot: true }, (L) => {
    const { ctx, W, H, u, th, box } = L;
    paintBg(L, 'solid', { slot: true });
    const photo = L.img.photo, offer = has(L.d.offer);
    const pr = L.horiz
      ? { x: 0, y: 0, w: Math.round(W * (L.orient === 'wide' ? 0.42 : 0.5)), h: H }
      : { x: 0, y: 0, w: W, h: Math.round(H * (L.orient === 'square' ? 0.46 : 0.5)) };
    let offerShown = false;
    if (photo) E.cover(ctx, photo, pr.x, pr.y, pr.w, pr.h, L.o.fx, L.o.fy, L.o.zoom);
    else {
      ctx.fillStyle = th.accent;
      ctx.fillRect(pr.x, pr.y, pr.w, pr.h);
      E.pattern(ctx, pr.x, pr.y, pr.w, pr.h, 'lines', C.rgba(th.onAccent, 0.09), u);
      const ib = L.horiz
        ? { x: Math.max(u * 7, box.x), y: box.y, h: box.h }
        : { x: box.x, y: Math.max(u * 8, box.y), w: box.w };
      if (L.horiz) ib.w = pr.w - u * 7 - ib.x;
      else ib.h = pr.h - u * 8 - ib.y;
      if (offer) {
        compose(ib, [
          { b: offerGiant(L, ib.w, ib.h * 0.66, 'center', th.onAccent) },
          { b: detail(L, ib.w * 0.85, 'center', th.onAccent), g: u * 3 }
        ], 'center', 'center').draw();
        offerShown = true;
      } else {
        const lg = logo(L, Math.min(ib.h * 0.22, u * 13), ib.w * 0.8, th.onAccent);
        if (lg) lg.draw(ib.x + (ib.w - lg.w) / 2, ib.y + (ib.h - lg.h) / 2);
      }
    }
    let D = 0;
    if (offer && !offerShown) {
      D = L.horiz ? Math.min(H * 0.34, pr.w * 0.46) : Math.min(W * 0.3, pr.h * 0.5);
      const b = offerBadge(L, D, { rot: 0.1, shape: 'scallop' });
      if (L.horiz) b.draw(pr.w - D / 2, box.y + box.h - D);
      else b.draw(box.x + box.w - D, pr.h - D / 2);
    }
    const tb = L.horiz
      ? { x: pr.w + Math.max(u * 7, D ? D / 2 + u * 4 : 0), y: box.y, h: box.h }
      : { x: box.x, y: pr.h + u * 7, w: box.w };
    if (L.horiz) tb.w = box.x + box.w - tb.x;
    else tb.h = box.y + box.h - tb.y;
    const tr = topRow(L, tb, { right: D && !L.horiz ? null : 'eyebrow', noLogo: !photo && !offer });
    const area = { x: tb.x, y: tr.bottom + (tr.h ? u * 4.5 : 0), w: tb.w };
    if (D && !L.horiz) area.y = Math.max(area.y, pr.h + D / 2 + u * 2.5);
    area.h = tb.y + tb.h - area.y;
    compose(area, [
      { b: tr.right ? null : eyebrow(L, area.w, 'left') },
      { flex: (h) => headline(L, area.w, h, 'left', th.text, 0.85), g: u * 2.4 },
      { b: subtitle(L, area.w, 'left'), g: u * 2.4 },
      { b: cta(L, 'pill', { maxW: area.w }), g: u * 4 },
      { b: contact(L, area.w, 'left'), g: u * 3.4 }
    ], 'left', 'center').draw();
  });

  // ======================= 4. POSTER FOTO =======================
  add('poster', { name: 'Poster foto', note: 'Fotografie pe tot cadrul, text pe voal', slot: true, margin: 8.5 }, (L) => {
    const { ctx, W, H, u, th, box } = L;
    const photo = L.img.photo;
    let light = th.text, base = th.bg;
    if (photo) {
      E.cover(ctx, photo, 0, 0, W, H, L.o.fx, L.o.fy, L.o.zoom);
      base = C.mix(C.lum(th.text) < C.lum(th.bg) ? th.text : th.bg, '#000000', 0.55);
      const k = (L.o.overlay ?? 0.6) / 0.6;
      let g = ctx.createLinearGradient(0, H * (L.horiz ? 0.05 : 0.3), 0, H);
      g.addColorStop(0, C.rgba(base, 0));
      g.addColorStop(0.5, C.rgba(base, Math.min(0.9, 0.5 * k)));
      g.addColorStop(1, C.rgba(base, Math.min(0.96, 0.86 * k)));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      g = ctx.createLinearGradient(0, 0, 0, H * 0.25);
      g.addColorStop(0, C.rgba(base, Math.min(0.7, 0.4 * k)));
      g.addColorStop(1, C.rgba(base, 0));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H * 0.25);
      light = C.firstOk(base, [C.isLight(th.bg) ? th.bg : th.text, '#FFFFFF'], 4.5);
    } else paintBg(L, 'mesh', { slot: true });
    const fi = u * 3.2;
    ctx.strokeStyle = C.rgba(light, photo ? 0.7 : 0.35);
    ctx.lineWidth = Math.max(1, u * 0.22);
    ctx.strokeRect(fi, fi, W - fi * 2, H - fi * 2);

    const offer = has(L.d.offer);
    const tr = topRow(L, box, { right: offer ? null : 'eyebrow', color: light, rightColor: light });
    let top = tr.bottom;
    if (offer) {
      const D = L.horiz ? Math.min(box.h * 0.42, box.w * 0.24) : Math.min(box.w * 0.3, box.h * 0.22);
      offerBadge(L, D, { rot: 0.1, ring: true }).draw(box.x + box.w - D, box.y);
      top = Math.max(top, box.y + D);
    }
    const area = { x: box.x, y: top + u * 5, w: L.horiz ? box.w * 0.62 : box.w };
    area.h = box.y + box.h - area.y;
    const hc = hlOn(L, base, light);
    const ebColor = C.contrast(th.accent, base) >= 4.5 ? th.accent : light;
    compose(area, [
      { b: tr.right ? null : eyebrow(L, area.w, 'left', ebColor) },
      { flex: (h) => headline(L, area.w, h, 'left', light, 1, hc), g: u * 2.4 },
      { b: subtitle(L, area.w * 0.9, 'left', C.mix(light, base, 0.15)), g: u * 2.4 },
      { b: cta(L, 'pill', { maxW: area.w }), g: u * 4 },
      { b: contact(L, area.w, 'left', C.mix(light, base, 0.2)), g: u * 3.4 }
    ], 'left', 'bottom').draw();
  });

  // ======================= 5. NEO-BRUTAL =======================
  add('brutal', { name: 'Neo-brutal', note: 'Contururi groase, umbre tari, energie' }, (L) => {
    const { ctx, u, th, box } = L;
    paintBg(L, 'pattern', { pattern: 'grid' });
    const lightBg = C.isLight(th.bg);
    const line = lightBg ? (C.lum(th.text) < 0.2 ? th.text : '#111111') : th.text;
    const card = lightBg ? C.mix(th.bg, '#FFFFFF', 0.82) : th.surface;
    const cardInk = C.firstOk(card, [th.text, line, '#111111', '#FFFFFF'], 4.5);
    const bw = Math.max(2, u * 0.5), off = u * 1.3, pad = u * 5;
    const offer = has(L.d.offer);
    const tr = topRow(L, box, { right: 'contact', rightColor: th.text });
    const R = { x: box.x, y: tr.bottom + u * 5, w: box.w };
    R.h = box.y + box.h - R.y;
    const cardW = L.horiz ? box.w * (offer ? 0.6 : 1) : box.w;
    const D = offer ? (L.horiz ? Math.min((box.w - cardW) * 0.82, R.h * 0.8) : Math.min(box.w * 0.34, R.h * 0.26)) : 0;
    const head = !L.horiz && D ? D * 0.6 : 0;
    const extra = !L.horiz && D ? D * 0.26 : 0;
    const ctaB = cta(L, 'brutal', { maxW: cardW, inkLine: line, ink: C.firstOk(th.accent, [th.onAccent, line], 4.5) });
    const ctaSpace = ctaB ? ctaB.h + u * 5 : 0;
    const innerW = cardW - pad * 2;
    const hc = hlOn(L, card, cardInk);
    const ebColor = C.contrast(th.accent, card) >= 4.5 ? th.accent : cardInk;
    const content = compose({ x: 0, y: 0, w: innerW, h: R.h - head - ctaSpace - pad * 2 - extra - off }, [
      { b: eyebrow(L, innerW * (D && !L.horiz ? 0.62 : 1), 'left', ebColor) },
      { flex: (h) => headline(L, innerW, h, 'left', cardInk, 1, hc), g: u * 2.4 },
      { b: subtitle(L, innerW, 'left', C.mix(cardInk, card, 0.22)), g: u * 2.6 }
    ], 'left', 'top');
    const cardH = content.h + pad * 2 + extra;
    const groupH = head + cardH + off + ctaSpace;
    const top = R.y + Math.max(0, (R.h - groupH) / 2);
    const cy = top + head;
    ctx.fillStyle = line;
    E.rr(ctx, R.x + off, cy + off, cardW, cardH, u * 1.6);
    ctx.fill();
    E.rr(ctx, R.x, cy, cardW, cardH, u * 1.6);
    ctx.fillStyle = card;
    ctx.fill();
    ctx.lineWidth = bw;
    ctx.strokeStyle = line;
    ctx.stroke();
    content.draw(R.x + pad, cy + pad + extra);
    if (ctaB) ctaB.draw(R.x, cy + cardH + off + u * 5);
    if (offer) {
      const b = offerBadge(L, D, { shape: 'burst', rot: 0.18, stroke: bw, line, shadow: off });
      if (L.horiz) b.draw(R.x + cardW + (box.w - cardW - D) / 2, R.y + (R.h - D) / 2);
      else b.draw(R.x + cardW - D * 0.9, cy - D * 0.62);
    }
  });

  // ======================= 6. BENTO =======================
  add('bento', { name: 'Bento', note: 'Plăci modulare, ca un mini-site', slot: true, margin: 4.6 }, (L) => {
    const { ctx, u, th, box } = L;
    paintBg(L, 'solid', { slot: true });
    const gap = u * 1.8, rad = u * 3.4, pad = u * 4.6;
    const photo = L.img.photo, offer = has(L.d.offer), hasCta = has(L.d.cta);
    const tr = topRow(L, { ...box, x: box.x + u * 1.2, w: box.w - u * 2.4 }, { right: 'contact' });
    const R = { x: box.x, y: tr.bottom + (tr.h ? u * 3 : 0), w: box.w };
    R.h = box.y + box.h - R.y;
    let Ar, P, O, Cc;
    if (!L.horiz) {
      const ctaH = hasCta ? u * 11 : 0;
      const rowH = photo || offer ? R.h * (L.orient === 'tall' ? 0.3 : L.orient === 'square' ? 0.36 : 0.34) : 0;
      Ar = { x: R.x, y: R.y, w: R.w, h: R.h - rowH - ctaH - (rowH ? gap : 0) - (ctaH ? gap : 0) };
      let y = Ar.y + Ar.h + gap;
      if (rowH) {
        if (photo && offer) {
          const pw = (R.w - gap) * 0.58;
          P = { x: R.x, y, w: pw, h: rowH };
          O = { x: R.x + pw + gap, y, w: R.w - pw - gap, h: rowH };
        } else if (photo) P = { x: R.x, y, w: R.w, h: rowH };
        else O = { x: R.x, y, w: R.w, h: rowH };
        y += rowH + gap;
      }
      if (ctaH) Cc = { x: R.x, y, w: R.w, h: ctaH };
    } else {
      const side = photo || offer;
      const lw = side ? (R.w - gap) * 0.56 : R.w;
      const ctaH = hasCta ? Math.min(u * 13, R.h * 0.26) : 0;
      Ar = { x: R.x, y: R.y, w: lw, h: R.h - (ctaH ? ctaH + gap : 0) };
      if (ctaH) Cc = { x: R.x, y: R.y + Ar.h + gap, w: lw, h: ctaH };
      const rx = R.x + lw + gap, rw = R.w - lw - gap;
      if (photo && offer) {
        const oh = (R.h - gap) * 0.45;
        P = { x: rx, y: R.y, w: rw, h: R.h - oh - gap };
        O = { x: rx, y: R.y + R.h - oh, w: rw, h: oh };
      } else if (photo) P = { x: rx, y: R.y, w: rw, h: R.h };
      else if (offer) O = { x: rx, y: R.y, w: rw, h: R.h };
    }
    const tile = (r, fill) => {
      E.rr(ctx, r.x, r.y, r.w, r.h, rad);
      ctx.fillStyle = fill;
      ctx.fill();
    };
    const ins = (r) => ({ x: r.x + pad, y: r.y + pad, w: r.w - pad * 2, h: r.h - pad * 2 });
    tile(Ar, th.surface);
    const ai = ins(Ar);
    const ink = th.onSurface;
    compose(ai, [
      { b: eyebrow(L, ai.w, 'left', C.contrast(th.accent, th.surface) >= 4.5 ? th.accent : ink) },
      { flex: (h) => headline(L, ai.w, h, 'left', ink, 1, hlOn(L, th.surface, ink)), g: u * 2.2 },
      { b: subtitle(L, ai.w, 'left', C.mix(ink, th.surface, 0.22)), g: u * 2.4 }
    ], 'left', 'bottom').draw();
    if (P) E.cover(ctx, photo, P.x, P.y, P.w, P.h, L.o.fx, L.o.fy, L.o.zoom, rad);
    if (O) {
      tile(O, th.accent);
      const oi = ins(O);
      compose(oi, [
        { b: offerGiant(L, oi.w, oi.h * (has(L.d.detail) ? 0.5 : 0.7), 'left', th.onAccent) },
        { b: detail(L, oi.w, 'left', th.onAccent), g: u * 2.4 }
      ], 'left', 'bottom').draw();
    }
    if (Cc) {
      const fill = th.text, onFill = th.bg;
      tile(Cc, fill);
      const r = Cc.h * 0.3;
      const size = Math.min(u * 3.3, Cc.h * 0.3);
      const lb = txt(L, L.d.cta, { role: 'body', weight: 700, size, min: size * 0.55, maxLines: 1, maxW: Cc.w - pad * 2 - r * 2.5, color: onFill, hl: false });
      if (lb) lb.draw(Cc.x + pad, Cc.y + (Cc.h - lb.h) / 2);
      const cx = Cc.x + Cc.w - pad * 0.7 - r, cy = Cc.y + Cc.h / 2;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = th.accent;
      ctx.fill();
      E.arrow(ctx, cx - r * 0.42, cy, r * 0.84, r * 0.28, th.onAccent, Math.max(1.5, r * 0.11));
    }
  });

  // ======================= 7. STICKER =======================
  add('burst', { name: 'Sticker', note: 'Jucăuș, centrat, cu ștampilă de preț' }, (L) => {
    const { u, th, box } = L;
    paintBg(L, 'pattern', { pattern: 'dots' });
    const offer = has(L.d.offer);
    const ebPill = has(L.d.eyebrow) ? (maxW) => pill(L, L.d.eyebrow, { stroke: th.text, ink: th.text, maxW }) : () => null;
    if (!L.horiz) {
      const lg = logo(L, u * 5, box.w * 0.5, th.text);
      if (lg) lg.draw(box.x + (box.w - lg.w) / 2, box.y);
      const ct = contact(L, box.w, 'center');
      if (ct) ct.draw(box.x + (box.w - ct.w) / 2, box.y + box.h - ct.h);
      const area = { x: box.x, y: box.y + (lg ? lg.h + u * 4 : 0), w: box.w };
      area.h = box.y + box.h - (ct ? ct.h + u * 4 : 0) - area.y;
      const D = offer ? Math.min(box.w * 0.4, area.h * 0.3) : 0;
      const lay = compose(area, [
        { b: D ? spacer(D * 0.9) : null },
        { b: ebPill(area.w), g: u * 2 },
        { flex: (h) => headline(L, area.w, h, 'center', th.text, 1.1), g: u * 3 },
        { b: subtitle(L, area.w * 0.86, 'center'), g: u * 3 },
        { b: cta(L, 'pill', { maxW: area.w }), g: u * 4.4 }
      ], 'center', 'center');
      lay.draw();
      if (D) offerBadge(L, D, { shape: 'burst', rot: -0.22 }).draw(box.x + box.w - D * 1.02, lay.top - D * 0.06);
      return;
    }
    const tr = topRow(L, box, { right: 'contact' });
    const area = { x: box.x, y: tr.bottom + u * 4, w: box.w * (offer ? 0.6 : 1) };
    area.h = box.y + box.h - area.y;
    compose(area, [
      { b: ebPill(area.w) },
      { flex: (h) => headline(L, area.w, h, 'left', th.text, 1), g: u * 2.6 },
      { b: subtitle(L, area.w, 'left'), g: u * 2.6 },
      { b: cta(L, 'pill', { maxW: area.w }), g: u * 4 }
    ], 'left', 'center').draw();
    if (offer) {
      const rw = box.w - area.w;
      const D = Math.min(rw * 0.88, area.h * 0.9);
      offerBadge(L, D, { shape: 'burst', rot: -0.2 }).draw(box.x + area.w + (rw - D) / 2 + u * 2, area.y + (area.h - D) / 2);
    }
  });

  // ======================= 8. SWISS =======================
  add('swiss', { name: 'Swiss', note: 'Grilă vizibilă, asimetrie, cifre mari' }, (L) => {
    const { ctx, W, H, u, th, box } = L;
    paintBg(L, 'solid');
    const cols = L.horiz ? 8 : 6;
    ctx.fillStyle = C.rgba(th.text, 0.09);
    for (let i = 0; i <= cols; i++) ctx.fillRect(Math.round(box.x + (i * box.w) / cols), 0, Math.max(1, u * 0.12), H);
    ctx.fillStyle = th.accent;
    ctx.fillRect(0, 0, W, u * 1.6);
    const offer = has(L.d.offer);
    const tr = topRow(L, box, { right: 'eyebrow', rightColor: th.text });
    const cb = cta(L, 'link', { maxW: box.w * 0.55 });
    const ct = contact(L, box.w * 0.4, 'right');
    const bh = Math.max(cb ? cb.h : 0, ct ? ct.h : 0);
    const by = box.y + box.h - bh;
    if (cb) cb.draw(box.x, by + (bh - cb.h) / 2);
    if (ct) ct.draw(box.x + box.w - ct.w, by + (bh - ct.h) / 2);
    if (bh) {
      ctx.fillStyle = th.text;
      ctx.fillRect(box.x, by - u * 3.2, box.w, Math.max(1, u * 0.18));
    }
    const limit = bh ? by - u * 7 : box.y + box.h;
    const top = tr.bottom + u * 7;
    const colW = box.w / cols;
    if (!L.horiz) {
      const og = offer ? offerGiant(L, box.w, (limit - top) * 0.3, 'left', th.accentLarge) : null;
      let oy = limit;
      if (og) {
        oy = limit - og.h;
        og.draw(box.x, oy);
      }
      const dt = offer ? detail(L, colW * 3, 'left') : null;
      if (dt) {
        oy -= u * 3 + dt.h;
        dt.draw(box.x + colW * 3, oy);
      }
      const area = { x: box.x, y: top, w: box.w, h: oy - u * 6 - top };
      compose(area, [
        { b: tr.right ? null : eyebrow(L, area.w, 'left') },
        { flex: (h) => headline(L, colW * 5.6, h, 'left', th.text, 1.05), g: u * 2.4 },
        { b: subtitle(L, colW * 3, 'left'), g: u * 3.4, dx: colW * 3 }
      ], 'left', 'top').draw();
      return;
    }
    const lw = colW * (offer ? 4.6 : 7);
    compose({ x: box.x, y: top, w: lw, h: limit - top }, [
      { b: tr.right ? null : eyebrow(L, lw, 'left') },
      { flex: (h) => headline(L, lw, h, 'left', th.text, 1), g: u * 2.4 },
      { b: subtitle(L, lw * 0.9, 'left'), g: u * 3 }
    ], 'left', 'top').draw();
    if (offer) {
      const rx = box.x + colW * 5, rw = box.x + box.w - rx;
      compose({ x: rx, y: top, w: rw, h: limit - top }, [
        { b: detail(L, rw, 'right') },
        { b: offerGiant(L, rw, (limit - top) * 0.62, 'right', th.accentLarge), g: u * 3 }
      ], 'right', 'bottom').draw();
    }
  });

  // ======================= 9. GRADIENT =======================
  add('aura', { name: 'Gradient', note: 'Gradient moale cu granulație, minimal' }, (L) => {
    const { u, th, box } = L;
    paintBg(L, 'mesh');
    const lg = logo(L, u * 5, box.w * 0.5, th.text);
    if (lg) lg.draw(box.x + (box.w - lg.w) / 2, box.y);
    const ct = contact(L, box.w, 'center');
    if (ct) ct.draw(box.x + (box.w - ct.w) / 2, box.y + box.h - ct.h);
    const area = { x: box.x, y: box.y + (lg ? lg.h + u * 5 : 0), w: box.w };
    area.h = box.y + box.h - (ct ? ct.h + u * 5 : 0) - area.y;
    const lightBg = C.isLight(th.bg);
    const glass = {
      fill: lightBg ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.12)',
      stroke: lightBg ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.35)',
      ink: th.text, maxW: area.w
    };
    const w = L.horiz ? area.w * 0.8 : area.w;
    compose(area, [
      { b: pill(L, offerLabel(L), glass) },
      { b: eyebrow(L, w, 'center'), g: u * 4 },
      { flex: (h) => headline(L, w, h, 'center', th.text, L.horiz ? 1.25 : 1), g: u * 2.4 },
      { b: subtitle(L, w * 0.82, 'center'), g: u * 3 },
      { b: cta(L, 'pill', { maxW: area.w }), g: u * 4.4 }
    ], 'center', 'center').draw();
  });

  // Categorii pentru filtrul de stiluri.
  const TAGS = { editorial: ['elegant', 'text'], promo: ['offer'], split: ['photo'], poster: ['photo'], brutal: ['fun'],
    bento: ['photo', 'offer'], burst: ['fun', 'offer'], swiss: ['text', 'elegant'], aura: ['text', 'elegant'] };
  TPL.forEach((t) => { t.tags = TAGS[t.id] || []; });

  // Unelte comune, folosite și de stilurile din templates-more.js.
  A.T = { add, has, txt, hlOn, eyebrow, subtitle, contact, headline, detail, offerGiant, cta, pill, offerLabel, logo,
    offerBadge, topRow, compose, spacer, paintBg };

  // ---------- randare post ----------
  function drawSafe(ctx, fmt, W, H, u) {
    const s = fmt.safe;
    if (!s) return;
    const l = (s.l || 0) * W, r = (s.r || 0) * W, t = (s.t || 0) * H, b = (s.b || 0) * H;
    ctx.save();
    ctx.fillStyle = 'rgba(255,40,90,0.18)';
    if (t) ctx.fillRect(0, 0, W, t);
    if (b) ctx.fillRect(0, H - b, W, b);
    if (l) ctx.fillRect(0, t, l, H - t - b);
    if (r) ctx.fillRect(W - r, t, r, H - t - b);
    ctx.setLineDash([u * 1.2, u * 0.8]);
    ctx.strokeStyle = 'rgba(255,40,90,0.95)';
    ctx.lineWidth = Math.max(1, u * 0.25);
    ctx.strokeRect(l, t, W - l - r, H - t - b);
    ctx.restore();
  }

  A.orientation = (ratio) => (ratio > 2.1 ? 'wide' : ratio > 1.15 ? 'landscape' : ratio >= 0.9 ? 'square' : ratio >= 0.62 ? 'portrait' : 'tall');

  A.renderPost = function (ctx, fmt, tplId, st, assets, opts = {}) {
    const tpl = TPL.find((t) => t.id === tplId) || TPL[0];
    const W = fmt.w, H = fmt.h, u = Math.min(W, H) / 100, ratio = W / H;
    const th = C.theme(st.colors, st.variant, st.autoContrast);
    const fp = A.FONTS.find((f) => f.id === st.font) || A.FONTS[0];
    const sf = fmt.safe || {};
    const m = u * (tpl.margin || 7);
    const box = { x: Math.max(m, (sf.l || 0) * W), y: Math.max(m, (sf.t || 0) * H) };
    box.w = W - Math.max(m, (sf.r || 0) * W) - box.x;
    box.h = H - Math.max(m, (sf.b || 0) * H) - box.y;
    const photo = assets.photo ? E.photo(assets.photo, st.photoFilter, th, assets.photoId) : null;
    const L = {
      ctx, W, H, u, ratio, orient: A.orientation(ratio), horiz: ratio > 1.15, fmt, fp, th,
      d: st.text, o: st, img: { photo, logo: assets.logo }, logoId: assets.logoId,
      rng: E.rng(E.hash(tpl.id + fmt.id + (st.seed || 0))), box, tpl
    };
    ctx.save();
    ctx.textBaseline = 'alphabetic';
    tpl.draw(L);
    ctx.restore();
    E.grain(ctx, W, H, st.grain || 0);
    if (opts.safe) drawSafe(ctx, fmt, W, H, u);
    return L;
  };
})(window.A = window.A || {});
