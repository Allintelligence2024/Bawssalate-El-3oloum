// Android CDP — vérifie que le laboratoire « بوصلة » est intégré dans l'APK rebuildé.
import { writeFileSync } from 'node:fs';
const RESULT = 'plans/QA-APP-ARTEMIS-2026-11-22-android-boussole.md';
const checks = [];
const pass = (n, ok, d) => { checks.push({ n, ok: !!ok, d: d || '' }); console.log(`${ok ? '✅' : '❌'} ${n}${d ? ' - ' + d : ''}`); };
const targets = await (await fetch('http://localhost:9222/json/list')).json();
const ws = new WebSocket(targets.find((x) => x.type === 'page').webSocketDebuggerUrl);
let seq = 0; const pending = new Map();
ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(m.error) : p.resolve(m.result); } });
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
const cmd = (method, params = {}) => new Promise((res, rej) => { const id = ++seq; pending.set(id, { resolve: res, reject: rej }); ws.send(JSON.stringify({ id, method, params })); setTimeout(() => { if (pending.has(id)) { pending.delete(id); rej(new Error('timeout')); } }, 15000); });
async function ev(exp) { const r = await cmd('Runtime.evaluate', { expression: exp, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.text); return r.result.value; }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const btns = () => ev(`Array.from(document.querySelectorAll('button')).filter(b=>b.offsetParent!==null&&!b.disabled).map(b=>({t:(b.textContent||'').trim().slice(0,70),a:b.getAttribute('aria-label')||''})).filter(x=>x.t||x.a)`);
async function click(text, exact = false) { return ev(`(() => {const e=Array.from(document.querySelectorAll('button,[role="button"],a')).find(b=>${exact ? 'b.textContent.trim()===' + JSON.stringify(text) : 'b.textContent.includes(' + JSON.stringify(text) + ')'} && b.offsetParent!==null);if(!e)return false;e.click();return true;})()`); }
async function back() { return ev(`(() => {const re=/خروج|عودة|رجوع|إغلاق/i;const e=Array.from(document.querySelectorAll('button')).find(b=>re.test(b.getAttribute('aria-label')||'')&&b.offsetParent!==null);if(!e)return '';const a=e.getAttribute('aria-label');e.click();return a;})()`); }
const TABS = ['اليوم', 'مساري', 'البوصلة', 'منهجية', 'تدريبات', 'أنا'];
const setField = (sel, v) => ev(`(()=>{const e=document.querySelector(${JSON.stringify(sel)});if(!e)return false;const p=e.tagName==='SELECT'?HTMLSelectElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(p,'value').set.call(e,${JSON.stringify(v)});e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));return true;})()`);
async function home() {
  for (let i = 0; i < 24; i++) {
    const ns = (await btns()).map((b) => b.t || b.a);
    // Formulaire d'inscription : #mdp2 n'existe qu'en mode création.
    if (await ev(`!!document.querySelector('#mdp2')`)) {
      await setField('#email', 'qaboussole@bousala.test');
      await setField('#mdp', 'Pass12345!');
      await setField('#mdp2', 'Pass12345!');
      await setField('#wilaya', '01');
      await sleep(500);
      await setField('#daira', 'أدرار');
      await sleep(400);
      await click('أنشئ الحساب'); await sleep(3000); continue;
    }
    // Mode connexion : basculer vers la création si aucun compte n'existe.
    if (ns.some((x) => x.includes('ليس لديك حساب'))) { await click('ليس لديك حساب'); await sleep(1200); continue; }
    if (ns.some((x) => x.includes('دخول'))) {
      await setField('#email', 'qaboussole@bousala.test');
      await setField('#mdp', 'Pass12345!');
      await sleep(400); await click('دخول'); await sleep(2500); continue;
    }
    const found = ns.filter((x) => TABS.includes(x));
    if (found.length >= 4) { await click('لاحقًا').catch(() => {}); await sleep(500); return found; }
    if (await click('اضغط للمتابعة')) { await sleep(1200); continue; }
    if (await click('تخطي')) { await sleep(1500); continue; }
    if (await click('ابدأ')) { await sleep(1500); continue; }
    if (await click('مغادرة')) { await sleep(800); continue; }
    if (await back()) { await sleep(700); continue; }
    break;
  }
  return (await btns()).map((b) => b.t || b.a).filter((x) => TABS.includes(x));
}
try {
  await cmd('Runtime.enable');
  const tabs = await home();
  pass('Android : 5 onglets (libellés neufs)', tabs.length >= 5, tabs.join(' / '));
  const clicked = await click('البوصلة', true);
  pass('Android : onglet البوصلة cliqué', clicked);
  await sleep(2600);
  const info = await ev(`(() => {
    const f = document.querySelector('iframe[data-boussole="labo"]');
    if (!f) return { iframe: false, txt: (document.body.innerText||'').slice(0,200) };
    let title = '', text = '', scripts = 0, err = '';
    try { const d = f.contentDocument; title = d?.title || ''; text = (d?.body?.innerText || '').replace(/\\n{2,}/g,'\\n').slice(0,300); scripts = d?.scripts?.length || 0; } catch (e) { err = String(e.message); }
    return { iframe: true, src: f.getAttribute('src'), title, text, scripts, err,
      barre: (document.body.innerText||'').includes('البوصلة · داخل التطبيق'),
      lien: !!(Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('تمارين المنهجية الأخرى'))) };
  })()`);
  console.log('[iframe] ' + JSON.stringify(info).slice(0, 600));
  pass('Android : iframe laboratoire présente', info.iframe, info.src || info.txt);
  pass('Android : src = /boussole/index.html', (info.src || '').includes('/boussole/index.html'), info.src);
  pass('Android : titre du laboratoire', (info.title || '').includes('مختبر الفضول'), info.title || info.err);
  pass('Android : scripts du laboratoire exécutés', info.scripts > 0, `${info.scripts} script(s)`);
  pass('Android : pas de fallback « activer les scripts »', !(info.text || '').includes('فعِّل تشغيل البرامج النصية'), (info.text || '').slice(0, 80));
  pass('Android : barre + lien méthodologie', info.barre && info.lien, `barre=${info.barre} lien=${info.lien}`);
  try { const r = await cmd('Page.captureScreenshot', { format: 'png' }); writeFileSync('plans/screenshots/android-boussole-integrated.png', Buffer.from(r.data, 'base64')); } catch {}
  const errs = await ev(`window.__qaErrors || []`).catch(() => []);
  pass('Android : erreurs JS', errs.length === 0, JSON.stringify(errs).slice(0, 120));
} catch (e) { pass('ERREUR FATALE', false, String(e.message).slice(0, 200)); }
finally { ws.close(); writeFileSync(RESULT, ['# Artemis Android — intégration بوصلة (APK rebuildé) — 2026-11-23', '', '## Résultats', ...checks.map((c) => `- ${c.ok ? '✅' : '❌'} ${c.n}${c.d ? ' — ' + c.d : ''}`), ''].join('\n')); console.log('\nRésumé:', RESULT); }
