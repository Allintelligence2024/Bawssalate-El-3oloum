// الخصوصية · الأسئلة الشائعة · عن التطبيق (P0.8 / P3.4) — شاشة واحدة، بلا شبكة، تقول ما يحدث فعلًا.
// كلّ جملة هنا يجب أن تطابق الكود: قائمة ما يُرسَل تأتي من sync.ts نفسه، لا من نصّ منفصل.

import { useState } from 'react';
import type { Etat } from '../types';
import { consentementEtat, supprimerSnapshotServeur, syncActive, VERSION_APP, type ResultatSuppression } from '../utils/sync';
import { ListeDonneesSync } from './CarteSync';
import { IcoRetour } from './Icones';

interface Props {
  etat: Etat;
  onRetirerConsentement: () => void;
  onFermer: () => void;
}

const FAQ: { q: string; r: string }[] = [
  { q: 'هل يعمل التطبيق بلا إنترنت؟', r: 'نعم. الدروس والتدريبات والامتحانات التجريبية والبطاقات كلّها على جهازك بعد أول تحميل. الإنترنت يلزم فقط للتحديثات وللمزامنة إن وافقت عليها.' },
  { q: 'لماذا بعض الدروس مقفلة؟', r: 'الطريق يتبع ترتيب البرنامج الرسمي: كلّ درس يبني على ما قبله. القراءة الحرّة متاحة دائمًا من البحث، لكن الحصّة المحسوبة تمرّ بالترتيب.' },
  { q: 'لماذا لا أرى علامات ولا نسبًا مئوية؟', r: 'لأنّها لا تساعد على التعلّم في هذه المرحلة. نقول لك ما أتقنته وما يستحقّ عودة، بالكلمات والأعداد الصغيرة، لا بالترتيب ولا بالمقارنة.' },
  { q: 'كيف يقرّر التطبيق متى أراجع؟', r: 'بخوارزمية تكرار متباعد (SM-2): تقييمك الذاتي بعد كلّ استرجاع يحدّد الفاصل التالي. درس سهل يبتعد، درس صعب يعود غدًا. لا شيء عشوائيًّا.' },
  { q: 'هل يقارنني التطبيق بتلاميذ آخرين؟', r: 'لا. التطبيق لا يقرأ أيّ بيانات عن غيرك — لا ترتيب، لا معدّل مجموعة. الشارات والتحدّيات تُحسب من جهازك وحده.' },
  { q: 'هل فيه ذكاء اصطناعي يصحّح إجاباتي؟', r: 'لا. التصحيح يعتمد على أسئلة اختيار مكتوبة يدويًّا ومعايير مكتوبة سلفًا. الكتابة الحرّة تُقارن بمعايير التصحيح الرسمية التي تقرؤها بنفسك.' },
  { q: 'ماذا لو غيّرت الهاتف؟', r: 'من «أنا» صدّر نسخة كاملة (ملفّ JSON) ثم استوردها على الجهاز الجديد. التقدّم والاسترجاع وكرّاسة الأخطاء والإحصاءات كلّها فيه.' },
  { q: 'هل التذكير اليومي إجباري؟', r: 'لا. مُطفأ افتراضيًّا، تفعّله أنت وتختار ساعته، وهو تذكير واحد في اليوم بلا أرقام ولا تأنيب. على أندرويد فقط.' },
  { q: 'من كتب المحتوى، وهل رُوجع؟', r: 'الملخّصات والأسئلة كُتبت من البرنامج الرسمي والمواضيع السابقة. المراجعة من أساتذة المادة جارية درسًا درسًا، وما يُصحَّح يُسجَّل في سجلّ علنيّ داخل المشروع.' },
];

