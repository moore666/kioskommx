// Se incrementa la versión del caché para forzar la actualización del Service Worker
const CACHE_NAME = "kiosco-mmx-v2"; 
const urlsToCache = [
  './',
  './index.html'
];

// Durante la instalación, se precargan los archivos esenciales en la caché.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierto y archivos principales cacheados');
        return cache.addAll(urlsToCache);
      })
  );
});

// Estrategia "Stale-While-Revalidate"
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(cachedResponse => {
        // Al mismo tiempo, se busca una versión actualizada en la red.
        const fetchedResponsePromise = fetch(event.request).then(networkResponse => {
          // Si la respuesta de la red es válida, se actualiza la caché.
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        });

        // Se devuelve la respuesta de la caché si existe (para velocidad), 
        // de lo contrario, se espera la respuesta de la red.
        return cachedResponse || fetchedResponsePromise;
      });
    })
  );
});

// Durante la activación, se eliminan las cachés antiguas para limpiar.
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
