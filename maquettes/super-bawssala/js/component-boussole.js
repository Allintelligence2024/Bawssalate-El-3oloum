/* ==========================================================================
   بوصلة العلوم · النسخة الشاملة
   component-boussole.js — « مرجع البوصلة » : tiroir de consultation pendant
   le bac (cartes de leçon, cartes d'évidence, règle 1-2-3).
   Lecture seule : consulter le مرجع ne remplace pas la décision de l'élève.
   Accessible (Échap, focus piégé), refermable, focus rendu à l'origine.
   ========================================================================== */
(function () {
  "use strict";

  var B = window.Bawssala;
  var racine = null;
  var onglet = "lecons";
  var dernierFocus = null;
  var detachers = [];

  function cartesLecons() {
    var obtenues = B.Etat.leconsObtenues();
    if (!obtenues.length) {
      return (
        '<p class="petit doux">ما عندكش بطاقة درس بعد. كمّل كويست في « مساري »، ' +
        "وتلقى زادك هنا.</p>"
      );
    }
    return obtenues
      .map(function (l) {
        return (
          '<article class="tiroir__carte">' +
          '<div class="rangee rangee--entre">' +
          '<span class="mention mention--or">' + B.ech(l.code) + "</span>" +
          '<span class="petit doux">' + B.ech(l.unite) + "</span>" +
          "</div>" +
          '<p class="tiroir__carte-t">' + B.ech(l.titre) + "</p>" +
          '<ol class="lecon__lignes">' +
          l.lignes
            .map(function (ligne) {
              return "<li>" + B.ech(ligne) + "</li>";
            })
            .join("") +
          "</ol>" +
          (l.question
            ? '<p class="petit mt-8"><b>' + B.ech(l.question) + "</b></p>" +
              '<p class="petit doux">' + B.ech(l.cle) + "</p>"
            : "") +
          "</article>"
        );
      })
      .join("");
  }

  function cartesPreuves() {
    var preuves = B.Etat.preuves();
    if (!preuves.length) {
      return (
        '<div class="tiroir__vide">' +
        '<span class="tiroir__vide-ic">' + B.icone("livre", 26) + "</span>" +
        '<p class="tiroir__vide-titre">ما زال ما عندك أدلة</p>' +
        '<p class="petit doux">كل كويست وكل تمرين باك يربّحك بطاقة دليل: وثيقة، مصدر، وجملة تتفكّر.</p>' +
        "</div>"
      );
    }
    return preuves
      .map(function (p) {
        return (
          '<article class="tiroir__carte">' +
          '<div class="rangee rangee--entre">' +
          '<span class="mention">' + B.ech(p.code) + "</span>" +
          '<span class="petit doux">' + B.ech(p.source) + "</span>" +
          "</div>" +
          (p.figure && B.figure
            ? '<div class="figure-bloc">' + B.figure(p.figure.type, p.figure) + "</div>"
            : "") +
          '<p class="petit mt-4">' + B.ech(p.texte) + "</p>" +
          "</article>"
        );
      })
      .join("");
  }

  function regles() {
    return (
      '<div class="tiroir__carte">' +
      '<p class="tiroir__carte-t">طريقة الباك · 3 حركات</p>' +
      '<ol class="lecon__lignes">' +
      "<li>شوف الوثيقة: شنو تبدّل؟ (الرقم، الشرط، الوقت…)</li>" +
      "<li>فسّر الآلية: كيفاش صرا؟ اربطها بفكرة الدرس.</li>" +
      "<li>استنتج: شنو النتيجة على الخلية؟ جملة واحدة.</li>" +
      "</ol></div>" +
      '<div class="tiroir__carte">' +
      '<p class="tiroir__carte-t">قاعدة 1-2-3</p>' +
      '<p class="petit">بدّل الشرط ← قارن الدليل ← اربط بالسؤال. ' +
      "إذا حبست، ابدأ من الوثيقة ماشي من الجواب.</p>" +
      "</div>"
    );
  }

  function corps() {
    if (onglet === "lecons") return cartesLecons();
    if (onglet === "preuves") return cartesPreuves();
    return regles();
  }

  function html() {
    return (
      '<div class="tiroir__fond" data-fermer></div>' +
      '<aside class="tiroir__panneau" role="dialog" aria-modal="true" aria-labelledby="tiroir-titre">' +
      '<header class="tiroir__tete">' +
      "<div>" +
      '<p class="tiroir__titre" id="tiroir-titre">مرجع البوصلة</p>' +
      '<p class="tiroir__sous">أدلة، بطاقات، وقاعدة — بلا ما تخرج من التمرين.</p>' +
      "</div>" +
      '<button class="btn-icone" type="button" data-fermer aria-label="أغلق المرجع">✕</button>' +
      "</header>" +
      '<p class="tiroir__cible">للقراءة فقط: المرجع يعاون، والجواب يبقى عليك.</p>' +
      '<div class="tiroir__tabs" role="tablist" aria-label="أقسام المرجع">' +
      '<button class="tiroir__tab" type="button" role="tab" data-onglet-tiroir="lecons" aria-selected="' +
      (onglet === "lecons" ? "true" : "false") + '">الدروس</button>' +
      '<button class="tiroir__tab" type="button" role="tab" data-onglet-tiroir="preuves" aria-selected="' +
      (onglet === "preuves" ? "true" : "false") + '">الأدلة</button>' +
      '<button class="tiroir__tab" type="button" role="tab" data-onglet-tiroir="regles" aria-selected="' +
      (onglet === "regles" ? "true" : "false") + '">الطريقة</button>' +
      "</div>" +
      '<div class="tiroir__corps" data-corps>' + corps() + "</div>" +
      "</aside>"
    );
  }

  function rendre() {
    if (!racine) return;
    racine.innerHTML = html();
    lier();
  }

  function ouvrir() {
    if (!racine) {
      racine = document.createElement("div");
      racine.className = "tiroir";
      racine.setAttribute("data-tiroir", "");
      var hote = document.getElementById("appareil") || document.body;
      hote.appendChild(racine);
    }
    dernierFocus = document.activeElement;
    onglet = "lecons";
    rendre();
    racine.hidden = false;
    document.body.classList.add("tiroir-ouvert");
    var fermer = B.$("button[data-fermer]", racine);
    if (fermer) B.focus(fermer);
    B.annonce("مرجع البوصلة مفتوح");
  }

  function fermer() {
    if (!racine || racine.hidden) return;
    racine.hidden = true;
    document.body.classList.remove("tiroir-ouvert");
    detachers.forEach(function (off) {
      off();
    });
    detachers = [];
    if (dernierFocus && dernierFocus.focus) {
      try {
        dernierFocus.focus({ preventScroll: true });
      } catch (e) {
        /* ignoré */
      }
    }
  }

  function estOuvert() {
    return Boolean(racine && !racine.hidden);
  }

  function lier() {
    detachers.forEach(function (off) {
      off();
    });
    detachers = [];

    detachers.push(
      B.del(racine, "[data-fermer]", "click", function () {
        fermer();
      })
    );

    detachers.push(
      B.del(racine, "[data-onglet-tiroir]", "click", function (ev, el) {
        onglet = el.getAttribute("data-onglet-tiroir");
        B.Son.clic();
        rendre();
        var actif = B.$("[data-onglet-tiroir='" + onglet + "']", racine);
        if (actif) B.focus(actif);
      })
    );

    detachers.push(
      B.on(document, "keydown", function (e) {
        if (!estOuvert()) return;

        if (e.key === "Escape") {
          e.preventDefault();
          fermer();
          return;
        }

        if (e.key === "Tab") {
          var focusables = B.$$("button[data-fermer], [data-onglet-tiroir]", racine);
          if (!focusables.length) return;
          var i = focusables.indexOf(document.activeElement);
          if (e.shiftKey && i <= 0) {
            e.preventDefault();
            B.focus(focusables[focusables.length - 1]);
          } else if (!e.shiftKey && (i === -1 || i === focusables.length - 1)) {
            e.preventDefault();
            B.focus(focusables[0]);
          }
        }
      })
    );
  }

  B.Boussole = {
    ouvrir: ouvrir,
    fermer: fermer,
    estOuvert: estOuvert
  };
})();
