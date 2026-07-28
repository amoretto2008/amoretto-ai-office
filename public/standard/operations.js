(function(){
const pack={"version":"2026-07-28","checklists":[{"id":"opening","title":"始め","description":"営業前に、客席・設備・予約・補充を整える。","active":true,"items":[{"id":"opening-oshibori","text":"おしぼりを裏から持ってきて、ウォーマーの後ろへ補充する（火・水・金）","required":true},{"id":"opening-sign","text":"看板の照明を確認する","required":true},{"id":"opening-restroom","text":"トイレで着替え、便座の電源・ペーパーの残量・ゴミ箱を確認する","required":true},{"id":"opening-reservations","text":"当日と翌日の予約内容を確認する","required":true},{"id":"opening-power-water","text":"洗浄機、ポット（水の補給を含む）、おしぼりウォーマーの電源を確認する","required":true},{"id":"opening-table","text":"テーブルセットを行い、椅子も拭く（スプーンがなければ後回し）","required":true},{"id":"opening-reserved-sign","text":"予約札を置く","required":true},{"id":"opening-rice","text":"必要な米の量を確認し、炊飯をセットする","required":true},{"id":"opening-silver","text":"シルバーが洗浄・拭き上げ済みか確認する","required":true},{"id":"opening-drinks","text":"ドリンクを補充する（ソーダと水を優先。烏龍茶は茶葉2パック）","required":true},{"id":"opening-caster","text":"カスターセットを補充する（オリーブ油・塩・胡椒・醤油・水）","required":true},{"id":"opening-teppan","text":"鉄板を磨く","required":true},{"id":"opening-beer-server","text":"ビールサーバーを洗浄する","required":true},{"id":"opening-ashtray","text":"灰皿を洗う","required":true}]},{"id":"idle-work","title":"手隙時","description":"客席の観察を優先し、手が空いた時に少しずつ進める。","active":true,"items":[{"id":"idle-bottles","text":"カウンター後ろ・客席後ろの棚と酒瓶を拭く","required":false},{"id":"idle-wine-glasses","text":"ワイングラスを拭く","required":false},{"id":"idle-ventilation","text":"換気扇を掃除する","required":false},{"id":"idle-aircon-filter","text":"エアコンフィルターを掃除する","required":false},{"id":"idle-stove","text":"コンロを掃除する","required":false}]},{"id":"closing","title":"閉め","description":"翌日の営業へ、静かに確実につなぐ。","active":true,"items":[{"id":"closing-garbage","text":"厨房・シンク・トイレのゴミを確認して捨てる。新しいゴミ袋は、ゴミを捨てる前に取り付ける","required":true},{"id":"closing-oshibori","text":"おしぼりを裏へ出す","required":true},{"id":"closing-rice","text":"残ったご飯をお釜から器へ移し、冷蔵庫で保管する","required":true},{"id":"closing-teppan","text":"鉄板を磨く","required":true},{"id":"closing-table","text":"翌日のテーブルセットを行う","required":true},{"id":"closing-trays","text":"灰皿（手洗い）、ビールの受け皿、コーヒーの受け皿を洗う","required":true},{"id":"closing-dishwasher","text":"洗浄機の水を抜き、洗浄する","required":true},{"id":"closing-power","text":"看板・ポット・おしぼりウォーマー・エアコン・鉄板・トイレの電源を確認する","required":true},{"id":"closing-gas","text":"ガスを確認する","required":true}]},{"id":"inventory","title":"在庫確認","description":"基準数と現在数を確認し、不足だけを補充・発注へつなぐ。","active":true,"items":[{"id":"inventory-showcase-tray","text":"冷蔵ショーケースの水受けトレーを洗浄する","required":true},{"id":"inventory-cellar-water","text":"ワインセラー内の水気を確認し、清掃する","required":true},{"id":"inventory-counter-bottles","text":"カウンター棚のボトルと棚を磨く","required":true},{"id":"inventory-counts","text":"下の在庫入力欄で、全商品の現在数を確認する","required":true},{"id":"inventory-shortage","text":"不足品と「要確認」の項目を、店主へ共有する","required":true}]}],"lessons":[{"id":"lesson-work-rules","day":"実務","title":"AMORÉTTOで働く基本ルール","summary":"上下関係に頼らず、互いへの礼儀と次の人への配慮を守る。","content":"店内では、スタッフ同士も苗字に「さん」を付けて呼びます。賄い後の器は自分で洗い、携帯電話は鞄の中へ入れます。緊急連絡が入りそうな場合は、事前に了解を得てください。賄い中も勤務時間であることを忘れず、使い終わったサロンは翌日の人のためにきれいにたたみます。出退勤時はタイムカードを必ず確認します。","points":["スタッフは上下関係にかかわらず、苗字＋さんで呼ぶ","賄いで使った皿や箸は自分で洗う","携帯電話は鞄の中。緊急時は事前に了解を得る","賄い中も時給が発生していることを意識する","サロンをきれいにたたみ、次の人へつなぐ","タイムカードを忘れない"],"quiz":{"question":"勤務中の携帯電話の扱いとして正しいものはどれですか。","choices":["ポケットに入れて随時確認する","鞄に入れ、緊急連絡が見込まれる時は事前に了解を得る","客席から見えなければ自由に使う"],"answer":1,"explanation":"携帯電話は鞄の中へ入れます。緊急連絡が入りそうな場合は、先に了解を得ます。"},"active":true}],"inventory":{"version":"2026-07-28","notes":["水は原表の「1＋4」をそのまま記録し、意味は要確認。","プレミアム生ビール熟撰は基準数4。単位は要確認。","コーヒーシュガー、山崎、白州、ジャックダニエルは基準数要確認。"],"groups":[{"id":"showcase-small","location":"冷蔵ショーケース","category":"小瓶","items":[{"id":"nose-soda","name":"能勢ミネラルソーダ","target":10,"unit":"本"},{"id":"ginger-ale","name":"ジンジャエール","target":10,"unit":"本"},{"id":"cola","name":"コーラ","target":5,"unit":"本"},{"id":"dry-zero","name":"アサヒ ドライゼロ（瓶）","target":5,"unit":"本"},{"id":"tenshi-asti","name":"天使のアスティ","target":5,"unit":"本"},{"id":"concerto-lambrusco","name":"コンチェルト ランブルスコ","target":5,"unit":"本"}]},{"id":"showcase-can","location":"冷蔵ショーケース","category":"缶","items":[{"id":"guinness","name":"ギネスビール","target":10,"unit":"缶"}]},{"id":"showcase-pack","location":"冷蔵ショーケース","category":"パック","items":[{"id":"orange-juice","name":"オレンジジュース","target":1,"unit":"本"},{"id":"mango-syrup","name":"マンゴーシロップ","target":1,"unit":"本"},{"id":"milk","name":"牛乳","target":1,"unit":"本"},{"id":"cream-47","name":"生クリーム47％","target":1,"unit":"本"}]},{"id":"showcase-pet","location":"冷蔵ショーケース","category":"ペットボトル","items":[{"id":"oolong-tea","name":"烏龍茶","target":2,"unit":"本"},{"id":"water","name":"水","target":null,"unit":"要確認","note":"原表：1＋4"}]},{"id":"showcase-bottle","location":"冷蔵ショーケース","category":"瓶","items":[{"id":"cremant-bordeaux","name":"シャンヴェルメイユ クレマン・ド・ボルドー","target":1,"unit":"本"},{"id":"chateau-grand-jean","name":"シャトー・グラン・ジャン","target":1,"unit":"本"},{"id":"pays-doc-chardonnay","name":"ペイ ドック シャルドネ","target":1,"unit":"本"},{"id":"muscadet","name":"ミュスカデ セーヴル・エ・メーヌ","target":1,"unit":"本"},{"id":"alsace-riesling","name":"アルザス リースリング","target":1,"unit":"本"},{"id":"glass-rose","name":"グラス用ロゼワイン","target":1,"unit":"本"},{"id":"pierre-zero-chardonnay","name":"ピエール・ゼロ シャルドネ","target":1,"unit":"本"},{"id":"pierre-zero-merlot","name":"ピエール・ゼロ メルロー","target":1,"unit":"本"},{"id":"seasonal-sake","name":"季節の日本酒","target":1,"unit":"本"}]},{"id":"showcase-other","location":"冷蔵ショーケース","category":"その他","items":[{"id":"wasabi","name":"山葵","target":1,"unit":"個"},{"id":"garlic-soy","name":"大蒜醤油","target":1,"unit":"本"},{"id":"premium-draft","name":"プレミアム生ビール熟撰","target":4,"unit":"要確認","note":"原表の基準数は4。樽・本などの単位は要確認"},{"id":"coffee-sugar","name":"コーヒーシュガー","target":null,"unit":"要確認"}]},{"id":"cellar-sparkling","location":"ワインセラー","category":"スパークリングワイン","items":[{"id":"beaumont-reserve","name":"ボーモン グランド・レゼルヴ","target":2,"unit":"本"},{"id":"moet-vintage-2008","name":"モエ エ シャンドン グラン ヴィンテージ 2008","target":1,"unit":"本"},{"id":"dom-perignon","name":"ドン ペリニョン","target":1,"unit":"本"}]},{"id":"cellar-white","location":"ワインセラー","category":"ホワイトワイン","items":[{"id":"petit-guiraud","name":"プティ・ギロー","target":1,"unit":"本"},{"id":"tesch-deep-blue","name":"テッシュ ディープ・ブルー","target":1,"unit":"本"},{"id":"chablis-montmains","name":"シャブリ プルミエ・クリュ レ・モンマン","target":1,"unit":"本"}]},{"id":"cellar-red","location":"ワインセラー","category":"レッドワイン","items":[{"id":"chateau-haut-relay","name":"シャトー・オー・ルレ","target":3,"unit":"本"},{"id":"melliot-pinot-noir","name":"メリオー ピノ・ノワール","target":3,"unit":"本"},{"id":"chateau-la-freinelle","name":"シャトー・ラ・フレイネル","target":3,"unit":"本"},{"id":"chateau-amour","name":"シャトー・アムール","target":3,"unit":"本"},{"id":"crozes-hermitage","name":"クローズ・エルミタージュ","target":1,"unit":"本"},{"id":"gevrey-chambertin","name":"ジュヴレ・シャンベルタン","target":2,"unit":"本"},{"id":"opus-one","name":"オーパス ワン","target":1,"unit":"本"}]},{"id":"counter-whisky","location":"カウンター棚","category":"ウイスキー","items":[{"id":"iw-harper-12","name":"I.W.ハーパー12年","target":1,"unit":"本"},{"id":"macallan-12","name":"ザ・マッカラン12年","target":1,"unit":"本"},{"id":"taketsuru","name":"竹鶴","target":1,"unit":"本"},{"id":"yamazaki","name":"山崎","target":null,"unit":"要確認"},{"id":"hakushu","name":"白州","target":null,"unit":"要確認"},{"id":"jack-daniels","name":"ジャックダニエル","target":null,"unit":"要確認"}]},{"id":"counter-brandy","location":"カウンター棚","category":"ブランデー","items":[{"id":"camus-vsop","name":"CAMUS カミュ V.S.O.P","target":1,"unit":"本"}]},{"id":"counter-shochu","location":"カウンター棚","category":"焼酎","items":[{"id":"shochu-imo","name":"芋","target":1,"unit":"本"},{"id":"shochu-mugi","name":"麦","target":1,"unit":"本"}]},{"id":"counter-liqueur","location":"カウンター棚","category":"リキュール","items":[{"id":"yuzu-syrup","name":"柚子シロップ","target":1,"unit":"本"},{"id":"pomegranate-syrup","name":"柘榴シロップ","target":1,"unit":"本"},{"id":"cassis","name":"カシス","target":1,"unit":"本"},{"id":"peach","name":"ピーチ","target":1,"unit":"本"},{"id":"umeshu","name":"梅酒","target":1,"unit":"本"}]}]}};
const clone=(value)=>JSON.parse(JSON.stringify(value));
const upsertById=(current,items)=>{
  const result=Array.isArray(current)?clone(current):[];
  (items||[]).forEach((item)=>{
    const index=result.findIndex((x)=>x&&x.id===item.id);
    if(index>=0) result[index]=clone(item); else result.push(clone(item));
  });
  return result;
};
const previousNormalize=normalizeConfig;
normalizeConfig=function(raw){
  const merged=previousNormalize(raw);
  if(merged.operationsPackVersion!==pack.version){
    merged.checklists=upsertById(merged.checklists,pack.checklists);
    merged.lessons=upsertById(merged.lessons,pack.lessons);
    merged.operationsPackVersion=pack.version;
  }
  return merged;
};
window.AMORETTO_OPERATIONS=pack;
try{
  config=normalizeConfig(config);
  draftConfig=normalizeConfig(draftConfig);
  if(typeof renderAll==="function")renderAll();
}catch{}
})();

