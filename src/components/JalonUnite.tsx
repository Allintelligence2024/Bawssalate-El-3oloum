// جسر الوحدة — يُفتح بعد إنهاء كل دروس الوحدة.
// سؤال واحد باختيار من متعدد (تركيب الوحدة)، ثم مواجهة الفخّين الرسميين، ثم تشخيص أضعف درس.

import { useState } from 'react';
import { UNITE_PAR_ID } from '../data/programme';
import { leconLaPlusFragile, uniteTerminee } from '../utils/moteur';
import { titreLecon } from '../data/programme';
import { qcmPourLecon } from '../utils/qcm';
import { getLessonGoldSummary } from '../data/lessonGoldSummaries';
import { MICRO_EPREUVES_UNITE } from '../data/enquetesBac';
import { nb, formatJourAr } from '../utils/dates';
import type { Etat } from '../types';
import { ChoixUnique, Morceau, OptionsMcq } from './Communs';
import BadgeRelecture from './BadgeRelecture';
import AudioMourchidBloc from './AudioMourchidBloc';
import { IcoRetour } from './Icones';

const TXT_LOCKED_TITLE = 'الجسر مقفل';
const TXT_LOCKED_MSG = 'أنجز كل دروس الوحدة {n} أولًا، ثم يُفتح الجسر.';
const TXT_CLOSE = 'إغلاق';
const TXT_BRIDGE_LABEL = 'الجسر · الوحدة {n}';
const TXT_STEP = 'الخطوة {n} من {total}';
const TXT_UNIT_QUESTION = 'سؤال الوحدة';
const TXT_GATE_INSTRUCTION = 'بوّابة الجسر: اختر الجواب التركيبي الصحيح — من ذاكرتك وحدك، لا درس مفتوح. إن أخطأت أعد المحاولة حتى تصيب.';
const TXT_NEXT_DOC = 'التالي: قراءة سند قصير';
const TXT_NEXT_TRAPS = 'التالي: مواجهة الفخّين';
const TXT_OFFICIAL_TRAPS = 'الفخّان الرسميان للوحدة';
const TXT_TRAP_LABEL = 'فخّ {n}';
const TXT_AVOIDED_TRAPS = 'هل تجنّبت هذين الفخّين في إجابتك؟';
const TXT_AVOIDED_YES = 'نعم — تجنّبتهما';
const TXT_AVOIDED_NO = 'وقعت في أحدهما';
const TXT_FELL_IN_TRAP = 'الوقوع في الفخّ خبر جيد الآن — أفضل من الوقوع فيه يوم البكالوريا. راجع الفخّين أعلاه، وتأكّد من فهمك لهما، ثم واصل.';
const TXT_NEXT_FINAL = 'التالي: آخر تفتيش';
const TXT_SYNTHESIS_QUESTION = 'سؤال التركيب الذي أجبت عنه';
const TXT_WEAKEST_LESSON = 'أضعف دروسك في هذه الوحدة';
const TXT_REREAD_LESSON = 'إعادة قراءة سريعة لهذا الدرس';
const TXT_DEFERRED_QUESTIONS = 'أسئلة أجّلتها أثناء دروس هذه الوحدة ({n})';
const TXT_SOLVED = 'حُلّ';
const TXT_UNIT_COMPLETE = 'أنهيت الوحدة {n}: {t}. ثقلها في البكالوريا {p} من 5. الوحدة التالية تنتظرك في الطريق — بعد راحة.';
const TXT_CROSS_BRIDGE = 'عبور الجسر ✓';
const TXT_BRIDGE_DATE = 'الجسر يُسجّل تاريخًا: {d}';

interface Props {
  uniteId: string;
  etat: Etat;
  onEnregistrer: (synthese: string) => void;
  onRelireLecon: (lessonId: string) => void;
  onFermer: () => void;
}

