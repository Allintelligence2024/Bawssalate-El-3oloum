// تحدّي 60 ثانية — format court anti-ennui (v0.11).
//
// Règles : soixante secondes, des questions de la banque de drills de l'unité en cours,
// aucune pénalité, aucun classement. À la fin, on ne dit jamais « raté » — on dit combien de
// questions ont été vues, ce qui suffit à décider de continuer ou de s'arrêter.

import { useEffect, useMemo, useRef, useState } from 'react';
import { chargerDomaineDeUnite } from '../utils/drills';
import type { ItemDrill } from '../data/drills/types';
import { uniteDeLaClasse } from '../utils/moteur';
import { UNITE_PAR_ID } from '../data/programme';
import type { Etat } from '../types';
import { nb } from '../utils/dates';
import MascotteKunz from './MascotteKunz';

interface Props {
  etat: Etat;
  onItemReussi: (id: string, erreurs?: number) => void;
  onFermer: () => void;
  /** Série terminée (temps écoulé ou questions épuisées) : l'appelant note la date, sans score. */
  onTermine?: (questionsVues: number) => void;
  /** Graine optionnelle (tests) : par défaut renouvelée à chaque partie. */
  graine?: number;
}

const DUREE = 60;
const NB_QUESTIONS = 12;

export function melange<T>(liste: T[], graine: number): T[] {
  let h = (graine >>> 0) || 1;
  const sortie = [...liste];
  for (let i = sortie.length - 1; i > 0; i--) {
    h = (Math.imul(h, 1664525) + 1013904223) >>> 0;
    const j = h % (i + 1);
    [sortie[i], sortie[j]] = [sortie[j], sortie[i]];
  }
  return sortie;
}

function nouvelleGraineSession(): number {
  try {
    if (globalThis.crypto?.getRandomValues) {
      return globalThis.crypto.getRandomValues(new Uint32Array(1))[0] || 1;
    }
  } catch {
    /* repli horloge */
  }
  return ((Date.now() ^ Math.floor(Math.random() * 0x7fffffff)) >>> 0) || 1;
}

