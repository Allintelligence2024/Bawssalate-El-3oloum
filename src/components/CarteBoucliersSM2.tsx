// Boucliers de régularité (v0.11) — carte sœur du dashboard أنا.
//
// Un bouclier n'est pas une série à ne pas casser : il est **acquis** (4 jours sur les 7
// derniers), il ne se perd pas, et il autorise un jour de repos. Aucun compteur anxiogène,
// aucune comparaison, aucune promesse de note.

import type { Etat } from '../types';
import { nb } from '../utils/dates';
import { BOUCLIERS_MAX, SEUIL_BOUCLIER, boucliers } from '../utils/evenements';

export default function CarteBoucliersSM2({ etat }: { etat: Etat }) {
  const { acquis, jours } = boucliers(etat);

  return (
    <section className="carte mb-4 p-4" aria-label="دروع الانتظام">
      <div className="rangee rangee--entre">
        <p className="oeil">دروع الانتظام</p>
        <span className="mention mention--vert tnum">
          {nb(acquis)} من {nb(BOUCLIERS_MAX)}
        </span>
      </div>

      <div className="mt-2 flex items-center gap-2" aria-hidden>
        {Array.from({ length: BOUCLIERS_MAX }, (_, i) => (
          <span
            key={i}
            className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-black ${
              i < acquis ? 'border-forest bg-forest text-paper' : 'border-dashed border-line text-mute'
            }`}
          >
            {i < acquis ? '✓' : '·'}
          </span>
        ))}
      </div>

      <p className="petit doux mt-2 tnum">
        {nb(jours)} من آخر {nb(7)} أيام نشاط — {SEUIL_BOUCLIER} أيام تعطي درعًا، والدرع لا يضيع.
      </p>
      <p className="petit doux mt-1">
        توقف يومًا؟ ما يقع والو: الراحة جزء من التثبيت، والمهمّة تعود غدًا.
      </p>
    </section>
  );
}
