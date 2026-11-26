# Schémas « Zéro Texte IA » — Lot 3 (u6, u7, u8)

**Date** : 2026-11-26 · **Branche** : `arena/0fa86abf-bawssalate-el-3oloum` · **Périmètre** : **Lot 3 uniquement** — `u6` (photosynthèse, 2 schémas), `u7` (respiration, 3 schémas), `u8` (cycle de la matière, 1 schéma). Le Lot 4 (`u9`–`u11`) n'est **pas** commencé.

Contrairement aux Lots 1 et 2, ces unités avaient déjà des visuels : **13 WebP du manuel** (9 sur `u6`, 2 sur `u7`, 2 sur `u8`), conservées intactes. Le lot ne crée donc que ce qui **manquait** : 6 leçons sans aucun document.

---

## 1. Audit de couverture avant le lot

| Unité | Leçons | Leçons illustrées | Leçons vides |
|---|---:|---:|---|
| u6 | 7 | 5 | `phase12_chapitres_23_24`, `d2-u6-l3-calvin` |
| u7 | 5 | 2 | `phase13_chapitres_25_26`, `phase13_chapitres_25_26_2`, `phase14_chapitres_27_28` |
| u8 | 2 | 1 | `phase15_chapitres_29_30_2` |

---

## 2. Les 6 visuels, contrôlés un par un

| # | Fichier | Leçon cible | Poids | Repères | Verdict |
|---|---|---|---:|---:|---|
| 1 | `u6-cycle-calvin.svg` | `phase12_chapitres_23_24` | 3,5 Ko | 7 | VALIDE |
| 2 | `u6-calvin-experience.svg` | `d2-u6-l3-calvin` | 5,5 Ko | 5 | VALIDE |
| 3 | `u7-glycolyse.svg` | `phase13_chapitres_25_26` | 3,9 Ko | 6 | VALIDE |
| 4 | `u7-cycle-krebs.svg` | `phase13_chapitres_25_26_2` | 6,1 Ko | 6 | VALIDE (2 essais) |
| 5 | `u7-chaine-respiratoire.svg` | `phase14_chapitres_27_28` | 9,9 Ko | 7 | VALIDE (2 essais) |
| 6 | `u8-cycle-matiere-energie.svg` | `phase15_chapitres_29_30_2` | 4,5 Ko | 6 | VALIDE (2 essais) |

- **6 SVG**, **33,4 Ko** au total (3,5–9,9 Ko pièce).
- Chaque libellé arabe vit dans le registre (`labelAr` + `detailAr ≤ 90`), jamais dans le fichier.
- Aucune leçon ne dépasse 1 schéma créé ; le plafond de 2 par leçon reste respecté partout.

---

## 3. Couverture après Lot 3

| Unité | Leçons | WebP du manuel | Schémas créés | Leçons illustrées |
|---|---:|---:|---:|---:|
| u1 → u5 | 28 | 0 | 26 | 25 / 28 |
| u6 | 7 | 9 | **2** | **7 / 7** |
| u7 | 5 | 2 | **3** | **5 / 5** |
| u8 | 2 | 2 | **1** | **2 / 2** |
| u9 → u11 | 13 | 8 | 0 | 6 / 13 |
| **Total** | **55** | 21 | **32** | **44 / 55 (80 %)** |

