/* Phase 4 — « الباك خطوة بخطوة ».
   On vérifie ce que l'élève vit vraiment : la méthode d'abord, puis une
   décision à la fois avec un retour immédiat, puis le corrigé assemblé.
   Pas de mur, pas de note /20, pas de points re-gagnés en boucle. */
import { charger, assert } from "./harness.mjs";

const { B, window, doc, $, $$, click, txt, erreurs } = await charger({
  url: "http://localhost/?vue=bac"
});
window.print = () => {};

const justes = (id) => B.Etat.bacEtape(id).etape.options.filter((o) => o.juste);
const fausses = (id) => B.Etat.bacEtape(id).etape.options.filter((o) => !o.juste);
const bonne = (id) => justes(id)[0].id;
const fausse = (id, n = 0) => fausses(id)[n].id;
const courante = () => B.Etat.bacProgression().courante;

console.log("=== données du sujet");
const bac = B.Donnees.bac;
assert(bac.id === "bac-2022-u1", "id du sujet 2022");
assert(bac.annee === 2022 && bac.session === "الدورة الثانية", "session 2022 · 2e session");
assert(bac.exercice === 2 && bac.format.includes("7"), "exercice 2 · 7 points");
assert(bac.documents.length === 4, "4 documents");
assert(bac.questions.length === 2, "2 questions");
assert(bac.questions[0].points === 3.25 && bac.questions[1].points === 3.75, "barème officiel");
const etapes = B.Etat.bacEtapes();
assert(etapes.length === 6, "6 micro-décisions (3 par question)");
bac.questions.forEach((q) => {
  assert(q.etapes.length === 3, q.id + " · 3 étapes");
  assert(q.briques.filter((b) => b.juste).length === 4, q.id + " · 4 briques pour la synthèse");
  q.etapes.forEach((e) => {
    assert(e.options.filter((o) => o.juste).length === 1, e.id + " · une seule bonne réponse");
    assert(e.options.length === 4, e.id + " · 4 choix");
    assert(Boolean(e.consigne && e.aide && e.cle && e.doc), e.id + " · consigne + aide + clé + pièce");
    assert(e.consigne.split(/\s+/).length <= 8, e.id + " · consigne courte");
    e.options.forEach((o) => assert(Boolean(o.retour), e.id + " · chaque choix expliqué"));
  });
});

console.log("=== la méthode d'abord (une seule fois)");
assert(B.Etat.bacVu() === false, "méthode non encore vue");
assert($$("[data-choix]").length === 0, "aucun choix avant d'avoir vu la méthode");
assert(txt(".titre-ecran").includes("3 حركات"), "titre de la méthode");
assert($$(".methode__pas").length === 3, "3 gestes : اقرا · فسّر · استنتج");
assert(txt(".methode").includes("شوف الوثيقة"), "geste 1");
assert(txt(".methode").includes("فسّر الآلية"), "geste 2");
assert(txt(".methode").includes("استنتج"), "geste 3");
assert(txt(".pied__note").includes("وقت"), "rassure : pas de chrono");
click("[data-action='commencer']");
assert(B.Etat.bacVu() === true, "méthode marquée vue");
assert($$("[data-choix]").length === 4, "4 choix affichés après la méthode");

console.log("=== une seule carte, une seule question");
assert(txt(".pas__t").includes("خطوة 1 من 6"), "progression annoncée");
assert($$(".pas__jauge").length === 1, "jauge unique (pas 6 pastilles)");
assert($(".bac-carte") !== null, "une carte contient mention + question + document");
assert($$(".bac-carte").length === 1, "pas de dispersion en plusieurs blocs");
assert(txt(".bac-q").includes("أيّ وثيقة"), "question lisible en gros");
assert(txt(".doc--piece").includes("وثيقة أ"), "la pièce أ est dans la carte");
assert($$(".doc--piece").length === 1, "un seul document affiché à la fois");
assert($$(".doc-vign").length === 4, "4 vignettes pour comparer les documents");
assert($$(".figure").length === 1, "le document affiché a sa figure (pas que du texte)");
assert($(".figure").getAttribute("role") === "img", "figure annoncée comme image");
assert($(".figure").getAttribute("aria-label").includes("نشاط الإنزيم"), "figure décrite pour les lecteurs d'écran");
assert(B.Donnees.bac.documents.every((d) => d.figure && B.figure(d.figure.type)), "chaque document sait se dessiner");
assert($("[data-action='suivant']").disabled, "on ne saute pas sans répondre");
assert(txt(".pied__note").includes("اختر"), "consigne d'action en pied");

