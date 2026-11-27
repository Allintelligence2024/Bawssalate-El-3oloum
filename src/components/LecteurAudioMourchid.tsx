// المرحلة 3 — مشغّل «صوت المُرشد» (RTL، خفيف، موحّد مع مشغّل ملخّصات الدروس، مع النصّ الكامل للإتاحة والعمل دون اتصال).
//
// - لا يحمّل أيّ أوكتي صوتي قبل النقر (`preload="none"`).
// - قفل صوتي وحيد عبر التطبيق (تشغيل كبسولة يوقف أيّ مقطع آخر تلقائيًا).
// - عناصر تحكّم موحّدة: تشغيل/إيقاف، شريط تقدّم، رجوع −10 ث، وسرعة 1× / 1.25× / 1.5×.
// - كشف استباقي لحالة الاتصال والذاكرة المخبّأة (`caches.match`)، مع فتح النصّ الكامل تلقائيًا دون اتصال.

import { useEffect, useRef, useState } from 'react';
import type { PisteAudioMourchid } from '../data/audioMourchid';
import {
  MESSAGE_AUDIO_HORS_LIGNE,
  MESSAGE_AUDIO_R2_EN_ATTENTE,
  VITESSES_AUDIO,
  activerLecteurAudio,
  formatDureeAudio,
  libererLecteurAudio,
  urlAudioMourchid,
} from '../utils/audioUrl';

interface Props {
  piste: PisteAudioMourchid;
  /** عرض مضغوط داخل قارئ الدرس أو جسر الوحدة */
  compact?: boolean;
  /** تجاوز اختياري لرابط البثّ (للاختبارات أو المعاينة) */
  baseUrl?: string;
  /** تجاوز اختياري لحالة الشبكة في الاختبارات الوحدوية */
  horsLigneForce?: boolean;
}

function IcoLecture() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
      <path d="M8 5.5v13l11-6.5-11-6.5Z" />
    </svg>
  );
}

function IcoPause() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
  );
}

function IcoOndes() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M4 10v4M8 7v10M12 4v16M16 7v10M20 10v4" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

function IcoRecul10() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 shrink-0" aria-hidden="true">
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

