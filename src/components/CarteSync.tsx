// بطاقة المزامنة — إعداد دائم في «أنا». تختفي تمامًا إذا لم تُفعَّل المزامنة (لا مفاتيح Supabase).
// المزامنة متوقّفة حتى يوافق التلميذ صراحةً (P0.2/P0.8)؛ هذه البطاقة تعرض الحالة وقائمة ما يُرسَل حرفيًّا.

import { useState, useSyncExternalStore } from 'react';
import { abonnerEtatEnvoi, etatEnvoi, envoyerSnapshot, consentementEtat, syncActive, jetonUtilisable, DONNEES_ENVOYEES, DONNEES_JAMAIS_ENVOYEES } from '../utils/sync';
import type { Etat } from '../types';

interface Props {
  etat: Etat;
  onChoix: (ok: boolean) => void;
}

/** القائمة الحرفية لما يُرسَل / لا يُرسَل — مشتركة بين شاشة الموافقة و«أنا». */
export function ListeDonneesSync({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? 'text-[11px] leading-relaxed' : 'text-xs leading-relaxed'}>
      <p className="font-bold text-forest-deep">ما الذي يُرسَل بالضبط؟</p>
      <ul className="mt-1 list-disc space-y-0.5 pr-4 text-mute">
        {DONNEES_ENVOYEES.map((d) => (
          <li key={d.libelle}>
            <span className="text-ink">{d.libelle}</span> — {d.detail}
          </li>
        ))}
      </ul>
      <p className="mt-2 font-bold text-forest-deep">ما الذي لا يُرسَل أبدًا؟</p>
      <ul className="mt-1 list-disc space-y-0.5 pr-4 text-mute">
        {DONNEES_JAMAIS_ENVOYEES.map((d) => (
          <li key={d}>{d}</li>
        ))}
      </ul>
    </div>
  );
}

// الإعداد الدائم — يُظهر الحالة الحالية ويزرّ التبديل.
export function ReglageSync({ etat, onChoix }: Props) {
  const [details, setDetails] = useState(false);
  const envoi = useSyncExternalStore(abonnerEtatEnvoi, () => etatEnvoi(etat.compte?.email), () => 'en_attente' as const);
  if (!syncActive()) return null;
  const c = consentementEtat(etat);
  const jetonSain = jetonUtilisable(etat.compte?.jeton);
  return (
    <section className="card mt-5 p-5">
      <p className="eyebrow">المزامنة مع المطوّر</p>
      <p className="mt-2 text-xs leading-relaxed text-mute">
        {!jetonSain ? 'المزامنة غير متاحة: رمز الحساب غير متوفّر أو غير آمن. تقدّمك يبقى على جهازك؛ تواصل مع المطوّر بشأن بيانات الخادم.' : c === 'oui'
          ? 'يُرسَل ملخّص تقدّمك دوريًّا في الخلفية عند توفّر الإنترنت. تُحفَظ كل بياناتك على هاتفك أولًا.'
          : 'لن يُرسَل شيء أبدًا. تقدّمك يبقى على هاتفك وحدك — وهذا حقّك كاملًا.'}
      </p>
      {c === 'oui' && jetonSain && <div className="mt-3 text-xs">
        <p role="status">{{ en_attente: 'بانتظار أول تأكيد للإرسال.', envoi: 'جارٍ إرسال الملخّص…',
          confirme: 'أكّد الخادم آخر إرسال.', erreur: 'لم يؤكّد الخادم الإرسال. لم يتغيّر تقدّمك في التطبيق.',
          hors_ligne: 'لا اتصال بالإنترنت. تقدّمك يبقى على الجهاز.' }[envoi]}</p>
        {(envoi === 'erreur' || envoi === 'hors_ligne') && <button type="button" className="btn btn-ghost mt-2" onClick={() => void envoyerSnapshot(etat)}>أعد محاولة الإرسال</button>}
      </div>}
      <button
        type="button"
        onClick={() => setDetails((v) => !v)}
        className="mt-2 text-xs font-bold text-forest underline-offset-2 hover:underline"
      >
        {details ? 'إخفاء التفاصيل' : 'ما الذي يُرسَل بالضبط؟'}
      </button>
      {details && (
        <div className="mt-2 rounded-2xl border border-line bg-cream p-3">
          <ListeDonneesSync compact />
        </div>
      )}
      <button
        onClick={() => onChoix(c !== 'oui')}
        disabled={!jetonSain && c !== 'oui'}
        className={`btn mt-4 w-full text-sm ${c === 'oui' ? 'btn-ghost' : 'btn-primary'}`}
      >
        {c === 'oui' ? 'إيقاف المزامنة' : 'تفعيل المزامنة'}
      </button>
    </section>
  );
}
