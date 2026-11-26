// Générateur des schémas vectoriels SVT 3AS — « zéro texte IA ».
//
//   node scripts/generer-schemas-svt.mjs            # écrit public/lecons/img/*.svg
//   node scripts/generer-schemas-svt.mjs --verifier  # n'écrit rien, compare au disque
//
// Règles tenues par ce script :
//  1. **Aucun texte arabe dans le SVG.** Les termes officiels sont rendus par l'application
//     (`src/components/SchemaAnnote.tsx`) : le visuel ne peut donc pas « halluciner » un mot.
//  2. Seul le texte EXACT est dessiné : graduations numériques, unités, formules chimiques,
//     symboles et abréviations officielles (ADN, ARNm, ATP, pH, Vmax, Km, AUG, 5′, 3′, α, β,
//     S—S, SH). Aucune phrase, aucun titre, aucune légende : tout cela vient du registre.
//  3. Les courbes sont calculées à partir de données réelles (Henderson–Hasselbalch,
//     Michaelis–Menten, modèles de pH et de température explicités), jamais approchées à l'œil.
//  4. Les repères numérotés ne sont pas dessinés ici : le script enregistre leurs coordonnées
//     en pourcentage (`plans/_travail-images/reperes.json`) et le registre TypeScript les
//     porte, avec les libellés arabes.
//
// Toute modification d'un schéma se fait dans ce script, puis on relit la planche de contrôle
// (`scripts/previsualiser-schemas.py`) avant de toucher au registre.

import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SORTIE = join(RACINE, 'public/lecons/img');
const TRACE = join(RACINE, 'plans/_travail-images');
const VERIFIER = process.argv.includes('--verifier');

// ───────────────────────────── palette et typographie ─────────────────────────────

const INK = '#1f2d27';
const MUTE = '#5f6f66';
const GRID = '#d7dfd9';
const GREEN = '#1f6f52';
const GREEN_FILL = '#e8f2ec';
const BLUE = '#1d4f8f';
const BLUE_FILL = '#e9eff8';
const RED = '#a5312b';
const RED_FILL = '#fbeceb';
const AMBER = '#a97517';
const AMBER_FILL = '#fbf1dd';
const PAPER = '#ffffff';
const FONT = "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Arial, sans-serif";

const P = (n) => Number(n.toFixed(1));

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function texte(x, y, contenu, o = {}) {
  const {
    taille = 16, couleur = INK, ancre = 'start', gras = false, italique = false,
    rotation = null, halo = false,
  } = o;
  const t = rotation === null ? '' : ` transform="rotate(${rotation} ${x} ${y})"`;
  const h = halo ? ` stroke="${PAPER}" stroke-width="5" paint-order="stroke" stroke-linejoin="round"` : '';
  return `<text x="${P(x)}" y="${P(y)}" font-family="${FONT}" font-size="${taille}" fill="${couleur}"` +
    ` text-anchor="${ancre}"${gras ? ' font-weight="700"' : ''}` +
    `${italique ? ' font-style="italic"' : ''}${h}${t}>${esc(contenu)}</text>`;
}

function fleche(x1, y1, x2, y2, couleur = INK, largeur = 3, tete = 11) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const a = angle + Math.PI - 0.42;
  const b = angle + Math.PI + 0.42;
  return `<g stroke="${couleur}" stroke-width="${largeur}" fill="none" stroke-linecap="round">` +
    `<line x1="${P(x1)}" y1="${P(y1)}" x2="${P(x2)}" y2="${P(y2)}"/>` +
    `<path d="M${P(x2 + tete * Math.cos(a))} ${P(y2 + tete * Math.sin(a))} L${P(x2)} ${P(y2)} ` +
    `L${P(x2 + tete * Math.cos(b))} ${P(y2 + tete * Math.sin(b))}" stroke-width="${largeur}"/></g>`;
}

const ligne = (x1, y1, x2, y2, o = {}) => {
  const { couleur = INK, largeur = 2, pointilles = null, opacite = 1 } = o;
  return `<line x1="${P(x1)}" y1="${P(y1)}" x2="${P(x2)}" y2="${P(y2)}" stroke="${couleur}"` +
    ` stroke-width="${largeur}"${pointilles ? ` stroke-dasharray="${pointilles}"` : ''}` +
    `${opacite !== 1 ? ` opacity="${opacite}"` : ''} stroke-linecap="round"/>`;
};

const poly = (points, o = {}) => {
  const { couleur = INK, largeur = 2, remplissage = 'none', pointilles = null } = o;
  const d = points.map(([x, y], i) => `${i ? 'L' : 'M'}${P(x)} ${P(y)}`).join(' ');
  return `<path d="${d}" fill="${remplissage}" stroke="${couleur}" stroke-width="${largeur}"` +
    `${pointilles ? ` stroke-dasharray="${pointilles}"` : ''} stroke-linejoin="round" stroke-linecap="round"/>`;
};

const rond = (cx, cy, r, o = {}) => {
  const { remplissage = PAPER, couleur = INK, largeur = 2 } = o;
  return `<circle cx="${P(cx)}" cy="${P(cy)}" r="${P(r)}" fill="${remplissage}" stroke="${couleur}" stroke-width="${largeur}"/>`;
};

const boite = (x, y, l, h, o = {}) => {
  const { remplissage = PAPER, couleur = INK, largeur = 2, rayon = 10, pointilles = null } = o;
  return `<rect x="${P(x)}" y="${P(y)}" width="${P(l)}" height="${P(h)}" rx="${rayon}"` +
    ` fill="${remplissage}" stroke="${couleur}" stroke-width="${largeur}"` +
    `${pointilles ? ` stroke-dasharray="${pointilles}"` : ''}/>`;
};

const ellipse = (cx, cy, rx, ry, o = {}) => {
  const { remplissage = PAPER, couleur = INK, largeur = 2 } = o;
  return `<ellipse cx="${P(cx)}" cy="${P(cy)}" rx="${P(rx)}" ry="${P(ry)}" fill="${remplissage}"` +
    ` stroke="${couleur}" stroke-width="${largeur}"/>`;
};

/** Contour organique fermé : `rayon(angle)` décrit la forme, sans arc SVG à approximer. */
const organique = (cx, cy, rayon, o = {}) => {
  const { couleur = INK, largeur = 4, remplissage = 'none', n = 96 } = o;
  const pts = [];
  for (let i = 0; i <= n; i += 1) {
    const a = (i / n) * Math.PI * 2;
    const r = rayon(a);
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.86]);
  }
  return poly(pts, { couleur, largeur, remplissage });
};

// ───────────────────────────── planches ─────────────────────────────

const PLANCHES = [];

/** Déclare une planche : dimensions, dessin, et repères en pixels (convertis en %). */
function planche(slug, largeur, hauteur, dessiner) {
  const reperes = [];
  const repere = (num, x, y) => { reperes.push({ num, x, y }); };
  const corps = dessiner({ repere, largeur, hauteur });
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${largeur}" height="${hauteur}"` +
      ` viewBox="0 0 ${largeur} ${hauteur}" data-schema="${slug}">`,
    `<rect width="${largeur}" height="${hauteur}" fill="${PAPER}"/>`,
    ...corps,
    '</svg>',
    '',
  ].join('\n');
  PLANCHES.push({
    slug, largeur, hauteur, svg,
    reperes: reperes.map((r) => ({ num: r.num, x: P((r.x / largeur) * 100), y: P((r.y / hauteur) * 100) })),
  });
}

// ── 1. u1 — du gène à la protéine (schéma d'ensemble, sens arabe : droite → gauche) ──
planche('u1-flux-information', 1200, 760, ({ repere }) => {
  const out = [];
  out.push(boite(40, 40, 1120, 680, { remplissage: '#fcfdfb', couleur: INK, largeur: 3, rayon: 64 }));
  out.push(ellipse(846, 320, 248, 208, { remplissage: GREEN_FILL, couleur: INK, largeur: 2.5 }));

  // ADN : deux brins antiparallèles + barreaux
  const dnaY = 196;
  const brin = (decalage) => {
    const pts = [];
    for (let x = 716; x <= 976; x += 4) pts.push([x, dnaY + decalage + Math.sin((x - 716) / 26) * 12]);
    return poly(pts, { couleur: INK, largeur: 3 });
  };
  out.push(brin(-7), brin(7));
  for (let x = 726; x <= 966; x += 20) {
    const dy = Math.sin((x - 716) / 26) * 12;
    out.push(ligne(x, dnaY - 7 + dy, x, dnaY + 7 + dy, { couleur: MUTE, largeur: 2 }));
  }
  out.push(ellipse(900, 196, 44, 40, { remplissage: AMBER_FILL, couleur: AMBER, largeur: 2.5 }));

  // ARNm : synthèse puis export par le pore nucléaire
  out.push(poly([[896, 236], [846, 280], [780, 300], [700, 310], [618, 322], [470, 330]], {
    couleur: GREEN, largeur: 6,
  }));
  out.push(ligne(586, 296, 586, 352, { couleur: PAPER, largeur: 8 }));
  out.push(ligne(586, 296, 620, 296, { couleur: INK, largeur: 2.5 }));
  out.push(ligne(586, 352, 620, 352, { couleur: INK, largeur: 2.5 }));

  // Deux ribosomes sur le même ARNm (polyribosome)
  const ribosome = (cx, facteur) => [
    ellipse(cx, 302, 62 * facteur, 42 * facteur, { remplissage: '#dce9e0', couleur: INK, largeur: 2.5 }),
    ellipse(cx, 350, 74 * facteur, 23 * facteur, { remplissage: '#c9dccf', couleur: INK, largeur: 2.5 }),
    ligne(cx + 62 * facteur, 330, cx - 62 * facteur, 330, { couleur: GREEN, largeur: 6 }),
  ];
  out.push(ligne(470, 330, 210, 330, { couleur: GREEN, largeur: 6 }));
  out.push(...ribosome(310, 1));
  out.push(...ribosome(470, 0.86));

  // Chaînes polypeptidiques naissantes
  for (const [x0, n] of [[310, 6], [470, 3]]) {
    const pts = [[x0, 256]];
    for (let i = 1; i <= n; i += 1) pts.push([x0 + (i % 2 ? -16 : 4), 256 - i * 22]);
    out.push(poly(pts, { couleur: RED, largeur: 3 }));
    for (const [i, [x, y]] of pts.entries()) {
      out.push(rond(x, y, 7.5, { remplissage: i === 0 ? RED_FILL : PAPER, couleur: RED, largeur: 2.5 }));
    }
  }

  // Sens de lecture de l'ARNm
  out.push(`<path d="M560 312 l-15 9 l15 9" fill="none" stroke="${GREEN}" stroke-width="3" stroke-linecap="round"/>`);
  out.push(texte(540, 300, "5'", { taille: 14, couleur: GREEN, ancre: 'end', gras: true, halo: true }));

  repere(1, 790, 196);
  repere(2, 900, 196);
  repere(3, 700, 310);
  repere(4, 603, 324);
  repere(5, 275, 302);
  repere(6, 300, 176);
  repere(7, 392, 392);
  repere(8, 846, 470);
  repere(9, 120, 640);
  return out;
});

// ── 2. u1 — code génétique, ARNt et activation ────────────────────────────────────
planche('u1-code-genetique', 1200, 790, ({ repere }) => {
  const out = [];
  out.push(boite(40, 40, 1120, 470, { remplissage: '#fdfefd', couleur: GRID, largeur: 2, rayon: 22 }));

  out.push(boite(90, 404, 1020, 58, { remplissage: GREEN_FILL, couleur: GREEN, largeur: 2.5, rayon: 12 }));
  const codons = [
    { x: 150, t: 'AUG' }, { x: 300, t: 'GCU' }, { x: 450, t: 'UUC' },
    { x: 600, t: 'AAA' }, { x: 750, t: 'GGU' }, { x: 900, t: 'UAA', stop: true },
  ];
  for (const c of codons) {
    out.push(boite(c.x, 414, 90, 38, {
      remplissage: c.stop ? RED_FILL : PAPER, couleur: c.stop ? RED : GREEN, largeur: 2, rayon: 6,
    }));
    out.push(texte(c.x + 45, 440, c.t, { taille: 19, couleur: c.stop ? RED : INK, ancre: 'middle', gras: true }));
  }
  out.push(texte(1055, 440, "3'", { taille: 16, couleur: GREEN, ancre: 'middle', gras: true }));
  out.push(texte(76, 440, "5'", { taille: 16, couleur: GREEN, ancre: 'middle', gras: true }));

  // ARNt : feuille de trèfle simplifiée
  const arnt = (cx, codonCx, acide, anti) => {
    const base = 386;
    const s = [];
    s.push(`<path d="M${cx - 26} ${base - 34} q0 34 26 34 q26 0 26 -34" fill="${BLUE_FILL}" stroke="${BLUE}" stroke-width="2.5"/>`);
    s.push(poly([[cx - 8, base - 34], [cx - 8, 300], [cx + 8, 300], [cx + 8, base - 34]], {
      couleur: BLUE, largeur: 2.5, remplissage: BLUE_FILL,
    }));
    s.push(ellipse(cx - 30, 320, 15, 12, { remplissage: BLUE_FILL, couleur: BLUE, largeur: 2.5 }));
    s.push(ellipse(cx + 30, 320, 15, 12, { remplissage: BLUE_FILL, couleur: BLUE, largeur: 2.5 }));
    s.push(ellipse(cx, 294, 26, 10, { remplissage: BLUE_FILL, couleur: BLUE, largeur: 2.5 }));
    s.push(texte(codonCx, base - 8, anti, { taille: 14, couleur: BLUE, ancre: 'middle', gras: true, halo: true }));
    s.push(rond(cx, 266, 17, { remplissage: AMBER_FILL, couleur: AMBER, largeur: 2.5 }));
    s.push(texte(cx, 272, acide, { taille: 12, couleur: AMBER, ancre: 'middle', gras: true }));
    s.push(ligne(cx, 283, cx, 288, { couleur: AMBER, largeur: 3 }));
    return s;
  };
  out.push(...arnt(195, 195, 'Met', 'UAC'));
  out.push(...arnt(495, 495, 'Phe', 'AAG'));

  // Activation : aa + ATP --(enzyme)--> aa-ARNt, puis AMP + PPi
  out.push(boite(620, 90, 490, 180, { remplissage: PAPER, couleur: GRID, largeur: 2, rayon: 18 }));
  out.push(rond(1050, 150, 20, { remplissage: AMBER_FILL, couleur: AMBER, largeur: 2.5 }));
  out.push(texte(1050, 156, 'aa', { taille: 14, couleur: AMBER, ancre: 'middle', gras: true }));
  out.push(texte(1010, 156, '+', { taille: 24, couleur: INK, ancre: 'middle' }));
  out.push(boite(928, 128, 62, 44, { remplissage: GREEN_FILL, couleur: GREEN, largeur: 2, rayon: 8 }));
  out.push(texte(959, 156, 'ATP', { taille: 14, couleur: GREEN, ancre: 'middle', gras: true }));
  out.push(fleche(912, 150, 838, 150, INK, 3));
  out.push(ellipse(876, 178, 24, 14, { remplissage: AMBER_FILL, couleur: AMBER, largeur: 2 }));
  out.push(boite(716, 126, 116, 48, { remplissage: BLUE_FILL, couleur: BLUE, largeur: 2, rayon: 8 }));
  out.push(texte(774, 156, 'aa-ARNt', { taille: 14, couleur: BLUE, ancre: 'middle', gras: true }));
  out.push(fleche(774, 178, 774, 216, MUTE, 2));
  out.push(texte(774, 244, 'AMP + PPi', { taille: 15, couleur: MUTE, ancre: 'middle' }));

  // Raisonnement combinatoire (sens arabe : de droite à gauche)
  out.push(boite(40, 540, 1120, 210, { remplissage: AMBER_FILL, couleur: AMBER, largeur: 2, rayon: 18 }));
  const cellules = [
    { x: 900, grand: '4', petit: 'bases', detail: 'A  U  G  C' },
    { x: 650, grand: '4³', petit: '= 64', detail: 'codons' },
    { x: 390, grand: '20', petit: 'acides aminés', detail: 'redondance' },
    { x: 120, grand: '3', petit: 'codons stop', detail: 'UAA  UAG  UGA' },
  ];
  for (const c of cellules) {
    out.push(boite(c.x, 578, 200, 128, { remplissage: PAPER, couleur: AMBER, largeur: 2, rayon: 14 }));
    out.push(texte(c.x + 100, 640, c.grand, { taille: 40, couleur: INK, ancre: 'middle', gras: true }));
    out.push(texte(c.x + 100, 668, c.petit, { taille: 14, couleur: MUTE, ancre: 'middle' }));
    out.push(texte(c.x + 100, 692, c.detail, { taille: 12, couleur: MUTE, ancre: 'middle' }));
  }
  for (const x of [884, 634, 374]) out.push(fleche(x, 642, x - 32, 642, AMBER, 3, 9));

  repere(1, 195, 486);
  repere(2, 156, 390);
  repere(3, 242, 302);
  repere(4, 152, 248);
  repere(5, 950, 578);
  repere(6, 170, 578);
  repere(7, 876, 178);
  return out;
});

