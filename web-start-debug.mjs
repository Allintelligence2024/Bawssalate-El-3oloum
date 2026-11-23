import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true, args: ['--ignore-certificate-errors'] });
const page = await browser.newPage();
await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2500);
const dump = async (label) => {
  console.log('\n=== ' + label + ' ===');
  console.log((await page.evaluate(() => document.body.innerText || '')).slice(0, 400));
  console.log(JSON.stringify(await page.evaluate(() => Array.from(document.querySelectorAll('*'))
    .filter((e) => /ابدأ|اضغط للمتابعة/.test(e.textContent || '') && e.children.length < 3)
    .map((e) => ({ tag: e.tagName, role: e.getAttribute('role'), text: (e.textContent || '').trim().slice(0, 60), cls: (e.className || '').toString().slice(0, 60) }))
    .slice(0, 15)), null, 1));
};
await dump('initial');
await page.locator('[role="button"]:has-text("اضغط للمتابعة")').first().click().catch((e) => console.log('splash click err', e.message));
await page.waitForTimeout(2500);
await dump('après splash');
await browser.close();
