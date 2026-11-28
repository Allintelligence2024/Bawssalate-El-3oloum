import { useEffect, useRef } from "react";
import { fermerDialogue, ouvrirDialogue } from '../utils/dialogue';
import type { BoussoleAttemptEvent } from "../types/boussoleBridge";
import type { Etat } from "../types";
import { useBoussoleBridge } from "../hooks/useBoussoleBridge";
import TiroirBoussole, { type OngletTiroir } from "./TiroirBoussole";

import { IcoBoussole, IcoRetour } from "./Icones";

/** Le même document embarqué dans l'app, consultable et imprimable sans réseau externe. */
const LABO = "/boussole/index.html";

const STYLE_EMBED = `
  .atlas-brand { display: none !important; }
  .atlas-headin {
    min-height: 48px !important;
    padding-block: 4px !important;
    width: min(calc(100% - 24px), 1100px) !important;
    gap: 10px !important;
  }
  .atlas-shell, .atlas-colophon > div {
    width: min(calc(100% - 24px), 1100px) !important;
  }
  .atlas-topnav {
    gap: 14px !important;
    flex-wrap: wrap !important;
  }
  @media (max-width: 640px) {
    .atlas-headin {
      flex-wrap: wrap !important;
      justify-content: center !important;
      padding-block: 6px !important;
    }
    .atlas-topnav {
      gap: 10px !important;
      justify-content: center !important;
    }
  }
`;

function nettoyerLibellesLabo(doc: Document): void {
  const remplacements: [string, string][] = [
    ["موضوع الباك", "الوثائق والتطبيق"],
    ["في موضوع الباك", "في الوثيقة التجريبية"],
    ["ورقة الباك", "ورقة الإجابة"],
    ["بكالوريا 2022 - ", "نموذج تجريبي · "],
  ];
  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
  let node: Node | null = walker.nextNode();
  while (node) {
    const val = node.nodeValue;
    if (val) {
      let next = val;
      for (const [de, vers] of remplacements) {
        if (next.includes(de)) next = next.replaceAll(de, vers);
      }
      if (next !== val) node.nodeValue = next;
    }
    node = walker.nextNode();
  }
}

function Laboratoire({
  hash = '',
  onBoussoleEvent,
}: {
  hash?: '#explore-protein' | '';
  onBoussoleEvent?: (evt: BoussoleAttemptEvent) => void;
}) {
  const cadre = useRef<HTMLIFrameElement>(null);
  const obsRef = useRef<MutationObserver | null>(null);
  useBoussoleBridge(cadre, onBoussoleEvent);

  function appliquerAdaptation() {
    const doc = cadre.current?.contentDocument;
    if (!doc) return;
    doc.documentElement.style.fontSize = getComputedStyle(
      document.documentElement,
    ).fontSize;
    if (!doc.getElementById("kunz-embed-fix")) {
      const style = doc.createElement("style");
      style.id = "kunz-embed-fix";
      style.textContent = STYLE_EMBED;
      doc.head.appendChild(style);
    }
    if (doc.body) {
      nettoyerLibellesLabo(doc);
      obsRef.current?.disconnect();
      const obs = new MutationObserver(() => {
        nettoyerLibellesLabo(doc);
      });
      obs.observe(doc.body, { childList: true, subtree: true });
      obsRef.current = obs;
    }
  }

  useEffect(() => {
    const watch = new MutationObserver(appliquerAdaptation);
    watch.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-taille"],
    });
    return () => {
      watch.disconnect();
      obsRef.current?.disconnect();
    };
  }, []);

  return (
    <iframe
      ref={cadre}
      onLoad={appliquerAdaptation}
      src={`${LABO}${hash}`}
      title="البوصلة · مختبر الفضول"
      data-boussole="labo"
      sandbox="allow-scripts allow-same-origin allow-modals allow-popups"
      className="block min-h-0 w-full flex-1 border-0 bg-[#f7f7ef]"
    />
  );
}

export default function Boussole({
  onFermer,
  onAteliers,
  onUltimes,
  onBoussoleEvent,
}: {
  onFermer?: () => void;
  onAteliers: () => void;
  onUltimes?: () => void;
  onBoussoleEvent?: (evt: BoussoleAttemptEvent) => void;
}) {
  return (
    <section
      dir="rtl"
      aria-label="مختبر الفضول"
      data-module="boussole"
      className="fixed inset-0 z-50 flex flex-col bg-[#f7f7ef]"
    >
      <header className="flex min-h-13 shrink-0 items-center justify-between gap-2 border-b border-line bg-surface px-3 py-1.5 sm:px-5">
        <div className="flex items-center gap-2 min-w-0">
          {onFermer && (
            <button
              type="button"
              onClick={onFermer}
              aria-label="رجوع إلى تدريباتي"
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-line bg-paper px-3 text-xs font-extrabold text-ink-soft transition-colors hover:border-forest hover:text-forest"
            >
              <span className="block h-4 w-4" aria-hidden="true">
                <IcoRetour />
              </span>
              <span>رجوع</span>
            </button>
          )}
          <div className="flex items-center gap-2 min-w-0">
            <span className="hidden h-7 w-7 shrink-0 place-items-center rounded-lg bg-forest text-paper sm:grid" aria-hidden="true">
              <span className="block h-4 w-4">
                <IcoBoussole />
              </span>
            </span>
            <h1 className="font-naskh truncate text-sm font-black text-ink sm:text-base">
              مختبر الفضول
            </h1>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {onUltimes && (
            <button
              type="button"
              onClick={onUltimes}
              className="min-h-[40px] rounded-xl bg-forest px-3 text-xs font-extrabold text-paper transition-opacity hover:opacity-90"
            >
              التمارين القصوى
            </button>
          )}
          <button
            type="button"
            onClick={onAteliers}
            className="min-h-[40px] rounded-xl border border-line bg-paper px-3 text-xs font-extrabold text-forest transition-colors hover:border-forest"
          >
            تمارين المنهجية
          </button>
        </div>
      </header>
      <Laboratoire onBoussoleEvent={onBoussoleEvent} />
    </section>
  );
}
/** Le vrai laboratoire remplace aussi l'ancienne aide. L'exercice reste monté et la
 * fermeture native du dialogue rend le focus au bouton déclencheur. */
export function AideBoussole({
  onFermer,
  document,
  verbe,
  onBoussoleEvent,
  etat,
  lessonId,
  ongletInitial,
}: {
  onFermer: () => void;
  document: string;
  verbe: string;
  onBoussoleEvent?: (evt: BoussoleAttemptEvent) => void;
  /** État de l'élève : sert uniquement à montrer les cartes de leçons gagnées. */
  etat?: Etat;
  lessonId?: string;
  ongletInitial?: OngletTiroir;
}) {
  const d = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = d.current;
    ouvrirDialogue(el);
    return () => {
      fermerDialogue(el);
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
        <TiroirBoussole
          document={document}
          verbe={verbe}
          lessonId={lessonId}
          etat={etat}
          ongletInitial={ongletInitial}
          onFermer={onFermer}
          renduLabo={
            <div className="flex h-[62dvh] flex-col">
              <p className="petit doux mb-2">
                المختبر يشرح بمثال من تركيب البروتين، وليس حلّ تمرينك. لاحظ الدليل ثم ارجع وطبّق
                الفعل على سندك.
              </p>
              <Laboratoire hash="#explore-protein" onBoussoleEvent={onBoussoleEvent} />
            </div>
          }
        />
      </div>
    </dialog>
  );
}
