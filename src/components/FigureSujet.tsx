// عرض وثائق الموضوع (رسوم أصلية، بلا صور مأخوذة من الديوان) — P1.1 / J2.
// كلّ شكل يُرسم بـ SVG داخل التطبيق: لا ملفّ صورة، لا شبكة، يعمل دون اتّصال، ويدعم RTL.
import type { Figure, SerieFigure } from '../data/figuresSujets';
import { nb } from '../utils/dates';

const COULEURS: Record<SerieFigure['couleur'], string> = {
  forest: '#2f5d47',
  gold: '#5e8f6f',
  clay: '#dc2626',
  sage: '#8fae82',
  ink: '#3a403b',
};

const L = 54;   // marge gauche (étiquettes de l'axe Y + titre pivoté)
const R = 10;   // marge droite
const T = 12;   // marge haute
const B = 34;   // marge basse (étiquettes de l'axe X + nom)
const W = 320;
const H = 200;
const AIRE_L = L;
const AIRE_R = W - R;
const AIRE_T = T;
const AIRE_B = H - B;
/** Retrait : sans lui, la première barre ou le premier marqueur chevauche l'axe. */
const PAD = 14;

/** Zone utile : c'est là que sont tracés les axes eux-mêmes, donc tout reste aligné. */
const BX0 = AIRE_L + PAD;
const BX1 = AIRE_R - PAD;
const BY0 = AIRE_B - PAD;
const BY1 = AIRE_T + PAD;

/** Projette une valeur de domaine dans la zone utile. */
function echelle(v: number, min: number, max: number, a: number, b: number): number {
  const part = (v - min) / (max - min || 1);
  return a + part * (b - a);
}

/** Dessine la figure interprétative du sujet 2023-1 (exercice 1). */
function SchemaSynapses() {
  const C = '#2f5d47';
  const C2 = '#dc2626';
  const S = '#a3b899';

  return (
    <svg viewBox="0 0 320 210" className="w-full" role="img"
      aria-label="عصبون محرّك يتلقّى مشبكًا تنبيهيًّا ومشبكًا تثبيطيًّا، مع راسمي اهتزاز (أ) و(ب)">
      {/* النهاية قبل المشبكية التنبيهية */}
      <circle cx="48" cy="34" r="17" fill="#eaf1e4" stroke={C} strokeWidth="2" />
      <text x="48" y="38" textAnchor="middle" fontSize="11" fill={C} fontWeight="bold">Ach</text>
      <path d="M48 51 V78" stroke={C} strokeWidth="2" />
      <path d="M48 78 l-5 -7 M48 78 l5 -7" stroke={C} strokeWidth="2" fill="none" />

      {/* النهاية قبل المشبكية التثبيطية */}
      <circle cx="48" cy="150" r="17" fill="#fde8e8" stroke={C2} strokeWidth="2" />
      <text x="48" y="154" textAnchor="middle" fontSize="10" fill={C2} fontWeight="bold">GABA</text>
      <path d="M48 133 V106" stroke={C2} strokeWidth="2" />
      <path d="M48 106 l-5 7 M48 106 l5 7" stroke={C2} strokeWidth="2" fill="none" />

      {/* جسم العصبون المحرّك */}
      <ellipse cx="128" cy="92" rx="42" ry="52" fill="#f8fafc" stroke={C} strokeWidth="2.5" />
      <text x="128" y="88" textAnchor="middle" fontSize="11" fill={C} fontWeight="bold">عصبون</text>
      <text x="128" y="103" textAnchor="middle" fontSize="11" fill={C} fontWeight="bold">محرّك</text>
      {/* محور أسطواني */}
      <path d="M170 92 H236" stroke={C} strokeWidth="3" fill="none" />

      {/* راسما الاهتزاز — (أ) مشبك تثبيطي: فرط استقطاب. (ب) مشبك تنبيهي: زوال استقطاب.
          الهندسة مهمّة: الخطّ المرجعي (الكمون في الراحة) داخل الإطار، والانحراف فوقه أو تحته. */}
      <g>
        <rect x="246" y="8" width="66" height="48" rx="6" fill="#fff" stroke="#e2e8e1" strokeWidth="1.5" />
        <line x1="250" y1="28" x2="308" y2="28" stroke="#c9d4c9" strokeWidth="1" strokeDasharray="3 3" />
        <text x="279" y="5" textAnchor="middle" fontSize="9.5" fontWeight="bold" fill={C}>(أ)</text>
        <path d="M250 28 h10 q4 0 5 6 q3 10 12 10 q9 0 12 -10 q1 -6 5 -6 h14"
          fill="none" stroke={C2} strokeWidth="1.8" strokeLinejoin="round" />
        <text x="279" y="68" textAnchor="middle" fontSize="7.5" fill={C2}>PPSI · فرط استقطاب</text>
      </g>
      <g>
        <rect x="246" y="102" width="66" height="48" rx="6" fill="#fff" stroke="#e2e8e1" strokeWidth="1.5" />
        <line x1="250" y1="140" x2="308" y2="140" stroke="#c9d4c9" strokeWidth="1" strokeDasharray="3 3" />
        <text x="279" y="99" textAnchor="middle" fontSize="9.5" fontWeight="bold" fill={C}>(ب)</text>
        <path d="M250 140 h10 q4 0 5 -6 q3 -12 12 -12 q9 0 12 12 q1 6 5 6 h14"
          fill="none" stroke={C} strokeWidth="1.8" strokeLinejoin="round" />
        <text x="279" y="162" textAnchor="middle" fontSize="7.5" fill={C}>PPSE · زوال استقطاب</text>
      </g>
      {/* أسهم الدمج */}
      <path d="M236 92 l-4 -6 M236 92 l-4 6" stroke={C} strokeWidth="2" fill="none" />
      <text x="150" y="196" textAnchor="middle" fontSize="9.5" fill={S}>
        دمج الكمونات بعد المشبكية على مستوى الجسم الخلوي
      </text>
    </svg>
  );
}

