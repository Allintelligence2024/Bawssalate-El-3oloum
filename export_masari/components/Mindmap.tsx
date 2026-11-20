// الخريطة الذهنية — المفتاح البصري للبرنامج كاملًا (كان al_miftah_v7_mindmap.html
// ملفًا مستقلًا فأُعيد بناؤه هنا كصفحة داخل التطبيق: 3 مجالات → 11 وحدة → 58 درسًا).
// نفس فلسفة مساري: الدرس المقفل يُرى ولا يُفتح — الخريطة تُظهر الطريق ولا تختصره.

import { useState } from 'react';
import type { Etat, Unite } from '../types';
import { DOMAINES, titreLecon, UNITE_PAR_ID } from '../data/programme';
import type { ItemChemin } from '../data/programme';
import { itemFait, itemVerrouille, leconsUniteFaites } from '../utils/moteur';
import { nb } from '../utils/dates';
import { ACCENTS } from '../utils/accents';
import { IcoRetour, IcoVerifie, IcoVerrou } from './Icones';
import MascotteKunz from './MascotteKunz';

interface Props {
  etat: Etat;
  onFermer: () => void;
  onOuvrirItem: (item: ItemChemin) => void;
}

/** أيقونة ثقل البكالوريا — نقطتان حتى 5، بلا نسبة مئوية (قاعدة عدم التوتّر). */
function PoidsBac({ poids }: { poids: number }) {
  return (
    <span
      className="flex shrink-0 items-center gap-0.5"
      title={`ثقل الوحدة في البكالوريا: ${nb(poids)} من 5`}
      aria-label={`ثقل الوحدة في البكالوريا: ${nb(poids)} من 5`}
    >
      {[1, 2, 3, 4, 5].map((k) => (
        <span
          key={k}
          className={`h-1.5 w-1.5 rounded-full ${k <= poids ? 'bg-gold' : 'bg-line'}`}
        />
      ))}
    </span>
  );
}

