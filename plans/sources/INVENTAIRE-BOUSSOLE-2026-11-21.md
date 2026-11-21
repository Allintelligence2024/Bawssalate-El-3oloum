# Inventaire P0 — ressources du laboratoire Boussole

**État au 21 novembre 2026 · branche locale uniquement · aucune autorisation de diffusion déduite de cet inventaire.** Chaque ressource et chaque usage ci-dessous restent à arbitrer. Un nom d'auteur, un titulaire, un accord et un relecteur ne sont pas inventés : ils sont à renseigner avec leurs preuves. Les statuts antérieurs du registre général ne valent pas automatiquement pour cette livraison.

## Portée et règle de décision

Le laboratoire embarque ses images, ses textes et sa police en **data URL** dans `public/boussole/index.html`. Les deux PDF sont des fichiers séparés, référencés par le laboratoire et inclus dans le build/cache hors ligne. Le HTML est aussi téléchargeable et accessible directement sans compte. **Masquer un lien ne retire donc pas les octets du HTML, du répertoire public ou des caches déjà créés.**

Pour chaque famille ci-dessous, la porte reste **en attente** : le responsable doit consigner, pour chaque ressource et usage (affichage, copie, adaptation, impression, téléchargement et cache hors ligne le cas échéant), le titulaire confirmé, la décision datée, la personne qui décide et une référence à l'autorisation écrite ou au remplacement autorisé. Une licence jointe est une piste de vérification, pas la preuve que le bon fichier ou toutes ses conditions ont été vérifiés. La relecture scientifique/pédagogique indépendante et la décision produit sont distinctes des droits. A-021 est toujours ouvert.

| Code | Origine et utilisation observées | Titulaire / autorisation | Relecture / action à obtenir |
|---|---|---|---|
| **BAC-2** | Réseau, figures et douze traces attribués dans la livraison à l'épreuve Bac 2022 SE, sujet 1, exercice 2, p. 2–3 ; recadrage, traces séparées, unités et symboles adaptés. Sources dans `synapses-figures.py`, `Dossier.tsx`, `Preuves.tsx` et `Atlas.tsx`. | Titulaire et conditions de reproduction/adaptation **à confirmer** ; aucun accord écrit fourni pour ces usages. | Relecture image par image, légendes, traces, symboles et liens preuve–conclusion ; nom, date et corrections à consigner. |
| **BAC-3** | `bac-2022-laminine.png` : recadrage attribué au Bac 2022 SE, sujet 1, exercice 3, doc. 1 fig. جـ p. 4 ; affichage et impression dans `Preuves.tsx`. | Titulaire et autorisation **à confirmer**. | Confronter conditions, unités, valeurs et limites d'inférence à l'original ; relecteur et date à consigner. |
| **CAHIER** | PDF livré de quatre pages : synapses puis question sur la membrane, décrit comme adapté du Bac 2022 sujet 1. L'original, l'auteur des modifications et le procédé complet de génération ne sont pas établis ici. | Titulaires de l'épreuve et de l'adaptation, autorisation pour copie et diffusion **à confirmer**. | Confrontation page par page à la source, relecture et décision séparée de celle des figures du HTML. |
| **MÉMO** | PDF livré, une page sur huit familles de consignes ; créateur et sources exacts non établis dans le dépôt. | Auteur, source et autorisation **à confirmer**, y compris les illustrations et polices du PDF. | Vérifier les huit formulations, l'origine, l'impression et l'accessibilité du PDF. |
| **DÉCOR** | Quatre couvertures WebP utilisées dans `Atlas.tsx`, purement illustratives et non des données expérimentales. | Auteur, éventuels éléments tiers et droits **inconnus** ; confirmer ou remplacer par des images explicitement autorisées. | Vérifier que l'illustration n'est pas présentée comme une preuve ; relecture du contexte. |
| **POLICE** | `noto-ar.woff2` embarquée dans le HTML, accompagnée de `LICENSE-Noto.txt` (SIL OFL 1.1). | Texte de licence présent ; provenance exacte/version du fichier et respect des conditions de redistribution **à vérifier**. | Pas une validation scientifique ; contrôler l'attribution et la licence du fichier effectif. |
| **LICENCE** | Textes de licence Noto et notices React, React-DOM et Scheduler fournis avec la livraison et inclus dans le HTML. | Textes présents ; vérifier la correspondance aux dépendances réellement empaquetées et les obligations applicables. | Vérification technique/juridique, pas relecture de contenu scientifique. |
| **HTML** | `index.html` généré par `modules/boussole/scripts/build.mjs` ; contient code, textes, images et notices. | Il hérite de **toutes** les réserves des composants ; son empreinte n'est pas une autorisation. | Rebâtir puis vérifier droits, science, confidentialité et accessibilité du résultat complet. |

