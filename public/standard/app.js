(function(){
  function load(src){
    return new Promise((resolve,reject)=>{
      const script=document.createElement("script");
      script.src=src;
      script.onload=resolve;
      script.onerror=reject;
      document.head.appendChild(script);
    });
  }
  load("defaults.js")
    .then(()=>load("core-base.js"))
    .then(()=>load("core-content.js"))
    .then(()=>load("admin-core.js"))
    .then(()=>load("admin-bind.js"))
    .catch(()=>{
      document.body.innerHTML='<p style="padding:24px;font-family:sans-serif">アプリの読み込みに失敗しました。画面を更新してください。</p>';
    });
})();
