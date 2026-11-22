// Simulation d'épreuve — 270 min (§10.4).
//
// L'élève choisit le sujet, lance l'horloge, et travaille les consignes dans l'ordre du
// sujet. L'écran ne corrige rien et ne note rien : il mesure le temps et la complétude.
//
// Décisions visibles à l'écran :
//   - le chrono NE SE BLOQUE PAS à 0 : il passe en « تجاوز » et continue de compter ;
//   - chaque exercice reçoit un temps conseillé calculé sur le barème réel (5/7/8), pas
//     un tiers chacun ;
//   - aucune note, aucun pourcentage : des minutes et un nombre d'exercices terminés.
import { useEffect, useMemo, useRef, useState } from 'react';
import type { SujetOfficiel } from '../data/sujetsOfficiels';
import type { NiveauMaitrise } from '../utils/entrainement';
import { construireGrille, cleConsigne } from '../utils/entrainement';
import {
  allouerTemps, alerte, conclureSimulation, formatDuree, syntheseAr,
  DUREE_BAC_MIN, MINUTES_RELECTURE,
} from '../utils/simulation';
import { nb } from '../utils/dates';

interface Props {
  sujet: SujetOfficiel;
  evaluations: Record<string, NiveauMaitrise>;
  brouillons: Record<string, string>;
  onEvaluer: (cle: string, niveau: NiveauMaitrise) => void;
  onBrouillon: (cle: string, texte: string) => void;
  onFermer: () => void;
}

const LIBELLE_ALERTE = {
  calme: 'text-ink',
  attention: 'text-forest-deep font-bold',
  depasse: 'text-clay font-bold',
} as const;

