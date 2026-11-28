// Tests de non-régression P0–P3 : invariants mathématiques, sécurité, synchronisation,
// stockage, Service Worker, illustrations et composants de secours.
import { describe, it, expect, vi, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { allouerTemps, MINUTES_RELECTURE } from '../simulation';
import { mettreAJourSrs, FACILITE_MAX, PLAFOND_INTERVALLE_MAX_JOURS } from '../srs';
import { prochainRappel } from '../rappels';
import { calendrierPour } from '../../config/annee';
import { ajouterJours, differenceJours, formatChrono, salue } from '../dates';
import { xpDe, joursConsecutifs } from '../xp';
import {
  avecDelai,
  classerErreurEnvoi,
  definirGenerationConnue,
  delaiAvantEnvoi,
  derniereErreurEnvoi,
  envoyerSnapshot,
  etatEnvoi,
  generationConnue,
  jetonUtilisable,
  reprendreSync,
  signalDelai,
  suspendreSync,
  TAILLE_MAX_CHARGE_UTILE,
} from '../sync';
import { analyserLegendeAr, urlIllustration } from '../illustrations';
import {
  abonnerMiseAJourPwa,
  appliquerMiseAJourPwa,
  miseAJourPwaDisponible,
  verifierEspaceStockage,
  _reinitialiserEtatMajPwa,
} from '../pwa';
import { chargerEtat, restaurationBloqueeAuChargement } from '../storage';
import { CLE_RESTAURATION } from '../carnetBoussole';
import { etatVierge } from '../../types';
import ErrorBoundary from '../../components/ErrorBoundary';
import { QCM_LECONS } from '../../data/qcmLecons';
import { etapesKouest } from '../kouest';
import { itemsReparation } from '../../components/JourneeReparation';
import { melange as melangeDefi60 } from '../../components/Defi60';
import { jourCourtAr } from '../../components/EcranFierte';
import { etatDepuisBrut } from '../etat';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.useRealTimers();
  _reinitialiserEtatMajPwa(null);
});

describe('P2 — allouerTemps (méthode du plus fort reste)', () => {
  it('conserve strictement la somme des minutes pour les durées premières ou impaires', () => {
    const sujet = {
      exercices: [
        { numero: 1, bareme: 3 },
        { numero: 2, bareme: 3 },
        { numero: 3, bareme: 4 },
      ],
    } as unknown as Parameters<typeof allouerTemps>[0];

    // 184 - 15 = 169 min : Math.round indépendant donnait 51 + 51 + 68 = 170 (dérive +1)
    const alloc = allouerTemps(sujet, 184);
    expect(alloc.reduce((s, a) => s + a.minutes, 0)).toBe(184 - MINUTES_RELECTURE);
    expect(alloc[alloc.length - 1].finConseillee).toBe(184 - MINUTES_RELECTURE);

    const tiers = {
      exercices: [
        { numero: 1, bareme: 1 },
        { numero: 2, bareme: 1 },
        { numero: 3, bareme: 1 },
      ],
    } as unknown as Parameters<typeof allouerTemps>[0];
    for (const duree of [46, 77, 100, 125, 270]) {
      const a = allouerTemps(tiers, duree);
      expect(a.reduce((s, x) => s + x.minutes, 0)).toBe(duree - MINUTES_RELECTURE);
    }
  });
});

