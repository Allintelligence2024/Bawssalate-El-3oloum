# Médias de l'application — provenance et recettes

Dossier des **originaux de travail** (pas servis par l'app). Les fichiers réellement expédiés
sont dans `public/`.

## Provenance

Dossier Drive « Photos APP Bawssala » (lien fourni par le porteur du projet, 21/11/2026) :

| Original | Format | Poids | Usage (depuis la phase 1 « Guide-First ») |
|---|---|---|---|
| `1793263565999.jpg` | 2048×2048 | 519 ko | **icône de l'application** (192/512/maskable/iOS + en-tête) |
| `363617321_…jpg` | 1536×2752, fond blanc | 484 ko | **portrait du guide** (`mascotte.webp`) et **visuel clair** (`guide-clair.webp`) |
| `1793263825400.jpg` | 1536×2752, jungle sombre | 610 ko | **visuel sombre** (`guide-sombre.webp`) |
| `42700731_…mp4` | 1080×1920, 8 s, 13 405 ko | 13,4 Mo | **plus utilisé** : la vidéo d'ouverture a été supprimée |

Les trois images sont archivées ici (`icone-source.jpg`, `mascotte-source.jpg`,
`guide-sombre-source.jpg`) pour que les recettes ci-dessous soient reproductibles octet par
octet. La vidéo reste dans le Drive : elle n'est plus servie par l'application.

## Recettes exactes (ImageMagick seul, sans ffmpeg ni sharp)

```bash
# 1. Portrait du guide : carré centré sur la tête, fond blanc retiré aux quatre coins,
#    360 px, WebP qualité 82 → 17 634 o.
convert mascotte-source.jpg -crop 880x880+390+400 +repage \
  -alpha set -fuzz 12% -fill none \
  -draw "color 0,0 floodfill"     -draw "color 879,0 floodfill" \
  -draw "color 0,879 floodfill"   -draw "color 879,879 floodfill" \
  -resize 360x360 -quality 82 public/mascotte.webp

# 2. Visuel clair : on coupe le titre doré (bas de l'image), le blanc devient transparent,
#    600 px, qualité 74 → 35 510 o.
convert mascotte-source.jpg -crop 1536x2300+0+0 +repage \
  -alpha set -fuzz 10% -fill none \
  -draw "color 0,0 floodfill"      -draw "color 1535,0 floodfill" \
  -draw "color 0,2299 floodfill"   -draw "color 1535,2299 floodfill" \
  -bordercolor none -border 24 -resize 600x -quality 74 public/guide-clair.webp

# 3. Visuel sombre : même coupe du titre, 600 px, qualité 68 → 50 574 o.
convert guide-sombre-source.jpg -crop 1536x2200+0+0 +repage \
  -resize 600x -quality 68 public/guide-sombre.webp

# 4. Icônes : on recadre à l'intérieur du cadre doré (plein bord), puis WebP.
convert icone-source.jpg -crop 1880x1880+84+84 +repage /tmp/icone-carree.png  # retire le cadre
convert /tmp/icone-carree.png -resize 192x192 -quality 84 public/icons/icon-192.webp  # 10 320 o
convert /tmp/icone-carree.png -resize 512x512 -quality 82 public/icons/icon-512.webp  # 39 380 o
# maskable : même intérieur, 404 px sur fond sarcelle plein (zone sûre de 80 %).
convert icone-source.jpg -crop 1700x1700+174+174 +repage -resize 404x404 \
  -background "#08434b" -gravity center -extent 512x512 \
  -quality 82 public/icons/maskable-512.webp                   # 29 132 o
# iOS : PNG opaque obligatoire ; non précaché (installation en ligne uniquement).
convert /tmp/icone-carree.png -resize 180x180 -strip \
  -quality 90 public/icons/apple-touch-180.png                 # 58 505 o
```

`scripts/generer-icones.mjs` reste la **voie vectorielle** (rendu Chromium de `public/icon.svg`
puis encodage WebP par ImageMagick) pour les mipmaps et les écrans Android ; les fichiers
livrés au web viennent de l'artwork ci-dessus.

## Ce qui a été retiré, et pourquoi

- **`public/ouverture.mp4` (2 050 998 o)** : une vidéo de 2 Mo pour un écran vu une fois par
  session, et un premier rendu qui attendait `canplay`. Le splash est maintenant une affiche
  WebP précachée, sans lecteur vidéo (`EcranDemarrage.tsx`). La phase 2 du plan « Guide-First »
  supprime l'écran lui-même.
- **`public/personnage-pirate.webp` (61 950 o)** et ses recettes ffmpeg : visuel remplacé par
  l'artwork officiel, qui est aussi celui de l'icône — un seul personnage dans toute l'app.
- **`public/icons/*.png`** : remplacés par des WebP (qualité photographique impossible en PNG8,
  poids divisé par ~1,4 à 4). Le manifeste annonce `type: "image/webp"` ; seul
  `apple-touch-180.png` reste en PNG, parce qu'iOS l'exige.

## Budget

Coquille hors ligne après ces changements : **2,17 Mio** (2 271 954 o, 7 entrées statiques),
contre 2,49 Mio avant. Les visuels du guide (86 ko à eux deux) sont précachés — c'est la
première chose que l'élève voit hors ligne.
