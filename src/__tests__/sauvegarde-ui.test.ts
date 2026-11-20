// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import Ana from '../components/Ana';
import { etatVierge } from '../types';
import { paquetExportComplet } from '../utils/storage';

vi.mock('../components/CarteHorsLigne', () => ({ default: () => null }));
let zone: HTMLDivElement, root: Root;
const restaurer = vi.fn();
const rien = () => {};
beforeEach(async () => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  restaurer.mockReset();
  zone = document.createElement('div'); document.body.appendChild(zone); root = createRoot(zone);
  const props = { etat: etatVierge(), onEffacerCarnet: rien, onNom: rien, onDateBac: rien, onSupprimerNote: rien,
    onReinitialiser: rien, onRestaurer: restaurer, onConsentementSync: rien, onObjectif: rien, onModeIntensif: rien,
    onTailleTexte: rien, onOuvrirDiagnostic: rien, onOuvrirLecon: rien, onDemarrerRevision: rien, onBasculerFavori: rien,
    onRappel: rien, onAllerExercices: rien, onOuvrirConfidentialite: rien };
  await act(async () => root.render(createElement(Ana, props)));
});
afterEach(async () => { await act(async () => root.unmount()); zone.remove(); vi.restoreAllMocks(); });
async function charger(contenu: string, taille = contenu.length) {
  const input = zone.querySelector('input[type=file]') as HTMLInputElement;
  Object.defineProperty(input, 'files', { configurable: true, value: [{ size: taille, text: async () => contenu }] });
  await act(async () => { input.dispatchEvent(new Event('change', { bubbles: true })); });
}

describe('restauration dans l’interface', () => {
  it('rejette un fichier mal formé ou trop volumineux sans remplacer les données', async () => {
    await charger(JSON.stringify({ progression: [] }));
    expect(restaurer).not.toHaveBeenCalled();
    expect(zone.textContent).toContain('هذا الملف ليس نسخة احتياطية');
    await charger('{}', 5 * 1024 * 1024 + 1);
    expect(restaurer).not.toHaveBeenCalled();
    expect(zone.textContent).toContain('الملف أكبر');
  });
  it('accepte exactement 5 Mio de notes synthétiques UTF-8 et refuse un octet de plus', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const encode = new TextEncoder();
    const limite = 5 * 1024 * 1024;
    const notes = Array.from({ length: 1250 }, (_, i) => ({
      id: String(i), kind: 'note', texte: 'مراجعة الدرس '.repeat(145), ts: '2026-11-19',
    }));
    const base = JSON.stringify({ version: 3, progression: {}, notes });
    const contenu = base + ' '.repeat(limite - encode.encode(base).length);
    await charger(contenu, encode.encode(contenu).length);
    expect(restaurer).toHaveBeenCalledTimes(1);
    expect(restaurer.mock.calls[0][0].notes).toEqual(notes);
    await charger(contenu + ' ', encode.encode(contenu + ' ').length);
    expect(restaurer).toHaveBeenCalledTimes(1);
    expect(zone.textContent).toContain('الملف أكبر');
  });
  it('demande une confirmation et ignore compte et consentement du fichier', async () => {
    const paquet = paquetExportComplet(etatVierge());
    Object.assign(paquet.etat, { compte: { email: 'autre', jeton: 'secret' }, consentementSync: true });
    const confirmation = vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true);
    await charger(JSON.stringify(paquet));
    expect(restaurer).not.toHaveBeenCalled();
    await charger(JSON.stringify(paquet));
    expect(confirmation).toHaveBeenCalledTimes(2);
    expect(restaurer).toHaveBeenCalledTimes(1);
    expect(restaurer.mock.calls[0][0].compte).toBeUndefined();
    expect(restaurer.mock.calls[0][0].consentementSync).toBe(false);
    expect(restaurer.mock.calls[0][1]).toEqual(paquet.stats);
  });
  it('JSON illisible → message d\'erreur explicite, aucune restauration', async () => {
    await charger('{ceci n\'est pas du JSON');
    expect(restaurer).not.toHaveBeenCalled();
    expect(zone.textContent).toContain('لم أستطع قراءة الملف');
  });
  it('ancien fichier plat sans statistiques → restaurer(etat, undefined) : les stats courantes restent', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    await charger(JSON.stringify({ progression: {}, version: 1 }));
    expect(restaurer).toHaveBeenCalledTimes(1);
    expect(restaurer.mock.calls[0][1]).toBeUndefined();
  });
});
