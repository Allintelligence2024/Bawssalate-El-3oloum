# Preuve P0.3 — sauvegarde et restauration : compatibilité, pannes, assistance

> **Date :** 18/11/2026 · **Mise à jour :** 20/11/2026 (restauration atomique, §5) ·
> **Tâche :** P0.3 de `plans/PASSATION-RESTE-A-FAIRE.md`
> (« Fiabiliser sauvegarde et restauration »).
> **Responsables :** exécution = agent (tests et preuves déposées) ; validation des données
> réelles d'élèves et essais sur web/Android réels = humains (QA appareils).
> **Méthode :** données **fictives** uniquement ; localStorage simulé multi-clés avec clés
> d'écriture bloquables (quota) ; fichiers JSON synthétiques pour la matrice.

## 1. Matrice de compatibilité (tests `sauvegarde-compat.test.ts`)

Validation avant toute modification : `src/utils/backup.ts:57-79` (`lireSauvegarde` /
`etatDepuisFichier`, zod) — un fichier invalide renvoie `null` **sans toucher à l'état**.

| Format | Version | Résultat | Test |
|---|---|---|---|
| Enveloppe `{application, version, exporteLe, etat}` | 1, 2, 3 | **accepté** | « enveloppe v1, v2, v3 acceptées » |
| Plat (progression à la racine, format historique) | 1, 2, 3 | **accepté** | « format plat … v1, v2, v3 accepté » |
| Enveloppe ou plat | 0, 4, 999, `"3"` (texte), `null` | **refusé** (`null`) | « versions inconnues refusées … » |
| Enveloppe sans `etat` / tableau / texte / `null` | — | **refusé** | `storage.test.ts` « un fichier invalide → null » |
| Progression mal typée, `notes` non liste, `minutesTotales` négative | — | **refusé** | `storage.test.ts` « rejette les données mal formées… » |
| Stats invalides dans le fichier | — | **refusé entièrement**, rien n'est restauré | « statistiques invalides dans le fichier → refusé » |
| **Ancien fichier sans statistiques** | 1 | import OK, **stats actuelles conservées** | « ancien fichier sans statistiques → … conservées » (rejoue la condition `stats` de `storage.restaurerEtatEtStats`, §5) |
| Fichier avec stats valides | 3 | stats restaurées à l'identique | `storage.test.ts` « exporte et restaure les statistiques… » |
| Fichier portant `compte`/`consentementSync` (copie tierce) | — | **jamais importés** (identité locale conservée) | `storage.test.ts` « conserve le compte et le consentement courants » |

Borne annoncée et **non vérifiable ici** : l'import UI est limité à **5 Mio**
(`Ana.tsx:164`) et aux bornes par champ du schéma zod (listes ≤ 5000, textes ≤ 10 000…).
La compatibilité avec **toutes les données réelles d'élèves** reste donc à confirmer sur des
fichiers réels (humain) — jamais affirmée ici.

## 2. Tests de panne (mêmes tests, localStorage simulé)

| Panne simulée | Comportement observé | Garantie |
|---|---|---|
| **Quota plein** sur l'état | alerte déclenchée (`surEchecSauvegarde`), **ancien contenu disque intact** | rien n'est corrompu, l'échec n'est jamais silencieux |
| **JSON local corrompu** | `chargerEtat` → état vierge **+ protection** : sauvegarde ultérieure refusée tant que le remplacement n'est pas confirmé ; **export possible** depuis la mémoire → paquet réimportable ; remplacement explicite (`autoriserRemplacementEtat`) puis écriture OK | l'élève peut exporter ce qui est en mémoire ; l'original n'est ni lu ni écrasé à tort |
| **Écriture partielle A** : stats échouent, état réussit | alerte ; disque : anciennes stats absentes ; mémoire : nouvelles ; état écrit ; relecture d'une « nouvelle session » cohérente | divergence **visible et signalée**, jamais un JSON cassé |
| **Écriture partielle B** : état échoue, stats réussissent | alerte ; **ancien état intact** (ni écrasé ni corrompu) ; stats écrites ; relecture = ancien état valide | idem — les deux clés sont indépendantes, aucune ne détruit l'autre |
| **Lecture refusée** (mode privé) | pas d'écriture tant que la lecture a échoué, alerte | `storage.test.ts` « ne remplace pas des données existantes… » |
| **Restauration + redémarrage** | import → fusion (`fusionnerProgressionImportee`) → écriture → relecture : progression **identique**, `compte` et consentement **locaux** jamais pris au fichier | aller-retour complet prouvé |
| **Partage annulé** (Android, `Ana.tsx:66-70`) | message « أُلغي أو تعذّر المشاركة… » ; l'export **n'écrit rien** dans le stockage | test « JSON local corrompu » : export sans écriture ; texte présent vérifié par test source |

