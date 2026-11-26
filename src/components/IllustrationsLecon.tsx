// Phase 2/3/4 — affichage des illustrations et schémas du programme dans le lecteur de
// leçon et dans la Phase 5 (« الدليل الوثائقي ») du ProtocoleRunner.
//
// Deux familles de visuels, une seule règle : l'image ne porte JAMAIS de texte généré.
//  - `webp_legacy` / `webp_annote` : image muette du manuel, légendes arabes rendues ici.
//  - `svg_vectoriel` : courbes et schémas géométriques exacts, dessinés à partir de données
//    (aucune hallucination possible : valeurs, unités et formules sont écrites à la main).
//
// Les fichiers ne sont pas précachés : `loading="lazy"` + cache à la volée du Service
// Worker à la première ouverture. L'URL passe toujours par `urlIllustration`, ce qui
// permet de basculer sur Cloudflare R2 sans toucher à ce composant.
//
// Le zoom plein écran est volontairement minimal : un bouton, la touche Échap, le focus
// rendu au déclencheur à la fermeture, et la légende arabe toujours visible sous l'image.

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  aDesAnnotations,
  illustrationsParLecon,
  typeVisuelDe,
  type IllustrationLecon,
} from '../data/illustrationsLecons';
import { legendeArSecurisee } from '../utils/illustrations';
import { SchemaAnnoteBloc, VisuelAnnote } from './SchemaAnnote';

interface Props {
  lessonId: string;
  /** Phase 5 du ProtocoleRunner : déjà dans une carte, on évite une carte imbriquée. */
  compacte?: boolean;
}

