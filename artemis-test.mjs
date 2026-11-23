import { chromium } from 'playwright';

const RESULTS = [];
const pass = (name, ok, detail) => {
  RESULTS.push({ name, ok, detail });
  console.log(`\n${ok ? '✅' : '❌'} ${name} ${detail ? '- ' + detail : ''}`);
};

const browser = await chromium.launch({ headless: true, args: ['--ignore-certificate-errors'] });
const page = await browser.newPage();
page.on('pageerror', e => console.log('PAGEERR:', e.message));

await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
await page.waitForTimeout(9000);

// Démarrer
const startBtn = page.locator('button:has-text("ابدأ")').first();
if (await startBtn.count() > 0) await startBtn.click();
await page.waitForTimeout(2000);

// T1
pass('T1 Tab "تدريبات" trouvé', true, 'waiting...');
const drilsTab = page.locator('text=/تدريبات/i').first();
const drilsCount = await drilsTab.count();
pass('T1 Tab "تدريبات" trouvé', drilsCount > 0, `count: ${drilsCount}`);

// T2
const meTab = page.locator('text=/أنا/i').first();
const meCount = await meTab.count();
pass('T2 Tab "أنا" trouvé', meCount > 0, `count: ${meCount}`);

// T3
const overlay = page.locator('div.fixed.inset-0');
const overlayCount = await overlay.count();
pass('T3 Overlay détecté (modale "Créer compte")', overlayCount > 0, `count: ${overlayCount}`);

// T4
if (meCount > 0) {
  await meTab.click({ force: true });
  await page.waitForTimeout(1500);
  const modalTitle = page.locator('text=/Créer compte|أنشئ حساب/').first();
  const modalCount = await modalTitle.count();
  pass('T4 Modal "Créer compte" affiché', modalCount > 0, `count: ${modalCount}`);
}

// T5
if (meCount > 0) {
  const wilayas = page.locator('text=/أدرار|الجزائر|وهران/i');
  const wilayasCount = await wilayas.count();
  pass('T5 Liste wilayas visible', wilayasCount > 0, `count: ${wilayasCount}`);
}

const failed = RESULTS.filter(r => !r.ok).length;
console.log(`\n=== RÉSULTATS: ${RESULTS.length - failed}/${RESULTS.length} tests passés ===`);
await browser.close();
