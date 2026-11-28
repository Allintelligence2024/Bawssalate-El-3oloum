// رسوم ومنحنيات أصلية عالية الدقّة للتمارين القصوى (12 وثيقة SVG أصلية)
// كلّ وثيقة مرسومة داخل لوحة فاتحة عالية التباين (.fond-schema-clair) لضمان الوضوح التام في الوضعين النهاري والليلي.

import type { SchemaUltimeId } from '../data/exercicesUltimes';

const CADRE = 'w-full h-auto block select-none';

function Plaque({
  titreAria,
  viewBox = '0 0 420 235',
  children,
}: {
  titreAria: string;
  viewBox?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="fond-schema-clair overflow-hidden rounded-2xl border border-line p-2">
      <svg
        viewBox={viewBox}
        role="img"
        aria-label={titreAria}
        className={CADRE}
        xmlns="http://www.w3.org/2000/svg"
      >
        {children}
      </svg>
    </div>
  );
}

export default function SchemasUltimesSvg({ id }: { id: SchemaUltimeId }) {
  switch (id) {
    /* 1A. المشابك: تسجيلات راسم الذبذبات */
    case 'synapse-traces':
      return (
        <Plaque titreAria="تسجيلات راسم الذبذبات ج1 وج2 في غياب السم وفي وجوده">
          <rect x="0" y="0" width="420" height="235" fill="#fbfaf5" rx="10" />
          {/* لوحة 1: بدون سم */}
          <rect x="12" y="12" width="190" height="211" rx="10" fill="#ffffff" stroke="#d4ddd6" />
          <text x="107" y="30" textAnchor="middle" fontSize="11.5" fontWeight="800" fill="#173c35">
            بدون سمّ (شاهد)
          </text>
          {/* ج1 */}
          <text x="190" y="50" textAnchor="end" fontSize="10" fontWeight="700" fill="#2f5d47">ج1 (قبل مشبكي)</text>
          <line x1="34" y1="54" x2="34" y2="112" stroke="#64748b" strokeWidth="1.2" />
          <line x1="34" y1="102" x2="188" y2="102" stroke="#94a3b8" strokeDasharray="3 3" strokeWidth="1" />
          <line x1="34" y1="74" x2="188" y2="74" stroke="#cbd5e1" strokeDasharray="2 3" strokeWidth="1" />
          <text x="30" y="105" textAnchor="end" fontSize="8.5" fill="#475569">-70</text>
          <text x="30" y="77" textAnchor="end" fontSize="8.5" fill="#475569">0</text>
          <text x="30" y="61" textAnchor="end" fontSize="8.5" fill="#475569">+30</text>
          <path d="M36 102 L66 102 L76 58 L84 109 L92 102 L182 102" fill="none" stroke="#1e5a40" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          {/* ج2 */}
          <text x="190" y="136" textAnchor="end" fontSize="10" fontWeight="700" fill="#1d4ed8">ج2 (بعد مشبكي)</text>
          <line x1="34" y1="140" x2="34" y2="200" stroke="#64748b" strokeWidth="1.2" />
          <line x1="34" y1="188" x2="188" y2="188" stroke="#94a3b8" strokeDasharray="3 3" strokeWidth="1" />
          <text x="30" y="191" textAnchor="end" fontSize="8.5" fill="#475569">-70</text>
          <text x="30" y="150" textAnchor="end" fontSize="8.5" fill="#475569">+30</text>
          <path d="M36 188 L82 188 Q92 178 100 174 L108 145 L117 195 L125 188 L182 188" fill="none" stroke="#2563eb" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          <text x="112" y="212" textAnchor="middle" fontSize="9" fontWeight="700" fill="#1d4ed8">PPSE ← كمون عمل</text>

          {/* لوحة 2: بوجود السم */}
          <rect x="218" y="12" width="190" height="211" rx="10" fill="#ffffff" stroke="#e2cbc4" />
          <text x="313" y="30" textAnchor="middle" fontSize="11.5" fontWeight="800" fill="#9a3412">
            في وجود السمّ (ألفا-توكسين)
          </text>
          {/* ج1 */}
          <text x="396" y="50" textAnchor="end" fontSize="10" fontWeight="700" fill="#2f5d47">ج1 (قبل مشبكي)</text>
          <line x1="240" y1="54" x2="240" y2="112" stroke="#64748b" strokeWidth="1.2" />
          <line x1="240" y1="102" x2="394" y2="102" stroke="#94a3b8" strokeDasharray="3 3" strokeWidth="1" />
          <text x="236" y="105" textAnchor="end" fontSize="8.5" fill="#475569">-70</text>
          <text x="236" y="61" textAnchor="end" fontSize="8.5" fill="#475569">+30</text>
          <path d="M242 102 L272 102 L282 58 L290 109 L298 102 L388 102" fill="none" stroke="#1e5a40" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          {/* ج2 مسطّح */}
          <text x="396" y="136" textAnchor="end" fontSize="10" fontWeight="700" fill="#b91c1c">ج2 (بعد مشبكي)</text>
          <line x1="240" y1="140" x2="240" y2="200" stroke="#64748b" strokeWidth="1.2" />
          <line x1="240" y1="188" x2="394" y2="188" stroke="#94a3b8" strokeDasharray="3 3" strokeWidth="1" />
          <text x="236" y="191" textAnchor="end" fontSize="8.5" fill="#475569">-70</text>
          <line x1="242" y1="188" x2="388" y2="188" stroke="#dc2626" strokeWidth="2.8" strokeLinecap="round" />
          <text x="315" y="212" textAnchor="middle" fontSize="9.2" fontWeight="700" fill="#b91c1c">كمون راحة ثابت (−70 mV)</text>
        </Plaque>
      );

    /* 1B. المشابك: آلية التثبيت */
    case 'synapse-blocage':
      return (
        <Plaque titreAria="مقارنة الشق المشبكي بدون سم وفي وجود السم العصبي">
          <rect x="0" y="0" width="420" height="235" fill="#fbfaf5" rx="10" />
          {/* الزر قبل المشبكي */}
          <path d="M55 18 Q55 96 125 96 L295 96 Q365 96 365 18" fill="#e6f2ea" stroke="#1e5a40" strokeWidth="2" />
          <text x="210" y="42" textAnchor="middle" fontSize="12" fontWeight="800" fill="#173c35">نهاية محورية قبل مشبكية (ع1)</text>
          {/* حويصلات مشبكية */}
          <circle cx="135" cy="70" r="14" fill="#ffffff" stroke="#1e5a40" strokeWidth="1.6" />
          <circle cx="132" cy="68" r="2.5" fill="#0d9488" /><circle cx="139" cy="72" r="2.5" fill="#0d9488" />
          <circle cx="285" cy="70" r="14" fill="#ffffff" stroke="#1e5a40" strokeWidth="1.6" />
          <circle cx="282" cy="68" r="2.5" fill="#0d9488" /><circle cx="289" cy="72" r="2.5" fill="#0d9488" />
          <text x="210" y="76" textAnchor="middle" fontSize="10" fontWeight="700" fill="#0f766e">تحرير الأستيل كولين: 100% في الحالتين</text>

          {/* جزيئات أستيل كولين في الشق */}
          {[118, 134, 150, 272, 288, 304].map((x, i) => (
            <circle key={i} cx={x} cy={112 + (i % 2) * 10} r="4" fill="#0d9488" />
          ))}

          {/* الغشاء بعد المشبكي */}
          <rect x="24" y="146" width="372" height="72" rx="12" fill="#f1f5f9" stroke="#475569" strokeWidth="1.8" />
          <text x="210" y="207" textAnchor="middle" fontSize="11" fontWeight="800" fill="#334155">الغشاء بعد المشبكي (ع2)</text>

          {/* مستقبل مفتوح (شاهد) */}
          <rect x="96" y="136" width="18" height="34" rx="4" fill="#1e5a40" />
          <rect x="132" y="136" width="18" height="34" rx="4" fill="#1e5a40" />
          <circle cx="105" cy="136" r="4.5" fill="#0d9488" />
          <circle cx="141" cy="136" r="4.5" fill="#0d9488" />
          <path d="M123 130 L123 182" stroke="#2563eb" strokeWidth="2.5" strokeDasharray="3 2" />
          <polygon points="118,178 128,178 123,187" fill="#2563eb" />
          <text x="123" y="197" textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#1d4ed8">دخول Na⁺ (شاهد)</text>

          {/* مستقبل محجوب بالسم */}
          <rect x="272" y="136" width="22" height="34" rx="4" fill="#64748b" />
          <rect x="296" y="136" width="22" height="34" rx="4" fill="#64748b" />
          {/* جزيئة السم */}
          <polygon points="274,138 295,123 316,138 308,146 282,146" fill="#dc2626" />
          <text x="295" y="138" textAnchor="middle" fontSize="8.5" fontWeight="800" fill="#ffffff">سمّ</text>
          <text x="295" y="188" textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#b91c1c">قناة Na⁺ مغلقة ✕</text>
        </Plaque>
      );

    /* 2A. الإنزيمات: حركية استهلاك O2 */
    case 'enzyme-cinetique':
      return (
        <Plaque titreAria="منحنيات تطور تركيز الأكسجين في غياب المثبط وفي وجوده">
          <rect x="0" y="0" width="420" height="235" fill="#fbfaf5" rx="10" />
          {/* المحاور */}
          <line x1="56" y1="26" x2="56" y2="188" stroke="#334155" strokeWidth="1.8" />
          <line x1="56" y1="188" x2="392" y2="188" stroke="#334155" strokeWidth="1.8" />
          <text x="52" y="20" textAnchor="middle" fontSize="10" fontWeight="800" fill="#173c35">تركيز O₂ (mg/L)</text>
          <text x="388" y="206" textAnchor="end" fontSize="10" fontWeight="800" fill="#173c35">الزمن (s)</text>
          {/* شبكة أفقية */}
          {[46, 82, 118, 154].map((y, i) => (
            <g key={y}>
              <line x1="56" y1={y} x2="388" y2={y} stroke="#e2e8f0" strokeWidth="1" />
              <text x="48" y={y + 3} textAnchor="end" fontSize="9" fill="#475569">{8 - i * 2}</text>
            </g>
          ))}
          {/* خط حقن الإنزيم */}
          <line x1="126" y1="30" x2="126" y2="188" stroke="#94a3b8" strokeDasharray="4 3" strokeWidth="1.3" />
          <text x="126" y="203" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#475569">t = 30s (إضافة الإنزيم)</text>

          {/* المنحنى ب: مثبط + ركيزة عادية */}
          <path d="M58 46 L126 46 Q220 56 382 88" fill="none" stroke="#dc2626" strokeWidth="2.8" strokeLinecap="round" />
          <text x="382" y="80" textAnchor="end" fontSize="10" fontWeight="800" fill="#b91c1c">ب: ركيزة + مثبّط (م)</text>

          {/* المنحنى ج: مثبط + ركيزة مرتفعة */}
          <path d="M58 46 L126 46 Q185 112 260 144 T382 152" fill="none" stroke="#d97706" strokeWidth="2.6" strokeDasharray="6 3" strokeLinecap="round" />
          <text x="382" y="143" textAnchor="end" fontSize="10" fontWeight="800" fill="#b45309">ج: ركيزة مرتفعة + (م)</text>

          {/* المنحنى أ: شاهد */}
          <path d="M58 46 L126 46 Q178 134 250 162 T382 168" fill="none" stroke="#1e5a40" strokeWidth="3" strokeLinecap="round" />
          <text x="382" y="180" textAnchor="end" fontSize="10" fontWeight="800" fill="#173c35">أ: شاهد (بدون مثبّط)</text>
        </Plaque>
      );

    /* 2B. الإنزيمات: الموقع الفعال */
    case 'enzyme-site':
      return (
        <Plaque titreAria="التنافس البنيوي بين الركيزة والمثبط على الموقع الفعال للإنزيم">
          <rect x="0" y="0" width="420" height="235" fill="#fbfaf5" rx="10" />
          {/* حالة 1: معقد ES */}
          <rect x="14" y="16" width="188" height="203" rx="12" fill="#ffffff" stroke="#cde0d4" />
          <text x="108" y="37" textAnchor="middle" fontSize="11.5" fontWeight="800" fill="#173c35">تشكّل المعقّد الإنزيمي (ES)</text>
          {/* الإنزيم */}
          <path d="M44 132 A64 56 0 1 1 172 132 L172 178 Q108 194 44 178 Z" fill="#1e5a40" />
          {/* فجوة الموقع الفعال */}
          <polygon points="84,82 132,82 122,126 94,126" fill="#ffffff" />
          {/* الركيزة */}
          <polygon points="88,78 128,78 120,120 96,120" fill="#0d9488" stroke="#115e59" strokeWidth="1.5" />
          <text x="108" y="103" textAnchor="middle" fontSize="10" fontWeight="800" fill="#ffffff">غلوكوز</text>
          <text x="108" y="156" textAnchor="middle" fontSize="10.5" fontWeight="800" fill="#ffffff">إنزيم GO</text>
          <text x="108" y="205" textAnchor="middle" fontSize="10" fontWeight="800" fill="#15803d">تحفيز وتشكّل الناتج ✓</text>

          {/* حالة 2: معقد EI */}
          <rect x="218" y="16" width="188" height="203" rx="12" fill="#ffffff" stroke="#f0d3cb" />
          <text x="312" y="37" textAnchor="middle" fontSize="11.5" fontWeight="800" fill="#9a3412">التنافس بوجود المثبّط (EI)</text>
          <path d="M248 132 A64 56 0 1 1 376 132 L376 178 Q312 194 248 178 Z" fill="#1e5a40" />
          <polygon points="288,82 336,82 326,126 298,126" fill="#ffffff" />
          {/* المثبط داخل الموقع الفعال */}
          <polygon points="292,78 332,78 324,120 300,120" fill="#dc2626" stroke="#991b1b" strokeWidth="1.5" />
          <rect x="298" y="60" width="28" height="18" rx="4" fill="#ef4444" />
          <text x="312" y="103" textAnchor="middle" fontSize="10" fontWeight="800" fill="#ffffff">مثبّط م</text>
          <text x="312" y="156" textAnchor="middle" fontSize="10.5" fontWeight="800" fill="#ffffff">إنزيم GO</text>
          <text x="312" y="205" textAnchor="middle" fontSize="10" fontWeight="800" fill="#b91c1c">تشابه بنيوي ← حجب مؤقّت ✕</text>
        </Plaque>
      );

    /* 3A. المناعة: أعمدة نسبة التخريب */
    case 'immunite-lyse':
      return (
        <Plaque titreAria="أعمدة بيانية لنسبة تخريب الخلايا المستهدفة في أربعة أوساط">
          <rect x="0" y="0" width="420" height="235" fill="#fbfaf5" rx="10" />
          <line x1="56" y1="26" x2="56" y2="178" stroke="#334155" strokeWidth="1.8" />
          <line x1="56" y1="178" x2="394" y2="178" stroke="#334155" strokeWidth="1.8" />
          <text x="56" y="18" textAnchor="middle" fontSize="10" fontWeight="800" fill="#173c35">% تخريب الخلايا</text>
          {[0, 50, 100].map((v) => {
            const y = 178 - v * 1.38;
            return (
              <g key={v}>
                <line x1="56" y1={y} x2="390" y2={y} stroke="#e2e8f0" strokeWidth="1" />
                <text x="48" y={y + 3} textAnchor="end" fontSize="9" fill="#475569">{v}%</text>
              </g>
            );
          })}
          {[
            { x: 84, val: 92, color: '#1e5a40', l1: 'وسط 1', l2: 'س + فيروس A' },
            { x: 166, val: 3, color: '#94a3b8', l1: 'وسط 2', l2: 'س سليمة' },
            { x: 248, val: 4, color: '#d97706', l1: 'وسط 3', l2: 'س + فيروس B' },
            { x: 330, val: 3, color: '#dc2626', l1: 'وسط 4', l2: 'ع + فيروس A' },
          ].map((b) => {
            const h = Math.max(5, b.val * 1.38);
            const y = 178 - h;
            return (
              <g key={b.l1}>
                <rect x={b.x} y={y} width="46" height={h} rx="6" fill={b.color} />
                <text x={b.x + 23} y={y - 6} textAnchor="middle" fontSize="10.5" fontWeight="800" fill={b.color}>
                  {b.val}%
                </text>
                <text x={b.x + 23} y="196" textAnchor="middle" fontSize="10" fontWeight="800" fill="#173c35">{b.l1}</text>
                <text x={b.x + 23} y="211" textAnchor="middle" fontSize="8.8" fontWeight="600" fill="#475569">{b.l2}</text>
              </g>
            );
          })}
        </Plaque>
      );

    /* 3B. المناعة: آلية التعرف المزدوج والبرفورين */
    case 'immunite-ltc':
      return (
        <Plaque titreAria="رسم تخطيطي للتعرف المزدوج وإفراز البرفورين من LTc">
          <rect x="0" y="0" width="420" height="235" fill="#fbfaf5" rx="10" />
          {/* الخلية LTc */}
          <circle cx="112" cy="118" r="66" fill="#e6f2ea" stroke="#1e5a40" strokeWidth="2.2" />
          <circle cx="96" cy="118" r="30" fill="#c7e2cf" stroke="#1e5a40" strokeWidth="1.4" />
          <text x="96" y="122" textAnchor="middle" fontSize="13" fontWeight="800" fill="#173c35">LTc</text>
          {/* حويصلات برفورين */}
          <circle cx="148" cy="146" r="10" fill="#ffffff" stroke="#d97706" strokeWidth="1.6" />
          <circle cx="146" cy="145" r="2.2" fill="#d97706" /><circle cx="151" cy="148" r="2.2" fill="#d97706" />

          {/* الخلية المصابة */}
          <rect x="268" y="42" width="132" height="152" rx="28" fill="#fef2f2" stroke="#b91c1c" strokeWidth="2.2" />
          <text x="334" y="106" textAnchor="middle" fontSize="11.5" fontWeight="800" fill="#991b1b">خلية مصابة</text>
          <text x="334" y="124" textAnchor="middle" fontSize="10" fontWeight="700" fill="#b91c1c">(سلالة س · فيروس A)</text>

          {/* جزيئة CMH-I + بيبتيد + TCR */}
          <path d="M268 88 L236 88 L236 102 L268 102" fill="#94a3b8" stroke="#334155" strokeWidth="1.4" />
          <polygon points="224,95 236,88 236,102" fill="#dc2626" />
          <path d="M178 90 L216 90 L224 95 L216 100 L178 100" fill="#1e5a40" />
          <text x="223" y="72" textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#173c35">تعرّف مزدوج</text>
          <text x="223" y="83" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#475569">TCR + CMH-I + بيبتيد A</text>

          {/* البرفورين وتشكيل القنوات */}
          <path d="M168 152 Q216 156 260 152" fill="none" stroke="#d97706" strokeWidth="2.2" strokeDasharray="4 2" />
          <rect x="260" y="143" width="16" height="18" rx="3" fill="#d97706" />
          <text x="218" y="176" textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#b45309">إفراز البرفورين ← قنوات غشائية</text>
          <text x="334" y="168" textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#1d4ed8">دخول الماء ← انحلال الخلية</text>
        </Plaque>
      );

    /* 4A. تركيب البروتين: منحنيات الإشعاع */
    case 'proteine-courbes':
      return (
        <Plaque titreAria="منحنيات دمج اليوراسيل المشع واللوسين المشع بدلالة الزمن">
          <rect x="0" y="0" width="420" height="235" fill="#fbfaf5" rx="10" />
          <line x1="56" y1="26" x2="56" y2="188" stroke="#334155" strokeWidth="1.8" />
          <line x1="56" y1="188" x2="394" y2="188" stroke="#334155" strokeWidth="1.8" />
          <text x="58" y="19" textAnchor="middle" fontSize="10" fontWeight="800" fill="#173c35">كمية الإشعاع (و.إ)</text>
          <text x="392" y="206" textAnchor="end" fontSize="10" fontWeight="800" fill="#173c35">الزمن (min)</text>
          {[0, 50, 100].map((v) => {
            const y = 188 - v * 1.48;
            return (
              <g key={v}>
                <line x1="56" y1={y} x2="390" y2={y} stroke="#e2e8f0" strokeWidth="1" />
                <text x="48" y={y + 3} textAnchor="end" fontSize="9" fill="#475569">{v}</text>
              </g>
            );
          })}
          {/* إضافة المضاد الحيوي */}
          <line x1="176" y1="28" x2="176" y2="188" stroke="#dc2626" strokeDasharray="4 3" strokeWidth="1.5" />
          <text x="176" y="203" textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#b91c1c">t = 10 min (إضافة المضادّ ك)</text>

          {/* منحنى اليوراسيل (الاستنساخ مستمر) */}
          <path d="M58 184 Q176 112 384 44" fill="none" stroke="#1e5a40" strokeWidth="3" strokeLinecap="round" />
          <text x="380" y="38" textAnchor="end" fontSize="10" fontWeight="800" fill="#173c35">³H-يوراسيل (استنساخ مستمرّ)</text>

          {/* منحنى اللوسين (الترجمة تتوقف) */}
          <path d="M58 184 L176 126 L384 126" fill="none" stroke="#d97706" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <text x="380" y="118" textAnchor="end" fontSize="10" fontWeight="800" fill="#b45309">³H-لوسين (توقّف الترجمة عند 42)</text>
        </Plaque>
      );

    /* 4B. تركيب البروتين: حجب الموقع A للريبوزوم */
    case 'proteine-ribosome':
      return (
        <Plaque titreAria="توضع المضاد الحيوي ك على الموقع A للريبوزوم ومنع دخول ARNt">
          <rect x="0" y="0" width="420" height="235" fill="#fbfaf5" rx="10" />
          {/* الوحدة الكبرى والصغرى */}
          <rect x="92" y="34" width="236" height="96" rx="44" fill="#d9ece0" stroke="#1e5a40" strokeWidth="2" />
          <rect x="108" y="136" width="204" height="52" rx="24" fill="#e6f2ea" stroke="#1e5a40" strokeWidth="2" />
          <text x="210" y="24" textAnchor="middle" fontSize="11" fontWeight="800" fill="#173c35">ريبوزوم بكتيري (مرحلة الاستطالة)</text>

          {/* خيط ARNm */}
          <line x1="28" y1="138" x2="392" y2="138" stroke="#0f766e" strokeWidth="4.5" strokeLinecap="round" />
          <text x="42" y="156" fontSize="10" fontWeight="800" fill="#0f766e">5&apos; ARNm</text>
          <text x="378" y="156" textAnchor="end" fontSize="10" fontWeight="800" fill="#0f766e">3&apos;</text>

          {/* الموقع P */}
          <rect x="148" y="64" width="48" height="66" rx="8" fill="#ffffff" stroke="#1e5a40" strokeDasharray="3 2" />
          <text x="172" y="58" textAnchor="middle" fontSize="10" fontWeight="800" fill="#173c35">الموقع P</text>
          <rect x="160" y="84" width="24" height="44" rx="5" fill="#0d9488" />
          <circle cx="172" cy="76" r="7" fill="#1e5a40" />
          <circle cx="162" cy="64" r="6" fill="#2f7d58" />

          {/* الموقع A محجوب */}
          <rect x="224" y="64" width="48" height="66" rx="8" fill="#fef2f2" stroke="#dc2626" strokeWidth="1.8" />
          <text x="248" y="58" textAnchor="middle" fontSize="10" fontWeight="800" fill="#b91c1c">الموقع A</text>
          <rect x="231" y="92" width="34" height="34" rx="6" fill="#dc2626" />
          <text x="248" y="113" textAnchor="middle" fontSize="10" fontWeight="800" fill="#ffffff">مضادّ ك</text>

          {/* ARNt ممنوع من الدخول */}
          <rect x="342" y="54" width="24" height="40" rx="5" fill="#d97706" />
          <circle cx="354" cy="46" r="7" fill="#b45309" />
          <path d="M336 74 L284 86" stroke="#dc2626" strokeWidth="2" strokeDasharray="3 2" />
          <text x="308" y="72" textAnchor="middle" fontSize="13" fontWeight="900" fill="#dc2626">✕</text>
          <text x="210" y="212" textAnchor="middle" fontSize="10.5" fontWeight="800" fill="#9a3412">
            منع تثبّت ARNt الجديد ← توقّف استطالة السلسلة البيبتيدية
          </text>
        </Plaque>
      );

    /* 5A. التركيب الضوئي: منحنيات O2 و ATP */
    case 'photo-courbes':
      return (
        <Plaque titreAria="تطور طرح الأكسجين وإنتاج ATP بعد إضافة DCMU في الضوء">
          <rect x="0" y="0" width="420" height="235" fill="#fbfaf5" rx="10" />
          <rect x="56" y="22" width="334" height="16" rx="4" fill="#fef3c7" stroke="#f59e0b" />
          <text x="223" y="34" textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#92400e">إضاءة مستمرّة (ضوء قوي)</text>

          <line x1="56" y1="44" x2="56" y2="188" stroke="#334155" strokeWidth="1.8" />
          <line x1="56" y1="188" x2="394" y2="188" stroke="#334155" strokeWidth="1.8" />
          <line x1="196" y1="44" x2="196" y2="188" stroke="#dc2626" strokeDasharray="4 3" strokeWidth="1.6" />
          <text x="196" y="205" textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#b91c1c">t = 2 min (إضافة مبيد DCMU)</text>
          <text x="392" y="205" textAnchor="end" fontSize="9.5" fontWeight="700" fill="#334155">الزمن (min)</text>

          {/* منحنى O2 */}
          <path d="M58 176 L196 86 L386 86" fill="none" stroke="#1e5a40" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <text x="382" y="78" textAnchor="end" fontSize="10" fontWeight="800" fill="#173c35">تركيز O₂ المطروح (ثبات)</text>

          {/* منحنى ATP */}
          <path d="M58 180 L196 120 L386 120" fill="none" stroke="#2563eb" strokeWidth="2.8" strokeDasharray="6 3" strokeLinecap="round" strokeLinejoin="round" />
          <text x="382" y="138" textAnchor="end" fontSize="10" fontWeight="800" fill="#1d4ed8">كمية ATP المُنتج (ثبات)</text>
        </Plaque>
      );

    /* 5B. التركيب الضوئي: غشاء التيلاكويد */
    case 'photo-thylakoide':
      return (
        <Plaque titreAria="سلسلة نقل الإلكترونات في غشاء التيلاكويد وموقع توقفها بمبيد DCMU">
          <rect x="0" y="0" width="420" height="235" fill="#fbfaf5" rx="10" />
          {/* الحشوة والتجويف */}
          <text x="210" y="24" textAnchor="middle" fontSize="10.5" fontWeight="800" fill="#173c35">الحشوة (Stroma)</text>
          <rect x="18" y="76" width="384" height="58" rx="10" fill="#d9ece0" stroke="#1e5a40" strokeWidth="1.8" />
          <text x="210" y="218" textAnchor="middle" fontSize="10.5" fontWeight="800" fill="#0f766e">تجويف التيلاكويد (تراكم H⁺ في الحالة العادية)</text>

          {/* PSII */}
          <rect x="42" y="66" width="54" height="78" rx="10" fill="#1e5a40" />
          <text x="69" y="108" textAnchor="middle" fontSize="11.5" fontWeight="800" fill="#ffffff">PSII</text>
          <text x="69" y="168" textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#0f766e">2H₂O → O₂ + 4H⁺</text>

          {/* حاجز DCMU */}
          <rect x="122" y="84" width="46" height="40" rx="8" fill="#dc2626" />
          <text x="145" y="108" textAnchor="middle" fontSize="10" fontWeight="800" fill="#ffffff">DCMU</text>
          <line x1="96" y1="104" x2="120" y2="104" stroke="#b45309" strokeWidth="2.5" />
          <line x1="170" y1="104" x2="216" y2="104" stroke="#94a3b8" strokeDasharray="3 3" strokeWidth="2" />

          {/* PSI */}
          <rect x="218" y="66" width="54" height="78" rx="10" fill="#2f7d58" />
          <text x="245" y="108" textAnchor="middle" fontSize="11.5" fontWeight="800" fill="#ffffff">PSI</text>
          <text x="245" y="54" textAnchor="middle" fontSize="9.2" fontWeight="800" fill="#b91c1c">لا إرجاع لـ NADP⁺ ✕</text>

          {/* ATP Synthase */}
          <rect x="322" y="62" width="56" height="86" rx="12" fill="#2563eb" />
          <text x="350" y="100" textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#ffffff">ATP</text>
          <text x="350" y="114" textAnchor="middle" fontSize="9" fontWeight="800" fill="#dbeafe">سينتاز</text>
          <text x="350" y="52" textAnchor="middle" fontSize="9.2" fontWeight="800" fill="#b91c1c">لا تركيب ATP ✕</text>
        </Plaque>
      );

    /* 6A. التكتونية: مقطع منطقة الغوص */
    case 'subduction-coupe':
      return (
        <Plaque titreAria="مقطع تخطيطي لمنطقة غوص الصفيحة المحيطية وتوزع البؤر الزلزالية والصهارة">
          <rect x="0" y="0" width="420" height="235" fill="#fbfaf5" rx="10" />
          {/* المحيط */}
          <path d="M16 44 L178 44 L190 66 L16 66 Z" fill="#bfdbfe" />
          <text x="90" y="59" textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#1e3a8a">محيط + خندق</text>
          {/* الصفيحة القارية الطافية */}
          <path d="M188 64 L224 44 L268 44 L286 24 L304 44 L404 44 L404 92 L208 92 Z" fill="#e7e5e4" stroke="#57534e" strokeWidth="1.6" />
          <text x="348" y="68" textAnchor="middle" fontSize="10" fontWeight="800" fill="#44403c">صفيحة قارية طافية</text>
          {/* اللوح المحيطي الغائص */}
          <path d="M16 66 L186 66 L316 218 L272 218 L158 92 L16 92 Z" fill="#334155" stroke="#0f172a" strokeWidth="1.6" />
          <text x="86" y="83" textAnchor="middle" fontSize="9" fontWeight="700" fill="#f8fafc">ليتوسفير محيطي غائص</text>

          {/* البرنس */}
          <text x="352" y="156" textAnchor="middle" fontSize="10.5" fontWeight="800" fill="#7c2d12">البرنس العلوي</text>
          {/* تحرير الماء */}
          <path d="M242 132 L272 114" stroke="#0284c7" strokeWidth="2.4" strokeDasharray="3 2" />
          <text x="234" y="114" textAnchor="end" fontSize="9.2" fontWeight="800" fill="#0369a1">تحرير H₂O (تجفيف)</text>

          {/* حجرة صهارية وبركان */}
          <ellipse cx="286" cy="112" rx="22" ry="13" fill="#dc2626" opacity="0.88" />
          <path d="M286 99 L286 26" stroke="#dc2626" strokeWidth="3.5" />
          <text x="286" y="18" textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#b91c1c">بركنة أنديزيتية</text>

          {/* بؤر زلزالية واداتي بنيوف */}
          {[
            [188, 76],
            [212, 102],
            [236, 130],
            [260, 158],
            [284, 186],
          ].map(([cx, cy], idx) => (
            <circle key={idx} cx={cx} cy={cy} r="4" fill="#f59e0b" stroke="#78350f" strokeWidth="1.2" />
          ))}
          <text x="194" y="198" textAnchor="end" fontSize="9.2" fontWeight="800" fill="#92400e">بؤر زلزالية (واداتي-بنيوف)</text>
        </Plaque>
      );

    /* 6B. التكتونية: منحنى P/T انصهار البيريدوتيت */
    case 'subduction-pt':
      return (
        <Plaque titreAria="منحنى شروط الضغط ودرجة الحرارة للانصهار الجزئي للبيريدوتيت الجاف والمميه">
          <rect x="0" y="0" width="420" height="235" fill="#fbfaf5" rx="10" />
          {/* محاور: الحرارة أفقيا فوق، العمق شاقوليا نحو الأسفل */}
          <line x1="62" y1="34" x2="388" y2="34" stroke="#334155" strokeWidth="1.8" />
          <line x1="62" y1="34" x2="62" y2="206" stroke="#334155" strokeWidth="1.8" />
          <text x="225" y="19" textAnchor="middle" fontSize="10" fontWeight="800" fill="#173c35">درجة الحرارة (°C)</text>
          <text x="26" y="122" textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#173c35" transform="rotate(-90 26 122)">العمق (km)</text>
          {[500, 1000, 1500].map((t, i) => (
            <text key={t} x={140 + i * 95} y="30" textAnchor="middle" fontSize="8.8" fill="#475569">{t}°</text>
          ))}
          {[50, 100, 150].map((d, i) => (
            <g key={d}>
              <line x1="62" y1={84 + i * 50} x2="384" y2={84 + i * 50} stroke="#e2e8f0" strokeWidth="1" />
              <text x="55" y={87 + i * 50} textAnchor="end" fontSize="8.8" fill="#475569">{d}</text>
            </g>
          ))}

          {/* منطقة الانصهار الجزئي */}
          <path d="M188 124 Q225 142 252 178 L216 186 Q192 152 188 124 Z" fill="#fecaca" opacity="0.7" />

          {/* صلبوس مميه ب */}
          <path d="M238 42 Q194 98 186 146 Q188 178 214 202" fill="none" stroke="#0284c7" strokeWidth="2.8" />
          <text x="174" y="168" textAnchor="end" fontSize="9.2" fontWeight="800" fill="#0369a1">ب: صلبوس مُمَيّه</text>

          {/* صلبوس جاف أ */}
          <path d="M276 42 L348 202" fill="none" stroke="#7c2d12" strokeWidth="2.6" strokeDasharray="5 3" />
          <text x="384" y="152" textAnchor="end" fontSize="9.2" fontWeight="800" fill="#7c2d12">أ: صلبوس جافّ</text>

          {/* المنحنى الجيوحراري لمنطقة الغوص */}
          <path d="M72 36 Q162 94 218 148 T268 202" fill="none" stroke="#1e5a40" strokeWidth="3" />
          <text x="296" y="196" textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#173c35">جيوحراري الغوص</text>
          <text x="236" y="138" textAnchor="start" fontSize="8.8" fontWeight="800" fill="#b91c1c">انصهار جزئي</text>
        </Plaque>
      );
  }
}
