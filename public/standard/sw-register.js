if("serviceWorker" in navigator){
  let refreshing=false;
  navigator.serviceWorker.addEventListener("controllerchange",()=>{
    if(refreshing)return;
    refreshing=true;
    window.location.reload();
  });
  window.addEventListener("load",async()=>{
    try{
      const registration=await navigator.serviceWorker.register("/standard/service-worker.js",{updateViaCache:"none"});
      await registration.update();
    }catch{}
  });
}
