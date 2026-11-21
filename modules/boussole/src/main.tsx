import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Atlas, AtlasHeader } from "./Atlas";
import { freshSession, labFromHash, examine, interpret, files } from "./explore";
import type { Lab } from "./explore";
import { emitBoussoleAttempt, LAB_META } from "./bridge";
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
  RESTORE_KEY,
  restorationPending,
  parseBook,
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
type NotebookState = {
  notebook: EntryBook;
  /** Derniers octets lus ou écrits, pour détecter un changement entre deux onglets. */
  raw: string | null;
  accessible: boolean;
  saved: boolean;
  dirty: boolean;
  locked: boolean;
  conflict: boolean;
  pending: boolean;
};
function load(): NotebookState {
  let raw: string | null = null, pending = false, accessible = false;
  try {
    pending = restorationPending();
    raw = localStorage.getItem(KEY);
    accessible = true;
    const notebook = raw === null ? newBook() : parseBook(JSON.parse(raw));
    if (notebook) return { notebook, raw, accessible, saved: true, dirty: false, locked: false, conflict: false, pending };
  } catch {
    // Lecture refusée ou JSON corrompu : ne pas écraser le carnet existant.
  }
  return { notebook: newBook(), raw, accessible, saved: false, dirty: false, locked: true, conflict: false, pending };
}
function App() {
  const [address, setAddress] = useState(() => location.hash);
  const { page, draft } = destination(address);
  const [s, setState] = useState(load);
  const state = useRef(s);
  function updateState(next: NotebookState) {
    state.current = next;
    setState(next);
  }
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
    [ask, confirm] = useState(false),
    [askLoad, confirmLoad] = useState(false),
    [loadError, setLoadError] = useState(false);
  const loadTitle = useRef<HTMLParagraphElement>(null);
  const loadButton = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (askLoad) loadTitle.current?.focus(); }, [askLoad]);
  const [msg, notice] = useState("");
  const initial = useRef(true);
  const resume = latest(s.notebook);
  const isHome = page === "home";
  useEffect(() => {
    const move = () => {
      setAddress(location.hash);
      confirm(false);
      confirmLoad(false);
      setLoadError(false);
      notice("");
      showManage(false);
    };
    const storage = (e: StorageEvent) => {
      if (e.key !== KEY && e.key !== RESTORE_KEY && e.key !== null) return;
      // Les confirmations se rapportaient à une copie précédente : les fermer
      // si une autre page modifie le carnet ou le journal. Ne déplacer le focus
      // que si l'utilisateur se trouvait dans la confirmation de chargement.
      if (loadTitle.current?.parentElement?.contains(document.activeElement)) loadButton.current?.focus();
      confirm(false);
      confirmLoad(false);
      setLoadError(false);
      const before = state.current, current = load();
      if (!before.dirty && !before.conflict && !current.locked && !current.pending) {
        updateState(current);
        return;
      }
      // Garder la copie affichée lorsqu'elle est temporaire, ou lorsque la
      // nouvelle valeur est illisible : elle peut être la dernière copie intacte.
      // Un journal en attente ne doit pas non plus remplacer cette copie par un
      // état partiellement restauré.
      updateState({
        ...before,
        saved: false,
        pending: current.pending,
        conflict: before.conflict || current.locked || !current.accessible || current.raw !== before.raw,
      });
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
    const before = state.current;
    let next = { ...before, notebook: j, saved: false, dirty: true };
    try {
      const pending = restorationPending();
      next.pending = pending;
      if (!pending && !before.locked && !before.conflict) {
        // Comparer les octets avant chaque écriture, même si l'événement storage
        // d'un autre onglet n'a pas encore été reçu.
        if (localStorage.getItem(KEY) !== before.raw) {
          next.conflict = true;
        } else {
          const raw = JSON.stringify(j);
          localStorage.setItem(KEY, raw);
          next = { ...next, raw, accessible: true, saved: true, dirty: false };
        }
      }
    } catch {
      // La saisie reste disponible pour l'export de texte pendant la session.
    }
    updateState(next);
  }
  const t: Tools = {
    ...s,
    write: (key, value) => save(edited(state.current.notebook, key, value)),
    help: (key) => {
      if (!state.current.notebook[key]) save({ ...state.current.notebook, [key]: true });
    },
  };
  function clean() {
    try {
      // Sinon le rejeu d'une restauration pourrait ressusciter le carnet effacé.
      if (restorationPending()) {
        updateState({ ...state.current, pending: true });
        notice("تعذّر تأكيد المسح: توجد استعادة غير مكتملة قد تعيد الدفتر. افتح التطبيق وأكمل الاستعادة قبل المسح.");
      } else if (state.current.conflict || !state.current.accessible || localStorage.getItem(KEY) !== state.current.raw) {
        // Ne pas effacer une nouvelle copie avant même de recevoir storage.
        updateState({ ...state.current, saved: false, conflict: true });
        notice("لم يُمسح الدفتر لأنّه تغيّر أو تعذّرت مقارنته. احفظ نصّك المؤقّت قبل تحميل النسخة المحفوظة.");
      } else {
        localStorage.removeItem(KEY);
        updateState({ notebook: newBook(), raw: null, accessible: true, saved: true, dirty: false, locked: false, conflict: false, pending: false });
        notice("مُسحت مسوّدات التجربة من هذا المتصفّح. أغلق التبويبات الأخرى حتى لا تُعيد حفظ نسخة مفتوحة.");
      }
    } catch {
      // Ne pas affirmer une suppression locale quand elle n'a pas réussi.
      notice("تعذّر تأكيد المسح من الجهاز. تحقّق من التخزين وأعد المحاولة.");
    }
    confirm(false);
  }
  function loadSaved() {
    const current = load();
    // La confirmation ne doit jamais remplacer l'unique brouillon temporaire
    // par un état vierge de secours si le carnet ou le journal devient illisible.
    if (current.locked || current.pending) {
      updateState({ ...state.current, pending: current.pending, conflict: true });
      setLoadError(true);
    } else {
      updateState(current);
      setLoadError(false);
    }
    confirmLoad(false);
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
      confirmLoad(false);
      setLoadError(false);
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
        {s.pending && (
          <p className="storage-warning" role="alert">
            توجد استعادة غير مكتملة. الكتابة الجديدة مؤقّتة ولا يمكن تأكيد مسح الدفتر
            الآن؛ انسخ نصّك أو نزّله، ثم افتح التطبيق وأكمل الاستعادة قبل المتابعة.
          </p>
        )}
        {s.conflict ? (
          <div className="storage-warning">
            <p role="alert">
              تغيّر الدفتر المحفوظ في صفحة أخرى أو تعذّرت مقارنته. لم نستبدل
              الدفتر الآخر أو نمسحه. إن كانت لديك كتابة غير محفوظة، انسخها أو نزّلها
              قبل تحميل النسخة المحفوظة.
            </p>
            <button
              ref={loadButton}
              type="button"
              className="soft"
              disabled={s.pending}
              onClick={() => { setLoadError(false); confirmLoad(true); }}
            >
              أحمّل الدفتر المحفوظ
            </button>
            {askLoad && (
              <div className="inset" role="group" aria-labelledby="confirm-load-title">
                <p id="confirm-load-title" ref={loadTitle} tabIndex={-1}>
                  ستُفقد المسوّدة غير المحفوظة في هذه الصفحة ويُحمّل الدفتر الموجود في المتصفّح. هل نسختها أو نزّلتها؟
                </p>
                <div className="writebar">
                  <button type="button" className="soft" onClick={() => { confirmLoad(false); loadButton.current?.focus(); }}>أتراجع عن التحميل</button>
                  <button type="button" className="action" onClick={loadSaved}>نعم، أحمّل الدفتر</button>
                </div>
              </div>
            )}
            {loadError && <p role="alert">تعذّرت قراءة الدفتر المحفوظ أو لم تكتمل الاستعادة؛ بقي نصّك المؤقّت هنا. انسخه أو نزّله ثم تحقّق من التخزين.</p>}
          </div>
        ) : s.locked && (
          <p className="storage-warning" role="alert">
            تعذّرت قراءة دفتر محفوظ أو تعذّر الوصول إلى التخزين. لن نستبدل الدفتر
            الموجود تلقائيًا؛ كتابتك الجديدة مؤقّتة، فانسخها قبل الإغلاق. تحقّق من
            التخزين قبل تأكيد مسح الدفتر.
          </p>
        )}
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
              onThink={(i) => {
                setTrack((v) => interpret(v, lab, i));
                const dossier = files[lab];
                const meta = LAB_META[lab];
                const reussi = i === dossier.supported;
                emitBoussoleAttempt({
                  exerciseId: `boussole:${lab}`,
                  unitId: meta.unitId,
                  verbe: meta.verbe,
                  titre: `${dossier.label} · ${dossier.title[0]} ${dossier.title[1]}`,
                  reussi,
                  prompt: dossier.prompt,
                  choix: dossier.thoughts[i],
                  erreurTag: reussi ? undefined : dossier.revise,
                });
              }}
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
                    ? "تُحفظ المسوّدات في هذا المتصفّح ولا تُزامن مع الخادم."
                    : "لم يُؤكّد حفظ المسوّدة؛ انسخها قبل إغلاق الجلسة."}{" "}
                  يمكن لكلّ من يستعمل هذا المتصفّح قراءتها، ولا يحذفها تسجيل الخروج.
                  لا تكتب بيانات شخصية على جهاز مشترك، وامسح الدفتر قبل تسليمه.
                  لا يمسح هذا الدفتر إصدارات المختبر الأقدم أو الملفات المنزّلة.
                  {window.parent !== window && " تشمل النسخة الاحتياطية من «أنا» مسوّدات هذا المختبر بنصّ واضح؛ احفظ الملفّ في مكان آمن."}
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
                      هل أمسح المسوّدة الظاهرة والدفتر المحفوظ لهذه التجربة؟ أغلق
                      التبويبات الأخرى أولاً. لا يمكن استرجاعهما بعد المسح.
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
