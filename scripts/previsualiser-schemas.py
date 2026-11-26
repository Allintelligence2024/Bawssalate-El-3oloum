#!/usr/bin/env python3
"""Planche de contrôle des schémas : SVG + pastilles, rendue en PNG pour l'inspection visuelle.

    python3 scripts/previsualiser-schemas.py                 # toutes les planches
    python3 scripts/previsualiser-schemas.py u3-ph u2-anfinsen

Pourquoi ce script existe : la vérification exigée est **visuelle, une par une**. Aucun
navigateur n'est disponible dans l'environnement de contrôle, et une planche SVG relue
seulement dans son code source laisse passer les pastilles hors cible, les courbes qui
sortent du cadre et les étiquettes qui se chevauchent. Ce rendu volontairement simple ne
remplace pas le navigateur : il couvre le sous-ensemble SVG réellement produit par
`scripts/generer-schemas-svt.mjs` (rect, ellipse, circle, line, path M/L/Q/Z, text) et
superpose les repères enregistrés dans `plans/_travail-images/reperes.json`.

Sorties : `plans/preuves-schemas/<slug>.png` (largeur 900 px, poids maîtrisé).
"""

from __future__ import annotations

import json
import math
import re
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

RACINE = Path(__file__).resolve().parent.parent
IMAGES = RACINE / "public/lecons/img"
REPERES = RACINE / "plans/_travail-images/reperes.json"
SORTIE = RACINE / "plans/preuves-schemas"
ECHELLE = 0.75
POLICE = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
POLICE_GRAS = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"


def police(taille: float, gras: bool = False) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(POLICE_GRAS if gras else POLICE, max(7, int(round(taille))))


def couleur(valeur: str | None, defaut=(0, 0, 0, 255)):
    if not valeur or valeur in ("none", "transparent"):
        return None
    if valeur.startswith("#"):
        h = valeur[1:]
        if len(h) == 3:
            h = "".join(c * 2 for c in h)
        return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), 255)
    m = re.match(r"rgba?\(([^)]+)\)", valeur)
    if m:
        parts = [float(x) for x in m.group(1).replace("/", ",").split(",")]
        a = int(parts[3] * 255) if len(parts) > 3 else 255
        return (int(parts[0]), int(parts[1]), int(parts[2]), a)
    return defaut


def nombre(valeur: str | None, defaut=0.0) -> float:
    if valeur is None:
        return defaut
    return float(re.sub(r"[^0-9eE+\-.]", "", valeur) or defaut)


def attributs(balise: str) -> dict[str, str]:
    return dict(re.findall(r'([a-zA-Z:-]+)="([^"]*)"', balise))


# ─────────────────────────── chemin SVG (sous-ensemble) ───────────────────────────

JETON = re.compile(r"[MmLlQqZzCcHhVv]|-?\d*\.?\d+(?:e-?\d+)?")


def chemin_points(d: str) -> tuple[list[tuple[float, float]], bool]:
    jetons = JETON.findall(d)
    i = 0
    courant = (0.0, 0.0)
    depart = (0.0, 0.0)
    points: list[tuple[float, float]] = []
    ferme = False

    def lire(n: int) -> list[float]:
        nonlocal i
        vals = [float(x) for x in jetons[i:i + n]]
        i += n
        return vals

    while i < len(jetons):
        cmd = jetons[i]
        i += 1
        if cmd in "Mm":
            x, y = lire(2)
            if cmd == "m":
                x, y = courant[0] + x, courant[1] + y
            courant = depart = (x, y)
            points.append(courant)
        elif cmd in "Ll":
            x, y = lire(2)
            if cmd == "l":
                x, y = courant[0] + x, courant[1] + y
            courant = (x, y)
            points.append(courant)
        elif cmd in "Hh":
            (x,) = lire(1)
            if cmd == "h":
                x += courant[0]
            courant = (x, courant[1])
            points.append(courant)
        elif cmd in "Vv":
            (y,) = lire(1)
            if cmd == "v":
                y += courant[1]
            courant = (courant[0], y)
            points.append(courant)
        elif cmd in "Qq":
            cx, cy, x, y = lire(4)
            if cmd == "q":
                cx, cy, x, y = courant[0] + cx, courant[1] + cy, courant[0] + x, courant[1] + y
            for t in (0.25, 0.5, 0.75, 1.0):
                px = (1 - t) ** 2 * courant[0] + 2 * (1 - t) * t * cx + t ** 2 * x
                py = (1 - t) ** 2 * courant[1] + 2 * (1 - t) * t * cy + t ** 2 * y
                points.append((px, py))
            courant = (x, y)
        elif cmd in "Cc":
            c1x, c1y, c2x, c2y, x, y = lire(6)
            if cmd == "c":
                c1x, c1y = courant[0] + c1x, courant[1] + c1y
                c2x, c2y = courant[0] + c2x, courant[1] + c2y
                x, y = courant[0] + x, courant[1] + y
            for k in range(1, 9):
                t = k / 8
                px = ((1 - t) ** 3 * courant[0] + 3 * (1 - t) ** 2 * t * c1x
                      + 3 * (1 - t) * t ** 2 * c2x + t ** 3 * x)
                py = ((1 - t) ** 3 * courant[1] + 3 * (1 - t) ** 2 * t * c1y
                      + 3 * (1 - t) * t ** 2 * c2y + t ** 3 * y)
                points.append((px, py))
            courant = (x, y)
        elif cmd in "Zz":
            points.append(depart)
            courant = depart
            ferme = True
        else:  # commande non couverte : on saute ses nombres
            while i < len(jetons) and not jetons[i].isalpha():
                i += 1
    return points, ferme