// ── 3. u2 — les quatre niveaux de structure ──────────────────────────────────────
planche('u2-niveaux-structure', 1200, 880, ({ repere }) => {
  const out = [];
  const cadre = (x, y, w, h) => boite(x, y, w, h, { remplissage: '#fdfefd', couleur: GRID, largeur: 2, rayon: 20 });

  // 1 — structure primaire (haut droit), lecture droite → gauche
  out.push(cadre(620, 40, 540, 370));
  const aa = ['Gly', 'Ala', 'Ser', 'Val', 'Cys', 'Leu'];
  let prec = null;
  aa.forEach((nom, i) => {
    const x = 1060 - i * 78;
    const y = 210 + (i % 2 === 0 ? -24 : 24);
    if (prec) out.push(ligne(prec[0], prec[1], x, y, { couleur: INK, largeur: 3 }));
    out.push(rond(x, y, 21, { remplissage: GREEN_FILL, couleur: GREEN, largeur: 2.5 }));
    out.push(texte(x, y + 5, nom, { taille: 12, couleur: GREEN, ancre: 'middle', gras: true }));
    prec = [x, y];
  });

  // 2 — structure secondaire (haut gauche)
  out.push(cadre(40, 40, 540, 370));
  const helice = [];
  for (let t = 0; t <= 1.0001; t += 0.015) helice.push([150 + t * 150, 220 + Math.sin(t * Math.PI * 5.2) * 50]);
  out.push(poly(helice, { couleur: BLUE, largeur: 4 }));
  out.push(texte(225, 320, 'α', { taille: 24, couleur: BLUE, ancre: 'middle', gras: true }));
  for (let i = 0; i < 4; i += 1) {
    const y = 150 + i * 42;
    out.push(`<path d="M380 ${y} L530 ${y} L514 ${y - 9} M530 ${y} L514 ${y + 9}"` +
      ` fill="none" stroke="${AMBER}" stroke-width="4" stroke-linecap="round"/>`);
  }
  out.push(texte(455, 320, 'β', { taille: 24, couleur: AMBER, ancre: 'middle', gras: true }));

  // 3 — structure tertiaire (bas droit)
  out.push(cadre(620, 450, 540, 390));
  const centre = { x: 890, y: 648 };
  out.push(organique(centre.x, centre.y, (a) => 98 + 12 * Math.sin(a * 3) + 7 * Math.cos(a * 5), {
    couleur: GREEN, largeur: 5,
  }));
  // deux ponts disulfure, à l'intérieur de la chaîne
  out.push(ligne(842, 606, 940, 646, { couleur: RED, largeur: 5 }));
  out.push(texte(896, 598, 'S—S', { taille: 14, couleur: RED, ancre: 'middle', gras: true, halo: true }));
  out.push(ligne(846, 700, 938, 682, { couleur: RED, largeur: 5 }));
  out.push(texte(896, 660, 'S—S', { taille: 14, couleur: RED, ancre: 'middle', gras: true, halo: true }));

  // 4 — structure quaternaire (bas gauche)
  out.push(cadre(40, 450, 540, 390));
  const sousUnites = [
    { cx: 250, cy: 600, c: GREEN, f: GREEN_FILL },
    { cx: 390, cy: 600, c: BLUE, f: BLUE_FILL },
    { cx: 250, cy: 736, c: BLUE, f: BLUE_FILL },
    { cx: 390, cy: 736, c: GREEN, f: GREEN_FILL },
  ];
  for (const s of sousUnites) out.push(ellipse(s.cx, s.cy, 60, 52, { remplissage: s.f, couleur: s.c, largeur: 3 }));

  repere(1, 1060, 150);
  repere(2, 150, 150);
  repere(3, 890, 528);
  repere(4, 250, 600);
  repere(5, 990, 664);
  repere(6, 352, 106);
  repere(7, 320, 668);
  return out;
});

// ── 4. u2 — charge et migration électrophorétique de l'alanine ───────────────────
planche('u2-electrophorese', 1200, 820, ({ repere }) => {
  const out = [];
  const G = { x0: 660, x1: 1120, y0: 120, y1: 610 };
  const zMax = 1.15;
  const px = (pH) => G.x0 + (pH / 14) * (G.x1 - G.x0);
  const py = (z) => G.y0 + ((zMax - z) / (2 * zMax)) * (G.y1 - G.y0);

  for (const z of [-1, 0, 1]) {
    out.push(ligne(G.x0, py(z), G.x1, py(z), { couleur: GRID, largeur: 1.5, pointilles: '5 6' }));
    out.push(texte(G.x0 - 14, py(z) + 5, String(z).replace('-', '−'), { taille: 15, couleur: MUTE, ancre: 'end' }));
  }
  out.push(ligne(G.x0, G.y0 - 16, G.x0, G.y1, { couleur: INK, largeur: 2.5 }));
  out.push(ligne(G.x0, py(0), G.x1 + 14, py(0), { couleur: INK, largeur: 2.5 }));
  for (let pH = 0; pH <= 14; pH += 2) {
    out.push(ligne(px(pH), py(0) - 7, px(pH), py(0) + 7, { couleur: INK, largeur: 2 }));
    out.push(texte(px(pH), G.y1 + 30, String(pH), { taille: 15, couleur: MUTE, ancre: 'middle' }));
  }
  out.push(texte(G.x1 + 20, G.y1 + 30, 'pH', { taille: 17, couleur: INK, gras: true }));
  out.push(texte(G.x0 - 14, G.y0 - 26, 'Z', { taille: 17, couleur: INK, ancre: 'end', gras: true }));
  out.push(texte(G.x1 - 6, py(1) - 12, '+', { taille: 19, couleur: MUTE, ancre: 'end' }));
  out.push(texte(G.x1 - 6, py(-1) + 26, '−', { taille: 19, couleur: MUTE, ancre: 'end' }));

  // Charge nette de l'alanine : pKa(COOH) = 2,34 ; pKa(NH3+) = 9,69 ; pHi = 6,0
  const charge = (pH) => 1 / (1 + 10 ** (pH - 9.69)) - 1 / (1 + 10 ** (2.34 - pH));
  const points = [];
  for (let pH = 0; pH <= 14.0001; pH += 0.1) points.push([px(pH), py(charge(pH))]);
  out.push(poly(points, { couleur: GREEN, largeur: 4 }));

  out.push(ligne(px(6), py(0), px(6), G.y1, { couleur: RED, largeur: 2, pointilles: '7 6' }));
  out.push(texte(px(6), G.y1 + 56, 'pHi = 6', { taille: 16, couleur: RED, ancre: 'middle', gras: true }));
  for (const [pH, etiquette, dx, dy] of [[2, 'pH 2', -44, 6], [6, 'pH 6', 0, -16], [12, 'pH 12', -50, -10]]) {
    out.push(rond(px(pH), py(charge(pH)), 6.5, { remplissage: PAPER, couleur: RED, largeur: 2.5 }));
    out.push(texte(px(pH) + dx, py(charge(pH)) + dy, etiquette, { taille: 14, couleur: RED, ancre: 'middle', gras: true }));
  }

  // Cuve verticale : cathode en haut, anode en bas
  out.push(boite(70, 96, 500, 540, { remplissage: '#f7faf8', couleur: INK, largeur: 2.5, rayon: 20 }));
  out.push(boite(96, 122, 448, 44, { remplissage: PAPER, couleur: GRID, largeur: 2, rayon: 8 }));
  out.push(texte(320, 151, '(−)', { taille: 21, couleur: BLUE, ancre: 'middle', gras: true }));
  out.push(boite(96, 566, 448, 44, { remplissage: PAPER, couleur: GRID, largeur: 2, rayon: 8 }));
  out.push(texte(320, 595, '(+)', { taille: 21, couleur: RED, ancre: 'middle', gras: true }));

  const pistes = [
    { x: 190, pH: 2, cible: 232 },
    { x: 320, pH: 6, cible: 366 },
    { x: 450, pH: 12, cible: 500 },
  ];
  for (const p of pistes) {
    out.push(boite(p.x - 46, 190, 92, 366, { remplissage: PAPER, couleur: GRID, largeur: 2, rayon: 8 }));
    out.push(ligne(p.x - 26, 366, p.x + 26, 366, { couleur: MUTE, largeur: 5, pointilles: '6 5' }));
    const y = p.cible;
    out.push(boite(p.x - 30, y - 12, 60, 24, { remplissage: GREEN_FILL, couleur: GREEN, largeur: 2.5, rayon: 6 }));
    if (Math.abs(y - 366) > 12) {
      out.push(fleche(p.x, 366 + Math.sign(y - 366) * 20, p.x, y - Math.sign(y - 366) * 18, GREEN, 3));
    }
    out.push(texte(p.x, 656, `pH ${p.pH}`, { taille: 15, couleur: MUTE, ancre: 'middle', gras: true }));
  }

  repere(1, px(6), 540);
  repere(2, px(2) + 30, py(charge(2)) - 28);
  repere(3, px(12) + 26, py(charge(12)) + 32);
  repere(4, 105, 430);
  repere(5, 490, 430);
  repere(6, 320, 318);
  return out;
});

// ── 5. u2 — expérience d'Anfinsen ────────────────────────────────────────────────
planche('u2-anfinsen', 1200, 730, ({ repere }) => {
  const out = [];
  const panneau = (x, titre, activite, couleurFond) => {
    const s = [];
    s.push(boite(x, 96, 296, 380, { remplissage: couleurFond, couleur: GRID, largeur: 2, rayon: 22 }));
    s.push(boite(x + 38, 500, 220, 62, { remplissage: PAPER, couleur: INK, largeur: 2, rayon: 12 }));
    s.push(texte(x + 148, 542, activite, { taille: 24, couleur: INK, ancre: 'middle', gras: true }));
    s.push(texte(x + 148, 80, titre, { taille: 14, couleur: MUTE, ancre: 'middle', gras: true }));
    return s;
  };
  const formeN = (cx, cy) => organique(cx, cy, (a) => 72 + 9 * Math.sin(a * 3) + 5 * Math.cos(a * 5), {
    couleur: GREEN, largeur: 5,
  });

  out.push(...panneau(60, 'A', '100 %', GREEN_FILL));
  out.push(formeN(208, 288));
  out.push(ligne(164, 250, 258, 272, { couleur: RED, largeur: 5 }));
  out.push(ligne(158, 330, 252, 314, { couleur: RED, largeur: 5 }));
  out.push(texte(243, 248, 'S—S', { taille: 13, couleur: RED, ancre: 'middle', gras: true, halo: true }));
  out.push(texte(243, 344, 'S—S', { taille: 13, couleur: RED, ancre: 'middle', gras: true, halo: true }));

  out.push(...panneau(434, 'B', '0 %', RED_FILL));
  const pelote = [];
  for (let i = 0; i <= 34; i += 1) {
    const t = i / 34;
    pelote.push([458 + t * 248, 320 + Math.sin(t * Math.PI * 4.2) * 62 * (0.55 + 0.45 * t)]);
  }
  out.push(poly(pelote, { couleur: RED, largeur: 4 }));
  for (const t of [0.08, 0.32, 0.58, 0.84]) {
    const x = 458 + t * 248;
    const y = 320 + Math.sin(t * Math.PI * 4.2) * 62 * (0.55 + 0.45 * t);
    out.push(texte(x + 26, y - 16, 'SH', { taille: 12, couleur: RED, ancre: 'middle', gras: true }));
    out.push(texte(x - 26, y + 26, 'SH', { taille: 12, couleur: RED, ancre: 'middle', gras: true }));
  }

  out.push(...panneau(840, 'C', '100 %', GREEN_FILL));
  out.push(formeN(988, 288));
  out.push(ligne(944, 250, 1038, 272, { couleur: RED, largeur: 5 }));
  out.push(ligne(938, 330, 1032, 314, { couleur: RED, largeur: 5 }));
  out.push(texte(1023, 248, 'S—S', { taille: 13, couleur: RED, ancre: 'middle', gras: true, halo: true }));
  out.push(texte(1023, 344, 'S—S', { taille: 13, couleur: RED, ancre: 'middle', gras: true, halo: true }));

  out.push(fleche(372, 300, 424, 300, INK, 3));
  out.push(texte(398, 246, '+ urea', { taille: 13, couleur: INK, ancre: 'middle', gras: true }));
  out.push(texte(398, 264, '+ β-mercapto', { taille: 13, couleur: INK, ancre: 'middle', gras: true }));
  out.push(texte(398, 354, '8 mol/L', { taille: 12, couleur: MUTE, ancre: 'middle' }));
  out.push(fleche(746, 300, 830, 300, INK, 3));
  out.push(texte(788, 246, '− urea', { taille: 13, couleur: INK, ancre: 'middle', gras: true }));
  out.push(texte(788, 264, '− β-mercapto', { taille: 13, couleur: INK, ancre: 'middle', gras: true }));

  repere(1, 208, 398);
  repere(2, 306, 288);
  repere(3, 398, 322);
  repere(4, 582, 404);
  repere(5, 788, 344);
  repere(6, 1086, 288);
  return out;
});

// ── 5 bis. u2-drepanocytose : remplacé en Phase 2 (Lot B) par u2-drepanocytose.webp (webp_annote) ──

