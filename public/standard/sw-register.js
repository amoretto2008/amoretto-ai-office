(function(){
  if(document.getElementById("standardCriticalVisibility"))return;
  const style=document.createElement("style");
  style.id="standardCriticalVisibility";
  style.textContent=".screen:not(.active),.modal:not(.open),.admin-panel:not(.active),.hidden,.offline-banner:not(.show){display:none!important}";
  document.head.appendChild(style);
})();

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
