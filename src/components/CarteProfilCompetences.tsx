// Profil de compétences C1–C8, affiché dans l'onglet أنا.
//
// Consomme enfin `bridge.ts` : jusqu'ici le moteur était complet et testé mais aucun écran
// ne l'appelait, donc le travail de l'élève dans l'entraîneur ne lui servait à rien.
//
// L'écran refuse les trois choses que le moteur refuse : aucune note /20, aucun pourcentage
// anxiogène, aucun verrou. Il nomme la compétence la plus faible et dit pourquoi en arabe.
import { faiblessesMesurees, LIBELLE_COMPETENCE, nombreEvaluations, profilCompetences } from '../utils/profil';
import { niveauConfiance } from '../utils/bridge';
import { COMPETENCES } from '../utils/bridgeAdapter';
import { nb } from '../utils/dates';
import type { EvaluationsParSujet } from '../utils/profil';

interface Props {
  evaluations: EvaluationsParSujet | undefined;
  onOuvrirEntraineur: () => void;
}

const LIBELLE_STATUT = {
  fragile: 'هشّ',
  en_cours: 'في الطريق',
  solide: 'متين',
} as const;

export default function CarteProfilCompetences({ evaluations, onOuvrirEntraineur }: Props) {
  const evals = evaluations ?? {};
  const total = nombreEvaluations(evals);

  if (total === 0) {
    return (
      <section className="card mt-5 p-5">
        <p className="eyebrow">كفاءاتك الثماني</p>
        <p className="mt-2 text-xs leading-relaxed text-mute">
          لم تُقيّم أيّ تعليمة بعد. افتح وضع المتدرّب على موضوع رسمي، أجب ثم قيّم نفسك 0 / 1 / 2:
          يتبيّن لك بعدها أضعف فعل علمي، لا نقطة.
        </p>
        <button type="button" onClick={onOuvrirEntraineur} className="btn btn-ghost mt-3 w-full text-sm">
          ابدأ التدريب على موضوع ←
        </button>
      </section>
    );
  }

  const niveaux = profilCompetences(evals);
  const faiblesses = faiblessesMesurees(evals, 3);
  const mesurees = COMPETENCES.filter((c) => niveaux[c].preuves > 0);

  return (
    <section className="card mt-5 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="eyebrow">كفاءاتك الثماني</p>
        <span className="chip text-[11px]">{nb(total)} تعليمة مقيَّمة</span>
      </div>

      {faiblesses.length > 0 && (
        <div className="mt-3 rounded-xl border border-gold/40 bg-gold-soft/30 px-3 py-2">
          <p className="text-xs font-bold text-forest-deep">
            ابدأ بـ: {LIBELLE_COMPETENCE[faiblesses[0].competence]}
          </p>
          <ul className="mt-1 list-disc space-y-0.5 ps-4 text-[11px] leading-relaxed text-forest-deep">
            {faiblesses[0].raisons.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </div>
      )}

      <ul className="mt-3 space-y-1.5">
        {mesurees.map((c) => {
          const n = niveaux[c];
          // Statut propre à la compétence : même seuils que `statutUnite`, appliqués au
          // niveau corrigé de cette seule compétence.
          const conf = niveauConfiance(n);
          const statut = conf < 40 ? 'fragile' : conf < 75 ? 'en_cours' : 'solide';
          return (
            <li key={c} className="flex items-center justify-between gap-2 rounded-lg bg-pale px-3 py-2">
              <span className="text-[11px] font-bold">{LIBELLE_COMPETENCE[c]}</span>
              <span className="flex items-center gap-1.5 text-[11px] text-mute">
                {/* Trois paliers, jamais un chiffre : le statut se lit d'un coup d'œil. */}
                <span
                  aria-hidden="true"
                  className={`inline-block h-2 w-2 rounded-full ${
                    statut === 'fragile' ? 'bg-clay' : statut === 'en_cours' ? 'bg-gold' : 'bg-forest'
                  }`}
                />
                {LIBELLE_STATUT[statut]} · {nb(n.preuves)} دليل
              </span>
            </li>
          );
        })}
      </ul>

      {mesurees.length < COMPETENCES.length && (
        <p className="mt-2 text-[11px] text-mute">
          {nb(COMPETENCES.length - mesurees.length)} كفاءات لم تُقس بعد. لا نضعها في الترتيب
          قبل قياسها، ولا نعدّ غياب الدليل ضعفًا.
        </p>
      )}

      <p className="mt-3 rounded-xl bg-pale px-3 py-2 text-[11px] leading-relaxed text-mute">
        هذا ترتيب للأعمال لا حكم على مستواك، ولا يُغلق عليك أيّ موضوع في البكالوريا.
      </p>
      <button type="button" onClick={onOuvrirEntraineur} className="btn btn-ghost mt-3 w-full text-sm">
        واصل التدريب ←
      </button>
    </section>
  );
}
