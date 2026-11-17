// بنية مواضيع البكالوريا (P1.1) — تعرض هيكل كلّ موضوع (2013→2026): التمارين، السلّم، الأجزاء، التعليمات بأفعالها
// الإجرائية، الوحدة المستهدفة. لا وثائق مرسومة ولا PDF. المرحلة 2 (2023 فقط حاليًّا): وصف نصّي للوثائق وعناصر إجابة
// مختصرة بتصرّف من التصحيح الرسمي، مخفيّة افتراضيًّا خلف زرّ «أظهر عناصر الإجابة» (A-009).
import { useState } from 'react';
import { ANNEES_STRUCTUREES, SUJETS_OFFICIELS, frequenceUnites, frequenceVerbes, type SujetOfficiel, type VerbeConsigne } from '../data/sujetsOfficiels';
import { situationDeUnite, type SituationSynthese } from '../data/syntheses';
import { corrigeDe, type PartieCorrigee } from '../data/sujetsCorriges';
import { UNITES } from '../data/programme';
import { nb } from '../utils/dates';
import { IcoRetour } from './Icones';

interface Props {
  onOuvrirSynthese: (s: SituationSynthese) => void;
  onOuvrirRecherche: (q: string) => void;
  onFermer: () => void;
}

/** ما يتوقّعه المصحّح من كلّ فعل — صياغة قصيرة، لا نسبة ولا سلّم */
const ATTENDU: Partial<Record<VerbeConsigne, string>> = {
  'حلِّل': 'صف التغيّر (من… إلى…، بالأرقام) ثمّ استنتج جملة واحدة.',
  'قارن': 'نقاط التشابه ثمّ الاختلاف، في الشروط نفسها، ثمّ ما يدلّ عليه الفرق.',
  'فسِّر': 'اربط الملاحظة بآلية من الدرس: «لأنّ… فإنّ…».',
  'برِّر': 'حجّة من الوثيقة + حجّة من المعرفة تدعمان الرأي.',
  'اقترح فرضية': 'جملة قابلة للاختبار تبدأ بـ«ربّما/قد»، لا نتيجة مؤكّدة.',
  'ناقش': 'اختبر كلّ فرضية بنتيجة من الوثائق: تُقبل أو تُرفض ولماذا.',
  'نصّ علمي': 'مقدّمة (إشكال) · عرض مرتّب بالآليات · خاتمة تجيب عن الإشكال.',
  'مخطّط': 'أسهم مرقّمة بين عناصر مسمّاة، عنوان، وبيانات على كلّ سهم.',
  'رسم تخطيطي': 'رسم وظيفي بالبيانات كاملة والاتجاهات، لا رسم فنّي.',
  'استخلص': 'جملة تعميم من مجموع النتائج، لا إعادة سرد.',
  'استخرج': 'المعلومات الأساسية فقط، كلّ واحدة مقرونة بالوثيقة التي تدعمها.',
  'استدلّ': 'سلسلة: معطى → تفسير → نتيجة، خطوة خطوة.',
  'حدِّد': 'إجابة دقيقة مباشرة (اسم، قيمة، هدف) بلا شرح زائد.',
  'سمِّ': 'الاسم الدقيق كما في الدرس.',
  'تعرَّف': 'الاسم + العلامة التي تعرّفت بها عليه.',
  'بيِّن': 'أظهر العلاقة بمعطيات الوثيقة ومعرفتك، بترتيب منطقي.',
  'اشرح': 'الآلية خطوة بخطوة بمفردات الدرس.',
  'وضِّح': 'اجعل الفكرة واضحة بمثال أو بترتيب المراحل.',
  'نصيحة': 'نصيحة مبرّرة بالنتائج العلمية التي سبقت.',
  'استنتج': 'ما يلزم منطقيًّا من المعطيات، بجملة واحدة.',
};

function titreUnite(id: string): string {
  const u = UNITES.find((x) => x.id === id);
  return u ? `الوحدة ${nb(u.numero)} — ${u.titre}` : id;
}

