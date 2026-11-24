/* ==========================================================================
   بوصلة العلوم · النسخة الشاملة
   namespace.js — window.Bawssala : helpers DOM/ARIA, icônes SVG, dates.
   Aucun framework, aucun module : script classique compatible file://.
   ========================================================================== */
(function () {
  "use strict";

  var B = (window.Bawssala = window.Bawssala || {});

  B.version = "1.4.0-phase-4";
  B.nom = "بوصلة العلوم";
  B.sousTitre = "النسخة الشاملة";

  /* ------------------------------------------------------------------ DOM */
  B.$ = function (sel, racine) {
    return (racine || document).querySelector(sel);
  };

  B.$$ = function (sel, racine) {
    return Array.prototype.slice.call((racine || document).querySelectorAll(sel));
  };

  /** Crée un nœud depuis une chaîne HTML (un seul élément racine attendu). */
  B.html = function (chaine) {
    var gabarit = document.createElement("template");
    gabarit.innerHTML = String(chaine).trim();
    return gabarit.content.firstElementChild;
  };

  /**
   * Échappe une chaîne pour l'insérer dans du HTML.
   *
   * Bidi : on ne réécrit jamais la ponctuation ici (les tests comparent le DOM
   * au contenu). Les rares phrases qui finissaient sur un mot latin suivi d'un
   * point ont été réécrites dans les données (§ voir plus bas).
   */
  B.ech = function (valeur) {
    return String(valeur == null ? "" : valeur)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  };

  B.on = function (cible, evenement, geste, options) {
    if (!cible) return function () {};
    cible.addEventListener(evenement, geste, options);
    return function () {
      cible.removeEventListener(evenement, geste, options);
    };
  };

  /** Délégation : geste(event, elementCorrespondant). Renvoie un désabonnement. */
  B.del = function (racine, selecteur, evenement, geste) {
    if (!racine) return function () {};
    var ecouteur = function (e) {
      var cible = e.target instanceof Element ? e.target.closest(selecteur) : null;
      if (cible && racine.contains(cible)) geste(e, cible);
    };
    racine.addEventListener(evenement, ecouteur);
    return function () {
      racine.removeEventListener(evenement, ecouteur);
    };
  };

  B.focus = function (element) {
    if (!element) return;
    try {
      element.focus({ preventScroll: true });
    } catch (e) {
      element.focus();
    }
  };

  /** Annonce discrète pour les lecteurs d'écran. */
  B.annonce = function (texte) {
    var zone = document.getElementById("annonce");
    if (!zone) return;
    zone.textContent = "";
    window.setTimeout(function () {
      zone.textContent = texte;
    }, 40);
  };

  /* --------------------------------------------------------------- Outils */
  B.uid = function (prefixe) {
    return (prefixe || "id") + "-" + Math.random().toString(36).slice(2, 9);
  };

  B.clamp = function (v, min, max) {
    return Math.max(min, Math.min(max, v));
  };

  B.arrondi = function (v, decimales) {
    var f = Math.pow(10, decimales == null ? 2 : decimales);
    return Math.round(v * f) / f;
  };

  B.chiffres = function (n) {
    try {
      return new Intl.NumberFormat("en-US").format(n);
    } catch (e) {
      return String(n);
    }
  };

  /* ---------------------------------------------------------------- Dates */
  B.iso = function (date) {
    var d = date || new Date();
    return (
      d.getFullYear() +
      "-" +
      String(d.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(d.getDate()).padStart(2, "0")
    );
  };

  B.aujourdhui = function () {
    return B.iso(new Date());
  };

  B.ajouteJours = function (iso, jours) {
    var d = new Date(iso + "T00:00:00Z");
    d.setUTCDate(d.getUTCDate() + jours);
    return d.toISOString().slice(0, 10);
  };

  B.joursEntre = function (a, b) {
    var da = new Date(a + "T00:00:00Z").getTime();
    var db = new Date(b + "T00:00:00Z").getTime();
    return Math.round((da - db) / 86400000);
  };

  B.dateCourte = function (iso) {
    if (!iso) return "—";
    var brut = String(iso);
    var d = new Date(brut.length > 10 ? brut : brut + "T00:00:00");
    try {
      return new Intl.DateTimeFormat("ar-DZ", { day: "numeric", month: "long" }).format(d);
    } catch (e) {
      return iso;
    }
  };

  /* --------------------------------------------------------- Mouvement/OS */
  B.mouvementReduit = function () {
    try {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (e) {
      return false;
    }
  };

  B.estMobile = function () {
    try {
      if (typeof window.matchMedia === "function") {
        return window.matchMedia("(max-width: 560px)").matches;
      }
    } catch (e) {
      /* navigateur atypique : on retombe sur la largeur */
    }
    return window.innerWidth <= 560;
  };

  /** Ajuste l'échelle du cadre 390×844 pour les écrans desktop courts. */
  B.ajusteCadre = function () {
    var appareil = document.getElementById("appareil");
    if (!appareil) return;
    try {
      if (B.estMobile()) {
        appareil.style.removeProperty("--echelle");
        return;
      }
      var dispoH = window.innerHeight - 48;
      var dispoL = window.innerWidth - 380; // place pour le pupitre
      var echelle = Math.min(1, dispoH / 844, Math.max(0.55, dispoL / 390));
      appareil.style.setProperty("--echelle", String(Math.max(0.55, echelle)));
    } catch (e) {
      /* le cadre garde son échelle par défaut : jamais bloquant */
    }
  };

  /** Panneau d'erreur lisible : l'utilisateur ne voit jamais un écran vide. */
  B.erreurFatale = function (err) {
    var zone = document.getElementById("ecran");
    if (!zone) return;
    var message = "";
    try {
      message = (err && (err.stack || err.message)) || String(err);
    } catch (e) {
      message = "خطأ غير معروف";
    }
    zone.innerHTML =
      '<div class="vue" data-vue="panne">' +
      '<div class="contenu contenu--defile">' +
      '<div class="carte carte--or mt-12">' +
      '<div class="carte__tete"><span class="carte__titre">ما قدرناش نعرضو الشاشة</span>' +
      '<span class="mention mention--or">خطأ</span></div>' +
      '<p class="petit">عاود التحميل. إذا بقى نفس الشيء، صفّر الحالة.</p>' +
      '<pre class="panne__trace">' + B.ech(String(message).slice(0, 700)) + "</pre>" +
      '<button class="btn btn--secondaire mt-8" type="button" data-panne="reload">عاود التحميل</button>' +
      '<button class="btn btn--fantome mt-4" type="button" data-panne="reset">صفّر الحالة</button>' +
      "</div></div></div>";
    var recharger = B.$('[data-panne="reload"]', zone);
    if (recharger) {
      recharger.addEventListener("click", function () {
        window.location.reload();
      });
    }
    var remettre = B.$('[data-panne="reset"]', zone);
    if (remettre) {
      remettre.addEventListener("click", function () {
        try {
          window.localStorage.removeItem("bawssala.super.v1");
        } catch (e) {
          /* stockage déjà indisponible */
        }
        window.location.reload();
      });
    }
    document.body.dataset.vue = "panne";
  };

  /* -------------------------------------------------------------- Icônes  */
  var TRACES = {
    boussole:
      '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/><circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none"/>',
    etincelle: '<path d="M12 3.5 13.6 9 19 10.6 13.6 12.2 12 17.7 10.4 12.2 5 10.6 10.4 9z"/>',
    check: '<path d="m4.5 12.5 4.5 4.5L19.5 6.5"/>',
    croix: '<path d="M6 6l12 12M18 6L6 18"/>',
    fleche: '<path d="M19 12H5m6-6-6 6 6 6"/>',
    son:
      '<path d="M5 10v4h2l3 2.5v-9L7 10H5z"/><path d="M14.5 9.5a4 4 0 0 1 0 5M17 7.5a7 7 0 0 1 0 9"/>',
    muet:
      '<path d="M5 10v4h2l3 2.5v-9L7 10H5z"/><path d="m15 10 4 4m0-4-4 4"/>',
    flamme: '<path d="M12 3c3 4 5 6 5 9a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3 1-6 1-8z"/>',
    bouclier: '<path d="M12 3.5 19 6v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/><path d="m9 12 2 2 4-4"/>',
    cible: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>',
    doc: '<path d="M7 3.5h6l4 4v13H7z"/><path d="M13 3.5v4h4M9.5 12h5M9.5 15.5h5"/>',
    livre: '<path d="M4 5.5c3-1 5.5-1 8 0v14c-2.5-1-5-1-8 0z"/><path d="M20 5.5c-3-1-5.5-1-8 0v14c2.5-1 5-1 8 0z"/>',
    halteres: '<path d="M4 9v6M7 7.5v9M17 7.5v9M20 9v6M7 12h10"/>',
    profil: '<circle cx="12" cy="8.5" r="3.5"/><path d="M5.5 20c.8-3.6 3.3-5.5 6.5-5.5s5.7 1.9 6.5 5.5"/>',
    cle: '<circle cx="8" cy="8" r="3.5"/><path d="m10.5 10.5 8 8m-2.5-2.5 2-2m-4 0 2-2"/>',
    sablier: '<path d="M7 3.5h10M7 20.5h10M8 3.5v3c0 2 4 3.5 4 5.5s-4 3.5-4 5.5v3M16 3.5v3c0 2-4 3.5-4 5.5s4 3.5 4 5.5v3"/>',
    crayon: '<path d="m4.5 19.5 1-4.5L16 4.5l3.5 3.5L9 18.5z"/><path d="m14 6.5 3.5 3.5"/>',
    tourner: '<path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 4v4.5h-4.5"/>',
    warn: '<path d="M12 4 21 19H3z"/><path d="M12 9.5v4.5M12 17h.01"/>'
  };

  /** Icône SVG inline (stroke = currentColor). */
  B.icone = function (nom, taille) {
    var t = taille || 18;
    var trace = TRACES[nom] || TRACES.etincelle;
    return (
      '<svg width="' + t + '" height="' + t + '" viewBox="0 0 24 24" fill="none" ' +
      'stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" ' +
      'aria-hidden="true" focusable="false">' + trace + "</svg>"
    );
  };

  /* ------------------------------------------------------- Mascotte/bulle  */
  /** Bulle de dialogue de القبطان مفتاح. */
  B.bulle = function (texte, or) {
    return (
      '<div class="bulle' + (or ? " bulle--or" : "") + '">' + B.ech(texte) + "</div>"
    );
  };

  /* ------------------------------------------------------------- Démarrage */
  B.pret = function (geste) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", geste, { once: true });
    } else {
      geste();
    }
  };

  /* ======================================================================
     CHROME PARTAGÉ — barre haute et onglets (branchés une seule fois par app.js)
     ====================================================================== */
  B.UI = {
    pastilleXp: function () {
      return (
        '<span class="pastille" aria-label="نقاط الخبرة">' +
        B.icone("etincelle", 14) +
        '<span data-xp="1">' + B.chiffres(B.Etat.get().xp) + "</span></span>"
      );
    },

    entete: function (sous, options) {
      var o = options || {};
      return (
        '<header class="barre">' +
        '<div class="barre__marque">' +
        (o.retour
          ? '<button class="btn-icone" type="button" data-retour="' + B.ech(o.retour) + '" aria-label="رجوع">←</button>'
          : '<span class="barre__logo">' + B.icone("boussole", 18) + "</span>") +
        "<div>" +
        '<p class="barre__nom">' + B.ech(o.titre || "بوصلة العلوم") + "</p>" +
        '<p class="barre__sous">' + B.ech(sous || "") + "</p>" +
        "</div></div>" +
        '<div class="barre__actions">' +
        (o.xp === false ? "" : B.UI.pastilleXp()) +
        '<button class="btn-icone" type="button" data-son aria-pressed="' +
        (B.Son.estMuet() ? "false" : "true") + '" aria-label="الصوت">' +
        B.icone(B.Son.estMuet() ? "muet" : "son", 18) + "</button>" +
        "</div></header>"
      );
    },

    onglets: function (actif) {
      var liste = [
        { id: "masari", nom: "مساري", icone: "boussole", pret: true },
        { id: "boussole", nom: "الباك", icone: "doc", pret: true },
        { id: "tadribat", nom: "فخاخ", icone: "cible", pret: true },
        { id: "ana", nom: "أنا", icone: "profil", pret: true }
      ];
      return (
        '<nav class="onglets" role="tablist" aria-label="أقسام التطبيق">' +
        liste
          .map(function (o) {
            return (
              '<button class="onglet" role="tab" type="button" data-onglet="' + o.id + '" ' +
              'aria-selected="' + (actif === o.id ? "true" : "false") + '"' +
              (o.pret ? "" : ' aria-disabled="true" title="تُبنى في مرحلة لاحقة"') + ">" +
              B.icone(o.icone, 20) +
              "<span>" + B.ech(o.nom) + "</span>" +
              (o.pret ? "" : '<span class="onglet__bientot">قريبًا</span>') +
              "</button>"
            );
          })
          .join("") +
        "</nav>"
      );
    }
  };
})();
