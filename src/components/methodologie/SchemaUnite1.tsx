import type { ReactNode } from 'react';
import type { ExerciceEnquete, ExerciceUnite1 } from '../../data/methodologie';

/** Le blank courant est matérialisé « …؟ », les blanks suivants restent muets. */
export function gabaritCloze(modele: ExerciceEnquete['modele'], k: number, remplis: number): ReactNode[] {
  const slot = modele.cloze?.[k];
  if (!slot) return [];
  const morceaux = slot.gabarit.split(/(\{b\d+\})/g);
  const pieces: ReactNode[] = [];
  morceaux.forEach((morceau, i) => {
    const bRe = /^\{b(\d+)\}$/.exec(morceau);
    if (!bRe) {
      pieces.push(morceau);
      return;
    }
    const n = Number(bRe[1]);
    if (n < remplis) {
      pieces.push(
        <b key={`p${i}`} className="text-forest">
          {slot.blancs[n].correct}
        </b>,
      );
    } else if (n === remplis) {
      pieces.push(
        <span
          key={`p${i}`}
          className="rounded border border-dashed border-gold bg-gold-soft/50 px-1.5 font-bold text-forest-deep"
        >
          …؟
        </span>,
      );
    } else {
      pieces.push(
        <span key={`p${i}`} className="text-mute">
          …
        </span>,
      );
    }
  });
  return pieces;
}

/**
 * مخططات الوحدة 1 — SVG inline aux couleurs de l'app (forêt / or / bleu).
 * Schémas de la version clarifiée arena (commit 7ac24a4) avec corrections maison :
 * - 'mutation' reste en ADN (T) car l'arena présentait une séquence à U comme « السلسلة الأصلية » ;
 * - les markers fléchés ont un id dédié par schéma (arrow-u1/arrow-seq/arrow-gq/arrow-synth) —
 *   sur arena, 'sequence' et 'graphique' pointaient vers un marker défini dans un autre SVG
 *   (flèche invisible quand le schéma s'affiche seul).
 */
