// Minimal service worker — exists so the app qualifies as an installable PWA.
// Deliberately does no caching: this app's data is live from the server, and
// caching pages/API responses would risk showing stale business data.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {
  // No-op — let every request go to the network as normal.
});
