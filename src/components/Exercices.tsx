// التدريبات — 620 سؤالًا (500 اختيار + 120 تعريفًا محوّلًا) موزّعة على 49 محورًا.
// جولة تكيّفية من 10 أسئلة لكل محور (P3.1: سلّم درجات — نجاحان ↑، خطآن ↓ + دعوة للدرس). لا مؤقّت ولا نسبة مئوية:
// الإجابة الخاطئة رسالة لطيفة + إعادة ترتيب الخيارات، والصحيحة تُسجَّل في الحالة.

import { useState } from 'react';
import type { Etat } from '../types';
import { DOMAINES, UNITES, UNITE_PAR_ID, type ItemChemin } from '../data/programme';
import { AXES, TOTAL_QCM, TOTAL_DEFS } from '../data/drills/axes';
import type { AxeDrill } from '../data/drills/axes';
import type { ItemDrill } from '../data/drills/types';
import type { QcmLecon } from '../data/qcmLecons';
import { nb } from '../utils/dates';
import { itemFait, itemVerrouille } from '../utils/moteur';
import { chargerDomaineDeUnite } from '../utils/drills';
import {
  appliquerReponse,
  bilanAdaptatif,
  demarrerAdaptatif,
  prochainItemAdaptatif,
  TAILLE_SESSION_ADAPTATIVE,
  type EtatAdaptatif,
  type Evenement,
} from '../utils/adaptatif';
import { ChoixUnique } from './Communs';
import { IcoCarnet, IcoCible, IcoDiplome, IcoOutils, IcoRetour, IcoTamrin, IcoVerrou } from './Icones';

interface Props {
  etat: Etat;
  onItemReussi: (id: string) => void;
  onOuvrirAtelier: () => void;
  onOuvrirImmunite: () => void;
  onOuvrirOrogenese: () => void;
  onOuvrirStructureTerre: () => void;
  onOuvrirMethodo: () => void;
  onOuvrirExamen: () => void;
  onOuvrirFlashcards: () => void;
  /** مخطّطات للتسمية (P1.6) */
  onOuvrirSchemas: () => void;
  /** التركيب الحرّ — 11 وضعية (P1.3) */
  onOuvrirSyntheses: () => void;
  /** بنية مواضيع البكالوريا (P1.1) */
  onOuvrirSujets: () => void;
  /** دعوة الدرس بعد خطأين (P1.4 ↔ P3.1) */
  onOuvrirLecon: (lessonId: string) => void;
}

type Portee = { kind: 'axe'; axe: AxeDrill };
type Vue =
  | { type: 'choix' }
  | { type: 'ateliers' }
  | { type: 'liste' }
  | { type: 'seance'; portee: Portee; pool: ItemDrill[]; adaptatif: EtatAdaptatif; courant: ItemDrill }
  | { type: 'bilan'; portee: Portee; adaptatif: EtatAdaptatif };

const TAILLE_JOUR = TAILLE_SESSION_ADAPTATIVE;

