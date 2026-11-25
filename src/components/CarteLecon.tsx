// « بطاقة الدرس » — fiche de poche gagnée à la fin des six nœuds.
//
// Trois points seulement (le problème, la conclusion, le piège), dérivés de la fiche dorée au
// moment du gain. Elle est réutilisable dans le tiroir de la Boussole et dans les exercices :
// c'est la seule « antisèche » autorisée par la méthode, et elle est gagnée par le travail.

import { getLessonGoldSummary } from '../data/lessonGoldSummaries';
import { pointsCarteLecon } from '../utils/pointsCarteLecon';
import { titreLecon, uniteDeLecon } from '../data/programme';

interface Props {
  lessonId: string;
  /** Points figés au moment du gain (prioritaires sur la fiche courante). */
  points?: [string, string, string];
  compact?: boolean;
}

export default function CarteLecon({ lessonId, points, compact = false }: Props) {
  const lecon = getLessonGoldSummary(lessonId);
  const trois = points ?? pointsCarteLecon(lessonId);
  const unite = uniteDeLecon(lessonId);
  const libelles = ['السؤال', 'الخلاصة', 'الفخّ'];

  return (
    <section
      dir="rtl"
      className={`carte ${compact ? 'p-4' : 'p-5'}`}
      aria-label={`بطاقة الدرس · ${titreLecon(lessonId)}`}
    >
      <div className="rangee rangee--entre">
        <p className="oeil">بطاقة الدرس · جيب</p>
        <span className="mention mention--or">3 نقاط</span>
      </div>
      <p className="carte__titre mt-1">{titreLecon(lessonId)}</p>
      {unite && <p className="petit doux mt-0.5">{`الوحدة ${unite.numero} · ${unite.titre}`}</p>}

      <ol className="mt-3 space-y-2">
        {trois.map((texte, i) => (
          <li key={i} className="rounded-xl border border-line bg-paper px-3 py-2">
            <p className="text-[10px] font-extrabold tracking-wide text-forest">{libelles[i]}</p>
            <p className="mt-1 text-[13.5px] font-bold leading-relaxed text-ink">{texte}</p>
          </li>
        ))}
      </ol>

      <p className="petit doux mt-3">
        {lecon?.status === 'a_valider_enseignant'
          ? 'ملخّص في انتظار مراجعة أستاذ — استعمله كمنبّه، لا كمرجع.'
          : 'هذه البطاقة نتيجة عملك: تفتحها في التمارين والمواضيع.'}
      </p>
    </section>
  );
}
