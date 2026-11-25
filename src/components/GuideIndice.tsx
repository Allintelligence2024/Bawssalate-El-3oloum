// « تلميح المرشد » — une seule ligne, ouverte à la demande.
//
// Règle tenue : un indice n'est jamais la réponse. Il nomme ce qu'il faut regarder (le verbe,
// le témoin, un mot absolu dans un piège). Il n'ajoute ni point ni pénalité, et le refermer
// ne change rien à l'état de l'élève.

import { useState } from 'react';
import { IcoAide } from './Icones';
import type { HumeurGuide } from './MascotteKunz';

interface Props {
  indice: string;
  /** Humour du guide quand l'indice est ouvert (défaut : réflexion). */
  humeur?: Extract<HumeurGuide, 'reflexion' | 'piege'>;
  libelle?: string;
  className?: string;
}

export default function GuideIndice({
  indice,
  humeur = 'reflexion',
  libelle = 'تلميح المرشد',
  className = 'mt-3',
}: Props) {
  const [ouvert, setOuvert] = useState(false);
  return (
    <div dir="rtl" className={className}>
      <button
        type="button"
        className="btn-mini w-full"
        aria-expanded={ouvert}
        onClick={() => setOuvert((v) => !v)}
      >
        <span className="inline-block h-3.5 w-3.5 align-[-2px]">
          <IcoAide />
        </span>{' '}
        {ouvert ? 'اخفِ التلميح' : libelle}
      </button>
      {ouvert && (
        <p
          role="status"
          className={`mt-2 rounded-xl border px-3 py-2 text-xs font-bold leading-relaxed ${
            humeur === 'piege'
              ? 'border-gold-soft bg-gold-soft/50 text-forest-deep'
              : 'border-line bg-bg text-ink-soft'
          }`}
        >
          {indice}
        </p>
      )}
    </div>
  );
}
