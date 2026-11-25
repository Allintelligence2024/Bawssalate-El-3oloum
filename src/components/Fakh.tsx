// صيّاد الفخاخ — « فخّ ولا صحيح؟ »
//
// Un énoncé, deux boutons, jamais de rouge. Un bon jugement vaut 2 XP ; une série
// de 8 jugements complets vaut +4, une seule fois. Une erreur n'enlève rien : elle
// montre l'explication et laisse continuer.
//
// Les énoncés ne sont pas inventés : `options[0]` d'un QCM est une affirmation juste,
// les suivantes sont les distracteurs voulus par l'auteur (voir utils/fakh.ts).

import { useMemo, useState } from 'react';
import type { Etat } from '../types';
import { UNITE_PAR_ID, UNITES } from '../data/programme';
import { nb } from '../utils/dates';
import {
  avancementSerie,
  piegesOfficiels,
  serieFakh,
  type Piege,
} from '../utils/fakh';
import { IcoRetour, IcoVerifie } from './Icones';

interface Props {
  etat: Etat;
  /** Unité proposée d'emblée (celle du jour) ; l'élève peut changer. */
  uniteInitiale?: string;
  onJugement: (cle: string) => void;
  onSerieFinie: (uniteId: string) => void;
  onFermer: () => void;
}

type Phase = 'choix' | 'jeu' | 'bilan';

