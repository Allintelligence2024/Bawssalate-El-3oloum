// طبقة المدخل وحدها: لا نقرأ أي دفتر من المدخل أ أو الإصدار 1.3.
import { decode, empty, names } from "./model";
import type { Journal, Page, Writing } from "./model";
export const ENTRY_KEY = "boussole.bac.classe16.carnet.1";
// Le journal est commun avec Lite : tant qu'il existe, une restauration peut
// rejouer le carnet. Ne pas écrire ni promettre sa suppression entre-temps.
export const RESTORE_KEY = "murajih_restauration_v1";
export const restorationPending = () => localStorage.getItem(RESTORE_KEY) !== null;
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

/** Valide le format partagé avec la sauvegarde de l'application, sans perdre de texte.
 * Un format inconnu ou endommagé ne doit jamais être remplacé silencieusement. */
export function parseBook(value: unknown): EntryBook | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const v = value as Record<string, unknown>;
  const allowed = new Set(["version", ...fields, "soloHelp", "docHelp", "recent"]);
  if (Object.keys(v).some((key) => !allowed.has(key)) || v.version !== 1) return null;
  if (fields.some((key) => typeof v[key] !== "string" || (v[key] as string).length > 5 * 1024 * 1024)) return null;
  if (typeof v.soloHelp !== "boolean" || typeof v.docHelp !== "boolean") return null;
  if (v.recent !== undefined && (!Array.isArray(v.recent) || v.recent.length > fields.length || !v.recent.every(field))) return null;
  const journal: Journal = {
    version: 1,
    solo: v.solo as string,
    link: v.link as string,
    first: v.first as string,
    events: v.events as string,
    inhibit: v.inhibit as string,
    soloHelp: v.soloHelp,
    docHelp: v.docHelp,
  };
  return { ...journal, recent: nonempty(journal, (v.recent as Writing[] | undefined) ?? []) };
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