export default function SimulationEpreuve({ sujet, evaluations, brouillons, onEvaluer, onBrouillon, onFermer }: Props) {
  const grille = useMemo(() => construireGrille(sujet), [sujet]);
  const [dureeChoisie, setDureeChoisie] = useState(DUREE_BAC_MIN);
  // Les temps conseillés suivent la durée choisie : une simulation de 90 min avec des
  // repères « 270 min » afficherait des objectifs inatteignables dès la première minute.
  const allocations = useMemo(() => allouerTemps(sujet, dureeChoisie), [sujet, dureeChoisie]);
  const [lancee, setLancee] = useState(false);
  const [restant, setRestant] = useState(DUREE_BAC_MIN * 60);
  const [enPause, setEnPause] = useState(false);
  // Échéance absolue (ms). On ne décrémente PAS un compteur à chaque tick : les navigateurs
  // brident les minuteurs d'un onglet en arrière-plan (1 tick/minute, voire moins), et sur
  // 270 min l'horloge dériverait de plusieurs dizaines de minutes. On recalcule à partir de
  // l'heure réelle, donc le temps reste juste même après un changement d'onglet.
  const echeance = useRef<number>(0);
  const restantAuLancement = useRef<number>(DUREE_BAC_MIN * 60);
  const [termine, setTermine] = useState(false);
  const [exerciceCourant, setExerciceCourant] = useState(1);
  const [relectureFaite, setRelectureFaite] = useState(false);
  // Minutes passées par exercice, calculées sur les temps de séjour réels.
  const passages = useRef<Map<number, number>>(new Map());
  const entreeExercice = useRef<number>(Date.now());

  const al = alerte(restant);
  const allocationCourante = allocations.find((a) => a.numero === exerciceCourant);

  useEffect(() => {
    if (!lancee || enPause || termine) return;
    const recalculer = () => setRestant(Math.round((echeance.current - Date.now()) / 1000));
    recalculer();
    const id = setInterval(recalculer, 1000);
    // Un retour d'onglet rattrape immédiatement l'écart au lieu d'attendre le tick suivant.
    document.addEventListener('visibilitychange', recalculer);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', recalculer);
    };
  }, [lancee, enPause, termine]);

  // Cumul du temps passé sur l'exercice quitté (pas de calcul « au jugé »).
  function quitterExercice() {
    const minutes = (Date.now() - entreeExercice.current) / 60_000;
    passages.current.set(exerciceCourant, (passages.current.get(exerciceCourant) ?? 0) + minutes);
    entreeExercice.current = Date.now();
  }

  function changerExercice(n: number) {
    if (n === exerciceCourant) return;
    quitterExercice();
    setExerciceCourant(n);
  }

  function conclure() {
    quitterExercice();
    setTermine(true);
  }

  const consignesCourantes = grille.consignes.filter((c) => c.exercice === exerciceCourant);
  const constats = allocations.map((a) => ({
    numero: a.numero,
    minutesPassees: passages.current.get(a.numero) ?? 0,
    termine: grille.consignes
      .filter((c) => c.exercice === a.numero)
      .every((c) => evaluations[cleConsigne(c)] !== undefined),
  }));
  const resultat = conclureSimulation(
    allocations,
    constats,
    (dureeChoisie * 60 - restant) / 60,
    relectureFaite,
  );

  if (!lancee) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <p className="eyebrow">محاكاة اختبار — {sujet.id}</p>
          <button type="button" onClick={onFermer} className="chip text-xs font-bold">عودة</button>
        </div>
        <p className="rounded-xl border border-gold/40 bg-gold-soft/30 px-3 py-2 text-[11px] leading-relaxed text-forest-deep">
          هذه محاكاة للوقت لا للتنقيط: نقيس ما أنجزته وكم استغرقت، ولا نُصدر نقطة.
          الساعة لا تتوقّف عند الصفر — تُنبّهك وتواصل العدّ. يمكنك الإيقاف متى شئت.
        </p>
        <div className="rounded-xl border border-line bg-paper p-3">
          <p className="text-xs font-bold">توزيع الوقت على التمارين (بحسب سلّم النقاط الرسمي)</p>
          <ul className="mt-2 space-y-1">
            {allocations.map((a) => (
              <li key={a.numero} className="flex justify-between text-[11px] text-mute">
                <span>التمرين {nb(a.numero)} · {nb(a.bareme)} نقطة</span>
                <span>{nb(a.minutes)} دقيقة (إلى الدقيقة {nb(a.finConseillee)})</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[11px] text-mute">تُحفظ {nb(MINUTES_RELECTURE)} دقيقة أخيرة للمراجعة.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {[DUREE_BAC_MIN, 180, 90].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => { setDureeChoisie(d); setRestant(d * 60); }}
              className={`chip text-xs font-bold ${dureeChoisie === d ? 'border-forest bg-sage-soft/60' : ''}`}
              aria-pressed={dureeChoisie === d}
            >
              {nb(d)} دقيقة
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            restantAuLancement.current = dureeChoisie * 60;
            echeance.current = Date.now() + dureeChoisie * 60_000;
            setRestant(dureeChoisie * 60);
            entreeExercice.current = Date.now();
            setLancee(true);
          }}
          className="btn-gold w-full px-3 py-2 text-sm"
        >
          ابدأ المحاكاة
        </button>
      </div>
    );
  }

  if (termine) {
    return (
      <div className="space-y-3">
        <p className="eyebrow">حصيلة المحاكاة — بلا نقطة</p>
        <div className="rounded-xl border border-line bg-paper p-4">
          <p className="text-sm leading-relaxed">{syntheseAr(resultat)}</p>
          <ul className="mt-3 space-y-1 text-[11px] text-mute">
            <li>الوقت المستغرق: {nb(resultat.minutesUtilisees)} دقيقة</li>
            <li>التمارين المنجزة: {nb(resultat.exercicesTermines)} من {nb(resultat.exercicesTotal)}</li>
            <li>المراجعة الأخيرة: {relectureFaite ? 'تمّت' : 'لم تتمّ'}</li>
          </ul>
          {resultat.depassements.length > 0 && (
            <ul className="mt-2 space-y-1 text-[11px] text-clay">
              {resultat.depassements.map((d) => (
                <li key={d.numero}>تجاوزت في التمرين {nb(d.numero)} بـ{nb(d.minutesEnPlus)} دقيقة.</li>
              ))}
            </ul>
          )}
        </div>
        <p className="rounded-xl bg-pale px-3 py-2 text-[11px] leading-relaxed text-mute">
          هذه الحصيلة تتحدّث عن التنظيم لا عن مستواك في المادة. أعِد المحاكاة بعد أسبوع وستقارن وقتك بوقتك.
        </p>
        <button type="button" onClick={onFermer} className="btn btn-ghost w-full text-sm">رجوع</button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="sticky top-0 z-10 rounded-xl border border-line bg-cream/95 px-3 py-2 backdrop-blur-none">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className={`text-sm ${LIBELLE_ALERTE[al]}`} aria-live="off">
            ⏱️ {al === 'depasse' ? 'الوقت المسموح انقضى — تواصل على مسؤوليتك: ' : 'المتبقّي: '}
            {al === 'depasse' && '+'}
            {formatDuree(al === 'depasse' ? -restant : restant)}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                // Mise en pause : on fige le restant à l'instant du clic. Reprise : on
                // redonne une échéance à partir de ce restant figé. Le temps de pause
                // n'est donc jamais décompté, quel qu'ait été le bridage du navigateur.
                if (!enPause) {
                  restantAuLancement.current = Math.round((echeance.current - Date.now()) / 1000);
                  setRestant(restantAuLancement.current);
                  setEnPause(true);
                } else {
                  echeance.current = Date.now() + restantAuLancement.current * 1000;
                  setEnPause(false);
                }
              }}
              className="chip text-xs font-bold"
            >
              {enPause ? 'استئناف' : 'إيقاف مؤقّت'}
            </button>
            <button type="button" onClick={conclure} className="chip text-xs font-bold">أنهِ المحاكاة</button>
          </div>
        </div>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {allocations.map((a) => (
            <button
              key={a.numero}
              type="button"
              onClick={() => changerExercice(a.numero)}
              className={`chip text-[11px] font-bold ${exerciceCourant === a.numero ? 'border-forest bg-sage-soft/60' : ''}`}
              aria-pressed={exerciceCourant === a.numero}
            >
              تمرين {nb(a.numero)} · {nb(a.minutes)} د
            </button>
          ))}
        </div>
        {allocationCourante && (
          <p className="mt-1 text-[11px] text-mute">
            المستحسن لهذا التمرين: {nb(allocationCourante.minutes)} دقيقة، تنتهي عند الدقيقة {nb(allocationCourante.finConseillee)}.
          </p>
        )}
      </div>

      {enPause && (
        <p className="rounded-xl bg-pale px-3 py-2 text-[11px] text-mute" role="status">
          المحاكاة متوقّفة مؤقّتًا. الوقت لا يُحسب أثناء التوقّف.
        </p>
      )}

      <ul className="space-y-3">
        {consignesCourantes.map((c) => {
          const cle = cleConsigne(c);
          const niveau = evaluations[cle];
          return (
            <li key={cle} className="rounded-xl border border-line bg-paper p-3">
              <p className="text-xs font-bold text-forest-deep">{c.verbe} · {nb(c.points ?? 0)} ن</p>
              <p className="mt-1 text-sm leading-relaxed">{c.texte}</p>
              <label className="mt-2 block text-[11px] font-bold text-mute">
                إجابتك (تُحفظ على جهازك فقط)
                <textarea
                  value={brouillons[cle] ?? ''}
                  onChange={(e) => onBrouillon(cle, e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-line bg-cream px-2 py-1.5 text-sm text-ink"
                />
              </label>
              <div className="mt-2 flex gap-1.5">
                {([0, 1, 2] as const).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => onEvaluer(cle, n)}
                    className={`chip text-[11px] font-bold ${niveau === n ? 'border-forest bg-sage-soft/60' : ''}`}
                    aria-pressed={niveau === n}
                  >
                    {n === 0 ? 'لم أصل' : n === 1 ? 'جزئيّ' : 'مطابق'}
                  </button>
                ))}
              </div>
            </li>
          );
        })}
      </ul>

      <label className="flex items-center gap-2 rounded-xl bg-pale px-3 py-2 text-[11px]">
        <input type="checkbox" checked={relectureFaite} onChange={(e) => setRelectureFaite(e.target.checked)} />
        خصّصت وقتًا للمراجعة الأخيرة
      </label>
    </div>
  );
}
