const $ = (id) => document.getElementById(id);
const clone = (value) => JSON.parse(JSON.stringify(value));
const esc = (value) => String(value ?? "").replace(/[&<>'"]/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
const splitLines = (value) => String(value || "").split("\n").map((v) => v.trim()).filter(Boolean);
const uid = (prefix = "item") => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const API = {config:"/api/standard/config", image:"/api/standard/image", session:"/api/standard/owner/session", notes:"/api/standard/notes", history:"/api/standard/history"};

const {APP_VERSION,defaultScenes,defaultLessons,defaultConfig}=window.AMORETTO_DATA;
let config = clone(defaultConfig);
let draftConfig = clone(defaultConfig);
let currentScreen = "today";
let currentSceneCategory = "すべて";
let currentDrinkCategory = "すべて";
let currentDrinkView = "drinks";
let currentChecklistId = "opening";
let searchScope = "all";
let ownerAuthenticated = false;
let adminEditingType = "";
let adminEditingId = "";
let adminImageFile = null;
let adminNoteFilter = "open";
let adminNotes = [];
let adminHistory = [];
let deferredInstallPrompt = null;
let toastTimer = null;

function normalizeConfig(raw) {
  const source = raw && typeof raw === "object" ? raw : {};
  const merged = {...clone(defaultConfig), ...clone(source)};
  merged.schemaVersion = 3;
  merged.appVersion = APP_VERSION;
  merged.revision = Number(source.revision || 0);
  merged.announcements = Array.isArray(source.announcements) ? source.announcements : [];
  merged.scenes = Array.isArray(source.scenes) && source.scenes.length ? source.scenes : clone(defaultScenes);
  merged.drinks = Array.isArray(source.drinks) ? source.drinks : clone(defaultConfig.drinks);
  merged.glasses = Array.isArray(source.glasses) ? source.glasses : clone(defaultConfig.glasses);
  merged.checklists = Array.isArray(source.checklists) && source.checklists.length ? source.checklists : clone(defaultConfig.checklists);
  merged.lessons = Array.isArray(source.lessons) && source.lessons.length ? source.lessons : clone(defaultLessons);
  merged.announcements = merged.announcements.map((x) => ({level:"info",startsAt:"",endsAt:"",active:true,...x,id:x.id||uid("announcement")}));
  merged.scenes = merged.scenes.map((x) => ({category:"接客",lead:"",do:[],say:"",dont:[],ask:"",tags:[],active:true,...x,id:x.id||uid("scene")}));
  merged.drinks = merged.drinks.map((x) => ({category:"その他",icon:"🥃",image:"",glass:"",ingredients:[],steps:[],standard:[],note:"",tags:[],active:true,...x,id:x.id||uid("drink")}));
  merged.glasses = merged.glasses.map((x) => ({icon:"🍷",image:"",use:"",location:"",handling:"",reject:"",tags:[],active:true,...x,id:x.id||uid("glass")}));
  merged.checklists = merged.checklists.map((x) => ({description:"",active:true,...x,id:x.id||uid("checklist"),items:(x.items||[]).map((item,i)=>typeof item==="string"?{id:`${x.id||"check"}-${i+1}`,text:item,required:true}:{required:true,...item,id:item.id||uid("check")} )}));
  merged.lessons = merged.lessons.map((x,i) => ({day:`DAY ${i+1}`,summary:"",content:"",points:[],quiz:{question:"確認問題",choices:["はい","いいえ"],answer:0,explanation:""},active:true,...x,id:x.id||uid("lesson"),quiz:{question:"確認問題",choices:["はい","いいえ"],answer:0,explanation:"",...(x.quiz||{})}}));
  return merged;
}

function localJson(key, fallback) { try { const value = JSON.parse(localStorage.getItem(key)); return value ?? fallback; } catch { return fallback; } }
function setLocalJson(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function todayKey(date = new Date()) { return [date.getFullYear(), String(date.getMonth()+1).padStart(2,"0"), String(date.getDate()).padStart(2,"0")].join("-"); }
function formatDate(value = new Date(), options = {year:"numeric",month:"long",day:"numeric",weekday:"long"}) { return new Intl.DateTimeFormat("ja-JP", options).format(value instanceof Date ? value : new Date(value)); }
function formatDateTime(value) { if (!value) return "未保存"; try { return new Intl.DateTimeFormat("ja-JP",{month:"numeric",day:"numeric",hour:"2-digit",minute:"2-digit"}).format(new Date(value)); } catch { return "未保存"; } }
function media(item) { return item.image ? `<span class="media-thumb"><img src="${esc(item.image)}" alt="${esc(item.name)}" loading="lazy"></span>` : `<span class="media-thumb">${esc(item.icon||"・")}</span>`; }
function showToast(message) { clearTimeout(toastTimer); $("toast").textContent = message; $("toast").classList.add("show"); toastTimer = setTimeout(()=>$("toast").classList.remove("show"), 2600); }
function openModal(id) { $(id).classList.add("open"); }
function closeModal(id) { $(id).classList.remove("open"); }
function closeAllModals() { document.querySelectorAll(".modal.open").forEach((m)=>m.classList.remove("open")); }
function setSyncState(state, label) { const btn=$("syncBtn"); btn.classList.remove("loading","error"); if(state) btn.classList.add(state); $("syncLabel").textContent=label; }
function activeItems(list) { return (list||[]).filter((x)=>x.active!==false); }

async function syncConfig({quiet=false}={}) {
  setSyncState("loading","更新中");
  try {
    const response = await fetch(`${API.config}?t=${Date.now()}`, {cache:"no-store"});
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "共有データを読み込めませんでした。");
    config = normalizeConfig(data.config || localJson("amoretto-standard-cache", defaultConfig));
    setLocalJson("amoretto-standard-cache", config);
    renderAll();
    setSyncState("","共有");
    if (!quiet) showToast("最新の内容に更新しました");
  } catch (error) {
    config = normalizeConfig(localJson("amoretto-standard-cache", defaultConfig));
    renderAll();
    setSyncState("error","保存版");
    if (!quiet) showToast(error.message || "保存済みの内容を表示しています");
  }
}

function renderAll() {
  renderProfile(); renderToday(); renderScenes(); renderDrinks(); renderChecks(); renderLessons(); renderFavorites(); renderRecent();
}

function renderProfile() {
  const profile = localJson("amoretto-standard-profile", {name:"",role:""});
  $("profileInitial").textContent = profile.name ? profile.name.trim().slice(0,1) : "＋";
  $("profileLabel").textContent = profile.name || "名前を登録";
  $("checkStaffLabel").textContent = `担当者：${profile.name || "未登録"}${profile.role ? `（${profile.role}）` : ""}`;
  $("staffNameInput").value = profile.name || "";
  $("staffRoleInput").value = profile.role || "";
  $("noteSenderLabel").textContent = `送信者：${profile.name || "匿名"}`;
}

function isAnnouncementVisible(item) {
  if (item.active === false) return false;
  const now = new Date();
  if (item.startsAt && now < new Date(`${item.startsAt}T00:00:00`)) return false;
  if (item.endsAt && now > new Date(`${item.endsAt}T23:59:59`)) return false;
  return true;
}

function renderToday() {
  $("todayDate").textContent = formatDate();
  $("todayQuote").textContent = config.quote || defaultConfig.quote;
  $("ownerNotice").textContent = config.notice || "連絡事項はありません。";
  $("revisionBadge").textContent = `Rev.${config.revision || 0}`;
  $("updatedAt").textContent = config.updatedAt ? `最終更新 ${formatDateTime(config.updatedAt)}${config.changeNote ? `｜${config.changeNote}` : ""}` : "共有データはまだ保存されていません。";
  const announcements = activeItems(config.announcements).filter(isAnnouncementVisible);
  $("announcementList").innerHTML = announcements.map((a)=>`<div class="card announcement ${esc(a.level)}"><div class="card-title-row"><h3>${esc(a.title)}</h3><span class="badge ${a.level==='urgent'?'danger':a.level==='important'?'warn':'info'}">${a.level==='urgent'?'至急':a.level==='important'?'重要':'お知らせ'}</span></div><p class="preline no-bottom">${esc(a.body)}</p>${a.endsAt?`<div class="announcement-meta">${esc(a.endsAt)}まで</div>`:""}</div>`).join("");
  const opening = activeItems(config.checklists).find((x)=>x.id==="opening" || x.title.includes("開店")) || activeItems(config.checklists)[0];
  const checked = opening ? getCheckState(opening.id) : [];
  $("todayCheckCount").textContent = opening ? `${checked.length}／${opening.items.length}` : "0／0";
  const lessons = activeItems(config.lessons); const completed = getTrainingCompleted();
  const percent = lessons.length ? Math.round(lessons.filter((l)=>completed[l.id]?.passed).length/lessons.length*100) : 0;
  $("trainingCount").textContent = `${percent}%`;
}

function getFavorites() { return localJson("amoretto-standard-favorites", []); }
function favoriteKey(type,id) { return `${type}:${id}`; }
function isFavorite(type,id) { return getFavorites().includes(favoriteKey(type,id)); }
function toggleFavorite(type,id,event) { event?.stopPropagation(); let fav=getFavorites(); const key=favoriteKey(type,id); fav=fav.includes(key)?fav.filter((x)=>x!==key):[key,...fav].slice(0,30); setLocalJson("amoretto-standard-favorites",fav); renderAll(); }
function addRecent(type,id,title) { let recent=localJson("amoretto-standard-recent",[]).filter((x)=>!(x.type===type&&x.id===id)); recent.unshift({type,id,title,at:new Date().toISOString()}); setLocalJson("amoretto-standard-recent",recent.slice(0,12)); renderRecent(); }
function findItem(type,id) { const map={scene:config.scenes,drink:config.drinks,glass:config.glasses,lesson:config.lessons}; return (map[type]||[]).find((x)=>x.id===id); }
function typeLabel(type) { return ({scene:"場面別",drink:"ドリンク",glass:"グラス",lesson:"学ぶ"})[type] || type; }
function compactItem(type,item) { return `<button class="list-button" onclick="openItem('${type}','${esc(item.id)}')"><span class="list-main">${type==='drink'||type==='glass'?media(item):`<span class="lesson-status">${type==='scene'?'◫':'◎'}</span>`}<span class="list-copy"><strong>${esc(item.title||item.name)}</strong><span class="small muted">${esc(typeLabel(type))}</span></span></span><span class="arrow">›</span></button>`; }
function renderFavorites() { const list=getFavorites().map((key)=>{const [type,id]=key.split(":");const item=findItem(type,id);return item?compactItem(type,item):""}).filter(Boolean); $("favoriteSection").classList.toggle("hidden",!list.length); $("favoriteList").innerHTML=list.join(""); }
function renderRecent() { const list=localJson("amoretto-standard-recent",[]).map((r)=>{const item=findItem(r.type,r.id);return item?compactItem(r.type,item):""}).filter(Boolean).slice(0,5); $("recentSection").classList.toggle("hidden",!list.length); $("recentList").innerHTML=list.join(""); }

