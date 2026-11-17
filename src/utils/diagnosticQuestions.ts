// أسئلة اختبار التموضع (P2.1) — مفصولة عن البيان كي لا يُحمَّل بنك QCM (≈ 90 kB) في حزمة الدخول.
// الأسئلة مأخوذة من بنك QCM الدروس (`qcmLecons.ts`، سؤال «التركيب» لأول درس وآخر درس في كل وحدة):
// اختيار حتميّ كي تبقى النتيجة قابلة للتكرار والاختبار.

import { UNITES, UNITE_PAR_ID, titreLecon } from '../data/programme';
import { QCM_LECONS } from '../data/qcmLecons';

export interface QuestionDiagnostic {
  uniteId: string;
  lessonId: string;
  question: string;
  /** الخيارات بترتيب البنك: الصحيح أولًا — يُخلط في الواجهة فقط */
  options: string[];
}

export const QUESTIONS_PAR_UNITE = 2;

/** أول درس وآخر درس في الوحدة يملكان QCM — سؤالا «التركيب». */
export function questionsDiagnostic(): QuestionDiagnostic[] {
  const out: QuestionDiagnostic[] = [];
  for (const u of UNITES) {
    const avecQcm = u.lessonIds.filter((id) => QCM_LECONS[id]);
    if (!avecQcm.length) continue;
    const choisis = avecQcm.length === 1 ? [avecQcm[0]] : [avecQcm[0], avecQcm[avecQcm.length - 1]];
    for (const lessonId of choisis.slice(0, QUESTIONS_PAR_UNITE)) {
      const q = QCM_LECONS[lessonId].synthese;
      out.push({ uniteId: u.id, lessonId, question: q.question, options: q.options });
    }
  }
  return out;
}

export function titreQuestion(q: QuestionDiagnostic): string {
  return `${UNITE_PAR_ID[q.uniteId]?.titre ?? ''} · ${titreLecon(q.lessonId)}`;
}
