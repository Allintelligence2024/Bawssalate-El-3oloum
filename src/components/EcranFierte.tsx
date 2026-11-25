// « خلّصت الدرس » — écran de fierté de fin des six nœuds (Phase 3).
//
// Principe : on ne félicite pas un score, on constate un travail. Trois preuves
// vérifiables (six phases faites, carte gagnée, revision programmée), la mascotte,
// puis **un seul geste** au choix : voir la carte, enchaîner, ou s'arrêter là.
// Aucun pourcentage, aucun « 80 % », aucun bouton qui ne mène nulle part.

import { useState } from 'react';
import type { Etat } from '../types';
import { titreLecon, uniteDeLecon, type ItemChemin } from '../data/programme';
import { prochainItem } from '../utils/moteur';
import CarteLecon from './CarteLecon';

interface Props {
  etat: Etat;
  lessonId: string;
  onOuvrirItem: (item: ItemChemin) => void;
  onFermer: () => void;
}

/** « 2026-11-23 » → « 23 نوفمبر » (sans dépendre d'Intl pour rester identique hors-ligne). */
function jourCourtAr(iso: string | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const mois = ['جانفي', 'فيفري', 'مارس', 'أفريل', 'ماي', 'جوان', 'جويلية', 'أوت', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
  return `${d.getDate()} ${mois[d.getMonth()]}`;
}

export default function EcranFierte({ etat, lessonId, onOuvrirItem, onFermer }: Props) {
  const [carte, setCarte] = useState(false);
  const progression = etat.progression[lessonId];
  const points = etat.cartesLecons?.[lessonId]?.points;
  const phases = progression?.phases.length ?? 0;
  const revision = jourCourtAr(progression?.prochaineRevision);
  const unite = uniteDeLecon(lessonId);
  const suite = prochainItem(etat);

  return (
    <div dir="rtl" className="mx-auto max-w-2xl px-4 pb-28 pt-8">
      <header className="carte">
        <div className="rangee rangee--entre">
          <p className="oeil">الحصّة · ستّ مراحل</p>
          <span className="mention mention--or">{`${phases} / 6`}</span>
        </div>
        <h1 className="titre-1 mt-2">خلّصت الدرس</h1>
        <p className="carte__titre mt-1">{titreLecon(lessonId)}</p>
        {unite && <p className="petit doux mt-0.5">{`الوحدة ${unite.numero} · ${unite.titre}`}</p>}

        <div className="mt-4 flex items-center gap-3">
          <img
            src="/guide-clair.webp"
            alt="المرشد مفتاح"
            className="theme-clair block h-24 w-24 shrink-0 rounded-2xl object-cover object-top"
          />
          <img
            src="/guide-sombre.webp"
            alt=""
            aria-hidden
            className="theme-sombre h-24 w-24 shrink-0 rounded-2xl object-cover object-top"
          />
          <p className="text-sm leading-relaxed">
            ستّ مراحل، ودرس كامل. ماشي علامة تفوت: هذا عمل يبقى — والمرشد شهيد عليه.
          </p>
        </div>
      </header>

      <section className="card mt-4 p-5" aria-label="ما خلّصت">
        <p className="eyebrow">ما خلّصت</p>
        <ul className="mt-3 space-y-2 text-sm">
          <li className="rangee gap-2">
            <span className="mention mention--or">1</span>
            <span>{`ستّ مراحل بروتوكول كاملة (${phases} / 6).`}</span>
          </li>
          <li className="rangee gap-2">
            <span className="mention mention--or">2</span>
            <span>
              {points ? 'بطاقة الدرس في جيبك — تلات نقاط تقراها في دقيقة.' : 'بطاقة الدرس تولّدت من خدامتك.'}
            </span>
          </li>
          <li className="rangee gap-2">
            <span className="mention mention--or">3</span>
            <span>{revision ? `الاسترجاع مبرمج في ${revision} — بلا ما تعاود تحفظ.` : 'الاسترجاع مبرمج من غير ما تحفظ من جديد.'}</span>
          </li>
        </ul>
      </section>

      {carte && (
        <div className="mt-4">
          <CarteLecon lessonId={lessonId} points={points} />
        </div>
      )}

      <div className="mt-4 space-y-2">
        <button
          type="button"
          className="btn btn--secondaire w-full text-sm"
          onClick={() => setCarte((v) => !v)}
          aria-expanded={carte}
        >
          {carte ? 'خبّي بطاقة الدرس' : 'شوف بطاقة الدرس'}
        </button>
        {suite && (
          <button
            type="button"
            className="btn btn--primaire w-full text-sm"
            onClick={() => onOuvrirItem(suite)}
          >
            {suite.type === 'lecon' ? 'الدرس التالي' : 'التالي في مسارك'}
          </button>
        )}
        <button type="button" className="btn btn-ghost w-full text-sm" onClick={onFermer}>
          يكفي اليوم
        </button>
      </div>

      <p className="petit doux mt-4 text-center">الحصّة الجاية تلقاها في «اليوم» — بلا عجلة.</p>
    </div>
  );
}
