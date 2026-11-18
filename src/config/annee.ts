// التقويم المدرسي — الملف الوحيد الذي يُحدَّث كل سنة (P2.3 / توصية التدقيق رقم 4).
// لا ثوابت وطنية مدفونة في منطق التطبيق: programme.ts وmoteur.ts وtypes.ts تقرأ من هنا.
//
// القاعدة: إن لم يُدرَج تقويم السنة الجارية بعد، يُشتقّ تقويم تقديري (الاثنين الثاني من سبتمبر،
// 10 جوان) ويُعلَّم `estime: true` — ويبقى تاريخ البكالوريا الحقيقي ما يُدخله التلميذ في «أنا».

export interface CalendrierScolaire {
  /** بداية الأسبوع 1 من التدرّج السنوي (ISO) */
  debut: string;
  /** تاريخ البكالوريا الافتراضي لهذه السنة (ISO) — يُستبدل بتاريخ التلميذ متى أدخله */
  bac: string;
  libelle: string;
  /** true إذا لم يكن التقويم مُدخَلًا يدويًّا بل مشتقًّا */
  estime: boolean;
}

/** التقاويم المؤكَّدة. أضف سطرًا كل صيف. */
export const CALENDRIERS: ReadonlyArray<CalendrierScolaire> = [
  { debut: '2026-09-14', bac: '2027-06-10', libelle: '2026–2027', estime: false },
];

/** عدد أيام ما بعد البكالوريا التي نعتبر فيها السنة جارية (نتائج، استدراك) */
const MARGE_APRES_BAC_JOURS = 45;

function iso(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

/** الاثنين الثاني من سبتمبر — تقدير لبداية الدروس عند غياب تقويم مؤكَّد */
function deuxiemeLundiSeptembre(annee: number): string {
  const premier = new Date(Date.UTC(annee, 8, 1)); // 1 septembre
  const jour = premier.getUTCDay(); // 0 = dimanche … 1 = lundi
  const decalage = (8 - jour) % 7; // jours jusqu'au premier lundi
  return iso(annee, 9, 1 + decalage + 7);
}

function calendrierEstime(anneeDebut: number): CalendrierScolaire {
  return {
    debut: deuxiemeLundiSeptembre(anneeDebut),
    bac: iso(anneeDebut + 1, 6, 10),
    libelle: `${anneeDebut}–${anneeDebut + 1} (تقديري)`,
    estime: true,
  };
}

function plusJours(isoDate: string, n: number): string {
  const d = new Date(isoDate + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** التقويم المناسب لتاريخ معيّن (ISO). مؤكَّد إن وُجد، وإلا مشتقّ. */
export function calendrierPour(isoAujourdhui: string): CalendrierScolaire {
  const confirme = CALENDRIERS.find(
    (c) => isoAujourdhui >= plusJours(c.debut, -MARGE_APRES_BAC_JOURS) && isoAujourdhui <= plusJours(c.bac, MARGE_APRES_BAC_JOURS),
  );
  if (confirme) return confirme;
  const annee = Number(isoAujourdhui.slice(0, 4));
  const mois = Number(isoAujourdhui.slice(5, 7));
  // قبل أوت: نحن في سنة بدأت في سبتمبر الماضي؛ من أوت فصاعدًا: السنة القادمة
  return calendrierEstime(mois >= 8 ? annee : annee - 1);
}
