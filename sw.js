// ============================================================
// EduFAZE AI — Service Worker (PWA Offline Support)
// ============================================================

const CACHE_NAME = 'edufaze-v1';
const STATIC_ASSETS = [
  'index.html',
  'css/styles.css',
  'css/pages.css',
  'js/app.js',
  'assets/hero-fluid-1.jpg',
  'assets/hero-fluid-2.jpg',
  'assets/icon-192.png',
  'assets/icon-512.png',
  'pages/login.html',
  'pages/dashboard-student.html',
  'pages/gaps.html',
  'pages/assistant.html',
  'pages/campus.html',
  'pages/skill-mapping.html',
  'pages/offline-hub.html',
  'pages/recommendations.html',
  'pages/interventions.html',
  'pages/passport.html',
  'pages/exam-analysis.html',
  'pages/integrity.html',
  'pages/accessibility.html',
  'pages/lab.html',
  'pages/resources.html',
  'pages/dashboard-admin.html',
  'pages/dashboard-teacher.html',
  'pages/reports.html',
  'pages/profile.html',
  'pages/settings.html',
  'pages/warnings.html',
  'pages/demo.html'
];

// Install: cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing EduFAZE service worker');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS.filter(url => !url.startsWith('https://fonts')));
    }).catch(err => console.warn('[SW] Cache install error:', err))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating EduFAZE service worker');
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch: Network-first for API, Cache-first for static
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip cross-origin non-font requests
  if (url.origin !== location.origin && !url.hostname.includes('fonts')) {
    return;
  }

  // Cache-first strategy for static assets
  if (event.request.method === 'GET') {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          if (response && response.status === 200 && response.type !== 'opaque') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        }).catch(() => {
          // Offline fallback for HTML pages
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/pages/offline-hub.html') || caches.match('/index.html');
          }
        });
      })
    );
  }
});

// Background sync for pending submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-pending') {
    console.log('[SW] Background sync: processing pending items');
    event.waitUntil(processPendingSync());
  }
});

async function processPendingSync() {
  // In production this would read from IndexedDB and POST to server
  console.log('[SW] Sync complete (demo — no real server)');
}
