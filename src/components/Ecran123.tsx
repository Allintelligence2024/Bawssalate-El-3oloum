// البوصلة 1-2-3 — la méthode universelle, appliquée sur un exercice réel.
//
//   ① التقط        : le verbe de consigne, l'attendu du correcteur, en une ligne ;
//   ② بدّل وقارن  : épingler la preuve (observation) puis la comparaison au témoin ;
//   ③ ركّب الجواب : assembler la réponse avec des briques, sans clavier.
//
// Le tiroir « source vivant » est accessible à tout moment : il ne remplace jamais le travail,
// il rappelle la règle (témoin, checklist du verbe, pièges).
//
// Aucun texte libre n'est demandé — et si l'élève préfère rédiger, l'écran le dit et laisse la
// porte ouverte : la rédaction libre reste dans l'écran de synthèse, pas ici.

import { useMemo, useRef, useState } from 'react';
import { nb } from '../utils/dates';
import type { Etat } from '../types';
import { basculerBrique, type EvaluationBriques, type JeuBriques } from '../utils/briques';
import { progresDuJeu } from '../utils/amelioration';
import { attenduDe } from '../data/methodologie/attenduVerbes';
import ConstructeurReponse from './ConstructeurReponse';
import TiroirBoussole, { type OngletTiroir } from './TiroirBoussole';

interface Props {
  etat: Etat;
  jeux: JeuBriques[];
  /** Titre de l'écran (unité, sujet…). */
  titre: string;
  onFermer: () => void;
  onTentative: (jeu: JeuBriques, ids: string[], evaluation: EvaluationBriques) => void;
}

type Etape = 1 | 2 | 3;

/** Surligne le verbe de consigne dans l'énoncé (sans jamais réécrire l'énoncé). */
function EnonceSurligne({ texte, verbe }: { texte: string; verbe: string }) {
  const noyau = verbe.replace(/[ِّـ]/g, '');
  const index = texte.indexOf(noyau);
  if (index < 0) return <p className="text-sm font-bold leading-relaxed text-ink">{texte}</p>;
  return (
    <p className="text-sm font-bold leading-relaxed text-ink">
      {texte.slice(0, index)}
      <mark className="rounded bg-gold-soft px-1 text-forest-deep">{texte.slice(index, index + noyau.length)}</mark>
      {texte.slice(index + noyau.length)}
    </p>
  );
}

