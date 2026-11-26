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

// ── 5 bis. u2 — drépanocytose : Glu6 → Val6, polymérisation, hématie falciforme ──
planche('u2-drepanocytose', 1200, 700, ({ repere }) => {
  const out = [];
  const panneau = (x) => boite(x, 80, 300, 540, { remplissage: '#fcfdfb', couleur: GRID, largeur: 2, rayon: 22 });
  const lettre = (x, y, t) => texte(x, y, t, { taille: 15, couleur: MUTE, ancre: 'middle', gras: true });

  /** Tétramère α2β2 ; `mutation` remplace le groupe chargé de la position 6 par un patch apolaire. */
  const tetramere = (cx, cy, mutation) => {
    const s = [];
    const sousUnite = (dx, dy, l, couleur, fond) => [
      rond(cx + dx, cy + dy, 50, { remplissage: fond, couleur, largeur: 3 }),
      texte(cx + dx, cy + dy + 7, l, { taille: 20, couleur, ancre: 'middle', gras: true }),
    ];
    s.push(...sousUnite(-42, -36, 'α', BLUE, BLUE_FILL));
    s.push(...sousUnite(42, -36, 'β', GREEN, GREEN_FILL));
    s.push(...sousUnite(-42, 36, 'α', BLUE, BLUE_FILL));
    s.push(...sousUnite(42, 36, 'β', GREEN, GREEN_FILL));
    // position 6 de la chaîne β : groupement chargé (HbA) ou patch apolaire (HbS)
    const mx = cx + 42 + 40;
    const my = cy + 36 + 40;
    s.push(ligne(cx + 42, cy - 36, mx, my, { couleur: mutation ? AMBER : RED, largeur: 2, pointilles: '5 4' }));
    s.push(boite(mx - 15, my - 15, 30, 30, {
      remplissage: mutation ? AMBER_FILL : RED_FILL,
      couleur: mutation ? AMBER : RED,
      largeur: 2.5,
      rayon: 8,
    }));
    if (!mutation) s.push(texte(mx, my + 8, '−', { taille: 24, couleur: RED, ancre: 'middle', gras: true }));
    else {
      // trois petits traits rayonnants : le patch hydrophobe qui « colle » aux voisins
      for (const a of [-2.4, -1.57, -0.75]) {
        s.push(ligne(mx + 18 * Math.cos(a), my + 18 * Math.sin(a),
          mx + 27 * Math.cos(a), my + 27 * Math.sin(a), { couleur: AMBER, largeur: 3 }));
      }
    }
    return s;
  };

  /** Hématie normale : disque biconcave (deux ellipses). */
  const hematieNormale = (cx, cy) => [
    ellipse(cx, cy, 96, 58, { remplissage: RED_FILL, couleur: RED, largeur: 3 }),
    ellipse(cx, cy, 44, 24, { remplissage: PAPER, couleur: RED, largeur: 2, pointilles: '6 5' }),
  ];

  /** Hématie falciforme : croissant (cercle extérieur moins cercle décalé). */
  const falciforme = (cx, cy) => {
    const R = 98;
    const d = 46;
    const a0 = Math.acos(d / (2 * R));
    const pts = [];
    for (let i = 0; i <= 60; i += 1) {
      const a = a0 + (i / 60) * (Math.PI * 2 - 2 * a0);
      pts.push([cx + R * Math.cos(a), cy + R * Math.sin(a) * 0.9]);
    }
    for (let i = 60; i >= 0; i -= 1) {
      const a = a0 + (i / 60) * (Math.PI * 2 - 2 * a0);
      pts.push([cx - d + R * Math.cos(a), cy + R * Math.sin(a) * 0.9]);
    }
    return [poly(pts, { remplissage: RED_FILL, couleur: RED, largeur: 3 })];
  };

  // A — à droite (sens de lecture arabe) : HbA, hématie normale
  out.push(panneau(840));
  out.push(lettre(990, 116, 'A'));
  out.push(...tetramere(990, 262, false));
  out.push(...hematieNormale(990, 528));
  out.push(texte(990, 600, 'HbA', { taille: 17, couleur: INK, ancre: 'middle', gras: true }));

  // B — au centre : HbS, contact hydrophobe, fibres
  out.push(panneau(434));
  out.push(lettre(584, 116, 'B'));
  out.push(...tetramere(584, 232, true));
  for (const [i, y] of [452, 492, 532].entries()) {
    out.push(ligne(742, y + 6, 468, y, { couleur: RED, largeur: 11 }));
    for (const t of [0.18, 0.5, 0.82]) {
      out.push(boite(468 + (742 - 468) * t - 9, y - 3 - 9 + 3, 18, 18, {
        remplissage: AMBER_FILL, couleur: AMBER, largeur: 2, rayon: 4,
      }));
    }
    if (i === 2) out.push(texte(584, 578, 'HbS', { taille: 17, couleur: INK, ancre: 'middle', gras: true }));
  }

  // C — à gauche : hématie falciforme
  out.push(panneau(60));
  out.push(lettre(210, 116, 'C'));
  out.push(...falciforme(240, 330));
  out.push(texte(210, 520, 'HbS', { taille: 17, couleur: INK, ancre: 'middle', gras: true }));

  // Flèches : A → B (mutation) puis B → C (conséquence)
  out.push(fleche(828, 300, 748, 300, INK, 3));
  out.push(fleche(424, 300, 372, 300, INK, 3));

  repere(1, 990, 528);
  repere(2, 884, 200);
  repere(3, 1112, 338);
  repere(4, 702, 308);
  repere(5, 584, 426);
  repere(6, 215, 330);
  return out;
});

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

