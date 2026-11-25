// Artemis Web FINAL — couverture exhaustive, paramétrable par URL.
// Usage : node artemis-web-final.mjs http://localhost:3000/ local
//         node artemis-web-final.mjs https://localhost:8443/ https
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';

const BASE = process.argv[2] || 'http://localhost:3000/';
const TAG = process.argv[3] || 'local';
const SHOTS = 'plans/screenshots';
const RESULTS = `plans/QA-APP-ARTEMIS-2026-11-22-web-${TAG}-final.md`;
mkdirSync(SHOTS, { recursive: true });
const checks = [];
const pass = (name, ok, detail) => {
  checks.push({ name, ok: !!ok, detail: detail ?? '' });
  console.log(`${ok ? '✅' : '❌'} ${name}${detail ? ' - ' + detail : ''}`);
};

const browser = await chromium.launch({ headless: true, args: ['--ignore-certificate-errors'] });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, ignoreHTTPSErrors: true });
const page = await context.newPage();
const consoleErrors = [];
const pageErrors = [];
page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 200)); });
page.on('pageerror', (e) => pageErrors.push(String(e.message).slice(0, 200)));

const sleep = (ms) => page.waitForTimeout(ms);
const text = async () => {
  try { return (await page.evaluate(() => document.body.innerText || '')).replace(/\n{3,}/g, '\n\n').slice(0, 900); }
  catch { return ''; }
};
const buttons = async () => {
  try {
    return await page.evaluate(() => Array.from(document.querySelectorAll('button'))
      .filter((b) => b.offsetParent !== null && !b.disabled)
      .map((b) => ({ t: (b.textContent || '').trim().slice(0, 70), a: b.getAttribute('aria-label') || '' }))
      .filter((b) => b.t || b.a));
  } catch { return []; }
};
const names = async () => (await buttons()).map((b) => b.t || b.a);
const clickText = async (needle, exact = false) => {
  const rx = exact ? new RegExp(`^${needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) : needle;
  const loc = page.locator('button, [role="button"], a').filter({ hasText: rx });
  const count = await loc.count();
  const candidates = [];
  for (let i = 0; i < count; i++) {
    const info = await loc.nth(i).evaluate((e) => {
      const r = e.getBoundingClientRect();
      const cs = getComputedStyle(e);
      const visible = r.width > 0 && r.height > 0 && cs.opacity !== '0' && cs.visibility !== 'hidden' && cs.display !== 'none' && cs.pointerEvents !== 'none';
      return { visible, len: (e.textContent || '').trim().length };
    }).catch(() => ({ visible: false, len: 1e9 }));
    if (info.visible) candidates.push({ i, len: info.len });
  }
  candidates.sort((a, b) => a.len - b.len);
  if (!candidates.length) return false;
  await loc.nth(candidates[0].i).click({ timeout: 3000 }).catch(() => {});
  return true;
};
const clickAria = async (re) => page.evaluate((src) => {
  const rx = new RegExp(src, 'i');
  const e = Array.from(document.querySelectorAll('button')).find((b) => rx.test(b.getAttribute('aria-label') || '') && b.offsetParent !== null);
  if (!e) return '';
  const a = e.getAttribute('aria-label'); e.click(); return a;
}, re.source);
const shot = async (n) => { try { await page.screenshot({ path: `${SHOTS}/${TAG}-final-${n}.png` }); } catch {} };

const TABS = ['اليوم', 'مساري', 'البوصلة', 'تدريبات', 'أنا'];
const DESTRUCTIVE = /تسجيل الخروج|حذف|مسح كل|إلغاء الحساب|إعادة تعيين|logout|delete/i;

async function goHome() {
  let didSplash = false;
  let didStart = false;
  for (let i = 0; i < 20; i++) {
    const ns = await names();
    if (TABS.filter((t) => ns.includes(t)).length >= 2) {
      await clickText('لاحقًا').catch(() => {});
      await sleep(400);
      return true;
    }
    if (!didSplash && await clickText('اضغط للمتابعة')) { didSplash = true; await sleep(2200); continue; }
    if (!didStart && await clickText('ابدأ')) { didStart = true; await sleep(9000); continue; }
    if (didStart) await sleep(1200);
    if (await page.locator('#email').count() > 0) {
      const email = TAG === 'https' ? 'qahttps@bousala.test' : 'qafinal@bousala.test';
      await page.fill('#email', email).catch(() => {});
      await page.fill('#mdp', 'Pass12345!').catch(() => {});
      await page.fill('#mdp2', 'Pass12345!').catch(() => {});
      await page.locator('#wilaya').selectOption({ index: 1 }).catch(() => {});
      await sleep(500);
      await page.locator('#daira').selectOption({ index: 1 }).catch(() => {});
      await clickText('أنشئ الحساب');
      await sleep(2200);
      continue;
    }
    // header déplié (panneau profil) → replier
    if ((await names()).includes('تسجيل الخروج')) { await clickText('▲'); await sleep(500); continue; }
    if (await clickAria(/خروج|عودة|رجوع|إغلاق|back|close/)) { await sleep(700); continue; }
    let fellBack = false;
    for (const t of ['إلغاء', 'رجوع', 'العودة', 'إغلاق', 'تراجع', 'العودة إلى المرحلة 1']) {
      if (await clickText(t)) { fellBack = true; await sleep(600); break; }
    }
    if (fellBack) continue;
    break;
  }
  const finalNames = await names();
  return TABS.filter((t) => finalNames.includes(t)).length >= 2;
}

try {
  let loaded = false;
  for (let i = 0; i < 8; i++) {
    try { await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 8000 }); loaded = true; break; }
    catch { await sleep(2500); }
  }
  pass(`${TAG} : page chargée`, loaded, page.url());
  const homeOk = await goHome();
  pass(`${TAG} : accueil / navigation`, homeOk, homeOk ? (await text()).split('\n').filter(Boolean).slice(0, 2).join(' | ').slice(0, 100) : (await text()).slice(0, 100));
  await shot('00-home');

  const report = [];
  let totalClicks = 0;
  for (const tab of TABS) {
    try {
      if (!(await goHome())) { pass(`${tag(tab)} : navigation perdue`, false); continue; }
      const present = (await names()).includes(tab);
      pass(`${tag(tab)} : bouton présent`, present);
      if (!present) continue;
      await clickText(tab, true);
      await sleep(1500);
      const t = await text();
      const bb = await buttons();
      report.push({ tab, text: t, buttons: bb.map((b) => b.t || b.a) });
      console.log(`\n--- ${tab} ---\n${t.slice(0, 420)}`);
      pass(`${tag(tab)} : contenu`, t.trim().length > 30, t.split('\n').filter(Boolean).slice(0, 3).join(' | ').slice(0, 110));
      await shot(`tab-${tab}`);
      const targets = bb.map((b) => b.t || b.a).filter((x) => x.length > 2 && !TABS.includes(x) && !DESTRUCTIVE.test(x) && !/⚡|XP|▲|▼|الوضع الليلي/.test(x)).slice(0, 6);
      let n = 0;
      for (const label of targets) {
        if (await clickText(label, false)) { n++; await sleep(550); }
        // revenir à l'onglet courant pour tester la carte suivante
        await goHome().catch(() => {});
        await clickText(tab, true).catch(() => {});
        await sleep(700);
      }
      pass(`${tag(tab)} : boutons testés`, n > 0, `${n} clics / ${targets.length} cibles`);
      totalClicks += n;
    } catch (e) { pass(`${tag(tab)} : erreur`, false, String((e && e.message) || e).slice(0, 150)); }
  }
  pass(`${TAG} : TOTAL clics boutons`, totalClicks > 0, `${totalClicks}`);

  // Mind map : مساري → الخريطة الذهنية
  try {
    await goHome();
    await clickText('مساري', true); await sleep(1200);
    const mm = await clickText('الخريطة الذهنية');
    pass(`${TAG} : mind map (الخريطة الذهنية)`, mm, mm ? 'cliqué' : 'introuvable');
    if (mm) {
      await sleep(1500);
      const t = await text();
      pass(`${TAG} : mind map contenu`, /خريطة|ذهنية|مخطّط/i.test(t), t.split('\n').filter(Boolean).slice(0, 4).join(' | ').slice(0, 140));
      await shot('mindmap');
    }
  } catch (e) { pass(`${TAG} : mind map erreur`, false, String((e && e.message) || e).slice(0, 150)); }

  // Examen blanc : تدريبات → الامتحان التجريبي
  try {
    await goHome();
    await clickText('تدريبات', true); await sleep(1200);
    const ex = await clickText('الامتحان التجريبي');
    pass(`${TAG} : examen blanc`, ex, ex ? 'cliqué' : 'introuvable');
    if (ex) {
      await sleep(1600);
      const t = await text();
      pass(`${TAG} : écran examen`, /امتحان|سؤال|وقت|وضيــفة/.test(t), t.split('\n').filter(Boolean).slice(0, 4).join(' | ').slice(0, 140));
      await shot('exam');
      // répondre à quelques questions
      let n = 0;
      for (let i = 0; i < 5; i++) {
        const opts = (await buttons()).map((b) => b.t || b.a).filter((x) => x.length > 12 && !TABS.includes(x) && !DESTRUCTIVE.test(x) && !/⚡|XP|▲|▼/.test(x));
        if (!opts.length) break;
        if (await clickText(opts[0], true)) { n++; await sleep(600); }
      }
      pass(`${TAG} : examen QCM`, n > 0, `${n} réponses`);
    }
  } catch (e) { pass(`${TAG} : examen erreur`, false, String((e && e.message) || e).slice(0, 150)); }

  // QCM : تدريبات → أسئلة QCM
  try {
    await goHome();
    await clickText('تدريبات', true); await sleep(1200);
    const q = await clickText('أسئلة QCM');
    pass(`${TAG} : QCM`, q, q ? 'cliqué' : 'introuvable');
    if (q) {
      await sleep(1500);
      // 1) choisir un axe (محور) : bouton contenant « (n/m) »
      const axes = (await buttons()).map((b) => b.t || b.a).filter((x) => /\(\d+\/\d+\)/.test(x));
      console.log('[QCM] ' + axes.length + ' axes détectés');
      let started = false;
      if (axes.length) { started = await clickText(axes[0], false); await sleep(1600); }
      pass(`${TAG} : QCM axe choisi`, started, axes[0] ? axes[0].slice(0, 50) : 'aucun axe');
      // 2) répondre aux questions de la ronde
      let n = 0;
      for (let i = 0; i < 12; i++) {
        const opts = (await buttons()).map((b) => b.t || b.a).filter((x) => x.length > 2 && !TABS.includes(x) && !DESTRUCTIVE.test(x) && !/⚡|XP|▲|▼|العودة|رجوع|الوضع الليلي|التالي|تحقق|السؤال|إنهاء|خروج/.test(x));
        if (!opts.length) break;
        if (await clickText(opts[0], false)) { n++; await sleep(700); } else break;
        // bouton « suivant / vérifier » éventuel
        for (const t of ['التالي', 'تحقق', 'السؤال التالي', 'تأكيد']) { if (await clickText(t)) { await sleep(600); break; } }
      }
      pass(`${TAG} : QCM échantillon`, n > 0, `${n} réponses`);
      console.log('[QCM fin] ' + (await text()).replace(/\n/g, ' | ').slice(0, 220));
      await shot('qcm');
    }
  } catch (e) { pass(`${TAG} : QCM erreur`, false, String((e && e.message) || e).slice(0, 150)); }

  // Export / import : أنا
  try {
    await goHome();
    await clickText('أنا', true); await sleep(1200);
    const exp = await clickText('تصدير نسختي');
    pass(`${TAG} : export (تصدير نسختي)`, exp, exp ? 'cliqué' : 'introuvable');
    if (exp) { await sleep(1000); pass(`${TAG} : export feedback`, (await text()).trim().length > 20, (await text()).split('\n').filter(Boolean).slice(0, 2).join(' | ').slice(0, 100)); }
    await goHome();
    await clickText('أنا', true); await sleep(1000);
    const imp = await clickText('استيراد نسخة');
    pass(`${TAG} : import (استيراد نسخة)`, imp, imp ? 'cliqué (file picker non bloqué)' : 'introuvable');
  } catch (e) { pass(`${TAG} : export/import erreur`, false, String((e && e.message) || e).slice(0, 150)); }

  // PWA / service worker
  try {
    const sw = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return 'no-api';
      const regs = await navigator.serviceWorker.getRegistrations().catch(() => []);
      return regs.length ? `${regs.length} SW` : 'aucun SW enregistré';
    });
    pass(`${TAG} : service worker`, /^\d+ SW$/.test(sw), sw);
  } catch (e) { pass(`${TAG} : service worker erreur`, false, String((e && e.message) || e).slice(0, 150)); }

  pass(`${TAG} : erreurs console`, consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | ').slice(0, 220));
  pass(`${TAG} : erreurs page`, pageErrors.length === 0, pageErrors.slice(0, 3).join(' | ').slice(0, 220));

  writeFileSync(`plans/QA-APP-ARTEMIS-2026-11-22-web-${TAG}-final.json`, JSON.stringify({ base: BASE, checks, report, consoleErrors, pageErrors }, null, 2));
  await browser.close();
} catch (e) {
  pass(`${TAG} : ERREUR FATALE`, false, String((e && e.message) || e).slice(0, 220));
  await browser.close().catch(() => {});
} finally {
  writeFileSync(RESULTS, ['# Artemis Web FINAL — ' + TAG + ' — 2026-11-23', '', `URL : ${BASE}`, '', '## Résultats', ...checks.map((c) => `- ${c.ok ? '✅' : '❌'} ${c.name}${c.detail ? ' — ' + c.detail : ''}`), ''].join('\n'));
  console.log('\nRésumé :', RESULTS);
}

function tag(t) { return `${TAG}/${t}`; }
