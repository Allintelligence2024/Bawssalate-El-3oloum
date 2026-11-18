// تسجيل عامل الخدمة (PWA يدوية)

export function enregistrerServiceWorker(): void {
  if (!('serviceWorker' in navigator)) return;
  if (import.meta.env.DEV) return; // في التطوير لا يسجّل ( Hot Module Replacement)

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .catch((erreur) => console.warn('تعذّر تسجيل عامل الخدمة:', erreur));
  });
}

export interface EtatHorsLigne {
  version: string;
  total: number;
  manquants: number;
  octets: number;
}

/** Un état n'est fiable que pour le worker contrôlant cette page et sa version exacte. */
export function etatHorsLigne(telecharger = false): Promise<EtatHorsLigne> {
  return new Promise((resolve, reject) => {
    const worker = navigator.serviceWorker?.controller;
    const version = document.querySelector<HTMLMetaElement>('meta[name="kunz-build-id"]')?.content;
    if (!worker || !version || version === '__KUNZ_BUILD_ID__' || typeof MessageChannel === 'undefined') {
      reject(new Error('Service worker ou version indisponible'));
      return;
    }
    const canal = new MessageChannel();
    // Le téléchargement peut prendre plusieurs minutes en réseau mobile.
    const delai = window.setTimeout(() => { canal.port1.close(); reject(new Error('délai dépassé')); }, telecharger ? 600_000 : 15_000);
    canal.port1.onmessage = (event: MessageEvent) => {
      window.clearTimeout(delai);
      canal.port1.close();
      const r = event.data as Partial<EtatHorsLigne> & { ok?: boolean };
      if (!r.ok || r.version !== version || !Number.isSafeInteger(r.total) || !Number.isSafeInteger(r.manquants) ||
          typeof r.octets !== 'number' || !Number.isFinite(r.octets) || r.octets < 0 ||
          r.total! < 1 || r.manquants! < 0 || r.manquants! > r.total!) {
        reject(new Error('État hors ligne non vérifiable pour cette version'));
      } else resolve(r as EtatHorsLigne);
    };
    try { worker.postMessage({ type: telecharger ? 'TELECHARGER_HORS_LIGNE' : 'ETAT_HORS_LIGNE' }, [canal.port2]); }
    catch (e) { window.clearTimeout(delai); canal.port1.close(); reject(e); }
  });
}
