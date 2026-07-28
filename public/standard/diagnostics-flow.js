(function(){
  "use strict";

  const MODAL_ID="opsDiagnosticsModal";
  const FRAME_ID="opsDiagnosticsFrame";
  const BUTTON_ID="openOpsDiagnosticsBtn";
  const INLINE_BUTTON_ID="openOpsDiagnosticsInlineBtn";
  const DIAGNOSTICS_URL="/api/standard/operations/diagnostics";

  const byId=(value)=>document.getElementById(value);

  function injectStyles(){
    if(byId("opsDiagnosticsStyles"))return;
    const style=document.createElement("style");
    style.id="opsDiagnosticsStyles";
    style.textContent=`
      .ops-diagnostics-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
      .ops-diagnostics-frame{width:100%;height:72vh;min-height:520px;border:1px solid var(--line);border-radius:14px;background:#fbfaf6}
      .ops-diagnostics-note{margin:0 0 10px;font-size:11px;color:var(--muted);line-height:1.55}
      .ops-diagnostics-inline{display:grid;gap:10px;justify-items:center;margin-top:14px}
      .ops-diagnostics-inline button{min-width:150px}
      @media(max-width:480px){
        .ops-diagnostics-actions{width:100%;display:grid;grid-template-columns:1fr 1fr}
        .ops-diagnostics-actions button{width:100%}
        .ops-diagnostics-frame{height:75vh;min-height:480px}
      }
    `;
    document.head.appendChild(style);
  }

  function ensureModal(){
    if(byId(MODAL_ID))return byId(MODAL_ID);
    document.body.insertAdjacentHTML("beforeend",`
      <div class="modal ops-owner-full" id="${MODAL_ID}">
        <div class="sheet tall-sheet">
          <div class="sheet-head">
            <div>
              <div class="eyebrow">OWNER ONLY / CONNECTION CHECK</div>
              <h2 class="no-bottom">接続診断</h2>
            </div>
            <button class="close-btn" id="closeOpsDiagnosticsBtn" type="button">×</button>
          </div>
          <p class="ops-diagnostics-note">STANDARD内で診断するため、現在の店主ログイン情報をそのまま使用します。秘密鍵や顧客情報は表示しません。</p>
          <iframe class="ops-diagnostics-frame" id="${FRAME_ID}" title="AMORÉTTO STANDARD 接続診断"></iframe>
        </div>
      </div>`);
    byId("closeOpsDiagnosticsBtn")?.addEventListener("click",()=>{
      if(typeof closeModal==="function")closeModal(MODAL_ID);
      else byId(MODAL_ID)?.classList.remove("open");
    });
    byId(MODAL_ID)?.addEventListener("click",(event)=>{
      if(event.target!==byId(MODAL_ID))return;
      if(typeof closeModal==="function")closeModal(MODAL_ID);
      else byId(MODAL_ID)?.classList.remove("open");
    });
    return byId(MODAL_ID);
  }

  function openDiagnostics(){
    try{
      ensureModal();
      const frame=byId(FRAME_ID);
      if(frame)frame.src=`${DIAGNOSTICS_URL}?embedded=1&t=${Date.now()}`;
      if(typeof openModal==="function")openModal(MODAL_ID);
      else byId(MODAL_ID)?.classList.add("open");
    }catch{
      window.location.assign(`${DIAGNOSTICS_URL}?t=${Date.now()}`);
    }
  }

  function makeButton(idValue){
    const button=document.createElement("button");
    button.type="button";
    button.className="secondary";
    button.id=idValue;
    button.textContent="接続診断";
    button.addEventListener("click",openDiagnostics);
    return button;
  }

  function injectHeaderButton(){
    if(byId(BUTTON_ID))return true;
    const panel=byId("operationsAdmin");
    const titleRow=panel?.querySelector(".admin-title-row");
    const reload=byId("reloadOperationsBtn");
    if(!panel||!titleRow||!reload)return false;

    let actions=titleRow.querySelector(".ops-diagnostics-actions");
    if(!actions){
      actions=document.createElement("div");
      actions.className="ops-diagnostics-actions";
      titleRow.insertBefore(actions,reload);
      actions.appendChild(reload);
    }
    actions.insertBefore(makeButton(BUTTON_ID),reload);
    return true;
  }

  function injectInlineButton(){
    const body=byId("operationsOwnerBody");
    if(!body||byId(INLINE_BUTTON_ID))return;
    const text=String(body.textContent||"");
    if(!/(読み込みに失敗|読み込めません|通信に失敗)/.test(text))return;
    const box=document.createElement("div");
    box.className="ops-diagnostics-inline";
    const note=document.createElement("div");
    note.className="small muted";
    note.textContent="原因を安全に確認します。";
    box.append(note,makeButton(INLINE_BUTTON_ID));
    body.appendChild(box);
  }

  function injectAll(){
    injectHeaderButton();
    injectInlineButton();
  }

  function start(){
    injectStyles();
    ensureModal();
    injectAll();
    const observer=new MutationObserver(injectAll);
    observer.observe(document.body,{childList:true,subtree:true,characterData:true});
  }

  window.openStandardOperationsDiagnostics=openDiagnostics;
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});
  else start();
})();
