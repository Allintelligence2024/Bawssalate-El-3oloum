// وضع توفير الأنترنت 4G (Data-Saver) — يحدّ من التخزين التلقائي للصوت والصور الثقيلة
// ويبلغ عامل الخدمة (sw.js) مباشرة عبر رسالة CONFIG_DATA_SAVER.

export const CLE_DATA_SAVER = 'kunz_data_saver_4g';
const EVT_DATA_SAVER = 'kunz:data-saver-change';

export function lireDataSaver4G(): boolean {
  if (typeof localStorage === 'undefined') return false;
  try {
    return localStorage.getItem(CLE_DATA_SAVER) === '1';
  } catch {
    return false;
  }
}

export function notifierSwDataSaver(actif: boolean): void {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
  try {
    const message = { type: 'CONFIG_DATA_SAVER', actif };
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage(message);
    }
    void navigator.serviceWorker.ready
      .then((reg) => reg.active?.postMessage(message))
      .catch(() => { /* لا شيء إن لم يكن عامل الخدمة جاهزًا */ });
  } catch {
    /* ignore */
  }
}

export function ecrireDataSaver4G(actif: boolean): boolean {
  try {
    if (typeof localStorage !== 'undefined') {
      if (actif) localStorage.setItem(CLE_DATA_SAVER, '1');
      else localStorage.removeItem(CLE_DATA_SAVER);
    }
  } catch {
    return false;
  }
  notifierSwDataSaver(actif);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(EVT_DATA_SAVER, { detail: actif }));
  }
  return true;
}

export function synchroniserDataSaverSw(): boolean {
  const actif = lireDataSaver4G();
  notifierSwDataSaver(actif);
  return actif;
}

export function surChangementDataSaver(ecouteur: (actif: boolean) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = (e: Event) => {
    const detail = (e as CustomEvent<boolean>).detail;
    ecouteur(typeof detail === 'boolean' ? detail : lireDataSaver4G());
  };
  window.addEventListener(EVT_DATA_SAVER, handler);
  return () => window.removeEventListener(EVT_DATA_SAVER, handler);
}
