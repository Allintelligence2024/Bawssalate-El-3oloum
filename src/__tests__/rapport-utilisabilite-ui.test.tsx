// @vitest-environment jsdom
// v0.13 — les cinq bloquants du rapport d'utilisabilité (21/11/2026), vérifiés ici :
//   B1  mode invité : on entre dans l'app sans email ni mot de passe, et on peut créer un
//       compte plus tard sans rien perdre ;
//   B2  une seule action principale sur l'accueil (la mission du jour), les autres entrées
//       ne commencent plus par « ابدأ » ;
//   B3  l'intro vidéo n'existe plus : le premier écran est l'action du jour (phase 2) ;
//   B7  l'écran du guide n'empile plus quatre sorties : un bouton par temps, deux en bas.
import { afterEach, describe, expect, it } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import Inscription from '../components/Inscription';
import Aujourdhui from '../components/Aujourdhui';
import Principal from '../components/Principal';
import SujetGuide from '../components/SujetGuide';
import { migrerEtat } from '../utils/etat';
import { parcoursSujet } from '../utils/parcoursSujet';

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
  await act(async () => {
    root!.render(element);
  });
  return zone;
}

const boutons = () => [...zone!.querySelectorAll('button')];
const parTexte = (motif: string) =>
  boutons().find((b) => (b.textContent ?? '').replace(/\s+/g, ' ').includes(motif));

describe('B1 — mode invité', () => {
  it('l’écran de compte propose «جرّب بلا حساب» et prévient que rien n’est envoyé', async () => {
    let invites = 0;
    await monter(
      <Inscription
        onValide={() => {}}
        onInvite={() => {
          invites += 1;
        }}
      />,
    );

    const inviter = parTexte('جرّب بلا حساب');
    expect(inviter, 'bouton invité absent de l’écran de compte').toBeTruthy();
    expect(zone!.textContent).toContain('بلا بريد وبلا كلمة مرور');

    await act(async () => {
      inviter!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(invites).toBe(1);
  });

  it('un compte déjà présent sur l’appareil ne montre pas le raccourci invité', async () => {
    await monter(
      <Inscription
        compte={{
          email: 'a@b.dz',
          motDePasse: 'x'.repeat(64),
          wilaya: '31',
          daira: 'وهران',
          creeLe: '2026-01-01',
        }}
        onValide={() => {}}
        onInvite={() => {}}
      />,
    );
    expect(zone!.textContent).not.toContain('جرّب بلا حساب');
  });
});

describe('B1 — un invité entre vraiment dans l’application', () => {
  it('sans compte ni session, l’accueil s’ouvre sur la mission du jour', async () => {
    localStorage.setItem(
      'murajih_svt_v1',
      JSON.stringify({
        version: 3,
        modeInvite: true,
        progression: {},
        jalons: {},
        notes: [],
        journal: [],
        minutesTotales: 0,
        revisions: 0,
        nom: 'تلميذ',
        seancesComptees: 0,
      }),
    );
    sessionStorage.setItem('kunz_demarrage', '1');

    const { default: App } = await import('../App');
    await monter(<App />);
    // Le chargement paresseux des écrans a besoin de quelques tours.
    for (let i = 0; i < 30; i += 1) {
      await act(async () => {
        await new Promise((r) => setTimeout(r, 20));
      });
    }
    const texte = (zone!.textContent ?? '').replace(/\s+/g, ' ');
    expect(texte, 'l’écran de compte bloque encore l’invité').not.toContain('جرّب بلا حساب');
    expect(texte).toContain('مهمّة اليوم');
    localStorage.clear();
    sessionStorage.clear();
  });
});

describe('B2 — une seule action principale sur l’accueil', () => {
  it('la mission du jour passe en premier sur الرئيسية et une seule entrée commence par « ابدأ »', async () => {
    const etat = migrerEtat({});
    await monter(
      <Principal
        etat={etat}
        onOuvrirItem={() => {}}
        onVoirUnite={() => {}}
        onDemarrerRevision={() => {}}
      />,
    );

    const texte = (zone!.textContent ?? '').replace(/\s+/g, ' ');
    expect(texte.indexOf('مهمّة اليوم'), 'carte mission absente').toBeGreaterThan(-1);
    expect(texte, 'le quiz vit sur son propre onglet كويست').not.toContain('كويست اليوم');

    const demarrages = boutons().filter((b) => (b.textContent ?? '').trim().startsWith('ابدأ'));
    expect(demarrages).toHaveLength(1);
    expect(demarrages[0].textContent).toMatch(/ابدأ \d+ دقائق/);
  });

  it('le quiz du jour vit sur la porte كويست, jamais sur الرئيسية', async () => {
    const etat = migrerEtat({});
    await monter(
      <Aujourdhui
        etat={etat}
        onOuvrirItem={() => {}}
        onVoirUnite={() => {}}
        onDemarrerRevision={() => {}}
        onOuvrirMethodologie={() => {}}
        onDemarrerKouest={() => {}}
        onDefi60={() => {}}
        onResultatKafaa={() => {}}
      />,
    );

    const texte = (zone!.textContent ?? '').replace(/\s+/g, ' ');
    expect(texte.indexOf('كويست اليوم'), 'carte kouest absente').toBeGreaterThan(-1);
  });
});

describe('B3 — phase 2 : aucun écran de démarrage, aucun compte obligatoire', () => {
  it('une installation neuve ouvre الرئيسية avec la carte du guide, sans péage', async () => {
    localStorage.clear();
    sessionStorage.clear();
    const { readFileSync } = await import('node:fs');
    expect(readFileSync('src/App.tsx', 'utf8')).not.toContain('EcranDemarrage');

    const { default: App } = await import('../App');
    await monter(<App />);
    for (let i = 0; i < 30; i += 1) {
      await act(async () => { await new Promise((r) => setTimeout(r, 20)); });
    }
    const texte = (zone!.textContent ?? '').replace(/\s+/g, ' ');
    expect(texte, 'l’écran de compte bloque encore l’entrée').not.toContain('جرّب بلا حساب');
    expect(texte).toContain('المرشد يفتح الحصة');
    expect(texte).toContain('مهمّة اليوم');
    localStorage.clear();
    sessionStorage.clear();
  });
});

describe('B7 — le guide ne propose plus quatre sorties', () => {
  it('un seul bouton par temps, et « أنهيت الموضوع » seulement à la fin', async () => {
    const parcours = parcoursSujet('2022-1')!;
    await monter(
      <SujetGuide
        sujetId="2022-1"
        parcoursImpose={parcours}
        maitrise={{}}
        brouillons={{}}
        etat={migrerEtat({})}
        onEvaluer={() => {}}
        onBrouillon={() => {}}
        onFermer={() => {}}
      />,
    );

    // Temps 1 : la carte ne contient qu'une action (« التالي · تحقّق »).
    const dansCarte = [...zone!.querySelectorAll('section.carte button')];
    expect(dansCarte).toHaveLength(1);
    expect(dansCarte[0].textContent).toContain('تحقّق');

    // Barre du bas : précédent + suivant, pas de « أنهيت الموضوع » avant la dernière consigne.
    expect(parTexte('السابق')).toBeTruthy();
    expect(parTexte('التالي')).toBeTruthy();
    expect(zone!.textContent).not.toContain('أنهيت الموضوع');

    // La بوصلة reste joignable, mais depuis l'en-tête.
    expect(parTexte('البوصلة')).toBeTruthy();
  });
});
