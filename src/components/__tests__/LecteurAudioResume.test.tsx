// @vitest-environment jsdom
// Tests unitaires + audit axe-core du lecteur de résumé audio (5.3), de la bibliothèque
// de résumés écrits/audio (Mourchid) et du catalogue complet u1–u11 (55/55 leçons).

import { act } from 'react';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import axe from 'axe-core';
import LecteurAudioResume, { STATUT_AUDIO_RESUME } from '../LecteurAudioResume';
import BibliothequeResumesLecons from '../BibliothequeResumesLecons';
import { AUDIO_LECONS, audioPourLecon } from '../../data/audioLecons';
import { UNITES } from '../../data/programme';
import {
  MESSAGE_AUDIO_RESUME_HORS_LIGNE,
  urlAudioLecon,
} from '../../utils/audioUrl';
import { reinitialiserChargeurAudioLeconsPourTests } from '../../utils/audioLeconsChargeur';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const HORS_PERIMETRE_AXE = {
  'color-contrast': { enabled: false },
  region: { enabled: false },
  'landmark-one-main': { enabled: false },
  'page-has-heading-one': { enabled: false },
  'html-has-lang': { enabled: false },
};

let racine: Root | null = null;
let hote: HTMLDivElement | null = null;

beforeEach(() => {
  reinitialiserChargeurAudioLeconsPourTests();
});

afterEach(() => {
  act(() => racine?.unmount());
  hote?.remove();
  racine = null;
  hote = null;
  reinitialiserChargeurAudioLeconsPourTests();
});

async function rendre(noeud: React.ReactElement): Promise<HTMLDivElement> {
  hote = document.createElement('div');
  document.body.appendChild(hote);
  racine = createRoot(hote);
  await act(async () => racine!.render(noeud));
  return hote;
}

describe('registre audio leçons (src/data/audioLecons.ts) — couverture 55/55 officielle', () => {
  it('couvre exactement les 55 leçons officielles (u1–u11) avec durées 30–90 s, tailles ≤ 500 Ko, script 100 % arabe et 0 reviewed', () => {
    const leconsOfficielles = UNITES.flatMap((u) =>
      u.lessonIds.map((id) => ({ id, unite: u.id })),
    );
    expect(leconsOfficielles).toHaveLength(55);
    expect(AUDIO_LECONS).toHaveLength(55);

    const fichiersVus = new Set<string>();
    for (const { id, unite } of leconsOfficielles) {
      const p = audioPourLecon(id);
      expect(p, id).toBeDefined();
      expect(p!.uniteId).toBe(unite);
      expect(p!.voixId).toBe('voice-03');
      expect(p!.dureeSecondes).toBeGreaterThanOrEqual(30);
      expect(p!.dureeSecondes).toBeLessThanOrEqual(90);
      expect(p!.tailleKo).toBeLessThanOrEqual(500);
      expect(p!.texteAr.length).toBeGreaterThan(400);
      expect(/[A-Za-z]/.test(p!.texteAr), `Latin dans ${id}`).toBe(false);
      expect(p!.texteAr.includes('/20'), `/20 dans ${id}`).toBe(false);
      expect(p!.statut).toBe('a_valider_enseignant');
      expect(p!.reviewed).toBe(false);
      expect(fichiersVus.has(p!.fichier)).toBe(false);
      expect(existsSync(join(process.cwd(), 'public/audio/lecons', p!.fichier))).toBe(true);
      fichiersVus.add(p!.fichier);
    }
  });

  it('résout vers /audio/lecons/ par défaut, accepte un override R2 et rejette les chemins invalides', () => {
    expect(urlAudioLecon('lecon_transcription.mp3')).toBe('/audio/lecons/lecon_transcription.mp3');
    expect(urlAudioLecon('lecon_transcription.mp3', '')).toBeNull();
    expect(
      urlAudioLecon('lecon_transcription.mp3', 'https://media.bawssala.dz/audio/lecons'),
    ).toBe('https://media.bawssala.dz/audio/lecons/lecon_transcription.mp3');
    expect(() => urlAudioLecon('../fuite.mp3', 'https://media.bawssala.dz/audio/lecons')).toThrow();
  });
});

