// تسجيل عامل الخدمة (PWA يدوية) وإدارة التحديثات المتحكَّم فيها

let workerEnAttente: ServiceWorker | null = null;
let rechargementEnCours = false;
const observateursMaj = new Set<(disponible: boolean) => void>();

function publierMaj(): void {
  const dispo = Boolean(workerEnAttente);
  for (const fn of observateursMaj) fn(dispo);
}

export function miseAJourPwaDisponible(): boolean {
  return Boolean(workerEnAttente);
}

export function abonnerMiseAJourPwa(fn: (disponible: boolean) => void): () => void {
  observateursMaj.add(fn);
  fn(miseAJourPwaDisponible());
  return () => { observateursMaj.delete(fn); };
}

/** فعّل التحديث المنتظر بإذن التلميذ، ثم أعد تحميل الصفحة مرّة واحدة فقط. */
export function appliquerMiseAJourPwa(): boolean {
  if (!workerEnAttente) return false;
  try {
    workerEnAttente.postMessage({ type: 'SKIP_WAITING' });
    return true;
  } catch {
    return false;
  }
}

/** للاختبارات فقط. */
export function _reinitialiserEtatMajPwa(worker: ServiceWorker | null = null): void {
  workerEnAttente = worker;
  rechargementEnCours = false;
  publierMaj();
}

function suivreInscription(reg: ServiceWorkerRegistration): void {
  if (reg.waiting && navigator.serviceWorker?.controller) {
    workerEnAttente = reg.waiting;
    publierMaj();
  }
  reg.addEventListener('updatefound', () => {
    const nouveau = reg.installing;
    if (!nouveau) return;
    nouveau.addEventListener('statechange', () => {
      if (nouveau.state === 'installed' && navigator.serviceWorker?.controller) {
        workerEnAttente = reg.waiting ?? nouveau;
        publierMaj();
      }
    });
  });
}

export function enregistrerServiceWorker(): void {
  if (!('serviceWorker' in navigator)) return;
  if (import.meta.env.DEV) return; // في التطوير لا يسجّل (Hot Module Replacement)

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (rechargementEnCours) return;
    rechargementEnCours = true;
    workerEnAttente = null;
    publierMaj();
    window.location.reload();
  });

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(suivreInscription)
      .catch((erreur) => console.warn('تعذّر تسجيل عامل الخدمة:', erreur));
  });
}

/** فحص استباقي لمساحة التخزين قبل التنزيل الكامل لتجنّب الفشل الصامت على الهواتف المحدودة. */
export async function verifierEspaceStockage(
  octetsRequis: number,
): Promise<{ suffisant: boolean; disponible?: number }> {
  if (octetsRequis <= 0) return { suffisant: true };
  try {
    const estimate = navigator.storage?.estimate;
    if (typeof estimate !== 'function') return { suffisant: true };
    const { quota, usage } = await estimate.call(navigator.storage);
    if (typeof quota !== 'number' || typeof usage !== 'number') return { suffisant: true };
    const disponible = Math.max(0, quota - usage);
    // هامش أمان بسيط (20%) لتفادي امتلاء التخزين بالضبط أثناء الكتابة
    return { suffisant: disponible >= octetsRequis * 1.2, disponible };
  } catch {
    return { suffisant: true };
  }
}

/** `coquille` = interface seule (toujours téléchargée) ; `complet` = coquille + contenu lourd. */
export interface EtatHorsLigne {
  version: string;
  total: number;
  manquants: number;
  octets: number;
  octetsCoquille: number;
  octetsContenu: number;
  quotaDepasse?: boolean;
}

export type Portee = 'coquille' | 'complet';

function typeMessage(portee: Portee, telecharger: boolean): string {
  if (!telecharger) return 'ETAT_HORS_LIGNE';
  return portee === 'complet' ? 'TELECHARGER_CONTENU' : 'TELECHARGER_HORS_LIGNE';
}

/** Un état n'est fiable que pour le worker contrôlant cette page et sa version exacte. */
export function etatHorsLigne(telecharger = false, portee: Portee = 'complet'): Promise<EtatHorsLigne> {
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
      const bornes = [r.octets, r.octetsCoquille, r.octetsContenu];
      if (!r.ok || r.version !== version || !Number.isSafeInteger(r.total) || !Number.isSafeInteger(r.manquants) ||
          bornes.some((v) => typeof v !== 'number' || !Number.isFinite(v) || v < 0) ||
          r.total! < 1 || r.manquants! < 0 || r.manquants! > r.total!) {
        reject(new Error('État hors ligne non vérifiable pour cette version'));
      } else resolve(r as EtatHorsLigne);
    };
    try { worker.postMessage({ type: typeMessage(portee, telecharger) }, [canal.port2]); }
    catch (e) { window.clearTimeout(delai); canal.port1.close(); reject(e); }
  });
}