export default function IllustrationsLecon({ lessonId, compacte = false }: Props) {
  const illustrations = illustrationsParLecon(lessonId);
  const [zoom, setZoom] = useState<IllustrationLecon | null>(null);
  const boutonFermer = useRef<HTMLButtonElement>(null);
  const declencheur = useRef<HTMLButtonElement | null>(null);
  const dialogue = useRef<HTMLDivElement>(null);

  const fermer = useCallback(() => setZoom(null), []);

  useEffect(() => {
    if (!zoom) return;
    const overflowAvant = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    boutonFermer.current?.focus();

    // Piège de focus : Tab boucle sur les éléments focusables de la lightbox (fermeture,
    // bouton d'auto-test), sans jamais sortir vers la page en arrière-plan.
    const auClavier = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        fermer();
        return;
      }
      if (e.key !== 'Tab') return;
      const focusables = dialogue.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables || focusables.length === 0) return;
      const premier = focusables[0];
      const dernier = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === premier) {
        e.preventDefault();
        dernier.focus();
      } else if (!e.shiftKey && document.activeElement === dernier) {
        e.preventDefault();
        premier.focus();
      }
    };
    document.addEventListener('keydown', auClavier);
    return () => {
      document.removeEventListener('keydown', auClavier);
      document.body.style.overflow = overflowAvant;
      declencheur.current?.focus();
    };
  }, [zoom, fermer]);

  if (illustrations.length === 0) return null;

  const legende = (illustration: IllustrationLecon) =>
    legendeArSecurisee(illustration.legendeAr ?? illustration.titreAr);
  const contientSchemaCree = illustrations.some((i) => typeVisuelDe(i) !== 'webp_legacy');

  return (
    <section
      dir="rtl"
      aria-label="وثائق الدرس"
      className={compacte ? 'rounded-2xl border border-line p-3' : 'card p-4'}
    >
      <p className="eyebrow">وثائق الدرس ومخططاته</p>
      <p className="mt-1 text-[11px] leading-relaxed text-mute">
        صور محوّلة إلى WebP، محمّلة عند الحاجة فقط — اضغط على الصورة لتكبيرها (Esc للإغلاق) — في انتظار مراجعة أستاذ.
      </p>
      {contientSchemaCree && (
        <p className="mt-1 text-[11px] leading-relaxed text-mute">
          المخططات المُعادة الرسم: كل الأرقام والوحدات والعناوين مكتوبة داخل التطبيق باتجاه عربي سليم، ولا يوجد أي نص مولّد داخل الصورة.
        </p>
      )}

      <div className="mt-3 space-y-4">
        {illustrations.map((illustration) => (
          <figure
            key={illustration.id}
            dir="rtl"
            className="overflow-hidden rounded-2xl border border-line bg-paper"
          >
            {/* Fond neutre clair : les schémas ont des traits noirs, même en thème sombre.
                Un visuel annoté n'est PAS enveloppé dans un bouton : ses pastilles sont
                cliquables (HTML valide + navigation clavier naturelle). Le zoom a son
                propre bouton. */}
            {aDesAnnotations(illustration) ? (
              <div className="fond-schema-clair block w-full border-0 p-0">
                <SchemaAnnoteBloc illustration={illustration} compacte={compacte} />
              </div>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  declencheur.current = e.currentTarget;
                  setZoom(illustration);
                }}
                aria-label={`تكبير الوثيقة: ${illustration.titreAr}`}
                className="fond-schema-clair block w-full cursor-zoom-in border-0 p-0"
              >
                <VisuelAnnote illustration={illustration} />
              </button>
            )}
            <figcaption className="border-t border-line px-3 py-2 text-[12px] leading-relaxed text-ink-soft">
              <p dangerouslySetInnerHTML={{ __html: legende(illustration) }} />
              <div className="mt-1 flex justify-start">
                <button
                  type="button"
                  onClick={(e) => {
                    declencheur.current = e.currentTarget;
                    setZoom(illustration);
                  }}
                  aria-label={`تكبير الصورة: ${illustration.titreAr}`}
                  className="rounded-lg border border-line bg-paper px-2.5 py-1 text-[11px] font-bold text-forest hover:bg-sage-soft"
                >
                  تكبير الصورة
                </button>
              </div>
            </figcaption>
            {illustration.statut === 'a_valider_enseignant' && (
              <p className="border-t border-line bg-sage-soft px-3 py-1.5 text-[10px] font-bold text-forest">
                في انتظار مراجعة أستاذ · لم يُعتمد بعد
              </p>
            )}
          </figure>
        ))}
      </div>

      {zoom && (
        <div
          ref={dialogue}
          role="dialog"
          aria-modal="true"
          aria-label={`عرض مكبّر: ${zoom.titreAr}`}
          aria-describedby="legende-illustration-zoom"
          dir="rtl"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-black/85 p-3 sm:p-6"
          onClick={(e) => {
            if (e.target === e.currentTarget) fermer();
          }}
        >
          <button
            ref={boutonFermer}
            type="button"
            onClick={fermer}
            aria-label="إغلاق التكبير"
            className="fond-schema-clair absolute left-3 top-3 rounded-xl px-3 py-2 text-sm font-bold shadow-lg sm:left-6 sm:top-6"
          >
            ✕ إغلاق (Esc)
          </button>

          <div
            className="fond-schema-clair flex max-h-[78dvh] w-full max-w-5xl flex-col items-center justify-center overflow-auto rounded-2xl p-2 shadow-2xl"
          >
            {aDesAnnotations(zoom) ? (
              <SchemaAnnoteBloc illustration={zoom} compacte={compacte} variante="zoom" />
            ) : (
              <VisuelAnnote illustration={zoom} variante="zoom" />
            )}
          </div>

          <div
            id="legende-illustration-zoom"
            dir="rtl"
            className="fond-schema-clair w-full max-w-5xl rounded-xl px-4 py-3 text-center text-sm leading-relaxed shadow-lg"
          >
            <p dangerouslySetInnerHTML={{ __html: legende(zoom) }} />
          </div>
          <p className="fond-schema-clair rounded-lg px-3 py-1 text-[11px] font-bold">
            في انتظار مراجعة أستاذ · لم يُعتمد بعد
          </p>
        </div>
      )}
    </section>
  );
}
