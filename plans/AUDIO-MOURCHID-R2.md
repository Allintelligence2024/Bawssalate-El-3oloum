# Phase 3 — Déploiement Cloudflare R2 des capsules « voix du المُرشد »

**Date** : 2026-11-26  
**Voix sélectionnée** : `voice-03` (voix masculine arabe, style narration/professeur, validée par le porteur de projet lors de l'audition n° 03)  
**Statut éditorial** : `a_valider_enseignant` · `reviewed: false` (10/10 — aucune promotion automatique)

---

## 1. Discipline zéro-audio dans Git et dans la coquille

Les 10 fichiers `.mp3` représentent **6,33 Mio** (`6 480,2 Ko`, **13 min 50 s** d'écoute totale en 64 kbps @ 44 100 Hz). Ils **n'entrent jamais** dans Git, dans `public/`, dans `dist/`, ni dans le précache de démarrage :

- `.gitignore` bloque `.cache/`, `public/audio/` et tout `public/**/*.{mp3,wav,ogg,opus,m4a}`.
- `scripts/verifier-hors-ligne.mjs` échoue immédiatement si un fichier audio est détecté dans `public/` ou `dist/`.
- `src/data/audioMourchid.ts` (registre + transcriptions arabes intégrales, **20,34 Ko**) est chargé paresseusement (`audioMourchidChargeur.ts`) dans le lot `contenu` (hors-ligne sur demande) : **0 octet ajouté à la coquille de démarrage** (`2,21 / 2,25 Mio`).
- Sans `VITE_AUDIO_BASE_URL` configuré, `LecteurAudioMourchid` n'émet aucune requête réseau 404, affiche un état honnête (« البثّ الصوتي جاهز للنشر السحابي ») et rend immédiatement la transcription arabe complète lisible hors ligne.
- Avec `VITE_AUDIO_BASE_URL` configuré, `<audio preload="none">` ne télécharge aucun octet avant le clic explicite sur lecture.

---

## 2. Inventaire des 10 capsules générées (`.cache/audio-mourchid/`)

Le manifeste machine complet est conservé localement dans `.cache/audio-mourchid/manifest-r2.json` (gitignoré).

| # | Fichier | Clé R2 cible | Portée | Durée | Taille | SHA-256 (16 premiers caractères) | Statut |
|---|---|---|---|---:|---:|---|---|
| 1 | `mourchid-u1.mp3` | `audio/mourchid/mourchid-u1.mp3` | U1 — تركيب البروتين | 1:28 (88 s) | 687,6 Ko | `389137636b52f7bd` | `a_valider_enseignant` |
| 2 | `mourchid-u2.mp3` | `audio/mourchid/mourchid-u2.mp3` | U2 — البنية والوظيفة | 1:18 (78 s) | 606,1 Ko | `50f7c00154b6a9c8` | `a_valider_enseignant` |
| 3 | `mourchid-u3.mp3` | `audio/mourchid/mourchid-u3.mp3` | U3 — النشاط الإنزيمي | 1:21 (81 s) | 636,1 Ko | `95ba2a819d61448a` | `a_valider_enseignant` |
| 4 | `mourchid-u4.mp3` | `audio/mourchid/mourchid-u4.mp3` | U4 — الدفاع عن الذات | 1:37 (97 s) | 754,9 Ko | `c6691f59e618629f` | `a_valider_enseignant` |
| 5 | `mourchid-u5.mp3` | `audio/mourchid/mourchid-u5.mp3` | U5 — الاتصال العصبي | 1:26 (86 s) | 668,4 Ko | `ad7a0c187e63bd49` | `a_valider_enseignant` |
| 6 | `mourchid-d2.mp3` | `audio/mourchid/mourchid-d2.mp3` | D2 — التحوّلات الطاقوية (`u6`–`u8`) | 1:23 (83 s) | 651,2 Ko | `36b01f7fc3d6f4d7` | `a_valider_enseignant` |
| 7 | `mourchid-d3.mp3` | `audio/mourchid/mourchid-d3.mp3` | D3 — التكتونية العامة (`u9`–`u11`) | 1:29 (89 s) | 697,4 Ko | `f67fac5514cce514` | `a_valider_enseignant` |
| 8 | `mourchid-methodo-verbes.mp3` | `audio/mourchid/mourchid-methodo-verbes.mp3` | المنهجية — أفعال التعليمة (`lecture`, `erreurs`) | 1:21 (81 s) | 631,4 Ko | `260d7925cb2a79b6` | `a_valider_enseignant` |
| 9 | `mourchid-methodo-documents.mp3` | `audio/mourchid/mourchid-methodo-documents.mp3` | المنهجية — استغلال الوثائق (`ecriture`, `lecture`) | 1:13 (73 s) | 570,6 Ko | `a8f0e624113d96c0` | `a_valider_enseignant` |
| 10 | `mourchid-methodo-examen.mp3` | `audio/mourchid/mourchid-methodo-examen.mp3` | المنهجية — الهدوء وتوزيع الوقت (`avant`, `pendant`) | 1:14 (74 s) | 576,3 Ko | `08da42c36ce915e6` | `a_valider_enseignant` |
| | **Total** | | **11/11 unités + 5/5 branches المرشد** | **13:50 (830 s)** | **6,33 Mio** | | **0 `reviewed: true`** |

---

## 3. Procédure de mise en ligne sur Cloudflare R2

1. **Créer le bucket public R2** (ex. `bawssala-media`) et activer un domaine personnalisé (ex. `https://media.bawssala.dz`), avec CORS lecture `GET` + `HEAD` + en-tête `Range` autorisé (indispensable pour le curseur de recherche `<audio>`).
2. **Téléverser les 10 fichiers** depuis `.cache/audio-mourchid/` avec `Content-Type: audio/mpeg` et `Cache-Control: public, max-age=31536000, immutable` :

```bash
for f in .cache/audio-mourchid/mourchid-*.mp3; do
  nom="$(basename "$f")"
  wrangler r2 object put "bawssala-media/audio/mourchid/${nom}" \
    --file "$f" \
    --content-type "audio/mpeg" \
    --cache-control "public, max-age=31536000, immutable"
done
```

3. **Activer la variable d'environnement** sur Vercel (Preview + Production) puis relancer un build :

```env
VITE_AUDIO_BASE_URL=https://media.bawssala.dz/audio/mourchid
```

4. **Vérifier après déploiement** :
   - Ouverture de l'onglet `المُرشد` → 3 capsules méthodologiques audibles, curseur de recherche (`Range 206`) fonctionnel, vitesse `0.85x / 1x / 1.15x` fluide.
   - Ouverture d'une leçon (`LecteurLecon`) et de l'étape finale de `JalonUnite` → capsule de l'unité correspondante présente avec transcription complète repliable.
   - Mode avion → message arabe sobre + transcription complète toujours lisible.

---

## 4. Liste de relecture enseignante (avant toute promotion `reviewed: true`)

- [ ] Vérification scientifique et terminologique arabe 3AS des 10 transcriptions dans `src/data/audioMourchid.ts`
- [ ] Écoute intégrale des 10 fichiers `.mp3` (prononciation des termes scientifiques, rythme, absence de coupure)
- [ ] Validation nominative consignée dans `plans/relecture/REGISTRE-ARBITRAGES.md` avant passage de `reviewed: false` à `true`
