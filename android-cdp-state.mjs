// Sonde brute CDP : état actuel du WebView Android.
const targets = await (await fetch('http://localhost:9222/json/list')).json();
const t = targets.find((x) => x.type === 'page');
console.log('cible:', t.title, t.url);
const ws = new WebSocket(t.webSocketDebuggerUrl);
let seq = 0; const pending = new Map();
ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(m.error) : p.resolve(m.result); } });
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
const cmd = (method, params = {}) => new Promise((res, rej) => { const id = ++seq; pending.set(id, { resolve: res, reject: rej }); ws.send(JSON.stringify({ id, method, params })); setTimeout(() => { if (pending.has(id)) { pending.delete(id); rej(new Error('timeout')); } }, 10000); });
async function ev(exp) { const r = await cmd('Runtime.evaluate', { expression: exp, returnByValue: true }); return r.result.value; }
await cmd('Runtime.enable');
console.log('TEXT:', (await ev(`(document.body.innerText||'').slice(0,900)`)).replace(/\n{3,}/g, '\n\n'));
console.log('BUTTONS:', JSON.stringify(await ev(`Array.from(document.querySelectorAll('button')).filter(b=>b.offsetParent!==null).map(b=>(b.textContent||'').trim().slice(0,50)).filter(Boolean)`), null, 1));
console.log('INPUTS:', JSON.stringify(await ev(`Array.from(document.querySelectorAll('input,select')).map(e=>({id:e.id,type:e.type,value:e.value}))`)));
ws.close();
