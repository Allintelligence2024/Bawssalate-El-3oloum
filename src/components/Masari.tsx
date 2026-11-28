// مساري — المسار المرئي التفاعلي لـ 3 مجالات و 11 وحدة في علوم الطبيعة والحياة.
// تنظيم خفيف بتبويب المجالات (3–5 وحدات فقط)، لافتة وحدة واضحة، ومسار خطوات متّصل بأسلوب Duolingo.

import { useState } from 'react';
import {
  CHEMIN,
  DOMAINES,
  UNITE_PAR_ID,
  cleItem,
  titreItem,
  uniteDeItem,
  type ItemChemin,
} from '../data/programme';
import { itemFait, leconsUniteFaites, prochainItem } from '../utils/moteur';
import { nb } from '../utils/dates';
import type { Etat } from '../types';
import { IcoCarte, IcoChevron, IcoPont, IcoRecherche, IcoRetour, IcoVerifie } from './Icones';
import { prioriteLecon } from '../data/priorites';
import MascotteKunz from './MascotteKunz';

interface Props {
  etat: Etat;
  onOuvrirItem: (item: ItemChemin) => void;
  onVoirUnite: (uniteId: string) => void;
  onOuvrirMindmap: () => void;
  onOuvrirRecherche?: () => void;
}

const COURTS: Record<string, [string, string]> = {
  d1: ['المجال 1', 'البروتينات'],
  d2: ['المجال 2', 'الطاقة'],
  d3: ['المجال 3', 'التكتونية'],
};

const GRAD = 'bg-[image:var(--gradient-primary)] text-white';
const LIP = 'shadow-[0_3px_0_var(--color-forest-deep)]';

function itemsUnite(uniteId: string): ItemChemin[] {
  const u = UNITE_PAR_ID[uniteId];
  return [
    ...(u.prerequis ?? []).map((id) => ({ type: 'lecon' as const, id })),
    ...u.lessonIds.map((id) => ({ type: 'lecon' as const, id })),
  ];
}