describe('LecteurAudioResume — contrôles, résumé écrit hors-ligne et accessibilité axe-core', () => {
  it('rend avatar animé en lecture, Play/Pause, barre de progression, −10 s, vitesse 1×/1.25×/1.5× et 0 violation axe', async () => {
    const importeur = vi.fn(async () => ({ AUDIO_LECONS }));
    reinitialiserChargeurAudioLeconsPourTests(importeur);

    const zone = await rendre(
      <LecteurAudioResume
        lessonId="d1-u1-l1-expression-genique"
        baseUrl="https://media.bawssala.dz/audio/lecons"
      />,
    );

    expect(zone.textContent).toContain(STATUT_AUDIO_RESUME);
    expect(zone.textContent).toContain('0:55');
    expect(zone.querySelector('img[src="/mascotte.webp"]')).not.toBeNull();
    expect(zone.querySelector('[data-etat-lecture]')?.getAttribute('data-etat-lecture')).toBe('repos');

    const audio = zone.querySelector('audio') as HTMLAudioElement;
    expect(audio).not.toBeNull();
    expect(audio.getAttribute('preload')).toBe('none');
    expect(audio.getAttribute('src')).toBe(
      'https://media.bawssala.dz/audio/lecons/d1-u1-l1-expression-genique.mp3',
    );

    const playMock = vi.fn().mockResolvedValue(undefined);
    const pauseMock = vi.fn();
    Object.defineProperty(audio, 'play', { value: playMock, configurable: true });
    Object.defineProperty(audio, 'pause', { value: pauseMock, configurable: true });

    const btnPlay = zone.querySelector(
      'button[aria-label="استمع للملخّص بصوت المرشد"]',
    ) as HTMLButtonElement;
    expect(btnPlay).not.toBeNull();
    expect(btnPlay.textContent).toContain('استمع للملخّص بصوت المرشد');
    await act(async () => btnPlay.click());
    expect(playMock).toHaveBeenCalledTimes(1);
    expect(zone.querySelector('[data-etat-lecture]')?.getAttribute('data-etat-lecture')).toBe('actif');

    Object.defineProperty(audio, 'currentTime', { value: 25, writable: true, configurable: true });
    await act(async () => {
      audio.dispatchEvent(new Event('timeupdate'));
    });
    expect(zone.textContent).toContain('0:25');

    const btnRecul = zone.querySelector('button[aria-label="رجوع عشر ثوانٍ"]') as HTMLButtonElement;
    await act(async () => btnRecul.click());
    expect(audio.currentTime).toBe(15);
    expect(zone.textContent).toContain('0:15');

    const btnVitesse = zone.querySelector('button[aria-label^="سرعة التشغيل"]') as HTMLButtonElement;
    expect(btnVitesse.textContent).toBe('1×');
    await act(async () => btnVitesse.click());
    expect(btnVitesse.textContent).toBe('1.25×');
    expect(audio.playbackRate).toBe(1.25);
    await act(async () => btnVitesse.click());
    expect(btnVitesse.textContent).toBe('1.5×');
    expect(audio.playbackRate).toBe(1.5);
    await act(async () => btnVitesse.click());
    expect(btnVitesse.textContent).toBe('1×');
    expect(audio.playbackRate).toBe(1);

    const btnPause = zone.querySelector(
      'button[aria-label="إيقاف مؤقّت للملخّص الصوتي"]',
    ) as HTMLButtonElement;
    await act(async () => btnPause.click());
    expect(pauseMock).toHaveBeenCalledTimes(1);
    expect(zone.querySelector('[data-etat-lecture]')?.getAttribute('data-etat-lecture')).toBe('repos');

    const audit = await axe.run(zone, {
      resultTypes: ['violations'],
      rules: HORS_PERIMETRE_AXE,
    });
    expect(audit.violations).toEqual([]);
  });

  it('en mode hors-ligne sans cache, affiche le résumé écrit complet, désactive l’audio sans erreur console et garde 0 violation axe', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const importeur = vi.fn(async () => ({ AUDIO_LECONS }));
    reinitialiserChargeurAudioLeconsPourTests(importeur);

    const zone = await rendre(
      <LecteurAudioResume
        lessonId="phase1_chapitres_1_2"
        baseUrl="https://media.bawssala.dz/audio/lecons"
        horsLigneForce
      />,
    );

    expect(zone.querySelector('[role="status"]')?.textContent).toBe(MESSAGE_AUDIO_RESUME_HORS_LIGNE);
    const btnPlay = zone.querySelector(
      'button[aria-label="استمع للملخّص بصوت المرشد"]',
    ) as HTMLButtonElement;
    expect(btnPlay.disabled).toBe(true);
    // Le résumé écrit du script est affiché automatiquement en vue complète hors-ligne
    expect(zone.textContent).toContain('ملخّص المُرشد المكتوب');
    expect(zone.textContent).toContain('الشبكة الهيولية الداخلية المحبّبة');
    expect(errSpy).not.toHaveBeenCalled();

    const audit = await axe.run(zone, {
      resultTypes: ['violations'],
      rules: HORS_PERIMETRE_AXE,
    });
    expect(audit.violations).toEqual([]);
    errSpy.mockRestore();
  });

  it('ne rend rien pour une leçon sans piste audio enregistrée', async () => {
    const importeur = vi.fn(async () => ({ AUDIO_LECONS }));
    reinitialiserChargeurAudioLeconsPourTests(importeur);

    const zone = await rendre(<LecteurAudioResume lessonId="lecon-inexistante" baseUrl="" />);
    expect(zone.innerHTML).toBe('');
  });
});

