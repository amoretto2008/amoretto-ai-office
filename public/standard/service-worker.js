const CACHE = "amoretto-standard-v21";
const STATIC_ASSETS = [
  "/standard/",
  "/standard/index.html",
  "/standard/styles.css",
  "/standard/app.js",
  "/standard/defaults.js",
  "/standard/core-base.js",
  "/standard/manual-pack.js",
  "/standard/core-content.js",
  "/standard/course-flow.js",
  "/standard/staff-ready.js",
  "/standard/admin-core.js",
  "/standard/admin-bind.js",
  "/standard/guide.js",
  "/standard/guide-plus.js",
  "/standard/skills-compat.js",
  "/standard/skills.js",
  "/standard/skills-manual-link.js",
  "/standard/knowledge.js",
  "/standard/knowledge-flow.js",
  "/standard/operations.js",
  "/standard/priority-flow.js",
  "/standard/diagnostics-flow.js",
  "/standard/sw-register.js",
  "/standard/manifest.webmanifest",
  "/standard/icon.svg",
  "/standard/icon-192.png",
  "/standard/icon-512.png",
  "/standard/icon-maskable-512.png"
];

async function refreshOpenStandardPages(){
  const clients=await self.clients.matchAll({type:"window",includeUncontrolled:true});
  await Promise.all(clients.map(async(client)=>{
    try{
      const url=new URL(client.url);
      if(url.origin===self.location.origin&&url.pathname.startsWith("/standard"))await client.navigate(client.url);
    }catch{}
  }));
}

async function networkFirst(request,fallbackPath=""){
  try{
    const response=await fetch(request);
    if(response&&response.ok){
      const cache=await caches.open(CACHE);
      await cache.put(request,response.clone());
    }
    return response;
  }catch{
    const cached=await caches.match(request,{ignoreSearch:true});
    if(cached)return cached;
    if(fallbackPath){
      const fallback=await caches.match(fallbackPath);
      if(fallback)return fallback;
    }
    return Response.error();
  }
}

self.addEventListener("install",(event)=>{
  event.waitUntil(caches.open(CACHE).then((cache)=>cache.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate",(event)=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter((key)=>key!==CACHE).map((key)=>caches.delete(key)));
    await self.clients.claim();
    await refreshOpenStandardPages();
  })());
});

self.addEventListener("fetch",(event)=>{
  const request=event.request;
  if(request.method!=="GET")return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin||url.pathname.startsWith("/api/"))return;
  if(request.mode==="navigate"&&url.pathname.startsWith("/standard")){
    event.respondWith(networkFirst(request,"/standard/index.html"));
    return;
  }
  if(url.pathname.startsWith("/standard/")){
    event.respondWith(networkFirst(request));
  }
});