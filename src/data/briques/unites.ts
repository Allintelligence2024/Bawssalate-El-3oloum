// Jeux de briques dérivés des situations de synthèse — toutes les unités (Phase 4).
//
// Ce module est **chargé à la demande** : il importe `syntheses.ts` (≈ 30 ko) et ne doit donc
// jamais entrer dans le chunk de démarrage. Il ne contient aucun texte scientifique : chaque jeu
// est découpé par `jeuDepuisSituation` dans une situation déjà écrite et déjà relue dans le
// dépôt. Ce qui est saisi ici, ce sont uniquement des **choix éditoriaux** (quelle situation,
// quel verbe de consigne, quelle ligne d'attendu).
//
// Conséquence assumée : ces jeux sont `a_valider_enseignant`. Ils ne sont pas jouables
// (`jeuxJouables`) et ne s'ouvrent que par la porte d'aperçu de l'écran 1-2-3.
//
// `u1` n'est pas ici : l'unité 1 a quatre jeux **actifs** écrits à la main depuis les exercices
// de méthodologie (`u1.ts`). Les autres unités n'ont qu'une situation découpée chacune.

import { situationsDeUnite } from '../syntheses';
import type { VerbeConsigne } from '../sujetsOfficiels';
import { jeuDepuisSituation } from './gabarit';
import type { JeuBriques } from './types';

interface ChoixUnite {
  /** Situation retenue quand l'unité en a plusieurs (par défaut : la première). */
  situation?: string;
  verbe: VerbeConsigne;
  /** Ligne affichée en tête de l'étape 1 : ce qu'attend le correcteur. */
  attendu: string;
}

export const CHOIX_UNITES: Record<string, ChoixUnite> = {
  u2: {
    verbe: 'بيِّن',
    attendu:
      'ربط التسلسل بالبنية الفراغية ثمّ بالوظيفة، مع مثال الهيموغلوبين: حمض أميني واحد في الموضع 6 يكفي لتغيير الكلّ.',
  },
  u3: {
    situation: 'u3b',
    verbe: 'بيِّن',
    attendu:
      'ربط البنية الفراغية للموقع الفعّال بالنشاط: الروابط التي تكسرها اليوريا والـβ-ميركابتوإيثانول، ثمّ دور الجذور 12 و41 و119 في التثبيت والتحفيز.',
  },
  u4: {
    verbe: 'بيِّن',
    attendu:
      'تمييز الخلطية من الخلوية بمعيار العامل الممرّض، ثمّ إظهار التعاون الخلوي: LT4 ← الأنترلوكين 2 (IL-2) ← تنشيط LB وLT8 المحسَّستين مسبقًا بالمستضد.',
  },
  u5: {
    verbe: 'اشرح',
    attendu:
      'التمييز بين السيالة على الليف (كهربائية، لا تتناقص سعتها مع المسافة) والانتقال عبر المشبك (كيميائي، بتأخّر ودور الكالسيوم والمبلّغ العصبي).',
  },
  u6: {
    verbe: 'بيِّن',
    attendu:
      'المرحلة الضوئية على مستوى أغشية التيلاكويد (الغرانوم) والمرحلة الكيموحيوية في الحشوة، والازدواج الطاقوي بينهما (ATP وNADPH,H⁺)، ومكان كلّ مرحلة في الصانعة الخضراء.',
  },
  u7: {
    verbe: 'اشرح',
    attendu:
      'ثلاث مراحل ومكان كلّ منها في الخلية، ثمّ تفسير الفرق في الحصيلة بين التنفّس والتخمّر (وجود الأكسجين لا كمّية الغلوكوز).',
  },
  u8: {
    verbe: 'بيِّن',
    attendu:
      'التكامل بين الخلية والمنظومة البيئية: تدفّق الطاقة في اتجاه واحد، ودورة المادة المغلقة.',
  },
  u9: {
    verbe: 'اشرح',
    attendu: 'التعريف انطلاقًا من السند، ثمّ أدلة الحركة (الزلزالية والباليومغناطيسية والجيولوجية) والمحرّك الحراري.',
  },
  u10: {
    verbe: 'بيِّن',
    attendu: 'كل موجة تكشف وسطًا مختلفًا: الانعكاس والانكسار يقودان إلى حدود عدم الاتصال ثمّ إلى نموذج الطبقات.',
  },
  u11: {
    // La consigne du sujet mêle deux verbes (« قارن … واشرح أصل الماغما ») et le modèle est
    // ordonné غوص → ماغما → تصادم : y glisser un rôle `comparaison` casserait l'ordre canonique
    // et l'élève qui suit l'ordre du modèle serait déclaré « hors ordre ». Le verbe déclaré est
    // donc `بيِّن`, et l'exigence de comparer reste portée par l'attendu (mêmes critères sur les
    // deux termes) — qui est ce que l'élève lit à l'étape 1.
    verbe: 'بيِّن',
    attendu:
      'نفس المعايير على الطرفين في جدول مقارنة: نوع الصفيحتين وكثافتهما، البنى التكتونية (خندق وبراكين مقابل طيّات وفوالق معكوسة)، والماغما؛ ثمّ استنتاج أنّ الغوص والتصادم مرحلتان متتاليتان.',
  },
};

/** Unités dont un jeu peut être dérivé (sans `u1`, qui a ses jeux actifs). */
export const UNITES_SYNTHESE = Object.keys(CHOIX_UNITES);

/** Le jeu d'une unité, découpé dans sa situation de synthèse. Vide si l'unité n'en a pas. */
export function jeuxSynthese(uniteId: string): JeuBriques[] {
  const choix = CHOIX_UNITES[uniteId];
  if (!choix) return [];
  const situations = situationsDeUnite(uniteId);
  const situation =
    (choix.situation ? situations.find((s) => s.id === choix.situation) : undefined) ?? situations[0];
  if (!situation) return [];
  return [
    jeuDepuisSituation(situation, {
      id: `jb:${uniteId}:e1`,
      verbe: choix.verbe,
      attendu: choix.attendu,
    }),
  ];
}
