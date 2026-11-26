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
// Le calque de coordonnées porte `dir="ltr"` : `left`/`top` restent des propriétés physiques
// même sous RTL parent, ce qui rend le placement prévisible dans tous les navigateurs.
//
// Interactions (facultatives, pilotées par le parent via `actif` / `onActif`) :
//   - survol ou clic d'une pastille → la ligne de légende correspondante est surlignée ;
//   - survol ou clic d'une ligne de légende → la pastille correspondante est agrandie ;
//   - `numerosVisibles = false` masque les pastilles : mode auto-test « ماذا يمثّل هذا الجزء ؟ ».

import { useCallback, useId, useState } from 'react';
import type { AnnotationSchema, IllustrationLecon } from '../data/illustrationsLecons';
import { urlIllustration } from '../utils/illustrations';

type Variante = 'lecture' | 'zoom';

/** Numéro actif partagé entre le visuel et sa légende. */
export type AnnotationActive = (num: number | null) => void;

function pastilles(annotations: AnnotationSchema[]): AnnotationSchema[] {
  return [...annotations].sort((a, b) => a.num - b.num);
}

/** Pastille : un chiffre lisible, jamais un glyphe décoratif (rendu identique partout). */
function stylePastille(variante: Variante, surlignee: boolean): string {
  const base =
    'absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full ' +
    'border-2 border-white bg-forest font-bold text-white shadow-md ring-1 ring-forest/40 ' +
    'transition-transform duration-150';
  const taille =
    variante === 'zoom'
      ? 'h-7 w-7 text-[13px] sm:h-8 sm:w-8 sm:text-sm'
      : 'h-6 w-6 text-[11px] sm:h-7 sm:w-7 sm:text-xs';
  return `${base} ${taille} ${surlignee ? 'scale-125 ring-2 ring-forest' : ''}`;
}

interface VisuelProps {
  illustration: IllustrationLecon;
  variante?: Variante;
  /** Numéro mis en avant par la légende (survol/clic). */
  actif?: number | null;
  /** Signale un survol/clic sur une pastille. */
  onActif?: AnnotationActive;
  /** false = mode auto-test : les pastilles disparaissent, la légende reste. */
  numerosVisibles?: boolean;
}

/**
 * L'image seule et ses pastilles. `aria-hidden` sur le calque : un lecteur d'écran
 * annonce la liste ordonnée sous la figure, pas des numéros flottants.
 */
export function VisuelAnnote({
  illustration,
  variante = 'lecture',
  actif = null,
  onActif,
  numerosVisibles = true,
}: VisuelProps) {
  const annotations = pastilles(illustration.annotations ?? []);
  const zoom = variante === 'zoom';
  const interactif = typeof onActif === 'function';

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
      {annotations.length > 0 && numerosVisibles && (
        <span dir="ltr" aria-hidden="true" className="pointer-events-none absolute inset-0 block">
          {annotations.map((a) => (
            <span
              key={a.num}
              style={{ left: `${a.x}%`, top: `${a.y}%` }}
              className={`${stylePastille(variante, actif === a.num)} ${interactif ? 'pointer-events-auto cursor-pointer' : ''}`}
              onMouseEnter={interactif ? () => onActif!(a.num) : undefined}
              onMouseLeave={interactif ? () => onActif!(null) : undefined}
              onClick={
                interactif
                  ? (e) => {
                      e.stopPropagation();
                      onActif!(a.num);
                    }
                  : undefined
              }
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
  actif?: number | null;
  onActif?: AnnotationActive;
}

/** Liste numérotée arabe (RTL) : le terme officiel, puis une précision facultative. */
export function LegendeAnnotations({
  illustration,
  compacte = false,
  actif = null,
  onActif,
}: LegendeProps) {
  const annotations = pastilles(illustration.annotations ?? []);
  const interactif = typeof onActif === 'function';
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
      {annotations.map((a) => {
        const surlignee = actif === a.num;
        return (
          <li
            key={a.num}
            onMouseEnter={interactif ? () => onActif!(a.num) : undefined}
            onMouseLeave={interactif ? () => onActif!(null) : undefined}
            className={`flex items-start gap-2 rounded-lg px-1.5 py-0.5 text-[12px] leading-relaxed text-ink-soft ${
              surlignee ? 'bg-sage-soft' : ''
            }`}
          >
            <span
              aria-hidden="true"
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ${
                surlignee ? 'bg-forest ring-2 ring-forest/30' : 'bg-forest'
              }`}
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
        );
      })}
    </ol>
  );
}

interface BlocProps {
  illustration: IllustrationLecon;
  compacte?: boolean;
  /** `zoom` = pastilles plus grandes et image plafonnée en hauteur (lightbox). */
  variante?: Variante;
}

/**
 * Le bloc complet utilisé par le lecteur : image + pastilles, bouton d'auto-test,
 * puis la légende liée aux pastilles (survol/clic dans les deux sens).
 */
export function SchemaAnnoteBloc({ illustration, compacte = false, variante = 'lecture' }: BlocProps) {
  const [actif, setActif] = useState<number | null>(null);
  const [visibles, setVisibles] = useState(true);
  const id = useId();
  const annotations = illustration.annotations ?? [];
  const surActif = useCallback<AnnotationActive>((n) => setActif(n), []);

  if (annotations.length === 0) {
    return <VisuelAnnote illustration={illustration} />;
  }

  return (
    <div>
      <VisuelAnnote
        illustration={illustration}
        variante={variante}
        actif={actif}
        onActif={surActif}
        numerosVisibles={visibles}
      />
      <div dir="rtl" className="mt-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          aria-pressed={!visibles}
          aria-describedby={`${id}-aide`}
          onClick={() => setVisibles((v) => !v)}
          className="rounded-lg border border-line bg-paper px-2.5 py-1 text-[11px] font-bold text-forest hover:bg-sage-soft"
        >
          {visibles ? 'إخفاء الأرقام (وضع الاختبار)' : 'إظهار الأرقام'}
        </button>
        <span id={`${id}-aide`} className="text-[10px] leading-relaxed text-mute">
          مرّر أو اضغط على رقم أو على سطر المفتاح لإبراز العنصر المقابل.
        </span>
      </div>
      <LegendeAnnotations
        illustration={illustration}
        compacte={compacte}
        actif={actif}
        onActif={surActif}
      />
    </div>
  );
}
