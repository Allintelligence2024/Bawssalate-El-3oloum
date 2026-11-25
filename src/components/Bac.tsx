// الباك — البوّابة الرابعة: كلّ ما يخصّ امتحان البكالوريا في بلاصة واحدة.
//
// لا يُعيد بناء ما هو موجود: هذا الشاشة تجمع المداخل وتُظهر ما تعرفه المنصّة
// فعلًا (عدد المواضيع، الأفعال الأكثر تكرارًا، عدد الوحدات، الامتحانات التجريبية).
// المواضيع نفسها تبقى في SujetsOfficiels، والامتحان التجريبي في ExamBlanc.

import type { Etat } from '../types';
import { ANNEES_STRUCTUREES, SUJETS_OFFICIELS, frequenceVerbes, frequenceUnites } from '../data/sujetsOfficiels';
import { etapesFaites } from '../utils/bacPasAPas';
import { UNITES } from '../data/programme';
import { nb } from '../utils/dates';
import { VERSION_APP } from '../utils/sync';

interface Props {
  etat: Etat;
  onOuvrirSujets: () => void;
  onOuvrirExamen: () => void;
  onOuvrirMethodo: () => void;
  onOuvrirSchemas: () => void;
  onOuvrirFakh: () => void;
}

/** خطوات العمل على موضوع — نفس منطق «صيّاد الفخاخ»: بلا وقت، بلا علامة. */
const ETAPES = [
  'اقرأ التعليمات وحدّد الفعل (حلِّل، فسِّر، استنتج…) قبل ما تكتب.',
  'أجب من ذاكرتك أوّلًا — حتّى لو ناقص. الخطأ هنا ما يخسّركش.',
  'قارن بعناصر الإجابة، وسجّل المفخّ اللي طحت فيه.',
];

function Carte({ titre, sous, mention, action, onClick }: {
  titre: string;
  sous: string;
  mention?: string;
  action: string;
  onClick: () => void;
}) {
  return (
    <div className="carte carte__ligne">
      <div className="carte__texte mx-2 flex-1">
        <div className="rangee rangee--galerie">
          <p className="carte__titre">{titre}</p>
          {mention && <span className="mention mention--or">{mention}</span>}
        </div>
        <p className="petit doux mt-1">{sous}</p>
      </div>
      <button type="button" className="btn-mini" onClick={onClick}>
        {action}
      </button>
    </div>
  );
}

export default function Bac({ etat, onOuvrirSujets, onOuvrirExamen, onOuvrirMethodo, onOuvrirSchemas, onOuvrirFakh }: Props) {
  const examens = etat.examens ?? [];
  const verbes = frequenceVerbes().slice(0, 4);
  const unites = Object.entries(frequenceUnites())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id, n]) => ({ titre: UNITES.find((u) => u.id === id)?.titre ?? id, n }));
  const etapesBac = etapesFaites(etat);
  const anneeMax = ANNEES_STRUCTUREES[0];
  const anneeMin = ANNEES_STRUCTUREES[ANNEES_STRUCTUREES.length - 1];

  return (
    <div dir="rtl" className="mx-auto max-w-3xl px-4 pb-28 pt-6">
      <header className="mb-4">
        <p className="oeil">البكالوريا · علوم تجريبية</p>
        <h1 className="titre-1 mt-1">الباك</h1>
        <p className="petit doux mt-1">
          {nb(SUJETS_OFFICIELS.length)} موضوعًا من {nb(anneeMin)} إلى {nb(anneeMax)} — هيكل
          كامل، بلا وثائق مرسومة، وبلا علامة على 20.
        </p>
      </header>

      <section className="mb-5 flex flex-col gap-2">
        <Carte
          titre="موضوع كامل، خطوة بخطوة"
          mention={nb(SUJETS_OFFICIELS.length)}
          sous={
            etapesBac > 0
              ? `${nb(etapesBac)} خطوة تقيّمت. اختار موضوعًا كاملًا وسِر خطوة بخطوة: تفهم، تتحقّق، تكتب، ثم تقارن وتقيّم روحك.`
              : "اختار موضوعًا كاملًا وسِر خطوة بخطوة بطريقة بوصلة: تفهم، تتحقّق، تكتب، ثم تقارن بعناصر الإجابة وتقيّم روحك — بلا وقت وبلا علامة."
          }
          action="افتح"
          onClick={onOuvrirSujets}
        />
        <Carte
          titre="امتحان تجريبي"
          mention={examens.length ? `${nb(examens.length)} سابق` : undefined}
          sous="وضعية شاملة على نمط البكالوريا، بلا مؤقّت، مع حصيلة في النهاية."
          action="ابدأ"
          onClick={onOuvrirExamen}
        />
        <Carte
          titre="المنهجية والتمارين الموجَّهة"
          sous="أربع ورشات، تمارين بالوثائق، وسلّم الكفاءات الثمانية."
          action="راجع"
          onClick={onOuvrirMethodo}
        />
        <Carte
          titre="صيّاد الفخاخ"
          mention={etat.fakh ? `${nb(Object.keys(etat.fakh).length)} مصيدة` : undefined}
          sous="جملة واحدة في كلّ مرّة: فخّ ولا صحيح؟ كلّ حكم صحيح يزيد نقطتين، والسلسلة الكاملة تزيد أربع نقاط."
          action="اصطد"
          onClick={onOuvrirFakh}
        />
        <Carte
          titre="الرسوم والمخطّطات"
          sous="ستّة رسوم للتسمية — الرسم الوظيفي هو اللي ياخذ النقاط في الباك."
          action="تدرّب"
          onClick={onOuvrirSchemas}
        />
      </section>

      <section className="carte mb-5">
        <div className="carte__tete mb-2">
          <h2 className="carte__titre">كيفاش تخدم موضوع</h2>
          <span className="mention">3 خطوات</span>
        </div>
        <ol className="flex flex-col gap-1.5">
          {ETAPES.map((e, i) => (
            <li key={i} className="rangee items-start">
              <span className="mention mention--vert tnum" aria-hidden="true">{nb(i + 1)}</span>
              <span className="petit">{e}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="carte mb-5">
        <div className="carte__tete mb-2">
          <h2 className="carte__titre">الأفعال اللي تتكرّر</h2>
          <span className="mention">في كلّ المواضيع</span>
        </div>
        <ul className="flex flex-col gap-1.5">
          {verbes.map((v) => (
            <li key={v.verbe} className="rangee rangee--entre">
              <span className="text-sm font-bold text-ink">{v.verbe}</span>
              <span className="petit doux">{nb(v.n)} تعليمة</span>
            </li>
          ))}
        </ul>
        <hr className="filet" />
        <p className="petit doux">
          الوحدات الأكثر حضورًا:{' '}
          {unites.map((u) => `${u.titre} (${nb(u.n)})`).join(' · ')}
        </p>
      </section>

      <p className="petit doux text-center">
        بوصلة العلوم · نسخة {VERSION_APP} — لا علامة، ولا وقت، ولا ملفّ يُغلق.
      </p>
    </div>
  );
}
