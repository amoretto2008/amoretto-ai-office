(function(){
  "use strict";

  const MODAL_ID="opsDiagnosticsModal";
  const FRAME_ID="opsDiagnosticsFrame";
  const BUTTON_ID="openOpsDiagnosticsBtn";
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
    byId("closeOpsDiagnosticsBtn")?.addEventListener("click",()=>closeModal(MODAL_ID));
    byId(MODAL_ID)?.addEventListener("click",(event)=>{
      if(event.target===byId(MODAL_ID))closeModal(MODAL_ID);
    });
    return byId(MODAL_ID);
  }

  function openDiagnostics(){
    ensureModal();
    const frame=byId(FRAME_ID);
    if(frame)frame.src=`${DIAGNOSTICS_URL}?embedded=1&t=${Date.now()}`;
    openModal(MODAL_ID);
  }

  function injectButton(){
    if(byId(BUTTON_ID))return true;
    const panel=byId("operationsAdmin");
    const titleRow=panel?.querySelector(".admin-title-row");
    const reload=byId("reloadOperationsBtn");
    if(!panel||!titleRow||!reload)return false;

    const actions=document.createElement("div");
    actions.className="ops-diagnostics-actions";
    const button=document.createElement("button");
    button.type="button";
    button.className="secondary";
    button.id=BUTTON_ID;
    button.textContent="接続診断";
    button.addEventListener("click",openDiagnostics);

    titleRow.insertBefore(actions,reload);
    actions.append(button,reload);
    return true;
  }

  function start(){
    injectStyles();
    ensureModal();
    if(injectButton())return;
    const observer=new MutationObserver(()=>{
      if(injectButton())observer.disconnect();
    });
    observer.observe(document.body,{childList:true,subtree:true});
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});
  else start();
})();
