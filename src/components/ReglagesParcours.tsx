// إعدادات المسار في «أنا» — الهدف (P2.2)، المراجعة المكثّفة (P2.3)، حجم الخط (P3.3).
// لا نسب مئوية، لا مقارنة بالآخرين، لا «بلا حدود»: كل خيار يقول بالضبط ما يغيّره.

import type { Etat, Objectif, TailleTexte } from '../types';
import {
  QUOTA_PAR_OBJECTIF,
  QUOTA_INTENSIF,
  SEUIL_INTENSIF_JOURS,
  joursAvantBac,
  modeIntensifActif,
  objectifDe,
  phaseIntensive,
} from '../utils/moteur';
import { nb } from '../utils/dates';

interface Props {
  etat: Etat;
  onObjectif: (o: Objectif) => void;
  onModeIntensif: (m: 'auto' | 'on' | 'off') => void;
  onTailleTexte: (t: TailleTexte) => void;
}

const OBJECTIFS: ReadonlyArray<{ valeur: Objectif; titre: string }> = [
  { valeur: 10, titre: 'أنجح بهدوء' },
  { valeur: 14, titre: 'علامة جيّدة' },
  { valeur: 18, titre: 'امتياز' },
];

function descQuota(o: Objectif): string {
  const q = QUOTA_PAR_OBJECTIF[o];
  const seances = q.seances === 1 ? 'حصّة واحدة في اليوم' : `${nb(q.seances)} حصص في اليوم`;
  const bonus = q.bonus ? ' + إضافية اختيارية' : '';
  return `${seances}${bonus} · ${nb(q.kafaaSemaine)} مراجعات كفاءة في الأسبوع`;
}

const PHASES: Record<'J60' | 'J30' | 'J7', string> = {
  J60: 'المرحلة الأولى: وحدات الثقل الأكبر فقط',
  J30: 'المرحلة الثانية: تُضاف وحدات الثقل المتوسّط',
  J7: 'الأسبوع الأخير: استرجاع ومواضيع — لا جديد يُفرض',
};

export default function ReglagesParcours({ etat, onObjectif, onModeIntensif, onTailleTexte }: Props) {
  const objectif = objectifDe(etat);
  const choixIntensif = etat.modeIntensif ?? 'auto';
  const actif = modeIntensifActif(etat);
  const phase = phaseIntensive(etat);
  const jours = joursAvantBac(etat);
  const taille: TailleTexte = etat.tailleTexte ?? 'm';

  return (
    <>
      {/* الهدف */}
      <section className="card mt-5 p-5">
        <p className="eyebrow">هدفي في البكالوريا</p>
        <p className="mt-2 text-xs leading-relaxed text-mute">
          الهدف لا يُقاس ولا يُقارن — يضبط فقط إيقاع الحصص المقترح. غيّره متى شئت.
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {OBJECTIFS.map((o) => {
            const sel = o.valeur === objectif;
            return (
              <button
                key={o.valeur}
                type="button"
                onClick={() => onObjectif(o.valeur)}
                aria-pressed={sel}
                className={`rounded-2xl border p-3 text-center transition-colors ${
                  sel ? 'border-forest bg-forest text-paper' : 'border-line bg-paper text-ink hover:border-forest'
                }`}
              >
                <span className="font-naskh block text-xl font-black tnum">{nb(o.valeur)}+</span>
                <span className={`mt-0.5 block text-[11px] font-bold ${sel ? 'text-paper/90' : 'text-mute'}`}>
                  {o.titre}
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs font-bold text-forest-deep">{descQuota(objectif)}</p>
      </section>

      {/* المراجعة المكثّفة */}
      <section className="card mt-5 p-5">
        <p className="eyebrow">المراجعة المكثّفة قبل الامتحان</p>
        <p className="mt-2 text-xs leading-relaxed text-mute">
          عند أقل من {nb(SEUIL_INTENSIF_JOURS)} يومًا من تاريخ امتحانك تُفتح وحدات الأولوية دون انتظار ما قبلها
          (يبقى ترتيب الدروس داخل كل وحدة)، وترتفع الحصّة إلى {nb(QUOTA_INTENSIF.seances)} حصص في اليوم،
          وتتقارب المراجعات (J+1 / J+3). المسار العادي يبقى متاحًا دائمًا.
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {(
            [
              ['auto', 'تلقائي'],
              ['on', 'مفعّل الآن'],
              ['off', 'متوقّف'],
            ] as const
          ).map(([v, t]) => {
            const sel = v === choixIntensif;
            return (
              <button
                key={v}
                type="button"
                onClick={() => onModeIntensif(v)}
                aria-pressed={sel}
                className={`rounded-2xl border px-2 py-2.5 text-xs font-bold transition-colors ${
                  sel ? 'border-forest bg-forest text-paper' : 'border-line bg-paper text-ink hover:border-forest'
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs font-bold text-forest-deep">
          {actif && phase
            ? `فعّالة الآن — ${PHASES[phase]}${jours !== null ? ` · ${nb(jours)} يومًا على الامتحان` : ''}`
            : choixIntensif === 'off'
              ? 'متوقّفة باختيارك.'
              : jours === null
                ? 'أدخل تاريخ امتحانك أعلاه لتُفعَّل تلقائيًّا في وقتها.'
                : `غير فعّالة بعد — تُفعَّل تلقائيًّا بعد ${nb(Math.max(0, jours - SEUIL_INTENSIF_JOURS))} يومًا.`}
        </p>
      </section>

      {/* حجم الخط */}
      <section className="card mt-5 p-5">
        <p className="eyebrow">حجم الخط</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {(
            [
              ['s', 'صغير', 'text-sm'],
              ['m', 'متوسّط', 'text-base'],
              ['l', 'كبير', 'text-lg'],
            ] as const
          ).map(([v, t, cls]) => {
            const sel = v === taille;
            return (
              <button
                key={v}
                type="button"
                onClick={() => onTailleTexte(v)}
                aria-pressed={sel}
                className={`rounded-2xl border px-2 py-2.5 font-bold transition-colors ${cls} ${
                  sel ? 'border-forest bg-forest text-paper' : 'border-line bg-paper text-ink hover:border-forest'
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-[11px] text-mute">يُطبَّق على كل الشاشات وعلى صفحات الدروس.</p>
      </section>
    </>
  );
}
