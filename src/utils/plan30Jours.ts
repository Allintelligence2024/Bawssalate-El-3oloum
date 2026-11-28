// خطة مراجعة 30 يومًا في علوم الطبيعة والحياة — مبنية تلقائيًّا على بيانات التلميذ الحقيقية.
// لا حاسبة معدل ولا مدخلات يدوية: تقرأ الدروس الهشّة، الاسترجاع المستحق (SM-2)،
// نتائج الامتحانات التجريبية، اختبار التموضع، أخطاء المنهجية، وثقل الوحدات في البكالوريا.

import { UNITES, titreLecon } from '../data/programme';
import type { Etat } from '../types';
import { ajouterJours, aujourdhui, differenceJours } from './dates';
import { niveauUnite } from './diagnostic';
import { statsParUnite } from './statsUnite';

export type TypeActionPlanScience = 'revision' | 'lecon' | 'fakh' | 'examen' | 'repos_leger';

export interface JourPlanScience {
  cle: string; // مثال: j-01 .. j-30
  index: number; // 1..30
  dateIso: string;
  jourSemaineAr: string;
  estWeekend: boolean; // الجمعة أو السبت في الجزائر
  estAujourdhui: boolean;
  uniteId?: string;
  uniteTitre?: string;
  lessonId?: string;
  actionType: TypeActionPlanScience;
  titre: string;
  raisonDonnees: string;
  etapes: string[];
  minutes: number;
  priorite: 'haute' | 'normale' | 'detente';
}

export interface Plan30JoursScience {
  jours: JourPlanScience[];
  aujourdhui: JourPlanScience;
  resumeDonnees: {
    fragiles: number;
    dues: number;
    terminees: number;
    totalLecons: number;
    unitesPrioritaires: string[];
    joursAvantBac: number | null;
    minutesParJour: number;
    sourcePrincipale: string;
  };
}

const JOURS_SEMAINE_AR = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

function jourSemaineUtc(iso: string): number {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return 0;
  return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]))).getUTCDay();
}

interface CandidatLecon {
  uniteId: string;
  uniteTitre: string;
  lessonId: string;
  actionType: 'revision' | 'lecon';
  score: number;
  raisonDonnees: string;
  etapes: string[];
  priorite: 'haute' | 'normale';
}

/**
 * يبني خطة 30 يومًا في العلوم انطلاقًا من بيانات التلميذ الفعلية:
 * 1. الدروس الهشّة أو المستحقّة للاسترجاع (SM-2)
 * 2. الدروس الجارية التي لم تُختم بعد
 * 3. الوحدات التي ظهرت ضعيفة في الامتحانات التجريبية أو اختبار التموضع
 * 4. الدروس غير المنتهية مرتّبة حسب ثقل الوحدة في البكالوريا (poidsBac)
 * 5. إيقاع الأسبوع الجزائري: الأحد ← الخميس مراجعة مركّزة، الجمعة راحة خفيفة، السبت تطبيق/فخاخ/امتحان.
 */
