// زرّ التثبيت الأصلي للتطبيق (PWA) + دليل التثبيت على iOS Safari + مؤشّر هادئ لحالة دون إنترنت.

import { useEffect, useState } from 'react';
import { useOnlineStatus, usePWAInstall } from '../hooks/usePWAInstall';
import { IcoMobile, IcoWifiOff } from './Icones';

export function BoutonInstallerPwa() {
  const { canInstallNative, isInstalled, isIOS, install } = usePWAInstall();
  const [guideIosOuvert, setGuideIosOuvert] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!guideIosOuvert) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setGuideIosOuvert(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [guideIosOuvert]);

  if (isInstalled) {
    return (
      <p className="mt-3 rounded-xl border border-forest/30 bg-sage-soft/50 px-3 py-2 text-xs font-bold text-forest-deep">
        التطبيق مثبّت بالفعل على جهازك — يفتح مباشرة من الشاشة الرئيسية.
      </p>
    );
  }

  return (
    <div className="mt-3 border-t border-line pt-3">
      {canInstallNative ? (
        <button
          type="button"
          onClick={async () => {
            const res = await install();
            if (res === 'accepted') setMessage('تمّ التثبيت! ستجد أيقونة بوصلة العلوم على شاشتك الرئيسية.');
          }}
          className="btn btn-primary flex min-h-[44px] w-full items-center justify-center gap-2 text-sm"
        >
          <span className="block h-5 w-5" aria-hidden="true">
            <IcoMobile />
          </span>
          <span>ثبّت التطبيق على هاتفك (يعمل دون إنترنت)</span>
        </button>
      ) : isIOS ? (
        <button
          type="button"
          onClick={() => setGuideIosOuvert(true)}
          className="btn btn-ghost flex min-h-[44px] w-full items-center justify-center gap-2 text-sm"
        >
          <span className="block h-5 w-5" aria-hidden="true">
            <IcoMobile />
          </span>
          <span>كيفاش تثبّت التطبيق على iPhone / iPad؟</span>
        </button>
      ) : (
        <div className="flex items-start gap-2.5 rounded-xl border border-line bg-bg px-3 py-2.5 text-xs leading-relaxed text-mute">
          <span className="mt-0.5 block h-4 w-4 shrink-0 text-forest" aria-hidden="true">
            <IcoMobile />
          </span>
          <span>
            لتثبيت التطبيق على شاشتك الرئيسية: افتح قائمة المتصفّح ثم اختر «إضافة إلى الشاشة الرئيسية» (Add to Home Screen).
          </span>
        </div>
      )}

      {message && (
        <p role="status" className="mt-2 text-xs font-bold text-forest">
          {message}
        </p>
      )}

      {guideIosOuvert && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="ios-install-titre"
          className="fixed inset-0 z-[100] grid place-items-center bg-black/55 px-4"
        >
          <div dir="rtl" className="card w-full max-w-sm p-5">
            <h2 id="ios-install-titre" className="font-naskh text-lg font-bold text-forest-deep">
              تثبيت بوصلة العلوم على iPhone
            </h2>
            <ol className="mt-3 space-y-2.5 text-sm leading-relaxed text-ink-soft">
              <li className="flex items-start gap-2">
                <span className="mention mention--vert tnum">1</span>
                <span>اضغط على زرّ «مشاركة» (Share) في أسفل متصفّح Safari.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mention mention--vert tnum">2</span>
                <span>مرّر للأسفل واختر «إضافة إلى الشاشة الرئيسية» (Add to Home Screen) ثم «إضافة».</span>
              </li>
            </ol>
            <button
              type="button"
              onClick={() => setGuideIosOuvert(false)}
              className="btn btn-primary mt-4 min-h-[44px] w-full text-sm"
            >
              فهمت
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/** شريط هادئ غير حاجب يظهر فقط عند انقطاع الشبكة لطمأنة التلميذ. */
export function IndicateurHorsLigne() {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;

  return (
    <div
      role="status"
      dir="rtl"
      className="fixed inset-x-0 top-16 z-30 border-b border-gold-soft bg-paper/95 px-4 py-2 text-center shadow-sm backdrop-blur"
    >
      <p className="mx-auto flex max-w-3xl items-center justify-center gap-2 text-xs font-bold text-forest-deep">
        <span className="block h-4 w-4 shrink-0 text-honey-ink" aria-hidden="true">
          <IcoWifiOff />
        </span>
        <span>أنت دون إنترنت — التطبيق والدروس المحفوظة يعملون عادي، وكل تقدّمك يُحفظ على جهازك.</span>
      </p>
    </div>
  );
}
