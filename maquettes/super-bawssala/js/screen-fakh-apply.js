/* ==========================================================================
   بوصلة العلوم · النسخة الشاملة
   screen-fakh-apply.js — المرحلة 5 « صيّاد الفخاخ »
   Une affirmation, deux boutons (فخّ / صحيح), la preuve immédiate.
   Jamais de Game Over, jamais de note : on compte les pièges attrapés, le
   chrono monte (il ne descend pas), et une jolie mention « أقل من دقيقة »
   récompense les yeux rapides sans punir les autres.
   ========================================================================== */
(function () {
  "use strict";

  var B = window.Bawssala;
  var racine = null;
  var detachers = [];
  var minuteur = null;
  var S = { vue: "auto", courant: null, debut: 0 };

  /* ======================================================================
     HELPERS DE DONNÉES
     ====================================================================== */
  function fakh() {
    return B.Donnees.fakh;
  }

  function etat() {
    return B.Etat.fakh();
  }

  function progression() {
    return B.Etat.fakhProgression();
  }

  function item(id) {
    return B.Donnees.fakhParId[id] || null;
  }

  function reponse(id) {
    return etat().reponses[id] || null;
  }

  function num(id) {
    var i = 0;
    for (var k = 0; k < fakh().items.length; k++) {
      if (fakh().items[k].id === id) i = k;
    }
    return i + 1;
  }

  /* ‏ en fin de phrase : le point final reste à droite même quand la
     phrase finit par un mot latin (ARNm, U, T…). */
  function rtl(txt) {
    return B.ech(txt) + "\u200F";
  }

  function mmss(secondes) {
    var s = Math.max(0, Math.floor(secondes));
    var m = Math.floor(s / 60);
    var r = s % 60;
    return m + ":" + (r < 10 ? "0" + r : r);
  }

  function tempsEcoule() {
    var d = etat().debut || S.debut;
    if (!d) return 0;
    return Math.max(0, Math.round((new Date().getTime() - d) / 1000));
  }

  /* ======================================================================
     FRAGMENTS D'INTERFACE
     ====================================================================== */
  function pas() {
    var p = progression();
    return (
      '<div class="fakh-pas" role="list" aria-label="تقدّم الجولة">' +
      fakh()
        .items.map(function (it) {
          var r = reponse(it.id);
          var etatPas = !r || !r.choix ? (p.courante === it.id ? "courant" : "vide") : r.juste ? "juste" : "faux";
          return (
            '<span class="fakh-pas__pt" role="listitem" data-etat="' + etatPas + '"' +
            ' aria-label="' + (etatPas === "juste" ? "فخ تصاد" : etatPas === "faux" ? "جملة ما تصادتش" : "باقي") + '"></span>'
          );
        })
        .join("") +
      "</div>"
    );
  }

  function chrono() {
    return (
      '<span class="fakh-chrono" data-chrono title="الوقت يمشي، ما ينقصش">' +
      B.icone("sablier", 13) +
      "<span data-chrono-txt>" + mmss(tempsEcoule()) + "</span></span>"
    );
  }

  function compteur() {
    var p = progression();
    return (
      '<span class="mention mention--or fakh-compteur">' +
      B.icone("cible", 13) + " " + B.chiffres(p.justes) + " فخ</span>"
    );
  }

  /* ------------------------------------------------------------- règles */
  function vueRegles() {
    return (
      '<div class="vue" data-vue="fakh">' +
      B.UI.entete("المرحلة 5 · 8 جمل بلا خسارة", { titre: "صيّاد الفخاخ", retour: "masari" }) +
      '<div class="contenu contenu--fakh contenu--centre">' +

      '<div class="fakh-hero">' +
      '<div class="fakh-hero__mascotte">' + B.mascotte("happy", 62) + "</div>" +
      "<div>" +
      '<p class="oeil">المرحلة 5 · الجملة اللي تبان صحيحة</p>' +
      '<h1 class="titre-1">فخّ ولا صحيح؟</h1>' +
      "</div></div>" +

      '<section class="carte">' +
      '<p class="petit">الفخ = جملة تبان مليحة، وفيها غلطة صغيرة. ' +
      "مهمتك: تكشفها قبل ما توقع بيك في الامتحان.</p>" +
      '<ol class="fakh-regles">' +
      "<li><b>اقرا</b> الجملة ببطء، حرف بحرف.</li>" +
      "<li><b>اختار</b>: فخّ ولا صحيح. زر واحد، بلا رجوع.</li>" +
      "<li><b>شوف الدليل</b> في الحين: علاش هي فخ، ولا علاش هي صحيحة.</li>" +
      "</ol>" +
      "</section>" +

      '<section class="carte carte--or">' +
      '<div class="carte__tete"><span class="carte__titre">مثالين قبل ما نبداو</span></div>' +
      '<div class="fakh-ex">' +
      '<span class="mention mention--or">فخّ</span>' +
      '<p class="petit">« الترجمة تحدث داخل النواة » ← فخّ. الترجمة في الهيولى على الريبوزوم.</p>' +
      "</div>" +
      '<div class="fakh-ex">' +
      '<span class="mention mention--ok">صحيح</span>' +
      '<p class="petit">« الاستنساخ يحدث في النواة » ← صحيح. هذي بلاصة ARN بوليميراز.</p>' +
      "</div>" +
      "</section>" +

      '<p class="petit doux">الوقت يمشي غير للفضول: ما ينقصش، وما يوقفش الجولة. ' +
      "وما فيها لا خسارة لا Game Over — تكمّل 8 جمل على كل حال.</p>" +

      "</div>" +
      '<footer class="pied">' +
      '<button class="btn btn--primaire btn--large" type="button" data-action="commencer">' +
      "ابدأ الصيد " + B.icone("fleche", 18) + "</button>" +
      '<p class="pied__note">8 جمل · دليل بعد كل جواب · بلا وقت يضغط</p>' +
      "</footer></div>"
    );
  }

  /* --------------------------------------------------------------- item */
  function vueItem() {
    var p = progression();
    var id = S.courant || p.courante;
    var it = item(id);
    if (!it) return vueResultat();
    S.courant = id;
    var r = reponse(id);
    var fait = Boolean(r && r.choix);
    var juste = fait && r.juste;
    var dernier = p.faites + (fait ? 0 : 1) >= p.total || p.finie;

    return (
      '<div class="vue" data-vue="fakh">' +
      B.UI.entete("جملة " + B.chiffres(num(id)) + " من " + B.chiffres(p.total), {
        titre: "صيّاد الفخاخ",
        retour: "masari"
      }) +
      '<div class="contenu contenu--fakh">' +

      '<div class="fakh-tete">' + pas() + chrono() + compteur() + "</div>" +

      '<div class="fakh-corps">' +
      '<section class="carte fakh-carte">' +
      '<header class="carte__tete">' +
      '<span class="mention">الجملة ' + B.chiffres(num(id)) + "</span>" +
      '<span class="mention mention--or">فخّ ولا صحيح؟</span>' +
      "</header>" +
      '<p class="fakh-texte" data-consigne tabindex="-1">' + rtl(it.affirmation) + "</p>" +
      "</section>" +

      '<div class="fakh-btns">' +
      '<button class="fakh-btn fakh-btn--faux" type="button" data-fakh="faux"' +
      (fait ? " disabled" : "") +
      (fait && r.choix === "faux" ? ' data-choisi="oui"' : "") +
      ' aria-pressed="' + (fait && r.choix === "faux" ? "true" : "false") + '">' +
      B.icone("croix", 20) + "<span>فخّ</span></button>" +
      '<button class="fakh-btn fakh-btn--vrai" type="button" data-fakh="vrai"' +
      (fait ? " disabled" : "") +
      (fait && r.choix === "vrai" ? ' data-choisi="oui"' : "") +
      ' aria-pressed="' + (fait && r.choix === "vrai" ? "true" : "false") + '">' +
      B.icone("check", 20) + "<span>صحيح</span></button>" +
      "</div>" +

      (fait ? blocRetour(it, r, juste) : '<p class="petit doux fakh-attente">اختار وحدة من الزوج. ' +
        "كل جواب يجيب معاه الدليل في الحين.</p>") +
      "</div>" +

      "</div>" +
      '<footer class="pied">' +
      '<button class="btn btn--primaire btn--large" type="button" data-action="suivant"' +
      (fait ? "" : " disabled") + ">" +
      (!fait ? "اختار جواب" : dernier || p.finie ? "شوف النتيجة" : "الجملة اللي بعدها") +
      ' <span aria-hidden="true">←</span></button>' +
      '<p class="pied__note">' +
      (!fait ? "زر واحد، وبعدو الدليل" : juste ? "صيد نظيف. كمّل." : "ما فيها خسارة: الدليل هو المهم") +
      "</p></footer></div>"
    );
  }

  function blocRetour(it, r, juste) {
    var vrai = !it.faux;
    var titre = juste
      ? it.faux
        ? "صيد نظيف: هذي فخ."
        : "صحيح: هذي جملة سليمة."
      : vrai
        ? "هذي جملة صحيحة، ماشي فخ."
        : "هذي فخ، ماشي جملة صحيحة.";
    return (
      '<div class="retour ' + (juste ? "retour--juste" : "retour--faux") + '" data-retour-etape="1" ' +
      'role="status" tabindex="-1">' +
      '<span class="retour__icone">' + B.icone(juste ? "check" : "etincelle", 18) + "</span>" +
      '<div class="retour__corps">' +
      '<p class="retour__texte"><b>' + B.ech(titre) + "</b> " + B.ech(it.correction) + "</p>" +
      (!juste && it.indice
        ? '<p class="retour__source">' + B.icone("sablier", 12) + " " + B.ech(it.indice) + "</p>"
        : "") +
      (it.source
        ? '<p class="retour__source">' + B.icone("livre", 12) + " " + B.ech(it.source.ref) + "</p>"
        : "") +
      "</div></div>"
    );
  }

  /* ------------------------------------------------------------ résultat */
  function vueResultat() {
    var b = B.Etat.fakhBilan();
    var temps = b.temps || tempsEcoule();
    return (
      '<div class="vue" data-vue="fakh">' +
      B.UI.entete("النتيجة · مؤشّر توجيهي", { titre: "صيّاد الفخاخ", retour: "masari" }) +
      '<div class="contenu contenu--fakh">' +

      '<section class="carte carte--or fakh-fin">' +
      '<div class="fakh-fin__tete">' +
      '<div class="fakh-hero__mascotte">' + B.mascotte("happy", 56) + "</div>" +
      "<div>" +
      '<p class="oeil">8 جمل · بلا خسارة</p>' +
      '<h1 class="titre-1">صيّدت ' + B.chiffres(b.justes) + " من " + B.chiffres(b.total) + " فخاخ.</h1>" +
      "</div></div>" +
      '<p class="mention mention--or fakh-rang">' + B.ech(b.rang.nom) + "</p>" +
      '<p class="petit">' + B.ech(b.rang.sous) + "</p>" +
      "</section>" +

      '<section class="carte">' +
      '<div class="carte__tete"><span class="carte__titre">الجولة</span>' +
      '<span class="mention">' + B.icone("sablier", 13) + " " + mmss(temps) + "</span></div>" +
      '<p class="petit mt-4">' +
      (temps > 0 && temps <= 60
        ? "أقل من دقيقة! عينك ولّات تعرف الفخ من اللول."
        : "بلا عجلة: الفهم أهم من السرعة، والوقت ما ينقصش أبدًا.") +
      "</p>" +
      '<div class="fakh-comp">' +
      b.parCompetence
        .map(function (c) {
          return (
            '<div class="fakh-comp__l">' +
            '<span class="mention">' + B.ech(c.code) + "</span>" +
            '<span class="petit">' + B.ech(c.nom) + "</span>" +
            '<span class="fakh-comp__v">' + B.chiffres(c.justes) + "/" + B.chiffres(c.total) + "</span>" +
            "</div>"
          );
        })
        .join("") +
      "</div>" +
      '<p class="petit doux mt-8">هذا مؤشّر توجيهي، ماشي علامة على 20.</p>' +
      "</section>" +

      preuvesGagnees(b) +

      "</div>" +
      '<footer class="pied">' +
      '<div class="rangee rangee--galerie">' +
      '<button class="btn btn--primaire" type="button" data-action="recommencer">' +
      B.icone("tourner", 18) + " عاود الجولة</button>" +
      '<button class="btn btn--secondaire" type="button" data-retour="masari">' +
      "رجع لمساري</button>" +
      "</div>" +
      '<p class="pied__note">إعادة الجولة ما تزيدش XP، بصح تزيد في العين.</p>' +
      "</footer></div>"
    );
  }

  function preuvesGagnees(b) {
    var codes = b.preuves || [];
    if (!codes.length) {
      return (
        '<section class="carte">' +
        '<div class="carte__tete"><span class="carte__titre">أدلتك</span></div>' +
        '<p class="petit">ما صادتش فخاخ « بكالوريا » هذي المرة. عاود الجولة، ' +
        "والفخاخ اللي فاتوك يرجعو في الأول.</p>" +
        "</section>"
      );
    }
    return (
      '<section class="carte">' +
      '<div class="carte__tete"><span class="carte__titre">أدلتك من هذي الجولة</span>' +
      '<span class="mention mention--or">' + B.chiffres(codes.length) + " بطاقة</span></div>" +
      codes
        .map(function (code) {
          var p = B.Donnees.preuveParCode[code] || {};
          var piege = p.fakh ? B.Donnees.fakhParId[p.fakh] : null;
          return (
            '<div class="preuve">' +
            '<div class="preuve__txt">' +
            '<p class="preuve__source">' + B.ech(p.source || "") + "</p>" +
            (piege ? '<p class="petit preuve__piege">« ' + B.ech(piege.affirmation) + " »</p>" : "") +
            '<p class="petit">' + B.ech(p.texte || "") + "</p>" +
            "</div></div>"
          );
        })
        .join("") +
      '<p class="petit doux mt-8">تلقاهم في « مرجع البوصلة › الأدلة ».</p>' +
      "</section>"
    );
  }

  /* ======================================================================
     ACTIONS
     ====================================================================== */
  function demarrerChrono() {
    if (minuteur) return;
    if (!etat().debut) S.debut = new Date().getTime();
    minuteur = window.setInterval(function () {
      var zone = B.$("[data-chrono-txt]", racine || document);
      if (zone) zone.textContent = mmss(tempsEcoule());
    }, 1000);
  }

  function stopChrono() {
    if (minuteur) {
      window.clearInterval(minuteur);
      minuteur = null;
    }
  }

  function repondre(choix) {
    if (!S.courant) return;
    var res = B.Etat.fakhRepondre(S.courant, choix);
    if (res.erreur) return;
    if (res.juste) {
      B.Son.valide();
      B.haptique(12);
      B.annonce("صيد نظيف");
    } else {
      B.Son.doux();
      B.haptique(8);
      B.annonce("شوف الدليل");
    }
    rendre(racine);
    var bloc = B.$("[data-retour-etape]", racine);
    if (bloc) B.focus(bloc);
  }

  function suivant() {
    var p = progression();
    if (p.finie) {
      stopChrono();
      B.Etat.fakhTerminer(tempsEcoule());
      S.vue = "resultat";
      B.Son.fanfare();
      B.haptique(18);
      rendre(racine);
      return;
    }
    S.courant = p.courante;
    S.vue = "auto";
    rendre(racine);
    var c = B.$("[data-consigne]", racine);
    if (c) B.focus(c);
  }

  function rejouer() {
    B.Etat.fakhReinitialiser();
    S.courant = null;
    S.debut = new Date().getTime();
    S.vue = "auto";
    B.toast("جولة جديدة. نفس الجمل، عين جديدة.");
    rendre(racine);
  }

  function commencer() {
    B.Etat.fakhMarquerVu();
    S.vue = "auto";
    S.debut = new Date().getTime();
    S.courant = progression().courante;
    B.Son.clic();
    rendre(racine);
  }

  function vueCourante() {
    if (S.vue === "regles") return "regles";
    if (S.vue === "resultat") return "resultat";
    var p = progression();
    if (p.finie && etat().fini) return "resultat";
    if (!etat().vu) return "regles";
    return "item";
  }

  /* ======================================================================
     RENDU
     ====================================================================== */
  function rendre(conteneur) {
    if (!conteneur) return;
    racine = conteneur;

    var vue = vueCourante();
    if (vue === "item") {
      if (!S.courant) S.courant = progression().courante;
      if (!S.courant) {
        /* Les 8 sont répondues (retour sur l'écran, rechargement) : on clôt
           proprement au lieu d'afficher une carte vide. */
        stopChrono();
        if (!etat().fini) B.Etat.fakhTerminer(tempsEcoule());
        vue = "resultat";
      }
    }

    conteneur.innerHTML =
      vue === "regles" ? vueRegles() : vue === "resultat" ? vueResultat() : vueItem();

    if (vue === "item") demarrerChrono();
    else stopChrono();

    lier();
  }

  function detacher() {
    while (detachers.length) {
      var d = detachers.pop();
      if (typeof d === "function") d();
    }
    stopChrono();
  }

  function lier() {
    detacher();

    detachers.push(
      B.del(racine, "[data-fakh]", "click", function (ev, el) {
        if (el.disabled) return;
        repondre(el.getAttribute("data-fakh"));
      })
    );

    detachers.push(
      B.del(racine, "[data-action='suivant']", "click", function (ev, el) {
        if (el.disabled) return;
        suivant();
      })
    );

    detachers.push(
      B.del(racine, "[data-action='commencer']", "click", function () {
        commencer();
      })
    );

    detachers.push(
      B.del(racine, "[data-action='recommencer']", "click", function () {
        rejouer();
      })
    );
  }

  B.Ecrans.fakh = {
    id: "fakh",
    titre: "صيّاد الفخاخ",
    rendre: rendre,
    demonter: function () {
      detacher();
      racine = null;
    },
    reinitialiser: function () {
      S = { vue: "auto", courant: null, debut: 0 };
      detacher();
    }
  };
})();
