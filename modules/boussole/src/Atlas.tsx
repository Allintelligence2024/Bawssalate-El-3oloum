import { useEffect, useRef, useState } from "react";
import { Icon } from "./icons";
import { files, ids, sharedQuestion } from "./explore";
import type { Lab, Bit, Session } from "./explore";
import type { Writing } from "./model";
import nerveArt from "../assets/plate-nerve.webp";
import enzymeArt from "../assets/plate-enzyme.webp";
import immunityArt from "../assets/plate-immunity.webp";
import proteinArt from "../assets/plate-protein.webp";
import { Ressources } from "./Preuves";
import { RepereMethode } from "./Repere";
import rise from "../assets/trace-13.png";
import dip from "../assets/trace-23.png";
const art = {
  nerve: nerveArt,
  enzyme: enzymeArt,
  immunity: immunityArt,
  protein: proteinArt,
};
export function Glyph({ name, size = 20 }: { name: string; size?: number }) {
  if (!["pulse", "antibody", "star", "share"].includes(name))
    return <Icon name={name} size={size} />;
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {name === "pulse" ? (
        <path d="M2 13h5l2.2-8.5 4.1 15 2.5-10 2 3.5H22" />
      ) : name === "antibody" ? (
        <>
          <path d="m3 4 6 7 2 2v8m10-17-6 7-2 2v8M6.5 2.5l5.5 6 5.5-6" />
          <path d="M9.5 17h5" />
        </>
      ) : name === "star" ? (
        <path d="m12 1 2.2 8.8L23 12l-8.8 2.2L12 23l-2.2-8.8L1 12l8.8-2.2Z" />
      ) : (
        <>
          <circle cx="6" cy="12" r="2.4" />
          <circle cx="18" cy="5" r="2.4" />
          <circle cx="18" cy="19" r="2.4" />
          <path d="m8 11 8-5m-8 7 8 5" />
        </>
      )}
    </svg>
  );
}
export function Logo() {
  return (
    <svg
      viewBox="0 0 44 44"
      width="41"
      height="41"
      fill="none"
      aria-hidden="true"
    >
      <rect width="44" height="44" rx="13" fill="#153c39" />
      <circle
        cx="22"
        cy="22"
        r="15.5"
        stroke="#aacdc0"
        strokeWidth=".8"
        strokeDasharray="1 3"
      />
      <path d="m31.8 9.2-6.4 16.1-13.8 9.2 6.7-16.1z" fill="#d9eaa5" />
      <path d="m31.8 9.2-10 13-10.2 12.3 6.7-16.1z" fill="#f9f2d7" />
      <circle cx="22" cy="22" r="2" fill="#214542" />
    </svg>
  );
}
export function AtlasHeader({
  home,
  page,
  resume,
}: {
  home: boolean;
  page: string;
  resume: Writing | null;
}) {
  return (
    <header className="atlas-header">
      <div className="atlas-headin">
        <a
          className="atlas-brand"
          href="#home"
          aria-label="بوصلة العلوم، إلى مختبر الفضول"
        >
          <Logo />
          <span>
            <strong>بوصلة العلوم</strong>
            <small>بكالوريا الجزائر</small>
          </span>
        </a>
        <nav className="atlas-topnav" aria-label="أقسام بوصلة العلوم">
          <a href="#home" aria-current={home ? "page" : undefined}>
            الاستكشاف
          </a>
          <a href="#warm" aria-current={page === "warm" ? "page" : undefined}>
            المثال التفاعلي
          </a>
          <a
            href="#doc1"
            aria-current={
              ["doc1", "doc2", "answer"].includes(page) ? "page" : undefined
            }
          >
            موضوع الباك
          </a>
        </nav>
        <div className="atlas-headtools">
          {home && resume && (
            <a
              className="atlas-resume"
              data-id="resume"
              href={"#draft-" + resume}
            >
              <Glyph name="bookmark" size={16} />
              أستأنف مسوّدتي
            </a>
          )}
          <a
            className="atlas-paper"
            href={page === "solo" ? "#home" : "#solo"}
            data-id="atlas-paper"
          >
            <Glyph name={page === "solo" ? "pin" : "pen"} size={16} />
            {page === "solo" ? "إلى الاستكشاف" : "أجرّب بمفردي"}
          </a>
        </div>
      </div>
    </header>
  );
}
function Share({ id }: { id: Lab }) {
  const [open, set] = useState(false),
    [msg, notice] = useState("");
  const box = useRef<HTMLTextAreaElement>(null);
  const text = sharedQuestion(id, location.href);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      notice("نُسخ السؤال.");
    } catch {
      box.current?.focus();
      box.current?.select();
      notice("النصّ محدّد. انسخه من قائمة جهازك.");
    }
  }
  return (
    <div className="atlas-share">
      <button
        type="button"
        aria-expanded={open}
        data-id="share"
        onClick={() => {
          set(!open);
          notice("");
        }}
      >
        <Glyph name="share" size={16} />
        أشارك السؤال
      </button>
      {open && (
        <div className="share-box">
          <label htmlFor="share-q">
            السؤال فقط، من دون الإجابة أو مسوّدتك.
          </label>
          <textarea
            ref={box}
            id="share-q"
            dir="auto"
            readOnly
            value={text}
            rows={3}
          />
          <button type="button" onClick={copy}>
            أنسخ السؤال
          </button>
          <span role="status">{msg}</span>
        </div>
      )}
    </div>
  );
}
function Sample({ id, i, active }: { id: Lab; i: Bit; active: boolean }) {
  const f = files[id],
    n = f.values?.[i];
  return (
    <div className={"lab-sample " + (active ? "is-current" : "")}>
      <span className="sample-label">
        {id === "nerve" ? ["تنبيه ع1", "تنبيه ع2"][i] : f.labels[i]}
      </span>
      {id === "nerve" ? (
        <>
          {" "}
          <img
            src={i === 0 ? rise : dip}
            width="144"
            height="103"
            alt={
              i === 0
                ? "ج3: ارتفاع عابر فوق خطّ الراحة، ثم عودة إليه."
                : "ج3: انخفاض عابر تحت خطّ الراحة، ثم عودة إليه."
            }
          />
          <small className="trace-side">
            {i === 0 ? "فوق" : "تحت"} <bdi dir="ltr">−70 mV</bdi>
          </small>
        </>
      ) : id === "protein" ? (
        <div className="quantity">
          <strong>
            <bdi dir="ltr">{n}%</bdi>
          </strong>
          <small>من التعبير</small>
        </div>
      ) : (
        <div className="quantity">
          <strong>{n}</strong>
          <div className="scale-ticks" aria-hidden="true">
            {Array.from({ length: 10 }, (_, j) => (
              <i key={j} className={j < (n ?? 0) ? "lit" : ""} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
export function Atlas({
  id,
  state,
  onRead,
  onThink,
}: {
  id: Lab;
  state: Session[Lab];
  onRead: (c: Bit) => void;
  onThink: (c: Bit) => void;
}) {
  const f = files[id],
    { condition, compared, thought } = state,
    done = thought === f.supported;
  const evidence = useRef<HTMLElement>(null),
    fromQuestion = useRef(false);
  const nextId = ids[(ids.indexOf(id) + 1) % ids.length];
  useEffect(() => {
    if (!fromQuestion.current) return;
    fromQuestion.current = false;
    const title = document.getElementById("case-title");
    title?.focus({ preventScroll: true });
    title?.scrollIntoView({ block: "center" });
  }, [id]);
  const step = done ? 2 : compared ? 1 : 0;
  function read(c: Bit, fromReveal = false) {
    onRead(c);
    requestAnimationFrame(() => {
      const el = evidence.current;
      if (!el) return;
      if (fromReveal) el.focus({ preventScroll: true });
      if (el.getBoundingClientRect().top > innerHeight - 115)
        el.scrollIntoView({ block: "start" });
    });
  }
  return (
    <div className={"atlas-shell case-" + id}>
      <div className="atlas-mast">
        <div>
          <div className="atlas-eyeline">
            <span className="atlas-square" /> علوم الطبيعة والحياة <i /> السنة
            الثالثة ثانوي
          </div>
          <h1 id="screen-title" tabIndex={-1}>
            مختبر <em>الفضول</em>
            <span className="mast-spark" aria-hidden="true">
              ✳
            </span>
          </h1>
        </div>
        <p>
          <b>واش تلاحظ؟</b> بدّل شرطاً، قارن الدليل،
          <br className="desk-br" /> وخذ فكرتك إلى ورقة الباك.
        </p>
      </div>
      <nav className="case-index" aria-label="اختيار ملفّ للاستكشاف">
        <span className="index-title">
          <Glyph name="layers" size={16} />
          فهرس الملفات
        </span>
        <div>
          {ids.map((k) => (
            <a
              key={k}
              href={"#explore-" + k}
              data-id={"case-" + k}
              aria-current={k === id ? "page" : undefined}
            >
              <span className="index-n">{files[k].number}</span>
              {files[k].label}
            </a>
          ))}
        </div>
        <span className="index-end" aria-hidden="true">
          <i /> دفتر الملاحظة
        </span>
      </nav>
      <article className="instrument" aria-labelledby="case-title">
        <div className="atlas-poster">
          <div className="plate-window" aria-hidden="true">
            <img className="specimen" src={art[id]} alt="" />
            <svg
              className="register"
              viewBox="0 0 400 260"
              preserveAspectRatio="none"
            >
              <g fill="none" stroke="currentColor">
                <ellipse
                  cx="196"
                  cy="127"
                  rx="137"
                  ry="96"
                  strokeDasharray="1 6"
                />
                <path d="M14 33V15h20m330 0h20v18M14 226v18h20m330 0h20v-18" />
                <path d="M10 129h10m359 0h10M196 9v8m0 225v9" />
              </g>
            </svg>
            <span className="plate-code">
              رسم فنّي <i /> {f.number}
            </span>
          </div>
          <div className="poster-copy">
            <div className="case-meta">
              <span>
                ملفّ <b>{f.number}</b>
              </span>
              <small>{f.source}</small>
            </div>
            <h2 id="case-title" tabIndex={-1}>
              {f.title[0]}
              <br />
              <em>{f.title[1]}</em>
            </h2>
            <p>{f.question}</p>
            <div
              className="condition-bar"
              role="group"
              aria-label="شرطا المقارنة"
            >
              {([0, 1] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  data-id={"cond-" + c}
                  aria-pressed={condition === c}
                  onClick={() => read(c)}
                >
                  <i aria-hidden="true" />
                  {f.labels[c]}
                </button>
              ))}
            </div>
          </div>
        </div>
        <section
          className="readout"
          ref={evidence}
          tabIndex={-1}
          aria-label="قراءة الدليل"
        >
          <div className="sheet-copy">
            <div className="sheet-kicker">
              <Glyph name="eye" size={17} /> تحت العدسة
            </div>
            <h3>{f.measure}</h3>
            <p aria-live="polite" aria-atomic="true" data-id="observation">
              {f.obs[condition]}
            </p>
            <small>
              {id === "nerve"
                ? "تسجيل أصلي · خطّ الراحة: سالب 70 ميلي فولط."
                : id === "protein"
                  ? "قيمتان من العمودين في الشكل (جـ) · التركيز بالميكروغرام/مل."
                  : "الأرقام هي القياسات، وكلّ علامة تمثّل وحدة اعتبارية."}
            </small>
          </div>
          <div className="samples">
            <Sample id={id} i={0} active={condition === 0} />
            {compared ? (
              <Sample id={id} i={1} active={condition === 1} />
            ) : (
              <div className="sample-hidden">
                <Glyph name="compare" size={19} />
                <span>
                  {id === "protein" ? "العمود الثاني" : "القياس الثاني"}
                </span>
                <button
                  type="button"
                  data-id="reveal-second"
                  onClick={() => read(1, true)}
                >
                  أكشفه <span aria-hidden="true">←</span>
                </button>
              </div>
            )}
          </div>
        </section>
        {compared && (
          <section className="interpret" aria-labelledby="thought-title">
            <div className="sheet-kicker">
              <Glyph name="bulb" size={16} /> أختبر فكرتي
            </div>
            <h3 id="thought-title">{f.prompt}</h3>
            <div className="thoughts">
              {([0, 1] as const).map((i) => (
                <button
                  type="button"
                  key={i}
                  aria-pressed={thought === i}
                  data-id={"thought-" + i}
                  onClick={() => onThink(i)}
                >
                  {f.thoughts[i]}
                </button>
              ))}
            </div>
            <div aria-live="polite" aria-atomic="true">
              {thought !== null && (
                <p
                  className={"thought-back " + (done ? "grounded" : "revisit")}
                  data-id="reason"
                >
                  <b>{done ? "الدليل: " : "أعد النظر: "}</b>
                  {done ? f.why : f.revise}
                </p>
              )}
            </div>
            {thought !== null && (
              <a
                className="another-lab"
                data-id="another"
                href={"#explore-" + nextId}
                onClick={() => {
                  fromQuestion.current = true;
                }}
              >
                <Glyph name="route" size={16} />
                <span>لغز آخر؟</span> {files[nextId].title.join(" ")}{" "}
                <Glyph name="back" size={15} />
              </a>
            )}
          </section>
        )}
        <div className="instrument-foot">
          <div
            className="lab-progress"
            role="group"
            aria-label={
              "موضعك في هذا الملف: " + ["ألاحظ", "أقارن", "أستدلّ"][step]
            }
          >
            {["ألاحظ", "أقارن", "أستدلّ"].map((s, i) => (
              <span
                key={s}
                className={i <= step ? "on" : ""}
                aria-current={i === step ? "step" : undefined}
              >
                <i />
                {s}
              </span>
            ))}
          </div>
          <a className="evidence-link" data-id="source-path" href={f.path}>
            {f.next}
            <Glyph name="back" size={16} />
          </a>
        </div>
      </article>
      <div className="atlas-endline">
        <span>
          <i /> لا تنقيط هنا. لك أن تغيّر فكرتك.
        </span>
        <Share key={id} id={id} />
      </div>
      <RepereMethode />
      <Ressources />
      <section className="atlas-paths" aria-labelledby="paths-title">
        <div className="paths-heading">
          <h2 id="paths-title">إلى ورشة الإجابة</h2>
          <span>ادخل مباشرة، بالترتيب الذي تريد.</span>
        </div>
        <div className="path-grid">
          {[
            {
              h: "#warm",
              n: "01",
              i: "chart",
              a: "أفهم الطريقة بمثال",
              b: "أقرأ نقطة على منحنى وأصحّح إجابة.",
            },
            {
              h: "#solo",
              n: "02",
              i: "pen",
              a: "أجرّب بمفردي",
              b: "أكتب على ورقتي قبل فتح المقارنة.",
            },
            {
              h: "#doc1",
              n: "03",
              i: "layers",
              a: "أفتح موضوع الباك",
              b: "وثيقتان من بكالوريا 2022، مع التكبير.",
            },
          ].map((x) => (
            <a href={x.h} key={x.h}>
              <div className="path-top">
                <span className="path-symbol">
                  <Glyph name={x.i} size={21} />
                </span>
                <small>{x.n}</small>
              </div>
              <strong>{x.a}</strong>
              <div className="path-tail">
                <span>{x.b}</span>
                <Glyph name="back" size={16} />
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