export default function Defi60({ etat: _etat, onItemReussi, onFermer, onTermine, graine }: Props) {
  const uniteId = useMemo(() => uniteDeLaClasse() ?? 'u1', []);
  const graineSession = useMemo(() => graine ?? nouvelleGraineSession(), [graine]);
  const [items, setItems] = useState<ItemDrill[] | null>(null);
  const [index, setIndex] = useState(0);
  const [secondes, setSecondes] = useState(DUREE);
  const [justes, setJustes] = useState(0);
  const [choix, setChoix] = useState<string | null>(null);
  const [fini, setFini] = useState(false);
  const dejaNote = useRef(false);
  const delaiSuivantRef = useRef<number | null>(null);

  const annulerDelaiSuivant = () => {
    if (delaiSuivantRef.current !== null) {
      window.clearTimeout(delaiSuivantRef.current);
      delaiSuivantRef.current = null;
    }
  };

  useEffect(() => () => annulerDelaiSuivant(), []);

  useEffect(() => {
    let vivant = true;
    const numero = Number(uniteId.replace('u', '')) || 1;
    void chargerDomaineDeUnite(numero).then((liste) => {
      if (!vivant) return;
      setItems(melange(liste, graineSession).slice(0, NB_QUESTIONS));
    });
    return () => {
      vivant = false;
    };
  }, [uniteId, graineSession]);

  useEffect(() => {
    if (fini || secondes <= 0) return;
    const t = window.setTimeout(() => setSecondes((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [secondes, fini]);

  useEffect(() => {
    if (secondes === 0) {
      annulerDelaiSuivant();
      setFini(true);
    }
  }, [secondes]);

  // Une seule note par série, et seulement si l'élève a réellement vu au moins une question.
  useEffect(() => {
    if (!fini || dejaNote.current || index === 0) return;
    dejaNote.current = true;
    onTermine?.(index);
  }, [fini, index, onTermine]);

  const item = items?.[index];
  const options = useMemo(
    () => (item ? melange(item.o, (graineSession ^ (item.id.length + index + 1)) >>> 0) : []),
    [item, index, graineSession],
  );

  if (fini || (items && index >= items.length)) {
    return (
      <div dir="rtl" className="mx-auto max-w-2xl px-4 pb-24 pt-8">
        <p className="oeil">تحدّي 60 ثانية · انتهى</p>
        <h1 className="titre-1 mt-1">{nb(justes)} إجابات صحيحة</h1>
        <p className="petit doux mt-1">
          {nb(index)} سؤالًا في {nb(DUREE)} ثانية — بلا خسارة وبلا حساب. النتيجة هنا للاختيار فقط:
          تكمّل ولا تحبس؟
        </p>
        <button type="button" className="btn--primaire mt-4 w-full" onClick={onFermer}>
          رجوع إلى اليوم
        </button>
        <div className="mt-4">
          <MascotteKunz compact message="دقيقة واحدة ما تكلّفك والو — وتبقى في الذاكرة." />
        </div>
      </div>
    );
  }

  if (!items) {
    return (
      <div dir="rtl" className="mx-auto max-w-2xl px-4 py-10 text-center">
        <p className="oeil">تحدّي 60 ثانية</p>
        <p className="petit doux mt-2">نجهّز الأسئلة…</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div dir="rtl" className="mx-auto max-w-2xl px-4 py-10 text-center">
        <p className="oeil">تحدّي 60 ثانية</p>
        <p className="petit doux mt-2">ما لقيناش أسئلة لهذه الوحدة — نختارو درسًا من «مساري».</p>
        <button type="button" className="btn--secondaire mt-4 w-full" onClick={onFermer}>
          رجوع
        </button>
      </div>
    );
  }

  const bonne = item.o[0];
  const correct = choix === bonne;

  return (
    <div dir="rtl" className="mx-auto max-w-2xl px-4 pb-24 pt-6">
      <div className="rangee rangee--entre">
        <p className="oeil">تحدّي 60 ثانية · {UNITE_PAR_ID[uniteId]?.titre}</p>
        <span className="mention tnum">{nb(secondes)} ث</span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-line">
        <div
          className="h-full rounded-full bg-forest transition-[width] duration-500"
          style={{ width: `${(secondes / DUREE) * 100}%` }}
        />
      </div>

      <section className="carte mt-4 p-5">
        <p className="text-sm font-bold leading-relaxed text-ink">{item.q}</p>
        <div className="mt-3 space-y-2">
          {options.map((option, idxOption) => {
            const estChoisie = choix === option;
            const estBonne = option === bonne;
            const style = !choix
              ? 'border-line bg-paper hover:border-forest'
              : estBonne
                ? 'border-forest bg-sage text-forest-deep'
                : estChoisie
                  ? 'border-honey-line bg-honey-soft text-honey-ink'
                  : 'border-line bg-paper opacity-70';
            return (
              <button
                key={`${item.id}-${idxOption}`}
                type="button"
                disabled={Boolean(choix)}
                onClick={() => {
                  setChoix(option);
                  if (option === bonne) {
                    setJustes((n) => n + 1);
                    onItemReussi(item.id, 0);
                  } else {
                    onItemReussi(item.id, 1);
                  }
                  annulerDelaiSuivant();
                  delaiSuivantRef.current = window.setTimeout(() => {
                    delaiSuivantRef.current = null;
                    setChoix(null);
                    setIndex((i) => i + 1);
                  }, 420);
                }}
                className={`w-full rounded-2xl border px-4 py-3 text-right text-[13.5px] font-bold leading-relaxed transition ${style}`}
              >
                {option}
              </button>
            );
          })}
        </div>
        {choix && (
          <p className="petit doux mt-2">
            {correct ? 'صحيح — ' : 'التوضيح — '}
            {item.e}
          </p>
        )}
      </section>

      <button type="button" className="btn-mini mt-3 w-full" onClick={onFermer}>
        يكفي · اخرج
      </button>
    </div>
  );
}
