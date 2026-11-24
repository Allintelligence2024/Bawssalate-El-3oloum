/* Phase 5 — « صيّاد الفخاخ ».
   Ce que l'élève vit : 8 phrases, deux boutons (فخّ / صحيح), la preuve tout
   de suite. Le chrono monte, rien ne se perd, aucun Game Over, aucune note. */
import { charger, assert } from "./harness.mjs";

const { B, window, doc, $, $$, click, txt, erreurs } = await charger({
  url: "http://localhost/?vue=fakh"
});

const items = B.Donnees.fakh.items;
const etat = () => B.Etat.fakh();
const prog = () => B.Etat.fakhProgression();
const courante = () => prog().courante;
const attendu = (id) => (B.Donnees.fakhParId[id].faux ? "faux" : "vrai");
const inverse = (choix) => (choix === "faux" ? "vrai" : "faux");

console.log("=== données : 8 phrases, un vrai mélange");
assert(B.Donnees.fakh.id === "fakh-u1", "id de la chasse");
assert(items.length === 8, "8 phrases");
assert(new Set(items.map((i) => i.id)).size === 8, "ids uniques");
assert(items.filter((i) => i.faux).length === 5, "5 vrais pièges");
assert(items.filter((i) => !i.faux).length === 3, "3 phrases saines (sinon on répond au hasard)");
assert(items[0].faux && !items[1].faux, "alternance dès le début");
items.forEach((i) => {
  assert(Boolean(i.affirmation && i.correction && i.kafaa), i.id + " · phrase + correction + compétence");
  assert(Boolean(B.Donnees.competenceParId[i.kafaa]), i.id + " · compétence connue");
  assert(i.affirmation.split(/\s+/).length <= 8, i.id + " · phrase courte");
  assert(i.faux ? Boolean(i.indice) : true, i.id + " · indice sur les pièges");
});
const comps = new Set(items.map((i) => i.kafaa));
assert(comps.size === 3, "3 compétences travaillées (c1, c3, c4)");
assert(B.Donnees.fakhPreuves.length === 2, "2 preuves « بكالوريا »");
assert(B.Donnees.fakhPreuves.every((p) => B.Donnees.fakhParId[p.fakh]), "chaque preuve pointe une phrase");

console.log("=== l'entrée : les règles d'abord, une seule fois");
assert(B.Etat.fakhVu() === false, "règles non encore vues");
assert($$("[data-fakh]").length === 0, "aucun bouton فخّ/صحيح avant les règles");
assert(txt(".titre-1").includes("فخّ ولا صحيح"), "titre clair");
assert($$(".fakh-regles li").length === 3, "3 gestes : اقرا · اختار · شوف الدليل");
assert($$(".fakh-ex").length === 2, "2 exemples (un piège, une phrase saine)");
assert(txt(".pied__note").includes("بلا وقت"), "rassure : le temps ne stresse pas");
click("[data-action='commencer']");
assert(B.Etat.fakhVu() === true, "règles marquées vues");
assert($$("[data-fakh]").length === 2, "2 boutons après les règles");

console.log("=== une phrase, deux boutons, un seul essai");
assert($$(".fakh-pas__pt").length === 8, "8 pastilles de progression");
assert(txt(".fakh-texte").length > 5, "la phrase est affichée en gros");
assert($(".fakh-btn--faux") && $(".fakh-btn--vrai"), "les deux boutons existent");
assert($("[data-action='suivant']").disabled, "on ne peut pas avancer sans répondre");
assert($(".fakh-chrono") !== null, "chrono visible (il monte)");
assert(txt(".fakh-carte").includes("فخّ ولا صحيح"), "la carte annonce le choix");

console.log("=== bonne réponse : preuve immédiate + 2 XP");
let id = courante();
click("[data-fakh='" + attendu(id) + "']");
assert(etat().reponses[id].juste === true, "réponse enregistrée juste");
assert(B.Etat.get().xp === 2, "2 XP pour un piège repéré");
assert($("[data-retour-etape]") !== null, "le retour apparaît tout de suite");
assert(($(".retour--juste") || $(".retour--faux")) !== null, "retour coloré (juste/faux)");
assert(txt("[data-retour-etape]").includes(B.Donnees.fakhParId[id].correction.slice(0, 12)), "la correction est écrite");
assert($("[data-action='suivant']").disabled === false, "on peut avancer");

console.log("=== re-cliquer ne double rien");
const xpAvant = B.Etat.get().xp;
assert(B.Etat.fakhRepondre(id, inverse(attendu(id))).erreur === "deja", "réponse déjà donnée refusée");
assert(B.Etat.get().xp === xpAvant, "aucun XP en double");

console.log("=== mauvaise réponse : on montre, on n'enlève rien");
click("[data-action='suivant']");
id = courante();
assert(id !== null, "phrase suivante");
const avantXp = B.Etat.get().xp;
click("[data-fakh='" + inverse(attendu(id)) + "']");
assert(etat().reponses[id].juste === false, "réponse fausse enregistrée");
assert(B.Etat.get().xp === avantXp, "aucun XP retiré, aucun XP offert");
assert(txt("[data-retour-etape]").includes("علاش") === false, "pas de jargon");
assert($(".retour--faux") !== null, "retour « faux » (miel, jamais rouge)");
assert(txt("[data-retour-etape]").includes(B.Donnees.fakhParId[id].correction.slice(0, 12)), "la correction arrive quand même");