export default function Masari({
  etat,
  onOuvrirItem,
  onVoirUnite,
  onOuvrirMindmap,
  onOuvrirRecherche,
}: Props) {
  const faits = CHEMIN.filter((i) => itemFait(etat, i)).length;
  const pourcent = Math.round((faits / Math.max(CHEMIN.length, 1)) * 100);
  const suivant = prochainItem(etat);
  const uniteRec = suivant ? uniteDeItem(suivant) : null;
  const uniteRecId = uniteRec?.id ?? 'u1';
  const cleSuivant = suivant ? cleItem(suivant) : null;

  const [domaineId, setDomaineId] = useState<string>(uniteRec?.domaineId ?? DOMAINES[0].id);
  const [ouverteId, setOuverteId] = useState<string | null>(uniteRecId);

  const domaine = DOMAINES.find((d) => d.id === domaineId) ?? DOMAINES[0];

  function choisirDomaine(id: string) {
    setDomaineId(id);
    const d = DOMAINES.find((x) => x.id === id);
    if (!d) return;
    setOuverteId(d.unites.includes(uniteRecId) ? uniteRecId : (d.unites[0] ?? null));
  }

  return (
    <div dir="rtl" className="mx-auto max-w-3xl px-4 pb-28 pt-5 lg:pb-12">
      <header className="mb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="oeil">3 مجالات · 11 وحدة · مفتوح للمراجعة</p>
            <h1 className="titre-1 mt-0.5">مساري</h1>
          </div>
          <div className="flex items-center gap-2">
            {onOuvrirRecherche && (
              <button type="button" className="btn-mini min-h-11" onClick={onOuvrirRecherche}>
                <span className="block h-4 w-4 text-forest" aria-hidden="true">
                  <IcoRecherche />
                </span>
                <span>بحث</span>
              </button>
            )}
            <button type="button" className="btn-mini min-h-11" onClick={onOuvrirMindmap}>
              <span className="block h-4 w-4 text-forest" aria-hidden="true">
                <IcoCarte />
              </span>
              <span>الخريطة الذهنية</span>
            </button>
          </div>
        </div>

        <div className="mt-3">
          <div className="mb-1.5 flex items-center justify-between gap-2 text-xs">
            <span className="font-bold text-ink-soft">تقدّمك الكلّي في البرنامج</span>
            <span className="tnum font-extrabold text-forest">
              {nb(faits)} / {nb(CHEMIN.length)} بنية ({nb(pourcent)}%)
            </span>
          </div>
          <div
            className="jauge h-2.5"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={CHEMIN.length}
            aria-valuenow={faits}
            aria-label="تقدّمي في المسار"
          >
            <div className="jauge__r" style={{ width: `${Math.max(faits > 0 ? 4 : 0, pourcent)}%` }} />
          </div>
        </div>
      </header>

      <MascotteKunz
        compact
        message="اختَر المجال وتقدّم خطوة بخطوة — خطوتك القادمة جاهزة ومُبرَزة بالأخضر، وكل الوحدات مفتوحة لك."
      />

      <div role="tablist" aria-label="مجالات البرنامج الرسمي" className="mt-4 grid grid-cols-3 gap-2">
        {DOMAINES.map((d) => {
          const actif = d.id === domaine.id;
          const [num, court] = COURTS[d.id] ?? [d.titre, ''];
          const faitesDom = d.unites.filter((uid) =>
            itemFait(etat, { type: 'jalon', uniteId: uid })
          ).length;
          return (
            <button
              key={d.id}
              type="button"
              role="tab"
              aria-selected={actif}
              onClick={() => choisirDomaine(d.id)}
              className={`min-h-14 rounded-2xl border px-2.5 py-2 text-right transition-all ${
                actif
                  ? `border-forest-deep ${GRAD} ${LIP}`
                  : 'border-line bg-paper text-ink hover:border-forest/40'
              }`}
            >
              <span className={`block text-[11px] font-bold ${actif ? 'text-white/80' : 'text-mute'}`}>
                {num}
              </span>
              <span className="mt-0.5 flex items-baseline justify-between gap-1">
                <span className="truncate text-sm font-extrabold">{court}</span>
                <span className={`tnum text-[11px] font-extrabold ${actif ? 'text-white/90' : 'text-forest'}`}>
                  {nb(faitesDom)}/{nb(d.unites.length)}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 mb-3 flex items-center justify-between gap-2">
        <h2 className="font-naskh text-base font-extrabold text-ink sm:text-lg">{domaine.titre}</h2>
        <span className="tnum text-xs font-bold text-mute whitespace-nowrap">
          {nb(domaine.unites.length)} وحدات
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {domaine.unites.map((uniteId) => {
          const u = UNITE_PAR_ID[uniteId];
          const items = itemsUnite(uniteId);
          const faites = leconsUniteFaites(etat, uniteId);
          const total = u.lessonIds.length;
          const jalonFait = itemFait(etat, { type: 'jalon', uniteId });
          const estRec = uniteId === uniteRecId;
          const ouverte = ouverteId === uniteId;
          const pct = Math.round((faites / Math.max(total, 1)) * 100);
          const prochain =
            items.find((it) => cleItem(it) === cleSuivant && !itemFait(etat, it)) ??
            items.find((it) => !itemFait(etat, it)) ??
            null;

          if (!ouverte) {
            return (
              <button
                key={uniteId}
                type="button"
                onClick={() => setOuverteId(uniteId)}
                aria-expanded={false}
                className={`carte flex min-h-16 w-full items-center gap-3 px-4 py-3 text-right transition-colors hover:border-forest/40 ${
                  estRec ? 'border-forest/50' : ''
                }`}
              >
                <span
                  className={`tnum grid h-10 w-10 flex-none place-items-center rounded-xl text-sm font-black ${
                    jalonFait
                      ? GRAD
                      : estRec
                        ? 'bg-primary-soft text-primary'
                        : 'border border-line bg-bg text-ink-soft'
                  }`}
                  aria-hidden="true"
                >
                  {jalonFait ? (
                    <span className="block h-4 w-4">
                      <IcoVerifie />
                    </span>
                  ) : (
                    nb(u.numero)
                  )}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-x-2">
                    <span className="text-sm font-extrabold text-ink sm:text-base">{u.titre}</span>
                    {estRec && <span className="text-[11px] font-extrabold text-forest">· وحدتك الآن</span>}
                  </span>
                  <span className="tnum mt-0.5 block text-xs text-mute">
                    {nb(faites)}/{nb(total)} دروس · وزن الباك {nb(u.poidsBac)}/5
                  </span>
                  {faites > 0 && (
                    <span className="jauge mt-1.5 block h-1.5" aria-hidden="true">
                      <span className="jauge__r block" style={{ width: `${Math.max(8, pct)}%` }} />
                    </span>
                  )}
                </span>

                <span className="grid h-9 w-9 flex-none place-items-center text-mute" aria-hidden="true">
                  <span className="block h-4 w-4">
                    <IcoChevron ouvert={false} />
                  </span>
                </span>
              </button>
            );
          }

          let compteurPrio = 0;
          const cleFocal = prochain ? cleItem(prochain) : null;

          return (
            <section
              key={uniteId}
              aria-label={`الوحدة ${nb(u.numero)}: ${u.titre}`}
              className="overflow-hidden rounded-2xl border border-line bg-paper shadow-sm"
            >
              <div className={`${GRAD} p-4`}>
                <div className="flex items-start justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setOuverteId(null)}
                    aria-expanded={true}
                    className="min-w-0 flex-1 text-right"
                  >
                    <span className="tnum block text-[11px] font-bold text-white/80">
                      الوحدة {nb(u.numero)} · {nb(faites)} من {nb(total)} دروس · وزن الباك {nb(u.poidsBac)}/5
                    </span>
                    <h3 className="font-naskh mt-0.5 text-xl font-extrabold leading-snug text-white">
                      {u.titre}
                    </h3>
                  </button>

                  <div className="flex flex-none items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => (prochain ? onOuvrirItem(prochain) : onVoirUnite(uniteId))}
                      className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-xs font-extrabold text-[#183d31] shadow-sm transition-transform active:translate-y-0.5"
                    >
                      <span>{faites === 0 ? 'ابدأ' : prochain ? 'تابع' : 'الجسر'}</span>
                      <span className="block h-3.5 w-3.5 rotate-180" aria-hidden="true">
                        <IcoRetour />
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setOuverteId(null)}
                      aria-label={`طي الوحدة ${nb(u.numero)}`}
                      className="grid h-11 w-11 place-items-center rounded-xl bg-white/15 text-white hover:bg-white/25"
                    >
                      <span className="block h-4 w-4" aria-hidden="true">
                        <IcoChevron ouvert={true} />
                      </span>
                    </button>
                  </div>
                </div>

                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-black/20">
                  <div
                    className="h-full rounded-full bg-leaf transition-all duration-300"
                    style={{ width: `${Math.max(faites > 0 ? 6 : 0, pct)}%` }}
                  />
                </div>
              </div>

              <div className="p-4 sm:p-5">
                <ol className="relative flex flex-col gap-2.5">
                  {items.map((item, idx) => {
                    const cle = cleItem(item);
                    const fait = itemFait(etat, item);
                    const enCours =
                      item.type === 'lecon' && etat.progression[item.id]?.statut === 'en_cours';
                    const estFocal = !fait && cle === cleFocal;
                    const estPrio =
                      !fait &&
                      !estFocal &&
                      item.type === 'lecon' &&
                      prioriteLecon(item.id) === 1 &&
                      compteurPrio < 2;
                    if (estPrio) compteurPrio += 1;

                    return (
                      <li key={cle} className="relative flex items-stretch gap-3">
                        <div className="relative flex w-12 flex-none flex-col items-center">
                          <span
                            className={`relative z-10 grid h-11 w-11 flex-none place-items-center rounded-full text-sm font-black tnum ${
                              fait
                                ? `${GRAD} ${LIP}`
                                : estFocal
                                  ? `${GRAD} ${LIP} ring-4 ring-leaf/25`
                                  : enCours
                                    ? 'border-2 border-gold bg-honey-soft text-honey-ink'
                                    : 'border-2 border-line bg-bg text-ink-soft'
                            }`}
                            aria-hidden="true"
                          >
                            {fait ? (
                              <span className="block h-5 w-5">
                                <IcoVerifie />
                              </span>
                            ) : (
                              nb(idx + 1)
                            )}
                          </span>
                          <span
                            className={`-mb-2.5 w-0.5 flex-1 ${fait ? 'bg-forest/50' : 'bg-line'}`}
                            aria-hidden="true"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => onOuvrirItem(item)}
                          className={`mb-1 flex min-h-14 flex-1 items-center justify-between gap-2.5 rounded-2xl border px-3.5 py-2.5 text-right transition-colors ${
                            estFocal
                              ? 'border-2 border-forest/50 bg-primary-soft hover:bg-sage'
                              : fait
                                ? 'border-line bg-bg hover:border-forest/40'
                                : 'border-line bg-paper hover:border-forest/40 hover:bg-sage-soft'
                          }`}
                        >
                          <span className="min-w-0 flex-1">
                            {estFocal && (
                              <span className="mb-0.5 block text-[11px] font-extrabold text-forest">
                                {cle === cleSuivant ? 'خطوتك الآن' : 'الدرس التالي في الوحدة'}
                              </span>
                            )}
                            <span
                              className={`block text-sm leading-snug ${
                                fait
                                  ? 'font-semibold text-mute'
                                  : estFocal
                                    ? 'font-extrabold text-ink'
                                    : 'font-bold text-ink'
                              }`}
                            >
                              {titreItem(item)}
                            </span>
                            {!estFocal && enCours && (
                              <span className="mt-0.5 block text-[11px] font-extrabold text-honey-ink">
                                جاري الإنجاز · تابع من حيث توقّفت
                              </span>
                            )}
                            {estPrio && !enCours && (
                              <span className="mt-0.5 block text-[11px] font-bold text-honey-ink">
                                مهم للباك
                              </span>
                            )}
                          </span>

                          {estFocal ? (
                            <span className={`inline-flex flex-none items-center gap-1 rounded-xl ${GRAD} px-3 py-1.5 text-xs font-extrabold`}>
                              <span>{enCours ? 'تابع' : 'ابدأ'}</span>
                              <span className="block h-3.5 w-3.5 rotate-180" aria-hidden="true">
                                <IcoRetour />
                              </span>
                            </span>
                          ) : fait ? (
                            <span className="text-[11px] font-bold text-forest whitespace-nowrap">مراجعة</span>
                          ) : (
                            <span className="block h-4 w-4 flex-none rotate-180 text-mute" aria-hidden="true">
                              <IcoRetour />
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}

                  <li className="relative flex items-center gap-3 pt-1">
                    <div className="flex w-12 flex-none justify-center">
                      <span
                        className={`grid h-12 w-12 flex-none place-items-center rounded-2xl border-2 ${
                          jalonFait
                            ? `border-forest ${GRAD} ${LIP}`
                            : 'border-honey-line bg-honey-soft text-honey-ink'
                        }`}
                        aria-hidden="true"
                      >
                        <span className="block h-5 w-5">
                          {jalonFait ? <IcoVerifie /> : <IcoPont />}
                        </span>
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onVoirUnite(uniteId)}
                      className={`flex min-h-14 flex-1 items-center justify-between gap-2.5 rounded-2xl border px-3.5 py-2.5 text-right transition-colors ${
                        jalonFait
                          ? 'border-forest/40 bg-primary-soft hover:bg-sage'
                          : 'border-honey-line bg-honey-soft hover:border-gold'
                      }`}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block text-[11px] font-extrabold text-honey-ink">
                          تتويج الوحدة {nb(u.numero)}
                        </span>
                        <span className="block text-sm font-extrabold text-ink">
                          جسر الوحدة — سؤال التثبيت الشامل
                        </span>
                      </span>
                      <span className="text-xs font-extrabold text-forest whitespace-nowrap">
                        {jalonFait ? 'مُنجَز' : 'اختبر نفسك'}
                      </span>
                    </button>
                  </li>
                </ol>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
