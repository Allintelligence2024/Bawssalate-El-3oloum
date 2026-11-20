# Préparer la recette du lien et de la suppression

Ne jamais sélectionner le projet de production, ni y exécuter ces scripts. Ne pas ouvrir la prévisualisation à des élèves. Utiliser une boîte de test que vous contrôlez et des données fictives.

## 1. Créer la base de recette

1. Dans Supabase, cliquer sur **New project**, choisir l’organisation et nommer le projet `bawssala-recette` (ou choisir un nom distinct). Vérifier coûts et limites avant création. Garder le mot de passe dans votre gestionnaire, pas dans le chat.
2. Dans **Project Settings → General**, noter le **Project Ref**. Le fournir à l’agent avec le nom du projet. Ne pas fournir les clés secrètes.
3. Une fois l’instance disponible, dans ce projet uniquement : **SQL Editor → New query**, coller uniquement `supabase/propositions/02-synchronisation-verifiee.sql`, puis **Run**. Ne pas coller `supabase/tests/02-fixture.sql` : il est destiné à une base vide hors Supabase et simule Auth. Ne pas copier les données ni le schéma historique.
4. Dans **Authentication → Providers → Email**, vérifier que le fournisseur Email est activé. Dans **Authentication → Email Templates → Magic Link**, conserver un lien fondé sur `{{ .ConfirmationURL }}` pour ce pilote. Avec la messagerie intégrée, la livraison peut être limitée aux adresses autorisées par Supabase ; utiliser une boîte autorisée ou configurer un SMTP de recette si nécessaire.

## 2. Brancher la prévisualisation, pas la production

1. Dans Vercel, ouvrir le projet GitHub lié, **Deployments**, sélectionner la prévisualisation de la branche `arena/4f86dd6f-bawssalate-el-3oloum`. Copier l’URL HTTPS de branche (alias stable de la branche, pas l’URL publique de production). Garder la protection du déploiement.
2. Dans le projet Supabase de recette : **Authentication → URL Configuration**. Régler **Site URL** sur cette origine, puis dans **Redirect URLs → Add URL**, saisir l’origine suivie de `/?verification-sync=1`. Enregistrer ; ne pas ajouter de joker.
3. Dans le projet Vercel lié : **Settings → Environment Variables → Add**. Pour chacune des cinq entrées, choisir **Preview** puis limiter à la branche Arena (si la portée par branche n’est pas disponible, ne pas appliquer globalement : arrêter et le signaler).
   - `VITE_VERIFICATION_SYNC` = `true`
   - `VITE_VERIFICATION_RPC_PILOTE` = `true`
   - `VITE_VERIFICATION_ORIGINE` = origine HTTPS copiée à l’étape 1, sans chemin
   - `VITE_VERIFICATION_AUTH_URL` et `VITE_VERIFICATION_AUTH_CLE` : ajouter **deux** entrées, l’URL du projet de recette et sa **clé publishable** depuis **Project Settings → API Keys** (URL également visible dans **Connect**). Jamais `service_role`, secret JWT ni mot de passe Postgres.
4. Vérifier que la prévisualisation n’utilise pas `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` pointant vers la base historique. En cas de doute, ne pas poursuivre avec des identités réelles. Depuis **Deployments → … → Redeploy**, ne redéployer que la prévisualisation de la branche.

## 3. Retour attendu

Ouvrir l’alias de branche dans un navigateur autorisé ; demander un lien avec la boîte de test ; ouvrir le lien dans le même navigateur. Noter seulement le résultat et l’heure, sans lien, code, jeton ni adresse de boîte. Envoyer à l’agent l’URL de preview, le Project Ref, le statut de la requête SQL et si la réception du lien a réussi. Ne pas envoyer le lien de connexion lui-même. Le protocole de concurrence à deux clients est une étape séparée ; un succès dans un navigateur ne le valide pas.
