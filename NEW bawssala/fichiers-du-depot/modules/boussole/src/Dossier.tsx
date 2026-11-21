import { Injection, Notation } from "./Preuves";
import { useState } from "react";
import type { Tools } from "./shared";
import {
  Rules,
  Back,
  Badge,
  Field,
  Help,
  LinkButton,
  Picture,
  PrintButton,
} from "./shared";
import {
  codes,
  instructions,
  pivot,
  sources,
  traceRows,
  traceText,
  traceTypes,
} from "./model";
import type { Page } from "./model";
import { Icon } from "./icons";
import network from "../assets/bac-2022-reseau.png";
import a from "../assets/bac-2022-a.png";
import b from "../assets/bac-2022-b.png";
import t11 from "../assets/trace-11.png";
import t12 from "../assets/trace-12.png";
import t13 from "../assets/trace-13.png";
import t21 from "../assets/trace-21.png";
import t22 from "../assets/trace-22.png";
import t23 from "../assets/trace-23.png";
import t31 from "../assets/trace-31.png";
import t32 from "../assets/trace-32.png";
import t33 from "../assets/trace-33.png";
import t41 from "../assets/trace-41.png";
import t42 from "../assets/trace-42.png";
import t43 from "../assets/trace-43.png";
const traces = [
  [t11, t12, t13],
  [t21, t22, t23],
  [t31, t32, t33],
  [t41, t42, t43],
];
const netAlt =
  "مخطّط العصبونين 1 و2 المتصلين بالعصبون المحرّك 3 ومواضع التسجيل والحقن في المنطقة س.";
const netDesc =
  "العصبون 1 حسّي، والعصبون 2 وارد من الدماغ، والعصبون 3 محرّك للعضلة. تتصل نهاية 1 بالعصبون 3، وللعصبون 2 اتصالان: بنهاية 1 وبالعصبون 3. تبيّن ج1 وج2 وج3 مواضع التسجيل، وت1 وت2 موضعي التنبيه.";
const aDesc =
  "في الشكل أ يصل التنبيه إلى نهاية ع1 وحدها. عند قناتها سهم الكالسيوم نحو الداخل. حويصلات غلوتامات في النهاية، وإحداها تفتح على الشق المشبكي. يمتدّ سهم الصوديوم إلى داخل ع3 عبر القناة المقابلة.";
const bDesc =
  "في الشكل ب يصل التنبيه إلى ع1 وع2 معاً. لحويصلات غابا في نهايتي ع2 محتوى يتجه نحو مستقبلات على ع1 وع3. عند نهاية ع1 علامة تثبيط على قناة الكالسيوم وعلامة تنشيط على قناة البوتاسيوم، وحويصلات الغلوتامات داخل النهاية. في ع3 سهم للكلوريد نحو الداخل وآخر للبوتاسيوم نحو الخارج.";
