// الباك خطوة بخطوة — une consigne officielle = une étape.
//
// Règles tenues (contrat de la maquette) :
//   · l'élève écrit AVANT de voir les éléments de réponse (jamais de solution d'emblée) ;
//   · aucune note sur 20, aucun chronomètre, aucun « Game Over » ;
//   · l'erreur ne rougit pas : elle ouvre une carte à revoir (carnet) et vaut 0 XP, pas une punition ;
//   · l'évaluation est celle de l'élève (3 / 2 / 0), puis l'exercice fini donne +6.

import { useMemo, useState } from 'react';
import type { Etat } from '../types';
import type { ExerciceOfficiel, SujetOfficiel } from '../data/sujetsOfficiels';
import { UNITES } from '../data/programme';
import { nb } from '../utils/dates';
import { IcoRetour, IcoVerifie } from './Icones';
import {
  avancementExercice,
  cleExercice,
  etapesDe,
  type QualiteEtape,
} from '../utils/bacPasAPas';

interface Props {
  etat: Etat;
  sujet: SujetOfficiel;
  exercice: ExerciceOfficiel;
  onEtape: (cle: string, qualite: QualiteEtape) => void;
  onTermine: (cle: string) => void;
  onCarnetFaute: (f: { contexte: string; enonce: string; donne: string; diagnostic: string }) => void;
  onFermer: () => void;
}

const QUALITES: { q: QualiteEtape; label: string; sous: string }[] = [
  { q: 3, label: 'جواب تامّ', sous: '+3' },
  { q: 2, label: 'ناقص', sous: '+2' },
  { q: 0, label: 'ما عرفتش', sous: '+0' },
];

