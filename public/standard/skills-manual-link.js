(function(){
  "use strict";
  const FALLBACKS={
    "hall-observe-05-clear-plate":["下げ物","空いた皿"],
    beer:["ビール"],
    highball:["ハイボール"],
    redwine:["ワイン","赤ワイン"],
    payment:["会計","見送り"],
    allergy:["アレルギー"],
    complaint:["苦情","違和感"],
    "anniversary-01-check":["記念日","予約内容"],
    "anniversary-03-cool-plate":["ケーキ","冷やす"],
    "anniversary-09-serve":["提供","写真撮影"],
    "anniversary-12-take-cut":["切り分け","ケーキ"]
  };
  function normalize(value){return String(value||"").normalize("NFKC").toLowerCase().replace(/[\s\u3000、。・,.!！?？「」『』（）()\-ー]/g,"");}
  function candidateText(item){return normalize([item.title,item.name,item.category,item.lead,item.use,item.summary,...(item.tags||[])].filter(Boolean).join(" "));}
  window.openSkillManual=function(type,id){
    closeModal("skillModal");
    let item=typeof findItem==="function"?findItem(type,id):null;
    if(!item){
      const list=type==="scene"?activeItems(config.scenes):type==="drink"?activeItems(config.drinks):type==="glass"?activeItems(config.glasses):type==="lesson"?activeItems(config.lessons):[];
      const terms=(FALLBACKS[id]||[id]).map(normalize).filter(Boolean);
      item=list.find((entry)=>{const text=candidateText(entry);return terms.some((term)=>text.includes(term));});
    }
    if(!item){showToast("対応するマニュアルを確認できませんでした。店主へ確認してください");return;}
    openItem(type,item.id);
  };
})();
