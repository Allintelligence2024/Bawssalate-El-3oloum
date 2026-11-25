/* ==========================================================================
   بوصلة العلوم · النسخة الشاملة
   screen-masari.js — onglet 1 « مساري » : plan du jour plafonné, quêtes 3 min,
   régularité souple, simulateur de retour après absence, cartes d'évidence.
   Aucun score chiffré, aucun verrou, aucun Game Over.
   ========================================================================== */
(function () {
  "use strict";

  var B = window.Bawssala;
  var racine = null;
  var detachers = [];
  var S = { jours: 7 };

  var PHASES = [
    { n: 1, titre: "تحدّي الوحدة 1", sous: "3 أدلّة في 90 ثانية", etat: "fini" },
    { n: 2, titre: "مساري + قاعدة 1-2-3", sous: "4 كويستات · 3 دقائق لكل واحد", etat: "fini" },
    { n: 3, titre: "جولة التصحيح + بطاقة الدرس", sous: "كل خطأ يرجع في 15 ثانية", etat: "fini" },
    { n: 4, titre: "تمرين بكالوريا + مرجع البوصلة", sous: "الطريقة + 6 خطوات · شرح فوري", etat: "fini" },
    { n: 5, titre: "صيّاد الفخاخ + تحدّي 60 ثانية", sous: "8 جمل · فخّ ولا صحيح", etat: "fini" },
    { n: 6, titre: "أنا: الدروع، الجاهزية، البطاقة", sous: "SM-2 · مؤشّر توجيهي", etat: "fini" }
  ];

  /* ======================================================================
     HELPERS
     ====================================================================== */
  function etat() {
    return B.Etat.get();
  }

  function dots(jours, fenetre) {
    var html = '<span class="rangee gap-6" aria-hidden="true">';
    for (var i = 0; i < fenetre; i++) {
      html +=
        '<span style="width:15px;height:15px;border-radius:50%;background:' +
        (i < jours ? "var(--pine)" : "var(--weak)") +
        ";border:1px solid " +
        (i < jours ? "var(--pine)" : "var(--line)") +
        '"></span>';
    }
    return html + "</span>";
  }

  function quetePourCarte(carte) {
    var quetes = B.Donnees.quetes;
    if (carte.famille === "competence") {
      var cid = carte.id.split(":")[1];
      return (
        quetes.filter(function (q) {
          return Object.keys(q.kafaa || {}).indexOf(cid) !== -1;
        })[0] || null
      );
    }
    return (
      quetes.filter(function (q) {
        return carte.titre && carte.titre.indexOf(q.titre) !== -1;
      })[0] || null
    );
  }

  /** Aperçu honnête : on rejoue le calcul de simulerAbsence sans toucher l'état. */
  function apercuAbsence(jours) {
    var cartes = etat().srs.cartes;
    var deja = cartes.filter(function (c) {
      return c.id.indexOf("competence:") === 0;
    }).length;
    var total = cartes.length + Math.max(0, B.Donnees.competences.length - deja);
    var plafond = B.Donnees.plan.plafond;
    return {
      jours: jours,
      aujourdhui: Math.min(total, plafond),
      dette: Math.max(0, total - plafond)
    };
  }

  function prochaineQuete() {
    return (
      B.Donnees.quetes.filter(function (q) {
        var i = B.Etat.infoQuete(q.id);
        return !i.fait;
      })[0] || B.Donnees.quetes[0]
    );
  }

  /* ======================================================================
     FRAGMENTS
     ====================================================================== */
  function cartePlan() {
    var plan = B.Etat.planDeJour();
    var lignes = plan.aujourdhui.map(function (c) {
      var q = quetePourCarte(c);
      return (
        '<div class="ligne">' +
        '<span class="ligne__t"><b>' + B.ech(c.titre) + "</b><span>" +
        B.ech(c.repere || "") +
        (c.joursRetard ? " · متأخّرة " + B.chiffres(c.joursRetard) + " يومًا" : "") +
        "</span></span>" +
        (q
          ? '<button class="btn-mini" type="button" data-quete="' + q.id + '">' +
            (B.Etat.infoQuete(q.id).fait ? "عاود" : "ابدأ") + "</button>"
          : '<span class="mention">' + B.icone("sablier", 12) + " مراجعة</span>") +
        "</div>"
      );
    });

    return (
      '<div class="carte">' +
      '<div class="carte__tete"><span class="carte__titre">خطة اليوم</span>' +
      '<span class="mention">' + B.chiffres(plan.aujourdhui.length) + " من " + B.Donnees.plan.plafond + "</span></div>" +
      (lignes.length
        ? lignes.join("")
        : '<p class="petit doux">ما كاين والو مستحقّ اليوم. هذا راحة، ماشي تأخّر.</p>') +
      '<p class="petit doux mt-8">' +
      (plan.dette
        ? "دَين مؤجّل: " + B.chiffres(plan.dette) + ". يُضاف تدريجيًّا."
        : "لا دَين مؤجّل.") +
      (plan.demain ? " · غدًا: " + B.chiffres(plan.demain) : "") +
      "</p></div>"
    );
  }

  function carteRegularite() {
    var reg = B.Etat.regularite();
    return (
      '<div class="carte">' +
      '<div class="carte__tete"><span class="carte__titre">الانتظام</span>' +
      '<span class="mention ' + (reg.atteint ? "mention--ok" : "") + '">' + reg.jours + " من " + reg.objectif + "</span></div>" +
      '<div class="rangee rangee--entre">' +
      dots(reg.jours, reg.fenetre) +
      '<span class="mention mention--or">' + B.icone("bouclier", 12) + " " + reg.boucliers + " درع</span>" +
      "</div>" +
      '<p class="petit doux mt-8">هدف مرن: 4 أيام من 7. يوم الغياب ما يكسرش السلسلة.</p>' +
      "</div>"
    );
  }

  function carteQuetes() {
    var cartes = B.Donnees.quetes.map(function (q) {
      var info = B.Etat.infoQuete(q.id);
      var etatCarte = info.fait ? "fini" : info.faits ? "encours" : "neuf";
      var points = "";
      for (var i = 0; i < q.etapes.length; i++) {
        points += '<span class="point" data-fait="' + (i < info.faits ? "oui" : "non") + '"></span>';
      }
      return (
        '<button class="quete" type="button" data-quete="' + q.id + '" data-etat="' + etatCarte + '">' +
        '<span class="quete__n">' + (info.fait ? "✓" : q.numero) + "</span>" +
        '<span class="quete__corps">' +
        '<span class="quete__t">' + B.ech(q.titre) + "</span>" +
        '<span class="quete__s">' + B.ech(q.sous) + " · " + q.duree + " دقائق</span>" +
        '<span class="fils fils--mini" aria-hidden="true">' + points + "</span>" +
        "</span>" +
        '<span class="mention ' + (info.fait ? "mention--ok" : "") + '">' +
        (info.fait ? "دليل" : info.faits ? info.faits + "/" + info.total : "جديد") +
        "</span>" +
        "</button>"
      );
    }).join("");

    return (
      '<div class="section-titre">كويستات الوحدة 1 · 3 دقائق لكل واحد</div>' +
      '<div class="colonne">' + cartes + "</div>"
    );
  }

  function carteSimulateur() {
    var a = apercuAbsence(S.jours);
    var chips = [3, 7, 21]
      .map(function (n) {
        return (
          '<button class="jour" type="button" data-jours="' + n + '" aria-pressed="' +
          (S.jours === n ? "true" : "false") + '">' + n + " أيام</button>"
        );
      })
      .join("");
    return (
      '<div class="carte">' +
      '<div class="carte__tete"><span class="carte__titre">رجعت بعد غياب؟</span>' +
      '<span class="mention">محاكاة</span></div>' +
      '<div class="jours">' + chips + "</div>" +
      '<p class="petit mt-8">بعد ' + a.jours + " أيام: " + B.chiffres(a.aujourdhui) +
      " مراجعات اليوم · " + B.chiffres(a.dette) + " مؤجّلة.</p>" +
      '<button class="btn btn--secondaire mt-8" type="button" data-appliquer>جرّب السيناريو</button>' +
      '<p class="petit doux mt-8">الدَين مسقوف بـ 5. ما يتكدّسش، وما كاينش عقاب.</p>' +
      "</div>"
    );
  }

  function cartePreuves() {
    var preuves = B.Etat.preuves();
    var total = B.Donnees.registrePreuves.length;
    var lecons = B.Etat.leconsObtenues();
    return (
      '<div class="carte">' +
      '<div class="carte__tete"><span class="carte__titre">بطاقات الأدلة</span>' +
      '<span class="mention mention--or">' + B.chiffres(preuves.length) + " / " + total + "</span></div>" +
      (preuves.length
        ? '<div class="rangee" style="flex-wrap:wrap">' +
          preuves
            .map(function (p) {
              return '<span class="mention">' + B.ech(p.code) + " · " + B.ech(p.texte) + "</span>";
            })
            .join("") +
          "</div>"
        : '<p class="petit doux">كل كويست يربّحك بطاقة دليل. ابدأ بالأول.</p>') +
      '<div class="hr mt-8"></div>' +
      '<div class="rangee rangee--entre mt-8">' +
      '<span class="petit">بطاقات الدروس</span>' +
      '<span class="mention mention--or">' + B.chiffres(lecons.length) + " / " +
      B.Donnees.quetes.length + "</span></div>" +
      (lecons.length
        ? '<div class="rangee mt-4" style="flex-wrap:wrap">' +
          lecons
            .map(function (l) {
              return '<span class="mention mention--or">' + B.ech(l.code) + " · " + B.ech(l.titre) + "</span>";
            })
            .join("") +
          "</div>"
        : "") +
      "</div>"
    );
  }

  function cartePhases() {
    return (
      '<div class="section-titre">خارطة البناء · 6 مراحل</div>' +
      '<div class="phases">' +
      PHASES.map(function (p) {
        return (
          '<div class="phase" data-etat="' + p.etat + '" data-phase="' + p.n + '">' +
          '<span class="phase__n">' + (p.etat === "fini" ? "✓" : p.n) + "</span>" +
          "<div><p class=\"phase__t\">" + B.ech(p.titre) + "</p>" +
          '<p class="phase__s">' + B.ech(p.sous) + "</p></div>" +
          (p.n === 4
            ? '<button class="btn-mini" type="button" data-aller-bac>افتح</button>'
            : p.n === 5
              ? '<button class="btn-mini" type="button" data-aller-fakh>افتح</button>'
              : p.n === 6
                ? '<button class="btn-mini" type="button" data-aller-ana>افتح</button>'
                : '<span class="mention ' + (p.etat === "fini" ? "mention--ok" : "") + '">' +
                  (p.etat === "fini" ? "جاهزة" : "لاحقًا") + "</span>") +
          "</div>"
        );
      }).join("") +
      "</div>"
    );
  }

  /* ======================================================================
     RENDU
     ====================================================================== */
  function rendre(conteneur) {
    racine = conteneur;
    var e = etat();
    var q = prochaineQuete();
    var dejaFaites = B.Etat.quetesFaites();

    conteneur.innerHTML =
      '<div class="vue" data-vue="masari">' +
      B.UI.entete("الوحدة 1 · تركيب البروتين", { titre: "مساري" }) +
      '<div class="contenu contenu--defile">' +

      '<div class="rangee rangee--entre">' +
      "<div>" +
      '<p class="oeil">المجال الأول · التخصص الوظيفي للبروتينات</p>' +
      '<h1 class="titre-1">3 دقائق، وتفهم خطوة.</h1>' +
      "</div>" +
      '<div style="width:64px">' + B.mascotte("happy", 64) + "</div>" +
      "</div>" +
      '<p class="petit doux">' + B.chiffres(dejaFaites) + " من " + B.Donnees.quetes.length +
      " كويستات مكتملة. بلا ترتيب إجباري، بلا مؤقّت." + "</p>" +

      /* Accès direct et visible au mode الباك (المرحلة 4). */
      '<div class="carte carte--bac">' +
      '<div class="carte__tete"><span class="carte__titre">تمرين الباك</span>' +
      '<span class="mention mention--or">7 نقاط · بلا وقت</span></div>' +
      '<p class="petit">α-amanitine من السّمّ إلى الدواء. الطريقة أولًا، وبعدها 6 خطوات ' +
      "قصيرة: وثيقة، سؤال، وشرح فوري. والجواب الكامل في الآخر.</p>" +
      '<div class="rangee rangee--galerie mt-8">' +
      '<button class="btn btn--primaire" type="button" data-aller-bac>' +
      B.icone("doc", 18) + " افتح تمرين الباك</button>" +
      '<button class="btn btn--secondaire" type="button" data-reference-libre>' +
      B.icone("livre", 18) + " مرجع البوصلة</button>" +
      "</div>" +
      '<p class="petit doux mt-8" data-version="1">النسخة 1.9 · المراحل 4 و5 و6 مفتوحة</p>' +
      "</div>" +

      /* Accès direct et visible au صيّاد الفخاخ (المرحلة 5). */
      '<div class="carte carte--fakh carte--compacte">' +
      '<div class="carte__ligne">' +
      '<div class="carte__texte">' +
      '<p class="carte__titre">صيّاد الفخاخ</p>' +
      '<p class="petit doux">8 جمل · فخّ ولا صحيح؟ · الدليل في الحين</p>' +
      "</div>" +
      '<button class="btn-mini" type="button" data-aller-fakh>' +
      B.icone("cible", 16) + " افتح</button>" +
      "</div></div>" +

      /* Accès direct à « أنا » : بطاقة + دروع + جاهزية (المرحلة 6). */
      '<div class="carte carte--ana carte--compacte">' +
      '<div class="carte__ligne">' +
      '<div class="carte__texte">' +
      '<p class="carte__titre">بطاقتي وجاهزيتي</p>' +
      '<p class="petit doux">الدروع · 8 كفاءات · مراجعات اليوم (SM-2)</p>' +
      "</div>" +
      '<button class="btn-mini" type="button" data-aller-ana>' +
      B.icone("profil", 16) + " افتح</button>" +
      "</div></div>" +

      carteRegularite() +
      cartePlan() +
      carteQuetes() +
      carteSimulateur() +
      cartePreuves() +
      cartePhases() +

      '<div class="carte carte--or">' +
      '<div class="carte__tete"><span class="carte__titre">تذكير الحقوق</span>' +
      '<span class="mention mention--or">قبل النشر</span></div>' +
      '<p class="petit mt-4">' + B.ech(B.Donnees.sources.noteDroits) + "</p>" +
      "</div>" +

      "</div>" +
      '<footer class="pied">' +
      '<button class="btn btn--primaire btn--large" type="button" data-quete="' + q.id + '">' +
      (B.Etat.infoQuete(q.id).fait ? "عاود الكويست" : "ابدأ كويست 3 دقائق") +
      ' <span aria-hidden="true">←</span></button>' +
      '<p class="pied__note">≈ 3 دقائق · ما كاينش مؤقّت ولا عقاب</p>' +
      "</footer>" +
      B.UI.onglets("masari") +
      "</div>";

    lier();
    document.body.dataset.vue = "masari";
  }

  function lier() {
    detachers.forEach(function (off) {
      off();
    });
    detachers = [];

    detachers.push(
      B.del(racine, "[data-jours]", "click", function (ev, el) {
        S.jours = parseInt(el.getAttribute("data-jours"), 10) || 7;
        B.Son.clic();
        rendre(racine);
      })
    );

    detachers.push(
      B.del(racine, "[data-appliquer]", "click", function () {
        var plan = B.Etat.simulerAbsence(S.jours);
        B.Son.doux();
        B.haptique(12);
        B.toast(
          "محاكاة غياب " + S.jours + " أيام: " + plan.aujourdhui.length +
            " اليوم، " + plan.dette + " مؤجّلة.",
          true
        );
        rendre(racine);
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

    detachers.push(
      B.del(racine, "[data-aller-ana]", "click", function () {
        B.Son.clic();
        B.Application.aller("ana");
      })
    );

    detachers.push(
      B.del(racine, "[data-reference-libre]", "click", function () {
        B.Son.clic();
        B.Boussole.ouvrir(null, { libre: true });
      })
    );

    detachers.push(
      B.del(racine, "[data-quete]", "click", function (ev, el) {
        B.Son.clic();
        B.Ecrans.game123.ouvrir(el.getAttribute("data-quete"));
        B.Application.aller("quete");
      })
    );
  }

  B.Ecrans = B.Ecrans || {};
  B.Ecrans.masari = {
    id: "masari",
    titre: "مساري",
    rendre: rendre,
    demonter: function () {
      detachers.forEach(function (off) {
        off();
      });
      detachers = [];
      racine = null;
    },
    reinitialiser: function () {
      S = { jours: 7 };
    }
  };
})();