describe('P2 — SM-2 borné, rappels, calendrier et gardes dates/XP', () => {
  it('plafonne la facilité SM-2 et l’intervalle maximum', () => {
    let carte = { repetitions: 0, intervalle: 0, facilite: 2.5, prochaine: '2026-11-27' };
    for (let i = 0; i < 40; i++) {
      carte = mettreAJourSrs(carte, 5);
    }
    expect(carte.facilite).toBeLessThanOrEqual(FACILITE_MAX);
    expect(carte.intervalle).toBeLessThanOrEqual(PLAFOND_INTERVALLE_MAX_JOURS);
  });

  it('programme le rappel aujourd’hui exactement à HH:MM:00.000 et demain à HH:MM:00.001', () => {
    const exact = new Date(2026, 10, 27, 18, 30, 0, 0);
    expect(prochainRappel('18:30', exact)?.getTime()).toBe(exact.getTime());

    const apres = new Date(2026, 10, 27, 18, 30, 0, 1);
    expect(prochainRappel('18:30', apres)?.getDate()).toBe(28);
  });

  it('garde le calendrier 2026–2027 en août et ne bascule qu’en septembre', () => {
    expect(calendrierPour('2027-08-20').libelle).toBe('2026–2027');
    expect(calendrierPour('2027-08-20').estime).toBe(false);
    expect(calendrierPour('2027-09-01').libelle).toContain('2027–2028');
    expect(calendrierPour('2027-09-01').estime).toBe(true);
  });

  it('sécurise formatChrono, ajouterJours, differenceJours, salue et XP contre les valeurs invalides', () => {
    expect(formatChrono(-12)).toBe('0:00');
    expect(formatChrono(Number.NaN)).toBe('0:00');
    expect(formatChrono(Number.POSITIVE_INFINITY)).toBe('0:00');
    expect(formatChrono(65.9)).toBe('1:05');

    expect(ajouterJours('pas-une-date', 5)).toBe('pas-une-date');
    expect(differenceJours('invalide', '2026-11-27')).toBe(0);

    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 27, 23, 0, 0));
    expect(salue()).toBe('مساء الخير');

    const e = etatVierge();
    e.minutesTotales = -500;
    expect(xpDe(e)).toBe(0);
    e.minutesTotales = Number.NaN;
    expect(xpDe(e)).toBe(0);

    expect(joursConsecutifs(['2099-01-01', 'invalide', '2026-11-27', '2026-11-26'])).toBe(2);
  });
});

