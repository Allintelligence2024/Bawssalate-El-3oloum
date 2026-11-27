// مكتبة ملخّصات المُرشد للدروس — تعرض النصوص المكتوبة والصوتية لجميع الدروس المسجّلة حسب الوحدات.
//
// صفوف خفيفة ومضغوطة للهاتف: تشغيل فوري بنقرة واحدة + نصّ مكتوب قابل للطيّ (يفتح تلقائيًا
// عند مطابقة البحث) داخل حزمة `contenu` الكسولة (0 أوكتي في الكوكية).

import { useEffect, useId, useMemo, useState } from 'react';
import type { PisteAudioLecon } from '../data/audioLecons';
import { UNITES } from '../data/programme';
import {
  chargerAudioLecons,
  lireAudioLeconsCache,
} from '../utils/audioLeconsChargeur';
import { formatDureeAudio } from '../utils/audioUrl';
import { nb } from '../utils/dates';
import LecteurAudioResume from './LecteurAudioResume';

function normaliserArabe(texte: string): string {
  return texte
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .trim()
    .toLowerCase();
}

function IcoPlayMini() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 shrink-0" aria-hidden="true">
      <path d="M8 5.5v13l11-6.5-11-6.5Z" />
    </svg>
  );
}

function IcoStopMini() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 shrink-0" aria-hidden="true">
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}

