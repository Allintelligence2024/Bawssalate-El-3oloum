// Téléchargement facultatif, en deux niveaux : l'état reflète le cache de la version ouverte,
// pas la qualité du réseau. La coquille (interface) est toujours téléchargée ; le contenu
// lourd (leçons, laboratoire Boussole, PDF) ne l'est que si l'élève le demande, et son poids
// lui est annoncé avant de commencer — sur un forfait mobile, ce n'est pas un détail.
import { useEffect, useState } from 'react';
import { etatHorsLigne, type EtatHorsLigne } from '../utils/pwa';

/** En Mo, arrondi au dixième : plus lisible qu'un nombre d'octets, plus honnête qu'un arrondi entier. */
function mo(octets: number): string {
  return `${(octets / (1024 * 1024)).toFixed(1)}`;
}

export default function CarteHorsLigne() {
  const [coquille, setCoquille] = useState<EtatHorsLigne | null>(null);
  const [complet, setComplet] = useState<EtatHorsLigne | null>(null);
  const [occupé, setOccupe] = useState<'coquille' | 'complet' | null>(null);
  const [erreur, setErreur] = useState(false);

  async function verifier() {
    try {
      setCoquille(await etatHorsLigne(false, 'coquille'));
      setComplet(await etatHorsLigne(false, 'complet'));
      setErreur(false);
    } catch {
      setCoquille(null);
      setComplet(null);
      setErreur(true);
    }
  }

  async function telecharger(portee: 'coquille' | 'complet') {
    setOccupe(portee);
    setErreur(false);
    try {
      const etat = await etatHorsLigne(true, portee);
      if (portee === 'coquille') setCoquille(etat);
      else setComplet(etat);
    } catch {
      setErreur(true);
    } finally {
      setOccupe(null);
    }
  }

  useEffect(() => {
    void verifier();
  }, []);

  const resteCoquille = coquille ? coquille.manquants : null;
  const resteComplet = complet ? complet.manquants : null;

  return (
    <section className="card mt-5 p-5">
      <p className="eyebrow">العمل دون إنترنت</p>
      <p className="mt-2 text-xs leading-relaxed text-mute">
        الواجهة تُنزَّل تلقائيًا وتعمل دون شبكة. أمّا الدروس ومختبر البوصلة وورقتا الطباعة فهي ملفات
        ثقيلة: لا تُنزَّل إلّا إذا اخترت ذلك، ويُعلَن حجمها قبل البدء. الفيديو والملفات الخارجية ليست ضمن هذا التنزيل.
      </p>

      <p role="status" className="mt-3 text-sm font-bold text-forest-deep">
        {erreur
          ? 'تعذّر التحقّق لهذا الإصدار. افتح التطبيق من متصفح يدعم التخزين وأعد المحاولة.'
          : resteCoquille === null
            ? 'لم يُتحقّق بعد.'
            : resteCoquille === 0
              ? 'الواجهة موجودة على الجهاز: التطبيق يفتح دون شبكة.'
              : `الواجهة غير مكتملة: ${resteCoquille} ملف من ${coquille!.total} غير موجود.`}
      </p>

      <dl className="mt-3 space-y-1 text-xs text-mute">
        <div className="flex justify-between gap-3">
          <dt>الواجهة (تُنزَّل دائمًا)</dt>
          <dd className="font-bold text-forest-deep">{coquille ? `${mo(coquille.octetsCoquille)} ميغابايت` : '—'}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt>المحتوى الكامل (الدروس + البوصلة + الأوراق)</dt>
          <dd className="font-bold text-forest-deep">{complet ? `${mo(complet.octetsContenu)} ميغابايت إضافية` : '—'}</dd>
        </div>
      </dl>

      {resteComplet !== null && resteComplet > 0 && (
        <p className="mt-2 text-xs leading-relaxed text-mute">
          المحتوى غير منزَّل بعد ({resteComplet} ملف من {complet!.total} ناقص). النسخ الذي يفتح دون شبكة
          يبقى الواجهة وحدها.
        </p>
      )}
      {resteComplet === 0 && (
        <p className="mt-2 text-xs leading-relaxed text-mute">
          المحتوى الكامل موجود على الجهاز. اختبره دون اتصال قبل الاعتماد عليه.
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={occupé !== null}
          onClick={() => void telecharger('complet')}
          className="btn btn-primary flex-1 text-sm"
        >
          {occupé === 'complet' ? 'جارٍ التنزيل…' : 'تنزيل المحتوى الكامل'}
        </button>
        <button
          type="button"
          disabled={occupé !== null}
          onClick={() => void verifier()}
          className="btn btn-ghost flex-1 text-sm"
        >
          تحقّق
        </button>
      </div>
    </section>
  );
}
