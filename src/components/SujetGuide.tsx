// «الموضوع كاملًا · 1-2-3» — حلّ موضوع بكالوريا كامل، خطوة بخطوة، بطريقة بوصلة العلوم.
//
// Quatre temps par consigne, dans l'ordre de la méthode :
//   1. افهم   — le verbe, ce qu'attend le correcteur, les documents du corrigé ;
//   2. تحقّق  — la checklist en trois points du verbe (aucune note, aucune sanction) ;
//   3. اكتب   — l'élève écrit d'abord, sur son brouillon (jamais la solution d'emblée) ;
//   4. قارن   — les éléments de réponse **officiels** sont révélés, puis l'élève s'auto-évalue 0/1/2.
//
// Règles tenues : aucun /20, aucun chrono qui punit, aucune consigne verrouillée, et le parcours
// n'écrit jamais `statut`, `phases` ni `jalons` (Preuve ≠ Complétion).

import { useMemo, useRef, useState } from 'react';
import type { Etat } from '../types';
import type { NiveauMaitrise } from '../utils/entrainement';
import { avancementGuide, parcoursSujet, type EtapeGuide, type ParcoursSujet } from '../utils/parcoursSujet';
import { SUJETS_AVEC_BRIQUES } from '../data/briques';
import { MENTION_STATUT } from '../data/methodologie/attenduVerbes';
import { nb } from '../utils/dates';
import TiroirBoussole, { type OngletTiroir } from './TiroirBoussole';
import { IcoRetour } from './Icones';

interface Props {
  /** Le sujet à parcourir ; le parcours est construit ici (l'écran est déjà paresseux). */
  sujetId: string;
  /** Parcours déjà construit — tests et prévisualisation d'un état vide. */
  parcoursImpose?: ParcoursSujet;
  maitrise?: Record<string, NiveauMaitrise>;
  brouillons?: Record<string, string>;
  etat: Etat;
  onEvaluer: (cle: string, niveau: NiveauMaitrise) => void;
  onBrouillon: (cle: string, texte: string) => void;
  /** Ouvre l'atelier de briques du même sujet (gabarit pilote) — optionnel. */
  onOuvrirBriques?: () => void;
  onFermer: () => void;
}

type Temps = 1 | 2 | 3 | 4;

const TEMPS: { id: Temps; label: string; icone: string }[] = [
  { id: 1, label: 'افهم', icone: '١' },
  { id: 2, label: 'تحقّق', icone: '٢' },
  { id: 3, label: 'اكتب', icone: '٣' },
  { id: 4, label: 'قارن', icone: '٤' },
];

const NIVEAUX: { q: NiveauMaitrise; label: string; sous: string }[] = [
  { q: 2, label: 'كتبتُ جوابًا كاملًا', sous: 'البنية كلّها موجودة' },
  { q: 1, label: 'كتبتُ جوابًا ناقصًا', sous: 'عنصر أو اثنان ناقصان' },
  { q: 0, label: 'لم أعرف ماذا أكتب', sous: 'نعود إلى الدرس، بلا لوم' },
];

