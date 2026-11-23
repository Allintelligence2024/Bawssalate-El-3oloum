// Debug : dump du texte visible, boutons et liens de la page web (http://localhost:3000).
import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true, args: ['--ignore-certificate-errors'] });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
page.on('pageerror', (e) => console.log('PAGEERR:', e.message));
page.on('console', (m) => { if (m.type() === 'error') console.log('CONSOLE ERR:', m.text().slice(0, 200)); });

await page.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(5000);

const text = await page.evaluate(() => (document.body.innerText || '').replace(/\n{3,}/g, '\n\n'));
console.log('=== BODY TEXT (truncated) ===');
console.log(text.slice(0, 1200));

const btns = await page.evaluate(() => Array.from(document.querySelectorAll('button')).map((b) => ({
  text: (b.textContent || '').trim().slice(0, 50),
  aria: b.getAttribute('aria-label') || '',
  title: b.getAttribute('title') || '',
  cls: (b.className || '').toString().slice(0, 60),
  visible: b.offsetParent !== null,
})));
console.log('=== BUTTONS ===');
console.log(JSON.stringify(btns.slice(0, 30), null, 1));

const links = await page.evaluate(() => Array.from(document.querySelectorAll('a')).map((a) => ({
  text: (a.textContent || '').trim().slice(0, 30),
  href: a.getAttribute('href'),
  aria: a.getAttribute('aria-label') || '',
})).slice(0, 30));
console.log('=== LINKS ===');
console.log(JSON.stringify(links, null, 1));

const roleButtons = await page.evaluate(() => Array.from(document.querySelectorAll('[role="button"]')).map((b) => (b.textContent || '').trim().slice(0, 50)));
console.log('=== [role=button] ===');
console.log(JSON.stringify(roleButtons.slice(0, 30), null, 1));

await page.screenshot({ path: 'plans/screenshots/web-debug-01.png' });
console.log('screenshot saved: plans/screenshots/web-debug-01.png');
await browser.close();