// ── L3. u4 — phagocytose : du complexe immun à la digestion ──────────────────────
planche('u4-phagocytose', 1200, 720, ({ repere }) => {
  const out = [];
  const panneau = (x) => boite(x, 80, 260, 400, { remplissage: '#fcfdfb', couleur: GRID, largeur: 2, rayon: 20 });
  const macro = (cx, cy) =>
    organique(cx, cy, (a) => 96 + 14 * Math.sin(a * 3), {
      couleur: INK, largeur: 3, remplissage: GREEN_FILL,
    });

  // 1 — complexe immun (antigène entouré d'anticorps)
  out.push(panneau(60));
  out.push(rond(190, 250, 34, { remplissage: AMBER_FILL, couleur: AMBER, largeur: 3 }));
  for (const angle of [-135, -90, -45]) {
    const ax = 190 + 52 * Math.cos((angle * Math.PI) / 180);
    const ay = 250 + 52 * Math.sin((angle * Math.PI) / 180);
    out.push(anticorps(ax, ay, 32, { couleur: RED, largeur: 3, rotation: angle + 90 }));
  }
  out.push(texte(190, 430, 'Ag–Ac', { taille: 16, couleur: INK, ancre: 'middle', gras: true }));

  // 2 — fixation du Fc sur le récepteur du macrophage
  out.push(panneau(340));
  out.push(macro(470, 300));
  out.push(rond(357, 300, 22, { remplissage: AMBER_FILL, couleur: AMBER, largeur: 2.5 }));
  out.push(anticorps(392, 296, 24, { couleur: RED, largeur: 3, rotation: 0 }));
  out.push(poly([[384, 316], [398, 340], [370, 340]], { couleur: INK, largeur: 3, remplissage: PAPER }));

  // 3 — invagination : la membrane englobe, la vésicule se referme
  out.push(panneau(620));
  out.push(macro(750, 300));
  out.push(rond(750, 300, 34, { remplissage: AMBER_FILL, couleur: RED, largeur: 3, pointilles: '6 5' }));
  out.push(texte(750, 306, 'Ag', { taille: 13, couleur: AMBER, ancre: 'middle', gras: true }));

  // 4 — lysosomes : digestion du contenu
  out.push(panneau(900));
  out.push(macro(1030, 300));
  out.push(rond(1015, 286, 26, { remplissage: RED_FILL, couleur: RED, largeur: 2.5 }));
  for (const [dx, dy] of [[-12, 4], [4, -8], [10, 10]]) {
    out.push(rond(1015 + dx, 286 + dy, 5, { remplissage: AMBER, couleur: AMBER, largeur: 1 }));
  }
  for (const a of [0.4, 1.6, 2.8]) {
    out.push(rond(1015 + 44 * Math.cos(a), 286 + 44 * Math.sin(a), 15, { remplissage: AMBER_FILL, couleur: AMBER, largeur: 2 }));
  }
  for (const [x1, x2] of [[322, 336], [602, 616], [882, 896]]) out.push(fleche(x1, 280, x2, 280, INK, 3));

  repere(1, 190, 250);
  repere(2, 190, 188);
  repere(3, 410, 300);
  repere(4, 672, 306);
  repere(5, 762, 350);
  repere(6, 1082, 334);
  return out;
});

