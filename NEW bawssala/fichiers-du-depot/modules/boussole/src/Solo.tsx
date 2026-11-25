import { useState } from "react";
import { solo } from "./model";
import {
  Rules,
  Back,
  Badge,
  Field,
  Help,
  LinkButton,
  PrintButton,
} from "./shared";
import type { Tools } from "./shared";
import { Icon } from "./icons";
export function SoloTable() {
  return (
    <table className="solo-table">
      <caption>قياسات تدريبية لتركيز أجسام مضادّة نوعيّة بعد التلقيح</caption>
      <thead>
        <tr>
          <th scope="col">اليوم بعد التلقيح</th>
          <th scope="col">التركيز (وحدة اعتبارية)</th>
        </tr>
      </thead>
      <tbody>
        {solo.days.map((d, i) => (
          <tr key={d}>
            <th scope="row">{d}</th>
            <td>{solo.levels[i]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
export function Solo({ t }: { t: Tools }) {
  const [compare, setCompare] = useState(false);
  const [edit, setEdit] = useState(Boolean(t.notebook.solo));
  return (
    <div className="narrow">
      <Back />
      <div className="eyebrow">
        <i /> المناعة <span>／</span> محاولة مستقلة
      </div>
      <h1 id="screen-title" tabIndex={-1}>
        أجرّب بمفردي
      </h1>
      <p className="lead">
        خذ ورقة وقلماً. لا تحتاج إلى اختيار جواب على الشاشة.
      </p>
      <section className="paper">
        <div className="cardhead">
          <Badge>سند تدريبي</Badge>
          <span>وثيقة جديدة</span>
        </div>
        <h2>الأجسام المضادّة بعد التلقيح</h2>
        <SoloTable />
        <p className="task">
          <strong>المطلوب</strong>
          {solo.question}
        </p>
      </section>
      <div className="writebar">
        <button
          className="action"
          data-id="solo-compare"
          aria-expanded={compare}
          onClick={() => setCompare(!compare)}
        >
          <Icon name="compare" />
          {compare ? "أخفي المقارنة" : "كتبت إجابتي، أقارن الآن"}
        </button>
        <PrintButton />
      </div>
      {compare && (
        <div className="feedback good" data-id="solo-ref">
          <Icon name="book" />
          <div>
            <strong>إجابة ممكنة</strong>
            <p>{solo.reference}</p>
            <p>
              تحقّق من اليوم، والقيمة، والوحدة. لا يلزم أن تطابق عبارتك هذه
              الصياغة.
            </p>
          </div>
        </div>
      )}
      <div className="extras">
        <button
          type="button"
          data-id="solo-edit"
          className="textbtn"
          aria-expanded={edit}
          onClick={() => setEdit(!edit)}
        >
          <Icon name="pen" />
          {edit ? "أطوي مسوّدتي" : "أكتب هنا بدل الورق"}
        </button>
        {edit && <Field field="solo" label="مسوّدة إجابتي" t={t} />}
        <Help onUse={() => t.help("soloHelp")}>
          <p>
            ابحث عن اليوم المطلوب، ثم اقرأ الخانة المقابلة له. أين كُتبت وحدة
            القياس؟
          </p>
        </Help>
      </div>
      <div className="footpath">
        <span>أنتقل إلى تمرين فيه وثيقتان</span>
        <LinkButton page="doc1" kind="tilelink">
          من الوثائق إلى الإجابة
        </LinkButton>
      </div>
    </div>
  );
}
export function SoloPrint() {
  return (
    <>
      <p>بوصلة العلوم · سند تدريبي</p>
      <h1>محاولة مستقلة | الأجسام المضادّة</h1>
      <SoloTable />
      <p>
        <strong>المطلوب: </strong>
        {solo.question}
      </p>
      <Rules />
    </>
  );
}
