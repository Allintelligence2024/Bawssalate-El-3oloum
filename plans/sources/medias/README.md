# Médias de l'application — provenance et recettes

Dossier des **originaux de travail** (pas servis par l'app). Les fichiers réellement expédiés
sont dans `public/`.

## Provenance

Dossier Drive « Photos APP Bawssala » (lien fourni par le porteur du projet, 21/11/2026) :

| Original | Format | Poids | Usage |
|---|---|---|---|
| `42700731_…mp4` | 1080×1920, 8 s, 13 405 ko | 13,4 Mo | vidéo d'ouverture |
| `1793263565999.jpg` | 2048×2048 | 519 ko | icône de l'application |
| `1793263825400.jpg` | 1536×2752 | 610 ko | scène de jungle (écran d'ouverture, fin) |
| `363617321_…jpg` | 1536×2752, fond blanc | 484 ko | mascotte détourée (interface) |

Seule l'icône est archivée ici (`icone-app-1024.jpg`, 1024 px, 194 ko) : la vidéo et les deux
portraits restent dans le Drive, et les fichiers livrés sont reproductibles avec les commandes
ci-dessous.

## Recettes exactes

Les outils ne sont pas dans le dépôt (binaires) : `imageio-ffmpeg` fournit un ffmpeg statique,
ImageMagick gère WebP et le détourage.

```bash
python3 -m pip install --break-system-packages imageio-ffmpeg
FF=$(python3 -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())")

# 1. Vidéo : 13,4 Mo → 2,05 Mo, 1080×1920 conservé (débruitage léger + 1,9 Mb/s deux passes).
$FF -y -i source.mp4 -vf "hqdn3d=1.5:1.5:6:6" -c:v libx264 -preset slow -b:v 1900k -pass 1 \
  -passlogfile /tmp/p2 -profile:v high -pix_fmt yuv420p -g 48 -an -f mp4 /dev/null
$FF -y -i source.mp4 -vf "hqdn3d=1.5:1.5:6:6" -c:v libx264 -preset slow -b:v 1900k -pass 2 \
  -passlogfile /tmp/p2 -profile:v high -pix_fmt yuv420p -g 48 \
  -c:a aac -b:a 96k -ac 2 -movflags +faststart public/ouverture.mp4

# 2. Mascotte détourée : le fond blanc devient transparent, puis on rogne et on réduit.
convert source-mascotte.jpg -alpha set -fuzz 10% -fill none -draw "color 0,0 floodfill" \
  -trim +repage -crop 1518x1250+0+0 +repage -resize 320x -quality 84 \
  -define webp:method=6 public/mascotte.webp

# 3. Scène de jungle : 610 ko → 62 ko, 560 px de large (2× l'affichage de l'écran d'ouverture).
convert source-jungle.jpg -resize 560x -quality 78 -define webp:method=6 \
  public/personnage-pirate.webp
```

## Ce qui n'a pas été changé, et pourquoi

Les icônes PWA (`public/icons/*.png`, `public/icon.svg`) restent celles du générateur
`scripts/generer-icones.mjs` : elles sont vectorielles, cohérentes avec le favicon, et
reproductibles. L'icône photo du Drive est prête (`icone-app-1024.jpg`) mais son remplacement
coûte ~+52 ko dans la coquille hors ligne, qui tient à **2,495 Mio sur 2,5 Mio** : à faire
seulement avec l'arbitrage qui suit (sortir `icon-512.png` du pré-cache, comme `maskable` et
`apple-touch`).
