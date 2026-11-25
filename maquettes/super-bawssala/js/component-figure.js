/* ==========================================================================
   بوصلة العلوم · النسخة الشاملة
   component-figure.js — figures des documents du sujet (SVG inline).

   Pourquoi : un sujet de bac, ce sont des documents à LIRE, pas des phrases.
   On redessine donc les 4 documents (courbe d'activité, boucle de
   transcription, volume tumoral, schéma ATAC) en style « cahier » :
   traits doux, encre pin, accents miel. 100 % vectoriel, donc net à l'impression.

   B.figure(type, options) → chaîne SVG (ou "")
   ========================================================================== */
(function () {
  "use strict";

  var B = window.Bawssala;

  var ENCRE = "#225342";
  var MIEL = "#c9902a";
  var DOUX = "#8ea79b";
  var PAPIER = "#fffdf6";

  function vide(t) {
    return '<svg class="figure" viewBox="0 0 260 140" role="img" aria-label="' +
      B.ech(t || "شكل") + '" xmlns="http://www.w3.org/2000/svg"></svg>';
  }

  function cadre(titre, interieur, options) {
    var o = options || {};
    return (
      '<svg class="figure" viewBox="0 0 260 140" role="img" aria-label="' +
      B.ech(titre) +
      '" xmlns="http://www.w3.org/2000/svg" direction="ltr" fill="none" stroke-linecap="round"' +
      ' stroke-linejoin="round">' +
      '<rect x="0.75" y="0.75" width="258.5" height="138.5" rx="12" fill="' +
      (o.fond || PAPIER) +
      '" stroke="#ded7c6" stroke-width="1.2"/>' +
      interieur +
      "</svg>"
    );
  }

  /* ---------------------------------------------------- أ · courbe activité */
  function courbe(o) {
    /* points : concentration (0-100) → activité (0-100) */
    var pts = o.points || [
      { x: 0, y: 100 },
      { x: 10, y: 60 },
      { x: 55, y: 22 },
      { x: 100, y: 8 }
    ];
    var gx = 48;
    var gy = 20;
    var gw = 188;
    var gh = 90;
    var px = function (x) {
      return gx + (x / 100) * gw;
    };
    var py = function (y) {
      return gy + gh - (y / 100) * gh;
    };
    var chemin = pts
      .map(function (p, i) {
        return (i ? "L" : "M") + px(p.x).toFixed(1) + " " + py(p.y).toFixed(1);
      })
      .join(" ");

    return cadre(
      "وثيقة أ: نشاط الإنزيم ينقص مع التركيز",
      '<path d="M' + gx + " " + gy + " V" + (gy + gh) + " H" + (gx + gw) +
        '" stroke="' + DOUX + '" stroke-width="1.4"/>' +
        /* graduations */
        [0, 50, 100]
          .map(function (v) {
            return (
              '<text x="' + (gx - 9) + '" y="' + (py(v) + 3) + '" font-size="8" fill="' + DOUX +
              '" text-anchor="end">' + v + "</text>" +
              '<path d="M' + gx + " " + py(v) + " h4" + '" stroke="' + DOUX + '" stroke-width="1"/>'
            );
          })
          .join("") +
        [0, 10, 100]
          .map(function (v) {
            return (
              '<text x="' + px(v) + '" y="' + (gy + gh + 12) + '" font-size="8" fill="' + DOUX +
              '" text-anchor="middle">' + v + "</text>"
            );
          })
          .join("") +
        '<path d="' + chemin + '" stroke="' + ENCRE + '" stroke-width="2.6"/>' +
        pts
          .map(function (p) {
            return (
              '<circle cx="' + px(p.x) + '" cy="' + py(p.y) + '" r="3.4" fill="' + MIEL +
              '" stroke="' + PAPIER + '" stroke-width="1.4"/>'
            );
          })
          .join("") +
        '<text x="' + (gx + gw / 2) + '" y="128" font-size="9" fill="' + ENCRE +
        '" text-anchor="middle">التركيز (µg/ml)</text>' +
        '<text x="12" y="' + (gy + gh / 2) + '" font-size="9" fill="' + ENCRE +
        '" text-anchor="middle" transform="rotate(-90 12 ' + (gy + gh / 2) + ')">نشاط الإنزيم %</text>'
    );
  }

  /* ------------------------------------------------ ب · boucle TL bloquée */
  function schemaTL() {
    return cadre(
      "وثيقة ب: α-amanitine يثبّت حلقة الإنزيم",
      /* ADN */
      '<path d="M18 46 H242" stroke="' + ENCRE + '" stroke-width="2.4"/>' +
        '<path d="M18 54 H242" stroke="' + ENCRE + '" stroke-width="2.4"/>' +
        Array.apply(null, Array(15))
          .map(function (_, i) {
            var x = 26 + i * 15;
            return '<path d="M' + x + ' 46 V54" stroke="' + DOUX + '" stroke-width="1.2"/>';
          })
          .join("") +
        /* ARN naissant */
        '<path d="M120 46 C120 34 108 32 100 30" stroke="' + MIEL + '" stroke-width="2"/>' +
        '<text x="86" y="26" font-size="8" fill="' + MIEL + '">ARNm</text>' +
        /* enzyme */
        '<ellipse cx="132" cy="50" rx="26" ry="17" fill="#eaf1e7" stroke="' + ENCRE + '" stroke-width="1.8"/>' +
        /* blocage */
        '<circle cx="132" cy="50" r="6" fill="' + MIEL + '" stroke="#8a5f13" stroke-width="1.2"/>' +
        '<path d="M160 24 L186 12" stroke="' + MIEL + '" stroke-width="1.4" stroke-dasharray="3 3"/>' +
        '<text x="188" y="12" font-size="8" fill="' + ENCRE + '" text-anchor="start">α-amanitine</text>' +
        /* flèche bloquée */
        '<path d="M96 96 H176" stroke="' + DOUX + '" stroke-width="2" stroke-dasharray="5 4"/>' +
        '<path d="M176 96 l-7 -4 v8 z" fill="' + DOUX + '" stroke="none"/>' +
        '<text x="136" y="112" font-size="8.5" fill="' + ENCRE + '" text-anchor="middle">' +
        "الاستطالة تتوقّف</text>" +
        '<text x="132" y="50" font-size="7.5" fill="#8a5f13" text-anchor="middle" dy="1">✕</text>' +
        '<text x="30" y="76" font-size="8.5" fill="' + ENCRE + '">ARN بوليميراز</text>'
    );
  }

  /* ---------------------------------------------- ج · volume tumoral */
  function barres(o) {
    var groupes = o.groupes || [
      { t: "اليوم 0", a: 200, b: 200 },
      { t: "اليوم 7", a: 900, b: 620 },
      { t: "اليوم 15", a: 2000, b: 180 }
    ];
    var max = 2100;
    var base = 112;
    var haut = 26;
    var gw = 190;
    var gx = 46;
    var largeurG = gw / groupes.length;
    var bare = function (v, cx, couleur) {
      var h = ((v / max) * (base - haut)).toFixed(1);
      return (
        '<rect x="' + (cx - 11) + '" y="' + (base - h) + '" width="22" height="' + h +
        '" rx="4" fill="' + couleur + '" opacity="0.92"/>'
      );
    };
    return cadre(
      "وثيقة ج: حجم الورم مع الدواء وبدونه",
      groupes
        .map(function (g, i) {
          var cx = gx + largeurG * i + largeurG / 2;
          return (
            bare(g.a, cx - 12, DOUX) +
            bare(g.b, cx + 12, MIEL) +
            '<text x="' + cx + '" y="' + (base + 13) + '" font-size="8" fill="' + ENCRE +
            '" text-anchor="middle">' + B.ech(g.t) + "</text>"
          );
        })
        .join("") +
        '<path d="M' + gx + " " + base + " H" + (gx + gw) + '" stroke="' + DOUX + '" stroke-width="1.4"/>' +
        '<text x="' + gx + '" y="' + (base + 26) + '" font-size="8" fill="' + DOUX + '">0</text>' +
        '<text x="' + gx + '" y="' + (haut - 4) + '" font-size="8" fill="' + DOUX + '">2000 mm³</text>' +
        /* légende */
        '<rect x="150" y="8" width="8" height="8" rx="2" fill="' + DOUX + '"/>' +
        '<text x="162" y="15" font-size="7.5" fill="' + ENCRE + '">بلا دواء</text>' +
        '<rect x="196" y="8" width="8" height="8" rx="2" fill="' + MIEL + '"/>' +
        '<text x="208" y="15" font-size="7.5" fill="' + ENCRE + '">ATAC</text>'
    );
  }

  /* ------------------------------------------------- د · mécanisme ATAC */
  function schemaATAC() {
    /* Un flux en 4 temps, de droite à gauche : ATAC → liaison → entrée → noyau.
       Plus lisible qu'une scène de cellule à cette taille. */
    var cx = [208, 148, 88, 28];
    var yIcone = 34;
    var fleche = function (x) {
      return (
        '<path d="M' + (x + 14) + " " + (yIcone + 12) + " h-9" + '" stroke="' + DOUX +
        '" stroke-width="1.6" stroke-dasharray="4 3"/>' +
        '<path d="M' + (x + 4) + " " + (yIcone + 12) + " l6 -3.6 v7.2 z" + '" fill="' + DOUX + '" stroke="none"/>'
      );
    };
    return cadre(
      "وثيقة د: من الدواء إلى النواة",
      /* 1. ATAC : anticorps + 2 toxines */
      '<path d="M' + cx[0] + " " + (yIcone + 30) + " l-11 -16 M" + cx[0] + " " + (yIcone + 30) +
        " l11 -16" + '" stroke="' + ENCRE + '" stroke-width="2.4"/>' +
        '<circle cx="' + (cx[0] - 11) + '" cy="' + (yIcone + 12) + '" r="2.8" fill="' + MIEL + '"/>' +
        '<circle cx="' + (cx[0] + 11) + '" cy="' + (yIcone + 12) + '" r="2.8" fill="' + MIEL + '"/>' +
        fleche(cx[0]) +
        /* 2. liaison à un protéine de membrane */
        '<path d="M' + (cx[1] - 20) + " " + (yIcone + 34) + " H" + (cx[1] + 20) + '" stroke="' + DOUX + '" stroke-width="3"/>' +
        '<path d="M' + (cx[1] - 5) + " " + (yIcone + 34) + " v-14 h10 v14" + '" stroke="' + ENCRE +
        '" stroke-width="2" fill="#eaf1e7"/>' +
        '<circle cx="' + cx[1] + '" cy="' + (yIcone + 12) + '" r="3" fill="' + MIEL + '"/>' +
        fleche(cx[1]) +
        /* 3. vésicule + lysosome */
        '<circle cx="' + cx[2] + '" cy="' + (yIcone + 18) + '" r="16" fill="#f7e7c3" stroke="' + MIEL + '" stroke-width="1.6"/>' +
        '<path d="M' + (cx[2] - 7) + " " + (yIcone + 18) + " h14" + '" stroke="#8a5f13" stroke-width="1.6"/>' +
        '<path d="M' + (cx[2] + 4) + " " + (yIcone + 18) + " l-4 -4 m4 4 l-4 4" + '" stroke="#8a5f13" stroke-width="1.4"/>' +
        fleche(cx[2]) +
        /* 4. noyau : transcription barrée */
        '<circle cx="' + cx[3] + '" cy="' + (yIcone + 20) + '" r="17" fill="#eef3ea" stroke="' + ENCRE + '" stroke-width="1.6"/>' +
        '<path d="M' + (cx[3] - 8) + " " + (yIcone + 20) + " c4 -8 12 -8 16 0" + '" stroke="' + DOUX + '" stroke-width="1.6"/>' +
        '<path d="M' + (cx[3] - 10) + " " + (yIcone + 32) + " l20 -24" + '" stroke="' + MIEL + '" stroke-width="2.2"/>' +
        /* étiquettes */
        '<text x="' + cx[0] + '" y="96" font-size="8" fill="' + ENCRE + '" text-anchor="middle">ATAC</text>' +
        '<text x="' + cx[1] + '" y="96" font-size="8" fill="' + ENCRE + '" text-anchor="middle">بروتين غشائي</text>' +
        '<text x="' + cx[2] + '" y="96" font-size="8" fill="' + ENCRE + '" text-anchor="middle">بلعمة + تحرير</text>' +
        '<text x="' + cx[3] + '" y="96" font-size="8" fill="' + ENCRE + '" text-anchor="middle">نواة</text>' +
        '<text x="130" y="120" font-size="8.5" fill="' + MIEL + '" text-anchor="middle">' +
        "الاستنساخ يتوقّف ← الورم ما يكبرش</text>"
    );
  }

  var RENDU = {
    courbe: courbe,
    tl: schemaTL,
    barres: barres,
    atac: schemaATAC
  };

  /**
   * @param {string} type  "courbe" | "tl" | "barres" | "atac"
   * @param {object} options  données de la figure (points, groupes…)
   */
  B.figure = function (type, options) {
    var f = RENDU[type];
    if (!f) return vide("شكل");
    try {
      return f(options || {});
    } catch (e) {
      return vide("شكل");
    }
  };
})();
