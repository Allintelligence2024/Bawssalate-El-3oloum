/* Régressions navigateur : journal de restauration et brouillons concurrents.
 * Données fictives, documents locaux et réseau coupé. */
const fs = require("node:fs"),
  path = require("node:path"),
  { pathToFileURL } = require("node:url"),
  assert = require("node:assert/strict"),
  launch = require("../scripts/browser.cjs");
const source = pathToFileURL(path.resolve(__dirname, "../../../public/boussole/index.html")).href;
const KEY = "boussole.bac.classe16.carnet.1", JOURNAL = "murajih_restauration_v1";
const book = (solo) => ({
  version: 1, solo, link: "", first: "", events: "", inhibit: "",
  soloHelp: false, docHelp: false, recent: ["solo"],
});

(async () => {
  const browser = await launch();
  try {
    // Une écriture locale échoue, puis un autre document modifie le carnet.
    // Le texte temporaire doit rester visible et ne doit pas écraser l'autre copie.
    const ctx = await browser.newContext({ acceptDownloads: true });
    await ctx.setOffline(true);
    const p = await ctx.newPage();
    p.setDefaultTimeout(5000);
    await p.goto(source + "#solo");
    await p.evaluate(({ key, value }) => localStorage.setItem(key, value), {
      key: KEY, value: JSON.stringify(book("ancien brouillon")),
    });
    await p.reload();
    await p.evaluate((key) => {
      const original = Storage.prototype.setItem;
      window.__bloquerCarnet = true;
      Storage.prototype.setItem = function (k, value) {
        if (k === key && window.__bloquerCarnet) throw new Error("quota simulé");
        return original.call(this, k, value);
      };
    }, KEY);
    await p.locator("#txt-solo").fill("texte non sauvegardé");
    assert((await p.locator(".field small").innerText()).includes("لم يُؤكّد الحفظ"));
    await p.evaluate((key) => {
      window.__recuCarnet = false;
      window.addEventListener("storage", (e) => { if (e.key === key) window.__recuCarnet = true; });
    }, KEY);
    const peer = await ctx.newPage();
    await peer.goto(source + "#solo");
    await peer.locator("#txt-solo").fill("modification de l'autre onglet");
    await p.waitForFunction(() => window.__recuCarnet);
    await p.getByRole("alert").filter({ hasText: "تغيّر الدفتر" }).waitFor();
    assert.equal(await p.locator("#txt-solo").inputValue(), "texte non sauvegardé");
    await p.evaluate(() => { window.__bloquerCarnet = false; });
    await p.locator("#txt-solo").fill("texte non sauvegardé, complété");
    assert.equal(await peer.evaluate((key) => JSON.parse(localStorage.getItem(key)).solo, KEY), "modification de l'autre onglet");
    await p.getByRole("button", { name: "دفتر التجربة" }).click();
    const [download] = await Promise.all([
      p.waitForEvent("download"),
      p.getByRole("button", { name: "أنزّل مسوّدتي" }).click(),
    ]);
    assert(fs.readFileSync(await download.path(), "utf8").includes("texte non sauvegardé, complété"));
    // Une nouvelle modification distante referme aussi la confirmation de
    // chargement et laisse la saisie temporaire intacte.
    await p.getByRole("button", { name: "أحمّل الدفتر المحفوظ" }).click();
    await p.waitForFunction(() => document.activeElement?.id === "confirm-load-title");
    await peer.locator("#txt-solo").fill("copie modifiée pendant confirmation");
    await p.getByRole("button", { name: "نعم، أحمّل الدفتر" }).waitFor({ state: "hidden" });
    assert.equal(await p.evaluate(() => document.activeElement?.textContent.trim()), "أحمّل الدفتر المحفوظ");
    assert.equal(await p.locator("#txt-solo").inputValue(), "texte non sauvegardé, complété");
    // Si la lecture échoue au moment de charger la copie, la seule saisie
    // temporaire ne doit pas être remplacée par un carnet vierge de secours.
    await p.evaluate((key) => {
      const original = Storage.prototype.getItem;
      window.__refuserLectureCarnet = true;
      Storage.prototype.getItem = function (k) {
        if (k === key && window.__refuserLectureCarnet) throw Error("lecture refusée");
        return original.call(this, k);
      };
    }, KEY);
    await p.getByRole("button", { name: "أحمّل الدفتر المحفوظ" }).click();
    await p.waitForFunction(() => document.activeElement?.id === "confirm-load-title");
    await p.getByRole("button", { name: "نعم، أحمّل الدفتر" }).click();
    assert.equal(await p.locator("#txt-solo").inputValue(), "texte non sauvegardé, complété", "lecture refusée : brouillon effacé");
    await p.getByRole("alert").filter({ hasText: "بقي نصّك المؤقّت" }).waitFor();
    await p.evaluate(() => { window.__refuserLectureCarnet = false; });
    await p.getByRole("button", { name: "أحمّل الدفتر المحفوظ" }).click();
    // Simuler un journal apparu sans que la notification soit encore reçue.
    await p.evaluate((journal) => localStorage.setItem(journal, "restauration fictive"), JOURNAL);
    await p.getByRole("button", { name: "نعم، أحمّل الدفتر" }).click();
    assert.equal(await p.locator("#txt-solo").inputValue(), "texte non sauvegardé, complété", "journal en attente : brouillon effacé");
    await p.getByRole("alert").filter({ hasText: "بقي نصّك المؤقّت" }).waitFor();
    await p.evaluate((journal) => {
      localStorage.removeItem(journal);
      window.dispatchEvent(new StorageEvent("storage", { key: journal, newValue: null }));
    }, JOURNAL);
    await p.getByRole("button", { name: "أحمّل الدفتر المحفوظ" }).click();
    await p.getByRole("button", { name: "نعم، أحمّل الدفتر" }).click();
    assert.equal(await p.locator("#txt-solo").inputValue(), "copie modifiée pendant confirmation");
    await ctx.close();

    // Tant qu'un journal existe, l'effacement isolé ne doit pas être annoncé
    // comme réussi : le rejeu pourrait sinon ressusciter les données supprimées.
    const c2 = await browser.newContext();
    await c2.setOffline(true);
    const writer = await c2.newPage();
    await writer.goto(source + "#solo");
    await writer.evaluate(({ key, journal, value }) => {
      localStorage.setItem(key, value);
      localStorage.setItem(journal, JSON.stringify({ etat: { progression: {} }, carnetBoussole: JSON.parse(value) }));
    }, { key: KEY, journal: JOURNAL, value: JSON.stringify(book("avant restauration")) });
    const reader = await c2.newPage();
    reader.setDefaultTimeout(5000);
    await reader.goto(source + "#solo");
    await reader.getByRole("alert").filter({ hasText: "استعادة غير مكتملة" }).waitFor();
    await reader.locator("#txt-solo").fill("essai temporaire");
    assert.equal(await writer.evaluate((key) => JSON.parse(localStorage.getItem(key)).solo, KEY), "avant restauration");
    await reader.getByRole("button", { name: "دفتر التجربة" }).click();
    await reader.getByRole("button", { name: "أمسح دفتر التجربة" }).click();
    await reader.getByRole("button", { name: "نعم، أمسح المسوّدات" }).click();
    assert((await reader.getByRole("status").last().innerText()).includes("تعذّر تأكيد المسح"));
    assert.equal(await writer.evaluate((key) => JSON.parse(localStorage.getItem(key)).solo, KEY), "avant restauration");
    assert.notEqual(await writer.evaluate((key) => localStorage.getItem(key), JOURNAL), null);
    await writer.evaluate(({ key, journal, value }) => {
      localStorage.setItem(key, value);
      localStorage.removeItem(journal);
    }, { key: KEY, journal: JOURNAL, value: JSON.stringify(book("copie restaurée")) });
    await reader.getByRole("alert").filter({ hasText: "تغيّر الدفتر" }).waitFor();
    assert.equal(await reader.locator("#txt-solo").inputValue(), "essai temporaire");
    await reader.getByRole("button", { name: "أحمّل الدفتر المحفوظ" }).click();
    await reader.getByRole("button", { name: "نعم، أحمّل الدفتر" }).click();
    assert.equal(await reader.locator("#txt-solo").inputValue(), "copie restaurée");
    await reader.locator("#txt-solo").fill("nouvelle saisie");
    assert.equal(await writer.evaluate((key) => JSON.parse(localStorage.getItem(key)).solo, KEY), "nouvelle saisie");
    await c2.close();

    // L'événement storage est parfois retardé. Un effacement confirmé sur une
    // ancienne copie ne doit pas supprimer le carnet modifié dans une autre page.
    const c3 = await browser.newContext();
    await c3.setOffline(true);
    const recent = await c3.newPage(), ancien = await c3.newPage();
    ancien.setDefaultTimeout(5000);
    await ancien.addInitScript(() => {
      window.addEventListener("storage", (e) => e.stopImmediatePropagation(), true);
    });
    await recent.goto(source + "#solo");
    await recent.locator('[data-id="solo-edit"]').click();
    await recent.locator("#txt-solo").fill("copie initiale");
    await ancien.goto(source + "#solo");
    assert.equal(await ancien.locator("#txt-solo").inputValue(), "copie initiale");
    await ancien.getByRole("button", { name: "دفتر التجربة" }).click();
    await ancien.getByRole("button", { name: "أمسح دفتر التجربة" }).click();
    await recent.locator("#txt-solo").fill("copie modifiée à préserver");
    await ancien.getByRole("button", { name: "نعم، أمسح المسوّدات" }).click();
    assert.equal(await recent.evaluate((key) => JSON.parse(localStorage.getItem(key)).solo, KEY), "copie modifiée à préserver");
    assert.equal(await ancien.locator("#txt-solo").inputValue(), "copie initiale");
    await ancien.getByRole("alert").filter({ hasText: "تغيّر الدفتر" }).waitFor();
    await c3.close();

    // Quand la notification arrive avant la confirmation, celle-ci doit être
    // refermée : on ne supprime pas une nouvelle copie avec l'ancien accord.
    const c4 = await browser.newContext();
    await c4.setOffline(true);
    const premiere = await c4.newPage(), seconde = await c4.newPage();
    seconde.setDefaultTimeout(5000);
    await premiere.goto(source + "#solo");
    await premiere.locator('[data-id="solo-edit"]').click();
    await premiere.locator("#txt-solo").fill("avant");
    await seconde.goto(source + "#solo");
    await seconde.getByRole("button", { name: "دفتر التجربة" }).click();
    await seconde.getByRole("button", { name: "أمسح دفتر التجربة" }).click();
    await premiere.locator("#txt-solo").fill("après");
    await seconde.getByRole("button", { name: "نعم، أمسح المسوّدات" }).waitFor({ state: "hidden" });
    assert.equal(await seconde.locator("#txt-solo").inputValue(), "après");
    assert.equal(await premiere.evaluate((key) => JSON.parse(localStorage.getItem(key)).solo, KEY), "après");
    await c4.close();

    // Même une copie visible déjà sauvegardée peut être l'ultime copie intacte
    // si l'autre onglet remplace la valeur par des octets illisibles.
    const c5 = await browser.newContext({ acceptDownloads: true });
    await c5.setOffline(true);
    const ecrivain = await c5.newPage(), lecteur = await c5.newPage();
    lecteur.setDefaultTimeout(5000);
    await ecrivain.goto(source + "#solo");
    await ecrivain.locator('[data-id="solo-edit"]').click();
    await ecrivain.locator("#txt-solo").fill("seule copie encore lisible");
    await lecteur.goto(source + "#solo");
    assert.equal(await lecteur.locator("#txt-solo").inputValue(), "seule copie encore lisible");
    await ecrivain.evaluate((key) => localStorage.setItem(key, "{carnet corrompu"), KEY);
    await lecteur.waitForFunction(() => [...document.querySelectorAll('[role="alert"]')]
      .some((e) => /تغيّر الدفتر|تعذّرت قراءة دفتر/.test(e.textContent)));
    assert.equal(await lecteur.locator("#txt-solo").inputValue(), "seule copie encore lisible", "copie lisible remplacée par un carnet de secours");
    assert.equal(await ecrivain.evaluate((key) => localStorage.getItem(key), KEY), "{carnet corrompu");
    await lecteur.evaluate((key) => {
      window.__retourValide = false;
      window.addEventListener("storage", (e) => { if (e.key === key) window.__retourValide = true; });
    }, KEY);
    await ecrivain.evaluate(({ key, valeur }) => localStorage.setItem(key, valeur), {
      key: KEY, valeur: JSON.stringify(book("autre copie réparée")),
    });
    await lecteur.waitForFunction(() => window.__retourValide);
    assert.equal(await lecteur.locator("#txt-solo").inputValue(), "seule copie encore lisible", "copie préservée remplacée sans confirmation");
    await lecteur.getByRole("button", { name: "دفتر التجربة" }).click();
    const [sauvetage] = await Promise.all([
      lecteur.waitForEvent("download"), lecteur.getByRole("button", { name: "أنزّل مسوّدتي" }).click(),
    ]);
    assert(fs.readFileSync(await sauvetage.path(), "utf8").includes("seule copie encore lisible"));
    assert.equal(await ecrivain.evaluate((key) => JSON.parse(localStorage.getItem(key)).solo, KEY), "autre copie réparée");
    await c5.close();
    console.log("PASS stockage du laboratoire : écriture refusée, conflit inter-onglets, effacement périmé et restauration interrompue.");
  } finally {
    await browser.close();
  }
})().catch((e) => { console.error(e); process.exitCode = 1; });