describe('P1 — synchronisation sans famine, délais bornés, génération et classification d’erreurs', () => {
  it('garantit un délai borné (anti-famine) à 30 s', () => {
    expect(delaiAvantEnvoi(null, 1_000)).toBe(6_000);
    expect(delaiAvantEnvoi(1_000, 10_000)).toBe(6_000);
    expect(delaiAvantEnvoi(1_000, 29_000)).toBe(2_000);
    expect(delaiAvantEnvoi(1_000, 31_000)).toBe(0);
  });

  it('fournit un signalDelai fonctionnel même lorsque AbortSignal.timeout est absent', () => {
    vi.useFakeTimers();
    const original = AbortSignal.timeout;
    vi.stubGlobal('AbortSignal', { ...AbortSignal, timeout: undefined });
    try {
      const sig = signalDelai(500);
      expect(sig.aborted).toBe(false);
      vi.advanceTimersByTime(500);
      expect(sig.aborted).toBe(true);
    } finally {
      vi.stubGlobal('AbortSignal', Object.assign(AbortSignal, { timeout: original }));
    }
  });

  it('rejette une promesse bloquée avec TimeoutError via avecDelai', async () => {
    vi.useFakeTimers();
    const bloquee = new Promise<string>(() => {});
    const p = avecDelai(bloquee, 1_000);
    vi.advanceTimersByTime(1_000);
    await expect(p).rejects.toMatchObject({ name: 'TimeoutError' });
  });

  it('rejette les jetons faibles (hex répété ou ancien préfixe j-) et accepte les jetons valides', () => {
    expect(jetonUtilisable('a'.repeat(32))).toBe(false);
    expect(jetonUtilisable('0'.repeat(64))).toBe(false);
    expect(jetonUtilisable('j-1234567890')).toBe(false);
    expect(jetonUtilisable('3f8a19c2-74be-4f10-9a21-6c5d8e01f234')).toBe(true);
  });

  it('classe distinctement conflits de génération, autorisation, quota, limite de débit et serveur', () => {
    expect(classerErreurEnvoi({ code: '40001' })).toBe('conflit_generation');
    expect(classerErreurEnvoi({ status: 409 })).toBe('conflit_generation');
    expect(classerErreurEnvoi({ status: 401 })).toBe('autorisation');
    expect(classerErreurEnvoi({ status: 403 })).toBe('autorisation');
    expect(classerErreurEnvoi({ code: '42501' })).toBe('autorisation');
    expect(classerErreurEnvoi({ status: 413 })).toBe('charge_trop_lourde');
    expect(classerErreurEnvoi({ status: 429 })).toBe('limite_debit');
    expect(classerErreurEnvoi({ status: 503 })).toBe('serveur');
    const timeout = new Error('timeout');
    timeout.name = 'TimeoutError';
    expect(classerErreurEnvoi(timeout)).toBe('delai');
  });

  it('rejette une charge utile > 256 Kio avant appel réseau et expose charge_trop_lourde', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://exemple.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'cle-publique');
    vi.stubGlobal('navigator', { onLine: true });
    const email = 'Eleve.Lourd@Test.DZ';
    const e = etatVierge();
    e.compte = {
      email,
      motDePasse: '',
      wilaya: '16',
      daira: 'الجزائر',
      creeLe: '2026-11-01',
      jeton: '3f8a19c2-74be-4f10-9a21-6c5d8e01f234',
    };
    e.consentementSync = true;
    e.consentementSyncDecideLe = '2026-11-01';
    e.nom = 'x'.repeat(TAILLE_MAX_CHARGE_UTILE + 500);

    reprendreSync(email);
    await envoyerSnapshot(e);
    expect(etatEnvoi('eleve.lourd@test.dz')).toBe('erreur');
    expect(derniereErreurEnvoi('eleve.lourd@test.dz')).toBe('charge_trop_lourde');
    suspendreSync(email);
  });

  it('suivi de génération normalisé par e-mail', () => {
    definirGenerationConnue('ELEVE@Test.DZ', 4);
    expect(generationConnue('eleve@test.dz')).toBe(4);
  });
});

describe('P1 — restauration atomique avec anciens champs null (motDePasse/jeton)', () => {
  it('rejoue un journal historique portant motDePasse: null et jeton: null sans bloquer le chargement', () => {
    const store = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => { store.set(k, v); },
      removeItem: (k: string) => { store.delete(k); },
    });

    const journal = {
      etat: {
        ...etatVierge(),
        nom: 'تلميذ قديم',
        compte: {
          email: 'ancien@test.dz',
          wilaya: '16',
          daira: 'الجزائر',
          creeLe: '2026-09-15',
          motDePasse: null,
          jeton: null,
        },
      },
    };
    store.set(CLE_RESTAURATION, JSON.stringify(journal));

    const etat = chargerEtat();
    expect(restaurationBloqueeAuChargement()).toBe(false);
    expect(etat.nom).toBe('تلميذ قديم');
    expect(store.has(CLE_RESTAURATION)).toBe(false);

    // Un champ jeton de type numérique reste bloqué
    store.set(
      CLE_RESTAURATION,
      JSON.stringify({
        etat: {
          ...etatVierge(),
          compte: {
            email: 'ancien@test.dz',
            wilaya: '16',
            daira: 'الجزائر',
            creeLe: '2026-09-15',
            jeton: 12345,
          },
        },
      }),
    );
    chargerEtat();
    expect(restaurationBloqueeAuChargement()).toBe(true);
  });
});

