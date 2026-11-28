// شريط هادئ لإعلام التلميذ بتوفّر تحديث جديد للتطبيق دون مقاطعة التمارين أو الامتحان التجريبي.

import { useEffect, useState } from 'react';
import { abonnerMiseAJourPwa, appliquerMiseAJourPwa } from '../utils/pwa';

interface Props {
  /** إخفاء الشريط أثناء التمارين الكاملة أو الامتحان التجريبي. */
  masque?: boolean;
}

export default function BandeauMiseAJourPwa({ masque = false }: Props) {
  const [disponible, setDisponible] = useState(false);
  const [reporte, setReporte] = useState(false);

  useEffect(() => abonnerMiseAJourPwa((ok) => {
    setDisponible(ok);
    if (ok) setReporte(false);
  }), []);

  if (!disponible || reporte || masque) return null;

  return (
    <aside
      dir="rtl"
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 bottom-20 z-40 mx-auto max-w-xl px-4 sm:bottom-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-line bg-paper px-4 py-3 shadow-lg">
        <p className="text-xs font-bold text-ink">
          يتوفّر تحديث جديد لتطبيق بوصلة العلوم.
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => { appliquerMiseAJourPwa(); }}
            className="btn btn-primary px-3 py-1.5 text-xs"
          >
            تحديث الآن
          </button>
          <button
            type="button"
            onClick={() => setReporte(true)}
            className="btn btn-ghost px-2.5 py-1.5 text-xs"
          >
            لاحقًا
          </button>
        </div>
      </div>
    </aside>
  );
}
