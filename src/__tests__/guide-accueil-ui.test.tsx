// @vitest-environment jsdom
// Phase 2 « Guide-First » — la carte « المرشد يفتح الحصة ».
//
// Contrat vérifié ici :
//   · trois boutons d'énergie, icônes SVG, aucune promesse de temps imposée ;
//   · عيان      → formats de 60 s / 2 min (Défi 60, chasseur de pièges) ;
//   · لاباس     → la mission du jour, telle que le moteur l'a choisie ;
//   · في الفورمة → construire un sujet (guide) ou des briques 1-2-3 ;
//   · la ligne « reportées » rassure et plafonne à 5 ;
//   · l'invitation au compte n'apparaît qu'après une micro-victoire et ne bloque jamais.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import GuideAccueil from '../components/GuideAccueil';
import MascotteKunz, { HUMEUR_GUIDE } from '../components/MascotteKunz';

let root: Root | undefined;
let zone: HTMLDivElement | undefined;

afterEach(async () => {
  if (root) await act(async () => root!.unmount());
  root = undefined;
  zone?.remove();
  zone = undefined;
});

async function monter(element: React.ReactElement) {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  zone = document.createElement('div');
  document.body.append(zone);
  root = createRoot(zone);
  await act(async () => { root!.render(element); });
  return zone;
}

const boutons = () => [...zone!.querySelectorAll('button')];
const parTexte = (motif: string) =>
  boutons().find((b) => (b.textContent ?? '').replace(/\s+/g, ' ').includes(motif));
