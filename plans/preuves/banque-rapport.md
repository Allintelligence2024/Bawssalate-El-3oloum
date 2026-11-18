# Preuve P-1.3 — rapport du vérificateur de la banque de drills

> **Date :** 17/11/2026 · **Commande :** `node scripts/verifier-drills.mjs`
> **Périmètre :** 660 items sur 4 fichiers (`domaine1/2/3.ts`, `niveau3.ts`) — les 660, pas 429.
> **Mise à jour 17/11 (P-2.1) :** le périmètre passe à **700 items** (80 n3) après le dépôt 3 —
> voir la section finale ci-dessous ; les 0/0 (problèmes/avertissements) se rejouent à l'identique.

## Ce que le correctif a changé (avant → après)

| Mesure | Avant (16/11) | Après (17/11) |
|---|---|---|
| Items analysés | **429** sur 660 — `domaine3.ts` et `niveau3.ts` étaient en CRLF : le `\r` résiduel cassait l'ancrage `$` du parseur ligne à ligne | **660/660** (normalisation CRLF `readFileSync(...).replace(/\r\n/g,'\n')`) |
| Similarité des options | Jaccard brut sur les jetons, seuil 0,65 — **d008 (0,625) et d032 échappaient au seuil** à cause de la ponctuation (`نفسه.`, `بالعة.`) | Jaccard après **normalisation arabe** (diacritiques َ ُ ِ ّ ً ٌ ٍ ً + تشديد + تطويل supprimés, أإآ→ا, ة→ه, ى→ي, ponctuation retirée) |
| Sortie | « مشاكل » mélangeait structure ET similarité | « مشاكل » = structurel (0 exigé) ; « تنبيهات » = similarité, **renvoyée à l'arbitrage humain** — la passer à 0 n'est plus une obligation mécanique du script, mais une cible éditoriale |

## Sortie finale (17/11, après corrections A-010 → A-014)

```
عناصر: 660 · تعريفات: 120 · مستوى 3: 40 · مشاكل: 0 · تنبيهات: 0
```

- 0 identifiant dupliqué, 0 option dupliquée littéralement, 0 question/vide, 0 chiffre hindi,
  0 brique de gabarit, 0 item sans explication (la règle « تعريف يحمل تفسيرًا » a été
  **inversée** — voir la section finale ci-dessous).
- **0 avertissement de similarité** après le remplacement des 5 distracteurs équivalents.
- Comptage des tiges (5 mots) : les 5 gabarits principaux tombent désormais à **50 ×**
  (les 15 items non analysés d'U9 grossissaient le comptage 35 → 50) — cible du plan (aucune
  tige > 10 parmi les n3 uniquement) inchangée et vérifiable sur `niveau3.ts` seul.

## Doublons découverts par le script réparé et corrigés ce jour

| Item | Paire équivalente | Registre |
|---|---|---|
| `d008` | « مجموعة ريبوزومات تترجم نفس ARNm… » / « عدة ريبوزومات تترجم ARNm واحداً… » | A-010 |
| `d032` | « ابتلاع وهضم… من طرف خلية بالعة. » / « …بواسطة خلية بالعة » | A-011 |
| `d044` | « فرق كمون غشائي… يقارب -70mV. » / « فرق كمون يقارب -70mV داخل الليف… » (0,70) | A-012 |
| `d047` | « انعكاس قصير ومنتشر… » / « انعكاس عابر… » (0,75) | A-013 |
| `d068` | « …في مصفوفة الميتوكندري… » / « …في المصفوفة… » (0,78) | A-014 |

Les trois derniers étaient **invisibles avant le correctif du script** (CRLF + normalisation) :
d044/d047 sont dans `domaine1.ts` (parsé avant, mais non normalisé), d068 dans `domaine2.ts`.

## Régression