// ── 6. u3 — spécificité : amylase, amidon, cellulose ─────────────────────────────
planche('u3-specificite', 1200, 700, ({ repere }) => {
  const out = [];
  // Encoche en V = site actif, ouverte vers la gauche (sens de lecture arabe)
  const enzyme = (x, y) => poly([
    [x, y], [x + 200, y], [x + 200, y + 180], [x, y + 180],
    [x, y + 128], [x + 74, y + 90], [x, y + 52],
  ], { couleur: GREEN, largeur: 3, remplissage: GREEN_FILL });

  // Rang 1 : amidon souple → entre dans l'encoche → produits
  out.push(enzyme(760, 110));
  const amidon = [];
  for (let i = 0; i <= 46; i += 1) {
    const t = i / 46;
    amidon.push([230 + t * 580, 300 - t * 110 + Math.sin(t * Math.PI * 3.4) * 26 * (1 - t * 0.7)]);
  }
  out.push(poly(amidon, { couleur: AMBER, largeur: 5 }));
  for (let i = 2; i <= 46; i += 4) {
    const [x, y] = amidon[i];
    out.push(rond(x, y, 5.5, { remplissage: AMBER_FILL, couleur: AMBER, largeur: 2 }));
  }
  out.push(texte(470, 272, 'α-1,4', { taille: 14, couleur: AMBER, ancre: 'middle', gras: true }));
  out.push(fleche(968, 200, 1016, 200, GREEN, 3));
  for (const dx of [0, 26]) out.push(rond(1042 + dx, 200, 8, { remplissage: AMBER_FILL, couleur: AMBER, largeur: 2.5 }));
  out.push(texte(1055, 240, 'maltose', { taille: 13, couleur: AMBER, ancre: 'middle', gras: true }));

  // Rang 2 : cellulose rigide → n'entre pas
  out.push(enzyme(760, 400));
  const cellulose = [];
  for (let i = 0; i <= 44; i += 1) cellulose.push([230 + i * 10.9, 490 + (i % 2 ? -7 : 7)]);
  out.push(poly(cellulose, { couleur: BLUE, largeur: 5 }));
  for (let i = 2; i <= 44; i += 4) {
    const [x, y] = cellulose[i];
    out.push(rond(x, y, 5.5, { remplissage: BLUE_FILL, couleur: BLUE, largeur: 2 }));
  }
  out.push(texte(500, 570, 'β-1,4', { taille: 14, couleur: BLUE, ancre: 'middle', gras: true }));
  out.push(texte(742, 490, '✗', { taille: 28, couleur: RED, ancre: 'middle', gras: true }));

  repere(1, 806, 222);
  repere(2, 620, 246);
  repere(3, 748, 252);
  repere(4, 620, 490);
  repere(5, 742, 490);
  repere(6, 1055, 200);
  return out;
});

// ── 7. u3 — pH : trois enzymes, trois optimums ───────────────────────────────────
planche('u3-ph', 1200, 810, ({ repere }) => {
  const out = [];
  const G = { x0: 130, x1: 1070, y0: 110, y1: 600 };
  const px = (pH) => G.x0 + (pH / 14) * (G.x1 - G.x0);
  const py = (pct) => G.y1 - (pct / 100) * (G.y1 - G.y0);

  for (let pct = 0; pct <= 100; pct += 25) {
    out.push(ligne(G.x0, py(pct), G.x1, py(pct), { couleur: GRID, largeur: 1.5, pointilles: '5 6' }));
    out.push(texte(G.x0 - 14, py(pct) + 5, String(pct), { taille: 15, couleur: MUTE, ancre: 'end' }));
  }
  out.push(ligne(G.x0, G.y0 - 20, G.x0, G.y1, { couleur: INK, largeur: 2.5 }));
  out.push(ligne(G.x0, G.y1, G.x1 + 16, G.y1, { couleur: INK, largeur: 2.5 }));
  for (let pH = 0; pH <= 14; pH += 1) {
    const grand = pH % 2 === 0;
    out.push(ligne(px(pH), G.y1, px(pH), G.y1 + (grand ? 9 : 5), { couleur: INK, largeur: grand ? 2 : 1.5 }));
    if (grand) out.push(texte(px(pH), G.y1 + 30, String(pH), { taille: 15, couleur: MUTE, ancre: 'middle' }));
  }
  out.push(texte(G.x1 + 22, G.y1 + 30, 'pH', { taille: 17, couleur: INK, gras: true }));
  out.push(texte(G.x0 - 16, G.y0 - 34, '%', { taille: 17, couleur: INK, ancre: 'end', gras: true }));

  const courbes = [
    { opt: 2, sigma: 1.0, couleur: RED },
    { opt: 7, sigma: 1.7, couleur: GREEN },
    { opt: 8.5, sigma: 1.5, couleur: BLUE },
  ];
  for (const c of courbes) {
    const pts = [];
    for (let pH = 0; pH <= 14.0001; pH += 0.1) {
      pts.push([px(pH), py(100 * Math.exp(-((pH - c.opt) ** 2) / (2 * c.sigma ** 2)))]);
    }
    out.push(poly(pts, { couleur: c.couleur, largeur: 4 }));
    out.push(ligne(px(c.opt), py(100), px(c.opt), G.y1, { couleur: c.couleur, largeur: 1.8, pointilles: '6 6' }));
    out.push(rond(px(c.opt), py(100), 6, { remplissage: PAPER, couleur: c.couleur, largeur: 3 }));
    out.push(texte(px(c.opt), py(100) - 18, `pH ${String(c.opt).replace('.', ',')}`, {
      taille: 15, couleur: c.couleur, ancre: 'middle', gras: true,
    }));
  }

  // Bandeau : ionisation des chaînes latérales aux pH extrêmes (formules exactes)
  out.push(boite(120, 664, 960, 116, { remplissage: AMBER_FILL, couleur: AMBER, largeur: 2, rayon: 16 }));
  out.push(texte(260, 712, '–COOH', { taille: 17, couleur: INK, ancre: 'middle', gras: true }));
  out.push(texte(350, 712, '⇌', { taille: 18, couleur: MUTE, ancre: 'middle' }));
  out.push(texte(450, 712, '–COO⁻', { taille: 17, couleur: INK, ancre: 'middle', gras: true }));
  out.push(texte(508, 704, '+ H⁺', { taille: 13, couleur: RED, ancre: 'middle' }));
  out.push(texte(372, 750, 'pH ↑', { taille: 13, couleur: MUTE, ancre: 'middle' }));

  out.push(texte(700, 712, 'H⁺ +', { taille: 13, couleur: RED, ancre: 'middle' }));
  out.push(texte(775, 712, '–NH₂', { taille: 17, couleur: INK, ancre: 'middle', gras: true }));
  out.push(texte(860, 712, '⇌', { taille: 18, couleur: MUTE, ancre: 'middle' }));
  out.push(texte(960, 712, '–NH₃⁺', { taille: 17, couleur: INK, ancre: 'middle', gras: true }));
  out.push(texte(866, 750, 'pH ↓', { taille: 13, couleur: MUTE, ancre: 'middle' }));

  repere(1, px(2) - 30, py(100) + 30);
  repere(2, px(7) - 30, py(100) + 30);
  repere(3, px(8.5) - 30, py(100) + 30);
  repere(4, px(4.6), py(5));
  repere(5, px(12.4), py(4));
  repere(6, 150, 748);
  return out;
});

// ── 8. u3 — température : optimum, dénaturation irréversible ─────────────────────
planche('u3-temperature', 1200, 800, ({ repere }) => {
  const out = [];
  const G = { x0: 130, x1: 1070, y0: 110, y1: 600 };
  const px = (T) => G.x0 + (T / 80) * (G.x1 - G.x0);
  const py = (pct) => G.y1 - (pct / 100) * (G.y1 - G.y0);

  for (let pct = 0; pct <= 100; pct += 25) {
    out.push(ligne(G.x0, py(pct), G.x1, py(pct), { couleur: GRID, largeur: 1.5, pointilles: '5 6' }));
    out.push(texte(G.x0 - 14, py(pct) + 5, String(pct), { taille: 15, couleur: MUTE, ancre: 'end' }));
  }
  out.push(ligne(G.x0, G.y0 - 20, G.x0, G.y1, { couleur: INK, largeur: 2.5 }));
  out.push(ligne(G.x0, G.y1, G.x1 + 16, G.y1, { couleur: INK, largeur: 2.5 }));
  for (let T = 0; T <= 80; T += 5) {
    const grand = T % 10 === 0;
    out.push(ligne(px(T), G.y1, px(T), G.y1 + (grand ? 9 : 5), { couleur: INK, largeur: grand ? 2 : 1.5 }));
    if (grand) out.push(texte(px(T), G.y1 + 30, String(T), { taille: 15, couleur: MUTE, ancre: 'middle' }));
  }
  out.push(texte(G.x1 + 22, G.y1 + 30, '°C', { taille: 17, couleur: INK, gras: true }));
  out.push(texte(G.x0 - 16, G.y0 - 34, '%', { taille: 17, couleur: INK, ancre: 'end', gras: true }));

  const activite = (T) => {
    if (T <= 37) return 100 * Math.exp(-((T - 37) ** 2) / (2 * 11 ** 2));
    if (T <= 50) return 100;
    return 100 * Math.exp(-((T - 50) ** 2) / (2 * 5.2 ** 2));
  };
  const pts = [];
  for (let T = 0; T <= 80.0001; T += 0.5) pts.push([px(T), py(activite(T))]);
  out.push(poly(pts, { couleur: GREEN, largeur: 4 }));

  out.push(ligne(px(37), py(100), px(37), G.y1, { couleur: GREEN, largeur: 1.8, pointilles: '6 6' }));
  out.push(rond(px(37), py(100), 6, { remplissage: PAPER, couleur: GREEN, largeur: 3 }));
  out.push(texte(px(37), py(100) - 20, '37 °C', { taille: 16, couleur: GREEN, ancre: 'middle', gras: true, halo: true }));
  out.push(ligne(px(60), G.y0, px(60), G.y1, { couleur: RED, largeur: 1.8, pointilles: '6 6' }));
  out.push(texte(px(60) + 12, py(86), '60 °C', { taille: 16, couleur: RED, gras: true, halo: true }));
  out.push(texte(px(3.2), py(15), '0 °C', { taille: 15, couleur: BLUE, gras: true, halo: true }));

  out.push(boite(130, 664, 950, 100, { remplissage: BLUE_FILL, couleur: BLUE, largeur: 2, rayon: 16 }));
  out.push(texte(320, 706, '0–4 °C', { taille: 16, couleur: BLUE, ancre: 'middle', gras: true }));
  out.push(texte(440, 706, '⇄', { taille: 22, couleur: BLUE, ancre: 'middle' }));
  out.push(texte(560, 706, '37 °C', { taille: 16, couleur: GREEN, ancre: 'middle', gras: true }));
  out.push(texte(440, 740, '100 %', { taille: 12, couleur: MUTE, ancre: 'middle' }));
  out.push(texte(780, 706, '> 60 °C', { taille: 16, couleur: RED, ancre: 'middle', gras: true }));
  out.push(fleche(850, 700, 910, 700, RED, 3));
  out.push(texte(960, 706, '0 %', { taille: 16, couleur: RED, ancre: 'middle', gras: true }));

  repere(1, px(37) - 46, py(100) + 44);
  repere(2, px(53), py(28));
  repere(3, px(9), py(9));
  repere(4, 180, 706);
  repere(5, 680, 706);
  return out;
});

// ── 9. u3 — Michaelis–Menten : Vmax et Km ────────────────────────────────────────
planche('u3-michaelis', 1200, 800, ({ repere }) => {
  const out = [];
  const G = { x0: 130, x1: 1070, y0: 110, y1: 600 };
  const SMAX = 12;
  const VMAX = 100;
  const KM = 2;
  const px = (s) => G.x0 + (s / SMAX) * (G.x1 - G.x0);
  const py = (v) => G.y1 - (v / 110) * (G.y1 - G.y0);

  for (let v = 0; v <= 100; v += 25) {
    out.push(ligne(G.x0, py(v), G.x1, py(v), { couleur: GRID, largeur: 1.5, pointilles: '5 6' }));
    out.push(texte(G.x0 - 14, py(v) + 5, String(v), { taille: 15, couleur: MUTE, ancre: 'end' }));
  }
  out.push(ligne(G.x0, G.y0 - 20, G.x0, G.y1, { couleur: INK, largeur: 2.5 }));
  out.push(ligne(G.x0, G.y1, G.x1 + 16, G.y1, { couleur: INK, largeur: 2.5 }));
  for (let s = 0; s <= SMAX; s += 1) {
    const grand = s % 2 === 0;
    out.push(ligne(px(s), G.y1, px(s), G.y1 + (grand ? 9 : 5), { couleur: INK, largeur: grand ? 2 : 1.5 }));
    if (grand) out.push(texte(px(s), G.y1 + 30, String(s), { taille: 15, couleur: MUTE, ancre: 'middle' }));
  }
  out.push(texte(G.x1 + 22, G.y1 + 30, '[S]', { taille: 17, couleur: INK, gras: true }));
  out.push(texte(G.x0 - 16, G.y0 - 34, 'V', { taille: 17, couleur: INK, ancre: 'end', gras: true }));

  const pts = [];
  for (let s = 0; s <= SMAX; s += 0.05) pts.push([px(s), py((VMAX * s) / (KM + s))]);
  out.push(poly(pts, { couleur: GREEN, largeur: 4 }));

  out.push(ligne(G.x0, py(VMAX), G.x1, py(VMAX), { couleur: RED, largeur: 2, pointilles: '8 6' }));
  out.push(texte(G.x1 - 12, py(VMAX) - 14, 'Vmax', { taille: 17, couleur: RED, ancre: 'end', gras: true }));
  out.push(ligne(G.x0, py(VMAX / 2), px(KM), py(VMAX / 2), { couleur: BLUE, largeur: 2, pointilles: '6 5' }));
  out.push(ligne(px(KM), G.y1, px(KM), py(VMAX / 2), { couleur: BLUE, largeur: 2, pointilles: '6 5' }));
  out.push(rond(px(KM), py(VMAX / 2), 7, { remplissage: PAPER, couleur: BLUE, largeur: 3 }));
  out.push(texte(px(KM) + 14, py(VMAX / 2) + 30, 'Km', { taille: 17, couleur: BLUE, gras: true }));
  out.push(texte(G.x0 + 12, py(VMAX / 2) - 12, 'Vmax/2', { taille: 13, couleur: BLUE, gras: true }));

  for (const [s, v] of [[0.5, 20], [1, 33.3], [2, 50], [4, 66.7], [6, 75], [8, 80], [10, 83.3]]) {
    out.push(rond(px(s), py(v), 5.5, { remplissage: AMBER_FILL, couleur: AMBER, largeur: 2.5 }));
  }

  out.push(boite(130, 664, 950, 100, { remplissage: GREEN_FILL, couleur: GREEN, largeur: 2, rayon: 16 }));
  out.push(texte(290, 706, '[S] ≪ Km', { taille: 16, couleur: INK, ancre: 'middle', gras: true }));
  out.push(texte(290, 738, 'V ≈ k·[S]', { taille: 12, couleur: MUTE, ancre: 'middle' }));
  out.push(texte(590, 706, '[S] = Km', { taille: 16, couleur: BLUE, ancre: 'middle', gras: true }));
  out.push(texte(590, 738, 'V = Vmax/2', { taille: 12, couleur: MUTE, ancre: 'middle' }));
  out.push(texte(880, 706, '[S] ≫ Km', { taille: 16, couleur: RED, ancre: 'middle', gras: true }));
  out.push(texte(880, 738, 'V → Vmax', { taille: 12, couleur: MUTE, ancre: 'middle' }));

  repere(1, px(1.2), py(58));
  repere(2, px(11), py(94));
  repere(3, px(9.4), py(70));
  repere(4, 175, 706);
  repere(5, 770, 706);
  return out;
});

