// CarteMesurePilote — export du rapport de télémétrie locale (§12.1).
//
// La carte ne collecte rien : elle relit les compteurs laissés sur l'appareil par
// `telemetrie.ts` et propose un export. Le fichier ne part que si l'élève clique et
// choisit lui-même où l'envoyer (même voie que les autres exports : partage natif sur
// mobile, téléchargement sur web).
import { useMemo, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { lireTelemetrie, rapportPilote, rapportSansDonneePersonnelle, CLE_TELEMETRIE } from '../utils/telemetrie';
import { mediane } from '../utils/telemetrie';
import { nb } from '../utils/dates';

async function exporterRapport(paquet: unknown, nomFichier: string): Promise<string> {
  const json = JSON.stringify(paquet, null, 2);
  if (Capacitor.isNativePlatform()) {
    const fichier = await Filesystem.writeFile({
      path: nomFichier,
      data: json,
      directory: Directory.Cache,
      encoding: Encoding.UTF8,
    });
    try {
      await Share.share({ title: 'تقرير القياس', url: fichier.uri, dialogTitle: 'تقرير القياس' });
    } catch {
      return 'أُلغي الإرسال. الملف المؤقّت قد يُحذف؛ أعد التصدير عند الحاجة.';
    }
    return 'فُتحت المشاركة. تُرسِله إن شئت — أو تتركه. لا يُرسَل شيء تلقائيًّا.';
  }
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nomFichier;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return 'طُلِب تنزيل التقرير. تُرسِله إن شئت — أو تتركه. لا يُرسَل شيء تلقائيًّا.';
}

export default function CarteMesurePilote() {
  const [message, setMessage] = useState<string | null>(null);
  const [ouvert, setOuvert] = useState(false);

  // Relu à l'ouverture : les compteurs ont pu bouger depuis le dernier rendu.
  const telemetrie = useMemo(() => lireTelemetrie(localStorage.getItem(CLE_TELEMETRIE)), [ouvert]);
  const phases = Object.entries(telemetrie.phases) as [keyof typeof telemetrie.phases, (typeof telemetrie.phases)[keyof typeof telemetrie.phases]][];
  const entrees = phases.reduce((n, [, p]) => n + p.entrees, 0);
  const observations = phases.reduce((n, [, p]) => n + p.durees.length, 0);

  async function exporter() {
    setMessage(null);
    try {
      const rapport = rapportPilote(telemetrie, new Date().toISOString());
      if (!rapportSansDonneePersonnelle(rapport)) {
        // Garde-fou dur : plutôt ne rien produire que produire un fichier identifiant.
        setMessage('لم نُصدّر شيئًا: احتوى التقرير على حقل غير مسموح.');
        return;
      }
      setMessage(await exporterRapport(rapport, 'bousala-mesure-pilote.json'));
    } catch {
      setMessage('تعذّر التصدير — جرّب من جديد.');
    }
  }

  return (
    <section className="card mt-5 p-5">
      <p className="eyebrow">قياس الأثر</p>
      <p className="mt-2 text-xs leading-relaxed text-mute">
        نعدّ على جهازك فقط: متى تدخل كل مرحلة، وكم تبقى فيها، وأين تتوقّف. لا يُرسَل شيء
        تلقائيًّا، ولا يوجد خادم يعرف عنك شيئًا. إن أردت مساعدتنا على تحسين التطبيق، صدّر
        التقرير وأرسِلْه بنفسك: يحتوي أعدادًا ومددًا مجمّعة فقط — لا اسم، لا بريد، لا نصوصك،
        ولا ولايتك.
      </p>

      {entrees === 0 ? (
        <p className="mt-3 rounded-xl bg-pale px-3 py-2 text-[11px] text-mute">
          لا توجد قياسات بعد. تظهر بعد أول جلسة في مسار المراجعة.
        </p>
      ) : (
        <>
          <p className="mt-3 text-xs text-mute">
            {nb(entrees)} دخول · {nb(observations)} مدّة مسجّلة
            {observations > 0 && <> · وسيط المدة {nb(mediane(phases.flatMap(([, p]) => p.durees)))} ثانية</>}
          </p>
          {ouvert && (
            <ul className="mt-3 space-y-1.5">
              {phases
                .filter(([, p]) => p.entrees > 0)
                .map(([cle, p]) => (
                  <li key={cle} className="flex items-center justify-between rounded-lg bg-pale px-3 py-1.5 text-[11px]">
                    <span>المرحلة {cle}</span>
                    <span className="text-mute">
                      {nb(p.entrees)} دخول · {nb(p.abandons)} توقّف · وسيط {nb(mediane(p.durees))} ثانية
                    </span>
                  </li>
                ))}
            </ul>
          )}
        </>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={() => void exporter()} className="btn btn-ghost flex-1 text-sm">
          تصدير تقرير القياس
        </button>
        {entrees > 0 && (
          <button onClick={() => setOuvert((v) => !v)} className="btn btn-ghost flex-1 text-sm" aria-expanded={ouvert}>
            {ouvert ? 'إخفاء التفصيل' : 'عرض التفصيل'}
          </button>
        )}
      </div>

      {message && (
        <p className="mt-3 rounded-xl bg-pale px-3 py-2 text-[11px] leading-relaxed text-mute" role="status">
          {message}
        </p>
      )}
    </section>
  );
}
