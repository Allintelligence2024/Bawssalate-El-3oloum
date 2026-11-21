/* Comptes fictifs sur le build local : création sans WebCrypto, déconnexion,
 * connexion et migration du repli historique. Aucune connexion distante. */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const launch = require("../scripts/browser.cjs");
const origin = process.env.APP_URL || "http://127.0.0.1:4182";
if (!["127.0.0.1", "localhost"].includes(new URL(origin).hostname))
  throw Error("Ce scénario est réservé au build local.");
const hash = (mdp) => crypto.createHash("sha256").update(`kunz::${mdp}`).digest("hex");
const alertes = [];

async function protegerReseau(ctx) {
  await ctx.route("**/*", (route) => {
    const url = route.request().url();
    if (/^https?:/.test(url) && new URL(url).origin !== origin) {
      alertes.push(url);
      return route.abort();
    }
    return route.continue();
  });
}
async function deconnecter(page) {
  await page.getByRole("button", { name: "نقاط الخبرة وأيام النشاط" }).click();
  await page.getByRole("button", { name: "تسجيل الخروج", exact: true }).click();
  await page.getByRole("heading", { name: "سجّل الدخول" }).waitFor();
  assert.equal(await page.getByRole("navigation").count(), 0);
  assert.equal(await page.getByRole("button", { name: "نقاط الخبرة وأيام النشاط" }).count(), 0);
}

(async () => {
  const browser = await launch();
  try {
    // Sans compte, pas de navigation. Créer un compte quand WebCrypto n'est pas
    // disponible produit tout de même le même SHA-256, pas l'ancien repli faible.
    const fresh = await browser.newContext();
    await protegerReseau(fresh);
    await fresh.addInitScript(() => {
      if (window.top !== window || location.pathname !== "/") return;
      sessionStorage.setItem("kunz_demarrage", "1");
      Object.defineProperty(window.crypto, "subtle", { configurable: true, value: undefined });
      if (!localStorage.getItem("murajih_svt_v1")) localStorage.setItem("murajih_svt_v1", JSON.stringify({
        progression: {}, diagnosticDecideLe: "2026-01-01", consentementSync: false,
      }));
    });
    const p = await fresh.newPage();
    p.setDefaultTimeout(8000);
    await p.goto(origin + "/");
    await p.getByRole("heading", { name: "أنشئ حسابك" }).waitFor();
    assert.equal(await p.getByRole("navigation").count(), 0);
    assert.equal(await p.getByRole("button", { name: "نقاط الخبرة وأيام النشاط" }).count(), 0);
    assert((await p.locator("body").innerText()).includes("الحساب لا يشفّر البيانات"));
    await p.locator("#email").fill("nouveau@example.invalid");
    await p.locator("#mdp").fill("secret-123");
    await p.locator("#mdp2").fill("secret-123");
    await p.locator("#wilaya").selectOption("31");
    const daira = await p.locator("#daira option").nth(1).evaluate((option) => option.value);
    await p.locator("#daira").selectOption(daira);
    await p.getByRole("button", { name: "أنشئ الحساب ←" }).click();
    const consent = p.getByRole("button", { name: "لا، لاحقًا" });
    const badge = p.getByRole("button", { name: "نقاط الخبرة وأيام النشاط" });
    await consent.or(badge).first().waitFor();
    if (await consent.isVisible()) await consent.click();
    await badge.waitFor();
    assert.equal(await p.evaluate(() => JSON.parse(localStorage.getItem("murajih_svt_v1")).compte.motDePasse), hash("secret-123"));
    await deconnecter(p);
    await p.locator("#mdp").fill("incorrect");
    await p.getByRole("button", { name: "دخول ←" }).click();
    await p.getByRole("alert").filter({ hasText: "كلمة المرور خاطئة" }).waitFor();
    await p.locator("#mdp").fill("secret-123");
    await p.getByRole("button", { name: "دخول ←" }).click();
    await p.getByRole("button", { name: "نقاط الخبرة وأيام النشاط" }).waitFor();
    await fresh.close();

    // Ancien compte créé avec le repli 16 caractères : ne le migrer qu'après
    // vérification, préserver l'identité et la progression, puis vérifier le SHA
    // migré même quand WebCrypto devient indisponible.
    const legacy = await browser.newContext();
    await protegerReseau(legacy);
    await legacy.addInitScript(() => {
      if (window.top !== window || location.pathname !== "/" || localStorage.getItem("murajih_svt_v1")) return;
      sessionStorage.setItem("kunz_demarrage", "1");
      localStorage.setItem("murajih_svt_v1", JSON.stringify({
        progression: {}, favoris: ["conserver"], consentementSync: false,
        consentementSyncDecideLe: "2026-01-01", diagnosticDecideLe: "2026-01-01",
        compte: { email: "ancien@example.invalid", motDePasse: "3d812d7e75783fe4", jeton: "fixture-locale", wilaya: "31", daira: "وهران", creeLe: "2026-01-01" },
      }));
    });
    const q = await legacy.newPage();
    q.setDefaultTimeout(8000);
    await q.goto(origin + "/");
    await q.getByRole("heading", { name: "سجّل الدخول" }).waitFor();
    assert.equal(await q.getByRole("navigation").count(), 0);
    await q.locator("#mdp").fill("incorrect");
    await q.getByRole("button", { name: "دخول ←" }).click();
    await q.getByRole("alert").filter({ hasText: "كلمة المرور خاطئة" }).waitFor();
    assert.equal(await q.evaluate(() => JSON.parse(localStorage.getItem("murajih_svt_v1")).compte.motDePasse), "3d812d7e75783fe4");
    await q.locator("#mdp").fill("مرحبا-🧪");
    await q.getByRole("button", { name: "دخول ←" }).click();
    await q.getByRole("button", { name: "نقاط الخبرة وأيام النشاط" }).waitFor();
    const saved = await q.evaluate(() => JSON.parse(localStorage.getItem("murajih_svt_v1")));
    assert.equal(saved.compte.motDePasse, hash("مرحبا-🧪"));
    assert.equal(saved.compte.jeton, "fixture-locale");
    assert.deepEqual(saved.favoris, ["conserver"]);
    await deconnecter(q);
    await q.evaluate(() => Object.defineProperty(window.crypto, "subtle", { configurable: true, value: undefined }));
    await q.locator("#mdp").fill("مرحبا-🧪");
    await q.getByRole("button", { name: "دخول ←" }).click();
    await q.getByRole("button", { name: "نقاط الخبرة وأيام النشاط" }).waitFor();
    await legacy.close();
    assert.deepEqual(alertes, []);
    console.log("PASS comptes : création sans WebCrypto, déconnexion/connexion, refus et migration d'un ancien hachage.");
  } finally { await browser.close(); }
})().catch((e) => { console.error(e); process.exitCode = 1; });