// ── 10. u3 — inhibition : deux signatures cinétiques ────────────────────────────
planche('u3-inhibition', 1200, 800, ({ repere }) => {
  const out = [];
  const G = { x0: 130, x1: 1060, y0: 100, y1: 590 };
  const SMAX = 12;
  const px = (s) => G.x0 + (s / SMAX) * (G.x1 - G.x0);
  const py = (v) => G.y1 - (v / 110) * (G.y1 - G.y0);

  for (let v = 0; v <= 100; v += 25) {
    out.push(ligne(G.x0, py(v), G.x1, py(v), { couleur: GRID, largeur: 1.5, pointilles: '5 6' }));
    out.push(texte(G.x0 - 14, py(v) + 5, String(v), { taille: 15, couleur: MUTE, ancre: 'end' }));
  }
  out.push(ligne(G.x0, G.y0 - 20, G.x0, G.y1, { couleur: INK, largeur: 2.5 }));
  out.push(ligne(G.x0, G.y1, G.x1 + 16, G.y1, { couleur: INK, largeur: 2.5 }));
  for (let s = 0; s <= SMAX; s += 1) {
    const grand = s % 2 === 0;
    out.push(ligne(px(s), G.y1, px(s), G.y1 + (grand ? 9 : 5), { couleur: INK, largeur: grand ? 2 : 1.5 }));
    if (grand) out.push(texte(px(s), G.y1 + 30, String(s), { taille: 15, couleur: MUTE, ancre: 'middle' }));
  }
  out.push(texte(G.x1 + 22, G.y1 + 30, '[S]', { taille: 17, couleur: INK, gras: true }));
  out.push(texte(G.x0 - 16, G.y0 - 34, 'V', { taille: 17, couleur: INK, ancre: 'end', gras: true }));

  const courbe = (Vmax, Km, couleur) => {
    const pts = [];
    for (let s = 0; s <= SMAX; s += 0.05) pts.push([px(s), py((Vmax * s) / (Km + s))]);
    out.push(poly(pts, { couleur, largeur: 4 }));
  };
  courbe(100, 2, GREEN);
  courbe(100, 4, BLUE);
  courbe(60, 2, RED);

  out.push(ligne(G.x0, py(100), px(10.2), py(100), { couleur: GREEN, largeur: 2, pointilles: '8 6' }));
  out.push(texte(px(10.2) - 6, py(100) - 20, 'Vmax', { taille: 16, couleur: GREEN, ancre: 'end', gras: true, halo: true }));
  out.push(ligne(G.x0, py(60), px(10.2), py(60), { couleur: RED, largeur: 2, pointilles: '8 6' }));
  out.push(texte(px(10.2) - 6, py(60) - 20, "V'max", { taille: 16, couleur: RED, ancre: 'end', gras: true, halo: true }));

  out.push(ligne(px(4), G.y1, px(4), py(50), { couleur: BLUE, largeur: 2, pointilles: '5 5' }));
  out.push(texte(px(4) + 14, py(50) + 10, 'Km ↑', { taille: 15, couleur: BLUE, gras: true }));
  out.push(ligne(px(2), G.y1, px(2), py(50), { couleur: GREEN, largeur: 2, pointilles: '5 5' }));
  out.push(texte(px(2) - 14, py(50) + 28, 'Km', { taille: 15, couleur: GREEN, ancre: 'end', gras: true }));

  // Deux sites distincts, côte à côte et centrés
  out.push(boite(130, 640, 940, 130, { remplissage: '#fbfdfb', couleur: GRID, largeur: 2, rayon: 16 }));
  const enzymeSite = (x, y) => [
    boite(x, y, 104, 76, { remplissage: GREEN_FILL, couleur: GREEN, largeur: 3, rayon: 12 }),
    // encoche du site actif, ouverte vers le haut
    poly([[x + 24, y - 2], [x + 52, y + 36], [x + 80, y - 2]], {
      remplissage: PAPER, couleur: GREEN, largeur: 3,
    }),
  ];
  out.push(...enzymeSite(320, 676));
  out.push(boite(344, 682, 18, 18, { remplissage: RED_FILL, couleur: RED, largeur: 2.5, rayon: 4 }));
  out.push(...enzymeSite(720, 676));
  out.push(boite(752, 682, 16, 16, { remplissage: PAPER, couleur: GREEN, largeur: 2, rayon: 4 }));
  out.push(boite(784, 712, 20, 20, { remplissage: AMBER_FILL, couleur: AMBER, largeur: 2.5, rayon: 4 }));

  repere(1, px(9), py(86));
  repere(2, px(9), py(71));
  repere(3, px(9), py(47));
  repere(4, px(3.4), py(58));
  repere(5, 352, 664);
  repere(6, 794, 728);
  return out;
});

// ═══════════════════════════ LOT 2 — u4 (immunité) et u5 (nerf) ═══════════════════════════

/** Anticorps en Y : deux bras + un pied, dessiné dans une orientation donnée. */
function anticorps(cx, cy, taille, o = {}) {
  const { couleur = RED, largeur = 3, rotation = 0 } = o;
  const s = taille;
  const bras = [[-0.62, -1], [0, 0.12], [0.62, -1]];
  const pts = bras.map(([dx, dy]) => [cx + dx * s, cy + dy * s]);
  const corps = [
    `M${P(cx)} ${P(cy + 0.12 * s)} L${P(pts[0][0])} ${P(pts[0][1])}`,
    `M${P(cx)} ${P(cy + 0.12 * s)} L${P(pts[2][0])} ${P(pts[2][1])}`,
    `M${P(cx)} ${P(cy + 0.12 * s)} L${P(cx)} ${P(cy + 0.95 * s)}`,
  ];
  const grp = `<g stroke="${couleur}" stroke-width="${largeur}" fill="none" stroke-linecap="round"` +
    `${rotation ? ` transform="rotate(${rotation} ${cx} ${cy})"` : ''}>` +
    corps.map((d) => `<path d="${d}"/>`).join('') + '</g>';
  const bouts = `<g stroke="${couleur}" stroke-width="${largeur + 1}" stroke-linecap="round"` +
    `${rotation ? ` transform="rotate(${rotation} ${cx} ${cy})"` : ''}>` +
    pts.map(([x, y]) => `<line x1="${P(x)}" y1="${P(y)}" x2="${P(x)}" y2="${P(y - 0.2 * s)}"/>`).join('') +
    '</g>';
  return grp + bouts;
}

// ── L1. u4 — CMH-I / CMH-II : qui présente quoi ? ────────────────────────────────
planche('u4-cmh', 1200, 700, ({ repere }) => {
  const out = [];
  /** Récepteur membranaire : pied + tête (deux domaines pour CMH-II). */
  const recepteur = (x, y, nombreDomaines, couleur) => {
    const s = [ligne(x, y, x, y - 26, { couleur, largeur: 4 })];
    if (nombreDomaines === 2) {
      s.push(rond(x - 10, y - 40, 10, { remplissage: PAPER, couleur, largeur: 3 }));
      s.push(rond(x + 10, y - 40, 10, { remplissage: PAPER, couleur, largeur: 3 }));
    } else {
      s.push(boite(x - 15, y - 52, 30, 30, { remplissage: PAPER, couleur, largeur: 3, rayon: 9 }));
    }
    return s;
  };

  // A (à droite) — cellule nucléée quelconque : CMH-I partout
  out.push(ellipse(860, 430, 250, 210, { remplissage: GREEN_FILL, couleur: INK, largeur: 3 }));
  out.push(ellipse(860, 470, 104, 92, { remplissage: BLUE_FILL, couleur: BLUE, largeur: 2.5 }));
  out.push(texte(860, 476, 'ADN', { taille: 16, couleur: BLUE, ancre: 'middle', gras: true }));
  out.push(...recepteur(740, 246, 1, GREEN));
  out.push(...recepteur(860, 224, 1, GREEN));
  out.push(...recepteur(980, 246, 1, GREEN));
  out.push(boite(846, 166, 28, 24, { remplissage: AMBER_FILL, couleur: AMBER, largeur: 2.5, rayon: 4 }));
  out.push(texte(1024, 190, 'CMH-I', { taille: 15, couleur: GREEN, ancre: 'start', gras: true }));

  // B (à gauche) — CPA : CMH-II
  out.push(organique(330, 430, (a) => 196 + 26 * Math.sin(a * 4) + 12 * Math.cos(a * 3), {
    couleur: INK, largeur: 3, remplissage: AMBER_FILL,
  }));
  out.push(ellipse(330, 470, 74, 64, { remplissage: PAPER, couleur: BLUE, largeur: 2.5 }));
  out.push(...recepteur(232, 292, 2, AMBER));
  out.push(...recepteur(430, 292, 2, AMBER));
  out.push(boite(222, 226, 20, 20, { remplissage: GREEN_FILL, couleur: GREEN, largeur: 2, rayon: 4 }));
  out.push(texte(330, 206, 'CMH-II', { taille: 15, couleur: AMBER, ancre: 'middle', gras: true }));

  repere(1, 700, 210);
  repere(2, 860, 178);
  repere(3, 942, 500);
  repere(4, 202, 236);
  repere(5, 330, 560);
  return out;
});

// ── L2. u4 — groupes ABO : antigènes et anticorps naturels ───────────────────────
planche('u4-groupes-abo', 1200, 780, ({ repere }) => {
  const out = [];
  const colonnes = ['A', 'B', 'AB', 'O'];
  const antigene = (x, y, type, couleur) => (type === 'carre'
    ? boite(x - 9, y - 9, 18, 18, { remplissage: couleur, couleur, largeur: 2, rayon: 3 })
    : poly([[x, y - 11], [x + 10, y + 8], [x - 10, y + 8]], { remplissage: couleur, couleur, largeur: 2 }));
  for (const [i, groupe] of colonnes.entries()) {
    const x = 60 + i * 285;
    const cx = x + 105;
    out.push(boite(x, 70, 210, 470, { remplissage: '#fcfdfb', couleur: GRID, largeur: 2, rayon: 20 }));
    out.push(texte(cx, 112, groupe, { taille: 26, couleur: INK, ancre: 'middle', gras: true }));
    // hématie
    out.push(rond(cx, 250, 74, { remplissage: RED_FILL, couleur: RED, largeur: 3 }));
    const marq = [];
    if (groupe === 'A' || groupe === 'AB') marq.push(['triangle', -24], ['triangle', 18]);
    if (groupe === 'B' || groupe === 'AB') marq.push(['carre', -4], ['carre', 38]);
    if (groupe === 'O') marq.push(['h', -10], ['h', 22]);
    for (const [type, dy] of marq) {
      const angle = -Math.PI / 2 + dy / 90;
      const px = cx + Math.cos(angle) * 74;
      const py = 250 + Math.sin(angle) * 74;
      if (type === 'h') out.push(rond(px, py, 8, { remplissage: PAPER, couleur: MUTE, largeur: 2 }));
      else out.push(antigene(px, py, type, GREEN));
    }
    // anticorps plasmatiques
    const anti = groupe === 'A' ? ['B'] : groupe === 'B' ? ['A'] : groupe === 'AB' ? [] : ['A', 'B'];
    if (anti.length === 0) {
      out.push(texte(cx, 460, '∅', { taille: 26, couleur: MUTE, ancre: 'middle', gras: true }));
    } else {
      anti.forEach((cible, k) => {
        const ax = cx + (anti.length === 2 ? -46 + k * 92 : 0);
        out.push(anticorps(ax, 420, 34, { couleur: cible === 'A' ? BLUE : AMBER, largeur: 3 }));
        out.push(texte(ax, 500, `anti-${cible}`, { taille: 13, couleur: cible === 'A' ? BLUE : AMBER, ancre: 'middle', gras: true }));
      });
    }
  }
  // bandeau : l'agglutination (mélange incompatible)
  out.push(boite(60, 566, 1095, 190, { remplissage: RED_FILL, couleur: GRID, largeur: 2, rayon: 18 }));
  for (const cx of [250, 430, 610, 790, 970]) {
    for (const [dx, dy] of [[-16, -14], [18, -8], [-6, 18], [22, 20]]) {
      out.push(rond(cx + dx, 660 + dy, 22, { remplissage: PAPER, couleur: RED, largeur: 2.5 }));
    }
    out.push(anticorps(cx, 632, 22, { couleur: AMBER, largeur: 2.5 }));
  }
  out.push(texte(1110, 616, 'anti-A / anti-B', { taille: 14, couleur: MUTE, ancre: 'end', gras: true }));

  repere(1, 120, 150);
  repere(2, 420, 150);
  repere(3, 1046, 152);
  repere(4, 410, 402);
  repere(5, 126, 402);
  repere(6, 610, 660);
  return out;
});

// ── L3–L4. u4-phagocytose & u4-ltc-perforine : remplacés en Phase 2 (Lot B) par leurs versions .webp (webp_annote) ──

// ── L5. u4 — coopération LT4 → IL-2 → LB / LTc ──────────────────────────────────
planche('u4-cooperation-lt4', 1200, 780, ({ repere }) => {
  const out = [];
  const boiteCellule = (x, y, w, h, couleur, fond) => [
    boite(x, y, w, h, { remplissage: fond, couleur, largeur: 3, rayon: 16 }),
    rond(x + w / 2, y + h / 2, Math.min(w, h) * 0.24, { remplissage: PAPER, couleur, largeur: 2 }),
  ];

  // Sens arabe : CPA (droite) → LT4 → IL-2 → LB / LTc → cellules effectrices (gauche)
  out.push(...boiteCellule(940, 300, 200, 130, AMBER, AMBER_FILL));
  out.push(...boiteCellule(700, 300, 180, 130, BLUE, BLUE_FILL));
  out.push(...boiteCellule(700, 90, 180, 120, GREEN, GREEN_FILL));
  out.push(...boiteCellule(700, 560, 180, 120, GREEN, GREEN_FILL));
  out.push(...boiteCellule(420, 90, 180, 120, RED, RED_FILL));
  out.push(...boiteCellule(420, 560, 180, 120, RED, RED_FILL));
  out.push(anticorps(340, 150, 26, { couleur: RED, largeur: 2.5 }));
  out.push(anticorps(320, 620, 26, { couleur: RED, largeur: 2.5 }));

  // CPA → LT4
  out.push(fleche(936, 365, 888, 365, INK, 3));
  // LT4 → LB (haut) et LT4 → LTc (bas), via l'IL-2
  out.push(fleche(790, 296, 790, 216, INK, 3));
  out.push(fleche(790, 434, 790, 554, INK, 3));
  out.push(texte(790, 476, 'IL-2', { taille: 15, couleur: BLUE, ancre: 'middle', gras: true }));
  // LB → plasmocytes, LTc → LTc actifs
  out.push(fleche(696, 150, 606, 150, INK, 3));
  out.push(fleche(696, 620, 606, 620, INK, 3));

  repere(1, 1040, 365);
  repere(2, 745, 330);
  repere(3, 838, 476);
  repere(4, 700, 118);
  repere(5, 510, 118);
  repere(6, 700, 588);
  repere(7, 510, 588);
  return out;
});

