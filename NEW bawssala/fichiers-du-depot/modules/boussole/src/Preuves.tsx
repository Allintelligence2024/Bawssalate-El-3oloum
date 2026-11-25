import { useState } from "react";
import { codes, sources } from "./model";
import { Badge, Back, Picture, PrintButton, Rules } from "./shared";
import laminine from "../assets/bac-2022-laminine.png";
import excite from "../assets/trace-13.png";
import inhibit from "../assets/trace-23.png";
import glutamate from "../assets/trace-33.png";
import gaba from "../assets/trace-43.png";
const original: Record<number, React.ReactNode> = {
  1: "Ca²⁺",
  2: (
    <>
      GABA<sub>b</sub>
    </>
  ),
  3: "K⁺",
  4: "Cl⁻",
  5: (
    <>
      GABA<sub>a</sub>
    </>
  ),
  6: "GABA",
  7: "Na⁺",
};
export function Notation({ ids }: { ids: number[] }) {
  return (
    <details className="desc orig-symbols">
      <summary>رموز الموضوع الأصلي</summary>
      <p>
        ابحث عن الرقم في رسم بوصلة، ثمّ طابِقه بالرمز الذي تراه في ورقة
        البكالوريا.
      </p>
      <dl>
        {ids.map((n) => (
          <div key={n}>
            <dt>
              <b>{n}</b> {codes[n]}
            </dt>
            <dd>
              <bdi dir="ltr">{original[n]}</bdi>
            </dd>
          </div>
        ))}
      </dl>
    </details>
  );
}
export function Injection() {
  const [s, stim] = useState(0),
    [k, inject] = useState<number | null>(null);
  return (
    <details className="desc injection" data-id="injection">
      <summary>أيّ حقن يعطي أثراً في الاتجاه نفسه؟</summary>
      <p>
        اتجاه الأثر في ج3 يبيّن تنبيهاً أو تثبيطاً، لكنه لا يسمّي المبلّغ. اختر
        تنبيهاً ثم قارنه بحقن مادة معلومة في المنطقة س.
      </p>
      <div className="small-options" role="group" aria-label="تنبيه">
        <button
          onClick={() => {
            stim(0);
            inject(null);
          }}
          aria-pressed={s === 0}
        >
          تنبيه ع1
        </button>
        <button
          onClick={() => {
            stim(1);
            inject(null);
          }}
          aria-pressed={s === 1}
        >
          تنبيه ع2
        </button>
      </div>
      <div className="small-options" role="group" aria-label="مادة الحقن">
        {["حقن الغلوتامات", "حقن غابا"].map((label, i) => (
          <button key={label} onClick={() => inject(i)} aria-pressed={k === i}>
            {label}
          </button>
        ))}
      </div>
      <div className="paired-traces">
        <figure>
          <figcaption>ج3 · تنبيه {s === 0 ? "ع1" : "ع2"}</figcaption>
          <img
            width="144"
            height="103"
            src={s === 0 ? excite : inhibit}
            alt={s === 0 ? "أثر فوق كمون الراحة" : "أثر تحت كمون الراحة"}
          />
        </figure>
        {k !== null && (
          <figure>
            <figcaption>ج3 · حقن {k === 0 ? "الغلوتامات" : "غابا"}</figcaption>
            <img
              width="144"
              height="103"
              src={k === 0 ? glutamate : gaba}
              alt={k === 0 ? "أثر فوق كمون الراحة" : "أثر تحت كمون الراحة"}
            />
          </figure>
        )}
      </div>
      <div aria-live="polite">
        {k !== null && (
          <p data-id="pair-feedback">
            {s === k
              ? s === 0
                ? "الأثران فوق كمون الراحة. تشابه أثر تنبيه ع1 مع أثر حقن الغلوتامات يدعم أنّ الغلوتامات مبلّغ المشبك التنبيهي نحو ع3."
                : "الأثران تحت كمون الراحة. تشابه أثر تنبيه ع2 مع أثر حقن غابا يدعم أنّ غابا مبلّغ المشبك التثبيطي نحو ع3."
              : "الاتجاهان متعاكسان. هل يعطي الحقن الآخر أثراً يوافق أثر هذا التنبيه؟"}
          </p>
        )}
      </div>
      <p>
        على ورقتك: استشهد بسطر التنبيه وسطر الحقن. ولتحدّد المشابك كلّها، ارجع
        أيضاً إلى ج1 وج2 ومواضعها في الشكل (أ).
      </p>
    </details>
  );
}
const legend =
  "بكالوريا 2022، علوم تجريبية · الموضوع الأول، التمرين 3 · الوثيقة 1، الشكل (جـ)، ص 4.";
const alt = "مخطّط أعمدة: نسبة التعبير عن اللامينين بدلالة تركيز الجنتاميسين.";
const desc =
  "المحور الأفقي: تركيز الجنتاميسين بالميكروغرام لكل مليلتر. المحور العمودي: نسبة التعبير عن اللامينين المكتمل والوظيفي. عند 0 و6.25 و12.5 و25 نقرأ على الترتيب 0 و10 و20 ونحو 25 بالمئة.";
