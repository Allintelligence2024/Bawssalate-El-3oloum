import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true, args: ['--ignore-certificate-errors'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const sleep = (ms) => page.waitForTimeout(ms);
const names = async () => page.evaluate(() => Array.from(document.querySelectorAll('button')).filter((b) => b.offsetParent !== null && !b.disabled).map((b) => (b.textContent || '').trim().slice(0, 80)).filter(Boolean));
const click = async (needle) => {
  const loc = page.locator('button, [role="button"]').filter({ hasText: needle });
  const n = await loc.count();
  for (let i = 0; i < n; i++) {
    const ok = await loc.nth(i).evaluate((e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && cs.opacity !== '0' && cs.pointerEvents !== 'none'; }).catch(() => false);
    if (ok) { await loc.nth(i).click({ timeout: 3000 }).catch(() => {}); return true; }
  }
  return false;
};
await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
await sleep(2500);
await click('اضغط للمتابعة'); await sleep(2200);
await click('ابدأ'); await sleep(9000);
if (await page.locator('#email').count()) {
  await page.fill('#email', 'qaprobe@bousala.test'); await page.fill('#mdp', 'Pass12345!'); await page.fill('#mdp2', 'Pass12345!');
  await page.locator('#wilaya').selectOption({ index: 1 }); await sleep(500); await page.locator('#daira').selectOption({ index: 1 });
  await click('أنشئ الحساب'); await sleep(2500);
}
await click('لاحقًا'); await sleep(500);
await click('تدريبات'); await sleep(1500);
console.log('=== تدريbuttons ===\n' + (await names()).join('\n'));
await click('أسئلة QCM'); await sleep(1800);
console.log('\n=== après أسئلة QCM ===\n' + (await page.evaluate(() => document.body.innerText || '')).replace(/\n{3,}/g, '\n').slice(0, 500));
console.log('\nBUTTONS:\n' + (await names()).join('\n'));
// try start round
for (const t of ['ابدأ', 'بدء', 'جولة', 'ابدأ الجولة', 'انطلق']) { if (await click(t)) { console.log('cliqué:', t); await sleep(1500); break; } }
console.log('\n=== après start ===\n' + (await page.evaluate(() => document.body.innerText || '')).replace(/\n{3,}/g, '\n').slice(0, 500));
console.log('\nBUTTONS:\n' + (await names()).join('\n'));
await browser.close();