Les scripts de recadrage attendent une copie PDF dont l'empreinte est `6e79980ce0ad2cf1b0fcdec09f02d1a4d2d9132dd5050b483c44bc6ee4b9e2d7`. Cette copie exacte n'a pas été identifiée dans le corpus versionné : le PDF SE 2022 du registre général a l'empreinte `2f83ecf8bbc1a57d825fa2256096e83d4970861435f2cbdf0f0da731be981b55`. Cela ne prouve ni l'identité des contenus, ni les droits ; confronter la source précise. Les liens indiqués par la livraison vers l'épreuve et une correction sont dans `modules/boussole/src/model.ts` ; leur disponibilité ou attribution n'établit pas une licence.

## Fichiers composant ou accompagnant le HTML

Empreintes SHA-256 complètes calculées sur les fichiers présents. Pour les douze `trace-rc.png`, `r` est la ligne de condition et `c` l'appareil (1–3), selon `traceRows` et `TraceTable` ; chaque découpe est inventoriée séparément. Une empreinte changeante impose de refaire la décision pour le contenu concerné. `npm run verifier:inventaire-boussole` vérifie **uniquement** cette liste et les empreintes, pas les droits ni les validations.

<!-- BOUSSOLE-INVENTAIRE-DEBUT -->
| Fichier | SHA-256 | Famille |
|---|---|---|
| `modules/boussole/assets/LICENSE-Noto.txt` | `91053c23e8a0fe5fc9b5fdbe5ff74ceffd66f6f996c123f1a6ca4c23487c1fff` | LICENCE |
| `modules/boussole/assets/bac-2022-a.png` | `0e3f31b350f1a1065ce83953d37e68fe3c485b2534fc7dd5436d2a9bbe053f0e` | BAC-2 |
| `modules/boussole/assets/bac-2022-b.png` | `5ca4f5155f9163e588dbe4e3df2d8a1b8b95ebf006594113e8f3256f19337e41` | BAC-2 |
| `modules/boussole/assets/bac-2022-laminine.png` | `2b44fd42ac200d1d3d4b669479457647d0564de0760b8731bcefc2e54e8a26a5` | BAC-3 |
| `modules/boussole/assets/bac-2022-reseau.png` | `57dfb3f78934f8a8c3c6ef80ff790392f50ce64fa99847f6111a2edb39138c14` | BAC-2 |
| `modules/boussole/assets/licences/React-DOM.txt` | `52412d7bc7ce4157ea628bbaacb8829e0a9cb3c58f57f99176126bc8cf2bfc85` | LICENCE |
| `modules/boussole/assets/licences/React.txt` | `52412d7bc7ce4157ea628bbaacb8829e0a9cb3c58f57f99176126bc8cf2bfc85` | LICENCE |
| `modules/boussole/assets/licences/Scheduler.txt` | `52412d7bc7ce4157ea628bbaacb8829e0a9cb3c58f57f99176126bc8cf2bfc85` | LICENCE |
| `modules/boussole/assets/noto-ar.woff2` | `ce85091f020920b65762b387b194ef59457ea5b25b760f2dcc35240a94bb8669` | POLICE |
| `modules/boussole/assets/plate-enzyme.webp` | `e32d32641548a2e99f782e6911f1e823eccc41e6dfc05dfb8fe1be14e4027d19` | DÉCOR |
| `modules/boussole/assets/plate-immunity.webp` | `8f944374fd9f873cabfbd6c3f56d642ecf33ceda7e8ef7ef8654381e130ef9f2` | DÉCOR |
| `modules/boussole/assets/plate-nerve.webp` | `2c4b220b96f590bc3bbc1b11f20d43820439b53b50626ca91a01ea4c5fc99c17` | DÉCOR |
| `modules/boussole/assets/plate-protein.webp` | `3e49c028b5ef9d6c60bc7d8d3a21d3c3f24994accfdc8a145f0ceba5286cb5c5` | DÉCOR |
| `modules/boussole/assets/trace-11.png` | `a70e4d7264dd22fcb0f2af73169c3404ec8672fa38d95763d0d47cf06e28e40a` | BAC-2 |
| `modules/boussole/assets/trace-12.png` | `a5775a2f5557fc287a647ec1504794a5c29bb32dd8ba159ea5c639845cb1dd21` | BAC-2 |
| `modules/boussole/assets/trace-13.png` | `470b0ab34a9e3dd007358db60182c6fbd6f49eb3d465c7672f31575dd8667f82` | BAC-2 |
| `modules/boussole/assets/trace-21.png` | `e3f579fa5931a953f1bab04281b90cb62c67ff364d671b95b1afacef81fb3d78` | BAC-2 |
| `modules/boussole/assets/trace-22.png` | `fccbf1690f78bff95cdf576d4c34d5e305cb9530d813ce5dd4f421fecb8c2a4c` | BAC-2 |
| `modules/boussole/assets/trace-23.png` | `7d8ea6d0dbc1161bb51d2d413a756c988941a106ff5721505a599d5b2ed04344` | BAC-2 |
| `modules/boussole/assets/trace-31.png` | `ad21fce240d44e01597aaa91eec590f2d1364e67c8553c9045cc13b95f6d36b4` | BAC-2 |
| `modules/boussole/assets/trace-32.png` | `a6fb3994a8297980070651b309bf35798c0b73cf42586da1a0cf084e108ddc63` | BAC-2 |
| `modules/boussole/assets/trace-33.png` | `35059aa42fff6753971e935b377ff40e8d7cb133f28ce0b045e7244166756d0f` | BAC-2 |
| `modules/boussole/assets/trace-41.png` | `ed6b677dfa2243214f4f90c6d981352af188d1cbf66b5ff9ccaa064a46b79483` | BAC-2 |
| `modules/boussole/assets/trace-42.png` | `bef86766276e0b465651e743d553821eefd51846f6f272219c4acb02c9e766ce` | BAC-2 |
| `modules/boussole/assets/trace-43.png` | `8664fae8e91b00dcbd6f594abcf2995760e5f18f4bf8d0b6a74ac2f3bc50b63c` | BAC-2 |
| `public/boussole/cahier-bac-2022.pdf` | `642ec5543541329cc00c4a7cf807b0b8bfc677e7722152c89dcbbc58fc4f63c2` | CAHIER |
| `public/boussole/index.html` | `99c0031c39ba494da6e8ef0dc7fddf66ccf10115f26ed4c986e48541fa167553` | HTML |
| `public/boussole/memo.pdf` | `103f042f2d5800490ee55bb06c3dcc9e09c94fe18c5fda649c074d666d4234f8` | MÉMO |

