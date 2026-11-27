// @vitest-environment jsdom
// Phase 3 + polissage audio — tests du lecteur « صوت المُرشد », contrôles unifiés (−10s,
// vitesse 1×/1.25×/1.5×, hors-ligne proactif), verrou de lecture unique et audit axe-core.

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import axe from 'axe-core';
import LecteurAudioMourchid from '../LecteurAudioMourchid';
import LecteurAudioResume from '../LecteurAudioResume';
import AudioMourchidBloc from '../AudioMourchidBloc';
import { AUDIO_MOURCHID } from '../../data/audioMourchid';
import { AUDIO_LECONS } from '../../data/audioLecons';
import {
  MESSAGE_AUDIO_HORS_LIGNE,
  MESSAGE_AUDIO_R2_EN_ATTENTE,
} from '../../utils/audioUrl';
import { reinitialiserChargeurAudioMourchidPourTests } from '../../utils/audioMourchidChargeur';
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
  reinitialiserChargeurAudioMourchidPourTests();
  reinitialiserChargeurAudioLeconsPourTests();
});

afterEach(() => {
  act(() => racine?.unmount());
  hote?.remove();
  racine = null;
  hote = null;
  reinitialiserChargeurAudioMourchidPourTests();
  reinitialiserChargeurAudioLeconsPourTests();
});

async function rendre(noeud: React.ReactElement): Promise<HTMLDivElement> {
  hote = document.createElement('div');
  document.body.appendChild(hote);
  racine = createRoot(hote);
  await act(async () => racine!.render(noeud));
  return hote;
}

