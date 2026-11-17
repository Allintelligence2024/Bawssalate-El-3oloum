// عامل الخدمة — بوصلة العلوم Lite
// PWA يدوية: precache الواجهة، network-first للتنقل، cache-first للأصول.
// يعمل دون اتصال بعد أول تحميل (سياق الشبكة الجزائري المحدود).
// P0.7: الحزم الكسولة (Methodologie، بنوك التدريبات، supabase) تُقرأ من
// /precache-manifest.json (يولّده vite.config.ts عند البناء) وتُخزَّن عند التثبيت —
// لا من index.html الذي لا يذكر سوى حزمة الدخول.

const CACHE = 'murajih-svt-v4';
const PRECACHE_STATIC = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icon.svg',
  '/mascotte.png',
  '/personnage-pirate.png',
  '/ouverture.mp4',
  '/lecons/lecon_activite_structure.html',
  '/lecons/lecon_representation.html',
  '/lecons/lecon_transcription.html',
  '/lecons/phase1_chapitres_1_2.html',
  '/lecons/phase2_chapitres_3_4.html',
  '/lecons/phase3_chapitres_5_6.html',
  '/lecons/phase4_chapitres_7_8.html',
  '/lecons/phase5_chapitres_9_10.html',
  '/lecons/phase6_chapitres_11_12.html',
  '/lecons/phase7_chapitres_13_14.html',
  '/lecons/phase8_chapitres_15_16.html',
  '/lecons/phase9_chapitres_17_18.html',
  '/lecons/phase10_chapitres_19_20.html',
  '/lecons/phase11_chapitres_21_22.html',
  '/lecons/phase12_chapitres_23_24.html',
  '/lecons/phase13_chapitres_25_26.html',
  '/lecons/phase14_chapitres_27_28.html',
  '/lecons/phase15_chapitres_29_30.html',
  '/lecons/phase16_chapitres_31_32.html',
  '/lecons/phase17_chapitres_33_34.html',
  '/lecons/phase18_chapitres_35_36.html',
  '/lecons/phase19_chapitres_37_38.html',
  '/lecons/phase20_chapitres_39_40.html',
  '/lecons/phase21_chapitres_41_42.html',
  '/lecons/phase22_chapitres_43_44.html',
];

const ASSETS_CACHE = 'murajih-svt-assets-v2';
const MANIFESTE_ASSETS = '/precache-manifest.json';

/** قائمة الحزم الحالية من مانيفست البناء (أو [] إن تعذّر). */
async function listeAssetsDuManifeste() {
  try {
    const res = await fetch(MANIFESTE_ASSETS, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json.assets) ? json.assets.filter((u) => typeof u === 'string' && u.startsWith('/assets/')) : [];
  } catch {
    return [];
  }
}

/**
 * تخزين كل الحزم المذكورة في المانيفست (الناقصة فقط). لا نُفشل التثبيت إن تعذّر
 * تنزيل حزمة: يُعاد المحاولة عند كل تنقّل متّصل بالشبكة (voir fetch/navigate).
 * يُرجع عدد الحزم الناقصة بعد المحاولة.
 */
async function chaufferAssets() {
  const liste = await listeAssetsDuManifeste();
  if (liste.length === 0) return -1;
  const cache = await caches.open(ASSETS_CACHE);
  const manquants = [];
  for (const url of liste) {
    if (!(await cache.match(url))) manquants.push(url);
  }
  await Promise.allSettled(
    manquants.map(async (url) => {
      const res = await fetch(url, { cache: 'no-cache' });
      if (res.ok) await cache.put(url, res);
    })
  );
  let restants = 0;
  for (const url of liste) if (!(await cache.match(url))) restants++;
  return restants;
}

/** حذف الحزم القديمة (هاش مختلف) التي لم تعد في المانيفست — يمنع تضخّم الكاش. */
async function purgerAssetsObsoletes() {
  const liste = new Set(await listeAssetsDuManifeste());
  if (liste.size === 0) return; // بلا شبكة لا نحذف شيئًا
  const cache = await caches.open(ASSETS_CACHE);
  for (const req of await cache.keys()) {
    const chemin = new URL(req.url).pathname;
    if (!liste.has(chemin)) await cache.delete(req);
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE_STATIC))
      .then(() => chaufferAssets())
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE && k !== ASSETS_CACHE).map((k) => caches.delete(k))))
      .then(() => purgerAssetsObsoletes())
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  // التنقل: الشبكة أولاً، ثم النسخة المخبأة (offline fallback).
  // عند كل تنقّل ناجح نُكمل الحزم الناقصة في الخلفية (بلا حجب للاستجابة).
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          event.waitUntil(
            caches
              .open(CACHE)
              .then((cache) => cache.put(request, copy))
              .then(() => chaufferAssets())
              .catch(() => {})
          );
          return res;
        })
        .catch(() => caches.match('/index.html').then((r) => r || caches.match('/')))
    );
    return;
  }

  const url = new URL(request.url);

  // الحزم (JS/CSS): الكاش أولاً، ثم الشبكة مع تخزين. عند الفشل: خطأ شبكة صريح —
  // لا نُرجع index.html أبدًا مكان وحدة JS (نوع MIME خاطئ يكسر التطبيق بصمت).
  if (url.origin === self.location.origin && (url.pathname.startsWith('/assets/') || /\.(?:js|css)$/.test(url.pathname))) {
    event.respondWith(
      caches.open(ASSETS_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        try {
          const res = await fetch(request);
          if (res.ok) cache.put(request, res.clone());
          return res;
        } catch {
          return new Response('', { status: 503, statusText: 'Hors ligne — chunk non mis en cache' });
        }
      })
    );
    return;
  }

  // باقي الطلبات (صور، دروس HTML، PDF مفتوحة سابقًا): الكاش الرئيسي أولاً
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request)
          .then((res) => {
            if (res.ok && url.origin === self.location.origin) {
              const copy = res.clone();
              caches.open(CACHE).then((cache) => cache.put(request, copy));
            }
            return res;
          })
          .catch(() => (request.destination === 'document' ? caches.match('/index.html') : Response.error()))
    )
  );
});