# ─────────────────────────── rendu ───────────────────────────

def transformer(point, echelle):
    return (point[0] * echelle, point[1] * echelle)


def herite(element, arbre_parents: dict) -> dict[str, str]:
    """Attributs effectifs : ceux de l'élément, complétés par ses ancêtres <g>."""
    attrs: dict[str, str] = {}
    chaine = []
    parent = arbre_parents.get(element)
    while parent is not None:
        chaine.append(parent)
        parent = arbre_parents.get(parent)
    for noeud in reversed(chaine):
        attrs.update(noeud.attrib if hasattr(noeud, "attrib") else noeud)
    attrs.update(element.attrib)
    return attrs


def dessiner(svg: str, echelle: float) -> Image.Image:
    import xml.etree.ElementTree as ET
    from html import unescape

    racine = ET.fromstring(svg)
    largeur = int(nombre(racine.get("width"), 1200))
    hauteur = int(nombre(racine.get("height"), 800))
    img = Image.new("RGB", (int(largeur * echelle), int(hauteur * echelle)), "white")
    dessin = ImageDraw.Draw(img, "RGBA")

    parents: dict = {}
    for parent in racine.iter():
        for enfant in parent:
            parents[enfant] = parent

    def locale(balise) -> str:
        return balise.tag.split("}")[-1]

    for element in racine.iter():
        nom = locale(element)
        if nom not in ("rect", "ellipse", "circle", "line", "path", "text"):
            continue
        a = herite(element, parents)
        ep = max(1, int(round(nombre(a.get("stroke-width"), 2) * echelle)))
        trait = couleur(a.get("stroke"))
        fond = couleur(a.get("fill"))
        pointilles = a.get("stroke-dasharray")
        opacite = float(a.get("opacity", "1"))

        def teinte(c):
            if c is None or opacite >= 1:
                return c
            return (c[0], c[1], c[2], int(c[3] * opacite))

        trait, fond = teinte(trait), teinte(fond)

        if nom == "rect":
            x, y = nombre(a.get("x")), nombre(a.get("y"))
            l, h = nombre(a.get("width")), nombre(a.get("height"))
            r = nombre(a.get("rx"))
            boite = [x * echelle, y * echelle, (x + l) * echelle, (y + h) * echelle]
            if r:
                dessin.rounded_rectangle(boite, radius=r * echelle, fill=fond, outline=trait, width=ep)
            else:
                dessin.rectangle(boite, fill=fond, outline=trait, width=ep)
        elif nom == "ellipse":
            cx, cy = nombre(a.get("cx")), nombre(a.get("cy"))
            rx, ry = nombre(a.get("rx")), nombre(a.get("ry"))
            boite = [(cx - rx) * echelle, (cy - ry) * echelle, (cx + rx) * echelle, (cy + ry) * echelle]
            dessin.ellipse(boite, fill=fond, outline=trait, width=ep)
        elif nom == "circle":
            cx, cy, r = nombre(a.get("cx")), nombre(a.get("cy")), nombre(a.get("r"))
            boite = [(cx - r) * echelle, (cy - r) * echelle, (cx + r) * echelle, (cy + r) * echelle]
            dessin.ellipse(boite, fill=fond, outline=trait, width=ep)
        elif nom == "line":
            p1 = (nombre(a.get("x1")) * echelle, nombre(a.get("y1")) * echelle)
            p2 = (nombre(a.get("x2")) * echelle, nombre(a.get("y2")) * echelle)
            if pointilles:
                tirets = [float(v) for v in re.split(r"[ ,]+", pointilles) if v]
                pas = (tirets[0] if tirets else 6) * echelle
                trou = (tirets[1] if len(tirets) > 1 else pas) * echelle
                longueur = math.dist(p1, p2)
                if longueur:
                    dx, dy = (p2[0] - p1[0]) / longueur, (p2[1] - p1[1]) / longueur
                    s = 0.0
                    while s < longueur:
                        e = min(s + pas, longueur)
                        dessin.line([(p1[0] + dx * s, p1[1] + dy * s), (p1[0] + dx * e, p1[1] + dy * e)],
                                    fill=trait, width=ep)
                        s = e + trou
            else:
                dessin.line([p1, p2], fill=trait, width=ep)
        elif nom == "path":
            points, ferme = chemin_points(a.get("d", ""))
            if len(points) > 1:
                ecran = [(x * echelle, y * echelle) for x, y in points]
                if fond:
                    dessin.polygon(ecran, fill=fond, outline=trait)
                if trait:
                    dessin.line(ecran, fill=trait, width=ep, joint="curve")
        elif nom == "text":
            contenu = unescape("".join(element.itertext()) or "")
            if not contenu.strip():
                continue
            x, y = nombre(a.get("x")), nombre(a.get("y"))
            taille = nombre(a.get("font-size"), 16) * echelle
            # La couleur du texte est `fill` ; `stroke` ne sert qu'au halo blanc (paint-order).
            teinte_texte = couleur(a.get("fill")) or (0, 0, 0, 255)
            f = police(taille, gras=a.get("font-weight") == "700")
            ancre = {"middle": "mm", "end": "rt"}.get(a.get("text-anchor"), "lt")
            rotation = a.get("transform")
            if rotation:
                calque = Image.new("RGBA", img.size, (0, 0, 0, 0))
                ImageDraw.Draw(calque).text((x * echelle, y * echelle), contenu,
                                            font=f, fill=teinte_texte, anchor=ancre)
                angle = float(re.search(r"rotate\(([-\d.]+)", rotation).group(1))
                calque = calque.rotate(-angle, center=(x * echelle, y * echelle), resample=Image.BICUBIC)
                img.paste(Image.composite(calque, img.convert("RGBA"), calque), (0, 0), calque)
            else:
                dessin.text((x * echelle, y * echelle), contenu, font=f, fill=teinte_texte, anchor=ancre)
    return img