describe('BibliothequeResumesLecons — bibliothèque des résumés écrits/audio dans Mourchid', () => {
  it('affiche les 55 lignes compactes (textes repliés), lecture 1-tap auto, filtre unité, recherche arabe et 0 violation axe', async () => {
    const playSpy = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
    const importeur = vi.fn(async () => ({ AUDIO_LECONS }));
    reinitialiserChargeurAudioLeconsPourTests(importeur);

    const zone = await rendre(<BibliothequeResumesLecons />);
    expect(zone.textContent).toContain('مكتبة ملخّصات المُرشد في دقيقة');
    expect(zone.querySelectorAll('li')).toHaveLength(AUDIO_LECONS.length);

    // Par défaut, les transcriptions longues sont repliées pour garder le défilement compact
    expect(zone.textContent).not.toContain('الشبكة الهيولية الداخلية المحبّبة');

    // Filtre sur la الوحدة 2 (4 leçons)
    const titreU2 = UNITES.find((u) => u.id === 'u2')!.titre;
    const boutonsFiltres = Array.from(zone.querySelectorAll('button[aria-pressed]')) as HTMLButtonElement[];
    const btnU2 = boutonsFiltres.find((b) => b.textContent?.includes(titreU2));
    expect(btnU2).toBeDefined();
    await act(async () => btnU2!.click());
    expect(zone.querySelectorAll('li')).toHaveLength(4);
    expect(zone.textContent).toContain('النمذجة الفراغية للبروتينات');

    // Lecture 1-tap : ouvre le lecteur compact (masquerTexte) et lance la lecture immédiatement
    const btnPlayRow = zone.querySelector('li button[aria-label^="استماع فوري"]') as HTMLButtonElement | null;
    expect(btnPlayRow).not.toBeNull();
    await act(async () => btnPlayRow!.click());
    expect(playSpy).toHaveBeenCalledTimes(1);
    expect(zone.textContent).not.toContain('قراءة ملخّص المُرشد المكتوب');

    // Bouton « قراءة النصّ » déplie le texte complet de la leçon
    const btnLireTexte = [...zone.querySelectorAll('li button')].find((b) =>
      b.textContent?.includes('قراءة النصّ'),
    ) as HTMLButtonElement | undefined;
    expect(btnLireTexte).toBeDefined();
    await act(async () => btnLireTexte!.click());
    expect(btnLireTexte?.getAttribute('aria-expanded')).toBe('true');

    // Recherche arabe insensible aux voyelles/hamzas : affiche automatiquement le texte correspondant
    const btnTous = boutonsFiltres.find((b) => b.textContent?.includes('الكل'));
    await act(async () => btnTous!.click());
    const champRecherche = zone.querySelector('input[type="search"]') as HTMLInputElement | null;
    expect(champRecherche).not.toBeNull();
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
      setter?.call(champRecherche, 'كالفن');
      champRecherche!.dispatchEvent(new Event('input', { bubbles: true }));
    });
    expect(zone.querySelectorAll('li').length).toBeGreaterThanOrEqual(1);
    expect(zone.textContent).toContain('كالفن');

    const audit = await axe.run(zone, {
      resultTypes: ['violations'],
      rules: HORS_PERIMETRE_AXE,
    });
    expect(audit.violations).toEqual([]);
    playSpy.mockRestore();
  });

  it('met l audio en pause au démontage et respecte masquerTexte', async () => {
    const pauseSpy = vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
    const zone = await rendre(
      <LecteurAudioResume
        lessonId="phase1_chapitres_1_2"
        baseUrl="https://audio.example.test"
        horsLigneForce={false}
        masquerTexte
      />,
    );
    const audioEl = zone.querySelector('audio');
    expect(audioEl).not.toBeNull();
    expect(zone.textContent).not.toContain('قراءة ملخّص المُرشد المكتوب');
    Object.defineProperty(audioEl!, 'paused', { value: false, configurable: true });

    await act(async () => {
      racine?.unmount();
      racine = null;
    });
    expect(pauseSpy).toHaveBeenCalledTimes(1);
    pauseSpy.mockRestore();
  });
});
