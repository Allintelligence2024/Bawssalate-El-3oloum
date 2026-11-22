// ضبط بنك التدريبات: بنية، خيارات، تكرار، نصوص فارغة، تقارب الخيارات.
//
// P-1.3 (تصحيح D3): كان السكربت يفحص 429 من 660 عنصرًا فقط لأن domaine3.ts و
// niveau3.ts يحملان نهايات أسطر CRLF — الـ \r المتبقي يكسر مرساة $ في النمط.
// كما أن مقارنة التقارب كانت تُحسب دون تطبيع عربي (الحركات، الهمزات، علامات
// الترقيم) فتفلت منها الخيارات المتقاربة فعليًّا (d008/d032: 0,625 < 0,65 بفعل
// النقطة الختامية). الآن: تطبيع CRLF + تطبيع عربي، والخيارات المتقاربة تُدرَج
// في قائمة « تنبيهات » تُحال للتحكّم البشري (السكربت يكشف، الأستاذ يقطع) —
// « مشاكل: 0 » يعني بنيويًّا سليمًا، والتقارب أمر تحريري لا يخترق البوابة.
//
// P-1.3 (D6): قاعدة « تعريف يحمل تفسيرًا » قُلبت — كانت تمنع التفسير لأن البطاقة
// القديمة كانت تعرض الإجابة مكانه، وP-1.3 أصلح الـ UI (fallback محايد). الآن
// التفسير إلزامي لكل العناصر (بما فيها التعريفات)، مع بوابتين: منع الصراح
// بعبارة « الجواب الصحيح »، ومنع إرداد الخيار الأول (الإجابة) حرفيًّا داخل
// التفسير (تطبيع عربي، طول ≥ 8 حروف حتى لا تُعلق المختصرات CMH/ATP…).
import { readFileSync } from 'node:fs';

