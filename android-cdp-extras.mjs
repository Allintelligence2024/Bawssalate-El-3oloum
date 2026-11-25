// Android CDP — cibles manquantes : منهجية, خريطة ذهنية (مساري), امتحان تجريبي + QCM (تدريبات).
import { writeFileSync } from 'node:fs';
const RESULT = 'plans/QA-APP-ARTEMIS-2026-11-22-android-extras.md';
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
const txt = () => ev(`(document.body.innerText||'').replace(/\\n{3,}/g,'\\n\\n').slice(0,600)`);
const btns = () => ev(`Array.from(document.querySelectorAll('button')).filter(b=>b.offsetParent!==null).map(b=>({t:(b.textContent||'').trim().slice(0,60),a:b.getAttribute('aria-label')||''})).filter(x=>x.t||x.a)`);
async function click(text, exact = false) { return ev(`(() => {const e=Array.from(document.querySelectorAll('button,[role="button"],a')).find(b=>${exact ? 'b.textContent.trim()===' + JSON.stringify(text) : 'b.textContent.includes(' + JSON.stringify(text) + ')'} && b.offsetParent!==null);if(!e)return false;e.click();return true;})()`); }
async function shot(n) { try { const r = await cmd('Page.captureScreenshot', { format: 'png' }); writeFileSync(`plans/screenshots/android-extra-${n}.png`, Buffer.from(r.data, 'base64')); } catch {} }
async function back() { return ev(`(() => {const re=/خروج|عودة|رجوع|إغلاق/i;const e=Array.from(document.querySelectorAll('button')).find(b=>re.test(b.getAttribute('aria-label')||'')&&b.offsetParent!==null);if(!e)return '';const a=e.getAttribute('aria-label');e.click();return a;})()`); }
const TABS = ['اليوم','مساري','منهجية','تدريبات','أنا'];
async function home() {
  for (let i=0;i<14;i++) {
    const names=(await btns()).map(b=>b.t||b.a);
    if (TABS.filter(x=>names.includes(x)).length>=2) { await click('لاحقًا').catch(()=>{}); await sleep(400); return true; }
    if (await click('اضغط للمتابعة')) { await sleep(1200); continue; }
    if (await click('ابدأ')) { await sleep(1500); continue; }
    if (await ev(`!!document.querySelector('#email')`)) {
      await ev(`(()=>{const set=(s,v)=>{const e=document.querySelector(s);if(!e)return;const p=e.tagName==='SELECT'?HTMLSelectElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(p,'value').set.call(e,v);e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));};set('#email','qaandroid@bousala.test');set('#mdp','Pass12345!');set('#mdp2','Pass12345!');const w=document.querySelector('#wilaya');if(w&&w.options.length>1){w.selectedIndex=1;w.dispatchEvent(new Event('change',{bubbles:true}));}return true;})()`);
      await sleep(600);
      await ev(`(()=>{const d=document.querySelector('#daira');if(d&&d.options.length>1){d.selectedIndex=1;d.dispatchEvent(new Event('change',{bubbles:true}));}return true;})()`);
      await click('أنشئ الحساب'); await sleep(2500); continue;
    }
    if (await back()) { await sleep(700); continue; }
    break;
  }
  return (await btns()).some(b=>TABS.includes(b.t||b.a));
}
try {
  await cmd('Runtime.enable');
  // 1. منهجية
  if (await home()) {
    const present=(await btns()).some(b=>(b.t||b.a)==='منهجية');
    pass('منهجية : onglet présent', present);
    if (present) { await click('منهجية', true); await sleep(1500); const t=await txt(); const b=await btns(); console.log('--- منهجية ---\n'+t); pass('منهجية : contenu', t.length>30, t.split('\n').filter(Boolean).slice(0,3).join(' | ').slice(0,110)); pass('منهجية : boutons', b.length>0, `${b.length}`); await shot('manhajiya'); }
  }
  // 2. الخريطة الذهنية depuis مساري
  if (await home()) {
    await click('مساري', true); await sleep(1200);
    const mm=await click('الخريطة الذهنية');
    pass('مساري : bouton الخريطة الذهنية', mm, mm?'cliqué':'introuvable');
    if (mm) { await sleep(1500); const t=await txt(); pass('Mind map : écran', /خريطة|ذهنية|مخطّط/i.test(t), t.split('\n').filter(Boolean).slice(0,4).join(' | ').slice(0,140)); await shot('mindmap'); }
  }
  // 3. Examen depuis تدريبات
  if (await home()) {
    await click('تدريبات', true); await sleep(1200);
    const ex=await click('امتحان');
    pass('تدريبات : examen blanc', ex, ex?'cliqué':'introuvable');
    if (ex) { await sleep(1500); const t=await txt(); pass('Examen : écran', /امتحان|سؤال|وقت|التركيب/.test(t), t.split('\n').filter(Boolean).slice(0,4).join(' | ').slice(0,140)); await shot('exam'); }
  }
  // 4. QCM depuis تدريبات
  if (await home()) {
    await click('تدريبات', true); await sleep(1200);
    const q=await click('أسئلة QCM');
    pass('تدريبات : QCM', q, q?'cliqué':'introuvable');
    if (q) { await sleep(1500); let n=0; const bb=(await btns()).map(b=>b.t||b.a).filter(x=>x.length>10&&!TABS.includes(x)); for(const l of bb.slice(0,5)){ if(await click(l,true)){n++;await sleep(500);} } pass('QCM : réponses', n>0, `${n} options`); await shot('qcm'); }
  }
} catch(e) { pass('ERREUR FATALE', false, String(e.message).slice(0,180)); }
finally { ws.close(); writeFileSync(RESULT, ['# Artemis Android — extras — 2026-11-23','','## Résultats',...checks.map(c=>`- ${c.ok?'✅':'❌'} ${c.n}${c.d?' — '+c.d:''}`),''].join('\n')); console.log('\nRésumé:',RESULT); }
