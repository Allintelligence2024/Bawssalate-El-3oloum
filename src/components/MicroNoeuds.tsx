// شاشة النُّوَيْدات — « la leçon en six pas de 3 à 5 minutes ».
//
// Elle ne remplace pas le protocole : elle le **projette**. Un nœud = une phase, et les faits
// s'écrivent toujours dans `progression[lessonId].phases` (cf. utils/microNoeuds.ts).
// L'écran répond à trois questions, dans cet ordre : où j'en suis, combien de temps ça prend,
// et qu'est-ce que je saurai faire après.

import { nb } from '../utils/dates';
import type { Etat } from '../types';
import { resumeNoeuds, type NoeudMicro } from '../utils/microNoeuds';
import CarteLecon from './CarteLecon';
import MascotteKunz from './MascotteKunz';
import { IcoVerifie } from './Icones';

interface Props {
  etat: Etat;
  lessonId: string;
  /** Ouvre le protocole : il reprend automatiquement à la première phase non validée. */
  onOuvrirNoeud: () => void;
  /** Séance complète (46 min) — lien secondaire, jamais imposé. */
  onOuvrirSeanceComplete: () => void;
  onReparation: () => void;
  onLireLecon: () => void;
  onFermer: () => void;
}

function EtatNoeud({ etat }: { etat: 'fait' | 'courant' | 'avenir' }) {
  if (etat === 'fait') {
    return (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-forest text-paper">
        <span className="h-4 w-4">
          <IcoVerifie />
        </span>
      </span>
    );
  }
  if (etat === 'courant') {
    return (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-forest bg-sage text-[11px] font-black text-forest-deep">
        →
      </span>
    );
  }
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-dashed border-line text-[11px] font-black text-mute">
      ·
    </span>
  );
}

export default function MicroNoeuds({
  etat,
  lessonId,
  onOuvrirNoeud,
  onOuvrirSeanceComplete,
  onReparation,
  onLireLecon,
  onFermer,
}: Props) {
  const resume = resumeNoeuds(etat, lessonId);
  const courant = resume.noeuds.find((n) => !(etat.progression[lessonId]?.phases ?? []).includes(n.phase));
  const termine = !courant;

  return (
    <div dir="rtl" className="mx-auto max-w-3xl px-4 pb-28 pt-6">
      <div className="rangee rangee--entre">
        <p className="oeil">مسار الدرس · {resume.unite}</p>
        <button type="button" className="btn-mini" onClick={onFermer}>
          يكفي اليوم
        </button>
      </div>
      <h1 className="titre-1 mt-1">{resume.lecon}</h1>

      <div className="rangee rangee--galerie mt-2">
        <span className="mention">
          {nb(resume.faites)} من {nb(resume.noeuds.length)} خطوات
        </span>
        <span className="mention mention--vert">
          {termine ? 'الدرس كامل' : `بقيت ${nb(resume.restantes)} دقيقة`}
        </span>
      </div>

      <section className="carte mt-4 p-4">
        <p className="oeil">المهمّة</p>
        <p className="carte__titre mt-1">
          {termine ? 'افتح بطاقة الدرس وراجعها في دقيقة' : courant?.titre}
        </p>
        <p className="petit doux mt-1">
          {termine
            ? 'أنهيت الخطوات الستّ: البطاقة تلخّصها في ثلاث نقاط.'
            : courant?.savoirFaire}
        </p>
        {!termine && (
          <p className="petit doux mt-2">
            البوّابة: {courant?.porte}
          </p>
        )}
        <button type="button" className="btn--primaire mt-3 w-full" onClick={onOuvrirNoeud}>
          {termine ? 'راجع الخطوات' : `ابدأ · ${nb(courant?.minutes ?? 3)} دقائق`}
        </button>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button type="button" className="btn--secondaire w-full text-xs" onClick={onLireLecon}>
            اقرأ الدرس
          </button>
          <button type="button" className="btn--secondaire w-full text-xs" onClick={onReparation}>
            جولة التصحيح
          </button>
        </div>
      </section>

      <ol className="mt-4 space-y-2">
        {resume.noeuds.map((n: NoeudMicro) => {
          const fait = (etat.progression[lessonId]?.phases ?? []).includes(n.phase);
          const estCourant = !fait && courant?.phase === n.phase;
          return (
            <li
              key={n.id}
              className={`flex items-start gap-3 rounded-2xl border px-3 py-3 ${
                estCourant ? 'border-forest bg-forest/[0.04]' : 'border-line bg-paper'
              }`}
            >
              <EtatNoeud etat={fait ? 'fait' : estCourant ? 'courant' : 'avenir'} />
              <div className="min-w-0 flex-1">
                <div className="rangee rangee--entre">
                  <p className={`text-sm font-bold ${fait ? 'text-mute line-through' : 'text-ink'}`}>
                    {nb(n.phase)}. {n.titre}
                  </p>
                  <span className="mention tnum">{nb(n.minutes)} د</span>
                </div>
                <p className="petit doux mt-0.5">{n.savoirFaire}</p>
              </div>
            </li>
          );
        })}
      </ol>

      {resume.ficheDisponible && (
        <div className="mt-4">
          <CarteLecon
            lessonId={lessonId}
            points={etat.cartesLecons?.[lessonId]?.points}
            compact
          />
        </div>
      )}

      <button type="button" className="btn-mini mt-4 w-full" onClick={onOuvrirSeanceComplete}>
        الجلسة الكاملة · {nb(resume.totalSeance)} دقيقة (اختياري)
      </button>

      <div className="mt-4">
        <MascotteKunz
          compact
          message={
            termine
              ? 'الدرس كامل. البطاقة في جيبك، نلقاوك في التمارين.'
              : 'كل خطوة 3 دقائق. تقدر تحبس في أي وقت — ما يضيع والو.'
          }
          tone={termine ? 'gold' : 'forest'}
        />
      </div>
    </div>
  );
}