function Sujet({ sujet, onOuvrirSynthese, onOuvrirRecherche }: { sujet: SujetOfficiel } & Omit<Props, 'onFermer'>) {
  const [ouvert, setOuvert] = useState<VerbeConsigne | null>(null);
  const [montrerReponses, setMontrerReponses] = useState(false);
  const corrige = corrigeDe(sujet.id);
  const partieCorrigee = (numero: number, i: number): PartieCorrigee | undefined => corrige?.exercices.find((x) => x.numero === numero)?.parties[i];
  return (
    <div className="space-y-3">
      {sujet.notes && <p className="rounded-xl bg-gold-soft/40 px-3 py-2 text-[11px] leading-relaxed text-forest-deep">{sujet.notes}</p>}
      {corrige && (
        <div className="rounded-xl border border-line bg-paper px-3 py-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-bold">عناصر الإجابة متوفّرة لهذا الموضوع</p>
            <button type="button" onClick={() => setMontrerReponses((v) => !v)} className={`chip text-xs font-bold ${montrerReponses ? 'border-forest bg-sage-soft/60' : ''}`} aria-pressed={montrerReponses}>
              {montrerReponses ? 'أخفِ عناصر الإجابة' : 'أظهر عناصر الإجابة'}
            </button>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-mute">
            حاول الإجابة كتابةً أوّلًا، ثمّ قارن. العناصر مختصرة ومعاد صياغتها من {corrige.source} الحقوق محفوظة للديوان الوطني؛ العرض لأغراض التدريب.
          </p>
        </div>
      )}
      {sujet.exercices.map((e) => (
        <section key={e.numero} className="card p-4">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-naskh text-lg font-bold">التمرين {['الأول', 'الثاني', 'الثالث'][e.numero - 1]}</h2>
            <span className="tnum shrink-0 rounded-full bg-sage px-2.5 py-0.5 text-[11px] font-bold text-forest-deep">{nb(e.bareme)} نقاط</span>
          </div>
          <p className="mt-1 text-sm font-bold text-forest">{e.theme}</p>
          <p className="mt-0.5 text-xs text-mute">{e.unites.map(titreUnite).join(' · ')}</p>
          <div className="mt-3 space-y-3">
            {e.parties.map((p, i) => (
              <div key={i} className="rounded-xl border border-line bg-paper p-3">
                {p.titre && <p className="eyebrow">{p.titre}</p>}
                {p.contexte && <p className="mt-1 text-xs leading-relaxed text-ink-soft">السند (غير معروض هنا): {p.contexte}</p>}
                <ol className="mt-2 space-y-2">
                  {p.consignes.map((c, j) => (
                    <li key={j} className="text-sm leading-relaxed">
                      <button
                        type="button"
                        onClick={() => setOuvert(ouvert === c.verbe ? null : c.verbe)}
                        className={`chip me-2 align-middle text-[11px] font-bold ${ouvert === c.verbe ? 'border-forest bg-sage-soft/60' : ''}`}
                        title="ما المطلوب؟"
                      >
                        {c.verbe}
                      </button>
                      {c.texte}
                      {ouvert === c.verbe && ATTENDU[c.verbe] && (
                        <p className="mt-1 rounded-lg bg-sage-soft/50 px-2.5 py-1.5 text-xs text-forest-deep">ما يُنتظر: {ATTENDU[c.verbe]}</p>
                      )}
                      {montrerReponses && (() => {
                        const r = partieCorrigee(e.numero, i)?.reponses.find((x) => x.consigne === j);
                        return r ? (
                          <div className="mt-1.5 rounded-lg border border-gold/40 bg-gold-soft/30 px-2.5 py-2 text-xs leading-relaxed text-forest-deep">
                            <p className="font-bold">عناصر الإجابة{r.points !== undefined ? ` · ${nb(r.points)} ن` : ''}</p>
                            <ul className="mt-1 list-disc space-y-1 ps-4">
                              {r.attendu.map((a, k) => <li key={k}>{a}</li>)}
                            </ul>
                          </div>
                        ) : null;
                      })()}
                    </li>
                  ))}
                </ol>
                {montrerReponses && partieCorrigee(e.numero, i)?.documents && (
                  <div className="mt-2 rounded-lg bg-cream px-2.5 py-2 text-[11px] leading-relaxed text-ink-soft">
                    <p className="font-bold text-forest-deep">وصف الوثائق (بلا رسم)</p>
                    <ul className="mt-1 list-disc space-y-1 ps-4">
                      {partieCorrigee(e.numero, i)!.documents!.map((d, k) => <li key={k}>{d}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {situationDeUnite(e.unites[0]) && (
              <button type="button" onClick={() => onOuvrirSynthese(situationDeUnite(e.unites[0])!)} className="btn-gold px-3 py-1.5 text-xs">
                تدرّب: التركيب الحرّ لهذه الوحدة ←
              </button>
            )}
            <button type="button" onClick={() => onOuvrirRecherche(e.theme.split(/[:—(،]/)[0].trim())} className="chip text-xs font-bold hover:border-forest">
              ابحث في الدروس
            </button>
          </div>
        </section>
      ))}
    </div>
  );
}

export default function SujetsOfficiels({ onOuvrirSynthese, onOuvrirRecherche, onFermer }: Props) {
  const [annee, setAnnee] = useState<number>(ANNEES_STRUCTUREES[0]);
  const [sujetId, setSujetId] = useState<string | null>(null);
  const deAnnee = SUJETS_OFFICIELS.filter((s) => s.annee === annee);
  const sujet = deAnnee.find((s) => s.id === sujetId) ?? deAnnee[0];
  const plusieursSessions = new Set(deAnnee.map((s) => s.session)).size > 1;
  const verbes = frequenceVerbes().slice(0, 8);
  const unites = Object.entries(frequenceUnites()).sort((a, b) => b[1] - a[1]);
  return (
    <div className="flex min-h-dvh flex-col bg-cream">
      <header className="sticky top-0 z-20 border-b border-line bg-paper px-4 pb-3 pt-4">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <button onClick={onFermer} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cream text-mute transition-colors hover:bg-sage-soft" aria-label="رجوع">
            <span className="block h-5 w-5"><IcoRetour /></span>
          </button>
          <div className="min-w-0">
            <p className="eyebrow">مواضيع بكالوريا سابقة · علوم تجريبية · {nb(4)} سا {nb(30)} د</p>
            <h1 className="font-naskh truncate text-xl font-black">بنية الموضوع، لا الموضوع نفسه</h1>
          </div>
        </div>
        <div className="mx-auto mt-3 flex max-w-3xl flex-wrap items-center gap-2">
          {ANNEES_STRUCTUREES.map((a) => (
            <button key={a} type="button" onClick={() => { setAnnee(a); setSujetId(null); }} className={`chip tnum text-xs font-bold ${annee === a ? 'border-forest bg-sage-soft/60' : ''}`}>
              {nb(a)}
            </button>
          ))}
        </div>
        <div className="mx-auto mt-2 flex max-w-3xl flex-wrap items-center gap-2">
          {deAnnee.map((s) => (
            <button key={s.id} type="button" onClick={() => setSujetId(s.id)} className={`chip text-xs font-bold ${sujet?.id === s.id ? 'border-forest bg-sage-soft/60' : ''}`}>
              الموضوع {s.numero === 1 ? 'الأول' : 'الثاني'}{plusieursSessions ? ` · ${s.session}` : ''}
            </button>
          ))}
        </div>
      </header>
      <main className="flex-1 px-4 pb-16 pt-4">
        <div className="mx-auto max-w-3xl space-y-4">
          <p className="text-xs leading-relaxed text-mute">
            نعرض هيكل المواضيع الرسمية (التمارين، السلّم، التعليمات وأفعالها) لتتدرّب على قراءة المطلوب. الرسوم والجداول الأصلية غير
            معروضة؛ انقر فعل التعليمة لترى ما يُنتظر منك. لبعض المواضيع عناصر إجابة مختصرة تظهر عند الطلب.
          </p>
          {sujet ? <Sujet sujet={sujet} onOuvrirSynthese={onOuvrirSynthese} onOuvrirRecherche={onOuvrirRecherche} /> : <p className="text-sm text-mute">لا موضوع.</p>}

          <section className="card p-4">
            <p className="eyebrow">ما يتكرّر في {nb(SUJETS_OFFICIELS.length)} مواضيع مهيكلة</p>
            <p className="mt-2 text-xs font-bold">الأفعال الإجرائية الأكثر طلبًا</p>
            <ul className="mt-1 flex flex-wrap gap-2">
              {verbes.map((v) => (
                <li key={v.verbe} className="chip tnum text-xs">{v.verbe} <span className="text-mute">×{nb(v.n)}</span></li>
              ))}
            </ul>
            <p className="mt-3 text-xs font-bold">الوحدات المستهدفة (تمرين كامل)</p>
            <ul className="mt-1 flex flex-wrap gap-2">
              {unites.map(([u, n]) => (
                <li key={u} className="chip tnum text-xs">{titreUnite(u).split(' — ')[0]} <span className="text-mute">×{nb(n)}</span></li>
              ))}
            </ul>
            <p className="mt-3 text-[11px] leading-relaxed text-mute">{nb(ANNEES_STRUCTUREES.length)} دورة ({nb(ANNEES_STRUCTUREES[ANNEES_STRUCTUREES.length - 1])}–{nb(ANNEES_STRUCTUREES[0])}): للتوجيه لا للتنبّؤ؛ البرنامج والسلّم تغيّرا عبر السنوات (قبل 2017 لم يكن السلّم 5/7/8).</p>
          </section>
        </div>
      </main>
    </div>
  );
}
