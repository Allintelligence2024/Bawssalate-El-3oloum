// Android CDP — QCM complet : trained → أسئلة QCM → axe (n/m) → réponses.
import { writeFileSync } from 'node:fs';
const RESULT = 'plans/QA-APP-ARTEMIS-2026-11-22-android-qcm.md';
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
const txt = () => ev(`(document.body.innerText||'').replace(/\\n{3,}/g,'\\n').slice(0,500)`);
const btns = () => ev(`Array.from(document.querySelectorAll('button')).filter(b=>b.offsetParent!==null&&!b.disabled).map(b=>({t:(b.textContent||'').trim().slice(0,70),a:b.getAttribute('aria-label')||''})).filter(x=>x.t||x.a)`);
async function click(text, exact = false) { return ev(`(() => {const e=Array.from(document.querySelectorAll('button,[role="button"],a')).find(b=>${exact ? 'b.textContent.trim()===' + JSON.stringify(text) : 'b.textContent.includes(' + JSON.stringify(text) + ')'} && b.offsetParent!==null);if(!e)return false;e.click();return true;})()`); }
async function back() { return ev(`(() => {const re=/خروج|عودة|رجوع|إغلاق/i;const e=Array.from(document.querySelectorAll('button')).find(b=>re.test(b.getAttribute('aria-label')||'')&&b.offsetParent!==null);if(!e)return '';const a=e.getAttribute('aria-label');e.click();return a;})()`); }
const TABS = ['اليوم', 'مساري', 'منهجية', 'تدريبات', 'أنا'];
async function home() {
  for (let i = 0; i < 16; i++) {
    // écran de connexion : le compte existe, il faut saisir le mot de passe et « دخول ».
    if ((await btns()).some((b) => (b.t || b.a).includes('دخول'))) {
      await ev(`(()=>{const set=(s,v)=>{const e=document.querySelector(s);if(!e)return;Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e,v);e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));};set('#email','qaandroid@bousala.test');set('#mdp','Pass12345!');return true;})()`);
      await sleep(400);
      await click('دخول'); await sleep(2500); continue;
    }
    const ns = (await btns()).map((b) => b.t || b.a);
    if (TABS.filter((x) => ns.includes(x)).length >= 2) { await click('لاحقًا').catch(() => {}); await sleep(400); return true; }
    if (await click('اضغط للمتابعة')) { await sleep(1200); continue; }
    if (await click('تخطي')) { await sleep(1500); continue; }
    if (await click('ابدأ')) { await sleep(1500); continue; }
    if (await click('أنشئ حسابًا')) { await sleep(1200); continue; }
    if (await ev(`!!document.querySelector('#email')`)) {
      await ev(`(()=>{const set=(s,v)=>{const e=document.querySelector(s);if(!e)return;const p=e.tagName==='SELECT'?HTMLSelectElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(p,'value').set.call(e,v);e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));};set('#email','qaandroid2@bousala.test');set('#mdp','Pass12345!');set('#mdp2','Pass12345!');const w=document.querySelector('#wilaya');if(w&&w.options.length>1){w.selectedIndex=1;w.dispatchEvent(new Event('change',{bubbles:true}));}return true;})()`);
      await sleep(600);
      await ev(`(()=>{const d=document.querySelector('#daira');if(d&&d.options.length>1){d.selectedIndex=1;d.dispatchEvent(new Event('change',{bubbles:true}));}return true;})()`);
      await click('أنشئ الحساب'); await sleep(2500); continue;
    }
    if (ns.includes('تسجيل الخروج')) { await click('▲'); await sleep(500); continue; }
    if (await click('مغادرة')) { await sleep(800); continue; }
    if (await back()) { await sleep(700); continue; }
    break;
  }
  return (await btns()).some((b) => TABS.includes(b.t || b.a));
}
try {
  await cmd('Runtime.enable');
  // L'app peut être déjà dans l'examen blanc : répondre à quelques questions si présent.
  const inExam = (await btns()).some((b) => (b.t || b.a).includes('مغادرة الامتحان'));
  if (inExam) {
    let en = 0;
    for (let i = 0; i < 6; i++) {
      const opts = (await btns()).map((b) => b.t || b.a).filter((x) => x.length > 4 && !/مغادرة|تحق|التالي|السؤال|رجوع|خروج/.test(x));
      if (!opts.length) break;
      if (await click(opts[0])) { en++; await sleep(500); }
      if (await click('تحق')) { await sleep(700); }
      for (const t of ['التالي', 'السؤال التالي', 'تأكيد']) { if (await click(t)) { await sleep(600); break; } }
    }
    pass('Android : examen — réponses', en > 0, `${en} réponses`);
    console.log('[examen] ' + (await txt()).replace(/\n/g, ' | ').slice(0, 180));
    try { const r = await cmd('Page.captureScreenshot', { format: 'png' }); writeFileSync('plans/screenshots/android-exam-answers.png', Buffer.from(r.data, 'base64')); } catch {}
  }
  pass('Android : navigation', await home());
  await click('تدريبات', true); await sleep(1300);
  const q = await click('أسئلة QCM');
  pass('Android : QCM ouvert', q, q ? 'cliqué' : 'introuvable');
  if (q) {
    await sleep(1500);
    const axes = (await btns()).map((b) => b.t || b.a).filter((x) => /\(\d+\/\d+\)/.test(x));
    pass('Android : axes QCM', axes.length > 0, `${axes.length} axes`);
    let started = false;
    if (axes.length) { started = await click(axes[0]); await sleep(1600); }
    pass('Android : axe choisi', started, axes[0] ? axes[0].slice(0, 50) : '');
    let n = 0;
    for (let i = 0; i < 12; i++) {
      const opts = (await btns()).map((b) => b.t || b.a).filter((x) => x.length > 2 && !TABS.includes(x) && !/⚡|XP|▲|▼|العودة|رجوع|الوضع الليلي|التالي|تحقق|إنهاء|خروج|السؤال/.test(x));
      if (!opts.length) break;
      if (await click(opts[0])) { n++; await sleep(700); } else break;
      for (const t of ['التالي', 'تحقق', 'السؤال التالي', 'تأكيد']) { if (await click(t)) { await sleep(600); break; } }
    }
    pass('Android : QCM réponses', n > 0, `${n} réponses`);
    console.log('[fin] ' + (await txt()).replace(/\n/g, ' | ').slice(0, 200));
    try { const r = await cmd('Page.captureScreenshot', { format: 'png' }); writeFileSync('plans/screenshots/android-qcm.png', Buffer.from(r.data, 'base64')); } catch {}
  }
  const errs = await ev(`window.__qaErrors || []`).catch(() => []);
  pass('Android : erreurs JS', errs.length === 0, JSON.stringify(errs).slice(0, 120));
} catch (e) { pass('ERREUR FATALE', false, String(e.message).slice(0, 180)); }
finally { ws.close(); writeFileSync(RESULT, ['# Artemis Android — QCM — 2026-11-23', '', '## Résultats', ...checks.map((c) => `- ${c.ok ? '✅' : '❌'} ${c.n}${c.d ? ' — ' + c.d : ''}`), ''].join('\n')); console.log('\nRésumé:', RESULT); }
