# Déploiement Cloudflare R2 — Audio des Résumés de Leçons « صوت المُرشد » (55/55 — Programme officiel 3AS)

**Statut** : **Phases 4 & 5 complètes (`55/55` leçons officielles, `u1`–`u11`)** · **Voix verrouillée** : `voice-03` (voix masculine arabe retenue) · **Registre validé** : accueil chaleureux en darija algérienne (salutation + prendre des nouvelles), puis **100 % arabe standard pédagogique clair** pour l'explication complète de la leçon SVT 3AS · **0 fichier `.mp3` dans Git**

> **Note d'honnêteté linguistique** : ces 55 pistes sont synthétisées par TTS (`voice-03`, moteur sans modèle natif `ar-DZ`), avec une brève salutation algérienne courante (`واش راكم؟`, `راكم بخير ولا باس`) suivie d'une explication scientifique intégralement en arabe standard fluide et rigoureux (0 caractère latin, 0 sigle collé, 0 émoji). Toutes les pistes restent en `statut: 'a_valider_enseignant'` et `reviewed: false` jusqu'à validation humaine/enseignante nominative.

---

## 1. Emplacement local des fichiers (hors Git, persisté localement)

- **Catalogue complet `u1`–`u11` (55 MP3 — 22,35 Mio — 48 min 50 s)** : `plans/_audio-r2/lecons/`
- **Manifeste SHA-256 complet (55/55)** : `plans/_audio-r2/lecons/manifest-lecons.json`
- **Règle stricte** : `.gitignore` ignore `plans/_audio-r2/`, `public/audio/` et tout `public/**/*.{mp3,wav,ogg,opus,m4a}`, et `scripts/verifier-hors-ligne.mjs` échoue si un fichier audio entre dans `public/` ou `dist/`.

---

## 2. Synthèse vérifiée par unité (55/55 PASS)

Tous les contrôles automatiques passent sur les **55 fichiers MP3** : trames MPEG valides (`64 kbps @ 44 100 Hz`), durées **`46 s – 61 s`** (plage `30–90 s`), niveau sonore actif (`100 %` de trames non nulles), tailles **`356,1 Ko – 472,9 Ko`** (toutes `≤ 500 Ko`).

| Domaine | Unité | Leçons | Durée cumulée | Volume R2 | Statut |
|---|---|---:|---:|---:|---|
| Domaine 1 | `u1` — تركيب البروتين (pilote validé) | 5 / 5 | 4:43 | 2,16 Mio | `a_valider_enseignant` |
| Domaine 1 | `u2` — العلاقة بين بنية ووظيفة البروتين | 4 / 4 | 3:34 | 1,64 Mio | `a_valider_enseignant` |
| Domaine 1 | `u3` — النشاط الإنزيمي للبروتينات | 6 / 6 | 5:06 | 2,33 Mio | `a_valider_enseignant` |
| Domaine 1 | `u4` — دور البروتينات في الدفاع عن الذات | 8 / 8 | 7:05 | 3,24 Mio | `a_valider_enseignant` |
| Domaine 1 | `u5` — دور البروتينات في الاتصال العصبي | 5 / 5 | 4:29 | 2,05 Mio | `a_valider_enseignant` |
| Domaine 2 | `u6` — التركيب الضوئي | 7 / 7 | 6:03 | 2,77 Mio | `a_valider_enseignant` |
| Domaine 2 | `u7` — التنفّس والتخمّر | 5 / 5 | 4:25 | 2,02 Mio | `a_valider_enseignant` |
| Domaine 2 | `u8` — حوصلة التحوّلات الطاقوية | 2 / 2 | 1:46 | 0,81 Mio | `a_valider_enseignant` |
| Domaine 3 | `u9` — النشاط التكتوني للصفائح | 5 / 5 | 4:32 | 2,08 Mio | `a_valider_enseignant` |
| Domaine 3 | `u10` — البنية الداخلية للكرة الأرضية | 3 / 3 | 2:45 | 1,25 Mio | `a_valider_enseignant` |
| Domaine 3 | `u11` — النشاط التكتوني والظواهر الجيولوجية المرتبطة به | 5 / 5 | 4:22 | 2,00 Mio | `a_valider_enseignant` |
| **Total** | **`u1`–`u11` (11/11 unités officielles)** | **55 / 55** | **48:50** | **22,35 Mio** | **`0` `reviewed: true`** |

> L'inventaire piste par piste (avec `lessonId`, durée exacte, taille en octets, `sha256` complet et texte intégral `texteAr`) est stocké dans `plans/_audio-r2/lecons/manifest-lecons.json` et dans le registre paresseux `src/data/audioLecons.ts`.

---

## 3. Intégration applicative (audio à la demande + résumés écrits hors ligne)

1. **Par leçon (`LecteurAudioResume.tsx`)** : affiché dans `LecteurLecon.tsx` (`الملخّص الذهبي`) et dans `ProtocoleRunner.tsx` (Phases 1 et 5), avec le bloc **« ملخّص المُرشد المكتوب »** (`piste.texteAr`, ouvert automatiquement en vue complète hors ligne ou avant configuration R2).
2. **Bibliothèque centrale dans `المُرشد` (`BibliothequeResumesLecons.tsx` dans `Mourchid.tsx`)** : regroupe les **55 résumés écrits et audio** filtrables par unité (`u1`–`u11`), lisibles 100 % hors ligne, sans aucun octet ajouté à la coquille (`audioLecons-*.js` chargé paresseusement dans `contenu`).

---

## 4. Upload rapide vers Cloudflare R2

### Étape 1 — Règle CORS du bucket public (ex. `bawssala-media`)

Autoriser `GET` + `HEAD` + en-tête `Range` (requis pour le curseur de progression et le bouton `−10 s`) :

```json
[
  {
    "AllowedOrigins": ["https://*.vercel.app", "https://bawssala.dz"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["Range"],
    "ExposeHeaders": ["Content-Length", "Content-Range", "Accept-Ranges"],
    "MaxAgeSeconds": 86400
  }
]
```

### Étape 2 — Téléversement des 55 pistes (`u1`–`u11`)

```bash
for f in plans/_audio-r2/lecons/*.mp3; do
  nom="$(basename "$f")"
  wrangler r2 object put "bawssala-media/audio/lecons/${nom}" \
    --file "$f" \
    --content-type "audio/mpeg" \
    --cache-control "public, max-age=31536000, immutable"
done
```

### Étape 3 — Variables d'environnement Vercel (Preview & Production)

```env
VITE_AUDIO_LECONS_BASE_URL=https://media.bawssala.dz/audio/lecons
VITE_AUDIO_BASE_URL=https://media.bawssala.dz/audio/mourchid
```

Redéployer ensuite sur Vercel. Sans ces variables, l'application reste **100 % fonctionnelle hors ligne**, sans aucune requête 404, avec l'état sobre « يتطلّب اتصالًا للاستماع أوّل مرّة » et le texte intégral du résumé immédiatement lisible.

---

## 5. Suivi de validation humaine

- [x] Écoute humaine et validation du Pilote `u1` (5 pistes, voix `voice-03`, accueil darija + leçon 100 % arabe)
- [x] Phase 4 (`u2`–`u5`, 23 leçons) générée, vérifiée et intégrée (`28/28` Domaine 1)
- [x] Phase 5 (`u6`–`u11`, 27 leçons officielles) générée, vérifiée et intégrée (`55/55` programme officiel)
- [ ] Téléversement sur Cloudflare R2 + activation `VITE_AUDIO_LECONS_BASE_URL`
- [ ] Relecture nominative enseignant avant toute promotion `reviewed: true`
