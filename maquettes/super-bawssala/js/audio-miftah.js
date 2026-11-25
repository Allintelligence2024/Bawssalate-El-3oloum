/* ==========================================================================
   بوصلة العلوم · النسخة الشاملة
   audio-miftah.js — sons synthétisés (Web Audio, zéro fichier), haptique,
   SVG de القبطان مفتاح (4 états), bulles et micro-confettis.
   ========================================================================== */
(function () {
  "use strict";

  var B = window.Bawssala;

  /* ======================================================================
     1. SON — synthèse pure, volume bas, jamais strident
     ====================================================================== */
  var ctx = null;
  var master = null;
  var muet = false;
  var debloque = false;

  function contexte() {
    if (ctx) return ctx;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try {
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.16;
      master.connect(ctx.destination);
    } catch (e) {
      ctx = null;
    }
    return ctx;
  }

  function note(freq, duree, type, gain, glisse) {
    var c = contexte();
    if (!c || muet) return;
    var t = c.currentTime;
    var osc = c.createOscillator();
    var g = c.createGain();
    osc.type = type || "sine";
    osc.frequency.setValueAtTime(freq, t);
    if (glisse) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(40, glisse), t + duree);
    }
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain == null ? 0.5 : gain), t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duree);
    osc.connect(g);
    g.connect(master);
    osc.start(t);
    osc.stop(t + duree + 0.02);
  }

  var Son = {
    /** À appeler sur le premier geste utilisateur (politique navigateur). */
    debloquer: function () {
      if (debloque) return;
      var c = contexte();
      if (!c) return;
      if (c.state === "suspended") {
        c.resume().catch(function () {});
      }
      debloque = true;
    },

    reglerMuet: function (valeur) {
      muet = Boolean(valeur);
      return muet;
    },

    basculer: function () {
      muet = !muet;
      if (!muet) Son.debloquer();
      return muet;
    },

    estMuet: function () {
      return muet;
    },

    clic: function () {
      note(560, 0.05, "square", 0.22, 640);
    },

    pop: function () {
      note(340, 0.1, "sine", 0.5, 700);
    },

    /** Ding de combo : la hauteur monte avec la série. */
    ding: function (serie) {
      var base = 620 + Math.min(4, serie || 0) * 70;
      note(base, 0.16, "sine", 0.5);
      window.setTimeout(function () {
        note(base * 1.5, 0.2, "sine", 0.32);
      }, 70);
    },

    /** Erreur douce : deux notes basses, aucune agression. */
    doux: function () {
      note(235, 0.16, "sine", 0.32, 205);
      window.setTimeout(function () {
        note(196, 0.2, "sine", 0.26, 180);
      }, 110);
    },

    /** Transition d'écran. */
    glisse: function () {
      note(300, 0.12, "triangle", 0.24, 460);
    },

    /** Fin de manche / étape validée. */
    valide: function () {
      note(523.25, 0.11, "sine", 0.42);
      window.setTimeout(function () {
        note(659.25, 0.13, "sine", 0.4);
      }, 90);
      window.setTimeout(function () {
        note(783.99, 0.22, "sine", 0.4);
      }, 190);
    },

    /** Mini-fanfare de fin de manche (3 notes + accord). */
    fanfare: function () {
      var suite = [523.25, 659.25, 783.99, 1046.5];
      suite.forEach(function (f, i) {
        window.setTimeout(function () {
          note(f, i === suite.length - 1 ? 0.42 : 0.16, "sine", 0.44);
          if (i === suite.length - 1) {
            note(f / 2, 0.42, "triangle", 0.16);
          }
        }, i * 105);
      });
    }
  };

  /** Haptique discrète, alignée sur le son (silencieuse si muet). */
  function haptique(motif) {
    if (muet) return;
    try {
      if (navigator.vibrate) navigator.vibrate(motif || 15);
    } catch (e) {
      /* ignoré */
    }
  }

  B.Son = Son;
  B.haptique = haptique;

  /* ======================================================================
     2. MASCOTTE — القبطان مفتاح, 4 états
     ====================================================================== */
  var MASCOTTE = [
    '<svg class="mascotte" data-etat="{ETAT}" viewBox="0 0 200 212" role="img" aria-label="{LABEL}" xmlns="http://www.w3.org/2000/svg">',
    "<defs>",
    '<linearGradient id="mPeau" x1="0" y1="0" x2="1" y2="1">',
    '<stop offset="0" stop-color="#f6e2c6"/><stop offset="1" stop-color="#eccfae"/>',
    "</linearGradient>",
    '<linearGradient id="mFoulard" x1="0" y1="0" x2="0" y2="1">',
    '<stop offset="0" stop-color="#2c6350"/><stop offset="1" stop-color="#1b4537"/>',
    "</linearGradient>",
    "</defs>",
    /* épaules / veste */
    '<path d="M42 205c4-30 25-45 58-45s54 15 58 45z" fill="#1d4a3b"/>',
    '<path d="M84 164c5 9 27 9 32 0l-4-8h-24z" fill="#f3dfc4" opacity=".9"/>',
    /* foulard */
    '<path d="M38 92c0-30 24-52 62-52s62 22 62 52c0 8-4 13-10 13H48c-6 0-10-5-10-13z" fill="url(#mFoulard)"/>',
    '<path d="M38 96c18 8 106 8 124 0v9c-20 9-104 9-124 0z" fill="#173d31"/>',
    '<path d="M150 100c10 4 16 16 12 30-3 11-12 16-20 14 8-6 10-14 8-22-2-9-6-16 0-22z" fill="#1b4537"/>',
    /* visage */
    '<path d="M52 116c0-24 21-40 48-40s48 16 48 40v18c0 25-21 43-48 43s-48-18-48-43z" fill="url(#mPeau)"/>',
    /* oreilles */
    '<circle cx="49" cy="139" r="10" fill="#e8c8a6"/><circle cx="151" cy="139" r="10" fill="#e8c8a6"/>',
    /* favoris / barbe courte */
    '<path d="M62 158c6 16 20 26 38 26s32-10 38-26c-2 20-16 32-38 32s-36-12-38-32z" fill="#efe6d6" opacity=".55"/>',
    /* sourcils */
    '<path d="M69 120c7-5 16-5 22 0" stroke="#4a3a28" stroke-width="4.2" stroke-linecap="round" fill="none"/>',
    '<path d="M109 120c6-5 15-5 22 0" stroke="#4a3a28" stroke-width="4.2" stroke-linecap="round" fill="none"/>',
    /* yeux */
    '<g class="m-oeil-g"><ellipse cx="82" cy="136" rx="6.2" ry="7" fill="#20342c"/><circle cx="84" cy="133.5" r="2" fill="#fff" opacity=".9"/></g>',
    '<ellipse cx="118" cy="136" rx="6.2" ry="7" fill="#20342c"/><circle cx="120" cy="133.5" r="2" fill="#fff" opacity=".9"/>',
    '<path class="m-oeil-ferme" d="M74 137c5-5 12-5 17 0" stroke="#20342c" stroke-width="4" stroke-linecap="round" fill="none"/>',
    /* joues */
    '<g class="m-joue"><ellipse cx="66" cy="150" rx="8" ry="5" fill="#e7a98f" opacity=".55"/><ellipse cx="134" cy="150" rx="8" ry="5" fill="#e7a98f" opacity=".55"/></g>',
    /* bouche : 3 variantes */
    '<path class="m-bouche-fin" d="M92 158c5 3 11 3 16 0" stroke="#7a3f31" stroke-width="3.6" stroke-linecap="round" fill="none"/>',
    '<path class="m-bouche-sourire" d="M86 155c6 9 22 9 28 0" stroke="#7a3f31" stroke-width="4" stroke-linecap="round" fill="none"/>',
    '<g class="m-bouche-ouvert"><path d="M88 153c4 12 20 12 24 0z" fill="#7a3f31"/><path d="M94 159c3 3 9 3 12 0z" fill="#e58a7c"/></g>',
    /* bandeau + insigne boussole */
    '<path d="M40 94c22 6 98 6 120 0" stroke="#0f2c23" stroke-width="3" fill="none" opacity=".6"/>',
    '<g transform="translate(100 74)">',
    '<circle r="15" fill="#173d31" stroke="#dec084" stroke-width="2"/>',
    '<circle r="10.5" fill="none" stroke="#c8d3bf" stroke-width="1" stroke-dasharray="1 3"/>',
    '<path d="M5.5 -5.5 1 1 -5.5 5.5 -1 -1z" fill="#dec084"/>',
    '<circle r="1.6" fill="#f6f6ee"/>',
    "</g>",
    /* mouchoir de pirate */
    '<path d="M146 88c14 2 24 10 28 20-10-2-19-1-26 3-3-8-3-15-2-23z" fill="#c9a558" opacity=".95"/>',
    '<path d="M146 88c8 6 14 14 17 22" stroke="#a8884b" stroke-width="1.4" fill="none"/>',
    /* étincelles (celebrate) */
    '<g class="m-etincelles" fill="#dec084">',
    '<path d="M28 52l2.6 7.4L38 62l-7.4 2.6L28 72l-2.6-7.4L18 62l7.4-2.6z"/>',
    '<path d="M172 44l2 5.6 5.6 2-5.6 2-2 5.6-2-5.6-5.6-2 5.6-2z"/>',
    '<path d="M163 108l1.6 4.4 4.4 1.6-4.4 1.6-1.6 4.4-1.6-4.4-4.4-1.6 4.4-1.6z"/>',
    "</g>",
    "</svg>"
  ].join("");

  var LABELS = {
    neutral: "القبطان مفتاح",
    happy: "القبطان مفتاح فرحان",
    wink: "القبطان مفتاح يغمز",
    celebrate: "القبطان مفتاح يحتفل"
  };

  /**
   * Renvoie le SVG de la mascotte.
   * @param {"neutral"|"happy"|"wink"|"celebrate"} etat
   * @param {number} taille largeur en px
   */
  B.mascotte = function (etat, taille) {
    var e = LABELS[etat] ? etat : "neutral";
    return MASCOTTE.replace("{ETAT}", e)
      .replace("{LABEL}", LABELS[e])
      .replace('viewBox="0 0 200 212"', 'viewBox="0 0 200 212" width="' + (taille || 120) + '" height="' + Math.round((taille || 120) * 1.06) + '"');
  };

  /* ======================================================================
     3. CONFETTIS — micro-particules SVG, coupées si mouvement réduit
     ====================================================================== */
  var COULEURS = ["#dec084", "#cae79a", "#2c6350", "#f5ca7d", "#c8d3bf", "#e7a98f"];

  B.confettis = function (nombre) {
    if (B.mouvementReduit()) return;
    var zone = document.getElementById("confettis");
    if (!zone) return;
    var n = nombre || 14;
    for (var i = 0; i < n; i++) {
      var p = document.createElement("span");
      p.className = "confetti";
      p.style.background = COULEURS[i % COULEURS.length];
      p.style.insetInlineStart = 12 + Math.random() * 74 + "%";
      p.style.insetBlockStart = 18 + Math.random() * 12 + "%";
      p.style.setProperty("--dx", Math.round((Math.random() - 0.5) * 160) + "px");
      p.style.setProperty("--dy", Math.round(160 + Math.random() * 220) + "px");
      p.style.setProperty("--rot", Math.round(120 + Math.random() * 320) + "deg");
      p.style.setProperty("--retard", Math.round(Math.random() * 120) + "ms");
      p.style.setProperty("--duree", Math.round(900 + Math.random() * 500) + "ms");
      if (i % 3 === 0) {
        p.style.width = "6px";
        p.style.height = "6px";
        p.style.borderRadius = "50%";
      }
      zone.appendChild(p);
    }
    window.setTimeout(function () {
      zone.textContent = "";
    }, 1700);
  };

  /* ======================================================================
     4. TOASTS
     ====================================================================== */
  B.toast = function (texte, or) {
    var zone = document.getElementById("toasts");
    if (!zone) return;
    var t = document.createElement("div");
    t.className = "toast" + (or ? " toast--or" : "");
    t.textContent = texte;
    zone.appendChild(t);
    window.setTimeout(function () {
      t.remove();
    }, 2800);
  };
})();