describe('LecteurAudioMourchid', () => {
  const pisteU1 = AUDIO_MOURCHID[0];
  const pisteU2 = AUDIO_MOURCHID[1];

  it('avec baseUrl="", affiche le repli texte honnête et ouvre la transcription complète', async () => {
    const zone = await rendre(<LecteurAudioMourchid piste={pisteU1} baseUrl="" />);
    expect(zone.querySelector('audio')).toBeNull();
    expect(zone.textContent).toContain(MESSAGE_AUDIO_R2_EN_ATTENTE);
    expect(zone.textContent).toContain('قيد المراجعة التربوية');
    expect(zone.textContent).toContain('1:33');

    const btnTexte = [...zone.querySelectorAll('button')].find((b) =>
      b.textContent?.includes('اقرأ النصّ الكامل'),
    );
    expect(btnTexte).toBeDefined();
    expect(btnTexte?.getAttribute('aria-expanded')).toBe('false');

    await act(async () => {
      btnTexte!.click();
    });
    expect(btnTexte?.getAttribute('aria-expanded')).toBe('true');
    expect(zone.textContent).toContain('أهلاً بكم أبنائي طلبة البكالوريا في الوحدة الأولى');
  });

  it('par défaut (sans baseUrl), monte <audio preload="none"> sur /audio/mourchid/', async () => {
    const zone = await rendre(<LecteurAudioMourchid piste={pisteU1} />);
    const audio = zone.querySelector('audio') as HTMLAudioElement | null;
    expect(audio).not.toBeNull();
    expect(audio?.getAttribute('preload')).toBe('none');
    expect(audio?.getAttribute('src')).toBe('/audio/mourchid/mourchid-u1.mp3');
  });

  it('gère lecture/pause, recul −10s, vitesse unifiée 1×/1.25×/1.5×, erreur réseau et 0 violation axe', async () => {
    const zone = await rendre(
      <LecteurAudioMourchid piste={pisteU1} baseUrl="https://cdn.example.com/audio/mourchid" />,
    );
    const audio = zone.querySelector('audio') as HTMLAudioElement | null;
    expect(audio).not.toBeNull();
    expect(audio?.getAttribute('preload')).toBe('none');
    expect(audio?.getAttribute('src')).toBe('https://cdn.example.com/audio/mourchid/mourchid-u1.mp3');

    const playMock = vi.fn().mockResolvedValue(undefined);
    const pauseMock = vi.fn();
    Object.defineProperty(audio!, 'play', { value: playMock, configurable: true });
    Object.defineProperty(audio!, 'pause', { value: pauseMock, configurable: true });

    const btnLecture = zone.querySelector('button[aria-label="تشغيل صوت المُرشد"]') as HTMLButtonElement;
    expect(btnLecture).not.toBeNull();
    await act(async () => {
      btnLecture.click();
    });
    expect(playMock).toHaveBeenCalledTimes(1);
    expect(zone.querySelector('[data-etat-lecture]')?.getAttribute('data-etat-lecture')).toBe('actif');

    // Recul −10s synchronisé avec currentTime
    Object.defineProperty(audio!, 'currentTime', { value: 28, writable: true, configurable: true });
    await act(async () => {
      audio!.dispatchEvent(new Event('timeupdate'));
    });
    const btnRecul = zone.querySelector('button[aria-label="رجوع عشر ثوانٍ"]') as HTMLButtonElement;
    expect(btnRecul).not.toBeNull();
    await act(async () => {
      btnRecul.click();
    });
    expect(audio!.currentTime).toBe(18);

    const btnPause = zone.querySelector('button[aria-label="إيقاف مؤقّت لصوت المُرشد"]') as HTMLButtonElement;
    expect(btnPause).not.toBeNull();
    await act(async () => {
      btnPause.click();
    });
    expect(pauseMock).toHaveBeenCalledTimes(1);
    expect(zone.querySelector('[data-etat-lecture]')?.getAttribute('data-etat-lecture')).toBe('repos');

    // Cycle de vitesse unifié : 1× -> 1.25× -> 1.5× -> 1×
    const btnVitesse = zone.querySelector('button[aria-label^="سرعة التشغيل"]') as HTMLButtonElement;
    expect(btnVitesse.textContent).toBe('1×');
    await act(async () => btnVitesse.click());
    expect(btnVitesse.textContent).toBe('1.25×');
    expect(audio!.playbackRate).toBe(1.25);
    await act(async () => btnVitesse.click());
    expect(btnVitesse.textContent).toBe('1.5×');
    expect(audio!.playbackRate).toBe(1.5);
    await act(async () => btnVitesse.click());
    expect(btnVitesse.textContent).toBe('1×');

    const audit = await axe.run(zone, {
      resultTypes: ['violations'],
      rules: HORS_PERIMETRE_AXE,
    });
    expect(audit.violations).toEqual([]);

    // Erreur réseau hors ligne -> message arabe sobre + ouverture auto du texte
    await act(async () => {
      audio!.dispatchEvent(new Event('error'));
    });
    expect(zone.querySelector('[role="status"]')?.textContent).toBe(MESSAGE_AUDIO_HORS_LIGNE);
    expect(zone.textContent).toContain('أهلاً بكم أبنائي طلبة البكالوريا في الوحدة الأولى');
  });

  it('en mode hors-ligne sans cache, désactive les contrôles et ouvre la transcription automatiquement', async () => {
    const zone = await rendre(<LecteurAudioMourchid piste={pisteU1} horsLigneForce />);
    const btnLecture = zone.querySelector('button[aria-label="تشغيل صوت المُرشد"]') as HTMLButtonElement;
    expect(btnLecture.disabled).toBe(true);
    expect(zone.querySelector('[role="status"]')?.textContent).toBe(MESSAGE_AUDIO_HORS_LIGNE);
    expect(zone.textContent).toContain('أهلاً بكم أبنائي طلبة البكالوريا في الوحدة الأولى');
  });

  it('verrou audio unique : lancer une capsule ou un résumé de leçon met automatiquement l’autre en pause', async () => {
    const importeur = vi.fn(async () => ({ AUDIO_LECONS }));
    reinitialiserChargeurAudioLeconsPourTests(importeur);

    const zone = await rendre(
      <div>
        <LecteurAudioMourchid piste={pisteU1} />
        <LecteurAudioMourchid piste={pisteU2} />
        <LecteurAudioResume lessonId="d1-u1-l1-expression-genique" horsLigneForce={false} />
      </div>,
    );

    const audios = [...zone.querySelectorAll('audio')] as HTMLAudioElement[];
    expect(audios).toHaveLength(3);
    const mocks = audios.map((a) => {
      const play = vi.fn().mockResolvedValue(undefined);
      const pause = vi.fn();
      Object.defineProperty(a, 'play', { value: play, configurable: true });
      Object.defineProperty(a, 'pause', { value: pause, configurable: true });
      return { play, pause };
    });

    // 1. Lancer la capsule U1
    const btnCap1 = zone.querySelectorAll('button[aria-label="تشغيل صوت المُرشد"]')[0] as HTMLButtonElement;
    await act(async () => btnCap1.click());
    expect(mocks[0].play).toHaveBeenCalledTimes(1);
    expect(zone.querySelectorAll('[data-etat-lecture="actif"]')).toHaveLength(1);

    // 2. Lancer la capsule U2 -> U1 est automatiquement mise en pause
    const btnCap2 = zone.querySelector('button[aria-label="تشغيل صوت المُرشد"]') as HTMLButtonElement;
    await act(async () => btnCap2.click());
    expect(mocks[0].pause).toHaveBeenCalledTimes(1);
    expect(mocks[1].play).toHaveBeenCalledTimes(1);
    expect(zone.querySelectorAll('[data-etat-lecture="actif"]')).toHaveLength(1);

    // 3. Lancer le résumé de leçon -> U2 est automatiquement mise en pause
    const btnLecon = zone.querySelector('button[aria-label="استمع للملخّص بصوت المرشد"]') as HTMLButtonElement;
    await act(async () => btnLecon.click());
    expect(mocks[1].pause).toHaveBeenCalledTimes(1);
    expect(mocks[2].play).toHaveBeenCalledTimes(1);
    expect(zone.querySelectorAll('[data-etat-lecture="actif"]')).toHaveLength(1);
  });
});

describe('AudioMourchidBloc — chargement paresseux et filtrage', () => {
  it('filtre par unité (y compris u6..u11 via les capsules de domaine) et par mode méthodologie', async () => {
    const importeur = vi.fn(async () => ({ AUDIO_MOURCHID }));
    reinitialiserChargeurAudioMourchidPourTests(importeur);

    const zoneU7 = await rendre(<AudioMourchidBloc uniteId="u7" compact baseUrl="" />);
    expect(zoneU7.textContent).toContain('المجال الثاني');
    expect(zoneU7.querySelectorAll('section')).toHaveLength(1);

    act(() => racine?.unmount());
    hote?.remove();
    const zoneMethodo = await rendre(<AudioMourchidBloc modeMethodo baseUrl="" />);
    expect(zoneMethodo.querySelectorAll('section')).toHaveLength(3);
    expect(importeur).toHaveBeenCalledTimes(1);
  });
});