export default function SujetGuide({
  sujetId,
  parcoursImpose,
  maitrise,
  brouillons,
  etat,
  onEvaluer,
  onBrouillon,
  onOuvrirBriques,
  onFermer,
}: Props) {
  const construit = useMemo(() => parcoursSujet(sujetId), [sujetId]);
  const parcours = parcoursImpose ?? construit;
  const etapes: EtapeGuide[] = parcours?.etapes ?? [];
  const [index, setIndex] = useState(() => {
    // On reprend à la première consigne non travaillée, jamais à zéro par principe.
    const premier = etapes.findIndex((e) => maitrise?.[e.cle] === undefined);
    return premier === -1 ? 0 : premier;
  });
  const [temps, setTemps] = useState<Temps>(1);
  const [coches, setCoches] = useState<boolean[]>(() => [false, false, false]);
  const [revele, setRevele] = useState(false);
  const [fin, setFin] = useState(false);
  const dialogue = useRef<HTMLDialogElement>(null);
  const [tiroir, setTiroir] = useState<OngletTiroir | null>(null);

  const etape: EtapeGuide | undefined = etapes[index];
  const avancement = useMemo(
    () => (parcours ? avancementGuide(parcours, maitrise) : { travaillees: 0, total: 0, termine: false }),
    [parcours, maitrise],
  );
  const aBriques = parcours ? SUJETS_AVEC_BRIQUES.includes(parcours.sujet.id) : false;

  function aller(i: number): void {
    if (i < 0 || i >= etapes.length) return;
    setIndex(i);
    setTemps(1);
    setCoches([false, false, false]);
    setRevele(false);
  }

  function evaluer(niveau: NiveauMaitrise): void {
    if (!etape) return;
    onEvaluer(etape.cle, niveau);
    if (index + 1 < etapes.length) {
      aller(index + 1);
    } else {
      setFin(true);
    }
  }

  function ouvrirTiroir(onglet: OngletTiroir): void {
    setTiroir(onglet);
    dialogue.current?.showModal();
  }

  // ───────────── sujet introuvable ─────────────
  if (!parcours) {
    return (
      <div dir="rtl" className="mx-auto max-w-2xl px-4 py-10 text-center">
        <p className="petit doux">هذا الموضوع غير موجود في الدليل — لا نخترع موضوعًا.</p>
        <button type="button" className="btn--secondaire mt-4 w-full" onClick={onFermer}>
          رجوع إلى المواضيع
        </button>
      </div>
    );
  }

  // ───────────── fin de parcours ─────────────
  if (fin) {
    const bilan = avancementGuide(parcours, maitrise);
    return (
      <div dir="rtl" className="mx-auto max-w-2xl px-4 pb-28 pt-8">
        <p className="oeil">{parcours.titre} · انتهى</p>
        <h1 className="titre-1 mt-1">الموضوع كامل</h1>
        <p className="petit doux mt-2 leading-relaxed">
          عملتَ على {nb(bilan.total)} تعليمة، وقيّمت منها {nb(bilan.travaillees)}. هذه ليست نقطة
          بكالوريا ولا نسبة نجاح: هي أثرُ عملٍ يسمح لك بمعرفة ما تعيده.
        </p>
        <div className="carte mt-4 p-4">
          <p className="text-sm font-bold">ما التالي؟</p>
          <ul className="mt-2 list-disc space-y-1 ps-5 text-[13px] leading-relaxed text-mute">
            <li>أعد التعليمة التي قيّمتها بـ«لم أعرف» — بلا عجلة، بعد مراجعة الدرس.</li>
            <li>أعد الموضوع في جلسة ثانية، دون النظر إلى عناصر الإجابة.</li>
            <li>الموضوع التالي من نفس السنة ينتظرك في «الباك».</li>
          </ul>
        </div>
        <button type="button" className="btn--primaire mt-4 w-full" onClick={onFermer}>
          رجوع إلى المواضيع
        </button>
      </div>
    );
  }

  if (!etape) {
    return (
      <div dir="rtl" className="mx-auto max-w-2xl px-4 py-10 text-center">
        <p className="petit doux">هذا الموضوع لا يحتوي تعليمات مسجّلة.</p>
        <button type="button" className="btn--secondaire mt-4 w-full" onClick={onFermer}>
          رجوع
        </button>
      </div>
    );
  }

  const brouillon = brouillons?.[etape.cle] ?? '';
  const evaluation = maitrise?.[etape.cle];

  return (
    <div dir="rtl" className="mx-auto max-w-2xl px-4 pb-32 pt-6">
      {/* En-tête : où je suis dans le sujet, sans note ni pourcentage */}
      <div className="flex items-center justify-between gap-2">
        <button type="button" onClick={onFermer} className="btn-mini flex items-center gap-1">
          <span className="h-4 w-4"><IcoRetour /></span>
          خروج
        </button>
        <p className="oeil tnum">
          التمرين {nb(etape.exercice)} · التعليمة {nb(etape.numero)} من {nb(etapes.length)}
        </p>
      </div>

      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-line" aria-hidden>
        <div
          className="h-full rounded-full bg-forest transition-[width] duration-500"
          style={{ width: `${(avancement.travaillees / Math.max(1, avancement.total)) * 100}%` }}
        />
      </div>
      <p className="petit doux mt-1 tnum">
        {nb(avancement.travaillees)} / {nb(avancement.total)} تعليمة عملتَ عليها
        {etape.points !== null && ` · هذه التعليمة: ${nb(etape.points)} ن`}
      </p>

      {/* Les quatre temps de la méthode */}
      <div className="mt-3 flex gap-1.5" role="tablist" aria-label="أوقات الطريقة">
        {TEMPS.map((t) => {
          const actif = temps === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={actif}
              onClick={() => setTemps(t.id)}
              className={`flex-1 rounded-xl border px-2 py-2 text-[12px] font-bold transition ${
                actif ? 'border-forest bg-sage text-forest-deep' : 'border-line bg-paper text-mute'
              }`}
            >
              <span className="block text-[10px] opacity-70">{t.icone}</span>
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ── Temps 1 : افهم ── */}
      {temps === 1 && (
        <section className="carte mt-3 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip font-bold">{etape.verbe}</span>
            {etape.points !== null && <span className="chip tnum">{nb(etape.points)} ن</span>}
            {etape.surDocument && <span className="chip">بالوثيقة</span>}
          </div>
          <p className="mt-2 text-[14.5px] font-bold leading-relaxed text-ink">{etape.texte}</p>
          {etape.contexte && <p className="petit doux mt-2">{etape.contexte}</p>}

          <div className="mt-3 rounded-xl border border-line bg-bg px-3 py-2">
            <p className="text-[11px] font-extrabold text-forest">ما ينتظره المصحّح</p>
            <p className="mt-1 text-[13px] leading-relaxed text-ink">{etape.attendu}</p>
            <p className="mt-1 text-[10px] text-mute">{MENTION_STATUT.a_valider_enseignant}</p>
          </div>

          {etape.documents.length > 0 ? (
            <div className="mt-3">
              <p className="oeil">الوثائق (وصف نصّي)</p>
              <ul className="mt-1 list-disc space-y-1 ps-5 text-[12.5px] leading-relaxed text-mute">
                {etape.documents.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="petit doux mt-3">
              الوثيقة غير معروضة هنا (رسم أو جدول). اعتمد على وصفها في ورقة الامتحان، أو افتح
              «البوصلة» لمراجعة القاعدة.
            </p>
          )}

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <button type="button" className="btn--secondaire w-full text-xs" onClick={() => ouvrirTiroir('verbe')}>
              افتح البوصلة
            </button>
            <button type="button" className="btn--primaire w-full text-xs" onClick={() => setTemps(2)}>
              التالي · تحقّق
            </button>
          </div>
        </section>
      )}

      {/* ── Temps 2 : تحقّق ── */}
      {temps === 2 && (
        <section className="carte mt-3 p-4">
          <p className="oeil">ثلاثة تحقّقات قبل الكتابة</p>
          <p className="petit doux mt-1">
            ليست نقاطًا: مجرّد أسئلة تسألها لنفسك. لا شيء يُخصم إن تركتها فارغة.
          </p>
          <div className="mt-3 space-y-2">
            {etape.checklist.map((item, i) => {
              const coche = coches[i];
              return (
                <button
                  key={i}
                  type="button"
                  aria-pressed={coche}
                  onClick={() => setCoches((prev) => prev.map((v, j) => (j === i ? !v : v)))}
                  className={`flex w-full items-start gap-2 rounded-2xl border px-3 py-3 text-right text-[13px] font-bold leading-relaxed transition ${
                    coche
                      ? 'border-forest bg-sage text-forest-deep'
                      : 'border-line bg-paper text-ink hover:border-forest'
                  }`}
                >
                  <span
                    aria-hidden
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] ${
                      coche ? 'border-forest bg-forest text-paper' : 'border-line text-mute'
                    }`}
                  >
                    {coche ? '✓' : nb(i + 1)}
                  </span>
                  {item}
                </button>
              );
            })}
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <button type="button" className="btn--secondaire w-full text-xs" onClick={() => ouvrirTiroir('verificateur')}>
              الثلاثة تحقّقات · البوصلة
            </button>
            <button type="button" className="btn--primaire w-full text-xs" onClick={() => setTemps(3)}>
              التالي · اكتب
            </button>
          </div>
        </section>
      )}

      {/* ── Temps 3 : اكتب ── */}
      {temps === 3 && (
        <section className="carte mt-3 p-4">
          <label className="block">
            <span className="oeil">جوابي (يبقى على جهازي)</span>
            <textarea
              value={brouillon}
              onChange={(e) => onBrouillon(etape.cle, e.target.value)}
              rows={7}
              placeholder="ملاحظة ← مقارنة ← تفسير ← استنتاج"
              className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2 text-[13.5px] leading-relaxed"
            />
          </label>
          <p className="petit doux mt-1">
            اكتب أوّلًا، ولو بجملة واحدة. عناصر الإجابة لا تُفتح إلا بعد الكتابة.
          </p>
          {aBriques && onOuvrirBriques && (
            <button type="button" className="btn-mini mt-2 w-full" onClick={onOuvrirBriques}>
              لا أجد الصياغة · ركّب الجواب بالبنى (1-2-3)
            </button>
          )}
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <button type="button" className="btn--secondaire w-full text-xs" onClick={() => ouvrirTiroir('pieges')}>
              الفخاخ الشائعة
            </button>
            <button type="button" className="btn--primaire w-full text-xs" onClick={() => setTemps(4)}>
              التالي · قارن
            </button>
          </div>
        </section>
      )}

      {/* ── Temps 4 : قارن ── */}
      {temps === 4 && (
        <section className="carte mt-3 p-4">
          <p className="oeil">عناصر الإجابة الرسمية</p>
          {etape.elements.length === 0 ? (
            <p className="petit doux mt-2">
              لا تتوفّر عناصر إجابة مسجّلة لهذه التعليمة في الدليل. اعتمد على ورقة التصحيح الرسمية،
              أو اسأل أستاذك — لا نخترع جوابًا.
            </p>
          ) : !revele ? (
            <>
              <p className="petit doux mt-2">
                اقرأ جوابك مرّة أخيرة قبل الفتح. ثم قارن: ما الموجود عندك، وما الناقص؟
              </p>
              <button type="button" className="btn--secondaire mt-3 w-full text-xs" onClick={() => setRevele(true)}>
                أظهر عناصر الإجابة ({nb(etape.elements.length)})
              </button>
            </>
          ) : (
            <>
              <ol className="mt-2 list-decimal space-y-2 ps-5 text-[13px] leading-relaxed text-ink">
                {etape.elements.map((el, i) => (
                  <li key={i}>{el}</li>
                ))}
              </ol>
              {etape.sourceCorrige && <p className="mt-2 text-[10px] leading-relaxed text-mute">{etape.sourceCorrige}</p>}
            </>
          )}

          <div className="mt-4 rounded-xl border border-line bg-bg px-3 py-2">
            <p className="text-[12px] font-extrabold text-forest">كيف كان جوابي؟</p>
            <p className="petit doux mt-0.5">تقييمك أنت، لا نقطة رسمية. يُستعمل لاختيار ما تعيده.</p>
            <div className="mt-2 space-y-2">
              {NIVEAUX.map((n) => (
                <button
                  key={n.q}
                  type="button"
                  onClick={() => evaluer(n.q)}
                  className={`w-full rounded-2xl border px-3 py-2.5 text-right transition ${
                    evaluation === n.q ? 'border-forest bg-sage' : 'border-line bg-paper hover:border-forest'
                  }`}
                >
                  <span className="block text-[13px] font-bold text-ink">{n.label}</span>
                  <span className="mt-0.5 block text-[11px] text-mute">{n.sous}</span>
                </button>
              ))}
            </div>
          </div>

          {evaluation !== undefined && (
            <p className="petit doux mt-2">سُجّل تقييمك لهذه التعليمة. يمكنك تغييره في أيّ وقت.</p>
          )}
        </section>
      )}

      {/* Navigation : jamais bloquante */}
      <div className="mt-3 flex items-center justify-between gap-2">
        <button
          type="button"
          className="btn-mini"
          onClick={() => aller(index - 1)}
          disabled={index === 0}
          aria-label="التعليمة السابقة"
        >
          → السابق
        </button>
        <button type="button" className="btn-mini" onClick={() => setFin(true)}>
          أنهيت الموضوع
        </button>
        <button
          type="button"
          className="btn-mini"
          onClick={() => aller(index + 1)}
          disabled={index + 1 >= etapes.length}
          aria-label="التعليمة التالية"
        >
          التالي ←
        </button>
      </div>

      <dialog
        ref={dialogue}
        aria-label="البوصلة · مصدر حيّ"
        dir="rtl"
        onCancel={(e) => {
          e.preventDefault();
          dialogue.current?.close();
          setTiroir(null);
        }}
        onClose={() => setTiroir(null)}
        className="fixed inset-0 m-auto max-h-none w-[min(100%,44rem)] max-w-none border-0 bg-paper p-0 backdrop:bg-black/60"
      >
        <div className="flex h-[88dvh] flex-col">
          {tiroir && etape && (
            <TiroirBoussole
              document={`${parcours.titre} · ${etape.texte}`}
              verbe={etape.verbe}
              etat={etat}
              ongletInitial={tiroir}
              onFermer={() => {
                dialogue.current?.close();
                setTiroir(null);
              }}
              compact
            />
          )}
        </div>
      </dialog>
    </div>
  );
}
