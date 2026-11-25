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
    await tab("البوصلة").click();
    const frame = p.frameLocator('iframe[data-boussole="labo"]');
    await frame.locator(".case-nerve").waitFor();
    const id = (s) => frame.locator('[data-id="' + s + '"]');
    a.equal(await nav.getByRole("button").count(), 5);
    a.equal(await tab("البوصلة").getAttribute("aria-current"), "page");
    a.equal(
      await p.locator("iframe").getAttribute("src"),
      "/boussole/index.html",
    );
    results.push(
      "5 onglets ; la place de Miftah ouvre directement le laboratoire de la même application.",
    );
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
    await dlg.frameLocator("iframe").locator(".case-nerve").waitFor();
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
      "Aide remplacée par la vraie Boussole ; même exercice, même zone, même réponse et focus restauré.",
    );
    await tab("مساري").click();
    await tab("تدريبات").click();
    await p.getByRole("button", { name: /تمارين المنهجية/ }).click();
    await p
      .getByRole("heading", { name: "أربع مستويات نحو الاستقلال" })
      .waitFor();
    await p.getByRole("button", { name: "رجوع", exact: true }).click();
    await tab("أنا").click();
    await tab("البوصلة").click();
    await id("atlas-paper").click();
    await id("solo-edit").click();
    await frame.locator("#txt-solo").fill("ملاحظة محليّة");
    await tab("اليوم").click();
    await tab("البوصلة").click();
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
    await tab("البوصلة").click();
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
      "Vraie coupure réseau Chromium après téléchargement PWA complet : réouverture via l’onglet, interaction et lecture PDF.",
    );
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
