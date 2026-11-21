/* Application compilée locale : conserver un brouillon non sauvegardé lorsqu'un
 * autre onglet restaure les données. Ne jamais pointer vers une instance publique. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const launch = require("../scripts/browser.cjs");
const origin = process.env.APP_URL || "http://127.0.0.1:4182";
if (!["127.0.0.1", "localhost"].includes(new URL(origin).hostname))
  throw Error("Ce scénario est réservé au build local.");
const KEY = "boussole.bac.classe16.carnet.1", JOURNAL = "murajih_restauration_v1";
const book = (solo) => ({ version: 1, solo, link: "", first: "", events: "", inhibit: "", soloHelp: false, docHelp: false, recent: ["solo"] });

(async () => {
  const browser = await launch();
  try {
    const ctx = await browser.newContext({ acceptDownloads: true, viewport: { width: 320, height: 568 }, locale: "ar-DZ" });
    await ctx.addInitScript(() => {
      if (location.pathname !== "/" || localStorage.getItem("murajih_svt_v1")) return;
      const email = "reprise@example.invalid";
      sessionStorage.setItem("kunz_demarrage", "1");
      sessionStorage.setItem("kunz_session_v1", email);
      localStorage.setItem("murajih_svt_v1", JSON.stringify({
        progression: {}, compte: { email, wilaya: "31", daira: "وهران", creeLe: "2026-01-01" },
        consentementSync: false, consentementSyncDecideLe: "2026-01-01", diagnosticDecideLe: "2026-01-01",
      }));
    });
    const app = await ctx.newPage();
    app.setDefaultTimeout(5000);
    await app.goto(origin + "/");
    await app.getByRole("button", { name: "البوصلة", exact: true }).click();
    const labo = app.frameLocator('iframe[data-boussole="labo"]');
    await labo.locator('[data-id="atlas-paper"]').click();
    await labo.locator('[data-id="solo-edit"]').click();
    const child = app.frames().find((f) => f.url().includes("/boussole/index.html"));
    await child.evaluate((key) => {
      const original = Storage.prototype.setItem;
      Storage.prototype.setItem = function (k, value) {
        if (k === key) throw Error("quota simulé");
        return original.call(this, k, value);
      };
    }, KEY);
    await labo.locator("#txt-solo").fill("brouillon temporaire à préserver");
    assert((await labo.locator(".field small").innerText()).includes("لم يُؤكّد الحفظ"));

    const other = await ctx.newPage();
    await other.goto(origin + "/boussole/index.html");
    await other.evaluate(({ key, journal, value }) => {
      localStorage.setItem(journal, JSON.stringify({ etat: { progression: {} }, carnetBoussole: JSON.parse(value) }));
      localStorage.setItem(key, value);
      localStorage.removeItem(journal);
    }, { key: KEY, journal: JOURNAL, value: JSON.stringify(book("copie restaurée")) });
    await app.getByRole("heading", { name: "توقّف هذا التبويب لحماية بياناتك" }).waitFor();
    assert.equal(await app.evaluate(() => document.documentElement.scrollWidth), 320);
    assert.equal(await app.getByRole("dialog").count(), 1);
    await app.waitForFunction(() => document.activeElement?.id === "reprise-titre");
    await app.keyboard.press("Escape");
    assert.equal(await app.getByRole("dialog").count(), 1, "Échap ne doit pas reprendre les écritures");
    await app.keyboard.press("Tab");
    assert(await app.evaluate(() => !!document.activeElement?.closest("dialog")), "focus hors du dialogue");
    await app.addScriptTag({ path: process.env.AXE_FILE || require.resolve("axe-core/axe.min.js") });
    const scan = await app.evaluate(async () => {
      const result = await window.axe.run("dialog", {
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
      });
      return { violations: result.violations.map((v) => [v.id, v.nodes.map((n) => n.target)]),
        incomplete: result.incomplete.map((v) => v.id) };
    });
    assert.deepEqual(scan.violations, [], "violations axe dans la reprise ; le contraste incomplet reste à vérifier à la main");
    await app.screenshot({ path: require("node:os").tmpdir() + "/boussole-reprise-320.png" });
    // Le laboratoire doit rester monté derrière l'écran de protection : sinon
    // l'unique copie du texte non sauvegardé disparaît avant toute sauvegarde.
    assert.equal(await app.locator('iframe[data-boussole="labo"]').count(), 1, "iframe démontée pendant la reprise");
    await app.getByRole("button", { name: "أعود لنسخ مسوّدتي المؤقّتة" }).click();
    assert.equal(await labo.locator("#txt-solo").inputValue(), "brouillon temporaire à préserver");
    await labo.getByRole("alert").filter({ hasText: "تغيّر الدفتر" }).waitFor();
    await labo.getByRole("button", { name: "دفتر التجربة" }).click();
    const [download] = await Promise.all([
      app.waitForEvent("download"),
      labo.getByRole("button", { name: "أنزّل مسوّدتي" }).click(),
    ]);
    assert(fs.readFileSync(await download.path(), "utf8").includes("brouillon temporaire à préserver"));
    assert.equal(await other.evaluate((key) => JSON.parse(localStorage.getItem(key)).solo, KEY), "copie restaurée");
    await ctx.close();

    // Même sans import, une modification du profil par un autre onglet rend la
    // copie en mémoire périmée. Elle ne doit pas réécrire ni exporter l'ancienne.
    const c2 = await browser.newContext();
    await c2.addInitScript(() => {
      if (window.top !== window || location.pathname !== "/") return;
      const email = "deux-onglets@example.invalid";
      sessionStorage.setItem("kunz_demarrage", "1");
      sessionStorage.setItem("kunz_session_v1", email);
      if (!localStorage.getItem("murajih_svt_v1")) localStorage.setItem("murajih_svt_v1", JSON.stringify({
        progression: {}, compte: { email, wilaya: "31", daira: "وهران", creeLe: "2026-01-01" },
        consentementSync: false, consentementSyncDecideLe: "2026-01-01", diagnosticDecideLe: "2026-01-01",
      }));
    });
    const first = await c2.newPage(), stale = await c2.newPage();
    first.setDefaultTimeout(5000);
    stale.setDefaultTimeout(5000);
    await first.goto(origin + "/");
    await first.getByRole("button", { name: "أنا", exact: true }).click();
    await first.locator("#nom").waitFor();
    await stale.goto(origin + "/");
    await stale.getByRole("button", { name: "نقاط الخبرة وأيام النشاط" }).waitFor();
    await first.locator("#nom").fill("modification dans le premier onglet");
    await first.waitForFunction(() => JSON.parse(localStorage.getItem("murajih_svt_v1")).nom === "modification dans le premier onglet");
    await stale.getByRole("heading", { name: "توقّف هذا التبويب لحماية بياناتك" }).waitFor();
    await stale.getByRole("button", { name: "أعود لنسخ مسوّدتي المؤقّتة" }).click();
    await stale.getByRole("button", { name: "أنا", exact: true }).click();
    await stale.locator("#nom").fill("ancienne copie à ne pas écrire");
    assert.equal(await first.evaluate(() => JSON.parse(localStorage.getItem("murajih_svt_v1")).nom), "modification dans le premier onglet");
    // Les statistiques ont leur propre clé et doivent également geler l'autre copie.
    await stale.evaluate(() => localStorage.setItem("kunz_stats_v1", JSON.stringify({
      justes: 1, fausses: 0, parJour: {},
      parSource: Object.fromEntries(["phase", "revision", "jalon", "atelier", "exercice"].map((k) => [k, { justes: 0, fausses: 0 }])),
    })));
    await first.getByRole("heading", { name: "توقّف هذا التبويب لحماية بياناتك" }).waitFor();
    await c2.close();

    // Des statistiques corrompues ne doivent pas être remplacées par des zéros
    // dans un fichier présenté comme une sauvegarde complète.
    const c3 = await browser.newContext();
    await c3.addInitScript(() => {
      if (window.top !== window || location.pathname !== "/" || localStorage.getItem("murajih_svt_v1")) return;
      const email = "stats@example.invalid";
      sessionStorage.setItem("kunz_demarrage", "1");
      sessionStorage.setItem("kunz_session_v1", email);
      localStorage.setItem("murajih_svt_v1", JSON.stringify({
        progression: {}, compte: { email, wilaya: "31", daira: "وهران", creeLe: "2026-01-01" },
        consentementSync: false, consentementSyncDecideLe: "2026-01-01", diagnosticDecideLe: "2026-01-01",
      }));
      localStorage.setItem("kunz_stats_v1", '{"justes":"invalide"}');
    });
    const bad = await c3.newPage();
    bad.setDefaultTimeout(5000);
    await bad.goto(origin + "/");
    await bad.getByRole("button", { name: "أنا", exact: true }).click();
    await bad.getByRole("button", { name: "تصدير نسختي" }).click();
    await bad.getByRole("status").filter({ hasText: "تعذّرت قراءة الإحصاءات المحفوظة" }).waitFor();
    assert.equal(await bad.evaluate(() => localStorage.getItem("kunz_stats_v1")), '{"justes":"invalide"}');
    await c3.close();

    // Empêcher la livraison de storage à l'ancien onglet pour simuler son retard.
    // Le contrôle synchrone avant sauvegarde doit néanmoins préserver l'autre copie.
    const c4 = await browser.newContext();
    await c4.addInitScript(() => {
      if (window.top !== window || location.pathname !== "/") return;
      const email = "course@example.invalid";
      sessionStorage.setItem("kunz_demarrage", "1");
      sessionStorage.setItem("kunz_session_v1", email);
      if (!localStorage.getItem("murajih_svt_v1")) localStorage.setItem("murajih_svt_v1", JSON.stringify({
        progression: {}, compte: { email, wilaya: "31", daira: "وهران", creeLe: "2026-01-01" },
        consentementSync: false, consentementSyncDecideLe: "2026-01-01", diagnosticDecideLe: "2026-01-01",
      }));
    });
    const live = await c4.newPage(), delayed = await c4.newPage();
    live.setDefaultTimeout(5000);
    delayed.setDefaultTimeout(5000);
    await delayed.addInitScript(() => {
      window.__stockageDiffere = 0;
      window.addEventListener("storage", (e) => {
        if (e.key === "murajih_svt_v1" || e.key === "kunz_stats_v1") {
          window.__stockageDiffere++;
          e.stopImmediatePropagation();
        }
      }, true);
    });
    await live.goto(origin + "/");
    await live.getByRole("button", { name: "أنا", exact: true }).click();
    await live.locator("#nom").waitFor();
    await delayed.goto(origin + "/");
    await delayed.getByRole("button", { name: "أنا", exact: true }).click();
    await delayed.locator("#nom").waitFor();
    await live.locator("#nom").fill("modification protégée malgré le retard");
    await live.waitForFunction(() => JSON.parse(localStorage.getItem("murajih_svt_v1")).nom === "modification protégée malgré le retard");
    await delayed.waitForFunction(() => window.__stockageDiffere > 0);
    assert.equal(await delayed.getByRole("dialog").count(), 0);
    await delayed.locator("#nom").fill("ancienne copie qui ne doit pas écraser");
    await delayed.getByRole("heading", { name: "توقّف هذا التبويب لحماية بياناتك" }).waitFor();
    assert.equal(await live.evaluate(() => JSON.parse(localStorage.getItem("murajih_svt_v1")).nom), "modification protégée malgré le retard");
    await delayed.getByRole("button", { name: "أعود لنسخ مسوّدتي المؤقّتة" }).click();
    assert.equal(await delayed.locator("#nom").inputValue(), "ancienne copie qui ne doit pas écraser");
    await c4.close();

    // Depuis « أنا », une confirmation ne doit pas effacer une version du carnet
    // modifiée seule par un autre onglet pendant que l'élève confirme l'action.
    for (const action of ["reset", "import"]) {
      const contexte = await browser.newContext({ viewport: { width: 320, height: 568 }, locale: "ar-DZ" });
      await contexte.addInitScript(({ key, premier }) => {
        if (window.top !== window || location.pathname !== "/" || localStorage.getItem("murajih_svt_v1")) return;
        const email = "confirmation@example.invalid";
        sessionStorage.setItem("kunz_demarrage", "1");
        sessionStorage.setItem("kunz_session_v1", email);
        localStorage.setItem("murajih_svt_v1", JSON.stringify({
          progression: {}, compte: { email, wilaya: "31", daira: "وهران", creeLe: "2026-01-01" },
          consentementSync: false, consentementSyncDecideLe: "2026-01-01", diagnosticDecideLe: "2026-01-01",
        }));
        localStorage.setItem(key, premier);
      }, { key: KEY, premier: JSON.stringify(book("avant confirmation")) });
      const ancien = await contexte.newPage(), autre = await contexte.newPage();
      ancien.setDefaultTimeout(5000);
      await ancien.goto(origin + "/");
      await ancien.getByRole("button", { name: "أنا", exact: true }).click();
      await ancien.locator("#nom").waitFor();
      const etatAvant = await ancien.evaluate(() => localStorage.getItem("murajih_svt_v1"));
      await autre.goto(origin + "/boussole/index.html");
      const nouveau = JSON.stringify(book("version récente à conserver"));
      if (action === "reset") {
        await ancien.getByRole("button", { name: "مسح كل بياناتي" }).click();
        await ancien.waitForFunction(() => document.activeElement?.id === "confirmation-effacement-titre");
        await ancien.keyboard.press("Tab");
        assert.equal(await ancien.evaluate(() => document.activeElement?.textContent.trim()), "نعم، امسح كل شيء");
        await autre.evaluate(({ key, valeur }) => localStorage.setItem(key, valeur), { key: KEY, valeur: nouveau });
        assert.equal(await ancien.getByRole("dialog").count(), 0);
        await ancien.getByRole("button", { name: "نعم، امسح كل شيء" }).click();
      } else {
        const fichier = {
          name: "copie-fictive.json", mimeType: "application/json",
          buffer: Buffer.from(JSON.stringify({ version: 3, etat: { progression: {} }, carnetBoussole: null })),
        };
        await ancien.locator('input[type="file"]').setInputFiles(fichier);
        await ancien.getByRole("heading", { name: "تأكيد استيراد النسخة" }).waitFor();
        await ancien.waitForFunction(() => document.activeElement?.id === "confirmation-import-titre");
        await ancien.keyboard.press("Tab");
        assert.equal(await ancien.evaluate(() => document.activeElement?.textContent.trim()), "نعم، استورد النسخة");
        await ancien.keyboard.press("Tab");
        await ancien.keyboard.press("Enter"); // annuler au clavier
        assert.equal(await ancien.evaluate(() => document.activeElement?.textContent.trim()), "استيراد نسخة");
        await ancien.locator('input[type="file"]').setInputFiles(fichier);
        await ancien.getByRole("heading", { name: "تأكيد استيراد النسخة" }).waitFor();
        assert.equal(await ancien.evaluate(() => document.documentElement.scrollWidth), 320);
        await ancien.addScriptTag({ path: process.env.AXE_FILE || require.resolve("axe-core/axe.min.js") });
        const analyse = await ancien.evaluate(async () => {
          const resultat = await window.axe.run(document.getElementById("confirmation-import-titre").parentElement, {
            runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
          });
          return resultat.violations.map((v) => [v.id, v.nodes.map((n) => n.target)]);
        });
        assert.deepEqual(analyse, [], "violations axe dans la confirmation d'import");
        await autre.evaluate(({ key, valeur }) => localStorage.setItem(key, valeur), { key: KEY, valeur: nouveau });
        await ancien.getByRole("button", { name: "نعم، استورد النسخة" }).click();
      }
      try {
        await ancien.getByRole("heading", { name: "توقّف هذا التبويب لحماية بياناتك" }).waitFor();
      } catch (erreur) {
        throw new Error(`${action} : la reprise n'a pas été ouverte après le conflit`, { cause: erreur });
      }
      assert.equal(await autre.evaluate((key) => localStorage.getItem(key), KEY), nouveau, `${action} a effacé le carnet récent`);
      assert.equal(await autre.evaluate(() => localStorage.getItem("murajih_svt_v1")), etatAvant, `${action} a modifié l'état`);
      assert.equal(await autre.evaluate((key) => localStorage.getItem(key), JOURNAL), null, `${action} a ouvert un journal`);
      await contexte.close();
    }
    console.log("PASS reprise intégrée : brouillon préservé, conflits détectés même sans notification reçue, confirmation d'import/reset protégée, dialogue clavier et export refusé si les statistiques sont illisibles.");
  } finally { await browser.close(); }
})().catch((e) => { console.error(e); process.exitCode = 1; });