<!-- BOUSSOLE-INVENTAIRE-FIN -->

## Textes, adaptations et modèles à relire séparément

Tous les éléments ci-dessous sont **en attente** d'identification de leurs auteurs et de relecture. Les familles renvoient aux réserves ci-dessus ; les valeurs de démonstration construites ne sont pas présentées comme des résultats mesurés. La version exacte de ces textes est incluse dans l'empreinte du HTML ci-dessus ; les fichiers source permettent de localiser les modifications.

| Élément | Où le retrouver | Contrôle demandé, sans prétendre l'avoir effectué |
|---|---|---|
| Trois consignes synapses | `model.ts` → `instructions` ; `Dossier.tsx` → `Task` | Comparer chaque consigne à l'original ; décider les droits de transcription et de reproduction. |
| Réseau, douze conditions/traces et descriptions alternatives | `model.ts` → `traceRows`, `traceTypes`, `traceText` ; `Dossier.tsx` → `TraceTable`, descriptions ; `Preuves.tsx` → `Injection` | Confronter appareil, condition, sens de trace, unité et lecture de l'écran à la source ; noter les limites. |
| Figures synaptiques et légende numérotée | `Dossier.tsx` descriptions et `ChannelKey` ; `model.ts` → `codes` ; `Preuves.tsx` → `Notation` | Comparer symboles originaux, nouvelles étiquettes, flèches et texte ; valider l'adaptation graphique et ses droits. |
| Réponses et question de liaison synapses | `Dossier.tsx` → pages et blocs de comparaison ; `model.ts` → `pivot` | Relire chaque question, formulation possible et relation entre documents ; vérifier les sources d'éventuelles adaptations de corrigé. |
| Laminine, données, questions et modèles | `Preuves.tsx` → `Protein` et `ProteinPrint` ; `explore.ts` → `protein` | Vérifier valeurs, unités et distinction entre expression mesurée et mutation ; aucun conseil médical. |
| Cas enzyme construit | `model.ts` → `points`, `reading`, `warmPrompt` ; `Warm.tsx` ; `explore.ts` → `enzyme` | Vérifier cohérence points/tableau/retour et expliciter qu'il s'agit d'un entraînement. |
| Cas immunité construit | `model.ts` → `solo` ; `Solo.tsx` ; `explore.ts` → `immunity` | Vérifier conditions, unités, tableau et formulation de comparaison ; ne pas extrapoler au-delà des données. |
| Repère et listes de relecture | `Repere.tsx`, usages dans `Atlas.tsx`, `Solo.tsx`, `Preuves.tsx`, `Dossier.tsx` | Relire l'arabe et l'adéquation aux consignes, sans assimiler les cases à une évaluation automatique. |
| Invitation, retour et parcours | `explore.ts`, `Atlas.tsx`, `entry.ts` ; `Warm.tsx`, `Solo.tsx` | Vérifier que les indices et modèles n'usurpent ni source, ni autonomie, ni statut de corrigé officiel. |

## Fiche de décision à remplir pour chaque ressource ou groupe homogène

- Identifiant(s) et empreinte(s) : **à renseigner**.
- Source exacte, titulaire confirmé, auteur de l'adaptation : **à renseigner**.
- Usages demandés et durée/territoire/supports couverts : **à renseigner**.
- Décision écrite (autorisé, refusé ou remplacé), décideur, date et référence de preuve : **à renseigner** ; ne pas copier dans le dépôt des justificatifs confidentiels sans accord.
- Relecteur SVT/linguistique, date, rapport des anomalies et corrections : **à renseigner**.
- Responsable produit, décision finale et date : **à renseigner après les autres portes**.

Ce document ne couvre pas toutes les ressources de l'application préexistante : leur registre et leurs propres portes restent applicables. Il ne modifie aucune configuration Vercel ni règle de déploiement.
