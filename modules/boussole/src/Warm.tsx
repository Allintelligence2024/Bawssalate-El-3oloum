import { useState, useEffect } from "react";
import { points, reading, warmPrompt } from "./model";
import { Badge, LinkButton } from "./shared";
import { Icon } from "./icons";
const x = (i: number) => 14 + i * 18.3,
  y = (v: number) => 83 - v * 8.35;
/** الإحداثيات نسبية، أمّا مساحة لمس النقطة فثابتة لا تصغر مع الرسم. */
export function Warm() {
  const [chosen, setChosen] = useState<number | null>(null);
  const fb = chosen === null ? null : reading(chosen);
  const pi = points.findIndex((p) => p[0] === chosen);
  useEffect(() => {
    if (chosen !== null)
      document
        .getElementById("warm-feedback")
        ?.scrollIntoView({ block: "nearest", behavior: "auto" });
  }, [chosen]);
  function pick(i: number) {
    setChosen(points[i][0]);
  }
  return (
    <>
      <div className="landing">
        <section className="primarywork">
          <div className="eyebrow">
            <i />
            الإنزيمات <span>／</span> قراءة منحنى
          </div>
          <h1 tabIndex={-1} id="screen-title">
            صحّح الإجابة
          </h1>
          <p className="prompt">
            <b>المطلوب</b> {warmPrompt}
          </p>
          <div className="reply">
            <span className="quote" aria-hidden="true">
              ”
            </span>
            <div>
              <span>إجابة تلميذ افتراضي</span>
              <strong>النشاط 8 وحدات اعتبارية.</strong>
            </div>
          </div>
          <section className="plotcard" aria-labelledby="plot-head">
            <header>
              <Badge>سند تدريبي</Badge>
              <h2 id="plot-head">اختر النقطة التي تجيب عن السؤال.</h2>
            </header>
            <div className="ordinate">النشاط (وحدة اعتبارية)</div>
            <div
              className="plot"
              role="group"
              aria-label="نقاط منحنى نشاط الإنزيم. المس نقطة أو اخترها بلوحة المفاتيح."
            >
              <svg
                aria-hidden="true"
                width="100%"
                height="100%"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="axes"
              >
                {Array.from({ length: 9 }, (_, v) => (
                  <line
                    key={v}
                    x1="9"
                    x2="93"
                    y1={y(v)}
                    y2={y(v)}
                    className={v % 2 === 0 ? "gridline" : "minorline"}
                  />
                ))}
                <path d={"M9,8 V83 H94"} className="axis" />
                {pi >= 0 && (
                  <path
                    d={`M9,${y(points[pi][1])} H${x(pi)} V83`}
                    className="guideline"
                  />
                )}
                <polyline
                  points={points.map((p, i) => `${x(i)},${y(p[1])}`).join(" ")}
                  className="curve"
                />
              </svg>
              {Array.from({ length: 9 }, (_, v) => (
                <span key={v} className={"tick yt yt" + v} aria-hidden="true">
                  {v}
                </span>
              ))}
              {points.map(([ph, activity], i) => (
                <div key={ph} className="plotitem">
                  <span className={"tick xt px" + i} aria-hidden="true">
                    {ph}
                  </span>
                  <button
                    className={
                      "dot px" +
                      i +
                      " py" +
                      activity +
                      (chosen === ph ? " selected" : "")
                    }
                    data-id={"point-" + ph}
                    aria-label={`درجة الحموضة ${ph}، النشاط ${activity} ${activity === 1 ? "وحدة اعتبارية" : "وحدات اعتبارية"}`}
                    aria-pressed={chosen === ph}
                    onClick={() => pick(i)}
                  >
                    <span />
                  </button>
                </div>
              ))}
            </div>
            <div className="abscissa">درجة الحموضة</div>
            <div aria-live="polite" aria-atomic="true" id="warm-feedback">
              {fb && (
                <div className={"feedback " + (fb.right ? "good" : "again")}>
                  <Icon name={fb.right ? "check" : "pin"} />
                  <div>
                    <strong>{fb.title}</strong>
                    <p>{fb.body}</p>
                  </div>
                </div>
              )}
            </div>
            {fb?.right && (
              <div className="afterread">
                <LinkButton page="solo">أطبّق على سند آخر</LinkButton>
                <button className="textbtn" onClick={() => setChosen(null)}>
                  أعيد المحاولة
                </button>
              </div>
            )}
            <details className="numbers">
              <summary>
                <Icon name="table" /> أعرض النقاط في جدول
              </summary>
              <table>
                <caption>نشاط الإنزيم نفسه في درجة حرارة ثابتة</caption>
                <thead>
                  <tr>
                    <th scope="col">درجة الحموضة</th>
                    <th scope="col">النشاط (وحدة اعتبارية)</th>
                    <th scope="col">اختيار النقطة</th>
                  </tr>
                </thead>
                <tbody>
                  {points.map(([ph, activity], i) => (
                    <tr key={ph}>
                      <td>{ph}</td>
                      <td>{activity}</td>
                      <td>
                        <button
                          className="soft"
                          aria-label={"أختار نقطة درجة الحموضة " + ph}
                          onClick={() => pick(i)}
                        >
                          أختار
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </details>
          </section>
        </section>
        <aside className="other">
          <div className="sideintro">
            <i /> <span>مساران آخران</span>
          </div>
          <div className="tile">
            <Icon name="pen" size={25} />
            <h2>أجرّب بمفردي</h2>
            <p>وثيقة أخرى وسؤال قصير. أكتب على ورقتي قبل أن أقارن.</p>
            <LinkButton page="solo" kind="tilelink" id="tile-solo">
              أفتح المحاولة المستقلة
            </LinkButton>
          </div>
          <div className="tile dark">
            <Badge gold>بكالوريا 2022</Badge>
            <h2>من الوثائق إلى الإجابة</h2>
            <p>أستعمل تسجيلات المشابك ورسومها لأجيب عن التمرين الثاني.</p>
            <LinkButton page="doc1" kind="tilelink" id="open-dossier">
              أفتح تمرين البكالوريا
            </LinkButton>
          </div>
        </aside>
      </div>
    </>
  );
}
