// HomeCraft offline cache. The page is network-first (updates arrive when online);
// hashed assets and icons are cache-first. Bump VERSION to drop old caches.
const VERSION = 'homecraft-editorial-v1';
// Servers may send `Vary: Origin`; module scripts and the page differ in that header, so ignore Vary.
const MATCH = { ignoreVary: true };
const CORE = ['./', './manifest.webmanifest', './icon.png', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('homecraft-') && k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('message', e => {
  if (e.data?.type !== 'cache' || !Array.isArray(e.data.urls)) return;
  const same = e.data.urls.filter(u => typeof u === 'string' && u.startsWith(self.location.origin));
  e.waitUntil?.(caches.open(VERSION).then(c => Promise.all(same.map(u => c.add(u).catch(() => {})))));
});
// Hashed scripts and styles from older deploys pile up in the same cache; the page sends the list
// of files it uses (online, after the cookbook loaded) and older .js/.css under assets/ are removed.
// Images are kept: section photos load only when a section is opened.
self.addEventListener('message', e => {
  if (e.data?.type !== 'prune' || !Array.isArray(e.data.keep)) return;
  const keep = new Set(e.data.keep.filter(u => typeof u === 'string').map(u => u.split('#')[0]));
  e.waitUntil?.(caches.open(VERSION).then(c => c.keys().then(reqs => Promise.all(reqs
    .filter(r => /\/assets\/[^/]+\.(js|css)$/.test(new URL(r.url).pathname) && !keep.has(r.url))
    .map(r => c.delete(r, MATCH))))));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || !req.url.startsWith(self.location.origin)) return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req,{cache:'no-store'}).then(res => { const copy = res.clone(); if (res.ok) caches.open(VERSION).then(c => c.put('./', copy)); return res; })
      .catch(() => caches.match('./', { ...MATCH, ignoreSearch: true }).then(r => r || caches.match(req, MATCH))));
    return;
  }
  e.respondWith(caches.match(req, MATCH).then(hit => hit || fetch(req).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
    return res;
  })));
});
