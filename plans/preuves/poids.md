# Poids — P0.3 / P3.6

Mesures sur `npm run build` (Vite 7, branche `arena/4eaeaa75-bawssalate-el-3oloum`).

| Date | Commit | `ouverture.mp4` | `dist/` total | Chunk principal (`index-*.js`) | gzip | Précache SW |
|---|---|---|---|---|---|---|
| 16/11/2026 (PR #1 tel quel) | `1f7dcfb` | 13,4 Mo | ≈ 90 Mo (81 Mo de PDF dans `public/examens/`) | 720 kB | 197 kB | shell + `/ouverture.mp4` (13,4 Mo) |
| 16/11/2026 (1re passe) | `bf849b3` | 13,4 Mo | ≈ 90 Mo | 723 kB | 197 kB | shell + 9 chunks (manifeste) + mp4 |
| 16/11/2026 (2e passe) | *(ce commit)* | **1,65 Mo** (720×1280, 6,6 s, H.264 CRF 30, AAC 64 kb/s mono) | **8,2 Mo** | **709 kB** | 194 kB | shell + 9 chunks + mp4 1,65 Mo |

Méthode : `ffmpeg` (binaire `imageio-ffmpeg`) `-t 6.6 -vf scale=720:1280 -crf 30 -c:a aac -b:a 64k -ac 1` ;
`du -sh dist` ; tailles Vite en sortie de build ; `curl -s -o /dev/null -w "%{size_download}" http://localhost:4173/ouverture.mp4`.

Cible P0.3 (≤ 2 Mo) : **atteinte**. Cible P3.6 (chunk principal ≤ 500 kB) : **non atteinte** — pistes : sortir
`lessonGoldSummaries` et `programme` en chunks par domaine, lazy-load d'`ExamBlanc`/`Ana`.
