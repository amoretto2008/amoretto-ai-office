(function(){
  "use strict";

  const API_URL="/api/standard/skills";
  const IDENTITY_KEY="amoretto-standard-skill-identity";
  const LOCAL_KEY="amoretto-standard-skill-local";
  const LEVELS=["未習得","練習中","一人でできる","指導できる"];
  const GROUPS=[
    {id:"service",label:"接客",skills:[
      {id:"welcome",label:"お迎え",manual:{type:"scene",id:"hall-flow-01-arrival"}},
      {id:"seat-guide",label:"席案内",manual:{type:"scene",id:"hall-flow-02-seat"}},
      {id:"oshibori-menu",label:"おしぼり・メニュー",manual:{type:"scene",id:"hall-flow-03-oshibori"}},
      {id:"order-confirm",label:"注文内容の確認",manual:{type:"scene",id:"hall-flow-04-order-confirm"}},
      {id:"water-observe",label:"水・ドリンクの観察",manual:{type:"scene",id:"hall-flow-06-observe"}},
      {id:"clear-plate",label:"下げ物",manual:{type:"scene",id:"hall-observe-05-clear-plate"}},
      {id:"payment-farewell",label:"会計・お見送り",manual:{type:"scene",id:"payment"}}
    ]},
    {id:"drinks",label:"ドリンク",skills:[
      {id:"beer",label:"ビール",manual:{type:"drink",id:"beer"}},
      {id:"highball",label:"ハイボール",manual:{type:"drink",id:"highball"}},
      {id:"wine",label:"ワイン",manual:{type:"drink",id:"redwine"}},
      {id:"non-alcohol",label:"ノンアルコール・ソフトドリンク"}
    ]},
    {id:"food",label:"料理説明",skills:[
      {id:"aburi",label:"牛肉の焼き霜降り",manual:{type:"scene",id:"hall-flow-05-2-aburi"}},
      {id:"foiegras",label:"フォアグラ",manual:{type:"scene",id:"hall-flow-05-3-foiegras"}},
      {id:"soup-bread",label:"スープ・パン",manual:{type:"scene",id:"hall-flow-05-4-soup"}},
      {id:"abalone",label:"あわび",manual:{type:"scene",id:"hall-flow-05-5-abalone"}},
      {id:"salad",label:"焼き野菜のサラダ",manual:{type:"scene",id:"hall-flow-05-7-salad"}},
      {id:"meat",label:"お肉",manual:{type:"scene",id:"hall-flow-05-8-meat"}},
      {id:"garlic-rice",label:"ガーリックライス",manual:{type:"scene",id:"hall-flow-05-9-garlic-rice"}}
    ]},
    {id:"special",label:"特別対応",skills:[
      {id:"anniversary",label:"記念日対応全体",manual:{type:"scene",id:"anniversary-01-check"}},
      {id:"cake-prepare",label:"ケーキ準備",manual:{type:"scene",id:"anniversary-03-cool-plate"}},
      {id:"cake-serve-photo",label:"提供・写真撮影",manual:{type:"scene",id:"anniversary-09-serve"}},
      {id:"cake-cut",label:"ケーキの切り分け",manual:{type:"scene",id:"anniversary-12-take-cut"}}
    ]},
    {id:"safety",label:"安全・判断",skills:[
      {id:"allergy",label:"アレルギー対応",manual:{type:"scene",id:"allergy"}},
      {id:"complaint",label:"苦情の初動",manual:{type:"scene",id:"complaint"}},
      {id:"fire-smoke",label:"火災・煙・異臭"},
      {id:"gas",label:"ガスの異常"},
      {id:"equipment",label:"機器の異常"}
    ]}
  ];
  const ALL_SKILLS=GROUPS.flatMap((group)=>group.skills.map((skill)=>({...skill,groupId:group.id,groupLabel:group.label})));

  let remoteProfile=null;
  let ownerProfiles=[];
  let ownerCurrentStaffId="";

  const $id=(id)=>document.getElementById(id);
  const profile=()=>localJson("amoretto-standard-profile",{name:"",role:""});

  function randomId(){
    if(window.crypto?.randomUUID)return window.crypto.randomUUID();
    return `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}-${Math.random().toString(16).slice(2)}`.padEnd(36,"0").slice(0,36);
  }

  function identity(){
    let value=localJson(IDENTITY_KEY,null);
    if(!value||!String(value.staffId||"").startsWith("staff-")||String(value.token||"").length<40){
      value={staffId:`staff-${randomId()}`,token:`${randomId()}${randomId()}`};
      setLocalJson(IDENTITY_KEY,value);
    }
    return value;
  }

  function localState(){
    const value=localJson(LOCAL_KEY,{levels:{},requests:[],pending:false});
    return {
      levels:value&&typeof value.levels==="object"?value.levels:{},
      requests:Array.isArray(value?.requests)?value.requests:[],
      pending:Boolean(value?.pending)
    };
  }

  function saveLocal(state){setLocalJson(LOCAL_KEY,state);}
  function remoteSkills(){return remoteProfile&&typeof remoteProfile.skills==="object"?remoteProfile.skills:{};}
  function skillEntry(id){
    const local=localState();
    const remote=remoteSkills()[id]||{};
    return {
      selfLevel:Number(local.levels[id]??remote.selfLevel??0),
      ownerLevel:Number(remote.ownerLevel??0),
      requestedAt:String(remote.requestedAt||""),
      certifiedAt:String(remote.certifiedAt||"")
    };
  }
  function effectiveLevel(id){const entry=skillEntry(id);return Math.max(entry.selfLevel,entry.ownerLevel);}
  function levelClass(level){return level>=3?"trainer":level>=2?"certified":level>=1?"practice":"unlearned";}

  function injectStyles(){
    if($id("skillStyles"))return;
    const style=document.createElement("style");style.id="skillStyles";
    style.textContent=`
      .skill-summary{border-left:4px solid var(--ok);background:var(--ok-soft)}.skill-summary-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:12px 0}.skill-summary-grid>div{background:white;border:1px solid #c8d9ce;border-radius:12px;padding:10px;text-align:center}.skill-summary-grid strong,.skill-summary-grid span{display:block}.skill-summary-grid strong{font-size:20px}.skill-open{width:100%;margin-top:4px}
      .skill-modal{z-index:155}.skill-sheet{max-height:95vh}.skill-profile-note{background:#f7f3ed;border-radius:13px;padding:11px 13px;font-size:12px;margin-bottom:12px}.skill-group{margin-top:18px}.skill-group-title{display:flex;align-items:center;justify-content:space-between;margin-bottom:7px}.skill-group-title h3{margin:0}.skill-row{border:1px solid var(--line);border-radius:14px;background:white;padding:12px;margin-bottom:8px}.skill-row-top{display:flex;align-items:center;justify-content:space-between;gap:10px}.skill-row-title{font-weight:800}.skill-level{display:inline-flex;border-radius:999px;padding:4px 8px;font-size:10px;font-weight:800}.skill-level.unlearned{background:#f1ede6;color:var(--muted)}.skill-level.practice{background:var(--warning-soft);color:var(--warning)}.skill-level.certified{background:var(--ok-soft);color:var(--ok)}.skill-level.trainer{background:var(--info-soft);color:var(--info)}.skill-requested{font-size:10px;color:var(--accent);margin-top:6px}.skill-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:9px}.skill-action{border:1px solid var(--line);border-radius:10px;padding:8px 10px;background:white;color:var(--ink);font-size:11px}.skill-action.primary-action{background:var(--deep);color:white;border-color:var(--deep)}.skill-action.request{color:var(--accent);border-color:#d8c7ca}.skill-action:disabled{opacity:.5}.skill-offline{background:var(--warning-soft);color:var(--warning);padding:9px 11px;border-radius:11px;font-size:11px;margin-bottom:10px}
      .owner-skill-card{border:1px solid var(--line);border-radius:15px;background:white;padding:13px;margin-bottom:9px}.owner-skill-meta{display:flex;gap:6px;flex-wrap:wrap;margin:6px 0}.owner-skill-counts{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:9px}.owner-skill-counts>div{background:#f7f3ed;border-radius:10px;padding:8px;text-align:center}.owner-skill-counts strong,.owner-skill-counts span{display:block}.owner-skill-counts span{font-size:9px;color:var(--muted)}.owner-skill-open{width:100%;margin-top:10px}.owner-skill-modal{z-index:170}.owner-skill-select{width:100%;margin-top:8px}.owner-skill-request{background:var(--warning-soft);color:var(--warning);border-radius:9px;padding:7px 9px;font-size:10px;margin-top:7px}.skill-danger{margin-top:18px;width:100%}
      @media(max-width:390px){.skill-summary-grid{grid-template-columns:1fr}.skill-row-top{align-items:flex-start}.skill-actions{display:grid;grid-template-columns:1fr 1fr}.skill-action{width:100%}}
    `;
    document.head.appendChild(style);
  }

  function injectStaffUI(){
    const learn=$id("learn");if(!learn||$id("skillSummaryCard"))return;
    const summary=learn.querySelector(".learning-summary");
    summary?.insertAdjacentHTML("afterend",`<div class="card skill-summary" id="skillSummaryCard"><div class="card-title-row"><div><div class="eyebrow">Skill certification</div><h3 class="no-bottom">スキル認定</h3></div><span class="badge" id="skillSyncBadge">端末保存</span></div><p class="small muted">練習状況を記録し、店主確認を受けます。「一人でできる」「指導できる」は店主だけが認定します。</p><div class="skill-summary-grid"><div><strong id="skillPracticingCount">0</strong><span class="small muted">練習中</span></div><div><strong id="skillCertifiedCount">0</strong><span class="small muted">一人でできる</span></div><div><strong id="skillTrainerCount">0</strong><span class="small muted">指導できる</span></div></div><button class="secondary skill-open" id="openSkillsBtn">自分のスキルを確認</button></div>`);
    document.body.insertAdjacentHTML("beforeend",`<div class="modal skill-modal" id="skillModal"><div class="sheet skill-sheet"><div class="sheet-head"><div><div class="eyebrow">Skill certification</div><h2 class="no-bottom">自分のスキル</h2></div><button class="close-btn" id="closeSkillsBtn">×</button></div><div id="skillModalBody"></div></div></div>`);
    $id("openSkillsBtn").addEventListener("click",openSkills);
    $id("closeSkillsBtn").addEventListener("click",()=>closeModal("skillModal"));
    $id("skillModal").addEventListener("click",(event)=>{if(event.target.id==="skillModal")closeModal("skillModal");});
    $id("saveProfileBtn")?.addEventListener("click",()=>setTimeout(()=>{renderSkillSummary();loadSelfProfile();},0));
    renderSkillSummary();
  }

  function injectOwnerUI(){
    const tabs=$id("adminTabs"),content=document.querySelector(".owner-content");
    if(!tabs||!content||$id("skillsAdmin"))return;
    const notesTab=tabs.querySelector('[data-admin-tab="notesAdmin"]');
    const tab=document.createElement("button");tab.className="pill";tab.dataset.adminTab="skillsAdmin";tab.textContent="スキル";
    if(notesTab)tabs.insertBefore(tab,notesTab);else tabs.appendChild(tab);
    const panel=document.createElement("section");panel.className="admin-panel";panel.id="skillsAdmin";panel.innerHTML=`<div class="admin-title-row"><div><h3 class="no-bottom">スタッフのスキル認定</h3><div class="small muted">練習状況を確認し、店主が認定します。</div></div><button class="secondary" id="reloadSkillsBtn">更新</button></div><div id="ownerSkillList"><div class="empty">スキル情報を開くと、登録済みスタッフが表示されます。</div></div>`;
    const notesPanel=$id("notesAdmin");if(notesPanel)content.insertBefore(panel,notesPanel);else content.appendChild(panel);
    document.body.insertAdjacentHTML("beforeend",`<div class="modal owner-skill-modal" id="ownerSkillModal"><div class="sheet tall-sheet"><div class="sheet-head"><div><div class="eyebrow">Owner certification</div><h2 class="no-bottom" id="ownerSkillTitle">スキル認定</h2></div><button class="close-btn" id="closeOwnerSkillsBtn">×</button></div><div id="ownerSkillBody"></div></div></div>`);
    tab.addEventListener("click",()=>{
      document.querySelectorAll(".admin-tabs .pill").forEach((button)=>button.classList.toggle("active",button===tab));
      document.querySelectorAll(".admin-panel").forEach((item)=>item.classList.toggle("active",item.id==="skillsAdmin"));
      loadOwnerSkills();
    });
    $id("reloadSkillsBtn").addEventListener("click",loadOwnerSkills);
    $id("closeOwnerSkillsBtn").addEventListener("click",()=>closeModal("ownerSkillModal"));
    $id("ownerSkillModal").addEventListener("click",(event)=>{if(event.target.id==="ownerSkillModal")closeModal("ownerSkillModal");});
  }

  function renderSkillSummary(){
    if(!$id("skillSummaryCard"))return;
    const entries=ALL_SKILLS.map((skill)=>skillEntry(skill.id));
    const practicing=entries.filter((entry)=>entry.selfLevel===1&&entry.ownerLevel<2).length;
    const certified=entries.filter((entry)=>entry.ownerLevel===2).length;
    const trainer=entries.filter((entry)=>entry.ownerLevel===3).length;
    $id("skillPracticingCount").textContent=String(practicing);
    $id("skillCertifiedCount").textContent=String(certified);
    $id("skillTrainerCount").textContent=String(trainer);
    const state=localState();
    $id("skillSyncBadge").textContent=!navigator.onLine?"オフライン":state.pending?"未共有":remoteProfile?"共有済み":"端末保存";
    $id("skillSyncBadge").className=`badge ${!navigator.onLine||state.pending?"warn":""}`;
  }

  function skillRow(skill){
    const entry=skillEntry(skill.id),level=effectiveLevel(skill.id),certified=entry.ownerLevel>=2;
    const manual=skill.manual?`<button class="skill-action" type="button" onclick="openSkillManual('${esc(skill.manual.type)}','${esc(skill.manual.id)}')">マニュアル</button>`:"";
    const selfActions=certified?"":entry.selfLevel===0
      ?`<button class="skill-action primary-action" type="button" onclick="setMySkillLevel('${esc(skill.id)}',1)">練習を始める</button>`
      :`<button class="skill-action" type="button" onclick="setMySkillLevel('${esc(skill.id)}',0)">未習得に戻す</button><button class="skill-action request" type="button" onclick="requestSkillReview('${esc(skill.id)}')" ${entry.requestedAt?'disabled':''}>${entry.requestedAt?'確認依頼済み':'店主確認を依頼'}</button>`;
    return `<div class="skill-row"><div class="skill-row-top"><div class="skill-row-title">${esc(skill.label)}</div><span class="skill-level ${levelClass(level)}">${esc(LEVELS[level]||LEVELS[0])}</span></div>${entry.requestedAt&&entry.ownerLevel<2?`<div class="skill-requested">店主確認を依頼しています。</div>`:""}<div class="skill-actions">${manual}${selfActions}</div></div>`;
  }

  function renderSkillsModal(){
    const p=profile(),body=$id("skillModalBody");if(!body)return;
    if(!p.name){
      body.innerHTML=`<div class="skill-profile-note">スキルを記録する前に、この端末の担当者名を登録してください。</div><button class="primary" id="skillOpenProfile">担当者名を登録</button>`;
      $id("skillOpenProfile").addEventListener("click",()=>{closeModal("skillModal");openModal("profileModal");});
      return;
    }
    const state=localState();
    body.innerHTML=`${!navigator.onLine?'<div class="skill-offline">現在はオフラインです。練習状況は端末へ保存し、通信が戻った時に共有します。</div>':''}<div class="skill-profile-note"><strong>${esc(p.name)}</strong>${p.role?`（${esc(p.role)}）`:""}<br>本人は「未習得・練習中」まで更新できます。店主認定は本人から変更できません。</div>${GROUPS.map((group)=>`<div class="skill-group"><div class="skill-group-title"><h3>${esc(group.label)}</h3><span class="small muted">${group.skills.filter((skill)=>effectiveLevel(skill.id)>=2).length}／${group.skills.length} 認定</span></div>${group.skills.map(skillRow).join("")}</div>`).join("")}${state.pending?'<div class="skill-offline">未共有の変更があります。</div>':''}`;
  }

  function openSkills(){renderSkillsModal();openModal("skillModal");loadSelfProfile();}

  function payload(requestIds=[]){
    const state=localState();
    return ALL_SKILLS.map((skill)=>({id:skill.id,selfLevel:Number(state.levels[skill.id]??skillEntry(skill.id).selfLevel??0),requestReview:requestIds.includes(skill.id)}));
  }

  async function loadSelfProfile(){
    const p=profile();if(!p.name){renderSkillSummary();return;}
    const id=identity(),state=localState();
    if(!navigator.onLine){renderSkillSummary();renderSkillsModal();return;}
    try{
      const response=await fetch(API_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"read",staffId:id.staffId,token:id.token}),cache:"no-store"});
      const data=await response.json();if(!response.ok)throw new Error(data.error||"スキル情報を読み込めませんでした。");
      remoteProfile=data.profile||null;
      if(remoteProfile&&!state.pending){
        const levels={...state.levels};
        Object.entries(remoteSkills()).forEach(([skillId,value])=>{levels[skillId]=Number(value?.selfLevel??0);});
        saveLocal({levels,requests:[],pending:false});
      }
      if(!remoteProfile||state.pending||state.requests.length)await syncSelf({quiet:true});
      renderSkillSummary();renderSkillsModal();
    }catch(error){renderSkillSummary();if($id("skillModal")?.classList.contains("open"))showToast(error.message||"端末保存の内容を表示しています");}
  }

  async function syncSelf({quiet=false}={}){
    const p=profile();if(!p.name){if(!quiet)showToast("担当者名を登録してください");return;}
    const id=identity(),state=localState();
    saveLocal({...state,pending:true});renderSkillSummary();
    if(!navigator.onLine){if(!quiet)showToast("端末へ保存しました。通信が戻ると共有します");renderSkillsModal();return;}
    try{
      const response=await fetch(API_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"self",staffId:id.staffId,token:id.token,name:p.name,role:p.role||"",skills:payload(state.requests),website:""})});
      const data=await response.json();if(!response.ok)throw new Error(data.error||"スキル情報を共有できませんでした。");
      remoteProfile=data.profile||remoteProfile;
      saveLocal({...state,requests:[],pending:false});
      renderSkillSummary();renderSkillsModal();
      if(!quiet)showToast("スキル情報を共有しました");
    }catch(error){saveLocal({...state,pending:true});renderSkillSummary();if(!quiet)showToast(error.message||"端末へ保存しました");}
  }

  window.setMySkillLevel=function(skillId,level){
    const state=localState();state.levels[skillId]=Math.max(0,Math.min(1,Number(level)));state.pending=true;
    if(level===0)state.requests=state.requests.filter((id)=>id!==skillId);
    saveLocal(state);renderSkillSummary();renderSkillsModal();syncSelf({quiet:true});
  };

  window.requestSkillReview=function(skillId){
    const state=localState();state.levels[skillId]=1;state.requests=[...new Set([...state.requests,skillId])];state.pending=true;saveLocal(state);
    renderSkillSummary();renderSkillsModal();syncSelf();
  };

  window.openSkillManual=function(type,id){closeModal("skillModal");const item=typeof findItem==="function"?findItem(type,id):null;if(!item){showToast("対応するマニュアルを確認できませんでした");return;}openItem(type,id);};

  function profileCounts(profileItem){
    const skills=profileItem&&typeof profileItem.skills==="object"?profileItem.skills:{};
    const values=ALL_SKILLS.map((skill)=>skills[skill.id]||{});
    return {
      practice:values.filter((entry)=>Number(entry.selfLevel||0)===1&&Number(entry.ownerLevel||0)<2).length,
      certified:values.filter((entry)=>Number(entry.ownerLevel||0)===2).length,
      trainer:values.filter((entry)=>Number(entry.ownerLevel||0)===3).length,
      requests:values.filter((entry)=>entry.requestedAt&&Number(entry.ownerLevel||0)<2).length
    };
  }

  async function loadOwnerSkills(){
    const container=$id("ownerSkillList");if(!container)return;container.innerHTML='<div class="empty">読み込み中…</div>';
    try{
      const response=await fetch(API_URL,{cache:"no-store"}),data=await response.json();
      if(response.status===401)throw new Error("店主ログインが必要です。");if(!response.ok)throw new Error(data.error||"スキル情報を読み込めませんでした。");
      ownerProfiles=data.profiles||[];renderOwnerSkillList();
    }catch(error){container.innerHTML=`<div class="empty">${esc(error.message||"読み込めませんでした")}</div>`;}
  }

  function renderOwnerSkillList(){
    const container=$id("ownerSkillList");if(!container)return;
    container.innerHTML=ownerProfiles.length?ownerProfiles.map((item)=>{const counts=profileCounts(item);return `<div class="owner-skill-card"><div class="card-title-row"><div><strong>${esc(item.name||"名前未登録")}</strong><div class="small muted">${esc(item.role||"役割未設定")}</div></div>${counts.requests?`<span class="badge warn">確認依頼 ${counts.requests}</span>`:'<span class="badge">登録済み</span>'}</div><div class="owner-skill-counts"><div><strong>${counts.practice}</strong><span>練習中</span></div><div><strong>${counts.certified}</strong><span>一人でできる</span></div><div><strong>${counts.trainer}</strong><span>指導できる</span></div></div><button class="secondary owner-skill-open" onclick="openOwnerSkillProfile('${esc(item.id)}')">認定内容を確認</button></div>`;}).join(""):'<div class="empty">まだスタッフのスキル情報がありません。スタッフが「自分のスキル」を開くと登録されます。</div>';
  }

  window.openOwnerSkillProfile=function(staffId){ownerCurrentStaffId=staffId;renderOwnerSkillModal();openModal("ownerSkillModal");};

  function ownerSkillRow(skill,profileItem){
    const entry=profileItem.skills?.[skill.id]||{},ownerLevel=Number(entry.ownerLevel||0),selfLevel=Number(entry.selfLevel||0);
    return `<div class="skill-row"><div class="skill-row-top"><div class="skill-row-title">${esc(skill.label)}</div><span class="skill-level ${levelClass(Math.max(selfLevel,ownerLevel))}">${esc(LEVELS[Math.max(selfLevel,ownerLevel)]||LEVELS[0])}</span></div><div class="small muted">本人申告：${esc(LEVELS[selfLevel]||LEVELS[0])}</div>${entry.requestedAt&&ownerLevel<2?'<div class="owner-skill-request">店主確認の依頼があります。</div>':''}<select class="form-input owner-skill-select" onchange="setOwnerSkillLevel('${esc(profileItem.id)}','${esc(skill.id)}',this.value)">${LEVELS.map((label,index)=>`<option value="${index}" ${ownerLevel===index?'selected':''}>店主認定：${esc(label)}</option>`).join("")}</select></div>`;
  }

  function renderOwnerSkillModal(){
    const item=ownerProfiles.find((profileItem)=>profileItem.id===ownerCurrentStaffId);if(!item)return;
    $id("ownerSkillTitle").textContent=`${item.name||"スタッフ"}のスキル`;
    $id("ownerSkillBody").innerHTML=`<div class="skill-profile-note"><strong>${esc(item.name||"名前未登録")}</strong>${item.role?`（${esc(item.role)}）`:""}<br>「一人でできる」「指導できる」は、実技を確認してから認定してください。</div>${GROUPS.map((group)=>`<div class="skill-group"><div class="skill-group-title"><h3>${esc(group.label)}</h3></div>${group.skills.map((skill)=>ownerSkillRow(skill,item)).join("")}</div>`).join("")}<button class="danger-outline skill-danger" onclick="deleteOwnerSkillProfile('${esc(item.id)}')">このスタッフのスキル情報を削除</button>`;
  }

  window.setOwnerSkillLevel=async function(staffId,skillId,value){
    try{
      const response=await fetch(API_URL,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({staffId,skillId,ownerLevel:Number(value),clearRequest:true})}),data=await response.json();
      if(response.status===401)throw new Error("店主ログインが必要です。");if(!response.ok)throw new Error(data.error||"認定を更新できませんでした。");
      const index=ownerProfiles.findIndex((item)=>item.id===staffId);if(index>=0)ownerProfiles[index]=data.profile;
      renderOwnerSkillList();renderOwnerSkillModal();showToast("認定内容を更新しました");
    }catch(error){showToast(error.message||"認定を更新できませんでした");loadOwnerSkills();}
  };

  window.deleteOwnerSkillProfile=async function(staffId){
    const item=ownerProfiles.find((profileItem)=>profileItem.id===staffId);if(!confirm(`${item?.name||"このスタッフ"}のスキル情報を削除しますか。`))return;
    try{
      const response=await fetch(API_URL,{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({staffId})}),data=await response.json();
      if(!response.ok)throw new Error(data.error||"削除できませんでした。");closeModal("ownerSkillModal");await loadOwnerSkills();showToast("スキル情報を削除しました");
    }catch(error){showToast(error.message||"削除できませんでした");}
  };

  function init(){
    if(!$id("learn")||!$id("adminTabs")){setTimeout(init,60);return;}
    injectStyles();injectStaffUI();injectOwnerUI();loadSelfProfile();
    window.addEventListener("online",()=>syncSelf({quiet:true}));
    document.addEventListener("keydown",(event)=>{if(event.key==="Escape"){closeModal("skillModal");closeModal("ownerSkillModal");}});
  }

  init();
})();
