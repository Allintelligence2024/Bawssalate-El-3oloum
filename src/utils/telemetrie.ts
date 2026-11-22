// Télémétrie locale du pilote (§12.1 du Plan V2) — 100 % sur l'appareil.
//
// Objectif : savoir où les élèves butent réellement, sans aucun pistage serveur.
// Ce module n'envoie **rien**. Il compte, il agrège, et il laisse l'élève exporter
// un JSON qu'il décide lui-même d'envoyer.
//
// Ce qu'on n'enregistre jamais : texte libre, e-mail, nom, wilaya, journal, notes.
// Uniquement des compteurs agrégés et des durées. Un test vérifie qu'aucune clé
// exportée ne peut contenir de donnée personnelle.
import { CLE_STATS } from './stats';

export const CLE_TELEMETRIE = 'kunz_telemetrie_v1';

/** Phases du parcours (P1 → P6), telles qu'utilisées dans `plans/`. */
export type Phase = 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6';

export interface CompteursPhase {
  /** Nombre d'entrées dans la phase */
  entrees: number;
  /** Nombre de fois où l'élève est sorti sans terminer */
  abandons: number;
  /** Durées observées, en secondes (bornées à 2 h pour ne pas fausser la médiane) */
  durees: number[];
}

export interface Telemetrie {
  version: 1;
  phases: Record<Phase, CompteursPhase>;
  /** Blocages sur les portes : comptés, jamais reprochés */
  blocagesPortes: number;
  /** Mode intensif activé */
  modeIntensif: number;
  /** Indices Mūrshid demandés */
  indicesMurshid: number;
  /** Délais de synchronisation dépassés (BUG-007) */
  delaisSyncDepasses: number;
  /** Première et dernière écriture, ISO — pour situer la fenêtre du pilote */
  debut?: string;
  fin?: string;
}

const DUREE_MAX = 2 * 3600;

export function telemetrieVierge(): Telemetrie {
  return {
    version: 1,
    phases: {
      P1: { entrees: 0, abandons: 0, durees: [] },
      P2: { entrees: 0, abandons: 0, durees: [] },
      P3: { entrees: 0, abandons: 0, durees: [] },
      P4: { entrees: 0, abandons: 0, durees: [] },
      P5: { entrees: 0, abandons: 0, durees: [] },
      P6: { entrees: 0, abandons: 0, durees: [] },
    },
    blocagesPortes: 0,
    modeIntensif: 0,
    indicesMurshid: 0,
    delaisSyncDepasses: 0,
  };
}

/** Fonctions pures : la persistance est faite par l'appelant (localStorage). */

export function entrerPhase(t: Telemetrie, phase: Phase, le: string): Telemetrie {
  return {
    ...t,
    debut: t.debut ?? le,
    fin: le,
    phases: { ...t.phases, [phase]: { ...t.phases[phase], entrees: t.phases[phase].entrees + 1 } },
  };
}

export function sortirPhase(t: Telemetrie, phase: Phase, secondes: number, terminee: boolean, le: string): Telemetrie {
  const duree = Math.max(0, Math.min(DUREE_MAX, Math.round(secondes)));
  const p = t.phases[phase];
  return {
    ...t,
    fin: le,
    phases: {
      ...t.phases,
      [phase]: {
        ...p,
        abandons: terminee ? p.abandons : p.abandons + 1,
        // On garde les 200 dernières durées : au-delà, la médiane ne bouge plus et le
        // stockage local n'a pas à grossir indéfiniment sur un appareil à 2 Go.
        durees: [...p.durees, duree].slice(-200),
      },
    },
  };
}

export function incrementer(t: Telemetrie, cle: 'blocagesPortes' | 'modeIntensif' | 'indicesMurshid' | 'delaisSyncDepasses', n = 1): Telemetrie {
  return { ...t, [cle]: t[cle] + n };
}

/** Médiane sans trier l'entrée (copie locale). */
export function mediane(valeurs: number[]): number {
  if (valeurs.length === 0) return 0;
  const t = [...valeurs].sort((a, b) => a - b);
  const milieu = Math.floor(t.length / 2);
  return t.length % 2 === 0 ? Math.round((t[milieu - 1] + t[milieu]) / 2) : t[milieu];
}

/** Taux d'abandon d'une phase, 0 à 1. Zéro entrée → 0 (pas de division par zéro). */
export function tauxAbandon(t: Telemetrie, phase: Phase): number {
  const p = t.phases[phase];
  return p.entrees === 0 ? 0 : Math.round((p.abandons / p.entrees) * 1000) / 1000;
}

/**
 * Rapport exportable. Volontairement pauvre : que des nombres.
 * Aucune durée brute n'est exportée (elle permettrait de reconstituer un rythme de travail
 * personnel) — seulement la médiane et le nombre d'observations.
 */
export interface RapportPilote {
  format: 'kunz-rapport-pilote';
  version: 1;
  genereLe: string;
  fenetre: { debut?: string; fin?: string };
  phases: Record<Phase, { entrees: number; abandons: number; tauxAbandon: number; dureeMedianeSecondes: number; observations: number }>;
  blocagesPortes: number;
  modeIntensif: number;
  indicesMurshid: number;
  delaisSyncDepasses: number;
  /** Rappel explicite pour qui reçoit le fichier (champ nommé « avertissement » : le mot
   *  « note » est interdit dans un export — il évoquerait une note scolaire chiffrée). */
  avertissementAnonymat: string;
}

