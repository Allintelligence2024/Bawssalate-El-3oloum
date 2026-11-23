// Artemis Extended — parcourt l'app web (http://localhost:3000) de manière exhaustive :
// démarrage, 5 onglets (اليوم/مساري/البوصلة/تدريبات/أنا), tous les boutons par onglet,
// clics QCM (تدريبات), examen blanc (best-effort), hors-ligne (PWA), erreurs console/réseau,
// captures d'écran. Écrit un résumé dans plans/QA-APP-ARTEMIS-2026-11-22-web-results.md.
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';

const BASE = 'http://localhost:3000/';
const SCR = 'plans/screenshots';
const RESULTS = 'plans/QA-APP-ARTEMIS-2026-11-22-web-results.md';

const checks = [];
function pass(name, ok, detail) {
  checks.push({ name, ok: !!ok, detail: detail ?? '' });
  console.log(`${ok ? '✅' : '❌'} ${name}${detail ? ' - ' + detail : ''}`);
}

mkdirSync(SCR, { recursive: true });

const browser = await chromium.launch({ headless: true, args: ['--ignore-certificate-errors'] });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

const pageErrors = [];
const consoleErrors = [];
const networkErrors = [];
page.on('pageerror', (e) => pageErrors.push(String(e.message).slice(0, 400)));
page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text().slice(0, 400)); });
page.on('requestfailed', (r) => {
  if (r.failure() && !r.url().includes('favicon')) networkErrors.push(`${r.url().slice(0, 90)} (${r.failure().errorText})`);
});

let ss = 0;
async function shot(prefix) {
  const f = `${SCR}/web-${prefix}-${String(ss++).padStart(3, '0')}.png`;
  await page.screenshot({ path: f }).catch(() => {});
  return f;
}
const visibleButtons = async () => {
  try {
    return await page.evaluate(() => Array.from(document.querySelectorAll('button')).map((b) => ({
      text: (b.textContent || '').trim().slice(0, 40),
      aria: (b.getAttribute('aria-label') || '').slice(0, 40),
      title: (b.getAttribute('title') || '').slice(0, 40),
      hidden: b.offsetParent === null,
      disabled: b.disabled,
    })));
  } catch { return []; }
};
const visibleText = async () => {
  try { return (await page.evaluate(() => (document.body.innerText || '').replace(/\n{3,}/g, '\n\n'))).slice(0, 2000); } catch { return ''; }
};

console.log('== Artemis Extended — Web ==');

// ---------- 1. Démarrage ----------
// Attendre que le serveur vite soit en ligne, puis page chargée
{
  for (let i = 0; i < 25; i++) {
    try { await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 4000 }); break; } catch { await page.waitForTimeout(3000); }
  }
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(4000);
  pass('Web : page chargée sur http://localhost:3000', page.url().startsWith(BASE), page.url());
}
pass('Web : aucune erreur console pendant le chargement', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));
pass('Web : aucune erreur réseau', networkErrors.length === 0, networkErrors.slice(0, 3).join(' | '));
await shot('01-lancement');

// Splash — écran de démarrage (إضغط للمتابعة)
{
  const splashSel = '[role="button"]:has-text("اضغط للمتابعة")';
  const splashN = await page.locator(splashSel).count();
  pass('Web : écran de démarrage visible (splash)', splashN > 0, splashN > 0 ? 'اضغط للمتابعة' : 'aucun splash détecté');
  if (splashN > 0) {
    await page.locator(splashSel).first().click().catch(() => {});
    await page.waitForTimeout(3000);
    const text = await visibleText();
    console.log(`--- texte visible (après splash) ---\n${text.slice(0, 400)}`);
  }
  await shot('02-post-splash');
}

// Cliquer « ابدأ » si présent
{
  const btns = await visibleButtons();
  const i = btns.findIndex((b) => !b.hidden && /ابدأ/.test(b.text + b.aria));
  if (i >= 0) { await page.locator('button').nth(i).click().catch(() => {}); await page.waitForTimeout(2500); }
  pass('Web : bouton ابدأ cliqué (si présent)', true, i >= 0 ? 'cliqué' : 'pas de bouton ابدأ visible');
  const textAfterStart = await visibleText();
  console.log(`--- texte visible (après ابدأ) ---\n${textAfterStart.slice(0, 500)}`);
}

