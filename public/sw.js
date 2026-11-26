// Cache par version : une mise à jour attend la fermeture des anciens onglets.
// Le téléchargement complet est demandé explicitement et peut être repris.
const VERSION = '__KUNZ_BUILD_ID__';
const CACHE = `kunz-hors-ligne-${VERSION}`;
const MANIFESTE = '/precache-manifest.json';
const INDEX = '/index.html';
const BOUSSOLE = ['/boussole/index.html', '/boussole/cahier-bac-2022.pdf', '/boussole/memo.pdf'];

// v0.13 : les deux visuels du guide sont la première chose vue hors ligne.
// Aucun commentaire entre les entrees : `scripts/verifier-hors-ligne.mjs` lit cette liste
// avec une expression régulière, et une apostrophe dans un commentaire la ferait déraper.
const COQUILLE = [
  '/icon.svg',
  '/manifest.webmanifest',
  '/mascotte.webp',
  '/guide-clair.webp',
  '/guide-sombre.webp',
  '/icons/icon-192.webp',
  '/icons/icon-512.webp',
];
const contenuValide = u => typeof u === 'string' &&
  (/^\/lecons\/[a-zA-Z0-9_.-]+\.html$/.test(u) ||
   /^\/assets\/(schemasSvt|audioMourchid)-[a-zA-Z0-9_.-]+\.js$/.test(u) ||
   BOUSSOLE.includes(u));
const coquilleValide = u => typeof u === 'string' && COQUILLE.includes(u);
// Phase 2/4 : les visuels de /lecons/img/ (WebP muets du manuel et SVG vectoriels) ne
// figurent dans aucun précache. Ils sont servis puis mémorisés par le gestionnaire fetch
// à la première ouverture de la leçon. Une base R2 externe sort du périmètre du worker
// (origine différente) : le cache HTTP du navigateur prend le relais.
const illustrationValide = u => typeof u === 'string' &&
  /^\/lecons\/img\/[a-zA-Z0-9_.-]+\.(webp|svg)$/.test(u);

/** `statiques` = coquille (toujours téléchargée). `contenu` = lourd (sur demande explicite). */
function valideManifeste(m) {
  return m && m.version === VERSION && Array.isArray(m.assets) && m.assets.length > 0 &&
    m.assets.every(u => typeof u === 'string' && /^\/assets\/[a-zA-Z0-9_.-]+\.(js|css)$/.test(u)) &&
    Array.isArray(m.statiques) && m.statiques.length > 0 && m.statiques.every(coquilleValide) &&
    Array.isArray(m.contenu) && m.contenu.every(contenuValide) &&
    Number.isFinite(m.octetsCoquille) && m.octetsCoquille >= 0 &&
    Number.isFinite(m.octetsContenu) && m.octetsContenu >= 0;
}

function typeValide(url, res) {
  const type = (res.headers.get('content-type') || '').toLowerCase();
  if (url.endsWith('.pdf')) return type.includes('application/pdf');
  if (url.endsWith('.js')) return type.includes('javascript');
  if (url.endsWith('.css')) return type.includes('text/css');
  if (url.endsWith('.html') || url === '/') return type.includes('text/html');
  if (url.endsWith('.webp')) return type.includes('image/webp') || type.includes('application/octet-stream');
  if (url.endsWith('.svg')) return type.includes('image/svg+xml') || type.includes('application/octet-stream');
  if (/\.(mp3|opus|ogg|m4a)$/.test(url)) return type.startsWith('audio/') || type.includes('application/octet-stream');
  return true;
}

const DELAI_RESSOURCE_MS = 30_000;
async function avecRessource(url, modeCache, utiliser) {
  const controle = new AbortController();
  const delai = setTimeout(() => controle.abort(), DELAI_RESSOURCE_MS);
  try {
    const res = await fetch(url, { cache: modeCache, signal: controle.signal });
    // Le délai reste actif pendant la lecture/écriture du corps, pas seulement des en-têtes.
    return await utiliser(res);
  } finally { clearTimeout(delai); }
}

async function telecharger(cache, url) {
  if (await cache.match(url)) return true;
  try {
    return await avecRessource(url, 'no-cache', async res => {
      if (!res.ok || !typeValide(url, res)) return false;
      await cache.put(url, res);
      return true;
    });
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
      const cache = await caches.open(CACHE);
      const m = await avecRessource(MANIFESTE, 'no-store', async res => {
        if (!res.ok) throw new Error('manifeste indisponible');
        const m = await res.clone().json();
        if (!valideManifeste(m)) throw new Error('version du manifeste incompatible');
        await cache.put(MANIFESTE, res);
        return m;
      });
      const html = await avecRessource(INDEX, 'no-store', async index => {
        if (!index.ok || !typeValide(INDEX, index)) throw new Error('interface indisponible');
        const html = await index.clone().text();
        if (!html.includes(`name="kunz-build-id" content="${VERSION}"`)) throw new Error('version de l’interface incompatible');
        await cache.put(INDEX, index);
        return html;
      });
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

async function verifier(cache, m, avecContenu) {
  const base = [INDEX, ...m.statiques, ...m.assets];
  const urls = avecContenu ? [...base, ...m.contenu] : base;
  let manquants = 0;
  for (const url of urls) if (!await cache.match(url)) manquants++;
  return {
    version: VERSION, total: urls.length, manquants,
    octets: m.octetsCoquille + (avecContenu ? m.octetsContenu : 0),
    octetsCoquille: m.octetsCoquille, octetsContenu: m.octetsContenu,
  };
}

let telechargement = null;
async function remplir(cache, m, avecContenu) {
  const urls = [...m.statiques, ...m.assets, ...(avecContenu ? m.contenu : [])];
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
  if (!port || !['ETAT_HORS_LIGNE', 'TELECHARGER_HORS_LIGNE', 'TELECHARGER_CONTENU'].includes(event.data?.type)) return;
  event.waitUntil((async () => {
    try {
      const cache = await caches.open(CACHE);
      const m = await manifesteCache(cache);
      if (!m) throw new Error('manifeste absent ou invalide');
      const avecContenu = event.data.type === 'TELECHARGER_CONTENU';
      if (event.data.type !== 'ETAT_HORS_LIGNE') {
        if (!telechargement) telechargement = remplir(cache, m, avecContenu).finally(() => { telechargement = null; });
        await telechargement;
      }
      port.postMessage({ ok: true, ...await verifier(cache, m, avecContenu) });
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
  // Les illustrations WebP sont explicitement autorisées ici, mais absentes du précache :
  // elles entrent dans le cache à la volée lors de la première ouverture de la leçon.
  if (!url.pathname.startsWith('/assets/') &&
      !/^\/lecons\/[a-zA-Z0-9_.-]+\.html$/.test(url.pathname) &&
      !illustrationValide(url.pathname) &&
      !BOUSSOLE.includes(url.pathname) && !COQUILLE.includes(url.pathname)) return;
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
