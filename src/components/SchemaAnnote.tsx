// Affichage « zéro texte IA » : l'image (WebP muet ou SVG vectoriel) reste intacte, et
// toutes les inscriptions pédagogiques sont posées par l'application.
//
// Deux pièces, volontairement séparées (et volontairement en contenu « phrasing » pour
// pouvoir vivre dans le bouton de zoom sans HTML invalide) :
//   - `VisuelAnnote`      : l'image + les pastilles numérotées aux coordonnées (x %, y %).
//   - `LegendeAnnotations`: la liste ordonnée des termes arabes, sous l'image, en RTL.
//
// Les coordonnées sont relatives à la boîte de l'image : elles restent justes à toutes les
// largeurs (responsive) et dans le zoom plein écran, sans recalcul ni JavaScript de mesure.

import type { AnnotationSchema, IllustrationLecon } from '../data/illustrationsLecons';
import { urlIllustration } from '../utils/illustrations';

type Variante = 'lecture' | 'zoom';

function pastilles(annotations: AnnotationSchema[]): AnnotationSchema[] {
  return [...annotations].sort((a, b) => a.num - b.num);
}

/** Pastille : un chiffre lisible, jamais un glyphe décoratif (rendu identique partout). */
function stylePastille(variante: Variante): string {
  const base =
    'absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full ' +
    'border-2 border-white bg-forest font-bold text-white shadow-md ring-1 ring-forest/40';
  return variante === 'zoom'
    ? `${base} h-7 w-7 text-[13px] sm:h-8 sm:w-8 sm:text-sm`
    : `${base} h-6 w-6 text-[11px] sm:h-7 sm:w-7 sm:text-xs`;
}

interface VisuelProps {
  illustration: IllustrationLecon;
  variante?: Variante;
}

/**
 * L'image seule et ses pastilles. `aria-hidden` sur le calque : un lecteur d'écran
 * annonce la liste ordonnée sous la figure, pas des numéros flottants.
 */
export function VisuelAnnote({ illustration, variante = 'lecture' }: VisuelProps) {
  const annotations = pastilles(illustration.annotations ?? []);
  const zoom = variante === 'zoom';
  return (
    <span className="relative inline-flex max-w-full">
      <img
        src={urlIllustration(illustration.fichier)}
        alt={illustration.altAr}
        width={illustration.largeur}
        height={illustration.hauteur}
        loading="lazy"
        decoding="async"
        className={
          zoom
            ? 'fond-schema-clair block h-auto max-h-[74dvh] w-auto max-w-full object-contain'
            : 'fond-schema-clair block h-auto w-full object-contain'
        }
      />
      {annotations.length > 0 && (
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 block">
          {annotations.map((a) => (
            <span
              key={a.num}
              style={{ left: `${a.x}%`, top: `${a.y}%` }}
              className={stylePastille(variante)}
            >
              {a.num}
            </span>
          ))}
        </span>
      )}
    </span>
  );
}

interface LegendeProps {
  illustration: IllustrationLecon;
  compacte?: boolean;
}

/** Liste numérotée arabe (RTL) : le terme officiel, puis une précision facultative. */
export function LegendeAnnotations({ illustration, compacte = false }: LegendeProps) {
  const annotations = pastilles(illustration.annotations ?? []);
  if (annotations.length === 0) return null;
  return (
    <ol
      dir="rtl"
      aria-label="مفتاح المخطط"
      className={
        compacte
          ? 'mt-2 grid gap-x-4 gap-y-1.5 sm:grid-cols-2'
          : 'mt-2 grid gap-x-5 gap-y-1.5 sm:grid-cols-2'
      }
    >
      {annotations.map((a) => (
        <li key={a.num} className="flex items-start gap-2 text-[12px] leading-relaxed text-ink-soft">
          <span
            aria-hidden="true"
            className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-forest text-[11px] font-bold text-white"
          >
            {a.num}
          </span>
          <span>
            <span className="font-semibold text-ink">{a.labelAr}</span>
            {a.detailAr ? (
              <>
                {' — '}
                <span className="text-mute">{a.detailAr}</span>
              </>
            ) : null}
          </span>
        </li>
      ))}
    </ol>
  );
}
