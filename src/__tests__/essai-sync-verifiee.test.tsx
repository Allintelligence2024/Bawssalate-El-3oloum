// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import EssaiSyncVerifiee from '../components/EssaiSyncVerifiee';

it('exige des gestes explicites et conserve la génération lors d’un effacement incertain', async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  const zone = document.createElement('div');
  const root = createRoot(zone);
  const api = {
    etat: vi.fn(async () => ({ generation: 2, autorise: false })),
    consentir: vi.fn(async () => ({ resultat: 'confirme' as const, generation: 3 })),
    ecrire: vi.fn(async () => 'confirme' as const),
    effacer: vi.fn().mockResolvedValueOnce('indetermine').mockResolvedValueOnce('confirme'),
  };
  const clic = async (texte: string) => {
    const bouton = [...zone.querySelectorAll('button')].find(b => b.textContent === texte);
    expect(bouton).toBeDefined();
    await act(async () => bouton!.click());
  };
  try {
    await act(async () => root.render(<EssaiSyncVerifiee api={api} />));
    expect(api.etat).not.toHaveBeenCalled();
    await clic('اقرأ حالة الاختبار');
    expect(api.consentir).not.toHaveBeenCalled();
    await clic('أوافق على إرسال بيانات الاختبار');
    expect(api.consentir.mock.calls).toEqual([[2]]);
    expect(api.ecrire).not.toHaveBeenCalled();
    await clic('أرسل الأرقام التجريبية');
    expect(api.ecrire.mock.calls).toEqual([[3, { minutes_totales: 12, lecons_terminees: 1, revisions: 0 }]]);
    await clic('احذف بيانات الاختبار');
    expect(zone.textContent).not.toContain('اقرأ حالة الاختبار');
    expect(zone.textContent).toContain('نتيجة الحذف غير مؤكّدة');
    await clic('أعد محاولة الحذف');
    expect(api.effacer.mock.calls).toEqual([[3], [3]]);
    expect(zone.textContent).toContain('أكّد الخادم حذف');
  } finally { await act(async () => root.unmount()); }
});
