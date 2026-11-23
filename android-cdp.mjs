// Pilotage de l'app Android (WebView Capacitor) via CDP brut (WebSocket natif Node).
// Équivalent Artemis sur émulateur : splash → inscription → 5 onglets → QCM.
import { writeFileSync } from 'node:fs';

const CDP_HTTP = 'http://localhost:9222';
const RESULTS = 'plans/QA-APP-ARTEMIS-2026-11-22-android-cdp.md';
const checks = [];
function pass(name, ok, detail) {
  checks.push({ name, ok: !!ok, detail: detail ?? '' });
  console.log(`${ok ? '✅' : '❌'} ${name}${detail ? ' - ' + detail : ''}`);
}

const targets = await (await fetch(`${CDP_HTTP}/json/list`)).json();
const pageTarget = targets.find((t) => t.type === 'page');
if (!pageTarget) throw new Error('Aucune page WebView trouvée');
console.log('CDP cible:', pageTarget.title, pageTarget.url);

const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
let seq = 0;
const pending = new Map();
ws.addEventListener('message', (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
  }
});
await new Promise((resolve, reject) => { ws.addEventListener('open', resolve, { once: true }); ws.addEventListener('error', reject, { once: true }); });
function cmd(method, params = {}) {
  const id = ++seq;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
    setTimeout(() => { if (pending.has(id)) { pending.delete(id); reject(new Error(`timeout CDP: ${method}`)); } }, 15000);
  });
}
async function evaluate(expression) {
  const r = await cmd('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + ' ' + (r.exceptionDetails.exception || {}).description);
  return r.result.value;
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const txt = () => evaluate(`(document.body.innerText || '').replace(/\\n{3,}/g, '\\n\\n').slice(0, 900)`);
const btnTexts = () => evaluate(`Array.from(document.querySelectorAll('button')).filter(b => b.offsetParent !== null).map(b => (b.textContent || '').trim().slice(0, 45)).filter(Boolean)`);
async function clickText(text, exact = false) {
  const expr = `(() => { const els = Array.from(document.querySelectorAll('button, [role="button"]')); const e = els.find(b => ${exact ? 'b.textContent.trim() === ' + JSON.stringify(text) : 'b.textContent.includes(' + JSON.stringify(text) + ')' } && b.offsetParent !== null); if (!e) return false; e.click(); return true; })()`;
  return evaluate(expr);
}
async function screenshot(name) {
  try {
    const r = await cmd('Page.captureScreenshot', { format: 'png' });
    writeFileSync(`plans/screenshots/android-cdp-${name}.png`, Buffer.from(r.data, 'base64'));
  } catch {}
}

try {
  await cmd('Page.enable');
  await cmd('Runtime.enable');
  const t0 = await txt();
  console.log('--- écran initial Android ---\n' + t0.slice(0, 500));
  pass('Android : WebView chargée', t0.trim().length > 0, t0.split('\n').filter(Boolean).slice(0, 2).join(' | ').slice(0, 90));
  await screenshot('00-initial');

  // Splash
  const splash = await clickText('اضغط للمتابعة');
  pass('Android : splash « اضغط للمتابعة »', splash, splash ? 'cliqué' : 'introuvable');
  await sleep(2500);

  // ابدأ
  let t = await txt();
  const start = await clickText('ابدأ');
  pass('Android : bouton ابدأ', start, (t.split('\n').filter(Boolean)[0] || '').slice(0, 60));
  await sleep(2500);

  // Inscription
  t = await txt();
  const hasEmail = await evaluate(`!!document.querySelector('#email')`);
  pass('Android : écran inscription', hasEmail, t.split('\n').filter(Boolean).slice(0, 3).join(' | ').slice(0, 90));
  if (hasEmail) {
    await evaluate(`(() => {
      const set = (sel, val) => { const el = document.querySelector(sel); if (!el) return; const s = Object.getOwnPropertyDescriptor(el.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype, 'value').set; s.call(el, val); el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); };
      set('#email', 'qaandroid@bousala.test'); set('#mdp', 'Pass12345!'); set('#mdp2', 'Pass12345!');
      const w = document.querySelector('#wilaya'); if (w && w.options.length > 1) { w.selectedIndex = 1; w.dispatchEvent(new Event('change', { bubbles: true })); }
      return true;
    })()`);
    await sleep(800);
    await evaluate(`(() => { const d = document.querySelector('#daira'); if (d && d.options.length > 1) { d.selectedIndex = 1; d.dispatchEvent(new Event('change', { bubbles: true })); } return !!d; })()`);
    await screenshot('01-inscription');
    const filled = await evaluate(`({email: document.querySelector('#email')?.value, wilaya: document.querySelector('#wilaya')?.value, daira: document.querySelector('#daira')?.value})`);
    console.log('formulaire Android:', JSON.stringify(filled));
    const sub = await clickText('أنشئ الحساب');
    pass('Android : soumission compte', sub, JSON.stringify(filled));
    await sleep(3500);
  }

  t = await txt();
  const nav = await btnTexts();
  pass('Android : accueil avec navigation', nav.includes('اليوم') && nav.includes('أنا'), `${nav.length} boutons: ${nav.slice(-6).join(', ')}`);
  await screenshot('02-home');

  // 5 onglets
  const tabs = ['اليوم', 'مساري', 'البوصلة', 'تدريبات', 'أنا'];
  for (const tab of tabs) {
    try {
      const ok = await clickText(tab, true);
      pass(`Android : onglet ${tab}`, ok, ok ? 'cliqué' : 'introuvable');
      if (!ok) continue;
      await sleep(1500);
      const tt = await txt();
      const bb = await btnTexts();
      console.log(`--- Android ${tab} ---\n${tt.slice(0, 320)}`);
      pass(`Android : ${tab} contenu`, tt.trim().length > 30, tt.split('\n').filter(Boolean).slice(0, 3).join(' | ').slice(0, 100));
      pass(`Android : ${tab} boutons`, bb.length > 0, `${bb.length} boutons visibles`);
      await screenshot(`tab-${tab}`);
      // retour accueil via今日 onglet today
      await clickText('اليوم', true).catch(() => {});
      await sleep(700);
    } catch (e) {
      pass(`Android : ${tab} erreur`, false, String((e && e.message) || e).slice(0, 160));
    }
  }

  // QCM depuis تدريبات
  try {
    await clickText('تدريبات', true);
    await sleep(1200);
    const opts = await btnTexts();
    let n = 0;
    for (const o of opts.filter((x) => x.length > 12 && !tabs.includes(x)).slice(0, 5)) {
      if (await clickText(o, true)) n++;
      await sleep(500);
    }
    pass('Android : QCM échantillon', n > 0, `${n} réponses`);
    await screenshot('03-qcm');
  } catch (e) { pass('Android : QCM erreur', false, String((e && e.message) || e).slice(0, 160)); }

  const errs = await evaluate(`window.__qaErrors || []`).catch(() => []);
  pass('Android : erreurs JS', errs.length === 0, JSON.stringify(errs).slice(0, 160));
} catch (e) {
  pass('Android : ERREUR FATALE', false, String((e && e.message) || e).slice(0, 200));
} finally {
  ws.close();
  const lines = ['# Artemis — Android (émulateur, WebView via CDP) — 2026-11-23', '', '## Résultats', ...checks.map((c) => `- ${c.ok ? '✅' : '❌'} ${c.name}${c.detail ? ' — ' + c.detail : ''}`), ''];
  writeFileSync(RESULTS, lines.join('\n'));
  console.log('\nRésumé:', RESULTS);
}
