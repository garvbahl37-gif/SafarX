/**
 * Tombstone service worker.
 *
 * An earlier build shipped a cache-first worker here that cached "/" and
 * served it for every request — so any browser that still had it registered
 * would land on a stale shell on refresh, regardless of the URL.
 *
 * A 404 at this path would NOT remove that worker; browsers keep the last
 * good copy. So this file must stay, and must actively unregister itself.
 */
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(names.map((n) => caches.delete(n)));
      await self.registration.unregister();
      const clientList = await self.clients.matchAll({ type: "window" });
      clientList.forEach((client) => client.navigate(client.url));
    })()
  );
});

// Never intercept requests — always go to the network.