describe('P1 — Service Worker (SKIP_WAITING, double verrou, 206 Range, quota)', () => {
  function simulerSw(options?: { quotaAuPut?: boolean }) {
    const version = 'p1test';
    const manifest = {
      version,
      assets: ['/assets/main.js', '/assets/suite.js'],
      statiques: ['/icon.svg'],
      contenu: ['/lecons/l1.html'],
      octets: 5000,
      octetsCoquille: 3000,
      octetsContenu: 2000,
    };
    const urls = new Map<string, Response>();
    const put = (url: string, body: string, type: string) =>
      urls.set(url, new Response(body, { status: 200, headers: { 'content-type': type } }));
    put('/precache-manifest.json', JSON.stringify(manifest), 'application/json');
    put('/index.html', `<meta name="kunz-build-id" content="${version}"><script src="/assets/main.js"></script>`, 'text/html');
    put('/assets/main.js', 'main', 'text/javascript');
    put('/assets/suite.js', 'suite', 'text/javascript');
    put('/icon.svg', 'svg', 'image/svg+xml');
    put('/lecons/l1.html', 'lecon-complete', 'text/html');
    put('/audio/lecons/u1.mp3', '0123456789abc', 'audio/mpeg');

    const cachesData = new Map<string, Map<string, Response>>();
    const key = (v: unknown) => new URL(typeof v === 'string' ? v : (v as { url: string }).url, 'https://app.test').pathname;
    const caches = {
      open: async (nom: string) => {
        if (!cachesData.has(nom)) cachesData.set(nom, new Map());
        const data = cachesData.get(nom)!;
        return {
          match: async (u: unknown) => data.get(key(u))?.clone(),
          put: async (u: unknown, r: Response) => {
            if (options?.quotaAuPut && key(u) === '/lecons/l1.html') {
              const err = new Error('Quota exceeded');
              err.name = 'QuotaExceededError';
              throw err;
            }
            data.set(key(u), r.clone());
          },
        };
      },
      keys: async () => [...cachesData.keys()],
      delete: async (nom: string) => cachesData.delete(nom),
    };
    const handlers: Record<string, (e: unknown) => void> = {};
    const skipWaiting = vi.fn(async () => {});
    const self = {
      location: { origin: 'https://app.test' },
      clients: { claim: async () => {} },
      skipWaiting,
      addEventListener: (nom: string, cb: (e: unknown) => void) => { handlers[nom] = cb; },
    };
    const fetch = async (u: unknown) => {
      await Promise.resolve();
      const res = urls.get(key(u));
      return res?.clone() ?? new Response('404', { status: 404 });
    };
    vm.runInNewContext(readFileSync('public/sw.js', 'utf8').replaceAll('__KUNZ_BUILD_ID__', version), {
      self, caches, fetch, URL, Response, Promise, Number, Error, AbortController, setTimeout, clearTimeout,
    });

    async function install() {
      let p: Promise<void> | undefined;
      handlers.install({ waitUntil: (pr: Promise<void>) => { p = pr; } });
      await p;
    }
    async function message(type: string) {
      let p: Promise<void> | undefined;
      let reponse: Record<string, unknown> | undefined;
      handlers.message({
        data: { type },
        ports: [{ postMessage: (r: Record<string, unknown>) => { reponse = r; } }],
        waitUntil: (pr: Promise<void>) => { p = pr; },
      });
      await p;
      return reponse;
    }
    async function fetchRange(path: string, rangeHeader: string) {
      let p: Promise<Response> | undefined;
      handlers.fetch({
        request: {
          url: `https://app.test${path}`,
          method: 'GET',
          mode: 'cors',
          headers: {
            has: (k: string) => k.toLowerCase() === 'range',
            get: (k: string) => (k.toLowerCase() === 'range' ? rangeHeader : null),
          },
        },
        respondWith: (pr: Promise<Response>) => { p = pr; },
      });
      return p;
    }
    return { handlers, skipWaiting, install, message, fetchRange, cachesData };
  }

  it('traite SKIP_WAITING uniquement sur demande explicite', async () => {
    const sw = simulerSw();
    await sw.install();
    expect(sw.skipWaiting).not.toHaveBeenCalled();
    let p: Promise<void> | undefined;
    sw.handlers.message({ data: { type: 'SKIP_WAITING' }, ports: [], waitUntil: (pr: Promise<void>) => { p = pr; } });
    await p;
    expect(sw.skipWaiting).toHaveBeenCalledTimes(1);
  });

  it('ne saute pas le lot contenu si TELECHARGER_HORS_LIGNE et TELECHARGER_CONTENU sont lancés en parallèle', async () => {
    const sw = simulerSw();
    await sw.install();
    const [rCoquille, rContenu] = await Promise.all([
      sw.message('TELECHARGER_HORS_LIGNE'),
      sw.message('TELECHARGER_CONTENU'),
    ]);
    expect(rCoquille?.manquants).toBe(0);
    expect(rContenu?.manquants).toBe(0);
    expect(sw.cachesData.get('kunz-hors-ligne-p1test')?.has('/lecons/l1.html')).toBe(true);
  });

  it('renvoie 206 Partial Content avec Content-Range valide sur audio en cache, et 416 hors bornes', async () => {
    const sw = simulerSw();
    await sw.install();
    // Remplissage du cache audio via fetch sans Range
    let pInit: Promise<Response> | undefined;
    sw.handlers.fetch({
      request: {
        url: 'https://app.test/audio/lecons/u1.mp3',
        method: 'GET',
        mode: 'cors',
        headers: { has: () => false, get: () => null },
      },
      respondWith: (pr: Promise<Response>) => { pInit = pr; },
    });
    await pInit;

    const r206 = await sw.fetchRange('/audio/lecons/u1.mp3', 'bytes=0-3');
    expect(r206?.status).toBe(206);
    expect(r206?.headers.get('content-range')).toBe('bytes 0-3/13');
    expect(await r206?.text()).toBe('0123');

    const r416 = await sw.fetchRange('/audio/lecons/u1.mp3', 'bytes=99-120');
    expect(r416?.status).toBe(416);
    expect(r416?.headers.get('content-range')).toBe('bytes */13');
  });

  it('remonte quotaDepasse=true en cas de QuotaExceededError', async () => {
    const sw = simulerSw({ quotaAuPut: true });
    await sw.install();
    const res = await sw.message('TELECHARGER_CONTENU');
    expect(res?.quotaDepasse).toBe(true);
    expect(res?.manquants).toBe(1);
  });
});

