// Artemis Full Coverage — parcours complet des 5 onglets + boutons + QCM + examen + mind map.
// Stratégie : retour à l'accueil (reload) avant chaque onglet pour éviter les navigations.
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';

const BASE = 'http://localhost:3000/';
const SHOTS = 'plans/screenshots';
const RESULTS = 'plans/QA-APP-ARTEMIS-2026-11-22-web-full.md';
mkdirSync(SHOTS, { recursive: true });
const checks = [];
function pass(name, ok, detail) {
  checks.push({ name, ok: !!ok, detail: detail ?? '' });
  console.log(`${ok ? '✅' : '❌'} ${name}${detail ? ' - ' + detail : ''}`);
}

const browser = await chromium.launch({ headless: true, args: ['--ignore-certificate-errors'] });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
const consoleErrors = [];
const pageErrors = [];
const requestsFailed = [];
page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 180)); });
page.on('pageerror', (e) => pageErrors.push(String(e.message).slice(0, 180)));
page.on('requestfailed', (r) => requestsFailed.push(`${r.url()} (${(r.failure() || {}).errorText})`));

async function visibleText() {
  try { return (await page.evaluate(() => document.body.innerText || '')).replace(/\n{3,}/g, '\n\n').slice(0, 900); } catch { return ''; }
}
async function buttons() {
  try {
    return await page.evaluate(() => Array.from(document.querySelectorAll('button')).map((b) => ({
      text: (b.textContent || '').trim().slice(0, 60),
      aria: (b.getAttribute('aria-label') || '').slice(0, 60),
      visible: b.offsetParent !== null,
      disabled: b.disabled,
    })).filter((b) => b.visible && !b.disabled));
  } catch { return []; }
}
async function shot(name) {
  try { await page.screenshot({ path: `${SHOTS}/full-${name}.png` }); } catch {}
}
async function gotoHome() {
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(2500);
  // splash
  const splash = '[role="button"]:has-text("اضغط للمتابعة")';
  if (await page.locator(splash).count() > 0) { await page.locator(splash).first().click().catch(() => {}); await page.waitForTimeout(2000); }
  // si écran "ابدأ" (premier compte)
  const start = 'button:has-text("ابدأ")';
  if (await page.locator('#email').count() === 0 && await page.locator(start).count() > 0) {
    await page.locator(start).first().click().catch(() => {});
    await page.waitForTimeout(2500);
  }
  // inscription si nécessaire
  if (await page.locator('#email').count() > 0) {
    await page.fill('#email', 'qa@bousala.test').catch(() => {});
    await page.fill('#mdp', 'Pass12345!').catch(() => {});
    await page.fill('#mdp2', 'Pass12345!').catch(() => {});
    await page.locator('#wilaya').selectOption({ index: 1 }).catch(() => {});
    await page.waitForTimeout(600);
    await page.locator('#daira').selectOption({ index: 1 }).catch(() => {});
    await page.locator('button:has-text("أنشئ الحساب")').first().click().catch(() => {});
    await page.waitForTimeout(3000);
  }
  const text = await visibleText();
  const hasNav = await page.locator('button:has-text("اليوم")').count() > 0;
  return { text, hasNav };
}

