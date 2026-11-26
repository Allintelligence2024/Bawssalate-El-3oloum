#!/usr/bin/env python3
"""Composites de contrôle des repères — un PNG par visuel annoté, pastilles comprises.

    python scripts/previsualiser-annotations.py                # les 16 visuels annotés
    python scripts/previsualiser-annotations.py <id> [<id>…]    # seulement ceux-là

Pourquoi ce script : la règle du projet est de **regarder** chaque schéma annoté avant de le
valider (le numéro 3 tombe-t-il bien sur le ribosome ?). Ce script recompose exactement ce
que l'application affiche — mêmes coordonnées `(x %, y %)`, mêmes pastilles — pour les deux
familles de visuels :

  - `webp_annote`    : l'image WebP muette, redimensionnée à 900 px de large ;
  - `svg_vectoriel`  : le SVG est rastérisé par le sous-ensemble de rendu de
                        `previsualiser-schemas.py` (pas de rsvg/cairosvg dans cet environnement).

Sorties : `.cache/qa-composites/<id>_qa.png` — hors Git, jamais servies par l'application.
Le registre `src/data/schemasSvt.ts` est la seule source des coordonnées : si une pastille est
décalée ici, elle l'est aussi dans l'app.
"""

from __future__ import annotations

import importlib.util
import re
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

RACINE = Path(__file__).resolve().parent.parent
REGISTRE = RACINE / "src/data/schemasSvt.ts"
IMAGES = RACINE / "public/lecons/img"
SORTIE = RACINE / ".cache/qa-composites"
LARGEUR_QA = 900

VERT = (31, 111, 82, 255)
BLANC = (255, 255, 255, 255)
ENCRE = (31, 45, 39)


def charge_renderer_svg():
    """Importe `dessiner()` depuis `previsualiser-schemas.py` (nom avec tiret → import direct impossible)."""
    chemin = RACINE / "scripts/previsualiser-schemas.py"
    spec = importlib.util.spec_from_file_location("previsualiser_schemas", chemin)
    if spec is None or spec.loader is None:  # pragma: no cover - garde-fou d'environnement
        raise RuntimeError(f"Renderer SVG introuvable : {chemin}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module.dessiner


def entrees() -> list[dict]:
    """Lit les entrées annotées du registre TypeScript (format d'écriture stable, une ligne par repère)."""
    source = REGISTRE.read_text(encoding="utf-8")
    resultat: list[dict] = []
    for bloc in re.split(r"\n  \{\n    id: '", source)[1:]:
        identifiant = bloc.split("'", 1)[0]
        fichier = re.search(r"fichier: '([^']+)'", bloc)
        if not fichier:
            continue
        reperes = [
            {"num": int(n), "x": float(x), "y": float(y)}
            for n, x, y in re.findall(r"\{ num: (\d+), x: ([\d.]+), y: ([\d.]+),", bloc)
        ]
        if not reperes:
            continue
        resultat.append({"id": identifiant, "fichier": fichier.group(1), "reperes": reperes})
    return resultat


def police(taille: float, gras: bool = False) -> ImageFont.FreeTypeFont:
    nom = "DejaVuSans-Bold.ttf" if gras else "DejaVuSans.ttf"
    return ImageFont.truetype(f"/usr/share/fonts/truetype/dejavu/{nom}", int(taille))


def image_du_visuel(fichier: str, dessiner_svg) -> Image.Image:
    chemin = IMAGES / fichier
    if fichier.endswith(".svg"):
        img = dessiner_svg(chemin.read_text(encoding="utf-8"), 1.0)
    else:
        img = Image.open(chemin).convert("RGB")
    if img.width > LARGEUR_QA:
        img = img.resize((LARGEUR_QA, round(LARGEUR_QA * img.height / img.width)), Image.LANCZOS)
    return img


def composer(entree: dict, img: Image.Image) -> Image.Image:
    """Pose les pastilles (mêmes couleurs que l'app) puis ajoute un bandeau de contrôle."""
    calque = img.convert("RGBA")
    dessin = ImageDraw.Draw(calque, "RGBA")
    rayon = max(10, round(img.width * 0.014))
    taille = max(11, round(rayon * 1.15))
    for repere in entree["reperes"]:
        x = img.width * repere["x"] / 100
        y = img.height * repere["y"] / 100
        if not (0 <= x <= img.width and 0 <= y <= img.height):  # pragma: no cover
            print(f"  ⚠ {entree['id']} : repère {repere['num']} hors image ({x:.0f}, {y:.0f})")
        dessin.ellipse([x - rayon, y - rayon, x + rayon, y + rayon], fill=VERT, outline=BLANC, width=2)
        dessin.text((x, y + 1), str(repere["num"]), font=police(taille, gras=True), fill="white", anchor="mm")

    entete = Image.new("RGB", (calque.width, 28), "white")
    ImageDraw.Draw(entete).text(
        (6, 7),
        f"{entree['id']} — {len(entree['reperes'])} repères — QA composite {calque.width}px",
        font=police(13, gras=True),
        fill=ENCRE,
    )
    finale = Image.new("RGB", (calque.width, calque.height + 24), "white")
    finale.paste(entete, (0, 0))
    finale.paste(calque.convert("RGB"), (0, 24))
    return finale


def main() -> int:
    voulus = [a for a in sys.argv[1:] if not a.startswith("-")]
    dessiner_svg = charge_renderer_svg()
    SORTIE.mkdir(parents=True, exist_ok=True)
    liste = entrees()
    if voulus:
        liste = [e for e in liste if e["id"] in voulus or e["fichier"] in voulus]
    if not liste:
        print("Aucun visuel annoté à composer.")
        return 1
    for entree in liste:
        img = image_du_visuel(entree["fichier"], dessiner_svg)
        final = composer(entree, img)
        cible = SORTIE / f"{entree['id']}_qa.png"
        final.save(cible, optimize=True)
        print(f"{cible.relative_to(RACINE)}  {final.width}×{final.height}  {cible.stat().st_size / 1024:.0f} Ko")
    return 0


if __name__ == "__main__":
    sys.exit(main())