export default function JalonUnite({
  uniteId,
  etat,
  onEnregistrer,
  onRelireLecon,
  onFermer,
}: Props) {
  const u = UNITE_PAR_ID[uniteId];
  const microDoc = MICRO_EPREUVES_UNITE[uniteId];
  const totalEtapes = microDoc ? 4 : 3;
  const [etape, setEtape] = useState<1 | 2 | 3 | 4>(1);
  const [qcmFait, setQcmFait] = useState(false);
  const [docFait, setDocFait] = useState(false);
  const [evite, setEvite] = useState<'oui' | 'non' | null>(null);
  const [gardeesVues, setGardeesVues] = useState<Record<string, boolean>>({});

  function getPoidsClass(k: number) {
    return k <= u.poidsBac ? 'h-1.5 w-1.5 rounded-full bg-gold' : 'h-1.5 w-1.5 rounded-full bg-line';
  }

  function getEtapeClass(k: number) {
    const base = 'h-1.5 w-8 rounded-full ';
    if (k < etape) return base + 'bg-forest';
    if (k === etape) return base + 'bg-gold';
    return base + 'bg-line';
  }

  if (!uniteTerminee(etat, uniteId)) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center px-4 py-10">
        <div className="card p-7 text-center">
          <span className="text-4xl">🔒</span>
          <h1 className="font-naskh mt-3 text-xl font-bold">{TXT_LOCKED_TITLE}</h1>
          <p className="mt-2 text-sm leading-relaxed text-mute">
            {TXT_LOCKED_MSG.replace('{n}', nb(u.numero))}
          </p>
          <button onClick={onFermer} className="btn btn-ghost mt-5">
            رجوع
          </button>
        </div>
      </div>
    );
  }

  const fragile = leconLaPlusFragile(etat, uniteId);
  // درس التركيب المختار للسؤال: أضعف درس إن وُجد، وإلّا آخر درس في الوحدة
  const cible = fragile ?? u.lessonIds[u.lessonIds.length - 1];
  const qcm = qcmPourLecon(cible, getLessonGoldSummary(cible))?.synthese;
  const questions = etat.notes.filter(
    (n) => n.kind === 'question' && n.uniteId === uniteId && !gardeesVues[n.id]
  );