def planche(slug: str, reperes: list[dict], img: Image.Image) -> Image.Image:
    """Ajoute les pastilles numérotées telles que l'application les posera (x %, y %)."""
    dessin = ImageDraw.Draw(img, "RGBA")
    r = max(9, int(11 * ECHELLE * 1.3))
    for repere in reperes:
        x = img.width * repere["x"] / 100
        y = img.height * repere["y"] / 100
        dessin.ellipse([x - r, y - r, x + r, y + r], fill=(31, 111, 82, 255), outline=(255, 255, 255, 255), width=2)
        f = police(r * 1.15, gras=True)
        dessin.text((x, y + 1), str(repere["num"]), font=f, fill="white", anchor="mm")
    entete = Image.new("RGB", (img.width, 26), "white")
    ImageDraw.Draw(entete).text((6, 6), f"{slug} — {img.width}×{img.height} px (rendu {int(ECHELLE * 100)} %)",
                                font=police(13, gras=True), fill=(31, 45, 39))
    finale = Image.new("RGB", (img.width, img.height + 26), "white")
    finale.paste(entete, (0, 0))
    finale.paste(img, (0, 26))
    return finale


def main() -> int:
    voulus = [a for a in sys.argv[1:] if not a.startswith("-")]
    try:
        reperes = json.loads(REPERES.read_text(encoding="utf-8"))
    except FileNotFoundError:
        reperes = {}
    SORTIE.mkdir(parents=True, exist_ok=True)
    fichiers = sorted(IMAGES.glob("*.svg"))
    if voulus:
        fichiers = [f for f in fichiers if f.stem in voulus]
    if not fichiers:
        print("Aucun schéma à rendre.")
        return 1
    for fichier in fichiers:
        img = dessiner(fichier.read_text(encoding="utf-8"), ECHELLE)
        img = planche(fichier.stem, reperes.get(fichier.stem, []), img)
        cible = SORTIE / f"{fichier.stem}.png"
        img.save(cible, optimize=True)
        print(f"{cible.relative_to(RACINE)}  {img.width}×{img.height}  {cible.stat().st_size / 1024:.0f} Ko")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
