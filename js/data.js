/* Atelier – date: formate, fonturi, palete, texte de pornire */
(function (A) {
  'use strict';

  // Dimensiuni recomandate de platforme. `safe` = fracțiuni din lățime/înălțime acoperite de interfața aplicației.
  A.FORMATS = [
    { id: 'feed45', name: 'Feed 4:5', w: 1080, h: 1350, where: 'Instagram · Facebook · LinkedIn',
      tip: 'Ocupă cel mai mult ecran în feed. Formatul principal pentru postări.' },
    { id: 'feed34', name: 'Feed 3:4', w: 1080, h: 1440, where: 'Instagram',
      tip: 'Același raport ca grila profilului, deci nu se taie nimic în grilă.' },
    { id: 'square', name: 'Pătrat 1:1', w: 1080, h: 1080, where: 'Instagram · Facebook · LinkedIn',
      tip: 'Merge oriunde, dar ocupă mai puțin ecran decât 4:5.' },
    { id: 'story', name: 'Story / Reels 9:16', w: 1080, h: 1920, where: 'Instagram · Facebook · TikTok',
      safe: { t: 0.13, b: 0.16 }, tip: 'Sus și jos e interfața aplicației. Textul rămâne în zona sigură.' },
    { id: 'link', name: 'Orizontal 1.91:1', w: 1200, h: 630, where: 'Facebook · LinkedIn',
      tip: 'Pentru postări cu link și pentru evenimente.' },
    { id: 'x169', name: 'Orizontal 16:9', w: 1600, h: 900, where: 'X · LinkedIn · Facebook',
      tip: 'Se afișează întreg în feed pe desktop și pe telefon.' },
    { id: 'yt', name: 'Thumbnail YouTube', w: 1280, h: 720, where: 'YouTube',
      tip: 'Colțul din dreapta-jos e acoperit de durata clipului.' },
    { id: 'pin', name: 'Pin 2:3', w: 1000, h: 1500, where: 'Pinterest',
      tip: 'Formatul vertical standard pentru Pinterest.' },
    { id: 'gbp', name: 'Google 4:3', w: 1200, h: 900, where: 'Profil de companie Google',
      tip: 'Pentru actualizări și oferte în profilul de pe Google.' },
    { id: 'fbcover', name: 'Copertă pagină', w: 1640, h: 624, where: 'Facebook',
      safe: { l: 0.17, r: 0.17 }, tip: 'Pe telefon se taie lateralele. Totul important stă în centru.' }
  ];
  A.DEFAULT_FORMATS = ['feed45', 'story', 'square', 'link'];

  // Perechi de fonturi: titlu + text. `it` = fontul pentru cuvântul evidențiat în stilul „Italic”.
  const IS = { family: 'Instrument Serif', style: 'italic', weight: 400, fallback: 'serif' };
  A.FONTS = [
    { id: 'bricolage', name: 'Modern', head: { family: 'Bricolage Grotesque', weight: 800, lh: 0.95, track: -0.03 },
      body: { family: 'Figtree' }, it: { ...IS, scale: 1.14 } },
    { id: 'instrument', name: 'Editorial', head: { family: 'Instrument Serif', weight: 400, lh: 0.98, track: -0.015, fallback: 'serif' },
      body: { family: 'Instrument Sans' }, it: { ...IS, scale: 1 } },
    { id: 'anton', name: 'Impact', head: { family: 'Anton', weight: 400, lh: 1.02, track: 0, upper: true },
      body: { family: 'Archivo' }, it: { family: 'Fraunces', style: 'italic', weight: 800, scale: 0.92, fallback: 'serif' } },
    { id: 'syne', name: 'Creativ', head: { family: 'Syne', weight: 800, lh: 1.0, track: -0.025 },
      body: { family: 'Manrope' }, it: { ...IS, scale: 1.16 } },
    { id: 'playfair', name: 'Elegant', head: { family: 'Playfair Display', weight: 600, lh: 1.04, track: -0.015, fallback: 'serif' },
      body: { family: 'Jost' }, it: { family: 'Playfair Display', style: 'italic', weight: 500, scale: 1, fallback: 'serif' } },
    { id: 'unbounded', name: 'Tech', head: { family: 'Unbounded', weight: 700, lh: 1.06, track: -0.035 },
      body: { family: 'Onest' }, it: { ...IS, scale: 1.22 } },
    { id: 'dmserif', name: 'Clasic', head: { family: 'DM Serif Display', weight: 400, lh: 1.02, track: -0.01, fallback: 'serif' },
      body: { family: 'DM Sans' }, it: { family: 'DM Serif Display', style: 'italic', weight: 400, scale: 1, fallback: 'serif' } },
    { id: 'bebas', name: 'Sport', head: { family: 'Bebas Neue', weight: 400, lh: 0.92, track: 0.01, upper: true },
      body: { family: 'Barlow' }, it: { ...IS, scale: 0.98 } },
    { id: 'fraunces', name: 'Cald', head: { family: 'Fraunces', weight: 700, lh: 1.0, track: -0.025, fallback: 'serif' },
      body: { family: 'Outfit' }, it: { family: 'Fraunces', style: 'italic', weight: 500, scale: 1, fallback: 'serif' } },
    { id: 'archivo', name: 'Poster', head: { family: 'Archivo Black', weight: 400, lh: 0.98, track: -0.03 },
      body: { family: 'Archivo' }, it: { ...IS, scale: 1.18 } },
    { id: 'shrikhand', name: 'Retro', head: { family: 'Shrikhand', weight: 400, lh: 1.08, track: -0.01 },
      body: { family: 'Rubik' }, it: { family: 'Shrikhand', weight: 400, scale: 1 } },
    { id: 'gloock', name: 'Galerie', head: { family: 'Gloock', weight: 400, lh: 1.02, track: -0.02, fallback: 'serif' },
      body: { family: 'Hanken Grotesk' }, it: { ...IS, scale: 1.08 } },
    { id: 'abril', name: 'Revistă', head: { family: 'Abril Fatface', weight: 400, lh: 1.02, track: -0.01, fallback: 'serif' },
      body: { family: 'Work Sans' }, it: { family: 'Playfair Display', style: 'italic', weight: 600, scale: 1.04, fallback: 'serif' } },
    { id: 'sora', name: 'Digital', head: { family: 'Sora', weight: 800, lh: 1.02, track: -0.035 },
      body: { family: 'IBM Plex Mono' }, it: { ...IS, scale: 1.18 } },
    { id: 'oswald', name: 'Condensat', head: { family: 'Oswald', weight: 700, lh: 1.0, track: -0.005, upper: true },
      body: { family: 'Source Sans 3' }, it: { family: 'Fraunces', style: 'italic', weight: 700, scale: 0.92, fallback: 'serif' } },
    { id: 'caveat', name: 'De mână', head: { family: 'Caveat', weight: 700, lh: 0.98, track: -0.01, fallback: 'cursive' },
      body: { family: 'Nunito' }, it: { family: 'Caveat', weight: 700, scale: 1.05, fallback: 'cursive' } }
  ];

  A.FONT_CSS = 'https://fonts.googleapis.com/css2?family=Anton&family=Archivo+Black&family=Archivo:wght@400;500;600;700' +
    '&family=Barlow:wght@400;500;600;700&family=Bebas+Neue&family=Bricolage+Grotesque:opsz,wght@12..96,400..800' +
    '&family=DM+Sans:wght@400..700&family=DM+Serif+Display:ital@0;1&family=Figtree:wght@400..800' +
    '&family=Fraunces:ital,opsz,wght@0,9..144,400..800;1,9..144,400..800&family=Instrument+Sans:wght@400..700' +
    '&family=Instrument+Serif:ital@0;1&family=Jost:wght@400..700&family=Manrope:wght@400..800&family=Onest:wght@400..700' +
    '&family=Outfit:wght@400..700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Syne:wght@400..800' +
    '&family=Unbounded:wght@400..800&family=Shrikhand&family=Rubik:wght@400..700&family=Gloock' +
    '&family=Hanken+Grotesk:wght@400..700&family=Abril+Fatface&family=Work+Sans:wght@400..700&family=Sora:wght@400..800' +
    '&family=IBM+Plex+Mono:wght@400;500;600;700&family=Oswald:wght@400..700&family=Source+Sans+3:wght@400..700' +
    '&family=Caveat:wght@400..700&family=Nunito:wght@400..800&display=swap';

  // Palete: fundal, suprafață (zone secundare), text, accent.
  A.PALETTES = [
    { name: 'Cobalt', bg: '#E8EBF7', surface: '#C8D0F2', text: '#0D1642', accent: '#2C46F0' },
    { name: 'Cireașă', bg: '#F9E8E4', surface: '#F1C7BD', text: '#3B0B12', accent: '#C3132F' },
    { name: 'Salvie', bg: '#E3E7D8', surface: '#C5CFAF', text: '#1C2416', accent: '#B9741A' },
    { name: 'Unt', bg: '#FFF0B3', surface: '#FFE07A', text: '#1A1813', accent: '#3047D6' },
    { name: 'Ciocolată', bg: '#3A2119', surface: '#563226', text: '#FBE5DC', accent: '#F4A3B6' },
    { name: 'Petrol', bg: '#0F3C44', surface: '#165663', text: '#E9F3EF', accent: '#FFB257' },
    { name: 'Lavandă', bg: '#ECE6FA', surface: '#D5C9F4', text: '#1D1140', accent: '#FF5F38' },
    { name: 'Grafit', bg: '#1E1F22', surface: '#2E2F34', text: '#F1EFEA', accent: '#FF6A2B' },
    { name: 'Mentă', bg: '#DCF2E8', surface: '#B3E3CE', text: '#0A2C21', accent: '#E2457B' },
    { name: 'Poster', bg: '#E7372A', surface: '#C42A1F', text: '#FFF5EA', accent: '#1B120E' },
    { name: 'Marker', bg: '#F2F1ED', surface: '#E1DFD8', text: '#141414', accent: '#FFD23F' },
    { name: 'Bleumarin', bg: '#14213D', surface: '#1F3057', text: '#F2ECDD', accent: '#E0B566' },
    { name: 'Piersică', bg: '#FFE3D3', surface: '#FFC6A6', text: '#3A1A0E', accent: '#2E6B4F' },
    { name: 'Olivă', bg: '#3D4127', surface: '#545A36', text: '#F1EEDC', accent: '#E8C35A' },
    { name: 'Bordo', bg: '#4A0E1C', surface: '#651A2B', text: '#F8E7DF', accent: '#F3B6A0' },
    { name: 'Smarald', bg: '#0D4D3B', surface: '#136650', text: '#EAF5EE', accent: '#F2C14E' },
    { name: 'Cer', bg: '#DDEBFA', surface: '#B9D5F4', text: '#0A2340', accent: '#F25C2A' },
    { name: 'Zmeură', bg: '#FCE4EC', surface: '#F8BBD0', text: '#3D0A1F', accent: '#D81B60' },
    { name: 'Nisip', bg: '#EFE6D8', surface: '#DCCBB0', text: '#2B2117', accent: '#1F5A4C' },
    { name: 'Neon', bg: '#111111', surface: '#232323', text: '#F4F4F4', accent: '#FF2E88' },
    { name: 'Caramel', bg: '#F6E7D2', surface: '#EBCB9F', text: '#3B2410', accent: '#C2410C' },
    { name: 'Glacial', bg: '#EEF4F5', surface: '#D3E5E8', text: '#102A30', accent: '#0F8F9B' },
    { name: 'Prună', bg: '#2B1638', surface: '#40214F', text: '#F3E9F7', accent: '#FFB4A2' },
    { name: 'Lime', bg: '#F3F7E1', surface: '#DDE9A8', text: '#1C2209', accent: '#5B21B6' },
    { name: 'Cupru', bg: '#1A1512', surface: '#2A221D', text: '#F2E6DA', accent: '#D9824A' },
    { name: 'Coral', bg: '#FFE8E1', surface: '#FFC9B9', text: '#3A1208', accent: '#0E7490' },
    { name: 'Fildeș', bg: '#F7F3EA', surface: '#E9E2D0', text: '#0F0F0F', accent: '#A8812A' },
    { name: 'Klein', bg: '#1F3BB3', surface: '#2B48C9', text: '#F5F3EE', accent: '#FFD43B' },
    { name: 'Rozmarin', bg: '#E5EBE6', surface: '#C9D6CC', text: '#13241A', accent: '#B4446C' },
    { name: 'Cărămidă', bg: '#8C2F1B', surface: '#A23A22', text: '#FCEBDD', accent: '#F6C177' }
  ];

  A.CTA_IDEAS = ['Comandă acum', 'Rezervă o masă', 'Programează-te', 'Vezi colecția', 'Sună acum', 'Scrie-ne', 'Află mai multe', 'Înscrie-te'];
  A.OFFER_IDEAS = ['-20%', '-30%', '-50%', '2+1 gratis', 'Livrare gratuită', 'Nou'];

  A.SAMPLE = {
    brand: 'Boabe & Co.',
    eyebrow: 'Meniul de toamnă',
    headline: 'Cafeaua ta de dimineață, *acum la pachet*',
    subtitle: 'Prăjim boabele săptămânal, aici în Cluj. Vino cu cana ta și primești un croissant cald din partea casei.',
    offer: '-25%',
    detail: 'la băuturi calde, până duminică',
    cta: 'Vezi meniul',
    contact: 'boabe.ro · @boabe.co'
  };
})(window.A = window.A || {});