Le jeu d008/d032/d044/d047/d068 est tracé dans `plans/relecture/REGISTRE-ARBITRAGES.md`
avec le commentaire de source dans le `.ts`. Le critère « 0 équivalence avérée » se rejoue par
`node scripts/verifier-drills.mjs` — une réapparition de similarité ≥ 0,65 sur une paire
« correct/distracteur » réapparaîtra comme `تنبيه` et devra être arbitrée avant publication.

## Sortie après le dépôt 3 (17/11, P-2.1 — banque n3 complète à 80)

```
عناصر: 700 · تعريفات: 120 · مستوى 3: 80 · مشاكل: 0 · تنبيهات: 0
```

- **40 items nouveaux `n041`–`n080`** (distribution finale u1=7, u2=7, u3=5, u4=8, u5=8, u6=8,
  u7=8, u8=9, u9=5, u10=10, u11=5 — testée dans `niveau3.test.ts`).
- **0 مشاكل · 0 تنبيهات** sur les 700 — y compris un premier avertissement de similarité
  apparu pendant la rédaction sur `n074` (ordre des ondes, distracteurs mutuellement proches
  à 0,70) corrigé **avant dépôt** en reformulant les trois distracteurs.
- **Critère tiges n3 :** aucune tige des 80 n3 n'apparaît plus d'une fois (les gabarits ×50
  listés ci-dessus appartiennent à la banque générée `q*`, hors périmètre n3 — cible « ≤ 10 »
  largement satisfaite).
- **Invariant d'axes :** `qcm + defs = ids.length` sur les 49 axes (nouveau test
  `niveau3.test.ts`), les 34 axes touchés ayant vu leur `qcm` recalé avec l'ajout des ids
  n041–n080 ; `TOTAL_QCM = 580`, `TOTAL_ITEMS = 660`.

## Sortie après la rédaction des 120 explications (17/11, P-1.3 éditorial — D6)

```
عناصر: 700 · تعريفات: 120 · مستوى 3: 80 · مشاكل: 0 · تنبيهات: 0
```

**Sortie inchangée en structure : 700 items · 0 problème · 0 alerte.** Ce qui a changé :

| Mesure | Avant | Après |
|---|---|---|
| Explications `e` des 120 `def` | `e: ""` (fallback UI neutre, réponse non affichée) | **120 phrases rédigées** — « pourquoi les distracteurs sont faux », sans « الجواب الصحيح », sans écho verbatim de l'option correcte |
| Règle du script | `def && e.trim()` → مشكلة (« تعريف يحمل تفسيرًا ») — visait le vieux bug UI, **caduque** depuis le correctif de P-1.3 | **inversée** : `!e.trim()` → مشكلة pour **tous** les items ; + portes `def`-only : interdiction de la formule « الجواب الصحيح » et inclusion normalisée de `o[0]` dans `e` (longueur ≥ 8 pour ignorer les sigles CMH/ATP…) |
| Build | 389,11 kB (gzip 116,98) | 389,11 kB (gzip 117,00) — **+0,02 kB** pour 120 explications |
| Tests | 134 / 23 fichiers verts | 134 / 23 fichiers verts |

- **Portée de la porte anti-copie : `def` uniquement.** Les 501 explications `qXXX` héritées
  (banque générée) sont du style glossaire « المصطلح : تعريف » qui reproduit `o[0]` —
  hors périmètre D6 (le plan l'exige pour les 120 `def` seulement) ; elles sont **signalées
  pour la relecture §3** (A-018), pas bloquantes.
- **`d097`** : reformulation avant dépôt — « لا المنطقة الظلّية نفسها » contenait le préfixe
  طبيعياً « منطقه الظل » (o[0]) ; devenu « لا القوس الظلّي نفسه » (A-017).
- Arbitrages tracés : A-015 (inversion de règle), A-016 (rédaction), A-017 (d097), A-018 (échos qXXX).
- Validation enseignante des 120 formulations due dans le flux de relecture (P-3.1).
