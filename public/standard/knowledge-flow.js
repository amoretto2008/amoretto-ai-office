(function(){
  "use strict";

  const API_URL="/api/standard/knowledge";
  const PERSONAL_KEY="amoretto-standard-knowledge-personal";
  const CATEGORIES=["接客","料理","ドリンク","記念日","安全","営業準備","その他"];
  const $id=(id)=>document.getElementById(id);

  function personalItems(){
    try{
      const value=JSON.parse(localStorage.getItem(PERSONAL_KEY)||"[]");
      return Array.isArray(value)?value:[];
    }catch{return [];}
  }

  function savePersonalItems(items){
    localStorage.setItem(PERSONAL_KEY,JSON.stringify(items.slice(0,50)));
  }

  function staffProfile(){
    try{
      const value=JSON.parse(localStorage.getItem("amoretto-standard-profile")||"{}");
      return value&&typeof value==="object"?value:{name:"",role:""};
    }catch{return {name:"",role:""};}
  }

  function splitTags(value){
    return [...new Set(String(value||"").split(/[、,\n]/).map((item)=>item.trim()).filter(Boolean))].slice(0,20);
  }

  function categoryOptions(selected="その他"){
    return CATEGORIES.map((category)=>`<option value="${esc(category)}" ${category===selected?"selected":""}>${esc(category)}</option>`).join("");
  }

  function injectStyles(){
    if($id("knowledgeFlowStyles"))return;
    const style=document.createElement("style");
    style.id="knowledgeFlowStyles";
    style.textContent=`
      .knowledge-card-actions{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:10px}.knowledge-card-actions .danger-outline{grid-column:1/-1}.knowledge-card-actions button{min-height:42px}.personal-knowledge-modal{z-index:168}.personal-knowledge-sheet{max-height:95vh}.personal-knowledge-hint{background:#f7f3ed;border-radius:12px;padding:10px 12px;font-size:11px;line-height:1.65;margin-bottom:12px}.personal-knowledge-form label{display:block;font-size:11px;font-weight:800;margin:12px 0 5px}.personal-knowledge-form textarea{min-height:120px}.personal-knowledge-form .form-input{width:100%}.personal-knowledge-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:16px}
      @media(max-width:520px){.knowledge-actions{grid-template-columns:1fr 1fr!important}.knowledge-actions button{font-size:12px;line-height:1.25;padding:11px 8px;min-height:62px}.guide-fab{bottom:calc(96px + env(safe-area-inset-bottom))!important;padding:10px 13px!important;font-size:12px!important}.personal-knowledge-actions{grid-template-columns:1fr}}
      @media(max-width:340px){.knowledge-actions{grid-template-columns:1fr!important}}
    `;
    document.head.appendChild(style);
  }

  function injectModal(){
    if($id("personalKnowledgeFlowModal"))return;
    document.body.insertAdjacentHTML("beforeend",`<div class="modal personal-knowledge-modal" id="personalKnowledgeFlowModal"><div class="sheet personal-knowledge-sheet"><div class="sheet-head"><div><div class="eyebrow" id="personalKnowledgeFlowEyebrow">Personal knowledge</div><h2 class="no-bottom" id="personalKnowledgeFlowTitle">個人メモを編集</h2></div><button class="close-btn" id="closePersonalKnowledgeFlowBtn" type="button">×</button></div><div id="personalKnowledgeFlowBody"></div></div></div>`);
    $id("closePersonalKnowledgeFlowBtn").addEventListener("click",()=>closeModal("personalKnowledgeFlowModal"));
    $id("personalKnowledgeFlowModal").addEventListener("click",(event)=>{if(event.target.id==="personalKnowledgeFlowModal")closeModal("personalKnowledgeFlowModal");});
  }

  function refreshKnowledgeUI(){
    const count=$id("personalKnowledgeCount");if(count)count.textContent=String(personalItems().length);
    const search=$id("knowledgeSearch");if(search)search.dispatchEvent(new Event("input",{bubbles:true}));
    setTimeout(enhancePersonalCards,0);
  }

  function formHtml(item,{promote=false}={}){
    const p=staffProfile();
    return `<div class="personal-knowledge-hint">${promote?"申請内容は、店主が確認するまでスタッフへ共有されません。送信後は個人メモから確認待ちへ移ります。":"この内容は現在の端末だけに保存されています。お客様名、電話番号、メールアドレスは記録しないでください。"}</div><div class="personal-knowledge-form"><label for="personalKnowledgeTitleInput">タイトル</label><input class="form-input" id="personalKnowledgeTitleInput" maxlength="160" value="${esc(item.title||"")}"><label for="personalKnowledgeBodyInput">内容</label><textarea class="form-input" id="personalKnowledgeBodyInput" maxlength="3000">${esc(item.body||"")}</textarea><label for="personalKnowledgeCategoryInput">分類</label><select class="form-input" id="personalKnowledgeCategoryInput">${categoryOptions(item.category||"その他")}</select><label for="personalKnowledgeTagsInput">検索タグ</label><input class="form-input" id="personalKnowledgeTagsInput" maxlength="300" value="${esc((item.tags||[]).join("、"))}">${promote?`<label for="personalKnowledgeScopeInput">店主への申請</label><select class="form-input" id="personalKnowledgeScopeInput"><option value="shared">スタッフ共有を申請</option><option value="official_candidate">正本候補として申請</option></select><div class="personal-knowledge-hint" style="margin-top:12px">申請者：${esc(p.name||"未登録")}${p.role?`（${esc(p.role)}）`:""}</div>`:""}<div class="personal-knowledge-actions"><button class="secondary" id="cancelPersonalKnowledgeFlowBtn" type="button">閉じる</button><button class="primary" id="savePersonalKnowledgeFlowBtn" type="button">${promote?"店主へ送る":"変更を保存"}</button></div></div>`;
  }

  function openPersonalFlow(id,promote){
    const item=personalItems().find((entry)=>entry.id===id);if(!item){showToast("個人メモが見つかりません");return;}
    if(promote&&!staffProfile().name){showToast("共有申請の前に担当者名を登録してください");closeModal("knowledgeModal");openModal("profileModal");return;}
    injectModal();
    $id("personalKnowledgeFlowEyebrow").textContent=promote?"Share request":"Personal memo";
    $id("personalKnowledgeFlowTitle").textContent=promote?"個人メモを共有へ進める":"個人メモを編集";
    $id("personalKnowledgeFlowBody").innerHTML=formHtml(item,{promote});
    $id("cancelPersonalKnowledgeFlowBtn").addEventListener("click",()=>closeModal("personalKnowledgeFlowModal"));
    $id("savePersonalKnowledgeFlowBtn").addEventListener("click",()=>promote?submitPersonalItem(id):savePersonalEdit(id));
    openModal("personalKnowledgeFlowModal");
  }

  function readForm(){
    return {
      title:$id("personalKnowledgeTitleInput").value.trim(),
      body:$id("personalKnowledgeBodyInput").value.trim(),
      category:$id("personalKnowledgeCategoryInput").value,
      tags:splitTags($id("personalKnowledgeTagsInput").value)
    };
  }

  function savePersonalEdit(id){
    const values=readForm();if(!values.title||!values.body){showToast("タイトルと内容を入力してください");return;}
    const items=personalItems();const index=items.findIndex((entry)=>entry.id===id);if(index<0)return;
    items[index]={...items[index],...values,updatedAt:new Date().toISOString()};
    savePersonalItems(items);closeModal("personalKnowledgeFlowModal");refreshKnowledgeUI();showToast("個人メモを更新しました");
  }

  async function submitPersonalItem(id){
    const values=readForm();if(!values.title||!values.body){showToast("タイトルと内容を入力してください");return;}
    const p=staffProfile();if(!p.name){showToast("担当者名を登録してください");return;}
    const scope=$id("personalKnowledgeScopeInput").value;
    const button=$id("savePersonalKnowledgeFlowBtn");button.disabled=true;button.textContent="送信中…";
    try{
      const response=await fetch(API_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...values,requestedScope:scope,staffName:p.name,staffRole:p.role||"",website:""})});
      const data=await response.json();if(!response.ok)throw new Error(data.error||"送信できませんでした。");
      savePersonalItems(personalItems().filter((entry)=>entry.id!==id));
      closeModal("personalKnowledgeFlowModal");refreshKnowledgeUI();
      showToast(scope==="official_candidate"?"正本候補として店主へ送りました":"共有候補として店主へ送りました");
    }catch(error){showToast(error.message||"送信できませんでした");}
    finally{button.disabled=false;button.textContent="店主へ送る";}
  }

  function extractPersonalId(button){
    const source=button.getAttribute("onclick")||"";
    const match=source.match(/deletePersonalKnowledge\(['\"]([^'\"]+)['\"]\)/);
    return match?.[1]||"";
  }

  function enhancePersonalCards(){
    document.querySelectorAll(".knowledge-card .knowledge-delete").forEach((button)=>{
      const card=button.closest(".knowledge-card");if(!card||card.dataset.personalFlowEnhanced)return;
      const id=extractPersonalId(button);if(!id)return;
      card.dataset.personalFlowEnhanced="1";
      button.outerHTML=`<div class="knowledge-card-actions"><button class="secondary" type="button" onclick="editPersonalKnowledgeFlow('${esc(id)}')">編集</button><button class="primary" type="button" onclick="promotePersonalKnowledgeFlow('${esc(id)}')">共有へ進める</button><button class="danger-outline" type="button" onclick="deletePersonalKnowledge('${esc(id)}')">削除</button></div>`;
    });
  }

  function polishLabels(){
    const add=$id("addKnowledgeBtn");if(add&&add.textContent!=="学びを記録"){add.textContent="学びを記録";add.setAttribute("aria-label","今日学んだことを記録");}
    const skillBadge=$id("skillSyncBadge");if(skillBadge&&skillBadge.textContent==="端末保存")skillBadge.textContent="この端末のみ";
    enhancePersonalCards();
  }

  window.editPersonalKnowledgeFlow=(id)=>openPersonalFlow(id,false);
  window.promotePersonalKnowledgeFlow=(id)=>openPersonalFlow(id,true);

  function init(){
    if(!$id("knowledgeSummaryCard")){setTimeout(init,80);return;}
    injectStyles();injectModal();polishLabels();
    const observer=new MutationObserver(()=>polishLabels());
    observer.observe(document.body,{subtree:true,childList:true,characterData:true});
    document.addEventListener("keydown",(event)=>{if(event.key==="Escape")closeModal("personalKnowledgeFlowModal");});
  }

  init();
})();