export default function Ecran123({ etat, jeux, titre, onFermer, onTentative }: Props) {
  const [jeuId, setJeuId] = useState<string | null>(jeux.length === 1 ? jeux[0].id : null);
  const [etape, setEtape] = useState<Etape>(1);
  const [preuves, setPreuves] = useState<string[]>([]);
  const [messagePreuve, setMessagePreuve] = useState<string | null>(null);
  const [tiroir, setTiroir] = useState<OngletTiroir | null>(null);
  const dialogue = useRef<HTMLDialogElement>(null);

  const jeu = useMemo(() => jeux.find((j) => j.id === jeuId) ?? null, [jeux, jeuId]);
  const attendu = jeu ? attenduDe(jeu.verbe) : undefined;
  const progres = jeu ? progresDuJeu(etat, jeu.id, jeu.structure.length) : null;

  const ouvrirTiroir = (onglet: OngletTiroir) => {
    setTiroir(onglet);
    const el = dialogue.current;
    if (el && !el.open) el.showModal();
  };
  const fermerTiroir = () => {
    dialogue.current?.close();
    setTiroir(null);
  };

  if (!jeu) {
    return (
      <div dir="rtl" className="mx-auto max-w-3xl px-4 pb-24 pt-6">
        <div className="rangee rangee--entre">
          <p className="oeil">{titre}</p>
          <button type="button" className="btn-mini" onClick={onFermer}>
            رجوع
          </button>
        </div>
        <h1 className="titre-1 mt-1">اختر تمرينًا</h1>
        <p className="petit doux mt-1">
          كلّ تمرين نبني جوابه بثلاث خطوات: نلتقط الفعل، نبدّل ونقارن بالشاهد، ثم نركّب الجواب.
        </p>
        <div className="mt-3 space-y-2">
          {jeux.map((j) => (
            <button
              key={j.id}
              type="button"
              onClick={() => {
                setJeuId(j.id);
                setEtape(1);
                setPreuves([]);
                setMessagePreuve(null);
              }}
              className="w-full rounded-2xl border border-line bg-paper px-4 py-3 text-right transition hover:border-forest"
            >
              <span className="mention mention--or">{j.verbe}</span>
              <p className="mt-1 text-sm font-bold leading-relaxed text-ink">{j.question}</p>
              <p className="petit doux mt-0.5">{j.document}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const verifierPreuves = () => {
    const choisies = jeu.briques.filter((b) => preuves.includes(b.id));
    const roles = choisies.map((b) => b.role);
    const aObservation = roles.includes('observation');
    const aComparaison = roles.includes('comparaison');
    if (aObservation && aComparaison) {
      setMessagePreuve('الدليل مثبّت: ملاحظة + مقارنة بالشاهد. هذا ما يُبنى عليه التفسير.');
    } else if (aObservation) {
      setMessagePreuve('عندك الملاحظة، ولكن المقارنة بالشاهد ناقصة: نفس المعيار، ثم الفرق.');
    } else if (aComparaison) {
      setMessagePreuve('عندك المقارنة، ولكن الملاحظة ناقصة: ما الذي تُظهره الوثيقة بالأرقام؟');
    } else {
      setMessagePreuve('ما زال الدليل غير مثبّت: ابدأ بما تُظهره الوثيقة، ثم قارن بالشاهد.');
    }
  };

  return (
    <div dir="rtl" className="mx-auto max-w-3xl px-4 pb-28 pt-6">
      <div className="rangee rangee--entre">
        <p className="oeil">{titre} · خطوة {nb(etape)} من 3</p>
        <div className="rangee">
          <button type="button" className="btn-mini" onClick={() => ouvrirTiroir('verificateur')}>
            افتح البوصلة
          </button>
          <button type="button" className="btn-mini" onClick={onFermer}>
            رجوع
          </button>
        </div>
      </div>

      <nav aria-label="خطوات الطريقة" className="rangee rangee--galerie mt-2">
        {(['التقط', 'بدّل وقارن', 'ركّب الجواب'] as const).map((label, i) => {
          const n = (i + 1) as Etape;
          const actif = etape === n;
          return (
            <button
              key={label}
              type="button"
              onClick={() => setEtape(n)}
              aria-current={actif ? 'step' : undefined}
              className={`min-h-11 rounded-xl px-3 text-[11px] font-extrabold ${
                actif ? 'bg-forest text-paper' : 'border border-line bg-paper text-ink-soft'
              }`}
            >
              {nb(n)} · {label}
            </button>
          );
        })}
      </nav>

      {etape === 1 && (
        <section className="carte mt-3 p-4">
          <p className="oeil">1 · التقط</p>
          <div className="mt-1">
            <EnonceSurligne texte={jeu.question} verbe={jeu.verbe} />
          </div>
          <p className="petit doux mt-2">السند: {jeu.document}</p>
          <div className="mt-3 rounded-xl border border-forest/40 bg-sage-soft/60 px-3 py-2">
            <p className="text-[10px] font-black tracking-wide text-forest">ما ينتظره المصحّح</p>
            <p className="mt-1 text-[13.5px] font-bold leading-relaxed text-forest-deep">{jeu.attendu}</p>
          </div>
          {attendu && (
            <ul className="mt-2 space-y-1">
              {attendu.checklist.map((point) => (
                <li key={point} className="flex items-start gap-2 text-[12.5px] leading-relaxed text-ink-soft">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  {point}
                </li>
              ))}
            </ul>
          )}
          <button type="button" className="btn--primaire mt-3 w-full" onClick={() => setEtape(2)}>
            التالي · أبدّل وأقارن
          </button>
        </section>
      )}

      {etape === 2 && (
        <section className="carte mt-3 p-4">
          <p className="oeil">2 · بدّل وقارن</p>
          <p className="petit doux mt-1">
            اثبت الدليل: اختر العبارة التي تلاحظ بها، ثم التي تقارن بها بالشاهد. الباقي يأتي في الخطوة 3.
          </p>
          <div className="mt-3 space-y-2">
            {jeu.briques
              .filter((b) => b.role !== 'piege')
              .map((brique) => {
                const choisi = preuves.includes(brique.id);
                return (
                  <button
                    key={brique.id}
                    type="button"
                    aria-pressed={choisi}
                    onClick={() => {
                      setMessagePreuve(null);
                      setPreuves((prev) => basculerBrique(prev, brique.id));
                    }}
                    className={`w-full rounded-2xl border px-4 py-3 text-right text-[13px] font-bold leading-relaxed transition ${
                      choisi
                        ? 'border-forest bg-sage text-forest-deep'
                        : 'border-line bg-paper text-ink hover:border-forest'
                    }`}
                  >
                    {brique.texte}
                  </button>
                );
              })}
          </div>
          {messagePreuve && (
            <p role="status" className="mt-3 rounded-xl border border-honey-line bg-honey-soft px-3 py-2 text-[12.5px] font-bold leading-relaxed text-honey-ink">
              {messagePreuve}
            </p>
          )}
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <button type="button" className="btn--secondaire w-full text-xs" onClick={verifierPreuves}>
              تحقّق من الدليل
            </button>
            <button type="button" className="btn--primaire w-full text-xs" onClick={() => setEtape(3)}>
              التالي · ركّب
            </button>
          </div>
        </section>
      )}

      {etape === 3 && (
        <div className="mt-3">
          <ConstructeurReponse
            jeu={jeu}
            progresConnu={progres}
            onOuvrirTiroir={ouvrirTiroir}
            onEvaluer={(ids, evaluation) => onTentative(jeu, ids, evaluation)}
          />
          <div className="mt-3 rounded-xl border border-line bg-bg px-3 py-2">
            <p className="petit doux">
              تفضّل تكتب بحرّيتك؟ اكتب جوابك على ورقتك ثم افتح «النص العلمي» — البنية نفسها:
              ملاحظة، مقارنة، تفسير، استنتاج.
            </p>
          </div>
        </div>
      )}

      {progres && etape === 3 && (
        <p className="petit doux mt-2 tnum">{progres.phrase}</p>
      )}

      <dialog
        ref={dialogue}
        aria-label="البوصلة · مصدر حيّ"
        dir="rtl"
        onCancel={(e) => {
          e.preventDefault();
          fermerTiroir();
        }}
        className="fixed inset-0 m-auto max-h-none w-[min(100%,44rem)] max-w-none border-0 bg-paper p-0 backdrop:bg-black/60"
      >
        <div className="flex h-[88dvh] flex-col">
          {tiroir && (
            <TiroirBoussole
              document={jeu.document}
              verbe={jeu.verbe}
              etat={etat}
              ongletInitial={tiroir}
              onFermer={fermerTiroir}
              compact
            />
          )}
        </div>
      </dialog>
    </div>
  );
}