try {
  for (let i = 0; i < 10; i++) {
    try { await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 5000 }); break; } catch { await page.waitForTimeout(3000); }
  }
  await page.waitForTimeout(3000);
  pass('Web : page chargée', page.url().startsWith(BASE), page.url());
  const home = await gotoHome();
  pass('Accueil : navigation visible', home.hasNav, home.text.split('\n').slice(0, 3).join(' | ').slice(0, 100));
  await shot('00-home');

  const ONGLETS = ['اليوم', 'مساري', 'البوصلة', 'تدريبات', 'أنا'];
  const report = [];
  for (const tab of ONGLETS) {
    try {
      const r = await gotoHome();
      const navBtn = page.locator('button').filter({ hasText: new RegExp(`^${tab}$`) });
      const nNav = await navBtn.count();
      pass(`Onglet ${tab} : bouton navigation`, nNav > 0, `${nNav} bouton(s)`);
      if (nNav === 0) continue;
      await navBtn.first().click().catch(() => {});
      await page.waitForTimeout(1800);
      const text = await visibleText();
      const btns = await buttons();
      report.push({ tab, text: text.slice(0, 600), buttons: btns.map((b) => b.text).filter(Boolean) });
      pass(`Onglet ${tab} : contenu chargé`, text.trim().length > 20, text.split('\n').filter(Boolean).slice(0, 3).join(' | ').slice(0, 110));
      await shot(`tab-${tab}`);
      // cliquer jusqu'à 12 boutons de l'onglet (hors navigation) et capturer chaque écran
      let clicks = 0;
      const errBefore = consoleErrors.length + pageErrors.length;
      for (let j = 0; j < Math.min(btns.length, 12); j++) {
        const b = btns[j];
        if (!b.text || ONGLETS.includes(b.text)) continue;
        try {
          await page.getByRole('button', { name: b.text, exact: true }).first().click({ timeout: 3000 });
          clicks++;
          await page.waitForTimeout(600);
          const t2 = await visibleText();
          if (/سؤال|امتحان|خريطة|درس|تدريب/.test(t2)) await shot(`click-${tab}-${j}`);
          // revenir à l'onglet si possible
          await page.locator('button').filter({ hasText: new RegExp(`^${tab}$`) }).first().click({ timeout: 2000 }).catch(() => {});
          await page.waitForTimeout(400);
        } catch {}
      }
      const newErrs = consoleErrors.slice(errBefore);
      pass(`Onglet ${tab} : boutons testés`, clicks > 0, `${clicks} clics, +${newErrs.length} erreur console`);
      if (newErrs.length) pass(`Onglet ${tab} : 0 erreur console`, false, newErrs.slice(0, 2).join(' | ').slice(0, 160));
    } catch (e) {
      pass(`Onglet ${tab} : erreur`, false, String((e && e.message) || e).slice(0, 180));
    }
  }

  // QCM : depuis تدريبات, répondre à des questions
  try {
    await gotoHome();
    await page.locator('button').filter({ hasText: /^تدريبات$/ }).first().click().catch(() => {});
    await page.waitForTimeout(1500);
    let answered = 0;
    for (let q = 0; q < 6; q++) {
      const opts = await buttons();
      const opt = opts.find((b) => b.text.length > 12 && !ONGLETS.includes(b.text));
      if (!opt) break;
      await page.getByRole('button', { name: opt.text, exact: true }).first().click().catch(() => {});
      await page.waitForTimeout(700);
      answered++;
    }
    pass('QCM : échantillon répondu', answered > 0, `${answered} réponses`);
    await shot('qcm-sample');
  } catch (e) { pass('QCM : erreur', false, String((e && e.message) || e).slice(0, 160)); }

  // Examen blanc : carte « امتحان تجريبي »
  try {
    await gotoHome();
    const examCard = page.locator('button:has-text("امتحان تجريبي")');
    const n = await examCard.count();
    pass('Examen blanc : carte trouvée', n > 0, `${n} carte(s)`);
    if (n > 0) {
      await examCard.first().click().catch(() => {});
      await page.waitForTimeout(1800);
      const text = await visibleText();
      pass('Examen blanc : écran ouvert', /امتحان|وقت|سؤال/.test(text), text.split('\n').filter(Boolean).slice(0, 3).join(' | ').slice(0, 110));
      await shot('exam-blanc');
    }
  } catch (e) { pass('Examen blanc : erreur', false, String((e && e.message) || e).slice(0, 160)); }

  // Mind map : rechercher une mention « خريطة » dans les onglets
  try {
    await gotoHome();
    let found = '';
    for (const tab of ['البوصلة', 'مساري', 'أنا']) {
      await page.locator('button').filter({ hasText: new RegExp(`^${tab}$`) }).first().click().catch(() => {});
      await page.waitForTimeout(1200);
      const t = await visibleText();
      if (/خريطة|mind\s*map|مخطط/i.test(t)) { found = `${tab}: ${t.slice(0, 180)}`; break; }
    }
    pass('Mind map : fonctionnalité repérée', !!found, found || 'aucune mention « خريطة / مخطط » visible');
    if (found) await shot('mindmap');
  } catch (e) { pass('Mind map : erreur', false, String((e && e.message) || e).slice(0, 160)); }

  // Offline / PWA
  try {
    const sw = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return 'no-api';
      const regs = await navigator.serviceWorker.getRegistrations().catch(() => []);
      return regs.length ? `${regs.length} SW` : 'aucun SW enregistré';
    });
    pass('PWA : service worker', /SW$/.test(sw) && !/aucun/.test(sw), sw);
  } catch (e) { pass('PWA : erreur', false, String((e && e.message) || e).slice(0, 160)); }

  pass('Erreurs console globales', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | ').slice(0, 200));
  pass('Erreurs page globales', pageErrors.length === 0, pageErrors.slice(0, 3).join(' | ').slice(0, 200));

  writeFileSync('plans/QA-APP-ARTEMIS-2026-11-22-web-full.json', JSON.stringify({ checks, report, consoleErrors, pageErrors, requestsFailed: requestsFailed.slice(0, 20) }, null, 2));
  await browser.close();
} catch (e) {
  pass('ERREUR FATALE', false, String((e && e.message) || e).slice(0, 200));
} finally {
  const lines = [
    '# Artemis Full Coverage — Web — 2026-11-23',
    '',
    '## Résultats',
    ...checks.map((c) => `- ${c.ok ? '✅' : '❌'} ${c.name}${c.detail ? ' — ' + c.detail : ''}`),
    '',
  ];
  writeFileSync(RESULTS, lines.join('\n'));
  console.log(`\nRésumé : ${RESULTS}`);
}
