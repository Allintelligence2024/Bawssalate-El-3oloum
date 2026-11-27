// قارئ الدرس — طبقة قراءة فقط تُستعمل من المرحلة 5 وجسر الوحدة.
// يعرض محتوى الكتاب (HTML) + الملخّص الذهبي. لا أزرار تخطّي، لا تقييم.

import { getLessonGoldSummary } from '../data/lessonGoldSummaries';
import { termeGlossaire } from '../data/glossaire';
import { titreLecon, uniteDeLecon } from '../data/programme';
import { aContenuLecon, urlLecon } from '../data/leconsPassives';
import { nb } from '../utils/dates';
import { IcoRetour } from './Icones';
import IllustrationsLecon from './IllustrationsLecon';
import AudioMourchidBloc from './AudioMourchidBloc';
import LecteurAudioResume from './LecteurAudioResume';
import { prechaufferSchemasSvt } from '../utils/schemasSvtChargeur';
import { prechaufferAudioMourchid } from '../utils/audioMourchidChargeur';
import { prechaufferAudioLecons } from '../utils/audioLeconsChargeur';
import { useEffect, useState } from 'react';

interface Props {
  lessonId: string;
  onFermer: () => void;
  /** المفضّلة (P3.3) — اختياريّان كي يبقى القارئ صالحًا داخل الورشة */
  favori?: boolean;
  onBasculerFavori?: () => void;
}