export function genererPlan30JoursScience(
  etat: Etat,
  auj: string = aujourdhui(),
): Plan30JoursScience {
  const statsUnites = statsParUnite(etat);
  const statParId = new Map(statsUnites.map((s) => [s.uniteId, s]));

  // الوحدات التي ظهرت فيها أخطاء في الامتحانات التجريبية السابقة
  const frequenceFaibleExamen = new Map<number, number>();
  for (const ex of etat.examens ?? []) {
    for (const num of ex.unitesFaibles ?? []) {
      frequenceFaibleExamen.set(num, (frequenceFaibleExamen.get(num) ?? 0) + 1);
    }
  }

  let fragilesTotal = 0;
  let duesTotal = 0;
  let termineesTotal = 0;
  let totalLecons = 0;

  const candidats: CandidatLecon[] = [];

  for (const unite of UNITES) {
    const stat = statParId.get(unite.id);
    const diagRaw = etat.diagnostic?.parUnite[unite.id];
    const diag = diagRaw ? niveauUnite(diagRaw) : null;
    const erreursExam = frequenceFaibleExamen.get(unite.numero) ?? 0;
    const faibleCouverture = Boolean(stat && stat.drillsTotal > 0 && stat.couverture < 0.35);

    for (const lid of unite.lessonIds) {
      totalLecons++;
      const p = etat.progression[lid];
      const estTerminee = p?.statut === 'terminee';
      const estEnCours = p?.statut === 'en_cours';
      const estFragile = Boolean(p?.fragile);
      const estDue = Boolean(estTerminee && p?.prochaineRevision && p.prochaineRevision <= auj);

      if (estTerminee) termineesTotal++;
      if (estFragile) fragilesTotal++;
      if (estDue) duesTotal++;

      let score = unite.poidsBac * 12;
      let actionType: 'revision' | 'lecon' = 'lecon';
      let raisonDonnees = `وحدة ذات أولوية عالية في البكالوريا (${unite.titre}).`;
      let priorite: 'haute' | 'normale' = unite.poidsBac >= 4 ? 'haute' : 'normale';
      let etapes: string[] = [
        `اقرأ ملخّص درس «${titreLecon(lid)}» وركّز على الآلية العلمية.`,
        'أغلق الشاشة وأعد صياغة الفكرة الأساسية من ذاكرتك.',
        `تجنّب فخّ الوحدة: ${unite.piegesAr[0] ?? 'الخلط بين الوصف والتفسير.'}`,
      ];

      if (estFragile) {
        score += 140;
        actionType = 'revision';
        priorite = 'haute';
        raisonDonnees = `درس هشّ في «${unite.titre}» حسب تقدّمك — تثبيته اليوم يمنع نسيانه.`;
        etapes = [
          'أنجز جلسة استرجاع قصيرة لهذا الدرس قبل قراءة الحلّ.',
          `راجع نقطة الخلل وتحقّق من فخّ الوحدة: ${unite.piegesAr[0] ?? 'تحليل المعطيات قبل الاستنتاج.'}`,
          'اختم بسؤالين سريعين من التدريبات لتثبيت المفهوم.',
        ];
      } else if (estDue) {
        score += 120;
        actionType = 'revision';
        priorite = 'haute';
        raisonDonnees = `حان موعد استرجاع هذا الدرس اليوم حسب نظام التكرار المتباعد.`;
        etapes = [
          'استرجع أفكار الدرس من ذاكرتك في 5 دقائق.',
          'اربط المصطلحات العلمية بالوثيقة أو الرسم الوظيفي.',
          'قيّم تذكّرك بصدق لتُضبط المراجعة القادمة تلقائيًّا.',
        ];
      } else if (estEnCours) {
        score += 95;
        actionType = 'lecon';
        priorite = 'haute';
        raisonDonnees = `بدأت هذا الدرس سابقًا في «${unite.titre}» — إكماله اليوم يحفظ تسلسل الفهم.`;
        etapes = [
          'أكمل المراحل المتبقية من الدرس دون انقطاع.',
          'توقّف عند الكلمات المفتاحية التي يطلبها المصحّح.',
          'أنجز اختبار الفهم السريع في نهاية الدرس.',
        ];
      } else if (!estTerminee) {
        score += 55;
        if (erreursExam > 0) {
          score += 35 + erreursExam * 10;
          priorite = 'haute';
          raisonDonnees = `رصدنا تعثّرًا في «${unite.titre}» خلال الامتحان التجريبي — هذا الدرس يغلق الفجوة.`;
        } else if (diag === 'fragile') {
          score += 30;
          priorite = 'haute';
          raisonDonnees = `اختبار التموضع أشار إلى حاجتك لتقوية «${unite.titre}».`;
        } else if (faibleCouverture) {
          score += 12;
          raisonDonnees = `درس أساسي لم يُنجَز بعد في «${unite.titre}» مع تغطية تمارين منخفضة.`;
        }
      } else {
        // درس منتهٍ ومستقرّ — يُستعمل للمراجعة الدورية المتأخرة في الأيام الأخيرة من الخطة
        score += erreursExam * 20 + (diag === 'fragile' ? 18 : 0) - 30;
        actionType = 'revision';
        priorite = 'normale';
        raisonDonnees = `مراجعة تثبيتية لدرس منتهٍ في «${unite.titre}» للحفاظ على الجاهزية حتى الباك.`;
        etapes = [
          'مرور سريع على بطاقة الدرس والآلية العلمية (5 دقائق).',
          'طبّق على تعليمة «حلّل» أو «فسّر» مرتبطة بالوحدة.',
        ];
      }

      candidats.push({
        uniteId: unite.id,
        uniteTitre: unite.titre,
        lessonId: lid,
        actionType,
        score,
        raisonDonnees,
        etapes,
        priorite,
      });
    }
  }

  candidats.sort((a, b) => b.score - a.score || a.lessonId.localeCompare(b.lessonId));

  const joursAvantBac = etat.dateBac
    ? Math.max(0, differenceJours(auj, etat.dateBac))
    : null;
  const objectifBase = etat.objectif === 18 ? 30 : etat.objectif === 10 ? 18 : 24;
  const bonusProximite = joursAvantBac !== null && joursAvantBac <= 35 ? 5 : 0;
  const minutesParJour = objectifBase + bonusProximite;
  const aDesFautesMethodo = (etat.carnet?.length ?? 0) > 0;

  // تحديد الوحدات الأكثر أولوية للعرض في ملخّص الخطة
  const unitesPrioritaires: string[] = [];
  for (const c of candidats) {
    if (!unitesPrioritaires.includes(c.uniteTitre)) {
      unitesPrioritaires.push(c.uniteTitre);
    }
    if (unitesPrioritaires.length >= 3) break;
  }

  const sourcePrincipale =
    fragilesTotal > 0
      ? `تثبيت ${fragilesTotal} درس هشّ أولًا ثم استكمال أولويات الباك`
      : duesTotal > 0
        ? `استرجاع ${duesTotal} درس مستحقّ اليوم ثم التقدّم في الوحدات الأثقل`
        : frequenceFaibleExamen.size > 0
          ? 'مبنية على نقاط ضعفك في الامتحانات التجريبية وثقل الوحدات'
          : etat.diagnostic
            ? 'مبنية على نتائج اختبار التموضع وثقل وحدات البكالوريا'
            : 'مبنية على تقدّمك الحالي وترتيب الوحدات الأثقل في البكالوريا';

  const jours: JourPlanScience[] = [];
  let idxCandidat = 0;

  for (let i = 0; i < 30; i++) {
    const dateIso = ajouterJours(auj, i);
    const dow = jourSemaineUtc(dateIso); // 0=الأحد .. 5=الجمعة, 6=السبت
    const estVendredi = dow === 5;
    const estSamedi = dow === 6;
    const estAujourdhui = i === 0;
    const cle = `j-${String(i + 1).padStart(2, '0')}`;

    // الجمعة: تثبيت خفيف بلا إرهاق (إلا إذا كان اليوم الأول وفيه درس هشّ جدًّا؟ نبقيه خفيفًا وصحيًّا)
    if (estVendredi) {
      jours.push({
        cle,
        index: i + 1,
        dateIso,
        jourSemaineAr: JOURS_SEMAINE_AR[dow],
        estWeekend: true,
        estAujourdhui,
        actionType: 'repos_leger',
        titre: 'مراجعة خفيفة + راحة ذهنية',
        raisonDonnees: 'الجمعة في الخطة مخصّص لتثبيت الذاكرة بهدوء وتفادي الإرهاق.',
        etapes: [
          'جولة سريعة (5 دقائق) في صيّاد الفخاخ أو استرجاع بطاقة واحدة.',
          'أغلق الكتب واسترح — التثبيت العصبي يحدث أثناء الراحة.',
        ],
        minutes: 10,
        priorite: 'detente',
      });
      continue;
    }

    // السبت: تطبيق فعلي (امتحان تجريبي أو فخاخ ومنهجية حسب سجلّ أخطاء التلميذ)
    if (estSamedi) {
      const numeroSemaine = Math.floor(i / 7);
      const faireFakh = aDesFautesMethodo ? numeroSemaine % 2 === 0 : numeroSemaine % 2 === 1;
      jours.push({
        cle,
        index: i + 1,
        dateIso,
        jourSemaineAr: JOURS_SEMAINE_AR[dow],
        estWeekend: true,
        estAujourdhui,
        actionType: faireFakh ? 'fakh' : 'examen',
        titre: faireFakh ? 'تصحيح الفخاخ والمنهجية العلمية' : 'تطبيق أسبوعي على موضوع بكالوريا',
        raisonDonnees: faireFakh
          ? aDesFautesMethodo
            ? `لديك ${etat.carnet!.length} خطأ منهجي مسجّل — السبت مثالي لإغلاق الفخاخ المتكرّرة.`
            : 'تدريب أسبوعي على فخاخ التصحيح الرسمية لتجنّب ضياع النقاط السهلة.'
          : 'اختبار عملي لما راجعته طوال الأسبوع بوضعيات على نمط الباك.',
        etapes: faireFakh
          ? [
              'اصطد 6 فخاخ على الأقل في «صيّاد الفخاخ».',
              'لاحظ الفرق الدقيق بين «حلّل» و«فسّر» و«استنتج».',
            ]
          : [
              'اقرأ السياق وحدّد المشكل العلمي قبل قراءة الوثائق.',
              'أنجز وضعية تجريبية وقارن إجابتك بعناصر التصحيح.',
            ],
        minutes: faireFakh ? 15 : 35,
        priorite: 'normale',
      });
      continue;
    }

    const cible = candidats[idxCandidat % candidats.length];
    idxCandidat++;

    jours.push({
      cle,
      index: i + 1,
      dateIso,
      jourSemaineAr: JOURS_SEMAINE_AR[dow],
      estWeekend: false,
      estAujourdhui,
      uniteId: cible.uniteId,
      uniteTitre: cible.uniteTitre,
      lessonId: cible.lessonId,
      actionType: cible.actionType,
      titre: titreLecon(cible.lessonId),
      raisonDonnees: cible.raisonDonnees,
      etapes: cible.etapes,
      minutes: cible.actionType === 'revision' ? Math.max(12, minutesParJour - 8) : minutesParJour,
      priorite: cible.priorite,
    });
  }

  return {
    jours,
    aujourdhui: jours[0],
    resumeDonnees: {
      fragiles: fragilesTotal,
      dues: duesTotal,
      terminees: termineesTotal,
      totalLecons,
      unitesPrioritaires,
      joursAvantBac,
      minutesParJour,
      sourcePrincipale,
    },
  };
}
