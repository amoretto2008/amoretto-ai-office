(function(){
  "use strict";

  const API_URL="/api/standard/knowledge";
  const PERSONAL_KEY="amoretto-standard-knowledge-personal";
  const CATEGORIES=["接客","料理","ドリンク","記念日","安全","営業準備","その他"];
  const STATUS_LABELS={pending:"確認待ち",published:"スタッフ共有",archived:"非表示"};
  let sharedEntries=[];
  let ownerEntries=[];
  let ownerFilter="pending";
  let ownerCurrentId="";

  const $id=(id)=>document.getElementById(id);
  const staffProfile=()=>localJson("amoretto-standard-profile",{name:"",role:""});
  const personalEntries=()=>localJson(PERSONAL_KEY,[]);
  const savePersonal=(items)=>setLocalJson(PERSONAL_KEY,items.slice(0,50));
  const formatWhen=(value)=>value?formatDateTime(value):"";
  const scopeLabel=(value)=>value==="official_candidate"?"正本候補":"スタッフ共有希望";

  function injectStyles(){
    if($id("knowledgeStyles"))return;
    const style=document.createElement("style");
    style.id="knowledgeStyles";
    style.textContent=`
      .knowledge-summary{border-left:4px solid var(--accent);background:#fbf6f4}.knowledge-summary-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin:12px 0}.knowledge-summary-grid>div{background:white;border:1px solid #eadcdf;border-radius:12px;padding:10px;text-align:center}.knowledge-summary-grid strong,.knowledge-summary-grid span{display:block}.knowledge-summary-grid strong{font-size:20px}.knowledge-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px}.knowledge-modal{z-index:160}.knowledge-sheet{max-height:95vh}.knowledge-note{background:#f7f3ed;border-radius:12px;padding:10px 12px;font-size:11px;margin-bottom:12px}.knowledge-form label{display:block;font-size:11px;font-weight:700;margin:12px 0 5px}.knowledge-form textarea{min-height:120px}.knowledge-form .form-input{width:100%}.knowledge-form-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:16px}.knowledge-list{display:grid;gap:9px}.knowledge-card{border:1px solid var(--line);border-radius:14px;background:white;padding:12px}.knowledge-card h4{margin:0 0 5px;font-size:15px}.knowledge-meta{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:7px}.knowledge-body{white-space:pre-wrap;font-size:12px;line-height:1.7}.knowledge-tags{font-size:10px;color:var(--muted);margin-top:8px}.knowledge-empty{border:1px dashed var(--line);border-radius:14px;padding:20px;text-align:center;color:var(--muted)}.knowledge-search{margin-bottom:12px}.knowledge-section-title{display:flex;align-items:center;justify-content:space-between;margin:18px 0 8px}.knowledge-section-title h3{margin:0}.knowledge-delete{margin-top:8px}.owner-knowledge-card{border:1px solid var(--line);border-radius:14px;background:white;padding:12px;margin-bottom:9px}.owner-knowledge-card button{width:100%;margin-top:9px}.owner-knowledge-filters{display:flex;gap:7px;overflow:auto;margin:12px 0}.owner-knowledge-modal{z-index:175}.owner-knowledge-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px}.owner-knowledge-actions .wide{grid-column:1/-1}.knowledge-status.pending{background:var(--warning-soft);color:var(--warning)}.knowledge-status.published{background:var(--ok-soft);color:var(--ok)}.knowledge-status.archived{background:#eee;color:var(--muted)}
      @media(max-width:390px){.knowledge-actions,.knowledge-form-actions,.owner-knowledge-actions{grid-template-columns:1fr}.owner-knowledge-actions .wide{grid-column:auto}}
    `;
    document.head.appendChild(style);
  }

  function injectStaffUI(){
    const learn=$id("learn");
    if(!learn||$id("knowledgeSummaryCard"))return;
    const anchor=$id("skillSummaryCard")||learn.querySelector(".learning-summary");
    if(!anchor)return;
    anchor.insertAdjacentHTML("afterend",`<div class="card knowledge-summary" id="knowledgeSummaryCard"><div class="card-title-row"><div><div class="eyebrow">AMORÉTTO Knowledge</div><h3 class="no-bottom">今日学んだこと</h3></div><span class="badge" id="knowledgeSyncBadge">共有知識</span></div><p class="small muted">営業で得た気づきを記録します。未確認の内容は正本と分け、店主確認後に共有します。</p><div class="knowledge-summary-grid"><div><strong id="personalKnowledgeCount">0</strong><span class="small muted">この端末の個人メモ</span></div><div><strong id="sharedKnowledgeCount">0</strong><span class="small muted">店主確認済み共有知識</span></div></div><div class="knowledge-actions"><button class="primary" id="addKnowledgeBtn">今日学んだことを記録</button><button class="secondary" id="openKnowledgeLibraryBtn">共有知識を見る</button></div></div>`);
    document.body.insertAdjacentHTML("beforeend",`<div class="modal knowledge-modal" id="knowledgeModal"><div class="sheet knowledge-sheet"><div class="sheet-head"><div><div class="eyebrow" id="knowledgeEyebrow">AMORÉTTO Knowledge</div><h2 class="no-bottom" id="knowledgeModalTitle">今日学んだこと</h2></div><button class="close-btn" id="closeKnowledgeBtn">×</button></div><div id="knowledgeModalBody"></div></div></div>`);
    $id("addKnowledgeBtn").addEventListener("click",openKnowledgeCreate);
    $id("openKnowledgeLibraryBtn").addEventListener("click",openKnowledgeLibrary);
    $id("closeKnowledgeBtn").addEventListener("click",()=>closeModal("knowledgeModal"));
    $id("knowledgeModal").addEventListener("click",(event)=>{if(event.target.id==="knowledgeModal")closeModal("knowledgeModal");});
    renderKnowledgeSummary();
  }

  function renderKnowledgeSummary(){
    if(!$id("knowledgeSummaryCard"))return;
    $id("personalKnowledgeCount").textContent=String(personalEntries().length);
    $id("sharedKnowledgeCount").textContent=String(sharedEntries.length);
    $id("knowledgeSyncBadge").textContent=navigator.onLine?"店主確認済み":"保存版";
    $id("knowledgeSyncBadge").className=`badge ${navigator.onLine?"":"warn"}`;
  }

  function categoryOptions(selected="その他"){
    return CATEGORIES.map((category)=>`<option value="${esc(category)}" ${category===selected?"selected":""}>${esc(category)}</option>`).join("");
  }

  function openKnowledgeCreate(){
    const p=staffProfile();
    $id("knowledgeEyebrow").textContent="Today learning";
    $id("knowledgeModalTitle").textContent="今日学んだことを記録";
    $id("knowledgeModalBody").innerHTML=`<div class="knowledge-note">お客様名、電話番号、メールアドレスなどの個人情報は記録しないでください。個人メモ以外は店主確認後に共有されます。</div><div class="knowledge-form"><label for="knowledgeTitle">タイトル</label><input class="form-input" id="knowledgeTitle" maxlength="160" placeholder="例：花束を出すタイミング"><label for="knowledgeBody">内容</label><textarea class="form-input" id="knowledgeBody" maxlength="3000" placeholder="確認できた事実と、次回に役立つ内容を簡潔に記録します。"></textarea><label for="knowledgeCategory">分類</label><select class="form-input" id="knowledgeCategory">${categoryOptions()}</select><label for="knowledgeTags">検索タグ</label><input class="form-input" id="knowledgeTags" maxlength="300" placeholder="例：記念日、花束、提供前"><label for="knowledgeScope">保存先</label><select class="form-input" id="knowledgeScope"><option value="personal">個人メモ（この端末のみ）</option><option value="shared">スタッフ共有を申請</option><option value="official_candidate">正本候補として申請</option></select><input id="knowledgeWebsite" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px" aria-hidden="true"><div class="knowledge-note" style="margin-top:12px">登録者：${esc(p.name||"未登録")} ${p.role?`（${esc(p.role)}）`:""}</div><div class="knowledge-form-actions"><button class="secondary" id="cancelKnowledgeBtn">閉じる</button><button class="primary" id="saveKnowledgeBtn">記録する</button></div></div>`;
    $id("cancelKnowledgeBtn").addEventListener("click",()=>closeModal("knowledgeModal"));
    $id("saveKnowledgeBtn").addEventListener("click",saveKnowledgeEntry);
    openModal("knowledgeModal");
  }

  function splitTags(value){
    return [...new Set(String(value||"").split(/[、,\n]/).map((item)=>item.trim()).filter(Boolean))].slice(0,20);
  }

  async function saveKnowledgeEntry(){
    const title=$id("knowledgeTitle").value.trim();
    const body=$id("knowledgeBody").value.trim();
    const category=$id("knowledgeCategory").value;
    const tags=splitTags($id("knowledgeTags").value);
    const scope=$id("knowledgeScope").value;
    const p=staffProfile();
    if(!title||!body){showToast("タイトルと内容を入力してください");return;}
    if(scope==="personal"){
      const items=personalEntries();
      items.unshift({id:`personal-${Date.now()}`,title,body,category,tags,createdAt:new Date().toISOString()});
      savePersonal(items);
      renderKnowledgeSummary();
      closeModal("knowledgeModal");
      showToast("個人メモへ保存しました");
      return;
    }
    if(!p.name){showToast("共有申請の前に担当者名を登録してください");return;}
    const button=$id("saveKnowledgeBtn");
    button.disabled=true;button.textContent="送信中…";
    try{
      const response=await fetch(API_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title,body,category,tags,requestedScope:scope,staffName:p.name,staffRole:p.role||"",website:$id("knowledgeWebsite").value})});
      const data=await response.json();
      if(!response.ok)throw new Error(data.error||"送信できませんでした。");
      closeModal("knowledgeModal");
      showToast(scope==="official_candidate"?"正本候補として店主へ送りました":"共有候補として店主へ送りました");
    }catch(error){showToast(error.message||"送信できませんでした");}
    finally{button.disabled=false;button.textContent="記録する";}
  }

  function knowledgeCard(item,{personal=false}={}){
    const tags=Array.isArray(item.tags)&&item.tags.length?`<div class="knowledge-tags">${item.tags.map((tag)=>`#${esc(tag)}`).join(" ")}</div>`:"";
    return `<div class="knowledge-card"><div class="knowledge-meta"><span class="badge">${esc(item.category||"その他")}</span>${personal?'<span class="badge">個人メモ</span>':'<span class="badge info">店主確認済み</span>'}</div><h4>${esc(item.title)}</h4><div class="knowledge-body">${esc(item.body)}</div>${tags}<div class="small muted" style="margin-top:8px">${esc(formatWhen(item.publishedAt||item.createdAt))}${!personal&&item.staffName?`｜登録 ${esc(item.staffName)}`:""}</div>${personal?`<button class="danger-outline knowledge-delete" onclick="deletePersonalKnowledge('${esc(item.id)}')">個人メモを削除</button>`:""}</div>`;
  }

  function openKnowledgeLibrary(){
    $id("knowledgeEyebrow").textContent="Knowledge library";
    $id("knowledgeModalTitle").textContent="共有知識と個人メモ";
    $id("knowledgeModalBody").innerHTML=`<input class="form-input knowledge-search" id="knowledgeSearch" placeholder="タイトル・内容・タグを検索"><div id="knowledgeLibraryBody"></div>`;
    $id("knowledgeSearch").addEventListener("input",renderKnowledgeLibrary);
    renderKnowledgeLibrary();
    openModal("knowledgeModal");
    loadSharedKnowledge({quiet:true});
  }

  function renderKnowledgeLibrary(){
    const container=$id("knowledgeLibraryBody");if(!container)return;
    const query=String($id("knowledgeSearch")?.value||"").trim().toLowerCase();
    const matches=(item)=>!query||[item.title,item.body,item.category,...(item.tags||[])].join(" ").toLowerCase().includes(query);
    const personal=personalEntries().filter(matches);
    const shared=sharedEntries.filter(matches);
    container.innerHTML=`<div class="knowledge-section-title"><h3>店主確認済みの共有知識</h3><span class="small muted">${shared.length}件</span></div><div class="knowledge-list">${shared.length?shared.map((item)=>knowledgeCard(item)).join(""):'<div class="knowledge-empty">共有済みの知識はまだありません。</div>'}</div><div class="knowledge-section-title"><h3>この端末の個人メモ</h3><span class="small muted">${personal.length}件</span></div><div class="knowledge-list">${personal.length?personal.map((item)=>knowledgeCard(item,{personal:true})).join(""):'<div class="knowledge-empty">個人メモはまだありません。</div>'}</div>`;
  }

  window.deletePersonalKnowledge=function(id){
    if(!confirm("この個人メモを削除しますか。"))return;
    savePersonal(personalEntries().filter((item)=>item.id!==id));
    renderKnowledgeSummary();renderKnowledgeLibrary();showToast("個人メモを削除しました");
  };

  async function loadSharedKnowledge({quiet=false}={}){
    if(!navigator.onLine){renderKnowledgeSummary();return;}
    try{
      const response=await fetch(`${API_URL}?t=${Date.now()}`,{cache:"no-store"});
      const data=await response.json();if(!response.ok)throw new Error(data.error||"共有知識を読み込めませんでした。");
      sharedEntries=data.entries||[];
      renderKnowledgeSummary();renderKnowledgeLibrary();
    }catch(error){if(!quiet)showToast(error.message||"共有知識を読み込めませんでした");}
  }

  function injectOwnerUI(){
    const tabs=$id("adminTabs"),content=document.querySelector(".owner-content");
    if(!tabs||!content||$id("knowledgeAdmin"))return;
    const notesTab=tabs.querySelector('[data-admin-tab="notesAdmin"]');
    const tab=document.createElement("button");tab.className="pill";tab.dataset.adminTab="knowledgeAdmin";tab.textContent="ナレッジ";
    if(notesTab)tabs.insertBefore(tab,notesTab);else tabs.appendChild(tab);
    const panel=document.createElement("section");panel.className="admin-panel";panel.id="knowledgeAdmin";panel.innerHTML=`<div class="admin-title-row"><div><h3 class="no-bottom">AMORÉTTOナレッジ</h3><div class="small muted">営業で得た知識を確認し、共有または正本の下書きへ進めます。</div></div><button class="secondary" id="reloadKnowledgeBtn">更新</button></div><div class="owner-knowledge-filters" id="ownerKnowledgeFilters"><button class="pill active" data-knowledge-filter="pending">確認待ち</button><button class="pill" data-knowledge-filter="published">共有中</button><button class="pill" data-knowledge-filter="archived">非表示</button></div><div id="ownerKnowledgeList"><div class="empty">ナレッジを開くと申請内容が表示されます。</div></div>`;
    const notesPanel=$id("notesAdmin");if(notesPanel)content.insertBefore(panel,notesPanel);else content.appendChild(panel);
    document.body.insertAdjacentHTML("beforeend",`<div class="modal owner-knowledge-modal" id="ownerKnowledgeModal"><div class="sheet tall-sheet"><div class="sheet-head"><div><div class="eyebrow">Owner review</div><h2 class="no-bottom" id="ownerKnowledgeTitle">ナレッジ確認</h2></div><button class="close-btn" id="closeOwnerKnowledgeBtn">×</button></div><div id="ownerKnowledgeBody"></div></div></div>`);
    tab.addEventListener("click",()=>{
      document.querySelectorAll(".admin-tabs .pill").forEach((button)=>button.classList.toggle("active",button===tab));
      document.querySelectorAll(".admin-panel").forEach((item)=>item.classList.toggle("active",item.id==="knowledgeAdmin"));
      loadOwnerKnowledge();
    });
    $id("reloadKnowledgeBtn").addEventListener("click",loadOwnerKnowledge);
    $id("ownerKnowledgeFilters").querySelectorAll("button").forEach((button)=>button.addEventListener("click",()=>{
      ownerFilter=button.dataset.knowledgeFilter;
      $id("ownerKnowledgeFilters").querySelectorAll("button").forEach((item)=>item.classList.toggle("active",item===button));
      renderOwnerKnowledgeList();
    }));
    $id("closeOwnerKnowledgeBtn").addEventListener("click",()=>closeModal("ownerKnowledgeModal"));
    $id("ownerKnowledgeModal").addEventListener("click",(event)=>{if(event.target.id==="ownerKnowledgeModal")closeModal("ownerKnowledgeModal");});
  }

  async function loadOwnerKnowledge(){
    const container=$id("ownerKnowledgeList");if(!container)return;
    container.innerHTML='<div class="empty">読み込み中…</div>';
    try{
      const response=await fetch(`${API_URL}?owner=1&t=${Date.now()}`,{cache:"no-store"});
      const data=await response.json();
      if(response.status===401)throw new Error("店主ログインが必要です。");
      if(!response.ok)throw new Error(data.error||"ナレッジを読み込めませんでした。");
      ownerEntries=data.entries||[];renderOwnerKnowledgeList();
    }catch(error){container.innerHTML=`<div class="empty">${esc(error.message||"読み込めませんでした")}</div>`;}
  }

  function renderOwnerKnowledgeList(){
    const container=$id("ownerKnowledgeList");if(!container)return;
    const items=ownerEntries.filter((entry)=>(entry.status||"pending")===ownerFilter);
    container.innerHTML=items.length?items.map((entry)=>`<div class="owner-knowledge-card"><div class="card-title-row"><div><strong>${esc(entry.title)}</strong><div class="small muted">${esc(entry.category||"その他")}｜${esc(entry.staffName||"匿名")}｜${esc(formatWhen(entry.createdAt))}</div></div><span class="badge knowledge-status ${esc(entry.status||"pending")}">${esc(STATUS_LABELS[entry.status]||"確認待ち")}</span></div><div class="small muted" style="margin-top:7px">${esc(scopeLabel(entry.requestedScope))}</div><button class="secondary" onclick="openOwnerKnowledge('${esc(entry.id)}')">内容を確認</button></div>`).join(""):'<div class="empty">該当するナレッジはありません。</div>';
  }

  window.openOwnerKnowledge=function(id){ownerCurrentId=id;renderOwnerKnowledgeModal();openModal("ownerKnowledgeModal");};

  function renderOwnerKnowledgeModal(){
    const entry=ownerEntries.find((item)=>item.id===ownerCurrentId);if(!entry)return;
    $id("ownerKnowledgeTitle").textContent=entry.title||"ナレッジ確認";
    $id("ownerKnowledgeBody").innerHTML=`<div class="knowledge-note"><strong>申請者：</strong>${esc(entry.staffName||"匿名")}${entry.staffRole?`（${esc(entry.staffRole)}）`:""}<br><strong>申請：</strong>${esc(scopeLabel(entry.requestedScope))}<br><strong>登録：</strong>${esc(formatWhen(entry.createdAt))}</div><div class="knowledge-form"><label for="ownerKnowledgeTitleInput">タイトル</label><input class="form-input" id="ownerKnowledgeTitleInput" maxlength="160" value="${esc(entry.title||"")}"><label for="ownerKnowledgeBodyInput">内容</label><textarea class="form-input" id="ownerKnowledgeBodyInput" maxlength="3000">${esc(entry.body||"")}</textarea><label for="ownerKnowledgeCategoryInput">分類</label><select class="form-input" id="ownerKnowledgeCategoryInput">${categoryOptions(entry.category||"その他")}</select><label for="ownerKnowledgeTagsInput">検索タグ</label><input class="form-input" id="ownerKnowledgeTagsInput" maxlength="300" value="${esc((entry.tags||[]).join("、"))}"><label for="ownerKnowledgeReplyInput">店主メモ</label><textarea class="form-input" id="ownerKnowledgeReplyInput" maxlength="2000">${esc(entry.ownerReply||"")}</textarea><div class="owner-knowledge-actions"><button class="secondary" onclick="updateOwnerKnowledgeStatus('pending')">保留して保存</button><button class="primary" onclick="updateOwnerKnowledgeStatus('published')">スタッフ共有として承認</button><button class="secondary wide" onclick="createKnowledgeManualDraft('${esc(entry.id)}')">正本の下書きを作る</button><button class="danger-outline" onclick="updateOwnerKnowledgeStatus('archived')">非表示にする</button><button class="danger-outline" onclick="deleteOwnerKnowledge('${esc(entry.id)}')">削除</button></div></div>`;
  }

  function ownerPatch(status){
    return {id:ownerCurrentId,title:$id("ownerKnowledgeTitleInput").value.trim(),body:$id("ownerKnowledgeBodyInput").value.trim(),category:$id("ownerKnowledgeCategoryInput").value,tags:splitTags($id("ownerKnowledgeTagsInput").value),ownerReply:$id("ownerKnowledgeReplyInput").value.trim(),status};
  }

  window.updateOwnerKnowledgeStatus=async function(status){
    const payload=ownerPatch(status);
    if(!payload.title||!payload.body){showToast("タイトルと内容を入力してください");return;}
    try{
      const response=await fetch(API_URL,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)}),data=await response.json();
      if(!response.ok)throw new Error(data.error||"更新できませんでした。");
      const index=ownerEntries.findIndex((item)=>item.id===ownerCurrentId);if(index>=0)ownerEntries[index]=data.entry;
      closeModal("ownerKnowledgeModal");renderOwnerKnowledgeList();loadSharedKnowledge({quiet:true});showToast(status==="published"?"スタッフ共有として承認しました":status==="archived"?"非表示にしました":"保留内容を保存しました");
    }catch(error){showToast(error.message||"更新できませんでした");}
  };

  window.createKnowledgeManualDraft=function(id){
    const entry=ownerEntries.find((item)=>item.id===id);if(!entry)return;
    if(typeof draftConfig==="undefined"||!Array.isArray(draftConfig.scenes)){showToast("管理データを確認できませんでした");return;}
    const scene={id:uid("knowledge"),category:entry.category||"その他",title:entry.title||"",lead:entry.body||"",do:[],say:"",dont:[],ask:"判断に迷う場合は、分からないまま進めず店主へ確認する。",tags:[...new Set([...(entry.tags||[]),"ナレッジ","正本候補"])],active:false};
    draftConfig.scenes.push(scene);
    if(typeof renderAdminAll==="function")renderAdminAll();
    closeModal("ownerKnowledgeModal");
    if(typeof openAdminItem==="function")openAdminItem("scene",scene.id);
    showToast("正本の下書きを作りました。内容を整えて全スタッフへ保存してください");
  };

  window.deleteOwnerKnowledge=async function(id){
    const entry=ownerEntries.find((item)=>item.id===id);if(!confirm(`「${entry?.title||"このナレッジ"}」を削除しますか。`))return;
    try{
      const response=await fetch(API_URL,{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})}),data=await response.json();
      if(!response.ok)throw new Error(data.error||"削除できませんでした。");
      ownerEntries=ownerEntries.filter((item)=>item.id!==id);closeModal("ownerKnowledgeModal");renderOwnerKnowledgeList();showToast("ナレッジを削除しました");
    }catch(error){showToast(error.message||"削除できませんでした");}
  };

  function init(){
    if(!$id("learn")||!$id("adminTabs")){setTimeout(init,80);return;}
    injectStyles();injectStaffUI();injectOwnerUI();loadSharedKnowledge({quiet:true});
    window.addEventListener("online",()=>loadSharedKnowledge({quiet:true}));
    document.addEventListener("keydown",(event)=>{if(event.key==="Escape"){closeModal("knowledgeModal");closeModal("ownerKnowledgeModal");}});
  }

  init();
})();