export function TraceTable() {
  return (
    <table className="traces">
      <caption>تغيّر الكمون الغشائي (ميلي فولط) عند أجهزة التسجيل</caption>
      <thead>
        <tr>
          <th scope="col">الشرط</th>
          {[1, 2, 3].map((n) => (
            <th scope="col" key={n}>
              ج{n}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {traceRows.map((s, r) => (
          <tr key={s}>
            <th scope="row">{s}</th>
            {traces[r].map((src, c) => (
              <td key={c}>
                <img src={src} alt={traceText[traceTypes[r][c]]} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
function TraceDetail() {
  const [row, setRow] = useState(0);
  return (
    <details className="desc tracezoom">
      <summary>أكبّر تسجيلات شرط واحد</summary>
      <label htmlFor="trace-condition">الشرط التجريبي</label>
      <select
        id="trace-condition"
        value={row}
        onChange={(e) => setRow(Number(e.target.value))}
      >
        {traceRows.map((r, i) => (
          <option key={r} value={i}>
            {r}
          </option>
        ))}
      </select>
      <div className="bigtraces">
        {traces[row].map((src, c) => (
          <figure key={c}>
            <figcaption>الجهاز {c + 1}</figcaption>
            <img src={src} alt={traceText[traceTypes[row][c]]} />
          </figure>
        ))}
      </div>
      <p className="sub">المحور العمودي: الكمون الغشائي بالميلي فولط.</p>
    </details>
  );
}
function Key({ ids }: { ids: number[] }) {
  return (
    <ul className="key" aria-label="مفتاح الأرقام في الرسم">
      {ids.map((n) => (
        <li key={n}>
          <b>{n}</b>
          {codes[n]}
        </li>
      ))}
    </ul>
  );
}
function ChannelKey() {
  return (
    <div className="channels" role="group" aria-label="مفتاح القنوات والعلامات">
      <b>مفتاح الرسم</b>
      <span>
        <svg viewBox="0 0 32 24" aria-hidden="true">
          <rect x="7" y="2" width="5" height="20" rx="1" />
          <rect x="20" y="2" width="5" height="20" rx="1" />
        </svg>
        قناة كالسيوم
      </span>
      <span>
        <svg viewBox="0 0 32 24" aria-hidden="true">
          <path d="M7 2h5v20H7zM20 2h5v20h-5z" fill="currentColor" />
        </svg>
        قناة بوتاسيوم
      </span>
      <span>
        <svg viewBox="0 0 32 24" aria-hidden="true">
          <path d="M6 2h4l3 3-2 3v14H6V8L4 5zM22 2h4l2 3-2 3v14h-5V8l-2-3z" />
        </svg>
        قناة صوديوم
      </span>
      <span>⊕ تنشيط</span>
      <span>⊖ تثبيط</span>
    </div>
  );
}
const Ref = () => (
  <details className="sources">
    <summary>مصدر الوثائق وما أضافته بوصلة</summary>
    <p>
      امتحان البكالوريا الجزائري، علوم الطبيعة والحياة، شعبة علوم تجريبية، دورة
      2022، الموضوع الأول، التمرين الثاني، الصفحتان 2 و3. الرسم الأول مقتطع من
      الموضوع. تسجيلات الشكل (ب) نفسها رُتّبت للقراءة على الهاتف، وكتبت وحدة
      محورها بالعربية. في الوثيقة 2 عُوّضت الرموز اللاتينية بمفاتيح مرقّمة،
      وبقيت الأسهم والبنيات كما في الأصل.
    </p>
    <p>
      التعليمات الثلاث من الموضوع. سؤال الربط والتلميحات والمقارنة أدوات تدريب
      من بوصلة، وليست أسئلة إضافية في الامتحان أو سلّم تنقيط.
    </p>
    <div className="sourceactions">
      <a href={sources.exam} target="_blank" rel="noreferrer">
        أطالع الموضوع الأصلي برموزه المنشورة
      </a>
      <a href={sources.correction} target="_blank" rel="noreferrer">
        أطالع التصحيح المنشور
      </a>
    </div>
  </details>
);
function Task({ n }: { n: number }) {
  return (
    <div className="task">
      <strong>
        {n === 0 ? "تعليمة الجزء الأول" : `الجزء الثاني · التعليمة ${n}`}
      </strong>
      {instructions[n]}
    </div>
  );
}
const tabNames = {
  doc1: "الوثيقة 1",
  doc2: "الوثيقة 2",
  answer: "ورقة الإجابة",
} as const;
function DocNav({ page }: { page: Page }) {
  return (
    <nav className="docnav" aria-label="أجزاء تمرين البكالوريا">
      {(["doc1", "doc2", "answer"] as const).map((k) => (
        <a
          key={k}
          href={"#" + k}
          aria-current={page === k ? "page" : undefined}
          data-id={"tab-" + k}
        >
          <Icon name={k === "answer" ? "pen" : "layers"} />
          {tabNames[k]}
        </a>
      ))}
    </nav>
  );
}
function DocOne() {
  return (
    <>
      <div className="sectionline">
        <span>الجزء الأول</span>
        <h2>أين سُجّل تغيّر الكمون؟</h2>
      </div>
      <p>
        تعرض الوثيقة 1 منطقة تشابك في المادة الرمادية للنخاع الشوكي. اقرأ مواضع
        الأجهزة في الشكل (أ)، ثم ارجع إلى الآثار المسجّلة في الشكل (ب).
      </p>
      <div className="docgrid">
        <section className="paper">
          <span className="figlabel">الوثيقة 1 · الشكل أ</span>
          <h3>منطقة التشابك</h3>
          <Picture
            src={network}
            dims={[441, 498]}
            label="الرسم الأصلي لمنطقة التشابك"
            alt={netAlt}
            description={netDesc}
          />
        </section>
        <section className="paper">
          <span className="figlabel">الوثيقة 1 · الشكل ب</span>
          <h3 className="figure-anchor" id="source-traces" tabIndex={-1}>
            التسجيلات في أربعة شروط
          </h3>
          <TraceTable />
          <p className="sub">
            الخط المتصل أثر الجهاز، والمرجع سالب 70 ميلي فولط. قُصَّ كلّ تسجيل
            من الشكل الأصلي.
          </p>
          <Injection />
          <TraceDetail />
          <a className="figure-back" href="#answer-first">
            أعود إلى تعليمة المشابك والمبلّغات
          </a>
          <details className="desc">
            <summary>أقرأ الآثار بالكلمات</summary>
            {traceRows.map((r, i) => (
              <div key={r} className="trace-desc">
                <b>{r}</b>
                <ul>
                  {traceTypes[i].map((type, c) => (
                    <li key={c}>
                      ج{c + 1}: {traceText[type]}.
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </details>
        </section>
      </div>
      <Task n={0} />
      <div className="writebar">
        <LinkButton page="doc2">أفتح الوثيقة 2</LinkButton>
        <LinkButton page="answer" kind="soft" icon="pen">
          أكتب إجابتي
        </LinkButton>
      </div>
    </>
  );
}
function DocTwo({ t }: { t: Tools }) {
  const [writing, setWriting] = useState(Boolean(t.notebook.link));
  return (
    <>
      <div className="sectionline">
        <span>الجزء الثاني</span>
        <h2>ماذا يحدث داخل المنطقة س؟</h2>
      </div>
      <p>
        تُظهر الوثيقة 2 نفس المنطقة بتفاصيلها الجزيئية. يُمثّل الشكل (أ) حالة
        تنبيه ع1 وحده وتقلّص العضلة، ويمثّل الشكل (ب) حالة تنبيه ع1 وع2 معاً
        واسترخائها.
      </p>
      <div className="docgrid mechanism">
        <section className="paper">
          <span className="figlabel">الوثيقة 2 · الشكل أ</span>
          <h3 className="figure-anchor" id="source-a" tabIndex={-1}>
            تنبيه العصبون 1 وحده
          </h3>
          <Picture
            src={a}
            dims={[323, 495]}
            label="الشكل أ · مفاتيح عربية مضافة"
            alt="نهاية ع1 تقابل العصبون المحرّك ع3 في حالة التقلّص."
            description={aDesc}
          />
          <Key ids={[1, 2, 7]} />
          <Notation ids={[1, 2, 7]} />
          <a className="figure-back" href="#answer-events">
            أعود إلى تعليمة الظواهر الناتجة
          </a>
        </section>
        <section className="paper">
          <span className="figlabel">الوثيقة 2 · الشكل ب</span>
          <h3 className="figure-anchor" id="source-b" tabIndex={-1}>
            تنبيه العصبونين 1 و2 معاً
          </h3>
          <Picture
            large
            src={b}
            dims={[675, 496]}
            label="الشكل ب · مفاتيح عربية مضافة"
            alt="نهايتا ع2 واتصالاهما بنهاية ع1 وبع3 عند التنبيه المتزامن."
            description={bDesc}
          />
          <Key ids={[1, 2, 3, 4, 5, 6]} />
          <Notation ids={[1, 2, 3, 4, 5, 6]} />
          <a className="figure-back" href="#answer-inhibit">
            أعود إلى تعليمة تفسير الكبح
          </a>
        </section>
      </div>
      <ChannelKey />
      <section className="bridge">
        <Badge gold>سؤال ربط من بوصلة · اختياري</Badge>
        <h3>{pivot}</h3>
        <p>يمكنك تدوين فكرة قصيرة، أو الانتقال مباشرة إلى تعليمات الامتحان.</p>
        <div>
          <button
            className="soft"
            aria-expanded={writing}
            onClick={() => setWriting(!writing)}
          >
            <Icon name="pen" />
            {writing ? "أطوي فكرة الربط" : "أدوّن فكرة الربط"}
          </button>
        </div>
        {writing && <Field field="link" t={t} label="فكرة الربط" rows={2} />}
        <Help onUse={() => t.help("docHelp")} title="تلميح للربط">
          <p>
            في الوثيقة 1 اختر أثراً مسجّلاً في ع3. في الوثيقة 2 تتبّع على الغشاء
            البروتين واتجاه الشاردة اللذين يفسّران ذلك الأثر.
          </p>
        </Help>
      </section>
      <Task n={1} />
      <Task n={2} />
      <div className="writebar">
        <LinkButton page="answer">أنتقل إلى ورقة الإجابة</LinkButton>
        <LinkButton page="doc1" kind="soft">
          أراجع الوثيقة 1
        </LinkButton>
      </div>
    </>
  );
}
export const models = [
  "ينبّه ت1 العصبون 1 فيُسجّل ج1 كمون عمل، ويسجّل ج3 زوال استقطاب دون العتبة، بينما يبقى ج2 في الراحة. وعند حقن الغلوتامات في س يظهر الأثر نفسه في ج3 من دون كمون عمل في ج1. يدل ذلك على أنّ المشبك من ع1 إلى ع3 تنبيهيّ ومبلّغه الغلوتامات. أمّا ت2 فيولّد كمون عمل في ج2، ويُسجّل ج1 وج3 فرط استقطاب. وعند حقن غابا في المنطقة س يظهر فرط الاستقطاب نفسه في ج1 وج3 بينما يبقى ج2 في الراحة. إذن المشبكان من ع2 إلى ع1 ومن ع2 إلى ع3 تثبيطيان ومبلّغهما غابا.",
  "عند وصول كمون العمل إلى نهاية ع1 تُفتح قنوات الكالسيوم الفولطية فتدخل شوارد الكالسيوم. تندمج حويصلات الغلوتامات بالغشاء وتحرّر المبلّغ في الشق. يرتبط بمستقبلاته القنوية على ع3 فتُفتح القنوات ويدخل الصوديوم. ينشأ زوال استقطاب بعد مشبكي، وإذا بلغ العتبة تولّد كمون عمل ينتشر في العصبون المحرّك فتتقلّص العضلة. بهذا نربط الظواهر الكهربائية بتحرير المبلّغ الكيميائي وتثبّته.",
  "عند تنبيه العصبونين معاً يفتح وصول كمون العمل إلى نهايتي ع2 قنوات الكالسيوم الفولطية. بدخول الكالسيوم تتحرّر جزيئات غابا في المشبكين. على نهاية ع1 ينشّط تثبّت غابا بمستقبلاته من النمط ب قنوات البوتاسيوم فيخرج البوتاسيوم ويحدث فرط استقطاب، ويثبّط قنوات الكالسيوم فلا يدخل الكالسيوم اللازم لتحرير الغلوتامات. فيُكبح التنبيه الآتي من ع1. وعلى ع3 يسمح مستقبل غابا من النمط أ بدخول الكلوريد، ويؤدي تنشيط المستقبل من النمط ب إلى خروج البوتاسيوم. فيحدث فرط استقطاب للعصبون المحرّك. يجتمع نقص التنبيه مع التثبيط، فلا تتولّد فيه رسالة محرّكة للعضلة في هذه الحالة، فتسترخي.",
];
function Answer({ t }: { t: Tools }) {
  const [typing, setTyping] = useState(
    Boolean(t.notebook.first || t.notebook.events || t.notebook.inhibit),
  );
  const [ref, setRef] = useState(false);
  return (
    <>
      <div className="sectionline">
        <span>أجيب بكلماتي</span>
        <h2>ثلاث تعليمات من التمرين الأصلي</h2>
      </div>
      <p>
        أجب على الورق من دون نسخ نصّ التعليمة. افتح الوثيقتين كلّما احتجت إلى
        فحص تسجيل أو سهم.
      </p>
      <div className="writebar">
        <PrintButton />
        <button
          className="soft"
          aria-expanded={typing}
          onClick={() => setTyping(!typing)}
        >
          <Icon name="pen" />
          {typing ? "أطوي مسوّدتي" : "أكتب هنا بدل الورق"}
        </button>
      </div>
      {(["first", "events", "inhibit"] as const).map((field, i) => (
        <section
          key={field}
          className="answerpart"
          id={"ans-" + field}
          tabIndex={-1}
        >
          <Task n={i} />
          <a
            className="textbtn"
            href={["#doc1-traces", "#doc2-fig-a", "#doc2-fig-b"][i]}
          >
            <Icon name="eye" />
            أراجع{" "}
            {i === 0
              ? "تسجيلات الوثيقة 1"
              : i === 1
                ? "الشكل أ من الوثيقة 2"
                : "الشكل ب من الوثيقة 2"}
          </a>
          {typing && (
            <Field
              field={field}
              label={
                ["علاقة المشابك بالمبلّغات", "الظواهر الناتجة", "تفسير الكبح"][
                  i
                ]
              }
              t={t}
            />
          )}
        </section>
      ))}
      <button
        className="action"
        data-id="bac-compare"
        aria-expanded={ref}
        onClick={() => setRef(!ref)}
      >
        <Icon name="compare" />
        {ref ? "أخفي المقارنة" : "أنهيت محاولتي وأريد المقارنة"}
      </button>
      {ref && (
        <section className="review" data-id="bac-ref">
          <Badge>للمقارنة بعد الكتابة</Badge>
          <h2>هل يسند الدليل ما كتبت؟</h2>
          <p>
            هذه صياغات تدريبية بالرجوع إلى التصحيح المنشور. راجع علاقتك بين
            الدليل والنتيجة، لا التطابق الحرفيّ. لا تنقيط آلياً.
          </p>
          {models.map((m, i) => (
            <div className="reviewpart" key={i}>
              <h3>
                {
                  [
                    "نوع المشبك ومبلّغه",
                    "من وصول الرسالة إلى التقلّص",
                    "من تأثير غابا إلى الاسترخاء",
                  ][i]
                }
              </h3>
              <p>{m}</p>
            </div>
          ))}
          <p className="inset">
            <b>مثال لجواب سؤال الربط الاختياري: </b>تدلّ التسجيلات في الوثيقة 1
            على الأثر التثبيطي؛ وتُظهر الوثيقة 2 أين تعمل المستقبلات والقنوات
            وكيف تغيّر حركة الشوارد وتحرير المبلّغ. بهذا نفسّر الأثر بدل تكرار
            وصفه.
          </p>
        </section>
      )}
    </>
  );
}
export function Dossier({
  page,
  t,
}: {
  page: "doc1" | "doc2" | "answer";
  t: Tools;
}) {
  return (
    <div className="dossier">
      <Back />
      <div className="eyebrow">
        <i /> بكالوريا 2022 <span>／</span> علوم تجريبية
      </div>
      <h1 id="screen-title" tabIndex={-1}>
        من الوثائق إلى الإجابة<span className="sr">: {tabNames[page]}</span>
      </h1>
      <p className="lead">المشابك العصبية · الموضوع 1، التمرين 2، ص 2 و3</p>
      <DocNav page={page} />
      {page === "doc1" ? (
        <DocOne />
      ) : page === "doc2" ? (
        <DocTwo t={t} />
      ) : (
        <Answer t={t} />
      )}
      <Ref />
    </div>
  );
}
export function BacPrint() {
  return (
    <>
      <section className="sheetpage">
        <p>
          بوصلة العلوم · بكالوريا 2022 · علوم تجريبية · الموضوع 1 · التمرين 2
        </p>
        <h1>الوثيقة 1 | منطقة التشابك والتسجيلات</h1>
        <p>
          ع1 عصبون حسّي، وع2 عصبون وارد من الدماغ، وع3 عصبون محرّك للعضلة. يمثل
          الشكل (أ) توضعها في المادة الرمادية للنخاع الشوكي، والشكل (ب)
          التسجيلات الناتجة في الشروط المبيّنة.
        </p>
        <div className="printnet">
          <img src={network} alt={netAlt} />
          <TraceTable />
        </div>
        <Task n={0} />
        <Rules count={7} />
        <p className="printsource">
          من الصفحة 2 في الموضوع. الأشكال من الأصل، مع ترتيب التسجيلات وكتابة
          الوحدة بالعربية.
        </p>
      </section>
      <section className="sheetpage">
        <p>
          بوصلة العلوم · بكالوريا 2022 · علوم تجريبية · الموضوع 1 · التمرين 2
        </p>
        <h1>الوثيقة 2 | البنيات الجزيئية للمنطقة س</h1>
        <div className="printmech">
          <figure>
            <figcaption>الشكل أ · تنبيه ع1 وتقلّص العضلة</figcaption>
            <img src={a} alt="الشكل أ" />
          </figure>
          <figure>
            <figcaption>الشكل ب · تنبيه ع1 وع2 معاً واسترخاء العضلة</figcaption>
            <img src={b} alt="الشكل ب" />
          </figure>
        </div>
        <Key ids={[1, 2, 3, 4, 5, 6, 7]} />
        <ChannelKey />
        <Task n={1} />
        <Rules count={3} />
        <Task n={2} />
        <p>تابع إجابتك على الورقة التالية.</p>
        <p className="printsource">
          عن الصفحة 3 من الموضوع الأصلي. الأرقام الخضراء ومفاتيحها بديل عربي
          لرموز الأصل، وليست أسئلة.
        </p>
      </section>
      <section className="sheetpage">
        <p>بوصلة العلوم · المشابك العصبية · ورقة الإجابة</p>
        <h1>تفسير الكبح واسترخاء العضلة</h1>
        <Task n={2} />
        <Rules />
        <p>يمكنك الرجوع إلى الوثيقتين أثناء الكتابة.</p>
      </section>
    </>
  );
}
