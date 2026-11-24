/* ==========================================================================
   بوصلة العلوم · النسخة الشاملة
   screen-ana-apply.js — المرحلة 6 « أنا »
   البطاقة + الدروع + الجاهزية + مراجعات اليوم (SM-2).
   Aucune note sur 20 : des niveaux par compétence et un indicateur directionnel.
   ========================================================================== */
(function () {
  "use strict";

  var B = window.Bawssala;
  var racine = null;
  var detachers = [];
  var S = { dernier: null };

  /* ======================================================================
     DONNÉES AFFICHÉES
     ====================================================================== */
  function etat() {
    return B.Etat.get();
  }

  function regularite() {
    return B.Etat.regularite();
  }

  function niveau() {
    return B.Etat.niveau();
  }

  function kafaa() {
    return B.Etat.vueKafaa();
  }

  function preuves() {
    return B.Etat.preuves() || [];
  }

  function plan() {
    return B.Etat.planDeJour();
  }

  /** Nombre de compétences qui ont au moins une preuve. */
  function competencesCouvertes() {
    return kafaa().filter(function (c) {
      return c.preuves > 0;
    }).length;
  }

  function points(d) {
    var n = B.clamp(Math.round(d.niveau), 0, 3);
    var html = "";
    for (var i = 0; i < 3; i++) {
      html +=
        '<span class="ana-pt" data-etat="' + (i < n ? "plein" : "vide") + '" aria-hidden="true"></span>';
    }
    return '<span class="ana-pts" role="img" aria-label="' + n + " من 3" + '">' + html + "</span>";
  }

  /* ======================================================================
     LA CARTE (SVG) — la pièce visuelle de cet écran
     ====================================================================== */
  function carteSVG(compact) {
    var d = niveau();
    var reg = regularite();
    var nbPreuves = preuves().length;
    var rempli = B.clamp(d.dansNiveau / d.seuil, 0, 1);
    var arc = 2 * Math.PI * 34 * rempli;
    var niveaux = B.clamp(Math.round(B.Etat.vueKafaa().reduce(function (s, c) {
      return s + c.niveau;
    }, 0) / 8), 0, 3);

    var stats = [
      { x: 300, libelle: "الأدلة", valeur: B.chiffres(nbPreuves) },
      { x: 180, libelle: "الأيام المنتظمة", valeur: B.chiffres(reg.jours) + " من 7" },
      { x: 60, libelle: "الدروع", valeur: B.chiffres(reg.boucliers) + " من " + B.chiffres(reg.bouclierMax) }
    ];

    /* Rose des vents : même dessin dans les deux mises en page. */
    function rose(cx, cy, r) {
      return (
        '<g transform="translate(' + cx + " " + cy + ')">' +
        '<circle r="' + r + '" fill="#f9f2e3" stroke="#cfd9c6" stroke-width="1.4"/>' +
        '<circle r="' + (r - 7) + '" fill="none" stroke="#e7d5ac" stroke-width="6" stroke-dasharray="' +
        ((2 * Math.PI * (r - 7) * rempli).toFixed(1)) + " " + (2 * Math.PI * (r - 7)).toFixed(1) +
        '" stroke-linecap="round"/>' +
        '<path d="M0 -25 L7 0 L0 25 L-7 0 Z" fill="#225342"/>' +
        '<path d="M-25 0 L0 -6 L25 0 L0 6 Z" fill="#c9902a" opacity=".55"/>' +
        '<circle r="3.4" fill="#fffef8" stroke="#225342" stroke-width="1.6"/>' +
        "</g>"
      );
    }

    /* Version imprimée : le titre et le niveau sont déjà dans l'en-tête de la
       feuille, la carte se contente de la rose et des trois chiffres. */
    if (compact) {
      var lignes = [
        { y: 46, libelle: "الأدلة", valeur: B.chiffres(nbPreuves) },
        { y: 80, libelle: "الأيام المنتظمة", valeur: B.chiffres(reg.jours) + " من 7" },
        { y: 114, libelle: "الدروع", valeur: B.chiffres(reg.boucliers) + " من " + B.chiffres(reg.bouclierMax) }
      ];
      return (
        '<svg class="ana-carte__svg" viewBox="0 0 360 158" role="img" ' +
        'aria-label="بطاقة البوصلة: المستوى ' + d.n + " · " + B.ech(d.nom) + '">' +
        '<rect x="3" y="3" width="354" height="152" rx="18" fill="#fffef8" stroke="#dec084" stroke-width="2.5"/>' +
        '<rect x="11" y="11" width="338" height="136" rx="13" fill="none" stroke="#e7d5ac" stroke-width="1"/>' +
        rose(74, 72, 38) +
        '<text x="74" y="126" font-size="8.5" fill="#4e6557" text-anchor="middle" direction="rtl">الجاهزية</text>' +
        '<text x="74" y="140" font-size="11.5" font-weight="800" fill="#225342" text-anchor="middle" direction="rtl">' +
        B.chiffres(niveaux) + " من 3</text>" +
        '<line x1="146" y1="30" x2="146" y2="130" stroke="#dfe5d7" stroke-width="1"/>' +
        lignes
          .map(function (l) {
            return (
              '<text x="336" y="' + l.y + '" font-size="9.5" fill="#4e6557" text-anchor="start" direction="rtl">' +
              l.libelle + "</text>" +
              '<text x="336" y="' + (l.y + 17) + '" font-size="13" font-weight="800" fill="#514025" text-anchor="start" direction="rtl">' +
              l.valeur + "</text>"
            );
          })
          .join("") +
        "</svg>"
      );
    }

    return (
      '<svg class="ana-carte__svg" viewBox="0 0 360 216" role="img" ' +
      'aria-label="بطاقة البوصلة: المستوى ' + d.n + " · " + B.ech(d.nom) + '">' +
      /* cadre */
      '<rect x="3" y="3" width="354" height="210" rx="18" fill="#fffef8" stroke="#dec084" stroke-width="2.5"/>' +
      '<rect x="11" y="11" width="338" height="194" rx="13" fill="none" stroke="#e7d5ac" stroke-width="1"/>' +
      rose(74, 82, 42) +
      /* jauge sous la rose */
      '<text x="74" y="146" font-size="8.5" fill="#4e6557" text-anchor="middle" direction="rtl">الجاهزية</text>' +
      '<text x="74" y="160" font-size="11.5" font-weight="800" fill="#225342" text-anchor="middle" direction="rtl">' +
      B.chiffres(niveaux) + " من 3</text>" +
      /* niveau à droite (RTL) */
      '<text x="336" y="42" font-size="16.5" font-weight="900" fill="#225342" text-anchor="start" direction="rtl">بطاقة البوصلة</text>' +
      '<text x="336" y="62" font-size="9.5" fill="#4e6557" text-anchor="start" direction="rtl">الوحدة 1 · تركيب البروتين</text>' +
      '<line x1="150" y1="74" x2="336" y2="74" stroke="#dfe5d7" stroke-width="1"/>' +
      '<text x="336" y="102" font-size="14" font-weight="800" fill="#225342" text-anchor="start" direction="rtl">' +
      "المستوى " + B.chiffres(d.n) + " · " + B.ech(d.nom) + "</text>" +
      '<text x="336" y="124" font-size="10" fill="#4e6557" text-anchor="start" direction="rtl">' +
      B.chiffres(d.dansNiveau) + " من " + B.chiffres(d.seuil) + " نقطة للمستوى الجاي</text>" +
      /* bandeau de chiffres en bas */
      '<line x1="20" y1="166" x2="340" y2="166" stroke="#dfe5d7" stroke-width="1"/>' +
      stats
        .map(function (st) {
          return (
            '<text x="' + st.x + '" y="186" font-size="8.5" fill="#4e6557" text-anchor="middle" direction="rtl">' +
            st.libelle + "</text>" +
            '<text x="' + st.x + '" y="200" font-size="12" font-weight="800" fill="#514025" text-anchor="middle" direction="rtl">' +
            st.valeur + "</text>"
          );
        })
        .join("") +
      "</svg>"
    );
  }

  /* ======================================================================
     BLOCS
     ====================================================================== */
  function blocCarte() {
    var d = niveau();
    return (
      '<section class="carte carte--or ana-hero">' +
      '<div class="rangee rangee--entre">' +
      '<div><p class="oeil">المرحلة 6 · ملفّي</p>' +
      '<h1 class="titre-1">أنا</h1></div>' +
      '<div style="width:56px">' + B.mascotte("happy", 56) + "</div>" +
      "</div>" +
      '<div class="ana-carte">' + carteSVG() + "</div>" +
      '<div class="rangee rangee--galerie mt-8">' +
      '<button class="btn btn--primaire" type="button" data-action="imprimer">' +
      B.icone("doc", 18) + " اطبع بطاقتي</button>" +
      '<button class="btn btn--secondaire" type="button" data-reference-libre>' +
      B.icone("livre", 18) + " مرجع البوصلة</button>" +
      "</div>" +
      '<p class="petit doux mt-8">' + B.chiffres(d.dansNiveau) + " من " + B.chiffres(d.seuil) +
      " نقطة للمستوى " + B.chiffres(d.n + 1) + ". كل 50 نقطة، مستوى جديد — وبلا عقاب إذا وقفت.</p>" +
      "</section>"
    );
  }

  function blocDroits() {
    var reg = regularite();
    var cases = "";
    for (var i = 0; i < reg.bouclierMax; i++) {
      cases +=
        '<span class="ana-droits__un" data-etat="' + (i < reg.boucliers ? "plein" : "vide") + '">' +
        B.icone("bouclier", 22) + "</span>";
    }
    return (
      '<section class="carte">' +
      '<div class="carte__tete"><span class="carte__titre">الدروع</span>' +
      '<span class="mention">' + B.chiffres(reg.boucliers) + " من " + B.chiffres(reg.bouclierMax) + "</span></div>" +
      '<div class="ana-droits">' + cases + "</div>" +
      '<p class="petit mt-8">الدرع يتحصّل على ' + B.chiffres(reg.objectif) +
      " أيام منتظمة في " + B.chiffres(reg.fenetre) + "، والمراجعة \"ساهلة\" تزيدو. " +
      "الغياب ما يكسّرش الدرع — غير يوقّف العدّ.</p>" +
      '<p class="petit doux mt-4">' + B.chiffres(reg.jours) + " من " + B.chiffres(reg.fenetre) +
      " أيام في السلسلة الحالية.</p>" +
      "</section>"
    );
  }

  function blocKafaa() {
    var liste = kafaa();
    var couvertes = competencesCouvertes();
    return (
      '<section class="carte">' +
      '<div class="carte__tete"><span class="carte__titre">الجاهزية</span>' +
      '<span class="mention mention--or">' + B.chiffres(couvertes) + " من " + B.chiffres(liste.length) + " عندها دليل</span></div>" +
      '<div class="ana-kafaa">' +
      liste
        .map(function (c) {
          return (
            '<div class="ana-kafaa__l">' +
            '<span class="mention">' + B.ech(c.code) + "</span>" +
            '<span class="petit ana-kafaa__n">' + B.ech(c.nom) + "</span>" +
            points(c) +
            '<span class="ana-kafaa__s">' + B.ech(c.statut) + "</span>" +
            "</div>"
          );
        })
        .join("") +
      "</div>" +
      '<p class="petit doux mt-8">مؤشّر توجيهي غير مُعايَر: ماشي علامة على 20. ' +
      "الكفاءة تطلع بالتمارين، ماشي بالحفظ.</p>" +
      "</section>"
    );
  }

  function blocRevisions() {
    var p = plan();
    var dues = p.aujourdhui || [];
    var corps;
    if (!dues.length) {
      corps =
        '<p class="petit">ما عندكش مراجعة اليوم. ' +
        (p.demain ? "غدًا عندك " + B.chiffres(p.demain) + " بطاقة." : "السلّة خاوية.") +
        "</p>";
    } else {
      corps =
        dues
          .map(function (c) {
            return (
              '<div class="ana-rev">' +
              '<div class="ana-rev__t">' +
              '<p class="petit ana-rev__titre">' + B.ech(c.titre) + "</p>" +
              '<p class="petit doux">' + B.ech(c.repere) + "</p>" +
              "</div>" +
              '<div class="ana-rev__b">' +
              '<button class="btn-mini ana-rev__b--dur" type="button" data-reviser="' + B.ech(c.id) + '" data-qualite="2">صعيب</button>' +
              '<button class="btn-mini" type="button" data-reviser="' + B.ech(c.id) + '" data-qualite="4">متوسط</button>' +
              '<button class="btn-mini ana-rev__b--ok" type="button" data-reviser="' + B.ech(c.id) + '" data-qualite="5">ساهل</button>' +
              "</div></div>"
            );
          })
          .join("");
    }
    return (
      '<section class="carte">' +
      '<div class="carte__tete"><span class="carte__titre">مراجعات اليوم</span>' +
      '<span class="mention">' + B.chiffres(dues.length) + " بطاقة</span></div>" +
      corps +
      (p.dette
        ? '<p class="petit doux mt-8">' + B.chiffres(p.dette) + " مؤجّلة، نوزّعها على الأيام — بلا تكديس.</p>"
        : "") +
      "</section>"
    );
  }

  function blocPonts() {
    return (
      '<section class="carte carte--or">' +
      '<div class="carte__tete"><span class="carte__titre">كمّل من وين ما وقفت</span></div>' +
      '<div class="rangee rangee--galerie mt-8">' +
      '<button class="btn btn--secondaire" type="button" data-aller-bac>' +
      B.icone("doc", 18) + " تمرين الباك</button>" +
      '<button class="btn btn--secondaire" type="button" data-aller-fakh>' +
      B.icone("cible", 18) + " صيّاد الفخاخ</button>" +
      "</div>" +
      "</section>"
    );
  }

  /* ======================================================================
     IMPRESSION DE LA CARTE
     ====================================================================== */
  function feuille() {
    var d = niveau();
    var reg = regularite();
    return (
      '<div class="carte-print">' +
      '<p class="carte-print__marque">بوصلة العلوم · بطاقة البوصلة</p>' +
      '<h1 class="carte-print__titre">المستوى ' + B.chiffres(d.n) + " · " + B.ech(d.nom) + "</h1>" +
      '<p class="carte-print__sous">الوحدة 1 · تركيب البروتين</p>' +
      '<div class="carte-print__corps">' + carteSVG(true) + "</div>" +
      '<ul class="carte-print__liste">' +
      "<li>الأدلة المحفوظة: " + B.chiffres(preuves().length) + "</li>" +
      "<li>الكفاءات اللي عندها دليل: " + B.chiffres(competencesCouvertes()) + " من 8</li>" +
      "<li>الأيام المنتظمة: " + B.chiffres(reg.jours) + " · الدروع: " + B.chiffres(reg.boucliers) + "</li>" +
      "</ul>" +
      '<p class="carte-print__pied">مؤشّر توجيهي غير مُعايَر · تدريب، ماشي امتحان رسمي.</p>' +
      "</div>"
    );
  }

  function imprimer() {
    var zone = document.getElementById("feuille");
    if (!zone) return;
    zone.innerHTML = feuille();
    B.annonce("البطاقة جاهزة للطبع");
    try {
      window.print();
    } catch (e) {
      B.toast("الطبع ماشي متوفّر في هذا المتصفّح.");
    }
  }

  /* ======================================================================
     ACTIONS
     ====================================================================== */
  function reviser(id, qualite) {
    var carte = B.Etat.reviser(id, qualite);
    if (!carte) return;
    S.dernier = id;
    B.Son.clic();
    if (qualite >= 4) {
      B.Son.valide();
      B.haptique(10);
    } else {
      B.Son.doux();
    }
    B.annonce(
      qualite >= 4 ? "تسجّلت. ترجع بعد " + B.chiffres(carte.intervalle) + " أيام" : "ترجع غدًا، بلا ضغط"
    );
    rendre(racine);
  }

  /* ======================================================================
     RENDU
     ====================================================================== */
  function rendre(conteneur) {
    if (!conteneur) return;
    racine = conteneur;
    conteneur.innerHTML =
      '<div class="vue" data-vue="ana">' +
      B.UI.entete("بطاقتي · جاهزيتي", { titre: "أنا", retour: "masari" }) +
      '<div class="contenu contenu--ana">' +
      blocCarte() +
      blocKafaa() +
      blocDroits() +
      blocRevisions() +
      blocPonts() +
      "</div>" +
      B.UI.onglets("ana") +
      "</div>";
    lier();
  }

  function detacher() {
    while (detachers.length) {
      var d = detachers.pop();
      if (typeof d === "function") d();
    }
  }

  function lier() {
    detacher();

    detachers.push(
      B.del(racine, "[data-action='imprimer']", "click", function () {
        imprimer();
      })
    );

    detachers.push(
      B.del(racine, "[data-reviser]", "click", function (ev, el) {
        reviser(el.getAttribute("data-reviser"), Number(el.getAttribute("data-qualite")));
      })
    );

    detachers.push(
      B.del(racine, "[data-reference-libre]", "click", function () {
        B.Son.clic();
        B.Boussole.ouvrir(null, { libre: true });
      })
    );

    detachers.push(
      B.del(racine, "[data-aller-bac]", "click", function () {
        B.Son.clic();
        B.Application.aller("bac");
      })
    );

    detachers.push(
      B.del(racine, "[data-aller-fakh]", "click", function () {
        B.Son.clic();
        B.Application.aller("fakh");
      })
    );
  }

  B.Ecrans.ana = {
    id: "ana",
    titre: "أنا",
    rendre: rendre,
    imprimer: imprimer,
    feuille: feuille,
    demonter: function () {
      detacher();
      B.Boussole.fermer();
      var zone = document.getElementById("feuille");
      if (zone) zone.innerHTML = "";
      racine = null;
    },
    reinitialiser: function () {
      detacher();
      S = { dernier: null };
    }
  };
})();