export function rapportPilote(t: Telemetrie, genereLe: string): RapportPilote {
  const phases = Object.fromEntries(
    (Object.keys(t.phases) as Phase[]).map((p) => [
      p,
      {
        entrees: t.phases[p].entrees,
        abandons: t.phases[p].abandons,
        tauxAbandon: tauxAbandon(t, p),
        dureeMedianeSecondes: mediane(t.phases[p].durees),
        observations: t.phases[p].durees.length,
      },
    ]),
  ) as RapportPilote['phases'];

  return {
    format: 'kunz-rapport-pilote',
    version: 1,
    genereLe,
    fenetre: { debut: t.debut, fin: t.fin },
    phases,
    blocagesPortes: t.blocagesPortes,
    modeIntensif: t.modeIntensif,
    indicesMurshid: t.indicesMurshid,
    delaisSyncDepasses: t.delaisSyncDepasses,
    avertissementAnonymat: 'مجهول تمامًا: أعداد ومدد مجمّعة فقط. لا بريد، لا اسم، لا نصّ حرّ، لا ولاية. لا يُرسَل تلقائيًّا.',
  };
}

/**
 * Relit une télémétrie stockée. Une valeur corrompue ne casse pas l'application :
 * on repart d'un compteur vierge plutôt que de perdre l'écran.
 */
export function lireTelemetrie(brut: string | null): Telemetrie {
  if (!brut) return telemetrieVierge();
  try {
    const v = JSON.parse(brut) as Partial<Telemetrie>;
    const vierge = telemetrieVierge();
    if (v.version !== 1) return vierge;
    const phases = { ...vierge.phases };
    for (const p of Object.keys(vierge.phases) as Phase[]) {
      const source = v.phases?.[p];
      if (source) {
        phases[p] = {
          entrees: Number.isFinite(source.entrees) ? Math.max(0, Math.trunc(source.entrees)) : 0,
          abandons: Number.isFinite(source.abandons) ? Math.max(0, Math.trunc(source.abandons)) : 0,
          durees: Array.isArray(source.durees)
            ? source.durees.filter((d) => Number.isFinite(d) && d >= 0 && d <= DUREE_MAX).slice(-200)
            : [],
        };
      }
    }
    const entier = (x: unknown) => (Number.isFinite(x) ? Math.max(0, Math.trunc(x as number)) : 0);
    return {
      version: 1,
      phases,
      blocagesPortes: entier(v.blocagesPortes),
      modeIntensif: entier(v.modeIntensif),
      indicesMurshid: entier(v.indicesMurshid),
      delaisSyncDepasses: entier(v.delaisSyncDepasses),
      debut: typeof v.debut === 'string' ? v.debut : undefined,
      fin: typeof v.fin === 'string' ? v.fin : undefined,
    };
  } catch {
    return telemetrieVierge();
  }
}

/** Clés qui ne doivent JAMAIS apparaître dans un rapport exporté. */
export const CLES_INTERDITES = [
  'email', 'nom', 'wilaya', 'daira', 'note', 'notes', 'carnet', 'journal',
  'brouillon', 'brouillons', 'motDePasse', 'jeton', CLE_STATS,
];

export function rapportSansDonneePersonnelle(r: RapportPilote): boolean {
  const texte = JSON.stringify(r).toLowerCase();
  return !CLES_INTERDITES.some((c) => texte.includes(c.toLowerCase()));
}

// ─────────────────────── pont avec l'application ───────────────────────
// L'interface ne manipule jamais le JSON : elle dit « je suis entré dans la phase 3 »
// ou « j'en sors, au bout de 42 s, sans l'avoir terminée ». La lecture-écriture est
// groupée ici pour qu'aucun composant n'ait à connaître le format.

type ActionPhase = 'entree' | 'sortie';

export function phaseDepuisId(id: number): Phase {
  const p = `P${Math.min(6, Math.max(1, Math.trunc(id)))}` as Phase;
  return p;
}

/**
 * Enregistre un événement de phase dans le stockage local. Ne lève jamais : la
 * télémétrie ne doit pas pouvoir casser une session de révision (stockage plein,
 * navigation privée, quota).
 */
export function consignerPhase(action: 'entree', id: number, le?: string): void;
export function consignerPhase(action: 'sortie', id: number, secondes: number, terminee: boolean, le?: string): void;
export function consignerPhase(
  action: ActionPhase,
  id: number,
  a?: number | string,
  b?: boolean,
  c?: string,
): void {
  try {
    if (typeof localStorage === 'undefined') return;
    const courante = lireTelemetrie(localStorage.getItem(CLE_TELEMETRIE));
    const phase = phaseDepuisId(id);
    const le = action === 'entree' ? (typeof a === 'string' ? a : new Date().toISOString()) : (c ?? new Date().toISOString());
    const suivante =
      action === 'entree'
        ? entrerPhase(courante, phase, le)
        : sortirPhase(courante, phase, typeof a === 'number' ? a : 0, b === true, le);
    localStorage.setItem(CLE_TELEMETRIE, JSON.stringify(suivante));
  } catch {
    // volontairement silencieux : la mesure ne vaut pas de faire échouer l'élève
  }
}

/** Compteur simple, même contrat : jamais d'exception. */
export function consignerCompteur(cle: 'blocagesPortes' | 'modeIntensif' | 'indicesMurshid' | 'delaisSyncDepasses', n = 1): void {
  try {
    if (typeof localStorage === 'undefined') return;
    const courante = lireTelemetrie(localStorage.getItem(CLE_TELEMETRIE));
    localStorage.setItem(CLE_TELEMETRIE, JSON.stringify(incrementer(courante, cle, n)));
  } catch {
    /* silence assumé */
  }
}
