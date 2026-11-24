/* ==========================================================================
   بوصلة العلوم · النسخة الشاملة — المرحلة 1
   screen-onboarding.js — entrée éclair < 15 s + défi SVG de l'unité 1
   (3 manches : بدّل الشرط · قارن الدليل · جرّب بيدك) + جولة التصحيح + بطاقات الأدلة.
   ========================================================================== */
(function () {
  "use strict";

  var B = window.Bawssala;

  /* ======================================================================
     0. ÉTAT LOCAL DE LA VUE
     ====================================================================== */
  var S = {
    etape: "intro", // intro | manche | correction | fin
    index: 0,
    manche: null,
    repondu: false,
    juste: false,
    essais: 0,
    choix: null,
    fautes: [],
    ordre: [],
    debutManche: 0,
    debutSession: 0,
    correctionIndex: 0,
    faits: []
  };

  var racine = null;
  var detachers = [];

  function remiseAZero() {
    S.etape = "intro";
    S.index = 0;
    S.manche = null;
    S.repondu = false;
    S.juste = false;
    S.essais = 0;
    S.choix = null;
    S.fautes = [];
    S.ordre = [];
    S.debutManche = 0;
    S.debutSession = 0;
    S.correctionIndex = 0;
    S.faits = [];
  }

  function muet() {
    return B.Son.estMuet();
  }

  /* ======================================================================
     1. FRAGMENTS D'INTERFACE
     ====================================================================== */
  function entete(opts) {
    var o = opts || {};
    var etat = B.Etat.get();
    var fil = etat.onboarding.fait ? "الوحدة 1 · مراجعة" : "الوحدة 1 · تركيب البروتين";
    return (
      '<header class="barre">' +
      (o.retour
        ? '<button class="btn-icone" type="button" data-action="retour" aria-label="رجوع">' +
          B.icone("fleche", 20) +
          "</button>"
        : "") +
      '<div class="barre__marque">' +
      '<span class="barre__logo">' + B.icone("boussole", 18) + "</span>" +
      "<div>" +
      '<p class="barre__nom">بوصلة العلوم</p>' +
      '<p class="barre__sous">' + B.ech(o.sous || fil) + "</p>" +
      "</div>" +
      "</div>" +
      '<div class="barre__actions">' +
      '<span class="pastille" aria-label="نقاط الخبرة">' +
      B.icone("etincelle", 14) +
      '<span data-xp="1">' + B.chiffres(B.Etat.get().xp) + "</span>" +
      "</span>" +
      '<button class="btn-icone" type="button" data-son aria-pressed="' +
      (muet() ? "false" : "true") +
      '" aria-label="' + (muet() ? "شغّل الصوت" : "أسكت الصوت") + '">' +
      B.icone(muet() ? "muet" : "son", 18) +
      "</button>" +
      "</div>" +
      "</header>"
    );
  }

  function pied(cta, options) {
    var o = options || {};
    return (
      '<footer class="pied">' +
      '<button class="btn btn--primaire btn--large" type="button" data-action="' +
      cta.action +
      '"' + (cta.desactive ? " disabled" : "") + ">" +
      B.ech(cta.label) +
      (cta.fleche === false ? "" : ' <span aria-hidden="true">←</span>') +
      "</button>" +
      (o.note ? '<p class="pied__note">' + B.ech(o.note) + "</p>" : "") +
      "</footer>"
    );
  }

  function fils(indexActif) {
    return (
      '<div class="fils" role="list" aria-label="خطوات التحدّي">' +
      B.Donnees.manches
        .map(function (m, i) {
          var etat = i < indexActif ? "fini" : i === indexActif ? "actif" : "";
          return (
            '<div class="fil" role="listitem" data-etat="' + etat + '">' +
            '<span class="fil__num">' + (i < indexActif ? "✓" : i + 1) + "</span>" +
            '<span class="fil__t">' + B.ech(m.pasTitre) + "</span>" +
            "</div>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function majXp() {
    B.$$("[data-xp='1']", racine).forEach(function (n) {
      n.textContent = B.chiffres(B.Etat.get().xp);
    });
  }

  /* ======================================================================
     2. VISUELS SVG
     ====================================================================== */

  /** État de la cellule : avant / après condition α-amanitine. */
  function svgCellule(etat, condition) {
    var bloque = etat === "apres" && condition === "amanitine";

    var polymerase = bloque
      ? '<g class="zone-active">' +
        '<circle cx="252" cy="92" r="9" fill="var(--miel)" stroke="var(--miel-line)" stroke-width="1.2"/>' +
        '<path d="M249 89l6 6M255 89l-6 6" stroke="var(--miel-ink)" stroke-width="1.6" stroke-linecap="round"/>' +
        "</g>" +
        '<text x="252" y="116" text-anchor="middle" class="svg-t" style="fill:var(--miel-ink)">موقوف</text>'
      : '<circle cx="252" cy="92" r="8" fill="var(--pine)"/>' +
        '<circle cx="252" cy="92" r="13" fill="none" stroke="var(--pine)" stroke-width="1" opacity=".35"/>';

    var brinArn =
      '<path d="M212 100c12-10 24 10 36 0s24 10 36 0" fill="none" stroke="var(--miel-line)" stroke-width="2.4" stroke-linecap="round"/>' +
      '<path d="M212 108c12 10 24-10 36 0s24-10 36 0" fill="none" stroke="var(--miel-line)" stroke-width="1.4" stroke-linecap="round" opacity=".55"/>';

    var arnm = bloque
      ? '<path d="M214 128 C176 136 146 150 116 156" class="tr tr--miel tr--bloque" stroke-dasharray="4 8"/>'
      : '<path d="M214 128 C176 136 146 150 116 156" class="tr tr--flux" marker-end="url(#fleche-verte)"/>';

    var ribosome =
      '<g opacity="' + (bloque ? ".45" : "1") + '">' +
      '<ellipse cx="90" cy="154" rx="24" ry="16" fill="var(--pine)" opacity=".16"/>' +
      '<ellipse cx="90" cy="147" rx="19" ry="12" fill="var(--pine)" opacity=".28"/>' +
      '<ellipse cx="90" cy="147" rx="12" ry="7" fill="var(--paper)" opacity=".7"/>' +
      "</g>";

    var proteine = bloque
      ? '<text x="52" y="176" text-anchor="middle" class="svg-t" style="fill:var(--miel-ink)">لا بروتين</text>'
      : '<g>' +
        '<path d="M66 158c-14 10-26 14-38 10" fill="none" stroke="var(--pine)" stroke-width="2" stroke-linecap="round"/>' +
        '<circle cx="62" cy="161" r="4" fill="var(--gold)"/>' +
        '<circle cx="50" cy="167" r="4" fill="var(--gold)"/>' +
        '<circle cx="38" cy="168" r="4" fill="var(--gold)"/>' +
        '<text x="40" y="186" text-anchor="middle" class="svg-t">بروتين</text>' +
        "</g>";

    var badge = bloque
      ? '<g transform="translate(252 158)"><rect x="-34" y="-11" width="68" height="22" rx="11" fill="var(--miel)" stroke="var(--miel-line)"/>' +
        '<text x="0" y="4" text-anchor="middle" class="svg-t" style="fill:var(--miel-ink);font-weight:700">0 ARNm</text></g>'
      : '<g transform="translate(252 158)"><rect x="-34" y="-11" width="68" height="22" rx="11" fill="var(--sauge)" stroke="var(--sauge-line)"/>' +
        '<text x="0" y="4" text-anchor="middle" class="svg-t" style="fill:var(--sauge-ink);font-weight:700">ARNm خارج</text></g>';

    return (
      '<svg viewBox="0 0 340 210" role="img" aria-label="' +
      (bloque
        ? "مخطط خلية: النواة، إنزيم موقوف، لا ARNm ولا بروتين."
        : "مخطط خلية: النواة، ARNm يهاجر نحو ريبوزوم يبني بروتينًا.") +
      '">' +
      "<defs>" +
      '<marker id="fleche-verte" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">' +
      '<path d="M0 0 10 5 0 10z" fill="var(--pine)"/></marker>' +
      "</defs>" +
      /* cadre cytoplasmique */
      '<rect x="8" y="8" width="324" height="194" rx="14" fill="none" stroke="var(--rule)" stroke-dasharray="5 7"/>' +
      '<text x="22" y="26" class="svg-t">الهيولى</text>' +
      /* noyau */
      '<circle cx="252" cy="104" r="60" fill="var(--weak)" opacity=".5"/>' +
      '<circle cx="252" cy="104" r="60" fill="none" stroke="var(--line)" stroke-dasharray="4 6"/>' +
      '<text x="252" y="40" text-anchor="middle" class="svg-t--fort svg-t">النواة</text>' +
      brinArn +
      polymerase +
      /* ARNm + ribosome + protéine */
      arnm +
      '<text x="176" y="124" text-anchor="middle" class="svg-t">ARNm</text>' +
      ribosome +
      '<text x="90" y="198" text-anchor="middle" class="svg-t">ريبوزوم</text>' +
      proteine +
      badge +
      (bloque
        ? '<text x="252" y="150" text-anchor="middle" class="svg-t">ARN بوليميراز</text>'
        : '<text x="252" y="122" text-anchor="middle" class="svg-t">ARN بوليميراز</text>') +
      "</svg>"
    );
  }

  /** Mini-document A/B : présence d'ARNm et état du protéine. */
  function svgDoc(doc) {
    var arnm = doc.arnm
      ? '<path d="M70 62c-12 6-22 10-32 8" fill="none" stroke="var(--pine)" stroke-width="2" stroke-dasharray="3 4"/>' +
        '<circle cx="76" cy="60" r="3.4" fill="var(--pine)"/>'
      : '<text x="76" y="66" text-anchor="middle" class="svg-t" style="fill:var(--miel-ink)">—</text>';

    var proteine =
      doc.proteine === "none"
        ? '<text x="26" y="92" text-anchor="middle" class="svg-t" style="fill:var(--miel-ink)">لا بروتين</text>'
        : '<g><circle cx="34" cy="86" r="3.2" fill="var(--gold)"/><circle cx="25" cy="90" r="3.2" fill="var(--gold)"/>' +
          '<path d="M30 86c-6 4-10 5-14 5" stroke="var(--miel-line)" stroke-width="1.6" fill="none" stroke-dasharray="2 3"/>' +
          '<text x="30" y="102" text-anchor="middle" class="svg-t" style="fill:var(--miel-ink)">ناقص</text></g>';

    return (
      '<svg viewBox="0 0 110 110" class="doc__svg" aria-hidden="true">' +
      '<circle cx="76" cy="52" r="28" fill="var(--weak)" stroke="var(--line)" stroke-dasharray="3 5"/>' +
      '<text x="76" y="18" text-anchor="middle" class="svg-t">النواة</text>' +
      arnm +
      '<ellipse cx="34" cy="74" rx="12" ry="8" fill="var(--pine)" opacity=".18"/>' +
      '<ellipse cx="34" cy="71" rx="9" ry="6" fill="var(--pine)" opacity=".3"/>' +
      proteine +
      "</svg>"
    );
  }

  function plancheCellule(etat, condition) {
    return (
      '<div class="planche instrument--nerf" data-planche="cellule">' +
      '<span class="planche__tampon">' +
      (etat === "apres" ? "النتيجة" : "قبل الشرط") +
      "</span>" +
      svgCellule(etat, condition) +
      (etat === "apres"
        ? '<span class="condition">' +
          B.icone("warn", 12) +
          " α-amanitine · " +
          (condition === "amanitine" ? "0 ARNm" : "") +
          "</span>"
        : '<span class="condition condition--ok">' + B.icone("etincelle", 12) + " خلية شاهدة</span>") +
      "</div>"
    );
  }

  function plancheDocuments(manche) {
    return (
      '<div class="planche instrument--enzyme" data-planche="documents">' +
      '<span class="planche__tampon">وثيقتان</span>' +
      '<div class="duo">' +
      manche.visuel.docs
        .map(function (d) {
          return (
            '<figure class="doc">' +
            '<figcaption class="doc__titre">' + B.ech(d.cle) + " · " + B.ech(d.titre) + "</figcaption>" +
            svgDoc(d) +
            '<span class="doc__val' + (d.arnm ? "" : " doc__val--zero") + '">' + B.ech(d.valeur) + "</span>" +
            "</figure>"
          );
        })
        .join("") +
      "</div>" +
      "</div>"
    );
  }

  function plancheOrdre(manche) {
    var slots = [0, 1, 2]
      .map(function (i) {
        var id = S.ordre[i];
        var item = null;
        if (id) {
          item = manche.items.filter(function (x) {
            return x.id === id;
          })[0];
        }
        return (
          '<div class="chainon" data-slot="' + i + '" data-rempli="' + (item ? "oui" : "") + '">' +
          (item ? B.ech(item.texte) : '<span class="chainon__vide">•</span>') +
          "</div>"
        );
      })
      .join('<span class="fleche" aria-hidden="true">←</span>');

    var restants = manche.items.filter(function (x) {
      return S.ordre.indexOf(x.id) === -1;
    });

    return (
      '<div class="planche planche--colonne instrument--enzyme" data-planche="ordre">' +
      '<span class="planche__tampon">رتّب بيدك</span>' +
      '<div class="chainons">' + slots + "</div>" +
      '<div class="briques">' +
      restants
        .map(function (x) {
          return (
            '<button class="brique" type="button" data-brique="' + B.ech(x.id) + '">' +
            '<span class="brique__p">+</span>' +
            '<span class="brique__r">' + B.ech(x.texte) + "</span>" +
            "</button>"
          );
        })
        .join("") +
      "</div>" +
      (S.ordre.length
        ? '<button class="btn btn--fantome" type="button" data-action="effacer-ordre">↺ أعد الترتيب</button>'
        : "") +
      "</div>"
    );
  }

  /* ======================================================================
     3. INTRO
     ====================================================================== */
  function vueIntro() {
    var intro =
      '<div class="contenu">' +
      '<div class="intro">' +
      '<div class="intro__mascotte" data-mascotte="neutral">' + B.mascotte("wink", 176) + "</div>" +
      B.bulle("مرحبا! أنا مفتاح. نبداو بتحدّي صغير قبل الدرس؟") +
      '<h1 class="intro__titre">افهم قبل <em>ما تحفظ</em>.</h1>' +
      '<p class="intro__promesse">3 تحديات على الوحدة 1. تجرّب، تشوف الدليل، تربح بطاقة.</p>' +
      '<div class="etiquettes">' +
      '<span class="etiquette">' + B.icone("sablier", 13) + " 90 ثانية</span>" +
      '<span class="etiquette">' + B.icone("cle", 13) + " بلا حساب</span>" +
      '<span class="etiquette">' + B.icone("bouclier", 13) + " بلا عقاب</span>" +
      "</div>" +
      "</div>" +
      "</div>";

    return (
      '<div class="vue" data-vue="onboarding">' +
      entete({ sous: "الوحدة 1 · تجربة أولى" }) +
      intro +
      pied(
        { action: "commencer", label: "يلا نبداو التحدّي" },
        { note: "بلا تثبيت · يعمل بلا أنترنت · تقدّمك يبقى في هذا الجهاز" }
      ) +
      "</div>"
    );
  }

  /* ======================================================================
     4. MANCHE
     ====================================================================== */
  function vueManche() {
    var m = S.manche;
    var visuel;
    if (m.visuel.type === "cellule") {
      visuel = plancheCellule(S.repondu ? "apres" : "avant", m.visuel.condition);
    } else if (m.visuel.type === "documents") {
      visuel = plancheDocuments(m);
    } else {
      visuel = plancheOrdre(m);
    }

    var options =
      m.visuel.type === "ordre"
        ? ""
        : '<div class="options" role="group" aria-label="الاختيارات">' +
          m.options
            .map(function (o, i) {
              var etat = "";
              if (S.repondu) {
                if (o.juste) etat = "juste";
                else if (S.choix === o.id) etat = "faux";
              } else if (S.fautes.indexOf(o.id) !== -1) {
                etat = "faux";
              }
              return (
                '<button class="btn btn--option" type="button" data-option="' + o.id + '"' +
                ' data-etat="' + etat + '"' +
                (S.repondu || S.fautes.indexOf(o.id) !== -1 ? " disabled" : "") + ">" +
                '<span class="puce">' + (i === 0 ? "أ" : i === 1 ? "ب" : "ج") + "</span>" +
                '<span class="grandit">' + B.ech(o.texte) + "</span>" +
                (S.repondu && o.juste ? B.icone("check", 18) : "") +
                "</button>"
              );
            })
            .join("") +
          "</div>";

    return (
      '<div class="vue" data-vue="onboarding">' +
      entete({ retour: true, sous: m.badge }) +
      '<div class="contenu">' +
      fils(S.index) +
      visuel +
      '<p class="consigne" tabindex="-1" data-consigne>' +
      '<span class="consigne__puce">' + B.icone("boussole", 16) + "</span>" +
      "<span>" + B.ech(m.consigne) + "</span>" +
      "</p>" +
      options +
      '<div id="zone-retour">' + blocRetour() + "</div>" +
      "</div>" +
      pied(
        {
          action: "suivant",
          label: S.index === B.Donnees.manches.length - 1 ? "شوف النتيجة" : "التالي",
          desactive: !S.repondu
        },
        { note: "الفشل ما ينقصش النقاط. يُعاد في جولة التصحيح." }
      ) +
      "</div>"
    );
  }

  function blocRetour() {
    if (!S.repondu && !S.fautes.length) return "";
    var m = S.manche;
    var juste = S.juste;
    var texte = juste ? m.retourJuste : m.retourFaux;
    var source = juste
      ? m.preuve.texte + " — " + m.preuve.source
      : "جرّب مرة أخرى: شوف الوثيقة بتمعّن.";

    var preuve =
      juste && S.index >= 0
        ? '<div class="preuve-gagnee">' +
          '<span class="preuve-gagnee__sceau">' + B.ech(m.preuve.code) + "</span>" +
          '<span class="preuve-gagnee__t">بطاقة دليل انضمّت لمجموعتك</span>' +
          "</div>"
        : "";

    return (
      '<div class="retour ' + (juste ? "retour--juste" : "retour--miel retour--faux") + '" role="status" tabindex="-1" data-retour>' +
      '<span class="retour__icone">' +
      (juste ? B.icone("check", 18) : B.icone("boussole", 18)) +
      "</span>" +
      '<div class="retour__corps">' +
      '<p class="retour__texte">' + B.ech(texte) + "</p>" +
      '<p class="retour__source">' + B.ech(source) + "</p>" +
      "</div>" +
      "</div>" +
      preuve
    );
  }

  /* ======================================================================
     5. JOUTE DE CORRECTION
     ====================================================================== */
  function optionsCorrection(m) {
    return m.correctionOptions || m.options || [];
  }

  function vueCorrection() {
    var m = S.manche;
    var pool = optionsCorrection(m);
    var optionJuste = pool.filter(function (o) {
      return o.juste;
    })[0];
    var choixPrecedent =
      (B.Etat.get().onboarding.manches[m.id] || {}).option || null;
    var optionFausse =
      pool.filter(function (o) {
        return o.id === choixPrecedent && !o.juste;
      })[0] ||
      pool.filter(function (o) {
        return !o.juste;
      })[0];

    var deux = [optionFausse, optionJuste];

    return (
      '<div class="vue" data-vue="onboarding">' +
      entete({ sous: "جولة التصحيح · بلا عقاب" }) +
      '<div class="contenu">' +
      '<div class="rangee rangee--entre">' +
      '<span class="mention mention--or">' + B.icone("etincelle", 12) + " استرجاع سريع</span>" +
      '<span class="petit doux">سؤال واحد · 15 ثانية</span>' +
      "</div>" +
      '<p class="consigne" tabindex="-1"><span class="consigne__puce">' + B.icone("boussole", 16) + "</span><span>" +
      B.ech(m.consigne) + "</span></p>" +
      '<div class="planche planche--colonne instrument--enzyme" style="flex:1;min-height:150px">' +
      '<div class="duo" style="grid-template-columns:1fr">' +
      '<div class="doc" style="align-items:flex-start;text-align:start">' +
      '<p class="doc__titre">' + B.ech(m.titre) + "</p>" +
      '<p class="petit doux mt-4">' + B.ech(m.preuve.source) + "</p>" +
      "</div>" +
      "</div>" +
      "</div>" +
      '<div class="options">' +
      deux
        .map(function (o, i) {
          var etat = "";
          if (S.repondu) {
            if (o.juste) etat = "juste";
            else if (S.choix === o.id) etat = "faux";
          }
          return (
            '<button class="btn btn--option" type="button" data-correction="' + o.id + '" data-etat="' + etat + '"' +
            (S.repondu ? " disabled" : "") + ">" +
            '<span class="puce">' + (i === 0 ? "أ" : "ب") + "</span>" +
            '<span class="grandit">' + B.ech(o.texte) + "</span>" +
            (S.repondu && o.juste ? B.icone("check", 18) : "") +
            "</button>"
          );
        })
        .join("") +
      "</div>" +
      '<div id="zone-retour">' + blocRetourCorrection() + "</div>" +
      "</div>" +
      pied(
        {
          action: "correction-suivant",
          label: S.correctionIndex >= S.faits.length - 1 ? "شوف النتيجة" : "التالي",
          desactive: !S.repondu
        },
        { note: "+5 نقاط بونوس على كل تصحيح. الهدف هو الفهم، ماشي اللوم." }
      ) +
      "</div>"
    );
  }

  function blocRetourCorrection() {
    if (!S.repondu) return "";
    var m = S.manche;
    var juste = S.choix === (optionsCorrection(m).filter(function (o) { return o.juste; })[0] || {}).id;
    return (
      '<div class="retour ' + (juste ? "retour--juste" : "retour--faux") + '" role="status" tabindex="-1">' +
      '<span class="retour__icone">' + (juste ? B.icone("check", 18) : B.icone("boussole", 18)) + "</span>" +
      '<div class="retour__corps">' +
      '<p class="retour__texte">' + B.ech(juste ? "هكذا تُحفظ. الخطأ صار دليلًا." : m.retourFaux) + "</p>" +
      '<p class="retour__source">' + B.ech(m.preuve.texte) + "</p>" +
      "</div>" +
      "</div>"
    );
  }

  /* ======================================================================
     6. FIN
     ====================================================================== */
  function vueFin() {
    var etat = B.Etat.get();
    var preuves = B.Etat.preuves();
    var plan = B.Etat.planDeJour();
    var reg = B.Etat.regularite();
    var niveau = B.Etat.niveau();

    var cartes = preuves
      .map(function (p) {
        return (
          '<article class="preuve">' +
          '<span class="preuve__sceau">' + B.ech(p.code) + "</span>" +
          "<div>" +
          '<h3 class="preuve__t">' + B.ech(p.texte) + "</h3>" +
          '<p class="preuve__source">' + B.ech(p.source) + "</p>" +
          "</div>" +
          "</article>"
        );
      })
      .join("");

    return (
      '<div class="vue" data-vue="onboarding">' +
      entete({ sous: "نتيجة التحدّي" }) +
      '<div class="contenu contenu--defile">' +
      '<div class="centre">' +
      '<div style="width:118px;margin-inline:auto">' + B.mascotte("celebrate", 118) + "</div>" +
      '<h1 class="titre-1 mt-4">وصلت.</h1>' +
      '<p class="petit doux">هذا ليس امتحانًا: هذه ثلاث أدلّة صارت عندك.</p>' +
      "</div>" +

      '<div class="carte carte--sauge">' +
      '<div class="rangee rangee--entre">' +
      '<div><p class="oeil">الخبرة</p><p class="titre-2">' + B.chiffres(etat.xp) + " نقطة</p></div>" +
      '<div><p class="oeil">المستوى</p><p class="titre-2">' + B.ech(niveau.nom) + "</p></div>" +
      '<div><p class="oeil">أفضل سلسلة</p><p class="titre-2">×' + B.chiffres(etat.serie.meilleurCombo) + "</p></div>" +
      "</div>" +
      "</div>" +

      '<div class="section-titre">بطاقات الأدلة · ' + B.chiffres(preuves.length) + "</div>" +
      '<div class="preuves">' + cartes + "</div>" +

      '<div class="carte">' +
      '<div class="rangee rangee--entre">' +
      '<span class="carte__titre">خطة اليوم</span>' +
      '<span class="mention">' + B.icone("sablier", 12) + " " + B.chiffres(plan.aujourdhui.length) + " مراجعة</span>" +
      "</div>" +
      '<div class="ligne"><span class="ligne__t"><b>دَين المراجعة</b><span>مسقوف بـ 5 حتى لا يتحوّل غيابك إلى جدار.</span></span>' +
      '<span class="stat"><b>' + B.chiffres(plan.dette) + "</b> مؤجّل</span></div>" +
      '<div class="ligne"><span class="ligne__t"><b>الانتظام</b><span>هدف مرن: ' + reg.objectif + " أيام من " + reg.fenetre + "</span></span>" +
      '<span class="mention ' + (reg.atteint ? "mention--ok" : "") + '">' + reg.jours + "/" + reg.objectif + "</span></div>" +
      "</div>" +

      '<p class="petit doux centre">' + B.ech(B.Donnees.sources.mention) + " · " + B.ech(B.Donnees.sources.noteDroits) + "</p>" +
      "</div>" +
      '<footer class="pied">' +
      '<button class="btn btn--primaire btn--large" type="button" data-action="voir-route">افتح مساري <span aria-hidden="true">←</span></button>' +
      '<button class="btn btn--fantome" type="button" data-action="rejouer">عاود التحدّي</button>' +
      "</footer>" +
      "</div>"
    );
  }

  /* ======================================================================
     7. RENDU + LIAISONS
     ====================================================================== */
  function rendre() {
    var html;
    if (S.etape === "intro") html = vueIntro();
    else if (S.etape === "manche") html = vueManche();
    else if (S.etape === "correction") html = vueCorrection();
    else html = vueFin();

    racine.innerHTML = html;
    document.body.dataset.vue = "onboarding";
    lier();

    if (S.etape === "manche" && !S.repondu) {
      B.focus(B.$("[data-consigne]", racine));
    }
    if (S.repondu) {
      var r = B.$("[data-retour]", racine);
      if (r) B.annonce(r.querySelector(".retour__texte").textContent);
    }
  }

  function lier() {
    detachers.forEach(function (off) {
      off();
    });
    detachers = [];
    detachers.push(
      B.del(racine, "[data-action]", "click", function (e, el) {
      var action = el.getAttribute("data-action");
      B.Son.clic();
      if (action === "commencer") {
        B.Son.glisse();
        S.debutSession = Date.now();
        S.index = 0;
        S.etape = "manche";
        lancerManche(0);
        return;
      }
      if (action === "retour") {
        if (S.etape === "manche" || S.etape === "correction") {
          S.etape = "intro";
          remiseAZero();
          rendre();
        }
        return;
      }
      if (action === "suivant") {
        if (!S.repondu) return;
        B.Son.glisse();
        if (S.index >= B.Donnees.manches.length - 1) {
          demarrerCorrection();
        } else {
          lancerManche(S.index + 1);
        }
        return;
      }
      if (action === "correction-suivant") {
        if (!S.repondu) return;
        B.Son.glisse();
        S.correctionIndex += 1;
        if (S.correctionIndex >= S.faits.length) {
          terminer();
        } else {
          lancerCorrection(S.correctionIndex);
        }
        return;
      }
      if (action === "effacer-ordre") {
        S.ordre = [];
        rendre();
        return;
      }
      if (action === "voir-route") {
        B.Son.valide();
        B.Application.aller("masari");
        return;
      }
      if (action === "rejouer") {
        B.Etat.modifier(function (s) {
          s.onboarding = {
            fait: false,
            manches: {},
            corrections: {},
            preuves: [],
            erreurs: [],
            termineLe: null
          };
          s.serie.combo = 0;
        });
        remiseAZero();
        rendre();
        return;
      }
      })
    );

    detachers.push(
      B.del(racine, "[data-option]", "click", function (e, el) {
        if (S.repondu) return;
        repondre(el.getAttribute("data-option"));
      })
    );

    detachers.push(
      B.del(racine, "[data-correction]", "click", function (e, el) {
        if (S.repondu) return;
        repondreCorrection(el.getAttribute("data-correction"));
      })
    );

    detachers.push(
      B.del(racine, "[data-brique]", "click", function (e, el) {
        if (S.repondu) return;
        ajouterBrique(el.getAttribute("data-brique"));
      })
    );

    detachers.push(
      B.del(racine, "[data-mascotte]", "click", function () {
        B.Son.pop();
        var zone = B.$("[data-mascotte]", racine);
        if (!zone) return;
        var etat = zone.getAttribute("data-mascotte") === "happy" ? "wink" : "happy";
        zone.setAttribute("data-mascotte", etat);
        zone.innerHTML = B.mascotte(etat, 176);
      })
    );
  }

  /* ======================================================================
     8. LOGIQUE DES MANCHES
     ====================================================================== */
  function lancerManche(index) {
    S.index = index;
    S.manche = B.Donnees.manches[index];
    S.repondu = false;
    S.juste = false;
    S.essais = 0;
    S.choix = null;
    S.fautes = [];
    S.ordre = [];
    S.debutManche = Date.now();
    S.etape = "manche";
    rendre();
  }

  function repondre(optionId) {
    var m = S.manche;
    var option = m.options.filter(function (o) {
      return o.id === optionId;
    })[0];
    if (!option) return;

    S.essais += 1;
    var secondes = (Date.now() - S.debutManche) / 1000;

    if (option.juste) {
      S.repondu = true;
      S.juste = true;
      S.choix = option.id;
      var resultat = B.Etat.enregistrerManche(m, {
        juste: true,
        essais: S.essais,
        optionId: option.id,
        secondes: secondes,
        timed: false
      });
      if (S.essais === 1) B.Son.ding(B.Etat.get().serie.combo);
      else B.Son.valide();
      B.haptique(S.essais === 1 ? 18 : 12);
      B.confettis(S.essais === 1 ? 12 : 6);
      majXp();
      rendre();
      B.focus(B.$("[data-retour]", racine));
      return;
    }

    B.Son.doux();
    B.haptique([12, 40, 12]);
    if (S.essais === 1) {
      S.fautes.push(option.id);
      B.Etat.noterErreur(m.id);
      rendre();
      var r = B.$("[data-retour]", racine);
      if (r) B.focus(r);
      B.annonce("ما زال. جرّب مرة أخرى.");
      return;
    }

    /* Deuxième erreur : on révèle sans punir et on enregistre. */
    S.repondu = true;
    S.juste = false;
    S.choix = option.id;
    B.Etat.enregistrerManche(m, {
      juste: false,
      essais: S.essais,
      optionId: option.id,
      secondes: secondes,
      timed: false
    });
    rendre();
    B.focus(B.$("[data-retour]", racine));
  }

  function ajouterBrique(id) {
    if (S.ordre.length >= 3) return;
    S.ordre.push(id);
    B.Son.pop();
    B.haptique(10);

    if (S.ordre.length < 3) {
      rendre();
      return;
    }

    var m = S.manche;
    var attendu = m.items
      .slice()
      .sort(function (a, b) {
        return a.ordre - b.ordre;
      })
      .map(function (x) {
        return x.id;
      });
    var correct = attendu.every(function (id, i) {
      return S.ordre[i] === id;
    });

    S.essais += 1;
    var secondes = (Date.now() - S.debutManche) / 1000;

    if (correct) {
      S.repondu = true;
      S.juste = true;
      B.Etat.enregistrerManche(m, {
        juste: true,
        essais: S.essais,
        optionId: "ordre",
        secondes: secondes,
        timed: false
      });
      B.Son.fanfare();
      B.haptique([16, 30, 16]);
      B.confettis(14);
      majXp();
      rendre();
      B.focus(B.$("[data-retour]", racine));
      return;
    }

    B.Son.doux();
    B.haptique([12, 40, 12]);
    if (S.essais === 1) {
      B.Etat.noterErreur(m.id);
      var planche = B.$("[data-planche='ordre']", racine);
      if (planche) {
        planche.classList.add("secousse");
        window.setTimeout(function () {
          planche.classList.remove("secousse");
        }, 360);
      }
      B.toast("ماشي هذا الترتيب. ابدأ من النواة.");
      window.setTimeout(function () {
        S.ordre = [];
        rendre();
        var r = B.$("[data-retour]", racine);
        if (r) B.focus(r);
      }, 620);
      return;
    }

    S.repondu = true;
    S.juste = false;
    S.ordre = attendu;
    B.Etat.enregistrerManche(m, {
      juste: false,
      essais: S.essais,
      optionId: "ordre",
      secondes: secondes,
      timed: false
    });
    rendre();
    B.focus(B.$("[data-retour]", racine));
  }

  /* ======================================================================
     9. JOUTE DE CORRECTION
     ====================================================================== */
  function demarrerCorrection() {
    var erreurs = B.Etat.get().onboarding.erreurs || [];
    S.faits = erreurs.filter(function (id, i) {
      return erreurs.indexOf(id) === i && B.Donnees.mancheParId[id];
    });
    if (!S.faits.length) {
      terminer();
      return;
    }
    S.correctionIndex = 0;
    lancerCorrection(0);
  }

  function lancerCorrection(index) {
    S.correctionIndex = index;
    S.manche = B.Donnees.mancheParId[S.faits[index]];
    S.repondu = false;
    S.juste = false;
    S.choix = null;
    S.essais = 0;
    S.debutManche = Date.now();
    S.etape = "correction";
    rendre();
  }

  function repondreCorrection(optionId) {
    if (S.repondu) return;
    var m = S.manche;
    var option = optionsCorrection(m).filter(function (o) {
      return o.id === optionId;
    })[0];
    if (!option) return;

    S.choix = optionId;
    S.repondu = true;

    if (option.juste) {
      B.Etat.ajouterXp(5);
      B.Son.valide();
      B.haptique(14);
      B.confettis(6);
      majXp();
      B.Etat.modifier(function (s) {
        s.onboarding.corrections[m.id] = true;
      });
      B.annonce("صحيح. ربحت 5 نقاط.");
    } else {
      B.Son.doux();
      B.haptique(10);
      B.annonce("الجواب الصحيح ظاهر الآن. بلا عقاب.");
    }

    rendre();
    B.focus(B.$("[data-retour]", racine));
  }

  function terminer() {
    S.etape = "fin";
    var secondes = S.debutSession ? (Date.now() - S.debutSession) / 1000 : 0;
    B.Etat.terminerOnboarding(secondes);
    B.Son.fanfare();
    B.confettis(22);
    rendre();
    B.annonce("انتهى التحدّي. عندك ثلاث بطاقات أدلة.");
    if (B.Application && B.Application.majOnglets) B.Application.majOnglets();
  }

  /* ======================================================================
     10. CONTRAT D'ÉCRAN
     ====================================================================== */
  B.Ecrans = B.Ecrans || {};

  B.Ecrans.onboarding = {
    id: "onboarding",
    titre: "التحدّي الأول",
    rendre: function (conteneur) {
      racine = conteneur;
      if (!S.debutSession) S.debutSession = Date.now();
      rendre();
    },
    demonter: function () {
      detachers.forEach(function (off) {
        off();
      });
      detachers = [];
      racine = null;
    },
    reinitialiser: function () {
      remiseAZero();
      if (racine) rendre();
    }
  };
})();