/** بطاقة وحدة واحدة داخل الخريطة — قابلة للفتح والإغلاق. */
function NoeudUnite({
  unite,
  etat,
  ouverte,
  onBasculer,
  onOuvrirItem,
}: {
  unite: Unite;
  etat: Etat;
  ouverte: boolean;
  onBasculer: () => void;
  onOuvrirItem: (item: ItemChemin) => void;
}) {
  const accent = ACCENTS[DOMAINES.find((d) => d.id === unite.domaineId)?.accent ?? 'forest'];
  const faites = leconsUniteFaites(etat, unite.id);
  const jalonFait = itemFait(etat, { type: 'jalon', uniteId: unite.id });
  const premierVerrouille = itemVerrouille(etat, { type: 'lecon', id: unite.lessonIds[0] });
  const uniteActuelle = !premierVerrouille && faites < unite.lessonIds.length;

  return (
    <li className="relative">
      {/* وصلة الرسم الشجري */}
      <span aria-hidden className={`absolute top-6 right-0 h-px w-4 ${accent.dot}`} />
      <div
        className={`card overflow-hidden transition-shadow ${uniteActuelle ? 'ring-2 ring-forest/30' : ''}`}
      >
        <button
          onClick={onBasculer}
          aria-expanded={ouverte}
          className="flex w-full items-center gap-3 p-3.5 text-right transition-colors hover:bg-sage-soft/40"
        >
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-sm font-black ${
              jalonFait
                ? 'bg-forest text-paper'
                : uniteActuelle
                  ? 'bg-sage text-forest-deep'
                  : 'bg-line text-mute'
            }`}
          >
            {jalonFait ? <IcoVerifie /> : nb(unite.numero)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-bold">{unite.titre}</span>
            <span className="mt-0.5 block text-[11px] text-mute">
              {unite.fenetreAr} · {nb(unite.lessonIds.length)} دروس
            </span>
          </span>
          <PoidsBac poids={unite.poidsBac} />
          <span
            className={`shrink-0 text-mute transition-transform duration-200 ${ouverte ? '-rotate-90' : ''}`}
            aria-hidden
          >
            ←
          </span>
        </button>

        {ouverte && (
          <div className="border-t border-line bg-paper px-3.5 pb-3.5 pt-3">
            <p className="text-xs font-bold leading-relaxed text-forest-deep">{unite.questionAr}</p>
            <p className="mt-1 text-[11px] leading-relaxed text-mute">{unite.competence}</p>

            {/* دروس الوحدة — المفتوح فقط يُفتح (نفس فلسفة مساري) */}
            <ul className="mt-3 space-y-1.5">
              {unite.lessonIds.map((id) => {
                const item: ItemChemin = { type: 'lecon', id };
                const verrouille = itemVerrouille(etat, item);
                const fait = itemFait(etat, item);
                return (
                  <li key={id}>
                    <button
                      disabled={verrouille}
                      onClick={() => onOuvrirItem(item)}
                      className={`flex w-full items-center gap-2 rounded-xl border px-3 py-3 text-right text-xs transition-colors ${
                        verrouille
                          ? 'cursor-not-allowed border-line bg-cream/50 text-mute'
                          : fait
                            ? 'border-sage bg-sage-soft font-bold text-forest-deep hover:border-forest'
                            : 'border-line bg-paper font-bold hover:border-forest'
                      }`}
                    >
                      <span className="shrink-0 text-mute">
                        {fait ? (
                          <span className="text-forest">
                            <IcoVerifie />
                          </span>
                        ) : verrouille ? (
                          <IcoVerrou />
                        ) : (
                          '▶'
                        )}
                      </span>
                      <span className="min-w-0 flex-1 truncate">{titreLecon(id)}</span>
                      {fait && <span className="shrink-0 text-[10px] font-bold text-forest">منجَز</span>}
                    </button>
                  </li>
                );
              })}
              {/* جسر الوحدة */}
              <li>
                <button
                  disabled={itemVerrouille(etat, { type: 'jalon', uniteId: unite.id })}
                  onClick={() => onOuvrirItem({ type: 'jalon', uniteId: unite.id })}
                  className={`flex w-full items-center gap-2 rounded-xl border px-3 py-3 text-right text-xs transition-colors ${
                    itemVerrouille(etat, { type: 'jalon', uniteId: unite.id })
                      ? 'cursor-not-allowed border-dashed border-line bg-cream/50 text-mute'
                      : 'border-gold-soft bg-gold-soft/50 font-bold text-forest-deep hover:border-gold'
                  }`}
                >
                  <span className="shrink-0">🧭</span>
                  <span className="min-w-0 flex-1 truncate">جسر الوحدة {nb(unite.numero)}: أجب عن سؤالها</span>
                  {jalonFait && <span className="shrink-0 text-[10px] font-bold text-forest">منجَز</span>}
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </li>
  );
}

export default function Mindmap({ etat, onFermer, onOuvrirItem }: Props) {
  // الوحدة الحالية مفتوحة افتراضيًا (أول وحدة غير مكتملة)
  const uniteCourante = DOMAINES.flatMap((d) => d.unites).find((uid) => {
    const u = UNITE_PAR_ID[uid];
    const faites = leconsUniteFaites(etat, uid);
    const verrouillee = itemVerrouille(etat, { type: 'lecon', id: u.lessonIds[0] });
    return !verrouillee && faites < u.lessonIds.length;
  });
  const [ouverte, setOuverte] = useState<string | null>(uniteCourante ?? null);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-cream" dir="rtl">
      <header className="sticky top-0 z-20 border-b border-line bg-paper px-4 pb-3 pt-4">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <button
            onClick={onFermer}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cream text-mute transition-colors hover:bg-sage-soft"
            aria-label="رجوع"
          >
            <span className="block h-5 w-5">
              <IcoRetour />
            </span>
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] text-mute">المفتاح البصري للبرنامج</p>
            <h1 className="truncate text-base font-bold">الخريطة الذهنية</h1>
          </div>
          <span className="shrink-0 rounded-full bg-sage px-2.5 py-1 text-[11px] font-bold text-forest-deep">
            خريطة
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-12 pt-4">
        <MascotteKunz
          compact
          message="هذه خريطتنا كاملة! المجال الأخضر للبروتينات، الذهبي للطاقة، والطيني للأرض. الدروس المقفلة تُرى هنا لتعرف إلى أين أنت ذاهب — وتُفتح بالترتيب كما في مساري."
        />

        <div className="mt-6 space-y-8">
          {DOMAINES.map((d) => {
            const accent = ACCENTS[d.accent] ?? ACCENTS.forest;
            return (
              <section key={d.id}>
                {/* جذع المجال */}
                <div className={`mb-3 flex items-center gap-3 border-r-4 ${accent.border} pr-3`}>
                  <span className={`h-2.5 w-2.5 rounded-full ${accent.dot}`} />
                  <h2 className="font-naskh text-lg font-bold leading-snug">{d.titre}</h2>
                </div>

                {/* فروع الوحدات */}
                <ul className="mr-2 space-y-3">
                  {d.unites.map((uniteId) => {
                    const u = UNITE_PAR_ID[uniteId];
                    return (
                      <NoeudUnite
                        key={uniteId}
                        unite={u}
                        etat={etat}
                        ouverte={ouverte === uniteId}
                        onBasculer={() => setOuverte(ouverte === uniteId ? null : uniteId)}
                        onOuvrirItem={onOuvrirItem}
                      />
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
}
