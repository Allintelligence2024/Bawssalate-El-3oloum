// Jeux de briques — sujet Bac pilote 2025-1 (الموضوع الأول، دورة عادية).
//
// Chaque brique reprend un fragment **verbatim** des éléments de réponse du corrigé officiel
// (`src/data/corriges/c2025.ts`, A-009) ou du contexte du sujet
// (`src/data/sujets/s2024_2026.ts`). Rien n'est rédigé de neuf côté science.
//
// Statut : `a_valider_enseignant`. Le découpage en briques est un choix éditorial (quels
// fragments vont dans « observation » et lesquels dans « interprétation ») : il doit être relu
// avant d'être présenté comme un corrigé. L'élève, lui, voit la mention dans le tiroir.

import type { JeuBriques } from './types';
import { brique } from './types';

const SOURCE = 'corrigé 2025-1 · A-009';

export const JEUX_SUJET_2025_1: JeuBriques[] = [
  {
    id: 'jb:2025-1:1:1',
    document:
      'نصّ قصير: بروتينات RIP تكسر الرابطة بين الأدنين وسكر الريبوز في بعض جزيئات ARN فتفقده بنيته ووظيفته؛ تُستعمل في علاج بعض الأورام السرطانية.',
    question:
      'اكتب نصًّا علميًّا توضّح فيه دور كلّ نوع من ARN في تركيب البروتين وتأثير بروتينات RIP على الخلايا السرطانية.',
    // `نصّ علمي` (exercice 1) n'est pas une analyse de document : ses rôles sont
    // مقدّمة / عرض بالآليات / خاتمة. Tant que `BriqueRole` ne porte pas ces trois rôles
    // (arbitrage A-009), ce jeu ne peut pas être jugé sur une structure d'observation et de
    // comparaison au témoin : il reste hors du catalogue servi et attend la relecture.
    verbe: 'نصّ علمي',
    attendu: 'مقدّمة · عرض بالآليات وروابطها · خاتمة تجيب عن الإشكال.',
    // Pas d'entrée dans `structure` : un rôle absent de la structure n'est jamais exigé, donc
    // l'élève n'est pas jugé sur une grille qui ne correspond pas au verbe de la consigne.
    // Ce jeu est de toute façon `a_valider_enseignant` (jamais servi sans aperçu).
    structure: [],
    uniteId: 'u1',
    statut: 'a_valider_enseignant',
    briques: [
      brique('jb:2025-1:1:1', 1, 'observation', 'ARNm وARNr وARNt ثلاث جزيئات ARN تشارك في تركيب البروتين؛ RIP يكسر الرابطة أدنين–ريبوز فيفقد ARN بنيته.', 'سند الموضوع · 2025-1', 'a_valider_enseignant'),
      brique('jb:2025-1:1:1', 2, 'comparaison', 'ARNm ينقل المعلومة، ARNt ينقل الأحماض الأمينية، ARNr مكوّن للريبوزوم بموقعَي قراءة وتحفيز.', SOURCE, 'a_valider_enseignant'),
      brique('jb:2025-1:1:1', 3, 'interpretation', 'RIP يستهدف ARN في الخلايا السرطانية → توقّف تركيب البروتين → توقّف تكاثر الخلايا.', SOURCE, 'a_valider_enseignant'),
      brique('jb:2025-1:1:1', 4, 'conclusion', 'الأنواع الثلاثة تشارك في تركيب البروتين، وتفقد وظيفتها بوجود موادّ مثل RIP.', SOURCE, 'a_valider_enseignant'),
      brique('jb:2025-1:1:1', 5, 'piege', 'ARNm وحده كافٍ لتركيب بروتين كامل.', SOURCE, 'a_valider_enseignant'),
      brique('jb:2025-1:1:1', 6, 'piege', 'RIP يوقف تكاثر الخلايا لأنه يهضم البروتينات مباشرة.', SOURCE, 'a_valider_enseignant'),
    ],
  },
  {
    id: 'jb:2025-1:2:1',
    document:
      'الوثيقة 1: (أ) نسبة نمو السلالة العادية والطافرة بتركيزين من HCO₃⁻؛ (ب) رسم لصانعة السلالة العادية (بيرينويد) والطافرة (بدونه).',
    // La brique 1 cite les 80 % / 20 % qui viennent du الشكل (أ) : la question doit donc
    // autoriser les deux figures, sinon l'élève qui suit la consigne ne peut pas poser la
    // première observation.
    question: 'أبرز أثر الخصائص البنيوية للصانعة الخضراء على النمو باستغلال الشكلين (أ) و(ب).',
    verbe: 'بيِّن',
    attendu: 'إظهار العلاقة بين معطيين بالدليل، لا رأيًا.',
    // Structure dérivée des briques : `observation` (1), `comparaison` (2), `interpretation`
    // (3), `conclusion` (4). La comparaison est bien au programme ici (souche normale vs
    // souche mutée), elle n'est donc pas un rôle fantôme.
    structure: ['observation', 'comparaison', 'interpretation', 'conclusion'],
    uniteId: 'u6',
    statut: 'a_valider_enseignant',
    briques: [
      brique('jb:2025-1:2:1', 1, 'observation', 'السلالة العادية تنمو بنسبة 80 % في التركيز المنخفض، والطافرة لا تتعدّى 20 %.', SOURCE, 'a_valider_enseignant'),
      brique('jb:2025-1:2:1', 2, 'comparaison', 'الصانعتان متشابهتان (غلاف، حشوة، Rubisco، CA)، لكن العادية فقط تملك بيرينويدًا.', SOURCE, 'a_valider_enseignant'),
      brique('jb:2025-1:2:1', 3, 'interpretation', 'البيرينويد يجمع Rubisco وCA في حيّز واحد، فيرفع فعّالية تثبيت CO₂.', SOURCE, 'a_valider_enseignant'),
      brique('jb:2025-1:2:1', 4, 'conclusion', 'وجود البيرينويد يمنح القدرة على النمو في أوساط فقيرة بـ HCO₃⁻؛ وغيابه يحدّ من نموّ الطافرة.', SOURCE, 'a_valider_enseignant'),
      brique('jb:2025-1:2:1', 5, 'piege', 'الطافرة لا تنمو لأنها فقدت اليخضور كليًّا.', SOURCE, 'a_valider_enseignant'),
      brique('jb:2025-1:2:1', 6, 'piege', 'الفرق بين السلالتين في حجم الصانعة الخضراء فقط.', SOURCE, 'a_valider_enseignant'),
    ],
  },
];

export function jeuxSujet2025_1(): JeuBriques[] {
  return JEUX_SUJET_2025_1;
}
