// وضع «المتدرّب» على موضوع رسمي (§10.3) — قراءة، تحرير، تقييم ذاتي 0/1/2.
//
// Le principe : l'élève ne consulte plus, il s'entraîne. Pour chaque consigne il lit le
// verbe de l'énoncé, écrit sa réponse en local, puis s'auto-évalue sur la grille.
//
// Trois refus explicites, visibles à l'écran :
//   - aucune note sur 20 (le résultat parle de maîtrise, pas de note) ;
//   - aucun verrou : on peut passer une consigne sans être bloqué ;
//   - l'auto-évaluation n'est pas une correction officielle, et l'écran le dit.
import { useState } from 'react';
import type { SujetOfficiel } from '../data/sujetsOfficiels';
import {
  construireGrille, calculerResultat, cleConsigne, priorites, statutQualitatif,
  type NiveauMaitrise,
} from '../utils/entrainement';
import SimulationEpreuve from './SimulationEpreuve';
import { nb } from '../utils/dates';
// v0.11 — méthode 1-2-3 dans le sujet : tiroir source vivant, accès jamais verrouillé.
import TiroirBoussole from './TiroirBoussole';
import type { AccesSujetCalcule } from '../utils/accesSujets';
import { attenduDe } from '../data/methodologie/attenduVerbes';
import type { Etat } from '../types';

interface Props {
  sujet: SujetOfficiel;
  /** Évaluations déjà enregistrées (persistance gérée par l'appelant). */
  evaluations: Record<string, NiveauMaitrise>;
  /** Réponses rédigées, par clé de consigne. */
  brouillons: Record<string, string>;
  onEvaluer: (cle: string, niveau: NiveauMaitrise) => void;
  onBrouillon: (cle: string, texte: string) => void;
  onFermer: () => void;
  /** Accès calculé (couverture, recommandation) — jamais un verrou, voir utils/accesSujets. */
  acces?: AccesSujetCalcule;
  /** « متابعة رغم ذلك » : l'appelant trace le choix, l'écran ne juge pas. */
  onPasseOutre?: () => void;
  /** Ouvre l'atelier 1-2-3 (briques) — pilote sur un sujet, extensible ensuite. */
  onOuvrirBriques?: () => void;
  /** État : sert au tiroir pour montrer les cartes de leçons gagnées. */
  etat?: Etat;
}

const LIBELLE_NIVEAU: Record<NiveauMaitrise, string> = {
  0: 'لم أصل',
  1: 'جزئيّ',
  2: 'مطابق',
};

const LIBELLE_STATUT = {
  fragile: 'هشّ — لنبدأ بالبطاقة الأولى',
  en_cours: 'في الطريق — واصل',
  solide: 'متين — يمكنك الانتقال',
} as const;

