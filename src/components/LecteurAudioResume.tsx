// المرحلة 3 / 5.3 — مشغّل خفيف للملخّص الصوتي للدرس بصوت المُرشد (RTL، قابل للوصول، بلا إيموجي).
//
// - صورة المُرشد مع حركة خفيفة أثناء التشغيل (تُعطّل تلقائيًا مع prefers-reduced-motion).
// - زرّ تشغيل/إيقاف («استمع للملخّص بصوت المرشد»)، شريط تقدّم تفاعلي + مدّة، رجوع −10 ث،
//   وزرّ سرعة دوري: 1× / 1.25× / 1.5×.
// - شارة وضع هادئة: «ملخّص صوتي — قيد مراجعة الأستاذ».
// - دون اتصال (إن لم تكن القطعة مخبّأة بعد) أو قبل ضبط R2: حالة معطّلة هادئة
//   «يتطلّب اتصالًا للاستماع أوّل مرّة» دون أيّ خطأ في وحدة التحكّم.

import { useEffect, useRef, useState } from 'react';
import type { PisteAudioLecon } from '../data/audioLecons';
import {
  chargerAudioLecons,
  lireAudioLeconsCache,
} from '../utils/audioLeconsChargeur';
import {
  MESSAGE_AUDIO_RESUME_HORS_LIGNE,
  VITESSES_AUDIO,
  activerLecteurAudio,
  formatDureeAudio,
  libererLecteurAudio,
  urlAudioLecon,
} from '../utils/audioUrl';

export const STATUT_AUDIO_RESUME = 'ملخّص صوتي — قيد مراجعة الأستاذ';

interface Props {
  lessonId: string;
  /** عرض مضغوط داخل مشغّل البروتوكول (المرحلة 1 والمرحلة 5) */
  compact?: boolean;
  /** إخفاء كتلة النصّ المكتوب عندما يكون معروضًا سلفًا في البطاقة الأمّ */
  masquerTexte?: boolean;
  /** بدء التشغيل تلقائيًا عند فتح المشغّل بنقرة واحدة من المكتبة الصوتية */
  lectureAuto?: boolean;
  /** تجاوز اختياري لرابط R2 (للاختبارات أو المعاينة المحلية) */
  baseUrl?: string;
  /** تجاوز اختياري لحالة الشبكة في الاختبارات الوحدوية */
  horsLigneForce?: boolean;
}

function IcoLecture() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path d="M8 5.5v13l11-6.5-11-6.5Z" />
    </svg>
  );
}

function IcoPause() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 shrink-0" aria-hidden="true">
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
  );
}

