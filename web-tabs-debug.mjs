// Debug : dump des boutons/liens de la barre de navigation pour identifier les onglets réels.
import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true, args: ['--ignore-certificate-errors'] });
const page = await browser.newPage();
for (let i = 0; i < 20; i++) {
  try { await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 4000 }); break; } catch { await page.waitForTimeout(3000); }
}
await page.waitForTimeout(3500);

async function dump(tag) {
  const data = await page.evaluate(() => ({
    text: (document.body.innerText || '').slice(0, 500),
    buttons: Array.from(document.querySelectorAll('button')).map((b) => ({
      text: (b.textContent || '').trim().slice(0, 45),
      aria: (b.getAttribute('aria-label') || '').slice(0, 45),
      title: (b.getAttribute('title') || '').slice(0, 45),
      cls: (b.className || '').toString().slice(0, 70),
      visible: b.offsetParent !== null,
    })),
    links: Array.from(document.querySelectorAll('a')).map((a) => ({
      text: (a.textContent || '').trim().slice(0, 45),
      href: a.getAttribute('href'),
      aria: (a.getAttribute('aria-label') || '').slice(0, 45),
    })),
  }));
  console.log(`\n=== ${tag} ===`);
  console.log('TEXT:', data.text.replace(/\n{3,}/g, '\n\n'));
  console.log('BUTTONS:', JSON.stringify(data.buttons, null, 1));
  console.log('LINKS:', JSON.stringify(data.links, null, 1));
}

// splash
const splash = '[role="button"]:has-text("اضغط للمتابعة")';
if (await page.locator(splash).count() > 0) { await page.locator(splash).first().click().catch(() => {}); await page.waitForTimeout(2000); }
const start = 'button:has-text("ابدأ")';
if (await page.locator(start).count() > 0) { await page.locator(start).first().click().catch(() => {}); await page.waitForTimeout(2500); }
if (await page.locator('#email').count() > 0) {
  await page.fill('#email', 'qa@bousala.test');
  await page.fill('#mdp', 'Pass12345!');
  await page.fill('#mdp2', 'Pass12345!');
  await page.locator('#wilaya').selectOption({ index: 1 }).catch(() => {});
  await page.waitForTimeout(600);
  await page.locator('#daira').selectOption({ index: 1 }).catch(() => {});
  await page.locator('button:has-text("أنشئ الحساب")').first().click().catch(() => {});
  await page.waitForTimeout(3500);
}
await dump('HOME / après inscription');
await browser.close();
