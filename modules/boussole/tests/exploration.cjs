const fs = require("node:fs"),
  os = require("node:os"),
  path = require("node:path"),
  { pathToFileURL } = require("node:url"),
  assert = require("node:assert/strict"),
  launch = require("../scripts/browser.cjs");
const source =
    process.env.TEST_URL ||
    pathToFileURL(path.resolve(__dirname, "../../../public/boussole/index.html")).href,
  output =
    process.env.QA_DIR || path.join(os.tmpdir(), "boussole-curiosite-controle");
fs.mkdirSync(output, { recursive: true });
const hosted = source.startsWith("http"),
  key = "boussole.bac.classe16.carnet.1",
  old = "boussole.bac.entree14b.carnet.1";
(async () => {
  const b = await launch(),
    checks = [],
    scans = [],
    outside = [],
    errors = [],
    sizes = [];
  try {
    const ctx = await b.newContext({
      locale: "ar-DZ",
      viewport: { width: 390, height: 844 },
      hasTouch: true,
      reducedMotion: "reduce",
    });
    await ctx.addInitScript(
      ({ old }) => {
        try {
          localStorage.setItem(old, "témoin-intact");
        } catch {}
      },
      { old },
    );
    if (!hosted) await ctx.setOffline(true);
    const p = await ctx.newPage();
    p.setDefaultTimeout(6500);
    p.on("pageerror", (e) => errors.push(String(e)));
    p.on("request", (r) => {
      try {
        let u = new URL(r.url());
        if (
          u.protocol.startsWith("http") &&
          (!hosted || u.origin !== new URL(source).origin)
        )
          outside.push(u.href);
      } catch {}
    });
    const d = (x) => p.locator(`[data-id="${x}"]`),
      area = p.locator(".screen");
    const fresh = async (hash = "") => {
      await p.goto(source + hash);
      await p.locator(".atlas-header").waitFor();
      await p.evaluate(() => document.fonts.ready);
    };
    const check = (s) => checks.push(s),
      eq = assert.equal;
    async function scan(name) {
      await p.addScriptTag({
        path: process.env.AXE_FILE || require.resolve("axe-core/axe.min.js"),
      });
      const r = await p.evaluate(async () => {
        let r = await axe.run(".screen", {
          runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
        });
        return {
          violations: r.violations.map((x) => [
            x.id,
            x.nodes.map((y) => [y.target, y.failureSummary]),
          ]),
          incomplete: r.incomplete.map((x) => x.id),
        };
      });
      scans.push({ name, ...r });
      if (r.violations.length)
        console.error("AXE", name, JSON.stringify(r.violations));
    }
    await fresh();
    eq(await p.locator("html").getAttribute("dir"), "rtl");
    eq(await d("resume").count(), 0);
    eq(await p.locator(".atlas-shell textarea").count(), 0);
    eq(await p.locator(".method-repere li").count(), 4);
    for (const step of ["فعل", "دليل", "جواب", "فحص"])
      assert((await p.locator(".method-repere").innerText()).includes(step));
    check("Accueil sans compte, clavier ni brouillon fictif ; quatre repères de méthode explicites.");
    for (const [width, height] of [
      [320, 568],
      [360, 640],
      [390, 844],
      [768, 960],
      [1280, 850],
    ]) {
      await p.setViewportSize({ width, height });
      const dims = await p.evaluate(() => ({
        page: document.documentElement.scrollWidth,
        bottom: Math.ceil(
          document.querySelector('[data-id="cond-1"]').getBoundingClientRect()
            .bottom,
        ),
        touch: [
          ...document.querySelectorAll(".case-index a,.condition-bar button"),
        ].map((e) => Math.min(e.offsetHeight, e.offsetWidth)),
      }));
      assert(dims.page <= width, JSON.stringify(dims));
      assert(dims.bottom <= height);
      assert(dims.touch.every((n) => n >= 44));
      sizes.push({ width, height, ...dims });
      if ([320, 390, 1280].includes(width))
        await p.screenshot({
          path: path.join(output, "accueil-" + width + ".png"),
        });
    }
    check(
      "Cinq tailles : premier changement de condition visible, aucune page débordante, commandes d’au moins 44 px.",
    );
    await p.setViewportSize({ width: 390, height: 844 });
    await scan("accueil");
    for (const [id, good, expected, route] of [
      ["nerve", 1, null, "#doc1-traces"],
      ["enzyme", 0, ["1", "4"], "#warm"],
      ["immunity", 1, ["2", "9"], "#solo"],
      ["protein", 0, ["10%", "20%"], "#protein-doc"],
    ]) {
      await d("case-" + id).click();
      await p.locator(".case-" + id).waitFor();
      eq(await p.locator(".lab-sample").count(), 1);
      eq(await p.locator(".interpret").count(), 0);
      eq(await d("source-path").getAttribute("href"), route);
      if (id === "nerve") {
        await d("reveal-second").focus();
        await p.keyboard.press("Enter");
      } else {
        await d("cond-1").focus();
        await p.keyboard.press("Space");
      }
      await d("thought-0").waitFor();
      eq(await p.locator(".lab-sample").count(), 2);
      if (expected)
        assert.deepEqual(
          await p.locator(".quantity strong").allTextContents(),
          expected,
        );
      else {
        assert(
          (await p.locator(".samples img").nth(0).getAttribute("src")) !==
            (await p.locator(".samples img").nth(1).getAttribute("src")),
        );
        await p.waitForFunction(() =>
          document.activeElement?.matches(".readout"),
        );
      }
      check(id + ": deux preuves correspondant aux deux conditions.");
      await d("thought-" + (1 - good)).click();
      await p.locator(".revisit").waitFor();
      await d("thought-" + good).click();
      await p.locator(".grounded").waitFor();
      eq(
        await p.locator('.lab-progress [aria-current="step"]').textContent(),
        "أستدلّ",
      );
      await d("cond-0").click();
      eq(await p.locator(".lab-sample").count(), 2);
      check(
        id +
          ": hypothèse révisable et justification, sans verrou sur le document.",
      );
      if (id === "nerve") {
        await scan("comparaison et justification");
        await p.screenshot({
          path: path.join(output, "deux-traces.png"),
          fullPage: true,
        });
      }
      await d("source-path").click();
      if (id === "nerve") {
        await p.waitForFunction(
          () => document.activeElement.id === "source-traces",
        );
        eq(await area.locator(".traces img").count(), 12);
      } else if (id === "enzyme") {
        await d("point-9").click();
        await p.locator(".afterread").waitFor();
      } else if (id === "protein") {
        eq(await d("protein-reference").count(), 0);
        await d("self-check-protein").locator("summary").click();
        eq(await d("self-check-protein").locator('input[type="checkbox"]').count(), 3);
        await d("protein-compare").click(); // le parcours papier ne dépend pas des cases
        await d("protein-reference").waitFor();
      } else {
        await d("solo-compare").waitFor();
        eq(await d("solo-ref").count(), 0);
        eq(await area.locator("textarea").count(), 0);
        await d("self-check-solo").locator("summary").click();
        eq(await d("self-check-solo").locator('input[type="checkbox"]').count(), 3);
        const tick = d("self-check-solo").locator('input[type="checkbox"]').first();
        await tick.focus();
        await p.keyboard.press("Space");
        eq(await tick.isChecked(), true);
        eq(await d("solo-ref").count(), 0);
        await scan("critères d'auto-relecture");
        await d("solo-compare").click();
        await d("solo-ref").waitFor();
      }
      await p.locator(".atlas-brand").click();
      await p.locator(".case-" + id).waitFor();
      await p.locator(".grounded").waitFor();
      check(
        id + ": destination scientifique et retour au même dossier de séance.",
      );
    }
    await d("another").click();
    await p.locator(".case-nerve").waitFor();
    await p.waitForFunction(() => document.activeElement.id === "case-title");
    check(
      "Autre énigme au choix : navigation et focus sur la question, sans déclenchement automatique.",
    );
    await d("share").click();
    const sh = await p.locator("#share-q").inputValue();
    assert(sh.includes("واش تلاحظ"));
    assert(
      !sh.includes("file:") &&
        !sh.includes("draft") &&
        !sh.includes("localhost"),
    );
    assert((await p.locator("#share-q").getAttribute("readonly")) !== null);
    await p.evaluate(() =>
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: { writeText: () => Promise.reject(Error("blocked")) },
      }),
    );
    await p.getByRole("button", { name: "أنسخ السؤال" }).click();
    await p.waitForFunction(
      () =>
        document.activeElement.id === "share-q" &&
        document.activeElement.selectionEnd ===
          document.activeElement.value.length,
    );
    check(
      "Partage sans permission presse-papiers : texte sélectionné, copie manuelle possible.",
    );
    await d("share").click();
    eq(await p.evaluate((key) => localStorage.getItem(key), key), null);
    check(
      "Aucun enregistrement local ni reprise après exploration, proposition ou partage du seul défi.",
    );
    await fresh("#answer");
    await area.getByRole("button", { name: "أكتب هنا بدل الورق" }).click();
    await p.locator("#txt-inhibit").fill("فكرة شخصية ١٢");
    await area
      .getByRole("link", { name: "أراجع الشكل ب من الوثيقة 2" })
      .click();
    await p.waitForFunction(() => document.activeElement.id === "source-b");
    await p.evaluate(() =>
      Promise.all(
        Array.from(document.images).map((i) => i.decode().catch(() => {})),
      ),
    );
    assert(
      await p.locator("#source-b").evaluate((el) => {
        let r = el.getBoundingClientRect();
        return r.top >= -1 && r.top < innerHeight / 3;
      }),
      "figure B offscreen",
    );
    await p
      .locator(".screen .mechanism .largepic")
      .getByRole("button", { name: /تكبير الرسم/ })
      .click();
    await p
      .locator("dialog[open]")
      .getByRole("button", { name: "تكبير للتفاصيل" })
      .click();
    await p.locator("dialog[open] .pan.enlarged").waitFor();
    await p
      .locator("dialog[open]")
      .getByRole("button", { name: "إغلاق" })
      .click();
    await p.locator('.screen a[href="#answer-inhibit"]').click();
    await p.waitForFunction(() => document.activeElement.id === "txt-inhibit");
    eq(await p.locator("#txt-inhibit").inputValue(), "فكرة شخصية ١٢");
    eq(await d("bac-ref").count(), 0);
    check(
      "Consigne 3 → figure ب visible, zoom → retour au texte exact, sans ouvrir la comparaison.",
    );
    await p.locator(".atlas-brand").click();
    await d("resume").waitFor();
    await d("resume").click();
    await p.waitForFunction(() => document.activeElement.id === "txt-inhibit");
    await p.locator("#txt-inhibit").fill("");
    await p.locator(".atlas-brand").click();
    await p.locator(".atlas-shell").waitFor();
    eq(await d("resume").count(), 0);
    eq(
      await p.evaluate((old) => localStorage.getItem(old), old),
      "témoin-intact",
    );
    check(
      "Vraie écriture seulement, reprise et suppression dans un carnet isolé de 1.4 B.",
    );
    await fresh("#doc2-fig-a");
    await p.waitForFunction(() => document.activeElement.id === "source-a");
    await p.locator('.screen a[href="#answer-events"]').click();
    await p.waitForFunction(() => document.activeElement.id === "ans-events");
    await d("self-check-bac").locator("summary").click();
    eq(await d("self-check-bac").locator('input[type="checkbox"]').count(), 4);
    eq(await d("bac-ref").count(), 0);
    await scan("critères du dossier Bac");
    await d("bac-compare").click();
    await d("bac-ref").waitFor();
    eq(await area.locator(".reviewpart").count(), 3);
    check(
      "Chemin papier sans texte : critères spécifiques avant comparaison volontaire, sans blocage ni note.",
    );
    for (const id of ["nerve", "enzyme", "immunity", "protein"]) {
      await p.setViewportSize({ width: 320, height: 568 });
      await fresh("#explore-" + id);
      await p.locator(".case-" + id).waitFor();
      await p.evaluate(() => scrollTo(0, 0));
      assert(
        await d("cond-1").evaluate(
          (e) => e.getBoundingClientRect().bottom <= innerHeight,
        ),
        "condition below fold: " + id,
      );
    }
    check(
      "Sur 320 × 568, action accessible au premier écran dans les quatre dossiers.",
    );
    await fresh("#explore-immunity");
    await p.reload();
    await p.locator(".case-immunity").waitFor();
    eq(await p.locator(".lab-sample").count(), 1);
    await p.setViewportSize({ width: 320, height: 568 });
    await p.addStyleTag({ content: "html{font-size:200%!important}" });
    assert(
      await p.evaluate(() => document.documentElement.scrollWidth <= 320),
      "overflow at 200%",
    );
    check(
      "Lien de dossier direct, session non persistante, texte agrandi à 200 % sans débordement horizontal.",
    );
    await p.evaluate((key) => localStorage.setItem(key, "{carnet-corrompu"), key);
    await fresh("#solo");
    await p.reload(); // même URL avec un autre hash ne recharge pas le document
    await p.getByRole("alert").waitFor();
    await d("solo-edit").click();
    await p.locator("#txt-solo").fill("texte temporaire");
    eq(await p.evaluate((key) => localStorage.getItem(key), key), "{carnet-corrompu");
    await p.getByRole("button", { name: "دفتر التجربة" }).click();
    await p.getByRole("button", { name: "أمسح دفتر التجربة" }).click();
    await p.getByRole("button", { name: "نعم، أمسح المسوّدات" }).click();
    eq(await p.evaluate((key) => localStorage.getItem(key), key), null);
    check("Carnet illisible protégé de l'écrasement ; suppression uniquement après confirmation.");
    const e = await ctx.newPage();
    await e.setContent(
      '<html><body><iframe title="Atelier" sandbox="allow-scripts"></iframe></body></html>',
    );
    await e.locator("iframe").evaluate(
      (el, s) => {
        el.srcdoc = s;
      },
      fs.readFileSync(path.resolve(__dirname, "../../../public/boussole/index.html"), "utf8"),
    );
    const frame = e.frameLocator("iframe");
    await frame.locator('[data-id="case-enzyme"]').click();
    await frame.locator(".case-enzyme").waitFor();
    await frame.locator('[data-id="cond-1"]').click();
    await frame.locator('[data-id="thought-0"]').click();
    await frame.locator('[data-id="atlas-paper"]').click();
    await frame.locator('[data-id="solo-edit"]').click();
    await frame.locator("#txt-solo").fill("جواب مؤقت");
    await frame.locator(".atlas-brand").click();
    await frame.locator('[data-id="resume"]').click();
    eq(await frame.locator("#txt-solo").inputValue(), "جواب مؤقت");
    assert(e.url() === "about:blank");
    check(
      "Aperçu en iframe isolée : navigation interne et brouillon de séance sans stockage.",
    );
    await e.close();
    assert.deepEqual(errors, []);
    assert.deepEqual(outside, []);
    const report = {
      build: "1.6.0",
      mode: hosted ? "hosted" : "file-offline",
      browser: b.version(),
      checks,
      sizes,
      scans,
      outside,
      errors,
    };
    fs.writeFileSync(
      path.join(output, "resultats.json"),
      JSON.stringify(report, null, 2) + "\n",
    );
    assert(
      scans.every((s) => !s.violations.length),
      "accessibility violations",
    );
    console.log(
      `PASS ${checks.length} contrôles, ${scans.length} scans, ${sizes.length} tailles (${report.mode}).`,
    );
  } finally {
    // Closing the browser also tears down the context, without a second close round-trip.
    await b.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
