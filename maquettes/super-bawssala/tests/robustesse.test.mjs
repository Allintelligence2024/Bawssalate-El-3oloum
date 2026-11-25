/* Robustesse — l'utilisateur ne doit jamais voir un écran vide.
   1) sans scripts : amorce visible ;
   2) sans matchMedia : l'app démarre quand même ;
   3) stockage bloqué : l'app démarre, stockageOk=false ;
   4) écran qui plante : panneau d'erreur avec boutons. */
import { charger, assert } from "./harness.mjs";

console.log("=== 1. sans JavaScript applicatif");
const nu = await charger({ sansScripts: true });
assert(!!nu.$(".amorce"), "amorce de chargement visible dans #ecran");
assert(nu.txt(".amorce").includes("جارٍ التحميل"), "texte d'attente présent");

console.log("=== 2. sans matchMedia");
const sansMM = await charger({ sansMatchMedia: true });
assert(!!sansMM.$(".intro__titre") || !!sansMM.$("[data-vue='masari']"), "l'app démarre sans matchMedia");
assert(!sansMM.$(".amorce"), "l'amorce disparaît après le rendu");
assert(sansMM.erreurs.length === 0, "aucune erreur jsdom");

console.log("=== 3. stockage bloqué");
const bloque = await charger({ stockageKO: true });
assert(!!bloque.$(".intro__titre"), "l'app démarre sans localStorage");
assert(bloque.B.Etat.stockageOk() === false, "stockage signalé indisponible");
bloque.B.Etat.ajouterXp(5);
assert(bloque.B.Etat.get().xp >= 5, "l'état vit en mémoire");

console.log("=== 4. écran qui plante");
const plante = await charger();
plante.B.Ecrans.masari.rendre = () => {
  throw new Error("boum de test");
};
plante.B.Application.aller("masari");
assert(!!plante.$("[data-vue='panne']"), "panneau d'erreur affiché");
assert(plante.txt("[data-vue='panne']").includes("ما قدرناش"), "message arabe lisible");
assert(!!plante.$("[data-panne='reload']"), "bouton recharger présent");
assert(plante.txt(".panne__trace").includes("boum de test"), "trace technique visible");

console.log("\nROBUSTESSE · TOUT EST VERT");
