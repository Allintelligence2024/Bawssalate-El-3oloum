/* Phase 3 — جولة التصحيح + بطاقة الدرس.
   Une erreur déclenche une correction de 15 s, la leçon est débloquée à la fin. */
import { charger, assert } from "./harness.mjs";

const { B, window, $, $$, click, txt, erreurs } = await charger();

console.log("=== préparation");
B.Etat.terminerOnboarding(0);
B.Application.aller("masari");
click(".quete[data-quete='q1']");
assert(!!$("[data-vue='quete']"), "quête 1 ouverte");

console.log("=== étape 1 ratée deux fois");
click("[data-option='b']");
click("[data-option='c']");
const evts = B.Etat.get().events.length;
click("[data-action='suivant']");
assert(txt("[data-consigne]").includes("الترخيص") === false, "on avance après l'échec");

console.log("=== étapes 2 et 3 justes");
click("[data-option='a']");
click("[data-action='suivant']");
click("[data-option='a']");
const xpAvant = B.Etat.get().xp;
click("[data-action='suivant']");

console.log("=== joute de correction");
assert($$("[data-correction]").length === 2, "2 formulations proposées");
assert(txt(".contenu").includes("أيّ صياغة صحيحة"), "consigne de correction");
assert(txt(".contenu").includes("بلا عقاب"), "mention anti-punition");
assert(!!$("[data-action='corr-suivant']").disabled, "on ne saute pas la correction");
const bonne = $("[data-correction='juste']");
assert(!!bonne, "la bonne formulation est identifiable");
const xpCorrection = B.Etat.get().xp;
click(bonne);
assert(B.Etat.get().xp === xpCorrection + 5, "+5 XP de correction");
assert(!!$("[data-retour]"), "retour après correction");
assert(!$("[data-action='corr-suivant']").disabled, "CTA débloqué");
assert($("[data-correction='juste']").getAttribute("data-etat") === "juste", "bonne option mise en vert");

console.log("=== carte de leçon");
click("[data-action='corr-suivant']");
assert(!!$("[data-vue='lecon']"), "vue leçon");
assert(!!$(".lecon"), "carte de leçon rendue");
assert(txt(".lecon__titre").includes("الاستنساخ"), "titre de la leçon");
assert(txt(".lecon__code") === "ب1", "code ب1");
assert($$(".lecon__lignes li").length === 3, "3 lignes essentielles");
assert(txt(".lecon__source").includes("الوحدة 1"), "source de la leçon");

console.log("=== la carte se retourne");
assert($("[data-flip]").getAttribute("data-face") === "recto", "recto au départ");
assert($("[data-flip]").getAttribute("aria-pressed") === "false", "aria-pressed false");
click("[data-flip]");
assert($("[data-flip]").getAttribute("data-face") === "verso", "verso après le geste");
assert($("[data-flip]").getAttribute("aria-pressed") === "true", "aria-pressed true");
assert(txt(".lecon__question").includes("ARN بوليميراز"), "question de bac au verso");
assert(txt(".lecon__cle").includes("ARNm"), "clé de réponse au verso");
assert(txt(".lecon__tampon").includes("بوصلة"), "tampon présent");
assert(txt(".lecon__date").includes("تاريخ"), "date de collecte");
click("[data-flip]");
assert($("[data-flip]").getAttribute("data-face") === "recto", "retour au recto");
$("[data-flip]").dispatchEvent(new window.KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
assert($("[data-flip]").getAttribute("data-face") === "verso", "clavier : Entrée retourne la carte");
assert(B.Etat.leconsObtenues().length === 1, "1 leçon au registre");
assert(
  B.Etat.get().events.some((e) => e.type === "learning.lesson.collected"),
  "événement learning.lesson.collected"
);
assert(
  B.Etat.get().events.some((e) => e.type === "learning.correction.completed") === false,
  "pas d'événement inventé pour la correction"
);
assert(B.Etat.get().xp >= xpCorrection + 5 + 5, "XP leçon +5");

console.log("=== quête 2 sans faute : pas de correction");
click("[data-quete='q2']");
for (let i = 0; i < 3; i++) {
  const q = B.Donnees.queteParId["q2"];
  const bonneId = q.etapes[i].options.find((o) => o.juste).id;
  click("[data-option='" + bonneId + "']");
  click("[data-action='suivant']");
}
assert(!!$("[data-vue='lecon']"), "leçon directe sans correction");
assert(txt(".lecon__code") === "ب2", "code ب2");
assert(B.Etat.leconsObtenues().length === 2, "2 leçons");

console.log("=== correction révélée (mauvaise réponse)");
B.Ecrans.game123.ouvrir("q3");
B.Application.aller("quete");
click("[data-option='b']");
click("[data-option='c']");
click("[data-action='suivant']");
const bonneQ3 = B.Donnees.queteParId["q3"].etapes[1].options.find((o) => o.juste).id;
click("[data-option='" + bonneQ3 + "']");
click("[data-action='suivant']");
const bonneQ3b = B.Donnees.queteParId["q3"].etapes[2].options.find((o) => o.juste).id;
click("[data-option='" + bonneQ3b + "']");
click("[data-action='suivant']");
const mauvaiseFormulation = $("[data-correction='faux']");
const xpCorr = window.Bawssala.Etat.get().xp;
mauvaiseFormulation.click();
assert(B.Etat.get().xp === xpCorr, "pas d'XP si la correction est ratée");
assert(txt("[data-retour]").length > 0, "explication affichée quand même");
assert(B.Etat.infoQuete("q3").corrections["e1"] === "revele", "correction marquée révélée");
click("[data-action='corr-suivant']");
assert(!!$("[data-vue='lecon']"), "on arrive quand même à la leçon");
assert(txt(".lecon__code") === "ب3", "code ب3");

console.log("=== retour à مساري");
click("[data-action='retour']");
assert(!!$("[data-vue='masari']"), "retour sur مساري");
assert(txt(".contenu").includes("بطاقات الدروس"), "compteur de leçons visible");
assert(txt(".contenu").includes("3 / 4"), "3 leçons sur 4");

console.log("=== persistance");
const sauve = window.localStorage.getItem("bawssala.super.v1");
const relu = JSON.parse(sauve);
assert(Object.keys(relu.lecons).length === 3, "leçons persistées");
assert(relu.quetes.q1.corrections.e1 === "juste", "correction persistée");
const second = await charger({ etat: sauve });
assert(second.B.Etat.leconsObtenues().length === 3, "leçons relues après redémarrage");
assert(!!second.$("[data-vue='masari']"), "boot sur مساري");

console.log("=== erreurs de page");
assert(erreurs.length === 0, "aucune erreur jsdom");
assert(second.erreurs.length === 0, "aucune erreur jsdom (session 2)");

console.log("\nPHASE 3 · TOUT EST VERT");
