if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('/standard/service-worker.js').catch(()=>{}));}
