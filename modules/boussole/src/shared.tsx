import { useEffect, useRef, useState } from "react";
import { Icon } from "./icons";
import type { Journal, Writing, Page } from "./model";
export type Tools = {
  notebook: Journal;
  write: (k: Writing, text: string) => void;
  help: (key: "soloHelp" | "docHelp") => void;
  saved: boolean;
};
export const Badge = ({
  children,
  gold = false,
}: {
  children: React.ReactNode;
  gold?: boolean;
}) => <span className={"badge" + (gold ? " gold" : "")}>{children}</span>;
export const LinkButton = ({
  page,
  children,
  kind = "action",
  icon = "back",
  id,
}: {
  page: Page | "home";
  children: React.ReactNode;
  kind?: string;
  icon?: string;
  id?: string;
}) => (
  <a className={kind} href={"#" + page} data-id={id}>
    {children}
    <Icon name={icon} />
  </a>
);
export const Back = () => (
  <LinkButton page="home" kind="backlink" icon="arrow">
    العودة إلى البداية
  </LinkButton>
);
export function Field({
  field,
  label,
  t,
  rows = 4,
}: {
  field: Writing;
  label: string;
  t: Tools;
  rows?: number;
}) {
  return (
    <div className="field">
      <label htmlFor={"txt-" + field}>{label}</label>
      <textarea
        id={"txt-" + field}
        rows={rows}
        value={t.notebook[field]}
        onChange={(e) => t.write(field, e.target.value)}
        dir="auto"
        placeholder="أكتب بكلماتي…"
      />
      <small>
        {t.saved
          ? "المسوّدة على هذا المتصفّح وليست محمية بالحساب. تسجيل الخروج لا يمسحها؛ لا تكتب بيانات شخصية على جهاز مشترك."
          : "لم يُؤكّد الحفظ. انسخ إجابتك أو نزّلها قبل إغلاق الجلسة."}
      </small>
    </div>
  );
}
export function Help({
  children,
  onUse,
  title = "أحتاج إلى مساعدة",
}: {
  children: React.ReactNode;
  onUse: () => void;
  title?: string;
}) {
  const [open, set] = useState(false);
  return (
    <div className="help">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => {
          if (!open) onUse();
          set(!open);
        }}
        className="textbtn"
      >
        <Icon name="bulb" />
        {open ? "أخفي المساعدة" : title}
      </button>
      {open && <div className="inset note">{children}</div>}
    </div>
  );
}
export function Picture({
  src,
  label,
  alt,
  description,
  large = false,
  dims,
}: {
  src: string;
  label: string;
  alt: string;
  description: string;
  large?: boolean;
  dims: [number, number];
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const [zoom, setZoom] = useState(false);
  useEffect(
    () => () => {
      dialog.current?.close();
    },
    [],
  );
  return (
    <figure className={"picture " + (large ? "largepic" : "")}>
      <div className="mount">
        <img src={src} alt={alt} width={dims[0]} height={dims[1]} />
      </div>
      <figcaption>{label}</figcaption>
      <button
        type="button"
        ref={opener}
        className="textbtn"
        onClick={() => {
          setZoom(false);
          dialog.current?.showModal();
        }}
      >
        <Icon name="eye" />
        تكبير الرسم<span className="sr">: {label}</span>
      </button>
      <details className="desc">
        <summary>وصف الرسم بالكلمات</summary>
        <p>{description}</p>
      </details>
      <dialog
        className="zoom"
        aria-label={label}
        ref={dialog}
        onClose={() => opener.current?.focus({ preventScroll: true })}
      >
        <header>
          <strong>{label}</strong>
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            className="soft"
          >
            <Icon name="close" />
            إغلاق
          </button>
        </header>
        <div className="zoomtools">
          <button
            aria-pressed={zoom}
            onClick={() => setZoom(!zoom)}
            className="soft"
          >
            {zoom ? "ملاءمة العرض" : "تكبير للتفاصيل"}
          </button>
          <small>
            {zoom ? "حرّك الرسم لرؤية الأطراف." : "يمكنك تكبير التفاصيل."}
          </small>
        </div>
        <div
          className={"pan " + (zoom ? "enlarged" : "")}
          tabIndex={0}
          role="region"
          aria-label="مساحة الرسم المكبّر"
        >
          <img src={src} alt={alt} width={dims[0]} height={dims[1]} />
        </div>
      </dialog>
    </figure>
  );
}
export function PrintButton() {
  return (
    <button
      type="button"
      className="soft printbtn"
      onClick={() => window.print()}
    >
      <Icon name="book" />
      أطبع ورقة فارغة
    </button>
  );
}

export function Rules({ count = 14 }: { count?: number }) {
  return (
    <div className="writinglines" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} />
      ))}
    </div>
  );
}
