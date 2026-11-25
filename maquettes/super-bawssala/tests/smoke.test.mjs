import fs from "node:fs";
import path from "node:path";
import { JSDOM, VirtualConsole } from "jsdom";

const base = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const html = fs.readFileSync(path.join(base, "index.html"), "utf8");
const vc = new VirtualConsole();
vc.on("jsdomError", (e) => console.error("JSDOM ERROR:", e.message, e.detail || ""));
vc.on("error", (...a) => console.error("PAGE ERROR:", ...a));
const dom = new JSDOM(html, {
  url: "http://localhost/",
  runScripts: "outside-only",
  pretendToBeVisual: true,
  virtualConsole: vc,
});
const { window } = dom;
window.matchMedia = () => ({
  matches: false,
  addEventListener() {},
  removeEventListener() {},
});
window.scrollTo = () => {};
window.HTMLElement.prototype.scrollIntoView = function () {};

const scripts = [
  "js/namespace.js",
  "js/audio-miftah.js",
  "js/data-svt-3as.js",
  "js/state-engine.js",
  "js/screen-onboarding.js",
  "js/app.js",
];
for (const s of scripts) window.eval(fs.readFileSync(path.join(base, s), "utf8"));
await new Promise((r) => setTimeout(r, 60));

const doc = window.document;
const B = window.Bawssala;
const $ = (sel) => doc.querySelector(sel);
const $$ = (sel) => [...doc.querySelectorAll(sel)];
const click = (sel) => {
  const el = typeof sel === "string" ? $(sel) : sel;
  if (!el) throw new Error("introuvable: " + sel);
  el.click();
  return el;
};
const assert = (cond, msg) => {
  if (!cond) throw new Error("ECHEC: " + msg);
  console.log("ok —", msg);
};

console.log("=== boot");
assert(B && B.Etat, "namespace chargé");
assert($(".intro__titre"), "écran d'intro rendu");
assert(B.Etat.get().onboarding.fait === false, "onboarding non fait");
assert(!JSON.stringify(B.Etat.get()).includes("noteMin"), "aucune note prédite");

console.log("=== manche 1");
click('[data-action="commencer"]');
assert(B.$("[data-consigne]"), "manche 1 affichée");
const options1 = $$("[data-option]");
assert(options1.length === 3, "3 options");
click(options1[1]); // mauvaise réponse (b)
assert($("[data-retour]"), "retour affiché après erreur");
assert(B.Etat.get().onboarding.preuves.length === 0, "aucune preuve sur erreur");
assert(B.Etat.get().events.length === 0, "aucun événement sur simple erreur");
click($("[data-option='a']"));
assert(B.Etat.get().onboarding.preuves.includes("د1"), "preuve د1 collectée");
assert(B.Etat.get().xp === 6, "XP 6 après seconde tentative");
assert(B.Etat.get().events.length === 1, "1 événement d'essai");
assert(B.Etat.get().events[0].type === "learning.attempt.completed", "type d'événement v1");
assert(B.Etat.get().events[0].schema === "learning.attempt.completed/v1", "schéma v1");

console.log("=== manche 2");
click('[data-action="suivant"]');
assert(doc.body.textContent.includes("أي استنتاج صحيح"), "manche 2 affichée");
click("[data-option='a']");
assert(B.Etat.get().onboarding.preuves.includes("د2"), "preuve د2 collectée");
assert(B.Etat.get().events.length === 2, "2 événements");

console.log("=== manche 3 (ordre)");
click('[data-action="suivant"]');
const briques = $$("[data-brique]");
assert(briques.length === 3, "3 briques");
click(briques.find((b) => b.dataset.brique === "traduction"));
click($("[data-brique='maturation']"));
click($("[data-brique='transcription']"));
assert($("[data-planche='ordre']"), "planche ordre");
// ordre faux -> secousse + reset différé : on force une nouvelle tentative
await new Promise((r) => setTimeout(r, 700));
const b2 = $$("[data-brique]");
assert(b2.length === 3, "briques réinitialisées après mauvais ordre");
click(b2.find((b) => b.dataset.brique === "transcription"));
click($("[data-brique='maturation']"));
click($("[data-brique='traduction']"));
assert(B.Etat.get().onboarding.preuves.includes("د3"), "preuve د3 collectée");

