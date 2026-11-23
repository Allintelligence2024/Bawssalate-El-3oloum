# Mesure d'impact du pilote

> Statut : **plan de mesure**, pas un résultat. Aucun chiffre de cette page n'a encore été
> observé sur des élèves. Les valeurs marquées « cible » sont des hypothèses à réfuter.

## 1. La question à laquelle ce pilote doit répondre

Une seule question compte : **l'application fait-elle travailler l'élève sur ce qu'il rate,
plutôt que sur ce qu'il sait déjà ?**

Tout le reste (temps passé, nombre de drills ouverts, j'aime) est du confort qui peut
augmenter sans que l'élève progresse. Le tableau de bord les affiche, ce document ne les
prend pas pour preuve.

## 2. Ce qui rend la mesure possible

Le produit n'a **aucun pistage serveur** (§12.1). La télémétrie est un compteur local
(`src/utils/telemetrie.ts`) que l'élève exporte s'il le veut. Conséquences à assumer :

- pas de cohorte exhaustive → on travaille sur **volontaires**, avec biais de sélection
  assumé et écrit dans le rapport ;
- pas de mesure d'usage réelle pour qui n'exporte pas → on ne prétendra jamais que
  « 80 % des élèves » font quoi que ce soit ;
- l'export ne contient que des **nombres agrégés** (entrées, abandons, médianes de durée),
  jamais une durée individuelle brute, jamais un texte.

## 3. Indicateurs, et ce qu'ils valent

| Indicateur | Source | Ce qu'il prouve | Ce qu'il ne prouve pas |
|---|---|---|---|
| Taux d'abandon par phase | export local, `tauxAbandon` | une phase est trop longue ou mal placée | que l'élève a appris |
| Médiane de durée par phase | export local, `mediane` | ordre de grandeur du coût | que le temps est bien employé |
| Blocages sur les portes | compteur local | une porte bloque réellement | que le contenu est en cause |
| Écart de couverture C1–C8 avant/après 3 semaines | `bridge.ts` + suivi manuel | le moteur aiguille vers les faiblesses | que la note au Bac monte |
| Drills terminés avec score 2/2 | `EntraineurSujet` | l'élève sait refaire | qu'il saura transférer |
| **Item de contrôle** : le sujet le plus faible est-il travaillé en premier ? | mode entraîneur, 3 sujets | c'est **la** question du §1 | — |

**Ce qu'on ne mesurera pas, et pourquoi.** Aucune prédiction de note /20 : elle serait
fausse et anxiogène, et le Plan V2 §11.3 l'interdit. Aucune comparaison de moyennes de
classe : l'application ne connaît pas les notes officielles.

## 4. Protocole

- **Durée** : 3 semaines minimum, 4 souhaitables (une semaine de rodage non comptée).
- **Échantillon visé** : 30 élèves volontaires, 2 wilayas, mixte public/privé.
  En dessous de 12 exports exploitables, on ne conclut pas : on documente l'échec de recrutement.
- **Point zéro** : à l'installation, l'élève fait **un** sujet Bac complet en mode entraîneur
  (parmi les 3 sujets pilotes). On note la couverture C1–C8 obtenue.
- **Point final** : même exercice, sujet différent du même profil.
- **Export** : une fois par semaine, l'élève exporte le JSON et le transmet s'il le souhaite.
  Le fichier quitte l'appareil **par décision de l'élève**, jamais automatiquement.
- **Ce qui invalide une observation** : export incomplet, appareil changé en cours de route
  (la télémétrie est locale), moins de 4 sessions dans la fenêtre.

## 5. Critères de décision

Le pilote est **concluant** si les trois tiennent :

1. la phase avec le plus fort taux d'abandon est identifiée et un correctif est écrit ;
2. sur ≥ 60 % des élèves ayant exporté, la compétence la plus faible au point final
   **n'est plus** celle du point zéro (déplacement mesuré, pas note) ;
3. aucun blocage de porte > 15 % des entrées de la phase concernée.

Il est **non concluant** dans deux cas, tous deux utiles :

- personne n'exporte → le mode d'export est trop coûteux, pas le produit mauvais ;
- les exports arrivent mais les compétences ne bougent pas → le moteur aiguille vers des
  compétences que l'entraîneur ne travaille pas assez ; c'est un défaut de contenu, et
  c'est un résultat (Phase 10 : 500/700 explications sous le seuil de 110 caractères).

## 6. Ce qu'on écrira dans le rapport final

Un tableau par indicateur, la taille réelle de l'échantillon, les biais, et une phrase de
conclusion qui répond au §1 — pas un pourcentage global de « satisfaction ». Si la réponse
est « on ne sait pas », le rapport le dit.

## 7. Garde-fous déontologiques

- Aucun identifiant dans l'export : ni nom, ni wilaya, ni lycée, ni e-mail.
  Test dédié : `rapportSansDonneePersonnelle`.
- L'élève peut effacer ses compteurs à tout moment (`kunz_telemetrie_v1` dans le stockage local).
- Les résultats du pilote ne servent jamais à classer des établissements ni des enseignants.
- Aucun accès au Bac n'est conditionné par la participation au pilote.
