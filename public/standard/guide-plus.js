(function(){
  "use strict";
  const HISTORY_KEY="amoretto-standard-guide-history";
  const GROUPS=[
    ["安全・判断",["アレルギー対応","苦情を受けた","会計が分からない","機器に異常がある"]],
    ["料理・提供",["あわびの説明","お肉の説明","記念日ケーキ","料理が遅れている"]],
    ["営業・準備",["お水を注ぐタイミング","ワインを注ぐ","在庫確認","開店前","閉店後"]]
  ];
  const $id=(id)=>document.getElementById(id);
  const history=()=>localJson(HISTORY_KEY,[]);
  const currentQuery=()=>String($id("staffGuideInput")?.value||"").trim();
  const findSceneByTitle=(title)=>activeItems(config.scenes).find((item)=>item.title===title);

  function addStyle(){
    const style=document.createElement("style");
    style.textContent=`
      .guide-form{grid-template-columns:1fr auto auto!important}.guide-voice{width:46px;border:1px solid var(--line);border-radius:13px;background:white;color:var(--deep);font-size:18px}.guide-voice.listening{background:var(--danger-soft);color:var(--danger)}
      .guide-groups{display:grid;gap:9px;margin-bottom:12px}.guide-group-label{font-size:10px;color:var(--muted);font-weight:800;margin-bottom:5px}.guide-recent-wrap{margin-bottom:12px}.guide-recent{display:flex;gap:7px;overflow-x:auto;scrollbar-width:none}.guide-recent::-webkit-scrollbar{display:none}.guide-chip.recent{background:#f7f3ed}
      .guide-primary{border:2px solid var(--accent)!important;box-shadow:0 7px 20px rgba(31,42,38,.06)}.guide-primary-kicker{font-size:10px;color:var(--accent);font-weight:800;letter-spacing:.08em;margin-bottom:4px}.guide-detail-block{border-top:1px solid var(--line);padding-top:10px;margin-top:10px}.guide-detail-label{font-size:10px;color:var(--muted);font-weight:800;margin-bottom:5px}.guide-detail-block ol,.guide-detail-block ul{margin:0;padding-left:20px}.guide-detail-block li{font-size:12px;line-height:1.65;margin-bottom:5px}.guide-confirm{background:var(--warning-soft);color:var(--warning);border-radius:11px;padding:10px 12px;font-size:12px;line-height:1.6}
      .guide-extra-actions,.guide-feedback{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.guide-secondary{border:1px solid var(--line);background:white;color:var(--ink);border-radius:10px;padding:8px 11px;font-size:11px;font-weight:700}.guide-feedback{border-top:1px solid var(--line);padding-top:10px}.guide-groups .guide-quick{padding-bottom:0}
      @media(max-width:390px){.guide-form{grid-template-columns:1fr auto!important}.guide-submit{grid-column:1/-1}.guide-voice{grid-column:2;grid-row:1}}
    `;
    document.head.appendChild(style);
  }

  function saveQuery(query){
    if(!query)return;
    setLocalJson(HISTORY_KEY,[query,...history().filter((x)=>x!==query)].slice(0,6));
    renderRecent();
  }

  function runQuery(query){
    const input=$id("staffGuideInput");
    if(input)input.value=query;
    $id("staffGuideForm")?.dispatchEvent(new Event("submit",{bubbles:true,cancelable:true}));
  }

  function renderGroups(){
    const old=$id("staffGuideQuick");
    if(!old)return;
    old.className="guide-groups";
    old.innerHTML=GROUPS.map(([label,items])=>`<div><div class="guide-group-label">${esc(label)}</div><div class="guide-quick">${items.map((q)=>`<button class="guide-chip" type="button" data-guide-plus-query="${esc(q)}">${esc(q)}</button>`).join("")}</div></div>`).join("");
    old.querySelectorAll("[data-guide-plus-query]").forEach((button)=>button.addEventListener("click",()=>runQuery(button.dataset.guidePlusQuery)));
  }

  function renderRecent(){
    let wrap=$id("staffGuideRecentWrap");
    if(!wrap){
      wrap=document.createElement("div");wrap.id="staffGuideRecentWrap";wrap.className="guide-recent-wrap";
      $id("staffGuideQuick")?.insertAdjacentElement("afterend",wrap);
    }
    const items=history();
    wrap.classList.toggle("hidden",!items.length);
    wrap.innerHTML=items.length?`<div class="guide-group-label">最近の確認</div><div class="guide-recent">${items.map((q)=>`<button class="guide-chip recent" type="button" data-guide-recent="${esc(q)}">${esc(q)}</button>`).join("")}</div>`:"";
    wrap.querySelectorAll("[data-guide-recent]").forEach((button)=>button.addEventListener("click",()=>runQuery(button.dataset.guideRecent)));
  }

  function addVoice(){
    const form=$id("staffGuideForm");if(!form||$id("staffGuideVoice"))return;
    const button=document.createElement("button");button.id="staffGuideVoice";button.type="button";button.className="guide-voice";button.textContent="🎙";button.setAttribute("aria-label","音声で入力");
    form.insertBefore(button,form.querySelector(".guide-submit"));
    button.addEventListener("click",()=>{
      const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
      if(!Recognition){showToast("この端末では音声入力に対応していません");return;}
      const recognition=new Recognition();recognition.lang="ja-JP";recognition.interimResults=false;button.classList.add("listening");
      recognition.onresult=(event)=>runQuery(event.results?.[0]?.[0]?.transcript||"");
      recognition.onerror=()=>showToast("音声を聞き取れませんでした");recognition.onend=()=>button.classList.remove("listening");recognition.start();
    });
  }

  function structuredScene(card,scene){
    if(!scene||card.dataset.enhanced)return;
    card.dataset.enhanced="1";card.classList.add("guide-primary");
    const title=card.querySelector("h3");if(title)title.insertAdjacentHTML("beforebegin",`<div class="guide-primary-kicker">最も近い基準</div>`);
    const actions=(scene.do||[]).slice(0,4),cautions=(scene.dont||[]).slice(0,3);
    const actionsHtml=actions.length?`<div class="guide-detail-block"><div class="guide-detail-label">行動</div><ol>${actions.map((x)=>`<li>${esc(x)}</li>`).join("")}</ol></div>`:"";
    const cautionHtml=cautions.length?`<div class="guide-detail-block"><div class="guide-detail-label">外さないための注意</div><ul>${cautions.map((x)=>`<li>${esc(x)}</li>`).join("")}</ul></div>`:"";
    const confirmHtml=scene.ask?`<div class="guide-detail-block"><div class="guide-detail-label">店主へ確認する基準</div><div class="guide-confirm">${esc(scene.ask)}</div></div>`:"";
    card.querySelector(".guide-answer-actions")?.insertAdjacentHTML("beforebegin",actionsHtml+cautionHtml+confirmHtml);
  }

  function openConfirmation(query){
    closeGuidePlus();openNoteModal("handover","","",`確認依頼：${query}`);
    $id("noteBodyInput").value=`確認したい内容：${query}\n\n確認できた事実：`;
  }
  function openImprovement(query,reason){
    closeGuidePlus();openNoteModal("suggestion","","",`案内に追加：${query}`);
    $id("noteBodyInput").value=`質問：${query}\n状況：${reason||"表示された案内が十分ではありませんでした。"}\n\n確認後、AMORÉTTO STANDARDへ追加してください。`;
  }
  function closeGuidePlus(){$id("staffGuideModal")?.classList.remove("open");}

  function enhanceResults(){
    const query=currentQuery();if(!query)return;saveQuery(query);
    const container=$id("staffGuideResults");if(!container)return;
    const cards=[...container.querySelectorAll(".guide-answer")];
    if(cards.length){
      const title=cards[0].querySelector("h3")?.textContent||"";structuredScene(cards[0],findSceneByTitle(title));
      if(!container.querySelector(".guide-feedback"))container.insertAdjacentHTML("beforeend",`<div class="guide-feedback"><button class="guide-secondary" type="button" id="guideHelpful">役立った</button><button class="guide-secondary" type="button" id="guideNeedsWork">足りない・違う</button><button class="guide-secondary" type="button" id="guideAskOwner">店主へ確認</button></div>`);
    }else if(container.querySelector(".guide-empty")&&!container.querySelector(".guide-extra-actions")){
      container.querySelector(".guide-empty").insertAdjacentHTML("beforeend",`<div class="guide-extra-actions"><button class="guide-secondary" type="button" id="guideAskOwner">店主へ確認</button><button class="guide-secondary" type="button" id="guideNeedsWork">マニュアル追加を提案</button></div>`);
    }
    const alert=container.querySelector(".guide-alert");
    if(alert&&!alert.querySelector(".guide-extra-actions"))alert.insertAdjacentHTML("beforeend",`<div class="guide-extra-actions"><button class="guide-secondary" type="button" id="guideAlertOwner">店主へ確認を残す</button></div>`);
    $id("guideHelpful")?.addEventListener("click",()=>{showToast("役立ったとして記録しました");});
    $id("guideNeedsWork")?.addEventListener("click",()=>openImprovement(query));
    $id("guideAskOwner")?.addEventListener("click",()=>openConfirmation(query));
    $id("guideAlertOwner")?.addEventListener("click",()=>openConfirmation(query));
  }

  function init(){
    if(!$id("staffGuideForm")){setTimeout(init,50);return;}
    addStyle();renderGroups();renderRecent();addVoice();
    $id("staffGuideForm").addEventListener("submit",()=>setTimeout(enhanceResults,0));
    $id("staffGuideQuick")?.addEventListener("click",()=>setTimeout(enhanceResults,0));
    document.addEventListener("keydown",(event)=>{if(event.key==="Escape")closeGuidePlus();});
  }
  init();
})();