console.log("=== joute de correction");
click('[data-action="suivant"]');
assert(doc.body.textContent.includes("جولة التصحيح"), "joute de correction affichée");
assert($("[data-correction='a']"), "deux options de correction");
const xpAvant = B.Etat.get().xp;
let corrections = 0;
while ($("[data-correction]")) {
  const xp = B.Etat.get().xp;
  const opts = $$("[data-correction]");
  click(opts[opts.length - 1]);
  assert(B.Etat.get().xp === xp + 5, "+5 XP de correction");
  corrections += 1;
  click('[data-action="correction-suivant"]');
  if (corrections > 4) throw new Error("boucle de correction");
}
assert(corrections === 2, "2 corrections (m1 et m3)");

console.log("=== fin");
assert(B.Etat.get().onboarding.fait === true, "onboarding terminé");
assert(B.Etat.get().onboarding.erreurs.includes("m1"), "erreur m1 enregistrée");
const preuves = B.Etat.preuves();
assert(preuves.length === 3, "3 preuves");
assert(B.Etat.get().kafaa.c4.niveau > 0, "kafaa C4 alimentée");
assert(B.Etat.get().kafaa.c4.preuves >= 1, "C4 a une preuve");

click('[data-action="voir-route"]');
assert($("[data-vue='roadmap']"), "roadmap rendue");
assert($$("[data-onglet]").length === 4, "4 onglets");
assert(B.Etat.planDeJour().aujourdhui.length <= 5, "plan plafonné à 5");

console.log("=== simulations pupitre");
window.document.getElementById("dbg-absence").click();
const plan = B.Etat.planDeJour();
assert(plan.aujourdhui.length === 5, "plan plafonné à 5 après 21 jours");
assert(plan.dette > 0, "dette glissante comptée");
window.document.getElementById("dbg-bac").click();
assert(B.Etat.get().events.some((e) => e.payload.source === "bac"), "événement bac simulé");
assert(B.Etat.get().kafaa.c7.niveau >= 0, "C7 mise à jour");

console.log("=== persistance");
const sauve = window.localStorage.getItem("bawssala.super.v1");
assert(sauve && sauve.length > 100, "état sauvegardé en localStorage");
const relu = JSON.parse(sauve);
assert(relu.onboarding.fait === true, "onboarding persisté");

console.log("=== thème + son");
const themeBtn = doc.getElementById("dbg-theme");
themeBtn.click();
assert(doc.documentElement.getAttribute("data-theme") === "dark", "thème sombre appliqué");
themeBtn.click();
assert(doc.documentElement.getAttribute("data-theme") === "light", "retour au thème clair");
const sonBtn = doc.getElementById("dbg-son");
const avantSon = sonBtn.getAttribute("aria-pressed");
sonBtn.click();
assert(sonBtn.getAttribute("aria-pressed") !== avantSon, "bouton son basculé");
assert(B.Etat.get().reglages.son === (sonBtn.getAttribute("aria-pressed") === "true"), "réglage son persisté");

console.log("=== onglets futurs");
click("[data-onglet='tadribat']");
assert($("[data-vue='roadmap']"), "route roadmap");
assert(doc.querySelector("[data-phase='5']").getAttribute("data-focus") === "oui", "phase 5 mise en avant");
assert($("#toasts").textContent.length > 0, "toast explicatif");

console.log("=== rejouer");
click('[data-app="rejouer"]');
assert($(".intro__titre"), "retour à l'intro");
assert(B.Etat.get().onboarding.fait === false, "onboarding remis à zéro");
assert(B.Etat.get().onboarding.preuves.length === 0, "preuves vidées");
assert($$("[data-option]").length === 0, "aucune manche résiduelle");

console.log("=== double confirmation du reset");
doc.getElementById("dbg-reset").click();
assert(doc.getElementById("dbg-reset").textContent.includes("تأكيد"), "premier clic = armement");
doc.getElementById("dbg-reset").click();
assert(B.Etat.get().xp === 0, "XP remis à zéro");
assert(doc.getElementById("dbg-json").textContent.includes('"xp": 0'), "inspecteur rafraîchi");
console.log("\nTOUT EST VERT");
