(function(){
  "use strict";

  const MODAL_ID="opsDiagnosticsModal";
  const RESULT_ID="opsDiagnosticsResult";
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
      .ops-diagnostics-note{margin:0 0 12px;font-size:11px;color:var(--muted);line-height:1.55}
      .ops-diagnostics-result{display:grid;gap:10px;max-height:72vh;overflow:auto;padding:2px}
      .ops-diagnostics-loading,.ops-diagnostics-error{padding:24px;border:1px dashed var(--line);border-radius:14px;background:#fbfaf6;text-align:center;line-height:1.65}
      .ops-diagnostics-row{display:flex;gap:12px;padding:14px;border:1px solid var(--line);border-radius:13px;background:white}
      .ops-diagnostics-row.ok{border-left:5px solid #38734e}
      .ops-diagnostics-row.ng{border-left:5px solid var(--wine)}
      .ops-diagnostics-mark{display:grid;place-items:center;width:28px;height:28px;border-radius:50%;font-weight:900;background:#f0eee8;flex:0 0 auto}
      .ops-diagnostics-row strong{display:block;font-size:14px}
      .ops-diagnostics-row p{font-size:13px;color:var(--muted);margin:5px 0 0;line-height:1.55}
      .ops-diagnostics-section{margin-top:8px}
      .ops-diagnostics-section h3{font-size:16px;margin:0 0 8px}
      .ops-diagnostics-box{padding:16px;border-radius:13px;background:#f2eee7;border:1px solid var(--line);line-height:1.65;white-space:pre-wrap}
      .ops-diagnostics-box.action{background:#fff3f0;border-color:#dfbbb6}
      .ops-diagnostics-inline{display:grid;gap:10px;justify-items:center;margin-top:14px}
      .ops-diagnostics-inline button{min-width:150px}
      @media(max-width:480px){
        .ops-diagnostics-actions{width:100%;display:grid;grid-template-columns:1fr 1fr}
        .ops-diagnostics-actions button{width:100%}
        .ops-diagnostics-result{max-height:74vh}
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
          <p class="ops-diagnostics-note">STANDARD自身が診断結果を取得します。現在の店主ログイン情報を使用し、秘密鍵や顧客情報は表示しません。</p>
          <div class="ops-diagnostics-result" id="${RESULT_ID}"></div>
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

  function setLoading(){
    const result=byId(RESULT_ID);
    if(result)result.innerHTML='<div class="ops-diagnostics-loading">接続状態を確認しています。</div>';
  }

  function addSection(result,title,text,action){
    if(!text)return;
    const section=document.createElement("section");
    section.className="ops-diagnostics-section";
    const heading=document.createElement("h3");
    heading.textContent=title;
    const box=document.createElement("div");
    box.className=`ops-diagnostics-box${action?" action":""}`;
    box.textContent=text;
    section.append(heading,box);
    result.appendChild(section);
  }

  function renderDiagnosticsHtml(html){
    const result=byId(RESULT_ID);
    if(!result)return;
    const documentCopy=new DOMParser().parseFromString(html,"text/html");
    const rows=[...documentCopy.querySelectorAll(".row")];
    const diagnosis=String(documentCopy.querySelector(".diagnosis")?.textContent||"").trim();
    const nextAction=String(documentCopy.querySelector(".action")?.textContent||"").trim();
    result.innerHTML="";

    rows.forEach((source)=>{
      const row=document.createElement("div");
      row.className=`ops-diagnostics-row ${source.classList.contains("ok")?"ok":"ng"}`;
      const mark=document.createElement("span");
      mark.className="ops-diagnostics-mark";
      mark.textContent=String(source.querySelector(".mark")?.textContent||"!").trim();
      const body=document.createElement("div");
      const title=document.createElement("strong");
      title.textContent=String(source.querySelector("strong")?.textContent||"確認結果").trim();
      const detail=document.createElement("p");
      detail.textContent=String(source.querySelector("p")?.textContent||"").trim();
      body.append(title,detail);
      row.append(mark,body);
      result.appendChild(row);
    });

    addSection(result,"診断結果",diagnosis,false);
    addSection(result,"次の対応",nextAction,true);

    if(!rows.length&&!diagnosis&&!nextAction){
      const fallback=document.createElement("div");
      fallback.className="ops-diagnostics-error";
      fallback.textContent="診断結果を読み取れませんでした。もう一度お試しください。";
      result.appendChild(fallback);
    }
  }

  function renderFetchError(){
    const result=byId(RESULT_ID);
    if(!result)return;
    result.innerHTML="";
    const box=document.createElement("div");
    box.className="ops-diagnostics-error";
    box.textContent="診断結果の取得に失敗しました。通信を確認して、もう一度お試しください。";
    const retry=document.createElement("button");
    retry.type="button";
    retry.className="secondary";
    retry.textContent="再診断";
    retry.addEventListener("click",loadDiagnostics);
    result.append(box,retry);
  }

  async function loadDiagnostics(){
    setLoading();
    try{
      const response=await fetch(`${DIAGNOSTICS_URL}?t=${Date.now()}`,{
        method:"GET",
        credentials:"same-origin",
        cache:"no-store",
        headers:{Accept:"text/html"}
      });
      const html=await response.text();
      renderDiagnosticsHtml(html);
    }catch{
      renderFetchError();
    }
  }

  function openDiagnostics(){
    ensureModal();
    if(typeof openModal==="function")openModal(MODAL_ID);
    else byId(MODAL_ID)?.classList.add("open");
    loadDiagnostics();
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
