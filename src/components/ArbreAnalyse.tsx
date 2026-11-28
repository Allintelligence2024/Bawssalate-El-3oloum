// شجرة تحليل أدائك — لوحة تحليل شجرية واضحة وجميلة في شاشة «أنا».
// تجمع نتائج المسار (3 مجالات ← 11 وحدة)، الإجابات، الكفاءات الثماني، الامتحانات،
// الأقوى والأضعف، الأخطاء والملاحظات في شجرة تفاعلية واحدة سهلة الفهم بنظرة واحدة.

import { useMemo, useState } from 'react';
import type { Etat, FauteCarnet, NoteCarnet } from '../types';
import {
  construireArbreAnalyse,
  type NoeudDomaineArbre,
  type StatutNoeud,
} from '../utils/arbreAnalyse';
import { formatCourteAr, joursNb, nb } from '../utils/dates';
import type { EvaluationsParSujet } from '../utils/profil';
import { SOURCES, useStats } from '../utils/stats';
import { xpTexte } from '../utils/xp';
import { IcoBouclier, IcoCible, IcoFlamme, IcoShajara, IcoVerifie } from './Icones';

interface Props {
  etat: Etat;
  carnet: FauteCarnet[];
  evaluationsEntraineur?: EvaluationsParSujet;
  onOuvrirFiche?: () => void;
  onDemarrerRevision: (lessonIds: string[]) => void;
  onAllerExercices: () => void;
  onOuvrirDiagnostic: () => void;
  onOuvrirLecon: (lessonId: string) => void;
  onBasculerFavori: (lessonId: string) => void;
  onSupprimerNote: (id: string) => void;
  onEffacerCarnet: () => void;
  onExporterCarnet: () => void;
  noteExportCarnet?: string | null;
}

function couleurStatut(s: StatutNoeud): {
  node: string;
  bar: string;
  text: string;
} {
  if (s === 'solide') {
    return {
      node: 'border-forest/35 bg-paper',
      bar: 'bg-forest',
      text: 'text-forest',
    };
  }
  if (s === 'fragile') {
    return {
      node: 'border-clay/30 bg-paper',
      bar: 'bg-clay',
      text: 'text-clay',
    };
  }
  if (s === 'en_cours') {
    return {
      node: 'border-honey-line/80 bg-paper',
      bar: 'bg-gold',
      text: 'text-honey-ink',
    };
  }
  return {
    node: 'border-line bg-paper',
    bar: 'bg-line',
    text: 'text-mute',
  };
}

