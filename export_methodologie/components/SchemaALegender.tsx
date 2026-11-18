// مخطّطات للتسمية (P1.6) — انقر رقمًا على المخطّط ثمّ انقر الاسم المناسب. بلا سحب (يعمل على الشاشات الصغيرة)،
// بلا نسبة: الخطأ رسالة لطيفة والمنطقة تبقى مفتوحة. تُسجَّل المخطّطات المُنهاة في etat.schemas.

import { useMemo, useState } from 'react';
import { SCHEMAS, type Schema } from '../data/schemas';
import { nb } from '../utils/dates';
import { noterReponse } from '../utils/stats';
import { IcoRetour, IcoVerifie } from './Icones';

interface Props {
  faits: Record<string, true>;
  onTermine: (schemaId: string) => void;
  onOuvrirRecherche: (q: string) => void;
  onFermer: () => void;
}

function melanger<T>(arr: T[], graine: number): T[] {
  const a = [...arr];
  let s = graine;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** سمات SVG بصيغة kebab في البيانات → camelCase لـ React */
function propsSvg(attrs: Record<string, string | number>): Record<string, string | number> {
  const out: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(attrs)) out[k.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())] = v;
  return out;
}

function Jeu({ schema, onTermine, onOuvrirRecherche }: { schema: Schema; onTermine: () => void; onOuvrirRecherche: (q: string) => void }) {
  const [zoneActive, setZoneActive] = useState<string | null>(null);
  const [placees, setPlacees] = useState<Record<string, true>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [erreurs, setErreurs] = useState(0);
  const [signale, setSignale] = useState(false);
  const etiquettes = useMemo(() => melanger(schema.zones, schema.zones.length * 7 + 3), [schema]);
  const restantes = etiquettes.filter((z) => !placees[z.id]);
  const fini = restantes.length === 0;
  if (fini && !signale) {
    setSignale(true);
    onTermine();
  }

  function choisirEtiquette(id: string) {
    if (!zoneActive) {
      setMessage('انقر أولًا رقمًا على المخطّط، ثمّ اسمه.');
      return;
    }
    if (id === zoneActive) {
      noterReponse('exercice', true);
      setPlacees((p) => ({ ...p, [id]: true }));
      setZoneActive(null);
      setMessage(null);
    } else {
      noterReponse('exercice', false);
      setErreurs((e) => e + 1);
      setMessage(erreurs >= 1 ? 'ليس هذا. انظر إلى موضع الرقم: ما الذي يجاوره؟ ثمّ أعد المحاولة.' : 'ليس هذا الاسم — جرّب غيره، لا عجلة.');
    }
  }

  return (
    <div className="card p-4">
      <svg viewBox={schema.viewBox} className="w-full rounded-xl bg-paper" role="img" aria-label={schema.titre}>
        {schema.formes.map((f, i) => {
          const { type, attrs, texte } = f;
          const p = propsSvg(attrs);
          if (type === 'text') return <text key={i} {...p}>{texte}</text>;
          const Tag = type as 'rect' | 'ellipse' | 'path' | 'line' | 'circle';
          return <Tag key={i} {...p} />;
        })}
        {schema.zones.map((z, i) => {
          const ok = placees[z.id];
          const active = zoneActive === z.id;
          return (
            <g key={z.id} onClick={() => !ok && setZoneActive(active ? null : z.id)} style={{ cursor: ok ? 'default' : 'pointer' }}>
              <circle cx={z.x} cy={z.y} r={11} fill={ok ? '#2f5d50' : active ? '#d9b45b' : '#fff'} stroke="#2f5d50" strokeWidth={2} />
              <text x={z.x} y={z.y + 4} textAnchor="middle" fontSize={11} fontWeight="bold" fill={ok ? '#fff' : '#2f5d50'}>
                {ok ? '✓' : i + 1}
              </text>
            </g>
          );
        })}
      </svg>

      <ol className="mt-3 grid gap-1 text-xs sm:grid-cols-2">
        {schema.zones.map((z, i) => (
          <li key={z.id} className={`flex items-baseline gap-2 ${placees[z.id] ? 'text-forest-deep' : 'text-mute'}`}>
            <span className="tnum font-bold">{nb(i + 1)}.</span>
            <span>{placees[z.id] ? z.nom : zoneActive === z.id ? '← اختر الاسم أسفله' : '…'}</span>
          </li>
        ))}
      </ol>

      {!fini && (
        <>
          <p className="eyebrow mt-4">{zoneActive ? `اسم الرقم ${nb(schema.zones.findIndex((z) => z.id === zoneActive) + 1)}` : 'الأسماء'}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {restantes.map((z) => (
              <button key={z.id} type="button" onClick={() => choisirEtiquette(z.id)} className="chip border-line bg-paper text-xs font-bold hover:border-forest">
                {z.nom}
              </button>
            ))}
          </div>
          {message && <p className="mt-3 rounded-xl bg-gold-soft/40 px-3 py-2 text-xs text-forest-deep">{message}</p>}
        </>
      )}

      {fini && (
        <div className="mt-4 rounded-2xl border border-sage bg-sage-soft/60 p-4">
          <div className="flex items-center gap-2">
            <span className="block h-5 w-5 text-forest"><IcoVerifie /></span>
            <p className="text-sm font-bold text-forest-deep">المخطّط مكتمل.</p>
          </div>
          <p className="mt-1 text-xs text-ink-soft">
            {erreurs === 0 ? 'كلّ الأسماء من أول مرّة.' : 'بعض الأسماء احتاجت محاولة ثانية — أعد المخطّط غدًا من الذاكرة.'}
          </p>
          <button type="button" onClick={() => onOuvrirRecherche(schema.lessonHint)} className="mt-2 text-xs font-bold text-forest hover:underline">
            افتح الدرس المرتبط ←
          </button>
        </div>
      )}
    </div>
  );
}