export default function Fakh({ etat, uniteInitiale, onJugement, onSerieFinie, onFermer }: Props) {
  const jouables = useMemo(() => UNITES.filter((u) => serieFakh(u.id).length > 0), []);
  const [uniteId, setUniteId] = useState<string | null>(
    uniteInitiale && serieFakh(uniteInitiale).length > 0 ? uniteInitiale : null,
  );
  const [phase, setPhase] = useState<Phase>('choix');
  const [index, setIndex] = useState(0);
  const [reponse, setReponse] = useState<boolean | null>(null);
  const [justes, setJustes] = useState(0);

  const serie = uniteId ? serieFakh(uniteId) : [];
  const unite = uniteId ? UNITE_PAR_ID[uniteId] : undefined;
  const officiels = useMemo(() => piegesOfficiels(), []);

  const demarrer = (id: string) => {
    setUniteId(id);
    setIndex(0);
    setJustes(0);
    setReponse(null);
    setPhase('jeu');
  };

  const juger = (ditVrai: boolean) => {
    if (reponse !== null) return;
    const p = serie[index];
    const bon = ditVrai !== p.vrai;
    setReponse(ditVrai);
    if (bon) {
      setJustes((j) => j + 1);
      onJugement(p.cle);
    }
  };

  const suivant = () => {
    if (index + 1 < serie.length) {
      setIndex(index + 1);
      setReponse(null);
      return;
    }
    if (uniteId) onSerieFinie(uniteId);
    setPhase('bilan');
  };

  // ── choix de l'unité ──
  if (phase === 'choix') {
    return (
      <div dir="rtl" className="mx-auto max-w-3xl px-4 pb-28 pt-6">
        <div className="rangee rangee--entre mb-3">
          <button type="button" className="btn-mini" onClick={onFermer}>
            <span className="block h-3.5 w-3.5"><IcoRetour /></span> رجوع
          </button>
          <span className="mention">{nb(officiels.reduce((s, o) => s + o.items.length, 0))} فخًّا رسميًّا</span>
        </div>

        <header className="mb-4">
          <p className="oeil">المراجعة النشيطة · 2 دقائق</p>
          <h1 className="titre-1 mt-1">صيّاد الفخاخ</h1>
          <p className="petit doux mt-1">
            نعرضو عليك جملة، وأنت تقول: فخّ ولا صحيح؟ كلّ حكم صحيح يزيد نقطتين، والسلسلة الكاملة
            تزيد أربع نقاط. الغلط ما ينقصش والو.
          </p>
        </header>

        <div className="flex flex-col gap-2">
          {jouables.map((u) => {
            const av = avancementSerie(etat, u.id);
            return (
              <div key={u.id} className="carte carte__ligne">
                <span className="mention mention--vert tnum" aria-hidden="true">{nb(u.numero)}</span>
                <div className="carte__texte mx-2 flex-1">
                  <p className="carte__titre">{u.titre}</p>
                  <p className="petit doux">
                    {nb(av.trouves)} من {nb(av.total)} فخًّا مكشوفًا
                  </p>
                </div>
                <button type="button" className="btn-mini" onClick={() => demarrer(u.id)}>
                  {av.finie ? 'عاود' : 'ابدأ'}
                </button>
              </div>
            );
          })}
        </div>

        <section className="carte mt-5">
          <div className="carte__tete mb-2">
            <h2 className="carte__titre">الفخاخ الرسمية في البرنامج</h2>
            <span className="mention">{nb(officiels.length)} وحدة</span>
          </div>
          <ul className="flex flex-col gap-3">
            {officiels.map((o) => (
              <li key={o.uniteId}>
                <p className="oeil">{o.unite}</p>
                <ul className="mt-1 flex flex-col gap-1">
                  {o.items.map((p, i) => (
                    <li key={i} className="rangee items-start">
                      <span className="mt-1 block h-1.5 w-1.5 flex-none rounded-full bg-gold" aria-hidden="true" />
                      <span className="petit text-ink-soft">{p}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>
      </div>
    );
  }

  // ── bilan ──
  if (phase === 'bilan' || !unite) {
    const total = serie.length;
    const xp = justes * 2;
    return (
      <div dir="rtl" className="mx-auto max-w-3xl px-4 py-8">
        <p className="oeil">صيّاد الفخاخ · {unite?.titre ?? ''}</p>
        <h1 className="titre-1 mt-1">خلصت السلسلة</h1>
        <p className="petit doux mt-1">
          ما كانش وقت، وما كانش عقاب. اللي صِدتو اليوم يبقى، واللي فاتك ترجع ليه بلا مشكل.
        </p>

        <section className="carte mt-4">
          <div className="rangee rangee--entre">
            <span className="oeil">الحصيلة</span>
            <span className="mention mention--or">{nb(total)} جملة</span>
          </div>
          <p className="carte__titre mt-2">
            {nb(justes)} من {nb(total)} حكم صحيح
          </p>
          <p className="petit doux mt-1">{nb(xp)} XP من الأحكام الصحيحة.</p>
          <p className="mention mention--vert mt-2">
            <span className="block h-3.5 w-3.5"><IcoVerifie /></span>
            {justes === total ? 'سلسلة كاملة بلا غلطة · +4 XP' : 'كمّلت السلسلة · +4 XP'}
          </p>
          {justes < total && (
            <p className="petit doux mt-2">
              اللي فاتك ما يضيعش: كلّ فخّ عندو شرح في «صيّاد الفخاخ»، وعاود السلسلة وقت ما تحب.
            </p>
          )}
        </section>

        <div className="mt-4 flex flex-col gap-2">
          <button type="button" className="btn btn--primaire w-full" onClick={() => uniteId && demarrer(uniteId)}>
            عاود السلسلة
          </button>
          <button type="button" className="btn btn--secondaire w-full" onClick={() => setPhase('choix')}>
            وحدة أخرى
          </button>
          <button type="button" className="btn btn--secondaire w-full" onClick={onFermer}>
            رجوع إلى الباك
          </button>
        </div>
      </div>
    );
  }

  // ── jeu ──
  const p: Piege = serie[index];
  const aRepondu = reponse !== null;
  const bon = aRepondu && reponse !== p.vrai;

  return (
    <div dir="rtl" className="mx-auto max-w-3xl px-4 pb-28 pt-6">
      <div className="rangee rangee--entre mb-3">
        <button type="button" className="btn-mini" onClick={() => setPhase('choix')}>
          <span className="block h-3.5 w-3.5"><IcoRetour /></span> رجوع
        </button>
        <span className="mention">
          {nb(index + 1)} من {nb(serie.length)}
        </span>
      </div>

      <header className="mb-4">
        <p className="oeil">صيّاد الفخاخ · {unite.titre}</p>
        <div className="jauge mt-2" aria-hidden="true">
          <div className="jauge__r" style={{ width: `${Math.round((index / serie.length) * 100)}%` }} />
        </div>
      </header>

      <section className="carte mb-3">
        <span className="mention">تلميذ قال</span>
        <p className="mt-2 text-[15px] font-semibold leading-relaxed text-ink">«{p.enonce}»</p>
        <p className="petit doux mt-2">من {p.lecon}</p>
      </section>

      <div className="flex gap-2">
        <button
          type="button"
          className="btn btn--secondaire flex-1"
          onClick={() => juger(false)}
          disabled={aRepondu}
        >
          فخّ
        </button>
        <button
          type="button"
          className="btn btn--secondaire flex-1"
          onClick={() => juger(true)}
          disabled={aRepondu}
        >
          صحيح
        </button>
      </div>

      {aRepondu && (
        <>
          <section className={`carte mt-3 ${bon ? 'border-primary/30 bg-primary-soft' : 'border-honey-line bg-honey-soft'}`}>
            <div className="rangee rangee--galerie">
              <span className={`mention ${bon ? 'mention--vert' : 'mention--or'}`}>
                {bon ? 'صيد ناجح' : 'موش مشكل'}
              </span>
              <span className="petit text-ink">
                {p.vrai ? 'الجملة صحيحة علميًّا — ماشي فخّ.' : 'هذي فخّ: الجملة غالطة.'}
              </span>
            </div>
            <p className="petit mt-2 text-ink-soft">{p.explication}</p>
          </section>
          <button type="button" className="btn btn--primaire mt-3 w-full" onClick={suivant}>
            {index + 1 < serie.length ? 'الجملة التالية' : 'شوف الحصيلة'}
          </button>
        </>
      )}
    </div>
  );
}
