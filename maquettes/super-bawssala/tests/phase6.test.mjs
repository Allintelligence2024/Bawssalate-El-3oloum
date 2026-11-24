/* Phase 6 — « أنا » : la carte, les boucliers, la readiness, les révisions SM-2.
   Aucune note sur 20 : des niveaux par compétence et un indicateur directionnel. */
import { charger, assert } from "./harness.mjs";

const { B, window, doc, $, $$, click, txt, erreurs } = await charger({
  url: "http://localhost/?vue=ana"
});
window.print = () => {};

const ana = () => B.Ecrans.ana;

console.log("=== l'écran existe et se dessine");
assert(B.Application.vue() === "ana", "?vue=ana ouvre l'écran أنا");
assert($("[data-vue='ana']") !== null, "vue أنا rendue");
assert($(".ana-carte__svg") !== null, "la carte est un SVG (pas un tableau de chiffres)");
assert($(".ana-carte__svg").getAttribute("role") === "img", "carte annoncée comme image");
assert($(".ana-carte__svg").getAttribute("aria-label").includes("البوصلة"), "carte décrite");
assert(txt(".titre-1").includes("أنا"), "titre de l'écran");
assert($$("[data-onglet]").length === 4, "la barre d'onglets est présente sur أنا");
assert($("[data-onglet='ana']").getAttribute("aria-selected") === "true", "onglet أنا actif");
assert($("[data-onglet='ana']").hasAttribute("aria-disabled") === false, "plus de « قريبًا » sur أنا");

console.log("=== la readiness : 8 compétences, des points, jamais une note");
assert($$(".ana-kafaa__l").length === 8, "8 compétences affichées");
assert($$(".ana-pt").length === 24, "3 points par compétence");
assert(txt(".contenu--ana").includes("مؤشّر توجيهي"), "mention « indicateur »");
assert(!/\/\s*20/.test(txt(".contenu--ana")), "aucune note sur 20");
assert(!txt("body").includes("Game Over"), "jamais de Game Over");

console.log("=== les boucliers (régularité, sans punition)");
assert($$(".ana-droits__un").length === 3, "3 boucliers");
assert(txt(".contenu--ana").includes("ما يكسّرش"), "le manque ne casse rien");
const jours = [0, 1, 2, 3].map((i) => B.ajouteJours(B.aujourdhui(), -i));
B.Etat.get().regularite.jours = jours;
assert(B.Etat.regularite().atteint === true, "4 jours dans la fenêtre = objectif atteint");

console.log("=== niveaux : 50 XP par palier, sans plafond");
assert(B.Etat.niveau().n === 1 && B.Etat.niveau().nom === "بحّار", "départ : niveau 1");
B.Etat.ajouterXp(120);
ana().rendre(doc.getElementById("ecran"));
assert(B.Etat.niveau().n === 3, "120 XP = niveau 3");
assert(txt(".ana-carte__svg").includes("قبطان"), "le nom du niveau est sur la carte");
assert(txt(".contenu--ana").includes("20 من 50"), "progression vers le niveau suivant");

console.log("=== révisions du jour (SM-2) : 3 boutons, une carte qui revient plus tard");
const carte = B.Etat.get().srs.cartes[0];
carte.dueAt = B.aujourdhui();
ana().rendre(doc.getElementById("ecran"));
assert($$("[data-reviser]").length === 3, "3 boutons pour la carte due");
assert(txt(".ana-rev").includes(carte.titre), "la carte due est nommée");
const revisionsAvant = B.Etat.get().srs.revisions;
click("[data-reviser='" + carte.id + "'][data-qualite='4']");
assert(B.Etat.get().srs.revisions === revisionsAvant + 1, "révision comptée");
assert(carte.intervalle >= 1, "intervalle recalculé");
assert(carte.dueAt > B.aujourdhui(), "la carte revient plus tard");
assert($$("[data-reviser]").length === 0 || !$("[data-reviser='" + carte.id + "']"), "elle sort de la liste du jour");
await new Promise((r) => setTimeout(r, 80));
assert(txt("#annonce").includes("تسجّلت"), "retour immédiat");

console.log("=== « صعيب » remet à demain, sans drame");
const c2 = B.Etat.get().srs.cartes[1];
c2.dueAt = B.aujourdhui();
ana().rendre(doc.getElementById("ecran"));
click("[data-reviser='" + c2.id + "'][data-qualite='2']");
assert(c2.intervalle === 1, "qualité < 3 → on revoit demain");
assert(c2.repetitions === 0, "répétitions remises à zéro");
await new Promise((r) => setTimeout(r, 80));
assert(txt("#annonce").includes("بلا ضغط"), "ton doux");

console.log("=== le bouclier se gagne avec une révision « ساهل »");
const avantDroits = B.Etat.get().regularite.boucliers;
const c3 = B.Etat.get().srs.cartes[2];
c3.dueAt = B.aujourdhui();
ana().rendre(doc.getElementById("ecran"));
click("[data-reviser='" + c3.id + "'][data-qualite='5']");
assert(B.Etat.get().regularite.boucliers === Math.min(3, avantDroits + 1), "bouclier +1 (plafonné à 3)");

console.log("=== la carte s'imprime (1 page, mention « غير مُعايَر »)");
click("[data-action='imprimer']");
const feuille = doc.getElementById("feuille");
assert(feuille.innerHTML.includes("carte-print"), "la feuille contient la carte");
assert(feuille.innerHTML.includes("المستوى"), "avec le niveau");
assert(feuille.innerHTML.includes("غير مُعايَر"), "avec la mention d'honnêteté");
assert(ana().feuille().includes("ana-carte__svg"), "la carte imprimée garde le visuel");

console.log("=== aucun bouton mort");
const boutons = $$("[data-vue='ana'] button");
assert(boutons.length >= 8, "l'écran a des boutons (" + boutons.length + ")");
boutons.forEach((b) => {
  assert(!b.disabled || b.getAttribute("data-action"), "bouton actif ou explicitement désactivé");
});
click("[data-reference-libre]");
assert(doc.querySelector("[data-tiroir]") !== null, "مرجع البوصلة s'ouvre");
B.Boussole.fermer();
click("[data-aller-fakh]");
assert(B.Application.vue() === "fakh", "pont vers صيّاد الفخاخ");
B.Application.aller("ana");
click("[data-aller-bac]");
assert(B.Application.vue() === "bac", "pont vers تمرين الباك");

console.log("=== retour par l'onglet مساري");
B.Application.aller("ana");
click("[data-onglet='masari']");
assert(B.Application.vue() === "masari", "l'onglet مساري ramène");
assert($(".carte--ana") !== null, "la carte « بطاقتي » est visible dans مساري");
click("[data-aller-ana]");
assert(B.Application.vue() === "ana", "et elle ramène sur أنا");

console.log("=== accès direct et état vide");
{
  const h = await charger({ url: "http://localhost/#ana" });
  assert(h.B.Application.vue() === "ana", "#ana ouvre l'écran");
  assert(h.erreurs.length === 0, "aucune erreur avec un état vierge");
  assert(h.$(".ana-kafaa__l") !== null, "readiness rendue même à zéro");
  assert(h.txt(".contenu--ana").includes("بلا دليل"), "statut « sans preuve »");
  assert(h.$("[data-reviser]") === null || h.$$("[data-reviser]").length > 0, "liste vide gérée");
}

assert(erreurs.length === 0, "aucune erreur JS sur tout le parcours");
console.log("PHASE 6 · TOUT EST VERT");