// ── L6. u4 — VIH : chute des LT4 et seuil du SIDA ───────────────────────────────
planche('u4-vih', 1200, 760, ({ repere }) => {
  const out = [];
  const G = { x0: 140, x1: 1120, y0: 90, y1: 600 };
  const X = (annee) => G.x0 + (annee / 10) * (G.x1 - G.x0);
  const Y = (n) => G.y1 - (n / 1200) * (G.y1 - G.y0);

  for (const n of [0, 300, 600, 900, 1200]) {
    out.push(ligne(G.x0, Y(n), G.x1, Y(n), { couleur: GRID, largeur: 1.5, pointilles: '5 6' }));
    out.push(texte(G.x0 - 14, Y(n) + 5, String(n), { taille: 13, couleur: MUTE, ancre: 'end' }));
  }
  for (let a = 0; a <= 10; a += 1) out.push(texte(X(a), G.y1 + 26, String(a), { taille: 13, couleur: MUTE, ancre: 'middle' }));
  out.push(ligne(G.x0, G.y0, G.x0, G.y1, { couleur: INK, largeur: 2.5 }));
  out.push(ligne(G.x0, G.y1, G.x1, G.y1, { couleur: INK, largeur: 2.5 }));
  out.push(texte(G.x0 - 10, G.y0 - 16, 'LT4 / mm³', { taille: 14, couleur: INK, ancre: 'start', gras: true }));

  // Points de la cinétique : primo-infection, plateau, effondrement
  const points = [[0, 1000], [0.4, 520], [1, 820], [2, 760], [3, 700], [4, 640], [5, 580],
    [6, 500], [7, 380], [8, 260], [8.8, 170], [9.4, 90], [10, 40]];
  const courbe = points.map(([a, n]) => [X(a), Y(n)]);
  out.push(poly(courbe, { couleur: RED, largeur: 5 }));
  for (const [x, y] of courbe) out.push(rond(x, y, 4, { remplissage: RED, couleur: RED, largeur: 1 }));
  out.push(ligne(G.x0, Y(200), G.x1, Y(200), { couleur: AMBER, largeur: 2.5, pointilles: '8 6' }));
  out.push(texte(G.x1 - 6, Y(200) - 12, '200', { taille: 14, couleur: AMBER, ancre: 'end', gras: true }));
  // zone « SIDA » : bande verticale sous le seuil des 200 LT4/mm³
  out.push(boite(X(8.55), G.y0, X(10) - X(8.55), G.y1 - G.y0, {
    remplissage: RED_FILL, couleur: RED, largeur: 1.5, rayon: 6, pointilles: '7 6',
  }));

  repere(1, X(0.4), Y(520) + 34);
  repere(2, X(5), Y(580) + 36);
  repere(3, X(9.3), G.y0 + 30);
  repere(4, X(6.4), Y(200) + 18);
  repere(5, X(9.7), Y(52) - 34);
  return out;
});

// ── L6 bis. u4 — mémoire immunitaire : réponse primaire vs secondaire (Ag A / Ag B) ──
planche('u4-memoire-immunitaire', 1200, 760, ({ repere }) => {
  const out = [];
  const G = { x0: 145, x1: 1120, y0: 92, y1: 580 };
  const X = (j) => G.x0 + (j / 70) * (G.x1 - G.x0);
  const Y = (logAc) => G.y1 - (logAc / 4.25) * (G.y1 - G.y0);

  // Quadrillage horizontal (échelle logarithmique 10⁰ → 10⁴ UA)
  const ticksY = [[0, '10⁰'], [1, '10¹'], [2, '10²'], [3, '10³'], [4, '10⁴']];
  for (const [v, lib] of ticksY) {
    out.push(ligne(G.x0, Y(v), G.x1, Y(v), { couleur: GRID, largeur: 1.5, pointilles: '5 6' }));
    out.push(texte(G.x0 - 16, Y(v) + (v === 0 ? -2 : 4), lib, { taille: 14, couleur: MUTE, ancre: 'end', gras: true }));
  }
  for (let j = 0; j <= 70; j += 7) {
    out.push(ligne(X(j), G.y1, X(j), G.y1 + 7, { couleur: INK, largeur: 1.8 }));
    out.push(texte(X(j), G.y1 + 24, String(j), { taille: 13, couleur: MUTE, ancre: 'middle' }));
  }

  // Repère vertical du 2ᵉ contact (t = 35 j)
  out.push(ligne(X(35), G.y0, X(35), G.y1, { couleur: AMBER, largeur: 1.8, pointilles: '6 6' }));

  // Axes
  out.push(fleche(G.x0, G.y1, G.x0, G.y0 - 24, INK, 2.5, 10));
  out.push(fleche(G.x0, G.y1, G.x1 + 24, G.y1, INK, 2.5, 10));
  out.push(texte(G.x0 + 12, G.y0 - 24, 'Ac (UA)', { taille: 15, couleur: INK, ancre: 'start', gras: true }));
  out.push(texte(G.x1 + 28, G.y1 + 5, 'j', { taille: 15, couleur: INK, ancre: 'start', gras: true }));

  // Modèle lisse (type gamma) pour une courbe biologique réaliste sans cassure polygonale
  const picGamma = (t, t0, amp, tau, k) => {
    if (t <= t0) return 0;
    const u = (t - t0) / tau;
    return amp * Math.pow(u, k) * Math.exp(k * (1 - u));
  };

  // Courbe 1 : Ac anti-A — réponse primaire (latence 6 j, pic modeste ~10^1.65 à j=14)
  // puis réponse secondaire à j=35 (latence 2 j, pic ~10^3.85 à j=43, plateau durable)
  const ptsA = [];
  for (let j = 0; j <= 70; j += 0.5) {
    const prim = picGamma(j, 6, 1.62, 8, 2.4);
    const sec = j <= 37 ? 0 : 3.55 * (1 - Math.exp(-Math.pow((j - 37) / 3.4, 2.1))) * Math.exp(-(Math.max(0, j - 43)) / 65);
    const residuel = j >= 14 ? 0.34 * Math.exp(-Math.max(0, j - 14) / 55) : 0;
    const val = Math.min(3.88, 0.05 + Math.max(prim, residuel) + sec);
    ptsA.push([X(j), Y(val)]);
  }
  out.push(poly(ptsA, { couleur: GREEN, largeur: 5 }));

  // Courbe 2 : Ac anti-B — 1ᵉʳ contact à j=35 (latence 6 j, pic primaire ~10^1.55 à j=49)
  const ptsB = [];
  for (let j = 35; j <= 70; j += 0.5) {
    const primB = picGamma(j, 41, 1.54, 8, 2.4);
    const residuelB = j >= 49 ? 0.28 * Math.exp(-Math.max(0, j - 49) / 55) : 0;
    const val = 0.05 + Math.max(primB, residuelB);
    ptsB.push([X(j), Y(val)]);
  }
  out.push(poly(ptsB, { couleur: BLUE, largeur: 4.5, pointilles: '10 6' }));

  // Temps de latence Δt₁ (long : ~6 j) et Δt₂ (très court : ~2 j)
  const yLat1 = Y(0.54);
  out.push(ligne(X(0), yLat1, X(6), yLat1, { couleur: AMBER, largeur: 2.5 }));
  out.push(ligne(X(0), yLat1 - 8, X(0), yLat1 + 8, { couleur: AMBER, largeur: 2.5 }));
  out.push(ligne(X(6), yLat1 - 8, X(6), yLat1 + 8, { couleur: AMBER, largeur: 2.5 }));
  out.push(texte(X(3), yLat1 - 14, 'Δt₁', { taille: 15, couleur: AMBER, ancre: 'middle', gras: true, halo: true }));

  const yLat2 = Y(1.06);
  out.push(ligne(X(35), yLat2, X(37.2), yLat2, { couleur: RED, largeur: 2.5 }));
  out.push(ligne(X(35), yLat2 - 8, X(35), yLat2 + 8, { couleur: RED, largeur: 2.5 }));
  out.push(ligne(X(37.2), yLat2 - 8, X(37.2), yLat2 + 8, { couleur: RED, largeur: 2.5 }));
  out.push(texte(X(33.8), yLat2 + 4, 'Δt₂', { taille: 15, couleur: RED, ancre: 'end', gras: true, halo: true }));

  // Flèches des contacts antigéniques sous l'axe X
  out.push(fleche(X(0), G.y1 + 92, X(0), G.y1 + 36, GREEN, 3.5, 10));
  out.push(texte(X(0), G.y1 + 114, 'Ag A (1)', { taille: 15, couleur: GREEN, ancre: 'middle', gras: true }));

  out.push(fleche(X(35), G.y1 + 92, X(35), G.y1 + 36, AMBER, 3.5, 10));
  out.push(texte(X(35) - 10, G.y1 + 114, 'Ag A (2)', { taille: 15, couleur: GREEN, ancre: 'end', gras: true }));
  out.push(texte(X(35) + 10, G.y1 + 114, '+ Ag B (1)', { taille: 15, couleur: BLUE, ancre: 'start', gras: true }));

  // Légende minimale des deux courbes (symboles uniquement, en haut à gauche)
  out.push(boite(G.x0 + 28, G.y0 + 12, 224, 86, { remplissage: PAPER, couleur: GRID, largeur: 1.8, rayon: 12 }));
  out.push(ligne(G.x0 + 46, G.y0 + 40, G.x0 + 102, G.y0 + 40, { couleur: GREEN, largeur: 5 }));
  out.push(texte(G.x0 + 116, G.y0 + 42, 'Ac anti-A', { taille: 15, couleur: GREEN, ancre: 'start', gras: true }));
  out.push(ligne(G.x0 + 46, G.y0 + 74, G.x0 + 102, G.y0 + 74, { couleur: BLUE, largeur: 4.5, pointilles: '10 6' }));
  out.push(texte(G.x0 + 116, G.y0 + 76, 'Ac anti-B', { taille: 15, couleur: BLUE, ancre: 'start', gras: true }));

  // 7 repères espacés hors textes et hors courbes
  repere(1, X(2.6), G.y1 + 66);
  repere(2, X(3.0), Y(1.06));
  repere(3, X(14), Y(2.08));
  repere(4, X(32.2), G.y1 + 66);
  repere(5, X(32.7), Y(1.48));
  repere(6, X(45.5), Y(4.06));
  repere(7, X(49), Y(1.96));
  return out;
});

// ── L7. u5 — potentiel de repos : répartition des ions et pompe ─────────────────
planche('u5-potentiel-repos', 1200, 700, ({ repere }) => {
  const out = [];
  const haut = 330;
  const bas = 392;
  // bicouche lipidique
  for (const y of [haut, bas]) {
    out.push(ligne(80, y, 1120, y, { couleur: INK, largeur: 4 }));
    for (let x = 92; x < 1120; x += 30) {
      out.push(rond(x, y + (y === haut ? -8 : 8), 7, { remplissage: '#e8f2ec', couleur: GREEN, largeur: 2 }));
    }
  }
  // extérieur : Na⁺ majoritaire, charges +
  for (const x of [140, 220, 300, 380]) out.push(texte(x, 180, '+', { taille: 22, couleur: RED, ancre: 'middle', gras: true }));
  for (const x of [170, 260]) {
    out.push(rond(x, 120, 22, { remplissage: BLUE_FILL, couleur: BLUE, largeur: 2.5 }));
    out.push(texte(x, 127, 'Na⁺', { taille: 14, couleur: BLUE, ancre: 'middle', gras: true }));
  }
  // intérieur : K⁺ majoritaire, charges −
  for (const x of [140, 220, 300, 380]) out.push(texte(x, 560, '−', { taille: 22, couleur: BLUE, ancre: 'middle', gras: true }));
  for (const x of [170, 260, 340]) {
    out.push(rond(x, 500, 22, { remplissage: AMBER_FILL, couleur: AMBER, largeur: 2.5 }));
    out.push(texte(x, 507, 'K⁺', { taille: 14, couleur: AMBER, ancre: 'middle', gras: true }));
  }
  // canal de fuite K⁺
  out.push(boite(560, haut - 40, 46, (bas - haut) + 80, { remplissage: PAPER, couleur: GREEN, largeur: 3, rayon: 12 }));
  out.push(fleche(583, 480, 583, 420, AMBER, 3));
  // pompe Na⁺/K⁺-ATPase
  out.push(boite(840, haut - 46, 78, (bas - haut) + 92, { remplissage: PAPER, couleur: BLUE, largeur: 3, rayon: 14 }));
  out.push(fleche(860, 300, 860, 230, BLUE, 3));
  out.push(fleche(898, 420, 898, 490, AMBER, 3));
  out.push(texte(879, 344, 'ATP', { taille: 13, couleur: RED, ancre: 'middle', gras: true }));
  out.push(texte(884, 236, '3 Na⁺', { taille: 14, couleur: BLUE, ancre: 'start', gras: true }));
  out.push(texte(922, 500, '2 K⁺', { taille: 14, couleur: AMBER, ancre: 'start', gras: true }));
  // borne du potentiel de repos
  out.push(ligne(660, 640, 800, 640, { couleur: INK, largeur: 2 }));
  out.push(ligne(660, 630, 660, 650, { couleur: INK, largeur: 2 }));
  out.push(ligne(800, 630, 800, 650, { couleur: INK, largeur: 2 }));
  out.push(texte(730, 676, '−70 mV', { taille: 20, couleur: INK, ancre: 'middle', gras: true }));

  repere(1, 120, 150);
  repere(2, 400, 500);
  repere(3, 583, 404);
  repere(4, 879, 320);
  repere(5, 922, 344);
  repere(6, 838, 640);
  return out;
});

// ── L8. u5 — potentiel d'action : phases et loi du tout-ou-rien ─────────────────
planche('u5-potentiel-action', 1200, 780, ({ repere }) => {
  const out = [];
  const G = { x0: 150, x1: 900, y0: 90, y1: 600 };
  const mV = (v) => G.y1 - ((v + 90) / 130) * (G.y1 - G.y0);
  const temps = (t) => G.x0 + (t / 6) * (G.x1 - G.x0);

  for (const v of [-80, -70, -50, 0, 30]) {
    out.push(ligne(G.x0, mV(v), G.x1, mV(v), { couleur: GRID, largeur: 1.5, pointilles: '5 6' }));
    out.push(texte(G.x0 - 12, mV(v) + 5, String(v), { taille: 13, couleur: MUTE, ancre: 'end' }));
  }
  out.push(ligne(G.x0, G.y0, G.x0, G.y1, { couleur: INK, largeur: 2.5 }));
  out.push(ligne(G.x0, G.y1, G.x1, G.y1, { couleur: INK, largeur: 2.5 }));
  out.push(texte(G.x0 - 12, G.y0 - 16, 'mV', { taille: 14, couleur: INK, ancre: 'end', gras: true }));
  out.push(texte(G.x1 - 8, G.y1 + 26, 'ms', { taille: 14, couleur: INK, ancre: 'end', gras: true }));

  // tracé : repos → seuil → pic → repolarisation → hyperpolarisation → retour
  const trace = [[0, -70], [1.2, -70], [1.6, -55], [1.9, -50], [2.15, 30], [2.5, -20],
    [2.9, -70], [3.15, -80], [3.5, -72], [4.2, -70], [6, -70]];
  out.push(poly(trace.map(([t, v]) => [temps(t), mV(v)]), { couleur: RED, largeur: 4.5 }));
  out.push(ligne(temps(1.6), mV(-50), temps(2.4), mV(-50), { couleur: AMBER, largeur: 2, pointilles: '6 5' }));

  // encart : stimuli d'intensité croissante → même réponse (tout ou rien)
  out.push(boite(950, 120, 200, 420, { remplissage: '#fcfdfb', couleur: GRID, largeur: 2, rayon: 16 }));
  const encart = (y, hauteur) => {
    const s = [];
    s.push(fleche(980, y + 60, 980, y + 60 - hauteur, BLUE, 3, 9));
    s.push(poly([[1040, y + 60], [1040, y + 20], [1070, y - 20], [1100, y + 20], [1100, y + 60]], {
      couleur: RED, largeur: 3,
    }));
    return s;
  };
  out.push(...encart(180, 34));
  out.push(...encart(340, 58));

  repere(1, temps(0.6), mV(-70) - 26);
  repere(2, temps(1.9), mV(-50) - 24);
  repere(3, temps(2.15), mV(30) - 22);
  repere(4, temps(2.98), mV(-28) + 34);
  repere(5, temps(3.15), mV(-80) + 30);
  repere(6, 986, 480);
  return out;
});

