// مكتبة ملخّصات المُرشد للدروس — تعرض النصوص المكتوبة والصوتية لجميع الدروس المسجّلة حسب الوحدات.
//
// تعمل بلا إنترنت للنصوص المكتوبة وتُحمّل السجلّ كسولًا في حزمة `contenu` (0 أوكتي في الكوكية).

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

export default function BibliothequeResumesLecons() {
  const [pistes, setPistes] = useState<PisteAudioLecon[] | null>(() =>
    lireAudioLeconsCache(),
  );
  const [uniteActive, setUniteActive] = useState<string>('toutes');
  const [recherche, setRecherche] = useState('');
  const [leconOuverte, setLeconOuverte] = useState<string | null>(null);
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

  const pistesFiltrees = useMemo(() => {
    const base =
      uniteActive === 'toutes'
        ? (pistes ?? [])
        : (pistes ?? []).filter((p) => p.uniteId === uniteActive);
    const terme = normaliserArabe(recherche);
    if (!terme) return base;
    return base.filter(
      (p) =>
        normaliserArabe(p.titreAr).includes(terme) ||
        normaliserArabe(p.texteAr).includes(terme),
    );
  }, [pistes, uniteActive, recherche]);

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
            كلّ ملخّص متاح نصًّا كاملًا بلا إنترنت، وبصوت المُرشد عند توفّر الاتصال.
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
          onChange={(e) => setRecherche(e.target.value)}
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
            const unite = UNITES.find((u) => u.id === piste.uniteId);
            return (
              <li
                key={piste.lessonId}
                className="rounded-xl border border-line bg-paper p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold text-forest-deep">
                      {unite
                        ? `الوحدة ${nb(unite.numero)} · ${unite.titre}`
                        : piste.uniteId}
                    </p>
                    <p className="mt-0.5 text-sm font-bold text-ink">
                      {piste.titreAr}
                    </p>
                  </div>
                  <span
                    className="shrink-0 rounded-full bg-cream px-2 py-0.5 text-[10px] font-bold tabular-nums text-mute"
                    dir="ltr"
                  >
                    {formatDureeAudio(piste.dureeSecondes)}
                  </span>
                </div>

                <p className="mt-2 text-xs leading-relaxed text-ink-soft">
                  {piste.texteAr}
                </p>

                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() =>
                      setLeconOuverte(ouvert ? null : piste.lessonId)
                    }
                    aria-expanded={ouvert}
                    className="text-[11px] font-bold text-forest hover:underline"
                  >
                    {ouvert
                      ? 'إخفاء مشغّل الصوت'
                      : 'استماع بصوت المُرشد لهذا الملخّص'}
                  </button>
                  {ouvert && (
                    <div className="mt-2">
                      <LecteurAudioResume
                        lessonId={piste.lessonId}
                        compact
                        masquerTexte
                      />
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