export default function Exercices({
  etat,
  onItemReussi,
  onOuvrirAtelier,
  onOuvrirImmunite,
  onOuvrirOrogenese,
  onOuvrirStructureTerre,
  onOuvrirMethodo,
  onOuvrirExamen,
  onOuvrirFlashcards,
  onOuvrirSchemas,
  onOuvrirSyntheses,
  onOuvrirSujets,
  onOuvrirLecon,
}: Props) {
  const [vue, setVue] = useState<Vue>({ type: 'choix' });
  const [enCharge, setEnCharge] = useState(false);
  const reussis = new Set(Object.keys(etat.drills ?? {}));
  // القفل الخطّي مثل مساري تمامًا: محاور الوحدة تُفتح حين يُفتح أوّل بند منها في الطريق.
  const debloquees = unitesDebloquees(etat);

  async function demarrer(portee: Portee): Promise<void> {
    setEnCharge(true);
    try {
      const tous = await chargerDomaineDeUnite(portee.axe.u);
      const pool = tous.filter((i) => i.a === portee.axe.id);
      const adaptatif = demarrerAdaptatif(pool);
      const courant = prochainItemAdaptatif(pool, adaptatif, reussis);
      if (!courant) {
        setVue({ type: 'bilan', portee, adaptatif });
        return;
      }
      setVue({ type: 'seance', portee, pool, adaptatif, courant });
    } finally {
      setEnCharge(false);
    }
  }

  // درس الوحدة الذي نقترحه بعد خطأين: الجاري أو الأول غير المُنهى، وإلا أول درس
  function leconAConseiller(u: number): string {
    const unite = UNITES.find((x) => x.numero === u);
    if (!unite) return '';
    const ids = [...(unite.prerequis ?? []), ...unite.lessonIds];
    return ids.find((id) => etat.progression[id]?.statut === 'en_cours') ?? ids.find((id) => etat.progression[id]?.statut !== 'terminee') ?? ids[0];
  }

  if (vue.type === 'seance') {
    return (
      <Seance
        vue={vue}
        onItemReussi={onItemReussi}
        onReponse={(juste) =>
          setVue((v) => (v.type === 'seance' ? { ...v, adaptatif: appliquerReponse(v.adaptatif, v.courant, juste).etat } : v))
        }
        onSuivant={() =>
          setVue((v) => {
            if (v.type !== 'seance') return v;
            if (v.adaptatif.historique.length >= TAILLE_JOUR) return { type: 'bilan', portee: v.portee, adaptatif: v.adaptatif };
            const suivant = prochainItemAdaptatif(v.pool, v.adaptatif, reussis);
            return suivant ? { ...v, courant: suivant } : { type: 'bilan', portee: v.portee, adaptatif: v.adaptatif };
          })
        }
        onOuvrirCours={() => onOuvrirLecon(leconAConseiller(vue.portee.axe.u))}
        onArreter={() => setVue({ type: 'bilan', portee: vue.portee, adaptatif: vue.adaptatif })}
      />
    );
  }

  if (vue.type === 'bilan') {
    const b = bilanAdaptatif(vue.adaptatif);
    const marches = Array.from({ length: vue.adaptatif.max - vue.adaptatif.min + 1 }, (_, k) => (vue.adaptatif.min + k) as 1 | 2 | 3);
    return (
      <div className="mx-auto max-w-3xl px-4 pb-28 pt-8">
        <section className="card p-6">
          <p className="eyebrow">حصيلة الجولة · {vue.portee.axe.titre}</p>
          <h1 className="font-naskh mt-2 text-2xl font-black leading-tight">{b.phrase}</h1>
          <div className="mt-4 flex items-end gap-2" aria-label="سلّم الدرجات">
            {marches.map((m) => (
              <div key={m} className="flex flex-col items-center gap-1">
                <div
                  className={`w-12 rounded-t-xl ${m <= b.sommet ? 'bg-forest' : 'bg-line'} ${m === b.finale ? 'ring-2 ring-gold' : ''}`}
                  style={{ height: `${24 + m * 16}px` }}
                />
                <span className="text-[11px] font-bold text-mute">{m === 1 ? 'أساس' : m === 2 ? 'متوسّط' : 'متقدّم'}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm text-ink-soft">
            {b.total === 0
              ? 'لا أسئلة متاحة في هذا المحور بعد.'
              : `${nb(b.total)} أسئلة · أعلى درجة: ${b.sommet === 1 ? 'الأساس' : b.sommet === 2 ? 'المتوسّطة' : 'المتقدّمة'} · انتهيت على ${b.finale === 1 ? 'الأساس' : b.finale === 2 ? 'المتوسّطة' : 'المتقدّمة'}.`}
          </p>
          {vue.adaptatif.max < 3 && (
            <p className="mt-2 text-[11px] leading-relaxed text-mute">
              الدرجة المتقدّمة تُفتح حين تصل أسئلتها الموثّقة إلى البنك — لا نعرض سلّمًا بدرجة فارغة.
            </p>
          )}
          <div className="mt-5 grid gap-2">
            <button type="button" onClick={() => void demarrer(vue.portee)} className="btn btn-primary w-full text-sm">
              جولة أخرى في هذا المحور
            </button>
            <button type="button" onClick={() => setVue({ type: 'liste' })} className="btn btn-ghost w-full text-sm">
              رجوع إلى المحاور
            </button>
          </div>
        </section>
      </div>
    );
  }

  // ───────────── شاشة الاختيار: QCM أم ورشات ─────────────
  if (vue.type === 'choix') {
    return (
      <div className="mx-auto max-w-3xl px-4 pb-28 pt-8">
        <header className="mb-6 flex items-start gap-3">
          <img
            src="/mascotte.png"
            alt="مستكشف بوصلة العلوم"
            className="h-14 w-14 shrink-0 object-contain sm:h-16 sm:w-16"
          />
          <div className="min-w-0 flex-1">
            <p className="eyebrow">التدريبات</p>
            <h1 className="font-naskh mt-1 text-3xl font-bold leading-tight">
              ماذا تريد أن تدرّب اليوم؟
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-mute">
              أربعة مسارات للتدريب: أسئلة QCM من البرنامج الرسمي، ورشات تركيبية تبني فيها المعلومة
              بيدك ثم تسترجعها من الذاكرة، أو تمارين المنهجية التي تدرّبك على طريقة الإجابة، أو
              امتحانًا تجريبيًا يضعك في وضعية البكالوريا كاملة.
            </p>
          </div>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <button
            type="button"
            onClick={() => setVue({ type: 'liste' })}
            className="card group p-5 text-right transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-1 hover:border-forest hover:shadow-[0_18px_36px_-22px_rgba(20,61,46,0.6)]"
          >
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-sage-soft text-forest transition-colors group-hover:bg-forest group-hover:text-paper">
              <span className="block h-6 w-6">
                <IcoCible />
              </span>
            </span>
            <h2 className="font-naskh mt-3 text-lg font-bold">أسئلة QCM</h2>
            <p className="mt-1 text-sm leading-relaxed text-mute">
              {nb(TOTAL_QCM + TOTAL_DEFS)} سؤالًا على {nb(AXES.length)} محورًا · جولات من{' '}
              {nb(TAILLE_JOUR)} أسئلة، بلا مؤقّت.
            </p>
            <p className="mt-2 text-[11px] leading-relaxed text-mute">
              سلّم تكيّفي: تبدأ من الأساس، نجاحان متتاليان يرفعانك درجة، وخطآن يعيدانك درجة مع دعوة لفتح الدرس.
            </p>
            <span className="mt-3 inline-block text-sm font-bold text-forest transition-transform group-hover:translate-x-1">
              ابدأ ←
            </span>
          </button>

          <button
            type="button"
            onClick={onOuvrirExamen}
            className="card group p-5 text-right transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-1 hover:border-secondary hover:shadow-[0_18px_36px_-22px_rgba(38,77,56,0.55)]"
          >
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary-soft text-secondary transition-colors group-hover:bg-secondary group-hover:text-paper">
              <span className="block h-6 w-6">
                <IcoDiplome />
              </span>
            </span>
            <h2 className="font-naskh mt-3 text-lg font-bold">الامتحان التجريبي</h2>
            <p className="mt-1 text-sm leading-relaxed text-mute">
              وضعية بكالوريا كاملة: استرجاع المعارف ثم استغلال وثيقتين · بلا مؤقّت وبلا نسبة
              مئوية.
            </p>
            <span className="mt-3 inline-block text-sm font-bold text-forest transition-transform group-hover:translate-x-1">
              ابدأ ←
            </span>
          </button>

          <button
            type="button"
            onClick={onOuvrirFlashcards}
            className="card group p-5 text-right transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-1 hover:border-sage hover:shadow-[0_18px_36px_-22px_rgba(47,93,71,0.45)]"
          >
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-sage-soft text-forest transition-colors group-hover:bg-forest group-hover:text-paper">
              <span className="block h-6 w-6">
                <IcoCarnet />
              </span>
            </span>
            <h2 className="font-naskh mt-3 text-lg font-bold">البطاقات</h2>
            <p className="mt-1 text-sm leading-relaxed text-mute">
              استرجاع · دليل · فخّ — ثلاث بطاقات لكل درس أنهيته، في صناديق تعود غدًا أو بعد ثلاثة أيام أو بعد أسبوع.
            </p>
            <span className="mt-3 inline-block text-sm font-bold text-forest transition-transform group-hover:translate-x-1">
              ابدأ ←
            </span>
          </button>

          <button
            type="button"
            onClick={onOuvrirSchemas}
            className="card group p-5 text-right transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-1 hover:border-sage hover:shadow-[0_18px_36px_-22px_rgba(47,93,71,0.45)]"
          >
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-sage-soft text-forest transition-colors group-hover:bg-forest group-hover:text-paper">
              <span className="block h-6 w-6">
                <IcoCible />
              </span>
            </span>
            <h2 className="font-naskh mt-3 text-lg font-bold">مخطّطات للتسمية</h2>
            <p className="mt-1 text-sm leading-relaxed text-mute">
              المشبك، الصانعة الخضراء، الميتوكندري، الغوص، أغلفة الأرض، الترجمة — انقر الرقم ثمّ الاسم.
              {Object.keys(etat.schemas ?? {}).length ? ` مكتمل: ${nb(Object.keys(etat.schemas ?? {}).length)} من 6.` : ''}
            </p>
            <span className="mt-3 inline-block text-sm font-bold text-forest transition-transform group-hover:translate-x-1">
              ابدأ ←
            </span>
          </button>

          <button
            type="button"
            onClick={onOuvrirSyntheses}
            className="card group p-5 text-right transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-1 hover:border-sage hover:shadow-[0_18px_36px_-22px_rgba(47,93,71,0.45)]"
          >
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-sage-soft text-forest transition-colors group-hover:bg-forest group-hover:text-paper">
              <span className="block h-6 w-6">
                <IcoCarnet />
              </span>
            </span>
            <h2 className="font-naskh mt-3 text-lg font-bold">التركيب الحرّ</h2>
            <p className="mt-1 text-sm leading-relaxed text-mute">
              الجزء الثالث من الموضوع: سند، تعليمة، تكتب أنت بلوحة المفاتيح ثمّ تقارن بعناصر الإجابة — وضعية لكلّ وحدة من الوحدات الإحدى عشرة.
            </p>
            <span className="mt-3 inline-block text-sm font-bold text-forest transition-transform group-hover:translate-x-1">
              ابدأ ←
            </span>
          </button>

          {/* « بنك المواضيع » (PDF) retiré — remplacé par la structure des sujets (P1.1, sans documents ni corrigé). */}
          <button
            type="button"
            onClick={onOuvrirSujets}
            className="card group p-5 text-right transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-1 hover:border-sage hover:shadow-[0_18px_36px_-22px_rgba(47,93,71,0.45)]"
          >
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-sage-soft text-forest transition-colors group-hover:bg-forest group-hover:text-paper">
              <span className="block h-6 w-6">
                <IcoCible />
              </span>
            </span>
            <h2 className="font-naskh mt-3 text-lg font-bold">بنية مواضيع البكالوريا</h2>
            <p className="mt-1 text-sm leading-relaxed text-mute">
              2020 · 2021 · 2023 — التمارين، السلّم، التعليمات وأفعالها وما يُنتظر من كلّ فعل. بلا وثائق ولا تصحيح.
            </p>
            <span className="mt-3 inline-block text-sm font-bold text-forest transition-transform group-hover:translate-x-1">
              افتح ←
            </span>
          </button>

          <button
            type="button"
            onClick={() => setVue({ type: 'ateliers' })}
            className="card group p-5 text-right transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-1 hover:border-gold hover:shadow-[0_18px_36px_-22px_rgba(47,93,71,0.55)]"
          >
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gold-soft/60 text-gold transition-colors group-hover:bg-gold group-hover:text-paper">
              <span className="block h-6 w-6">
                <IcoOutils />
              </span>
            </span>
            <h2 className="font-naskh mt-3 text-lg font-bold">ورشات الخرائط الذهنية</h2>
            <p className="mt-1 text-sm leading-relaxed text-mute">
              {nb(4)} ورشات: المجال الأول، المناعة، التكتونية، بنية الأرض — ترتيب، ربط، استرجاع
              نشط.
            </p>
            <span className="mt-3 inline-block text-sm font-bold text-forest transition-transform group-hover:translate-x-1">
              ابدأ ←
            </span>
          </button>

          <button
            type="button"
            onClick={onOuvrirMethodo}
            className="card group p-5 text-right transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-1 hover:border-forest hover:shadow-[0_18px_36px_-22px_rgba(20,61,46,0.6)]"
          >
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-sage-soft text-forest transition-colors group-hover:bg-forest group-hover:text-paper">
              <span className="block h-6 w-6">
                <IcoTamrin />
              </span>
            </span>
            <h2 className="font-naskh mt-3 text-lg font-bold">تمارين المنهجية</h2>
            <p className="mt-1 text-sm leading-relaxed text-mute">
              أربط المطلوب بالدليل في {nb(4)} مستويات: القدوة، التمرين الموجه، المستقل،
              تشخيص الخطأ.
            </p>
            <span className="mt-3 inline-block text-sm font-bold text-forest transition-transform group-hover:translate-x-1">
              ابدأ ←
            </span>
          </button>

          {/* « تحدي المستوى 3 » retiré : la banque ne contient aucun item n:3 (120 n1 + 500 n2).
              À réintroduire avec les 80 items relus de P1.5. */}
        </div>
      </div>
    );
  }

  // ───────────── الورشات الأربع ─────────────
  if (vue.type === 'ateliers') {
    const domaine1Pret = DOMAINES[0].unites.every((uid) =>
      itemFait(etat, { type: 'jalon', uniteId: uid })
    );
    const immunitePret = itemFait(etat, { type: 'jalon', uniteId: 'u4' });
    const orogenesePret = itemFait(etat, { type: 'jalon', uniteId: 'u11' });
    const structurePret = itemFait(etat, { type: 'jalon', uniteId: 'u10' });

    return (
      <div className="mx-auto max-w-3xl px-4 pb-28 pt-8">
        <button
          type="button"
          onClick={() => setVue({ type: 'choix' })}
          className="btn btn-ghost mb-4 gap-1.5 px-3 py-1.5 text-xs"
        >
          <span className="block h-4 w-4">
            <IcoRetour />
          </span>
          رجوع للاختيار
        </button>

        <header className="mb-6">
          <p className="eyebrow">التدريبات</p>
          <h1 className="font-naskh mt-1 text-3xl font-bold leading-tight">ورشات الخرائط الذهنية</h1>
          <p className="mt-2 text-sm leading-relaxed text-mute">
            {nb(4)} ورشات: ترتيب البطاقات وربط المفاهيم ثم استرجاع نشط — بلا كتابة، وبلا خطأ
            يُعاقَب عليه.
          </p>
        </header>

        <section className="card overflow-hidden border-forest/30">
          <div className="bg-gradient-to-l from-forest to-forest-deep p-5 text-paper">
            <p className="text-[11px] font-bold text-mute">محطة تركيبية جديدة</p>
            <h2 className="font-naskh mt-1 text-xl font-bold">ورشة تركيب المجال الأول</h2>
            <p className="mt-2 text-sm leading-relaxed text-paper/80">
              اربط بين المعلومة الوراثية، بنية البروتين ووظيفته في خريطة واحدة، ثم استرجعها من
              الذاكرة.
            </p>
            {domaine1Pret ? (
              <button
                type="button"
                onClick={onOuvrirAtelier}
                className="btn mt-4 w-full bg-paper text-forest-deep hover:bg-sage"
              >
                {etat.ateliers?.d1 ? 'إعادة فتح الورشة ✓' : 'ابدأ الورشة'}
              </button>
            ) : (
              <p className="mt-3 flex items-start gap-1.5 text-[12px] leading-relaxed text-paper/75">
                <span className="mt-0.5 block h-4 w-4 shrink-0">
                  <IcoVerrou />
                </span>
                تُفتح بعد إنهاء جسور الوحدات الخمس في المجال الأول.
              </p>
            )}
          </div>
        </section>

        <section className="card mt-4 overflow-hidden border-secondary/30">
          <div className="bg-sage-soft p-5">
            <p className="text-[11px] font-bold text-forest">
              ورشة تطبيقية · الوحدة {nb(4)}
            </p>
            <h2 className="font-naskh mt-1 text-xl font-bold">آلية الدفاع عن الذات</h2>
            <p className="mt-2 text-sm leading-relaxed text-mute">
              رتّب استجابة LB وLT4 وLT8 من التعرف إلى التكاثر ثم النتيجة المناعية.
            </p>
            {immunitePret ? (
              <button
                type="button"
                onClick={onOuvrirImmunite}
                className="btn btn-primary mt-4 w-full"
              >
                {etat.ateliers?.immunite ? 'إعادة فتح ورشة المناعة ✓' : 'ابدأ ورشة المناعة'}
              </button>
            ) : (
              <p className="mt-3 flex items-start gap-1.5 text-[12px] leading-relaxed text-mute">
                <span className="mt-0.5 block h-4 w-4 shrink-0">
                  <IcoVerrou />
                </span>
                {`تُفتح بعد إنهاء جسر الوحدة ${nb(4)} (الدفاع عن الذات).`}
              </p>
            )}
          </div>
        </section>

        <section className="card mt-4 overflow-hidden border-gold/30">
          <div className="bg-gold-soft/50 p-5">
            <p className="text-[11px] font-bold text-forest-deep">ورشة تركيبية · التكتونية</p>
            <h2 className="font-naskh mt-1 text-xl font-bold">من التباعد إلى السلسلة الجبلية</h2>
            <p className="mt-2 text-sm leading-relaxed text-mute">
              رتّب المراحل الخمس لتشكل الأوروجينيز: التمدد، اتساع الحوض، التقارب ثم التصادم.
            </p>
            {orogenesePret ? (
              <button
                type="button"
                onClick={onOuvrirOrogenese}
                className="btn btn-primary mt-4 w-full"
              >
                {etat.ateliers?.orogenese
                  ? 'إعادة فتح ورشة الأوروجينيز ✓'
                  : 'ابدأ ورشة الأوروجينيز'}
              </button>
            ) : (
              <p className="mt-3 flex items-start gap-1.5 text-[12px] leading-relaxed text-mute">
                <span className="mt-0.5 block h-4 w-4 shrink-0">
                  <IcoVerrou />
                </span>
                {`تُفتح بعد إنهاء جسر الوحدة ${nb(11)} (البنيات الجيولوجية).`}
              </p>
            )}
          </div>
        </section>

        <section className="card mt-4 overflow-hidden border-sage/50">
          <div className="bg-paper p-5">
            <p className="text-[11px] font-bold text-forest">ورشة موجهة · بنية الأرض</p>
            <h2 className="font-naskh mt-1 text-xl font-bold">بناء مقطع الكرة الأرضية</h2>
            <p className="mt-2 text-sm leading-relaxed text-mute">
              رتّب الأغلفة حسب العمق، ثم اربط كل غلاف بحالته الفيزيائية والدليل الزلزالي المناسب.
            </p>
            {structurePret ? (
              <button
                type="button"
                onClick={onOuvrirStructureTerre}
                className="btn btn-primary mt-4 w-full"
              >
                {etat.ateliers?.structure
                  ? 'إعادة فتح ورشة بنية الأرض ✓'
                  : 'ابدأ ورشة بنية الأرض'}
              </button>
            ) : (
              <p className="mt-3 flex items-start gap-1.5 text-[12px] leading-relaxed text-mute">
                <span className="mt-0.5 block h-4 w-4 shrink-0">
                  <IcoVerrou />
                </span>
                {`تُفتح بعد إنهاء جسر الوحدة ${nb(10)} (بنية الكرة الأرضية).`}
              </p>
            )}
          </div>
        </section>
      </div>
    );
  }

  // ───────────── قائمة المحاور (QCM) ─────────────
  return (
    <div className="mx-auto max-w-3xl px-4 pb-28 pt-8">
      <button
        type="button"
        onClick={() => setVue({ type: 'choix' })}
        className="btn btn-ghost mb-4 gap-1.5 px-3 py-1.5 text-xs"
      >
        <span className="block h-4 w-4">
          <IcoRetour />
        </span>
        رجوع للاختيار
      </button>
      <header className="mb-6">
        <p className="eyebrow">التدريبات</p>
        <h1 className="font-naskh mt-1 text-3xl font-bold leading-tight">تمارين البرنامج</h1>
        <p className="mt-2 text-sm leading-relaxed text-mute">
          {nb(TOTAL_QCM)} سؤال اختيار و{nb(TOTAL_DEFS)} تعريفًا موزّعة على {nb(AXES.length)} محورًا من
          البرنامج الرسمي. جولة واحدة = {nb(TAILLE_JOUR)} أسئلة، بلا مؤقّت وبلا حساب نسبة. الخطأ يُعيد
          ترتيب الخيارات فقط، وكل محاولة تُعلّم.
        </p>
        <p className="mt-2 text-[12px] leading-relaxed text-mute">
          🔒 القفل خطّي مثل «مساري»: لا تُفتح محاور الوحدة إلا بعد إنهاء جسر الوحدة التي قبلها — هكذا
          تبقى التدريبات مواكبة لدراستك، لا سابقة لها.
        </p>
      </header>

      <section className="card p-5">
        <p className="eyebrow">حصيلتك</p>
        <p className="mt-1 text-lg font-bold text-ink-soft">
          أجبت {nb(reussis.size)} من {nb(TOTAL_QCM + TOTAL_DEFS)}
        </p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-sage/40" aria-hidden="true">
          <div
            className="h-full rounded-full bg-forest transition-[width]"
            style={{ width: `${Math.min(100, (reussis.size / (TOTAL_QCM + TOTAL_DEFS)) * 100)}%` }}
          />
        </div>
      </section>

      <div className="mt-6 space-y-5">
        {DOMAINES.map((d) => (
          <section key={d.id} className="card overflow-hidden">
            <div className="border-b border-line bg-paper px-5 py-3">
              <p className="font-naskh text-base font-bold">{d.titre}</p>
            </div>
            <div className="divide-y divide-line">
              {d.unites.map((uid) => {
                const u = UNITE_PAR_ID[uid];
                const verrouillee = !debloquees.has(u.numero);
                const axes = AXES.filter((a) => a.u === u.numero);
                const items = axes.reduce((s, a) => s + a.qcm + a.defs, 0);
                const faits = axes.reduce((s, a) => s + compteFaitsAxe(etat, a), 0);
                return (
                  <div key={uid} className="px-5 py-4">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className={`text-sm font-bold ${verrouillee ? 'text-mute' : 'text-ink'}`}>
                        {nb(u.numero)}. {u.titre}
                      </p>
                      {verrouillee ? (
                        <span className="grid h-5 w-5 shrink-0 place-items-center text-mute">
                          <span className="block h-4 w-4">
                            <IcoVerrou />
                          </span>
                        </span>
                      ) : (
                        <span className="shrink-0 text-[11px] text-mute">
                          {nb(faits)} / {nb(items)}
                        </span>
                      )}
                    </div>
                    {verrouillee ? (
                      <p className="mt-2 text-[11px] leading-relaxed text-mute">
                        {`يُفتح هذا القسم بعد إنهاء جسر الوحدة ${nb(u.numero - 1)} — تمامًا كما في مساري.`}
                      </p>
                    ) : (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {axes.map((a) => {
                          const f = compteFaitsAxe(etat, a);
                          const total = a.qcm + a.defs;
                          const complet = f === total;
                          return (
                            <button
                              key={a.id}
                              type="button"
                              disabled={enCharge}
                              onClick={() => demarrer({ kind: 'axe', axe: a })}
                              className={`chip text-[11px] font-bold transition-colors ${
                                complet
                                  ? 'border-forest bg-sage text-forest-deep'
                                  : 'border-line bg-paper text-ink-soft hover:border-sage'
                              }`}
                            >
                              {a.titre.replace(/^\d+\.\d+\s*—?\s*/, '')}{' '}
                              <span className="font-normal opacity-70">
                                ({complet ? '✓' : `${nb(f)}/${nb(total)}`})
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

// عناصر المحور المُجابة — نقرأها من قائمة المعرّفات الثابتة في البنك (بلا تحميل الجزء)
function compteFaitsAxe(etat: Etat, a: AxeDrill): number {
  const faits = etat.drills ?? {};
  return a.ids.filter((id) => faits[id]).length;
}

// أرقام الوحدات المُفتوحة — نفس قاعدة مساري: أوّل بند للوحدة غير مقفل في الطريق.
function unitesDebloquees(etat: Etat): Set<number> {
  const ok = new Set<number>();
  for (const u of UNITES) {
    const items: ItemChemin[] = [
      ...(u.prerequis ?? []).map((id) => ({ type: 'lecon' as const, id })),
      ...u.lessonIds.map((id) => ({ type: 'lecon' as const, id })),
    ];
    if (!itemVerrouille(etat, items[0])) ok.add(u.numero);
  }
  return ok;
}

// ───────────── الجولة ─────────────

interface PropsSeance {
  vue: Extract<Vue, { type: 'seance' }>;
  onItemReussi: (id: string) => void;
  onReponse: (juste: boolean) => void;
  onSuivant: () => void;
  onOuvrirCours: () => void;
  onArreter: () => void;
}

const NOM_MARCHE: Record<1 | 2 | 3, string> = { 1: 'الأساس', 2: 'المتوسّطة', 3: 'المتقدّمة' };

function Seance({ vue, onItemReussi, onReponse, onSuivant, onOuvrirCours, onArreter }: PropsSeance) {
  const [repondu, setRepondu] = useState(false);
  const [evenement, setEvenement] = useState<Evenement>(null);
  const [inviter, setInviter] = useState(false);
  const item = vue.courant;
  const numero = vue.adaptatif.historique.length + 1;

  // P-1.3 (D6) : quand l'explication n'est pas encore rédigée (items def avec e:""),
  // on n'affiche PAS la réponse à la place — l'élève relit la leçon, la réponse reste sienne.
  const qcm: QcmLecon = {
    question: item.q,
    options: item.o,
    explication: item.e || 'هذا مصطلح من البرنامج: راجع بطاقة الدرس ثم أعِد المحاولة.',
  };

  const dernier = numero >= TAILLE_JOUR;

  return (
    <div className="mx-auto max-w-3xl px-4 pb-28 pt-8">
      <header className="mb-5 flex items-center justify-between gap-3">
        <button type="button" onClick={onArreter} className="btn btn-ghost px-3 py-1.5 text-xs">
          ← إنهاء الجولة
        </button>
        <p className="text-sm font-bold text-mute">
          {nb(numero)} من {nb(TAILLE_JOUR)} · الدرجة {NOM_MARCHE[vue.adaptatif.niveau]}
        </p>
      </header>

      <div className="h-1.5 overflow-hidden rounded-full bg-sage/40" aria-hidden="true">
        <div
          className="h-full rounded-full bg-forest transition-[width]"
          style={{ width: `${((numero - 1) / TAILLE_JOUR) * 100}%` }}
        />
      </div>

      <div className="card mt-6 p-6">
        <div className="mb-4 flex items-center gap-2">
          {item.def ? (
            <span className="chip border-gold/50 bg-gold-soft/40 text-[10px] font-bold text-forest-deep">
              تعريف
            </span>
          ) : (
            <span className="chip border-line bg-paper text-[10px] font-bold text-mute">
              {item.n === 1 ? 'سهل' : item.n === 3 ? 'صعب' : 'متوسط'}
            </span>
          )}
        </div>
        <div key={item.id}>
          <ChoixUnique
            qcm={qcm}
            source="exercice"
            onPremiereTentative={(juste) => {
              const t = appliquerReponse(vue.adaptatif, item, juste);
              setEvenement(t.evenement);
              setInviter(t.inviterCours);
              onReponse(juste);
            }}
            onValide={() => {
              onItemReussi(item.id);
              setRepondu(true);
            }}
          />
        </div>

        {evenement === 'montee' && (
          <p className="mt-4 rounded-2xl border border-sage bg-sage-soft/60 p-3 text-sm font-bold text-forest-deep">
            ↑ ارتقيت درجة على السلّم. الأسئلة التالية من الدرجة {NOM_MARCHE[vue.adaptatif.niveau]}.
          </p>
        )}
        {(evenement === 'descente' || evenement === 'plancher') && (
          <div className="mt-4 rounded-2xl border border-gold-soft bg-gold-soft/40 p-3.5">
            <p className="text-sm font-bold text-forest-deep">
              {evenement === 'descente' ? '↓ ننزل درجة لتثبيت الأساس — هذا جزء من الصعود، لا سقوط.' : 'خطآن متتاليان على درجة الأساس — الدرس قبل التدريب.'}
            </p>
            {inviter && (
              <button type="button" onClick={onOuvrirCours} className="mt-2 text-sm font-bold text-forest hover:underline">
                افتح درس الوحدة ←
              </button>
            )}
          </div>
        )}

        {repondu && (
          <button
            type="button"
            onClick={() => {
              setRepondu(false);
              setEvenement(null);
              setInviter(false);
              onSuivant();
            }}
            className="btn btn-primary mt-5 w-full"
          >
            {dernier ? 'إنهاء الجولة ←' : 'السؤال التالي ←'}
          </button>
        )}
      </div>
    </div>
  );
}
