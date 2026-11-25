// Trophées tactiques (v0.11) — les verbes de consigne réellement travaillés en 1-2-3.
//
// Ce n'est ni une note ni un classement : c'est la trace d'un travail par verbe. Un verbe
// jamais ouvert n'est pas une faiblesse, c'est simplement une porte encore fermée.

import type { Etat } from '../types';
import { nb } from '../utils/dates';
import { attenduDe } from '../data/methodologie/attenduVerbes';

export default function CarteTropheesTactiques({ etat }: { etat: Etat }) {
  const entrees = Object.entries(etat.trophees ?? {}).sort((a, b) => b[1].n - a[1].n);

  return (
    <section className="carte mb-4 p-4" aria-label="أوسمة الأفعال">
      <div className="rangee rangee--entre">
        <p className="oeil">أوسمة الأفعال · 1-2-3</p>
        <span className="mention mention--or tnum">{nb(entrees.length)} فعلًا</span>
      </div>

      {entrees.length === 0 ? (
        <p className="petit doux mt-2">
          ما زال ما فتحت ورشة 1-2-3. افتحها من «الباك» ← «البوصلة 1-2-3»: فعل واحد يكفي
          لتظهر أول وسام.
        </p>
      ) : (
        <ul className="mt-2 space-y-1.5">
          {entrees.map(([verbe, info]) => {
            const attendu = attenduDe(verbe);
            return (
              <li key={verbe} className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-ink">«{verbe}»</p>
                  {attendu && <p className="petit doux">{attendu.attendu}</p>}
                </div>
                <span className="mention mention--vert shrink-0 tnum">×{nb(info.n)}</span>
              </li>
            );
          })}
        </ul>
      )}

      <p className="petit doux mt-2">
        الوسام يعني «جرّبت هذا الفعل وركّبت جوابه» — لا يعني علامة، ولا يُقارن بأحد.
      </p>
    </section>
  );
}
