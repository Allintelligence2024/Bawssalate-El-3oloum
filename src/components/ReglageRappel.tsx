// «أنا» — التذكير اليومي المحلّي (P2.4): اختياري، مرّة في اليوم، الساعة من اختيار التلميذ.
// على المتصفح: نقول صراحة أن الجدولة غير ممكنة حين يكون التطبيق مغلقًا.

import { useEffect, useState } from 'react';
import type { Etat } from '../types';
import {
  activerRappel,
  desactiverRappel,
  obtenirAdaptateur,
  prochainRappel,
  reglageRappel,
  TEXTES_RAPPEL,
  type ResultatActivation,
} from '../utils/rappels';

interface Props {
  etat: Etat;
  onChanger: (r: { actif: boolean; heure: string }) => void;
}

export default function ReglageRappel({ etat, onChanger }: Props) {
  const r = reglageRappel(etat);
  const [heure, setHeure] = useState(r.heure);
  const [disponible, setDisponible] = useState<boolean | null>(null);
  const [occupe, setOccupe] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    let vivant = true;
    void obtenirAdaptateur().then((a) => vivant && setDisponible(a.disponible()));
    return () => {
      vivant = false;
    };
  }, []);

  function messageErreur(res: ResultatActivation): string | null {
    if (res.ok) return null;
    if (res.raison === 'heure_invalide') return 'اكتب الساعة بالشكل 19:30.';
    if (res.raison === 'permission_refusee') return 'رفض الجهاز الإذن بالإشعارات. يمكنك السماح به من إعدادات الهاتف ثم إعادة المحاولة.';
    return 'التذكير يعمل في تطبيق أندرويد فقط — على المتصفح لا يمكن إرسال تذكير والتطبيق مغلق.';
  }

  async function basculer(): Promise<void> {
    setOccupe(true);
    setErreur(null);
    try {
      if (r.actif) {
        await desactiverRappel();
        onChanger({ actif: false, heure });
      } else {
        const res = await activerRappel(heure);
        if (res.ok) onChanger({ actif: true, heure });
        else setErreur(messageErreur(res));
      }
    } finally {
      setOccupe(false);
    }
  }

  async function changerHeure(nouvelle: string): Promise<void> {
    setHeure(nouvelle);
    if (!r.actif) {
      onChanger({ actif: false, heure: nouvelle });
      return;
    }
    const res = await activerRappel(nouvelle);
    if (res.ok) onChanger({ actif: true, heure: nouvelle });
    else setErreur(messageErreur(res));
  }

  const prochain = prochainRappel(heure);

  return (
    <section className="card mt-5 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">تذكير يومي</p>
          <p className="mt-2 text-xs leading-relaxed text-mute">
            إشعار واحد في اليوم، في الساعة التي تختارها، بنصّ ثابت لا يحمل علامة ولا لومًا. يبقى على جهازك ولا يُرسل شيئًا.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={r.actif}
          disabled={occupe || disponible === false}
          onClick={() => void basculer()}
          className={`relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
            r.actif ? 'bg-forest' : 'bg-line'
          }`}
          aria-label={r.actif ? 'إيقاف التذكير' : 'تفعيل التذكير'}
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-paper transition-all ${r.actif ? 'left-1' : 'left-6'}`}
          />
        </button>
      </div>

      <label className="mt-4 flex items-center justify-between gap-3 text-sm">
        <span className="font-bold">الساعة</span>
        <input
          type="time"
          value={heure}
          onChange={(e) => void changerHeure(e.target.value)}
          className="field w-32 text-center tnum"
          aria-label="ساعة التذكير"
        />
      </label>

      {disponible === false && (
        <p className="mt-3 text-[11px] leading-relaxed text-mute">
          أنت على المتصفح: التذكير يعمل في تطبيق أندرويد فقط. الإعداد يُحفظ وسيُطبَّق حين تفتح التطبيق على الهاتف.
        </p>
      )}
      {r.actif && disponible && prochain && (
        <p className="mt-3 text-[11px] text-mute">
          التذكير القادم: {prochain.toLocaleString('ar-DZ', { weekday: 'long', hour: '2-digit', minute: '2-digit' })}
        </p>
      )}
      {erreur && <p className="mt-3 text-xs leading-relaxed text-secondary">{erreur}</p>}

      <details className="mt-3 text-[11px] text-mute">
        <summary className="cursor-pointer font-bold">ماذا سيُكتب في التذكير؟</summary>
        <ul className="mt-1.5 space-y-1">
          {TEXTES_RAPPEL.map((t) => (
            <li key={t.corps}>«{t.corps}»</li>
          ))}
        </ul>
      </details>
    </section>
  );
}
