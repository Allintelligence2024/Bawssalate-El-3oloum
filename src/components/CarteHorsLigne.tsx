// Téléchargement facultatif, en deux niveaux : l'état reflète le cache de la version ouverte,
// pas la qualité du réseau. La coquille (interface) est toujours téléchargée ; le contenu
// lourd (leçons, laboratoire Boussole, PDF) ne l'est que si l'élève le demande, et son poids
// lui est annoncé avant de commencer — sur un forfait mobile, ce n'est pas un détail.
import { useEffect, useState } from 'react';
import { etatHorsLigne, verifierEspaceStockage, type EtatHorsLigne } from '../utils/pwa';
import { ecrireDataSaver4G, lireDataSaver4G, surChangementDataSaver } from '../utils/dataSaver';
import { BoutonInstallerPwa } from './BoutonInstallerPwa';

/** En Mo, arrondi au dixième : plus lisible qu'un nombre d'octets, plus honnête qu'un arrondi entier. */
function mo(octets: number): string {
  return `${(octets / (1024 * 1024)).toFixed(1)}`;
}

export default function CarteHorsLigne() {
  const [coquille, setCoquille] = useState<EtatHorsLigne | null>(null);
  const [complet, setComplet] = useState<EtatHorsLigne | null>(null);
  const [occupé, setOccupe] = useState<'coquille' | 'complet' | null>(null);
  const [erreur, setErreur] = useState(false);
  const [quotaInsuffisant, setQuotaInsuffisant] = useState(false);
  const [dataSaver, setDataSaver] = useState<boolean>(() => lireDataSaver4G());

  async function verifier() {
    try {
      setCoquille(await etatHorsLigne(false, 'coquille'));
      setComplet(await etatHorsLigne(false, 'complet'));
      setErreur(false);
      setQuotaInsuffisant(false);
    } catch {
      setCoquille(null);
      setComplet(null);
      setErreur(true);
    }
  }

  async function telecharger(portee: 'coquille' | 'complet') {
    setOccupe(portee);
    setErreur(false);
    setQuotaInsuffisant(false);
    try {
      const octetsRequis = portee === 'complet' ? (complet?.octetsContenu ?? 0) : (coquille?.octetsCoquille ?? 0);
      if (octetsRequis > 0) {
        const espace = await verifierEspaceStockage(octetsRequis);
        if (!espace.suffisant) {
          setQuotaInsuffisant(true);
          return;
        }
      }
      const etat = await etatHorsLigne(true, portee);
      if (portee === 'coquille') setCoquille(etat);
      else setComplet(etat);
      if (etat.quotaDepasse) setQuotaInsuffisant(true);
    } catch {
      setErreur(true);
    } finally {
      setOccupe(null);
    }
  }

  useEffect(() => {
    void verifier();
    return surChangementDataSaver(setDataSaver);
  }, []);

  function basculerDataSaver() {
    const suivant = !dataSaver;
    if (ecrireDataSaver4G(suivant)) {
      setDataSaver(suivant);
    }
  }

  const resteCoquille = coquille ? coquille.manquants : null;
  const resteComplet = complet ? complet.manquants : null;

  return (
    <section className="card mt-5 p-5" aria-label="العمل دون إنترنت وتوفير الأنترنت">
      <p className="eyebrow">العمل دون إنترنت وتوفير 4G</p>
      <p className="mt-2 text-xs leading-relaxed text-mute">
        الواجهة تُنزَّل تلقائيًا وتعمل دون شبكة. أمّا الدروس ومختبر البوصلة وورقتا الطباعة فهي ملفات
        ثقيلة: لا تُنزَّل إلّا إذا اخترت ذلك، ويُعلَن حجمها قبل البدء. الفيديو والملفات الخارجية ليست ضمن هذا التنزيل.
      </p>

      {/* وضع توفير الأنترنت 4G */}
      <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-line bg-bg p-3.5">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-extrabold text-ink">وضع توفير الأنترنت 4G</p>
          <p className="mt-0.5 text-[11px] leading-relaxed text-mute">
            يمنع التخزين التلقائي لملفات الصوت والصور الثقيلة في الخلفية للحفاظ على رصيد 4G.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={dataSaver}
          aria-label="تفعيل وضع توفير الأنترنت 4G"
          onClick={basculerDataSaver}
          className={`flex min-h-[44px] min-w-[76px] shrink-0 items-center justify-center rounded-xl border px-3 text-xs font-extrabold ${
            dataSaver
              ? 'border-forest bg-forest text-paper'
              : 'border-line bg-paper text-ink-soft hover:border-forest'
          }`}
        >
          {dataSaver ? 'مفعّل' : 'متوقّف'}
        </button>
      </div>

      <p role="status" className="mt-3 text-sm font-bold text-forest-deep">
        {erreur
          ? 'تعذّر التحقّق لهذا الإصدار. افتح التطبيق من متصفح يدعم التخزين وأعد المحاولة.'
          : resteCoquille === null
            ? 'لم يُتحقّق بعد.'
            : resteCoquille === 0
              ? 'الواجهة موجودة على الجهاز: التطبيق يفتح دون شبكة.'
              : `الواجهة غير مكتملة: ${resteCoquille} ملف من ${coquille!.total} غير موجود.`}
      </p>

      {quotaInsuffisant && (
        <p role="alert" className="mt-2 text-xs font-semibold leading-relaxed text-amber-800">
          المساحة المتاحة على الجهاز غير كافية لتنزيل المحتوى الكامل. أفرغ بعض المساحة ثم أعد المحاولة.
        </p>
      )}

      <dl className="mt-3 space-y-1 text-xs text-mute">
        <div className="flex justify-between gap-3">
          <dt>الواجهة (تُنزَّل دائمًا)</dt>
          <dd className="tnum font-bold text-forest-deep">{coquille ? `${mo(coquille.octetsCoquille)} ميغابايت` : '—'}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt>المحتوى الكامل (الدروس + البوصلة + الأوراق)</dt>
          <dd className="tnum font-bold text-forest-deep">{complet ? `${mo(complet.octetsContenu)} ميغابايت إضافية` : '—'}</dd>
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
          className="btn btn-primary min-h-[44px] flex-1 text-sm"
        >
          {occupé === 'complet' ? 'جارٍ التنزيل…' : 'تنزيل المحتوى الكامل'}
        </button>
        <button
          type="button"
          disabled={occupé !== null}
          onClick={() => void verifier()}
          className="btn btn-ghost min-h-[44px] flex-1 border border-line text-sm"
        >
          تحقّق
        </button>
      </div>

      <BoutonInstallerPwa />
    </section>
  );
}