export default function LecteurLecon({ lessonId, onFermer, favori, onBasculerFavori }: Props) {
  const lecon = getLessonGoldSummary(lessonId);
  const unite = uniteDeLecon(lessonId);
  const aContenu = aContenuLecon(lessonId);
  const [contenuIndisponible, setContenuIndisponible] = useState(false);
  const [motOuvert, setMotOuvert] = useState<string | null>(null);

  useEffect(() => {
    prechaufferSchemasSvt();
    prechaufferAudioMourchid();
    prechaufferAudioLecons();
  }, []);

  return (
    <div className="flex min-h-dvh flex-col bg-cream">
      <header className="sticky top-0 z-20 border-b border-line bg-paper px-4 pb-3 pt-4">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <button
            onClick={onFermer}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cream text-mute transition-colors hover:bg-sage-soft"
            aria-label="رجوع"
          >
            <span className="block h-5 w-5">
              <IcoRetour />
            </span>
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] text-mute">
              {unite ? `الوحدة ${nb(unite.numero)}: ${unite.titre}` : 'درس'}
            </p>
            <h1 className="truncate text-base font-bold">{titreLecon(lessonId)}</h1>
          </div>
          {onBasculerFavori && (
            <button
              type="button"
              onClick={onBasculerFavori}
              aria-pressed={favori}
              aria-label={favori ? 'إزالة من المفضّلة' : 'إضافة إلى المفضّلة'}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg transition-colors ${
                favori ? 'bg-gold-soft text-forest-deep' : 'bg-cream text-mute hover:bg-sage-soft'
              }`}
            >
              {favori ? '★' : '☆'}
            </button>
          )}
          <span className="shrink-0 rounded-full bg-sage px-2.5 py-1 text-[11px] font-bold text-forest-deep">
            قراءة
          </span>
        </div>
      </header>

      <main className="flex-1 px-3 pb-12 pt-3">
        <div className="mx-auto max-w-3xl space-y-4">
          {lecon && (
            <div className="card p-4">
              {/* هدف الافتتاح + «الأساسي في 3 جمل» (P2.5) — من الملخّص الذهبي نفسه */}
              <p className="eyebrow">في نهاية هذا الدرس ستكون قادرًا على…</p>
              <ol className="mt-1.5 list-decimal space-y-1 pr-5 text-sm leading-relaxed">
                <li>أن تشرح: {lecon.mechanismAr[0]}</li>
                {lecon.mechanismAr.length > 1 && <li>أن تربط: {lecon.mechanismAr[lecon.mechanismAr.length - 1]}</li>}
                <li>أن تتجنّب: {lecon.commonErrorAr}</li>
              </ol>
              <p className="eyebrow mt-4">الإشكالية</p>
              <p className="mt-1.5 text-sm font-bold leading-relaxed">{lecon.missionAr}</p>
              {aContenu && (
                <p className="mt-3 text-[11px] leading-relaxed text-mute">
                  في الأسفل محتوى الكتاب المدرسي كاملًا — اقرأه من أوله إلى آخره قبل المتابعة.
                </p>
              )}
            </div>
          )}

          {aContenu && !contenuIndisponible ? (
            <div className="overflow-hidden rounded-2xl border border-line bg-paper shadow-sm">
              <div className="flex items-center justify-between border-b border-line bg-sage-soft px-4 py-2">
                <span className="text-[11px] font-bold text-forest">المحتوى التفاعلي للدرس</span>
                <span className="text-[10px] text-mute">مرجع القراءة</span>
              </div>
              <iframe
                src={urlLecon(lessonId)}
                title={titreLecon(lessonId)}
                className="h-[72vh] w-full bg-cream"
                loading="eager"
                onError={() => setContenuIndisponible(true)}
                onLoad={(e) => {
                  // حجم الخط (P3.3): ننسخ سمة <html data-taille> إلى وثيقة الدرس (نفس الأصل)
                  const doc = e.currentTarget.contentDocument;
                  if (!doc) return;
                  const t = document.documentElement.dataset.taille ?? 'm';
                  doc.documentElement.dataset.taille = t;
                  // صفحات الدروس تستعمل rem: يكفي ضبط جذرها (لا CSS خاص بها)
                  doc.documentElement.style.fontSize = t === 's' ? '15px' : t === 'l' ? '18.5px' : '16px';
                }}
              />
            </div>
          ) : (
            <div className="rounded-2xl border border-sage bg-sage-soft p-5 text-center">
              <p className="text-sm font-bold text-forest-deep">
                {aContenu ? 'المحتوى التفاعلي غير متاح مؤقتًا' : 'هذا الدرس متاح بصيغة الملخّص'}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-mute">
                الملخّص الذهبي في الأسفل هو مرجعك الكامل — يمكنك متابعة الجلسة دون فقدان الدرس.
              </p>
            </div>
          )}

          {/* Phase 3 — illustrations WebP (21 documents OK) chargées paresseusement. */}
          <IllustrationsLecon lessonId={lessonId} />

          {/* المرحلة 3 — كبسولة «صوت المُرشد» الموافقة للوحدة (تحميل كسول + نصّ كامل). */}
          {unite && <AudioMourchidBloc uniteId={unite.id} compact />}

          {lecon && (
            <div className="card p-4">
              <p className="eyebrow">الملخّص الذهبي</p>
              <h2 className="font-naskh mt-1 text-lg font-bold">{titreLecon(lessonId)}</h2>

              {/* المرحلة 3 / 5.3 — مشغّل الملخّص الصوتي للدرس في أعلى الملخّص الذهبي */}
              <div className="mt-3">
                <LecteurAudioResume lessonId={lessonId} />
              </div>

              <p className="mt-3 text-[11px] font-bold text-forest">الخطوات السببية</p>
              <div className="mt-2 space-y-2">
                {lecon.mechanismAr.map((etape, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-xl border border-line bg-cream/50 px-3 py-2.5"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-forest text-[10px] font-bold text-paper">
                      {i + 1}
                    </span>
                    <span className="text-sm leading-relaxed">{etape}</span>
                  </div>
                ))}
              </div>

              <p className="mt-4 text-[11px] font-bold text-forest">الكلمات المفتاحية</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {lecon.vocabulary.map((v) => {
                  const t = termeGlossaire(v);
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setMotOuvert(motOuvert === v ? null : v)}
                      className={`chip text-xs font-bold ${t ? 'cursor-pointer hover:border-forest' : 'cursor-default'} ${motOuvert === v ? 'border-forest bg-sage-soft/60' : ''}`}
                      aria-expanded={motOuvert === v}
                    >
                      {v}
                    </button>
                  );
                })}
              </div>
              {motOuvert && termeGlossaire(motOuvert) && (
                <p className="mt-2 rounded-xl bg-paper px-3 py-2 text-xs">
                  <span className="font-bold">{motOuvert}</span>
                  <span className="text-mute"> ← بالفرنسية: </span>
                  <span dir="ltr" className="font-bold text-forest-deep">{termeGlossaire(motOuvert)!.fr}</span>
                </p>
              )}

              {lecon.evidenceAr && (
                <>
                  <p className="mt-4 text-[11px] font-bold text-forest">الدليل الوثائقي</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{lecon.evidenceAr}</p>
                </>
              )}

              {lecon.commonErrorAr && (
                <div className="mt-4 rounded-2xl border border-clay-soft bg-clay-soft/50 p-3.5">
                  <p className="text-[11px] font-bold text-clay">الخطأ النووي الشائع</p>
                  <p className="mt-1.5 text-sm leading-relaxed">{lecon.commonErrorAr}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
