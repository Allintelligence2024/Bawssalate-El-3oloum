import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Atlas, AtlasHeader } from "./Atlas";
import { freshSession, labFromHash, examine, interpret } from "./explore";
import type { Lab } from "./explore";
import { Protein, ProteinPrint } from "./Preuves";
import { Warm } from "./Warm";
import { Solo, SoloPrint } from "./Solo";
import { BacPrint, Dossier } from "./Dossier";
import { Compass, Icon } from "./icons";
import { Rules, LinkButton } from "./shared";
import type { Tools } from "./shared";
import { exportText } from "./model";
import {
  ENTRY_KEY as KEY,
  readBook,
  newBook,
  destination,
  latest,
  edited,
  hasInk,
  promise,
  steps,
} from "./entry";
import type { EntryBook } from "./entry";
import "./style.css";
import "./atlas.css";
if (window.parent !== window)
  document.documentElement.dataset.embedded = "true";
function load() {
  try {
    return { notebook: readBook(localStorage.getItem(KEY)), saved: true };
  } catch {
    return { notebook: newBook(), saved: false };
  }
}
function App() {
  const [address, setAddress] = useState(() => location.hash);
  const { page, draft } = destination(address);
  const [s, setState] = useState(load);
  const [track, setTrack] = useState(freshSession);
  const [lastLab, rememberLab] = useState<Lab>(
    () => labFromHash(location.hash) ?? "nerve",
  );
  const lab = labFromHash(address) ?? lastLab;
  const previousPage = useRef<string | null>(null);
  useEffect(() => {
    const v = labFromHash(address);
    if (v) rememberLab(v);
  }, [address]);
  const [manage, showManage] = useState(false),
    [ask, confirm] = useState(false);
  const [msg, notice] = useState("");
  const initial = useRef(true);
  const resume = latest(s.notebook);
  const isHome = page === "home";
  useEffect(() => {
    const move = () => {
      setAddress(location.hash);
      confirm(false);
      notice("");
      showManage(false);
    };
    const storage = (e: StorageEvent) => {
      if (e.key === KEY || e.key === null) setState(load());
    };
    window.addEventListener("hashchange", move);
    window.addEventListener("storage", storage);
    return () => {
      window.removeEventListener("hashchange", move);
      window.removeEventListener("storage", storage);
    };
  }, []);
  useEffect(() => {
    const prior = previousPage.current;
    previousPage.current = page;
    const target: Record<string, string> = {
      "#doc1-traces": "source-traces",
      "#doc2-fig-a": "source-a",
      "#doc2-fig-b": "source-b",
      "#answer-first": "first",
      "#answer-events": "events",
      "#answer-inhibit": "inhibit",
    };
    const specific = target[address];
    if (specific) {
      const edit = document.getElementById("txt-" + specific);
      const el =
        (edit instanceof HTMLTextAreaElement && hasInk(edit.value)
          ? edit
          : null) ??
        document.getElementById("ans-" + specific) ??
        document.getElementById(specific);
      if (el) {
        el.focus({ preventScroll: true });
        el.scrollIntoView({ block: "start" });
        initial.current = false;
        return;
      }
    }
    if (initial.current && !draft) {
      initial.current = false;
      return;
    }
    initial.current = false;
    if (prior === "home" && page === "home" && labFromHash(address)) return;
    if (draft) {
      const field = document.getElementById("txt-" + draft);
      if (field instanceof HTMLTextAreaElement && hasInk(field.value)) {
        field.focus({ preventScroll: true });
        field.setSelectionRange(field.value.length, field.value.length);
        field.scrollIntoView({ block: "center" });
        return;
      }
    }
    document.getElementById("screen-title")?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }, [address, draft, page]);
  function save(j: EntryBook) {
    let ok = true;
    try {
      localStorage.setItem(KEY, JSON.stringify(j));
    } catch {
      ok = false;
    }
    setState({ notebook: j, saved: ok });
  }
  const t: Tools = {
    ...s,
    write: (key, value) => save(edited(s.notebook, key, value)),
    help: (key) => {
      if (!s.notebook[key]) save({ ...s.notebook, [key]: true });
    },
  };
  function clean() {
    try {
      localStorage.removeItem(KEY);
      setState({ notebook: newBook(), saved: true });
      notice("مُسحت مسوّدات التجربة من هذا المتصفّح.");
    } catch {
      setState({ notebook: newBook(), saved: false });
      notice("مُسحت مسوّدات الجلسة. التخزين غير متاح.");
    }
    confirm(false);
  }
  function download() {
    const u = URL.createObjectURL(
      new Blob(["\uFEFF" + exportText(s.notebook)], {
        type: "text/plain;charset=utf-8",
      }),
    );
    const a = document.createElement("a");
    a.href = u;
    a.download = "مسوّدة-بوصلة.txt";
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(u), 1000);
  }
  function navigate(e: React.MouseEvent<HTMLDivElement>) {
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.ctrlKey ||
      e.metaKey ||
      e.shiftKey ||
      e.altKey
    )
      return;
    const link =
      e.target instanceof Element
        ? e.target.closest<HTMLAnchorElement>('a[href^="#"]')
        : null;
    const hash = link?.getAttribute("href");
    if (!hash || hash === "#main") return;
    // لا تجعل الروابط الداخلية في عارض الملف تنتقل إلى الصفحة الحاضنة لإطار العرض.
    if (!["http:", "https:", "file:"].includes(location.protocol)) {
      e.preventDefault();
      setAddress(hash);
      confirm(false);
      notice("");
      showManage(false);
    }
  }
  return (
    <>
      <div
        className={isHome ? "screen atlas-screen" : "screen"}
        onClick={navigate}
      >
        <a
          className="skip"
          href="#main"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById("main")?.focus();
          }}
        >
          {isHome ? "انتقل إلى الاستكشاف" : "انتقل إلى التمرين"}
        </a>
        <AtlasHeader home={isHome} page={page} resume={resume} />
        <main
          id="main"
          tabIndex={-1}
          className={isHome ? "atlas-main" : "wrap"}
          key={isHome ? "atlas" : address}
        >
          {page === "home" ? (
            <Atlas
              id={lab}
              state={track[lab]}
              onRead={(c) => setTrack((v) => examine(v, lab, c))}
              onThink={(i) => setTrack((v) => interpret(v, lab, i))}
            />
          ) : page === "protein-doc" ? (
            <Protein />
          ) : page === "warm" ? (
            <Warm />
          ) : page === "solo" ? (
            <Solo t={t} />
          ) : (
            <Dossier page={page} t={t} />
          )}
        </main>
        {isHome ? (
          <footer className="atlas-colophon">
            <div>
              <b>بوصلة العلوم · مختبر الفضول</b>
              <span>استكشاف بلا حساب</span>
            </div>
          </footer>
        ) : (
          <footer className="footer">
            <div className="footin">
              <span className="footbrand">
                <Compass small /> بوصلة العلوم{" "}
                <span>· مختبر الفضول · نسخة القسم</span>
              </span>
              <button
                aria-expanded={manage}
                className="textbtn"
                onClick={() => {
                  showManage(!manage);
                  confirm(false);
                  notice("");
                }}
              >
                <Icon name="bookmark" />
                دفتر التجربة
              </button>
            </div>
            {manage && (
              <section className="manage">
                <h2>دفتر التجربة على هذا الجهاز</h2>
                <p>
                  {s.saved
                    ? "يُحفظ ما تكتبه هنا فقط، ولا يُرسل إلى أحد."
                    : "التخزين غير متاح هنا. تبقى المسوّدة لهذه الجلسة فقط."}{" "}
                  لا تكتب اسمك على جهاز مشترك. دفتر الاستكشاف منفصل عن دفاتر
                  الإصدارات السابقة.
                </p>
                <div className="writebar">
                  <button className="soft" onClick={download}>
                    <Icon name="download" />
                    أنزّل مسوّدتي
                  </button>
                  <button className="textbtn" onClick={() => confirm(true)}>
                    أمسح دفتر التجربة
                  </button>
                </div>
                {ask && (
                  <div className="inset">
                    <b>
                      هل أمسح مسوّدات هذه التجربة فقط؟ لا يمكن استرجاعها بعد
                      المسح.
                    </b>
                    <div className="writebar">
                      <button className="soft" onClick={() => confirm(false)}>
                        أتراجع
                      </button>
                      <button className="action" onClick={clean}>
                        نعم، أمسح المسوّدات
                      </button>
                    </div>
                  </div>
                )}
                <p role="status">{msg}</p>
              </section>
            )}
          </footer>
        )}
      </div>
      <div className="printonly">
        {page === "home" && lab !== "protein" ? (
          <>
            <p>بوصلة العلوم · بكالوريا الجزائر</p>
            <h1>مختبر الفضول</h1>
            <p>{promise}</p>
            <p>{steps.map((s, i) => `${i + 1}. ${s}`).join(" · ")}</p>
          </>
        ) : page === "protein-doc" || (page === "home" && lab === "protein") ? (
          <ProteinPrint />
        ) : page === "solo" ? (
          <SoloPrint />
        ) : page === "warm" ? (
          <>
            <p>بوصلة العلوم · سند تدريبي</p>
            <h1>قراءة منحنى النشاط</h1>
            <p>استخرج قيمة نشاط الإنزيم عندما تكون درجة الحموضة 9.</p>
            <p>
              إجابة تلميذ افتراضي: النشاط 8 وحدات اعتبارية. صحّح الإجابة
              مستعيناً بالقياسات.
            </p>
            <table>
              <thead>
                <tr>
                  <th>درجة الحموضة</th>
                  {[3, 5, 7, 9, 11].map((n) => (
                    <th key={n}>{n}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th>النشاط (وحدة اعتبارية)</th>
                  {[1, 4, 8, 3, 1].map((n, i) => (
                    <td key={i}>{n}</td>
                  ))}
                </tr>
              </tbody>
            </table>
            <Rules count={7} />
          </>
        ) : (
          <BacPrint />
        )}
      </div>
    </>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