export function ProteinPrint() {
  return (
    <>
      <p>{legend}</p>
      <h1>تركيب البروتين | ماذا يبيّن الشكل (جـ)؟</h1>
      <img
        style={{ width: "105mm", maxWidth: "100%" }}
        src={laminine}
        alt={alt}
      />
      <p>سؤالان تدريبيان من بوصلة، لا التعليمة الكاملة للامتحان.</p>
      <p>
        1. استخرج نسبة التعبير عن اللامينين المكتمل عند التركيز 12.5
        ميكروغرام/مل.
      </p>
      <p>
        2. قارن النسبتين عند التركيزين 6.25 و12.5 ميكروغرام/مل واستنتج ما يدعمه
        هذا الفرق في الحالة المدروسة.
      </p>
      <Rules count={9} />
    </>
  );
}
export function Protein() {
  const [show, set] = useState(false);
  return (
    <div className="narrow">
      <Back />
      <div className="eyebrow">تركيب البروتين · قراءة وثيقة</div>
      <h1 id="screen-title" tabIndex={-1}>
        هل ازداد التعبير عن اللامينين المكتمل؟
      </h1>
      <p>
        تابعت الدراسة بروتيناً ضرورياً لالتصاق البشرة عند شخص مصاب بانحلال
        البشرة الفقاعي. اقرأ نسبة التعبير عن البروتين المكتمل والوظيفي في كلّ
        شرط.
      </p>
      <section className="paper">
        <Badge>مقتطف أصلي</Badge>
        <h2>الوثيقة 1 · الشكل (جـ)</h2>
        <Picture
          label={legend}
          src={laminine}
          dims={[690, 454]}
          alt={alt}
          description={desc}
        />
      </section>
      <section className="paper">
        <Badge gold>تدريب بوصلة على الشكل (جـ)</Badge>
        <h2>أجيب على ورقتي</h2>
        <ol>
          <li>
            استخرج نسبة التعبير عند التركيز <bdi>12.5</bdi> ميكروغرام/مل. حدّد
            الشرط والقيمة ووحدتها.
          </li>
          <li>
            قارن النسبتين عند <bdi>6.25</bdi> و<bdi>12.5</bdi> ميكروغرام/مل، ثمّ
            استنتج: ماذا يسند هذا الفرق في الحالة المدروسة؟
          </li>
        </ol>
        <div className="writebar">
          <button
            type="button"
            className="action"
            data-id="protein-compare"
            aria-expanded={show}
            onClick={() => set(!show)}
          >
            {show ? "أخفي المقارنة" : "كتبت إجابتي، أقارن الآن"}
          </button>
          <PrintButton />
        </div>
        {show && (
          <div className="inset" data-id="protein-reference">
            <p>
              <b>استخرج:</b> عند 12.5 ميكروغرام/مل تبلغ النسبة 20٪. تكفي هذه
              القراءة.
            </p>
            <p>
              <b>قارن واستنتج:</b> عند 6.25 ميكروغرام/مل تبلغ النسبة 10٪، وعند
              12.5 تبلغ 20٪. اقترن ارتفاع التركيز بين الشرطين بزيادة التعبير عن
              اللامينين المكتمل في هذه الحالة. لا يبيّن الرسم وحده كيف جرت
              الترجمة، ولا يثبت تغيّر المورّثة.
            </p>
          </div>
        )}
      </section>
      <details className="sources">
        <summary>ما الذي طلبه الامتحان؟</summary>
        <p>
          في الجزء الأول، تطلب التعليمة الأولى بيان تأثير المعاملة على البكتيريا
          وعلى الشخص المصاب وإبراز المشكل باستغلال الأشكال أ وب وجـ معاً. هنا
          نقرأ الشكل جـ فقط: التدريب ليس التمرين الكامل ولا تصحيحه.
        </p>
        <a href={sources.exam} target="_blank" rel="noreferrer">
          أطالع الموضوع الكامل، ص 4
        </a>
      </details>
      <a className="figure-back" href="#explore-protein">
        أعود إلى تجربة اللامينين
      </a>
    </div>
  );
}
export function Ressources() {
  if (
    !["http:", "https:"].includes(location.protocol) ||
    !/\/boussole\/(?:index\.html)?$/.test(location.pathname)
  )
    return null;
  return (
    <details className="class-resources">
      <summary>أوراق للكتابة ونسخة بلا إنترنت</summary>
      <div>
        <a href="./cahier-bac-2022.pdf" target="_blank" rel="noreferrer">
          كراس المشابك والغشاء · 4 صفحات
        </a>
        <p>
          أوراق مكيّفة من الموضوع 1 لسنة 2022: التمرين 2 (المشابك)، والسؤال 1 من
          التمرين 1 (الغشاء الهيولي). ليست الموضوع الكامل أو تصحيحاً.
        </p>
        <a href="./memo.pdf" target="_blank" rel="noreferrer">
          بطاقة التذكّر · ثماني عائلات من التعليمات في صفحة
        </a>
        <a href="./index.html" download="بوصلة العلوم — مختبر الفضول.html">
          أنزّل المختبر لاستعماله بلا إنترنت
        </a>
        <p>
          افتح الملفّ المنزّل بمتصفّح يشغّل ملفات HTML. قد لا تظهر فيه مسوّدة
          التطبيق؛ صدّر نصّك قبل تبديل الجهاز أو المتصفّح.
        </p>
      </div>
    </details>
  );
}
