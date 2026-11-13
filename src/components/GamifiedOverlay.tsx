// طبقة ترفيهية خفيفة — شريط تقدّم XP أسفل الترويسة + تصفيق عند النجاح + أصوات مشتركة.
// الشارة والملخّص يقعان في الترويسة (BaguetteXp) — هنا لا شيء يغطي المحتوى.

import { useEffect, useRef, useState } from 'react';
import type { Etat } from '../types';
import { PALIERS, xpDe } from '../utils/xp';
import { sonJuste, sonFaux, sonApplaudissement } from '../utils/son';

interface Props {
  etat: Etat;
  onJuste?: () => void;
  onFaux?: () => void;
  onApplaudir?: () => void;
}

export default function GamifiedOverlay({
  etat,
  onJuste,
  onFaux,
  onApplaudir,
}: Props) {
  const xp = xpDe(etat);
  const [confetti, setConfetti] = useState(0);
  const audioRef = useRef<AudioContext | null>(null);

  // تشغيل أصوات النجاح والخطأ والتصفيق عند استدعاء من المكونات الأخرى
  useEffect(() => {
    let h: (() => void) | undefined;
    if (onJuste) h = () => sonJuste();
    if (h) (window as any).__kunz_son_juste = h;
    return () => { if ((window as any).__kunz_son_juste === h) delete (window as any).__kunz_son_juste; };
  }, [onJuste]);

  useEffect(() => {
    let h: (() => void) | undefined;
    if (onFaux) h = () => sonFaux();
    if (h) (window as any).__kunz_son_faux = h;
    return () => { if ((window as any).__kunz_son_faux === h) delete (window as any).__kunz_son_faux; };
  }, [onFaux]);

  useEffect(() => {
    let h: (() => void) | undefined;
    if (onApplaudir) h = () => sonApplaudissement();
    if (h) (window as any).__kunz_son_applaudir = h;
    return () => { if ((window as any).__kunz_son_applaudir === h) delete (window as any).__kunz_son_applaudir; };
  }, [onApplaudir]);

  // تشغيل تصفيق عند تغيير confetti
  useEffect(() => {
    if (confetti > 0) {
      sonApplaudissement();
      const t = setTimeout(() => setConfetti(0), 3000);
      return () => clearTimeout(t);
    }
  }, [confetti]);

  const activerConfetti = () => setConfetti((c) => c + 1);

  const nextPalier = PALIERS.find((p) => p.seuil > xp) ?? PALIERS[PALIERS.length - 1];
  const prevPalier = PALIERS.filter((p) => p.seuil <= xp).pop() ?? PALIERS[0];
  const range = nextPalier.seuil - prevPalier.seuil;
  const progressPourCent = range > 0 ? Math.min(100, Math.floor(((xp - prevPalier.seuil) / range) * 100)) : 100;

  return (
    <>
      {/* شريط تقدّم XP رقيق أسفل الترويسة مباشرة (لا يغطي شيئًا) */}
      <div className="fixed left-0 right-0 top-16 z-30 h-1 bg-[var(--color-line)]">
        <div
          className="h-full bg-gradient-to-r from-primary via-forest-deep to-primary transition-[width] duration-1000 ease-out"
          style={{ width: `${progressPourCent}%` }}
        />
      </div>

      {/* حاوية التصفيق (Confetti) */}
      <div className="confetti-container" aria-hidden="true">
        {Array.from({ length: confetti * 40 }).map((_, i) => {
          const color = ['#7fb896', '#2f5d47', '#a3d9c1', '#5e8f6f', '#e8f0e4'][i % 5];
          const left = Math.random() * 100;
          const delay = Math.random() * 2;
          const size = 6 + Math.random() * 10;
          return (
            <div
              key={i}
              className="confetti-piece"
              style={{
                left: `${left}%`,
                backgroundColor: color,
                width: `${size}px`,
                height: `${size}px`,
                animationDelay: `${delay}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          );
        })}
      </div>
    </>
  );
}