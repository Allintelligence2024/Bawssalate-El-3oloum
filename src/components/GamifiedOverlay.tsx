// طبقة تقدّم خفيفة — شريط تقدّم XP أسفل الترويسة دون تغطية المحتوى.
// الشارة والملخّص يقعان في الترويسة (BaguetteXp).

import type { Etat } from '../types';
import { PALIERS, xpDe } from '../utils/xp';

interface Props {
  etat: Etat;
}

export default function GamifiedOverlay({ etat }: Props) {
  const xp = xpDe(etat);

  const nextPalier = PALIERS.find((p) => p.seuil > xp) ?? PALIERS[PALIERS.length - 1];
  const prevPalier = PALIERS.filter((p) => p.seuil <= xp).pop() ?? PALIERS[0];
  const range = nextPalier.seuil - prevPalier.seuil;
  const progressPourCent =
    range > 0 ? Math.min(100, Math.max(0, Math.floor(((xp - prevPalier.seuil) / range) * 100))) : 100;

  return (
    <div className="fixed left-0 right-0 top-16 z-30 h-1 bg-[var(--color-line)]" aria-hidden="true">
      <div
        className="h-full bg-gradient-to-r from-primary via-forest-deep to-primary transition-[width] duration-1000 ease-out"
        style={{ width: `${progressPourCent}%` }}
      />
    </div>
  );
}