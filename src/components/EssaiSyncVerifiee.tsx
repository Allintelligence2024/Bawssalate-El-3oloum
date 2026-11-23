import { useEffect, useRef, useState } from 'react';
import type { EtatAutorisation, protocoleSyncVerifiee } from '../utils/protocoleSyncVerifiee';

type Api = ReturnType<typeof protocoleSyncVerifiee>;
const RESUME_FICTIF = { minutes_totales: 12, lecons_terminees: 1, revisions: 0 };

/** Pilote de recette : ne lit jamais la progression réelle ni le consentement local. */
export default function EssaiSyncVerifiee({ api }: { api: Api }) {
  const [etat, setEtat] = useState<EtatAutorisation | null>(null);
  const [occupe, setOccupe] = useState(false);
  const [effacementIncertain, setEffacementIncertain] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const verrou = useRef(false);

  async function lire() {
    const lu = await api.etat();
    setEtat(lu);
    setMessage(lu ? '' : 'تعذّرت قراءة حالة الاختبار. حاول مجددًا.');
  }
  async function action(fn: () => Promise<void>) {
    if (verrou.current) return;
    verrou.current = true;
    setOccupe(true);
    try { await fn(); } finally { verrou.current = false; setOccupe(false); }
  }
  // Aucun appel automatique, y compris lors d’un retour de vérification.
  useEffect(() => {
    setEtat(null);
    setEffacementIncertain(null);
    setMessage('');
  }, [api]);

  return <section className="mt-3 rounded border p-3" aria-label="اختبار المزامنة">
    <p>اختبار المزامنة: تُستخدم أرقام تجريبية فقط، وليس تقدّمك الحقيقي.</p>
    <div className="mt-2 flex flex-wrap gap-2">
      {effacementIncertain === null && <button type="button" className="btn btn-ghost" disabled={occupe} onClick={() => void action(lire)}>اقرأ حالة الاختبار</button>}
      {etat && !etat.autorise && effacementIncertain === null && <button type="button" className="btn btn-ghost" disabled={occupe} onClick={() => void action(async () => {
        const r = await api.consentir(etat.generation);
        setEtat(r.resultat === 'confirme' && r.generation !== undefined ? { generation: r.generation, autorise: true } : null);
        setMessage(r.resultat === 'confirme' ? 'سُجّلت موافقتك على الاختبار فقط.' : 'لم تتأكّد الموافقة. اقرأ الحالة قبل المحاولة من جديد.');
      })}>أوافق على إرسال بيانات الاختبار</button>}
      {etat?.autorise && effacementIncertain === null && <button type="button" className="btn btn-ghost" disabled={occupe} onClick={() => void action(async () => {
        const r = await api.ecrire(etat.generation, RESUME_FICTIF);
        if (r === 'refuse') setEtat(null);
        setMessage(r === 'confirme' ? 'أكّد الخادم استلام بيانات الاختبار.' : 'لم يتأكّد إرسال بيانات الاختبار.');
      })}>أرسل الأرقام التجريبية</button>}
      {(etat?.autorise || effacementIncertain !== null) && <button type="button" className="btn btn-ghost" disabled={occupe} onClick={() => void action(async () => {
        const generation = effacementIncertain ?? etat!.generation;
        const r = await api.effacer(generation);
        setEtat(null);
        setEffacementIncertain(r === 'indetermine' ? generation : null);
        setMessage(r === 'confirme' ? 'أكّد الخادم حذف بيانات هذه الموافقة التجريبية.' : r === 'refuse' ? 'لم يؤكّد الخادم حذف هذه النسخة. اقرأ الحالة.' : 'نتيجة الحذف غير مؤكّدة. أعد المحاولة لنفس النسخة.');
      })}>{effacementIncertain === null ? 'احذف بيانات الاختبار' : 'أعد محاولة الحذف'}</button>}
    </div>
    <p role="status">{occupe ? 'يرجى الانتظار…' : message}</p>
  </section>;
}