console.log("=== le geste en cours + l'aide à la demande");
assert(txt(".pas__note") === "الوثيقة", "le geste de la méthode est annoncé");
assert($$("[data-aide]").length === 1, "un bouton d'aide avant de répondre");
const aide1 = B.Etat.bacEtape("q1-e1").etape.aide;
click("[data-aide]");
assert($("[data-aide-etape]").textContent.includes(aide1), "l'indice s'affiche sans se tromper");
assert($("[data-aide-etape]").textContent.includes("ما تنقصش النقاط"), "l'aide ne coûte rien");
assert(B.Etat.get().xp === 0, "aucun XP dépensé pour l'aide");
assert($$("[data-aide]").length === 0, "le bouton laisse place à la fiche");
assert($$("[data-choix]:not([disabled])").length === 4, "on peut toujours répondre");

console.log("=== comparer deux documents sans quitter la question");
click("[data-doc='ب']");
assert(txt(".doc--piece").includes("وثيقة ب"), "la pièce ب s'affiche");
assert($("[data-doc='ب']").getAttribute("aria-pressed") === "true", "vignette active");
assert(txt(".doc__rappel").includes("رجع"), "retour possible vers la pièce de l'étape");
assert($$("[data-choix]").length === 4, "les choix restent en place");
click("[data-doc-retour]");
assert(txt(".doc--piece").includes("وثيقة أ"), "retour à la pièce de l'étape");

console.log("=== bonne réponse du premier coup");
const xp0 = B.Etat.get().xp;
click("[data-choix='" + bonne("q1-e1") + "']");
assert(B.Etat.get().xp === xp0 + 3, "+3 XP au premier essai");
assert(txt("[data-retour-etape='juste']").includes("النشاط ينقص"), "explication immédiate");
assert($("[data-choix='" + bonne("q1-e1") + "']").getAttribute("data-etat") === "juste", "choix marqué juste");
assert(!$("[data-action='suivant']").disabled, "on peut avancer");
assert(txt(".pied__note").includes("+3"), "gain annoncé en pied");
assert($$("[data-choix]:not([disabled])").length === 0, "les choix sont figés");

console.log("=== erreur : on explique le piège, pas de punition");
click("[data-action='suivant']");
assert(txt(".bac-q").includes("وين يتثبّت"), "étape 2 affichée");
const aide2 = B.Etat.bacEtape("q1-e2").etape.aide;
const xp1 = B.Etat.get().xp;
click("[data-choix='" + fausse("q1-e2") + "']");
assert(B.Etat.get().xp === xp1, "0 XP sur une erreur (aucune punition)");
assert($("[data-retour-etape='indice']").textContent.includes("عاود"), "message miel");
assert(
  $("[data-retour-etape='indice']").textContent.includes(fausses("q1-e2")[0].retour),
  "on explique pourquoi CE choix est faux"
);
assert($("[data-retour-etape='indice']").textContent.includes(aide2), "puis on donne l'indice");
assert($("[data-action='suivant']").disabled, "on ne saute pas après une erreur");
assert($("[data-choix='" + fausse("q1-e2") + "']").disabled, "le mauvais choix se grise");
assert($$("[data-choix]:not([disabled])").length === 3, "on peut réessayer");

console.log("=== deuxième erreur : on montre, sans honte");
click("[data-choix='" + fausse("q1-e2", 1) + "']");
assert(
  $("[data-choix='" + bonne("q1-e2") + "']").getAttribute("data-etat") === "juste",
  "la bonne réponse est montrée"
);
assert(txt("[data-retour-etape='revele']").includes("الجواب"), "le corrigé apparaît");
assert(txt("[data-retour-etape='revele']").includes("الحلقة TL"), "et il est expliqué");
assert($("[data-action='suivant']").disabled === false, "on peut avancer");
assert(B.Etat.get().xp === xp1, "toujours 0 XP : on n'achète pas la réponse");

console.log("=== suite du parcours");
click("[data-action='suivant']");
assert(txt(".bac-q").includes("النتيجة المباشرة"), "étape 3");
click("[data-choix='" + bonne(courante()) + "']");
click("[data-action='suivant']");
assert(txt(".bac-q").includes("ATAC مركّب"), "étape 4 (question 2)");
assert(txt(".mention--or").includes("C5"), "compétence C5 annoncée");
click("[data-choix='" + bonne(courante()) + "']");
click("[data-action='suivant']");
click("[data-choix='" + bonne(courante()) + "']");
click("[data-action='suivant']");
assert(txt(".bac-q").includes("على الورم"), "dernière étape");
/* CTA explicite : tant qu'on n'a pas répondu, il dit quoi faire au lieu de
   rester un bouton grisé qui ne dit rien. */
