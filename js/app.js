/* Atelier – interfața: stare, panouri, previzualizări, export */
(function (A) {
  'use strict';
  const { E, C } = A;
  const $ = (id) => document.getElementById(id);
  const h = (tag, attrs = {}, kids = []) => {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v);
    }
    [].concat(kids).forEach((c) => c != null && el.append(c));
    return el;
  };
  $('font-css').href = A.FONT_CSS;

  // ---------- stocare locală (opțională; aplicația merge și fără) ----------
  const KEY = 'atelier.state.v1', IMG = 'atelier.images.v1', KITS = 'atelier.kits.v1';
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  };
  const pal = (p) => ({ bg: p.bg, surface: p.surface, text: p.text, accent: p.accent });
  const defaults = () => ({
    text: { ...A.SAMPLE }, template: 'editorial', font: 'bricolage', hlStyle: 'italic', headScale: 1,
    colors: pal(A.PALETTES[6]), palette: A.PALETTES[6].name, variant: 'normal', autoContrast: true,
    bgMode: 'auto', pattern: 'dots', photoFilter: 'none', fx: 0.5, fy: 0.5, zoom: 1, overlay: 0.6,
    logoTint: 'original', grain: 0.05, formats: [...A.DEFAULT_FORMATS], seed: 0, safe: false,
    capKind: 'direct', keywords: 'cafea, cluj, coffeetogo', caption: '', captionEdited: false
  });
  const saved = store.get(KEY) || {};
  const st = Object.assign(defaults(), saved, { text: Object.assign({ ...A.SAMPLE }, saved.text || {}) });
  const assets = { photo: null, photoId: null, photoSrc: null, logo: null, logoId: null, logoSrc: null };
  let saveTimer = null;
  const save = () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => store.set(KEY, st), 300);
  };

  const toast = (msg) => {
    const t = $('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast.t);
    toast.t = setTimeout(() => t.classList.remove('show'), 2600);
  };

  // ---------- fonturi ----------
  const loaded = new Set();
  function ensureFonts() {
    const fp = A.FONTS.find((f) => f.id === st.font) || A.FONTS[0];
    const faces = [fp.head, fp.it, ...[400, 500, 600, 700].map((w) => ({ family: fp.body.family, weight: w }))];
    return Promise.all(faces.map((f) => {
      const key = E.font(f, 40);
      if (loaded.has(key) || !document.fonts) return null;
      return document.fonts.load(key, 'AĂÂÎȘȚaăâîșț0%').then(() => loaded.add(key)).catch(() => {});
    }));
  }

  // ---------- randare ----------
  const fmtById = (id) => A.FORMATS.find((f) => f.id === id);
  const selFormats = () => A.FORMATS.filter((f) => st.formats.includes(f.id));
  const tplById = (id) => A.TEMPLATES.find((t) => t.id === id) || A.TEMPLATES[0];
  const dpr = () => Math.min(2, window.devicePixelRatio || 1);

  function draw(canvas, fmt, tplId, cssW, opts = {}) {
    const k = Math.min(1, (cssW * dpr()) / fmt.w);
    const w = Math.round(fmt.w * k), hh = Math.round(fmt.h * k);
    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== hh) canvas.height = hh;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, w, hh);
    ctx.setTransform(k, 0, 0, k, 0, 0);
    A.renderPost(ctx, fmt, tplId, st, assets, opts);
  }
  function full(fmt, tplId) {
    const c = document.createElement('canvas');
    c.width = fmt.w;
    c.height = fmt.h;
    A.renderPost(c.getContext('2d'), fmt, tplId || st.template, st, assets);
    return c;
  }

  // Stiluri (bandă de miniaturi)
  const strip = $('strip');
  const thumbs = A.TEMPLATES.map((t) => {
    const cv = h('canvas', { 'aria-hidden': 'true' });
    const b = h('button', { type: 'button', role: 'radio', 'aria-label': t.name, onclick: () => { st.template = t.id; update(); } },
      [cv, h('span', { text: t.name })]);
    strip.append(b);
    return { t, b, cv };
  });
  function renderStrip() {
    const fmt = selFormats()[0] || fmtById('feed45');
    thumbs.forEach(({ t, b, cv }) => {
      b.setAttribute('aria-checked', String(t.id === st.template));
      draw(cv, fmt, t.id, 116);
    });
    $('tpl-note').textContent = tplById(st.template).note;
  }

  // Formate (planșa principală)
  const grid = $('grid');
  let cards = new Map();
  function buildGrid() {
    const fs = selFormats();
    const key = fs.map((f) => f.id).join();
    if (buildGrid.key === key) return;
    buildGrid.key = key;
    grid.innerHTML = '';
    cards = new Map();
    if (!fs.length) {
      grid.append(h('p', { class: 'empty', text: 'Alege cel puțin un format din panoul din stânga.' }));
      return;
    }
    fs.forEach((f) => {
      const cv = h('canvas', { role: 'img', 'aria-label': `Postare ${f.name}` });
      const wrap = h('div', { class: 'canvas-wrap', onclick: () => openZoom(f) }, cv);
      const card = h('article', { class: 'card' + (f.w / f.h > 1.5 ? ' wide' : '') }, [
        h('div', { class: 'card-head' }, [h('b', { text: f.name }), h('span', { text: `${f.w} × ${f.h}` })]),
        wrap,
        h('div', { class: 'card-foot' }, [
          h('small', { text: f.where, title: f.tip || '' }),
          h('div', { class: 'dl' }, [
            h('button', { type: 'button', class: 'btn small', text: 'PNG', onclick: () => exportOne(f, 'png') }),
            h('button', { type: 'button', class: 'btn small ghost', text: 'JPG', onclick: () => exportOne(f, 'jpg') })
          ])
        ])
      ]);
      grid.append(card);
      cards.set(f.id, { f, cv, wrap });
    });
  }
  function renderGrid() {
    buildGrid();
    cards.forEach(({ f, cv, wrap }) => draw(cv, f, st.template, wrap.clientWidth || 260, { safe: st.safe }));
    const n = cards.size;
    $('fmt-note').textContent = n ? `${n} ${n === 1 ? 'format' : 'formate'} · apasă pe o imagine ca s-o vezi mare` : '';
  }

  // Consultant
  function renderInsights() {
    const r = A.analyze(st, selFormats(), assets);
    const ring = $('score-ring');
    const col = r.score >= 85 ? 'var(--ok)' : r.score >= 65 ? 'var(--warn)' : 'var(--bad)';
    ring.style.setProperty('--p', r.score);
    ring.style.setProperty('--c', col);
    $('score').textContent = r.score;
    $('score-label').textContent = r.score >= 85 ? 'Gata de publicat' : r.score >= 65 ? 'Aproape gata' : 'Mai e de lucru';
    const issues = r.items.filter((i) => i.level === 'bad' || i.level === 'warn').length;
    $('score-sub').textContent = issues ? `${issues} ${issues === 1 ? 'lucru de reparat' : 'lucruri de reparat'}, în ordinea importanței.` : 'Textul, contrastul și formatele respectă regulile.';
    const ul = $('checks');
    ul.innerHTML = '';
    r.items.forEach((i) => ul.append(h('li', { class: i.level }, h('div', {}, [h('b', { text: i.title }), h('p', { text: i.tip })]))));
  }

  function renderCaption() {
    if (!st.captionEdited) st.caption = A.caption(st, st.capKind);
    const ta = $('caption');
    if (ta.value !== st.caption) ta.value = st.caption;
    const n = st.caption.length;
    const cc = $('cap-count');
    cc.textContent = n > 2200 ? `${n} / 2200 caractere, prea lung pentru Instagram` : `${n} caractere · primele ~125 apar înainte de „mai mult”`;
    cc.className = n > 2200 ? 'warn' : '';
  }

  let timer = null, busy = false, again = false;
  async function renderAll() {
    if (busy) { again = true; return; }
    busy = true;
    try {
      await ensureFonts();
      renderStrip();
      renderGrid();
      renderCaption();
      renderInsights();
    } finally {
      busy = false;
      if (again) { again = false; renderAll(); }
    }
  }
  function update(now) {
    syncUI();
    save();
    clearTimeout(timer);
    if (now) renderAll();
    else timer = setTimeout(renderAll, 70);
  }

  // ---------- export ----------
  const slug = (s) => E.plain(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const fileName = (f, ext) => `${slug(st.text.brand) || 'postare'}-${f.id}-${f.w}x${f.h}.${ext}`;
  const toBlob = (c, ext) => new Promise((res) => c.toBlob(res, ext === 'jpg' ? 'image/jpeg' : 'image/png', 0.93));
  function download(blob, name) {
    const a = h('a', { href: URL.createObjectURL(blob), download: name });
    document.body.append(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
  }
  async function exportOne(f, ext) {
    await ensureFonts();
    download(await toBlob(full(f), ext), fileName(f, ext));
    toast(`Descărcat: ${f.name}, ${f.w}×${f.h}`);
  }
  $('btn-zip').addEventListener('click', async (ev) => {
    const fs = selFormats();
    if (!fs.length) return toast('Alege cel puțin un format.');
    const btn = ev.currentTarget;
    btn.disabled = true;
    btn.textContent = 'Pregătesc…';
    try {
      await ensureFonts();
      const files = [];
      for (const f of fs) {
        const b = await toBlob(full(f), 'png');
        files.push({ name: fileName(f, 'png'), data: new Uint8Array(await b.arrayBuffer()) });
      }
      if (st.caption) files.push({ name: 'descriere.txt', data: new TextEncoder().encode(st.caption) });
      download(A.zip(files), `${slug(st.text.brand) || 'postare'}-${st.template}.zip`);
      toast(`Arhivă cu ${fs.length} ${fs.length === 1 ? 'imagine' : 'imagini'} și descrierea.`);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Descarcă tot';
    }
  });

  // ---------- previzualizare mare ----------
  const dlg = $('zoom-dlg');
  let zoomFmt = null;
  function openZoom(f) {
    zoomFmt = f;
    $('zoom-title').textContent = `${tplById(st.template).name} · ${f.name} · ${f.w}×${f.h}`;
    const k = Math.min(1, (window.innerWidth * 0.92) / f.w, (window.innerHeight * 0.82) / f.h);
    draw($('zoom-canvas'), f, st.template, f.w * k, { safe: st.safe });
    $('zoom-canvas').style.width = Math.round(f.w * k) + 'px';
    if (dlg.showModal) dlg.showModal();
    else dlg.setAttribute('open', '');
  }
  $('zoom-close').addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  $('zoom-png').addEventListener('click', () => zoomFmt && exportOne(zoomFmt, 'png'));
  $('zoom-jpg').addEventListener('click', () => zoomFmt && exportOne(zoomFmt, 'jpg'));

  // ---------- legare câmpuri ----------
  const TEXT = ['brand', 'eyebrow', 'headline', 'subtitle', 'offer', 'detail', 'cta', 'contact'];
  TEXT.forEach((k) => $('f-' + k).addEventListener('input', (e) => { st.text[k] = e.target.value; update(); }));
  const chips = (id, list, field) => list.forEach((v) => $(id).append(h('button', { type: 'button', text: v, onclick: () => {
    st.text[field] = v;
    $('f-' + field).value = v;
    update();
  } })));
  chips('offer-ideas', A.OFFER_IDEAS, 'offer');
  chips('cta-ideas', A.CTA_IDEAS, 'cta');

  const segs = { hl: 'hlStyle', variant: 'variant', bgMode: 'bgMode', photoFilter: 'photoFilter', logoTint: 'logoTint', capKind: 'capKind' };
  Object.entries(segs).forEach(([id, key]) => {
    $(id).querySelectorAll('button').forEach((b) => {
      b.setAttribute('role', 'radio');
      b.addEventListener('click', () => {
        st[key] = b.dataset.v;
        if (key === 'capKind') st.captionEdited = false;
        update();
      });
    });
  });
  ['headScale', 'fx', 'fy', 'zoom', 'overlay', 'grain'].forEach((k) => $(k).addEventListener('input', (e) => { st[k] = parseFloat(e.target.value); update(); }));
  $('pattern').addEventListener('change', (e) => { st.pattern = e.target.value; if (st.bgMode === 'auto') st.bgMode = 'pattern'; update(); });
  $('autoContrast').addEventListener('change', (e) => { st.autoContrast = e.target.checked; update(); });
  $('opt-safe').addEventListener('change', (e) => { st.safe = e.target.checked; update(); });
  $('btn-shuffle').addEventListener('click', () => { st.seed = (st.seed || 0) + 1; update(true); });

  // fonturi
  A.FONTS.forEach((f) => {
    const b = h('button', { type: 'button', role: 'radio', 'data-v': f.id, onclick: () => { st.font = f.id; update(); } }, [
      h('b', { text: f.name, style: `font-family:"${f.head.family}",serif;font-weight:${f.head.weight};${f.head.upper ? 'text-transform:uppercase;' : ''}` }),
      h('span', { text: `${f.head.family} + ${f.body.family}` })
    ]);
    $('fonts').append(b);
  });

  // culori
  A.PALETTES.forEach((p) => {
    const b = h('button', { type: 'button', role: 'radio', title: p.name, 'data-v': p.name, onclick: () => {
      st.colors = pal(p);
      st.palette = p.name;
      update();
    } }, [
      h('div', { class: 'sw' }, [p.bg, p.accent, p.text].map((c) => h('i', { style: `background:${c}` }))),
      h('span', { text: p.name })
    ]);
    $('palettes').append(b);
  });
  ['bg', 'surface', 'text', 'accent'].forEach((k) => $('c-' + k).addEventListener('input', (e) => {
    st.colors = { ...st.colors, [k]: e.target.value.toUpperCase() };
    st.palette = null;
    update();
  }));
  const fromBase = (dark) => {
    st.colors = C.fromBase($('c-base').value, dark);
    st.palette = null;
    update();
  };
  $('btn-from-base').addEventListener('click', () => fromBase(false));
  $('btn-from-base-dark').addEventListener('click', () => fromBase(true));

  // formate
  A.FORMATS.forEach((f) => {
    const s = 22 / Math.max(f.w, f.h);
    const cb = h('input', { type: 'checkbox', 'data-v': f.id });
    cb.addEventListener('change', () => {
      st.formats = A.FORMATS.filter((x) => (x.id === f.id ? cb.checked : st.formats.includes(x.id))).map((x) => x.id);
      update();
    });
    $('formats').append(h('label', { title: f.tip || '' }, [
      cb,
      h('i', { class: 'ratio', style: `width:${Math.round(f.w * s)}px;height:${Math.round(f.h * s)}px` }),
      h('div', {}, [h('b', { text: f.name }), h('small', { text: f.where })]),
      h('span', { class: 'px', text: `${f.w}×${f.h}` })
    ]));
  });

  // descriere
  $('keywords').addEventListener('input', (e) => { st.keywords = e.target.value; st.captionEdited = false; update(); });
  $('caption').addEventListener('input', (e) => { st.caption = e.target.value; st.captionEdited = true; save(); renderCaption(); clearTimeout(timer); timer = setTimeout(renderInsights, 200); });
  $('btn-copy').addEventListener('click', () => {
    const ta = $('caption');
    const fallback = () => { ta.focus(); ta.select(); toast('Textul e selectat. Apasă Ctrl+C (sau Copiază din meniu).'); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(ta.value).then(() => toast('Descrierea a fost copiată.'), fallback);
    else fallback();
  });

  // ---------- imagini ----------
  function readImage(file) {
    return new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onload = () => {
        const img = new Image();
        img.onload = () => res({ img, src: fr.result });
        img.onerror = rej;
        img.src = fr.result;
      };
      fr.onerror = rej;
      fr.readAsDataURL(file);
    });
  }
  // SVG-urile fără dimensiuni proprii devin imagine de 1000 px.
  function normalize(img) {
    if (img.naturalWidth) return img;
    const c = document.createElement('canvas');
    c.width = 1000;
    c.height = 1000;
    c.getContext('2d').drawImage(img, 0, 0, 1000, 1000);
    return c;
  }
  function setImage(kind, img, src) {
    assets[kind] = img ? normalize(img) : null;
    assets[kind + 'Id'] = img ? kind + Date.now() : null;
    assets[kind + 'Src'] = src || null;
    if (!store.set(IMG, { photo: assets.photoSrc, logo: assets.logoSrc }) && src)
      store.set(IMG, { photo: null, logo: assets.logoSrc }); // fotografia e prea mare pentru memoria browserului
    syncImages();
    update(true);
  }
  function syncImages() {
    const p = assets.photo, l = assets.logo;
    $('thumb-photo').style.backgroundImage = assets.photoSrc ? `url("${assets.photoSrc}")` : '';
    $('photo-info').textContent = p ? `${p.naturalWidth || p.width} × ${p.naturalHeight || p.height} px` : 'Trage o imagine aici sau apasă';
    $('rm-photo').hidden = !p;
    $('photo-opts').hidden = !p;
    $('thumb-logo').style.backgroundImage = assets.logoSrc ? `url("${assets.logoSrc}")` : '';
    $('rm-logo').hidden = !l;
    $('logo-opts').hidden = !l;
  }
  function bindDrop(kind) {
    const zone = $('drop-' + kind), input = $('file-' + kind);
    const take = async (file) => {
      if (!file || !/^image\//.test(file.type)) return toast('Fișierul nu e o imagine.');
      try {
        const { img, src } = await readImage(file);
        setImage(kind, img, src);
        toast(kind === 'photo' ? 'Fotografie adăugată.' : 'Logo adăugat.');
      } catch (e) {
        toast('Imaginea nu a putut fi citită. Încearcă JPG sau PNG.');
      }
    };
    zone.addEventListener('click', (e) => { if (!e.target.closest('button')) input.click(); });
    zone.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); } });
    input.addEventListener('change', () => { take(input.files[0]); input.value = ''; });
    zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('over'));
    zone.addEventListener('drop', (e) => { e.preventDefault(); zone.classList.remove('over'); take(e.dataTransfer.files[0]); });
    $('rm-' + kind).addEventListener('click', () => setImage(kind, null));
  }
  bindDrop('photo');
  bindDrop('logo');
  document.addEventListener('paste', async (e) => {
    const f = [...(e.clipboardData?.files || [])].find((x) => /^image\//.test(x.type));
    if (f) {
      const { img, src } = await readImage(f);
      setImage('photo', img, src);
      toast('Fotografie lipită din clipboard.');
    }
  });

  // ---------- kituri de brand ----------
  const kits = () => store.get(KITS) || [];
  function renderKits() {
    const ul = $('kits');
    ul.innerHTML = '';
    const list = kits();
    if (!list.length) ul.append(h('li', { class: 'hint', style: 'display:block;border-style:dashed' }, 'Niciun kit salvat încă.'));
    list.forEach((k, i) => ul.append(h('li', {}, [
      h('div', { class: 'dots' }, ['bg', 'accent', 'text'].map((c) => h('i', { style: `background:${k.colors[c]}` }))),
      h('span', { text: k.name }),
      h('button', { type: 'button', class: 'btn small', text: 'Aplică', onclick: () => applyKit(k) }),
      h('button', { type: 'button', class: 'btn small ghost', text: 'Șterge', 'aria-label': `Șterge ${k.name}`, onclick: () => {
        const l = kits();
        l.splice(i, 1);
        store.set(KITS, l);
        renderKits();
      } })
    ])));
  }
  function currentKit(name) {
    return {
      name, colors: { ...st.colors }, font: st.font, hlStyle: st.hlStyle, variant: st.variant, template: st.template,
      bgMode: st.bgMode, pattern: st.pattern, grain: st.grain, logoTint: st.logoTint,
      brand: st.text.brand, contact: st.text.contact, keywords: st.keywords, logo: assets.logoSrc
    };
  }
  async function applyKit(k) {
    Object.assign(st, { colors: { ...k.colors }, font: k.font, hlStyle: k.hlStyle, variant: k.variant || 'normal', template: k.template || st.template,
      bgMode: k.bgMode || 'auto', pattern: k.pattern || 'dots', grain: k.grain ?? st.grain, logoTint: k.logoTint || 'original', keywords: k.keywords || st.keywords, palette: null });
    st.text.brand = k.brand || '';
    st.text.contact = k.contact || '';
    if (k.logo) {
      const img = new Image();
      img.onload = () => setImage('logo', img, k.logo);
      img.src = k.logo;
    }
    syncFields();
    update(true);
    toast(`Kitul „${k.name}” a fost aplicat.`);
  }
  $('btn-kit-save').addEventListener('click', () => {
    const name = $('kit-name').value.trim() || st.text.brand || 'Kitul meu';
    const l = kits().filter((k) => k.name !== name);
    l.unshift(currentKit(name));
    if (!store.set(KITS, l)) {
      l[0].logo = null;
      if (!store.set(KITS, l)) return toast('Browserul nu permite salvarea. Folosește „Exportă fișier”.');
      toast('Kit salvat fără logo (logoul e prea mare pentru memoria browserului).');
    } else toast(`Kitul „${name}” a fost salvat.`);
    $('kit-name').value = '';
    renderKits();
  });
  $('btn-kit-export').addEventListener('click', () => {
    const l = kits();
    const data = l.length ? l : [currentKit(st.text.brand || 'Kitul meu')];
    download(new Blob([JSON.stringify({ atelier: 1, kits: data }, null, 2)], { type: 'application/json' }), `kit-${slug(st.text.brand) || 'brand'}.json`);
  });
  $('kit-import').addEventListener('change', async (e) => {
    const f = e.target.files[0];
    e.target.value = '';
    if (!f) return;
    try {
      const j = JSON.parse(await f.text());
      const incoming = (j.kits || []).filter((k) => k && k.name && k.colors);
      if (!incoming.length) throw new Error('gol');
      const names = new Set(incoming.map((k) => k.name));
      store.set(KITS, [...incoming, ...kits().filter((k) => !names.has(k.name))]);
      renderKits();
      applyKit(incoming[0]);
    } catch (err) {
      toast('Fișierul nu e un kit Atelier valid.');
    }
  });

  // ---------- sincronizare interfață ----------
  function syncFields() {
    TEXT.forEach((k) => { if ($('f-' + k).value !== (st.text[k] || '')) $('f-' + k).value = st.text[k] || ''; });
    ['headScale', 'fx', 'fy', 'zoom', 'overlay', 'grain'].forEach((k) => { $(k).value = st[k]; });
    $('keywords').value = st.keywords || '';
    $('pattern').value = st.pattern;
    $('autoContrast').checked = !!st.autoContrast;
    $('opt-safe').checked = !!st.safe;
  }
  function syncUI() {
    Object.entries(segs).forEach(([id, key]) => $(id).querySelectorAll('button').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.v === st[key]))));
    $('fonts').querySelectorAll('button').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.v === st.font)));
    $('palettes').querySelectorAll('button').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.v === st.palette)));
    ['bg', 'surface', 'text', 'accent'].forEach((k) => { const el = $('c-' + k); if (el.value.toUpperCase() !== st.colors[k].toUpperCase()) el.value = st.colors[k]; });
    $('formats').querySelectorAll('input').forEach((cb) => { cb.checked = st.formats.includes(cb.dataset.v); });
    $('o-headScale').textContent = Math.round(st.headScale * 100) + '%';
    $('o-grain').textContent = st.grain ? Math.round(st.grain * 100) + '%' : 'fără';
    $('pattern-field').hidden = !(st.bgMode === 'pattern' || (st.bgMode === 'auto' && ['brutal', 'burst'].includes(st.template)));
  }

  // ---------- pornire ----------
  const imgs = store.get(IMG) || {};
  const restore = (kind) => new Promise((res) => {
    if (!imgs[kind]) return res();
    const img = new Image();
    img.onload = () => {
      assets[kind] = normalize(img);
      assets[kind + 'Id'] = kind + 'r';
      assets[kind + 'Src'] = imgs[kind];
      res();
    };
    img.onerror = res;
    img.src = imgs[kind];
  });
  syncFields();
  syncUI();
  renderKits();
  Promise.all([restore('photo'), restore('logo')]).then(() => {
    syncImages();
    renderAll();
    if (document.fonts) document.fonts.ready.then(() => renderAll());
  });
  let rz = null;
  window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(renderAll, 150); });
})(window.A = window.A || {});
