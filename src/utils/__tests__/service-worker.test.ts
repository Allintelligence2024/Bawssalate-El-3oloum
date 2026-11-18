// Simulation du worker : aucune affirmation de compatibilité navigateur/appareil.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

type Handler = (event: any) => void;
function environnement() {
  const version = 'test';
  const manifest = { version, assets: ['/assets/main.js', '/assets/suite.js', '/assets/main.css'], statiques: ['/icon.svg', '/lecons/l1.html'], octets: 5000 };
  const urls = new Map<string, Response>();
  const put = (url: string, body: string, type: string) => urls.set(url, new Response(body, { status: 200, headers: { 'content-type': type } }));
  put('/precache-manifest.json', JSON.stringify(manifest), 'application/json');
  put('/index.html', `<meta name="kunz-build-id" content="test"><script src="/assets/main.js"></script><link href="/assets/main.css">`, 'text/html');
  put('/assets/main.js', 'main', 'text/javascript');
  put('/assets/suite.js', 'suite', 'text/javascript');
  put('/assets/main.css', 'css', 'text/css');
  put('/icon.svg', 'svg', 'image/svg+xml');
  put('/lecons/l1.html', 'leçon', 'text/html');
  const cachesData = new Map<string, Map<string, Response>>();
  const key = (value: any) => new URL(typeof value === 'string' ? value : value.url, 'https://app.test').pathname;
  const caches = {
    open: async (nom: string) => {
      if (!cachesData.has(nom)) cachesData.set(nom, new Map());
      const data = cachesData.get(nom)!;
      return {
        match: async (url: any) => data.get(key(url))?.clone(),
        put: async (url: any, r: Response) => { data.set(key(url), r.clone()); },
      };
    },
    keys: async () => [...cachesData.keys()],
    delete: async (nom: string) => cachesData.delete(nom),
  };
  const handlers: Record<string, Handler> = {};
  const self = { location: { origin: 'https://app.test' }, clients: { claim: async () => {} }, addEventListener: (nom: string, cb: Handler) => { handlers[nom] = cb; } };
  let online = true, enVol = 0, maxEnVol = 0;
  const fetch = async (url: any) => {
    enVol++; maxEnVol = Math.max(maxEnVol, enVol);
    await Promise.resolve();
    enVol--;
    const response = urls.get(key(url));
    if (!online) throw new Error('offline');
    return response?.clone() ?? new Response('missing', { status: 404 });
  };
  vm.runInNewContext(readFileSync('public/sw.js', 'utf8').replaceAll('__KUNZ_BUILD_ID__', version), { self, caches, fetch, URL, Response, Promise, Number, Error });
  async function lifecycle(nom: string) {
    let promise: Promise<void> | undefined;
    handlers[nom]({ waitUntil: (p: Promise<void>) => { promise = p; } });
    await promise;
  }
  async function message(type: string) {
    let promise: Promise<void> | undefined, reponse: any;
    handlers.message({ data: { type }, ports: [{ postMessage: (r: any) => { reponse = r; } }], waitUntil: (p: Promise<void>) => { promise = p; } });
    await promise;
    return reponse;
  }
  async function demande(path: string, mode = 'cors', range = false) {
    let promise: Promise<Response> | undefined;
    handlers.fetch({ request: { url: `https://app.test${path}`, method: 'GET', mode, headers: { has: () => range } }, respondWith: (p: Promise<Response>) => { promise = p; } });
    return promise;
  }
  return { manifest, urls, put, cachesData, lifecycle, message, demande, setOnline: (v: boolean) => { online = v; }, maxEnVol: () => maxEnVol };
}

describe('service worker — simulation', () => {
  it('refuse une installation avec mauvaise version ou démarrage incomplet', async () => {
    const e = environnement();
    e.put('/precache-manifest.json', JSON.stringify({ ...e.manifest, version: 'autre' }), 'application/json');
    await expect(e.lifecycle('install')).rejects.toThrow();
    const f = environnement();
    f.urls.delete('/assets/main.js');
    await expect(f.lifecycle('install')).rejects.toThrow();
    expect(f.cachesData.has('kunz-hors-ligne-test')).toBe(false);
  });
  it('compte les ressources manquantes et reprend seulement celles-ci', async () => {
    const e = environnement();
    await e.lifecycle('install');
    expect((await e.message('ETAT_HORS_LIGNE')).manquants).toBe(3);
    e.urls.delete('/assets/suite.js');
    expect((await e.message('TELECHARGER_HORS_LIGNE')).manquants).toBe(1);
    e.put('/assets/suite.js', 'suite', 'text/javascript');
    expect((await e.message('TELECHARGER_HORS_LIGNE')).manquants).toBe(0);
    expect(e.maxEnVol()).toBeLessThanOrEqual(3);
    e.setOnline(false);
    expect(await (await e.demande('/lecons/l1.html', 'navigate'))!.text()).toBe('leçon');
    expect(await (await e.demande('/', 'navigate'))!.text()).toContain('kunz-build-id');
    const manque = await e.demande('/lecons/absente.html', 'navigate');
    expect(manque!.status).toBe(503);
    expect(await manque!.text()).not.toContain('kunz-build-id');
  });
  it('ne compte pas une réponse HTML 200 à la place d’un module', async () => {
    const e = environnement();
    await e.lifecycle('install');
    e.put('/assets/suite.js', '<html>erreur</html>', 'text/html');
    expect((await e.message('TELECHARGER_HORS_LIGNE')).manquants).toBe(1);
  });
  it('ne capture pas les requêtes API ou les vidéos en range ; nettoie seulement ses caches', async () => {
    const e = environnement();
    await e.lifecycle('install');
    e.cachesData.set('autre-application', new Map());
    e.cachesData.set('murajih-svt-v4', new Map());
    await e.lifecycle('activate');
    expect(e.cachesData.has('autre-application')).toBe(true);
    expect(e.cachesData.has('murajih-svt-v4')).toBe(false);
    expect(await e.demande('/api/eleve')).toBeUndefined();
    expect(await e.demande('/ouverture.mp4', 'cors', true)).toBeUndefined();
  });
});