(function(){
const pack=window.AMORETTO_OPERATIONS;
if(!pack||!pack.inventory)return;
const esc=(value)=>String(value??"").replace(/[&<>'"]/g,(c)=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
const dateKey=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");};
const storageKey=()=>`amoretto-standard-inventory:${dateKey()}`;
const read=()=>{try{return JSON.parse(localStorage.getItem(storageKey()))||{};}catch{return {};}};
const write=(value)=>localStorage.setItem(storageKey(),JSON.stringify(value));
const allItems=()=>pack.inventory.groups.flatMap((group)=>group.items.map((item)=>({...item,location:group.location,category:group.category})));
const style=document.createElement("style");
style.textContent=`
.inventory-shell{margin-top:16px}
.inventory-summary{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:12px 0}
.inventory-metric{background:var(--surface-soft,#f4f1eb);border-radius:12px;padding:12px}
.inventory-metric strong{display:block;font-size:1.3rem;margin-top:3px}
.inventory-alert{border-left:4px solid #9a5d3d}
.inventory-group{margin-top:18px}
.inventory-location{font-size:.75rem;letter-spacing:.08em;text-transform:uppercase;color:var(--muted,#6e746f);margin-bottom:4px}
.inventory-category{margin:0 0 8px;font-size:1rem}
.inventory-row{display:grid;grid-template-columns:minmax(0,1fr) 86px;gap:10px;align-items:center;padding:11px 0;border-top:1px solid rgba(31,42,38,.12)}
.inventory-name{font-weight:650}
.inventory-meta{font-size:.78rem;color:var(--muted,#6e746f);margin-top:3px}
.inventory-status{display:inline-flex;margin-top:5px;padding:3px 7px;border-radius:999px;font-size:.72rem;background:#edf2ee;color:#32463b}
.inventory-status.short{background:#f8e7e2;color:#7b3526}
.inventory-status.unknown{background:#f4ecd4;color:#705a1d}
.inventory-input{width:100%;box-sizing:border-box;border:1px solid rgba(31,42,38,.22);border-radius:10px;padding:10px 8px;text-align:center;font-size:1rem;background:#fff}
.inventory-short-list{margin:8px 0 0;padding-left:20px}
.inventory-actions{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:14px}
@media(max-width:380px){.inventory-summary{grid-template-columns:1fr}.inventory-row{grid-template-columns:minmax(0,1fr) 76px}}
`;
document.head.appendChild(style);

const checkScreen=document.getElementById("check");
if(!checkScreen)return;
const shell=document.createElement("div");
shell.id="inventoryShell";
shell.className="inventory-shell hidden";
const historyHeading=checkScreen.querySelector(".section-heading");
checkScreen.insertBefore(shell,historyHeading||null);

function profileName(){
  try{const p=JSON.parse(localStorage.getItem("amoretto-standard-profile"))||{};return p.name||"未登録";}catch{return "未登録";}
}
function numberValue(value){
  if(value===""||value===null||value===undefined)return null;
  const n=Number(value);return Number.isFinite(n)?n:null;
}
function statusFor(item,value){
  const current=numberValue(value);
  if(current===null)return {label:"未確認",kind:"unknown"};
  if(item.target===null||item.target===undefined)return {label:"基準数 要確認",kind:"unknown"};
  if(current<item.target)return {label:`不足 ${item.target-current}${item.unit==="要確認"?"":item.unit}`,kind:"short"};
  return {label:"基準達成",kind:"ok"};
}
function isInventoryTab(){
  const active=document.querySelector("#checkTabs .pill.active");
  return active&&active.textContent.trim()==="在庫確認";
}
function updateChecklistCompletion(values){
  const all=allItems();
  const complete=all.length>0&&all.every((item)=>numberValue(values[item.id])!==null);
  const key=`amoretto-standard-check:${dateKey()}:inventory`;
  let checks=[];
  try{checks=JSON.parse(localStorage.getItem(key))||[];}catch{}
  const has=checks.includes("inventory-counts");
  if(complete&&!has)checks.push("inventory-counts");
  if(!complete&&has)checks=checks.filter((id)=>id!=="inventory-counts");
  localStorage.setItem(key,JSON.stringify(checks));
}
function render(){
  if(!isInventoryTab()){shell.classList.add("hidden");return;}
  shell.classList.remove("hidden");
  const values=read();
  const items=allItems();
  const entered=items.filter((item)=>numberValue(values[item.id])!==null);
  const shortages=items.filter((item)=>item.target!==null&&item.target!==undefined&&numberValue(values[item.id])!==null&&numberValue(values[item.id])<item.target);
  const unknown=items.filter((item)=>item.target===null||item.target===undefined);
  shell.innerHTML=`
    <div class="card">
      <div class="card-title-row align-end">
        <div><div class="eyebrow">Inventory</div><h2 class="no-bottom">現在数の入力</h2><div class="small muted">確認者：${esc(profileName())}｜${esc(dateKey())}</div></div>
        <button class="secondary small-button" id="resetInventory">入力を消す</button>
      </div>
      <div class="inventory-summary">
        <div class="inventory-metric"><span class="small muted">確認済み</span><strong>${entered.length}／${items.length}</strong></div>
        <div class="inventory-metric ${shortages.length?"inventory-alert":""}"><span class="small muted">不足品</span><strong>${shortages.length}</strong></div>
      </div>
      ${shortages.length?`<div class="card notice"><strong>補充・発注が必要</strong><ul class="inventory-short-list">${shortages.map((item)=>`<li>${esc(item.name)}：現在 ${esc(values[item.id])}／基準 ${esc(item.target)}${item.unit==="要確認"?"":esc(item.unit)}</li>`).join("")}</ul></div>`:""}
      ${pack.inventory.groups.map((group)=>`
        <div class="inventory-group">
          <div class="inventory-location">${esc(group.location)}</div>
          <h3 class="inventory-category">${esc(group.category)}</h3>
          ${group.items.map((item)=>{
            const value=values[item.id]??"";
            const status=statusFor(item,value);
            const target=item.target===null||item.target===undefined?"要確認":`${item.target}${item.unit==="要確認"?"":item.unit}`;
            return `<label class="inventory-row">
              <span><span class="inventory-name">${esc(item.name)}</span><span class="inventory-meta">基準 ${esc(target)}${item.note?`｜${esc(item.note)}`:""}</span><span class="inventory-status ${status.kind}">${esc(status.label)}</span></span>
              <input class="inventory-input" type="number" min="0" step="1" inputmode="numeric" data-inventory-id="${esc(item.id)}" value="${esc(value)}" aria-label="${esc(item.name)}の現在数">
            </label>`;
          }).join("")}
        </div>`).join("")}
      <div class="inventory-actions"><span class="small muted">基準数が未確定の項目：${unknown.length}件</span><span class="small muted">入力はこの端末に保存</span></div>
    </div>`;
  shell.querySelectorAll("[data-inventory-id]").forEach((input)=>input.addEventListener("change",(event)=>{
    const data=read();const id=event.target.dataset.inventoryId;const value=event.target.value;
    if(value==="")delete data[id];else data[id]=Number(value);
    data.checkedAt=new Date().toISOString();data.checkedBy=profileName();write(data);updateChecklistCompletion(data);render();
    if(typeof window.renderChecks==="function")setTimeout(()=>window.renderChecks(),0);
  }));
  const reset=shell.querySelector("#resetInventory");
  if(reset)reset.addEventListener("click",()=>{
    if(!confirm("本日の在庫入力を消しますか？"))return;
    localStorage.removeItem(storageKey());updateChecklistCompletion({});render();
    if(typeof window.renderChecks==="function")setTimeout(()=>window.renderChecks(),0);
  });
}
const baseRenderChecks=window.renderChecks;
if(typeof baseRenderChecks==="function"){
  window.renderChecks=function(){baseRenderChecks();setTimeout(render,0);};
}
document.getElementById("checkTabs")?.addEventListener("click",()=>setTimeout(render,0));
window.addEventListener("storage",(event)=>{if(event.key===storageKey())render();});
setTimeout(render,0);
})();