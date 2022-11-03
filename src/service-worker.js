// set the prefix and suffix of our sw's name
workbox.core.setCacheNameDetails({
  prefix: 'relax',
  suffix: 'v1.0.0',
});
// have our sw update and control a web page as soon as possible.
workbox.core.skipWaiting();
workbox.core.clientsClaim();

// vue-cli3.0 supports pwa with the help of workbox-webpack-plugin, we need to get the precacheing list through this sentence.
workbox.precaching.precacheAndRoute(self.__precacheManifest || []);

