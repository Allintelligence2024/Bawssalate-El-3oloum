/* Phase 1 — onboarding : parcours juste/faux, correction, preuves, roadmap d'alors. */
import { charger, assert } from "./harness.mjs";

const { B, window, doc, $, $$, click, txt, erreurs } = await charger();

console.log("=== boot");
assert(!!B && !!B.Etat, "namespace chargé");
assert(!!$(".intro__titre"), "écran d'intro rendu");
assert(B.Etat.get().onboarding.fait === false, "onboarding non fait");
assert(!JSON.stringify(B.Etat.get()).includes("noteMin"), "aucune note prédite");

console.log("=== son depuis l'en-tête");
const sonEntete = $("[data-son]");
const avantEntete = sonEntete.getAttribute("aria-pressed");
click(sonEntete);
assert($("[data-son]").getAttribute("aria-pressed") !== avantEntete, "bouton son de l'en-tête bascule");
assert(!!$(".intro__titre"), "l'intro survit au re-rendu");
click($("[data-son]"));

console.log("=== manche 1");
click('[data-action="commencer"]');
assert(!!$("[data-consigne]"), "manche 1 affichée");
assert($$("[data-option]").length === 3, "3 options");
click($$("[data-option]")[1]);
assert(!!$("[data-retour]"), "retour affiché après erreur");
assert(B.Etat.get().onboarding.preuves.length === 0, "aucune preuve sur erreur");
assert(B.Etat.get().events.length === 0, "aucun événement sur simple erreur");
click("[data-option='a']");
assert(B.Etat.get().onboarding.preuves.includes("د1"), "preuve د1 collectée");
assert(B.Etat.get().xp === 6, "XP 6 après seconde tentative");
assert(B.Etat.get().events.length === 1, "1 événement d'essai");
assert(B.Etat.get().events[0].schema === "learning.attempt.completed/v1", "schéma v1");

console.log("=== manche 2");
click('[data-action="suivant"]');
assert(doc.body.textContent.includes("أي استنتاج صحيح"), "manche 2 affichée");
click("[data-option='a']");
assert(B.Etat.get().onboarding.preuves.includes("د2"), "preuve د2 collectée");

console.log("=== manche 3 (ordre)");
click('[data-action="suivant"]');
assert($$("[data-brique]").length === 3, "3 briques");
click("[data-brique='traduction']");
click("[data-brique='maturation']");
click("[data-brique='transcription']");
assert(!!$("[data-planche='ordre']"), "planche ordre");
await new Promise((r) => setTimeout(r, 700));
assert($$("[data-brique]").length === 3, "briques réinitialisées après mauvais ordre");
click($$("[data-brique]").find((b) => b.dataset.brique === "transcription"));
click("[data-brique='maturation']");
click("[data-brique='traduction']");
assert(B.Etat.get().onboarding.preuves.includes("د3"), "preuve د3 collectée");

console.log("=== joute de correction");
click('[data-action="suivant"]');
assert(doc.body.textContent.includes("جولة التصحيح"), "joute de correction affichée");
let corrections = 0;
while ($("[data-correction]")) {
  const avant = B.Etat.get().xp;
  const opts = $$("[data-correction]");
  click(opts[opts.length - 1]);
  assert(B.Etat.get().xp === avant + 5, "+5 XP de correction");
  corrections += 1;
  click('[data-action="correction-suivant"]');
  if (corrections > 4) throw new Error("boucle de correction");
}
assert(corrections === 2, "2 corrections (m1 et m3)");

console.log("=== fin");
assert(B.Etat.get().onboarding.fait === true, "onboarding terminé");
assert(B.Etat.get().onboarding.erreurs.includes("m1"), "erreur m1 enregistrée");
assert(B.Etat.preuves().length === 3, "3 preuves au registre");
assert(B.Etat.get().kafaa.c4.preuves >= 1, "C4 a une preuve");
assert(txt('[data-action="voir-route"]').includes("مساري"), "CTA final vers مساري");

click('[data-action="voir-route"]');
assert(!!$("[data-vue='masari']"), "مساري rendue après l'onboarding");
assert($$("[data-onglet]").length === 4, "4 onglets");
assert(B.Etat.planDeJour().aujourdhui.length <= 5, "plan plafonné à 5");

console.log("=== simulations pupitre");
doc.getElementById("dbg-absence").click();
const plan = B.Etat.planDeJour();
assert(plan.aujourdhui.length === 5, "plan plafonné à 5 après 21 jours");
assert(plan.dette > 0, "dette glissante comptée");
doc.getElementById("dbg-bac").click();
assert(B.Etat.get().events.some((e) => e.payload.source === "bac"), "événement bac simulé");
assert(B.Etat.get().kafaa.c7.niveau >= 0, "C7 mise à jour");

console.log("=== persistance");
const sauve = window.localStorage.getItem("bawssala.super.v1");
assert(sauve && sauve.length > 100, "état sauvegardé");
assert(JSON.parse(sauve).onboarding.fait === true, "onboarding persisté");

console.log("=== thème + son");
doc.getElementById("dbg-theme").click();
assert(doc.documentElement.getAttribute("data-theme") === "dark", "thème sombre");
doc.getElementById("dbg-theme").click();
assert(doc.documentElement.getAttribute("data-theme") === "light", "thème clair");
const sonBtn = doc.getElementById("dbg-son");
const avantSon = sonBtn.getAttribute("aria-pressed");
sonBtn.click();
assert(sonBtn.getAttribute("aria-pressed") !== avantSon, "bouton son basculé");

console.log("=== onglet أنا (المرحلة 6)");
click("[data-onglet='ana']");
assert(!!$("[data-vue='ana']"), "écran أنا rendu");
assert(!!$(".ana-carte__svg"), "la carte d'identité est dessinée");
click("[data-onglet='masari']");
assert(!!$("[data-vue='masari']"), "retour sur مساري par l'onglet");

console.log("=== double confirmation du reset");
doc.getElementById("dbg-reset").click();
assert(txt("#dbg-reset").includes("تأكيد"), "premier clic = armement");
doc.getElementById("dbg-reset").click();
assert(B.Etat.get().xp === 0, "XP remis à zéro");
assert(!!$(".intro__titre"), "retour à l'intro");
assert(doc.getElementById("dbg-json").textContent.includes('"xp": 0'), "inspecteur rafraîchi");
assert(erreurs.length === 0, "aucune erreur jsdom");

console.log("\nPHASE 1 · TOUT EST VERT");
