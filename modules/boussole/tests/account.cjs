/* Comptes fictifs sur le build local : création sans WebCrypto, déconnexion,
 * connexion et migration du repli historique. Aucune connexion distante. */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const launch = require("../scripts/browser.cjs");
const origin = process.env.APP_URL || "http://127.0.0.1:4182";
if (!["127.0.0.1", "localhost"].includes(new URL(origin).hostname))
  throw Error("Ce scénario est réservé au build local.");
// Format courant du produit (src/utils/compte.ts) : pbkdf2$<iterations>$<selHex32>$<cleHex64>.
// Le test re-dérive la clé avec Node crypto pour prouver l'exactitude du hash stocké.
const parsePbkdf2 = (stocke) => {
  const m = /^pbkdf2\$(\d+)\$([0-9a-f]{32})\$([0-9a-f]{64})$/.exec(stocke);
  assert.ok(m, `hachage pbkdf2 attendu, obtenu : ${stocke}`);
  return { iterations: Number(m[1]), sel: m[2], cle: m[3] };
};
const clePbkdf2 = (mdp, selHex) =>
  crypto.pbkdf2Sync(`kunz::${mdp}`, Buffer.from(selHex, "hex"), 60000, 32, "sha256").toString("hex");
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
    // disponible doit produire le hachage PBKDF2 courant via le repli @noble,
    // pas l'ancien repli faible.
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
    // Phase 2 : sans compte, on entre directement en mode invité — plus de péage.
    await p.getByRole("navigation").waitFor();
    assert.equal(await p.getByRole("heading", { name: "أنشئ حسابك" }).count(), 0);
    // La création se demande explicitement, depuis la fiche XP.
    await p.getByRole("button", { name: "نقاط الخبرة وأيام النشاط" }).click();
    await p.getByRole("button", { name: "أنشئ حسابًا (اختياري)" }).click();
    await p.getByRole("heading", { name: "أنشئ حسابك" }).waitFor();
    assert.equal(await p.getByRole("navigation").count(), 0);
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
    const stocke = await p.evaluate(() => JSON.parse(localStorage.getItem("murajih_svt_v1")).compte.motDePasse);
    const frais = parsePbkdf2(stocke);
    assert.equal(frais.iterations, 60000);
    assert.equal(frais.cle, clePbkdf2("secret-123", frais.sel));
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
    // Un compte enregistré n'est plus un verrou au démarrage (phase 2) : on se déconnecte
    // explicitement pour retrouver l'écran de connexion, puis on teste le vieux hachage.
    await q.getByRole("navigation").waitFor();
    await deconnecter(q);
    await q.locator("#mdp").fill("incorrect");
    await q.getByRole("button", { name: "دخول ←" }).click();
    await q.getByRole("alert").filter({ hasText: "كلمة المرور خاطئة" }).waitFor();
    assert.equal(await q.evaluate(() => JSON.parse(localStorage.getItem("murajih_svt_v1")).compte.motDePasse), "3d812d7e75783fe4");
    await q.locator("#mdp").fill("مرحبا-🧪");
    await q.getByRole("button", { name: "دخول ←" }).click();
    await q.getByRole("button", { name: "نقاط الخبرة وأيام النشاط" }).waitFor();
    const saved = await q.evaluate(() => JSON.parse(localStorage.getItem("murajih_svt_v1")));
    const migre = parsePbkdf2(saved.compte.motDePasse);
    assert.equal(migre.cle, clePbkdf2("مرحبا-🧪", migre.sel));
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