export default function BacPasAPas({
  etat, sujet, exercice, onEtape, onTermine, onCarnetFaute, onFermer,
}: Props) {
  const etapes = useMemo(() => etapesDe(sujet, exercice), [sujet, exercice]);
  const [index, setIndex] = useState(() => {
    const premier = etapes.findIndex((e) => etat.bacEtapes?.[e.cle] === undefined);
    return premier === -1 ? 0 : premier;
  });
  const [brouillon, setBrouillon] = useState('');
  const [revele, setRevele] = useState(false);
  const [fin, setFin] = useState(false);

  const etape = etapes[index] as ReturnType<typeof etapesDe>[number] | undefined;
  const unites = exercice.unites
    .map((id) => UNITES.find((u) => u.id === id)?.titre)
    .filter(Boolean) as string[];

  const repondre = (q: QualiteEtape) => {
    if (!etape) return;
    onEtape(etape.cle, q);
    if (q === 0) {
      onCarnetFaute({
        contexte: `الباك ${sujet.annee} · التمرين ${nb(exercice.numero)} · ${etape.partie}`,
        enonce: etape.texte,
        donne: etape.attendu.slice(0, 2).join(' · '),
        diagnostic: `الفعل المطلوب: ${etape.verbe} — لم أستطع كتابة الجواب.`,
      });
    }
    if (index + 1 < etapes.length) {
      setIndex(index + 1);
      setBrouillon('');
      setRevele(false);
    } else {
      setFin(true);
    }
  };

  if (!etape) {
    return (
      <div dir="rtl" className="mx-auto max-w-3xl px-4 py-8">
        <p className="petit doux">هذا التمرين بلا تعليمات مسجّلة.</p>
        <button type="button" className="btn-mini mt-3" onClick={onFermer}>→ رجوع</button>
      </div>
    );
  }

  if (fin) {
    const total = avancementExercice(etat, etapes);
    const cle = cleExercice(sujet.id, exercice.numero);
    const enregistre = Boolean(etat.bacExercices?.[cle]);
    return (
      <div dir="rtl" className="mx-auto max-w-3xl px-4 py-8">
        <p className="oeil">الباك · {nb(sujet.annee)} · التمرين {nb(exercice.numero)}</p>
        <h1 className="titre-1 mt-1">كملت التمرين</h1>
        <p className="petit doux mt-1">
          ما كانش وقت، وما كانش علامة على 20. اللي يهمّ: كلّ تعليمة كتبت فيها قبل ما تشوف الجواب.
        </p>

        <section className="carte mt-4">
          <div className="rangee rangee--entre">
            <span className="oeil">حصيلة التمرين</span>
            <span className="mention mention--or">{nb(etapes.length)} خطوة</span>
          </div>
          <p className="carte__titre mt-2">{exercice.theme}</p>
          <p className="petit mt-1">
            {nb(total.faites)} من {nb(etapes.length)} خطوة تقيّمت — {nb(total.xp)} XP من الخطوات.
          </p>
          {enregistre && (
            <p className="mention mention--vert mt-2">
              <span className="block h-3.5 w-3.5"><IcoVerifie /></span> التمرين كامل · +6 XP
            </p>
          )}
        </section>

        <div className="mt-4 flex flex-col gap-2">
          {!enregistre && (
            <button
              type="button"
              className="btn btn--primaire w-full"
              onClick={() => onTermine(cle)}
            >
              أنهِ التمرين · +6 XP
            </button>
          )}
          <button type="button" className="btn btn--secondaire w-full" onClick={onFermer}>
            رجوع إلى الباك
          </button>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="mx-auto max-w-3xl px-4 pb-28 pt-6">
      <div className="rangee rangee--entre mb-3">
        <button type="button" className="btn-mini" onClick={onFermer}>
          <span className="block h-3.5 w-3.5"><IcoRetour /></span> رجوع
        </button>
        <span className="mention">
          خطوة {nb(etape.numero)} من {nb(etapes.length)}
        </span>
      </div>

      <header className="mb-3">
        <p className="oeil">
          الباك {nb(sujet.annee)} · التمرين {nb(exercice.numero)} · {nb(exercice.bareme)} نقاط
        </p>
        <h1 className="carte__titre mt-1 text-lg">{exercice.theme}</h1>
        {unites.length > 0 && (
          <p className="petit doux mt-1">الوحدات المعنيّة: {unites.join(' · ')}</p>
        )}
      </header>

      {/* La consigne — une seule à la fois */}
      <section className="carte mb-3">
        <div className="rangee rangee--galerie mb-2">
          <span className="mention mention--or">{etape.verbe}</span>
          {etape.partie !== exercice.theme && (
            <span className="mention">{etape.partie}</span>
          )}
          {etape.points !== undefined && (
            <span className="mention">{nb(etape.points)} نقاط</span>
          )}
        </div>
        <p className="text-[15px] font-semibold leading-relaxed text-ink">{etape.texte}</p>
        {etape.surDocument && (
          <p className="petit doux mt-2">الجواب يعتمد على الوثيقة المرافقة في ورقة الامتحان.</p>
        )}
        {etape.contexte && (
          <p className="petit doux mt-1">السند: {etape.contexte}</p>
        )}
      </section>

      {/* Écrire d'abord */}
      <section className="carte mb-3">
        <label htmlFor="reponse-bac" className="oeil">اكتب جوابك هنا</label>
        <textarea
          id="reponse-bac"
          value={brouillon}
          onChange={(e) => setBrouillon(e.target.value)}
          rows={4}
          className="field mt-2 w-full resize-y text-sm"
          placeholder="من ذاكرتك، بلا ما تشوف الجواب…"
        />
        <p className="petit doux mt-1">
          الكتابة تبقى على الشاشة برك — ما تتبعثش، وما تتحسبش.
        </p>
      </section>

      {!revele && (
        <button
          type="button"
          className="btn btn--primaire w-full"
          onClick={() => setRevele(true)}
          disabled={brouillon.trim().length === 0}
        >
          {brouillon.trim().length === 0 ? 'اكتب أوّلًا' : 'قارن بعناصر الإجابة'}
        </button>
      )}

      {revele && (
        <>
          <section className="carte mb-3">
            <div className="carte__tete">
              <h2 className="carte__titre">عناصر الإجابة</h2>
              <span className="mention mention--vert">من التصحيح الرسمي</span>
            </div>
            {etape.attendu.length > 0 ? (
              <ul className="mt-2 flex flex-col gap-1.5">
                {etape.attendu.map((a, i) => (
                  <li key={i} className="rangee items-start">
                    <span className="mt-1 block h-1.5 w-1.5 flex-none rounded-full bg-primary" aria-hidden="true" />
                    <span className="petit text-ink-soft">{a}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="petit doux mt-2">
                عناصر الإجابة غير متوفّرة لهذا السؤال — قارن مع درس الوحدة.
              </p>
            )}
            {etape.documents.length > 0 && (
              <>
                <hr className="filet" />
                <p className="oeil mb-1">وصف الوثائق</p>
                <ul className="flex flex-col gap-1">
                  {etape.documents.map((d, i) => (
                    <li key={i} className="petit doux">{d}</li>
                  ))}
                </ul>
              </>
            )}
          </section>

          <p className="oeil mb-2">كيفاش كان جوابك؟</p>
          <div className="flex flex-col gap-2">
            {QUALITES.map(({ q, label, sous }) => (
              <button
                key={q}
                type="button"
                className="btn btn--secondaire w-full"
                onClick={() => repondre(q)}
              >
                <span className="flex-1 text-start">{label}</span>
                <span className="mention mention--or">{sous}</span>
              </button>
            ))}
          </div>
          <p className="petit doux mt-2 text-center">
            ما كاينش عقاب: «ما عرفتش» تزيد بطاقة في دفتر الأخطاء، برك.
          </p>
        </>
      )}
    </div>
  );
}
