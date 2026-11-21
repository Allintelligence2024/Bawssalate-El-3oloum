// Cache par version : une mise à jour attend la fermeture des anciens onglets.
// Le téléchargement complet est demandé explicitement et peut être repris.
const VERSION = '__KUNZ_BUILD_ID__';
const CACHE = `kunz-hors-ligne-${VERSION}`;
const MANIFESTE = '/precache-manifest.json';
const INDEX = '/index.html';
const BOUSSOLE = ['/boussole/index.html', '/boussole/cahier-bac-2022.pdf', '/boussole/memo.pdf'];

function valideManifeste(m) {
  return m && m.version === VERSION && Array.isArray(m.assets) && m.assets.length > 0 &&
    m.assets.every(u => typeof u === 'string' && /^\/assets\/[a-zA-Z0-9_.-]+\.(js|css)$/.test(u)) &&
    Array.isArray(m.statiques) && m.statiques.length > 0 &&
    m.statiques.every(u => typeof u === 'string' && (/^\/lecons\/[a-zA-Z0-9_.-]+\.html$/.test(u) || BOUSSOLE.includes(u) || ['/icon.svg', '/manifest.webmanifest', '/mascotte.png', '/personnage-pirate.png'].includes(u))) &&
    Number.isFinite(m.octets) && m.octets >= 0;
}

function typeValide(url, res) {
  const type = (res.headers.get('content-type') || '').toLowerCase();
  if (url.endsWith('.pdf')) return type.includes('application/pdf');
  if (url.endsWith('.js')) return type.includes('javascript');
  if (url.endsWith('.css')) return type.includes('text/css');
  if (url.endsWith('.html') || url === '/') return type.includes('text/html');
  return true;
}

async function telecharger(cache, url) {
  if (await cache.match(url)) return true;
  try {
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok || !typeValide(url, res)) return false;
    await cache.put(url, res);
    return true;
  } catch { return false; }
}

async function manifesteCache(cache) {
  try {
    const res = await cache.match(MANIFESTE);
    const m = res && await res.json();
    return valideManifeste(m) ? m : null;
  } catch { return null; }
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    try {
      const res = await fetch(MANIFESTE, { cache: 'no-store' });
      if (!res.ok) throw new Error('manifeste indisponible');
      const m = await res.clone().json();
      if (!valideManifeste(m)) throw new Error('version du manifeste incompatible');
      const index = await fetch(INDEX, { cache: 'no-store' });
      if (!index.ok || !typeValide(INDEX, index)) throw new Error('interface indisponible');
      const html = await index.clone().text();
      if (!html.includes(`name="kunz-build-id" content="${VERSION}"`)) throw new Error('version de l’interface incompatible');
      const cache = await caches.open(CACHE);
      await cache.put(INDEX, index);
      await cache.put(MANIFESTE, res);
      const demarrage = [...html.matchAll(/(?:src|href)="(\/assets\/[^"?]+\.(?:js|css))"/g)].map(x => x[1]);
      if (!demarrage.length || demarrage.some(u => !m.assets.includes(u))) throw new Error('assets de démarrage incompatibles');
      for (const url of demarrage) if (!await telecharger(cache, url)) throw new Error('asset de démarrage indisponible');
      // Pas de skipWaiting : ne pas casser les onglets de la version précédente.
    } catch (e) {
      await caches.delete(CACHE);
      throw e;
    }
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    // Un nouveau worker n'active qu'après la fermeture des clients de l'ancien.
    // Ne supprimer que nos propres caches ; jamais ceux d'une autre application.
    const cles = await caches.keys();
    await Promise.all(cles.filter(k => (k.startsWith('kunz-hors-ligne-') || k.startsWith('murajih-svt-')) && k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

async function verifier(cache, m) {
  const urls = [INDEX, ...m.statiques, ...m.assets];
  let manquants = 0;
  for (const url of urls) if (!await cache.match(url)) manquants++;
  return { version: VERSION, total: urls.length, manquants, octets: m.octets };
}

let telechargement = null;
async function remplir(cache, m) {
  const urls = [...m.statiques, ...m.assets];
  let suivant = 0;
  async function ouvrier() {
    while (suivant < urls.length) {
      const url = urls[suivant++];
      await telecharger(cache, url);
    }
  }
  // Une connexion 3G et un téléphone modeste ne doivent pas subir 50 requêtes en parallèle.
  await Promise.all([ouvrier(), ouvrier(), ouvrier()]);
}

self.addEventListener('message', event => {
  const port = event.ports && event.ports[0];
  if (!port || !['ETAT_HORS_LIGNE', 'TELECHARGER_HORS_LIGNE'].includes(event.data?.type)) return;
  event.waitUntil((async () => {
    try {
      const cache = await caches.open(CACHE);
      const m = await manifesteCache(cache);
      if (!m) throw new Error('manifeste absent ou invalide');
      if (event.data.type === 'TELECHARGER_HORS_LIGNE') {
        if (!telechargement) telechargement = remplir(cache, m).finally(() => { telechargement = null; });
        await telechargement;
      }
      port.postMessage({ ok: true, ...await verifier(cache, m) });
    } catch {
      port.postMessage({ ok: false, version: VERSION });
    }
  })());
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  // Certains lecteurs PDF demandent une plage. Un 200 intégral déjà vérifié est aussi
  // une réponse valide ; jamais de 206 partiel dans le cache des fiches.
  if (request.headers.has('range')) {
    if (BOUSSOLE.includes(url.pathname) && url.pathname.endsWith('.pdf')) {
      event.respondWith(caches.open(CACHE).then(c => c.match(url.pathname)).then(r => r || fetch(request)));
    }
    return;
  }
  if (request.mode === 'navigate' && (url.pathname === '/' || url.pathname === INDEX)) {
    event.respondWith(caches.open(CACHE).then(cache => cache.match(INDEX)).then(res => res || fetch(request)));
    return;
  }
  // Seuls les fichiers publics de l'application sont mis en cache, jamais une API ou une vidéo.
  if (!url.pathname.startsWith('/assets/') && !url.pathname.startsWith('/lecons/') &&
      !BOUSSOLE.includes(url.pathname) && !['/icon.svg', '/manifest.webmanifest', '/mascotte.png', '/personnage-pirate.png'].includes(url.pathname)) return;
  // Ne jamais substituer index.html à une leçon ou à un module absent.
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) return cached;
    try {
      const res = await fetch(request);
      if (res.ok && typeValide(url.pathname, res) && !request.headers.has('range')) {
        await cache.put(request, res.clone()).catch(() => {});
      }
      return res;
    } catch {
      return new Response('Ressource indisponible hors ligne', { status: 503, statusText: 'Unavailable Offline' });
    }
  })());
});
