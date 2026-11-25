// دوال مساعدة نقية لتوليد الخيارات، البطاقات، وسلّم المساعدة
import { operations, methodesExercices, VERBE_OPERATION, infosVerbe } from './verbesEtMethodes';
import { exercicesEnquete, type ExerciceEnquete } from './enquetesAutopsie';
import { exercicesUnite1, type ExerciceUnite1 } from './exercicesUnite1';

// Les 3 propositions, en rotation déterministe : la bonne réponse n'est pas toujours en 1re position.
// Port du commit arena fa88370 (choices + correctChoice) : la rotation maison s'applique sur les
// 3 propositions fournies et recalcule l'index de la bonne réponse.
export function optionsExercice(i: number): { options: string[]; bonne: number } {
  const item = exercicesUnite1[i];
  const decalage = (i * 2 + 1) % 3;
  const options = item.choices.map((_, k) => item.choices[(k + decalage) % 3]);
  // La bonne réponse choices[correctChoice] se retrouve à l'index (correctChoice - décalage).
  return { options, bonne: (item.correctChoice - decalage + 3) % 3 };
}

/** اختر المنطقة — étiquette A/B/C/D des zones du schéma (وثيقة تفاعلية). */
export function lettreZone(i: number): string {
  return String.fromCharCode(65 + i);
}

/** Les 3 propositions d'un مسار — rotation déterministe (la bonne n'est plus figée en 1ʳᵉ position). */
export function optionsMethode(i: number): { options: string[]; bonne: number } {
  const item = methodesExercices[i] ?? methodesExercices[0];
  const decalage = (i * 2 + 1) % 3;
  const options = item.options.map((_, k) => item.options[(k + decalage) % 3]);
  return { options, bonne: (0 - decalage + 3) % 3 };
}

/** Les 3 propositions d'une étape d'enquête — rotation déterministe (même règle que les مسارات). */
export function optionsEnquete(exo: number, etape: number): { options: string[]; bonne: number } {
  const item = exercicesEnquete[exo]?.etapes[etape] ?? exercicesEnquete[0].etapes[0];
  const decalage = (exo * 2 + etape + 1) % 3;
  const options = item.options.map((_, k) => item.options[(k + decalage) % 3]);
  return { options, bonne: (0 - decalage + 3) % 3 };
}

// ───────────── محرّر الجواب — assemblage de tuiles, zéro clavier (audit) ─────────────
// La réponse modèle de chaque exercice est découpée en segments (phrases/clauses). L'élève
// remet les tuiles dans l'ordre : pour chaque emplacement il choisit la bonne continuation
// parmi 3 candidats (1 bonne tuile + 2 leurres plausibles tirés de la rubrique). Zéro champ de
// saisie, retry sans révélation, sons maison, aucune date ni pourcentage.
export function segmentsReponse(texte: string): string[] {
  return texte
    .replace(/([.،؛:])\s*/g, '$1|')
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Réserve de leurres : segments des autres réponses + erreurs fréquentes de la rubrique. */
export const RESERVE_TUILES: string[] = [
  ...exercicesUnite1.flatMap((e) => segmentsReponse(e.reponse)),
  ...exercicesUnite1.map((e) => e.erreur),
];

/** Candidats d'un emplacement : rotation déterministe, 1 bonne tuile + 2 leurres. */
export function tuilesEmplacement(i: number, k: number): { options: string[]; bonne: number } {
  const bonne = segmentsReponse(exercicesUnite1[i].reponse)[k];
  const leurres = RESERVE_TUILES.filter((s) => s !== bonne);
  const a = leurres[(i * 7 + k * 3 + 1) % leurres.length];
  let j = (i * 7 + k * 3 + 5) % leurres.length;
  if (leurres[j] === a) j = (j + 1) % leurres.length;
  const base = [bonne, a, leurres[j]];
  const decalage = (i + k) % 3;
  const options = base.map((_, x) => base[(x + decalage) % 3]);
  return { options, bonne: (3 - decalage) % 3 };
}

/** Candidats d'un emplacement du محرّر 5 tuiles : la bonne + ses 2 leurres calibrés.
 *  La variante (incrémentée à chaque erreur) remélange l'affichage sans jamais révéler la bonne. */
export function tuilesEmplacementEnquete(
  exo: number,
  k: number,
  variante: number,
): { options: string[]; bonne: number } {
  const m = exercicesEnquete[exo]?.modele ?? exercicesEnquete[0].modele;
  const base = [m.tuiles[k], m.leurres[k][0], m.leurres[k][1]];
  const decalage = (exo + k + variante + 1) % 3;
  const options = base.map((_, x) => base[(x + decalage) % 3]);
  return { options, bonne: (3 - decalage) % 3 };
}

/** Candidats du blank courant du mode cloze : 1 lexie correcte + 2 leurres typés.
 *  La variante (incrémentée à chaque erreur) fait tourner la position sans jamais révéler la bonne. */
export function tuilesClozeEmplacement(
  exo: number,
  k: number,
  b: number,
  variante: number,
): { options: string[]; bonne: number } {
  const m = exercicesEnquete[exo]?.modele ?? exercicesEnquete[0].modele;
  const base = m.cloze?.[k]?.blancs[b]?.options ?? ['', '', ''];
  const decalage = (exo + k + b + variante + 1) % 3;
  const options = base.map((_, x) => base[(x + decalage) % 3]);
  return { options, bonne: (3 - decalage) % 3 };
}

/** Les 3 barreaux d'un exercice — la preuve n'y figure jamais. */
export function barreauxAide(item: ExerciceUnite1): [string, string, string] {
  const [vn, vdef, vex] = infosVerbe(item.verbe);
  const op = operations[VERBE_OPERATION[vn] ?? 1];
  return [
    `أين تنظر؟ ركّز على «${item.document}». أعد قراءة مناطق المخطط واحدة واحدة، واسأل: أيّها يحمل المعطى النافع الذي يجيب عن السؤال؟`,
    `أي عملية الآن؟ اسأل: ${op[1]} — وفرّق بين ${operations[0][0]} (${operations[0][2]}) · ${operations[1][0]} (${operations[1][2]}) · ${operations[2][0]} (${operations[2][2]}). الفعل «${item.verbe}» هنا معناه: ${vdef} — اربطه بالسند قبل أن تختار.`,
    `قاعدة منهجية عامة — «${vn}»: ${vdef} (مثال واسع: ${vex}). القاعدة تبقى صحيحة حتى لو غيّرنا السند؛ اطبقها ثم تحقق.`,
  ];
}

