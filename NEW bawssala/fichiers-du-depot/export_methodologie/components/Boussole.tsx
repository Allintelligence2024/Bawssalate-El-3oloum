import { useEffect, useRef } from "react";

/** Le même document embarqué dans l'app, consultable et imprimable sans réseau externe. */
const LABO = "/boussole/index.html";
function Laboratoire() {
  const cadre = useRef<HTMLIFrameElement>(null);
  // Respecte le réglage de lecture de l'application dans le document indépendant.
  function taille() {
    const doc = cadre.current?.contentDocument;
    if (doc)
      doc.documentElement.style.fontSize = getComputedStyle(
        document.documentElement,
      ).fontSize;
  }
  useEffect(() => {
    const watch = new MutationObserver(taille);
    watch.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-taille"],
    });
    return () => watch.disconnect();
  }, []);
  return (
    <iframe
      ref={cadre}
      onLoad={taille}
      src={LABO}
      title="البوصلة · مختبر الفضول"
      data-boussole="labo"
      className="block min-h-0 w-full flex-1 border-0 bg-[#f7f7ef]"
    />
  );
}
export default function Boussole({ onAteliers }: { onAteliers: () => void }) {
  return (
    <section
      dir="rtl"
      aria-label="البوصلة"
      data-module="boussole"
      className="fixed inset-x-0 bottom-16 top-[4.25rem] z-10 flex flex-col bg-paper"
    >
      <Laboratoire />
      <div className="flex min-h-11 shrink-0 items-center justify-between gap-2 border-t border-line bg-surface px-3 text-xs text-ink-soft">
        <span>البوصلة · داخل التطبيق</span>
        <button
          type="button"
          onClick={onAteliers}
          className="min-h-11 px-2 font-bold text-primary underline underline-offset-4"
        >
          تمارين المنهجية الأخرى
        </button>
      </div>
    </section>
  );
}
/** Le vrai laboratoire remplace aussi l'ancienne aide. L'exercice reste monté et la
 * fermeture native du dialogue rend le focus au bouton déclencheur. */
export function AideBoussole({ onFermer }: { onFermer: () => void }) {
  const d = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = d.current;
    if (el && !el.open) el.showModal();
    return () => {
      if (el?.open) el.close();
    };
  }, []);
  return (
    <dialog
      ref={d}
      aria-label="البوصلة داخل التمرين"
      dir="rtl"
      onCancel={(e) => {
        e.preventDefault();
        onFermer();
      }}
      className="fixed inset-0 m-auto max-h-none w-[min(100%,70rem)] max-w-none border-0 bg-paper p-0 backdrop:bg-black/60"
    >
      <div className="flex h-[92dvh] flex-col">
        <div className="flex min-h-12 items-center justify-between gap-2 border-b border-line px-4">
          <b>البوصلة</b>
          <button
            type="button"
            autoFocus
            onClick={onFermer}
            className="btn btn-ghost min-h-11"
          >
            أعود إلى تمريني
          </button>
        </div>
        <Laboratoire />
      </div>
    </dialog>
  );
}