export default function Confidentialite({ etat, onRetirerConsentement, onFermer }: Props) {
  const [ouverte, setOuverte] = useState<number | null>(null);
  const [suppression, setSuppression] = useState<'idle' | 'confirmer' | 'encours' | ResultatSuppression>('idle');
  const sync = syncActive();
  const consent = consentementEtat(etat);

  async function supprimer() {
    setSuppression('encours');
    const r = await supprimerSnapshotServeur(etat);
    if (r === 'supprime' && consent === 'oui') onRetirerConsentement();
    setSuppression(r);
  }

  const texteSuppression: Record<ResultatSuppression, string> = {
    supprime: 'حُذف سجلّك من الخادم، وأُوقفت المزامنة. بياناتك على هاتفك لم تُمسّ.',
    hors_ligne: 'لا اتصال الآن — أعد المحاولة حين يتوفّر الإنترنت.',
    pas_de_compte: 'لا حساب مزامنة على هذا الجهاز — لا شيء على الخادم يخصّك.',
    sync_inactive: 'المزامنة غير مهيّأة في هذا الإصدار — لا شيء يُرسَل أصلًا.',
    erreur: 'تعذّر الحذف هذه المرّة. أعد المحاولة لاحقًا؛ وإن تكرّر، أوقف المزامنة من «أنا» فلن يُرسَل شيء جديد.',
  };

  return (
    <div className="flex min-h-dvh flex-col bg-cream">
      <header className="sticky top-0 z-20 border-b border-line bg-paper px-4 pb-3 pt-4">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <button
            onClick={onFermer}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cream text-mute transition-colors hover:bg-sage-soft"
            aria-label="رجوع"
          >
            <span className="block h-5 w-5">
              <IcoRetour />
            </span>
          </button>
          <div>
            <p className="eyebrow">الخصوصية · الأسئلة الشائعة · عن التطبيق</p>
            <h1 className="font-naskh text-xl font-black">ما يحدث لبياناتك، بالضبط</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 pb-16 pt-4">
        <div className="mx-auto max-w-3xl space-y-5">
          <section className="card p-5">
            <p className="eyebrow">١ · المبدأ</p>
            <p className="mt-2 text-sm leading-relaxed">
              كلّ ما تفعله في التطبيق يُحفَظ <span className="font-bold">على هاتفك</span>. لا حساب إجباري، لا إعلانات، لا تتبّع، لا قراءة لبيانات تلميذ آخر.
              الشيء الوحيد الذي قد يغادر جهازك هو <span className="font-bold">ملخّص تقدّمك</span> نحو المطوّر — وفقط إن وافقت صراحةً، بتاريخ مسجَّل.
            </p>
            <p className="mt-2 text-xs text-mute">
              حالتك الآن: {sync ? (consent === 'oui' ? 'المزامنة مفعَّلة بموافقتك.' : 'لا يُرسَل شيء — لم توافق أو سحبت موافقتك.') : 'المزامنة غير مهيّأة في هذا الإصدار — لا يُرسَل شيء.'}
            </p>
          </section>

          <section className="card p-5">
            <p className="eyebrow">٢ · ما يُرسَل وما لا يُرسَل</p>
            <div className="mt-2">
              <ListeDonneesSync />
            </div>
            <p className="mt-3 text-xs leading-relaxed text-mute">
              متى؟ في الخلفية، حين يتوفّر الإنترنت، وفقط إن تغيّر شيء منذ آخر إرسال. إلى أين؟ قاعدة بيانات واحدة يملكها مطوّر التطبيق؛ سطرك لا يستطيع تعديله أو حذفه إلا جهازك (رمز كتابة خاص بك).
            </p>
          </section>

          <section className="card p-5">
            <p className="eyebrow">٣ · حقوقك</p>
            <ul className="mt-2 space-y-2 text-sm leading-relaxed">
              <li><span className="font-bold">سحب الموافقة</span> — من «أنا › المزامنة مع المطوّر» في أيّ وقت؛ يتوقّف الإرسال فورًا.</li>
              <li><span className="font-bold">نسخة من بياناتك</span> — زرّ «تصدير نسخة كاملة» في «أنا» يعطيك كلّ شيء في ملفّ واحد.</li>
              <li><span className="font-bold">الحذف من الخادم</span> — الزرّ أدناه يحذف سطرك من قاعدة البيانات ويوقف المزامنة. ما على هاتفك يبقى لك.</li>
              <li><span className="font-bold">مدّة الاحتفاظ</span> — إلى أن تحذفه أنت؛ والسجلّات التي لم تُحدَّث منذ أكثر من سنة بعد تاريخ البكالوريا المُدخل تُحذف من جهة المطوّر.</li>
            </ul>
            {sync && (
              <div className="mt-4">
                {suppression === 'idle' && (
                  <button type="button" onClick={() => setSuppression('confirmer')} className="btn btn-ghost w-full border border-line text-sm">
                    احذف سجلّي من الخادم
                  </button>
                )}
                {suppression === 'confirmer' && (
                  <div className="rounded-2xl border border-gold-soft bg-gold-soft/40 p-3">
                    <p className="text-sm font-bold text-forest-deep">يُحذف سطرك من الخادم وتتوقّف المزامنة. بيانات هاتفك لا تُمسّ. نتابع؟</p>
                    <div className="mt-2 flex gap-2">
                      <button type="button" onClick={() => void supprimer()} className="btn btn-primary flex-1 text-sm">نعم، احذف</button>
                      <button type="button" onClick={() => setSuppression('idle')} className="btn btn-ghost flex-1 text-sm">تراجع</button>
                    </div>
                  </div>
                )}
                {suppression === 'encours' && <p className="text-sm text-mute">جارٍ الحذف…</p>}
                {suppression !== 'idle' && suppression !== 'confirmer' && suppression !== 'encours' && (
                  <p className={`rounded-2xl p-3 text-sm ${suppression === 'supprime' ? 'bg-sage-soft/60 text-forest-deep' : 'bg-gold-soft/40 text-forest-deep'}`}>
                    {texteSuppression[suppression]}
                  </p>
                )}
              </div>
            )}
          </section>

          <section className="card p-5">
            <p className="eyebrow">٤ · أسئلة شائعة</p>
            <ul className="mt-2 divide-y divide-line">
              {FAQ.map((f, i) => (
                <li key={f.q}>
                  <button type="button" onClick={() => setOuverte(ouverte === i ? null : i)} className="flex w-full items-center justify-between gap-3 py-2.5 text-start text-sm font-bold">
                    <span>{f.q}</span>
                    <span className="text-mute" aria-hidden="true">{ouverte === i ? '−' : '+'}</span>
                  </button>
                  {ouverte === i && <p className="pb-3 text-sm leading-relaxed text-ink-soft">{f.r}</p>}
                </li>
              ))}
            </ul>
          </section>

          <section className="card p-5">
            <p className="eyebrow">٥ · عن التطبيق</p>
            <p className="mt-2 text-sm leading-relaxed">
              <span className="font-naskh font-black">بوصلة العلوم</span> — مرافق مراجعة علوم الطبيعة والحياة لبكالوريا شعبة العلوم التجريبية، يعمل بلا إنترنت، بلا إعلانات، بلا تتبّع.
            </p>
            <ul className="mt-2 space-y-1 text-xs leading-relaxed text-mute">
              <li>الإصدار {VERSION_APP}.</li>
              <li>المحتوى مبنيّ على البرنامج الرسمي ومواضيع البكالوريا السابقة؛ سجلّ المصادر وسجلّ التصحيحات علنيّان داخل المشروع.</li>
              <li>حقوق المواضيع الرسمية لأصحابها (الديوان الوطني للامتحانات والمسابقات)؛ تُعرض هنا لغرض تربوي، والترخيص الصريح قيد الطلب.</li>
              <li>المراجعة من أساتذة المادة جارية. وجدت خطأً؟ أبلغ عنه من «أنا › كرّاسة الأخطاء › تصدير» وأرسله لمن يتابع المشروع.</li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