// Consultatif synchronisation (EcranConsentementSync)
{
  await page.waitForTimeout(2500);
  const consentSel = 'button:has-text("نعم، أفعّل المزامنة"), button:has-text("لا، لاحقًا")';
  const text0 = await visibleText();
  const i = await page.locator(consentSel).count();
  pass('Web : écran consultatif sync visible', i > 0, i > 0 ? text0.split('\n')[0] || '(écran consultatif)' : 'aucun consultatif détecté');
  if (i > 0) {
    const declSel = 'button:has-text("لا، لاحقًا")';
    await page.locator(declSel).first().click().catch(() => {});
    await page.waitForTimeout(3500);
  }
  const text1 = await visibleText();
  console.log(`--- texte visible (après consultatif) ---\n${text1.slice(0, 400)}`);
  await shot('04-consultatif');
}

// Inscription (écran « أنشئ حسابك »)
{
  await page.waitForTimeout(2500);
  const text = await visibleText();
  console.log(`--- texte visible (inscription) ---\n${text.slice(0, 600)}`);
  const inputs = await page.evaluate(() => Array.from(document.querySelectorAll('input, select, textarea')).map((el) => ({
    tag: el.tagName, type: el.getAttribute('type') || '', ph: el.getAttribute('placeholder') || '', value: (el.value || '').slice(0, 20), visible: el.offsetParent !== null,
  })));
  console.log('=== INPUTS/SELECTS (inscription) ===');
  console.log(JSON.stringify(inputs.filter((i) => i.visible), null, 1).slice(0, 2000));
  const btns = await page.evaluate(() => Array.from(document.querySelectorAll('button')).map((b) => ({ text: (b.textContent || '').trim().slice(0, 50), visible: b.offsetParent !== null })));
  console.log('=== BUTTONS (inscription) ===');
  console.log(JSON.stringify(btns.filter((b) => b.visible), null, 1).slice(0, 1500));
  await shot('05-inscription');

  // Remplir le formulaire (ids réels : #email, #mdp, #mdp2, #wilaya, #daira)
  await page.fill('#email', 'qa@bousala.test').catch(() => {});
  await page.fill('#mdp', 'Pass12345!').catch(() => {});
  await page.fill('#mdp2', 'Pass12345!').catch(() => {});
  const vals = await page.evaluate(() => ({
    email: (document.querySelector('#email') || {}).value,
    mdp: (document.querySelector('#mdp') || {}).value,
    mdp2: (document.querySelector('#mdp2') || {}).value,
    wilaya: (document.querySelector('#wilaya') || {}).value,
    daira: (document.querySelector('#daira') || {}).value,
  }));
  console.log('=== valeurs du formulaire ===', JSON.stringify(vals));
  const wil = page.locator('#wilaya');
  if (await wil.count() > 0) {
    await wil.selectOption({ index: 1 }).catch(() => {});
    await page.waitForTimeout(600);
    const dOpts = await page.locator('#daira').locator('option').allTextContents().catch(() => []);
    console.log('=== options daira ===', JSON.stringify(dOpts.slice(0, 6)));
    if (dOpts.length > 1) await page.locator('#daira').selectOption({ index: 1 }).catch(() => {});
  }
  const vals2 = await page.evaluate(() => ({
    wilaya: (document.querySelector('#wilaya') || {}).value,
    daira: (document.querySelector('#daira') || {}).value,
  }));
  console.log('=== valeurs wilaya/daira ===', JSON.stringify(vals2));
  pass('Inscription : formulaires remplis', vals.email !== '' && vals.mdp !== '' && vals2.wilaya !== '');
  await page.locator('button:has-text("أنشئ الحساب")').first().click().catch(() => {});
  await page.waitForTimeout(3500);
  const errTxt = await page.evaluate(() => (document.querySelector('[role="alert"]') || {}).textContent || '').catch(() => '');
  console.log('=== erreur (role=alert) ===', JSON.stringify(errTxt.slice(0, 300)));
  const text2 = await visibleText();
  console.log(`--- texte visible (après inscription) ---\n${text2.slice(0, 500)}`);
  await shot('06-post-inscription');
}
await shot('02-post-start');

