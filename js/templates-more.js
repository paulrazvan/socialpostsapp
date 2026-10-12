/* Atelier – stiluri suplimentare. Folosesc aceleași unelte ca stilurile de bază (A.T). */
(function (A) {
  'use strict';
  const { E, C } = A;
  const { add, has, txt, hlOn, eyebrow, subtitle, contact, headline, detail, offerGiant, cta, pill, offerLabel, logo,
    offerBadge, topRow, compose, spacer, paintBg } = A.T;

  const cardOf = (th) => (C.isLight(th.bg) ? C.mix(th.bg, '#FFFFFF', 0.82) : th.surface);
  const inkOn = (bg, th) => C.firstOk(bg, [th.text, th.bg, '#111111', '#FFFFFF'], 4.5);
  const bigOn = (bg, th, ink) => (C.contrast(th.accent, bg) >= 3 ? th.accent : ink);
  const softShadow = (ctx, u) => {
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = u * 4;
    ctx.shadowOffsetY = u * 1.4;
  };
  // Logo centrat sus și contact centrat jos; întoarce zona rămasă.
  function centerFrame(L, gap) {
    const { u, th, box } = L;
    const lg = logo(L, u * 5, box.w * 0.5, th.text);
    if (lg) lg.draw(box.x + (box.w - lg.w) / 2, box.y);
    const ct = contact(L, box.w, 'center');
    if (ct) ct.draw(box.x + (box.w - ct.w) / 2, box.y + box.h - ct.h);
    const area = { x: box.x, y: box.y + (lg ? lg.h + u * (gap || 5) : 0), w: box.w };
    area.h = box.y + box.h - (ct ? ct.h + u * (gap || 5) : 0) - area.y;
    return area;
  }

  // ======================= MINIMAL =======================
  add('minimal', { name: 'Minimal', note: 'Doar esențialul, mult spațiu gol', tags: ['text', 'elegant'], margin: 9 }, (L) => {
    const { u, th, box } = L;
    paintBg(L, 'solid');
    const tr = topRow(L, box, { right: 'contact', logoH: u * 4.2 });
    const foot = has(L.d.offer)
      ? txt(L, offerLabel(L), { role: 'body', weight: 600, size: u * 2.3, min: u * 1.7, upper: true, track: 0.12, maxLines: 2, maxW: box.w, color: th.accentText })
      : null;
    if (foot) foot.draw(box.x, box.y + box.h - foot.h);
    const area = { x: box.x, y: tr.bottom + u * 6, w: box.w * (L.horiz ? 0.68 : 0.88) };
    area.h = box.y + box.h - (foot ? foot.h + u * 6 : 0) - area.y;
    compose(area, [
      { b: eyebrow(L, area.w, 'left', th.muted) },
      { flex: (h) => headline(L, area.w, h, 'left', th.text, 0.78), g: u * 2.4 },
      { b: subtitle(L, area.w * 0.9, 'left'), g: u * 2.6 },
      { b: cta(L, 'link', { maxW: area.w }), g: u * 4 }
    ], 'left', 'center').draw();
  });

  // ======================= CITAT =======================
  add('quote', { name: 'Citat', note: 'Titlul devine o replică memorabilă', tags: ['text'] }, (L) => {
    const { ctx, u, th, box } = L;
    paintBg(L, 'solid');
    const qs = u * (L.horiz ? 20 : 30);
    E.setFont(ctx, L.fp.it, qs, 0);
    const m = ctx.measureText('“');
    const qa = m.actualBoundingBoxAscent || qs * 0.7, qd = m.actualBoundingBoxDescent || -qs * 0.3;
    E.resetFont(ctx);
    const qh = qa + qd;
    ctx.save();
    E.setFont(ctx, L.fp.it, qs, 0);
    ctx.fillStyle = th.accentLarge;
    ctx.fillText('“', box.x - (m.actualBoundingBoxLeft || 0) * -1, box.y + qa);
    E.resetFont(ctx);
    ctx.restore();
    const D = has(L.d.offer) ? (L.horiz ? Math.min(box.h * 0.62, box.w * 0.24) : Math.min(box.w * 0.3, box.h * 0.24)) : 0;
    let area;
    if (L.horiz) {
      if (D) offerBadge(L, D, { rot: 0.12, ring: true }).draw(box.x + box.w - D, box.y + (box.h - D) / 2);
      area = { x: box.x, y: box.y + qh * 0.75 + u * 3, w: box.w - (D ? D + u * 8 : box.w * 0.2) };
    } else {
      if (D) offerBadge(L, D, { rot: 0.12, ring: true }).draw(box.x + box.w - D, box.y);
      area = { x: box.x, y: box.y + Math.max(qh, D) + u * 5, w: box.w };
    }
    area.h = box.y + box.h - area.y;
    const who = L.img.logo ? logo(L, u * 4, area.w * 0.4, th.text)
      : txt(L, L.d.brand, { role: 'body', weight: 700, size: u * 2.6, min: u * 1.8, maxLines: 1, maxW: area.w - u * 12, color: th.text });
    const attrib = who ? {
      w: u * 10 + who.w, h: who.h, desc: who.desc,
      draw(x, y) {
        ctx.fillStyle = th.accentLarge;
        ctx.fillRect(x, y + who.h / 2 - u * 0.2, u * 7, u * 0.4);
        who.draw(x + u * 10, y);
      }
    } : null;
    compose(area, [
      { flex: (h) => headline(L, area.w, h, 'left', th.text, 0.85), g: 0 },
      { b: subtitle(L, area.w * 0.9, 'left'), g: u * 2.6 },
      { b: attrib, g: u * 5 },
      { b: cta(L, 'link', { maxW: area.w }), g: u * 4.5 },
      { b: contact(L, area.w, 'left'), g: u * 3 }
    ], 'left', 'center').draw();
  });

  // ======================= VOUCHER =======================
  add('ticket', { name: 'Voucher', note: 'Bilet cu perforație, perfect pentru reduceri', tags: ['offer', 'fun'] }, (L) => {
    const { ctx, u, th, box } = L;
    paintBg(L, 'pattern', { pattern: 'lines' });
    const card = cardOf(th), ink = inkOn(card, th), hc = hlOn(L, card, ink);
    const tr = topRow(L, box, { right: 'contact' });
    const R = { x: box.x, y: tr.bottom + u * 5, w: box.w };
    R.h = box.y + box.h - R.y;
    const offer = has(L.d.offer), pad = u * 5.5, nr = u * 3.6, rad = u * 2.6;
    const big = bigOn(card, th, ink);
    const perforation = (x0, y0, x1, y1) => {
      ctx.save();
      ctx.setLineDash([u * 1.2, u * 1]);
      ctx.strokeStyle = C.rgba(ink, 0.35);
      ctx.lineWidth = Math.max(1, u * 0.25);
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
      ctx.restore();
    };
    const shape = (x, y, w, h, at, dir) => {
      ctx.save();
      softShadow(ctx, u);
      if (offer) E.ticket(ctx, x, y, w, h, rad, at, nr, dir);
      else E.rr(ctx, x, y, w, h, rad);
      ctx.fillStyle = card;
      ctx.fill();
      ctx.restore();
    };
    if (!L.horiz) {
      const ctaB = cta(L, 'pill', { maxW: R.w });
      const ctaSpace = ctaB ? ctaB.h + u * 5 : 0;
      const stubH = offer ? Math.min(R.h * 0.28, u * 30) : 0;
      const innerW = R.w - pad * 2;
      const content = compose({ x: 0, y: 0, w: innerW, h: R.h - ctaSpace - stubH - pad * 2 }, [
        { b: eyebrow(L, innerW, 'left', C.contrast(th.accent, card) >= 4.5 ? th.accent : ink) },
        { flex: (h) => headline(L, innerW, h, 'left', ink, 1, hc), g: u * 2.4 },
        { b: subtitle(L, innerW, 'left', C.mix(ink, card, 0.22)), g: u * 2.6 }
      ], 'left', 'top');
      const topH = content.h + pad * 2, tH = topH + stubH;
      const y0 = R.y + Math.max(0, (R.h - tH - ctaSpace) / 2);
      shape(R.x, y0, R.w, tH, y0 + topH, 'v');
      content.draw(R.x + pad, y0 + pad);
      if (offer) {
        perforation(R.x + nr + u * 1.5, y0 + topH, R.x + R.w - nr - u * 1.5, y0 + topH);
        const sr = { x: R.x + pad, y: y0 + topH + pad * 0.7, w: innerW, h: stubH - pad * 1.4 };
        const og = offerGiant(L, sr.w * (has(L.d.detail) ? 0.56 : 1), sr.h, 'left', big);
        if (og) og.draw(sr.x, sr.y + (sr.h - og.h) / 2);
        const dt = detail(L, sr.w * 0.4, 'right', ink);
        if (dt) dt.draw(sr.x + sr.w - dt.w, sr.y + (sr.h - dt.h) / 2);
      }
      if (ctaB) ctaB.draw(R.x, y0 + tH + u * 5);
      return;
    }
    const stubW = offer ? R.w * 0.32 : 0;
    const at = R.x + R.w - stubW;
    shape(R.x, R.y, R.w, R.h, at, 'h');
    const left = { x: R.x + pad, y: R.y + pad, w: R.w - stubW - pad * 2, h: R.h - pad * 2 };
    compose(left, [
      { b: eyebrow(L, left.w, 'left', C.contrast(th.accent, card) >= 4.5 ? th.accent : ink) },
      { flex: (h) => headline(L, left.w, h, 'left', ink, 1, hc), g: u * 2.4 },
      { b: subtitle(L, left.w, 'left', C.mix(ink, card, 0.22)), g: u * 2.4 },
      { b: cta(L, 'pill', { maxW: left.w }), g: u * 4 }
    ], 'left', 'center').draw();
    if (offer) {
      perforation(at, R.y + nr + u * 1.5, at, R.y + R.h - nr - u * 1.5);
      const sr = { x: at + u * 4, y: R.y + pad, w: stubW - u * 8, h: R.h - pad * 2 };
      compose(sr, [
        { b: offerGiant(L, sr.w, sr.h * 0.55, 'center', big) },
        { b: detail(L, sr.w, 'center', ink), g: u * 3 }
      ], 'center', 'center').draw();
    }
  });

  // ======================= ETICHETĂ DE PREȚ =======================
  add('pricetag', { name: 'Etichetă', note: 'Etichetă de preț agățată, oferta în prim-plan', tags: ['offer', 'fun'] }, (L) => {
    const { ctx, u, th, box } = L;
    paintBg(L, 'gradient');
    const tr = topRow(L, box, { right: 'contact' });
    const R = { x: box.x, y: tr.bottom + u * 4, w: box.w };
    R.h = box.y + box.h - R.y;
    const drawTag = (cx, cy, tw, tg, rot) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      const x = -tw / 2, y = -tg / 2;
      const hx = x + tg * 0.3;
      ctx.strokeStyle = th.text;
      ctx.lineWidth = Math.max(1.5, u * 0.3);
      ctx.beginPath();
      ctx.moveTo(hx, 0);
      ctx.bezierCurveTo(hx - u * 7, -u * 6, hx - u * 4, -tg * 0.9, hx + u * 4, -tg * 1.05);
      ctx.stroke();
      ctx.save();
      softShadow(ctx, u);
      E.tag(ctx, x, y, tw, tg, u * 2.2);
      ctx.fillStyle = th.accent;
      ctx.fill();
      ctx.restore();
      ctx.beginPath();
      ctx.arc(hx, 0, tg * 0.07, 0, Math.PI * 2);
      ctx.fillStyle = th.bg;
      ctx.fill();
      ctx.lineWidth = Math.max(1, u * 0.25);
      ctx.strokeStyle = C.rgba(th.onAccent, 0.5);
      ctx.stroke();
      ctx.save();
      ctx.setLineDash([u * 1, u * 0.8]);
      E.tag(ctx, x + u * 1.8, y + u * 1.8, tw - u * 3.6, tg - u * 3.6, u * 1.2);
      ctx.strokeStyle = C.rgba(th.onAccent, 0.45);
      ctx.lineWidth = Math.max(1, u * 0.2);
      ctx.stroke();
      ctx.restore();
      const inner = { x: x + tg * 0.52, y: y + u * 3, w: tw - tg * 0.52 - u * 4, h: tg - u * 6 };
      if (has(L.d.offer)) {
        compose(inner, [
          { b: offerGiant(L, inner.w, inner.h * (has(L.d.detail) ? 0.6 : 0.82), 'center', th.onAccent) },
          { b: detail(L, inner.w, 'center', th.onAccent), g: u * 2 }
        ], 'center', 'center').draw();
      } else {
        const lg = logo(L, inner.h * 0.4, inner.w, th.onAccent);
        if (lg) lg.draw(inner.x + (inner.w - lg.w) / 2, inner.y + (inner.h - lg.h) / 2);
      }
      ctx.restore();
    };
    if (!L.horiz) {
      let tw = R.w * 0.8, tg = tw * 0.42;
      if (tg > R.h * 0.3) { tg = R.h * 0.3; tw = tg / 0.42; }
      const cy = R.y + tg * 0.85;
      drawTag(R.x + R.w / 2 + u * 2, cy, tw, tg, -0.09);
      const area = { x: R.x, y: cy + tg * 0.75 + u * 5, w: R.w };
      area.h = R.y + R.h - area.y;
      compose(area, [
        { b: eyebrow(L, area.w, 'center') },
        { flex: (h) => headline(L, area.w, h, 'center', th.text, 0.9), g: u * 2.4 },
        { b: subtitle(L, area.w * 0.88, 'center'), g: u * 2.6 },
        { b: cta(L, 'pill', { maxW: area.w }), g: u * 4 }
      ], 'center', 'center').draw();
      return;
    }
    const lw = R.w * 0.52;
    compose({ ...R, w: lw }, [
      { b: eyebrow(L, lw, 'left') },
      { flex: (h) => headline(L, lw, h, 'left', th.text, 0.9), g: u * 2.4 },
      { b: subtitle(L, lw, 'left'), g: u * 2.6 },
      { b: cta(L, 'pill', { maxW: lw }), g: u * 4 }
    ], 'left', 'center').draw();
    const rw = R.w - lw - u * 6;
    let tw = rw * 0.92, tg = tw * 0.44;
    if (tg > R.h * 0.62) { tg = R.h * 0.62; tw = tg / 0.44; }
    drawTag(R.x + lw + u * 6 + rw / 2, R.y + R.h / 2 + tg * 0.2, tw, tg, -0.1);
  });

  // ======================= POLAROID =======================
  add('polaroid', { name: 'Polaroid', note: 'Fotografie instant, bandă adezivă, notiță scrisă', tags: ['photo', 'fun'], slot: true }, (L) => {
    const { ctx, u, th, box } = L;
    paintBg(L, 'pattern', { slot: true, pattern: 'grid' });
    const photo = L.img.photo;
    const tr = topRow(L, box, { right: 'contact' });
    const R = { x: box.x, y: tr.bottom + u * 5, w: box.w };
    R.h = box.y + box.h - R.y;
    let frame;
    if (!L.horiz) {
      const pw = Math.min(R.w * 0.84, (R.h * 0.6) / 1.2);
      frame = { x: R.x + (R.w - pw) / 2, y: R.y + u * 2, w: pw, h: pw * 1.2 };
    } else {
      const fh = R.h * 0.96;
      frame = { x: R.x + u * 2, y: R.y + (R.h - fh) / 2, w: fh / 1.2, h: fh };
    }
    const rot = (L.rng() > 0.5 ? 1 : -1) * (0.03 + L.rng() * 0.02);
    const pad = frame.w * 0.055, ph = frame.w - pad * 2;
    ctx.save();
    ctx.translate(frame.x + frame.w / 2, frame.y + frame.h / 2);
    ctx.rotate(rot);
    const fx = -frame.w / 2, fy = -frame.h / 2;
    ctx.save();
    softShadow(ctx, u);
    ctx.fillStyle = '#FBFAF6';
    ctx.fillRect(fx, fy, frame.w, frame.h);
    ctx.restore();
    if (photo) E.cover(ctx, photo, fx + pad, fy + pad, ph, ph, L.o.fx, L.o.fy, L.o.zoom);
    else {
      ctx.fillStyle = th.surface;
      ctx.fillRect(fx + pad, fy + pad, ph, ph);
      E.pattern(ctx, fx + pad, fy + pad, ph, ph, 'dots', C.rgba(th.onSurface, 0.12), u);
      const lg = logo(L, ph * 0.12, ph * 0.7, th.onSurface);
      if (lg) lg.draw(fx + pad + (ph - lg.w) / 2, fy + pad + (ph - lg.h) / 2);
    }
    const capH = frame.h - pad - ph;
    const cap = txt(L, has(L.d.eyebrow) ? L.d.eyebrow : L.d.brand, { role: 'body', faceObj: L.fp.it, size: capH * 0.42, min: u * 2,
      maxLines: 1, maxW: ph * 0.94, align: 'center', color: '#2A2724', hl: false, track: 0 });
    if (cap) cap.draw(fx + (frame.w - cap.w) / 2, fy + pad + ph + (capH - cap.h) / 2 - capH * 0.04);
    ctx.save();
    ctx.translate(0, fy + u * 0.4);
    ctx.rotate(-0.06 + L.rng() * 0.12);
    ctx.fillStyle = 'rgba(250,244,222,0.78)';
    ctx.fillRect(-frame.w * 0.15, -u * 2.4, frame.w * 0.3, u * 4.8);
    ctx.restore();
    ctx.restore();
    if (has(L.d.offer)) {
      const D = frame.w * 0.34;
      offerBadge(L, D, { rot: 0.16, shape: 'burst' }).draw(frame.x + frame.w - D * 0.62, frame.y + pad + ph - D * 0.55);
    }
    const area = L.horiz
      ? { x: frame.x + frame.w + u * 8, y: R.y, h: R.h }
      : { x: R.x, y: frame.y + frame.h + u * 6, w: R.w };
    if (L.horiz) area.w = R.x + R.w - area.x;
    else area.h = R.y + R.h - area.y;
    const al = L.horiz ? 'left' : 'center';
    compose(area, [
      { b: L.horiz ? eyebrow(L, area.w, al) : null },
      { flex: (h) => headline(L, area.w, h, al, th.text, 0.85), g: u * 2.4 },
      { b: subtitle(L, area.w * 0.92, al), g: u * 2.4 },
      { b: cta(L, 'pill', { maxW: area.w }), g: u * 4 }
    ], al, 'center').draw();
  });

  // ======================= ARCADĂ =======================
  add('arch', { name: 'Arcadă', note: 'Fotografie în arcadă, aer de boutique', tags: ['photo', 'elegant'], slot: true }, (L) => {
    const { ctx, u, th, box } = L;
    paintBg(L, 'solid', { slot: true });
    const photo = L.img.photo, offer = has(L.d.offer);
    const drawArch = (x, y, w, h) => {
      const g = u * 1.8;
      E.arch(ctx, x - g, y - g, w + g * 2, h + g);
      ctx.strokeStyle = C.rgba(th.text, 0.4);
      ctx.lineWidth = Math.max(1, u * 0.2);
      ctx.stroke();
      ctx.save();
      E.arch(ctx, x, y, w, h);
      ctx.clip();
      let shown = false;
      if (photo) E.cover(ctx, photo, x, y, w, h, L.o.fx, L.o.fy, L.o.zoom);
      else {
        ctx.fillStyle = th.surface;
        ctx.fillRect(x, y, w, h);
        E.pattern(ctx, x, y, w, h, 'rings', C.rgba(th.onSurface, 0.08), u);
        if (offer) {
          const ib = { x: x + w * 0.12, y: y + w * 0.35, w: w * 0.76, h: h - w * 0.45 };
          compose(ib, [
            { b: offerGiant(L, ib.w, ib.h * 0.45, 'center', bigOn(th.surface, th, th.onSurface)) },
            { b: detail(L, ib.w, 'center', th.onSurface), g: u * 3 }
          ], 'center', 'center').draw();
          shown = true;
        }
      }
      ctx.restore();
      if (offer && !shown) {
        const D = w * 0.36;
        offerBadge(L, D, { rot: -0.12, ring: true }).draw(x + w - D * 0.6, y + h - D * 0.75);
      }
    };
    if (!L.horiz) {
      const area = { ...centerFrameArea(L) };
      let aw = Math.min(box.w * 0.74, (area.h * 0.56) / 1.25), ah = aw * 1.25;
      drawArch(area.x + (area.w - aw) / 2, area.y + u * 2, aw, ah);
      const ta = { x: area.x, y: area.y + u * 2 + ah + u * 6, w: area.w };
      ta.h = area.y + area.h - ta.y;
      compose(ta, [
        { b: eyebrow(L, ta.w, 'center') },
        { flex: (h) => headline(L, ta.w, h, 'center', th.text, 0.85), g: u * 2.4 },
        { b: subtitle(L, ta.w * 0.86, 'center'), g: u * 2.4 },
        { b: cta(L, 'pill', { maxW: ta.w }), g: u * 4 }
      ], 'center', 'center').draw();
      return;
    }
    const ah = box.h, aw = Math.min(ah * 0.8, box.w * 0.4);
    drawArch(box.x + box.w - aw, box.y + u * 2, aw, ah - u * 2);
    const tb = { x: box.x, y: box.y, w: box.w - aw - u * 9, h: box.h };
    const tr = topRow(L, tb, { right: null });
    const ta = { x: tb.x, y: tr.bottom + u * 4, w: tb.w };
    ta.h = tb.y + tb.h - ta.y;
    compose(ta, [
      { b: eyebrow(L, ta.w, 'left') },
      { flex: (h) => headline(L, ta.w, h, 'left', th.text, 0.95), g: u * 2.4 },
      { b: subtitle(L, ta.w, 'left'), g: u * 2.4 },
      { b: cta(L, 'pill', { maxW: ta.w }), g: u * 4 },
      { b: contact(L, ta.w, 'left'), g: u * 3.4 }
    ], 'left', 'center').draw();
  });
  function centerFrameArea(L) {
    return centerFrame(L, 4);
  }

  // ======================= CERC =======================
  add('circle', { name: 'Cerc', note: 'Fotografie decupată rotund, ieșind din cadru', tags: ['photo'], slot: true }, (L) => {
    const { ctx, u, th, box, W, H } = L;
    paintBg(L, 'solid', { slot: true });
    const photo = L.img.photo;
    let d, cx, cy;
    if (!L.horiz) {
      d = W * (L.orient === 'tall' ? 0.86 : L.orient === 'square' ? 0.7 : 0.82);
      cx = W - d * 0.36;
      cy = box.y + d * (L.orient === 'tall' ? 0.36 : 0.26);
    } else {
      d = H * 1.08;
      cx = W - d * 0.38;
      cy = H / 2;
    }
    ctx.beginPath();
    ctx.arc(cx, cy, d / 2 + u * 2.4, 0, Math.PI * 2);
    ctx.strokeStyle = th.accent;
    ctx.lineWidth = u * 0.6;
    ctx.stroke();
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, d / 2, 0, Math.PI * 2);
    ctx.clip();
    if (photo) E.cover(ctx, photo, cx - d / 2, cy - d / 2, d, d, L.o.fx, L.o.fy, L.o.zoom);
    else {
      ctx.fillStyle = th.accent;
      ctx.fillRect(cx - d / 2, cy - d / 2, d, d);
      E.pattern(ctx, cx - d / 2, cy - d / 2, d, d, 'lines', C.rgba(th.onAccent, 0.1), u);
    }
    ctx.restore();
    let bb = 0;
    if (has(L.d.offer)) {
      const D = L.horiz ? H * 0.34 : W * 0.27;
      const a = L.horiz ? Math.PI * 0.85 : Math.PI * 0.72;
      const px = cx + Math.cos(a) * d / 2, py = cy + Math.sin(a) * d / 2;
      offerBadge(L, D, { rot: -0.1, shape: 'scallop', fill: photo ? th.accent : th.text, ink: photo ? th.onAccent : th.bg }).draw(px - D / 2, py - D / 2);
      bb = py + D / 2;
    }
    if (!L.horiz) {
      const tr = topRow(L, { ...box, w: box.w * 0.4 }, {});
      const area = { x: box.x, y: Math.max(cy + d / 2 + u * 5, bb + u * 3, tr.bottom + u * 4), w: box.w };
      area.h = box.y + box.h - area.y;
      compose(area, [
        { b: eyebrow(L, area.w, 'left') },
        { flex: (h) => headline(L, area.w, h, 'left', th.text, 0.95), g: u * 2.4 },
        { b: subtitle(L, area.w * 0.92, 'left'), g: u * 2.4 },
        { b: cta(L, 'pill', { maxW: area.w }), g: u * 4 },
        { b: contact(L, area.w, 'left'), g: u * 3.4 }
      ], 'left', 'center').draw();
      return;
    }
    const tb = { x: box.x, y: box.y, w: Math.max(u * 30, cx - d / 2 - u * 8 - box.x), h: box.h };
    const tr = topRow(L, tb, {});
    const area = { x: tb.x, y: tr.bottom + u * 4, w: tb.w };
    area.h = tb.y + tb.h - area.y;
    compose(area, [
      { b: eyebrow(L, area.w, 'left') },
      { flex: (h) => headline(L, area.w, h, 'left', th.text, 1), g: u * 2.4 },
      { b: subtitle(L, area.w, 'left'), g: u * 2.4 },
      { b: cta(L, 'pill', { maxW: area.w }), g: u * 4 },
      { b: contact(L, area.w, 'left'), g: u * 3.4 }
    ], 'left', 'center').draw();
  });

  // ======================= COPERTĂ DE REVISTĂ =======================
  add('magazine', { name: 'Copertă', note: 'Ca o copertă de revistă, cu numele brandului sus', tags: ['photo', 'elegant'], slot: true, margin: 6 }, (L) => {
    const { ctx, u, th, box, W, H } = L;
    const photo = L.img.photo;
    let light = th.text, base = th.bg;
    if (photo) {
      E.cover(ctx, photo, 0, 0, W, H, L.o.fx, L.o.fy, L.o.zoom);
      base = C.mix(C.lum(th.text) < C.lum(th.bg) ? th.text : th.bg, '#000000', 0.55);
      const k = (L.o.overlay ?? 0.6) / 0.6;
      let g = ctx.createLinearGradient(0, 0, 0, H * 0.32);
      g.addColorStop(0, C.rgba(base, Math.min(0.85, 0.55 * k)));
      g.addColorStop(1, C.rgba(base, 0));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H * 0.32);
      g = ctx.createLinearGradient(0, H * 0.4, 0, H);
      g.addColorStop(0, C.rgba(base, 0));
      g.addColorStop(1, C.rgba(base, Math.min(0.95, 0.85 * k)));
      ctx.fillStyle = g;
      ctx.fillRect(0, H * 0.4, W, H * 0.6);
      light = C.firstOk(base, [C.isLight(th.bg) ? th.bg : th.text, '#FFFFFF'], 4.5);
    } else paintBg(L, 'mesh', { slot: true });
    const mw = L.horiz ? box.w * 0.62 : box.w;
    const mast = has(L.d.brand)
      ? txt(L, L.d.brand, { role: 'head', size: box.h * 0.3, min: u * 6, maxH: box.h * (L.horiz ? 0.24 : 0.15), maxLines: 1, maxW: mw,
        upper: true, hl: false, track: -0.03, lh: 1, color: light, align: 'left' })
      : logo(L, box.h * 0.1, mw, light);
    let y = box.y;
    if (mast) {
      mast.draw(L.horiz ? box.x : box.x + (box.w - mast.w) / 2, y);
      y += mast.h + (mast.desc || 0) + u * 1.2;
    }
    const issue = txt(L, [L.d.eyebrow, L.d.contact].filter(has).join('  ·  '), { role: 'body', weight: 600, size: u * 2, min: u * 1.5,
      upper: true, track: 0.14, maxLines: 1, maxW: mw, color: light, align: 'left', hl: false });
    if (issue) {
      issue.draw(L.horiz ? box.x : box.x + (box.w - issue.w) / 2, y);
      y += issue.h + u * 2;
    }
    let top = y + u * 3;
    if (has(L.d.offer)) {
      const D = L.horiz ? Math.min(box.h * 0.42, box.w * 0.22) : Math.min(box.w * 0.3, box.h * 0.2);
      offerBadge(L, D, { rot: 0.14, ring: true }).draw(box.x + box.w - D, L.horiz ? box.y + box.h * 0.32 : top);
      if (!L.horiz) top += D * 0.6;
    }
    const area = { x: box.x, y: top, w: L.horiz ? box.w * 0.6 : box.w * 0.92 };
    area.h = box.y + box.h - area.y;
    compose(area, [
      { flex: (h) => headline(L, area.w, h, 'left', light, 1, hlOn(L, base, light)) },
      { b: subtitle(L, area.w * 0.9, 'left', C.mix(light, base, 0.15)), g: u * 2.4 },
      { b: cta(L, 'pill', { maxW: area.w }), g: u * 4 }
    ], 'left', 'bottom').draw();
  });

  // ======================= BENZI =======================
  add('ribbon', { name: 'Benzi', note: 'Benzi diagonale cu oferta repetată, energie de lansare', tags: ['offer', 'fun'] }, (L) => {
    const { ctx, u, th, box, W, H } = L;
    paintBg(L, 'solid');
    const l1 = E.upper(offerLabel(L) || E.plain(L.d.brand) || E.plain(L.d.cta));
    const l2 = E.upper(E.plain(L.d.eyebrow) || E.plain(L.d.brand) || l1);
    const tapeH = u * (L.horiz ? 10 : 8.5);
    const tape = (cy, rot, fill, ink, label) => {
      if (!label) return;
      ctx.save();
      ctx.translate(W / 2, cy);
      ctx.rotate(rot);
      const len = Math.hypot(W, H) * 1.2;
      ctx.fillStyle = fill;
      ctx.fillRect(-len / 2, -tapeH / 2, len, tapeH);
      const size = tapeH * 0.38;
      E.setFont(ctx, { family: L.fp.body.family, weight: 700 }, size, 0.08);
      const tw = ctx.measureText(label).width, gap = size * 2.4;
      const capH = ctx.measureText('H').actualBoundingBoxAscent || size * 0.7;
      ctx.fillStyle = ink;
      for (let x = -len / 2 - L.rng() * tw; x < len / 2; x += tw + gap) {
        ctx.fillText(label, x, capH / 2);
        ctx.beginPath();
        ctx.arc(x + tw + gap / 2, 0, size * 0.16, 0, Math.PI * 2);
        ctx.fill();
      }
      E.resetFont(ctx);
      ctx.restore();
    };
    const r1 = -0.085, r2 = 0.065;
    const y1 = box.y + tapeH * 0.6, y2 = box.y + box.h - tapeH * 0.6;
    tape(y2, r2, th.text, th.bg, l2);
    tape(y1, r1, th.accent, th.onAccent, l1);
    const lean1 = (W / 2) * Math.sin(Math.abs(r1)), lean2 = (W / 2) * Math.sin(Math.abs(r2));
    const area = { x: box.x, y: y1 + tapeH / 2 + lean1 + u * 5, w: box.w };
    area.h = y2 - tapeH / 2 - lean2 - u * 5 - area.y;
    compose(area, [
      { b: logo(L, u * 4.6, area.w * 0.5, th.text) },
      { b: has(L.d.eyebrow) && l2 !== E.upper(E.plain(L.d.eyebrow)) ? eyebrow(L, area.w, 'center') : null, g: u * 3 },
      { flex: (h) => headline(L, area.w, h, 'center', th.text, 1.05), g: u * 3 },
      { b: subtitle(L, area.w * 0.86, 'center'), g: u * 2.6 },
      { b: cta(L, 'pill', { maxW: area.w }), g: u * 4 },
      { b: contact(L, area.w, 'center'), g: u * 3 }
    ], 'center', 'center').draw();
  });

  // ======================= SUPERGRAFIC =======================
  add('supergraphic', { name: 'Supergrafic', note: 'O cifră sau o literă uriașă, tăiată de margini', tags: ['offer', 'text'] }, (L) => {
    const { ctx, u, th, box, W, H } = L;
    paintBg(L, 'solid');
    const brandL = E.plain(L.d.brand) || E.plain(L.d.headline);
    const big = has(L.d.offer) ? E.upper(E.plain(L.d.offer)) : E.upper(brandL.charAt(0) || 'A');
    const f = L.fp.head;
    ctx.save();
    let size = H;
    E.setFont(ctx, f, size, -0.04);
    let w = ctx.measureText(big).width;
    size = Math.min(size * ((L.horiz ? W * 0.75 : W * 1.25) / w), H * (L.horiz ? 1.25 : 0.95));
    E.setFont(ctx, f, size, -0.04);
    w = ctx.measureText(big).width;
    const capH = ctx.measureText('H').actualBoundingBoxAscent || size * 0.7;
    ctx.fillStyle = C.mix(th.bg, th.accent, C.isLight(th.bg) ? 0.22 : 0.3);
    if (L.horiz) ctx.fillText(big, W - w * 0.92, H * 0.5 + capH * 0.5);
    else ctx.fillText(big, -w * 0.05, H * 0.06 + capH);
    E.resetFont(ctx);
    ctx.restore();
    const tr = topRow(L, box, { right: 'contact' });
    const area = { x: box.x, y: tr.bottom + u * 5, w: L.horiz ? box.w * 0.58 : box.w };
    area.h = box.y + box.h - area.y;
    compose(area, [
      { b: pill(L, offerLabel(L), { fill: th.accent, ink: th.onAccent, maxW: area.w }) },
      { b: eyebrow(L, area.w, 'left'), g: u * 4 },
      { flex: (h) => headline(L, area.w, h, 'left', th.text, 1), g: u * 2.4 },
      { b: subtitle(L, area.w * 0.92, 'left'), g: u * 2.4 },
      { b: cta(L, 'outline', { maxW: area.w }), g: u * 4 }
    ], 'left', 'bottom').draw();
  });

  // ======================= ECOU =======================
  add('echo', { name: 'Ecou', note: 'Titlul repetat în contur, ritm tipografic', tags: ['text', 'fun'] }, (L) => {
    const { u, th } = L;
    paintBg(L, 'solid');
    const area = centerFrame(L, 4);
    // Micșorăm titlul până când cele trei copii încap fără să atingă logoul sau contactul.
    let lay = null;
    for (const f of [0.22, 0.18, 0.14, 0.11, 0.08]) {
      const hmax = area.h * f;
      const copy = (a) => headline(L, area.w, hmax, 'center', th.text, 1, { outline: true, outlineColor: C.rgba(th.text, a) });
      lay = compose(area, [
        { b: eyebrow(L, area.w, 'center') },
        { b: copy(0.42), g: u * 3 },
        { b: headline(L, area.w, hmax, 'center', th.text, 1), g: u * 1.2 },
        { b: copy(0.2), g: u * 1.2 },
        { b: subtitle(L, area.w * 0.86, 'center'), g: u * 2.6 },
        { b: pill(L, offerLabel(L), { stroke: th.text, ink: th.text, maxW: area.w }), g: u * 3.4 },
        { b: cta(L, 'pill', { maxW: area.w }), g: u * 3 }
      ], 'center', 'center');
      if (lay.h <= area.h) break;
    }
    lay.draw();
  });

  // ======================= BENEFICII =======================
  add('checklist', { name: 'Beneficii', note: 'Subtitlul devine o listă cu bife', tags: ['text'] }, (L) => {
    const { ctx, u, th, box } = L;
    paintBg(L, 'solid');
    const list = String(L.d.subtitle || '').split(/\n+|(?<=[.!?])\s+/).map((s) => s.trim().replace(/[.;]$/, '')).filter(Boolean).slice(0, 5);
    const row = (text, maxW) => {
      const size = u * 3.1, cs = size * 1.35;
      const t = txt(L, text, { role: 'body', weight: 500, size, min: u * 2.3, lh: 1.3, maxLines: 3, maxW: maxW - cs - u * 2.5, color: th.text });
      if (!t) return null;
      return {
        w: cs + u * 2.5 + t.w, h: t.h, desc: t.desc,
        draw(x, y) {
          const cy = y + t.lay.capH / 2;
          ctx.beginPath();
          ctx.arc(x + cs / 2, cy, cs / 2, 0, Math.PI * 2);
          ctx.fillStyle = th.accent;
          ctx.fill();
          ctx.strokeStyle = th.onAccent;
          ctx.lineWidth = cs * 0.12;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.beginPath();
          ctx.moveTo(x + cs * 0.29, cy + cs * 0.01);
          ctx.lineTo(x + cs * 0.44, cy + cs * 0.16);
          ctx.lineTo(x + cs * 0.72, cy - cs * 0.15);
          ctx.stroke();
          t.draw(x + cs + u * 2.5, y);
        }
      };
    };
    const tr = topRow(L, box, { right: 'contact' });
    const R = { x: box.x, y: tr.bottom + u * 5, w: box.w };
    R.h = box.y + box.h - R.y;
    const op = (w) => pill(L, offerLabel(L), { fill: th.surface, ink: th.onSurface, maxW: w });
    if (!L.horiz) {
      compose(R, [
        { b: eyebrow(L, R.w, 'left') },
        { flex: (h) => headline(L, R.w, h, 'left', th.text, 0.85), g: u * 2.4 },
        ...list.map((s, i) => ({ b: row(s, R.w), g: i ? u * 2.4 : u * 4.5 })),
        { b: op(R.w), g: u * 4.5 },
        { b: cta(L, 'pill', { maxW: R.w }), g: u * 3 }
      ], 'left', 'center').draw();
      return;
    }
    const lw = R.w * 0.48, rx = R.x + lw + u * 7, rw = R.x + R.w - rx;
    compose({ ...R, w: lw }, [
      { b: eyebrow(L, lw, 'left') },
      { flex: (h) => headline(L, lw, h, 'left', th.text, 1), g: u * 2.4 },
      { b: op(lw), g: u * 4 },
      { b: cta(L, 'pill', { maxW: lw }), g: u * 3 }
    ], 'left', 'center').draw();
    compose({ x: rx, y: R.y, w: rw, h: R.h }, list.map((s, i) => ({ b: row(s, rw), g: i ? u * 2.6 : 0 })), 'left', 'center').draw();
  });

  // ======================= DIAGONAL =======================
  add('diagonal', { name: 'Diagonal', note: 'Fundal tăiat în diagonală, dinamic', tags: ['offer', 'photo'], slot: true }, (L) => {
    const { ctx, u, th, box, W, H } = L;
    paintBg(L, 'solid', { slot: true });
    const photo = L.img.photo, offer = has(L.d.offer);
    const poly = L.horiz ? [[W * 0.6, 0], [W, 0], [W, H], [W * 0.46, H]] : [[0, H * 0.6], [W, H * 0.46], [W, H], [0, H]];
    ctx.save();
    ctx.beginPath();
    poly.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
    ctx.clip();
    if (photo) E.cover(ctx, photo, 0, 0, W, H, L.o.fx, L.o.fy, L.o.zoom);
    else {
      ctx.fillStyle = th.accent;
      ctx.fillRect(0, 0, W, H);
      E.pattern(ctx, 0, 0, W, H, 'lines', C.rgba(th.onAccent, 0.08), u);
    }
    ctx.restore();
    ctx.strokeStyle = photo ? th.accent : th.text;
    ctx.lineWidth = u * 1.1;
    ctx.beginPath();
    ctx.moveTo(poly[0][0], poly[0][1]);
    ctx.lineTo(poly[L.horiz ? 3 : 1][0], poly[L.horiz ? 3 : 1][1]);
    ctx.stroke();
    const ctaB = cta(L, 'pill', photo ? { maxW: box.w } : { maxW: box.w, fill: th.bg, ink: th.text });
    if (!L.horiz) {
      const tr = topRow(L, box, { right: 'contact' });
      const area = { x: box.x, y: tr.bottom + u * 5, w: box.w };
      area.h = H * 0.46 - u * 6 - area.y;
      compose(area, [
        { b: eyebrow(L, area.w, 'left') },
        { flex: (h) => headline(L, area.w, h, 'left', th.text, 1), g: u * 2.4 },
        { b: subtitle(L, area.w * 0.92, 'left'), g: u * 2.4 }
      ], 'left', 'center').draw();
      const R2 = { x: box.x, y: H * 0.6 + u * 5, w: box.w };
      R2.h = box.y + box.h - R2.y;
      if (ctaB) ctaB.draw(R2.x, R2.y + R2.h - ctaB.h);
      if (offer && !photo) {
        compose({ x: R2.x, y: R2.y, w: R2.w, h: R2.h - (ctaB ? ctaB.h + u * 4 : 0) }, [
          { b: offerGiant(L, R2.w, R2.h * 0.5, 'right', th.onAccent) },
          { b: detail(L, R2.w * 0.7, 'right', th.onAccent), g: u * 2.5 }
        ], 'right', 'bottom').draw();
      } else if (offer) {
        const D = Math.min(box.w * 0.3, H * 0.18);
        offerBadge(L, D, { rot: 0.12, ring: true }).draw(box.x + box.w - D, H * 0.46 - D * 0.35);
      }
      return;
    }
    const tb = { x: box.x, y: box.y, w: W * 0.46 - box.x - u * 6, h: box.h };
    const tr = topRow(L, tb, {});
    const area = { x: tb.x, y: tr.bottom + u * 4, w: tb.w };
    area.h = tb.y + tb.h - area.y;
    compose(area, [
      { b: eyebrow(L, area.w, 'left') },
      { flex: (h) => headline(L, area.w, h, 'left', th.text, 1), g: u * 2.4 },
      { b: subtitle(L, area.w, 'left'), g: u * 2.4 },
      { b: ctaB, g: u * 4 },
      { b: contact(L, area.w, 'left'), g: u * 3 }
    ], 'left', 'center').draw();
    if (offer) {
      const rx = W * 0.62, rw = box.x + box.w - rx;
      if (photo) {
        const D = Math.min(rw * 0.6, H * 0.4);
        offerBadge(L, D, { rot: 0.12, ring: true }).draw(rx + (rw - D) / 2, box.y + box.h - D);
      } else {
        compose({ x: rx, y: box.y, w: rw, h: box.h }, [
          { b: offerGiant(L, rw, box.h * 0.45, 'center', th.onAccent) },
          { b: detail(L, rw, 'center', th.onAccent), g: u * 2.5 }
        ], 'center', 'center').draw();
      }
    }
  });

  // ======================= RETRO =======================
  add('retro', { name: 'Retro', note: 'Raze de soare și umbră tare, aer anii ’70', tags: ['fun'] }, (L) => {
    const { u, th, box, W, H, ctx } = L;
    paintBg(L, 'solid');
    E.rays(ctx, W / 2, L.horiz ? H * 0.5 : H * 0.55, Math.hypot(W, H), 28, C.mix(th.bg, th.surface, 0.75), L.rng() * 0.2);
    const shadowC = C.contrast(th.accent, th.bg) >= 1.6 ? th.accent : th.surface;
    const hard = (maxW, h, al, k) => {
      const a = headline(L, maxW, h, al, th.text, k);
      if (!a) return null;
      const s = headline(L, maxW, h, al, shadowC, k, { hlColor: shadowC, italicColor: shadowC, markerInk: shadowC, marker: 'rgba(0,0,0,0)' });
      const off = a.lay.size * 0.06;
      return { w: a.w + off, h: a.h + off, desc: a.desc, draw(x, y) { s.draw(x + off, y + off); a.draw(x, y); } };
    };
    const offer = has(L.d.offer);
    if (!L.horiz) {
      const area = centerFrame(L, 4);
      const D = offer ? Math.min(box.w * 0.34, area.h * 0.26) : 0;
      const lay = compose(area, [
        { b: D ? spacer(D * 0.85) : null },
        { b: eyebrow(L, area.w, 'center', th.text), g: u * 2 },
        { flex: (h) => hard(area.w, h, 'center', 1.1), g: u * 2.6 },
        { b: subtitle(L, area.w * 0.86, 'center', th.text), g: u * 3 },
        { b: cta(L, 'pill', { maxW: area.w }), g: u * 4.4 }
      ], 'center', 'center');
      lay.draw();
      if (D) offerBadge(L, D, { shape: 'scallop', rot: 0.2, fill: th.text, ink: th.bg }).draw(box.x + box.w - D, lay.top - D * 0.05);
      return;
    }
    const tr = topRow(L, box, { right: 'contact' });
    const area = { x: box.x, y: tr.bottom + u * 4, w: box.w * (offer ? 0.6 : 1) };
    area.h = box.y + box.h - area.y;
    compose(area, [
      { b: eyebrow(L, area.w, 'left', th.text) },
      { flex: (h) => hard(area.w, h, 'left', 1.05), g: u * 2.4 },
      { b: subtitle(L, area.w, 'left', th.text), g: u * 2.6 },
      { b: cta(L, 'pill', { maxW: area.w }), g: u * 4 }
    ], 'left', 'center').draw();
    if (offer) {
      const rw = box.w - area.w;
      const D = Math.min(rw * 0.86, area.h * 0.9);
      offerBadge(L, D, { shape: 'scallop', rot: 0.2, fill: th.text, ink: th.bg }).draw(box.x + area.w + (rw - D) / 2 + u * 2, area.y + (area.h - D) / 2);
    }
  });

  // ======================= CONVERSAȚIE =======================
  add('chat', { name: 'Conversație', note: 'Mesaje ca într-o conversație, ton apropiat', tags: ['text', 'fun'] }, (L) => {
    const { ctx, u, th, box } = L;
    paintBg(L, 'solid');
    // antet: avatar + nume + contact
    const r = u * 3.8;
    const ax = box.x + r, ay = box.y + r;
    ctx.beginPath();
    ctx.arc(ax, ay, r, 0, Math.PI * 2);
    ctx.fillStyle = L.img.logo ? th.surface : th.accent;
    ctx.fill();
    if (L.img.logo) {
      const lg = logo(L, r * 0.9, r * 1.5, th.onSurface);
      if (lg) lg.draw(ax - lg.w / 2, ay - lg.h / 2);
    } else {
      const ini = txt(L, (E.plain(L.d.brand).charAt(0) || '•').toLocaleUpperCase('ro-RO'), { role: 'head', size: r * 1.1, maxW: r * 1.6, color: th.onAccent, hl: false, maxLines: 1 });
      if (ini) ini.draw(ax - ini.w / 2, ay - ini.h / 2);
    }
    const nameB = txt(L, L.d.brand, { role: 'body', weight: 700, size: u * 2.8, min: u * 2, maxLines: 1, maxW: box.w - r * 2 - u * 4, color: th.text });
    const ct = contact(L, box.w - r * 2 - u * 4, 'left');
    const nx = box.x + r * 2 + u * 3;
    const nh = (nameB ? nameB.h : 0) + (ct ? ct.h + u * 1.4 : 0);
    let ny = ay - nh / 2;
    if (nameB) { nameB.draw(nx, ny); ny += nameB.h + u * 1.4; }
    if (ct) ct.draw(nx, ny);
    ctx.fillStyle = th.line;
    ctx.fillRect(box.x, box.y + r * 2 + u * 3, box.w, Math.max(1, u * 0.14));
    const area = { x: box.x, y: box.y + r * 2 + u * 7, w: box.w };
    area.h = box.y + box.h - area.y;
    const maxB = box.w * (L.horiz ? 0.62 : 0.86), pX = u * 3.6, pY = u * 3;
    const bubble = (inner, fill, side) => inner && {
      w: inner.w + pX * 2, h: inner.h + pY * 2 + (inner.desc || 0) * 0.6,
      draw(x, y) {
        const w = this.w, h = this.h, rr = Math.min(u * 4.5, h / 2);
        E.rr(ctx, x, y, w, h, rr);
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.beginPath();
        if (side === 'left') {
          ctx.moveTo(x + u * 1.2, y + h - u * 3.5);
          ctx.quadraticCurveTo(x + u * 0.6, y + h - u * 0.2, x - u * 1.8, y + h + u * 0.3);
          ctx.quadraticCurveTo(x + u * 2.6, y + h + u * 0.4, x + u * 5, y + h - u * 0.6);
        } else {
          ctx.moveTo(x + w - u * 1.2, y + h - u * 3.5);
          ctx.quadraticCurveTo(x + w - u * 0.6, y + h - u * 0.2, x + w + u * 1.8, y + h + u * 0.3);
          ctx.quadraticCurveTo(x + w - u * 2.6, y + h + u * 0.4, x + w - u * 5, y + h - u * 0.6);
        }
        ctx.fill();
        inner.draw(x + pX, y + pY);
      }
    };
    const onS = th.onSurface;
    compose(area, [
      { b: eyebrow(L, area.w, 'center', th.muted, 1), align: 'center' },
      { flex: (h) => bubble(headline(L, maxB - pX * 2, h - pY * 2, 'left', onS, 0.62, hlOn(L, th.surface, onS)), th.surface, 'left'), g: u * 3.5, align: 'left' },
      { b: bubble(has(L.d.offer) ? txt(L, offerLabel(L), { role: 'body', weight: 700, size: u * 3.3, min: u * 2.3, maxLines: 3, maxW: maxB - pX * 2, color: th.onAccent, lh: 1.25 }) : null, th.accent, 'right'), g: u * 3, align: 'right' },
      { b: bubble(subtitle(L, maxB - pX * 2, 'left', onS), th.surface, 'left'), g: u * 3, align: 'left' },
      { b: cta(L, 'outline', { maxW: maxB }), g: u * 3.4, align: 'right' }
    ], 'left', 'center').draw();
  });

  // ======================= ZIAR =======================
  add('newspaper', { name: 'Ziar', note: 'Prima pagină de ziar, cu titlu de știre', tags: ['text', 'elegant'] }, (L) => {
    const { ctx, u, th, box } = L;
    paintBg(L, 'solid');
    const rule = (y, t) => {
      ctx.fillStyle = th.text;
      ctx.fillRect(box.x, y, box.w, Math.max(1, u * t));
    };
    const mast = has(L.d.brand)
      ? txt(L, L.d.brand, { role: 'head', size: u * (L.horiz ? 9 : 11), min: u * 5, maxLines: 1, maxW: box.w, align: 'center', hl: false, color: th.text, lh: 1 })
      : logo(L, u * 7, box.w * 0.6, th.text);
    let y = box.y;
    if (mast) {
      mast.draw(box.x + (box.w - mast.w) / 2, y);
      y += mast.h + (mast.desc || u) + u * 1.4;
    }
    rule(y, 0.5);
    y += u * 1.2;
    rule(y, 0.15);
    y += u * 1.8;
    const dl = eyebrow(L, box.w * 0.5, 'left', th.text, 1);
    const cr = txt(L, L.d.contact, { role: 'body', weight: 600, size: u * 2, min: u * 1.5, upper: true, track: 0.1, maxLines: 1, maxW: box.w * 0.46, align: 'right', color: th.text });
    const dh = Math.max(dl ? dl.h : 0, cr ? cr.h : 0);
    if (dl) dl.draw(box.x, y);
    if (cr) cr.draw(box.x + box.w - cr.w, y);
    if (dh) {
      y += dh + u * 1.8;
      rule(y, 0.15);
    }
    y += u * 4.5;
    const area = { x: box.x, y, w: box.w, h: box.y + box.h - y };
    const offer = has(L.d.offer);
    const adW = offer ? box.w * (L.horiz ? 0.3 : 0.38) : 0;
    const colW = box.w - adW - (offer ? u * 6 : 0);
    const pad = u * 3;
    const sub = subtitle(L, colW, 'left', th.text, 0.92);
    const ctaB = cta(L, 'link', { maxW: offer ? adW - pad * 2 : colW });
    let ad = null;
    if (offer) {
      const inner = compose({ x: 0, y: 0, w: adW - pad * 2, h: 1e5 }, [
        { b: offerGiant(L, adW - pad * 2, u * 13, 'center', th.accentLarge), align: 'center' },
        { b: detail(L, adW - pad * 2, 'center', th.text), g: u * 2, align: 'center' },
        { b: ctaB, g: u * 3, align: 'center' }
      ], 'center', 'top');
      ad = { w: adW, h: inner.h + pad * 2, draw(x, yy) {
        ctx.strokeStyle = th.text;
        ctx.lineWidth = Math.max(1, u * 0.3);
        ctx.strokeRect(x, yy, adW, inner.h + pad * 2);
        inner.draw(x + pad, yy + pad);
      } };
    }
    const rowH = Math.max(sub ? sub.h + sub.desc : 0, ad ? ad.h : 0, !offer && ctaB ? (sub ? sub.h + u * 4 : 0) + ctaB.h : 0);
    const row = rowH ? { w: box.w, h: rowH, draw(x, yy) {
      if (sub) sub.draw(x, yy);
      if (!offer && ctaB) ctaB.draw(x, yy + (sub ? sub.h + u * 4 : 0));
      if (ad) {
        ctx.fillStyle = th.line;
        ctx.fillRect(x + colW + u * 3, yy, Math.max(1, u * 0.15), rowH);
        ad.draw(x + box.w - adW, yy);
      }
    } } : null;
    compose(area, [
      { flex: (h) => headline(L, area.w, h, 'left', th.text, 1.15) },
      { b: row, g: u * 4.5 }
    ], 'left', 'top').draw();
  });

  // Ordinea din galerie: alternăm genurile ca să fie ușor de parcurs.
  const order = ['editorial', 'promo', 'split', 'poster', 'ticket', 'bento', 'brutal', 'minimal', 'polaroid', 'pricetag', 'swiss',
    'arch', 'burst', 'magazine', 'quote', 'ribbon', 'circle', 'aura', 'supergraphic', 'checklist', 'retro', 'diagonal', 'echo', 'chat', 'newspaper'];
  A.TEMPLATES.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
})(window.A = window.A || {});
