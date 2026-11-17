// «أنا» — شارات المحتوى (P3.2): ما أُنجز فعلًا (جسور، استرجاعات، امتحانات، تحدّيات) والشارة التالية فقط.

import type { Etat } from '../types';
import { badgesAffiches } from '../utils/defis';
import { nb } from '../utils/dates';

export default function CarteBadges({ etat }: { etat: Etat }) {
  const { obtenus, prochains } = badgesAffiches(etat);
  return (
    <section className="card mt-5 p-5">
      <p className="eyebrow">شاراتي</p>
      <p className="mt-1 text-[11px] text-mute">شارات محتوى، لا ترتيب: تُحسب من جهازك ولا تُقارَن بأحد.</p>
      {obtenus.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {obtenus.map((b) => (
            <li key={b.id} className="chip border-sage bg-sage-soft/60 text-[11px] font-bold text-forest-deep" title={b.detail}>
              {b.nom}
            </li>
          ))}
        </ul>
      )}
      <ul className="mt-3 space-y-1.5">
        {prochains.map((b) => (
          <li key={b.id} className="flex items-baseline justify-between gap-3 text-xs">
            <span>
              <span className="font-bold">{b.nom}</span>
              <span className="text-mute"> · {b.detail}</span>
            </span>
            <span className="tnum shrink-0 text-mute">
              {nb(Math.min(b.valeur, b.seuil))}/{nb(b.seuil)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
