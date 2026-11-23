// Artemis Continuation v2 — مساري / البوصلة / تدريبات / أنا / اليوم sur l'app web (http://localhost:3000).
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';

const BASE = 'http://localhost:3000/';
const RESULTS = 'plans/QA-APP-ARTEMIS-2026-11-22-web-continuation.md';
const checks = [];
function pass(name, ok, detail) {
  checks.push({ name, ok: !!ok, detail: detail ?? '' });
  console.log(`${ok ? '✅' : '❌'} ${name}${detail ? ' - ' + detail : ''}`);
}
function summaryLines() {
  return [
    '# Artemis — Web Continuation (مساري/البوصلة/تدريبات/أنا/اليوم) — 2026-11-23',
    '',
    '## Résumé',
    ...checks.map((c) => `- ${c.ok ? '✅' : '❌'} ${c.name}${c.detail ? ' — ' + c.detail : ''}`),
    '',
  ];
}

try {
  const browser = await chromium.launch({ headless: true, args: ['--ignore-certificate-errors'] });
  const page = await browser.newPage();
  const pageErrors = [];
  const consoleErrors = [];
  page.on('pageerror', (e) => pageErrors.push(String(e.message).slice(0, 200)));
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 200)); });

  for (let i = 0; i < 25; i++) {
    try { await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 4000 }); break; } catch { await page.waitForTimeout(3000); }
  }
  await page.waitForTimeout(3000);

  const visibleText = async () => { try { return (await page.evaluate(() => (document.body.innerText || '').replace(/\n{3,}/g, '\n\n'))).slice(0, 900); } catch { return ''; } };
  const visibleButtons = async () => { try { return await page.evaluate(() => Array.from(document.querySelectorAll('button')).map((b) => ({ text: (b.textContent || '').trim().slice(0, 30), aria: (b.getAttribute('aria-label') || '').slice(0, 30), title: (b.getAttribute('title') || '').slice(0, 30), hidden: b.offsetParent === null }))); } catch { return []; } };

  // Splash → ابدأ → inscription si visible
  {
    const splashSel = '[role="button"]:has-text("اضغط للمتابعة")';
    if (await page.locator(splashSel).count() > 0) {
      await page.locator(splashSel).first().click().catch(() => {});
      await page.waitForTimeout(2500);
    }
    const startSel = 'button:has-text("ابدأ")';
    if (await page.locator(startSel).count() > 0) {
      await page.locator(startSel).first().click().catch(() => {});
      await page.waitForTimeout(3000);
    }
    const emailN = await page.locator('#email').count();
    pass('Inscription : champs visibles', emailN > 0, `${emailN} champs email`);
    if (emailN > 0) {
      await page.fill('#email', 'qa@bousala.test').catch(() => {});
      await page.fill('#mdp', 'Pass12345!').catch(() => {});
      await page.fill('#mdp2', 'Pass12345!').catch(() => {});
      const wil = page.locator('#wilaya');
      if (await wil.count() > 0) {
        await wil.selectOption({ index: 1 }).catch(() => {});
        await page.waitForTimeout(600);
        const dOpts = await page.locator('#daira option').allTextContents().catch(() => []);
        if (dOpts.length > 1) await page.locator('#daira').selectOption({ index: 1 }).catch(() => {});
      }
      const subSel = 'button:has-text("أنشئ الحساب")';
      await page.locator(subSel).first().click().catch(() => {});
      await page.waitForTimeout(3500);
    }
  }

  const nMain = await page.locator('button').count();
  pass('App réinitialisée', nMain > 0, `${nMain} boutons visibles`);

  const ONGLETS = ['مساري', 'البوصلة', 'تدريبات', 'أنا', 'اليوم'];
  let totalClicks = 0;
  for (const tab of ONGLETS) {
    try {
      const btns = await visibleButtons();
      const i = btns.findIndex((b) => !b.hidden && (b.text.includes(tab) || b.aria.includes(tab) || b.title.includes(tab)));
      pass(`Onglet ${tab} : bouton visible`, i >= 0, `${btns.length} boutons dans le DOM`);
      if (i < 0) continue;
      await page.locator('button').nth(i).click().catch(() => {});
      await page.waitForTimeout(2000);
      const text = await visibleText();
      console.log(`--- texte visible (${tab}) ---\n${text}`);
      pass(`Onglet ${tab} : contenu visible`, text.trim().length > 0, text.split('\n')[0] || '');
      const btns2 = await visibleButtons();
      const n = Math.min(btns2.length, 20);
      let nClicks = 0;
      const errBefore = consoleErrors.length + pageErrors.length;
      for (let j = 0; j < n; j++) {
        const b = btns2[j];
        if (b.hidden) continue;
        try { await page.locator('button').nth(j).click(); } catch { continue; }
        await page.waitForTimeout(500);
        nClicks++;
      }
      const newErrs = consoleErrors.slice(errBefore);
      pass(`Onglet ${tab} : ${nClicks} boutons cliqués`, nClicks > 0, `+${newErrs.length} erreur console`);
      totalClicks += nClicks;
    } catch (e) {
      pass(`Onglet ${tab} : erreur pendant le test`, false, String((e && e.message) || e).slice(0, 200));
    }
  }
  pass('Continuation : TOTAL boutons cliqués', totalClicks > 0, `${totalClicks} clics`);
  pass('Continuation : aucune erreur console globale', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | ').slice(0, 200));
  await browser.close();
} catch (e) {
  pass('Erreur pendant le parcours', false, String((e && e.message) || e).slice(0, 200));
} finally {
  writeFileSync(RESULTS, summaryLines().join('\n'));
  console.log(`Résumé écrit : ${RESULTS}`);
}
