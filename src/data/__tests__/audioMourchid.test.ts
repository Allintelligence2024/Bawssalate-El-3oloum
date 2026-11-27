import { describe, expect, it, vi } from 'vitest';
import {
  AUDIO_MOURCHID,
  audioPourUnite,
  audiosMethodo,
  audiosPourBranche,
} from '../audioMourchid';
import { UNITES } from '../programme';
import { BRANCHES } from '../mourchid';
import {
  formatDureeAudio,
  urlAudioMourchid,
} from '../../utils/audioUrl';
import {
  chargerAudioMourchid,
  lireAudioMourchidCache,
  reinitialiserChargeurAudioMourchidPourTests,
} from '../../utils/audioMourchidChargeur';

const EMOJI = /[\u{1F300}-\u{1FAFF}\u{FE0F}]/u;
const LATIN_DANS_ARABE = /[\u0600-\u06FF][a-zA-Z]{2,}|[a-zA-Z]{2,}[\u0600-\u06FF]/;

describe('registre « voix du المرشد » (Phase 3)', () => {
  it('contient exactement 10 capsules (5 unités D1 + 2 domaines D2/D3 + 3 méthodologie)', () => {
    expect(AUDIO_MOURCHID).toHaveLength(10);
    expect(AUDIO_MOURCHID.filter((p) => p.categorie === 'unite')).toHaveLength(5);
    expect(AUDIO_MOURCHID.filter((p) => p.categorie === 'domaine')).toHaveLength(2);
    expect(audiosMethodo()).toHaveLength(3);
  });

  it('couvre les 11 unités officielles (u1..u11) sans omission', () => {
    for (const u of UNITES) {
      const piste = audioPourUnite(u.id);
      expect(piste, `unité sans capsule audio : ${u.id}`).toBeDefined();
    }
  });

  it('couvre les 5 branches de l’écran المرشد avec au moins une capsule méthodologique', () => {
    for (const b of BRANCHES) {
      expect(audiosPourBranche(b.id).length, `branche sans audio : ${b.id}`).toBeGreaterThan(0);
    }
  });

  it('garantit des identifiants et noms de fichiers uniques, des métadonnées valides et 0 reviewed: true', () => {
    const ids = new Set<string>();
    const fichiers = new Set<string>();
    for (const p of AUDIO_MOURCHID) {
      expect(ids.has(p.id)).toBe(false);
      expect(fichiers.has(p.fichier)).toBe(false);
      ids.add(p.id);
      fichiers.add(p.fichier);

      expect(p.fichier).toMatch(/^mourchid-[a-z0-9-]+\.mp3$/);
      expect(p.dureeSecondes).toBeGreaterThanOrEqual(60);
      expect(p.dureeSecondes).toBeLessThanOrEqual(120);
      expect(p.tailleKo).toBeGreaterThan(300);
      expect(p.tailleKo).toBeLessThan(1000);
      expect(p.texteAr.length).toBeGreaterThan(400);
      expect(p.statut).toBe('a_valider_enseignant');
      expect(p.reviewed).toBe(false);

      // Qualité éditoriale arabe : aucun emoji, aucun latin collé, aucune note /20.
      expect(p.titreAr).not.toMatch(EMOJI);
      expect(p.sousTitreAr).not.toMatch(EMOJI);
      expect(p.texteAr).not.toMatch(EMOJI);
      expect(p.texteAr).not.toMatch(LATIN_DANS_ARABE);
      expect(p.texteAr).not.toMatch(/\/\s*20\b/);
    }
  });
});

describe('résolveur URL R2 et formatage de durée (Phase 3)', () => {
  it('retourne null tant que VITE_AUDIO_BASE_URL n’est pas configuré', () => {
    expect(urlAudioMourchid('mourchid-u1.mp3', '')).toBeNull();
    expect(urlAudioMourchid('mourchid-u1.mp3', '   ')).toBeNull();
  });

  it('construit une URL R2 propre avec ou sans slash final', () => {
    expect(urlAudioMourchid('mourchid-u1.mp3', 'https://audio.example.com/mourchid')).toBe(
      'https://audio.example.com/mourchid/mourchid-u1.mp3',
    );
    expect(urlAudioMourchid('mourchid-u1.mp3', 'https://audio.example.com/mourchid/')).toBe(
      'https://audio.example.com/mourchid/mourchid-u1.mp3',
    );
  });

  it('rejette tout chemin relatif ou extension non audio', () => {
    expect(() => urlAudioMourchid('../secret.mp3', 'https://audio.example.com')).toThrow();
    expect(() => urlAudioMourchid('mourchid-u1.wav', 'https://audio.example.com')).toThrow();
    expect(() => urlAudioMourchid('dir/mourchid-u1.mp3', 'https://audio.example.com')).toThrow();
  });

  it('formate les durées en m:ss', () => {
    expect(formatDureeAudio(0)).toBe('0:00');
    expect(formatDureeAudio(73)).toBe('1:13');
    expect(formatDureeAudio(88)).toBe('1:28');
    expect(formatDureeAudio(-5)).toBe('0:00');
    expect(formatDureeAudio(Number.NaN)).toBe('0:00');
  });
});

describe('chargeur paresseux audioMourchidChargeur', () => {
  it('déduplique les chargements concurrents et met en cache le registre', async () => {
    const importeur = vi.fn(async () => ({ AUDIO_MOURCHID }));
    reinitialiserChargeurAudioMourchidPourTests(importeur);
    expect(lireAudioMourchidCache()).toBeNull();

    const [a, b] = await Promise.all([chargerAudioMourchid(), chargerAudioMourchid()]);
    expect(a).toHaveLength(10);
    expect(b).toBe(a);
    expect(lireAudioMourchidCache()).toBe(a);
    expect(importeur).toHaveBeenCalledTimes(1);

    reinitialiserChargeurAudioMourchidPourTests();
  });
});
