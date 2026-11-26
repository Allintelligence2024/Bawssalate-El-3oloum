// @vitest-environment jsdom
// Contrôle d'accessibilité (J3) — `axe-core` sur du HTML réellement rendu par les composants.
//
// Pourquoi ces écrans : ce sont ceux qu'un élève aveugle ou malvoyant doit pouvoir traverser.
// Une erreur `aria` ici n'est pas cosmétique, elle ferme l'application.
//
// Ce que ce fichier ne prouve pas : le contraste (axe a besoin d'un vrai moteur de style,
// jsdom n'en a pas) et la navigation au lecteur d'écran (essai humain requis). C'est écrit
// noir sur blanc dans les commentaires et dans l'assertion sur les règles non parties.
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import axe from 'axe-core';
import CarteHorsLigne from '../components/CarteHorsLigne';
import FigureSujet from '../components/FigureSujet';
import IllustrationsLecon from '../components/IllustrationsLecon';
import { FIGURES_SUJETS } from '../data/figuresSujets';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let racine: Root | null = null;
let hote: HTMLDivElement | null = null;

afterEach(() => {
  act(() => racine?.unmount());
  hote?.remove();
  racine = null;
  hote = null;
});

async function rendre(noeud: React.ReactElement): Promise<HTMLDivElement> {
  hote = document.createElement('div');
  document.body.appendChild(hote);
  racine = createRoot(hote);
  await act(async () => racine!.render(noeud));
  return hote;
}

/** Règles volontairement hors périmètre, avec la raison — pas un silence. */
const HORS_PERIMETRE = new Set([
  'color-contrast',      // jsdom ne calcule aucun style
  'region',              // composants isolés, sans <main> ni <header> parents
  'landmark-one-main',   // idem
  'page-has-heading-one',// idem
  'html-has-lang',       // idem (le document de test n'est pas l'application)
]);

async function analyser(element: HTMLElement) {
  const resultat = await axe.run(element, {
    resultTypes: ['violations'],
    rules: Object.fromEntries([...HORS_PERIMETRE].map((id) => [id, { enabled: false }])),
  });
  return resultat.violations.map((v) => ({
    id: v.id,
    impact: v.impact,
    cible: v.nodes.map((n) => n.target.join(' ')),
    aide: v.help,
  }));
}

describe('accessibilité des écrans (axe-core)', () => {
  it('les 7 figures du sujet 2023-1 ne produisent aucune violation détectable', async () => {
    for (const figure of FIGURES_SUJETS['2023-1']) {
      const zone = await rendre(<FigureSujet figure={figure} />);
      const violations = await analyser(zone);
      expect(violations, `${figure.cle} : ${JSON.stringify(violations)}`).toEqual([]);
      act(() => racine?.unmount());
      hote?.remove();
      racine = null;
      hote = null;
    }
  });

  it('chaque figure expose un rôle image et un nom accessible', async () => {
    for (const figure of FIGURES_SUJETS['2023-1']) {
      const zone = await rendre(<FigureSujet figure={figure} />);
      const svg = zone.querySelector('svg');
      expect(svg, figure.cle).not.toBeNull();
      // Un <svg> sans role/aria-label est invisible pour un lecteur d'écran.
      expect(svg!.getAttribute('role'), figure.cle).toBe('img');
      expect(svg!.getAttribute('aria-label')!.length, figure.cle).toBeGreaterThan(10);
      act(() => racine?.unmount());
      hote?.remove();
      racine = null;
      hote = null;
    }
  });

  it('la carte hors ligne reste utilisable quand le worker est absent', async () => {
    // navigator.serviceWorker absent : l'état doit être annoncé, pas planté.
    const zone = await rendre(<CarteHorsLigne />);
    const violations = await analyser(zone);
    expect(violations, JSON.stringify(violations)).toEqual([]);
    // Tout bouton doit avoir un intitulé lisible, pas une icône seule.
    for (const bouton of zone.querySelectorAll('button')) {
      const texte = (bouton.textContent ?? '').trim();
      const label = bouton.getAttribute('aria-label') ?? '';
      expect(texte.length + label.length, `bouton sans nom : ${bouton.outerHTML.slice(0, 120)}`).toBeGreaterThan(0);
    }
  });

  it('canari — le détecteur signale réellement une violation', async () => {
    // Sans ce test, une mauvaise configuration d'axe rendrait les trois précédents
    // verts pour toujours. Un bouton sans nom accessible DOIT être signalé.
    const zone = document.createElement('div');
    zone.innerHTML = '<button><svg viewBox="0 0 10 10"><path d="M0 0"/></svg></button>';
    document.body.appendChild(zone);
    const resultat = await axe.run(zone, { resultTypes: ['violations'] });
    const ids = resultat.violations.map((v) => v.id);
    zone.remove();
    expect(ids, 'axe ne détecte plus rien : les tests d’accessibilité ne prouvent rien').toContain('button-name');
  });

  it('le périmètre exclu est documenté, pas subi', () => {
    // Si quelqu'un retire une règle de HORS_PERIMETRE, ce test le lui rappelle :
    // ces exclusions sont justifiées par l'absence de moteur de style et de document complet.
    expect(HORS_PERIMETRE.has('color-contrast')).toBe(true);
    expect(HORS_PERIMETRE.size).toBe(5);
  });
});