export default function BibliothequeResumesLecons() {
  const [pistes, setPistes] = useState<PisteAudioLecon[] | null>(() =>
    lireAudioLeconsCache(),
  );
  const [uniteActive, setUniteActive] = useState<string>('toutes');
  const [recherche, setRecherche] = useState('');
  const [leconOuverte, setLeconOuverte] = useState<string | null>(null);
  const [texteOuvertId, setTexteOuvertId] = useState<string | null>(null);
  const [texteMasqueId, setTexteMasqueId] = useState<string | null>(null);
  const idRecherche = useId();

  useEffect(() => {
    if (pistes) return;
    let actif = true;
    void chargerAudioLecons()
      .then((liste) => {
        if (actif) setPistes(liste);
      })
      .catch(() => {
        /* دون اتصال وقبل التنزيل: نُبقي الواجهة هادئة دون أي خطأ */
      });
    return () => {
      actif = false;
    };
  }, [pistes]);

  const unitesDisponibles = useMemo(() => {
    if (!pistes || pistes.length === 0) return [];
    const parUnite = new Map<string, PisteAudioLecon[]>();
    for (const p of pistes) {
      const courant = parUnite.get(p.uniteId) ?? [];
      courant.push(p);
      parUnite.set(p.uniteId, courant);
    }
    return UNITES.filter((u) => parUnite.has(u.id)).map((u) => ({
      unite: u,
      pistes: parUnite.get(u.id) ?? [],
    }));
  }, [pistes]);

  const termeNormalise = useMemo(() => normaliserArabe(recherche), [recherche]);

  const pistesFiltrees = useMemo(() => {
    const base =
      uniteActive === 'toutes'
        ? (pistes ?? [])
        : (pistes ?? []).filter((p) => p.uniteId === uniteActive);
    if (!termeNormalise) return base;
    return base.filter(
      (p) =>
        normaliserArabe(p.titreAr).includes(termeNormalise) ||
        normaliserArabe(p.texteAr).includes(termeNormalise),
    );
  }, [pistes, uniteActive, termeNormalise]);

  if (!pistes || pistes.length === 0) return null;

  return (
    <section
      dir="rtl"
      aria-label="مكتبة ملخّصات المُرشد للدروس"
      className="card p-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="eyebrow">
            ملخّصات الدروس المكتوبة والصوتية · {nb(pistes.length)} درسًا
          </p>
          <h2 className="font-naskh mt-0.5 text-base font-bold text-ink">
            مكتبة ملخّصات المُرشد في دقيقة
          </h2>
          <p className="mt-0.5 text-xs text-mute">
            نقرة واحدة للاستماع الفوري، مع النصّ المكتوب كاملًا بلا إنترنت.
          </p>
        </div>
      </div>

      <div className="mt-3">
        <label htmlFor={idRecherche} className="sr-only">
          ابحث عن درس أو مفهوم في ملخّصات المُرشد
        </label>
        <input
          id={idRecherche}
          type="search"
          value={recherche}
          onChange={(e) => {
            setRecherche(e.target.value);
            setTexteMasqueId(null);
          }}
          placeholder="ابحث عن درس أو مفهوم (مثال: الاستنساخ، كالفن، المغماتيت)..."
          className="w-full rounded-xl border border-line bg-paper px-3 py-2 text-xs text-ink placeholder:text-mute focus:border-forest focus:outline-none"
        />
      </div>

      <div
        role="group"
        aria-label="تصفية الملخّصات حسب الوحدة"
        className="mt-3 flex flex-wrap gap-1.5"
      >
        <button
          type="button"
          onClick={() => setUniteActive('toutes')}
          aria-pressed={uniteActive === 'toutes'}
          className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${
            uniteActive === 'toutes'
              ? 'bg-forest text-paper'
              : 'border border-line bg-cream text-ink-soft hover:border-forest'
          }`}
        >
          الكل ({nb(pistes.length)})
        </button>
        {unitesDisponibles.map(({ unite, pistes: liste }) => (
          <button
            key={unite.id}
            type="button"
            onClick={() => setUniteActive(unite.id)}
            aria-pressed={uniteActive === unite.id}
            className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${
              uniteActive === unite.id
                ? 'bg-forest text-paper'
                : 'border border-line bg-cream text-ink-soft hover:border-forest'
            }`}
          >
            الوحدة {nb(unite.numero)}: {unite.titre} ({nb(liste.length)})
          </button>
        ))}
      </div>

      {pistesFiltrees.length === 0 ? (
        <p role="status" className="mt-3 rounded-xl border border-line bg-paper p-3 text-xs text-mute">
          لا يوجد ملخّص مطابق لهذا البحث في الوحدة المختارة.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {pistesFiltrees.map((piste) => {
            const ouvert = leconOuverte === piste.lessonId;
            const texteVisible = termeNormalise
              ? texteMasqueId !== piste.lessonId
              : texteOuvertId === piste.lessonId;
            const unite = UNITES.find((u) => u.id === piste.uniteId);
            return (
              <li
                key={piste.lessonId}
                className={`rounded-xl border bg-paper p-3 transition-colors ${
                  ouvert ? 'border-forest bg-sage-soft/20' : 'border-line'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      setLeconOuverte(ouvert ? null : piste.lessonId)
                    }
                    aria-expanded={ouvert}
                    aria-label={
                      ouvert
                        ? `إغلاق مشغّل ملخّص: ${piste.titreAr}`
                        : `استماع فوري لملخّص: ${piste.titreAr}`
                    }
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest ${
                      ouvert
                        ? 'bg-forest-deep text-paper'
                        : 'bg-forest text-paper hover:bg-forest-deep'
                    }`}
                  >
                    {ouvert ? <IcoStopMini /> : <IcoPlayMini />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-bold text-forest-deep">
                      {unite
                        ? `الوحدة ${nb(unite.numero)} · ${unite.titre}`
                        : piste.uniteId}
                    </p>
                    <p className="mt-0.5 text-sm font-bold leading-snug text-ink">
                      {piste.titreAr}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span
                      className="rounded-full bg-cream px-2 py-0.5 text-[10px] font-bold tabular-nums text-mute"
                      dir="ltr"
                    >
                      {formatDureeAudio(piste.dureeSecondes)}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (termeNormalise) {
                          setTexteMasqueId(texteVisible ? piste.lessonId : null);
                        } else {
                          setTexteOuvertId(texteVisible ? null : piste.lessonId);
                        }
                      }}
                      aria-expanded={texteVisible}
                      className="text-[11px] font-bold text-forest hover:underline"
                    >
                      {texteVisible ? 'إخفاء النصّ' : 'قراءة النصّ'}
                    </button>
                  </div>
                </div>

                {texteVisible && (
                  <p className="mt-2.5 border-t border-line/70 pt-2 text-xs leading-relaxed text-ink-soft">
                    {piste.texteAr}
                  </p>
                )}

                {ouvert && (
                  <div className="mt-2.5">
                    <LecteurAudioResume
                      lessonId={piste.lessonId}
                      compact
                      masquerTexte
                      lectureAuto
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
