/* ==========================================================================
   بوصلة العلوم · النسخة الشاملة
   state-engine.js — persistance locale, moteur kafaa (writeBack), SM-2,
   planDeJour plafonné, régularité souple, événements v1, simulations.
   Aucun score chiffré sur vingt n'est calculé ni stocké ici (contrat anti-anxiété).
   ========================================================================== */
(function () {
  "use strict";

  var B = window.Bawssala;
  var CLE = "bawssala.super.v1";
  var VERSION = 1;
  var MAX_EVENTS = 40;

  var etat = null;
  var abonnes = [];
  var stockageOk = true;

  /* ======================================================================
     1. ÉTAT PAR DÉFAUT
     ====================================================================== */
  function kafaaVide() {
    var sortie = {};
    B.Donnees.competences.forEach(function (c) {
      sortie[c.id] = { niveau: 0, preuves: 0, maj: null };
    });
    return sortie;
  }

  function cartesInitiales() {
    var auj = B.aujourdhui();
    return B.Donnees.cartesDepart.map(function (c) {
      return {
        id: c.id,
        famille: c.famille,
        titre: c.titre,
        repere: c.repere,
        dueAt: B.ajouteJours(auj, c.dueAt),
        intervalle: c.intervalle,
        facilite: c.facilite,
        repetitions: c.repetitions
      };
    });
  }

  function defauts() {
    return {
      version: VERSION,
      creeLe: new Date().toISOString(),
      majLe: new Date().toISOString(),
      reglages: { theme: "clair", son: true },
      xp: 0,
      serie: { combo: 0, meilleurCombo: 0 },
      onboarding: {
        fait: false,
        manches: {},
        corrections: {},
        preuves: [],
        erreurs: [],
        termineLe: null
      },
      quetes: {},
      preuves: [],
      lecons: {},
      bac: {
        id: null,
        etapes: {},
        papier: "",
        fini: false,
        bonus: false,
        vu: false,
        le: null
      },
      fakh: {
        id: null,
        vu: false,
        reponses: {},
        fini: false,
        bonus: false,
        debut: null,
        temps: 0,
        le: null
      },
      kafaa: kafaaVide(),
      srs: { cartes: cartesInitiales(), revisions: 0 },
      regularite: { jours: [], boucliers: 0 },
      events: [],
      journal: []
    };
  }

  /* ======================================================================
     2. CHARGEMENT / NORMALISATION
     ====================================================================== */
  function nombre(v, defaut) {
    return typeof v === "number" && isFinite(v) ? v : defaut;
  }

  function texte(v, defaut) {
    return typeof v === "string" && v.length ? v : defaut;
  }

  function normaliser(brut) {
    var base = defauts();
    var s = brut && typeof brut === "object" ? brut : {};

    base.creeLe = texte(s.creeLe, base.creeLe);
    base.majLe = texte(s.majLe, base.majLe);
    base.xp = Math.max(0, nombre(s.xp, 0));

    if (s.reglages && typeof s.reglages === "object") {
      base.reglages.theme = s.reglages.theme === "sombre" ? "sombre" : "clair";
      base.reglages.son = s.reglages.son !== false;
    }

    if (s.serie && typeof s.serie === "object") {
      base.serie.combo = Math.max(0, nombre(s.serie.combo, 0));
      base.serie.meilleurCombo = Math.max(0, nombre(s.serie.meilleurCombo, 0));
    }

    if (s.onboarding && typeof s.onboarding === "object") {
      base.onboarding.fait = Boolean(s.onboarding.fait);
      base.onboarding.manches =
        s.onboarding.manches && typeof s.onboarding.manches === "object"
          ? s.onboarding.manches
          : {};
      base.onboarding.corrections =
        s.onboarding.corrections && typeof s.onboarding.corrections === "object"
          ? s.onboarding.corrections
          : {};
      base.onboarding.preuves = Array.isArray(s.onboarding.preuves)
        ? s.onboarding.preuves.filter(function (x) {
            return typeof x === "string";
          })
        : [];
      base.onboarding.erreurs = Array.isArray(s.onboarding.erreurs)
        ? s.onboarding.erreurs.filter(function (x) {
            return typeof x === "string";
          })
        : [];
      base.onboarding.termineLe = texte(s.onboarding.termineLe, null);
    }

    base.preuves = Array.isArray(s.preuves)
      ? s.preuves.filter(function (x) {
          return typeof x === "string" && B.Donnees.preuveParCode[x];
        })
      : [];

    if (s.lecons && typeof s.lecons === "object") {
      Object.keys(s.lecons).forEach(function (id) {
        if (!B.Donnees.queteParId[id]) return;
        base.lecons[id] = {
          le: texte((s.lecons[id] || {}).le,
            null)
        };
      });
    }

    if (s.quetes && typeof s.quetes === "object") {
      Object.keys(s.quetes).forEach(function (id) {
        if (!B.Donnees.queteParId[id]) return;
        var q = s.quetes[id] || {};
        var etapes = {};
        if (q.etapes && typeof q.etapes === "object") {
          Object.keys(q.etapes).forEach(function (eid) {
            var e = q.etapes[eid] || {};
            etapes[eid] = {
              juste: Boolean(e.juste),
              essais: Math.max(0, Math.floor(nombre(e.essais, 0))),
              option: texte(e.option, null),
              secondes: Math.max(0, Math.floor(nombre(e.secondes, 0)))
            };
          });
        }
        var corrections = {};
        if (q.corrections && typeof q.corrections === "object") {
          Object.keys(q.corrections).forEach(function (eid) {
            corrections[eid] = q.corrections[eid] === "juste" ? "juste" : "revele";
          });
        }
        base.quetes[id] = {
          fait: Boolean(q.fait),
          etapes: etapes,
          corrections: corrections,
          le: texte(q.le, null)
        };
      });
    }

    if (s.bac && typeof s.bac === "object") {
      var b = s.bac;
      if (b.id === B.Donnees.bac.id) {
        base.bac.id = b.id;
        base.bac.papier = typeof b.papier === "string" ? b.papier.slice(0, 4000) : "";
        base.bac.fini = Boolean(b.fini);
        base.bac.bonus = Boolean(b.bonus);
        base.bac.vu = Boolean(b.vu);
        base.bac.le = texte(b.le, null);
        if (b.etapes && typeof b.etapes === "object") {
          B.Donnees.bac.questions.forEach(function (q) {
            q.etapes.forEach(function (e) {
              var r = b.etapes[e.id];
              if (!r || typeof r !== "object") return;
              var choix = typeof r.choix === "string" ? r.choix : null;
              var existe = e.options.some(function (o) {
                return o.id === choix;
              });
              base.bac.etapes[e.id] = {
                choix: existe ? choix : null,
                essais: B.clamp(Math.floor(nombre(r.essais, 0)), 0, 2),
                juste: Boolean(r.juste),
                revele: Boolean(r.revele),
                xp: B.clamp(Math.floor(nombre(r.xp, 0)), 0, 5),
                donne: Boolean(r.donne) || Boolean(r.xp) || Boolean(r.revele),
                gain: 0
              };
            });
          });
        }
      }
    }

    if (s.fakh && typeof s.fakh === "object" && s.fakh.id === B.Donnees.fakh.id) {
      base.fakh.id = s.fakh.id;
      base.fakh.vu = Boolean(s.fakh.vu);
      base.fakh.fini = Boolean(s.fakh.fini);
      base.fakh.bonus = Boolean(s.fakh.bonus);
      base.fakh.debut = nombre(s.fakh.debut, null);
      base.fakh.temps = Math.max(0, Math.floor(nombre(s.fakh.temps, 0)));
      base.fakh.le = texte(s.fakh.le, null);
      if (s.fakh.reponses && typeof s.fakh.reponses === "object") {
        B.Donnees.fakh.items.forEach(function (f) {
          var r = s.fakh.reponses[f.id];
          if (!r || typeof r !== "object") return;
          var choix = r.choix === "faux" || r.choix === "vrai" ? r.choix : null;
          base.fakh.reponses[f.id] = {
            choix: choix,
            /* La justesse se déduit de la phrase, jamais d'un champ bricolé. */
            juste: choix !== null && choix === (f.faux ? "faux" : "vrai"),
            xp: B.clamp(Math.floor(nombre(r.xp, 0)), 0, 2),
            donne: Boolean(r.donne) || Boolean(r.xp)
          };
        });
      }
    }

    if (s.kafaa && typeof s.kafaa === "object") {
      B.Donnees.competences.forEach(function (c) {
        var ligne = s.kafaa[c.id];
        if (!ligne) return;
        base.kafaa[c.id] = {
          niveau: B.clamp(nombre(ligne.niveau, 0), 0, 3),
          preuves: Math.max(0, Math.floor(nombre(ligne.preuves, 0))),
          maj: texte(ligne.maj, null)
        };
      });
    }

    if (s.srs && Array.isArray(s.srs.cartes)) {
      base.srs.cartes = s.srs.cartes
        .filter(function (c) {
          return c && typeof c.id === "string" && typeof c.dueAt === "string";
        })
        .map(function (c) {
          return {
            id: c.id,
            famille: texte(c.famille, "lecon"),
            titre: texte(c.titre, c.id),
            repere: texte(c.repere, ""),
            dueAt: c.dueAt,
            intervalle: Math.max(1, nombre(c.intervalle, 1)),
            facilite: B.clamp(nombre(c.facilite, 2.5), 1.3, 3),
            repetitions: Math.max(0, Math.floor(nombre(c.repetitions, 0)))
          };
        });
      base.srs.revisions = Math.max(0, Math.floor(nombre(s.srs.revisions, 0)));
    }

    if (s.regularite && typeof s.regularite === "object") {
      base.regularite.jours = Array.isArray(s.regularite.jours)
        ? s.regularite.jours.filter(function (j) {
            return typeof j === "string" && /^\d{4}-\d{2}-\d{2}$/.test(j);
          }).slice(-30)
        : [];
      base.regularite.boucliers = B.clamp(
        Math.floor(nombre(s.regularite.boucliers, 0)),
        0,
        B.Donnees.regularite.bouclierMax
      );
    }

    if (Array.isArray(s.events)) {
      base.events = s.events
        .filter(function (e) {
          return e && typeof e.type === "string";
        })
        .slice(0, MAX_EVENTS);
    }

    if (Array.isArray(s.journal)) {
      base.journal = s.journal
        .filter(function (j) {
          return j && typeof j.texte === "string";
        })
        .slice(0, 30);
    }

    return base;
  }

  function charger() {
    var brut = null;
    try {
      brut = window.localStorage.getItem(CLE);
    } catch (e) {
      stockageOk = false;
      return defauts();
    }
    if (!brut) return defauts();
    try {
      var lu = JSON.parse(brut);
      if (!lu || lu.version !== VERSION) return defauts();
      return normaliser(lu);
    } catch (e) {
      stockageOk = false;
      return defauts();
    }
  }

  function sauver() {
    etat.majLe = new Date().toISOString();
    try {
      window.localStorage.setItem(CLE, JSON.stringify(etat));
      stockageOk = true;
    } catch (e) {
      stockageOk = false;
    }
  }

  function notifier() {
    sauver();
    abonnes.slice().forEach(function (fn) {
      try {
        fn(etat);
      } catch (e) {
        /* un abonné fautif ne casse pas les autres */
      }
    });
    try {
      document.dispatchEvent(new CustomEvent("bawssala:etat", { detail: etat }));
    } catch (e) {
      /* ignoré */
    }
  }

  /* ======================================================================
     3. API DE BASE
     ====================================================================== */
  var Etat = {
    CLE: CLE,

    initialiser: function () {
      if (!etat) etat = charger();
      Etat.marquerJour();
      if (!etat.srs.cartes.length) etat.srs.cartes = cartesInitiales();
      sauver();
      notifier();
      return etat;
    },

    get: function () {
      if (!etat) etat = charger();
      return etat;
    },

    modifier: function (fn) {
      if (!etat) etat = charger();
      var resultat = fn(etat);
      sauver();
      notifier();
      return resultat;
    },

    abonner: function (fn) {
      abonnes.push(fn);
      if (etat) {
        try {
          fn(etat);
        } catch (e) {
          /* ignoré */
        }
      }
      return function () {
        abonnes = abonnes.filter(function (f) {
          return f !== fn;
        });
      };
    },

    stockageOk: function () {
      return stockageOk;
    },

    reinitialiser: function () {
      try {
        window.localStorage.removeItem(CLE);
      } catch (e) {
        stockageOk = false;
      }
      etat = defauts();
      Etat.marquerJour();
      sauver();
      notifier();
      return etat;
    },

    /* ====================================================================
       4. RÉGULARITÉ SOUPLE + XP
       ==================================================================== */
    marquerJour: function () {
      var auj = B.aujourdhui();
      var jours = etat.regularite.jours;
      if (jours[jours.length - 1] !== auj) {
        jours.push(auj);
        if (jours.length > 30) jours.shift();
      }
    },

    regularite: function () {
      var fenetre = B.Donnees.regularite.fenetre;
      var auj = B.aujourdhui();
      var jours = etat.regularite.jours.filter(function (j) {
        var d = B.joursEntre(auj, j);
        return d >= 0 && d < fenetre;
      });
      var objectif = B.Donnees.regularite.objectif;
      return {
        jours: jours.length,
        objectif: objectif,
        fenetre: fenetre,
        atteint: jours.length >= objectif,
        boucliers: etat.regularite.boucliers,
        bouclierMax: B.Donnees.regularite.bouclierMax
      };
    },

    ajouterXp: function (n) {
      if (!n) return;
      etat.xp = Math.max(0, etat.xp + n);
      return etat.xp;
    },

    niveau: function () {
      var seuil = 50;
      var n = Math.floor(etat.xp / seuil) + 1;
      var noms = ["بحّار", "قبطان صغير", "قبطان", "ربّان البوصلة", "خبير البوصلة"];
      return {
        n: n,
        nom: noms[Math.min(noms.length - 1, Math.floor((n - 1) / 2))],
        dansNiveau: etat.xp % seuil,
        seuil: seuil
      };
    },

    /* ====================================================================
       5. KAFAA — writeBack avec lissage et preuve
       ==================================================================== */
    appliquerWriteBack: function (scores, timed) {
      var alpha = timed ? 0.4 : 0.3;
      var notes = [];
      Object.keys(scores || {}).forEach(function (id) {
        var ligne = etat.kafaa[id];
        if (!ligne) return;
        var observe = B.clamp(nombre(scores[id], 0), 0, 3);
        var ancien = ligne.niveau;
        var nouveau;
        if (observe <= 1) {
          nouveau = ancien * 0.85;
        } else {
          nouveau = ancien + (observe - ancien) * alpha;
        }
        ligne.niveau = B.arrondi(B.clamp(nouveau, 0, 3), 2);
        ligne.preuves += 1;
        ligne.maj = B.aujourdhui();
        if (observe <= 1) {
          var comp = B.Donnees.competenceParId[id];
          notes.push("ثغرة في " + (comp ? comp.code : id) + ": مراجعة غدًا.");
          Etat.planifierCarte(
            "competence:" + id,
            "competence",
            (comp ? comp.code + " · " + comp.nom : id),
            "بطاقة كفاءة · مراجعة",
            1
          );
        }
      });
      if (notes.length) {
        etat.journal.unshift({ at: new Date().toISOString(), texte: notes[0] });
        etat.journal = etat.journal.slice(0, 10);
      }
      return notes;
    },

    /* ====================================================================
       6. SM-2 + PLAN PLAFONNÉ
       ==================================================================== */
    planifierCarte: function (id, famille, titre, repere, dansJours) {
      var existante = etat.srs.cartes.filter(function (c) {
        return c.id === id;
      })[0];
      var dueAt = B.ajouteJours(B.aujourdhui(), Math.max(0, dansJours));
      if (existante) {
        existante.dueAt = dueAt;
        existante.titre = titre || existante.titre;
        existante.repere = repere || existante.repere;
      } else {
        etat.srs.cartes.push({
          id: id,
          famille: famille || "lecon",
          titre: titre || id,
          repere: repere || "",
          dueAt: dueAt,
          intervalle: 1,
          facilite: 2.5,
          repetitions: 0
        });
      }
    },

    /** SM-2 minimal : qualite 0..5. */
    reviser: function (carteId, qualite) {
      var carte = etat.srs.cartes.filter(function (c) {
        return c.id === carteId;
      })[0];
      if (!carte) return null;
      var q = B.clamp(Math.round(qualite), 0, 5);
      if (q < 3) {
        carte.repetitions = 0;
        carte.intervalle = 1;
      } else {
        carte.repetitions += 1;
        if (carte.repetitions === 1) carte.intervalle = 1;
        else if (carte.repetitions === 2) carte.intervalle = 3;
        else carte.intervalle = Math.round(carte.intervalle * carte.facilite);
      }
      carte.facilite = B.clamp(
        carte.facilite + (0.1 - (5 - q) * 0.08),
        1.3,
        3
      );
      carte.dueAt = B.ajouteJours(B.aujourdhui(), carte.intervalle);
      etat.srs.revisions += 1;
      if (q >= 4) {
        var reg = Etat.regularite();
        if (reg.atteint && etat.regularite.boucliers < reg.bouclierMax) {
          etat.regularite.boucliers += 1;
        }
      }
      return carte;
    },

    planDeJour: function () {
      var auj = B.aujourdhui();
      var plafond = B.Donnees.plan.plafond;
      var avecRetard = etat.srs.cartes.map(function (c) {
        var joursRetard = Math.max(0, B.joursEntre(auj, c.dueAt));
        return {
          id: c.id,
          famille: c.famille,
          titre: c.titre,
          repere: c.repere,
          dueAt: c.dueAt,
          intervalle: c.intervalle,
          facilite: c.facilite,
          repetitions: c.repetitions,
          due: c.dueAt <= auj,
          joursRetard: joursRetard
        };
      });
      var dues = avecRetard
        .filter(function (c) {
          return c.due;
        })
        .sort(function (a, b) {
          return a.dueAt < b.dueAt ? -1 : a.dueAt > b.dueAt ? 1 : 0;
        });
      return {
        auj: auj,
        aujourdhui: dues.slice(0, plafond),
        dette: Math.max(0, dues.length - plafond),
        demain: avecRetard.filter(function (c) {
          return c.dueAt === B.ajouteJours(auj, 1);
        }).length,
        total: avecRetard.length
      };
    },

    /* ====================================================================
       7. ÉVÉNEMENTS
       ==================================================================== */
    ajouterEvenement: function (type, payload, schema) {
      var e = {
        id: B.uid("ev"),
        type: type,
        v: 1,
        schema: schema || type + "/v1",
        at: new Date().toISOString(),
        payload: payload || {}
      };
      etat.events.unshift(e);
      etat.events = etat.events.slice(0, MAX_EVENTS);
      return e;
    },

    /* ====================================================================
       8. ONBOARDING — enregistrement d'une manche
       ==================================================================== */
    /** Toute erreur, même rattrapée, revient en joute de correction. */
    noterErreur: function (mancheId) {
      if (etat.onboarding.erreurs.indexOf(mancheId) === -1) {
        etat.onboarding.erreurs.push(mancheId);
        notifier();
      }
    },

    enregistrerManche: function (manche, resultat) {
      var scores = Object.assign({}, manche.kafaa || {});
      if (!resultat.juste) {
        Object.keys(scores).forEach(function (id) {
          scores[id] = Math.max(1, scores[id] - 1);
        });
      } else if (resultat.essais > 1) {
        Object.keys(scores).forEach(function (id) {
          scores[id] = Math.max(1, scores[id] - 1);
        });
      }

      etat.onboarding.manches[manche.id] = {
        juste: Boolean(resultat.juste),
        essais: resultat.essais || 1,
        option: resultat.optionId || null,
        secondes: Math.max(0, Math.round(resultat.secondes || 0)),
        le: new Date().toISOString()
      };

      if (!resultat.juste && etat.onboarding.erreurs.indexOf(manche.id) === -1) {
        etat.onboarding.erreurs.push(manche.id);
      }

      if (resultat.juste && etat.onboarding.preuves.indexOf(manche.preuve.code) === -1) {
        etat.onboarding.preuves.push(manche.preuve.code);
      }

      var gain = 0;
      if (resultat.juste) {
        gain = resultat.essais === 1 ? 10 : 6;
        Etat.ajouterXp(gain);
        if (resultat.essais === 1) {
          etat.serie.combo += 1;
          etat.serie.meilleurCombo = Math.max(
            etat.serie.meilleurCombo,
            etat.serie.combo
          );
        } else {
          etat.serie.combo = 0;
        }
      } else {
        etat.serie.combo = 0;
      }

      Etat.appliquerWriteBack(scores, Boolean(resultat.timed));

      Etat.ajouterEvenement("learning.attempt.completed", {
        source: "onboarding",
        mancheId: manche.id,
        exercice: "u1-" + manche.id,
        unite: "u1",
        scores: scores,
        timed: Boolean(resultat.timed),
        secondes: Math.max(0, Math.round(resultat.secondes || 0)),
        reussi: Boolean(resultat.juste),
        essais: resultat.essais || 1
      });

      notifier();
      return { gain: gain, scores: scores };
    },

    terminerOnboarding: function (secondesTotal) {
      etat.onboarding.fait = true;
      etat.onboarding.termineLe = new Date().toISOString();
      Etat.ajouterXp(15);
      Etat.ajouterEvenement("session.onboarding.completed", {
        source: "onboarding",
        secondes: Math.max(0, Math.round(secondesTotal || 0)),
        preuves: etat.onboarding.preuves.slice(),
        erreurs: etat.onboarding.erreurs.length
      });
      notifier();
      return Etat.planDeJour();
    },

    preuves: function () {
      var codes = etat.onboarding.preuves.concat(etat.preuves);
      return B.Donnees.registrePreuves.filter(function (p) {
        return codes.indexOf(p.code) !== -1;
      });
    },

    /* ====================================================================
       8 bis. QUÊTES 1-2-3 — مساري
       ==================================================================== */
    infoQuete: function (id) {
      var def = B.Donnees.queteParId[id];
      var q = etat.quetes[id] || { fait: false, etapes: {} };
      var etapes = {};
      var faits = 0;
      if (def) {
        def.etapes.forEach(function (e) {
          var r = q.etapes[e.id];
          if (r) {
            etapes[e.id] = r;
            if (r.juste) faits += 1;
          }
        });
      }
      return {
        id: id,
        fait: Boolean(q.fait),
        faits: faits,
        total: def ? def.etapes.length : 0,
        etapes: etapes,
        corrections: q.corrections || {},
        lecon: Boolean(etat.lecons[id]),
        le: q.le || null
      };
    },

    quetesFaites: function () {
      return B.Donnees.quetes.filter(function (q) {
        return etat.quetes[q.id] && etat.quetes[q.id].fait;
      }).length;
    },

    enregistrerEtape: function (queteId, etapeId, resultat) {
      var def = B.Donnees.queteParId[queteId];
      if (!def) return { gain: 0 };
      if (!etat.quetes[queteId]) {
        etat.quetes[queteId] = { fait: false, etapes: {}, le: null };
      }
      var q = etat.quetes[queteId];
      var etape = def.etapes.filter(function (e) {
        return e.id === etapeId;
      })[0];

      q.etapes[etapeId] = {
        juste: Boolean(resultat.juste),
        essais: resultat.essais || 1,
        option: resultat.optionId || null,
        secondes: Math.max(0, Math.round(resultat.secondes || 0))
      };

      var gain = 0;
      if (resultat.juste) {
        gain = resultat.essais === 1 ? 8 : 4;
        Etat.ajouterXp(gain);
        if (resultat.essais === 1) {
          etat.serie.combo += 1;
          etat.serie.meilleurCombo = Math.max(
            etat.serie.meilleurCombo,
            etat.serie.combo
          );
        } else {
          etat.serie.combo = 0;
        }
      } else {
        etat.serie.combo = 0;
      }

      Etat.ajouterEvenement("learning.attempt.completed", {
        source: "quete",
        queteId: queteId,
        exercice: queteId + "-" + etapeId,
        unite: def.uniteId,
        scores: (etape && etape.kafaa) || def.kafaa || {},
        timed: false,
        secondes: Math.max(0, Math.round(resultat.secondes || 0)),
        reussi: Boolean(resultat.juste),
        essais: resultat.essais || 1
      });

      notifier();
      return { gain: gain };
    },

    /** Correction rapide d'une étape ratée : +5 XP si juste, jamais de punition. */
    enregistrerCorrection: function (queteId, etapeId, reussi) {
      if (!etat.quetes[queteId]) {
        etat.quetes[queteId] = { fait: false, etapes: {}, corrections: {}, le: null };
      }
      var q = etat.quetes[queteId];
      if (!q.corrections) q.corrections = {};
      q.corrections[etapeId] = reussi ? "juste" : "revele";
      if (reussi) Etat.ajouterXp(5);
      notifier();
      return { gain: reussi ? 5 : 0 };
    },

    /** Débloque la carte de leçon d'une quête (idempotent). +5 XP la première fois. */
    debloquerLecon: function (queteId) {
      var def = B.Donnees.queteParId[queteId];
      if (!def) return { lecon: null, nouvelle: false };
      if (etat.lecons[queteId]) {
        return { lecon: def.lecon, nouvelle: false };
      }
      etat.lecons[queteId] = { le: new Date().toISOString() };
      Etat.ajouterXp(5);
      Etat.ajouterEvenement("learning.lesson.collected", {
        source: "quete",
        queteId: queteId,
        code: def.lecon.code,
        unite: def.uniteId
      });
      notifier();
      return { lecon: def.lecon, nouvelle: true };
    },

    leconsObtenues: function () {
      return B.Donnees.quetes
        .filter(function (q) {
          return Boolean(etat.lecons[q.id]);
        })
        .map(function (q) {
          return q.lecon;
        });
    },

    terminerQuete: function (queteId) {
      var def = B.Donnees.queteParId[queteId];
      if (!def) return null;
      if (!etat.quetes[queteId]) {
        etat.quetes[queteId] = { fait: false, etapes: {}, le: null };
      }
      var q = etat.quetes[queteId];
      var scores = {};
      var dejaLa = q.fait;
      var reussies = def.etapes.filter(function (e) {
        var r = q.etapes[e.id];
        return r && r.juste;
      }).length;
      var part = reussies / def.etapes.length;
      var sansFaute = def.etapes.every(function (e) {
        var r = q.etapes[e.id];
        return r && r.juste && r.essais === 1;
      });

      Object.keys(def.kafaa || {}).forEach(function (id) {
        scores[id] = sansFaute ? def.kafaa[id] : Math.max(1, Math.round(def.kafaa[id] * part));
      });

      q.fait = true;
      q.le = new Date().toISOString();

      var preuve = def.preuve;
      var nouvellePreuve = etat.preuves.indexOf(preuve.code) === -1;
      if (nouvellePreuve) etat.preuves.push(preuve.code);

      var gain = dejaLa ? 0 : 12;
      if (gain) Etat.ajouterXp(gain);


      Etat.appliquerWriteBack(scores, false);

      Etat.ajouterEvenement("learning.quest.completed", {
        source: "quete",
        queteId: queteId,
        unite: def.uniteId,
        etapes: def.etapes.length,
        scores: scores,
        preuves: nouvellePreuve ? [preuve.code] : []
      });

      notifier();
      return {
        gain: gain,
        preuve: nouvellePreuve ? preuve : null,
        plan: Etat.planDeJour()
      };
    },

    /* ====================================================================
       8 ter. APPLICATION BAC — micro-décisions guidées (3 par question)
       On lit une pièce, on choisit, on comprend tout de suite.
       ==================================================================== */
    bac: function () {
      /* Garde-fou : un état ancien (ou abîmé) ne casse jamais l'écran. */
      if (!etat.bac || typeof etat.bac !== "object") {
        etat.bac = { id: null, etapes: {}, papier: "", fini: false, bonus: false, le: null };
      }
      if (!etat.bac.etapes || typeof etat.bac.etapes !== "object") {
        etat.bac.etapes = {};
      }
      if (!etat.bac.id) etat.bac.id = B.Donnees.bac.id;
      /* Chaque étape existe toujours, même sur un état partiel, ancien ou
         bricolé : sinon un clic sur une réponse plantait (undefined.choix). */
      B.Donnees.bac.questions.forEach(function (q) {
        q.etapes.forEach(function (e) {
          var r = etat.bac.etapes[e.id];
          if (!r || typeof r !== "object") {
            etat.bac.etapes[e.id] = {
              choix: null, essais: 0, juste: false, revele: false, xp: 0, gain: 0, donne: false
            };
            return;
          }
          if (typeof r.choix !== "string") r.choix = r.choix || null;
          r.essais = B.clamp(Math.floor(nombre(r.essais, 0)), 0, 2);
          r.juste = Boolean(r.juste);
          r.revele = Boolean(r.revele);
          r.xp = B.clamp(Math.floor(nombre(r.xp, 0)), 0, 5);
          r.gain = B.clamp(Math.floor(nombre(r.gain, 0)), 0, 5);
          r.donne = Boolean(r.donne) || Boolean(r.xp) || Boolean(r.revele);
        });
      });
      return etat.bac;
    },

    /** Définition d'une étape + son état d'exécution. */
    bacEtape: function (etapeId) {
      var trouve = null;
      B.Donnees.bac.questions.forEach(function (q) {
        q.etapes.forEach(function (e) {
          if (e.id === etapeId) trouve = { question: q, etape: e };
        });
      });
      if (!trouve) return null;
      var r = Etat.bac().etapes[etapeId] ||
        { choix: null, essais: 0, juste: false, revele: false, xp: 0, gain: 0, donne: false };
      return {
        question: trouve.question,
        etape: trouve.etape,
        choix: r.choix,
        essais: r.essais,
        juste: r.juste,
        revele: r.revele,
        gain: r.gain || 0,
        faite: Boolean(r.juste || r.revele)
      };
    },

    /** Toutes les étapes à plat, dans l'ordre du sujet. */
    bacEtapes: function () {
      var liste = [];
      B.Donnees.bac.questions.forEach(function (q, qi) {
        q.etapes.forEach(function (e, ei) {
          liste.push({ question: q, etape: e, numero: qi, sousNumero: ei });
        });
      });
      return liste;
    },

    bacProgression: function () {
      var liste = Etat.bacEtapes();
      var faits = [];
      var premierCoup = 0;
      var essais = 0;
      liste.forEach(function (x) {
        var r = Etat.bac().etapes[x.etape.id];
        if (!r) return;
        essais += r.essais;
        if (r.juste && r.essais === 1) premierCoup += 1;
        if (r.juste || r.revele) faits.push(x.etape.id);
      });
      var courante = null;
      for (var i = 0; i < liste.length; i++) {
        var rr = Etat.bac().etapes[liste[i].etape.id];
        if (!rr || (!rr.juste && !rr.revele)) {
          courante = liste[i].etape.id;
          break;
        }
      }
      return {
        total: liste.length,
        faites: faits.length,
        faits: faits,
        premierCoup: premierCoup,
        essais: essais,
        courante: courante,
        finie: faits.length === liste.length
      };
    },

    /**
     * Réponse à une micro-décision.
     * 1re erreur → indice, 2e erreur → on montre la bonne réponse (sans honte).
     * XP : 3 au premier essai, 2 au second, 0 si révélé.
     */
    bacRepondre: function (etapeId, optionId) {
      var info = Etat.bacEtape(etapeId);
      if (!info) return { erreur: "etape" };
      var b = Etat.bac();
      var r = b.etapes[etapeId];
      if (!r) {
        r = { choix: null, essais: 0, juste: false, revele: false, xp: 0, gain: 0, donne: false };
        b.etapes[etapeId] = r;
      }
      if (info.faite) return { erreur: "deja", etape: info };

      var option = info.etape.options.filter(function (o) {
        return o.id === optionId;
      })[0];
      if (!option) return { erreur: "option" };

      r.choix = optionId;
      r.essais = B.clamp(r.essais + 1, 0, 2);
      r.juste = Boolean(option.juste);

      var gain = 0;
      r.gain = 0;
      if (r.juste) {
        var potentiel = r.essais === 1 ? 3 : 2;
        /* Les points ne se gagnent qu'une fois par étape, même en rejouant. */
        if (!r.donne) {
          r.donne = true;
          r.xp = potentiel;
          gain = potentiel;
          r.gain = potentiel;
          Etat.ajouterXp(gain);
        }
      } else if (r.essais >= 2) {
        r.revele = true;
        /* Réponse montrée : l'étape est « vue », elle ne rapportera plus de
           points si on la rejoue (sinon on farmerait en se trompant exprès). */
        r.donne = true;
      }

      var bonne = info.etape.options.filter(function (o) {
        return o.juste;
      })[0];

      notifier();
      return {
        juste: r.juste,
        essais: r.essais,
        revele: r.revele,
        gain: gain,
        retour: option.retour,
        bonne: bonne ? bonne.texte : "",
        cle: info.etape.cle,
        terminee: r.juste || r.revele
      };
    },

    bacPapier: function (texte) {
      var b = Etat.bac();
      b.papier = String(texte || "").slice(0, 4000);
      notifier();
      return b.papier;
    },

    /**
     * Clôture : écrit les compétences C4/C5 (lissage doux), verse le bonus
     * unique et journalise l'événement. Idempotent.
     */
    bacTerminer: function () {
      var b = Etat.bac();
      var progression = Etat.bacProgression();
      if (!progression.finie) return { erreur: "incomplete", progression: progression };

      if (!b.fini) {
        B.Donnees.bac.questions.forEach(function (q) {
          var premierCoup = q.etapes.filter(function (e) {
            var r = b.etapes[e.id];
            return r && r.juste && r.essais === 1;
          }).length;
          var revelees = q.etapes.filter(function (e) {
            var r = b.etapes[e.id];
            return r && r.revele;
          }).length;
          var observe = Math.round(
            B.clamp(3 * (premierCoup / q.etapes.length) - 0.5 * revelees, 0, 3)
          );
          var scores = {};
          scores[q.competence] = observe;
          Etat.appliquerWriteBack(scores, false);
        });

        if (!b.bonus) {
          b.bonus = true;
          Etat.ajouterXp(6);
        }

        /* Les deux preuves du sujet rejoignent le registre commun : elles
           apparaissent dans « مرجع البوصلة › الأدلة » et dans مساري. */
        var codes = (B.Donnees.bacPreuves || []).map(function (p) {
          return p.code;
        });
        codes.forEach(function (code) {
          if (etat.preuves.indexOf(code) === -1) etat.preuves.push(code);
        });

        Etat.ajouterEvenement("learning.attempt.completed", {
          source: "bac",
          exercice: B.Donnees.bac.id,
          unite: B.Donnees.unite1.id,
          timed: false,
          reussi: true,
          essais: progression.essais,
          premierCoup: progression.premierCoup,
          total: progression.total
        });

        b.fini = true;
        b.le = new Date().toISOString();
      }

      notifier();
      return { progression: progression, fini: true };
    },

    /** Rejouer le sujet : on garde le brouillon, on remet les étapes à zéro. */
    bacReinitialiser: function () {
      var b = Etat.bac();
      B.Donnees.bac.questions.forEach(function (q) {
        q.etapes.forEach(function (e) {
          var avant = b.etapes[e.id] || {};
          b.etapes[e.id] = {
            choix: null,
            essais: 0,
            juste: false,
            revele: false,
            gain: 0,
            /* On garde la trace des points déjà gagnés : pas de farming. */
            xp: avant.xp || 0,
            donne: Boolean(avant.donne) || Boolean(avant.xp)
          };
        });
      });
      b.fini = false;
      /* b.bonus reste acquis : rejouer ne re-crédite pas les 6 XP de clôture. */
      b.le = null;
      notifier();
      return b;
    },

    /** L'élève a-t-il déjà vu la « méthode » d'entrée du mode Bac ? */
    bacVu: function () {
      return Boolean(Etat.bac().vu);
    },

    /** Marque la méthode comme vue (une seule fois par profil). */
    bacMarquerVu: function () {
      var b = Etat.bac();
      if (b.vu) return false;
      b.vu = true;
      notifier();
      return true;
    },

    /** Bilan par question, pour la synthèse et la feuille imprimable. */
    bacBilan: function () {
      var b = Etat.bac();
      return B.Donnees.bac.questions.map(function (q) {
        var justes = 0;
        var premierCoup = 0;
        var revelees = 0;
        q.etapes.forEach(function (e) {
          var r = b.etapes[e.id];
          if (!r) return;
          if (r.juste) justes += 1;
          if (r.juste && r.essais === 1) premierCoup += 1;
          if (r.revele) revelees += 1;
        });
        return {
          id: q.id,
          points: q.points,
          competence: q.competence,
          justes: justes,
          premierCoup: premierCoup,
          revelees: revelees,
          total: q.etapes.length,
          statut: revelees === 0 && justes === q.etapes.length
            ? "راسخ"
            : justes >= 2
            ? "في الطريق"
            : "بداية"
        };
      });
    },

    /* ====================================================================
       9. SIMULATIONS (pupitre)
       ==================================================================== */
    /* ====================================================================
       8 quater. صيّاد الفخاخ — 8 جمل، 2 أزرار، دليل فوري
       Un seul essai par phrase : on chasse, on comprend, on avance.
       Pas de Game Over, pas de note : on compte les faucons attrapés.
       ==================================================================== */
    fakh: function () {
      var d = B.Donnees.fakh;
      if (!etat.fakh || typeof etat.fakh !== "object") {
        etat.fakh = { id: null, vu: false, reponses: {}, fini: false, bonus: false, debut: null, temps: 0, le: null };
      }
      var f = etat.fakh;
      if (!f.reponses || typeof f.reponses !== "object") f.reponses = {};
      if (f.id !== d.id) {
        f.id = d.id;
        f.reponses = {};
        f.fini = false;
        f.bonus = false;
        f.debut = null;
        f.temps = 0;
        f.le = null;
      }
      f.vu = Boolean(f.vu);
      f.fini = Boolean(f.fini);
      f.bonus = Boolean(f.bonus);
      f.debut = nombre(f.debut, null);
      f.temps = Math.max(0, Math.floor(nombre(f.temps, 0)));
      /* Chaque phrase existe toujours, avec une réponse normalisée : un état
         partiel ne casse jamais l'écran. */
      d.items.forEach(function (item) {
        var r = f.reponses[item.id];
        if (!r || typeof r !== "object") {
          f.reponses[item.id] = { choix: null, juste: false, xp: 0, donne: false };
          return;
        }
        if (r.choix !== "faux" && r.choix !== "vrai") r.choix = null;
        r.juste = r.choix !== null && r.choix === (item.faux ? "faux" : "vrai");
        r.xp = B.clamp(Math.floor(nombre(r.xp, 0)), 0, 2);
        r.donne = Boolean(r.donne) || Boolean(r.xp);
      });
      return f;
    },

    fakhProgression: function () {
      var f = Etat.fakh();
      var items = B.Donnees.fakh.items;
      var faits = 0;
      var justes = 0;
      var courante = null;
      items.forEach(function (it) {
        var r = f.reponses[it.id];
        if (!r || !r.choix) {
          if (!courante) courante = it.id;
          return;
        }
        faits += 1;
        if (r.juste) justes += 1;
      });
      return {
        total: items.length,
        faites: faits,
        justes: justes,
        courante: courante,
        finie: faits === items.length,
        temps: f.temps
      };
    },

    /** Réponse à une phrase : فخّ ou صحيح. Un seul essai, retour immédiat. */
    fakhRepondre: function (id, choix) {
      var item = B.Donnees.fakhParId[id];
      if (!item) return { erreur: "item" };
      if (choix !== "faux" && choix !== "vrai") return { erreur: "choix" };
      var f = Etat.fakh();
      var r = f.reponses[id];
      if (r && r.choix) return { erreur: "deja", juste: r.juste };

      var attendu = item.faux ? "faux" : "vrai";
      var juste = choix === attendu;
      var gain = 0;
      if (juste && !(r && r.donne)) {
        gain = 2;
        Etat.ajouterXp(gain);
      }
      f.reponses[id] = {
        choix: choix,
        juste: juste,
        xp: gain || (r && r.xp) || 0,
        donne: juste || Boolean(r && r.donne)
      };
      if (!f.debut) f.debut = new Date().getTime();
      notifier();
      return {
        juste: juste,
        attendu: attendu,
        gain: gain,
        correction: item.correction,
        indice: item.indice,
        faux: item.faux,
        source: item.source,
        terminee: true
      };
    },

    /**
     * Clôture : écrit les compétences (c1 / c3 / c4) selon la justesse,
     * verse le bonus unique, et n'ouvre les preuves « بكالوريا » que pour
     * les pièges réellement attrapés.
     */
    fakhTerminer: function (secondes) {
      var f = Etat.fakh();
      var p = Etat.fakhProgression();
      if (!p.finie) return { erreur: "incomplete", progression: p };

      if (!f.fini) {
        var parts = {};
        B.Donnees.fakh.items.forEach(function (it) {
          var r = f.reponses[it.id];
          if (!parts[it.kafaa]) parts[it.kafaa] = { total: 0, justes: 0 };
          parts[it.kafaa].total += 1;
          if (r && r.juste) parts[it.kafaa].justes += 1;
        });
        Object.keys(parts).forEach(function (id) {
          var c = parts[id];
          var observe = Math.round(B.clamp(3 * (c.justes / c.total), 0, 3));
          var scores = {};
          scores[id] = observe;
          Etat.appliquerWriteBack(scores, false);
        });

        B.Donnees.fakhPreuves.forEach(function (pr) {
          var r = f.reponses[pr.fakh];
          if (r && r.juste && etat.preuves.indexOf(pr.code) === -1) {
            etat.preuves.push(pr.code);
          }
        });

        if (!f.bonus) {
          f.bonus = true;
          Etat.ajouterXp(4);
        }

        f.temps = Math.max(0, Math.floor(nombre(secondes, f.temps)));
        Etat.ajouterEvenement("learning.attempt.completed", {
          source: "fakh",
          exercice: B.Donnees.fakh.id,
          unite: B.Donnees.unite1.id,
          timed: false,
          reussi: p.justes >= 6,
          justes: p.justes,
          total: p.total,
          secondes: f.temps
        });

        f.fini = true;
        f.le = new Date().toISOString();
      }

      notifier();
      return { progression: Etat.fakhProgression(), temps: f.temps, fini: true };
    },

    /** Rejouer la chasse : phrases remises à zéro, XP déjà gagnés conservés. */
    fakhReinitialiser: function () {
      var f = Etat.fakh();
      B.Donnees.fakh.items.forEach(function (item) {
        var avant = f.reponses[item.id] || {};
        f.reponses[item.id] = {
          choix: null,
          juste: false,
          xp: avant.xp || 0,
          donne: Boolean(avant.donne) || Boolean(avant.xp)
        };
      });
      f.fini = false;
      f.debut = null;
      f.temps = 0;
      f.le = null;
      notifier();
      return f;
    },

    fakhVu: function () {
      return Boolean(Etat.fakh().vu);
    },

    fakhMarquerVu: function () {
      var f = Etat.fakh();
      if (f.vu) return false;
      f.vu = true;
      notifier();
      return true;
    },

    /** Bilan : les faucons attrapés, le rang (jamais de note sur 20). */
    fakhBilan: function () {
      var f = Etat.fakh();
      var p = Etat.fakhProgression();
      var parts = {};
      B.Donnees.fakh.items.forEach(function (it) {
        var r = f.reponses[it.id];
        if (!parts[it.kafaa]) {
          var comp = B.Donnees.competenceParId[it.kafaa];
          parts[it.kafaa] = {
            id: it.kafaa,
            code: comp ? comp.code : it.kafaa.toUpperCase(),
            nom: comp ? comp.nom : "",
            total: 0,
            justes: 0
          };
        }
        parts[it.kafaa].total += 1;
        if (r && r.juste) parts[it.kafaa].justes += 1;
      });
      var rang;
      if (p.justes === p.total) rang = { nom: "عين الصقر", sous: "ولا فخ ما فاتك." };
      else if (p.justes >= 6) rang = { nom: "صيّاد ماهر", sous: "أغلب الفخاخ وقعت في يدك." };
      else if (p.justes >= 4) rang = { nom: "صيّاد في الطريق", sous: "ولّيت تشوف الفخ قبل ما يوقع بيك." };
      else rang = { nom: "بديت تشوف الفخاخ", sous: "كل جولة عينك تولّي أسرع." };

      var preuves = B.Donnees.fakhPreuves
        .filter(function (pr) {
          var r = f.reponses[pr.fakh];
          return r && r.juste;
        })
        .map(function (pr) {
          return pr.code;
        });

      return {
        total: p.total,
        justes: p.justes,
        faites: p.faites,
        temps: f.temps,
        fini: f.fini,
        rang: rang,
        parCompetence: Object.keys(parts).map(function (k) {
          return parts[k];
        }),
        preuves: preuves
      };
    },

    simulerAbsence: function (jours) {
      var n = Math.max(1, Math.round(jours || 21));
      var auj = B.aujourdhui();
      var veille = B.ajouteJours(auj, -n);
      /* Le retour couvre tout le programme : chaque compétence a sa carte en retard. */
      B.Donnees.competences.forEach(function (c) {
        var id = "competence:" + c.id;
        var carte = etat.srs.cartes.filter(function (k) {
          return k.id === id;
        })[0];
        if (!carte) {
          etat.srs.cartes.push({
            id: id,
            famille: "competence",
            titre: c.code + " · " + c.nom,
            repere: "مراجعة بعد غياب",
            dueAt: veille,
            intervalle: 1,
            facilite: 2.5,
            repetitions: 0
          });
        }
      });
      etat.srs.cartes.forEach(function (c) {
        c.dueAt = veille;
      });
      Etat.ajouterEvenement("session.absence.simulated", {
        jours: n,
        cartes: etat.srs.cartes.length
      });
      notifier();
      return Etat.planDeJour();
    },

    simulerBac: function (statut) {
      var reussi = statut === "reussie";
      var scores = reussi ? { c7: 3, c3: 2, c5: 2 } : { c7: 1, c5: 1 };
      Etat.appliquerWriteBack(scores, true);
      if (reussi) Etat.ajouterXp(25);
      Etat.ajouterEvenement(
        "learning.attempt.completed",
        {
          source: "bac",
          exercice: "bac-2022-u1",
          unite: "u1",
          statut: reussi ? "ناجحة" : "ناقصة",
          scores: scores,
          timed: true,
          secondes: reussi ? 2400 : 1500,
          reussi: reussi
        },
        "learning.attempt.completed/v1"
      );
      return { reussi: reussi, scores: scores };
    },

    /* ====================================================================
       10. VUE COMPACTE POUR LE PUPITRE
       ==================================================================== */
    vueKafaa: function () {
      return B.Donnees.competences.map(function (c) {
        var l = etat.kafaa[c.id];
        return {
          code: c.code,
          nom: c.nom,
          niveau: l.niveau,
          preuves: l.preuves,
          statut: Etat.statutKafaa(l)
        };
      });
    },

    statutKafaa: function (ligne) {
      if(!ligne || !ligne.preuves) return "بلا دليل";
      if (ligne.niveau < 1) return "بداية";
      if (ligne.niveau < 2) return "في الطريق";
      if (ligne.niveau < 2.6) return "راسخ";
      return "متقن";
    }
  };

  B.Etat = Etat;
})();
