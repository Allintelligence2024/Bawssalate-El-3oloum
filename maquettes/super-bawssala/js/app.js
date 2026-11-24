/* ==========================================================================
   بوصلة العلوم · النسخة الشاملة
   app.js — routeur (onboarding · مساري · كويست) + chrome partagé (son, onglets,
   retour) + pupitre d'inspection + simulations + démarrage.
   ========================================================================== */
(function () {
  "use strict";

  var B = window.Bawssala;
  var ecran = document.getElementById("ecran");
  var courant = null;
  var routeActuelle = "masari";

  var ONGLETS = {
    masari: { libelle: "مساري", phase: 2, disponible: true },
    boussole: { libelle: "الباك", phase: 4, disponible: true },
    tadribat: { libelle: "فخاخ", phase: 5, disponible: true },
    ana: { libelle: "أنا", phase: 6, disponible: true }
  };

  /* ======================================================================
     1. ROUTAGE
     ====================================================================== */
  function ecranDe(nom) {
    if (nom === "onboarding") return B.Ecrans.onboarding;
    if (nom === "quete") return B.Ecrans.game123;
    if (nom === "bac" || nom === "boussole") return B.Ecrans.bac;
    if (nom === "fakh") return B.Ecrans.fakh;
    if (nom === "ana") return B.Ecrans.ana;
    return B.Ecrans.masari;
  }

  function aller(nom, options) {
    var o = options || {};
    if (nom === "roadmap") nom = "masari";
    if (nom === "boussole") nom = "bac";
    /* L'onglet « فخاخ » (id historique tadribat) ouvre la phase 5. */
    if (nom === "tadribat") nom = "fakh";
    var suite = ecranDe(nom);
    if (!suite) return;

    try {
      if (courant && courant !== suite && courant.demonter) courant.demonter();
      courant = suite;
      routeActuelle = nom;

      /* L'ancre #bac ne sert qu'à l'ouverture : on la retire dès qu'on change
         d'écran, pour ne pas y revenir à chaque rechargement. */
      if (nom !== "bac" && nom !== "fakh" && nom !== "ana" && window.location.hash && window.history && window.history.replaceState) {
        try {
          window.history.replaceState(null, "", window.location.pathname + window.location.search);
        } catch (e) {
          /* ignoré */
        }
      }

      suite.rendre(ecran);
      document.body.dataset.vue = nom;
      B.annonce(suite.titre || nom);
    } catch (e) {
      B.erreurFatale(e);
      return;
    }

    if (o.focusPhase) {
      var cible = ecran.querySelector('[data-phase="' + o.focusPhase + '"]');
      if (cible) {
        cible.setAttribute("data-focus", "oui");
        try {
          cible.scrollIntoView({ block: "center", behavior: B.mouvementReduit() ? "auto" : "smooth" });
        } catch (e) {
          /* ignoré */
        }
      }
    }
    majChrome();
  }

  /** Re-dessine l'écran courant sans perdre son état interne. */
  function rafraichir() {
    try {
      var suite = ecranDe(routeActuelle);
      if (suite && suite.rendre && ecran) suite.rendre(ecran);
      majChrome();
    } catch (e) {
      B.erreurFatale(e);
    }
  }

  function majChrome() {
    if (!ecran) return;
    var xp = B.Etat.get().xp;
    B.$$("[data-xp='1']", ecran).forEach(function (el) {
      el.textContent = B.chiffres(xp);
    });
    B.$$("[data-son]", ecran).forEach(function (el) {
      el.setAttribute("aria-pressed", B.Son.estMuet() ? "false" : "true");
      el.innerHTML = B.icone(B.Son.estMuet() ? "muet" : "son", 18);
    });
    majBoutonSon();
  }

  /* ======================================================================
     2. CHROME PARTAGÉ — branché une seule fois sur #ecran
     ====================================================================== */
  function brancherChrome() {
    if (!ecran) return;

    B.del(ecran, "[data-son]", "click", function () {
      var muet = B.Son.basculer();
      B.Etat.modifier(function (s) {
        s.reglages.son = !muet;
      });
      B.annonce(muet ? "الصوت مسكوت" : "الصوت شغّال");
      rafraichir();
    });

    B.del(ecran, "[data-onglet]", "click", function (ev, el) {
      var id = el.getAttribute("data-onglet");
      var cible = ONGLETS[id];
      if (!cible) return;
      B.Son.clic();
      if (cible.disponible) {
        aller(id);
        return;
      }
      B.toast("«" + cible.libelle + "» تُبنى في المرحلة " + cible.phase + ". هذه خارطتها.", true);
      aller("masari", { focusPhase: cible.phase });
    });

    B.del(ecran, "[data-retour]", "click", function (ev, el) {
      /* Seuls les vrais boutons/liens naviguent : les panneaux de retour
         (div) portent aussi data-retour mais ne doivent rien déclencher. */
      if (el.tagName !== "BUTTON" && el.tagName !== "A") return;
      B.Son.clic();
      aller(el.getAttribute("data-retour") || "masari");
    });
  }

  /* ======================================================================
     3. PUPITRE
     ====================================================================== */
  var dbg = { onglet: "etat", arme: false, minuteur: null };

  function appliquerTheme() {
    var etat = B.Etat.get();
    var theme = etat.reglages.theme === "sombre" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    var btn = document.getElementById("dbg-theme");
    if (btn) btn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
  }

  function majBoutonSon() {
    var btn = document.getElementById("dbg-son");
    if (!btn) return;
    var actif = !B.Son.estMuet();
    btn.setAttribute("aria-pressed", actif ? "true" : "false");
    btn.textContent = actif ? "♪ الصوت شغّال" : "♪ الصوت مسكوت";
  }

  function jsonEtat() {
    var etat = B.Etat.get();
    if (dbg.onglet === "kafaa") {
      return JSON.stringify(B.Etat.vueKafaa(), null, 2);
    }
    if (dbg.onglet === "events") {
      return JSON.stringify(etat.events.slice(0, 8), null, 2);
    }
    var copie = JSON.parse(JSON.stringify(etat));
    copie.events = "[" + etat.events.length + " events]";
    return JSON.stringify(copie, null, 2);
  }

  function majJSON() {
    var zone = document.getElementById("dbg-json");
    if (!zone) return;
    zone.textContent = jsonEtat();
  }

  function brancherPupitre() {
    var btnTheme = document.getElementById("dbg-theme");
    var btnSon = document.getElementById("dbg-son");
    var btnAbsence = document.getElementById("dbg-absence");
    var btnBac = document.getElementById("dbg-bac");
    var btnReussi = document.getElementById("dbg-reussi");
    var btnReset = document.getElementById("dbg-reset");
    var btnPupitre = document.getElementById("bouton-pupitre");
    var pupitre = document.getElementById("pupitre");
    var btnFermer = document.getElementById("pupitre-fermer");

    if (btnTheme) {
      btnTheme.addEventListener("click", function () {
        B.Etat.modifier(function (s) {
          s.reglages.theme = s.reglages.theme === "sombre" ? "clair" : "sombre";
        });
        appliquerTheme();
        B.Son.clic();
      });
    }

    if (btnSon) {
      btnSon.addEventListener("click", function () {
        var muet = B.Son.basculer();
        B.Etat.modifier(function (s) {
          s.reglages.son = !muet;
        });
        majBoutonSon();
        rafraichir();
        if (!muet) B.Son.pop();
      });
    }

    if (btnAbsence) {
      btnAbsence.addEventListener("click", function () {
        var plan = B.Etat.simulerAbsence(21);
        B.Son.doux();
        B.toast(
          "غياب 21 يومًا: " + B.chiffres(plan.aujourdhui.length) +
            " مراجعات اليوم، " + B.chiffres(plan.dette) + " مؤجّلة.",
          true
        );
        rafraichir();
        majJSON();
      });
    }

    if (btnBac) {
      btnBac.addEventListener("click", function () {
        B.Etat.simulerBac("naqissa");
        B.Son.doux();
        B.toast("محاولة ناقصة: C7 وC5 يطلبان مراجعة غدًا.", true);
        rafraichir();
        majJSON();
      });
    }

    if (btnReussi) {
      btnReussi.addEventListener("click", function () {
        B.Etat.simulerBac("reussie");
        B.Son.valide();
        B.toast("محاولة ناجحة: الكفاءات ترتفع بلطف، بلا مبالغة.", true);
        rafraichir();
        majJSON();
      });
    }

    if (btnReset) {
      btnReset.addEventListener("click", function () {
        if (!dbg.arme) {
          dbg.arme = true;
          btnReset.textContent = "↺ تأكيد التصفير؟";
          window.clearTimeout(dbg.minuteur);
          dbg.minuteur = window.setTimeout(function () {
            dbg.arme = false;
            btnReset.textContent = "↺ تصفير كامل";
          }, 3200);
          return;
        }
        dbg.arme = false;
        btnReset.textContent = "↺ تصفير كامل";
        B.Etat.reinitialiser();
        if (B.Ecrans.onboarding.reinitialiser) B.Ecrans.onboarding.reinitialiser();
        if (B.Ecrans.masari.reinitialiser) B.Ecrans.masari.reinitialiser();
        if (B.Ecrans.game123.reinitialiser) B.Ecrans.game123.reinitialiser();
        if (B.Ecrans.bac.reinitialiser) B.Ecrans.bac.reinitialiser();
        if (B.Ecrans.fakh.reinitialiser) B.Ecrans.fakh.reinitialiser();
        if (B.Ecrans.ana.reinitialiser) B.Ecrans.ana.reinitialiser();
        appliquerTheme();
        B.Son.reglerMuet(!B.Etat.get().reglages.son);
        aller("onboarding");
        B.toast("تصفير كامل. رجعنا للبداية.");
      });
    }

    ["etat", "kafaa", "events"].forEach(function (id) {
      var tab = document.getElementById("dbg-tab-" + id);
      if (!tab) return;
      tab.addEventListener("click", function () {
        dbg.onglet = id;
        ["etat", "kafaa", "events"].forEach(function (autre) {
          var t = document.getElementById("dbg-tab-" + autre);
          if (t) t.setAttribute("aria-selected", autre === id ? "true" : "false");
        });
        majJSON();
      });
    });

    if (btnPupitre && pupitre) {
      btnPupitre.addEventListener("click", function () {
        var ouvert = pupitre.classList.toggle("pupitre--ouvert");
        btnPupitre.setAttribute("aria-expanded", ouvert ? "true" : "false");
      });
    }
    if (btnFermer && pupitre) {
      btnFermer.addEventListener("click", function () {
        pupitre.classList.remove("pupitre--ouvert");
        if (btnPupitre) btnPupitre.setAttribute("aria-expanded", "false");
      });
    }
  }

  /* ======================================================================
     4. DÉMARRAGE
     ====================================================================== */
  function demarrer() {
    B.Etat.initialiser();
    appliquerTheme();
    B.Son.reglerMuet(!B.Etat.get().reglages.son);

    B.ajusteCadre();
    window.addEventListener("resize", B.ajusteCadre);
    window.addEventListener("orientationchange", B.ajusteCadre);

    var debloquer = function () {
      B.Son.debloquer();
      document.removeEventListener("pointerdown", debloquer);
      document.removeEventListener("keydown", debloquer);
    };
    document.addEventListener("pointerdown", debloquer);
    document.addEventListener("keydown", debloquer);

    brancherChrome();
    brancherPupitre();

    B.Etat.abonner(function () {
      majChrome();
      majJSON();
    });

    /* Accès direct partageable : …/#bac ouvre le mode الباك même sans onboarding.
       Utile pour vérifier une phase sans traverser tout le parcours. */
    var ancre = String(window.location.hash || "").replace(/^#\/?/, "").toLowerCase();
    var params = null;
    try {
      params = new URLSearchParams(window.location.search || "");
    } catch (e) {
      params = null;
    }
    if (params && params.get("reset") === "1") {
      B.Etat.reinitialiser();
    }
    var demandee = ((params && params.get("vue")) || ancre || "").toLowerCase();
    if (demandee === "bac" || demandee === "boussole") {
      aller("bac");
    } else if (demandee === "fakh" || demandee === "tadribat") {
      aller("fakh");
    } else if (demandee === "ana") {
      aller("ana");
    } else {
      aller(B.Etat.get().onboarding.fait ? "masari" : "onboarding");
    }
    majJSON();
  }

  B.Application = {
    aller: aller,
    rafraichir: rafraichir,
    vue: function () {
      return routeActuelle;
    },
    majOnglets: function () {
      majChrome();
    }
  };

  B.pret(function () {
    try {
      demarrer();
    } catch (e) {
      B.erreurFatale(e);
    }
  });
})();