const fichiers = ['domaine1', 'domaine2', 'domaine3', 'niveau3'];
const items = [];
const problemesLignes = [];
for (const f of fichiers) {
  const src = readFileSync(`src/data/drills/${f}.ts`, 'utf8').replace(/\r\n/g, '\n');
  // extraction ligne à ligne (chaque item tient sur une ligne)
  for (const ligne of src.split('\n')) {
    const m = ligne.match(/^\s*\{ id: '([^']+)', u: (\d+), a: (\d+), n: (\d), q: (".*?"), o: \[(.*)\], e: (".*?")(, def: true)? \},$/);
    if (!m) {
      if (ligne.includes('{ id:')) problemesLignes.push(`${f}: non parsé → ${ligne.slice(0, 220)}`);
      continue;
    }
    const options = [...m[6].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((x) => JSON.parse(`"${x[1]}"`));
    items.push({
      id: m[1],
      u: +m[2],
      a: +m[3],
      n: +m[4],
      q: JSON.parse(m[5]),
      o: options,
      e: JSON.parse(m[7]),
      def: Boolean(m[8]),
    });
  }
}

const problemes = [];
if (items.length === 0) problemes.push('Aucun item reconnu dans la banque');
const تنبيهات = [];
const ids = new Set();

/** تطبيع عربي: حركات + تشديد + تطويل، توحيد الهمزات والتاء والياء، حذف علامات الترقيم. */
function normaliserArabe(s) {
  return s
    .replace(/[\u064B-\u0652\u0640]/g, '') // حركات + شدة + تطويل
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[.,،؛;:«»()\]"'!?؟ـ–—-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function ressemblance(a, b) {
  const na = normaliserArabe(a);
  const nb = normaliserArabe(b);
  const ta = new Set(na.split(' ').filter(Boolean));
  const tb = new Set(nb.split(' ').filter(Boolean));
  const commun = [...ta].filter((t) => tb.has(t)).length;
  return commun / Math.max(ta.size, tb.size);
}

for (const i of items) {
  if (ids.has(i.id)) problemes.push(`${i.id}: معرّف مكرر`);
  ids.add(i.id);
  if (i.o.length !== 4) problemes.push(`${i.id}: ${i.o.length} خيارات`);
  if (new Set(i.o).size !== 4) problemes.push(`${i.id}: خيارات مكرّرة حرفيًّا`);
  if (!i.q.trim()) problemes.push(`${i.id}: سؤال فارغ`);
  if (i.o.some((o) => !o.trim())) problemes.push(`${i.id}: خيار فارغ`);
  if (!i.e.trim()) problemes.push(`${i.id}: بلا تفسير`);
  // بوابة مكافحة النقل حصريّة على التعريفات (محور D6): القديمة qXXX تحمل أسلوب
  // قاموسي « المصطلح: تعريف » يردّ الإجابة — سائل تراجعي يُدار في المراجعة (§3)
  // لا في بوابة البنية، وإلا فسقطت 501 مشكلة خارج نطاق الطلب.
  if (i.def) {
    if (i.e.includes('الجواب الصحيح')) problemes.push(`${i.id}: التفسير يصرّح بالإجابة`);
    const no = normaliserArabe(i.o[0]);
    if (no.length >= 8 && normaliserArabe(i.e).includes(no)) {
      problemes.push(`${i.id}: التفسير يردّ إجابة الخيار الأول حرفيًّا`);
    }
  }
  if (/\d+\.\d+ —|في محور|أمامك وثيقة|\*\*/.test(i.q)) problemes.push(`${i.id}: بقايا قالب: ${i.q}`);
  if (/[٠-٩]/.test(i.q) || i.o.some((o) => /[٠-٩]/.test(o))) problemes.push(`${i.id}: رقم هندي`);
  for (let x = 0; x < i.o.length; x++) {
    for (let y = x + 1; y < i.o.length; y++) {
      const sim = ressemblance(i.o[x], i.o[y]);
      if (i.o[x] === i.o[y]) continue; // مكرّرة حرفيًّا → problemes أعلاه
      if (sim >= 0.65) تنبيهات.push(`${i.id}: خيارات متقاربة (${sim.toFixed(2)}): ${i.o[x]} / ${i.o[y]}`);
    }
  }
}

const squelettes = {};
for (const i of items) {
  const k = i.q.split(/\s+/).slice(0, 5).join(' ');
  squelettes[k] = (squelettes[k] ?? 0) + 1;
}

// ── Gabarits tautologiques (Plan V2 §10.2) ──────────────────────────────────
// Mesure de départ, 22/11/2026 : 340 items sur 700 (49 %) partagent 6 amorces,
// explication médiane 66 caractères, 500 items sous 110 caractères.
// La cible du plan est ≤ 15 occurrences par amorce ; on ne peut pas y arriver d'un
// coup sur 700 items. On applique donc le seuil en **alerte** (mesuré, chiffré,
// publié en CI) et le seuil d'explication en **alerte** aussi, pour rendre la dette
// visible à chaque exécution au lieu de la laisser invisible.
const SEUIL_AMORCE = 15;
const SEUIL_EXPLICATION = 110;

const amorces = {};
for (const i of items) {
  const a = i.q.split(/\s+/).slice(0, 4).join(' ');
  amorces[a] = (amorces[a] ?? 0) + 1;
}
const amorcesEnTrop = Object.entries(amorces).filter(([, n]) => n > SEUIL_AMORCE).sort((a, b) => b[1] - a[1]);
for (const [a, n] of amorcesEnTrop) {
  تنبيهات.push(`amorce répétée ${n}× (plafond ${SEUIL_AMORCE}): « ${a} »`);
}

// Explication trop courte, ou qui se contente de recopier l'option correcte.
const courtes = [];
const recopies = [];
for (const i of items) {
  if (i.e.length < SEUIL_EXPLICATION) courtes.push(i.id);
  // Recopie = l'explication contient la réponse (normalisée) sans rien ajouter de plus.
  const norm = (x) => x.replace(/[\u064B-\u0652]/g, '').replace(/[إأآا]/g, 'ا').replace(/\s+/g, ' ').trim();
  const reponse = norm(i.o[0]);
  if (reponse.length >= 8 && norm(i.e) === reponse) recopies.push(i.id);
}
if (courtes.length) {
  تنبيهات.push(`${courtes.length} explication(s) < ${SEUIL_EXPLICATION} caractères (dette §10.2) : ${courtes.slice(0, 12).join(', ')}${courtes.length > 12 ? ' …' : ''}`);
}
if (recopies.length) {
  problemes.push(`${recopies.length} explication(s) recopient simplement l'option correcte : ${recopies.slice(0, 12).join(', ')}`);
}

console.log(`عناصر: ${items.length} · تعريفات: ${items.filter((i) => i.def).length} · مستوى 3: ${items.filter((i) => i.n === 3).length} · مشاكل: ${problemes.length + problemesLignes.length} · تنبيهات: ${تنبيهات.length}`);
for (const p of problemesLignes) console.log('- ' + p);
for (const p of problemes.slice(0, 40)) console.log('- ' + p);
if (تنبيهات.length) {
  console.log('\nتنبيهات (خيارات متقاربة — تُحال للتحكّم البشري، لا تُعدّ مشكلة تلقائيًّا):');
  for (const t of تنبيهات.slice(0, 40)) console.log('- ' + t);
  if (تنبيهات.length > 40) console.log(`… و${تنبيهات.length - 40} أخرى`);
}
console.log(`\nحالة جودة الصياغة (§10.2): ${items.filter((i) => i.e.length < SEUIL_EXPLICATION).length}/${items.length} تفسيرًا أقلّ من ${SEUIL_EXPLICATION} حرفًا · ${amorcesEnTrop.length} صيغة استهلالية فوق ${SEUIL_AMORCE} تكرارًا`);
console.log('\nأكثر الصيغ (5 كلمات):');
for (const [k, v] of Object.entries(squelettes).sort((a, b) => b[1] - a[1]).slice(0, 25)) {
  console.log(`${v} × ${k}`);
}

// Les erreurs structurelles doivent échouer en CI ; les alertes de similarité restent à arbitrer.
if (problemes.length || problemesLignes.length) process.exitCode = 1;
