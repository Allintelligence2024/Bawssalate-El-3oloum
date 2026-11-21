// طبقة المدخل وحدها: لا نقرأ أي دفتر من المدخل أ أو الإصدار 1.3.
import { decode, empty, names } from "./model";
import type { Journal, Page, Writing } from "./model";
export const ENTRY_KEY = "boussole.bac.classe16.carnet.1";
export const promise = "تعلّم كيف تفهم سؤال البكالوريا وتبني إجابتك بكلماتك.";
export const steps = ["المطلوب", "السند", "الإجابة"] as const;
const fields: readonly Writing[] = [
  "solo",
  "link",
  "first",
  "events",
  "inhibit",
];
export type EntryBook = Journal & { recent: Writing[] };
export type Destination = { page: Page | "home"; draft: Writing | null };
export const newBook = (): EntryBook => ({ ...empty(), recent: [] });
const field = (v: unknown): v is Writing =>
  typeof v === "string" && fields.includes(v as Writing);
// معيار عرض زرّ الاستئناف فقط. نصّ التلميذ المحفوظ لا يُقصّ ولا يُطبّع.
export const hasInk = (v: string) =>
  /[^\s\p{Default_Ignorable_Code_Point}]/u.test(v);
function nonempty(j: Journal, order: readonly unknown[]): Writing[] {
  return [...new Set([...order, ...fields].filter(field))].filter((k) =>
    hasInk(j[k]),
  );
}
export function readBook(raw: string | null): EntryBook {
  const j = decode(raw);
  let order: unknown[] = [];
  if (raw) {
    try {
      const a = JSON.parse(raw);
      if (a?.version === 1 && Array.isArray(a.recent)) order = a.recent;
    } catch {
      /* دفتر تالف: نبدأ من صفحة سليمة. */
    }
  }
  return { ...j, recent: nonempty(j, order) };
}
export function edited(j: EntryBook, k: Writing, v: string): EntryBook {
  const next = { ...j, [k]: v };
  return { ...next, recent: nonempty(next, [k, ...j.recent]) };
}
export function latest(j: EntryBook): Writing | null {
  return nonempty(j, j.recent)[0] ?? null;
}
export const draftPage = (k: Writing): Page =>
  k === "solo" ? "solo" : k === "link" ? "doc2" : "answer";
export function destination(hash: string): Destination {
  const key = hash.replace(/^#/, "");
  if (key === "doc1-traces") return { page: "doc1", draft: null };
  if (key === "doc2-fig-a" || key === "doc2-fig-b")
    return { page: "doc2", draft: null };
  if (["answer-first", "answer-events", "answer-inhibit"].includes(key))
    return { page: "answer", draft: null };
  if (key.startsWith("draft-")) {
    const k = key.slice(6);
    if (field(k)) return { page: draftPage(k), draft: k };
  }
  return {
    page: Object.prototype.hasOwnProperty.call(names, key)
      ? (key as Page)
      : "home",
    draft: null,
  };
}
