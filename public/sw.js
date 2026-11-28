// Cache par version : une mise à jour attend l'accord de l'élève (SKIP_WAITING) ou la fermeture des onglets.
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
   /^\/assets\/(schemasSvt|audioMourchid|audioLecons)-[a-zA-Z0-9_.-]+\.js$/.test(u) ||
   BOUSSOLE.includes(u));
const coquilleValide = u => typeof u === 'string' && COQUILLE.includes(u);
// Phase 2/4 : les visuels de /lecons/img/ (WebP muets du manuel et SVG vectoriels) ne
// figurent dans aucun précache. Ils sont servis puis mémorisés par le gestionnaire fetch
// à la première ouverture de la leçon. Une base R2 externe sort du périmètre du worker
// (origine différente) : le cache HTTP du navigateur prend le relais.
const illustrationValide = u => typeof u === 'string' &&
  /^\/lecons\/img\/[a-zA-Z0-9_.-]+\.(webp|svg)$/.test(u);
// Phase 5 : les 65 MP3 (/audio/lecons/ et /audio/mourchid/) ne figurent dans aucun précache.
// Ils sont servis à la demande (<audio preload="none">) et mis en cache après la première lecture.
const audioValide = u => typeof u === 'string' &&
  /^\/audio\/(lecons|mourchid)\/[a-z0-9._-]+\.(mp3|opus|ogg|m4a)$/.test(u);

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

