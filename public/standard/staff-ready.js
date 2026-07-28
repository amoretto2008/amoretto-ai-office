(function(){
  function profileData(){
    return localJson("amoretto-standard-profile",{name:"",role:""});
  }

  function ensureFirstUseCard(){
    const today=document.getElementById("today");
    if(!today||document.getElementById("firstUseCard"))return;
    const titleRow=today.querySelector(".title-row");
    const card=document.createElement("section");
    card.id="firstUseCard";
    card.className="card notice";
    card.innerHTML=`
      <div class="eyebrow">First step</div>
      <h2>最初の準備</h2>
      <p class="small muted">① 名前を登録　② 下の5つから必要な項目を選ぶ　③ 迷ったら右上の検索を使う</p>
      <button type="button" class="primary" id="firstUseProfileBtn">名前を登録する</button>
    `;
    if(titleRow)titleRow.insertAdjacentElement("afterend",card);
    else today.prepend(card);
    card.querySelector("#firstUseProfileBtn")?.addEventListener("click",()=>openModal("profileModal"));
  }

  const originalSetSyncState=setSyncState;
  setSyncState=function(state){
    const label=state==="loading"?"確認中":state==="error"?"保存版":"最新";
    originalSetSyncState(state,label);
    const button=document.getElementById("syncBtn");
    if(!button)return;
    const help=state==="error"
      ?"通信できないため、この端末に保存された内容を表示しています。"
      :state==="loading"
        ?"最新の内容を確認しています。"
        :"最新の内容を確認します。";
    button.title=help;
    button.setAttribute("aria-label",help);
  };

  const originalRenderProfile=renderProfile;
  renderProfile=function(){
    originalRenderProfile();
    ensureFirstUseCard();
    const profile=profileData();
    document.getElementById("firstUseCard")?.classList.toggle("hidden",Boolean(profile.name));
  };

  const originalRenderToday=renderToday;
  renderToday=function(){
    originalRenderToday();
    if(!config.updatedAt){
      const updated=document.getElementById("updatedAt");
      if(updated)updated.textContent="登録済みの基準を表示しています。";
    }
  };

  const ownerButton=document.getElementById("ownerBtn");
  if(ownerButton){
    ownerButton.textContent="店主用";
    ownerButton.title="店主専用の管理画面";
    ownerButton.setAttribute("aria-label","店主専用の管理画面");
  }

  const profileModal=document.getElementById("profileModal");
  const profileHelp=profileModal?.querySelector("p.small.muted");
  if(profileHelp){
    profileHelp.textContent="最初に名前を登録してください。名前と役割はこのスマホ内だけに保存され、店主へのメモ送信時にだけ使われます。";
  }

  const saveProfileButton=document.getElementById("saveProfileBtn");
  saveProfileButton?.addEventListener("click",(event)=>{
    const input=document.getElementById("staffNameInput");
    if(input&&input.value.trim())return;
    event.preventDefault();
    event.stopImmediatePropagation();
    showToast("名前を入力してください");
    input?.focus();
  },true);

  ensureFirstUseCard();
})();