return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col px-4 pb-6 pt-5">
      <header className="mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={onFermer}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-paper text-mute transition-colors hover:bg-sage-soft"
            aria-label={TXT_CLOSE}
          >
            <span className="block h-5 w-5">
              <IcoRetour />
            </span>
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-mute">{TXT_BRIDGE_LABEL.replace('{n}', nb(u.numero))}</p>
            <h1 className="truncate font-naskh text-lg font-bold">{u.titre}</h1>
          </div>
          <span
            className="inline-flex items-center gap-0.5"
          >
            {[1, 2, 3, 4, 5].map((k) => (
              <span
                key={k}
                className={getPoidsClass(k)}
              />
            ))}
          </span>
        </div>
        <div className="mt-3 flex justify-center gap-1.5">
          {Array.from({ length: totalEtapes }, (_, idx) => idx + 1).map((k) => (
            <span
              key={k}
              className={getEtapeClass(k)}
            />
          ))}
        </div>
      </header>

      <main className="card flex-1 p-5">
        <p className="eyebrow">{TXT_STEP.replace('{n}', nb(etape)).replace('{total}', nb(totalEtapes))}</p>

        {etape === 1 && (
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl border border-sage bg-sage-soft p-4">
              <p className="text-[11px] font-bold text-forest">{TXT_UNIT_QUESTION}</p>
              <p className="mt-1.5 text-base font-bold leading-relaxed">{u.questionAr}</p>
            </div>
            <p className="text-xs font-bold text-ink-soft">
              {TXT_GATE_INSTRUCTION}
            </p>
            {qcm && (
              <ChoixUnique
                qcm={qcm}
                fait={qcmFait}
                onValide={() => setQcmFait(true)}
                source="jalon"
              />
            )}
            <button
              onClick={() => setEtape(2)}
              disabled={!qcmFait}
              className="btn btn-primary w-full"
            >
              {microDoc ? TXT_NEXT_DOC : TXT_NEXT_TRAPS}
            </button>
          </div>
        )}

        {microDoc && etape === 2 && (
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl border border-line bg-paper p-4">
              <p className="text-[11px] font-bold text-forest">
                {microDoc.titre} · الفعل «{microDoc.verbe}»
              </p>
              <p className="mt-1.5 text-sm leading-relaxed">{microDoc.extrait}</p>
            </div>
            <BadgeRelecture review={microDoc.review} />
            <ChoixUnique
              qcm={microDoc.qcm}
              fait={docFait}
              onValide={() => setDocFait(true)}
              source="jalon"
            />
            <button
              onClick={() => setEtape(3)}
              disabled={!docFait}
              className="btn btn-primary w-full"
            >
              {TXT_NEXT_TRAPS}
            </button>
          </div>
        )}

        {etape === (microDoc ? 3 : 2) && (
          <div className="mt-4 space-y-3">
            <p className="text-xs font-bold text-ink-soft">{TXT_OFFICIAL_TRAPS}</p>
            {u.piegesAr.map((piege, i) => (
              <div
                key={i}
                className="rounded-2xl border border-clay-soft bg-clay-soft/50 p-3.5"
              >
                <p className="text-[11px] font-bold text-clay">{TXT_TRAP_LABEL.replace('{n}', nb(i + 1))}</p>
                <p className="mt-1 text-sm leading-relaxed">{piege}</p>
              </div>
            ))}
            <p className="text-xs font-bold text-ink-soft">{TXT_AVOIDED_TRAPS}</p>
            <OptionsMcq
              nom="تجنّب الفخّين"
              options={[
                { key: 'oui', label: TXT_AVOIDED_YES },
                { key: 'non', label: TXT_AVOIDED_NO },
              ]}
              value={evite}
              onChange={(k) => setEvite(k as 'oui' | 'non')}
            />
            {evite === 'non' && (
              <Morceau ton="gold">
                {TXT_FELL_IN_TRAP}
              </Morceau>
            )}
            {evite && (
              <button onClick={() => setEtape(microDoc ? 4 : 3)} className="btn btn-primary w-full">
                {TXT_NEXT_FINAL}
              </button>
            )}
          </div>
        )}

        {etape === (microDoc ? 4 : 3) && (
          <div className="mt-4 space-y-4">
            <div className="rounded-2xl border border-line bg-cream/60 p-4">
              <p className="text-[11px] font-bold text-mute">{TXT_SYNTHESIS_QUESTION}</p>
              <p className="mt-1.5 text-sm font-bold leading-relaxed">
                {qcm?.question ?? '—'}
              </p>
            </div>

            {fragile && (
              <div className="rounded-2xl border border-gold-soft bg-gold-soft/50 p-4">
                <p className="text-[11px] font-bold text-forest-deep">{TXT_WEAKEST_LESSON}</p>
                <p className="mt-1.5 text-sm font-bold">{titreLecon(fragile)}</p>
                <button
                  onClick={() => onRelireLecon(fragile)}
                  className="btn btn-gold mt-3 w-full text-sm"
                >
                  {TXT_REREAD_LESSON}
                </button>
              </div>
            )}

            {questions.length > 0 && (
              <div>
                <p className="text-xs font-bold text-ink-soft">
                  {TXT_DEFERRED_QUESTIONS.replace('{n}', nb(questions.length))}
                </p>
                <div className="mt-2 space-y-2">
                  {questions.map((q) => (
                    <div
                      key={q.id}
                      className="flex items-start gap-2 rounded-2xl border border-line bg-paper p-3"
                    >
                      <p className="flex-1 text-sm leading-relaxed">{q.texte}</p>
                      <button
                        onClick={() => setGardeesVues((p) => ({ ...p, [q.id]: true }))}
                        className="shrink-0 rounded-lg bg-sage px-2 py-1 text-[10px] font-bold text-forest-deep"
                      >
                        {TXT_SOLVED}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <AudioMourchidBloc uniteId={uniteId} compact />

            <Morceau>
              {TXT_UNIT_COMPLETE.replace('{n}', nb(u.numero)).replace('{t}', u.titre).replace('{p}', nb(u.poidsBac))}
            </Morceau>

            <button
              onClick={() => onEnregistrer('')}
              className="btn btn-primary w-full text-base"
            >
              {TXT_CROSS_BRIDGE}
            </button>
          </div>
        )}
      </main>

      <footer className="mt-4">
        <p className="text-center text-xs text-mute">
          {TXT_BRIDGE_DATE.replace('{d}', formatJourAr(new Date().toISOString().slice(0, 10)))}
        </p>
      </footer>
    </div>
  );
}
