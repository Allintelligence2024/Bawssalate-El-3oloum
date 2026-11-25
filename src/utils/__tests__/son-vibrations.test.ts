// Phase 3 — le seul retour haptique de l'app : une réussite, jamais une erreur.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { sonFaux, sonJuste, vibrerDoux } from '../son';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function vibreur() {
  const vibrate = vi.fn(() => true);
  vi.stubGlobal('navigator', { ...globalThis.navigator, vibrate });
  return vibrate;
}

describe('vibrerDoux', () => {
  it('demande une vibration de 15 ms', () => {
    const vibrate = vibreur();
    vibrerDoux();
    expect(vibrate).toHaveBeenCalledWith(15);
  });

  it('accepte une durée explicite et ne lève rien sans vibreur', () => {
    const vibrate = vibreur();
    vibrerDoux(30);
    expect(vibrate).toHaveBeenCalledWith(30);
    vi.stubGlobal('navigator', { ...globalThis.navigator, vibrate: undefined });
    expect(() => vibrerDoux()).not.toThrow();
  });

  it('un son de réussite vibre, un son d’erreur ne vibre pas', () => {
    const vibrate = vibreur();
    sonFaux();
    expect(vibrate).not.toHaveBeenCalled();
    sonJuste();
    expect(vibrate).toHaveBeenCalledWith(15);
  });
});
