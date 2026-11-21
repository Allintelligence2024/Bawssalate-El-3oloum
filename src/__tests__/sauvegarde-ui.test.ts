// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import Ana from '../components/Ana';
import { etatVierge } from '../types';
import { chargerEtat, paquetExportComplet } from '../utils/storage';
import { CLE_CARNET_BOUSSOLE } from '../utils/carnetBoussole';
import { appliquerStats, statsActuelles, suspendreEcritureStats } from '../utils/stats';

vi.mock('../components/CarteHorsLigne', () => ({ default: () => null }));
let zone: HTMLDivElement, root: Root;
const restaurer = vi.fn();
const reinitialiser = vi.fn(() => true);
const rien = () => {};
function props(etat = etatVierge()) {
  return { etat, onEffacerCarnet: rien, onNom: rien, onDateBac: rien, onSupprimerNote: rien,
    onReinitialiser: reinitialiser, onRestaurer: restaurer, onConsentementSync: rien, onObjectif: rien, onModeIntensif: rien,
    onTailleTexte: rien, onOuvrirDiagnostic: rien, onOuvrirLecon: rien, onDemarrerRevision: rien, onBasculerFavori: rien,
    onRappel: rien, onAllerExercices: rien, onOuvrirConfidentialite: rien };
}
beforeEach(async () => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  restaurer.mockReset();
  reinitialiser.mockReset().mockReturnValue(true);
  localStorage.clear();
  zone = document.createElement('div'); document.body.appendChild(zone); root = createRoot(zone);
  await act(async () => root.render(createElement(Ana, props())));
});
afterEach(async () => { await act(async () => root.unmount()); zone.remove(); vi.restoreAllMocks(); });
async function charger(contenu: string, taille = contenu.length) {
  const input = zone.querySelector('input[type=file]') as HTMLInputElement;
  Object.defineProperty(input, 'files', { configurable: true, value: [{ size: taille, text: async () => contenu }] });
  await act(async () => { input.dispatchEvent(new Event('change', { bubbles: true })); });
}
async function cliquer(texte: string) {
  const bouton = [...zone.querySelectorAll('button')].find(b => b.textContent?.trim() === texte);
  expect(bouton, texte).toBeDefined();
  await act(async () => { bouton!.click(); });
}
const carnet = { version: 1 as const, solo: 'إجابة خاصة', link: '', first: '', events: '', inhibit: '', soloHelp: false, docHelp: false, recent: ['solo'] };

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
    const encode = new TextEncoder();
    const limite = 5 * 1024 * 1024;
    const notes = Array.from({ length: 1250 }, (_, i) => ({
      id: String(i), kind: 'note', texte: 'مراجعة الدرس '.repeat(145), ts: '2026-11-19',
    }));
    const base = JSON.stringify({ version: 3, progression: {}, notes });
    const contenu = base + ' '.repeat(limite - encode.encode(base).length);
    await charger(contenu, encode.encode(contenu).length);
    await cliquer('نعم، استورد النسخة');
    expect(restaurer).toHaveBeenCalledTimes(1);
    expect(restaurer.mock.calls[0][0].notes).toEqual(notes);
    await charger(contenu + ' ', encode.encode(contenu + ' ').length);
    expect(restaurer).toHaveBeenCalledTimes(1);
    expect(zone.textContent).toContain('الملف أكبر');
  });
  it('demande une confirmation non bloquante et ignore compte et consentement du fichier', async () => {
    const paquet = paquetExportComplet(etatVierge());
    Object.assign(paquet.etat, { compte: { email: 'autre', jeton: 'secret' }, consentementSync: true });
    const confirmationBloquante = vi.spyOn(window, 'confirm');
    await charger(JSON.stringify(paquet));
    expect(restaurer).not.toHaveBeenCalled();
    expect(document.activeElement?.id).toBe('confirmation-import-titre');
    await cliquer('إلغاء الاستيراد');
    expect(restaurer).not.toHaveBeenCalled();
    expect(document.activeElement?.textContent?.trim()).toBe('استيراد نسخة');
    await charger(JSON.stringify(paquet));
    await cliquer('نعم، استورد النسخة');
    expect(confirmationBloquante).not.toHaveBeenCalled();
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
  it('ancien fichier plat sans statistiques ni carnet : les données courantes restent', async () => {
    await charger(JSON.stringify({ progression: {}, version: 1 }));
    expect(zone.textContent).toContain('لا يتضمّن الملف مسوّدات البوصلة؛ ستبقى الحالية');
    await cliquer('نعم، استورد النسخة');
    expect(restaurer).toHaveBeenCalledTimes(1);
    expect(restaurer.mock.calls[0][1]).toBeUndefined();
    expect(restaurer.mock.calls[0][2]).toBeUndefined();
    expect(restaurer.mock.calls[0][3]).toBeUndefined();
  });
  it('prévient explicitement si un nouveau fichier sans carnet effacera le carnet local', async () => {
    const paquet = paquetExportComplet(etatVierge()); // aucun carnet à l'export
    localStorage.setItem(CLE_CARNET_BOUSSOLE, JSON.stringify(carnet));
    await charger(JSON.stringify(paquet));
    expect(zone.textContent).toContain('ستُمسح مسوّدات البوصلة الحالية');
    await cliquer('نعم، استورد النسخة');
    expect(restaurer.mock.calls[0][2]).toBeNull();
    expect(restaurer.mock.calls[0][3]).toBe(JSON.stringify(carnet));
  });
  it('transmet le carnet présent et indique ce que remplace la confirmation', async () => {
    localStorage.setItem(CLE_CARNET_BOUSSOLE, JSON.stringify(carnet));
    const paquet = paquetExportComplet(etatVierge());
    await charger(JSON.stringify(paquet));
    expect(zone.textContent).toContain('ستُستبدل مسوّدات البوصلة الحالية بما في الملف');
    await cliquer('نعم، استورد النسخة');
    expect(restaurer.mock.calls[0][2]).toEqual(carnet);
  });
  it('capture la valeur avant la confirmation d’import même si un autre onglet la change entre-temps', async () => {
    const paquet = paquetExportComplet(etatVierge());
    const ancienne = JSON.stringify(carnet);
    localStorage.setItem(CLE_CARNET_BOUSSOLE, ancienne);
    await charger(JSON.stringify(paquet));
    localStorage.setItem(CLE_CARNET_BOUSSOLE, JSON.stringify({ ...carnet, solo: 'nouvelle saisie' }));
    await cliquer('نعم، استورد النسخة');
    expect(restaurer.mock.calls[0][3]).toBe(ancienne);
  });
  it('ne remet pas une lecture plus ancienne devant le dernier fichier choisi', async () => {
    const input = zone.querySelector('input[type=file]') as HTMLInputElement;
    let terminer!: (texte: string) => void;
    const lente = new Promise<string>((resolve) => { terminer = resolve; });
    Object.defineProperty(input, 'files', { configurable: true, value: [{ size: 100, text: () => lente }] });
    await act(async () => { input.dispatchEvent(new Event('change', { bubbles: true })); });
    await charger(JSON.stringify({ version: 1, progression: {}, nom: 'dernier fichier' }));
    await act(async () => { terminer(JSON.stringify({ version: 1, progression: {}, nom: 'lecture tardive' })); await lente; });
    await cliquer('نعم، استورد النسخة');
    expect(restaurer.mock.calls[0][0].nom).toBe('dernier fichier');
  });
  it('capture la valeur avant la confirmation de suppression', async () => {
    const ancienne = JSON.stringify(carnet);
    localStorage.setItem(CLE_CARNET_BOUSSOLE, ancienne);
    await cliquer('مسح كل بياناتي');
    expect(document.activeElement?.id).toBe('confirmation-effacement-titre');
    expect([...zone.querySelectorAll('button')].find(b => b.textContent?.trim() === 'مسح كل بياناتي')?.getAttribute('aria-expanded')).toBe('true');
    await cliquer('تراجع');
    expect(document.activeElement?.textContent?.trim()).toBe('مسح كل بياناتي');
    expect(reinitialiser).not.toHaveBeenCalled();
    await cliquer('مسح كل بياناتي');
    localStorage.setItem(CLE_CARNET_BOUSSOLE, JSON.stringify({ ...carnet, solo: 'nouvelle saisie' }));
    await cliquer('نعم، امسح كل شيء');
    expect(reinitialiser).toHaveBeenCalledWith(ancienne);
  });
  it('un carnet invalide bloque l’import avant même la confirmation', async () => {
    await charger(JSON.stringify({ version: 3, etat: { progression: {} }, carnetBoussole: { version: 99 } }));
    expect(zone.querySelector('#confirmation-import-titre')).toBeNull();
    expect(restaurer).not.toHaveBeenCalled();
    expect(zone.textContent).toContain('هذا الملف ليس نسخة احتياطية');
  });
  it('signale le carnet illisible sans lancer un export incomplet', async () => {
    localStorage.setItem(CLE_CARNET_BOUSSOLE, '{JSON cassé');
    await cliquer('تصدير نسختي');
    expect(zone.textContent).toContain('لم نصدّر نسخة ناقصة');
    expect(localStorage.getItem(CLE_CARNET_BOUSSOLE)).toBe('{JSON cassé');
  });
  it('refuse un export plus grand que la limite acceptée à l’import', async () => {
    localStorage.setItem(CLE_CARNET_BOUSSOLE, JSON.stringify({ ...carnet, solo: 'ش'.repeat(2_700_000) }));
    await cliquer('تصدير نسختي');
    expect(zone.textContent).toContain('النسخة أكبر من ٥ ميغابايت');
  });
  it('refuse un export dont un champ dépasse les limites du schéma d’import', async () => {
    await act(async () => root.render(createElement(Ana, props({ ...etatVierge(), nom: 'a'.repeat(301) }))));
    await cliquer('تصدير نسختي');
    expect(zone.textContent).toContain('تعذّر إنشاء نسخة قابلة للاستيراد');
  });
  it('signale une restauration en attente au lieu de produire un export incohérent', async () => {
    localStorage.setItem('murajih_restauration_v1', '{"etat":{"progression":{}}}');
    await cliquer('تصدير نسختي');
    expect(zone.textContent).toContain('استعادة غير مكتملة');
  });
  it('explique pourquoi des statistiques illisibles empêchent un export complet', async () => {
    const avant = statsActuelles();
    suspendreEcritureStats();
    try {
      await cliquer('تصدير نسختي');
      expect(zone.textContent).toContain('تعذّرت قراءة الإحصاءات المحفوظة');
      expect(zone.textContent).toContain('لم نصدّر نسخة ناقصة');
    } finally {
      await act(async () => appliquerStats(avant));
    }
  });
  it('explique pourquoi une progression illisible empêche un export complet', async () => {
    localStorage.setItem('murajih_svt_v1', '{JSON cassé');
    chargerEtat();
    try {
      await cliquer('تصدير نسختي');
      expect(zone.textContent).toContain('تعذّرت قراءة التقدّم المحفوظ');
      expect(zone.textContent).toContain('لم نصدّر نسخة ناقصة');
      expect(localStorage.getItem('murajih_svt_v1')).toBe('{JSON cassé');
    } finally {
      localStorage.removeItem('murajih_svt_v1');
      chargerEtat(); // simule un nouveau contexte pour les tests suivants
    }
  });
  it('un échec d’effacement n’est pas annoncé comme une suppression complète', async () => {
    reinitialiser.mockReturnValue(false);
    await cliquer('مسح كل بياناتي');
    await cliquer('نعم، امسح كل شيء');
    expect(zone.textContent).toContain('لم يُؤكّد مسح جميع البيانات');
  });
});
