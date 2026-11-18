# Audit sécurité P0.1 — règles serveur (RLS) et accès anciens

**Date :** 18/11/2026 · **Révision :** `7f23161` (main, merge PR #4)
**Périmètre :** `supabase/schema.sql`, `src/utils/sync.ts`, `src/utils/compte.ts`,
`src/components/Confidentialite.tsx` — lecture de code + **matrice d'essais exécutée le
18/11/2026** sur le projet connecté avec données fictives (§3).
**Limite :** analyse statique, tests locaux et matrice SQL (rôles/headers simulés, couche
PostgREST et réseau non testés). Aucun essai destructif sur des données réelles (table
vide, chaque lot roulé en arrière, comptes = 0 vérifié). Pas d'audit externe.
Ce document **ne certifie pas** la sécurité ; il classe les risques et consigne les preuves.

## 1. État des règles (relu sur le projet connecté le 17/11, migrations `init_eleves_et_rls` + `ajouter_lecture_proprietaire` ; policies re-relues dans `pg_policies` le 18/11 — identiques)

| Policy | Commande | Expression | Rôle |
|---|---|---|---|
| `ecriture_app` | INSERT | `WITH CHECK (true)` | anon |
| `maj_app` | UPDATE | `USING/WITH CHECK (jeton IS NULL OR jeton = en-tête)` | anon |
| `suppression_app` | DELETE | `USING (jeton IS NOT NULL AND jeton = en-tête)` | anon |
| `lecture_proprietaire` | SELECT | `USING (jeton IS NOT NULL AND jeton = en-tête)` | anon |

RLS activé ; la clé primaire est `email` ; `anon` a les privilèges table INSERT/UPDATE/DELETE/SELECT.

## 2. Constats

### 🔴 F1 — Squatting d'adresse : INSERT public sans preuve de possession
**Preuve :** `supabase/schema.sql:56-58` — `WITH CHECK (true)`. Toute personne possédant
l'URL et la clé `anon` (publiques par conception, embarquées dans l'app) peut insérer une
ligne avec **n'importe quel email** et **son propre `jeton`**.
**Conséquence :** l'élève légitime de cette adresse ne peut plus écraser la ligne : son
`upsert` (`sync.ts:152-181`) tombe sur le conflit et la policy `maj_app` rejette (jeton
different) → synchronisation silencieusement en échec (`sync.ts:182-186` avalé). Verrouillage
de compte + occupations abusives possibles, sans limite de débit côté schéma.
**Statut :** **confirmé le 18/11 par la matrice** (S2 insertion libre, S3 refus PK 23505,
S5b la victime ne peut pas réclamer sa ligne → 42501). L'exploitation réelle sur un
utilisateur (squatting d'une adresse vivante) n'a pas été menée — elle exigerait de
cibler une adresse réelle ; le mécanisme, lui, est prouvé.

### 🟢 F2 — Lignes sans jeton : exception `jeton IS NULL` — **non exploitable (testé le 18/11)**
**Preuve d'origine :** `schema.sql:63-70` — `maj_app` accepte `jeton IS NULL`.
**Résultat du test (matrice S6/S6b/S7/S7p) :** l'écriture redoutée **n'a pas pu être
produite** : la ligne `jeton NULL` n'est pas visible (`lecture_proprietaire` exige
`jeton IS NOT NULL`) et UPDATE/DELETE n'agissent que sur les lignes visibles → **0 ligne
modifiée**, et l'UPSERT échoue en 42501. L'exception est du code mort en l'état actuel.
**Risque résiduel (latent) :** si `lecture_proprietaire` est assouplie un jour, l'exception
devient une écriture ouverte immédiate → la retirer reste recommandé (défense en
profondeur, aucun effet observable aujourd'hui). Voir aussi F7 : ces lignes sont aussi
**injoignables** pour leur propriétaire légitime.

### 🟠 F3 — UPSERT en conflit : échec net côté serveur, mais invisible pour l'élève
**Preuve :** `sync.ts:152-181` (upsert `onConflict: 'email'`) + matrice S4/S5/S5b (18/11).
**Résultat du test :** le chemin d'erreur est maintenant **démontré** — pas de mise à jour
partielle : UPSERT avec un jeton différent → **erreur 42501 (USING), 0 ligne écrite**
(S5), même jeton → 1 ligne (S4). Le serveur refuse proprement.
**Conséquence restante :** l'erreur est avalée côté client (`console.warn`, `sync.ts:182-186`)
→ l'élève n'a **aucun verdict** (« synchronisé » affiché alors que rien n'a été écrit).
C'est le même défaut de transparence que P0.2 (suppression) mais sur l'envoi.

### 🟠 F4 — Jetons anciens : ni révocation, ni rotation, ni durée de vie
**Preuve :** `compte.ts:50-59` (jeton = secret aléatoire) ; `schema.sql:8` (le jeton est le
contrôle d'accès) ; `CORRECTIFS-PHASE-1` §Limites (« anciennes sauvegardes peuvent contenir un
jeton réutilisable ; révocation/rotation non réalisée »).
**Conséquence :** un jeton fuité (ancienne sauvegarde, partage d'écran, fichier laissé) reste
valide indéfiniment : lecture, modification et suppression de la ligne associée. Les nouvelles
sauvegardes v3 excluent le jeton (correctif PR #4), l'ancien format reste exposé.
**Statut :** confirmé par le code et les documents ; procédure de récupération à concevoir
(humain + serveur).

### 🟢 F5 — DELETE et SELECT verrouillés par jeton : prouvé
**Preuve :** `plans/preuves/confidentialite-serveur.md` — matrice 0/0/1 en direct ; et le
chemin réel de l'app `delete().select('email')` (`sync.ts:210`) exige la visibilité SELECT :
sans `lecture_proprietaire` (A-019) le DELETE ne matche jamais. Cohérence avec le correctif.
**Résidu :** coordination multi-onglets/appareils et réseau incertain = P0.2 (non résolu ici).

### 🟡 F6 — Compte local ≠ authentification de l'email
**Preuve :** `compte.ts:1-16` (compte et mot de passe locaux) ; `Inscription.tsx` (création
libre). Le serveur ne vérifie jamais que l'élève possède l'adresse.
**Conséquence :** impossible de promettre « récupération de compte » ou « identité vérifiée » ;
décision produit requise (authentification serveur ? hors périmètre actuel).

## 3. Matrice d'essais RLS — **exécutée le 18/11/2026** (résultats)

**Lieu d'exécution :** projet connecté `kpjcgiwysmqysanqtfkj` (choix explicite de
l'utilisateur ; la base est vide — 0 ligne — et **chaque lot** est encadré par
`begin; … rollback;` avec purge initiale et finale : `select count(*)` = **0** après
chaque lot, vérifié. Aucune donnée réelle n'a été lue, créée, modifiée ou supprimée ;
toutes les lignes sont fictives (`*@audit-p01.example`, jetons de test).
**Méthode :** `set local role anon` + `set local request.headers` (en-tête `x-kunz-jeton`
réel du client `sync.ts:121`) ; chemins SQL identiques à ceux de PostgREST (l'`upsert`
client = `INSERT … ON CONFLICT DO UPDATE`) ; résultats capturés par `set_config` lus avant
`rollback`. **Limite :** couche HTTP/PostgREST non testée ici (relevée en §5).

| # | Scénario (rôle `anon`) | Attendu | **Obtenu le 18/11/2026** |
|---|---|---|---|
| S1 | SELECT sans / mauvais / bon jeton | 0 / 0 / 1 | **0 / 0 / 1** ✅ |
| S2 | INSERT email **libre** + propre jeton | 1 ligne | **inséré sans erreur** ✅ (= F1) |
| S2b | INSERT email **pris** (2ᵉ fois) | refus PK | **erreur 23505** ✅ |
| S4 | UPSERT email pris, **même** jeton | 1 mise à jour | **1** ✅ |
| S5 | UPSERT email pris, **autre** jeton | échec net, 0 écriture | **erreur 42501 (USING), aucune écriture** ✅ |
| S5b | Victime tente de **réclamer** sa ligne squattée | ? | **42501 → victime verrouillée** (F1 confirmé) |
| S6 | UPDATE ligne `jeton NULL` (sans en-tête) | écriture ouverte (F2) | **0 ligne — non exploitable** ⚠️ |
| S6b | UPDATE ligne `jeton NULL` pour y poser son jeton | réclamation possible ? | **0 ligne — non réclamable** |
| S7 | UPSERT ligne `jeton NULL` (légitime, bon jeton) | réclamation (hypothèse F2) | **erreur 42501 — échec** ⚠️ |
| S7p | UPDATE direct ligne `jeton NULL` (bon jeton) | idem | **0 ligne** |
| S8 | DELETE sans / mauvais / bon jeton | 0 / 0 / 1 | **0 / 0 / 1** ✅ |
| S9 | Ligne `jeton NULL` : DELETE puis SELECT | refusés | **0 / 0** ✅ |
| S10a | Refus de droits (`ALTER TABLE` en `anon`) | refus net | **erreur 42501 privilege** ✅ |
| S10b | Atomicité après erreur en plein écrit | 0 écriture résiduelle | **23505 attrapée, 0 ligne résiduelle** ✅ |
| e1 | UPDATE par le **propriétaire** (bon jeton) | 1 | **1** ✅ |
| e2 | UPDATE par un **attaquant** (mauvais jeton) | 0 | **0** ✅ |
| e4 | Ligne `jeton = ''` **sans en-tête** : SELECT / UPDATE / DELETE | ? | **1 / 1 / 1 — accessible au monde** ⚠️ |

**Coupure réseau (S10 réseau) :** non testable en SQL — elle relève des tests client
simulés (P0.2) ; seule la « coupure de droits » et l'atomicité serveur sont prouvées ici.

### Ce que la matrice change aux constats

1. **F2 est dégradé 🟠 → 🟢 (inexploitable en l'état).** L'exception `maj_app
   (jeton IS NULL)` est du **code mort** : la ligne `jeton NULL` n'est pas visible via
   `lecture_proprietaire`, et dans cette base **UPDATE/DELETE n'agissent que sur les
   lignes visibles** (S6 = 0 ligne alors que l'USING passerait ; cohérent avec A-019 sur
   DELETE). L'écriture ouverte redoutée n'a pas pu être produite, quel que soit l'en-tête.
   **Réserve :** le piège reste latent — si `lecture_proprietaire` venait à être assouplie
   (ex. `using (true)` en débogage), l'exception `jeton IS NULL` deviendrait
   immédiatement une écriture ouverte. La retirer (§4.3 option A) reste recommandé, par
   défense en profondeur, sans effet observable aujourd'hui.
2. **Nouveau constat F7 🟡 — lignes legacy injoignables.** Le commentaire de
   `schema.sql:47-49` (« elles se verrouillent au prochain snapshot qui remplit la
   colonne ») est **faux** : le snapshot (UPSERT) sur une ligne `jeton NULL` échoue en
   42501 (S7, S7p répétés) — il ne remplit donc jamais la colonne. Une installation
   ancienne dont la ligne existe déjà **ne peut plus synchroniser, ni lire, ni supprimer
   sa ligne** depuis l'app (`sync.ts` avale l'erreur en `console.warn` → échec silencieux).
   La table actuelle est vide : aucun incident en cours, mais la compatibilité promise
   n'existe pas. *Mécanisme interprété (visibilité `lecture_proprietaire`) : à confirmer
   lors de la revue sécurité.*
3. **Nouveau constat F8 🟠 — `jeton = ''` = ligne publique.** `coalesce(header,'')` fait
   qu'une ligne au jeton **vide** est lisible, modifiable et supprimable par **n'importe
   qui sans en-tête** (e4 : 1/1/1). Joignable par un INSERT `WITH CHECK (true)` avec
   `jeton ''` (variante de squatting F1) — la victime est verrouillée et la ligne est
   publique. `nouveauJeton()` ne produit pas de jeton vide côté client, mais le serveur
   ne le rejette pas : **valider `jeton <> ''` à l'INSERT/UPDATE** (§4).
4. **F1 confirmé de bout en bout** (S2 création + S3 refus PK + S5b verrouillage de la
   victime) et **F5 reconfirmé** (S1/S8 : 0/0/1).

## 4. Proposition (à approuver — aucun changement de base réalisé)

1. **Rotation des jetons** : colonne `jeton_v2` + fenêtre de transition (les deux acceptés),
   puis bascule ; les lignes `jeton` legacy restent verrouillées. Procédure de récupération
   documentée (sans divulgation du jeton dans un ticket public).
2. **Durée de vie / purge** : politique de conservation écrite et correspondance dans
   l'interface (P0.2 §durée).
3. **Contre le squatting (F1)** : option A — `ecriture_app` exigeant une forme de preuve
   (au minimum `email` valide + `jeton` non vide, cf. point 5) ; option B — limite de débit
   par IP/email (Supabase Edge / pg) ; option C — vérification de possession de l'adresse
   (nécessite un backend, hors périmètre). **Aucune n'est décidée ici.**
4. **Nettoyage défensif (F2 latent + F7)** : retirer l'exception `jeton IS NULL` de
   `maj_app` (code mort, piège si `lecture_proprietaire` est assouplie) **et** corriger le
   commentaire `schema.sql:47-49` : le snapshot ne remplit pas la colonne d'une ligne
   `jeton NULL` (il échoue en 42501) — prévoir plutôt une migration de réparation
   (`update eleves set jeton = … where jeton is null` impossible sans secret : décider —
   purge des lignes legacy ou réinitialisation contrôlée).
5. **Valider `jeton <> ''` et `jeton is distinct from ''`** aux policies INSERT/UPDATE
   (F8 : aujourd'hui une ligne au jeton vide est publique) — à couvrir aussi par un test
   client (rejet d'un jeton vide à la création du compte).
6. **Exécution de la matrice** : ✅ faite le 18/11/2026 sur le projet connecté avec
   données fictives (§3) ; restent hors SQL : coupure réseau réelle et couche PostgREST
   (P0.2/client). Une exécution sur base isolée reste souhaitable avant tout déploiement
   si des données réelles viennent à exister.
7. Les anciennes sauvegardes contenant un jeton : consigne « ne pas partager » + conception
   de la rotation (F4). Le client v3 ne les révoque pas.

## 5. Reste à l'humain
Revue sécurité indépendante ; arbitrage F1/F6 et des options 1–5 de §4 ; approbation de
toute migration ; décision sur l'authentification serveur ; confirmation du mécanisme F7
(interprété, pas prouvé au niveau du code Postgres). Les tests automatisés locaux et les
simulations ne remplacent pas cette revue.