function IcoRecul10() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path
        d="M12 5a7 7 0 1 1-6.3 4M7 5H4v3"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function LecteurAudioResume({
  lessonId,
  compact = false,
  masquerTexte = false,
  lectureAuto = false,
  baseUrl,
  horsLigneForce,
}: Props) {
  const [pistes, setPistes] = useState<PisteAudioLecon[] | null>(() => lireAudioLeconsCache());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const arreterRef = useRef<() => void>(() => {
    const el = audioRef.current;
    if (el && typeof el.pause === 'function') {
      el.pause();
    }
    setEnLecture(false);
  });
  const [enLecture, setEnLecture] = useState(false);
  const [position, setPosition] = useState(0);
  const [duree, setDuree] = useState(0);
  const [indexVitesse, setIndexVitesse] = useState<number>(0);
  const [enLigne, setEnLigne] = useState<boolean>(() =>
    horsLigneForce !== undefined
      ? !horsLigneForce
      : typeof navigator === 'undefined'
        ? true
        : navigator.onLine !== false,
  );
  const [enCache, setEnCache] = useState(false);
  const [erreurReseau, setErreurReseau] = useState(false);
  const [texteOuvertManuel, setTexteOuvertManuel] = useState<boolean | null>(null);

  useEffect(() => {
    if (pistes) return;
    let actif = true;
    void chargerAudioLecons()
      .then((liste) => {
        if (actif) setPistes(liste);
      })
      .catch(() => {
        /* دون اتصال وقبل التنزيل: نُخفي المشغّل بهدوء دون أي خطأ */
      });
    return () => {
      actif = false;
    };
  }, [pistes]);

  useEffect(() => {
    if (horsLigneForce !== undefined) {
      setEnLigne(!horsLigneForce);
      return;
    }
    if (typeof window === 'undefined') return;
    const surEnLigne = () => {
      setEnLigne(true);
      setErreurReseau(false);
    };
    const surHorsLigne = () => setEnLigne(false);
    window.addEventListener('online', surEnLigne);
    window.addEventListener('offline', surHorsLigne);
    return () => {
      window.removeEventListener('online', surEnLigne);
      window.removeEventListener('offline', surHorsLigne);
    };
  }, [horsLigneForce]);

  const piste = pistes?.find((p) => p.lessonId === lessonId);
  const url = piste ? urlAudioLecon(piste.fichier, baseUrl) : null;

  useEffect(() => {
    const el = audioRef.current;
    if (el && !el.paused && typeof el.pause === 'function') {
      el.pause();
    }
    setEnLecture(false);
    setPosition(0);
    setDuree(piste?.dureeSecondes ?? 0);
    setErreurReseau(false);
    setEnCache(false);
    setTexteOuvertManuel(null);
    let actif = true;
    if (url && typeof caches !== 'undefined') {
      void caches
        .match(url)
        .then((hit) => {
          if (actif && hit) setEnCache(true);
        })
        .catch(() => {
          /* caches غير متاحة أو محظورة: نتابع بهدوء */
        });
    }
    return () => {
      actif = false;
      const cible = el ?? audioRef.current;
      if (cible && !cible.paused && typeof cible.pause === 'function') {
        cible.pause();
      }
      libererLecteurAudio(arreterRef.current);
    };
  }, [piste?.lessonId, piste?.dureeSecondes, url]);

  const vitesse = VITESSES_AUDIO[indexVitesse];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = vitesse;
    }
  }, [vitesse]);

  useEffect(() => {
    if (!enLigne && !enCache && enLecture) {
      if (audioRef.current && typeof audioRef.current.pause === 'function') {
        audioRef.current.pause();
      }
      libererLecteurAudio(arreterRef.current);
      setEnLecture(false);
    }
  }, [enLigne, enCache, enLecture]);

  useEffect(() => {
    if (!lectureAuto || !piste || !url || (!enLigne && !enCache)) return;
    const el = audioRef.current;
    if (!el || typeof el.play !== 'function') return;
    activerLecteurAudio(arreterRef.current);
    el.playbackRate = vitesse;
    try {
      const promesse = el.play();
      if (promesse && typeof promesse.then === 'function') {
        void promesse
          .then(() => {
            setEnLecture(true);
            setErreurReseau(false);
          })
          .catch((err: unknown) => {
            libererLecteurAudio(arreterRef.current);
            setEnLecture(false);
            const nom = err instanceof Error ? err.name : '';
            if (nom !== 'NotAllowedError' && nom !== 'AbortError') {
              setErreurReseau(true);
            }
          });
      } else {
        setEnLecture(true);
      }
    } catch {
      libererLecteurAudio(arreterRef.current);
      setEnLecture(false);
    }
    // تشغيل تلقائي عند فتح سطر محدّد فقط (وليس عند تغيير السرعة أو حالة الشبكة لاحقًا)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lectureAuto, piste?.lessonId, url]);

  if (!piste) return null;

  const indisponibleHorsLigne = !url || (!enLigne && !enCache) || erreurReseau;
  const dureeTotale = Math.max(1, Math.round(duree || piste.dureeSecondes));
  // في وضع الدرس الكامل وعند غياب الصوت، نعرض نصّ الملخّص المكتوب مباشرةً ليستفيد التلميذ بلا إنترنت.
  const texteOuvert = texteOuvertManuel ?? (!compact && indisponibleHorsLigne);

  function basculerLecture() {
    const el = audioRef.current;
    if (!el || indisponibleHorsLigne) return;
    if (enLecture) {
      el.pause();
      libererLecteurAudio(arreterRef.current);
      setEnLecture(false);
      return;
    }
    try {
      activerLecteurAudio(arreterRef.current);
      el.playbackRate = vitesse;
      const promesse = el.play();
      if (promesse && typeof promesse.then === 'function') {
        void promesse
          .then(() => {
            setEnLecture(true);
            setErreurReseau(false);
          })
          .catch(() => {
            libererLecteurAudio(arreterRef.current);
            setEnLecture(false);
            setErreurReseau(true);
          });
      } else {
        setEnLecture(true);
      }
    } catch {
      libererLecteurAudio(arreterRef.current);
      setEnLecture(false);
      setErreurReseau(true);
    }
  }

  function reculer10Secondes() {
    const cible = Math.max(0, position - 10);
    setPosition(cible);
    if (audioRef.current) {
      audioRef.current.currentTime = cible;
    }
  }

  function deplacerCurseur(valeur: number) {
    setPosition(valeur);
    if (audioRef.current) {
      audioRef.current.currentTime = valeur;
    }
  }

  function cyclerVitesse() {
    setIndexVitesse((i) => (i + 1) % VITESSES_AUDIO.length);
  }

  return (
    <section
      dir="rtl"
      aria-label={`ملخّص صوتي للدرس: ${piste.titreAr}`}
      className={`rounded-2xl border border-sage bg-sage-soft/50 ${compact ? 'p-3' : 'p-3.5'}`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-paper p-1 ring-2 transition-shadow ${
            enLecture
              ? 'animate-pulse ring-forest motion-reduce:animate-none'
              : 'ring-sage'
          }`}
          data-etat-lecture={enLecture ? 'actif' : 'repos'}
        >
          <img
            src="/mascotte.webp"
            alt=""
            width={36}
            height={36}
            className="h-9 w-9 object-contain"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-forest-deep">
              {STATUT_AUDIO_RESUME}
            </span>
            <span
              className="rounded-full bg-paper px-2 py-0.5 text-[10px] font-bold tabular-nums text-mute"
              dir="ltr"
            >
              {formatDureeAudio(duree || piste.dureeSecondes)}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={basculerLecture}
              disabled={indisponibleHorsLigne}
              aria-label={
                enLecture
                  ? 'إيقاف مؤقّت للملخّص الصوتي'
                  : 'استمع للملخّص بصوت المرشد'
              }
              className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest ${
                indisponibleHorsLigne
                  ? 'cursor-not-allowed border border-line bg-cream text-mute'
                  : 'bg-forest text-paper hover:bg-forest-deep'
              }`}
            >
              {enLecture ? <IcoPause /> : <IcoLecture />}
              <span>
                {enLecture ? 'إيقاف مؤقّت' : 'استمع للملخّص بصوت المرشد'}
              </span>
            </button>

            <button
              type="button"
              onClick={reculer10Secondes}
              disabled={indisponibleHorsLigne}
              aria-label="رجوع عشر ثوانٍ"
              className="inline-flex items-center gap-1 rounded-xl border border-line bg-paper px-2.5 py-1.5 text-[11px] font-bold text-ink-soft transition-colors hover:border-forest disabled:cursor-not-allowed disabled:opacity-50"
            >
              <IcoRecul10 />
              <span dir="ltr">−10s</span>
            </button>

            <button
              type="button"
              onClick={cyclerVitesse}
              disabled={indisponibleHorsLigne}
              aria-label={`سرعة التشغيل ${vitesse}`}
              className="rounded-xl border border-line bg-paper px-2.5 py-1.5 text-[11px] font-bold text-forest transition-colors hover:border-forest disabled:cursor-not-allowed disabled:opacity-50"
              dir="ltr"
            >
              {vitesse}×
            </button>
          </div>
        </div>
      </div>

      {url && (
        <audio
          ref={audioRef}
          src={url}
          preload="none"
          onPlay={() => {
            activerLecteurAudio(arreterRef.current);
            setEnLecture(true);
          }}
          onPause={() => {
            libererLecteurAudio(arreterRef.current);
            setEnLecture(false);
          }}
          onTimeUpdate={(e) => setPosition(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => {
            e.currentTarget.playbackRate = vitesse;
            if (Number.isFinite(e.currentTarget.duration) && e.currentTarget.duration > 0) {
              setDuree(e.currentTarget.duration);
            }
          }}
          onEnded={() => {
            libererLecteurAudio(arreterRef.current);
            setEnLecture(false);
          }}
          onError={() => {
            libererLecteurAudio(arreterRef.current);
            setEnLecture(false);
            setErreurReseau(true);
          }}
        />
      )}

      <div className="mt-2.5 flex items-center gap-2" dir="ltr">
        <span className="w-9 text-[11px] font-bold tabular-nums text-mute">
          {formatDureeAudio(position)}
        </span>
        <input
          type="range"
          min={0}
          max={dureeTotale}
          step={1}
          value={Math.min(Math.round(position), dureeTotale)}
          disabled={indisponibleHorsLigne}
          onChange={(e) => deplacerCurseur(Number(e.target.value))}
          aria-label="شريط تقدّم الملخّص الصوتي"
          aria-valuetext={`${formatDureeAudio(position)} من ${formatDureeAudio(dureeTotale)}`}
          className="h-1.5 flex-1 cursor-pointer accent-forest disabled:cursor-not-allowed disabled:opacity-50"
        />
        <span className="w-9 text-end text-[11px] tabular-nums text-mute">
          {formatDureeAudio(dureeTotale)}
        </span>
      </div>

      {indisponibleHorsLigne && (
        <p
          role="status"
          className="mt-2 rounded-xl border border-line bg-paper/80 px-3 py-1.5 text-[11px] font-bold text-mute"
        >
          {MESSAGE_AUDIO_RESUME_HORS_LIGNE}
        </p>
      )}

      {!masquerTexte && (
        <div className="mt-2.5 border-t border-sage/60 pt-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setTexteOuvertManuel(!texteOuvert)}
              aria-expanded={texteOuvert}
              className="text-[11px] font-bold text-forest hover:underline"
            >
              {texteOuvert
                ? 'إخفاء ملخّص المُرشد المكتوب'
                : 'قراءة ملخّص المُرشد المكتوب (متاح بلا إنترنت)'}
            </button>
            <span className="rounded-full bg-paper px-2 py-0.5 text-[10px] font-bold text-forest-deep">
              نصّ الملخّص · يعمل بلا إنترنت
            </span>
          </div>
          {texteOuvert && (
            <div className="mt-2 rounded-xl border border-line bg-paper p-3">
              <p className="text-[11px] font-bold text-forest-deep">
                ملخّص المُرشد المكتوب — {piste.titreAr}
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-ink">
                {piste.texteAr}
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
