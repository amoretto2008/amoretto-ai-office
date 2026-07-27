(function(){
  "use strict";

  const QUICK_QUESTIONS = [
    "アレルギー対応",
    "あわびの説明",
    "記念日ケーキ",
    "お水を注ぐタイミング",
    "料理が遅れている",
    "ワインを注ぐ",
    "お会計",
    "在庫確認",
    "開店前",
    "閉店後"
  ];

  const INTENTS = [
    {patterns:["アレルギー","食物アレルギー","食べられない","苦手食材"],terms:["アレルギー","安全","苦手","食材"]},
    {patterns:["あわび","鮑"],terms:["あわび","ブルゴーニュソース","焦がし醤油","肝"]},
    {patterns:["フォアグラ"],terms:["フォアグラ","バルサミコ","トリュフ塩"]},
    {patterns:["お肉","ステーキ","肉の説明"],terms:["お肉","産地","わさび","塩","白ごはん"]},
    {patterns:["ケーキ","誕生日","記念日","お祝い"],terms:["記念日","ケーキ","花火","写真","主役"]},
    {patterns:["水を注ぐ","お水","水の補充"],terms:["お水","会話の切れ目","観察"]},
    {patterns:["ワインを注ぐ","ワインのお注ぎ","ボトル"],terms:["ワインのお注ぎ","ボトル","残量","コルク"]},
    {patterns:["料理が遅い","料理が遅れて","待たせて","提供が遅い"],terms:["料理の提供が遅れている","お待たせ","進行"]},
    {patterns:["会計","お会計","支払い","領収書","料金"],terms:["お会計","料金","支払い","領収書","見送り"]},
    {patterns:["苦情","クレーム","怒って","違和感"],terms:["苦情","違和感","お詫び","店主"]},
    {patterns:["在庫","残り","何本","補充","発注"],terms:["在庫確認","基準","補充","発注"]},
    {patterns:["開店前","始め","オープン"],terms:["開店前","予約確認","電源","テーブルセット"]},
    {patterns:["閉店後","閉め","クローズ"],terms:["閉店後","電源確認","ガス","ゴミ"]},
    {patterns:["ガス","火事","煙","異臭","機器の異常","故障"],terms:["ガス","電源","安全","事故"]}
  ];

  const CRITICAL = [
    {patterns:["アレルギー","食物アレルギー","食べられない"],title:"安全に関わるため店主確認",message:"自己判断で答えず、対象食材と症状の程度を確認して、必ず店主または厨房責任者へつないでください。"},
    {patterns:["苦情","クレーム","怒って","返金","値引き"],title:"店主へ引き継ぐ対応",message:"言い訳や約束をせず、まずお話を聞いてお詫びし、事実を店主へ共有してください。"},
    {patterns:["会計","料金","支払い","領収書","サービス料"],title:"金額を推測しない",message:"料金・サービス料・支払い方法に不明点がある場合は、その場で決めず店主へ確認してください。"},
    {patterns:["ガス","火事","煙","異臭","漏れ","機器の異常","故障"],title:"安全を最優先",message:"使用を止め、お客様の安全を確保し、直ちに店主へ報告してください。危険がある場合は無理に操作しないでください。"},
    {patterns:["予約が違う","予約内容が違う","人数が違う","予約がない"],title:"案内前に予約確認",message:"お客様を責めず、予約名・時刻・人数を確認してから店主へつないでください。"}
  ];

  function normalize(value){
    return String(value||"")
      .normalize("NFKC")
      .toLowerCase()
      .replace(/[\s\u3000、。・,.!！?？「」『』（）()\-ー]/g,"");
  }

  function active(list){ return (list||[]).filter((item)=>item&&item.active!==false); }

  function injectUI(){
    if(document.getElementById("staffGuideBtn")) return;
    const style=document.createElement("style");
    style.textContent=`
      .guide-fab{position:fixed;z-index:45;right:max(14px,calc((100vw - 760px)/2 + 14px));bottom:calc(82px + env(safe-area-inset-bottom));border:0;border-radius:999px;background:var(--accent);color:white;box-shadow:0 10px 28px rgba(79,27,37,.28);padding:12px 17px;font-weight:800;display:flex;align-items:center;gap:7px}
      .guide-fab span{width:23px;height:23px;border-radius:50%;display:grid;place-items:center;background:rgba(255,255,255,.18)}
      .guide-modal{z-index:140}.guide-sheet{max-height:94vh}.guide-intro{background:var(--ok-soft);border:1px solid #c8d9ce;border-radius:14px;padding:12px 14px;margin-bottom:13px;color:var(--ok);font-size:12px;line-height:1.65}
      .guide-form{display:grid;grid-template-columns:1fr auto;gap:8px;margin-bottom:10px}.guide-form .search{min-width:0}.guide-submit{border:0;border-radius:13px;background:var(--deep);color:white;padding:0 15px;font-weight:800}
      .guide-quick{display:flex;gap:7px;overflow-x:auto;padding:2px 0 13px;scrollbar-width:none}.guide-quick::-webkit-scrollbar{display:none}.guide-chip{white-space:nowrap;border:1px solid var(--line);border-radius:999px;background:white;color:var(--ink);padding:8px 11px;font-size:11px}
      .guide-result-head{display:flex;justify-content:space-between;align-items:center;gap:10px;margin:8px 0 10px}.guide-result-head h3{margin:0}.guide-count{font-size:10px;color:var(--muted)}
      .guide-alert{border-left:4px solid var(--danger);background:var(--danger-soft);border-radius:14px;padding:13px 14px;margin-bottom:12px}.guide-alert strong{display:block;color:var(--danger);margin-bottom:5px}.guide-alert p{font-size:12px;margin:0;line-height:1.65}
      .guide-answer{border:1px solid var(--line);border-radius:16px;background:white;padding:14px;margin-bottom:10px}.guide-answer-top{display:flex;justify-content:space-between;gap:9px;align-items:flex-start}.guide-answer h3{font-size:14px;margin:4px 0 7px}.guide-answer p{font-size:12px;line-height:1.7;margin-bottom:8px}.guide-answer .quote-box{font-size:12px;margin-top:9px}.guide-answer-actions{display:flex;justify-content:flex-end;margin-top:10px}.guide-open{border:1px solid var(--line);background:white;color:var(--accent);border-radius:10px;padding:8px 11px;font-size:11px;font-weight:700}
      .guide-empty{border:1px dashed var(--line);border-radius:15px;padding:18px;text-align:left;background:#faf7f1}.guide-empty strong{display:block;margin-bottom:6px}.guide-empty p{font-size:12px;line-height:1.7;margin:0;color:var(--muted)}
      @media(max-width:390px){.guide-fab{padding:11px 14px;font-size:12px}.guide-form{grid-template-columns:1fr}.guide-submit{padding:11px}}
    `;
    document.head.appendChild(style);

    document.body.insertAdjacentHTML("beforeend",`
      <button class="guide-fab" id="staffGuideBtn" type="button" aria-label="困ったときのスタッフ案内"><span>?</span>困った</button>
      <div class="modal guide-modal" id="staffGuideModal" role="dialog" aria-modal="true" aria-labelledby="staffGuideTitle">
        <div class="sheet guide-sheet">
          <div class="sheet-head">
            <div><div class="eyebrow">AMORÉTTO GUIDE</div><h2 class="no-bottom" id="staffGuideTitle">困ったときの案内</h2></div>
            <button class="close-btn" id="staffGuideClose" type="button" aria-label="閉じる">×</button>
          </div>
          <div class="guide-intro">登録済みのAMORÉTTOマニュアルだけから案内します。生成AIや外部APIは使わないため、AI利用料はかかりません。</div>
          <form class="guide-form" id="staffGuideForm">
            <input class="search large-search" id="staffGuideInput" type="search" autocomplete="off" placeholder="例：あわびの説明は？" />
            <button class="guide-submit" type="submit">確認</button>
          </form>
          <div class="guide-quick" id="staffGuideQuick"></div>
          <div id="staffGuideResults"><div class="guide-empty"><strong>何に困っていますか？</strong><p>上の候補を押すか、短い言葉で入力してください。分からない内容は推測せず「店主へ確認」と案内します。</p></div></div>
        </div>
      </div>
    `);

    document.getElementById("staffGuideQuick").innerHTML=QUICK_QUESTIONS.map((q)=>`<button class="guide-chip" type="button" data-guide-query="${esc(q)}">${esc(q)}</button>`).join("");
    document.getElementById("staffGuideBtn").addEventListener("click",openGuide);
    document.getElementById("staffGuideClose").addEventListener("click",closeGuide);
    document.getElementById("staffGuideModal").addEventListener("click",(event)=>{if(event.target.id==="staffGuideModal") closeGuide();});
    document.getElementById("staffGuideForm").addEventListener("submit",(event)=>{event.preventDefault();runGuide(document.getElementById("staffGuideInput").value);});
    document.querySelectorAll("[data-guide-query]").forEach((button)=>button.addEventListener("click",()=>{document.getElementById("staffGuideInput").value=button.dataset.guideQuery;runGuide(button.dataset.guideQuery);}));
  }

  function openGuide(){
    const modal=document.getElementById("staffGuideModal");
    modal.classList.add("open");
    setTimeout(()=>document.getElementById("staffGuideInput").focus(),80);
  }

  function closeGuide(){ document.getElementById("staffGuideModal")?.classList.remove("open"); }

  function expandedTerms(query,index){
    const nq=normalize(query);
    const terms=[query];
    INTENTS.forEach((intent)=>{if(intent.patterns.some((p)=>nq.includes(normalize(p)))) terms.push(...intent.terms);});
    index.forEach((record)=>{
      record.keywords.forEach((keyword)=>{
        const nk=normalize(keyword);
        if(nk.length>=2&&nq.includes(nk)) terms.push(keyword);
      });
    });
    return [...new Set(terms.map((term)=>String(term).trim()).filter(Boolean))];
  }

  function buildIndex(){
    const records=[];
    active(config.scenes).forEach((item)=>records.push({type:"scene",id:item.id,title:item.title,subtitle:item.category||"場面別",body:item.lead||"",say:item.say||"",keywords:[item.title,item.category,item.lead,item.say,item.ask,...(item.tags||[]),...(item.do||[]),...(item.dont||[])],item}));
    active(config.drinks).forEach((item)=>records.push({type:"drink",id:item.id,title:item.name,subtitle:item.category||"ドリンク",body:item.note||item.steps?.[0]||"",say:"",keywords:[item.name,item.category,item.glass,item.note,...(item.tags||[]),...(item.ingredients||[]),...(item.steps||[]),...(item.standard||[])],item}));
    active(config.glasses).forEach((item)=>records.push({type:"glass",id:item.id,title:item.name,subtitle:"グラス",body:item.use||item.handling||"",say:"",keywords:[item.name,item.use,item.location,item.handling,item.reject,...(item.tags||[])],item}));
    active(config.lessons).forEach((item)=>records.push({type:"lesson",id:item.id,title:item.title,subtitle:item.day||"学ぶ",body:item.summary||item.content||"",say:"",keywords:[item.title,item.day,item.summary,item.content,...(item.points||[])],item}));
    active(config.checklists).forEach((list)=>{
      records.push({type:"checklist",id:list.id,title:list.title,subtitle:"チェック",body:list.description||"",say:"",keywords:[list.title,list.description,...(list.items||[]).map((x)=>x.text)],item:list});
      (list.items||[]).forEach((entry)=>records.push({type:"checkitem",id:entry.id,parentId:list.id,title:entry.text,subtitle:list.title,body:"チェック項目",say:"",keywords:[entry.text,list.title,list.description],item:entry,parent:list}));
    });
    return records.map((record)=>({...record,keywords:record.keywords.filter(Boolean),searchable:normalize([record.title,record.subtitle,record.body,record.say,...record.keywords].join(" "))}));
  }

  function scoreRecord(record,query,terms){
    const nq=normalize(query);
    const title=normalize(record.title);
    let score=0;
    if(title===nq) score+=100;
    else if(title.includes(nq)||nq.includes(title)) score+=42;
    record.keywords.forEach((keyword)=>{
      const nk=normalize(keyword);
      if(!nk) return;
      if(nq.includes(nk)) score+=nk.length>=4?14:8;
    });
    terms.forEach((term,index)=>{
      const nt=normalize(term);
      if(!nt) return;
      if(title.includes(nt)) score+=20-index;
      else if(record.searchable.includes(nt)) score+=8;
    });
    if(score>0&&record.type==="scene") score+=2;
    return score;
  }

  function criticalFor(query){
    const nq=normalize(query);
    return CRITICAL.find((rule)=>rule.patterns.some((pattern)=>nq.includes(normalize(pattern))));
  }

  function typeName(type){
    return ({scene:"場面別",drink:"ドリンク",glass:"グラス",lesson:"研修",checklist:"チェック",checkitem:"チェック項目"})[type]||type;
  }

  function resultBody(record,terms){
    if(record.type==="scene"){
      const lead=record.item.lead?`<p><strong>まずすること：</strong>${esc(record.item.lead)}</p>`:"";
      const say=record.item.say?`<div class="quote-box">「${esc(record.item.say)}」</div>`:"";
      return `${lead}${say}`;
    }
    if(record.type==="drink"){
      const steps=(record.item.steps||[]).slice(0,3).map((x)=>`<li>${esc(x)}</li>`).join("");
      return `<p><strong>使用グラス：</strong>${esc(record.item.glass||"未登録")}</p>${steps?`<ol class="steps">${steps}</ol>`:""}`;
    }
    if(record.type==="glass") return `<p>${esc(record.item.use||record.item.handling||"登録内容を開いて確認してください。")}</p>`;
    if(record.type==="lesson") return `<p>${esc(record.item.summary||record.item.content||"")}</p>`;
    if(record.type==="checkitem") return `<p><strong>${esc(record.parent.title)}</strong><br>${esc(record.item.text)}</p>`;
    if(record.type==="checklist"){
      const normalizedTerms=terms.map(normalize).filter(Boolean);
      let items=(record.item.items||[]).filter((entry)=>normalizedTerms.some((term)=>normalize(entry.text).includes(term)));
      if(!items.length) items=(record.item.items||[]).slice(0,5);
      return `<ul class="steps">${items.slice(0,6).map((entry)=>`<li>${esc(entry.text)}</li>`).join("")}</ul>`;
    }
    return `<p>${esc(record.body||"")}</p>`;
  }

  function actionButton(record){
    const parent=record.parentId||"";
    return `<button class="guide-open" type="button" onclick="openGuideResult('${esc(record.type)}','${esc(record.id)}','${esc(parent)}')">詳しく見る</button>`;
  }

  function runGuide(query){
    const value=String(query||"").trim();
    const container=document.getElementById("staffGuideResults");
    if(!value){
      container.innerHTML=`<div class="guide-empty"><strong>短い言葉で入力してください</strong><p>例：アレルギー、あわび、記念日、在庫、閉店後</p></div>`;
      return;
    }
    const index=buildIndex();
    const terms=expandedTerms(value,index);
    const critical=criticalFor(value);
    const results=index.map((record)=>({...record,score:scoreRecord(record,value,terms)})).filter((record)=>record.score>0).sort((a,b)=>b.score-a.score).filter((record,index,array)=>array.findIndex((x)=>x.type===record.type&&x.id===record.id)===index).slice(0,4);
    const alert=critical?`<div class="guide-alert"><strong>${esc(critical.title)}</strong><p>${esc(critical.message)}</p></div>`:"";
    if(!results.length){
      container.innerHTML=`${alert}<div class="guide-empty"><strong>登録済みの基準から確認できませんでした</strong><p>推測して進めず、一度止まり、店主へ確認してください。確認後はマニュアルへ追加すると、次回から検索できます。</p></div>`;
      return;
    }
    container.innerHTML=`${alert}<div class="guide-result-head"><h3>登録済みの基準</h3><span class="guide-count">候補 ${results.length}件</span></div>${results.map((record)=>`<div class="guide-answer"><div class="guide-answer-top"><div><span class="badge">${esc(typeName(record.type))}</span><h3>${esc(record.title)}</h3></div></div>${resultBody(record,terms)}<div class="guide-answer-actions">${actionButton(record)}</div></div>`).join("")}`;
    localStorage.setItem("amoretto-standard-guide-last",value);
  }

  window.openGuideResult=function(type,id,parentId){
    closeGuide();
    if(type==="checkitem"||type==="checklist"){
      currentChecklistId=type==="checkitem"?parentId:id;
      switchScreen("check");
      renderChecks();
      return;
    }
    openItem(type,id);
  };

  injectUI();
})();
