/* Smoke test local de l'application réellement compilée. Aucun appel de compte ou de base distante. */
const launch = require("../scripts/browser.cjs"),
  a = require("node:assert/strict"),
  fs = require("node:fs"),
  path = require("node:path"),
  crypto = require("node:crypto");
const origin = process.env.APP_URL || "http://127.0.0.1:4182",
  output =
    process.env.QA_DIR ||
    require("node:os").tmpdir() + "/boussole-integration-ui";
if (!["127.0.0.1", "localhost"].includes(new URL(origin).hostname))
  throw Error(
    "Ce scénario utilise un profil de test local et se lance uniquement sur le build local.",
  );
fs.mkdirSync(output, { recursive: true });
const sum = (b) => crypto.createHash("sha256").update(b).digest("hex");
(async () => {
  const browser = await launch(),
    results = [],
    sizes = [],
    errors = [],
    outgoing = [];
  let p;
  try {
    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      locale: "ar-DZ",
      hasTouch: true,
      acceptDownloads: true,
    });
    await ctx.addInitScript(() => {
      if (
        window.top !== window ||
        (location.pathname !== "/" && location.pathname !== "/index.html") ||
        localStorage.getItem("murajih_svt_v1")
      )
        return;
      const email = "demo@example.invalid";
      sessionStorage.setItem("kunz_demarrage", "1");
      sessionStorage.setItem("kunz_session_v1", email);
      localStorage.setItem(
        "murajih_svt_v1",
        JSON.stringify({
          compte: {
            email,
            wilaya: "31",
            daira: "وهران",
            creeLe: "2026-01-01",
            jeton: "fixture-locale",
          },
          consentementSync: false,
          consentementSyncDecideLe: "2026-01-01",
          diagnosticDecideLe: "2026-01-01",
          favoris: ["temoin-intact"],
        }),
      );
    });
    p = await ctx.newPage();
    p.setDefaultTimeout(8000);
    p.on("pageerror", (e) => errors.push(e.message));
    ctx.on("request", (r) => {
      if (
        /^https?:/.test(r.url()) &&
        (new URL(r.url()).origin !== origin ||
          !["GET", "HEAD"].includes(r.method()))
      )
        outgoing.push([r.method(), r.url()]);
    });
    await p.goto(origin + "/");
    const nav = p.getByRole("navigation").last();
    const tab = (x) => nav.getByRole("button", { name: x, exact: true });
    // La méthodologie n'est plus un onglet : c'est un sous-écran du الباك.
    const ouvrirBoussole = async () => {
      await tab("الباك").click();
      await p.getByRole("button", { name: "راجع", exact: true }).click();
    };
    // Depuis la v0.10 la barre a QUATRE portes (مساري · كويست · الباك · أنا) :
    // la méthodologie n'est plus un onglet mais un sous-écran du الباك.
    a.equal(await nav.getByRole("button").count(), 4);
    await tab("الباك").click();
    a.equal(await tab("الباك").getAttribute("aria-current"), "page");
    await p.getByRole("button", { name: "راجع", exact: true }).click();
    const frame = p.frameLocator('iframe[data-boussole="labo"]');
    await frame.locator(".case-nerve").waitFor();
    const id = (s) => frame.locator('[data-id="' + s + '"]');
    a.equal(
      await p.locator("iframe").getAttribute("src"),
      "/boussole/index.html",
    );
    results.push(
      "4 portes ; la méthodologie (sous-écran du الباك) ouvre directement le laboratoire de la même application.",
    );
    const accountMenu = p.getByRole("button", { name: "نقاط الخبرة وأيام النشاط" });
    await accountMenu.click();
    a((await p.locator("body").innerText()).includes("الخروج لا يمسح مسوّدات البوصلة"));
    await accountMenu.click();
    for (const [width, height] of [
      [320, 568],
      [390, 844],
      [1024, 800],
    ]) {
      await p.setViewportSize({ width, height });
      const geo = await p.evaluate(() => {
        const f = document.querySelector("iframe"),
          b = f.getBoundingClientRect(),
          cond = f.contentDocument
            .querySelector('[data-id="cond-1"]')
            .getBoundingClientRect();
        return {
          parentW: document.documentElement.scrollWidth,
          frameW: f.contentDocument.documentElement.scrollWidth,
          frameH: b.height,
          frameViewport: f.contentWindow.innerWidth,
          firstAction: Math.ceil(cond.bottom),
          bottom: Math.ceil(b.bottom),
          navTop: document.querySelector("nav.fixed").getBoundingClientRect()
            .top,
        };
      });
      a(
        geo.parentW <= width && geo.frameW <= geo.frameViewport,
        JSON.stringify(geo),
      );
      a(geo.bottom <= geo.navTop + 1);
      if (width === 390) a(geo.firstAction <= geo.frameH);
      sizes.push({ width, height, ...geo });
      if (width === 390)
        await p.screenshot({
          path: path.join(output, "onglet-boussole-390.png"),
        });
    }
    await p.setViewportSize({ width: 390, height: 844 });
    await id("cond-1").click();
    await id("thought-1").click();
    await id("reason").waitFor();
    await id("source-path").click();
    await frame.locator(".screen .injection summary").click();
    const inj = frame.locator(".screen .injection");
    await inj.getByRole("button", { name: "حقن غابا", exact: true }).click();
    a((await id("pair-feedback").innerText()).includes("متعاكسان"));
    await inj
      .getByRole("button", { name: "حقن الغلوتامات", exact: true })
      .click();
    a((await id("pair-feedback").innerText()).includes("الغلوتامات"));
    await inj.getByRole("button", { name: "تنبيه ع2" }).click();
    await inj.getByRole("button", { name: "حقن غابا", exact: true }).click();
    a((await id("pair-feedback").innerText()).includes("التثبيطي"));
    results.push(
      "À ج3, stimulation puis injection : trois vérifications, dont une paire discordante, sur les traces originales.",
    );
    await id("tab-doc2").click();
    const ns = frame.locator(".screen .orig-symbols");
    await ns.nth(1).waitFor();
    a.equal(await ns.count(), 2);
    a.equal(await ns.nth(1).getAttribute("open"), null);
    await ns.nth(1).locator("summary").click();
    const sym = await ns.nth(1).innerText();
    for (const k of ["Ca²⁺", "Cl⁻", "GABA"]) a(sym.includes(k), k);
    results.push(
      "Notation authentique repliée par défaut ; ions et GABA disponibles à côté de la figure.",
    );
    await frame.locator(".atlas-brand").click();
    await id("case-protein").click();
    await id("cond-1").click();
    await id("source-path").click();
    a.equal(await id("protein-reference").count(), 0);
    await id("protein-compare").click();
    a((await id("protein-reference").innerText()).includes("20٪"));
    results.push(
      "Laminine : figure recadrée, vrai passage à l’écrit et modèle seulement sur demande.",
    );
    await p.getByRole("button", { name: "تمارين المنهجية الأخرى" }).click();
    await p.getByRole("button", { name: "مستويات التدريب الأربعة" }).click();
    await p.getByRole("button", { name: /تركيب البروتين · 10 تمارين/ }).click();
    await p.locator("main article button").first().click();
    await p.locator("main .grid.grid-cols-2 button").first().click();
    const ev = p.getByText(/الدليل المحدد: المنطقة/);
    const before = await ev.innerText();
    const choices = p
      .locator("main .grid.gap-2")
      .filter({ has: p.locator("button.rounded-2xl") })
      .last();
    const ans = choices.locator("button").nth(1);
    await ans.click();
    const css = await ans.getAttribute("class");
    for (let i = 0; i < 3; i++)
      await p.getByRole("button", { name: /التلميح ·/ }).click();
    const help = p.getByRole("button", {
      name: "أفتح البوصلة وأعود إلى تمريني",
    });
    await help.click();
    const dlg = p.getByRole("dialog", { name: "البوصلة داخل التمرين" });
    await dlg.frameLocator("iframe").locator(".case-protein").waitFor();
    a((await dlg.innerText()).includes("ليس حلّ تمرينك"));
    a((await dlg.innerText()).includes("الفعل"));
    await p.setViewportSize({ width: 320, height: 568 });
    const modal = await dlg.evaluate((el) => {
      const box = el.getBoundingClientRect(), f = el.querySelector("iframe"), fb = f.getBoundingClientRect();
      return { right: box.right, bottom: box.bottom, frameH: fb.height,
        frameW: f.contentDocument.documentElement.scrollWidth, viewport: f.contentWindow.innerWidth };
    });
    a(modal.right <= 321 && modal.bottom <= 569 && modal.frameH >= 100 && modal.frameW <= modal.viewport, JSON.stringify(modal));
    await p.screenshot({ path: path.join(output, "aide-contextuelle-320.png") });
    await p.setViewportSize({ width: 390, height: 844 });
    await dlg.getByRole("button", { name: "أعود إلى تمريني" }).click();
    await dlg.waitFor({ state: "detached" });
    a.equal(await ev.innerText(), before);
    a.equal(await ans.getAttribute("class"), css);
    await p.waitForFunction(
      () =>
        document.activeElement?.textContent.includes(
          "أفتح البوصلة وأعود إلى تمريني",
        ) && document.activeElement.tagName === "BUTTON",
    );
    results.push(
      "Aide contextualisée sur un autre exemple de protéines ; même exercice, zone, réponse et focus restaurés.",
    );
    await tab("مساري").click();
    await ouvrirBoussole();
    // Le sous-écran méthodologie garde son accueil et ses exercices guidés.
    await p.getByRole("button", { name: "تمارين المنهجية الأخرى" }).waitFor();
    await tab("أنا").click();
    await ouvrirBoussole();
    await id("atlas-paper").click();
    await id("solo-edit").click();
    await frame.locator("#txt-solo").fill("ملاحظة محليّة");
    await tab("كويست").click();
    await ouvrirBoussole();
    await id("resume").click();
    a.equal(await frame.locator("#txt-solo").inputValue(), "ملاحظة محليّة");
    a.deepEqual(
      await p.evaluate(
        () => JSON.parse(localStorage.getItem("murajih_svt_v1")).favoris,
      ),
      ["temoin-intact"],
    );
    results.push(
      "Navigation et retour, carnet indépendant du favori témoin de Lite ; accès des entraînements inchangé.",
    );
    await frame.locator(".atlas-brand").click();
    await frame.locator(".class-resources summary").click();
    const files = frame.locator(".class-resources");
    for (const name of ["cahier-bac-2022.pdf", "memo.pdf"]) {
      a.equal(await files.locator('a[href="./' + name + '"]').count(), 1);
      const res = await p.request.get(origin + "/boussole/" + name);
      a.equal(res.status(), 200);
      a(res.headers()["content-type"].includes("application/pdf"));
      a.equal((await res.body()).subarray(0, 5).toString(), "%PDF-");
    }
    const [download] = await Promise.all([
      p.waitForEvent("download"),
      files.locator("a[download]").click(),
    ]);
    const h = sum(fs.readFileSync(await download.path()));
    a.equal(
      h,
      sum(
        fs.readFileSync(
          path.resolve(__dirname, "../../../public/boussole/index.html"),
        ),
      ),
    );
    results.push(
      "Deux PDF sans ZIP et téléchargement du vrai HTML autonome (empreinte égale).",
    );
    // Sauvegarde réellement téléchargée depuis l'interface, puis restauration.
    await tab("أنا").click();
    const [backupDownload] = await Promise.all([
      p.waitForEvent("download"),
      p.getByRole("button", { name: "تصدير نسختي" }).click(),
    ]);
    const backup = JSON.parse(fs.readFileSync(await backupDownload.path(), "utf8"));
    a.equal(backup.carnetBoussole.solo, "ملاحظة محليّة");
    a.equal(backup.etat.compte, undefined);
    a(!JSON.stringify(backup).includes("fixture-locale"));
    await ouvrirBoussole();
    await id("resume").click();
    await frame.locator("#txt-solo").fill("نسخة مختلفة");
    await tab("أنا").click();
    // Un second onglet de l'application ne doit pas réécrire son ancien état
    // après l'import engagé dans le premier.
    const otherApp = await ctx.newPage();
    await otherApp.addInitScript(() => {
      sessionStorage.setItem("kunz_demarrage", "1");
      sessionStorage.setItem("kunz_session_v1", "demo@example.invalid");
    });
    await otherApp.goto(origin + "/");
    await otherApp.getByRole("button", { name: "نقاط الخبرة وأيام النشاط" }).waitFor();
    await p.locator('input[type="file"]').setInputFiles({
      name: "backup.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(backup)),
    });
    await p.getByRole("button", { name: "نعم، استورد النسخة" }).click();
    await p.waitForFunction(() => JSON.parse(localStorage.getItem("boussole.bac.classe16.carnet.1")).solo === "ملاحظة محليّة");
    a.equal(await p.evaluate(() => JSON.parse(localStorage.getItem("murajih_svt_v1")).compte.jeton), "fixture-locale");
    await otherApp.getByRole("heading", { name: "توقّف هذا التبويب لحماية بياناتك" }).waitFor();
    a((await otherApp.getByRole("alert").innerText()).includes("تبويب آخر"));
    a.equal(await otherApp.getByRole("navigation").count(), 0);
    await otherApp.close();
    // Une ancienne sauvegarde sans ce champ ne remplace pas le brouillon local.
    const legacy = { ...backup, etat: { ...backup.etat, nom: "ancien fichier" } };
    delete legacy.carnetBoussole;
    await p.locator('input[type="file"]').setInputFiles({
      name: "ancien.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(legacy)),
    });
    await p.getByRole("button", { name: "نعم، استورد النسخة" }).click();
    await p.waitForFunction(() => JSON.parse(localStorage.getItem("murajih_svt_v1")).nom === "ancien fichier");
    a.equal(await p.evaluate(() => JSON.parse(localStorage.getItem("boussole.bac.classe16.carnet.1")).solo), "ملاحظة محليّة");
    results.push("Export JSON réel et réimport : texte et identité locale conservés ; ancien format non destructif.");
    // Un autre document de la même origine reçoit l'effacement via l'événement storage.
    const second = await ctx.newPage();
    await second.goto(origin + "/boussole/index.html#solo");
    a.equal(await second.locator("#txt-solo").inputValue(), "ملاحظة محليّة");
    await p.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
    const report = await p.evaluate(
      () =>
        new Promise((resolve) => {
          const c = new MessageChannel();
          c.port1.onmessage = (e) => resolve(e.data);
          navigator.serviceWorker.controller.postMessage(
            { type: "TELECHARGER_HORS_LIGNE" },
            [c.port2],
          );
        }),
    );
    a.equal(report.ok, true);
    a.equal(report.manquants, 0);
    await ctx.setOffline(true);
    await p.reload();
    await ouvrirBoussole();
    await id("case-enzyme").click();
    await id("cond-1").click();
    await id("thought-0").click();
    await frame.locator(".grounded").waitFor();
    const pdf = await p.evaluate(async () => {
      const r = await fetch("/boussole/memo.pdf", {
        headers: { Range: "bytes=0-1023" },
      });
      return [r.status, (await r.text()).slice(0, 5)];
    });
    a.equal(pdf[1], "%PDF-");
    results.push(
      "Coupure réseau Chromium après téléchargement PWA complet : réouverture via l’onglet, interaction et accès au PDF en cache.",
    );
    await tab("أنا").click();
    await p.getByRole("button", { name: "مسح كل بياناتي" }).click();
    await p.getByRole("button", { name: "نعم، امسح كل شيء" }).click();
    await p.waitForFunction(() => localStorage.getItem("boussole.bac.classe16.carnet.1") === null && localStorage.getItem("murajih_restauration_v1") === null);
    await second.waitForFunction(() => document.querySelector("#txt-solo")?.value === "");
    a.equal(await second.evaluate(() => localStorage.getItem("boussole.bac.classe16.carnet.1")), null);
    await second.close();
    await p.getByRole("heading", { name: "أنشئ حسابك" }).waitFor();
    a.equal(await p.getByRole("navigation").count(), 0);
    a.equal(await p.getByRole("button", { name: "نقاط الخبرة وأيام النشاط" }).count(), 0);
    results.push("Réinitialisation hors ligne : carnet et journal supprimés, autre document averti, champ vidé et navigation masquée après déconnexion.");
    // Un journal illisible n'est plus supprimé silencieusement. L'abandon reste
    // une action distincte et confirmée, sans effacer l'état existant.
    const recovery = await browser.newContext();
    await recovery.addInitScript(() => {
      if (window.top !== window || sessionStorage.getItem("recovery-seeded")) return;
      sessionStorage.setItem("recovery-seeded", "1");
      sessionStorage.setItem("kunz_demarrage", "1");
      sessionStorage.setItem("kunz_session_v1", "recovery@example.invalid");
      localStorage.setItem("murajih_svt_v1", JSON.stringify({
        compte: { email: "recovery@example.invalid", wilaya: "31", daira: "وهران", creeLe: "2026-01-01", jeton: "fixture" },
        progression: {}, favoris: ["conserver"], consentementSync: false,
        consentementSyncDecideLe: "2026-01-01", diagnosticDecideLe: "2026-01-01",
      }));
      localStorage.setItem("murajih_restauration_v1", "{journal illisible");
    });
    const r = await recovery.newPage();
    await r.goto(origin + "/");
    await r.getByRole("heading", { name: "توقّف هذا التبويب لحماية بياناتك" }).waitFor();
    a.equal(await r.evaluate(() => localStorage.getItem("murajih_restauration_v1")), "{journal illisible");
    await r.getByRole("button", { name: "الاستعادة لا تعمل؟ خيارات متقدّمة" }).click();
    a((await r.locator("main").innerText()).includes("قد يترك البيانات الحالية غير مكتملة"));
    await r.getByRole("button", { name: "نعم، أتخلّى عن الاستعادة" }).click();
    await r.getByRole("button", { name: "نقاط الخبرة وأيام النشاط" }).waitFor();
    a.equal(await r.evaluate(() => localStorage.getItem("murajih_restauration_v1")), null);
    a.deepEqual(await r.evaluate(() => JSON.parse(localStorage.getItem("murajih_svt_v1")).favoris), ["conserver"]);
    await recovery.close();
    results.push("Journal illisible conservé, écran de reprise et abandon explicite sans effacement de l'état courant.");
    a.deepEqual(errors, []);
    a.deepEqual(outgoing, []);
    fs.writeFileSync(
      path.join(output, "integration.json"),
      JSON.stringify(
        {
          mode: "application compilée locale",
          results,
          sizes,
          offlineManifest: report,
          errors,
          outgoing,
        },
        null,
        2,
      ),
    );
    console.log(
      "PASS intégré :",
      results.length,
      "parcours ; tailles",
      sizes,
      "PWA",
      report.total,
    );
  } catch (e) {
    if (p) {
      console.error(
        "DERNIER ÉCRAN",
        (
          await p
            .locator("body")
            .innerText()
            .catch(() => "")
        ).slice(-1000),
      );
    }
    throw e;
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