assert(txt(".pied .btn").includes("اختار جواب"), "CTA guidé tant qu'on n'a pas répondu");
assert($(".pied .btn").disabled, "CTA inactif avant la réponse");
const xpAvantBilan = B.Etat.get().xp;
click("[data-choix='" + bonne(courante()) + "']");
assert(txt(".pied .btn").includes("الجواب الكامل"), "CTA final = corrigé assemblé");
click("[data-action='suivant']");

console.log("=== bilan : le corrigé assemblé");
assert(B.Etat.bac().fini === true, "exercice clôturé");
assert(!!$(".vue[data-vue='bilan']"), "vue bilan");
assert(txt(".titre-ecran") === "خلّصت التمرين.", "titre du bilan");
assert($$(".synthese__lignes").length === 2, "une synthèse par question");
assert($$(".synthese__lignes li").length === 8, "8 briques assemblées (4 + 4)");
assert(txt(".contenu--bac").includes("المفتاح"), "corrigé officiel présent");
assert($$(".puce--statut").length === 3, "2 compétences + total essais");
assert(B.Etat.bacBilan().map((b) => b.statut).join(",") === "في الطريق,راسخ", "statuts C4/C5");
assert(B.Etat.get().xp === xpAvantBilan + 3 + 6, "+3 de la dernière étape + 6 de clôture");
assert(!txt(".contenu--bac").includes("/20"), "aucune note sur 20");
assert(!txt(".contenu--bac").includes("Game Over"), "aucun Game Over");

console.log("=== le brouillon existe vraiment");
assert($("[data-papier-zone]") !== null, "zone de brouillon affichée");
const zone = $("[data-papier-zone]");
zone.value = "الخطوة اللي حبستني: الفرق بين الاستنساخ والترجمة";
zone.dispatchEvent(new window.Event("input", { bubbles: true }));
await new Promise((r) => setTimeout(r, 600));
assert(B.Etat.bac().papier.includes("الاستنساخ"), "brouillon mémorisé (écriture différée)");
zone.value = "جملة ثانية قبل الطبع";
zone.dispatchEvent(new window.Event("input", { bubbles: true }));
B.Ecrans.bac.imprimer();
assert($("#feuille").textContent.includes("جملة ثانية قبل الطبع"), "imprimer juste après avoir écrit ne perd rien");

console.log("=== compétences + journal");
assert(B.Etat.get().kafaa.c4.preuves === 1, "C4 a une preuve");
assert(B.Etat.get().kafaa.c5.preuves === 1, "C5 a une preuve");
assert(B.Donnees.bacPreuves.length === 2, "deux preuves liées au sujet");
const preuvesBac = B.Etat.preuves().filter((p) => p.code.indexOf("bac-") === 0);
assert(preuvesBac.length === 2, "les deux preuves du bac rejoignent le registre");
assert(preuvesBac.every((p) => p.figure && B.figure(p.figure.type)), "chaque preuve a sa figure");
assert($$(".preuve").length === 2, "les preuves sont montrées dans le bilan");
assert($$(".preuve__fig .figure").length === 2, "avec leur figure");
assert(B.Etat.get().kafaa.c5.niveau > 0, "C5 progresse (3/3 du premier coup)");
const evt = B.Etat.get().events[0];
assert(evt.type === "learning.attempt.completed", "événement d'essai");
assert(evt.payload.source === "bac" && evt.payload.total === 6, "payload bac · 6 étapes");

console.log("=== feuille imprimable");
B.Ecrans.bac.imprimer();
const feuille = $("#feuille");
assert(feuille.textContent.includes("α-amanitine"), "titre sur la feuille");
assert(feuille.textContent.includes("المفتاح"), "corrigé sur la feuille");
assert(feuille.querySelectorAll("li").length === 8, "8 lignes sur la feuille");
assert(feuille.textContent.includes("مسوّدة"), "le brouillon est imprimé avec");
assert(feuille.textContent.includes("مؤشّر توجيهي"), "mention de prudence");

