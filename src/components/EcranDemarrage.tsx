// شاشة الإقلاع — فيديو افتتاحي «بوصلة العلوم» (مع الصوت) ثم شخصية المستكشف وزر البدء.
// يدعم التخطي بالضغط على الشاشة أو زر تخطي.

import { useEffect, useRef, useState } from 'react';

interface Props {
  onTerminer: () => void;
}

export default function EcranDemarrage({ onTerminer }: Props) {
  const [phase, setPhase] = useState<'video' | 'fin'>('video');
  const [enSortie, setEnSortie] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [skippable, setSkippable] = useState(false);
  const [systemDark, setSystemDark] = useState(false);
  // الفيديو مخفي حتى يبدأ التشغيل فعليًا (WebView يعرض زر ▶ قبيح على الإطار الفارغ)
  const [videoEnCours, setVideoEnCours] = useState(false);
  // الصوت: المتصفحات تمنع التشغيل التلقائي بالصوت قبل أول تفاعل → نعرض زرًا لفتح الصوت
  const [sonBloque, setSonBloque] = useState(false);

  function skip() {
    setPhase('fin');
  }

  function essayerLecture() {
    const v = videoRef.current;
    if (!v) return;
    // نحاول التشغيل بالصوت أولًا (يعمل في تطبيق أندرويد وفي المتصفحات التي تسمح به)
    v.play().catch(() => {
      // سياسة المتصفح: التشغيل التلقائي بالصوت مرفوض → نبدأ مكتومًا ونعرض زر فتح الصوت
      v.muted = true;
      v.play().catch(() => {});
      setSonBloque(true);
    });
  }

  function ouvrirSon() {
    const v = videoRef.current;
    if (!v) return;
    v.muted = false;
    v.volume = 1;
    void v.play().catch(() => {});
    setSonBloque(false);
  }

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemDark(mq.matches);
    const h = () => setSystemDark(mq.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);
useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onEnded = () => setPhase('fin');
    const onCanPlay = () => essayerLecture();
    const onPlaying = () => setVideoEnCours(true);

    v.addEventListener('ended', onEnded, { once: true });
    v.addEventListener('canplay', onCanPlay, { once: true });
    v.addEventListener('loadeddata', onCanPlay, { once: true });
    v.addEventListener('playing', onPlaying, { once: true });

    essayerLecture();

    const onFocus = () => essayerLecture();
    window.addEventListener('focus', onFocus);

    // زر التخطي يظهر بعد لحظات قصيرة (الفيديو نفسه يُتخطى بالنقر في أي وقت)
    const tSkip = setTimeout(() => setSkippable(true), 2500);
    const t = setTimeout(() => setPhase('fin'), 6500);

    return () => {
      clearTimeout(tSkip);
      clearTimeout(t);
      window.removeEventListener('focus', onFocus);
      v.removeEventListener('ended', onEnded);
      v.removeEventListener('canplay', onCanPlay);
      v.removeEventListener('loadeddata', onCanPlay);
    };
  }, []);

  const overlayColor = systemDark ? '#000000' : '#ffffff';
  const bgClass = systemDark ? 'bg-black' : 'bg-white';
  const textColor = systemDark ? 'text-white' : 'text-black';
  const accentColor = systemDark ? 'text-sage' : 'text-sage';

  function terminer() {
    if (enSortie) return;
    setEnSortie(true);
    setTimeout(() => onTerminer(), 600);
  }
return (
    <div
      className={`fixed inset-0 z-[100] flex min-h-dvh flex-col items-center justify-center overflow-hidden  transition-opacity duration-600 ${
        enSortie ? 'opacity-0' : 'opacity-100'
      }`}
      onClick={skip}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && skip()}
      aria-label="بوصلة العلوم — اضغط للمتابعة"
    >
      <video
        ref={videoRef}
        className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-700 ${videoEnCours ? 'opacity-100' : 'opacity-0'}`}
        autoPlay
        playsInline
        preload="auto"
        onClick={skip}
        aria-hidden="true"
      >
        <source src="/ouverture.mp4" type="video/mp4" />
      </video>

      {phase === 'fin' && (
        <div
          className="absolute inset-0 z-10 transition-opacity duration-1500 ease-in-out"
          style={{ opacity: 1, backgroundColor: overlayColor }}
        />
      )}

      {phase === 'video' && (
        <>
          <p className="pointer-events-none absolute bottom-8 z-30 animate-pulse text-xs font-medium">
            {systemDark ? 'اضغط للمتابعة' : 'اضغط للمتابعة'}
          </p>
          {skippable && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                skip();
              }}
              className="absolute top-8 right-8 z-40 h-10 w-32 rounded-full border border-white/30 bg-black/40 backdrop-blur text-xs font-bold text-white hover:bg-white/20 transition-colors"
            >
              تخطي ←
            </button>
          )}
          {sonBloque && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                ouvrirSon();
              }}
              className="absolute top-8 left-8 z-40 flex h-10 w-32 items-center justify-center gap-1.5 rounded-full border border-white/30 bg-black/40 backdrop-blur text-xs font-bold text-white hover:bg-white/20 transition-colors"
              aria-label="تشغيل صوت الفيديو"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4.03v8.05A4.5 4.5 0 0 0 16.5 12zM14 3.23v2.06a7 7 0 0 1 0 13.42v2.06a9 9 0 0 0 0-17.54z" />
              </svg>
              فعّل الصوت
            </button>
          )}
        </>
      )}

      {phase === 'fin' && (
        <div className="relative z-30 flex flex-col items-center px-6">
          {/* الشخصية الرسمية — الصورة تحمل العنوان الذهبي «بوصلة العلوم» بالأسفل */}
          <img
            src="/personnage-pirate.png"
            alt="شخصية بوصلة العلوم — المستكشف بالبوصلة الذهبية"
            className="relative mx-auto h-72 w-auto object-contain drop-shadow-lg kunz-entre md:h-[28rem] transition-[opacity,transform] duration-1000"
          />
          <h1 className="sr-only">بوصلة العلوم</h1>

          <div className="relative mx-auto mt-3 flex items-center justify-center gap-2 kunz-entre">
            <span className="h-px w-10 bg-gradient-to-l from-transparent to-gold/70" />
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-gold" fill="currentColor" aria-hidden>
              <path d="M12 2l2.2 6.3L20.5 9l-4.7 4.1 1.4 6.4L12 16.3 6.8 19.5 8.2 13 3.5 9l6.3-.7z" opacity="0.9" />
            </svg>
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-gold/70" />
          </div>

          <p className={`relative mt-2 text-sm font-medium ${systemDark ? 'text-sage/90' : 'text-sage/90'} kunz-entre md:text-base`}>
            مراجعة البكالوريا — علوم الطبيعة والحياة
          </p>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              terminer();
            }}
            className={`relative mt-10 rounded-full bg-primary px-10 py-3.5 text-base font-bold text-white shadow-lg shadow-black/40 transition active:scale-95 kunz-entre`}
          >
            ابدأ ←
          </button>
        </div>
      )}

      <style>{`
        .kunz-entre {
          opacity: 0;
          animation: kunzApparait 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        @keyframes kunzApparait {
          from { opacity: 0; transform: translateY(18px) scale(0.94); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
