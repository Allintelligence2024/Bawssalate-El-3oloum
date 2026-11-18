// التركيب الحرّ — P1.3 (نسخة تجريبية، وحدة واحدة رائدة)
// المسار : وضعية بكالوريا → كتابة حرّة بلوحة المفاتيح → تقدير ذاتي موجَّه على شبكة
// المصحّح (التلميذ يُؤشّر ما كتبه فعلًا) → نموذج الإجابة + الخطأ الجوهري → بطاقة كفاءة SM-2.
//
// قواعد البيت (غير قابلة للتفاوض) :
//   - لا علامة آلية، لا نسبة مئوية، لا مقارنة مع أحد.
//   - النموذج يُعرَض بعد التقدير الذاتي فقط، وهو أداة مقارنة لا سُلّم تنقيط.
//   - سجلّ الأخطاء يحفظ ما كتبه التلميذ والتشخيص — لا الإجابة الصحيحة أبدًا.

import { useState } from 'react';
import type { Qualite } from '../utils/srs';
import { nb } from '../utils/dates';
import { IcoRetour } from './Icones';
import MascotteKunz from './MascotteKunz';

interface Props {
  /** الوحدة الرائدة (U1، U4، U6، U9…) */
  uniteId: string;
  /** عنوان الوضعية */
  sujet: string;
  /** التعليمة (السؤال المفتوح) */
  question: string;
  /** عناصر الإجابة النموذجية — كل عنصر سطر في شبكة التقدير الذاتي */
  modele: string[];
  /** الفخاخ المعروفة للوضعية */
  pieges: string[];
  /** الخطأ الجوهري (T1–T4) */
  diagnostic: { id: string; ar: string };
  onResultatKafaa?: (key: string, qualite: Qualite, meta: { verbe: string; exercice: string; erreur: string }) => void;
  onCarnetFaute?: (f: { contexte: string; enonce: string; donne: string; diagnostic: string }) => void;
  onFermer: () => void;
}

type Etape = 'situation' | 'saisie' | 'auto' | 'modele' | 'resultat';

const ETAPES: Etape[] = ['situation', 'saisie', 'auto', 'modele', 'resultat'];
const LIBELLES: Record<Etape, string> = {
  situation: 'الوضعية',
  saisie: 'الكتابة',
  auto: 'التقدير الذاتي',
  modele: 'المقارنة بالنموذج',
  resultat: 'الخلاصة',
};

const MIN_CARACTERES = 40;

