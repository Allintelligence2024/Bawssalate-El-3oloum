/* Harnais de test commun : charge index.html dans jsdom, exécute les scripts
   classiques dans l'ordre, et rend des helpers. Aucune dépendance au réseau. */
import fs from "node:fs";
import path from "node:path";
import { JSDOM, VirtualConsole } from "jsdom";

export const SCRIPTS = [
  "js/namespace.js",
  "js/audio-miftah.js",
  "js/data-svt-3as.js",
  "js/component-figure.js",
  "js/state-engine.js",
  "js/screen-onboarding.js",
  "js/screen-masari.js",
  "js/screen-game123.js",
  "js/component-boussole.js",
  "js/screen-bac-apply.js",
  "js/screen-fakh-apply.js",
  "js/screen-ana-apply.js",
  "js/app.js"
];

export function base() {
  return path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
}

export async function charger(options = {}) {
  const racine = base();
  const html = fs.readFileSync(path.join(racine, "index.html"), "utf8");
  const erreurs = [];
  const vc = new VirtualConsole();
  vc.on("jsdomError", (e) => erreurs.push(e.message));

  const dom = new JSDOM(html, {
    url: options.url || "http://localhost/",
    runScripts: "outside-only",
    pretendToBeVisual: true,
    virtualConsole: vc
  });
  const { window } = dom;
  if (!options.sansMatchMedia) {
    window.matchMedia = () => ({
      matches: false,
      addEventListener() {},
      removeEventListener() {}
    });
  }
  if (options.stockageKO) {
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get() {
        throw new window.DOMException("stockage bloqué", "SecurityError");
      }
    });
  }
  window.HTMLElement.prototype.scrollIntoView = function () {};
  window.scrollTo = () => {};

  if (options.etat) {
    window.localStorage.setItem("bawssala.super.v1", options.etat);
  }

  if (!options.sansScripts) {
    for (const s of SCRIPTS) {
      window.eval(fs.readFileSync(path.join(racine, s), "utf8"));
    }
    await new Promise((r) => setTimeout(r, 60));
  }

  const doc = window.document;
  const $ = (sel) => doc.querySelector(sel);
  const $$ = (sel) => [...doc.querySelectorAll(sel)];

  function click(sel) {
    const el = typeof sel === "string" ? $(sel) : sel;
    if (!el) throw new Error("introuvable: " + sel);
    el.click();
    return el;
  }

  const txt = (sel) => {
    const el = typeof sel === "string" ? $(sel) : sel;
    return el ? el.textContent.replace(/\s+/g, " ").trim() : "";
  };

  return {
    dom,
    window,
    doc,
    B: window.Bawssala,
    erreurs,
    $,
    $$,
    click,
    txt,
    attendre: (ms = 30) => new Promise((r) => setTimeout(r, ms))
  };
}

export function assert(cond, msg) {
  if (!cond) throw new Error("ECHEC: " + msg);
  console.log("ok —", msg);
}

/** Termine l'onboarding sans jouer, pour tester les écrans suivants. */
export function sauterOnboarding(B) {
  B.Etat.terminerOnboarding(0);
}
