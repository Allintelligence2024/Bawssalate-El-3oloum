// ركّب الجواب — le constructeur de réponse par briques.
//
// L'élève clique des blocs, dans l'ordre, **sans clavier**. La vérification porte sur les rôles
// et leur ordre (utils/briques.ts) : aucune comparaison de texte, donc aucun faux négatif sur
// une formulation correcte mais différente de la nôtre.
//
// Rien n'est perdu en cas d'erreur : le message nomme le critère manquant, le tiroir s'ouvre
// sur le bon onglet, et la nouvelle tentative affiche le progrès Avant / Après.

import { useMemo, useState } from 'react';
import {
  basculerBrique,
  diagnosticPiege,
  evaluerAssemblage,
  LIBELLE_ROLE,
  type EvaluationBriques,
  type JeuBriques,
} from '../utils/briques';
import { ongletConseille, progres, type Progres } from '../utils/amelioration';
import type { OngletTiroir } from './TiroirBoussole';

interface Props {
  jeu: JeuBriques;
  /** Progrès déjà connu (tentative précédente) — affiché après validation. */
  progresConnu?: Progres | null;
  onEvaluer: (ids: string[], evaluation: EvaluationBriques) => void;
  onOuvrirTiroir?: (onglet: OngletTiroir) => void;
}

/** Mélange déterministe : la même consigne présente toujours les briques dans le même ordre. */
function melange<T>(liste: T[], graine: string): T[] {
  let h = 2166136261;
  for (let i = 0; i < graine.length; i++) h = Math.imul(h ^ graine.charCodeAt(i), 16777619) >>> 0;
  const sortie = [...liste];
  for (let i = sortie.length - 1; i > 0; i--) {
    h = (Math.imul(h, 1664525) + 1013904223) >>> 0;
    const j = h % (i + 1);
    [sortie[i], sortie[j]] = [sortie[j], sortie[i]];
  }
  return sortie;
}

export default function ConstructeurReponse({ jeu, progresConnu, onEvaluer, onOuvrirTiroir }: Props) {
  const [choisis, setChoisis] = useState<string[]>([]);
  const [evaluation, setEvaluation] = useState<EvaluationBriques | null>(null);
  const briques = useMemo(() => melange(jeu.briques, jeu.id), [jeu]);

  const valider = () => {
    const resultat = evaluerAssemblage(jeu, choisis);
    setEvaluation(resultat);
    onEvaluer(choisis, resultat);
  };

  const recommencer = () => {
    setEvaluation(null);
    setChoisis([]);
  };

  const progression =
    evaluation && progresConnu
      ? progres(progresConnu.avant, evaluation.score, evaluation.total)
      : null;

  return (
    <section dir="rtl" className="carte p-4" aria-label="ركّب الجواب">
      <div className="rangee rangee--entre">
        <p className="oeil">3 · ركّب الجواب</p>
        <span className="mention tnum">
          {choisis.length ? `${choisis.length} عنصرًا` : 'بلا كتابة'}
        </span>
      </div>
      <p className="petit doux mt-1">
        اختر العبارات التي تبني بها الجواب، بالترتيب الذي يريده المصحّح. لا تكتب شيئًا.
      </p>

      <div className="mt-3 space-y-2">
        {briques.map((brique) => {
          const choisi = choisis.includes(brique.id);
          const revele = evaluation && choisi;
          const role = revele ? LIBELLE_ROLE[brique.role] : null;
          const estPiege = revele && brique.role === 'piege';
          return (
            <button
              key={brique.id}
              type="button"
              aria-pressed={choisi}
              onClick={() => {
                setEvaluation(null);
                setChoisis((prev) => basculerBrique(prev, brique.id));
              }}
              className={`w-full rounded-2xl border px-4 py-3 text-right text-[13.5px] font-bold leading-relaxed transition ${
                estPiege
                  ? 'border-honey-line bg-honey-soft text-honey-ink'
                  : choisi
                    ? 'border-forest bg-sage text-forest-deep'
                    : 'border-line bg-paper text-ink hover:border-forest'
              }`}
            >
              {role && (
                <span className="mb-1 block text-[10px] font-black tracking-wide opacity-80">
                  {estPiege ? '⚠ فخّ' : `✓ ${role}`}
                </span>
              )}
              {brique.texte}
            </button>
          );
        })}
      </div>

      {!evaluation ? (
        <button
          type="button"
          className="btn--primaire mt-3 w-full"
          onClick={valider}
          disabled={choisis.length === 0}
        >
          تحقّق من البنية
        </button>
      ) : (
        <>
          <div
            role="status"
            className={`mt-3 rounded-xl border px-3 py-2 ${
              evaluation.complete
                ? 'border-forest bg-sage text-forest-deep'
                : 'border-honey-line bg-honey-soft text-honey-ink'
            }`}
          >
            <p className="text-[13px] font-bold leading-relaxed">{evaluation.message}</p>
            {evaluation.pieges.length > 0 && (
              <p className="mt-1 text-[12px] leading-relaxed">
                {diagnosticPiege(evaluation.pieges[0])}
              </p>
            )}
          </div>

          {progression && (
            <p className="petit doux mt-2 tnum" data-testid="avant-apres">
              {progression.phrase}
            </p>
          )}

          {!evaluation.complete && (
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                className="btn--secondaire w-full text-xs"
                onClick={() => onOuvrirTiroir?.(ongletConseille(evaluation))}
              >
                افتح البوصلة · {evaluation.manquants.length ? 'ناقص: ' : ''}
                {evaluation.critereNomme ?? 'الترتيب'}
              </button>
              <button type="button" className="btn--primaire w-full text-xs" onClick={recommencer}>
                أعد الترتيب
              </button>
            </div>
          )}

          {evaluation.complete && (
            <button type="button" className="btn--secondaire mt-3 w-full text-xs" onClick={recommencer}>
              أعدها مرّة أخرى
            </button>
          )}
        </>
      )}
    </section>
  );
}
