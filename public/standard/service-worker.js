const CACHE = "amoretto-standard-v9";
const STATIC_ASSETS = [
  "/standard/",
  "/standard/index.html",
  "/standard/styles.css",
  "/standard/app.js",
  "/standard/defaults.js",
  "/standard/core-base.js",
  "/standard/manual-pack.js",
  "/standard/core-content.js",
  "/standard/admin-core.js",
  "/standard/admin-bind.js",
  "/standard/guide.js",
  "/standard/guide-plus.js",
  "/standard/skills-compat.js",
  "/standard/skills.js",
  "/standard/skills-manual-link.js",
  "/standard/knowledge.js",
  "/standard/sw-register.js",
  "/standard/manifest.webmanifest",
  "/standard/icon.svg",
  "/standard/icon-192.png",
  "/standard/icon-512.png",
  "/standard/icon-maskable-512.png"
];
self.addEventListener("install",(event)=>{event.waitUntil(caches.open(CACHE).then((cache)=>cache.addAll(STATIC_ASSETS)));self.skipWaiting();});
self.addEventListener("activate",(event)=>{event.waitUntil(caches.keys().then((keys)=>Promise.all(keys.filter((key)=>key!==CACHE).map((key)=>caches.delete(key)))));self.clients.claim();});
self.addEventListener("fetch",(event)=>{
  const request=event.request;
  if(request.method!=="GET")return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin||url.pathname.startsWith("/api/"))return;
  if(request.mode==="navigate"&&url.pathname.startsWith("/standard")){
    event.respondWith(fetch(request).then((response)=>{const copy=response.clone();caches.open(CACHE).then((cache)=>cache.put("/standard/index.html",copy));return response;}).catch(()=>caches.match("/standard/index.html")));
    return;
  }
  if(url.pathname.startsWith("/standard/")){
    event.respondWith(caches.match(request).then((cached)=>cached||fetch(request).then((response)=>{const copy=response.clone();caches.open(CACHE).then((cache)=>cache.put(request,copy));return response;})));
  }
});