export function SchemaUnite1({ type, className = 'h-44 w-full' }: { type: ExerciceUnite1['diagramme']; className?: string }) {
  const common = {
    className,
    viewBox: '0 0 520 180',
    role: 'img' as const,
  };
  if (type === 'flux')
    return (
      <svg {...common}>
        <defs>
          <marker id="arrow-u1" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L7,3 z" fill="#315b45" />
          </marker>
        </defs>
        <text x="260" y="24" textAnchor="middle" fontSize="16" fontWeight="700" fill="#315b45">
          تعبير المعلومة الوراثية
        </text>
        {['ADN', 'ARNm', 'سلسلة ببتيدية', 'بروتين وظيفي'].map((t, i) => (
          <g key={t}>
            <rect
              x={18 + i * 128}
              y="70"
              width="104"
              height="42"
              rx="14"
              fill={i === 3 ? '#d8ead7' : '#eef4e8'}
              stroke="#315b45"
            />
            <text x={70 + i * 128} y="96" textAnchor="middle" fontSize="14" fill="#244634">
              {t}
            </text>
            {i < 3 && (
              <line
                x1={124 + i * 128}
                y1="91"
                x2={142 + i * 128}
                y2="91"
                stroke="#315b45"
                strokeWidth="2"
                markerEnd="url(#arrow-u1)"
              />
            )}
          </g>
        ))}
        <text x="135" y="137" textAnchor="middle" fontSize="11" fill="#6b7e70">استنساخ</text>
        <text x="265" y="137" textAnchor="middle" fontSize="11" fill="#6b7e70">ترجمة</text>
        <text x="395" y="137" textAnchor="middle" fontSize="11" fill="#6b7e70">انطواء</text>
      </svg>
    );
  if (type === 'cellules')
    return (
      <svg {...common}>
        <rect x="15" y="28" width="230" height="120" rx="22" fill="#d9eddf" stroke="#315b45" />
        <circle cx="130" cy="88" r="34" fill="#eef4e8" stroke="#315b45" strokeWidth="2" />
        <text x="130" y="93" textAnchor="middle" fontSize="12">النواة</text>
        <text x="130" y="168" textAnchor="middle" fontSize="13" fill="#315b45">حقيقية النوى</text>
        <rect x="275" y="28" width="230" height="120" rx="22" fill="#d9eddf" stroke="#315b45" />
        <path d="M315 83 Q350 55 385 83 T455 83" fill="none" stroke="#315b45" strokeWidth="3" />
        <text x="390" y="120" textAnchor="middle" fontSize="12">ADN في الهيولى</text>
        <text x="390" y="168" textAnchor="middle" fontSize="13" fill="#315b45">بدائية النوى</text>
      </svg>
    );
  if (type === 'arn')
    return (
      <svg {...common}>
        <path d="M35 55 H485" stroke="#315b45" strokeWidth="8" />
        <text x="260" y="43" textAnchor="middle" fontSize="13">إكسون</text>
        <path d="M35 105 H485" stroke="#5e8f6f" strokeWidth="8" />
        <text x="260" y="95" textAnchor="middle" fontSize="13">إنترون يُحذف</text>
        <path d="M35 145 H180 M235 145 H485" stroke="#315b45" strokeWidth="8" />
        <text x="260" y="172" textAnchor="middle" fontSize="13" fill="#315b45">
          ARNm ناضج = إكسونات مرتبطة
        </text>
      </svg>
    );
  if (type === 'ribosome')
    return (
      <svg {...common}>
        <path d="M55 120 H465" stroke="#315b45" strokeWidth="5" />
        <ellipse cx="260" cy="80" rx="90" ry="45" fill="#d9eddf" stroke="#315b45" strokeWidth="2" />
        <circle cx="195" cy="45" r="15" fill="#7fb896" />
        <circle cx="260" cy="35" r="15" fill="#7fb896" />
        <circle cx="325" cy="45" r="15" fill="#7fb896" />
        <text x="260" y="86" textAnchor="middle" fontSize="15">الريبوزوم</text>
        <text x="260" y="150" textAnchor="middle" fontSize="13" fill="#315b45">
          ARNm · رامزة · ARNt · أحماض أمينية
        </text>
      </svg>
    );
  if (type === 'mutation')
    return (
      <svg {...common}>
        <text x="35" y="38" fontSize="14" fill="#315b45">السلسلة الأصلية</text>
        <text x="35" y="67" fontSize="18" fontFamily="monospace">ATG · TTT · GGC · TAA</text>
        <text x="35" y="105" fontSize="14" fill="#315b45">بعد الطفرة</text>
        <text x="35" y="134" fontSize="18" fontFamily="monospace" fill="#2f5d47">
          ATG · TTA · GGC · TAA
        </text>
        <line x1="128" y1="73" x2="128" y2="111" stroke="#5e8f6f" strokeWidth="3" />
        <text x="155" y="95" fontSize="13" fill="#6b7e70">استبدال قاعدة</text>
      </svg>
    );
  if (type === 'sequence')
    return (
      <svg {...common}>
        <defs>
          <marker id="arrow-seq" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L7,3 z" fill="#315b45" />
          </marker>
        </defs>
        <text x="260" y="24" textAnchor="middle" fontSize="15" fontWeight="700" fill="#315b45">
          استخراج ARNm بالتكامل القاعدي
        </text>
        <text x="40" y="62" fontSize="14" fill="#315b45">ADN المستنسخة 3’</text>
        <text x="185" y="62" fontSize="18" fontFamily="monospace">TAC · GGA · CTT</text>
        <text x="40" y="108" fontSize="14" fill="#315b45">ARNm 5’</text>
        <text x="185" y="108" fontSize="18" fontFamily="monospace" fill="#7fb896">
          AUG · CCU · GAA
        </text>
        <path d="M185 72 L185 95" stroke="#5e8f6f" strokeWidth="3" markerEnd="url(#arrow-seq)" />
        <text x="260" y="145" textAnchor="middle" fontSize="13" fill="#6b7e70">
          A↔U · T↔A · C↔G · G↔C
        </text>
      </svg>
    );
  if (type === 'expression')
    return (
      <svg {...common}>
        <line x1="45" y1="145" x2="480" y2="145" stroke="#315b45" />
        <line x1="45" y1="25" x2="45" y2="145" stroke="#315b45" />
        <path d="M50 130 Q130 95 220 105 T470 52" fill="none" stroke="#7fb896" strokeWidth="4" />
        <path d="M50 135 Q150 132 230 126 T470 82" fill="none" stroke="#2f5d47" strokeWidth="4" />
        <text x="400" y="45" fontSize="13" fill="#7fb896">ARNm</text>
        <text x="400" y="78" fontSize="13" fill="#2f5d47">بروتين</text>
        <text x="260" y="170" textAnchor="middle" fontSize="12">الزمن (دقائق)</text>
        <text x="20" y="40" fontSize="11" fill="#6b7e70">الكمية</text>
      </svg>
    );
  if (type === 'graphique')
    return (
      <svg {...common}>
        <defs>
          <marker id="arrow-gq" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L7,3 z" fill="#315b45" />
          </marker>
        </defs>
        <text x="260" y="20" textAnchor="middle" fontSize="15" fontWeight="700" fill="#315b45">
          مسار إفراز البروتين
        </text>
        <ellipse cx="100" cy="88" rx="68" ry="48" fill="#eef4e8" stroke="#315b45" strokeWidth="2" />
        <text x="100" y="93" textAnchor="middle" fontSize="13">النواة</text>
        <path d="M170 88 H235" stroke="#315b45" strokeWidth="3" markerEnd="url(#arrow-gq)" />
        <path
          d="M240 55 Q285 35 330 55 M240 82 Q285 62 330 82 M240 109 Q285 89 330 109"
          fill="none"
          stroke="#2f5d47"
          strokeWidth="5"
        />
        <text x="285" y="140" textAnchor="middle" fontSize="12">شبكة هيولية محببة</text>
        <path d="M340 82 H425" stroke="#315b45" strokeWidth="3" markerEnd="url(#arrow-gq)" />
        <path d="M435 54 Q475 82 435 110 Q410 82 435 54" fill="#d8ead7" stroke="#315b45" strokeWidth="2" />
        <text x="470" y="143" textAnchor="middle" fontSize="12">خارج الخلية</text>
      </svg>
    );
  if (type === 'comparaison')
    return (
      <svg {...common}>
        <text x="35" y="35" fontSize="14" fill="#315b45">بروتين أ</text>
        <text x="35" y="63" fontSize="18" fontFamily="monospace">Ala · Gly · Lys · Val · Ser</text>
        <text x="35" y="105" fontSize="14" fill="#315b45">بروتين ب</text>
        <text x="35" y="133" fontSize="18" fontFamily="monospace">Ala · Gly · Arg · Val · Ser</text>
        <rect x="190" y="42" width="45" height="30" rx="5" fill="#eef4e8" />
        <rect x="190" y="112" width="45" height="30" rx="5" fill="#eef4e8" />
        <text x="300" y="93" fontSize="13" fill="#6b7e70">موضع الاختلاف</text>
      </svg>
    );
  if (type === 'synthese')
    return (
      <svg {...common}>
        <defs>
          <marker id="arrow-synth" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L7,3 z" fill="#315b45" />
          </marker>
        </defs>
        <text x="260" y="22" textAnchor="middle" fontSize="15" fontWeight="700" fill="#315b45">
          العلاقة بين البنية والوظيفة
        </text>
        <path d="M50 70 H470" stroke="#315b45" strokeWidth="3" markerEnd="url(#arrow-synth)" />
        <path d="M50 125 H470" stroke="#315b45" strokeWidth="3" markerEnd="url(#arrow-synth)" />
        <circle cx="95" cy="70" r="22" fill="#a3b899" />
        <circle cx="205" cy="70" r="22" fill="#a3b899" />
        <circle cx="315" cy="70" r="22" fill="#a3b899" />
        <circle cx="425" cy="70" r="22" fill="#a3b899" />
        <text x="260" y="76" textAnchor="middle" fontSize="13">تسلسل الأحماض الأمينية</text>
        <path
          d="M85 125 Q120 92 155 125 T225 125 T295 125 T365 125 T435 125"
          fill="none"
          stroke="#2f5d47"
          strokeWidth="5"
        />
        <text x="260" y="115" textAnchor="middle" fontSize="13">بنية فراغية</text>
        <text x="260" y="161" textAnchor="middle" fontSize="13" fill="#315b45">وظيفة البروتين</text>
      </svg>
    );
  return null;
}
