// Téléchargement facultatif : l'état reflète le cache de la version ouverte, pas la qualité du réseau.
import { useEffect, useState } from 'react';
import { etatHorsLigne, type EtatHorsLigne } from '../utils/pwa';

export default function CarteHorsLigne() {
  const [etat, setEtat] = useState<EtatHorsLigne | null>(null);
  const [occupé, setOccupe] = useState(false);
  const [erreur, setErreur] = useState(false);

  async function verifier(telecharger = false) {
    setOccupe(true);
    setErreur(false);
    try { setEtat(await etatHorsLigne(telecharger)); }
    catch { setEtat(null); setErreur(true); }
    finally { setOccupe(false); }
  }

  useEffect(() => { void verifier(); }, []);
  const taille = etat ? Math.ceil(etat.octets / (1024 * 1024)) : null;
  return (
    <section className="card mt-5 p-5">
      <p className="eyebrow">العمل دون إنترنت</p>
      <p className="mt-2 text-xs leading-relaxed text-mute">
        نزّل الدروس والواجهة ومختبر البوصلة وورقتَي الطباعة وأعد المحاولة عند انقطاع الشبكة. الفيديو والملفات الخارجية ليست ضمن هذا التنزيل.
        {taille !== null && ` الحجم الكامل التقريبي على الجهاز ${taille} ميغابايت؛ استهلاك الإنترنت قد يختلف.`}
      </p>
      <p role="status" className="mt-2 text-sm font-bold text-forest-deep">
        {occupé ? 'جارٍ التحقّق أو التنزيل… يمكنك الانتظار أو العودة لاحقًا.' : erreur ? 'تعذّر التحقّق لهذا الإصدار. افتح التطبيق من متصفح يدعم التخزين وأعد المحاولة.' : !etat ? 'لم يُتحقّق بعد.' : etat.manquants === 0 ? 'الملفات المطلوبة لهذا الإصدار موجودة على الجهاز. اختبرها دون اتصال قبل الاعتماد عليها.' : `التنزيل غير مكتمل: ${etat.manquants} ملف من ${etat.total} غير موجود.`}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" disabled={occupé} onClick={() => void verifier(true)} className="btn btn-primary flex-1 text-sm">تنزيل / استكمال الملفات</button>
        <button type="button" disabled={occupé} onClick={() => void verifier()} className="btn btn-ghost flex-1 text-sm">تحقّق</button>
      </div>
    </section>
  );
}