export default function SchemaALegender({ faits, onTermine, onOuvrirRecherche, onFermer }: Props) {
  const [courant, setCourant] = useState<string | null>(null);
  const schema = courant ? SCHEMAS.find((s) => s.id === courant) : undefined;
  return (
    <div className="flex min-h-dvh flex-col bg-cream">
      <header className="sticky top-0 z-20 border-b border-line bg-paper px-4 pb-3 pt-4">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <button onClick={() => (schema ? setCourant(null) : onFermer())} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cream text-mute transition-colors hover:bg-sage-soft" aria-label="رجوع">
            <span className="block h-5 w-5"><IcoRetour /></span>
          </button>
          <div className="min-w-0">
            <p className="eyebrow">مخطّطات للتسمية · {nb(Object.keys(faits).length)} من {nb(SCHEMAS.length)}</p>
            <h1 className="font-naskh truncate text-xl font-black">{schema ? schema.titre : 'انقر الرقم، ثمّ الاسم'}</h1>
          </div>
        </div>
      </header>
      <main className="flex-1 px-4 pb-16 pt-4">
        <div className="mx-auto max-w-3xl">
          {schema ? (
            <Jeu key={schema.id} schema={schema} onTermine={() => onTermine(schema.id)} onOuvrirRecherche={onOuvrirRecherche} />
          ) : (
            <ul className="grid gap-2">
              {SCHEMAS.map((s) => (
                <li key={s.id}>
                  <button type="button" onClick={() => setCourant(s.id)} className="card flex w-full items-center justify-between p-4 text-start transition-colors hover:border-forest">
                    <span>
                      <p className="text-sm font-bold">{s.titre}</p>
                      <p className="mt-0.5 text-xs text-mute">الوحدة {nb(s.unite)} · {nb(s.zones.length)} عناصر{faits[s.id] ? ' · مكتمل — أعده من الذاكرة' : ''}</p>
                    </span>
                    <span className="text-mute">←</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-[11px] leading-relaxed text-mute">
            رسوم مبسّطة للتدريب على المصطلحات، لا بديل عن رسوم الكتاب المدرسي؛ في الامتحان يُطلب أحيانًا تسمية مخطّط مشابه في الجزء الأول.
          </p>
        </div>
      </main>
    </div>
  );
}