describe('entraîneur Bac — accessibilité (§10.3)', () => {
  it('l’écran d’entraînement du sujet 2023-1 ne produit aucune violation', async () => {
    const { default: EntraineurSujet } = await import('../components/EntraineurSujet');
    const { SUJETS_OFFICIELS } = await import('../data/sujetsOfficiels');
    const sujet = SUJETS_OFFICIELS.find((s) => s.id === '2023-1')!;
    const zone = await rendre(
      <EntraineurSujet
        sujet={sujet}
        evaluations={{}}
        brouillons={{}}
        onEvaluer={() => {}}
        onBrouillon={() => {}}
        onFermer={() => {}}
      />,
    );
    const violations = await analyser(zone);
    expect(violations, JSON.stringify(violations)).toEqual([]);
    // Chaque consigne doit avoir son champ de rédaction, accessible par un libellé.
    const zones = zone.querySelectorAll('textarea');
    expect(zones.length).toBeGreaterThan(0);
    for (const t of zones) {
      expect(t.closest('label'), 'textarea hors de tout <label> : illisible au lecteur d’écran').not.toBeNull();
    }
  });
});

describe('simulation d’épreuve — accessibilité (§10.4)', () => {
  it('la préparation et la salle d’épreuve ne produisent aucune violation', async () => {
    const { default: SimulationEpreuve } = await import('../components/SimulationEpreuve');
    const { SUJETS_OFFICIELS } = await import('../data/sujetsOfficiels');
    const sujet = SUJETS_OFFICIELS.find((s) => s.id === '2023-1')!;
    const zone = await rendre(
      <SimulationEpreuve
        sujet={sujet}
        evaluations={{}}
        brouillons={{}}
        onEvaluer={() => {}}
        onBrouillon={() => {}}
        onFermer={() => {}}
      />,
    );
    expect(await analyser(zone)).toEqual([]);

    // Lancer la simulation : chaque consigne doit exposer un champ libellé, et le choix
    // d'auto-évaluation doit être un bouton avec aria-pressed (pas un contrôle muet).
    const lancer = [...zone.querySelectorAll('button')].find((b) => b.textContent?.includes('ابدأ المحاكاة'));
    expect(lancer, 'bouton de lancement introuvable').toBeDefined();
    await act(async () => lancer!.click());

    const violations = await analyser(zone);
    expect(violations, JSON.stringify(violations)).toEqual([]);
    const zones = zone.querySelectorAll('textarea');
    expect(zones.length).toBeGreaterThan(0);
    for (const t of zones) {
      expect(t.closest('label'), 'textarea hors de tout <label> : illisible au lecteur d’écran').not.toBeNull();
    }
    const presses = zone.querySelectorAll('button[aria-pressed]');
    expect(presses.length).toBeGreaterThan(0);
  });
});