export default function EntraineurSujet({
  sujet,
  evaluations,
  brouillons,
  onEvaluer,
  onBrouillon,
  onFermer,
  acces,
  onPasseOutre,
  onOuvrirBriques,
  etat,
}: Props) {
  const grille = construireGrille(sujet);
  const resultat = calculerResultat(grille, evaluations);
  const [aide, setAide] = useState<string | null>(null);
  const [ouvert, setOuvert] = useState<string | null>(null);
  const [corrigeVisible, setCorrigeVisible] = useState<string | null>(null);
  // Simulation d'épreuve (§10.4) : même sujet, même grille 0/1/2, mais sous contrainte de temps.
  const [simulation, setSimulation] = useState(false);
  // Tiroir « source vivant » ouvert pour une consigne précise (null = fermé).
  const [tiroir, setTiroir] = useState<{ texte: string; verbe: string } | null>(null);
  const reprises = priorites(grille, evaluations);

  if (simulation) {
    return (
      <SimulationEpreuve
        sujet={sujet}
        evaluations={evaluations}
        brouillons={brouillons}
        onEvaluer={onEvaluer}
        onBrouillon={onBrouillon}
        onFermer={() => setSimulation(false)}
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="eyebrow">وضع المتدرّب — خطوة بخطوة</p>
        <div className="flex gap-2">
          <button type="button" onClick={() => setSimulation(true)} className="chip text-xs font-bold">
            محاكاة بالوقت (270 د)
          </button>
          <button type="button" onClick={onFermer} className="chip text-xs font-bold">عودة إلى القراءة</button>
        </div>
      </div>

      <p className="rounded-xl border border-gold/40 bg-gold-soft/30 px-3 py-2 text-[11px] leading-relaxed text-forest-deep">
        هذا تدريب على المراقبة الذاتية، ليس تصحيحًا رسميًّا ولا نقطة بكالوريا. لا يُقفل عليك شيء:
        يمكنك تجاوز أيّ تعليمة والعودة إليها لاحقًا.
      </p>

      {/* Accès au sujet : recommandation claire, jamais un verrou (v0.11). */}
      {acces && !acces.passeOutre && acces.recommandation && (
        <div className="card border border-gold/40 bg-gold-soft/30 p-3">
          <p className="text-[11.5px] font-bold leading-relaxed text-forest-deep">
            {acces.recommandation}
          </p>
          <button
            type="button"
            onClick={() => onPasseOutre?.()}
            className="chip mt-2 text-[11px] font-bold"
          >
            متابعة رغم ذلك
          </button>
        </div>
      )}

      {/* Résultat : un statut qualitatif, jamais un pourcentage présenté comme une note. */}
      <div className="card p-4">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-sm font-bold">أين أنت الآن؟</p>
          <span className="chip text-[11px] font-bold">{LIBELLE_STATUT[statutQualitatif(resultat.maitrise)]}</span>
        </div>
        <p className="mt-1 text-xs text-mute">
          من أصل {nb(grille.baremeTotal)} نقطة رسمية · التقييم الذاتي {nb(resultat.pointsObtenus)} نقطة
          {resultat.consignesSansCritere > 0 && ` · ${nb(resultat.consignesSansCritere)} تعليمة بلا عناصر إجابة`}
        </p>
        {reprises.length > 0 && (
          <div className="mt-2 rounded-lg bg-cream px-2.5 py-2">
            <p className="text-[11px] font-bold text-forest-deep">أقرب ما يُعيد إليك النقاط (٥ على الأكثر)</p>
            <ul className="mt-1 list-disc space-y-0.5 ps-4 text-[11px] leading-relaxed text-ink-soft">
              {reprises.map((c) => (
                <li key={cleConsigne(c)}>
                  التمرين {nb(c.exercice)} · {c.verbe} · {c.points !== null ? `${nb(c.points)} ن` : 'بلا سلّم'}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {grille.consignes.map((consigne, index) => {
        const cle = cleConsigne(consigne);
        const niveau = evaluations[cle];
        const estOuverte = ouvert === cle;
        return (
          <section key={cle} className="card p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-[11px] text-mute">
                {nb(index + 1)}/{nb(grille.consignes.length)} · التمرين {nb(consigne.exercice)}
              </p>
              <span className="chip text-[11px] font-bold">{consigne.points !== null ? `${nb(consigne.points)} ن` : 'بلا سلّم'}</span>
            </div>

            {/* Temps 1 : la consigne et son verbe */}
            <p className="mt-1.5 text-sm leading-relaxed text-ink">
              <button
                type="button"
                onClick={() => setAide(aide === cle ? null : cle)}
                className={`chip me-2 align-middle text-[11px] font-bold ${aide === cle ? 'border-forest bg-sage-soft/60' : ''}`}
                aria-expanded={aide === cle}
              >
                {consigne.verbe}
              </button>
              {consigne.texte}
            </p>
            {aide === cle && (consigne.attenteDuVerbe ?? attenduDe(consigne.verbe)?.attendu) && (
              <p className="mt-1 rounded-lg bg-sage-soft/50 px-2.5 py-1.5 text-xs text-forest-deep">
                ما يُنتظر من هذا الفعل: {consigne.attenteDuVerbe ?? attenduDe(consigne.verbe)?.attendu}
              </p>
            )}

            {/* البوصلة 1-2-3 : la méthode applicable à cette consigne, sans quitter le sujet. */}
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setTiroir({ texte: consigne.texte, verbe: consigne.verbe })}
                className="chip text-[11px] font-bold"
              >
                افتح البوصلة
              </button>
              {onOuvrirBriques && (
                <button
                  type="button"
                  onClick={onOuvrirBriques}
                  className="chip text-[11px] font-bold"
                >
                  ابنِ الجواب · 1-2-3
                </button>
              )}
            </div>

            {/* Temps 2 : rédaction locale */}
            <label className="mt-2 block">
              <span className="eyebrow">مسوّدتك (تبقى على جهازك)</span>
              <textarea
                value={brouillons[cle] ?? ''}
                onChange={(e) => onBrouillon(cle, e.target.value)}
                rows={3}
                placeholder="ملاحظة ← ربط ← استنتاج"
                className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm leading-relaxed"
              />
            </label>

            {/* Temps 3 : auto-évaluation 0/1/2 */}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-mute">قيّم نفسك:</span>
              {([0, 1, 2] as NiveauMaitrise[]).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => onEvaluer(cle, n)}
                  aria-pressed={niveau === n}
                  className={`chip text-xs font-bold ${niveau === n ? 'border-forest bg-sage-soft/60' : ''}`}
                >
                  {n} — {LIBELLE_NIVEAU[n]}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCorrigeVisible(corrigeVisible === cle ? null : cle)}
                className="chip text-[11px] font-bold"
                aria-expanded={corrigeVisible === cle}
              >
                {corrigeVisible === cle ? 'أخفِ عناصر الإجابة' : 'أظهر عناصر الإجابة'}
              </button>
            </div>

            {corrigeVisible === cle && (
              <div className="mt-2 rounded-lg border border-gold/40 bg-gold-soft/30 px-2.5 py-2 text-xs leading-relaxed text-forest-deep">
                <p className="font-bold">عناصر الإجابة (مختصرة من التصحيح النموذجي)</p>
                {consigne.attendu.length > 0 ? (
                  <ul className="mt-1 list-disc space-y-1 ps-4">
                    {consigne.attendu.map((a, k) => <li key={k}>{a}</li>)}
                  </ul>
                ) : (
                  <p className="mt-1 text-mute">لا توجد عناصر إجابة منشورة لهذه التعليمة.</p>
                )}
              </div>
            )}

            {estOuverte && null}
          </section>
        );
      })}

      {tiroir && (
        <TiroirBoussole
          document={`${sujet.id} · ${tiroir.texte}`}
          verbe={tiroir.verbe}
          etat={etat}
          onFermer={() => setTiroir(null)}
        />
      )}
    </div>
  );
}