function estErreurQuota(erreur) {
  return Boolean(erreur && (erreur.name === 'QuotaExceededError' || erreur.code === 22));
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

async function telecharger(cache, url, etatQuota) {
  if (await cache.match(url)) return true;
  try {
    return await avecRessource(url, 'no-cache', async res => {
      if (!res.ok || !typeValide(url, res)) return false;
      await cache.put(url, res);
      return true;
    });
  } catch (e) {
    if (etatQuota && estErreurQuota(e)) etatQuota.depasse = true;
    return false;
  }
}

async function manifesteCache(cache) {
  try {
    const res = await cache.match(MANIFESTE);
    const m = res && await res.json();
    return valideManifeste(m) ? m : null;
  } catch { return null; }
}

/** Construit une réponse 206 Partial Content conforme à partir d'un 200 en cache (audio/PDF Safari & iOS). */
async function repondrePlage(cached, enteteRange) {
  if (!enteteRange || typeof enteteRange !== 'string') return cached;
  const correspondance = /^bytes=(\d*)-(\d*)$/i.exec(enteteRange.trim());
  if (!correspondance) return cached;
  const tampon = await cached.arrayBuffer();
  const total = tampon.byteLength;
  if (total === 0) return cached;
  if (correspondance[1] === '' && correspondance[2] === '') {
    return new Response(null, {
      status: 416,
      statusText: 'Range Not Satisfiable',
      headers: { 'Content-Range': `bytes */${total}` },
    });
  }
  let debut;
  let fin;
  if (correspondance[1] === '' && correspondance[2] !== '') {
    const suffixe = Number(correspondance[2]);
    if (!Number.isFinite(suffixe) || suffixe <= 0) {
      return new Response(null, {
        status: 416,
        statusText: 'Range Not Satisfiable',
        headers: { 'Content-Range': `bytes */${total}` },
      });
    }
    debut = Math.max(0, total - suffixe);
    fin = total - 1;
  } else {
    debut = Number(correspondance[1]);
    fin = correspondance[2] === '' ? total - 1 : Math.min(total - 1, Number(correspondance[2]));
  }
  if (!Number.isFinite(debut) || !Number.isFinite(fin) || debut < 0 || debut > fin || debut >= total) {
    return new Response(null, {
      status: 416,
      statusText: 'Range Not Satisfiable',
      headers: { 'Content-Range': `bytes */${total}` },
    });
  }
  const tranche = tampon.slice(debut, fin + 1);
  const entetes = {
    'Content-Type': cached.headers.get('content-type') || 'application/octet-stream',
    'Content-Range': `bytes ${debut}-${fin}/${total}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': String(tranche.byteLength),
  };
  return new Response(tranche, {
    status: 206,
    statusText: 'Partial Content',
    headers: entetes,
  });
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
      // Pas de skipWaiting automatique : activation contrôlée via message SKIP_WAITING ou fermeture des onglets.
    } catch (e) {
      await caches.delete(CACHE);
      throw e;
    }
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
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

// Deux verrous distincts : une demande « contenu complet » ne doit jamais se contenter
// d'attendre une promesse « coquille seule » déjà en cours.
let telechargementCoquille = null;
let telechargementContenu = null;

async function remplirUrls(cache, urls) {
  const etatQuota = { depasse: false };
  let suivant = 0;
  async function ouvrier() {
    while (suivant < urls.length) {
      const url = urls[suivant++];
      await telecharger(cache, url, etatQuota);
    }
  }
  // Une connexion 3G et un téléphone modeste ne doivent pas subir 50 requêtes en parallèle.
  await Promise.all([ouvrier(), ouvrier(), ouvrier()]);
  return etatQuota.depasse;
}

// Mode économie de data 4G : évite toute mise en cache opportuniste de médias lourds en arrière-plan.
let economieData4G = false;

self.addEventListener('message', event => {
  if (event.data?.type === 'CONFIG_DATA_SAVER') {
    economieData4G = Boolean(event.data.actif);
    return;
  }
  if (event.data?.type === 'SKIP_WAITING') {
    if (typeof self.skipWaiting === 'function') {
      const p = self.skipWaiting();
      if (typeof event.waitUntil === 'function') event.waitUntil(p);
    }
    return;
  }
  const port = event.ports && event.ports[0];
  if (!port || !['ETAT_HORS_LIGNE', 'TELECHARGER_HORS_LIGNE', 'TELECHARGER_CONTENU'].includes(event.data?.type)) return;
  event.waitUntil((async () => {
    try {
      const cache = await caches.open(CACHE);
      const m = await manifesteCache(cache);
      if (!m) throw new Error('manifeste absent ou invalide');
      const avecContenu = event.data.type === 'TELECHARGER_CONTENU';
      let quotaDepasse = false;
      if (event.data.type === 'TELECHARGER_HORS_LIGNE') {
        if (!telechargementCoquille) {
          telechargementCoquille = remplirUrls(cache, [...m.statiques, ...m.assets]).finally(() => { telechargementCoquille = null; });
        }
        quotaDepasse = await telechargementCoquille;
      } else if (event.data.type === 'TELECHARGER_CONTENU') {
        if (telechargementCoquille) {
          quotaDepasse = (await telechargementCoquille) || quotaDepasse;
        }
        if (!telechargementContenu) {
          telechargementContenu = remplirUrls(cache, [...m.statiques, ...m.assets, ...m.contenu]).finally(() => { telechargementContenu = null; });
        }
        quotaDepasse = (await telechargementContenu) || quotaDepasse;
      }
      const etat = await verifier(cache, m, avecContenu);
      port.postMessage({ ok: true, ...etat, ...(quotaDepasse ? { quotaDepasse: true } : {}) });
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
  // Les lecteurs PDF ou audio demandent une plage (Range). On conserve un 200 complet en cache
  // et on découpe proprement une réponse 206 Partial Content quand l'en-tête Range est fourni.
  if (request.headers.has('range')) {
    if ((BOUSSOLE.includes(url.pathname) && url.pathname.endsWith('.pdf')) || audioValide(url.pathname)) {
      event.respondWith(caches.open(CACHE).then(c => c.match(url.pathname)).then(async cached => {
        if (cached) {
          const enteteRange = typeof request.headers.get === 'function' ? request.headers.get('range') : null;
          return repondrePlage(cached, enteteRange);
        }
        // Jamais de double téléchargement parallèle (économie 4G) : on sert la requête unique,
        // et si le serveur répond 200 complet (et hors mode Data-Saver), on le met en cache sans coût réseau supplémentaire.
        const res = await fetch(request);
        if (!economieData4G && res.status === 200 && typeValide(url.pathname, res)) {
          const cache = await caches.open(CACHE);
          await cache.put(url.pathname, res.clone()).catch(() => {});
        }
        return res;
      }));
    }
    return;
  }
  if (request.mode === 'navigate' && (url.pathname === '/' || url.pathname === INDEX)) {
    event.respondWith(caches.open(CACHE).then(cache => cache.match(INDEX)).then(res => res || fetch(request)));
    return;
  }
  // Seuls les fichiers publics de l'application sont mis en cache, jamais une API ou une vidéo.
  // Les illustrations WebP et les MP3 du المرشد sont explicitement autorisés ici, mais absents
  // du précache : ils entrent dans le cache à la volée lors de la première ouverture/lecture
  // (sauf lorsque le mode économie de data 4G est activé).
  if (!url.pathname.startsWith('/assets/') &&
      !/^\/lecons\/[a-zA-Z0-9_.-]+\.html$/.test(url.pathname) &&
      !illustrationValide(url.pathname) &&
      !audioValide(url.pathname) &&
      !BOUSSOLE.includes(url.pathname) && !COQUILLE.includes(url.pathname)) return;
  // Ne jamais substituer index.html à une leçon ou à un module absent.
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) return cached;
    try {
      const res = await fetch(request);
      const mediaLourd = audioValide(url.pathname) || illustrationValide(url.pathname);
      if (res.status === 200 && typeValide(url.pathname, res) && !request.headers.has('range') && !(economieData4G && mediaLourd)) {
        await cache.put(request, res.clone()).catch(() => {});
      }
      return res;
    } catch {
      return new Response('Ressource indisponible hors ligne', { status: 503, statusText: 'Unavailable Offline' });
    }
  })());
});
