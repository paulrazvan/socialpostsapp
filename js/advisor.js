/* Atelier – consultant: verifică postarea după reguli de design și de copywriting. */
(function (A) {
  'use strict';
  const { C, E } = A;

  const VERBS = ['comandă', 'comanda', 'cumpără', 'rezervă', 'programează', 'programeaza', 'sună', 'suna', 'descoperă', 'vezi', 'află',
    'încearcă', 'alege', 'profită', 'intră', 'scrie', 'trimite', 'vino', 'înscrie', 'descarcă', 'abonează', 'solicită', 'cere',
    'citește', 'urmărește', 'primește', 'ia', 'găsește', 'testează', 'începe', 'aplică', 'vizitează', 'participă', 'mergi',
    'lasă', 'adaugă', 'gustă', 'explorează', 'creează', 'obține', 'contactează', 'trece', 'fă', 'hai', 'cumpara', 'rezerva', 'vino'];

  // Formulări care fac textul să sune generic, ca scris de un generator automat.
  const CLICHES = ['magie', 'magia', 'magic', 'călători', 'elevează', 'revoluționa', 'revolutiona', 'experiență unică',
    'experiență de neuitat', 'nu doar', 'în lumea de azi', 'în era digitală', 'fie că ești', 'descoperă secretul', 'deblochează',
    'next level', 'game changer', 'tărâm', 'transformă-ți', 'la un alt nivel', 'de neegalat', 'inegalabil', 'partenerul tău de încredere',
    'soluții inovatoare', 'calitate superioară', 'mai mult decât', 'te așteaptă', 'alătură-te', 'esențial', 'perfecțiune', 'unic în felul'];
  const NO_DIACRITICS = /\b(si|pana|inca|gasesti|iti|cafeaua ta de dimineata|reducere la toata|toata|doar azi pana|astazi|saptamana|oferta speciala|vezi colectia|livrare gratuita|pret|preturi)\b/i;

  const words = (s) => E.plain(s).split(/\s+/).filter(Boolean);

  A.analyze = function (st, formats, assets) {
    const t = st.text, out = [];
    const add = (level, title, tip) => out.push({ level, title, tip });

    // Titlu
    const hw = words(t.headline);
    if (!hw.length) add('bad', 'Lipsește titlul', 'Titlul e primul lucru citit. Scrie beneficiul principal în 3–8 cuvinte.');
    else if (hw.length <= 8) add('ok', `Titlu scurt (${hw.length} cuvinte)`, 'Se citește dintr-o privire, cât derulează cineva feed-ul.');
    else if (hw.length <= 12) add('warn', `Titlu cam lung (${hw.length} cuvinte)`, 'Ideal 3–8 cuvinte. Mută restul în subtitlu sau în descriere.');
    else add('bad', `Titlu prea lung (${hw.length} cuvinte)`, 'Peste 12 cuvinte nu mai e titlu. Păstrează doar beneficiul.');

    const groups = (String(t.headline || '').match(/\*[^*]+\*/g) || []).length;
    if (groups === 1) add('ok', 'Un singur accent în titlu', 'Privirea are un punct clar de intrare.');
    else if (groups > 1) add('warn', `${groups} accente în titlu`, 'Când totul e evidențiat, nimic nu mai iese în față. Păstrează unul.');
    else if (hw.length) add('tip', 'Evidențiază un cuvânt', 'Pune *între steluțe* cuvântul cel mai important din titlu.');

    // Cantitate de text
    if ((t.subtitle || '').length > 140) add('warn', 'Subtitlu lung', `${t.subtitle.length} caractere. Pe imagine, sub 120. Detaliile merg în descriere.`);
    const total = [t.eyebrow, t.headline, t.subtitle, t.offer, t.detail, t.cta].reduce((s, x) => s + words(x).length, 0);
    if (total > 38) add('warn', `${total} de cuvinte pe imagine`, 'Postările care performează au de obicei sub 30. Taie ce se repetă.');
    else if (total) add('ok', `${total} de cuvinte pe imagine`, 'Cantitate bună de text pentru o imagine de feed.');

    // Îndemn
    const cw = words(t.cta);
    if (!cw.length) add('warn', 'Lipsește îndemnul (CTA)', 'Spune-le exact ce să facă: Comandă, Rezervă, Sună.');
    else {
      const first = cw[0].toLocaleLowerCase('ro-RO').replace(/[^\p{L}-]/gu, '');
      const isVerb = VERBS.includes(first) || /-(te|ne|ți|vă)$/.test(first);
      if (isVerb && cw.length <= 4) add('ok', 'Îndemn clar', `„${E.plain(t.cta)}” începe cu un verb și e scurt.`);
      else if (!isVerb) add('warn', 'Îndemnul nu începe cu un verb', 'Ex.: Comandă acum, Rezervă o masă, Programează-te.');
      else add('warn', 'Îndemn prea lung', 'Maximum 3–4 cuvinte pe buton.');
    }

    // Ofertă
    if ((t.offer || '').trim()) {
      if (/\d/.test(t.offer)) add('ok', 'Oferta are o cifră', 'Cifrele concrete se rețin mai ușor decât „prețuri mici”.');
      else add('tip', 'Oferta fără cifră', 'Dacă se poate, pune un număr: -20%, 2+1, 49 lei.');
      if (/(până|pana|doar|azi|astăzi|ultimele|weekend|stoc|limitat|\d{1,2}\s*(ian|feb|mar|apr|mai|iun|iul|aug|sep|oct|noi|dec)|duminică|sâmbătă|vineri)/i.test(t.detail || ''))
        add('ok', 'Termen limită', 'Data sau stocul limitat dau un motiv să acționezi acum.');
      else add('tip', 'Adaugă un termen', 'Ex.: „până duminică” sau „doar 50 de bucăți”.');
    }

    // Contrast
    const th = C.theme(st.colors, st.variant, st.autoContrast);
    const raw = C.theme(st.colors, st.variant, false);
    const cr = C.contrast(raw.text, raw.bg);
    if (cr >= 7) add('ok', `Contrast excelent (${cr.toFixed(1)}:1)`, 'Se citește și pe ecrane cu luminozitate mică.');
    else if (cr >= 4.5) add('ok', `Contrast bun (${cr.toFixed(1)}:1)`, 'Peste pragul de lizibilitate WCAG.');
    else if (st.autoContrast) add('warn', `Contrast slab (${cr.toFixed(1)}:1), corectat automat`, 'Am închis/deschis textul ca să se citească. Alege culori mai diferite pentru control total.');
    else add('bad', `Contrast slab (${cr.toFixed(1)}:1)`, 'Textul nu se citește pe telefon. Minimum 4,5:1.');
    const ca = C.contrast(th.accent, th.onAccent);
    if (ca < 3) add('warn', 'Butonul se citește greu', 'Culoarea de accent e prea apropiată de text. Alege un accent mai saturat.');

    // Imagini
    if (assets.photo) {
      const pw = assets.photo.naturalWidth || assets.photo.width;
      const ph = assets.photo.naturalHeight || assets.photo.height;
      if (Math.max(pw, ph) < 1080) add('warn', `Fotografie mică (${pw}×${ph})`, 'Sub 1080 px iese neclară. Folosește originalul, nu o captură.');
      else add('ok', 'Fotografie la rezoluție bună', `${pw}×${ph} px.`);
    }
    if (!assets.logo && !(t.brand || '').trim()) add('warn', 'Fără logo sau nume', 'Postarea circulă și fără pagina ta. Lasă un semn de recunoaștere.');

    // Naturalețe text
    const all = [t.eyebrow, t.headline, t.subtitle, t.offer, t.detail, t.cta, st.caption].join(' \n ');
    const low = all.toLocaleLowerCase('ro-RO');
    const hits = CLICHES.filter((c) => low.includes(c));
    if (hits.length) add('warn', 'Formulări generice', `„${hits.slice(0, 3).join('”, „')}” sună a text de umplutură. Înlocuiește cu ceva concret: produs, preț, oraș, oră.`);
    if (/[—–]/.test(all)) add('warn', 'Linie lungă (—)', 'E asociată azi cu textele generate automat. Folosește virgulă, punct sau două puncte.');
    const emo = (all.match(/\p{Extended_Pictographic}/gu) || []).length;
    if (emo > 3) add('warn', `${emo} emoji`, 'Mai mult de 2–3 emoji par spam. Păstrează-le doar pe cele care spun ceva.');
    if (/!{2,}/.test(all)) add('warn', 'Semne de exclamare multiple', 'Un singur „!” e suficient. Mai multe par disperare.');
    const tw = words(t.headline);
    if (tw.length >= 4 && tw.filter((w) => /^\p{Lu}/u.test(w)).length >= tw.length - 1 && !/^[\p{Lu}\d\W]+$/u.test(E.plain(t.headline)))
      add('warn', 'Fiecare Cuvânt Cu Majusculă', 'În română doar primul cuvânt și numele proprii primesc majusculă.');
    if (/[şţŞŢ]/.test(all)) add('tip', 'Diacritice cu sedilă (ş, ţ)', 'Le-am corectat automat în ș și ț (cu virgulă), forma corectă în română.');
    if (NO_DIACRITICS.test(all)) add('warn', 'Text fără diacritice', 'Fără ș, ț, ă, î, â textul pare scris în grabă. Adaugă-le.');
    if (!hits.length && !/[—–]/.test(all) && emo <= 3) add('ok', 'Text natural', 'Nicio formulă tip șablon detectată.');

    // Formate
    const ids = formats.map((f) => f.id);
    if (!ids.includes('feed45') && !ids.includes('feed34')) add('tip', 'Adaugă formatul 4:5', 'Ocupă cu 25% mai mult ecran în feed decât pătratul.');
    if (ids.includes('story')) add('ok', 'Story în zona sigură', 'Textul evită zonele acoperite de interfață, sus și jos.');

    const pen = { bad: 18, warn: 8, tip: 2, ok: 0 };
    const score = Math.max(0, Math.min(100, 100 - out.reduce((s, i) => s + pen[i.level], 0)));
    const order = { bad: 0, warn: 1, tip: 2, ok: 3 };
    out.sort((a, b) => order[a.level] - order[b.level]);
    return { score, items: out };
  };

  // ---------- descriere (caption) ----------
  const ascii = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[șş]/g, 's').replace(/[țţ]/g, 't');
  A.hashtags = function (st) {
    const kw = String(st.keywords || '').split(/[,#\n]/).map((k) => ascii(k.trim().toLowerCase()).replace(/[^a-z0-9]/g, '')).filter(Boolean);
    const brand = ascii(String(st.text.brand || '').toLowerCase()).replace(/[^a-z0-9]/g, '');
    const tags = [...new Set([brand, ...kw].filter((x) => x.length > 2))].slice(0, 5);
    return tags.map((x) => '#' + x).join(' ');
  };
  const end = (s) => (s && !/[.!?…:]$/.test(s) ? s + '.' : s);

  A.caption = function (st, kind) {
    const t = st.text;
    const head = E.plain(t.headline), sub = E.plain(t.subtitle), offer = E.plain(t.offer), det = E.plain(t.detail);
    const cta = E.plain(t.cta), contact = E.plain(t.contact);
    const offerLine = offer ? end(offer + (det ? ' ' + det : '')) : '';
    const ctaLine = cta ? (contact ? `${cta}: ${contact}` : end(cta)) : contact;
    const tags = A.hashtags(st);
    let parts;
    if (kind === 'oferta' && offerLine) parts = [offerLine, end(head), sub, ctaLine];
    else if (kind === 'lista') {
      const bullets = sub.split(/(?<=[.!?])\s+/).filter(Boolean).map((x) => '· ' + x.replace(/[.]$/, ''));
      parts = [end(head), bullets.join('\n'), offerLine, ctaLine];
    } else parts = [end(head), sub, offerLine, ctaLine];
    return [...parts.filter(Boolean), tags].filter(Boolean).join('\n\n');
  };
})(window.A = window.A || {});