// ── L4. u4 — LTc : double reconnaissance et perforine ────────────────────────────
planche('u4-ltc-perforine', 1200, 700, ({ repere }) => {
  const out = [];
  const panneau = (x) => boite(x, 60, 540, 560, { remplissage: '#fcfdfb', couleur: GRID, largeur: 2, rayon: 22 });

  // A — double reconnaissance : TCR + peptide/CMH-I, et CD8 + CMH-I
  out.push(panneau(60));
  out.push(boite(120, 200, 380, 180, { remplissage: '#eef2ec', couleur: INK, largeur: 3, rayon: 16 }));
  out.push(ellipse(200, 292, 54, 46, { remplissage: PAPER, couleur: BLUE, largeur: 2.5 }));
  out.push(boite(408, 350, 36, 30, { remplissage: AMBER_FILL, couleur: AMBER, largeur: 2.5, rayon: 4 }));
  out.push(texte(392, 344, 'CMH-I', { taille: 14, couleur: GREEN, ancre: 'end', gras: true }));
  out.push(rond(426, 470, 64, { remplissage: BLUE_FILL, couleur: BLUE, largeur: 3 }));
  out.push(anticorps(426, 404, 30, { couleur: BLUE, largeur: 3 }));
  out.push(boite(462, 408, 34, 22, { remplissage: PAPER, couleur: RED, largeur: 2.5, rayon: 5 }));
  out.push(texte(479, 424, 'CD8', { taille: 11, couleur: RED, ancre: 'middle', gras: true }));

  // B — perforine : pores, entrée d'eau, lyse
  out.push(panneau(620));
  out.push(boite(668, 196, 440, 230, { remplissage: '#f6f8f5', couleur: RED, largeur: 2.5, rayon: 20, pointilles: '8 7' }));
  out.push(boite(700, 216, 380, 170, { remplissage: '#eef2ec', couleur: INK, largeur: 3, rayon: 16 }));
  out.push(rond(680, 470, 64, { remplissage: BLUE_FILL, couleur: BLUE, largeur: 3 }));
  out.push(texte(680, 476, 'LTc', { taille: 13, couleur: BLUE, ancre: 'middle', gras: true }));
  // granules de perforine libérés dans la fente
  for (const [x, y] of [[706, 418], [724, 400], [740, 384]]) {
    out.push(rond(x, y, 6, { remplissage: RED_FILL, couleur: RED, largeur: 2 }));
  }
  for (const x of [800, 880, 960]) {
    out.push(rond(x, 216, 10, { remplissage: PAPER, couleur: RED, largeur: 3 }));
    out.push(fleche(x, 236, x, 286, BLUE, 2.5, 8));
  }
  out.push(texte(880, 330, 'H₂O', { taille: 15, couleur: BLUE, ancre: 'middle', gras: true }));

  repere(1, 426, 470);
  repere(2, 396, 400);
  repere(3, 508, 404);
  repere(4, 426, 352);
  repere(5, 662, 430);
  repere(6, 1040, 404);
  return out;
});

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

// ── L10. u5 — morphine et enképhaline : inhibition présynaptique ────────────────
planche('u5-morphine', 1200, 720, ({ repere }) => {
  const out = [];
  // terminaison présynaptique
  out.push(organique(600, 250, (a) => 172 + 20 * Math.sin(a * 3), {
    couleur: INK, largeur: 3.5, remplissage: GREEN_FILL,
  }));
  // vésicules de substance P
  for (const [x, y] of [[520, 200], [600, 176], [676, 208], [560, 288], [652, 292]]) {
    out.push(rond(x, y, 22, { remplissage: PAPER, couleur: GREEN, largeur: 2.5 }));
    out.push(texte(x, y + 5, 'P', { taille: 13, couleur: GREEN, ancre: 'middle', gras: true }));
  }
  // récepteur opioïde + morphinique
  out.push(boite(536, 378, 46, 58, { remplissage: PAPER, couleur: AMBER, largeur: 3, rayon: 8 }));
  out.push(boite(546, 392, 26, 26, { remplissage: AMBER_FILL, couleur: AMBER, largeur: 2.5, rayon: 6 }));
  // canal Ca²⁺ fermé
  out.push(boite(660, 392, 40, 42, { remplissage: PAPER, couleur: BLUE, largeur: 3, rayon: 8 }));
  out.push(ligne(654, 386, 706, 440, { couleur: RED, largeur: 4 }));
  out.push(ligne(654, 440, 706, 386, { couleur: RED, largeur: 4 }));
  out.push(texte(756, 452, 'Ca²⁺', { taille: 14, couleur: BLUE, ancre: 'middle', gras: true }));
  // fente synaptique + membrane postsynaptique
  out.push(ligne(300, 470, 900, 470, { couleur: INK, largeur: 3 }));
  out.push(ligne(300, 520, 900, 520, { couleur: INK, largeur: 3 }));
  for (const x of [400, 520, 640, 760]) {
    out.push(boite(x - 18, 512, 36, 18, { remplissage: PAPER, couleur: RED, largeur: 2.5, rayon: 6 }));
  }
  out.push(texte(860, 500, 'P', { taille: 14, couleur: MUTE, ancre: 'middle', gras: true }));
  // flèche barrée : pas d'exocytose
  out.push(fleche(600, 340, 600, 400, MUTE, 3));
  out.push(ligne(578, 352, 622, 392, { couleur: RED, largeur: 4 }));

  repere(1, 508, 456);
  repere(2, 500, 396);
  repere(3, 680, 412);
  repere(4, 600, 200);
  repere(5, 644, 352);
  repere(6, 520, 520);
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
