// كويست اليوم — la porte d'entrée de la journée : 3 minutes, 3 étapes, puis
// la possibilité de continuer la séance complète (46 min).
//
// Contrat tenu :
//   · on choisit, on n'écrit pas ; une erreur ne rougit pas et ne fait perdre aucun point ;
//   · aucune note, aucun chrono, aucun « Game Over » ;
//   · la quête ne remplace rien : elle ouvre exactement sur la leçon que le moteur propose.

import { useMemo, useState } from 'react';
import type { Etat } from '../types';
import { nb } from '../utils/dates';
import { DUREE_TOTALE_MIN } from '../data/protocole';
import { contexteKouest, etapesKouest } from '../utils/kouest';
import { IcoRetour, IcoVerifie } from './Icones';

interface Props {
  etat: Etat;
  lessonId: string;
  /** Appelé une seule fois par étape réussie (clé stable → `etat.drills`). */
  onBonneReponse: (cle: string) => void;
  /** « كمّل الجلسة كاملة » : ouvre le protocole 46 min sur la même leçon. */
  onTerminerSeance: (lessonId: string) => void;
  onFermer: () => void;
}

export default function Kouest({ etat, lessonId, onBonneReponse, onTerminerSeance, onFermer }: Props) {
  const etapes = useMemo(() => etapesKouest(lessonId), [lessonId]);
  const contexte = useMemo(() => contexteKouest(lessonId), [lessonId]);
  const [index, setIndex] = useState(0);
  const [fausses, setFausses] = useState<string[]>([]);
  const [reussi, setReussi] = useState(false);
  const [fin, setFin] = useState(false);

  const etape = etapes[index];

  if (etapes.length === 0) {
    return (
      <div dir="rtl" className="mx-auto max-w-3xl px-4 py-8">
        <p className="oeil">كويست اليوم</p>
        <h1 className="titre-1 mt-1">هاد الدرس بلا كويست</h1>
        <p className="petit doux mt-1">
          ما لقيناش أسئلة اختيار لهذا الدرس — نقدرو نبداو الجلسة الكاملة مباشرة.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <button type="button" className="btn btn--primaire w-full" onClick={() => onTerminerSeance(lessonId)}>
            ابدأ الجلسة الكاملة · {nb(DUREE_TOTALE_MIN)} دقيقة
          </button>
          <button type="button" className="btn btn--secondaire w-full" onClick={onFermer}>
            رجوع
          </button>
        </div>
      </div>
    );
  }

  if (fin || !etape) {
    const gagnees = etapes.filter((e) => etat.drills?.[e.cle]).length;
    return (
      <div dir="rtl" className="mx-auto max-w-3xl px-4 py-8">
        <p className="oeil">كويست اليوم · {contexte.lecon}</p>
        <h1 className="titre-1 mt-1">خلصت الكويست</h1>
        <p className="petit doux mt-1">
          3 دقائق، بلا علامة وبلا وقت. اللي جيت عليه اليوم يبقى في ذاكرتك أكثر من اللي تقراه مرّتين.
        </p>

        <section className="carte mt-4">
          <div className="rangee rangee--entre">
            <span className="oeil">حصيلة الكويست</span>
            <span className="mention mention--or">{nb(etapes.length)} خطوات</span>
          </div>
          <p className="carte__titre mt-2">{contexte.lecon}</p>
          {contexte.unite && <p className="petit doux">{contexte.unite}</p>}
          <p className="mention mention--vert mt-2">
            <span className="block h-3.5 w-3.5"><IcoVerifie /></span>
            {nb(gagnees)} من {nb(etapes.length)} · {nb(gagnees * 3)} XP
          </p>
        </section>

        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            className="btn btn--primaire w-full"
            onClick={() => onTerminerSeance(lessonId)}
          >
            كمّل الجلسة كاملة · {nb(DUREE_TOTALE_MIN)} دقيقة
          </button>
          <button type="button" className="btn btn--secondaire w-full" onClick={onFermer}>
            يكفي اليوم — رجوع
          </button>
        </div>
        <p className="petit doux mt-3 text-center">
          الجلسة الكاملة اختيارية. الكويست وحدها تكفي كبداية.
        </p>
      </div>
    );
  }

  const juste = (option: string) => {
    if (option !== etape.bonne) {
      setFausses((f) => (f.includes(option) ? f : [...f, option]));
      return;
    }
    onBonneReponse(etape.cle);
    setReussi(true);
  };

  const suivant = () => {
    if (index + 1 < etapes.length) {
      setIndex(index + 1);
      setFausses([]);
      setReussi(false);
    } else {
      setFin(true);
    }
  };

  return (
    <div dir="rtl" className="mx-auto max-w-3xl px-4 pb-28 pt-6">
      <div className="rangee rangee--entre mb-3">
        <button type="button" className="btn-mini" onClick={onFermer}>
          <span className="block h-3.5 w-3.5"><IcoRetour /></span> رجوع
        </button>
        <span className="mention">
          خطوة {nb(index + 1)} من {nb(etapes.length)}
        </span>
      </div>

      <header className="mb-4">
        <p className="oeil">كويست اليوم · 3 دقائق</p>
        <h1 className="carte__titre mt-1 text-lg">{contexte.lecon}</h1>
        {contexte.unite && <p className="petit doux mt-0.5">{contexte.unite}</p>}
        <div className="jauge mt-3" aria-hidden="true">
          <div
            className="jauge__r"
            style={{ width: `${Math.round((index / etapes.length) * 100)}%` }}
          />
        </div>
      </header>

      <section className="carte mb-3">
        <span className="mention mention--or mb-2">{etape.titre}</span>
        <p className="mt-2 text-[15px] font-semibold leading-relaxed text-ink">{etape.question}</p>
      </section>

      <div className="flex flex-col gap-2">
        {etape.options.map((o) => {
          const rate = fausses.includes(o);
          const bon = reussi && o === etape.bonne;
          // Après réussite, on n'affiche plus des boutons désactivés (le style
          // « disabled » écrasait la mise en avant de la bonne réponse).
          if (reussi) {
            return (
              <div
                key={o}
                className={`rounded-xl border px-3 py-3 text-sm leading-relaxed ${
                  bon
                    ? 'border-primary bg-primary-soft font-bold text-primary'
                    : 'border-line bg-paper text-mute opacity-55'
                }`}
              >
                {o}
              </div>
            );
          }
          return (
            <button
              key={o}
              type="button"
              disabled={rate}
              onClick={() => juste(o)}
              className={`btn btn--secondaire w-full text-start text-sm ${rate ? 'opacity-45' : ''}`}
            >
              {o}
            </button>
          );
        })}
      </div>

      {fausses.length > 0 && !reussi && (
        <p className="petit mt-3 rounded-xl border border-honey-line bg-honey-soft px-3 py-2 text-honey-ink">
          موش راك بعيد — عاود، الخطأ هنا ما يخسّرك والو.
        </p>
      )}

      {reussi && (
        <>
          <section className="carte mt-3 border-primary/30 bg-primary-soft">
            <div className="rangee rangee--galerie">
              <span className="mention mention--vert">صحيح</span>
              <span className="petit text-ink">{etape.explication}</span>
            </div>
          </section>
          <button type="button" className="btn btn--primaire mt-3 w-full" onClick={suivant}>
            {index + 1 < etapes.length ? 'الخطوة التالية' : 'شوف الحصيلة'}
          </button>
        </>
      )}
    </div>
  );
}