const clic = async (b: HTMLElement) => {
  await act(async () => { b.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
};

const mission = { titre: 'قراءة الوثيقة', minutes: 3, type: 'noeud' as const };

function accessoires() {
  return {
    mission: { ...mission },
    reportees: 0,
    energie: null,
    onEnergie: vi.fn(),
    onMission: vi.fn(),
    onDefi60: vi.fn(),
    onFakh: vi.fn(),
    onBriques: vi.fn(),
    onSujetGuide: vi.fn(),
  };
}

describe('la carte du guide', () => {
  it('affiche le titre, les trois états et aucune icône emoji', async () => {
    await monter(createElement(GuideAccueil, accessoires()));
    const texte = zone!.textContent ?? '';
    expect(texte).toContain('المرشد يفتح الحصة');
    expect(texte).toContain('عيان');
    expect(texte).toContain('لاباس');
    expect(texte).toContain('في الفورمة');
    // Les émotions passent par des SVG (le guide lui-même est une image WebP).
    expect(zone!.querySelectorAll('svg').length).toBeGreaterThanOrEqual(3);
    expect(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(texte), 'emoji dans la copie').toBe(false);
  });

  it('« عيان » propose un format court, sans imposer la mission', async () => {
    const p = { ...accessoires(), energie: 'fatigue' as const };
    await monter(createElement(GuideAccueil, p));
    expect(zone!.textContent).toContain('دقيقة وحدة تكفي');
    const fakh = parTexte('صيّاد الفخاخ');
    expect(fakh).toBeTruthy();
    await clic(fakh!);
    expect(p.onFakh).toHaveBeenCalledTimes(1);
    await clic(parTexte('تحدّي 60 ثانية')!);
    expect(p.onDefi60).toHaveBeenCalledTimes(1);
    expect(p.onMission).not.toHaveBeenCalled();
  });

  it('« لاباس » lance exactement la mission du moteur', async () => {
    const p = { ...accessoires(), energie: 'moyen' as const };
    await monter(createElement(GuideAccueil, p));
    expect(zone!.textContent).toContain('مهمّة اليوم · 3 دقائق');
    await clic(parTexte('نبدأ من هنا')!);
    expect(p.onMission).toHaveBeenCalledTimes(1);
  });

  it('« في الفورمة » ouvre un sujet complet ou les briques', async () => {
    const p = { ...accessoires(), energie: 'forme' as const, nomSujet: '2025-1' };
    await monter(createElement(GuideAccueil, p));
    await clic(parTexte('موضوع كامل')!);
    expect(p.onSujetGuide).toHaveBeenCalledTimes(1);
    await clic(parTexte('البوصلة 1-2-3')!);
    expect(p.onBriques).toHaveBeenCalledTimes(1);
  });

  it('les revues reportées sont rassurantes et plafonnées à cinq', async () => {
    await monter(createElement(GuideAccueil, { ...accessoires(), reportees: 9 }));
    const texte = zone!.textContent ?? '';
    expect(texte).toContain('بقيت 5 مراجعة');
    expect(texte).toContain('بلا عجلة');
    expect(texte).not.toContain('بقيت 9');
  });

  it('sans revue reportée, aucune ligne de dette ne s’affiche', async () => {
    await monter(createElement(GuideAccueil, accessoires()));
    expect(zone!.textContent).not.toContain('بقيت');
  });

  it('l’invitation au compte est facultative et ses deux boutons agissent', async () => {
    const creer = vi.fn();
    const plusTard = vi.fn();
    await monter(createElement(GuideAccueil, { ...accessoires(), invitation: { creer, plusTard } }));
    expect(zone!.textContent).toContain('أوّل انتصار');
    await clic(parTexte('أنشئ حسابي')!);
    expect(creer).toHaveBeenCalledTimes(1);
    await clic(parTexte('نكمّل بلا حساب')!);
    expect(plusTard).toHaveBeenCalledTimes(1);
  });

  it('sans invitation, aucune mention de compte ne s’affiche', async () => {
    await monter(createElement(GuideAccueil, accessoires()));
    expect(zone!.textContent).not.toContain('أنشئ حسابي');
  });
});

describe('les humeurs du guide', () => {
  it('chaque humeur porte un libellé arabe, sans emoji', async () => {
    for (const [humeur, attendu] of Object.entries(HUMEUR_GUIDE)) {
      await monter(createElement(MascotteKunz, { message: 'سطر واحد', humeur: humeur as never }));
      expect(zone!.textContent).toContain(attendu.etiquette);
      expect(/[\u{1F300}-\u{1FAFF}]/u.test(zone!.textContent ?? '')).toBe(false);
      await act(async () => root!.unmount());
      root = undefined;
      zone!.remove();
      zone = undefined;
    }
  });
});

// ── L'invitation au compte passe par الرئيسية (Principal), après une micro-victoire ──
describe('invitation au compte depuis الرئيسية', () => {
  it('n’apparaît pas avant la première victoire, puis une seule fois', async () => {
    const { default: Principal } = await import('../components/Principal');
    const { migrerEtat } = await import('../utils/etat');
    const creer = vi.fn();
    const plusTard = vi.fn();
    const base = { onOuvrirItem: () => {}, onVoirUnite: () => {}, onDemarrerRevision: () => {} };

    const vierge = migrerEtat({});
    await monter(createElement(Principal, { ...base, etat: vierge, onCreerCompte: creer, onMasquerInvitation: plusTard }));
    expect(zone!.textContent).not.toContain('أوّل انتصار');

    await act(async () => root!.unmount());
    root = undefined;
    zone!.remove();

    // Une leçon terminée = la première micro-victoire.
    const avance = migrerEtat({
      progression: {
        'd1-u1-l1-expression-genique': {
          statut: 'terminee',
          phases: [1, 2, 3, 4, 5, 6],
          lue: true,
          minutes: 12,
          derniereSession: '2026-11-20T10:00:00.000Z',
        } as never,
      },
    });
    await monter(createElement(Principal, { ...base, etat: avance, onCreerCompte: creer, onMasquerInvitation: plusTard }));
    const texte = zone!.textContent ?? '';
    expect(texte).toContain('أوّل انتصار');
    await clic(parTexte('أنشئ حسابي')!);
    expect(creer).toHaveBeenCalledTimes(1);
    await clic(parTexte('نكمّل بلا حساب')!);
    expect(plusTard).toHaveBeenCalledTimes(1);

    await act(async () => root!.unmount());
    root = undefined;
    zone!.remove();

    // Invitation déjà vue : elle ne revient pas.
    const vue = { ...avance, invitationCompteVue: '2026-11-20T11:00:00.000Z' };
    await monter(createElement(Principal, { ...base, etat: vue, onCreerCompte: creer, onMasquerInvitation: plusTard }));
    expect(zone!.textContent).not.toContain('أوّل انتصار');
  });
});