// ---------- 2. Onglets ----------
const ONGLETS = ['اليوم', 'مساري', 'البوصلة', 'تدريبات', 'أنا'];
let totalClicks = 0;
for (const tab of ONGLETS) {
  try {
    const btns = await visibleButtons();
    const i = btns.findIndex((b) => !b.hidden && (b.text.includes(tab) || b.aria.includes(tab) || b.title.includes(tab)));
    pass(`Onglet ${tab} : bouton visible`, i >= 0, `${btns.length} boutons dans le DOM`);
    if (i < 0) continue;
    await page.locator('button').nth(i).click().catch(() => {});
    await page.waitForTimeout(1500);
    const text = await visibleText();
    console.log(`--- texte visible (${tab}) ---\n${text.slice(0, 300)}`);
    pass(`Onglet ${tab} : contenu visible`, text.trim().length > 0, text.split('\n').slice(0, 3).join(' | ').slice(0, 90));
    await shot(`03-onglet-${tab.replace(/[^\u0600-\u06FF]/g, '')}`);
    // ---------- 3. Boutons de l'onglet ----------
    const btns2 = await visibleButtons();
    const n = Math.min(btns2.length, 25);
    let nClicks = 0;
    const errBefore = consoleErrors.length + pageErrors.length;
    for (let j = 0; j < n; j++) {
      const b = btns2[j];
      if (b.hidden) continue;
      try { await page.locator('button').nth(j).click(); } catch { continue; }
      await page.waitForTimeout(700);
      nClicks++;
    }
    const newErrs = (consoleErrors.slice(errBefore)).concat(pageErrors.slice(errBefore));
    pass(`Onglet ${tab} : ${nClicks} boutons cliqués`, nClicks > 0, `+${newErrs.length} erreur console`);
    if (newErrs.length) pass(`Onglet ${tab} : aucune nouvelle erreur console`, false, newErrs.slice(0, 3).join(' | ').slice(0, 200));
    totalClicks += nClicks;
    // Retourner sur l'onglet
    await page.locator('button').nth(i).click().catch(() => {});
    await page.waitForTimeout(800);
  } catch (e) {
    pass(`Onglet ${tab} : erreur pendant le test`, false, String((e && e.message) || e).slice(0, 200));
  }
}
pass('Web : TOTAL boutons cliqués (5 onglets)', totalClicks > 0, `${totalClicks} clics`);

// ---------- 4. QCM (تدريبات) : clics sur options, vérification feedback ----------
{
  const before = await visibleText();
  const btns = await visibleButtons();
  const optIdx = btns.map((b, i) => i).filter((i) => btns[i].text.length <= 30 && !btns[i].hidden);
  let clicked = 0;
  for (const i of optIdx.slice(0, 6)) {
    await page.locator('button').nth(i).click().catch(() => {});
    await page.waitForTimeout(500);
    clicked++;
  }
  const after = await visibleText();
  pass('QCM : clics sur options effectués', clicked > 0, `${clicked} clics (feedback après: ${before !== after ? 'oui' : 'non'})`);
  pass('QCM : aucune erreur console', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | ').slice(0, 200));
  await shot('06-qcm');
}

// ---------- 5. Examen blanc (best-effort) ----------
{
  const btns = await visibleButtons();
  const i = btns.findIndex((b) => !b.hidden && /examen|امتحان/i.test(b.text + b.aria + b.title));
  pass('Exam blanc : bouton trouvé', i >= 0, i >= 0 ? btns[i].text : '(introuvable)');
  if (i >= 0) { await page.locator('button').nth(i).click().catch(() => {}); await page.waitForTimeout(2000); await shot('07-examen'); }
}

// ---------- 6. Hors-ligne (PWA) ----------
{
  await context.setOffline(true);
  const ok = await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 8000 }).then(() => true).catch(() => false);
  await page.waitForTimeout(3000);
  await context.setOffline(false);
  pass('Hors-ligne : page chargée sans réseau (cache/SW)', ok, ok ? 'chargement hors-ligne ok' : 'échec — PWA ouvert ?');
  await shot('08-hors-ligne');
}

// ---------- 7. Résumé ----------
const summary = [
  '# Artemis Extended — Web (http://localhost:3000) — 2026-11-23',
  '',
  '## Résumé',
  ...checks.map((c) => `- ${c.ok ? '✅' : '❌'} ${c.name}${c.detail ? ' — ' + c.detail : ''}`),
  '',
  '## Erreurs console',
  ...(consoleErrors.length ? consoleErrors : ['(aucune)']).map((e) => `- ${e}`),
  '',
  '## Erreurs réseau',
  ...(networkErrors.length ? networkErrors : ['(aucune)']).map((e) => `- ${e}`),
  '',
  '## Captures d\u2019écran (web)',
  `(voir le dossier ${SCR}/)`,
  '',
  '## Session Playwright',
  '',
  '```',
  `chromium headless (electron-free playwright), viewport 1440x900, bases: http://localhost:3000/`,
  '```',
];
writeFileSync(RESULTS, summary.join('\n'));
console.log(`\n== Done. Résumé écrit dans ${RESULTS} ==`);
await browser.close();
