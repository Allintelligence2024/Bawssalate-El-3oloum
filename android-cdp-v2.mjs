// Artemis Android v2 — ferme le prompt de diagnostic, teste les 5 onglets (dont « منهجية »), examen et QCM.
import { writeFileSync } from 'node:fs';

const RESULTS = 'plans/QA-APP-ARTEMIS-2026-11-22-android-cdp-v2.md';
const checks = [];
function pass(name, ok, detail) {
  checks.push({ name, ok: !!ok, detail: detail ?? '' });
  console.log(`${ok ? '✅' : '❌'} ${name}${detail ? ' - ' + detail : ''}`);
}
const targets = await (await fetch('http://localhost:9222/json/list')).json();
const t = targets.find((x) => x.type === 'page');
const ws = new WebSocket(t.webSocketDebuggerUrl);
let seq = 0;
const pending = new Map();
ws.addEventListener('message', (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) {
    const p = pending.get(m.id); pending.delete(m.id);
    m.error ? p.reject(new Error(JSON.stringify(m.error))) : p.resolve(m.result);
  }
});
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
const txt = () => ev(`(document.body.innerText || '').replace(/\\n{3,}/g,'\\n\\n').slice(0,700)`);
const btns = () => ev(`Array.from(document.querySelectorAll('button')).filter(b=>b.offsetParent!==null).map(b=>(b.textContent||'').trim().slice(0,45)).filter(Boolean)`);
async function click(text, exact = false) {
  return ev(`(() => { const es = Array.from(document.querySelectorAll('button,[role="button"],a')); const e = es.find(b => ${exact ? 'b.textContent.trim() === '+JSON.stringify(text) : 'b.textContent.includes('+JSON.stringify(text)+')'} && b.offsetParent !== null); if (!e) return false; e.click(); return true; })()`);
}
async function shot(n) { try { const r = await cmd('Page.captureScreenshot', { format: 'png' }); writeFileSync(`plans/screenshots/android-v2-${n}.png`, Buffer.from(r.data, 'base64')); } catch {} }

try {
  await cmd('Page.enable'); await cmd('Runtime.enable');
  // état courant : l'app est déjà connectée avec le compte qaandroid
  let s = await txt();
  console.log('écran courant:', s.slice(0, 220).replace(/\n/g, ' | '));
  const b0 = await btns();
  console.log('boutons:', JSON.stringify(b0.slice(-12)));

  // Fermer le prompt diagnostic avec « لاحقًا »
  const later = await click('لاحقًا');
  pass('Diagnostic : bouton « لاحقًا »', later, later ? 'cliqué' : 'introuvable');
  await sleep(1800);
  s = await txt();
  pass('Accueil : prompt fermé', !/اختبار التموضع/.test(s), s.split('\n').filter(Boolean).slice(0, 4).join(' | ').slice(0, 110));
  await shot('00-home-clean');

  const tabs = ['اليوم', 'مساري', 'منهجية', 'تدريبات', 'أنا'];
  let totalClicks = 0;
  for (const tab of tabs) {
    try {
      const ok = await click(tab, true);
      pass(`Onglet ${tab} : présent`, ok, ok ? 'cliqué' : 'introuvable');
      if (!ok) continue;
      await sleep(1500);
      const tt = await txt();
      const bb = await btns();
      console.log(`\n--- ${tab} ---\n${tt.slice(0, 400)}`);
      pass(`Onglet ${tab} : contenu`, tt.trim().length > 30, tt.split('\n').filter(Boolean).slice(0, 3).join(' | ').slice(0, 110));
      pass(`Onglet ${tab} : ${bb.length} boutons`, bb.length > 0, bb.slice(-4).join(', ').slice(0, 100));
      await shot(`tab-${tab}`);
      // cliquer 4 boutons non-navigation
      let n = 0;
      for (const label of bb.filter((x) => !tabs.includes(x)).slice(0, 4)) {
        if (await click(label, true)) { n++; await sleep(600); }
      }
      pass(`Onglet ${tab} : boutons testés`, n > 0, `${n} clics`);
      totalClicks += n;
      // retour
      await click('اليوم', true).catch(() => {});
      await sleep(600);
      await click('لاحقًا').catch(() => {});
    } catch (e) { pass(`Onglet ${tab} : erreur`, false, String((e && e.message) || e).slice(0, 150)); }
  }
  pass('Android : TOTAL clics', totalClicks > 0, `${totalClicks}`);

  // Examen blanc
  try {
    await click('اليوم', true);
    await sleep(800);
    const found = await click('امتحان تجريبي');
    pass('Android : carte examen blanc', found, found ? 'cliqué' : 'introuvable');
    if (found) { await sleep(1500); const et = await txt(); pass('Android : examen ouvert', /امتحان|سؤال|وقت/.test(et), et.split('\n').filter(Boolean).slice(0, 3).join(' | ').slice(0, 110)); await shot('exam'); }
  } catch (e) { pass('Android : examen erreur', false, String((e && e.message) || e).slice(0, 150)); }

  // Mind map / خريطة
  try {
    await click('منهجية', true).catch(() => {});
    await sleep(900);
    const mt = await txt();
    pass('Android : mind map (خريطة/مخطط)', /خريطة|مخطط|mind\s?map/i.test(mt), mt.split('\n').filter(Boolean).slice(0, 3).join(' | ').slice(0, 110));
    await shot('mindmap');
  } catch (e) { pass('Android : mind map erreur', false, String((e && e.message) || e).slice(0, 150)); }

  const errs = await ev(`window.__qaErrors || []`).catch(() => []);
  pass('Android : erreurs JS', errs.length === 0, JSON.stringify(errs).slice(0, 150));
} catch (e) {
  pass('Android : ERREUR FATALE', false, String((e && e.message) || e).slice(0, 200));
} finally {
  ws.close();
  writeFileSync(RESULTS, ['# Artemis — Android v2 (CDP, émulateur) — 2026-11-23', '', '## Résultats', ...checks.map((c) => `- ${c.ok ? '✅' : '❌'} ${c.name}${c.detail ? ' — ' + c.detail : ''}`), ''].join('\n'));
  console.log('\nRésumé:', RESULTS);
}
