// @vitest-environment jsdom
// Phase 3 — tests du lecteur « صوت المُرشد » et de son bloc paresseux.

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import LecteurAudioMourchid from '../LecteurAudioMourchid';
import AudioMourchidBloc from '../AudioMourchidBloc';
import { AUDIO_MOURCHID } from '../../data/audioMourchid';
import {
  MESSAGE_AUDIO_HORS_LIGNE,
  MESSAGE_AUDIO_R2_EN_ATTENTE,
} from '../../utils/audioUrl';
import { reinitialiserChargeurAudioMourchidPourTests } from '../../utils/audioMourchidChargeur';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let racine: Root | null = null;
let hote: HTMLDivElement | null = null;

beforeEach(() => {
  reinitialiserChargeurAudioMourchidPourTests();
});

afterEach(() => {
  act(() => racine?.unmount());
  hote?.remove();
  racine = null;
  hote = null;
  reinitialiserChargeurAudioMourchidPourTests();
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

  it('avec une base R2, monte <audio preload="none">, gère lecture/pause, vitesse et erreur hors ligne', async () => {
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

    const btnPause = zone.querySelector('button[aria-label="إيقاف مؤقّت لصوت المُرشد"]') as HTMLButtonElement;
    expect(btnPause).not.toBeNull();
    await act(async () => {
      btnPause.click();
    });
    expect(pauseMock).toHaveBeenCalledTimes(1);

    // Cycle de vitesse : 1x -> 1.15x -> 0.85x -> 1x
    const btnVitesse = zone.querySelector('button[aria-label^="سرعة التشغيل"]') as HTMLButtonElement;
    expect(btnVitesse.textContent).toBe('1x');
    await act(async () => btnVitesse.click());
    expect(btnVitesse.textContent).toBe('1.15x');
    await act(async () => btnVitesse.click());
    expect(btnVitesse.textContent).toBe('0.85x');

    // Erreur réseau hors ligne -> message arabe sobre
    await act(async () => {
      audio!.dispatchEvent(new Event('error'));
    });
    expect(zone.querySelector('[role="status"]')?.textContent).toBe(MESSAGE_AUDIO_HORS_LIGNE);
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
