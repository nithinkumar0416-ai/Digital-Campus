// ============================================================
// EduFAZE AI — Production Service Worker (PWA Offline Support)
// Version 2 — Self-healing, Network-First for Navigation
// ============================================================

const CACHE_NAME = 'edufaze-v2';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/styles.css',
  '/css/pages.css',
  '/js/app.js',
  '/assets/hero-fluid-1.jpg',
  '/assets/hero-fluid-2.jpg',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
  '/pages/login.html',
  '/pages/dashboard-student.html',
  '/pages/dashboard-teacher.html',
  '/pages/dashboard-admin.html',
  '/pages/gaps.html',
  '/pages/skill-mapping.html',
  '/pages/warnings.html',
  '/pages/campus.html',
  '/pages/passport.html',
  '/pages/offline-hub.html',
  '/pages/exam-analysis.html',
  '/pages/integrity.html',
  '/pages/accessibility.html',
  '/pages/lab.html',
  '/pages/assistant.html',
  '/pages/recommendations.html',
  '/pages/interventions.html',
  '/pages/reports.html',
  '/pages/resources.html',
  '/pages/profile.html',
  '/pages/settings.html',
  '/pages/demo.html'
];

// Fallback HTML when completely offline
const OFFLINE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Offline — EduFAZE AI</title>
  <style>
    body { background: #06040f; color: #fff; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
    .card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 2.5rem; max-width: 400px; }
    h1 { font-size: 1.5rem; color: #a78bfa; margin-bottom: 0.5rem; }
    p { font-size: 0.9rem; color: #94a3b8; margin-bottom: 1.5rem; }
    a { display: inline-block; padding: 0.6rem 1.2rem; background: #7c3aed; color: #fff; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 0.85rem; }
  </style>
</head>
<body>
  <div class="card">
    <h1>EduFAZE AI</h1>
    <p>You appear to be offline or reconnecting to the network.</p>
    <a href="/index.html">Return to Platform</a>
  </div>
</body>
</html>`;

// Install: Cache core assets and take over immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Use map to avoid one failing asset breaking the whole cache
      return Promise.allSettled(
        STATIC_ASSETS.map((asset) =>
          cache.add(asset).catch((err) => {
            console.warn('[SW] Non-critical cache prefetch skip for:', asset, err);
          })
        )
      );
    })
  );
});

// Activate: Bust old caches (edufaze-v1) and claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Purging outdated cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Strategy:
// 1. Navigation (HTML pages): Network-First with Cache fallback & safety net (NEVER returns undefined)
// 2. Static Assets (CSS, JS, Images): Stale-While-Revalidate / Cache-First
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin non-CDN requests
  if (request.method !== 'GET' || (url.origin !== location.origin && !url.hostname.includes('fonts.'))) {
    return;
  }

  // NAVIGATION REQUESTS (HTML Pages like /pages/lab.html)
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // If network returns a valid page, update the cache copy
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          // Network failed (offline) — try exact cache match, then path match
          return caches.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) return cachedResponse;
              return caches.match('/pages/offline-hub.html');
            })
            .then((fallback) => {
              if (fallback) return fallback;
              return caches.match('/index.html');
            })
            .then((finalFallback) => {
              // Guaranteed safety response: NEVER return undefined to avoid ERR_FAILED
              return finalFallback || new Response(OFFLINE_HTML, {
                status: 200,
                headers: { 'Content-Type': 'text/html; charset=utf-8' }
              });
            });
        })
    );
    return;
  }

  // STATIC ASSETS (CSS, JS, Fonts, Images)
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        // Fetch in background to revalidate cache (Stale-While-Revalidate)
        fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
            }
          })
          .catch(() => {/* ignore background revalidate error */});
        return cached;
      }

      // Not in cache: fetch from network
      return fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          // Return empty response rather than null for images/styles to avoid breaking page render
          return new Response('', { status: 408, headers: { 'Content-Type': 'text/plain' } });
        });
    })
  );
});

// Background Sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-pending') {
    console.log('[SW] Processing background sync queue');
  }
});
