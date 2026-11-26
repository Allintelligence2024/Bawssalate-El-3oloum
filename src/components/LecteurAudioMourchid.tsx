// المرحلة 3 — مشغّل «صوت المُرشد» (RTL، خفيف، بلا إيموجي، مع النصّ الكامل للإتاحة والعمل دون اتصال).
//
// - لا يحمّل أيّ أوكتي صوتي قبل النقر (`preload="none"`).
// - يعرض شارة «قيد المراجعة التربوية» بصدق (0 ترقية `reviewed: true` دون توقيع).
// - عند غياب `VITE_AUDIO_BASE_URL` أو انقطاع الشبكة، يبقى النصّ الكامل للمُرشد متاحًا للقراءة فورًا.

import { useEffect, useRef, useState } from 'react';
import type { PisteAudioMourchid } from '../data/audioMourchid';
import {
  MESSAGE_AUDIO_HORS_LIGNE,
  MESSAGE_AUDIO_R2_EN_ATTENTE,
  formatDureeAudio,
  urlAudioMourchid,
} from '../utils/audioMourchid';

const VITESSES = [0.85, 1, 1.15] as const;

interface Props {
  piste: PisteAudioMourchid;
  /** عرض مضغوط داخل قارئ الدرس أو جسر الوحدة */
  compact?: boolean;
  /** تجاوز اختياري لرابط البثّ (للاختبارات أو المعاينة) */
  baseUrl?: string;
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

export default function LecteurAudioMourchid({ piste, compact = false, baseUrl }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [enLecture, setEnLecture] = useState(false);
  const [position, setPosition] = useState(0);
  const [duree, setDuree] = useState(piste.dureeSecondes);
  const [indexVitesse, setIndexVitesse] = useState<number>(1);
  const [erreurReseau, setErreurReseau] = useState(false);
  const [texteOuvert, setTexteOuvert] = useState(false);

  const url = urlAudioMourchid(piste.fichier, baseUrl);
  const vitesse = VITESSES[indexVitesse];

  useEffect(() => {
    setEnLecture(false);
    setPosition(0);
    setDuree(piste.dureeSecondes);
    setErreurReseau(false);
  }, [piste.id, piste.dureeSecondes]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = vitesse;
    }
  }, [vitesse]);

  function basculerLecture() {
    const el = audioRef.current;
    if (!el || !url) return;
    setErreurReseau(false);
    if (enLecture) {
      el.pause();
      setEnLecture(false);
      return;
    }
    const promesse = el.play();
    if (promesse && typeof promesse.then === 'function') {
      void promesse
        .then(() => setEnLecture(true))
        .catch(() => {
          setEnLecture(false);
          setErreurReseau(true);
        });
    } else {
      setEnLecture(true);
    }
  }

  function deplacerCurseur(valeur: number) {
    setPosition(valeur);
    if (audioRef.current) {
      audioRef.current.currentTime = valeur;
    }
  }

  function changerVitesse() {
    setIndexVitesse((i) => (i + 1) % VITESSES.length);
  }

  return (
    <section
      className={`rounded-2xl border border-sage bg-paper ${compact ? 'p-3.5' : 'p-4'} shadow-sm`}
      aria-label={`صوت المُرشد: ${piste.titreAr}`}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sage-soft text-forest">
          <IcoOndes />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-forest">صوت المُرشد</span>
            <span className="rounded-full bg-cream px-2 py-0.5 text-[10px] font-bold text-mute" dir="ltr">
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
        <div className="mt-3 flex flex-wrap items-center gap-2.5 rounded-xl border border-line bg-cream/70 px-3 py-2">
          <audio
            ref={audioRef}
            src={url}
            preload="none"
            onTimeUpdate={(e) => setPosition(e.currentTarget.currentTime)}
            onLoadedMetadata={(e) => {
              if (Number.isFinite(e.currentTarget.duration) && e.currentTarget.duration > 0) {
                setDuree(e.currentTarget.duration);
              }
            }}
            onEnded={() => setEnLecture(false)}
            onError={() => {
              setEnLecture(false);
              setErreurReseau(true);
            }}
          />
          <button
            type="button"
            onClick={basculerLecture}
            aria-label={enLecture ? 'إيقاف مؤقّت لصوت المُرشد' : 'تشغيل صوت المُرشد'}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-forest text-paper transition-colors hover:bg-forest-deep"
          >
            {enLecture ? <IcoPause /> : <IcoLecture />}
          </button>
          <div className="flex min-w-[140px] flex-1 items-center gap-2" dir="ltr">
            <span className="w-9 text-[11px] font-bold tabular-nums text-mute">{formatDureeAudio(position)}</span>
            <input
              type="range"
              min={0}
              max={Math.max(1, Math.round(duree))}
              step={1}
              value={Math.min(Math.round(position), Math.round(duree))}
              onChange={(e) => deplacerCurseur(Number(e.target.value))}
              aria-label="تقدّم التسجيل الصوتي"
              className="h-1.5 flex-1 cursor-pointer accent-forest"
            />
            <span className="w-9 text-end text-[11px] tabular-nums text-mute">{formatDureeAudio(duree)}</span>
          </div>
          <button
            type="button"
            onClick={changerVitesse}
            aria-label={`سرعة التشغيل الحالية ${vitesse}`}
            className="rounded-lg border border-line bg-paper px-2 py-1 text-[11px] font-bold text-forest hover:border-forest"
            dir="ltr"
          >
            {vitesse}x
          </button>
        </div>
      ) : (
        <p className="mt-2.5 rounded-xl border border-line bg-cream/60 px-3 py-2 text-xs leading-relaxed text-mute">
          {MESSAGE_AUDIO_R2_EN_ATTENTE}
        </p>
      )}

      {erreurReseau && (
        <p role="status" className="mt-2 rounded-xl border border-gold/40 bg-gold-soft/50 px-3 py-2 text-xs leading-relaxed text-forest-deep">
          {MESSAGE_AUDIO_HORS_LIGNE}
        </p>
      )}

      <div className="mt-2.5">
        <button
          type="button"
          onClick={() => setTexteOuvert((v) => !v)}
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
