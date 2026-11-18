# Preuve P0.3 — sauvegarde et restauration : compatibilité, pannes, assistance

> **Date :** 18/11/2026 · **Tâche :** P0.3 de `plans/PASSATION-RESTE-A-FAIRE.md`
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
| **Ancien fichier sans statistiques** | 1 | import OK, **stats actuelles conservées** | « ancien fichier sans statistiques → … conservées » ( rejoue la branche `if (stats)` de `App.tsx:527` ) |
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

**Écriture atomique état+stats :** l'état (`murajih_svt_v1`) et les statistiques
(`kunz_stats_v1`) sont écrits séparément (`storage.ts:80-89`, `stats.ts:116-121`) — c'est le
design actuel, **non atomique**. La passation demandait « une restauration durable/atomique
**ou** une récupération vérifiable en cas d'échec partiel » : c'est la **deuxième branche**
qui est démontrée ci-dessus — chaque échec signale une alerte, ne corrompt jamais l'autre
clé, et un réimport après libération d'espace restaure tout (aller-retour prouvé). Rien n'a
été changé au design sans arbitrage humain.

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

## 5. Reste humain (rappel unique, voir passation §P0.3)

1. Rejouer la matrice sur **web et Android réels** : quota plein réel, lecture refusée,
   première ouverture, partage annulé, restauration + redémarrage réels.
2. Tester la compatibilité avec de **vrais fichiers d'élèves** (bornes 5 Mio / zod).
3. Décider (arbitrage) d'une éventuelle écriture état+stats atomique si les essais réels
   révèlent un échec partiel fréquent.

## 6. Références

- `src/utils/__tests__/sauvegarde-compat.test.ts` (11 tests, 18/11/2026)
- `src/__tests__/sauvegarde-ui.test.ts` (4 tests, dont 2 nouveaux)
- `src/utils/__tests__/storage.test.ts` (préexistant : protection, aller-retour, rejets)
- `src/utils/backup.ts`, `src/utils/storage.ts`, `src/utils/stats.ts`, `src/components/Ana.tsx`