**Écriture atomique état+stats :** les tests de cette section (18/11) documentaient l'ancien
design **non atomique** (deux écritures séparées, `storage.ts` et `stats.ts`) et sa
récupération vérifiable en cas d'échec partiel — chaque échec signalait une alerte et ne
corrompait jamais l'autre clé. La restauration atomique complète a été **reproduite et
prouvée le 20/11/2026** (voir §5) : un import engage désormais l'état ET les statistiques
en une seule écriture, avec annulation complète si le stockage refuse.

Sortie brute (18/11/2026) :

```
✓ src/utils/__tests__/sauvegarde-compat.test.ts (11 tests) 54ms
✓ src/__tests__/sauvegarde-ui.test.ts (4 tests) 797ms
 Test Files  2 passed (2)
      Tests  15 passed (15)
```

(4 tests UI dont **2 nouveaux** : JSON illisible → message sans restauration ; ancien
fichier plat → `restaurer(etat, undefined)`.)

## 3. Aucune restauration invalide n'écrase l'état utile — preuves

1. Validation zod **avant** toute modification : fichier invalide → `null` → l'UI n'appelle
   jamais `onRestaurer` (`Ana.tsx:169-173`), testé pour : JSON cassé (nouveau), format non
   backup, fichier > 5 Mio, progression mal formée, version inconnue, stats invalides.
2. Confirmation obligatoire avant remplacement (`Ana.tsx:174`, annulation testée :
   `sauvegarde-ui.test.ts`).
3. Protection anti-écrasement après lecture impossible (`storage.ts:16-43`) : la sauvegarde
   automatique est refusée jusqu'à un remplacement **confirmé**.
4. Identité/consentement locaux toujours conservés à l'import (`storage.ts:75-78`).

## 4. Parcours d'assistance documenté (textes réels, testés par test source)

| Situation | Message affiché (source) | Ce que fait l'élève |
|---|---|---|
| Fichier > 5 Mio | `الملف أكبر من ٥ ميغابايت.` (`Ana.tsx:165`) | exporter un fichier plus petit / vérifier le fichier choisi |
| Fichier pas une sauvegarde | `هذا الملف ليس نسخة احتياطية…` (`Ana.tsx:171`) | choisir un fichier JSON sorti de l'app |
| JSON illisible | `لم أستطع قراءة الملف…` (`Ana.tsx:178`) | ré-exporter depuis l'app d'origine |
| Confirmation | `ستُستبدل بيانات تقدّمك الحالية… النسخ القديمة لا تحتوي على الإحصاءات، فتظلّ الحالية` (`Ana.tsx:174`) | annuler ou continuer (les stats actuelles sont conservées sur ancien format) |
| Stockage plein / échec d'écriture | alerte `AlerteStockage` (`App.tsx:548,853`) + export possible | libérer de l'espace, réessayer, exporter |
| JSON local corrompu | protection + alerte ; export mémoire possible | exporter ce qui reste, puis remplacement confirmé |
| Suppression du compte local | `يُحذف الحساب المحلي فقط… لا يحذف هذا بيانات الخادم ولا يستعيد رمزها.` (`Inscription.tsx:278`) | comprendre : ni purge serveur, ni récupération de jeton (la suppression serveur est dans « الخصوصية ») |
| Partage annulé (Android) | `أُلغي أو تعذّر المشاركة…` (`Ana.tsx:69`) | réexporter et enregistrer dans un endroit sûr |

Vérifié par le test « parcours d'assistance : les textes annoncent les vraies limites ».

## 5. Restauration atomique état+stats (20/11/2026 — reproduction approuvée)

Un rapport d'agent du 19/11 annonçait cette écriture atomique et un suivi
`plans/VALIDATION-2026-11-19.md`, mais **aucun fichier, commit, branche, stash ni objet
détaché ne contenait ce travail** (vérifié le 20/11 sur le repo, GitHub, les worktrees et
`git fsck`). La reproduction a été **approuvée par l'utilisateur** (« Reproduire et
commiter ») et réalisée le 20/11/2026 :