describe('P1 & P2 — PWA update, quota, illustrations et ErrorBoundary', () => {
  it('orchestre l’état de mise à jour PWA et envoie SKIP_WAITING au worker en attente', () => {
    const postMessage = vi.fn();
    const observer = vi.fn();
    const stop = abonnerMiseAJourPwa(observer);
    expect(miseAJourPwaDisponible()).toBe(false);
    expect(appliquerMiseAJourPwa()).toBe(false);

    _reinitialiserEtatMajPwa({ postMessage } as unknown as ServiceWorker);
    expect(miseAJourPwaDisponible()).toBe(true);
    expect(observer).toHaveBeenLastCalledWith(true);
    expect(appliquerMiseAJourPwa()).toBe(true);
    expect(postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });
    stop();
  });

  it('évalue la marge de stockage disponible via navigator.storage.estimate', async () => {
    vi.stubGlobal('navigator', {
      storage: { estimate: async () => ({ quota: 10_000_000, usage: 9_500_000 }) },
    });
    expect((await verifierEspaceStockage(1_000_000)).suffisant).toBe(false);
    expect((await verifierEspaceStockage(100_000)).suffisant).toBe(true);
  });

  it('refuse les protocoles non-https pour VITE_ILLUSTRATIONS_BASE_URL et parse les légendes sans HTML dangereux', () => {
    vi.stubEnv('VITE_ILLUSTRATIONS_BASE_URL', 'http://insecure.example.com');
    expect(() => urlIllustration('fig.webp')).toThrow(/https/);
    vi.stubEnv('VITE_ILLUSTRATIONS_BASE_URL', 'javascript:alert(1)');
    expect(() => urlIllustration('fig.webp')).toThrow(/https/);
    vi.stubEnv('VITE_ILLUSTRATIONS_BASE_URL', 'https://cdn.example.com/img');
    expect(urlIllustration('fig.webp')).toBe('https://cdn.example.com/img/fig.webp');

    const noeuds = analyserLegendeAr('<strong onclick="evil()">عنوان</strong><script>alert(1)</script><br><img src=x onerror=1><em>تفصيل</em>');
    expect(noeuds).toEqual([
      { type: 'strong', enfants: [{ type: 'texte', texte: 'عنوان' }] },
      { type: 'texte', texte: 'alert(1)' },
      { type: 'br' },
      { type: 'em', enfants: [{ type: 'texte', texte: 'تفصيل' }] },
    ]);
  });

  it('capture une erreur de rendu dans ErrorBoundary via getDerivedStateFromError', () => {
    expect(ErrorBoundary.getDerivedStateFromError()).toEqual({ enErreur: true, exportEffectue: false });
  });
});