console.log("=== rejouer sans farmer ni les étapes ni le bonus");
const brutBilan = window.localStorage.getItem("bawssala.super.v1");
const xpBilan = B.Etat.get().xp;
click("[data-action='rejouer']");
assert(!!$(".vue[data-vue='bac']"), "retour à la première étape");
assert(txt(".pas__t").includes("خطوة 1 من 6"), "progression remise à zéro");
assert(B.Etat.bacProgression().faites === 0, "aucune étape validée");
assert(B.Etat.bac().fini === false, "exercice rouvert");
click("[data-choix='" + bonne("q1-e1") + "']");
assert(B.Etat.get().xp === xpBilan, "pas d'XP en double au replay");
assert(txt(".pied__note").includes("تثبيت بلا نقاط"), "le jeu le dit franchement");
for (let i = 0; i < 6; i++) {
  const id = B.Etat.bacProgression().courante;
  if (!id) break;
  const actif = $("[data-choix='" + bonne(id) + "']:not([disabled])");
  if (actif) actif.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  const suiv = $("[data-action='suivant']:not([disabled])");
  if (suiv) suiv.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
}
assert(B.Etat.bac().fini === true, "2e tour terminé");
assert(B.Etat.get().xp === xpBilan, "les 6 XP de clôture ne sont pas re-crédités");

console.log("=== reprise après rechargement");
const s1 = await charger({ etat: brutBilan, url: "http://localhost/?vue=bac" });
assert(!!s1.$(".vue[data-vue='bilan']"), "le bilan se rouvre directement");
assert(s1.B.Etat.bac().fini === true, "clôture mémorisée");
assert(s1.B.Etat.bac().etapes["q1-e2"].revele === true, "révélation mémorisée");
assert(s1.B.Etat.get().xp === xpBilan, "l'XP ne bouge pas au rechargement");
assert(s1.$("[data-papier-zone]") !== null, "le brouillon revient");
assert(s1.$("[data-papier-zone]").value.includes("جملة ثانية"), "texte du brouillon restauré");
assert(s1.erreurs.length === 0, "aucune erreur jsdom après rechargement");

console.log("=== la méthode ne se rejoue pas");
const s2 = await charger({
  etat: JSON.stringify({ version: 1, bac: { id: "bac-2022-u1", vu: true, etapes: {} } }),
  url: "http://localhost/?vue=bac"
});
assert(s2.$(".methode") === null, "pas de rappel de la méthode");
assert(s2.$(".bac-carte") !== null, "on arrive directement sur la question 1");
assert(s2.erreurs.length === 0, "aucune erreur jsdom (reprise)");

console.log("=== état partiel : les étapes existent toujours");
const partiel = await charger({
  etat: JSON.stringify({ version: 1, bac: { id: "bac-2022-u1", vu: true, etapes: {} } }),
  url: "http://localhost/?vue=bac"
});
assert(Object.keys(partiel.B.Etat.bac().etapes).length === 6, "6 étapes normalisées d'office");
const cible = partiel.B.Etat.bacEtape("q1-e1").etape.options.filter((o) => o.juste)[0].id;
partiel.$("[data-choix='" + cible + "']").dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
assert(partiel.B.Etat.bac().etapes["q1-e1"].juste === true, "cliquer une réponse sur un état partiel ne plante plus");
assert(partiel.erreurs.length === 0, "aucune erreur après ce clic");

console.log("=== état abîmé : jamais de crash");
const casse = await charger({
  etat: JSON.stringify({ version: 1, bac: { id: "bac-2022-u1", etapes: { "q1-e2": "x" } } }),
  url: "http://localhost/?vue=bac"
});
assert(casse.$("[data-choix]") !== null || casse.$("[data-action='commencer']") !== null, "l'écran tient debout");
assert(casse.erreurs.length === 0, "aucune erreur sur un état corrompu");

console.log("=== مرجع البوصلة (lecture seule)");
click("[data-action='rejouer']");
B.Etat.debloquerLecon("q1");
click("[data-reference]");
assert(!$("[data-tiroir]").hidden, "tiroir ouvert");
assert($$("[data-onglet-tiroir]").length === 3, "3 onglets");
assert($$("[data-inserer]").length === 0, "aucune insertion automatique");
assert(txt(".tiroir__cible").includes("للقراءة فقط"), "statut annoncé");
assert(txt(".tiroir__corps").includes("الاستنساخ"), "la carte ب1 est lisible");
doc.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
assert($("[data-tiroir]").hidden, "Échap ferme");

console.log("=== invariants produit");
assert(doc.documentElement.dir === "rtl", "RTL");
assert(erreurs.length === 0, "aucune erreur jsdom (session 1)");

console.log("\nPHASE 4 · TOUT EST VERT");