- **`storage.ts` → `restaurerEtatEtStats(etat, stats?)`** :
  - *Phase d'engagement* : **une seule écriture** du journal `murajih_restauration_v1`
    contenant à la fois la progression **et** les statistiques. Quota ici → **aucune autre
    clé n'est touchée**, alerte, retour `false`.
  - *Phase d'application* : écriture de l'état (`murajih_svt_v1`) puis, si présent, des
    statistiques (`kunz_stats_v1`), puis retrait du journal.
    - Quota sur l'état : `setItem` est atomique par clé → ancien contenu déjà intact,
      journal annulé.
    - Quota sur les statistiques : l'ancien octet de l'état est remis en place (coût
      équivalent au journal qui vient de réussir), puis journal annulé.
  - Dans **tous** les cas d'échec : alerte signalée, **mémoire jamais touchée** (l'état
    affiché ne bouge pas), retour `false` → l'UI reste en place et le bandeau s'affiche.
- **`storage.ts` → `chargerEtat()` rejoue le journal** s'il est présent au chargement
  (rechargement au milieu de l'opération) : la restauration est **complète ou absente,
  jamais à moitié**. Un journal illisible est abandonné sans crash, l'état du disque reste
  la source.
- **`stats.ts`** : `appliquerStats()` (mémoire seule, alignée par le rejeu ou le succès) et
  `CLE_STATS` exporté ; `restaurerStats` reste disponible.
- **`App.tsx` → `onRestaurerEtat`** : fusion courant↔importé, puis
  `restaurerEtatEtStats(fusionne, stats)` ; sur `false` : aucun changement d'affichage.
- **Ancien fichier sans statistiques** (`stats === undefined`) : la clé des statistiques
  n'est pas touchée et la mémoire conserve les statistiques existantes.

**9 nouveaux tests** (`src/utils/__tests__/restauration-atomique.test.ts`, localStorage
simulé, quota simulé par clé, `vi.resetModules()` pour le rechargement des modules) :

| Scénario | Résultat |
|---|---|
| Succès complet | 1ʳᵉ écriture = journal contenant état **et** stats ; application sur les 2 clés ; journal retiré ; mémoire alignée ; relecture OK |
| Ancien fichier sans stats | clé + mémoire des stats conservées, progression restaurée |
| Quota sur le journal | rien d'autre touché, alerte, mémoire inchangée |
| Quota sur la clé état | ancien contenu intact, journal annulé, alerte |
| Quota sur la clé stats | ancien état remis en place, stats anciennes intactes, alerte |
| Journal corrompu | abandonné proprement, ancien état relu, aucun crash |
| Lecture en échec puis restauration refusée | protection anti-écrasement conservée ; succès → protection levée |
| Redémarrage après succès | progression à l'identique, compte et consentement locaux conservés |
| Rechargement au milieu (`vi.resetModules()`) | journal rejoué : état + stats complets, journal retiré une seule fois |

Sortie brute (20/11/2026) :

```
 Test Files  33 passed (33)
      Tests  191 passed (191)
```

**Limites honnêtes :** quota **simulé** par clé (pas de quota navigateur réel), environnement
jsdom ; l'essai sur **web et Android réels** (quota plein réel, reprise après redémarrage)
reste humain (§6). Les **écritures concurrentes entre onglets** ne sont pas réglées par cette
écriture atomique — arbitrage serveur/coordination toujours ouvert (passation).

## 6. Reste humain (rappel unique, voir passation §P0.3)

1. Rejouer la matrice sur **web et Android réels** : quota plein réel, lecture refusée,
   première ouverture, partage annulé, restauration + redémarrage réels.
2. Tester la compatibilité avec de **vrais fichiers d'élèves** (bornes 5 Mio / zod).
3. ~~Écriture atomique état+stats~~ : **faite et prouvée le 20/11/2026 (§5)** ; il reste à
   rejouer les scénarios de quota sur **web et Android réels** (quota navigateur réel,
   redémarrage réel) et à statuer sur les écritures concurrentes entre onglets.

## 7. Références

- `src/utils/__tests__/restauration-atomique.test.ts` (9 tests, 20/11/2026)
- `src/utils/__tests__/sauvegarde-compat.test.ts` (11 tests, 18/11/2026)
- `src/__tests__/sauvegarde-ui.test.ts` (4 tests, dont 2 nouveaux)
- `src/utils/__tests__/storage.test.ts` (préexistant : protection, aller-retour, rejets)
- `src/utils/backup.ts`, `src/utils/storage.ts`, `src/utils/stats.ts`, `src/components/Ana.tsx`
