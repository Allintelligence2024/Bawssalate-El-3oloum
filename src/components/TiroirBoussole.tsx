// Tiroir source vivant — « افتح البوصلة » sans quitter son travail.
//
// Trois onglets de méthode, plus (facultatif) le laboratoire embarqué :
//   ① vérificateur « témoin / condition modifiée » — trois cases à cocher avant d'écrire ;
//   ② checklist du verbe de consigne — ce qu'attend le correcteur, en trois points ;
//   ③ pièges de l'unité + les cartes de leçons déjà gagnées par l'élève.
//
// Le tiroir ne corrige rien : il rappelle la règle. La correction, c'est le constructeur de
// briques qui la donne (rôles et ordre), jamais cet onglet.

import { useMemo, useState, type ReactNode } from 'react';
import { UNITE_PAR_ID, uniteDeLecon } from '../data/programme';
import { attenduDe, MENTION_STATUT } from '../data/methodologie/attenduVerbes';
import type { Etat } from '../types';
import { titreLecon } from '../data/programme';
import CarteLecon from './CarteLecon';

export type OngletTiroir = 'verificateur' | 'verbe' | 'pieges' | 'labo';

interface Props {
  document: string;
  verbe: string;
  /** Leçon en cours, pour retrouver l'unité et ses pièges. */
  lessonId?: string;
  etat?: Etat;
  ongletInitial?: OngletTiroir;
  /** Rendu optionnel du laboratoire embarqué (iframe) — fourni par l'écran appelant. */
  renduLabo?: ReactNode;
  onFermer?: () => void;
  compact?: boolean;
}

const CASES_VERIFICATION = [
  'حدّدت الشاهد (الحالة المرجعية) في الوثيقة.',
  'حدّدت الشرط الذي تغيّر وحده.',
  'عندي قيمة أو دليل مكتوب من الوثيقة، لا انطباع.',
];

export default function TiroirBoussole({
  document,
  verbe,
  lessonId,
  etat,
  ongletInitial = 'verificateur',
  renduLabo,
  onFermer,
  compact = false,
}: Props) {
  const attendu = useMemo(() => attenduDe(verbe), [verbe]);
  const [onglet, setOnglet] = useState<OngletTiroir>(ongletInitial);
  const [cases, setCases] = useState<boolean[]>([false, false, false]);

  const unite = lessonId ? uniteDeLecon(lessonId) : undefined;
  const uniteInfo = unite ? UNITE_PAR_ID[unite.id] : undefined;
  const cartes = Object.entries(etat?.cartesLecons ?? {}).slice(-4).reverse();

  const onglets: { id: OngletTiroir; label: string }[] = [
    { id: 'verificateur', label: 'تحقّق' },
    { id: 'verbe', label: `الفعل «${verbe}»` },
    { id: 'pieges', label: 'أفخاخ' },
    ...(renduLabo ? [{ id: 'labo' as OngletTiroir, label: 'المختبر' }] : []),
  ];

  return (
    <section dir="rtl" aria-label="البوصلة · مصدر حيّ" className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-2">
        <p className="oeil">البوصلة · مصدر حيّ</p>
        {onFermer && (
          <button type="button" className="btn-mini" onClick={onFermer} autoFocus>
            أعود إلى تمريني
          </button>
        )}
      </div>

      <div className="border-b border-line px-3 py-2">
        <p className="petit doux">
          <b className="text-ink">تمرينك:</b> {document}
        </p>
      </div>

      <div role="tablist" aria-label="أقسام البوصلة" className="flex flex-wrap gap-1 border-b border-line px-2 py-2">
        {onglets.map((o) => (
          <button
            key={o.id}
            type="button"
            role="tab"
            aria-selected={onglet === o.id}
            onClick={() => setOnglet(o.id)}
            className={`min-h-11 rounded-xl px-3 text-xs font-extrabold transition ${
              onglet === o.id ? 'bg-forest text-paper' : 'border border-line bg-paper text-ink-soft'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        {onglet === 'verificateur' && (
          <div>
            <p className="text-sm font-bold leading-relaxed text-ink">
              قبل ما تكتب: على ماذا بنيت جوابك؟
            </p>
            <p className="petit doux mt-1">ثلاثة تحقّقات سريعة — بلا نقاط، بلا حكم.</p>
            <div className="mt-3 space-y-2">
              {CASES_VERIFICATION.map((texte, i) => (
                <label
                  key={texte}
                  className="flex min-h-11 cursor-pointer items-start gap-2 rounded-xl border border-line bg-paper px-3 py-2"
                >
                  <input
                    type="checkbox"
                    checked={cases[i]}
                    onChange={() =>
                      setCases((prev) => prev.map((v, k) => (k === i ? !v : v)))
                    }
                    className="mt-0.5 h-4 w-4 accent-[var(--color-primary)]"
                  />
                  <span className="text-[13px] font-bold leading-relaxed text-ink">{texte}</span>
                </label>
              ))}
            </div>
            <p className="petit doux mt-3">
              إذا كان صندوق فارغًا، فالجواب بعده ناقص: التفسير لا يُقبل بدون مقارنة بالشاهد.
            </p>
          </div>
        )}

        {onglet === 'verbe' && (
          <div>
            {attendu ? (
              <>
                <p className="text-sm font-bold leading-relaxed text-ink">{attendu.attendu}</p>
                <ol className="mt-3 space-y-2">
                  {attendu.checklist.map((point, i) => (
                    <li key={point} className="rounded-xl border border-line bg-paper px-3 py-2">
                      <span className="text-[10px] font-black text-forest">0{i + 1}</span>
                      <p className="mt-0.5 text-[13px] font-bold leading-relaxed text-ink">{point}</p>
                    </li>
                  ))}
                </ol>
                <p className="petit doux mt-3">{MENTION_STATUT.a_valider_enseignant}</p>
              </>
            ) : (
              <p className="petit doux">هذا الفعل ما عندوش بطاقة بعد — نمشيو بالقاعدة العامة: دليل، تفسير، استنتاج.</p>
            )}
          </div>
        )}

        {onglet === 'pieges' && (
          <div>
            <p className="oeil">أفخاخ {uniteInfo ? `الوحدة ${uniteInfo.numero}` : 'هذا الدرس'}</p>
            {uniteInfo?.piegesAr?.length ? (
              <ul className="mt-2 space-y-2">
                {uniteInfo.piegesAr.map((piege) => (
                  <li key={piege} className="rounded-xl border border-honey-line bg-honey-soft px-3 py-2">
                    <p className="text-[13px] font-bold leading-relaxed text-honey-ink">{piege}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="petit doux mt-2">ما سجّلناش فخًّا لهذه الوحدة بعد.</p>
            )}

            <p className="oeil mt-4">بطاقات الدروس التي ربحتها</p>
            {cartes.length === 0 ? (
              <p className="petit doux mt-1">
                ما زال ما ربحت حتى بطاقة — البطاقة تُفتح بعد الخطوات الستّ لدرس.
              </p>
            ) : (
              <div className={`mt-2 space-y-2 ${compact ? '' : 'sm:grid sm:grid-cols-2 sm:gap-2 sm:space-y-0'}`}>
                {cartes.map(([id, carte]) => (
                  <CarteLecon key={id} lessonId={id} points={carte.points} compact />
                ))}
              </div>
            )}
            {cartes.length === 0 && lessonId && (
              <p className="petit doux mt-2">{titreLecon(lessonId)}</p>
            )}
          </div>
        )}

        {onglet === 'labo' && renduLabo}
      </div>
    </section>
  );
}
