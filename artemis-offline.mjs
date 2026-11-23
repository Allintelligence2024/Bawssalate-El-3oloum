// Artemis OFFLINE/PWA — build prod servi sur http://localhost:4173.
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';
const BASE = 'http://localhost:4173/';
const RESULTS = 'plans/QA-APP-ARTEMIS-2026-11-22-offline-prod.md';
const checks = [];
const pass = (n, ok, d) => { checks.push({ n, ok: !!ok, d: d || '' }); console.log(`${ok ? '✅' : '❌'} ${n}${d ? ' - ' + d : ''}`); };
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
const sleep = (ms) => page.waitForTimeout(ms);
const names = async () => page.evaluate(() => Array.from(document.querySelectorAll('button')).filter((b) => b.offsetParent !== null && !b.disabled).map((b) => (b.textContent || '').trim().slice(0, 70)).filter(Boolean));
const clickText = async (needle, exact = false) => {
  const rx = exact ? new RegExp(`^${needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) : needle;
  const loc = page.locator('button, [role="button"], a').filter({ hasText: rx });
  const count = await loc.count(); const cand = [];
  for (let i = 0; i < count; i++) {
    const info = await loc.nth(i).evaluate((e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return { v: r.width > 0 && r.height > 0 && cs.opacity !== '0' && cs.visibility !== 'hidden' && cs.pointerEvents !== 'none', len: (e.textContent || '').trim().length }; }).catch(() => ({ v: false, len: 1e9 }));
    if (info.v) cand.push({ i, len: info.len });
  }
  cand.sort((a, b) => a.len - b.len);
  if (!cand.length) return false;
  await loc.nth(cand[0].i).click({ timeout: 3000 }).catch(() => {});
  return true;
};
try {
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await sleep(2500);
  pass('Prod : page chargée', page.url().startsWith(BASE), page.url());
  await clickText('اضغط للمتابعة'); await sleep(2200);
  await clickText('ابدأ'); await sleep(9000);
  if (await page.locator('#email').count()) {
    await page.fill('#email', 'qaoffline@bousala.test'); await page.fill('#mdp', 'Pass12345!'); await page.fill('#mdp2', 'Pass12345!');
    await page.locator('#wilaya').selectOption({ index: 1 }); await sleep(500); await page.locator('#daira').selectOption({ index: 1 });
    await clickText('أنشئ الحساب'); await sleep(2500);
  }
  await clickText('لاحقًا'); await sleep(500);
  // attendre l'enregistrement du SW (événement load + register)
  await sleep(3000);
  const sw = await page.evaluate(async () => {
    if (!('serviceWorker' in navigator)) return { api: false };
    const regs = await navigator.serviceWorker.getRegistrations();
    return { api: true, count: regs.length, scope: regs[0]?.scope || '', controller: !!navigator.serviceWorker.controller };
  });
  pass('Prod : API serviceWorker', sw.api);
  pass('Prod : SW enregistré', sw.count > 0, `${sw.count} registration(s), scope=${sw.scope}`);
  pass('Prod : SW contrôlant la page', sw.controller, sw.controller ? 'controller actif' : 'pas encore de controller (reload requis)');
  // caches
  const cachesInfo = await page.evaluate(async () => {
    if (!('caches' in window)) return { api: false };
    const keys = await caches.keys();
    let total = 0; for (const k of keys) { const c = await caches.open(k); total += (await c.keys()).length; }
    return { api: true, keys, total };
  });
  pass('Prod : CacheStorage présent', cachesInfo.api, (cachesInfo.keys || []).join(', ').slice(0, 120));
  pass('Prod : ressources en cache', cachesInfo.total > 0, `${cachesInfo.total} entrée(s)`);
  await page.screenshot({ path: 'plans/screenshots/offline-prod-home.png' }).catch(() => {});
  // test hors-ligne : couper le réseau puis recharger
  await context.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
  await sleep(3000);
  const offlineText = await page.evaluate(() => (document.body.innerText || '').slice(0, 200));
  const offlineOk = /بوصلة|اضغط|ابدأ|اليوم/.test(offlineText);
  pass('Prod : rechargement hors-ligne', offlineOk, offlineText.replace(/\n/g, ' | ').slice(0, 100));
  await page.screenshot({ path: 'plans/screenshots/offline-prod-reload.png' }).catch(() => {});
  await context.setOffline(false);
} catch (e) { pass('ERREUR FATALE', false, String(e.message).slice(0, 200)); }
finally {
  await browser.close().catch(() => {});
  writeFileSync(RESULTS, ['# Artemis OFFLINE/PWA — build prod (4173) — 2026-11-23', '', '## Résultats', ...checks.map((c) => `- ${c.ok ? '✅' : '❌'} ${c.n}${c.d ? ' — ' + c.d : ''}`), ''].join('\n'));
  console.log('\nRésumé:', RESULTS);
}