console.log("=== on va au bout des 8, sans jamais être bloqué");
let garde = 0;
while (courante() && garde < 20) {
  const c = courante();
  click("[data-fakh='" + attendu(c) + "']");
  click("[data-action='suivant']");
  garde += 1;
}
assert(garde <= 8, "8 phrases maximum");
assert(prog().finie === true, "les 8 sont faites");
assert(etat().fini === true, "la chasse est clôturée");
assert($("[data-vue='fakh']") !== null, "on reste sur l'écran de la chasse");
assert(txt(".titre-1").includes("صيّدت"), "bilan : « tu as attrapé X »");
assert(txt(".fakh-rang").length > 3, "un rang (jamais une note)");
assert(!txt("body").includes("Game Over"), "jamais de Game Over");
assert(!/\/\s*20/.test(txt(".contenu--fakh")), "aucune note sur 20");
assert($$(".fakh-comp__l").length === 3, "3 compétences détaillées dans le bilan");
assert(txt(".contenu--fakh").includes("مؤشّر توجيهي"), "mention « indicateur, pas une note »");

console.log("=== récompenses : bonus unique, preuves seulement si attrapées");
const xpFin = B.Etat.get().xp;
const b = B.Etat.fakhBilan();
assert(b.justes === 7 && b.justes === prog().justes, "bilan : 7/8 (une phrase ratée exprès)");
assert(b.rang.nom === "صيّاد ماهر", "rang intermédiaire, jamais un échec");
assert(b.preuves.length === 2, "les 2 preuves bac sont ouvertes");
assert(B.Etat.preuves().filter((p) => p.code.indexOf("fakh-") === 0).length === 2, "elles rejoignent le registre");
assert(B.Etat.get().kafaa.c1.preuves >= 1 && B.Etat.get().kafaa.c3.preuves >= 1, "write-back c1/c3");
assert(B.Etat.get().events[0].type === "learning.attempt.completed", "événement journalisé");
assert(B.Etat.fakhTerminer(40).fini === true, "clôture idempotente");
assert(B.Etat.get().xp === xpFin, "pas de bonus versé deux fois");

console.log("=== rejouer : phrases à zéro, XP conservés");
click("[data-action='recommencer']");
assert(prog().finie === false && prog().faites === 0, "les 8 phrases repartent de zéro");
assert(B.Etat.get().xp === xpFin, "aucun XP perdu ni re-gagné");
assert(etat().bonus === true, "bonus déjà acquis (pas de farming)");
assert($$("[data-fakh]").length === 2, "on peut rejouer tout de suite");
click("[data-fakh='" + attendu(courante()) + "']");
assert(B.Etat.get().xp === xpFin, "rejouer ne redonne pas d'XP");

console.log("=== un état partiel ne casse rien");
{
  const h = await charger({
    url: "http://localhost/?vue=fakh",
    etat: JSON.stringify({
      version: 1,
      fakh: { id: "fakh-u1", vu: true, reponses: { f1: { choix: "faux" }, f4: { choix: "n_importe" } }, fini: false }
    })
  });
  const f = h.B.Etat.fakh();
  assert(Object.keys(f.reponses).length === 8, "les 8 réponses existent");
  assert(f.reponses.f1.juste === true, "réponse valide conservée (f1 est un piège)");
  assert(f.reponses.f4.choix === null, "choix inconnu neutralisé");
  assert(h.B.Etat.fakhProgression().faites === 1, "1 phrase comptée");
  h.click("[data-fakh='" + (h.B.Donnees.fakhParId[h.B.Etat.fakhProgression().courante].faux ? "faux" : "vrai") + "']");
  assert(h.erreurs.length === 0, "aucune erreur JS sur un état partiel");
}

console.log("=== navigation : 1 clic depuis مساري, et l'onglet فخاخ");
{
  const h = await charger({ url: "http://localhost/" });
  h.window.localStorage.clear();
  h.B.Etat.initialiser();
  h.B.Etat.terminerOnboarding(0);
  h.B.Application.aller("masari");
  h.B.Ecrans.masari.rendre(h.doc.getElementById("ecran"));
  assert(h.$(".carte--fakh") !== null, "carte « صيّاد الفخاخ » visible dans مساري");
  h.click("[data-aller-fakh]");
  assert(h.B.Application.vue() === "fakh", "la carte mène à la chasse");
  assert(h.$("[data-vue='fakh']") !== null, "écran de la chasse rendu");
  h.B.Application.aller("masari");
  h.click("[data-onglet='tadribat']");
  assert(h.B.Application.vue() === "fakh", "l'onglet فخاخ mène à la chasse");
  assert(h.$("[data-vue='fakh']") !== null, "écran de la chasse après l'onglet");
  assert(h.erreurs.length === 0, "aucune erreur de navigation");
}

console.log("=== accès direct #fakh");
{
  const h = await charger({ url: "http://localhost/#fakh" });
  assert(h.B.Application.vue() === "fakh", "#fakh ouvre la chasse");
}

assert(erreurs.length === 0, "aucune erreur JS sur tout le parcours");
console.log("PHASE 5 · TOUT EST VERT");
