import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true, args: ['--ignore-certificate-errors'] });
const page = await browser.newPage();
await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2500);
await page.locator('[role="button"]:has-text("اضغط للمتابعة")').first().click();
await page.waitForTimeout(2500);
const loc = page.locator('button, [role="button"], a').filter({ hasText: 'ابدأ' });
console.log('count=', await loc.count());
for (let i = 0; i < await loc.count(); i++) {
  console.log(i, await loc.nth(i).evaluate((e) => ({ tag: e.tagName, text: (e.textContent||'').trim().slice(0,40), vis: e.offsetParent !== null })));
}
console.log('click sur:', await loc.last().evaluate((e) => e.outerHTML.slice(0, 200)));
await loc.last().click({ timeout: 3000 }).catch((e) => console.log('click err', e.message));
for (const ms of [1000, 3000, 5000, 4000]) {
  await page.waitForTimeout(ms);
  console.log('après ' + ms + 'ms → ' + (await page.evaluate(() => document.body.innerText||'')).replace(/\n/g,' | ').slice(0, 180));
}
console.log('email?', await page.locator('#email').count());
await browser.close();
