(function(){
  const ASSET_VERSION="22";
  function load(src){
    return new Promise((resolve,reject)=>{
      const script=document.createElement("script");
      script.src=`${src}?v=${ASSET_VERSION}`;
      script.onload=resolve;
      script.onerror=reject;
      document.head.appendChild(script);
    });
  }
  load("defaults.js")
    .then(()=>load("core-base.js"))
    .then(()=>load("manual-pack.js"))
    .then(()=>load("core-content.js"))
    .then(()=>load("course-flow.js"))
    .then(()=>load("admin-core.js"))
    .then(()=>load("admin-bind.js"))
    .then(()=>load("guide.js"))
    .then(()=>load("guide-plus.js"))
    .then(()=>load("skills-compat.js"))
    .then(()=>load("skills.js"))
    .then(()=>load("skills-manual-link.js"))
    .then(()=>load("knowledge.js"))
    .then(()=>load("knowledge-flow.js"))
    .then(()=>load("operations.js"))
    .then(()=>load("priority-flow.js"))
    .then(()=>load("diagnostics-flow.js"))
    .catch(()=>{
      document.body.innerHTML='<p style="padding:24px;font-family:sans-serif">アプリの読み込みに失敗しました。画面を更新してください。</p>';
    });
})();