export default function LecteurAudioMourchid({
  piste,
  compact = false,
  baseUrl,
  horsLigneForce,
}: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [enLecture, setEnLecture] = useState(false);
  const arreterRef = useRef<() => void>(() => {
    const el = audioRef.current;
    if (el && typeof el.pause === 'function') {
      el.pause();
    }
    setEnLecture(false);
  });
  const [position, setPosition] = useState(0);
  const [duree, setDuree] = useState(piste.dureeSecondes);
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

  const url = urlAudioMourchid(piste.fichier, baseUrl);
  const vitesse = VITESSES_AUDIO[indexVitesse];

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

  useEffect(() => {
    const el = audioRef.current;
    if (el && !el.paused && typeof el.pause === 'function') {
      el.pause();
    }
    libererLecteurAudio(arreterRef.current);
    setEnLecture(false);
    setPosition(0);
    setDuree(piste.dureeSecondes);
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
          /* caches غير متاحة أو محظورة */
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
  }, [piste.id, piste.dureeSecondes, url]);

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

  const horsLigneSansCache = Boolean(url) && !enLigne && !enCache;
  const indisponible = !url || horsLigneSansCache || erreurReseau;
  const dureeTotale = Math.max(1, Math.round(duree || piste.dureeSecondes));
  const texteOuvert = texteOuvertManuel ?? (horsLigneSansCache || erreurReseau);

  function basculerLecture() {
    const el = audioRef.current;
    if (!el || indisponible) return;
    setErreurReseau(false);
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
          .then(() => setEnLecture(true))
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

  function changerVitesse() {
    setIndexVitesse((i) => (i + 1) % VITESSES_AUDIO.length);
  }

  return (
    <section
      className={`rounded-2xl border border-sage bg-paper ${compact ? 'p-3.5' : 'p-4'} shadow-sm`}
      aria-label={`صوت المُرشد: ${piste.titreAr}`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sage-soft text-forest transition-shadow ${
            enLecture ? 'animate-pulse ring-2 ring-forest motion-reduce:animate-none' : ''
          }`}
          data-etat-lecture={enLecture ? 'actif' : 'repos'}
        >
          <IcoOndes />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-forest">صوت المُرشد</span>
            <span className="rounded-full bg-cream px-2 py-0.5 text-[10px] font-bold tabular-nums text-mute" dir="ltr">
              {formatDureeAudio(duree)}
            </span>
            {!piste.reviewed && (
              <span className="rounded-full bg-gold-soft px-2 py-0.5 text-[10px] font-bold text-forest-deep">
                قيد المراجعة التربوية
              </span>
            )}
          </div>
          <h3 className="mt-1 text-sm font-bold leading-snug text-ink">{piste.titreAr}</h3>
          {!compact && <p className="mt-0.5 text-xs leading-relaxed text-mute">{piste.sousTitreAr}</p>}
        </div>
      </div>

      {url ? (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-line bg-cream/70 px-3 py-2">
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
          <button
            type="button"
            onClick={basculerLecture}
            disabled={indisponible}
            aria-label={enLecture ? 'إيقاف مؤقّت لصوت المُرشد' : 'تشغيل صوت المُرشد'}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-forest text-paper transition-colors hover:bg-forest-deep disabled:cursor-not-allowed disabled:bg-cream disabled:text-mute"
          >
            {enLecture ? <IcoPause /> : <IcoLecture />}
          </button>
          <button
            type="button"
            onClick={reculer10Secondes}
            disabled={indisponible}
            aria-label="رجوع عشر ثوانٍ"
            className="inline-flex items-center gap-1 rounded-lg border border-line bg-paper px-2 py-1 text-[11px] font-bold text-ink-soft hover:border-forest disabled:cursor-not-allowed disabled:opacity-50"
          >
            <IcoRecul10 />
            <span dir="ltr">−10s</span>
          </button>
          <div className="flex min-w-[130px] flex-1 items-center gap-2" dir="ltr">
            <span className="w-9 text-[11px] font-bold tabular-nums text-mute">{formatDureeAudio(position)}</span>
            <input
              type="range"
              min={0}
              max={dureeTotale}
              step={1}
              value={Math.min(Math.round(position), dureeTotale)}
              disabled={indisponible}
              onChange={(e) => deplacerCurseur(Number(e.target.value))}
              aria-label="تقدّم التسجيل الصوتي"
              aria-valuetext={`${formatDureeAudio(position)} من ${formatDureeAudio(dureeTotale)}`}
              className="h-1.5 flex-1 cursor-pointer accent-forest disabled:cursor-not-allowed disabled:opacity-50"
            />
            <span className="w-9 text-end text-[11px] tabular-nums text-mute">{formatDureeAudio(dureeTotale)}</span>
          </div>
          <button
            type="button"
            onClick={changerVitesse}
            disabled={indisponible}
            aria-label={`سرعة التشغيل الحالية ${vitesse}`}
            className="rounded-lg border border-line bg-paper px-2 py-1 text-[11px] font-bold text-forest hover:border-forest disabled:cursor-not-allowed disabled:opacity-50"
            dir="ltr"
          >
            {vitesse}×
          </button>
        </div>
      ) : (
        <p className="mt-2.5 rounded-xl border border-line bg-cream/60 px-3 py-2 text-xs leading-relaxed text-mute">
          {MESSAGE_AUDIO_R2_EN_ATTENTE}
        </p>
      )}

      {(erreurReseau || horsLigneSansCache) && (
        <p role="status" className="mt-2 rounded-xl border border-gold/40 bg-gold-soft/50 px-3 py-2 text-xs leading-relaxed text-forest-deep">
          {MESSAGE_AUDIO_HORS_LIGNE}
        </p>
      )}

      <div className="mt-2.5">
        <button
          type="button"
          onClick={() => setTexteOuvertManuel(!texteOuvert)}
          aria-expanded={texteOuvert}
          className="text-xs font-bold text-forest hover:underline"
        >
          {texteOuvert ? 'إخفاء النصّ الكامل للمُرشد' : 'اقرأ النصّ الكامل للمُرشد'}
        </button>
        {texteOuvert && (
          <p className="mt-2 rounded-xl border border-line bg-cream/50 p-3 text-sm leading-relaxed text-ink">
            {piste.texteAr}
          </p>
        )}
      </div>
    </section>
  );
}
