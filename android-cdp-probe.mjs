// Sonde CDP : lit le DOM réel du WebView Android (émulateur) via Playwright connectOverCDP.
import { chromium } from 'playwright';

const browser = await chromium.connectOverCDP('http://localhost:9222');
const contexts = browser.contexts();
console.log('contexts:', contexts.length);
const ctx = contexts[0];
const pages = ctx.pages();
console.log('pages:', pages.length);
for (const p of pages) {
  console.log('URL:', p.url());
  const data = await p.evaluate(() => ({
    readyState: document.readyState,
    text: (document.body.innerText || '').replace(/\n{3,}/g, '\n\n').slice(0, 1200),
    buttons: Array.from(document.querySelectorAll('button')).map((b) => (b.textContent || '').trim().slice(0, 50)).slice(0, 30),
    roles: Array.from(document.querySelectorAll('[role="button"]')).map((b) => (b.textContent || '').trim().slice(0, 50)).slice(0, 15),
    inputs: Array.from(document.querySelectorAll('input, select')).map((e) => ({ tag: e.tagName, id: e.id, type: e.type })).slice(0, 15),
  }));
  console.log(JSON.stringify(data, null, 1));
}
await browser.close();
