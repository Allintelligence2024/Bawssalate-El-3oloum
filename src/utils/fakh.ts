// صيّاد الفخاخ — la chasse aux pièges.
//
// Règle de sûreté : on n'invente AUCUNE affirmation « vraie ». Chaque énoncé vient
// d'un QCM écrit à la main : `options[0]` est la bonne réponse (donc vraie), les
// options 1..3 sont les distracteurs voulus par l'auteur (donc des pièges).
// Les `piegesAr` officiels des unités servent de fiche de référence, pas de quiz.

import { QCM_LECONS, type QcmLecon } from '../data/qcmLecons';
import { UNITE_PAR_ID, UNITES, titreLecon } from '../data/programme';
import type { Etat } from '../types';

export interface Piege {
  cle: string;
  enonce: string;
  /** true = affirmation juste ; false = piège.
   *  Le nom `vrai` décrit l'énoncé, pas la réponse attendue. */
  vrai: boolean;
  explication: string;
  leconId: string;
  lecon: string;
}

const TAILLE_SERIE = 8;
const MOITIE = TAILLE_SERIE / 2;

function hache(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0;
  return h;
}

/** Tous les énoncés disponibles pour une unité, triés de façon stable. */
export function enoncesDeUnite(uniteId: string): Piege[] {
  const u = UNITE_PAR_ID[uniteId];
  if (!u) return [];
  const sortie: Piege[] = [];
  for (const leconId of u.lessonIds) {
    const q = QCM_LECONS[leconId];
    if (!q) continue;
    const paires: [string, QcmLecon][] = [
      ['rappel', q.rappel],
      ['synthese', q.synthese],
    ];
    for (const [type, qcm] of paires) {
      qcm.options.forEach((enonce, i) => {
        // On écarte les fragments de liste (« 3 قواعد / AUG ») : hors contexte, ils ne
        // forment pas une affirmation qu'on peut juger vraie ou fausse.
        if (enonce.includes(' / ') || enonce.trim().length < 12) return;
        sortie.push({
          cle: `fakh:${leconId}:${type}:${i}`,
          enonce,
          vrai: i === 0,
          explication: qcm.explication,
          leconId,
          lecon: titreLecon(leconId),
        });
      });
    }
  }
  return sortie.sort((a, b) => hache(a.cle) - hache(b.cle) || a.cle.localeCompare(b.cle));
}

/**
 * La série d'une unité : 4 affirmations justes + 4 pièges, dans un ordre stable.
 * Une unité sans QCM rend un tableau vide (l'écran le dit, il ne fabrique rien).
 */
export function serieFakh(uniteId: string, taille = TAILLE_SERIE): Piege[] {
  const tous = enoncesDeUnite(uniteId);
  if (tous.length === 0) return [];
  const demie = Math.max(1, Math.floor(taille / 2));
  const vraies = tous.filter((p) => p.vrai).slice(0, demie);
  const fausses = tous.filter((p) => !p.vrai).slice(0, taille - vraies.length);
  // Mélange déterministe : sans ça, la série alternerait vrai/faux et deviendrait
  // devinable dès la deuxième phrase. Même tirage à chaque rendu.
  return [...vraies, ...fausses]
    .sort((a, b) => hache(`s:${a.cle}`) - hache(`s:${b.cle}`) || a.cle.localeCompare(b.cle))
    .slice(0, taille);
}

/** Les pièges officiels (texte fourni par le programme), groupés par unité. */
export function piegesOfficiels(): { uniteId: string; unite: string; items: string[] }[] {
  return UNITES.filter((u) => (u.piegesAr?.length ?? 0) > 0).map((u) => ({
    uniteId: u.id,
    unite: u.titre,
    items: u.piegesAr ?? [],
  }));
}

/** Avancement dans une série d'unité. */
export function avancementSerie(etat: Etat, uniteId: string): { trouves: number; total: number; finie: boolean } {
  const serie = serieFakh(uniteId);
  const trouves = serie.filter((p) => etat.fakh?.[p.cle]).length;
  return { trouves, total: serie.length, finie: serie.length > 0 && trouves === serie.length };
}

/** Unités qui ont de quoi jouer (au moins une série). */
export function unitesJouables(): string[] {
  return UNITES.filter((u) => serieFakh(u.id).length > 0).map((u) => u.id);
}

export { MOITIE };