Le Domaine 2 (transformation de l'énergie) est désormais **intégralement illustré**.

---

## 4. Défauts détectés et corrigés pendant la boucle

| Défaut | Conséquence | Correction |
|---|---|---|
| **Texte arabe écrit dans les SVG** (`تجديد RuBP`, `غلوكوز`…) | le garde-fou `verifier-hors-ligne.mjs` refuse un SVG avec de l'arabe incrusté — et le rastériseur Python ne gère pas le bidi (libellés illisibles) | **tout l'arabe retiré des 6 fichiers** : seuls des symboles latins contrôlés restent (RuBP, PGAL, APG, ATP, NADPH, ¹⁴CO₂, hν, T1–T4) ; les termes arabes passent dans `annotations`/`legendeAr`. C'est la règle du prompt, appliquée strictement. |
| Pastilles posées **sur** les libellés des boîtes | les mots-clés (`RuBP`, `Citrate`, `ATP synthase`, `PGAL`) disparaissaient sous le numéro | chaque pastille rejetée au coin ou au-dessus de la boîte ; contrôle par composite |
| `u7-cycle-krebs` : pastilles 2/3/4 au centre des nœuds, « 1 ATP » sur le nœud bas, flèche CO₂ traversant le coin de la boîte | numéros et libellés se chevauchaient | repères sortis des boîtes, sortie ATP déplacée à droite, flèche CO₂ dégagée |
| `u7-chaine-respiratoire` : `T2` recevait une flèche de pompe à H⁺ | **erreur scientifique** : T2 (FADH₂) ne pompe pas de protons | seules T1, T3 et T4 pompent ; la 4ᵉ flèche supprimée |
| `u8-cycle-matiere-energie` : flèches de chaleur dirigées **vers** la mitochondrie | le sens du flux énergétique s'inversait | flèches retournées, sortant du compartiment ; `chaleur` en bas |
| `u7-chaine-respiratoire` : « ATP » écrit deux fois (dans la synthase et en dessous) | doublon ambigu | la boîte porte `ATP synthase`, la sortie porte `ATP` |
| `u6-calvin-experience` : pastilles 1 et 4 superposées au coin supérieur | deux numéros illisibles | 1 sur le pic APG, 4 près de la flèche d'injection |
| Unités `u6`/`u7`/`u8` comptées **deux fois** dans le test de somme (WebP + schémas) | `expected 72 to be 53` | clés d'unités dédupliquées, et le test « 9/2/2/4/4 » ne compte plus que les `webp_legacy` |
| `labelAr` sans aucun caractère arabe (`PGAL (C3)`, `3 NADH`, `ATP synthase`, `CO₂ + H₂O`) | test « libellé réellement arabe » rouge | libellés réécrits en arabe (`سكر PGAL (C3)`, `ثلاثة نواقل NADH`, `مركّب ATP synthase`, `ثاني أكسيد الكربون والماء`) |

---

## 5. Limites honnêtes

1. **Aucune signature humaine** : 53 entrées, toutes `a_valider_enseignant` + `reviewed: false`.
2. **Les 13 WebP du manuel restent en place** : ce sont des recréations IA (cf. A-068), et 3 d'entre elles portent du texte incrusté d'origine. Elles ne sont ni modifiées ni promues ; le lot ne fait qu'ajouter les schémas manquants.
3. **Pas de navigateur ici** : contrôle par rastériseur partiel + composites. L'aperçu réel reste `npm run dev`.
4. **Trois planches volontairement schématiques** : la chaîne respiratoire ne dessine que 4 complexes (T1–T4) et une ATP synthase ; Krebs regroupe les 8 étapes en 4 nœuds ; Calvin ne détaille pas les 15 réactions. C'est le niveau attendu par le programme, pas une limite de rendu.

---

## 6. Porte de validation — résultats

| Commande | Résultat |
|---|---|
| `npm run lint` (`eslint .`) | **0 erreur** |
| `npx tsc --noEmit` | **0 erreur** |
| `npm test` (`vitest run`) | **86 fichiers / 729 tests — 100 % OK** |
| `npm run build` | OK — `index-*.js` 497,94 Ko · `schemasSvt-*.js` 52,47 Ko (gzip 13,39), toujours hors démarrage |
| `node scripts/verifier-hors-ligne.mjs` | **RÉSULTAT : OK** — 53 illustrations, coquille 2,21 Mio, 0 incohérence |
| `node scripts/sync-metrics.mjs --check` | README à jour, aucune dérive |
| `node scripts/generer-schemas-svt.mjs --verifier` | **27 / 27 identiques** |

### Tests mis à jour

- `src/data/__tests__/illustrationsLecons.test.ts` : 32 schémas (`{u1:5, u2:5, u3:6, u4:6, u5:4, u6:2, u7:3, u8:1}`), 27 SVG + 5 WebP annotées, 31 leçons distinctes, disque = registre (**53 fichiers**), 0 `reviewed: true`, test legacy restreint aux `webp_legacy`, somme des unités dédupliquée.
- `src/__tests__/metriques.test.ts` : 53 visuels, 27 SVG, 10 unités couvertes.

**Arrêt à la porte** : Lot 4 (`u9`–`u11`) non entamé.