// ── L9. u5 — intégration neuronale : PPSE, PPSI et segment initial ──────────────
planche('u5-integration', 1200, 720, ({ repere }) => {
  const out = [];
  // corps cellulaire + axone vers la gauche (sens de lecture arabe)
  out.push(organique(760, 380, (a) => 148 + 22 * Math.sin(a * 3.4), {
    couleur: INK, largeur: 3.5, remplissage: GREEN_FILL,
  }));
  out.push(ellipse(760, 380, 54, 46, { remplissage: BLUE_FILL, couleur: BLUE, largeur: 2.5 }));
  out.push(poly([[618, 370], [360, 348], [360, 400], [618, 386]], {
    couleur: INK, largeur: 3, remplissage: '#efe6d8',
  }));
  out.push(texte(500, 424, 'SI', { taille: 16, couleur: INK, ancre: 'middle', gras: true }));

  // boutons excitateurs (PPSE : entrée de Na⁺)
  for (const [x, y] of [[1010, 232], [1040, 380], [1010, 528]]) {
    out.push(rond(x, y, 32, { remplissage: BLUE_FILL, couleur: BLUE, largeur: 2.5 }));
    out.push(texte(x, y + 5, 'Na⁺', { taille: 12, couleur: BLUE, ancre: 'middle', gras: true }));
    out.push(fleche(x - 34, y, x - 76, y, GREEN, 3));
  }
  // boutons inhibiteurs (PPSI : entrée de Cl⁻)
  for (const [x, y] of [[1090, 150], [1090, 620]]) {
    out.push(rond(x, y, 32, { remplissage: AMBER_FILL, couleur: AMBER, largeur: 2.5 }));
    out.push(texte(x, y + 5, 'Cl⁻', { taille: 12, couleur: RED, ancre: 'middle', gras: true }));
    out.push(ligne(x - 34, y, x - 76, y, { couleur: RED, largeur: 3 }));
    out.push(ligne(x - 76, y - 12, x - 76, y + 12, { couleur: RED, largeur: 3 }));
  }
  // sommation temporelle : deux influx rapprochés vers le même bouton
  out.push(fleche(1150, 496, 1060, 512, GREEN, 2.5));
  out.push(fleche(1150, 520, 1060, 536, GREEN, 2.5));

  repere(1, 976, 196);
  repere(2, 1136, 106);
  repere(3, 1136, 476);
  repere(4, 596, 300);
  repere(5, 352, 448);
  return out;
});

// ── L10. u5-morphine : remplacé en Phase 2 (Lot B) par u5-morphine.webp (webp_annote) ──

// ═══════════════════════════ LOT 3 — u6 (photosynthèse), u7 (respiration), u8 (cycle) ═══════════════════════════
// Règle « zéro texte IA » : aucun mot arabe dans ces SVG (le garde-fou de verifier-hors-ligne le refuse).
// Seuls des symboles scientifiques latins (RuBP, PGAL, ATP, NADPH, ¹⁴CO₂, hν…) apparaissent ; les termes
// arabes viennent du registre (`annotations` + `legendeAr`), rendus par l'application.

/** Flèche coudée : polyligne + pointe sur le dernier segment. */
function flechePoly(points, o = {}) {
  const { couleur = INK, largeur = 3, tete = 11 } = o;
  const [xa, ya] = points[points.length - 2];
  const [xb, yb] = points[points.length - 1];
  const angle = Math.atan2(yb - ya, xb - xa);
  const a1 = angle + Math.PI - 0.42;
  const a2 = angle + Math.PI + 0.42;
  return [
    `<path d="M${points.map(([x, y]) => `${P(x)} ${P(y)}`).join(' L')}" fill="none" stroke="${couleur}" stroke-width="${largeur}" stroke-linecap="round" stroke-linejoin="round"/>`,
    `<path d="M${P(xb + Math.cos(a1) * tete)} ${P(yb + Math.sin(a1) * tete)} L${P(xb)} ${P(yb)} L${P(xb + Math.cos(a2) * tete)} ${P(yb + Math.sin(a2) * tete)}" fill="none" stroke="${couleur}" stroke-width="${largeur}" stroke-linecap="round" stroke-linejoin="round"/>`,
  ];
}

/** Arc d'ellipse échantillonné entre deux angles (radians). */
const arcEllipse = (cx, cy, rx, ry, a0, a1, n = 40) => {
  const pts = [];
  for (let i = 0; i <= n; i += 1) {
    const a = a0 + ((a1 - a0) * i) / n;
    pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
  }
  return pts;
};

/** Étiquette d'étape : boîte arrondie + libellé latin centré. */
const etape = (x, y, l, h, couleur, fond, libelle, taille = 21) => [
  boite(x, y, l, h, { remplissage: fond, couleur, largeur: 3, rayon: 14 }),
  texte(x + l / 2, y + h / 2 + 7, libelle, { taille, couleur, ancre: 'middle', gras: true }),
];

// ── 1. u6 — cycle de Calvin : fixation, réduction, régénération ──────────────────
planche('u6-cycle-calvin', 1200, 760, ({ repere }) => {
  const out = [];
  out.push(boite(40, 40, 1120, 680, { remplissage: '#fcfdfb', couleur: GRID, largeur: 2, rayon: 40 }));

  // 1) fixation
  out.push(...etape(880, 280, 230, 80, AMBER, AMBER_FILL, 'RuBP (C5)'));
  out.push(...etape(880, 440, 230, 80, GREEN, GREEN_FILL, 'APG (C3)'));
  out.push(fleche(995, 364, 995, 436, INK, 3));
  out.push(fleche(1140, 400, 1006, 400, MUTE, 3, 10));
  out.push(texte(1072, 372, '3 CO₂', { taille: 17, couleur: MUTE, ancre: 'middle', gras: true, halo: true }));

  // 2) réduction
  out.push(...etape(560, 440, 230, 80, RED, RED_FILL, 'PGAL (C3)'));
  out.push(fleche(876, 480, 794, 480, INK, 3));
  out.push(texte(835, 456, 'ATP', { taille: 15, couleur: RED, ancre: 'middle', gras: true, halo: true }));
  out.push(texte(835, 508, 'NADPH', { taille: 15, couleur: RED, ancre: 'middle', gras: true, halo: true }));

  // 3) régénération : 5/6 du PGAL retournent en RuBP
  out.push(...flechePoly([[675, 436], [675, 196], [995, 196], [995, 276]], { couleur: AMBER, largeur: 3 }));
  out.push(texte(836, 176, 'RuBP (5/6)', { taille: 17, couleur: AMBER, ancre: 'middle', gras: true, halo: true }));

  // 4) sortie : 1/6 → glucose
  out.push(...etape(200, 440, 300, 80, GREEN, '#eaf4ee', 'Glucose (C6)'));
  out.push(fleche(556, 480, 504, 480, INK, 3));

  repere(1, 995, 256);
  repere(2, 1134, 404);
  repere(3, 938, 416);
  repere(4, 616, 416);
  repere(5, 835, 540);
  repere(6, 960, 226);
  repere(7, 350, 416);
  return out;
});

// ── 2. u6 — expérience de Calvin : chronologie du ¹⁴CO₂ ─────────────────────────
planche('u6-calvin-experience', 1200, 760, ({ repere }) => {
  const out = [];
  const G = { x0: 150, x1: 1130, y0: 120, y1: 600 };
  const T = (s) => G.x0 + (s / 90) * (G.x1 - G.x0);
  const R = (v) => G.y1 - (v / 100) * (G.y1 - G.y0);

  out.push(ligne(G.x0, G.y1, G.x1, G.y1, { couleur: INK, largeur: 2.5 }));
  out.push(ligne(G.x0, G.y0, G.x0, G.y1, { couleur: INK, largeur: 2.5 }));
  for (const s of [0, 15, 30, 45, 60, 75, 90]) {
    out.push(ligne(T(s), G.y1, T(s), G.y1 + 8, { couleur: INK, largeur: 2 }));
    out.push(texte(T(s), G.y1 + 30, String(s), { taille: 14, couleur: MUTE, ancre: 'middle' }));
  }
  out.push(texte(G.x1 + 22, G.y1 + 30, 's', { taille: 15, couleur: MUTE, ancre: 'start', gras: true }));
  out.push(texte(G.x0 - 14, G.y0 - 18, '¹⁴C', { taille: 17, couleur: INK, ancre: 'start', gras: true }));

  const courbe = (f, couleur) => {
    const pts = [];
    for (let s = 0; s <= 90; s += 1.5) pts.push([T(s), R(f(s))]);
    return poly(pts, { couleur, largeur: 4 });
  };
  out.push(courbe((s) => (s <= 5 ? (s / 5) * 96 : 96 * Math.exp(-(s - 5) / 22)), GREEN));
  out.push(courbe((s) => (s <= 20 ? (s / 20) * 74 : 74 * Math.exp(-(s - 20) / 34)), AMBER));
  out.push(courbe((s) => 62 * (1 - Math.exp(-s / 26)), RED));

  // injection de ¹⁴CO₂ à t = 0
  out.push(fleche(150, 44, 168, 96, RED, 3, 10));
  out.push(texte(196, 60, '¹⁴CO₂', { taille: 17, couleur: RED, ancre: 'start', gras: true }));

  repere(1, 246, 148);
  repere(2, 404, 248);
  repere(3, 906, 300);
  repere(4, 118, 66);
  repere(5, 588, 470);
  return out;
});

// ── 3. u7 — glycolyse : bilan net de 2 ATP ──────────────────────────────────────
planche('u7-glycolyse', 1200, 780, ({ repere }) => {
  const out = [];
  out.push(boite(40, 30, 1120, 700, { remplissage: '#fcfdfb', couleur: GRID, largeur: 2, rayon: 40 }));

  out.push(...etape(470, 70, 260, 78, AMBER, AMBER_FILL, 'Glucose (C6)'));
  out.push(fleche(600, 152, 600, 196, INK, 3));
  out.push(texte(628, 182, '−2 ATP', { taille: 17, couleur: RED, ancre: 'start', gras: true }));

  out.push(...etape(420, 200, 360, 78, BLUE, BLUE_FILL, 'Fructose-1,6-BP (C6)', 19));
  out.push(flechePoly([[600, 282], [600, 316], [400, 316], [400, 350]], { couleur: INK, largeur: 3 }));
  out.push(flechePoly([[600, 316], [800, 316], [800, 350]], { couleur: INK, largeur: 3 }));

  out.push(...etape(300, 354, 200, 70, GREEN, GREEN_FILL, 'PGAL (C3)'));
  out.push(...etape(700, 354, 200, 70, GREEN, GREEN_FILL, 'PGAL (C3)'));

  out.push(fleche(400, 428, 400, 520, INK, 3));
  out.push(fleche(800, 428, 800, 520, INK, 3));
  out.push(texte(430, 470, '+4 ATP', { taille: 16, couleur: RED, ancre: 'start', gras: true }));
  out.push(texte(770, 470, '2 NADH', { taille: 16, couleur: BLUE, ancre: 'end', gras: true }));

  out.push(...etape(280, 524, 240, 70, RED, RED_FILL, 'Pyruvate (C3)', 18));
  out.push(...etape(680, 524, 240, 70, RED, RED_FILL, 'Pyruvate (C3)', 18));

  out.push(boite(320, 646, 560, 62, { remplissage: '#eef4ef', couleur: INK, largeur: 2.5, rayon: 14 }));
  out.push(texte(600, 686, '2 ATP + 2 NADH', { taille: 22, couleur: INK, ancre: 'middle', gras: true }));

  repere(1, 452, 140);
  repere(2, 404, 240);
  repere(3, 284, 390);
  repere(4, 916, 390);
  repere(5, 264, 560);
  repere(6, 330, 678);
  return out;
});

// ── 4. u7 — cycle de Krebs : décarboxylations et transporteurs réduits ──────────
planche('u7-cycle-krebs', 1200, 760, ({ repere }) => {
  const out = [];
  const cx = 600;
  const cy = 385;
  const rx = 320;
  const ry = 195;

  out.push(poly(arcEllipse(cx, cy, rx, ry, 0, Math.PI * 2), { couleur: GRID, largeur: 3, pointilles: '9 8' }));
  for (const [a0, a1] of [
    [-0.35, -Math.PI / 2 + 0.35],
    [-Math.PI / 2 - 0.35, -Math.PI + 0.35],
    [-Math.PI - 0.35, -1.5 * Math.PI + 0.35],
    [-1.5 * Math.PI - 0.35, -2 * Math.PI + 0.35],
  ]) {
    out.push(...flechePoly(arcEllipse(cx, cy, rx, ry, a0, a1, 26), { couleur: INK, largeur: 3, tete: 12 }));
  }

  const noeud = (x, y, l, h, couleur, fond, libelle, taille = 19) => [
    boite(x - l / 2, y - h / 2, l, h, { remplissage: PAPER, couleur, largeur: 3, rayon: 14 }),
    texte(x, y + 7, libelle, { taille, couleur, ancre: 'middle', gras: true }),
  ];

  out.push(...noeud(cx + rx, cy, 240, 76, AMBER, AMBER_FILL, 'OAA (C4)'));
  out.push(...noeud(cx, cy - ry, 240, 76, GREEN, GREEN_FILL, 'Citrate (C6)'));
  out.push(...noeud(cx - rx, cy, 220, 76, BLUE, BLUE_FILL, 'C5 → C4'));
  out.push(...noeud(cx, cy + ry, 240, 76, RED, RED_FILL, 'OAA (C4)'));

  // entrée : acétyl-CoA (C2)
  out.push(texte(1064, 500, 'Acétyl-CoA (C2)', { taille: 16, couleur: AMBER, ancre: 'middle', gras: true }));
  out.push(fleche(1064, 474, 1012, 410, AMBER, 3, 10));

  // sorties
  out.push(fleche(762, 232, 806, 166, MUTE, 2.5, 9));
  out.push(texte(818, 156, '2 CO₂', { taille: 16, couleur: MUTE, ancre: 'start', gras: true }));
  out.push(fleche(330, 262, 268, 214, BLUE, 2.5, 9));
  out.push(texte(258, 202, '3 NADH', { taille: 16, couleur: BLUE, ancre: 'end', gras: true }));
  out.push(fleche(300, 440, 236, 470, RED, 2.5, 9));
  out.push(texte(226, 486, '1 FADH₂', { taille: 16, couleur: RED, ancre: 'end', gras: true }));
  out.push(fleche(724, 560, 790, 560, INK, 2.5, 9));
  out.push(texte(802, 566, '1 ATP', { taille: 16, couleur: INK, ancre: 'start', gras: true }));

  repere(1, 920, 328);
  repere(2, 600, 128);
  repere(3, 280, 328);
  repere(4, 600, 640);
  repere(5, 818, 150);
  repere(6, 266, 238);
  return out;
});

// ── 5. u7-chaine-respiratoire : remplacé en Phase 2 (Lot B) par u7-chaine-respiratoire.webp (webp_annote) ──

