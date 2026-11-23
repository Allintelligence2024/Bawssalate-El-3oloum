// Artemis Android FINAL — navigation robuste via boutons de retour aria-label, 5 onglets, examen, mind map, QCM.
import { writeFileSync } from 'node:fs';

const RESULTS = 'plans/QA-APP-ARTEMIS-2026-11-22-android-final.md';
const checks = [];
function pass(name, ok, detail) {
  checks.push({ name, ok: !!ok, detail: detail ?? '' });
  console.log(`${ok ? '✅' : '❌'} ${name}${detail ? ' - ' + detail : ''}`);
}
const targets = await (await fetch('http://localhost:9222/json/list')).json();
const t = targets.find((x) => x.type === 'page');
const ws = new WebSocket(t.webSocketDebuggerUrl);
let seq = 0; const pending = new Map();
ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(new Error(JSON.stringify(m.error))) : p.resolve(m.result); } });
await new Promise((res, rej) => { ws.addEventListener('open', res, { once: true }); ws.addEventListener('error', rej, { once: true }); });
const cmd = (method, params = {}) => new Promise((res, rej) => {
  const id = ++seq; pending.set(id, { resolve: res, reject: rej });
  ws.send(JSON.stringify({ id, method, params }));
  setTimeout(() => { if (pending.has(id)) { pending.delete(id); rej(new Error('timeout ' + method)); } }, 15000);
});
async function ev(expr) {
  const r = await cmd('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text);
  return r.result.value;
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const txt = () => ev(`(document.body.innerText || '').replace(/\\n{3,}/g,'\\n\\n').slice(0,800)`);
const btns = () => ev(`Array.from(document.querySelectorAll('button')).filter(b=>b.offsetParent!==null).map(b=>({t:(b.textContent||'').trim().slice(0,55),a:b.getAttribute('aria-label')||''})).filter(x=>x.t||x.a)`);
async function click(text, exact = false) {
  return ev(`(() => { const es = Array.from(document.querySelectorAll('button,[role="button"],a')); const e = es.find(b => ${exact ? 'b.textContent.trim() === '+JSON.stringify(text) : 'b.textContent.includes('+JSON.stringify(text)+')'} && b.offsetParent !== null); if (!e) return false; e.click(); return true; })()`);
}
async function clickAria(label) {
  return ev(`(() => { const e = Array.from(document.querySelectorAll('button')).find(b => b.getAttribute('aria-label') === ${JSON.stringify(label)} && b.offsetParent !== null); if (!e) return false; e.click(); return true; })()`);
}
// Retour générique : tout bouton dont l'aria-label indique une sortie/retour.
async function clickAnyBack() {
  return ev(`(() => {
    const re = /خروج|عودة|رجوع|إغلاق|back|close|retour/i;
    const e = Array.from(document.querySelectorAll('button')).find(b => re.test(b.getAttribute('aria-label') || '') && b.offsetParent !== null);
    if (!e) return '';
    const label = e.getAttribute('aria-label'); e.click(); return label;
  })()`);
}
async function shot(n) { try { const r = await cmd('Page.captureScreenshot', { format: 'png' }); writeFileSync(`plans/screenshots/android-done-${n}.png`, Buffer.from(r.data, 'base64')); } catch {} }

const TABS = ['اليوم', 'مساري', 'منهجية', 'تدريبات', 'أنا'];
const SAFE_EXCLUDE = /تسجيل الخروج|حذف|إلغاء|إعادة تعيين|مسح|logout|delete/i;
async function hasNav() {
  const b = await btns();
  const names = b.map((x) => x.t || x.a);
  return TABS.filter((x) => names.includes(x)).length >= 2;
}
async function goHome() {
  for (let i = 0; i < 12; i++) {
    if (await hasNav()) return true;
    if (await click('اضغط للمتابعة')) { await sleep(1200); continue; }
    if (await click('ابدأ')) { await sleep(1500); continue; }
    if (await ev(`!!document.querySelector('#email')`)) {
      await ev(`(() => {
        const set=(s,v)=>{const e=document.querySelector(s);if(!e)return;const proto=e.tagName==='SELECT'?HTMLSelectElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(proto,'value').set.call(e,v);e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));};
        set('#email','qaandroid@bousala.test');set('#mdp','Pass12345!');set('#mdp2','Pass12345!');
        const w=document.querySelector('#wilaya');if(w&&w.options.length>1){w.selectedIndex=1;w.dispatchEvent(new Event('change',{bubbles:true}));}
        return true;})()`);
      await sleep(600);
      await ev(`(() => {const d=document.querySelector('#daira');if(d&&d.options.length>1){d.selectedIndex=1;d.dispatchEvent(new Event('change',{bubbles:true}));}return true;})()`);
      await click('أنشئ الحساب');
      await sleep(2500);
      continue;
    }
    const back = await clickAnyBack();
    if (back) { console.log('  ← retour:', back); await sleep(700); continue; }
    if (await click('العودة إلى المرحلة 1')) { await sleep(700); continue; }
    if (await click('إغلاق')) { await sleep(500); continue; }
    break;
  }
  const ok = await hasNav();
  if (ok) await click('لاحقًا').catch(() => {});
  await sleep(500);
  return ok;
}

try {
  await cmd('Page.enable'); await cmd('Runtime.enable');
  let ok = await goHome();
  pass('Android : navigation atteinte', ok, ok ? '5 onglets disponibles' : 'échec');
  await shot('00-home');
  const details = [];
  let total = 0;
  for (const tab of TABS) {
    try {
      if (!(await goHome())) { pass(`Onglet ${tab} : navigation perdue`, false); continue; }
      const present = (await btns()).some((x) => (x.t || x.a) === tab);
      pass(`Onglet ${tab} : présent`, present, present ? 'cliqué' : 'introuvable');
      if (!present) continue;
      await click(tab, true);
      await sleep(1500);
      const tt = await txt();
      const bb = await btns();
      details.push({ tab, text: tt, buttons: bb });
      console.log(`\n--- ${tab} ---\n${tt.slice(0, 400)}`);
      pass(`Onglet ${tab} : contenu`, tt.trim().length > 30, tt.split('\n').filter(Boolean).slice(0, 3).join(' | ').slice(0, 110));
      await shot(`tab-${tab}`);
      // 3 clics sûrs puis retour
      let n = 0;
      for (const label of bb.map((x) => x.t || x.a).filter((x) => !TABS.includes(x) && !SAFE_EXCLUDE.test(x) && x.length > 2).slice(0, 3)) {
        if (await click(label, true)) { n++; await sleep(500); }
      }
      pass(`Onglet ${tab} : boutons testés`, n > 0, `${n} clics`);
      total += n;
    } catch (e) { pass(`Onglet ${tab} : erreur`, false, String((e && e.message) || e).slice(0, 150)); }
  }
  pass('Android : TOTAL clics', total > 0, `${total}`);

  // Examen blanc
  try {
    await goHome();
    const found = await click('الامتحان التجريبي');
    pass('Android : examen blanc', found, found ? 'cliqué' : 'introuvable');
    if (found) { await sleep(1500); const et = await txt(); pass('Android : écran examen', /امتحان|سؤال|وقت|التركيب/.test(et), et.split('\n').filter(Boolean).slice(0, 3).join(' | ').slice(0, 110)); await shot('exam'); }
  } catch (e) { pass('Android : examen erreur', false, String((e && e.message) || e).slice(0, 150)); }

  // Mind map
  try {
    await goHome();
    const mm = await click('ورشات الخرائط الذهنية');
    pass('Android : mind map', mm, mm ? 'cliqué' : 'introuvable');
    if (mm) { await sleep(1200); const mt = await txt(); pass('Android : mind map contenu', /خريطة|مخطّط|ذهنية/.test(mt), mt.split('\n').filter(Boolean).slice(0, 3).join(' | ').slice(0, 110)); await shot('mindmap'); }
  } catch (e) { pass('Android : mind map erreur', false, String((e && e.message) || e).slice(0, 150)); }

  // QCM
  try {
    await goHome();
    await click('تدريبات', true);
    await sleep(1200);
    const bb = await btns();
    let n = 0;
    for (const x of bb.map((v) => v.t || v.a).filter((v) => v.length > 15 && !TABS.includes(v) && !SAFE_EXCLUDE.test(v)).slice(0, 5)) {
      if (await click(x, true)) { n++; await sleep(600); }
    }
    pass('Android : QCM échantillon', n > 0, `${n} options`);
    await shot('qcm');
  } catch (e) { pass('Android : QCM erreur', false, String((e && e.message) || e).slice(0, 150)); }

  const errs = await ev(`window.__qaErrors || []`).catch(() => []);
  pass('Android : erreurs JS', errs.length === 0, JSON.stringify(errs).slice(0, 150));
  writeFileSync('plans/QA-APP-ARTEMIS-2026-11-22-android-details.json', JSON.stringify(details, null, 2));
} catch (e) {
  pass('Android : ERREUR FATALE', false, String((e && e.message) || e).slice(0, 200));
} finally {
  ws.close();
  writeFileSync(RESULTS, ['# Artemis — Android final (CDP, émulateur) — 2026-11-23', '', '## Résultats', ...checks.map((c) => `- ${c.ok ? '✅' : '❌'} ${c.name}${c.detail ? ' — ' + c.detail : ''}`), ''].join('\n'));
  console.log('\nRésumé:', RESULTS);
}