describe('profil de compétences — accessibilité (§11)', () => {
  it('les deux états (vide et rempli) ne produisent aucune violation', async () => {
    const { default: CarteProfilCompetences } = await import('../components/CarteProfilCompetences');
    const vide = await rendre(<CarteProfilCompetences evaluations={{}} onOuvrirEntraineur={() => {}} />);
    expect(await analyser(vide)).toEqual([]);
    await act(async () => racine?.unmount());
    hote?.remove();

    // État rempli : une évaluation suffit à faire apparaître le classement et ses raisons.
    const { SUJETS_OFFICIELS } = await import('../data/sujetsOfficiels');
    const { construireGrille, cleConsigne } = await import('../utils/entrainement');
    const sujet = SUJETS_OFFICIELS.find((s) => s.id === '2023-1')!;
    const cle = cleConsigne(construireGrille(sujet).consignes[0]);
    const rempli = await rendre(
      <CarteProfilCompetences
        evaluations={{ [sujet.id]: { [cle]: 1 } }}
        onOuvrirEntraineur={() => {}}
      />,
    );
    const violations = await analyser(rempli);
    expect(violations, JSON.stringify(violations)).toEqual([]);
  });
});

describe('illustrations de leçon — accessibilité (Phase 3)', () => {
  it('charge les WebP en lazy, avec alt arabe, légende RTL et aucune violation axe', async () => {
    const zone = await rendre(<IllustrationsLecon lessonId="phase10_chapitres_19_20_2" />);
    const images = zone.querySelectorAll('img');
    expect(images.length).toBeGreaterThan(0);
    for (const image of images) {
      expect(image.getAttribute('loading')).toBe('lazy');
      expect(image.getAttribute('alt')?.length).toBeGreaterThan(0);
      expect(image.getAttribute('width')).toBeTruthy();
      expect(image.getAttribute('height')).toBeTruthy();
    }
    expect(zone.querySelector('section[dir="rtl"]')).not.toBeNull();
    expect(zone.querySelectorAll('figcaption').length).toBe(images.length);
    const violations = await analyser(zone);
    expect(violations, JSON.stringify(violations)).toEqual([]);
  });

  it('ouvre un zoom plein écran nommé, légende arabe dessous, fermeture Échap + bouton', async () => {
    const zone = await rendre(<IllustrationsLecon lessonId="phase10_chapitres_19_20_2" />);
    const ouvrir = zone.querySelector<HTMLButtonElement>('button[aria-label^="تكبير الوثيقة"]');
    expect(ouvrir).not.toBeNull();

    act(() => ouvrir!.click());
    const dialogue = zone.querySelector<HTMLElement>('[role="dialog"][aria-modal="true"]');
    expect(dialogue).not.toBeNull();
    expect(dialogue!.getAttribute('aria-label')!.length).toBeGreaterThan(0);
    expect(dialogue!.querySelector('img')?.getAttribute('alt')?.length).toBeGreaterThan(0);
    expect(dialogue!.textContent).toContain('الوثيقة');
    expect(dialogue!.querySelector('#legende-illustration-zoom')?.getAttribute('dir')).toBe('rtl');
    expect(document.activeElement?.getAttribute('aria-label')).toBe('إغلاق التكبير');
    const violations = await analyser(zone);
    expect(violations, JSON.stringify(violations)).toEqual([]);

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    });
    expect(zone.querySelector('[role="dialog"]')).toBeNull();

    act(() => ouvrir!.click());
    const fermer = zone.querySelector<HTMLButtonElement>('button[aria-label="إغلاق التكبير"]');
    expect(fermer).not.toBeNull();
    act(() => fermer!.click());
    expect(zone.querySelector('[role="dialog"]')).toBeNull();
    expect(document.body.style.overflow).not.toBe('hidden');
  });
});
