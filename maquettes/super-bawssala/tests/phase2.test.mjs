/* Phase 2 — مساري + moteur 1-2-3 : plan plafonné, quêtes, erreurs sans punition,
   preuve, kafaa, simulateur d'absence, persistance, onglets. */
import { charger, assert } from "./harness.mjs";

const { B, window, doc, $, $$, click, txt, erreurs, attendre } = await charger();

console.log("=== مساري");
B.Etat.terminerOnboarding(0);
B.Application.aller("masari");
assert(!!$("[data-vue='masari']"), "vue مساري rendue");
assert($$("[data-quete]").length >= 4, "4 quêtes listées");
assert(txt(".contenu").includes("خطة اليوم"), "plan du jour présent");
assert(txt(".contenu").includes("الانتظام"), "régularité présente");
assert(txt(".contenu").includes("رجعت بعد غياب"), "simulateur présent");
assert(B.Etat.planDeJour().aujourdhui.length <= 5, "plan plafonné");

console.log("=== ouverture du kouest 1");
click(".quete[data-quete='q1']");
assert(!!$("[data-vue='quete']"), "vue quête rendue");
assert($$(".fil").length === 3, "3 étapes affichées");
assert(txt("[data-consigne]").includes("α-amanitine"), "consigne réelle (biosciences)");
assert($$("[data-option]").length === 3, "3 options");
assert(doc.body.dataset.vue === "quete", "body marque la route quête");

console.log("=== erreur 1 : indice, pas de punition");
const xpAvant = B.Etat.get().xp;
const evtsAvant = B.Etat.get().events.length;
click("[data-option='b']");
assert(!!$("[data-retour]"), "indice affiché");
assert($("[data-action='suivant']").disabled, "CTA bloqué avant réponse");
assert(B.Etat.get().events.length === evtsAvant, "aucun événement sur simple erreur");
assert(B.Etat.get().xp === xpAvant, "aucun XP perdu");

console.log("=== erreur 2 : révélation, enregistrement");
click("[data-option='c']");
assert(!$("[data-action='suivant']").disabled, "CTA débloqué après révélation");
assert(B.Etat.get().events.length === evtsAvant + 1, "événement d'échec enregistré");
const info1 = B.Etat.infoQuete("q1");
assert(info1.etapes["e1"] && info1.etapes["e1"].juste === false, "étape e1 marquée fausse");

console.log("=== étape 2 : comparer deux documents");
click("[data-action='suivant']");
assert($$(".doc").length === 2, "2 documents");
assert(txt(".duo").includes("وثيقة أ"), "documents étiquetés");
click("[data-option='a']");
assert(B.Etat.get().xp === xpAvant + 8, "+8 XP première tentative");
assert(B.Etat.infoQuete("q1").etapes["e2"].juste === true, "e2 juste");

console.log("=== étape 3 : appliquer");
click("[data-action='suivant']");
assert(txt("[data-consigne]").includes("الريبوزوم"), "consigne d'application");
click("[data-option='a']");
assert(txt("[data-action='suivant']").includes("خلّص"), "CTA final du kouest");
assert(B.Etat.get().xp === xpAvant + 16, "+8 XP sur l'étape 3");

console.log("=== clôture + correction + leçon");
click("[data-action='suivant']");
assert(B.Etat.infoQuete("q1").fait === true, "quête marquée faite");
assert(B.Etat.preuves().some((p) => p.code === "د4"), "preuve د4 collectée");
assert(B.Etat.get().xp === xpAvant + 28, "+12 XP de clôture (avant correction)");
assert(B.Etat.get().kafaa.c4.preuves >= 1, "kafaa C4 alimentée");
assert(
  B.Etat.get().events.some((e) => e.type === "learning.quest.completed"),
  "événement learning.quest.completed"
);
assert(txt("[data-vue='quete']").includes("جولة التصحيح"), "correction déclenchée par l'erreur");
click("[data-correction='juste']");
click("[data-action='corr-suivant']");
assert(!!$("[data-vue='lecon']"), "carte de leçon affichée");
assert(txt(".lecon__code") === "ب1", "leçon ب1");
assert(B.Etat.get().xp === xpAvant + 28 + 5 + 5, "XP correction + leçon");

console.log("=== retour et état de la carte");
click("[data-action='retour']");
assert(!!$("[data-vue='masari']"), "retour sur مساري");
const carte = $(".quete[data-quete='q1']");
assert(carte.getAttribute("data-etat") === "fini", "carte q1 en état fini");
assert(carte.textContent.includes("دليل"), "carte q1 montre le دليل");

console.log("=== simulateur d'absence");
click("[data-jours='21']");
assert(txt(".contenu").includes("20 مؤجّلة") || txt(".contenu").includes("مؤجّلة"), "aperçu avant application");
const cartesAvant = B.Etat.get().srs.cartes.length;
click("[data-appliquer]");
assert(B.Etat.get().srs.cartes.length > cartesAvant, "cartes créées pour toutes les compétences");
assert(B.Etat.planDeJour().aujourdhui.length === 5, "plan toujours plafonné à 5");
assert(B.Etat.planDeJour().dette > 0, "dette visible");
assert($("#toasts").textContent.includes("محاكاة"), "toast de simulation");

console.log("=== onglet أنا (phase 6)");
click("[data-onglet='ana']");
assert(!!$("[data-vue='ana']"), "écran أنا rendu");
click("[data-onglet='masari']");
assert(!!$("[data-vue='masari']"), "retour sur مساري");

console.log("=== les 3 autres quêtes, du premier coup");
for (const id of ["q2", "q3", "q4"]) {
  B.Ecrans.game123.ouvrir(id);
  B.Application.aller("quete");
  for (let etape = 0; etape < 3; etape++) {
    const bonne = $$("[data-option]").find((o) => {
      const q = B.Donnees.queteParId[id];
      return o.getAttribute("data-option") === q.etapes[etape].options.find((x) => x.juste).id;
    });
    click(bonne);
    click("[data-action='suivant']");
  }
  assert(B.Etat.infoQuete(id).fait === true, "quête " + id + " terminée");
}
B.Application.aller("masari");
assert(B.Etat.quetesFaites() === 4, "4 quêtes terminées");
assert(B.Etat.preuves().length === 4, "4 preuves de quêtes au registre");
assert($$(".quete[data-etat='fini']").length === 4, "les 4 cartes passent en 'fini'");

console.log("=== persistance");
const sauve = window.localStorage.getItem("bawssala.super.v1");
const relu = JSON.parse(sauve);
assert(relu.quetes.q1.fait === true, "quête persistée");
assert(relu.preuves.includes("د4"), "preuve persistée");
assert(relu.onboarding.fait === true, "onboarding persisté");

const second = await charger({ etat: sauve });
assert(!!second.$("[data-vue='masari']"), "boot direct sur مساري avec état chargé");
assert(second.B.Etat.infoQuete("q1").fait === true, "état relu après redémarrage");
assert(second.B.Etat.get().xp === relu.xp, "XP identique après redémarrage");

console.log("=== erreurs de page");
assert(erreurs.length === 0, "aucune erreur jsdom (session 1)");
assert(second.erreurs.length === 0, "aucune erreur jsdom (session 2)");

console.log("\nPHASE 2 · TOUT EST VERT");
