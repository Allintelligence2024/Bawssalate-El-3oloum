# Preuve P0.2 — suppression durable : chaîne UI → réseau → serveur

> **Date :** 18/11/2026 · **Tâche :** P0.2 de `plans/PASSATION-RESTE-A-FAIRE.md`
> (« Garantir ou qualifier la suppression durable »).
> **Responsables :** exécution = agent (tests simulés + preuves déposées) ;
> **décision** d'une coordination/garantie serveur, **définition** d'une politique de
> conservation et **revue de sécurité** = humains (audit P0.1 §4-§5).
> **Méthode :** client réseau simulé (compteur d'appels, même serveur pour les deux onglets)
> + matrice RLS réelle exécutée en `begin/rollback` sur le projet connecté avec des données
> fictives (P0.1). Aucune donnée réelle créée, modifiée ou supprimée.

## 1. Chaîne UI → réseau → serveur

| Étape | Endroit | Comportement vérifié | Preuve |
|---|---|---|---|
| UI : bouton + confirmation | `src/components/Confidentialite.tsx:34-42` | le consentement est retiré **avant et après** l'appel serveur ; l'issue est affichée en 6 textes distincts | test « textes UI conformes » (§3) |
| UI : avertissement inter-onglets | `Confidentialite.tsx:45` (issue `supprime`) | dit explicitement que d'autres appareils/onglets peuvent **réécrire** la ligne et doivent être arrêtés | test source (§3) |
| UI : indéterminé | `Confidentialite.tsx:46` (issue `indetermine`) | nomme les 2 causes possibles (ligne absente **ou** jeton invalide), propose « إعادة المحاولة » | test source (§3) |
| Client : arrêt des envois | `src/utils/sync.ts:117` (`suspendreSync`), `:199-207` | à l'entrée d'une suppression : suspension dans **cet onglet** + attente de l'envoi en cours (`enCours`) | tests §3 (« réponse perdue », « deux onglets ») |
| Client : confirmation honnête | `sync.ts:210-215` | DELETE avec `.select()` : **1 ligne → `supprime`**, **0 ligne → `indetermine`**, erreur/réseau → `erreur` (jamais `supprime`) | tests §3 |
| Client : réactivation | `sync.ts:119` + `App.tsx:501` | après suppression, l'envoi ne reprend que par `reprendreSync` — appelé sur **ré-engagement explicite** (consentement) | test « réactivation » (§3) |
| Réseau/serveur (réel) | projet `kpjcgiwysmqysanqtfkj` | RLS : UPDATE avec jeton faux → `42501`, 0 écriture (P0.1 S5/S5b) ; DELETE bon/mal/aucun jeton → **1/0/0** (S8) ; ligne `jeton NULL` → 0/0 (S9) ; 0 ligne résiduelle au final | `plans/AUDIT-RLS-P0.1-2026-11-18.md` §3, exécuté en `begin/rollback`, données fictives |

## 2. Scénarios de la passation testés (isolé, simulé)

Les 4 scénarios demandés au §P0.2 sont couverts, plus les 2 restants déjà présents dans
`src/utils/__tests__/sync.test.ts` :

| Scénario de la passation | Test | Résultat |
|---|---|---|
| Deux onglets / deux appareils | `suppression-durable.test.ts` — « deux onglets : le DELETE de l'onglet A n'arrête pas l'onglet B qui réécrit la ligne » | **course DÉMONTRÉE** : 1 upsert avant, 1 suppression, puis l'onglet B (module frais) réécrit → 2ᵉ upsert |
| UPSERT retardé après DELETE | `sync.test.ts` — « attend un envoi déjà parti et bloque tout nouvel envoi avant DELETE » | l'envoi en cours est attendu, les nouveaux bloqués, puis DELETE → `supprime` |
| Coupure réseau / réponse perdue | `suppression-durable.test.ts` — « réseau coupé » (0 requête → `hors_ligne`) et « réponse perdue » (`erreur`, **jamais** `supprime`, envois bloqués, bouton retry → `supprime`) | ✅ |
| Jeton invalide / absence de ligne | `suppression-durable.test.ts` — « ligne absente ou jeton refusé par la RLS → `indetermine` » + `sync.test.ts` « zéro ligne est indéterminé » | ✅ (0 ligne = refus serveur ou ligne déjà partie — non distinguable, dit tel quel à l'élève) |
| Réactivation après consentement | `suppression-durable.test.ts` — « seul un ré-engagement explicite (reprendreSync…) relance l'envoi » + `sync.test.ts` (g) | ✅ |

Sortie brute (18/11/2026, `npx vitest run src/utils/__tests__/suppression-durable.test.ts`) :

```
✓ src/utils/__tests__/suppression-durable.test.ts (6 tests) 70ms
 Test Files  1 passed (1)
      Tests  6 passed (6)
```

(Le `console.warn` `[sync] استثناء الحذف` en stderr est le panne réseau **simulée** du test
« réponse perdue » — comportement attendu du client.)

## 3. Texte utilisateur conforme (test source)

Test « textes UI conformes à la garantie réellement obtenue (Confidentialite.tsx) » vérifie
la présence, dans le composant réel, des 6 phrases qui qualifient la garantie :

1. autres onglets/appareils peuvent réécrire (avertissement) ;
2. « 0 ligne » = jeton invalide possible (indéterminé nommé) ;
3. durée de conservation et purge automatique **non confirmées** (§4 ci-dessous) ;
4. la suppression serveur ne touche pas les données du téléphone ;
5. bouton de nouvelle tentative après erreur/indéterminé ;
6. retrait de consentement : les envois déjà partis peuvent se terminer.

## 4. Durée de conservation — vérification honnête

- `grep -i 'purge|retention|cron' supabase/schema.sql` → **0 occurrence** : aucune purge,
  aucune durée de conservation, aucun job planifié n'existe côté serveur.
- L'UI (`Confidentialite.tsx:103`) dit exactement : « مدّة الاحتفاظ والحذف التلقائي من جهة
  المطوّر **غير مؤكّدين** حاليًّا » → le texte est **conforme** à l'absence de garantie réelle.
- **Donc :** la conservation n'est pas « courte » ou « longue », elle est **indéfinie et non
  documentée**. Définir une politique réelle (durée, purge, alignement du texte) est une
  décision humaine — proposition §4 de l'audit P0.1, non approuvée.

## 5. Garanties obtenues et bornes

**Obtenues (démontrées ci-dessus) :**
- Même onglet : après la demande, **aucun nouvel envoi** ; l'envoi en cours est attendu ;
  la confirmation n'apparaît que sur **1 ligne réellement supprimée**.
- Aucune fausse confirmation : réseau coupé → `hors_ligne` ; 0 ligne → `indetermine` ;
  exception → `erreur` — jamais `supprime`.
- Texte UI conforme à chacune de ces issues.

**Non obtenues (démontrées aussi — et donc assumées, pas niées) :**
- **Inter-onglets/appareils :** le test prouve qu'un second onglet peut réécrire la ligne
  après le DELETE. La seule parade actuelle = l'avertissement à l'élève + l'arrêt manuel de
  l'autre onglet. Une coordination/garantie côté serveur (jeton à usage unique, verrou de
  suppression, etc.) reste une **proposition non approuvée** (audit P0.1 §4).
- **Conservation :** aucune purge automatique (§4) — durée réelle = indéfinie, dite telle
  quelle dans l'UI.

## 6. Reste humain (rappel unique, voir passation §P0.2)

1. Décider/implementer (ou refuser) une coordination serveur anti-réécriture inter-onglets.
2. Définir la politique de conservation réelle et aligner le texte UI.
3. Revue de sécurité indépendante de l'ensemble (audit P0.1 §5).

## 7. Références

- `src/utils/__tests__/suppression-durable.test.ts` (6 tests, 18/11/2026)
- `src/utils/__tests__/sync.test.ts` (préexistant : consentement, envoi en cours, zéro ligne)
- `src/components/Confidentialite.tsx` (flux de suppression, 6 issues)
- `plans/AUDIT-RLS-P0.1-2026-11-18.md` (matrice réelle S1-S10, e1-e4)
- `plans/preuves/confidentialite-serveur.md` (déploiement du schéma + DELETE prouvé)