function BadgeStatutTexte({ statut, libelle }: { statut: StatutNoeud; libelle: string }) {
  const c = couleurStatut(statut);
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-extrabold ${c.text}`}>
      {statut === 'solide' && (
        <span className="block h-3.5 w-3.5" aria-hidden="true">
          <IcoVerifie />
        </span>
      )}
      <span>{libelle}</span>
    </span>
  );
}

/** حلقة تقدّم SVG نظيفة لجذر الشجرة */
function AnneauProgression({ pct, faits, total }: { pct: number; faits: number; total: number }) {
  const r = 34;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(100, Math.max(0, pct)) / 100) * circ;
  return (
    <div className="relative grid h-24 w-24 shrink-0 place-items-center">
      <svg className="h-24 w-24 -rotate-90" viewBox="0 0 84 84" aria-hidden="true">
        <circle
          cx="42"
          cy="42"
          r={r}
          fill="none"
          stroke="var(--color-line)"
          strokeWidth="7"
        />
        <circle
          cx="42"
          cy="42"
          r={r}
          fill="none"
          stroke="var(--color-forest)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-naskh tnum text-lg font-black leading-none text-forest-deep">
          {nb(faits)}/{nb(total)}
        </span>
        <span className="mt-0.5 text-[10px] font-bold text-mute">في المسار</span>
      </div>
    </div>
  );
}

export default function ArbreAnalyse({
  etat,
  carnet,
  evaluationsEntraineur,
  onOuvrirFiche,
  onDemarrerRevision,
  onAllerExercices,
  onOuvrirDiagnostic,
  onSupprimerNote,
  onEffacerCarnet,
  onExporterCarnet,
  noteExportCarnet,
}: Props) {
  const stats = useStats();
  const arbre = useMemo(
    () => construireArbreAnalyse(etat, stats, evaluationsEntraineur),
    [etat, stats, evaluationsEntraineur],
  );

  // المجال الأول مفتوح افتراضيًّا لإظهار البنية الشجرية فورًا، والباقي يُفتح بنقرة
  const [domaineOuvert, setDomaineOuvert] = useState<string | null>('d1');
  const [detailSources, setDetailSources] = useState(false);
  const [detailCarnet, setDetailCarnet] = useState(false);
  const [confirmeCarnet, setConfirmeCarnet] = useState(false);

  const h = Math.floor(arbre.racine.minutesTotales / 60);
  const m = arbre.racine.minutesTotales % 60;
  const tempsAr =
    h === 0 ? `${nb(m)} د` : m === 0 ? `${nb(h)} س` : `${nb(h)} س ${nb(m)} د`;

  const ratioJustes =
    arbre.competences.reponsesTotal > 0
      ? Math.round((arbre.competences.reponsesJustes / arbre.competences.reponsesTotal) * 100)
      : 0;

  const fautes = [...carnet].sort((a, b) => (a.ts < b.ts ? 1 : -1));
  const notes = [...etat.notes].sort((a, b) => (a.ts < b.ts ? 1 : -1));

  function lancerActionRecommandee(): void {
    const act = arbre.priorites.actionRecommandee;
    if (act.type === 'revision' && act.lessonIds?.length) {
      onDemarrerRevision(act.lessonIds);
    } else if (act.type === 'exercices') {
      onAllerExercices();
    } else {
      onOuvrirDiagnostic();
    }
  }

  return (
    <div className="space-y-4" data-testid="arbre-analyse-dashboard">
      {/* ═══ الجذر (Root Node): ملخّص جاهزية التلميذ بنظرة واحدة ═══ */}
      <section className="card p-5" aria-label="ملخّص أدائي في العلوم">
        <div className="mb-3 flex items-center justify-between gap-2 border-b border-line/70 pb-2.5">
          <div className="flex min-w-0 items-center gap-1.5 text-xs font-extrabold text-forest">
            <span className="block h-4 w-4 shrink-0" aria-hidden="true">
              <IcoShajara />
            </span>
            <span className="truncate">شجرة تحليل أدائك · {arbre.racine.niveauNom}</span>
          </div>
          {onOuvrirFiche && (
            <button
              type="button"
              onClick={onOuvrirFiche}
              className="btn-mini min-h-[36px] shrink-0 whitespace-nowrap text-xs"
            >
              ملفّي A4
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <AnneauProgression
            pct={arbre.racine.progressionPct}
            faits={arbre.racine.itemsFaits}
            total={arbre.racine.itemsTotal}
          />
          <div className="min-w-0 flex-1">
            <h2 className="font-naskh text-xl font-black text-ink">
              {arbre.racine.nom}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-ink-soft">
              {arbre.racine.resumeGlobal}
            </p>

            {/* شريط مؤشّرات نصيّة نظيفة بدون فواصل يتيمة عند الالتفاف */}
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-bold text-ink-soft">
              <span className="inline-flex items-center gap-1 text-honey-ink tnum">
                <span className="block h-3.5 w-3.5" aria-hidden="true">
                  <IcoFlamme />
                </span>
                {joursNb(arbre.racine.joursSuite)}
              </span>
              <span className="tnum">{xpTexte(arbre.racine.xp)}</span>
              <span className="tnum">تركيز {tempsAr}</span>
              {arbre.racine.joursAvantBac !== null && (
                <span className="tnum text-forest">
                  باقي {nb(arbre.racine.joursAvantBac)} يومًا للباك
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ جذع الشجرة: 3 فروع متّصلة بصريًّا بخطّ جذع عمودي وأغصان أفقية ═══ */}
      <div className="relative ps-5 sm:ps-7">
        {/* الجذع العمودي للشجرة (في RTL يقع على اليمين عبر start) */}
        <div
          className="pointer-events-none absolute bottom-6 start-2 top-0 w-0.5 rounded-full bg-forest/25 sm:start-3"
          aria-hidden="true"
        />

        <div className="space-y-4">
          {/* ─── الفرع 1: شجرة البرنامج (3 مجالات ← 11 وحدة) ─── */}
          <section className="relative card p-5" aria-label="فرع مجالات ووحدات العلوم">
            {/* وصلة الغصن الأفقية */}
            <span
              className="pointer-events-none absolute -start-3 top-7 h-0.5 w-3 bg-forest/35 sm:-start-4 sm:w-4"
              aria-hidden="true"
            />
            <span
              className="pointer-events-none absolute -start-[14px] top-[24px] h-2.5 w-2.5 rounded-full border-2 border-forest bg-surface sm:-start-[18px]"
              aria-hidden="true"
            />

            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <p className="text-xs font-extrabold text-forest">1. شجرة البرنامج العلمي</p>
                <h3 className="font-naskh text-base font-black text-ink">
                  3 مجالات ← 11 وحدة رسمية
                </h3>
              </div>
              <p className="text-xs text-mute">اضغط على أيّ مجال لفتح وحداته</p>
            </div>

            <div className="mt-3 divide-y divide-line border-t border-line">
              {arbre.domaines.map((dom: NoeudDomaineArbre) => {
                const ouvert = domaineOuvert === dom.domaineId;
                const styles = couleurStatut(dom.statut);
                return (
                  <div key={dom.domaineId} className="py-3">
                    <button
                      type="button"
                      onClick={() => setDomaineOuvert(ouvert ? null : dom.domaineId)}
                      aria-expanded={ouvert}
                      className="flex min-h-[44px] w-full items-center justify-between gap-3 text-start"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                          <span className="text-sm font-extrabold text-ink">
                            {dom.titreCourt}
                          </span>
                          <BadgeStatutTexte statut={dom.statut} libelle={dom.libelleStatut} />
                        </div>
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line/70">
                            <div
                              className={`h-full rounded-full ${styles.bar}`}
                              style={{ width: `${Math.max(dom.terminees > 0 ? 8 : 0, dom.pourcentage)}%` }}
                            />
                          </div>
                          <span className="tnum shrink-0 text-[11px] font-bold text-ink-soft">
                            {nb(dom.terminees)} / {nb(dom.lecons)} درس
                          </span>
                        </div>
                      </div>
                      <span
                        className="shrink-0 text-xs font-extrabold text-mute"
                        aria-hidden="true"
                      >
                        {ouvert ? '▲' : '▼'}
                      </span>
                    </button>

                    {/* أوراق الوحدات الفرعية (Nested Sub-Branches) بفواصل خطّية نظيفة */}
                    {ouvert && (
                      <div className="relative mt-2.5 ps-4">
                        <div
                          className="pointer-events-none absolute bottom-3 start-1 top-1 w-0.5 bg-line"
                          aria-hidden="true"
                        />
                        <ul className="divide-y divide-line/60">
                          {dom.unites.map((u) => {
                            return (
                              <li
                                key={u.uniteId}
                                className="relative flex flex-wrap items-center justify-between gap-2 py-2.5"
                              >
                                <span
                                  className="pointer-events-none absolute -start-3 top-1/2 h-0.5 w-3 -translate-y-1/2 bg-line"
                                  aria-hidden="true"
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                    <span className="tnum text-xs font-extrabold text-ink">
                                      و{nb(u.numero)} · {u.titre}
                                    </span>
                                    <BadgeStatutTexte statut={u.statut} libelle={u.libelleStatut} />
                                  </div>
                                  <p className="mt-0.5 text-[11px] text-mute tnum">
                                    دروس: {nb(u.terminees)}/{nb(u.lecons)} · تمارين: {nb(u.drillsFaits)}/{nb(u.drillsTotal)}
                                    {u.fragiles.length > 0 ? ` · ${nb(u.fragiles.length)} هشّ` : ''}
                                  </p>
                                </div>
                                {u.fragiles.length > 0 ? (
                                  <button
                                    type="button"
                                    onClick={() => onDemarrerRevision(u.fragiles)}
                                    className="btn-mini min-h-[38px] shrink-0 whitespace-nowrap text-xs"
                                  >
                                    ثبّت الآن
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={onAllerExercices}
                                    className="min-h-[38px] shrink-0 rounded-xl px-2.5 text-xs font-bold text-forest hover:bg-sage-soft/60"
                                  >
                                    تمارين ←
                                  </button>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* ─── الفرع 2: شجرة المهارات والنتائج (الإجابات + الكفاءات الثماني + الإنجاز) ─── */}
          <section className="relative card p-5" aria-label="فرع المهارات والنتائج">
            <span
              className="pointer-events-none absolute -start-3 top-7 h-0.5 w-3 bg-forest/35 sm:-start-4 sm:w-4"
              aria-hidden="true"
            />
            <span
              className="pointer-events-none absolute -start-[14px] top-[24px] h-2.5 w-2.5 rounded-full border-2 border-forest bg-surface sm:-start-[18px]"
              aria-hidden="true"
            />

            <p className="text-xs font-extrabold text-forest">2. المهارات والنتائج الفعلية</p>
            <h3 className="font-naskh text-base font-black text-ink">
              الإجابات، كفاءات الباك، والامتحانات
            </h3>

            <div className="mt-3 grid gap-5 border-t border-line pt-3.5 sm:grid-cols-2 sm:divide-x sm:divide-x-reverse sm:divide-line">
              {/* ورقة أ: دقّة المحاولات */}
              <div className="sm:pe-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-ink">إحصاء الإجابات (المُرشد)</span>
                  <span className="tnum text-xs font-bold text-mute">
                    {nb(arbre.competences.reponsesTotal)} محاولة
                  </span>
                </div>

                <div className="mt-2.5 flex items-baseline gap-5">
                  <div>
                    <p className="font-naskh tnum text-2xl font-black text-forest">
                      {nb(arbre.competences.reponsesJustes)}
                    </p>
                    <p className="text-[11px] font-bold text-ink-soft">صحيحة</p>
                  </div>
                  <div>
                    <p className="font-naskh tnum text-2xl font-black text-clay">
                      {nb(arbre.competences.reponsesFausses)}
                    </p>
                    <p className="text-[11px] font-bold text-ink-soft">للمراجعة</p>
                  </div>
                </div>

                <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-line/70" aria-hidden="true">
                  <div
                    className="h-full rounded-full bg-forest"
                    style={{ width: `${ratioJustes}%` }}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setDetailSources((v) => !v)}
                  aria-expanded={detailSources}
                  className="mt-2.5 text-xs font-extrabold text-forest hover:underline"
                >
                  {detailSources ? 'إخفاء التفصيل حسب المصدر ▲' : 'تفصيل حسب المصدر ▼'}
                </button>

                {detailSources && (
                  <ul className="mt-2 space-y-1.5 border-t border-line pt-2">
                    {SOURCES.map((src) => {
                      const c = stats.parSource[src.id];
                      return (
                        <li key={src.id} className="flex items-center justify-between text-xs">
                          <span className="text-ink-soft">{src.label}</span>
                          <span className="tnum font-bold text-ink" dir="ltr">
                            {nb(c.justes)} ✓ · {nb(c.fausses)} ✕
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* ورقة ب: كفاءات الباك والامتحانات */}
              <div className="border-t border-line pt-4 sm:border-t-0 sm:ps-4 sm:pt-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-ink">جاهزية الباك والمنهجية</span>
                  <span className="block h-4 w-4 text-forest" aria-hidden="true">
                    <IcoCible />
                  </span>
                </div>

                <div className="mt-2.5 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-cream p-2">
                    <p className="font-naskh tnum text-lg font-black text-forest-deep">
                      {nb(arbre.competences.examensCount)}
                    </p>
                    <p className="text-[10px] font-bold text-mute">امتحان</p>
                  </div>
                  <div className="rounded-xl bg-cream p-2">
                    <p className="font-naskh tnum text-lg font-black text-forest-deep">
                      {nb(arbre.competences.fakhCount)}
                    </p>
                    <p className="text-[10px] font-bold text-mute">فخّ مكتشف</p>
                  </div>
                  <div className="rounded-xl bg-cream p-2">
                    <p className="font-naskh tnum text-lg font-black text-forest-deep">
                      {nb(arbre.competences.sprintsCount + arbre.competences.tropheesCount)}
                    </p>
                    <p className="text-[10px] font-bold text-mute">جولات وأوسمة</p>
                  </div>
                </div>

                {arbre.competences.prioriteUn ? (
                  <div className="mt-2.5 border-t border-line/70 pt-2.5">
                    <p className="text-xs font-extrabold text-forest-deep">
                      أولوية المنهجية: {arbre.competences.prioriteUn.libelle}
                    </p>
                    {arbre.competences.prioriteUn.raisons[0] && (
                      <p className="mt-0.5 text-[11px] leading-relaxed text-ink-soft">
                        {arbre.competences.prioriteUn.raisons[0]}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="mt-2.5 text-xs leading-relaxed text-mute">
                    قيّم إجاباتك في مواضيع الباك أو اختبار التموضع لتظهر لك الكفاءات الثماني (C1–C8) هنا تلقائيًّا.
                  </p>
                )}

                {arbre.competences.mesurees.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {arbre.competences.mesurees.slice(0, 4).map((comp) => (
                      <li key={comp.code} className="flex items-center justify-between text-xs">
                        <span className="truncate text-ink-soft">{comp.libelle}</span>
                        <BadgeStatutTexte statut={comp.statut} libelle={comp.libelleStatut} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>

          {/* ─── الفرع 3: خريطة التصحيح والأولويات (الأقوى/الأضعف + سجلّ الأخطاء + الملاحظات) ─── */}
          <section className="relative card p-5" aria-label="فرع الأولويات وسجلّ الأخطاء">
            <span
              className="pointer-events-none absolute -start-3 top-7 h-0.5 w-3 bg-forest/35 sm:-start-4 sm:w-4"
              aria-hidden="true"
            />
            <span
              className="pointer-events-none absolute -start-[14px] top-[24px] h-2.5 w-2.5 rounded-full border-2 border-forest bg-surface sm:-start-[18px]"
              aria-hidden="true"
            />

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-extrabold text-forest">3. خطوتك الذكية القادمة</p>
                <h3 className="font-naskh text-base font-black text-ink">
                  الأولوية المباشرة وسجلّ التصحيح
                </h3>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-mute">
                <span className="block h-3.5 w-3.5 text-forest" aria-hidden="true">
                  <IcoBouclier />
                </span>
                تحليل ذاتي بلا مقارنة بأحد
              </span>
            </div>

            {/* بطاقة التوصية المركزية */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-forest/30 bg-sage-soft/45 p-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-extrabold text-forest-deep">
                  {arbre.priorites.actionRecommandee.titre}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">
                  {arbre.priorites.actionRecommandee.detail}
                </p>
              </div>
              <button
                type="button"
                onClick={lancerActionRecommandee}
                className="btn btn-primary min-h-[44px] shrink-0 whitespace-nowrap px-4 text-xs"
              >
                نفّذ الخطوة
              </button>
            </div>

            {/* ملخّص الأقوى والأضعف إن وُجدا */}
            {(arbre.priorites.plusForte || arbre.priorites.plusFaible) && (
              <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                {arbre.priorites.plusForte && (
                  <div className="rounded-xl border border-sage bg-paper px-3.5 py-2.5">
                    <p className="text-[11px] font-extrabold text-forest">نقطة قوّتك</p>
                    <p className="mt-0.5 text-xs font-bold text-ink">
                      الوحدة {nb(arbre.priorites.plusForte.numero)} · {arbre.priorites.plusForte.titre}
                    </p>
                  </div>
                )}
                {arbre.priorites.plusFaible && (
                  <div className="rounded-xl border border-honey-line bg-paper px-3.5 py-2.5">
                    <p className="text-[11px] font-extrabold text-honey-ink">تستحقّ تركيزك</p>
                    <p className="mt-0.5 text-xs font-bold text-ink">
                      الوحدة {nb(arbre.priorites.plusFaible.numero)} · {arbre.priorites.plusFaible.titre}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* سجلّ الأخطاء والملاحظات (مطوي بهدوء لتفادي التعقيد، ويُفتح بنقرة) */}
            <div className="mt-3 border-t border-line pt-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-bold text-ink-soft tnum">
                  سجلّ الأخطاء المنهجية ({nb(fautes.length)}) · ملاحظاتي ({nb(notes.length)})
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onOuvrirDiagnostic}
                    className="min-h-[38px] rounded-xl px-2.5 text-xs font-bold text-forest hover:bg-sage-soft/60"
                  >
                    اختبار التموضع
                  </button>
                  <button
                    type="button"
                    onClick={() => setDetailCarnet((v) => !v)}
                    aria-expanded={detailCarnet}
                    className="min-h-[38px] rounded-xl border border-line bg-paper px-3 text-xs font-extrabold text-ink-soft hover:border-forest"
                  >
                    {detailCarnet ? 'إخفاء السجلّ ▲' : 'عرض الأخطاء والملاحظات ▼'}
                  </button>
                </div>
              </div>

              {detailCarnet && (
                <div className="mt-3 space-y-3">
                  {/* سجلّ الأخطاء */}
                  <div className="rounded-2xl border border-line bg-paper p-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs font-extrabold text-ink">سجلّ الأخطاء المنهجية</p>
                      {fautes.length > 0 && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={onExporterCarnet}
                            className="btn-mini min-h-[36px] text-xs"
                          >
                            تصدير
                          </button>
                          {!confirmeCarnet ? (
                            <button
                              type="button"
                              onClick={() => setConfirmeCarnet(true)}
                              className="min-h-[36px] rounded-xl px-2.5 text-xs font-bold text-clay hover:bg-clay-soft/40"
                            >
                              مسح
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setConfirmeCarnet(false);
                                onEffacerCarnet();
                              }}
                              className="min-h-[36px] rounded-xl bg-clay px-3 text-xs font-bold text-paper"
                            >
                              تأكيد المسح
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {noteExportCarnet && (
                      <p role="status" className="mt-2 rounded-xl border border-forest bg-sage px-3 py-2 text-xs font-bold text-forest-deep">
                        {noteExportCarnet}
                      </p>
                    )}

                    {fautes.length === 0 ? (
                      <p className="mt-2 text-xs text-mute">
                        لا أخطاء مسجّلة بعد — كل خطأ في تمارين المنهجية يُحفظ هنا تلقائيًّا لتتعلّم منه.
                      </p>
                    ) : (
                      <ul className="mt-2 space-y-2">
                        {fautes.slice(0, 8).map((f) => (
                          <li key={f.id} className="rounded-xl border border-line bg-cream/60 p-2.5">
                            <p className="text-[11px] font-bold text-clay">
                              {f.contexte} · اخترت: {f.donne}
                            </p>
                            <p className="mt-1 text-xs leading-relaxed text-ink">{f.diagnostic}</p>
                            <p className="mt-1 text-[10px] text-mute">{formatCourteAr(f.ts.slice(0, 10))}</p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* ملاحظاتي */}
                  {notes.length > 0 && (
                    <div className="rounded-2xl border border-line bg-paper p-3.5">
                      <p className="text-xs font-extrabold text-ink">ملاحظاتي المحفوظة</p>
                      <ul className="mt-2 space-y-2">
                        {notes.map((n: NoteCarnet) => (
                          <li key={n.id} className="flex items-start justify-between gap-2 rounded-xl border border-line bg-cream/60 p-2.5">
                            <div className="min-w-0 flex-1">
                              <p className="text-xs leading-relaxed text-ink whitespace-pre-wrap">{n.texte}</p>
                              {n.ts && (
                                <p className="mt-1 text-[10px] text-mute">{formatCourteAr(n.ts.slice(0, 10))}</p>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => onSupprimerNote(n.id)}
                              aria-label="حذف الملاحظة"
                              className="min-h-[36px] min-w-[36px] shrink-0 text-xs font-bold text-mute hover:text-clay"
                            >
                              ✕
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