// ── 6. u8 — cycle de la matière et flux d'énergie ───────────────────────────────
planche('u8-cycle-matiere-energie', 1200, 760, ({ repere }) => {
  const out = [];
  out.push(boite(40, 40, 1120, 680, { remplissage: '#fcfdfb', couleur: GRID, largeur: 2, rayon: 40 }));

  out.push(boite(120, 170, 380, 380, { remplissage: GREEN_FILL, couleur: GREEN, largeur: 3, rayon: 26 }));
  out.push(texte(310, 214, 'Chloroplaste', { taille: 20, couleur: GREEN, ancre: 'middle', gras: true }));
  out.push(boite(700, 170, 380, 380, { remplissage: RED_FILL, couleur: RED, largeur: 3, rayon: 26 }));
  out.push(texte(890, 214, 'Mitochondrie', { taille: 20, couleur: RED, ancre: 'middle', gras: true }));

  // échanges : CO₂ + H₂O vers la gauche, O₂ + glucose vers la droite
  out.push(fleche(696, 320, 524, 320, MUTE, 4, 12));
  out.push(texte(610, 296, 'CO₂ + H₂O', { taille: 17, couleur: MUTE, ancre: 'middle', gras: true, halo: true }));
  out.push(fleche(504, 470, 696, 470, GREEN, 4, 12));
  out.push(texte(610, 510, 'O₂ + glucose', { taille: 17, couleur: GREEN, ancre: 'middle', gras: true, halo: true }));

  // réactions internes
  out.push(texte(310, 330, 'CO₂ + H₂O → glucose + O₂', { taille: 16, couleur: GREEN, ancre: 'middle' }));
  out.push(texte(890, 330, 'glucose + O₂ → CO₂ + H₂O', { taille: 16, couleur: RED, ancre: 'middle' }));

  // énergie lumineuse entrante
  out.push(rond(120, 96, 30, { remplissage: AMBER_FILL, couleur: AMBER, largeur: 3 }));
  for (let i = 0; i < 8; i += 1) {
    const a = (i / 8) * Math.PI * 2;
    out.push(ligne(120 + Math.cos(a) * 38, 96 + Math.sin(a) * 38, 120 + Math.cos(a) * 52, 96 + Math.sin(a) * 52, { couleur: AMBER, largeur: 3 }));
  }
  out.push(fleche(152, 128, 182, 164, AMBER, 3, 10));
  out.push(texte(214, 112, 'hν', { taille: 21, couleur: AMBER, ancre: 'start', gras: true }));

  // ATP (photosynthèse) et chaleur dissipée (respiration)
  out.push(texte(310, 500, 'ATP', { taille: 19, couleur: INK, ancre: 'middle', gras: true }));
  out.push(texte(890, 500, 'ATP', { taille: 19, couleur: INK, ancre: 'middle', gras: true }));
  for (const x of [810, 890, 970]) out.push(fleche(x, 560, x, 632, RED, 2.5, 10));
  out.push(texte(890, 664, 'chaleur', { taille: 16, couleur: RED, ancre: 'middle', gras: true }));

  repere(1, 310, 260);
  repere(2, 890, 260);
  repere(3, 610, 262);
  repere(4, 610, 548);
  repere(5, 196, 66);
  repere(6, 890, 640);
  return out;
});

// ═══════════════════════════ LOT 4 — u9 (tectonique), u10 (structure interne), u11 (déformation) ═══════════════════════════
// Même règle : aucun mot arabe dans les SVG ; symboles latins contrôlés (Moho, LVZ, U, Th, K, P, S, SIAL…).

// ── 1. u9 — les trois types de limites de plaques ───────────────────────────────
planche('u9-limites-plaques', 1200, 760, ({ repere }) => {
  const out = [];
  const panneau = (x, libelle) => [
    boite(x, 120, 320, 520, { remplissage: '#fcfdfb', couleur: GRID, largeur: 2, rayon: 22 }),
    texte(x + 28, 168, libelle, { taille: 26, couleur: INK, ancre: 'start', gras: true }),
  ];
  const astheno = (x) => boite(x + 16, 540, 288, 76, { remplissage: AMBER_FILL, couleur: AMBER, largeur: 2, rayon: 10 });

  // A — divergence : dorsale, magma qui monte, plaques qui s'écartent
  out.push(...panneau(50, 'A'));
  out.push(astheno(50));
  // deux plaques lithosphériques qui s'écartent, dorsale surélevée entre elles
  out.push(poly([[66, 540], [66, 306], [168, 282], [196, 292], [196, 540]], { couleur: INK, largeur: 3, remplissage: GREEN_FILL }));
  out.push(poly([[354, 540], [354, 306], [252, 282], [224, 292], [224, 540]], { couleur: INK, largeur: 3, remplissage: GREEN_FILL }));
  out.push(poly([[210, 246], [196, 292], [224, 292]], { couleur: RED, largeur: 2.5, remplissage: RED_FILL }));
  out.push(poly([[202, 540], [218, 540], [218, 292], [202, 292]], { couleur: RED, largeur: 2, remplissage: RED_FILL }));
  out.push(fleche(192, 372, 110, 372, RED, 3, 11));
  out.push(fleche(228, 372, 310, 372, RED, 3, 11));

  // B — convergence : plaque océanique qui plonge, volcan au-dessus
  out.push(...panneau(440, 'B'));
  out.push(astheno(440));
  // plaque océanique (gauche) qui plonge sous la plaque continentale (droite)
  out.push(poly([[456, 300], [640, 300], [640, 540], [456, 540]], { couleur: INK, largeur: 3, remplissage: GREEN_FILL }));
  out.push(poly([[640, 300], [744, 300], [744, 540], [640, 540]], { couleur: INK, largeur: 3, remplissage: '#eef2ec' }));
  out.push(poly([[640, 300], [744, 430], [744, 470], [668, 300]], { couleur: BLUE, largeur: 3, remplissage: BLUE_FILL }));
  out.push(poly([[690, 300], [712, 224], [734, 300]], { couleur: RED, largeur: 2.5, remplissage: RED_FILL }));
  out.push(ligne(712, 300, 712, 376, { couleur: RED, largeur: 3, pointilles: '7 6' }));
  out.push(fleche(470, 262, 596, 262, INK, 3, 11));

  // C — coulissage : deux blocs qui glissent le long d'une faille
  out.push(...panneau(830, 'C'));
  out.push(boite(846, 200, 288, 150, { remplissage: GREEN_FILL, couleur: INK, largeur: 3, rayon: 8 }));
  out.push(boite(846, 400, 288, 150, { remplissage: '#eef2ec', couleur: INK, largeur: 3, rayon: 8 }));
  out.push(ligne(846, 375, 1134, 375, { couleur: RED, largeur: 4, pointilles: '10 7' }));
  out.push(fleche(900, 275, 1080, 275, RED, 3, 11));
  out.push(fleche(1080, 475, 900, 475, RED, 3, 11));

  repere(1, 210, 240);
  repere(2, 254, 372);
  repere(3, 533, 262);
  repere(4, 712, 232);
  repere(5, 1000, 375);
  repere(6, 990, 475);
  return out;
});

// ── 2. u9-expansion-oceanique : remplacé en Phase 2 (Lot B) par u9-expansion-oceanique.webp (webp_annote) ──

// ── 3. u9 — énergie interne : désintégration, conduction, convection ────────────
planche('u9-energie-interne', 1200, 760, ({ repere }) => {
  const out = [];
  out.push(boite(40, 40, 1120, 680, { remplissage: '#fcfdfb', couleur: GRID, largeur: 2, rayon: 36 }));

  // croûte + lithosphère
  out.push(boite(70, 130, 1060, 96, { remplissage: '#e8e4dc', couleur: INK, largeur: 3, rayon: 0 }));
  out.push(boite(70, 226, 1060, 470, { remplissage: AMBER_FILL, couleur: AMBER, largeur: 3, rayon: 0 }));

  // conduction : flèches verticales serrées dans la lithosphère
  for (let x = 120; x <= 1080; x += 60) out.push(fleche(x, 218, x, 146, RED, 2, 8));

  // convection : deux cellules
  const cellule = (cx, sens) => {
    const s = [];
    s.push(rond(cx, 470, 150, { remplissage: 'none', couleur: '#c9a45a', largeur: 2.5, pointilles: '8 7' }));
    const a0 = sens > 0 ? -2.6 : -0.5;
    s.push(...flechePoly(arcEllipse(cx, 470, 110, 110, a0, a0 + 1.9, 24), { couleur: AMBER, largeur: 4, tete: 12 }));
    s.push(...flechePoly(arcEllipse(cx, 470, 110, 110, a0 + Math.PI, a0 + Math.PI + 1.9, 24), { couleur: AMBER, largeur: 4, tete: 12 }));
    return s;
  };
  out.push(...cellule(360, 1));
  out.push(...cellule(840, -1));

  // sources de chaleur : désintégration radioactive
  out.push(texte(600, 268, '²³⁸U · ²³²Th · ⁴⁰K', { taille: 20, couleur: RED, ancre: 'middle', gras: true, halo: true }));
  for (const [x, y] of [[520, 330], [600, 300], [680, 330]]) {
    out.push(rond(x, y, 12, { remplissage: RED_FILL, couleur: RED, largeur: 2.5 }));
  }

  repere(1, 170, 178);
  repere(2, 430, 180);
  repere(3, 360, 470);
  repere(4, 840, 470);
  repere(5, 600, 368);
  repere(6, 1020, 152);
  return out;
});

// ── 4. u10 — ondes sismiques et discontinuités ──────────────────────────────────
planche('u10-ondes-sismiques', 1200, 780, ({ repere }) => {
  const out = [];
  const cx = 350;
  const cy = 420;
  // demi-globe
  const demi = (r, o) => poly(
    [...Array.from({ length: 61 }, (_, i) => {
      const a = Math.PI + (i / 60) * Math.PI;
      return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
    }), [cx + r, cy], [cx - r, cy]],
    o,
  );
  out.push(demi(300, { couleur: INK, largeur: 3, remplissage: GREEN_FILL }));
  out.push(demi(240, { couleur: BLUE, largeur: 2.5, remplissage: BLUE_FILL }));
  out.push(demi(150, { couleur: AMBER, largeur: 2.5, remplissage: AMBER_FILL }));
  out.push(demi(80, { couleur: RED, largeur: 2.5, remplissage: RED_FILL }));
  out.push(texte(cx, cy - 52, 'Fe–Ni', { taille: 15, couleur: RED, ancre: 'middle', gras: true }));
  out.push(texte(cx, cy - 196, 'SIMA', { taille: 15, couleur: AMBER, ancre: 'middle', gras: true }));
  out.push(texte(cx, cy - 276, 'SIAL', { taille: 15, couleur: GREEN, ancre: 'middle', gras: true }));

  // foyers et rais sismiques
  out.push(rond(cx, cy - 296, 8, { remplissage: RED, couleur: RED, largeur: 2 }));
  for (const a of [0.5, 1.1, 1.9, 2.5]) {
    out.push(ligne(cx, cy - 296, cx + Math.cos(Math.PI + a) * 290, cy + Math.sin(Math.PI + a) * 290, { couleur: MUTE, largeur: 1.6, pointilles: '5 6' }));
  }

  // courbe des vitesses
  const G = { x0: 700, x1: 1130, y0: 150, y1: 640 };
  const D = (km) => G.y0 + (km / 6500) * (G.y1 - G.y0);
  const V = (v) => G.x0 + (v / 14) * (G.x1 - G.x0);
  out.push(ligne(G.x0, G.y1, G.x1, G.y1, { couleur: INK, largeur: 2.5 }));
  out.push(ligne(G.x0, G.y0, G.x0, G.y1, { couleur: INK, largeur: 2.5 }));
  const vp = [[0, 5.5], [40, 8], [400, 9], [660, 10.2], [2890, 13.7], [5150, 10.3], [6370, 11.3]];
  const vs = [[0, 3.2], [40, 4.6], [400, 5.1], [2890, 7.3], [2900, 0.1], [6370, 3.7]];
  out.push(poly(vp.map(([d, v]) => [V(v), D(d)]), { couleur: BLUE, largeur: 4 }));
  out.push(poly(vs.map(([d, v]) => [V(v), D(d)]), { couleur: RED, largeur: 4 }));
  for (const [d, libelle, dy] of [[660, 'Moho', -10], [2890, 'Gutenberg', 22], [5150, 'Lehmann', -10]]) {
    out.push(ligne(G.x0, D(d), G.x1, D(d), { couleur: GRID, largeur: 1.6, pointilles: '6 6' }));
    out.push(texte(G.x0 + 12, D(d) + dy, libelle, { taille: 14, couleur: MUTE, ancre: 'start', gras: true, halo: true }));
  }
  out.push(texte(V(13.9), G.y1 + 30, 'km/s', { taille: 14, couleur: MUTE, ancre: 'end' }));
  out.push(texte(G.x0 - 12, G.y0 - 12, '0', { taille: 13, couleur: MUTE, ancre: 'middle' }));
  out.push(texte(G.x0 - 20, G.y1 + 4, '6400', { taille: 13, couleur: MUTE, ancre: 'end' }));
  out.push(texte(G.x0 - 12, G.y0 - 34, 'km', { taille: 14, couleur: MUTE, ancre: 'middle', gras: true }));

  repere(1, cx - 100, cy - 248);
  repere(2, cx + 258, cy - 96);
  repere(3, cx + 44, cy - 8);
  repere(4, V(9.2), D(1000));
  repere(5, V(1.4), D(4600));
  repere(6, V(11.8), D(660) - 16);
  return out;
});

// ── 5. u10 — composition chimique : SIAL, SIMA, péridotite ──────────────────────
planche('u10-sial-sima', 1200, 520, ({ repere }) => {
  const out = [];
  out.push(boite(40, 40, 1120, 600, { remplissage: '#fcfdfb', couleur: GRID, largeur: 2, rayon: 36 }));

  const oxydes = ['SiO₂', 'Al₂O₃', 'FeO·MgO', 'CaO'];
  const colonnes = [
    { x: 210, titre: 'SIAL', sous: 'granite', valeurs: [72, 14, 4, 2], couleur: GREEN, fond: GREEN_FILL },
    { x: 600, titre: 'SIMA', sous: 'basalte', valeurs: [50, 16, 12, 10], couleur: BLUE, fond: BLUE_FILL },
    { x: 990, titre: 'péridotite', sous: 'olivine · pyroxène', valeurs: [45, 4, 45, 3], couleur: AMBER, fond: AMBER_FILL },
  ];

  for (const c of colonnes) {
    out.push(texte(c.x, 108, c.titre, { taille: 23, couleur: c.couleur, ancre: 'middle', gras: true }));
    out.push(texte(c.x, 142, c.sous, { taille: 14, couleur: MUTE, ancre: 'middle' }));
    c.valeurs.forEach((v, i) => {
      const y = 190 + i * 92;
      out.push(texte(c.x - 150, y - 15, oxydes[i], { taille: 14, couleur: INK, ancre: 'start', gras: true }));
      out.push(boite(c.x - 150, y, 300, 42, { remplissage: '#f4f6f4', couleur: GRID, largeur: 1.5, rayon: 8 }));
      out.push(boite(c.x - 150, y, (300 * v) / 80, 42, { remplissage: c.fond, couleur: c.couleur, largeur: 2, rayon: 8 }));
      out.push(texte(c.x + 158, y + 28, `${v} %`, { taille: 15, couleur: c.couleur, ancre: 'start', gras: true }));
    });
  }

  repere(1, 210, 70);
  repere(2, 600, 70);
  repere(3, 990, 70);
  repere(4, 330, 211);
  repere(5, 600, 395);
  repere(6, 1116, 130);
  return out;
});