export default function SyntheseLibre({
  uniteId,
  sujet,
  question,
  modele,
  pieges,
  diagnostic,
  onResultatKafaa,
  onCarnetFaute,
  onFermer,
}: Props) {
  const [etape, setEtape] = useState<Etape>('situation');
  const [saisie, setSaisie] = useState('');
  const [cochees, setCochees] = useState<boolean[]>(() => modele.map(() => false));
  const [piegeEvite, setPiegeEvite] = useState<boolean | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [enregistre, setEnregistre] = useState(false);

  const nbCochees = cochees.filter(Boolean).length;
  const indexEtape = ETAPES.indexOf(etape);
  // بلا فخاخ معلنة : السؤال لا يُطرح، ونعتبره مُتجنَّبًا
  const reponseFkh = pieges.length === 0 ? true : piegeEvite;

  function allerAuto() {
    if (saisie.trim().length < MIN_CARACTERES) {
      setNote('اكتب فقرة قصيرة على الأقل (بضعة أسطر) قبل الانتقال إلى التقدير الذاتي — الهدف أن تُنتج أنت الجملة، لا أن تتعرّف عليها.');
      return;
    }
    setNote(null);
    setEtape('auto');
  }

  function allerModele() {
    if (reponseFkh === null) {
      setNote('أجب أولًا: هل وقعت في أحد الفخّين؟ لا حكم هنا — مجرّد صدق مع النفس.');
      return;
    }
    setNote(null);
    setEtape('modele');
  }

  function terminer() {
    if (!enregistre) {
      setEnregistre(true);
      // بطاقة كفاءة : كل العناصر حاضرة وبلا فخّ → J+3 (5) ؛ وإلّا → J+1 (3). لا علامة تُعرض.
      const complet = nbCochees === modele.length && reponseFkh === true;
      onResultatKafaa?.(`synthese${uniteId}`, complet ? 5 : 3, {
        verbe: 'ركّب',
        exercice: sujet,
        erreur: diagnostic.ar,
      });
      if (!complet) {
        onCarnetFaute?.({
          contexte: `التركيب الحرّ · ${uniteId}`,
          enonce: question,
          donne: saisie.trim().slice(0, 160) + (saisie.trim().length > 160 ? '…' : ''),
          diagnostic: diagnostic.id,
        });
      }
    }
    setEtape('resultat');
  }

  return (
    <div className="fixed inset-0 z-[80] overflow-auto bg-cream">
      <div className="mx-auto max-w-3xl px-5 py-8">
        <button onClick={onFermer} className="btn btn-ghost mb-6">
          <span className="block h-5 w-5"><IcoRetour /></span>
          خروج من التركيب الحرّ
        </button>

        {/* شريط المراحل */}
        <div className="mb-5 flex items-center gap-1.5" aria-label={`المرحلة ${nb(indexEtape + 1)} من ${nb(ETAPES.length)}`}>
          {ETAPES.map((e, i) => (
            <span
              key={e}
              className={`h-1.5 flex-1 rounded-full ${i < indexEtape ? 'bg-forest' : i === indexEtape ? 'bg-gold' : 'bg-line'}`}
            />
          ))}
        </div>
        <p className="eyebrow">التركيب الحرّ · {uniteId} · {LIBELLES[etape]}</p>

        {etape === 'situation' && (
          <section className="card mt-2 p-6">
            <h2 className="font-naskh text-2xl font-bold">{sujet}</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink">{question}</p>
            <MascotteKunz
              compact
              tone="gold"
              message="هنا لا خيارات تُنتقى: تكتب بنفسك كما في ورقة البكالوريا. ثم تُقارن ما كتبته بشبكة المصحّح — أنت من يقدّر، لا الآلة."
            />
            <button onClick={() => setEtape('saisie')} className="btn btn-primary mt-6">
              ابدأ الكتابة ←
            </button>
          </section>
        )}

        {etape === 'saisie' && (
          <section className="card mt-2 p-6">
            <h2 className="font-naskh text-xl font-bold">{sujet}</h2>
            <p className="mt-2 rounded-2xl border border-line bg-paper p-3 text-sm leading-relaxed">{question}</p>
            <label className="mt-4 block">
              <span className="text-xs font-bold text-mute">إجابتك (كما ستكتبها في ورقة الامتحان)</span>
              <textarea
                value={saisie}
                onChange={(e) => setSaisie(e.target.value)}
                rows={9}
                dir="rtl"
                spellCheck={false}
                className="mt-1 w-full rounded-2xl border border-line bg-paper p-4 text-sm leading-relaxed text-ink focus:border-forest focus:outline-none"
                placeholder="ابدأ بالسند، ثم التحليل، ثم الربط، ثم الاستنتاج…"
              />
            </label>
            <p className="mt-1 text-xs text-mute">{nb(saisie.trim().length)} حرفًا</p>
            {note && <p className="mt-2 text-sm font-bold text-clay">{note}</p>}
            <div className="mt-5 flex gap-3">
              <button onClick={allerAuto} className="btn btn-primary flex-1">
                انتهيت — إلى التقدير الذاتي ←
              </button>
              <button onClick={() => setEtape('situation')} className="btn flex-1">
                رجوع إلى الوضعية
              </button>
            </div>
          </section>
        )}

        {etape === 'auto' && (
          <section className="card mt-2 p-6">
            <p className="text-sm leading-relaxed text-mute">
              أعد قراءة ما كتبته مرّتين، ثم أشّر على العناصر الموجودة فعلًا في نصّك — « نعم، كتبتُ هذا » لا « نعم، أعرفه ».
              لا حكم ولا علامة: هذه الشبكة هي نفسها التي يستعملها المصحّح.
            </p>
            <div className="mt-4 rounded-2xl border border-line bg-paper p-4 text-sm leading-relaxed text-ink whitespace-pre-wrap">
              {saisie.trim()}
            </div>
            <div className="mt-4 space-y-2">
              {modele.map((item, i) => (
                <label key={i} className="flex items-start gap-3 rounded-2xl border border-line bg-paper p-3 text-sm leading-relaxed">
                  <input
                    type="checkbox"
                    checked={cochees[i]}
                    onChange={(e) => setCochees((prev) => prev.map((v, k) => (k === i ? e.target.checked : v)))}
                    className="mt-1 h-4 w-4 rounded border-line"
                  />
                  <span className="text-forest-deep">{item}</span>
                </label>
              ))}
            </div>

            {pieges.length > 0 && (
              <div className="mt-5 rounded-2xl border border-clay-soft bg-clay-soft/30 p-4">
                <p className="text-sm font-bold text-clay">الفخاخ المعروفة لهذه الوضعية</p>
                <ul className="mt-2 list-disc pr-5 text-sm leading-relaxed text-ink">
                  {pieges.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
                <p className="mt-3 text-sm font-bold">هل وقع نصّك في أحدها؟</p>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPiegeEvite(true)}
                    className={`btn flex-1 text-sm ${piegeEvite === true ? 'btn-primary' : ''}`}
                  >
                    لا، تجنّبتها
                  </button>
                  <button
                    type="button"
                    onClick={() => setPiegeEvite(false)}
                    className={`btn flex-1 text-sm ${piegeEvite === false ? 'btn-primary' : ''}`}
                  >
                    نعم، وقعت في أحدها
                  </button>
                </div>
              </div>
            )}
            {note && <p className="mt-3 text-sm font-bold text-clay">{note}</p>}
            <div className="mt-5 flex gap-3">
              <button onClick={allerModele} className="btn btn-primary flex-1">
                قارن بالنموذج ←
              </button>
              <button onClick={() => setEtape('saisie')} className="btn flex-1">
                أعدّل نصّي
              </button>
            </div>
          </section>
        )}

        {etape === 'modele' && (
          <section className="card mt-2 p-6">
            <p className="text-sm leading-relaxed text-mute">
              النموذج ليس للنسخ بل للمقارنة: أين يلتقي نصّك به؟ وما العنصر الذي غاب؟
            </p>
            <ol className="mt-4 list-decimal space-y-2 pr-5 text-sm leading-relaxed text-forest-deep">
              {modele.map((item, i) => (
                <li key={i} className={cochees[i] ? '' : 'font-bold text-clay'}>
                  {item}
                  {!cochees[i] && <span className="mr-2 text-xs font-normal text-mute">— لم تُؤشّر عليه</span>}
                </li>
              ))}
            </ol>
            <div className="mt-5 rounded-2xl border border-clay-soft bg-clay-soft/40 p-4 text-sm">
              <p className="font-bold text-clay">الخطأ الجوهري الذي تراقبه هذه الوضعية</p>
              <p className="mt-1 text-ink">{diagnostic.ar}</p>
            </div>
            <button onClick={terminer} className="btn btn-primary mt-5 w-full">
              إنهاء وتسجيل البطاقة
            </button>
          </section>
        )}

        {etape === 'resultat' && (
          <section className="card mt-2 p-6">
            <div className="rounded-2xl bg-sage-soft p-5 text-sm leading-relaxed text-forest-deep">
              <p className="font-bold">تمّ. كتبتَ بنفسك، وقارنتَ بنفسك.</p>
              <p className="mt-2">
                أشّرت على {nb(nbCochees)} من {nb(modele.length)} عناصر الشبكة
                {piegeEvite === false ? '، ووقعت في أحد الفخاخ — وهذا أفضل خبر اليوم: الفخّ الذي تكتشفه الآن لن يصطادك يوم الامتحان.' : '.'}
              </p>
              <p className="mt-2 text-xs text-mute">
                {nbCochees === modele.length && reponseFkh === true
                  ? 'بطاقة كفاءة مبرمجة بعد 3 أيام: ستُعيد كتابة الاستنتاج من الذاكرة دون نموذج.'
                  : 'بطاقة كفاءة مبرمجة غدًا، والعنصر الناقص مدوَّن في سجلّ الأخطاء (أنا → سجلّ الأخطاء).'}
              </p>
            </div>
            <div className="mt-5 flex gap-3">
              <button onClick={onFermer} className="btn btn-primary flex-1">
                إنهاء
              </button>
              <button onClick={() => setEtape('modele')} className="btn flex-1">
                أعود إلى النموذج
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