describe('Passe 2 — PRNG 32 bits, fuseaux horaires et déduplication du journal', () => {
  it('PASS2-F001 : disperse réellement la bonne réponse sur les 4 positions dans Kouest et JourneeReparation', () => {
    const lecons = Object.keys(QCM_LECONS);
    const posKouest = lecons.flatMap((id) =>
      etapesKouest(id)
        .filter((e) => e.options.length === 4)
        .map((e) => e.options.indexOf(e.bonne)),
    );
    const posRepar = lecons.flatMap((id) =>
      itemsReparation(id)
        .filter((item) => item.options.length === 4)
        .map((item) => item.options.indexOf(item.bonne)),
    );

    expect(posKouest.length).toBeGreaterThan(100);
    expect(posRepar.length).toBeGreaterThan(100);

    for (const positions of [posKouest, posRepar]) {
      expect(new Set(positions).size).toBe(4);
      for (const slot of [0, 1, 2, 3]) {
        const ratio = positions.filter((p) => p === slot).length / positions.length;
        expect(ratio).toBeGreaterThanOrEqual(0.12);
        expect(ratio).toBeLessThanOrEqual(0.45);
      }
    }

    // Contrôle Defi60 avec grandes graines 32 bits
    const posDefi = Array.from({ length: 200 }, (_, i) =>
      melangeDefi60([0, 1, 2, 3], (0x9e3779b9 + i * 2654435761) >>> 0).indexOf(0),
    );
    expect(new Set(posDefi).size).toBe(4);
  });

  it('PASS2-F003 : jourCourtAr préserve le jour exact même à l’ouest d’UTC et rejette les dates impossibles', () => {
    expect(jourCourtAr('2026-11-30')).toBe('30 نوفمبر');
    expect(jourCourtAr('2026-01-01')).toBe('1 جانفي');
    expect(jourCourtAr('2027-06-10')).toBe('10 جوان');
    expect(jourCourtAr('2026-02-30')).toBeNull();
    expect(jourCourtAr(undefined)).toBeNull();
  });

  it('PASS2-F004 : JalonUnite utilise aujourdhui() en heure locale plutôt que toISOString()', () => {
    const src = readFileSync('src/components/JalonUnite.tsx', 'utf8');
    expect(src).toContain('formatJourAr(aujourdhui())');
    expect(src).not.toContain('toISOString().slice(0, 10)');
  });

  it('PASS2-F005 : déduplique les dates du journal à la normalisation d’état', () => {
    const etat = etatDepuisBrut({ journal: ['2026-11-20', '2026-11-20', '2026-11-21', '2026-11-20'] });
    expect(etat.journal).toEqual(['2026-11-20', '2026-11-21']);
  });
});

