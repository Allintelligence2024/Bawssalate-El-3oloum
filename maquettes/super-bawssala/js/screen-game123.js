/* ==========================================================================
   بوصلة العلوم · النسخة الشاملة
   screen-game123.js — moteur « قاعدة البوصلة 1-2-3 » :
   1) بدّل الشرط  2) قارن الدليل  3) طبّق
   Puis : جولة التصحيح (15–30 s) pour chaque étape ratée, puis بطاقة الدرس.
   Aucune punition, aucun chrono dur, aucun score chiffré.
   ========================================================================== */
(function () {
  "use strict";

  var B = window.Bawssala;
  var racine = null;
  var detachers = [];

  var VIDE = {
    queteId: null,
    mode: "etape", // etape | correction | lecon
    index: 0,
    choix: null,
    essais: 0,
    repondu: false,
    juste: false,
    faute: null,
    debut: 0,
    corrections: [],
    iCorr: 0,
    corrChoix: null,
    corrRepondu: false,
    corrJuste: false,
    bilan: null,
    lecon: null,
    leconNouvelle: false
  };

  var S = Object.assign({}, VIDE);

  function quete() {
    return B.Donnees.queteParId[S.queteId];
  }

  function etape() {
    var q = quete();
    return q ? q.etapes[S.index] : null;
  }

  function remiseEtape() {
    S.choix = null;
    S.essais = 0;
    S.repondu = false;
    S.juste = false;
    S.faute = null;
    S.debut = Date.now();
  }

  function remiseCorr() {
    S.corrChoix = null;
    S.corrRepondu = false;
    S.corrJuste = false;
    S.debut = Date.now();
  }

  function ouvrir(queteId) {
    var q = B.Donnees.queteParId[queteId] || B.Donnees.quetes[0];
    S = Object.assign({}, VIDE, { queteId: q.id });
    remiseEtape();
  }

  function majXp() {
    if (!racine) return;
    B.$$("[data-xp='1']", racine).forEach(function (el) {
      el.textContent = B.chiffres(B.Etat.get().xp);
    });
  }

  /* ======================================================================
     FRAGMENTS
     ====================================================================== */
  function fils() {
    var q = quete();
    var infos = B.Etat.infoQuete(S.queteId).etapes;
    return (
      '<div class="fils" role="list" aria-label="خطوات الكويست">' +
      q.etapes
        .map(function (e, i) {
          var etat = i < S.index ? "fini" : i === S.index ? "actif" : "";
          var passe = i < S.index;
          var marque = passe ? (infos[e.id] && infos[e.id].juste ? "✓" : "↺") : i + 1;
          return (
            '<div class="fil" role="listitem" data-etat="' + etat + '">' +
            '<span class="fil__num">' + marque + "</span>" +
            '<span class="fil__t">' + B.ech(e.pas) + "</span>" +
            "</div>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function documents(e) {
    if (!e.documents) return "";
    return (
      '<div class="duo">' +
      e.documents
        .map(function (d) {
          return (
            '<div class="doc">' +
            '<p class="doc__titre">وثيقة ' + B.ech(d.code) + " · " + B.ech(d.titre) + "</p>" +
            '<p class="petit">' + B.ech(d.texte) + "</p>" +
            "</div>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function options(e) {
    var lettres = ["أ", "ب", "ج", "د"];
    return (
      '<div class="options" role="group" aria-label="الاختيارات">' +
      e.options
        .map(function (o, i) {
          var etat = "";
          if (S.repondu) {
            if (o.juste) etat = "juste";
            else if (S.choix === o.id || S.faute === o.id) etat = "faux";
          } else if (S.faute === o.id) {
            etat = "faux";
          }
          var bloque = S.repondu || S.faute === o.id;
          return (
            '<button class="btn btn--option" type="button" data-option="' + o.id + '"' +
            ' data-etat="' + etat + '"' + (bloque ? " disabled" : "") + ">" +
            '<span class="puce">' + lettres[i] + "</span>" +
            '<span class="grandit">' + B.ech(o.texte) + "</span>" +
            (S.repondu && o.juste ? B.icone("check", 18) : "") +
            "</button>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function blocRetour(e) {
    if (!S.repondu && !S.faute) return "";
    var bonne = e.options.filter(function (o) {
      return o.juste;
    })[0] || {};
    if (S.juste) {
      return (
        '<div class="retour retour--juste" data-retour role="status">' +
        '<span class="retour__icone">' + B.icone("check", 18) + "</span>" +
        '<div class="retour__corps">' +
        '<p class="retour__texte">' + B.ech(e.retourJuste) + "</p>" +
        '<p class="retour__source">' + B.ech(bonne.source || quete().preuve.source) + "</p>" +
        "</div></div>"
      );
    }
    return (
      '<div class="retour retour--faux" data-retour role="status">' +
      '<span class="retour__icone">' + B.icone("etincelle", 18) + "</span>" +
      '<div class="retour__corps">' +
      '<p class="retour__texte">' + B.ech(S.repondu ? bonne.motif : e.retourFaux) + "</p>" +
      (S.repondu && bonne.texte
        ? '<p class="retour__source">' + B.ech(bonne.texte) + "</p>"
        : "") +
      "</div></div>"
    );
  }

  /* ======================================================================
     VUES
     ====================================================================== */
  function vueEtape() {
    var q = quete();
    var e = etape();
    return (
      '<div class="vue" data-vue="quete">' +
      B.UI.entete("كويست " + q.numero + " · " + q.duree + " دقائق", {
        titre: q.titre,
        retour: "masari"
      }) +
      '<div class="contenu contenu--quete">' +
      fils() +
      '<p class="consigne" tabindex="-1" data-consigne>' +
      '<span class="consigne__puce">' + B.icone("boussole", 16) + "</span>" +
      "<span>" + B.ech(e.consigne) + "</span>" +
      "</p>" +
      documents(e) +
      options(e) +
      blocRetour(e) +
      "</div>" +
      '<footer class="pied">' +
      '<button class="btn btn--primaire btn--large" type="button" data-action="suivant"' +
      (S.repondu ? "" : " disabled") + ">" +
      (!S.repondu
        ? "اختار جواب أوّلًا"
        : S.index === q.etapes.length - 1
          ? "خلّص الكويست"
          : "الخطوة الجاية") +
      ' <span aria-hidden="true">←</span></button>' +
      '<p class="pied__note">' + (S.index + 1) + " من " + q.etapes.length +
      " · محاولتين قبل الحل، بلا عقاب</p>" +
      "</footer>" +
      "</div>"
    );
  }

  /* ---------------------------------------------------------------------
     Correction : deux formulations, celle qui a trompé et la bonne.
     --------------------------------------------------------------------- */
  function paireCorrection(e) {
    var info = B.Etat.infoQuete(S.queteId).etapes[e.id] || {};
    var bonne = e.options.filter(function (o) {
      return o.juste;
    })[0];
    var mauvaise =
      e.options.filter(function (o) {
        return o.id === info.option;
      })[0] ||
      e.options.filter(function (o) {
        return !o.juste;
      })[0];
    var correcteDabord = S.iCorr % 2 === 0;
    return {
      juste: bonne,
      faux: mauvaise,
      ordre: correcteDabord ? [bonne, mauvaise] : [mauvaise, bonne]
    };
  }

  function vueCorrection() {
    var q = quete();
    var e = S.corrections[S.iCorr];
    var paire = paireCorrection(e);
    var lettres = ["أ", "ب"];
    var optionsHtml = paire.ordre
      .map(function (o, i) {
        var etat = "";
        if (S.corrRepondu) {
          if (o.juste) etat = "juste";
          else if (S.corrChoix === (o.juste ? "juste" : "faux")) etat = "faux";
        }
        return (
          '<button class="btn btn--option" type="button" data-correction="' +
          (o.juste ? "juste" : "faux") + '" data-etat="' + etat + '"' +
          (S.corrRepondu ? " disabled" : "") + ">" +
          '<span class="puce">' + lettres[i] + "</span>" +
          '<span class="grandit">' + B.ech(o.texte) + "</span>" +
          (S.corrRepondu && o.juste ? B.icone("check", 18) : "") +
          "</button>"
        );
      })
      .join("");

    return (
      '<div class="vue" data-vue="quete">' +
      B.UI.entete("جولة التصحيح · 15 ثانية", { titre: q.titre, retour: "masari" }) +
      '<div class="contenu contenu--quete">' +
      '<div class="rangee rangee--entre">' +
      '<span class="mention">تصحيح ' + (S.iCorr + 1) + " من " + S.corrections.length + "</span>" +
      '<span class="mention mention--or">بلا عقاب</span>' +
      "</div>" +
      '<p class="consigne" tabindex="-1" data-consigne>' +
      '<span class="consigne__puce">' + B.icone("tourner", 16) + "</span>" +
      "<span>أيّ صياغة صحيحة؟ («" + B.ech(e.pas) + "»)</span>" +
      "</p>" +
      '<div class="options">' + optionsHtml + "</div>" +
      (S.corrRepondu
        ? '<div class="retour ' + (S.corrJuste ? "retour--juste" : "retour--faux") +
          '" data-retour role="status">' +
          '<span class="retour__icone">' + B.icone(S.corrJuste ? "check" : "etincelle", 18) + "</span>" +
          '<div class="retour__corps">' +
          '<p class="retour__texte">' +
          B.ech(S.corrJuste ? "صحيح. الفكرة تثبّتت." : "شوف العلاقة: " + (paire.juste.motif || "")) +
          "</p>" +
          '<p class="retour__source">' + B.ech(paire.juste.texte) + "</p>" +
          "</div></div>"
        : "") +
      "</div>" +
      '<footer class="pied">' +
      '<button class="btn btn--primaire btn--large" type="button" data-action="corr-suivant"' +
      (S.corrRepondu ? "" : " disabled") + ">التالي <span aria-hidden=\"true\">←</span></button>" +
      '<p class="pied__note">' + (S.corrJuste ? "+5 نقاط" : "المهمّ تفهم، ماشي تعاود") + "</p>" +
      "</footer>" +
      "</div>"
    );
  }

  /* ---------------------------------------------------------------------
     Carte de leçon — la récompense de la quête.
     --------------------------------------------------------------------- */
  function vueLecon() {
    var q = quete();
    var l = S.lecon || q.lecon;
    var b = S.bilan || { justes: 0, preuve: null, gain: 0 };
    var suivante = B.Donnees.quetes.filter(function (x) {
      return x.numero === q.numero + 1;
    })[0];
    var infos = B.Etat.infoQuete(S.queteId);
    var corrigees = Object.keys(infos.corrections || {}).length;
    var collecte = B.Etat.get().lecons[S.queteId];
    var dateLecon = collecte && collecte.le ? B.dateCourte(collecte.le) : "";

    return (
      '<div class="vue" data-vue="lecon">' +
      B.UI.entete("بطاقة الدرس", { titre: q.titre, retour: "masari" }) +
      '<div class="contenu contenu--quete">' +

      '<div class="rangee rangee--entre">' +
      "<div>" +
      '<p class="oeil">' + B.chiffres(b.justes) + " من " + q.etapes.length + " من أول محاولة" +
      (corrigees ? " · " + B.chiffres(corrigees) + " مصحّحة" : "") + "</p>" +
      '<h1 class="titre-1">' + (S.leconNouvelle ? "بطاقة جديدة." : "بطاقتك.") + "</h1>" +
      "</div>" +
      '<div style="width:66px">' + B.mascotte(S.leconNouvelle ? "celebrate" : "happy", 66) + "</div>" +
      "</div>" +

      '<div class="lecon-carte" data-flip data-face="recto" role="button" tabindex="0" ' +
      'aria-pressed="false" aria-label="اقلب بطاقة الدرس">' +
      '<div class="lecon-carte__inner">' +

      '<article class="lecon lecon-carte__face lecon-carte__face--recto" aria-label="وجه البطاقة">' +
      '<span class="lecon__code">' + B.ech(l.code) + "</span>" +
      '<span class="lecon__flip" aria-hidden="true">↻</span>' +
      '<p class="lecon__unite">' + B.ech(l.unite) + "</p>" +
      '<h2 class="lecon__titre">' + B.ech(l.titre) + "</h2>" +
      '<ol class="lecon__lignes">' +
      l.lignes
        .map(function (texte) {
          return "<li>" + B.ech(texte) + "</li>";
        })
        .join("") +
      "</ol>" +
      '<p class="lecon__reflexe"><span aria-hidden="true">🧭</span> ' + B.ech(l.reflexe) + "</p>" +
      '<p class="lecon__source">' + B.ech(l.source) + "</p>" +
      "</article>" +

      '<article class="lecon lecon-carte__face lecon-carte__face--verso" aria-label="ظهر البطاقة">' +
      '<span class="lecon__code">' + B.ech(l.code) + "</span>" +
      '<p class="lecon__unite">سؤال الباك</p>' +
      '<p class="lecon__question">' + B.ech(l.question || l.reflexe) + "</p>" +
      '<div class="lecon__cle"><span>مفتاح الجواب</span>' +
      "<p>" + B.ech(l.cle || l.reflexe) + "</p></div>" +
      '<div class="lecon__pied">' +
      '<span class="lecon__date">' + (dateLecon ? "تاريخ البطاقة · " + B.ech(dateLecon) : "بطاقة الدرس") + "</span>" +
      '<span class="lecon__tampon">بوصلة<br>العلوم</span>' +
      "</div>" +
      "</article>" +

      "</div></div>" +
      '<p class="petit doux centre mt-4">اقلب البطاقة بالضغط عليها</p>' +

      (b.preuve
        ? '<div class="carte carte--sauge">' +
          '<div class="carte__tete"><span class="carte__titre">بطاقة دليل جديدة</span>' +
          '<span class="mention mention--ok">' + B.ech(b.preuve.code) + "</span></div>" +
          '<p class="petit">' + B.ech(b.preuve.texte) + "</p>" +
          "</div>"
        : "") +

      '<div class="carte">' +
      '<div class="carte__tete"><span class="carte__titre">التالي</span>' +
      '<span class="mention">' + B.chiffres(B.Etat.leconsObtenues().length) + " / " +
      B.Donnees.quetes.length + " بطاقات</span></div>" +
      '<p class="petit doux">' +
      (suivante
        ? "الكويست الجاي: " + B.ech(suivante.titre) + "."
        : "كمّلت كويستات الوحدة 1. البطاقات تحفظ لك الأساس.") +
      "</p></div>" +

      "</div>" +
      '<footer class="pied">' +
      (suivante
        ? '<button class="btn btn--primaire btn--large" type="button" data-quete="' + suivante.id + '">' +
          "الكويست الجاي <span aria-hidden=\"true\">←</span></button>" +
          '<button class="btn btn--secondaire" type="button" data-action="retour">رجع لمساري</button>'
        : '<button class="btn btn--primaire btn--large" type="button" data-action="retour">' +
          "رجع لمساري <span aria-hidden=\"true\">←</span></button>") +
      "</footer>" +
      "</div>"
    );
  }

  /* ======================================================================
     RENDU
     ====================================================================== */
  function rendre(conteneur) {
    racine = conteneur;
    if (!S.queteId) ouvrir(B.Donnees.quetes[0].id);

    if (S.mode === "correction") conteneur.innerHTML = vueCorrection();
    else if (S.mode === "lecon") conteneur.innerHTML = vueLecon();
    else conteneur.innerHTML = vueEtape();

    lier();
    document.body.dataset.vue = S.mode === "lecon" ? "lecon" : "quete";

    if (S.mode !== "lecon") {
      var consigne = B.$("[data-consigne]", conteneur);
      if (consigne) B.focus(consigne);
    }
  }

  /* ======================================================================
     ACTIONS
     ====================================================================== */
  function repondre(optionId) {
    var e = etape();
    if (!e || S.repondu) return;
    var o = e.options.filter(function (x) {
      return x.id === optionId;
    })[0];
    if (!o) return;

    S.essais += 1;
    var secondes = (Date.now() - S.debut) / 1000;

    if (o.juste) {
      S.repondu = true;
      S.juste = true;
      S.choix = o.id;
      B.Etat.enregistrerEtape(S.queteId, e.id, {
        juste: true,
        essais: S.essais,
        optionId: o.id,
        secondes: secondes
      });
      B.Son.valide();
      B.haptique(S.essais === 1 ? 14 : 10);
      if (S.essais === 1) B.confettis(8);
      majXp();
      rendre(racine);
      return;
    }

    if (S.essais === 1) {
      S.faute = o.id;
      B.Son.doux();
      rendre(racine);
      return;
    }

    S.repondu = true;
    S.juste = false;
    S.choix = o.id;
    B.Etat.enregistrerEtape(S.queteId, e.id, {
      juste: false,
      essais: 2,
      optionId: o.id,
      secondes: secondes
    });
    B.Son.doux();
    rendre(racine);
  }

  function terminer() {
    var q = quete();
    var resultat = B.Etat.terminerQuete(S.queteId);
    var infos = B.Etat.infoQuete(S.queteId);

    S.bilan = {
      justes: infos.faits,
      preuve: resultat ? resultat.preuve : null,
      gain: resultat ? resultat.gain : 0
    };

    var aCorriger = q.etapes.filter(function (e) {
      var r = infos.etapes[e.id];
      return r && !r.juste && !(infos.corrections || {})[e.id];
    });

    if (aCorriger.length) {
      S.corrections = aCorriger;
      S.iCorr = 0;
      S.mode = "correction";
      remiseCorr();
      B.Son.doux();
      rendre(racine);
      return;
    }

    allerLecon();
    rendre(racine);
  }

  function allerLecon() {
    var res = B.Etat.debloquerLecon(S.queteId);
    S.lecon = res.lecon;
    S.leconNouvelle = res.nouvelle;
    S.mode = "lecon";
    B.Son.fanfare();
    B.confettis(18);
    B.haptique([12, 30, 12]);
  }

  function suivant() {
    if (!S.repondu) return;
    var q = quete();
    if (S.index < q.etapes.length - 1) {
      S.index += 1;
      remiseEtape();
      B.Son.glisse();
      rendre(racine);
      return;
    }
    terminer();
  }

  function repondreCorrection(id) {
    if (S.corrRepondu) return;
    var e = S.corrections[S.iCorr];
    var reussi = id === "juste";
    S.corrChoix = id;
    S.corrRepondu = true;
    S.corrJuste = reussi;
    B.Etat.enregistrerCorrection(S.queteId, e.id, reussi);
    if (reussi) {
      B.Son.valide();
      B.haptique(12);
      B.confettis(6);
    } else {
      B.Son.doux();
    }
    majXp();
    rendre(racine);
  }

  function suivantCorrection() {
    if (!S.corrRepondu) return;
    if (S.iCorr < S.corrections.length - 1) {
      S.iCorr += 1;
      remiseCorr();
      B.Son.glisse();
      rendre(racine);
      return;
    }
    allerLecon();
    rendre(racine);
  }

  function basculerCarte(el) {
    var verso = el.getAttribute("data-face") === "verso";
    el.setAttribute("data-face", verso ? "recto" : "verso");
    el.setAttribute("aria-pressed", verso ? "false" : "true");
    B.Son.clic();
    B.haptique(8);
    if (!verso) {
      B.annonce("ظهر البطاقة: سؤال الباك ومفتاح الجواب");
    } else {
      B.annonce("وجه البطاقة: الخلاصة");
    }
  }

  function lier() {
    detachers.forEach(function (off) {
      off();
    });
    detachers = [];

    detachers.push(
      B.del(racine, "[data-option]", "click", function (ev, el) {
        repondre(el.getAttribute("data-option"));
      })
    );

    detachers.push(
      B.del(racine, "[data-correction]", "click", function (ev, el) {
        repondreCorrection(el.getAttribute("data-correction"));
      })
    );

    detachers.push(
      B.del(racine, '[data-action="suivant"]', "click", function () {
        suivant();
      })
    );

    detachers.push(
      B.del(racine, '[data-action="corr-suivant"]', "click", function () {
        suivantCorrection();
      })
    );

    detachers.push(
      B.del(racine, "[data-flip]", "click", function (ev, el) {
        basculerCarte(el);
      })
    );

    detachers.push(
      B.del(racine, "[data-flip]", "keydown", function (ev, el) {
        if (ev.key === "Enter" || ev.key === " " || ev.key === "Spacebar") {
          ev.preventDefault();
          basculerCarte(el);
        }
      })
    );

    detachers.push(
      B.del(racine, "[data-quete]", "click", function (ev, el) {
        B.Son.clic();
        ouvrir(el.getAttribute("data-quete"));
        rendre(racine);
      })
    );

    detachers.push(
      B.del(racine, '[data-action="retour"]', "click", function () {
        B.Son.clic();
        B.Application.aller("masari");
      })
    );
  }

  B.Ecrans = B.Ecrans || {};
  B.Ecrans.game123 = {
    id: "quete",
    titre: "قاعدة البوصلة 1-2-3",
    ouvrir: ouvrir,
    rendre: rendre,
    demonter: function () {
      detachers.forEach(function (off) {
        off();
      });
      detachers = [];
      racine = null;
    },
    reinitialiser: function () {
      S = Object.assign({}, VIDE);
    }
  };
})();
