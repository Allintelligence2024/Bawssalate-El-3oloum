# Poids — P0.3 / P3.6

Mesures sur `npm run build` (Vite 7, branche `arena/4eaeaa75-bawssalate-el-3oloum`).

| Date | Commit | `ouverture.mp4` | `dist/` total | Chunk principal (`index-*.js`) | gzip | Précache SW |
|---|---|---|---|---|---|---|
| 16/11/2026 (PR #1 tel quel) | `1f7dcfb` | 13,4 Mo | ≈ 90 Mo (81 Mo de PDF dans `public/examens/`) | 720 kB | 197 kB | shell + `/ouverture.mp4` (13,4 Mo) |
| 16/11/2026 (1re passe) | `bf849b3` | 13,4 Mo | ≈ 90 Mo | 723 kB | 197 kB | shell + 9 chunks (manifeste) + mp4 |
| 16/11/2026 (2e passe) | `792761b` | **1,65 Mo** (720×1280, 6,6 s, H.264 CRF 30, AAC 64 kb/s mono) | **8,2 Mo** | 709 kB | 194 kB | shell + 9 chunks + mp4 1,65 Mo |
| 16/11/2026 (3e passe) | *(ce commit)* | 1,65 Mo | 8,2 Mo | **345 kB** | **105 kB** | 32 statiques + 27 chunks = **6,6 Mo** (tous vérifiés HTTP 200, `hors-ligne.md`) |
| 16/11/2026 (14e passe) | `b0ec11e` | 1,65 Mo | ≈ 8,6 Mo | 384 kB | 116 kB | + chunks `niveau3` 30 kB, `Mourchid` 19 kB, `glossaire` 19 kB, `SchemaALegender` 14 kB (tous lazy) — chunk principal toujours ≤ 500 kB |
| 16/11/2026 (P1.1 complet) | `169862b` | 1,65 Mo | ≈ 9,1 Mo | 387 kB | ≈ 117 kB | + chunk **`SujetsOfficiels` 498 kB (110 kB gzip)** : 30 sujets + 313 عناصر الإجابة en arabe, lazy (chargé seulement à l'ouverture de « بنية مواضيع البكالوريا »), précaché via le manifeste (46 entrées) — chunk principal inchangé |

Méthode : `ffmpeg` (binaire `imageio-ffmpeg`) `-t 6.6 -vf scale=720:1280 -crf 30 -c:a aac -b:a 64k -ac 1` ;
`du -sh dist` ; tailles Vite en sortie de build ; `curl -s -o /dev/null -w "%{size_download}" http://localhost:4173/ouverture.mp4`.

Cible P0.3 (≤ 2 Mo) : **atteinte**. Cible P3.6 (chunk principal ≤ 500 kB) : **atteinte** (345 kB) par
chargement à la demande de 12 écrans plein écran (`ExamBlanc`, `Ana`, `ProtocoleRunner`, `SessionRevision`,
`JalonUnite`, `LecteurLecon`, 4 ateliers, `Mindmap`, `SyntheseLibre`) ; Rollup isole de lui-même
`lessonGoldSummaries-*` (113 kB) et `qcm-*` (92 kB) en chunks partagés, chargés seulement quand un de ces
écrans s'ouvre — et précachés par le SW pour le hors-ligne. Le temps de démarrage sur appareil 2 Go reste
à mesurer (`appareils.md`).