function Axe({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#3a403b" strokeWidth="1.4" />;
}

function FigureCourbe({ figure }: { figure: Figure }) {
  const ax = figure.axeX!;
  const ay = figure.axeY!;
  const px = (v: number) => echelle(v, ax.min, ax.max, BX0, BX1);
  const py = (v: number) => echelle(v, ay.min, ay.max, BY0, BY1);

  const ticksX: number[] = [];
  for (let v = ax.min; v <= ax.max + 1e-9; v += ax.pas) ticksX.push(Math.round(v * 100) / 100);
  const ticksY: number[] = [];
  for (let v = ay.min; v <= ay.max + 1e-9; v += ay.pas) ticksY.push(Math.round(v * 100) / 100);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={figure.titre}>
      {/* شبكة خفيفة */}
      {ticksY.map((v) => (
        <line key={`g${v}`} x1={BX0} y1={py(v)} x2={BX1} y2={py(v)} stroke="#e2e8e1" strokeWidth="1" />
      ))}
      <Axe x1={BX0} y1={BY1} x2={BX0} y2={BY0} />
      <Axe x1={BX0} y1={BY0} x2={BX1} y2={BY0} />

      {ticksY.map((v) => (
        <text key={`ty${v}`} x={BX0 - 5} y={py(v) + 3.5} textAnchor="end" fontSize="8.5" fill="#3a403b">
          {nb(v)}
        </text>
      ))}
      {ticksX.map((v) => (
        <text key={`tx${v}`} x={px(v)} y={BY0 + 12} textAnchor="middle" fontSize="8.5" fill="#3a403b">
          {nb(v)}
        </text>
      ))}

      <text x={(BX0 + BX1) / 2} y={H - 4} textAnchor="middle" fontSize="9" fill="#3a403b">
        {ax.nom}{ax.unite ? ` (${ax.unite})` : ''}
      </text>
      <text x={11} y={(AIRE_T + AIRE_B) / 2} textAnchor="middle" fontSize="9" fill="#3a403b"
        transform={`rotate(-90 11 ${(AIRE_T + AIRE_B) / 2})`}>
        {ay.nom}{ay.unite ? ` (${ay.unite})` : ''}
      </text>

      {figure.series!.map((s) => {
        const d = s.points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${px(x).toFixed(1)} ${py(y).toFixed(1)}`).join(' ');
        const col = COULEURS[s.couleur];
        return (
          <g key={s.nom}>
            <path d={d} fill="none" stroke={col} strokeWidth="2.2"
              strokeDasharray={s.pointille ? '5 4' : undefined} strokeLinejoin="round" strokeLinecap="round" />
            {s.points.map(([x, y], i) => {
              const cx = px(x);
              const cy = py(y);
              if (s.marque === 'carre') return <rect key={i} x={cx - 3} y={cy - 3} width="6" height="6" fill="#fff" stroke={col} strokeWidth="1.8" />;
              if (s.marque === 'triangle') return <path key={i} d={`M${cx} ${cy - 4} L${cx + 4} ${cy + 3} L${cx - 4} ${cy + 3} Z`} fill="#fff" stroke={col} strokeWidth="1.8" />;
              return <circle key={i} cx={cx} cy={cy} r="3.2" fill="#fff" stroke={col} strokeWidth="1.8" />;
            })}
          </g>
        );
      })}
    </svg>
  );
}

function FigureColonnes({ figure }: { figure: Figure }) {
  const ax = figure.axeX!;
  const ay = figure.axeY!;
  const px = (v: number) => echelle(v, ax.min, ax.max, BX0, BX1);
  const py = (v: number) => echelle(v, ay.min, ay.max, BY0, BY1);
  const nbSeries = figure.series!.length;
  const largeurTotale = 30;
  const largeur = largeurTotale / nbSeries;

  const ticksX: number[] = [];
  for (let v = ax.min; v <= ax.max + 1e-9; v += ax.pas) ticksX.push(Math.round(v * 100) / 100);
  const ticksY: number[] = [];
  for (let v = ay.min; v <= ay.max + 1e-9; v += ay.pas) ticksY.push(Math.round(v * 100) / 100);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={figure.titre}>
      {ticksY.map((v) => (
        <line key={`g${v}`} x1={BX0} y1={py(v)} x2={BX1} y2={py(v)} stroke="#e2e8e1" strokeWidth="1" />
      ))}
      <Axe x1={BX0} y1={BY1} x2={BX0} y2={BY0} />
      <Axe x1={BX0} y1={BY0} x2={BX1} y2={BY0} />

      {ticksY.map((v) => (
        <text key={`ty${v}`} x={BX0 - 5} y={py(v) + 3.5} textAnchor="end" fontSize="8.5" fill="#3a403b">{nb(v)}</text>
      ))}
      {ticksX.map((v) => (
        <text key={`tx${v}`} x={px(v)} y={BY0 + 12} textAnchor="middle" fontSize="8.5" fill="#3a403b">{nb(v)}</text>
      ))}

      <text x={(BX0 + BX1) / 2} y={H - 4} textAnchor="middle" fontSize="9" fill="#3a403b">
        {ax.nom}{ax.unite ? ` (${ax.unite})` : ''}
      </text>
      <text x={11} y={(AIRE_T + AIRE_B) / 2} textAnchor="middle" fontSize="9" fill="#3a403b"
        transform={`rotate(-90 11 ${(AIRE_T + AIRE_B) / 2})`}>
        {ay.nom}{ay.unite ? ` (${ay.unite})` : ''}
      </text>

      {figure.series!.map((s, si) => (
        <g key={s.nom}>
          {s.points.map(([x, y], i) => {
            const cx = px(x) - largeurTotale / 2 + si * largeur;
            const h = Math.max(0, BY0 - py(y));
            return (
              <rect key={i} x={cx} y={py(y)} width={largeur - 1.5} height={h}
                fill={COULEURS[s.couleur]} opacity="0.85" rx="1" />
            );
          })}
        </g>
      ))}
    </svg>
  );
}

export function Legende({ figure }: { figure: Figure }) {
  if (figure.type === 'schema' || !figure.series) return null;
  return (
    <ul className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink-soft">
      {figure.series.map((s) => (
        <li key={s.nom} className="flex items-center gap-1.5">
          <svg width="16" height="8" aria-hidden="true">
            <line x1="0" y1="4" x2="16" y2="4" stroke={COULEURS[s.couleur]} strokeWidth="2.4"
              strokeDasharray={s.pointille ? '4 3' : undefined} />
          </svg>
          {s.nom}
        </li>
      ))}
    </ul>
  );
}

/** بطاقة الوثيقة: عنوان + رسم + مفتاح + تحرير «ما تقوله الوثيقة». */
export default function FigureSujet({ figure }: { figure: Figure }) {
  return (
    <figure className="rounded-xl border border-line bg-paper p-3">
      <figcaption className="text-xs font-bold text-forest-deep">{figure.titre}</figcaption>
      <div className="mt-2 rounded-lg bg-cream/60 p-1.5">
        {figure.type === 'schema' ? <SchemaSynapses /> : figure.type === 'colonnes' ? <FigureColonnes figure={figure} /> : <FigureCourbe figure={figure} />}
      </div>
      <Legende figure={figure} />
      <p className="mt-2 text-[11px] leading-relaxed text-ink-soft">{figure.legende}</p>
      <p className="mt-1.5 border-t border-line pt-1.5 text-[10px] leading-relaxed text-mute">
        رسم أصلي أُعيد إنشاؤه لهذا التطبيق من القيم المذكورة في التصحيح النموذجي — ليس صورة مأخوذة من ورقة الامتحان.
        الخطوط تعرض الاتّجاه والرتبة لا كلّ نقطة قياس.
      </p>
    </figure>
  );
}