// ── 6. u10 — modèle interne : noyau solide sous pression ───────────────────────
planche('u10-modelisation-terre', 1200, 780, ({ repere }) => {
  const out = [];
  const cx = 380;
  const cy = 470;
  const demi = (r, o) => poly(
    [...Array.from({ length: 61 }, (_, i) => {
      const a = Math.PI + (i / 60) * Math.PI;
      return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
    }), [cx + r, cy], [cx - r, cy]],
    o,
  );
  out.push(demi(330, { couleur: INK, largeur: 3, remplissage: '#eef2ec' }));
  out.push(demi(250, { couleur: INK, largeur: 2.5, remplissage: AMBER_FILL }));
  out.push(demi(160, { couleur: INK, largeur: 2.5, remplissage: BLUE_FILL }));
  out.push(demi(84, { couleur: RED, largeur: 3, remplissage: RED_FILL }));

  // noyau externe liquide : pointillés ; noyau interne solide : hachures
  for (let a = Math.PI; a <= Math.PI * 2; a += 0.16) {
    for (const r of [100, 128, 152]) {
      out.push(rond(cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.98, 2.4, { remplissage: BLUE, couleur: BLUE, largeur: 1 }));
    }
  }
  // noyau interne solide : anneaux concentriques (le pointillé marque le liquide)
  for (const r of [26, 46, 66]) {
    out.push(poly(
      Array.from({ length: 41 }, (_, i) => {
        const a = Math.PI + (i / 40) * Math.PI;
        return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
      }),
      { couleur: RED, largeur: 1.6 },
    ));
  }

  // texte des couches
  out.push(texte(cx, cy - 60, 'Fe–Ni', { taille: 16, couleur: RED, ancre: 'middle', gras: true }));
  out.push(texte(cx, cy - 232, 'SIAL', { taille: 15, couleur: GREEN, ancre: 'middle', gras: true }));
  out.push(texte(cx, cy - 165, 'SIMA', { taille: 15, couleur: AMBER, ancre: 'middle', gras: true }));

  // courbe de température
  const G = { x0: 760, x1: 1130, y0: 200, y1: 640 };
  const D = (km) => G.y0 + (km / 6400) * (G.y1 - G.y0);
  const TT = (c) => G.x0 + (c / 6000) * (G.x1 - G.x0);
  out.push(ligne(G.x0, G.y1, G.x1, G.y1, { couleur: INK, largeur: 2.5 }));
  out.push(ligne(G.x0, G.y0, G.x0, G.y1, { couleur: INK, largeur: 2.5 }));
  out.push(poly([[TT(20), D(0)], [TT(600), D(100)], [TT(2000), D(660)], [TT(3500), D(2890)], [TT(4500), D(5150)], [TT(5200), D(6370)]], {
    couleur: RED, largeur: 4,
  }));
  out.push(texte(G.x1, G.y0 - 16, 'T (°C)', { taille: 15, couleur: INK, ancre: 'end', gras: true }));
  out.push(texte(G.x0 - 12, G.y0 - 16, 'km', { taille: 15, couleur: INK, ancre: 'end', gras: true }));
  out.push(texte(G.x0 - 12, G.y0 - 8, '0', { taille: 13, couleur: MUTE, ancre: 'middle' }));
  out.push(texte(G.x0 - 12, G.y1 + 4, '6400 km', { taille: 13, couleur: MUTE, ancre: 'middle' }));
  out.push(texte(G.x1, G.y1 + 26, '5200', { taille: 13, couleur: MUTE, ancre: 'middle' }));
  out.push(texte(G.x1 + 6, G.y1 + 46, '°C', { taille: 14, couleur: MUTE, ancre: 'end', gras: true }));

  repere(1, cx - 220, cy - 45);
  repere(2, cx - 120, cy - 120);
  repere(3, cx + 210, cy - 60);
  repere(4, cx, cy - 26);
  repere(5, TT(4700), D(5600));
  repere(6, TT(900), D(300));
  return out;
});

// ── 7. u11 — plis et failles ────────────────────────────────────────────────────
planche('u11-plis-failles', 1200, 760, ({ repere }) => {
  const out = [];
  const panneau = (x, y, libelle) => [
    boite(x, y, 520, 290, { remplissage: '#fcfdfb', couleur: GRID, largeur: 2, rayon: 20 }),
    texte(x + 24, y + 40, libelle, { taille: 22, couleur: INK, ancre: 'start', gras: true }),
  ];
  const strate = (pts, couleur) => poly(pts, { couleur, largeur: 3 });

  // A — pli anticlinal (compression)
  out.push(...panneau(50, 60, 'A'));
  for (let k = 0; k < 4; k += 1) {
    const pts = [];
    for (let i = 0; i <= 40; i += 1) {
      const x = 80 + (i / 40) * 460;
      const y = 300 - k * 34 - 62 * Math.exp(-(((x - 310) / 130) ** 2));
      pts.push([x, y]);
    }
    out.push(strate(pts, k % 2 ? AMBER : '#8a7a5c'));
  }
  out.push(fleche(120, 216, 236, 216, RED, 3, 11));
  out.push(fleche(500, 216, 384, 216, RED, 3, 11));

  // B — pli synclinal (compression)
  out.push(...panneau(630, 60, 'B'));
  for (let k = 0; k < 4; k += 1) {
    const pts = [];
    for (let i = 0; i <= 40; i += 1) {
      const x = 660 + (i / 40) * 460;
      const y = 214 + k * 34 + 62 * Math.exp(-(((x - 890) / 130) ** 2));
      pts.push([x, y]);
    }
    out.push(strate(pts, k % 2 ? AMBER : '#8a7a5c'));
  }
  out.push(fleche(700, 300, 816, 300, RED, 3, 11));
  out.push(fleche(1080, 300, 964, 300, RED, 3, 11));

  // C — faille normale (distension) : le compartiment de droite s'affaisse
  out.push(...panneau(50, 420, 'C'));
  const couches = [GREEN_FILL, AMBER_FILL, '#dfe7ea', '#efe6d8', '#e3ece6'];
  for (let i = 0; i < 5; i += 1) {
    out.push(boite(80, 470 + i * 32, 230, 32, { remplissage: couches[i], couleur: '#8a8f88', largeur: 1.2, rayon: 0 }));
    out.push(boite(310, 502 + i * 32, 230, 32, { remplissage: couches[i], couleur: '#8a8f88', largeur: 1.2, rayon: 0 }));
  }
  out.push(ligne(302, 466, 332, 634, { couleur: RED, largeur: 4 }));
  out.push(fleche(268, 676, 128, 676, RED, 3, 11));
  out.push(fleche(352, 676, 492, 676, RED, 3, 11));

  // D — faille inverse (compression) : le compartiment de droite remonte
  out.push(...panneau(630, 420, 'D'));
  for (let i = 0; i < 5; i += 1) {
    out.push(boite(660, 502 + i * 32, 230, 32, { remplissage: couches[i], couleur: '#8a8f88', largeur: 1.2, rayon: 0 }));
    out.push(boite(890, 470 + i * 32, 230, 32, { remplissage: couches[i], couleur: '#8a8f88', largeur: 1.2, rayon: 0 }));
  }
  out.push(ligne(882, 466, 912, 634, { couleur: RED, largeur: 4 }));
  out.push(fleche(800, 676, 940, 676, RED, 3, 11));
  out.push(fleche(1110, 676, 970, 676, RED, 3, 11));

  repere(1, 310, 138);
  repere(2, 890, 262);
  repere(5, 160, 216);
  repere(3, 318, 566);
  repere(4, 898, 534);
  repere(6, 410, 640);
  return out;
});

// ── 8. u11 — migmatite : fusion partielle et épaississement crustal ─────────────
planche('u11-migmatite', 1200, 760, ({ repere }) => {
  const out = [];
  out.push(boite(40, 40, 1120, 680, { remplissage: '#fcfdfb', couleur: GRID, largeur: 2, rayon: 36 }));

  // A — coupe : deux blocs continentaux qui se rencontrent, racine épaissie
  out.push(poly([[90, 150], [520, 150], [520, 470], [90, 470]], { couleur: INK, largeur: 3, remplissage: GREEN_FILL }));
  out.push(poly([[600, 150], [1030, 150], [1030, 470], [600, 470]], { couleur: INK, largeur: 3, remplissage: GREEN_FILL }));
  out.push(poly([[520, 150], [600, 150], [660, 470], [560, 570], [460, 470]], {
    couleur: INK, largeur: 3, remplissage: '#e8e4dc',
  }));
  out.push(fleche(120, 96, 380, 96, RED, 3, 12));
  out.push(fleche(1000, 96, 740, 96, RED, 3, 12));

  // zone de fusion partielle (migmatite) dans la racine
  out.push(ellipse(556, 462, 82, 50, { remplissage: RED_FILL, couleur: RED, largeur: 2.5 }));
  for (let i = -2; i <= 2; i += 1) {
    const pts = [];
    for (let x = 482; x <= 630; x += 6) pts.push([x, 462 + i * 14 + 6 * Math.sin((x - 480) / 18)]);
    out.push(poly(pts, { couleur: RED, largeur: 3 }));
  }

  // B — zoom : texture de la migmatite (leucosome clair dans un fond sombre)
  out.push(boite(760, 560, 360, 120, { remplissage: '#2f3a35', couleur: INK, largeur: 3, rayon: 12 }));
  for (let i = 0; i < 3; i += 1) {
    const pts = [];
    for (let x = 780; x <= 1100; x += 6) {
      pts.push([x, 594 + i * 30 + 8 * Math.sin((x - 780) / 26 + i)]);
    }
    out.push(poly(pts, { couleur: '#f6efe1', largeur: 6 }));
  }

  repere(1, 556, 250);
  repere(2, 556, 462);
  repere(3, 940, 610);
  repere(4, 626, 360);
  repere(5, 250, 96);
  repere(6, 1050, 566);
  return out;
});

// ── 9. u10 — zones d'ombre des ondes P et S (2ᵉ schéma de la leçon) ─────────────
planche('u10-zones-ombre', 1200, 760, ({ repere }) => {
  const out = [];
  const cx = 430;
  const cy = 390;
  const R = 300;
  const rc = 136;
  const T = Math.PI / 180;
  const ang = (deg, cote) => -Math.PI / 2 + cote * deg * T;

  out.push(rond(cx, cy, R, { remplissage: GREEN_FILL, couleur: INK, largeur: 3 }));
  out.push(rond(cx, cy, rc, { remplissage: AMBER_FILL, couleur: AMBER, largeur: 2.5 }));

  // anneau S (extérieur) puis anneau P (intérieur)
  const arc = (r, d0, d1, cote, couleur, largeur) => out.push(poly(
    arcEllipse(cx, cy, r, r, ang(d0, cote), ang(d1, cote), 50),
    { couleur, largeur },
  ));
  for (const cote of [1, -1]) {
    arc(R - 12, 0, 103, cote, GREEN, 18);
    arc(R - 12, 103, 180, cote, RED, 18);
    arc(R - 36, 0, 103, cote, GREEN, 13);
    arc(R - 36, 103, 143, cote, AMBER, 13);
    arc(R - 36, 143, 180, cote, GREEN, 13);
  }

  // rayons depuis le foyer
  const E = [cx, cy - R];
  out.push(rond(E[0], E[1], 9, { remplissage: RED, couleur: RED, largeur: 2 }));
  for (const deg of [45, 75]) {
    for (const cote of [1, -1]) {
      const a = ang(deg, cote);
      out.push(ligne(E[0], E[1], cx + Math.cos(a) * (R - 48), cy + Math.sin(a) * (R - 48), { couleur: MUTE, largeur: 1.6, pointilles: '5 6' }));
    }
  }
  // rayons qui doivent traverser la graine : arrêt sur le noyau puis trait plein
  for (const cote of [1, -1]) {
    const phi = 68 * T;
    const u = [Math.cos(phi) * cote, Math.sin(phi)];
    const ex = E[0] - cx;
    const ey = E[1] - cy;
    const b = 2 * (ex * u[0] + ey * u[1]);
    const c = ex * ex + ey * ey - rc * rc;
    const t = (-b - Math.sqrt(b * b - 4 * c)) / 2;
    const p1 = [E[0] + u[0] * t, E[1] + u[1] * t];
    const p2 = [E[0] + u[0] * (t + 96), E[1] + u[1] * (t + 96)];
    out.push(ligne(E[0], E[1], p1[0], p1[1], { couleur: AMBER, largeur: 2.4 }));
    out.push(ligne(p1[0], p1[1], p2[0], p2[1], { couleur: AMBER, largeur: 2.4, pointilles: '6 5' }));
  }

  // graduations et libellés d'angle
  for (const [deg, dy] of [[103, 7], [143, 18]]) {
    for (const cote of [1, -1]) {
      const a = ang(deg, cote);
      out.push(ligne(cx + Math.cos(a) * (rc + 4), cy + Math.sin(a) * (rc + 4), cx + Math.cos(a) * (R + 12), cy + Math.sin(a) * (R + 12), { couleur: MUTE, largeur: 1.4, pointilles: '4 5' }));
      out.push(texte(cx + Math.cos(a) * (R + 22) + 12 * cote, cy + Math.sin(a) * (R + 22) + dy, `${deg}°`, { taille: 15, couleur: INK, ancre: cote > 0 ? 'start' : 'end', gras: true, halo: true }));
    }
  }
  out.push(texte(cx, cy + R + 30, '180°', { taille: 15, couleur: INK, ancre: 'middle', gras: true, halo: true }));
  out.push(texte(cx, cy + 6, 'Fe–Ni', { taille: 16, couleur: AMBER, ancre: 'middle', gras: true }));

  // légende des trois couleurs
  const leg = [[GREEN, 'P, S'], [AMBER, 'P'], [RED, 'S']];
  leg.forEach(([couleur, libelle], i) => {
    const y = 200 + i * 62;
    out.push(ligne(820, y, 926, y, { couleur, largeur: 15 }));
    out.push(texte(944, y + 8, libelle, { taille: 21, couleur: INK, ancre: 'start', gras: true }));
  });

  repere(1, cx + 34, cy - R - 4);
  repere(2, cx + Math.cos(ang(50, 1)) * (R - 12), cy + Math.sin(ang(50, 1)) * (R - 12));
  repere(3, cx + Math.cos(ang(140, 1)) * (R - 12), cy + Math.sin(ang(140, 1)) * (R - 12));
  repere(4, cx + Math.cos(ang(122, 1)) * (R - 36), cy + Math.sin(ang(122, 1)) * (R - 36));
  repere(5, cx + Math.cos(ang(160, 1)) * (R - 36), cy + Math.sin(ang(160, 1)) * (R - 36));
  repere(6, cx + Math.cos(ang(25, 1)) * rc, cy + Math.sin(ang(25, 1)) * rc);

  return out;
});

// ───────────────────────────── écriture / vérification ─────────────────────────────

const diff = [];
for (const p of PLANCHES) {
  const chemin = join(SORTIE, `${p.slug}.svg`);
  const existant = existsSync(chemin) ? readFileSync(chemin, 'utf8') : null;
  if (existant !== p.svg) diff.push(p.slug);
  if (!VERIFIER) writeFileSync(chemin, p.svg, 'utf8');
}
if (!VERIFIER) {
  mkdirSync(TRACE, { recursive: true });
  writeFileSync(join(TRACE, 'reperes.json'),
    JSON.stringify(Object.fromEntries(PLANCHES.map((p) => [p.slug, p.reperes])), null, 2), 'utf8');
}

if (VERIFIER) {
  if (diff.length) {
    console.error(`Schémas périmés (relancer « node scripts/generer-schemas-svt.mjs ») : ${diff.join(', ')}`);
    process.exit(1);
  }
  console.log(`Schémas vectoriels : ${PLANCHES.length} — tous identiques au générateur.`);
} else {
  const ko = PLANCHES.reduce((s, p) => s + Buffer.byteLength(p.svg), 0);
  console.log(`Schémas vectoriels écrits : ${PLANCHES.length} — ${(ko / 1024).toFixed(1)} Ko au total.`);
  for (const p of PLANCHES) {
    console.log(`  ${p.slug}.svg  ${(Buffer.byteLength(p.svg) / 1024).toFixed(1)} Ko  ${p.reperes.length} repères`);
  }
}
