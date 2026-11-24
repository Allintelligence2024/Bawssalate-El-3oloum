/* ==========================================================================
   بوصلة العلوم · النسخة الشاملة
   screen-bac-apply.js — « الباك خطوة بخطوة ».

   Principe : la méthode de l'examen, en 3 gestes (اقرا · فسّر · استنتج),
   répétés sur 6 micro-décisions. Une question, un choix, un retour immédiat.
   Puis le corrigé assemblé et une feuille A4.

   Écran volontairement nu : progression, question, document, 4 choix, retour,
   un bouton. Tout le reste (documents, leçons, méthode) est à un tap.
   ========================================================================== */
(function () {
  "use strict";

  var B = window.Bawssala;
  var racine = null;
  var detachers = [];
  var minuteurPapier = null;
  var papierEnAttente = null;
  var S = { vue: "auto", courant: null, docVu: null, aide: false };

  var LETTRES = ["أ", "ب", "ج", "د"];

  function bac() {
    return B.Donnees.bac;
  }

  function etapesPlates() {
    return B.Etat.bacEtapes();
  }

  function infoEtape(id) {
    return B.Etat.bacEtape(id);
  }

  function docDe(code) {
    return (
      bac().documents.filter(function (d) {
        return d.code === code;
      })[0] || null
    );
  }

  function numeroQuestion(qid) {
    return (
      bac().questions
        .map(function (q) {
          return q.id;
        })
        .indexOf(qid) + 1
    );
  }

  function entete(sousTitre) {
    return B.UI.entete(sousTitre, { titre: "البوصلة", retour: "masari" });
  }

  /* ======================================================================
     MÉTHODE — écran d'entrée, une seule fois
     ====================================================================== */
  function vueMethode() {
    var gestes = [
      {
        n: "1",
        t: "شوف الوثيقة",
        d: "شنو تبدّل؟ الرقم اللي يتحرّك، ولا الشرط اللي تبدّل."
      },
      {
        n: "2",
        t: "فسّر الآلية",
        d: "كيفاش صرا؟ اربط الوثيقة بالفكرة اللي في الدرس."
      },
      {
        n: "3",
        t: "استنتج",
        d: "شنو النتيجة على الخلية؟ جملة واحدة، بلا حشو."
      }
    ];
    return (
      '<div class="vue" data-vue="bac">' +
      entete("الطريقة قبل التمرين") +
      '<div class="contenu contenu--bac">' +
      '<section class="bac-hero">' +
      '<div class="rangee rangee--entre">' +
      "<div>" +
      '<p class="mention mention--or">6 خطوات · بلا مؤقّت</p>' +
      '<h1 class="titre-ecran">3 حركات، وكل سؤال يطيح.</h1>' +
      '<p class="petit">نفس الطريقة في كل سؤال بكالوريا. هنا نتمرّنو عليها خطوة بخطوة.</p>' +
      "</div>" +
      '<div style="width:60px">' + B.mascotte("happy", 60) + "</div>" +
      "</div>" +
      "</section>" +

      '<ol class="methode">' +
      gestes
        .map(function (g) {
          return (
            '<li class="methode__pas">' +
            '<span class="methode__n">' + g.n + "</span>" +
            '<span class="methode__txt"><b>' + B.ech(g.t) + "</b>" +
            '<span class="petit">' + B.ech(g.d) + "</span></span>" +
            "</li>"
          );
        })
        .join("") +
      "</ol>" +

      '<div class="carte carte--sauge">' +
      '<p class="petit">' +
      B.icone("etincelle", 14) +
      " كل خطوة عندها شرحها على طول: إذا غلطت، نقولولك علاش، ونعاونوك، ماشي نخلّيوك في الظلام." +
      "</p></div>" +

      '<p class="petit doux">نفس المرجع (مرجع البوصلة) تحت يدك في كل خطوة، تفتحه وقت ما تحتاجه.</p>' +
      "</div>" +
      '<footer class="pied">' +
      '<button class="btn btn--primaire btn--large" type="button" data-action="commencer">' +
      "يالله نبدأ <span aria-hidden=\"true\">←</span></button>" +
      '<p class="pied__note">الخطوة الأولى جاهزة، ما كاينش وقت يتحسب</p>' +
      "</footer>" +
      "</div>"
    );
  }

  /* ======================================================================
     ÉTAPE — une décision à la fois
     ====================================================================== */
  function jauge(etape) {
    var liste = etapesPlates();
    var ids = liste.map(function (x) {
      return x.etape.id;
    });
    var ici = Math.max(0, ids.indexOf(S.courant));
    var pct = Math.round(((ici + 1) / ids.length) * 100);
    return (
      '<div class="pas">' +
      '<span class="pas__t">خطوة ' + B.chiffres(ici + 1) + " من " + B.chiffres(ids.length) +
      (etape ? ' <span class="pas__note">' + B.ech(etape.pas) + "</span>" : "") +
      "</span>" +
      '<span class="pas__jauge" role="progressbar" aria-valuemin="1" aria-valuemax="' +
      ids.length + '" aria-valuenow="' + (ici + 1) + '"><i style="width:' + pct + '%"></i></span>' +
      "</div>"
    );
  }

  function rendreFigure(f) {
    if (!f || typeof B.figure !== "function") return "";
    try {
      return B.figure(f.type, f);
    } catch (e) {
      return "";
    }
  }

  function figureDe(d) {
    if (!d || !d.figure) return "";
    var svg = rendreFigure(d.figure);
    return svg ? '<div class="figure-bloc">' + svg + "</div>" : "";
  }

  function piece(d, propre) {
    if (!d) return "";
    return (
      '<div class="doc doc--piece">' +
      '<p class="doc__titre">وثيقة ' + B.ech(d.code) + " · " + B.ech(d.titre) + "</p>" +
      figureDe(d) +
      '<p class="petit">' + B.ech(d.texte) + "</p>" +
      (propre
        ? ""
        : '<p class="petit doc__rappel"><button class="lien" type="button" data-doc-retour>' +
          "رجع لوثيقة الخطوة</button></p>") +
      "</div>"
    );
  }

  /* Quatre pastilles de code : on peut comparer les documents du sujet sans
     quitter la question (compétence C4), sans encombrer l'écran. */
  function vignettes(actif) {
    return (
      '<div class="doc-vignettes" role="group" aria-label="وثائق الموضوع">' +
      '<span class="petit doux">الوثائق</span>' +
      bac()
        .documents.map(function (d) {
          var on = d.code === actif;
          return (
            '<button class="doc-vign" type="button" data-doc="' + B.ech(d.code) + '"' +
            ' aria-pressed="' + (on ? "true" : "false") + '"' +
            ' aria-label="وثيقة ' + B.ech(d.code) + " · " + B.ech(d.titre) + '">' +
            B.ech(d.code) +
            "</button>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function options(info) {
    var corr = info.revele || info.juste;
    return (
      '<div class="options" role="group" aria-label="الاختيارات">' +
      melange(info.etape)
        .map(function (o, i) {
          var etat = "";
          if (corr && o.juste) etat = "juste";
          else if (info.choix === o.id && !o.juste) etat = "faux";
          var bloque = corr || (info.choix === o.id && !o.juste);
          return (
            '<button class="btn btn--option" type="button" data-choix="' + B.ech(o.id) + '"' +
            ' data-etat="' + etat + '"' + (bloque ? " disabled" : "") + ">" +
            '<span class="puce">' + LETTRES[i] + "</span>" +
            '<span class="grandit">' + B.ech(o.texte) + "</span>" +
            (corr && o.juste
              ? B.icone("check", 18)
              : info.choix === o.id && !o.juste
              ? B.icone("croix", 16)
              : "") +
            "</button>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  /* Ordre mélangé mais stable (fonction pure de l'id) : la bonne réponse n'est
     pas devinable par sa position, et rien ne bouge entre deux rendus. */
  function melange(etape) {
    var h = 5381;
    var i;
    for (i = 0; i < etape.id.length; i += 1) {
      h = (h * 33 + etape.id.charCodeAt(i)) >>> 0;
    }
    var etat = h || 1;
    var suivant = function () {
      etat ^= (etat << 13) >>> 0;
      etat >>>= 0;
      etat ^= etat >>> 17;
      etat ^= (etat << 5) >>> 0;
      etat >>>= 0;
      return etat;
    };
    var arr = etape.options.slice();
    for (i = arr.length - 1; i > 0; i -= 1) {
      var k = suivant() % (i + 1);
      var t = arr[i];
      arr[i] = arr[k];
      arr[k] = t;
    }
    var cible = suivant() % arr.length;
    var idx = 0;
    for (i = 0; i < arr.length; i += 1) {
      if (arr[i].juste) idx = i;
    }
    var tampon = arr[cible];
    arr[cible] = arr[idx];
    arr[idx] = tampon;
    return arr;
  }

  function blocRetour(info) {
    if (!info.choix || (!info.juste && !info.revele && info.essais === 0)) return "";
    if (info.juste) {
      var choisie = info.etape.options.filter(function (o) {
        return o.id === info.choix;
      })[0];
      return (
        '<div class="retour retour--juste" data-retour-etape="juste" role="status" tabindex="-1">' +
        '<span class="retour__icone">' + B.icone("check", 18) + "</span>" +
        '<div class="retour__corps">' +
        (choisie ? '<p class="retour__texte">' + B.ech(choisie.retour) + "</p>" : "") +
        '<p class="retour__source">' + B.ech(info.etape.cle) + "</p>" +
        "</div></div>"
      );
    }
    if (info.revele) {
      var bonne = info.etape.options.filter(function (o) {
        return o.juste;
      })[0];
      return (
        '<div class="retour retour--aide" data-retour-etape="revele" role="status" tabindex="-1">' +
        '<span class="retour__icone">' + B.icone("cle", 18) + "</span>" +
        '<div class="retour__corps">' +
        '<p class="retour__texte">الجواب: ' + B.ech(bonne.texte) + "</p>" +
        '<p class="retour__source">' + B.ech(bonne.retour) + "</p>" +
        "</div></div>"
      );
    }
    var fausse = info.etape.options.filter(function (o) {
      return o.id === info.choix;
    })[0];
    return (
      '<div class="retour retour--aide" data-retour-etape="indice" role="status" tabindex="-1">' +
      '<span class="retour__icone">' + B.icone("etincelle", 18) + "</span>" +
      '<div class="retour__corps">' +
      (fausse ? '<p class="retour__texte">' + B.ech(fausse.retour) + "</p>" : "") +
      '<p class="retour__source">' + B.icone("sablier", 12) + " " + B.ech(info.etape.aide) +
      " — عاود، عندك محاولة ثانية.</p>" +
      "</div></div>"
    );
  }

  function blocAide() {
    if (!S.aide || !S.courant) return "";
    var info = infoEtape(S.courant);
    if (!info || info.faite || info.essais > 0) return "";
    return (
      '<div class="retour retour--aide" data-aide-etape="1" role="status" tabindex="-1">' +
      '<span class="retour__icone">' + B.icone("etincelle", 18) + "</span>" +
      '<div class="retour__corps">' +
      '<p class="retour__texte">فكرة: ' + B.ech(info.etape.aide) + "</p>" +
      '<p class="retour__source">اقرا الوثيقة مرة أخرى، وبعدها اختار. الفكرة ما تنقصش النقاط.</p>' +
      "</div></div>"
    );
  }

  function vueEtape() {
    var id = S.courant;
    if (!id) {
      var p0 = B.Etat.bacProgression();
      if (!p0.courante) return vueBilan();
      id = p0.courante;
      S.courant = id;
    }
    var info = infoEtape(id);
    if (!info) return vueBilan();

    var q = info.question;
    var e = info.etape;
    var progression = B.Etat.bacProgression();
    var ids = etapesPlates().map(function (x) {
      return x.etape.id;
    });
    var derniere = ids.indexOf(e.id) === ids.length - 1;
    var note = !info.faite
      ? info.essais > 0
        ? "عندك محاولة ثانية — جاوب باش تكمّل"
        : "اختر جوابًا واحدًا، وبعدها نفهمو علاش"
      : info.juste
      ? info.gain
        ? "+" + B.chiffres(info.gain) + " نقاط خبرة"
        : "تثبيت بلا نقاط — وهذا مقصود"
      : info.revele
      ? "الشرح خير من النقطة، والخطوة جاية"
      : "عاود المحاولة، ما زال عندك وقت";

    return (
      '<div class="vue" data-vue="bac">' +
      entete("تمرين الباك · α-amanitine") +
      '<div class="contenu contenu--bac">' +
      jauge(e) +

      '<section class="bac-carte">' +
      '<header class="bac-carte__tete">' +
      '<span class="mention mention--or">السؤال ' + B.chiffres(numeroQuestion(q.id)) +
      " · " + B.ech(q.competence.toUpperCase()) + "</span>" +
      '<button class="btn-icone btn-icone--petit" type="button" data-reference' +
      ' title="مرجع البوصلة" aria-label="افتح مرجع البوصلة">' +
      B.icone("livre", 18) + "</button>" +
      "</header>" +
      '<h1 class="bac-q" tabindex="-1" data-consigne>' + B.ech(e.consigne) + "</h1>" +
      piece(docDe(S.docVu || e.doc), !S.docVu || S.docVu === e.doc) +
      vignettes(S.docVu || e.doc) +
      "</section>" +

      options(info) +
      (!info.faite && info.essais === 0 && !S.aide
        ? '<button class="lien lien--aide" type="button" data-aide>' +
          B.icone("etincelle", 14) + " عاونّي بفكرة صغيرة</button>"
        : "") +
      blocRetour(info) +
      blocAide() +
      "</div>" +

      '<footer class="pied">' +
      '<button class="btn btn--primaire btn--large" type="button" data-action="suivant"' +
      (info.faite ? "" : " disabled") + ">" +
      (!info.faite
        ? "اختار جواب أوّلًا"
        : derniere
          ? "شوف الجواب الكامل"
          : "الخطوة الجاية") +
      ' <span aria-hidden="true">←</span></button>' +
      '<p class="pied__note">' + note + "</p>" +
      "</footer>" +
      "</div>"
    );
  }

  /* ======================================================================
     BILAN — le corrigé assemblé
     ====================================================================== */
  function preuvesSujet() {
    var codes = (B.Donnees.bacPreuves || []).map(function (p) {
      return p.code;
    });
    var dispo = (B.Etat.preuves() || []).filter(function (p) {
      return codes.indexOf(p.code) !== -1;
    });
    if (!dispo.length) return "";
    return (
      '<section class="carte">' +
      '<div class="carte__tete"><span class="carte__titre">أدلتك من هذا التمرين</span>' +
      '<span class="mention mention--or">' + B.chiffres(dispo.length) + " بطاقة</span></div>" +
      dispo
        .map(function (p) {
          return (
            '<div class="preuve">' +
            (rendreFigure(p.figure)
              ? '<div class="preuve__fig">' + rendreFigure(p.figure) + "</div>"
              : "") +
            '<div class="preuve__txt">' +
            '<p class="preuve__source">' + B.ech(p.source) + "</p>" +
            '<p class="petit">' + B.ech(p.texte) + "</p>" +
            "</div></div>"
          );
        })
        .join("") +
      '<p class="petit doux mt-8">تلقاهم زادة في « مرجع البوصلة › الأدلة ».</p>' +
      "</section>"
    );
  }

  function carteQuestion(q, bilan) {
    return (
      '<section class="carte">' +
      '<div class="carte__tete"><span class="carte__titre">السؤال ' +
      B.chiffres(numeroQuestion(q.id)) + "</span>" +
      '<span class="mention mention--or">' + B.ech(q.competence.toUpperCase()) + "</span></div>" +
      '<p class="petit doux">' + B.ech(q.intitule) + "</p>" +
      '<ul class="synthese__lignes">' +
      q.briques
        .map(function (b, i) {
          return (
            "<li>" +
            '<span class="syn-n" aria-hidden="true">' + B.chiffres(i + 1) + "</span>" +
            "<span>" + B.ech(b.texte) + "</span></li>"
          );
        })
        .join("") +
      "</ul>" +
      '<div class="corr__cle mt-8"><p class="corr__titre">المفتاح</p>' +
      '<p class="petit">' + B.ech(q.attendu) + "</p></div>" +
      (bilan
        ? '<p class="petit mt-8">' + B.icone("etincelle", 14) + " من أول محاولة: " +
          B.chiffres(bilan.premierCoup) + " من " + B.chiffres(bilan.total) +
          (bilan.revelees ? " · " + B.chiffres(bilan.revelees) + " بالشرح" : "") + "</p>"
        : "") +
      "</section>"
    );
  }

  function papier() {
    var e = B.Etat.bac();
    return (
      '<section class="carte">' +
      '<div class="carte__tete"><span class="carte__titre">مسوّدتك</span>' +
      '<span class="mention">اختياري · تُطبع</span></div>' +
      '<textarea class="zone-texte" data-papier-zone rows="3" ' +
      'placeholder="اكتب الفكرة اللي حبستك، ولا الجملة اللي تحب تحفظها…">' +
      B.ech(e.papier) +
      "</textarea></section>"
    );
  }

  function vueBilan() {
    var p = B.Etat.bacProgression();
    var bilans = B.Etat.bacBilan();
    return (
      '<div class="vue" data-vue="bilan">' +
      entete("تمرين الباك · الجواب الكامل") +
      '<div class="contenu contenu--bac">' +
      '<section class="bac-hero">' +
      '<div class="rangee rangee--entre">' +
      "<div>" +
      '<p class="mention mention--or">' + B.chiffres(p.total) + " خطوات · بلا مؤقّت</p>" +
      '<h1 class="titre-ecran">خلّصت التمرين.</h1>' +
      '<p class="petit">' + B.chiffres(p.premierCoup) + " من " + B.chiffres(p.total) +
      " من أول محاولة. والباقي ولّى شرحًا.</p>" +
      "</div>" +
      '<div style="width:64px">' + B.mascotte("celebrate", 64) + "</div>" +
      "</div>" +
      "</section>" +

      '<div class="carte carte--sauge">' +
      '<div class="carte__tete"><span class="carte__titre">بطاقة التمرين</span>' +
      '<span class="mention">مؤشّر توجيهي، ماشي نقطة</span></div>' +
      '<div class="rangee rangee--galerie">' +
      bilans
        .map(function (b) {
          return (
            '<span class="puce puce--statut">' + B.ech(b.competence.toUpperCase()) + " · " +
            B.ech(b.statut) + "</span>"
          );
        })
        .join("") +
      '<span class="puce puce--statut">' + B.chiffres(p.essais) + " محاولة</span>" +
      "</div>" +
      '<p class="petit mt-8">هذا المؤشّر يوريك وين راجع، ماشي علامة على 20.</p>' +
      "</div>" +

      '<div class="rangee rangee--galerie mt-8">' +
      '<button class="btn btn--primaire" type="button" data-action="imprimer">' +
      B.icone("crayon", 18) + " اطبع ورقة البكالوريا</button>" +
      '<button class="btn btn--secondaire" type="button" data-action="rejouer">' +
      B.icone("tourner", 18) + " عاود التمرين</button>" +
      "</div>" +

      preuvesSujet() +

      bac()
        .questions.map(function (q, i) {
          return carteQuestion(q, bilans[i]);
        })
        .join("") +

      papier() +

      '<p class="petit doux mt-8" data-version="bac">الورقة تُطبع بالجواب الكامل · نسخة 1.6</p>' +
      "</div>" +
      '<footer class="pied">' +
      '<button class="btn btn--secondaire btn--large" type="button" data-retour="masari">' +
      "رجع لمساري</button>" +
      "</footer>" +
      "</div>"
    );
  }

  /* ======================================================================
     FEUILLE A4
     ====================================================================== */
  function feuille() {
    var e = B.Etat.bac();
    var date = e.le || B.aujourdhui();
    var p = B.Etat.bacProgression();
    var corps = bac()
      .questions.map(function (q, i) {
        return (
          '<section class="feuille__q">' +
          "<h2>السؤال " + B.chiffres(i + 1) + " · " + B.ech(q.competence.toUpperCase()) + "</h2>" +
          '<p class="feuille__intitule">' + B.ech(q.intitule) + "</p>" +
          (q.id === "q1" && bac().documents[0].figure
            ? '<div class="feuille__fig">' + rendreFigure({ type: "courbe" }) + "</div>"
            : q.id === "q2" && bac().documents[3].figure
            ? '<div class="feuille__fig">' + rendreFigure({ type: "atac" }) + "</div>"
            : "") +
          '<ul class="feuille__lignes">' +
          q.briques
            .map(function (b, j) {
              return (
                "<li>" +
                '<span class="feuille__n" aria-hidden="true">' + B.chiffres(j + 1) + ".</span>" +
                "<span>" + B.ech(b.texte) + "</span></li>"
              );
            })
            .join("") +
          "</ul>" +
          '<p><b>المفتاح:</b> ' + B.ech(q.attendu) + "</p>" +
          "</section>"
        );
      })
      .join("");
    return (
      '<header class="feuille__tete">' +
      '<p class="feuille__marque">بوصلة العلوم · ورقة البكالوريا</p>' +
      "<h1>" + B.ech(bac().titre) + "</h1>" +
      '<p class="petit">' + B.ech(bac().session) + " · تمرين " + B.chiffres(bac().exercice) +
      " · " + B.ech(B.dateCourte(date)) + "</p>" +
      "</header>" +
      corps +
      (e.papier
        ? '<section class="feuille__q"><h2>مسوّدة</h2><p>' + B.ech(e.papier) + "</p></section>"
        : "") +
      '<p class="feuille__pied">' + B.chiffres(p.premierCoup) + " من " + B.chiffres(p.total) +
      " من أول محاولة. " + B.ech(B.Donnees.sources.mention) + ". تدريب، ماشي امتحان رسمي.</p>"
    );
  }

  /* Le brouillon s'écrit avec 400 ms de retard (on ne martèle pas le stockage).
     Avant d'imprimer, de rejouer ou de quitter, on vide la file. */
  function flushPapier() {
    if (papierEnAttente === null) return;
    if (minuteurPapier) {
      window.clearTimeout(minuteurPapier);
      minuteurPapier = null;
    }
    B.Etat.bacPapier(papierEnAttente);
    papierEnAttente = null;
  }

  function imprimer() {
    flushPapier();
    var zone = document.getElementById("feuille");
    if (!zone) return;
    zone.innerHTML = feuille();
    B.annonce("الورقة جاهزة للطبع");
    try {
      window.print();
    } catch (err) {
      B.toast("الطبع ماشي متوفّر في هذا المتصفّح.");
    }
  }

  /* ======================================================================
     ACTIONS
     ====================================================================== */
  /* Amène le retour (explication / indice / réponse montrée) sous les yeux.
     Sans ça, sur un écran de 844 px avec la figure du document, l'élève ne
     voyait qu'une croix et devait deviner qu'il fallait faire défiler. */
  function montrerRetour() {
    var boite = B.$(".contenu--bac", racine);
    var cible = B.$("[data-retour-etape]", racine) || B.$("[data-aide-etape]", racine);
    if (!boite || !cible) return;
    var haut =
      cible.getBoundingClientRect().top -
      boite.getBoundingClientRect().top +
      boite.scrollTop -
      10;
    if (boite.scrollTo) boite.scrollTo({ top: Math.max(0, haut), behavior: "smooth" });
    else boite.scrollTop = Math.max(0, haut);
  }

  function hautDePage() {
    var boite = B.$(".contenu--bac", racine);
    if (boite && boite.scrollTo) boite.scrollTo({ top: 0, behavior: "auto" });
    else if (boite) boite.scrollTop = 0;
  }

  function repondre(optionId) {
    var id = S.courant;
    if (!id) return;
    var res = B.Etat.bacRepondre(id, optionId);
    if (res.erreur) return;

    if (res.juste) {
      B.Son.valide();
      B.haptique(14);
      if (res.essais === 1) B.confettis(8);
      B.annonce(res.essais === 1 ? "صحيح من أول محاولة" : "صحيح في المحاولة الثانية");
    } else if (res.revele) {
      B.Son.doux();
      B.annonce("شوف الجواب والشرح");
    } else {
      B.Son.doux();
      B.haptique(8);
      B.annonce("عاود، عندك محاولة ثانية");
    }
    rendre(racine);
    window.setTimeout(montrerRetour, 60);
    var consigne = B.$("[data-consigne]", racine);
    if (consigne) B.focus(consigne);
  }

  function suivant() {
    var p = B.Etat.bacProgression();
    if (p.finie) {
      var res = B.Etat.bacTerminer();
      S.vue = "bilan";
      B.Son.fanfare();
      B.haptique(18);
      B.confettis(16);
      B.annonce("التمرين كامل. هذا هو الجواب الكامل.");
      rendre(racine);
      if (res && res.erreur) B.toast("زايد خطوة وحدة، كمّلها.");
      return;
    }
    var ids = etapesPlates().map(function (x) {
      return x.etape.id;
    });
    var i = ids.indexOf(S.courant);
    S.courant = ids[i + 1] || p.courante;
    S.docVu = null;
    S.aide = false;
    B.Son.clic();
    rendre(racine);
    var consigne = B.$("[data-consigne]", racine);
    if (consigne) B.focus(consigne);
  }

  function rejouer() {
    flushPapier();
    B.Etat.bacReinitialiser();
    S.vue = "etapes";
    S.courant = etapesPlates()[0].etape.id;
    S.docVu = null;
    S.aide = false;
    B.Son.clic();
    B.toast("رجعنا للبداية. نفس الوثائق، عين جديدة.");
    rendre(racine);
  }

  function commencer() {
    B.Etat.bacMarquerVu();
    S.vue = "etapes";
    S.courant = B.Etat.bacProgression().courante || etapesPlates()[0].etape.id;
    B.Son.clic();
    rendre(racine);
  }

  /* ======================================================================
     RENDU
     ====================================================================== */
  function detacher() {
    detachers.forEach(function (off) {
      off();
    });
    detachers = [];
  }

  function lier() {
    detacher();

    detachers.push(
      B.del(racine, "[data-action='commencer']", "click", function () {
        commencer();
      })
    );

    detachers.push(
      B.del(racine, "[data-doc]", "click", function (ev, el) {
        var code = el.getAttribute("data-doc");
        S.docVu = code;
        B.Son.clic();
        B.annonce("وثيقة " + code);
        rendre(racine);
        var vign = B.$("[data-doc='" + code + "']", racine);
        if (vign) B.focus(vign);
      })
    );

    detachers.push(
      B.del(racine, "[data-doc-retour]", "click", function () {
        S.docVu = null;
        B.Son.clic();
        rendre(racine);
      })
    );

    detachers.push(
      B.del(racine, "[data-aide]", "click", function () {
        S.aide = true;
        B.Son.clic();
        B.annonce("فكرة مساعدة، بلا نقصان نقاط");
        rendre(racine);
        var bloc = B.$("[data-aide-etape]", racine);
        if (bloc) B.focus(bloc);
      })
    );

    detachers.push(
      B.del(racine, "[data-choix]", "click", function (ev, el) {
        repondre(el.getAttribute("data-choix"));
      })
    );

    detachers.push(
      B.del(racine, "[data-action='suivant']", "click", function () {
        suivant();
      })
    );

    detachers.push(
      B.del(racine, "[data-reference]", "click", function () {
        B.Son.clic();
        B.Boussole.ouvrir();
      })
    );

    detachers.push(
      B.del(racine, "[data-papier-zone]", "input", function (ev, el) {
        /* Écriture différée : on ne martèle pas le stockage à chaque touche. */
        papierEnAttente = el.value;
        if (minuteurPapier) window.clearTimeout(minuteurPapier);
        minuteurPapier = window.setTimeout(function () {
          if (papierEnAttente !== null) B.Etat.bacPapier(papierEnAttente);
          papierEnAttente = null;
          minuteurPapier = null;
        }, 400);
      })
    );

    detachers.push(
      B.del(racine, "[data-action='imprimer']", "click", function () {
        B.Son.clic();
        imprimer();
      })
    );

    detachers.push(
      B.del(racine, "[data-action='rejouer']", "click", function () {
        rejouer();
      })
    );
  }

  function vueCourante() {
    if (S.vue === "bilan") return "bilan";
    if (S.vue === "etapes") return "etapes";
    if (S.vue === "methode") return "methode";
    /* auto : reprise là où l'élève s'est arrêté */
    if (B.Etat.bac().fini) return "bilan";
    if (!B.Etat.bacVu()) return "methode";
    return "etapes";
  }

  function rendre(conteneur) {
    if (!conteneur) return;
    flushPapier();
    racine = conteneur;

    var progression = B.Etat.bacProgression();
    if (progression.finie && B.Etat.bac().fini) S.vue = "bilan";
    if (!S.courant) S.courant = progression.courante || etapesPlates()[0].etape.id;

    var vue = vueCourante();
    var html = vue === "bilan" ? vueBilan() : vue === "methode" ? vueMethode() : vueEtape();

    var etapeAvant = S.rendu;
    S.rendu = vue + ":" + (S.courant || "");
    conteneur.innerHTML = html;
    if (etapeAvant !== undefined && etapeAvant !== S.rendu) window.setTimeout(hautDePage, 0);
    lier();
  }

  B.Ecrans.bac = {
    id: "bac",
    titre: "الباك · خطوة بخطوة",
    rendre: rendre,
    imprimer: imprimer,
    feuille: feuille,
    allerBilan: function () {
      S.vue = "bilan";
      rendre(racine);
    },
    demonter: function () {
      flushPapier();
      detacher();
      B.Boussole.fermer();
      racine = null;
    },
    reinitialiser: function () {
      S = { vue: "auto", courant: null, docVu: null, aide: false };
      papierEnAttente = null;
      if (minuteurPapier) {
        window.clearTimeout(minuteurPapier);
        minuteurPapier = null;
      }
    }
  };
})();
