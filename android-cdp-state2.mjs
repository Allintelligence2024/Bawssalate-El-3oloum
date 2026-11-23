// Sonde CDP : boutons (y compris vides) + clés localStorage.
const targets = await (await fetch('http://localhost:9222/json/list')).json();
const t = targets.find((x) => x.type === 'page');
const ws = new WebSocket(t.webSocketDebuggerUrl);
let seq = 0; const pending = new Map();
ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(m.error) : p.resolve(m.result); } });
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
const cmd = (method, params = {}) => new Promise((res, rej) => { const id = ++seq; pending.set(id, { resolve: res, reject: rej }); ws.send(JSON.stringify({ id, method, params })); setTimeout(() => { if (pending.has(id)) { pending.delete(id); rej(new Error('timeout')); } }, 10000); });
async function ev(exp) { const r = await cmd('Runtime.evaluate', { expression: exp, returnByValue: true }); return r.result.value; }
await cmd('Runtime.enable');
console.log('ALL BUTTONS:', JSON.stringify(await ev(`Array.from(document.querySelectorAll('button')).filter(b=>b.offsetParent!==null).map(b=>({t:(b.textContent||'').trim().slice(0,40),a:b.getAttribute('aria-label'),title:b.getAttribute('title'),cls:(b.className||'').toString().slice(0,50)}))`), null, 1));
console.log('LS KEYS:', JSON.stringify(await ev('Object.keys(localStorage)')));
console.log('URL:', await ev('location.href'));
ws.close();
