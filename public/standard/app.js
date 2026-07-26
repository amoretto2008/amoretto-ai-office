const $ = (id) => document.getElementById(id);
const clone = (value) => JSON.parse(JSON.stringify(value));
const lines = (value) => String(value || "").split("\n").map((v) => v.trim()).filter(Boolean);
const esc = (value) => String(value ?? "").replace(/[&<>'"]/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));

const scenes = [
  {title:"お客様が来店された",lead:"手を止め、顔を上げ、落ち着いてお迎えする。",do:["笑顔でお迎えし、予約名を確認する","人数と席を確認してから案内する","荷物や上着の置き場所を自然に案内する"],say:"いらっしゃいませ。ご予約のお名前をお伺いしてもよろしいでしょうか。",dont:["作業を続けたまま声だけで応対する","厨房へ大声で確認する","席が決まる前にお客様を待たせたままにする"],ask:"予約内容、人数、席、アレルギー情報に食い違いがあるとき"},
  {title:"予約時間より早く来られた",lead:"まず状況を確認し、待てる場所と目安を丁寧に伝える。",do:["店内の準備状況を確認する","案内可能なら静かに席へ通す","難しい場合は、理由とお待ちいただく場所を伝える"],say:"お越しいただきありがとうございます。店内を確認いたしますので、少々お待ちくださいませ。",dont:["準備できていないことをそのまま口にする","曖昧なまま長く待たせる"],ask:"開店前入店、席変更、料理開始時刻に影響があるとき"},
  {title:"料理の提供が遅れている",lead:"お客様から言われる前に状況を確認し、静かにお声がけする。",do:["厨房へ現在の進行を確認する","必要なら飲み物やパンの状況を見る","簡潔にお待たせしていることを伝える"],say:"お待たせしております。現在、次のお料理を丁寧に仕上げております。もう少々お待ちくださいませ。",dont:["厨房の事情を細かく説明する","誰かのせいにする","確認せず『もうすぐです』と言う"],ask:"通常より大きく遅れている、料理順に影響がある、強いご不満があるとき"},
  {title:"アレルギーについて聞かれた",lead:"自己判断で答えず、料理名と対象食材を正確に確認する。",do:["食材名と症状の程度を確認する","厨房責任者へ必ず共有する","確認が取れてから回答する"],say:"安全のため、使用食材を確認してまいります。少々お待ちくださいませ。",dont:["たぶん入っていないと答える","過去の記憶だけで判断する","完全除去を安易に約束する"],ask:"すべて。アレルギー対応は必ず店主または厨房責任者へ確認する"},
  {title:"お客様から違和感や苦情を伝えられた",lead:"言い訳をせず、最後まで聞き、事実を確認する。",do:["まずお詫びし、お話を遮らず聞く","どの商品・どの場面かを確認する","店主へ速やかに共有する"],say:"お知らせいただきありがとうございます。ご不快な思いをおかけし、申し訳ございません。状況を確認いたします。",dont:["すぐ反論する","他のスタッフの責任にする","勝手に値引きや約束をする"],ask:"すべて。謝罪後、店主へつなぐ"},
  {title:"お会計・お見送り",lead:"最後の印象まで、急がせず、静かに整える。",do:["伝票内容を確認する","お預かりとお返しの金額を明確にする","出口まで目を配り、感謝を伝える"],say:"本日はご来店いただき、誠にありがとうございました。どうぞお気をつけてお帰りくださいませ。",dont:["レジ作業だけに集中する","次の片付けを優先する","背中を向けたまま挨拶する"],ask:"料金、サービス料、支払い方法、領収書に不明点があるとき"}
];

const defaultConfig = {
  quote: "料理だけでなく、お客様が過ごす時間をつくる。",
  notice: "本日の予約内容とアレルギー情報を、営業前に必ず確認してください。",
  updatedAt: null,
  drinks: [
    {id:"highball",name:"ハイボール",category:"ハイボール",icon:"🥃",image:"",glass:"ハイボールグラス",ingredients:["ウイスキー：要確認","炭酸水：要確認","氷：グラスに合わせて"],steps:["グラスに氷を入れる","ウイスキーを計量して注ぐ","一度混ぜてグラスを冷やす","炭酸水を静かに注ぐ","炭酸を逃がさないように一度だけ混ぜる","グラス外側の水滴や汚れを拭く"],standard:["炭酸が抜けていない","分量が毎回同じ","飲み口に触れていない"],note:"正確な分量は店主確認後に登録してください。"},
    {id:"beer",name:"ビール",category:"ビール",icon:"🍺",image:"",glass:"ビアグラス",ingredients:["商品：要確認","適温：要確認"],steps:["冷えたグラスを確認する","グラスを傾けて静かに注ぐ","泡の高さを整える","ラベル面または銘柄を確認して提供する"],standard:["泡と液体のバランスが整っている","グラスに曇りや油分がない","提供前に銘柄を再確認する"],note:"瓶・生ビールなど、商品別に登録できます。"},
    {id:"redwine",name:"赤ワイン（グラス）",category:"ワイン",icon:"🍷",image:"",glass:"赤ワイングラス",ingredients:["銘柄：営業前に確認","提供量：要確認"],steps:["ボトルと銘柄を確認する","グラスに曇りや香り残りがないか確認する","ボトル口をグラスに触れさせず注ぐ","液だれを拭き、ボトルを所定位置へ戻す"],standard:["提供量が統一されている","ステムを持って提供する","飲み口に触れない"],note:"ワインごとに温度・グラス・提供量を登録すると便利です。"},
    {id:"whitewine",name:"白ワイン（グラス）",category:"ワイン",icon:"🥂",image:"",glass:"白ワイングラス",ingredients:["銘柄：営業前に確認","提供量：要確認"],steps:["温度と銘柄を確認する","グラスの状態を確認する","ボトル口を触れさせず静かに注ぐ","液だれを拭く"],standard:["冷えすぎ・温度上昇に注意する","提供量を統一する","ステムを持って提供する"],note:"泡・白・赤でグラスを分けて登録できます。"},
    {id:"coffee",name:"コーヒー",category:"コーヒー・紅茶",icon:"☕",image:"",glass:"コーヒーカップ",ingredients:["コーヒー：要確認","砂糖・ミルク：必要に応じて"],steps:["カップとソーサーを温める","抽出量を確認する","カップ外側の汚れを拭く","取っ手の向きを整えて提供する"],standard:["温度が保たれている","ソーサーとスプーンが清潔","提供方向が整っている"],note:"抽出機器・豆・量に合わせて内容を調整してください。"}
  ],
  glasses: [
    {id:"red-wine-glass",name:"赤ワイングラス",icon:"🍷",image:"",use:"赤ワイン",location:"保管場所：要登録",handling:"ステムを持つ。飲み口には触れない。",reject:"欠け・ひび・強い水垢・におい残り"},
    {id:"white-wine-glass",name:"白ワイングラス",icon:"🥂",image:"",use:"白ワイン・一部の泡",location:"保管場所：要登録",handling:"ステムを持ち、温度を上げない。",reject:"欠け・ひび・曇り・洗剤臭"},
    {id:"highball-glass",name:"ハイボールグラス",icon:"🥃",image:"",use:"ハイボール・一部ソフトドリンク",location:"保管場所：要登録",handling:"下部を持ち、飲み口に触れない。",reject:"欠け・ひび・油分・におい残り"},
    {id:"beer-glass",name:"ビアグラス",icon:"🍺",image:"",use:"ビール",location:"保管場所：要登録",handling:"泡を崩さないように静かに運ぶ。",reject:"油分・曇り・傷・洗剤臭"},
    {id:"coffee-cup",name:"コーヒーカップ",icon:"☕",image:"",use:"コーヒー",location:"保管場所：要登録",handling:"取っ手の向きを整え、ソーサー中央に置く。",reject:"欠け・茶渋・口紅跡・におい"}
  ]
};

const checkData = {
  "開店前":["店内の空気・温度を確認","テーブル・椅子・床を確認","グラス・カトラリーを確認","トイレを確認","本日のメニューを確認","予約内容を確認","アレルギー・注意事項を共有","身だしなみを確認"],
  "営業中":["お客様の表情と進行を見る","グラスの残量を見る","テーブル上を整える","料理の進行を厨房と共有","お待たせしていないか確認","不明点を自己判断せず確認"],
  "閉店後":["店内とバックヤードを清掃","グラス・備品を補充","忘れ物を確認","翌日の予約を確認","気になった出来事を記録","冷蔵・電源・施錠を確認"]
};

const lessons = [
  ["DAY 1","AMORÉTTOとは何か","料理だけでなく、お客様が過ごす時間全体をつくる店です。"],
  ["DAY 2","身だしなみと立ち方","清潔さ、静かな動き、視線、姿勢が店の空気をつくります。"],
  ["DAY 3","お迎えとご案内","最初の30秒で安心していただくための基本を確認します。"],
  ["DAY 4","料理と飲み物の提供","提供の順序、持ち方、言葉、置き方を統一します。"],
  ["DAY 5","お客様を見る","呼ばれる前に気づくための観察のポイントを学びます。"],
  ["DAY 6","連携と報告","小さな違和感を抱えず、短く正確に共有します。"],
  ["DAY 7","一人で判断しない基準","安全・料金・予約・苦情は、必ず確認してから進めます。"]
];

let config = clone(defaultConfig);
let draftConfig = clone(defaultConfig);
let currentDrinkCategory = "すべて";
let currentCheckTab = "開店前";
let editingType = "drink";
let editingId = "";
let selectedImageFile = null;
let deferredInstallPrompt = null;
let toastTimer = null;

function normalizeConfig(value) {
  if (!value || typeof value !== "object") return clone(defaultConfig);
  return {
    ...clone(defaultConfig),
    ...value,
    drinks: Array.isArray(value.drinks) ? value.drinks.map((d, i) => ({
      id: d.id || `drink-${i}`,
      name: d.name || "名称未登録",
      category: d.category || "その他",
      icon: d.icon || "◇",
      image: d.image || "",
      glass: d.glass || "要登録",
      ingredients: Array.isArray(d.ingredients) ? d.ingredients : [],
      steps: Array.isArray(d.steps) ? d.steps : [],
      standard: Array.isArray(d.standard) ? d.standard : [],
      note: d.note || ""
    })) : clone(defaultConfig.drinks),
    glasses: Array.isArray(value.glasses) ? value.glasses.map((g, i) => ({
      id: g.id || `glass-${i}`,
      name: g.name || "名称未登録",
      icon: g.icon || "◇",
      image: g.image || "",
      use: g.use || "要登録",
      location: g.location || "要登録",
      handling: g.handling || "",
      reject: g.reject || ""
    })) : clone(defaultConfig.glasses)
  };
}

function mediaHtml(item, className = "glass-visual") {
  return `<span class="${className}">${item.image ? `<img src="${esc(item.image)}" alt="${esc(item.name)}">` : esc(item.icon || "◇")}</span>`;
}

function formatDate() {
  return new Intl.DateTimeFormat("ja-JP", {year:"numeric",month:"long",day:"numeric",weekday:"long"}).format(new Date());
}

function formatUpdatedAt(value) {
  if (!value) return "初期データを表示しています。店主モードから最初の共有保存をしてください。";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "共有データを表示しています。";
  return `最終更新：${new Intl.DateTimeFormat("ja-JP", {month:"numeric",day:"numeric",hour:"2-digit",minute:"2-digit"}).format(date)}`;
}

function setSyncStatus(status, label) {
  $("syncBtn").classList.remove("synced", "error");
  if (status === "synced") $("syncBtn").classList.add("synced");
  if (status === "error") $("syncBtn").classList.add("error");
  $("syncLabel").textContent = label;
}

function showToast(message) {
  clearTimeout(toastTimer);
  $("toast").textContent = message;
  $("toast").classList.add("show");
  toastTimer = setTimeout(() => $("toast").classList.remove("show"), 2600);
}

async function loadSharedConfig(showMessage = false) {
  setSyncStatus("loading", "更新中");
  try {
    const response = await fetch(`/api/standard/config?ts=${Date.now()}`, {cache:"no-store"});
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "共有データを取得できませんでした。");
    config = normalizeConfig(result.config || defaultConfig);
    localStorage.setItem("amoretto-standard-cache", JSON.stringify(config));
    renderAll();
    setSyncStatus("synced", "共有済");
    if (showMessage) showToast("最新の共有内容に更新しました。");
  } catch (error) {
    const cached = localStorage.getItem("amoretto-standard-cache");
    if (cached) {
      try { config = normalizeConfig(JSON.parse(cached)); } catch { config = clone(defaultConfig); }
    }
    renderAll();
    setSyncStatus("error", "端末版");
    if (showMessage) showToast(error.message || "共有データを取得できませんでした。");
  }
}

function renderAll() {
  $("todayQuote").textContent = config.quote;
  $("ownerNotice").textContent = config.notice;
  $("updatedAt").textContent = formatUpdatedAt(config.updatedAt);
  $("drinkCount").textContent = `${config.drinks.length}件`;
  renderDrinkFilters();
  renderDrinks();
  renderGlasses();
  renderChecks();
}

function renderScenes() {
  $("sceneList").innerHTML = scenes.map((s, i) => `<button class="list-button" data-scene="${i}"><span><strong>${esc(s.title)}</strong><br><span class="small muted">${esc(s.lead)}</span></span><span class="arrow">›</span></button>`).join("");
  document.querySelectorAll("[data-scene]").forEach((button) => button.addEventListener("click", () => openScene(Number(button.dataset.scene))));
}

function openScene(index) {
  const s = scenes[index];
  $("detailTitle").textContent = s.title;
  $("detailBody").innerHTML = `<div class="card notice"><strong>まずすること</strong><p style="margin:6px 0 0">${esc(s.lead)}</p></div><div class="detail-section"><h3>行動</h3><ol class="steps">${s.do.map((x) => `<li>${esc(x)}</li>`).join("")}</ol></div><div class="detail-section"><h3>言葉の例</h3><p>「${esc(s.say)}」</p></div><div class="detail-section"><h3>してはいけないこと</h3><ul class="steps">${s.dont.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div><div class="detail-section"><h3>店主へ確認する基準</h3><p>${esc(s.ask)}</p></div>`;
  openModal("detailModal");
}

function renderDrinkFilters() {
  const categories = ["すべて", ...new Set(config.drinks.map((d) => d.category).filter(Boolean))];
  if (!categories.includes(currentDrinkCategory)) currentDrinkCategory = "すべて";
  $("drinkFilters").innerHTML = categories.map((category) => `<button class="pill ${category === currentDrinkCategory ? "active" : ""}" data-drink-category="${esc(category)}">${esc(category)}</button>`).join("");
  document.querySelectorAll("[data-drink-category]").forEach((button) => button.addEventListener("click", () => {
    currentDrinkCategory = button.dataset.drinkCategory;
    renderDrinkFilters();
    renderDrinks();
  }));
}

function renderDrinks() {
  const query = $("drinkSearch").value.trim().toLowerCase();
  const filtered = config.drinks.filter((d) => (currentDrinkCategory === "すべて" || d.category === currentDrinkCategory) && `${d.name} ${d.glass} ${d.category}`.toLowerCase().includes(query));
  $("drinkList").innerHTML = filtered.length ? filtered.map((d) => `<button class="list-button drink-card" data-drink-id="${esc(d.id)}">${mediaHtml(d)}<span><strong>${esc(d.name)}</strong><br><span class="small muted">使用：${esc(d.glass)}</span><br><span class="badge ${d.ingredients.some((x) => String(x).includes("要確認")) ? "warn" : ""}">${d.ingredients.some((x) => String(x).includes("要確認")) ? "分量要確認" : "登録済み"}</span></span><span class="arrow">›</span></button>`).join("") : `<div class="empty">該当するドリンクがありません。</div>`;
  document.querySelectorAll("[data-drink-id]").forEach((button) => button.addEventListener("click", () => openDrink(button.dataset.drinkId)));
}

function openDrink(id) {
  const d = config.drinks.find((item) => item.id === id);
  if (!d) return;
  $("detailTitle").textContent = d.name;
  $("detailBody").innerHTML = `<div class="card"><div class="drink-card" style="grid-template-columns:72px 1fr">${mediaHtml(d)}<div><div class="small muted">使用するグラス</div><h2 style="margin:3px 0">${esc(d.glass)}</h2><div class="badge">${esc(d.category)}</div></div></div></div><div class="detail-section"><h3>材料・分量</h3><ul class="steps">${d.ingredients.length ? d.ingredients.map((x) => `<li>${esc(x)}</li>`).join("") : "<li>未登録</li>"}</ul></div><div class="detail-section"><h3>作り方</h3><ol class="steps">${d.steps.length ? d.steps.map((x) => `<li>${esc(x)}</li>`).join("") : "<li>未登録</li>"}</ol></div><div class="detail-section"><h3>仕上がりの基準</h3><ul class="steps">${d.standard.length ? d.standard.map((x) => `<li>${esc(x)}</li>`).join("") : "<li>未登録</li>"}</ul></div>${d.note ? `<div class="card notice" style="margin-top:16px"><strong>注意</strong><p style="margin:6px 0 0">${esc(d.note)}</p></div>` : ""}`;
  openModal("detailModal");
}

function renderGlasses() {
  $("glassList").innerHTML = config.glasses.length ? config.glasses.map((g) => `<button class="list-button drink-card" data-glass-id="${esc(g.id)}">${mediaHtml(g)}<span><strong>${esc(g.name)}</strong><br><span class="small muted">${esc(g.use)}</span></span><span class="arrow">›</span></button>`).join("") : `<div class="empty">グラスが登録されていません。</div>`;
  document.querySelectorAll("[data-glass-id]").forEach((button) => button.addEventListener("click", () => openGlass(button.dataset.glassId)));
}

function openGlass(id) {
  const g = config.glasses.find((item) => item.id === id);
  if (!g) return;
  $("detailTitle").textContent = g.name;
  $("detailBody").innerHTML = `<div class="card"><div class="drink-card" style="grid-template-columns:72px 1fr">${mediaHtml(g)}<div><div class="small muted">使用するドリンク</div><h2 style="margin:3px 0">${esc(g.use)}</h2></div></div></div><div class="detail-section"><h3>保管場所</h3><p>${esc(g.location)}</p></div><div class="detail-section"><h3>持ち方・提供</h3><p>${esc(g.handling)}</p></div><div class="detail-section"><h3>使用しない状態</h3><p>${esc(g.reject)}</p></div>`;
  openModal("detailModal");
}

function checkKey(tab) {
  return `amoretto-check-${new Date().toISOString().slice(0, 10)}-${tab}`;
}
function getChecks(tab) { return JSON.parse(localStorage.getItem(checkKey(tab)) || "[]"); }
function saveChecks(tab, value) { localStorage.setItem(checkKey(tab), JSON.stringify(value)); }

function renderCheckTabs() {
  $("checkTabs").innerHTML = Object.keys(checkData).map((tab) => `<button class="pill ${tab === currentCheckTab ? "active" : ""}" data-check-tab="${tab}">${tab}</button>`).join("");
  document.querySelectorAll("[data-check-tab]").forEach((button) => button.addEventListener("click", () => {
    currentCheckTab = button.dataset.checkTab;
    renderCheckTabs();
    renderChecks();
  }));
}

function renderChecks() {
  const items = checkData[currentCheckTab];
  const checked = getChecks(currentCheckTab);
  $("checkTitle").textContent = currentCheckTab;
  $("checkList").innerHTML = items.map((item, index) => `<label class="check-item"><input type="checkbox" data-check-index="${index}" ${checked.includes(index) ? "checked" : ""}><span>${esc(item)}</span></label>`).join("");
  document.querySelectorAll("[data-check-index]").forEach((input) => input.addEventListener("change", () => {
    let values = getChecks(currentCheckTab);
    const index = Number(input.dataset.checkIndex);
    if (input.checked && !values.includes(index)) values.push(index);
    if (!input.checked) values = values.filter((value) => value !== index);
    saveChecks(currentCheckTab, values);
    renderChecks();
  }));
  const done = checked.length;
  $("checkProgressText").textContent = `${done}／${items.length} 完了`;
  $("checkProgressBar").style.width = `${done / items.length * 100}%`;
  if (currentCheckTab === "開店前") $("todayCheckCount").textContent = `${done}／${items.length}`;
}

function renderLessons() {
  $("lessonList").innerHTML = lessons.map((lesson, index) => `<button class="list-button lesson" data-lesson="${index}"><span><span class="eyebrow">${esc(lesson[0])}</span><strong>${esc(lesson[1])}</strong><br><span class="small muted">${esc(lesson[2])}</span></span><span class="arrow">›</span></button>`).join("");
  document.querySelectorAll("[data-lesson]").forEach((button) => button.addEventListener("click", () => openLesson(Number(button.dataset.lesson))));
}

function openLesson(index) {
  const lesson = lessons[index];
  const bodies = [
    ["AMORÉTTOの仕事は、料理を運ぶことだけではありません。店内の静けさ、言葉、姿勢、料理の間合いまで含めて、お客様の時間を整えます。",["料理だけを見るのではなく、テーブル全体を見る","目立つ接客より、必要なときに外さない接客","迷ったときは店の基準に戻る"]],
    ["清潔さは技術より先に見られます。服装、髪、手元、靴、姿勢を整え、慌ただしさをお客様へ見せません。",["飲み口に触れない","音を立てすぎない","立つ位置と視線を意識する"]],
    ["お迎えは最初の安心をつくります。作業を止め、顔を上げ、お客様を待たせたままにしません。",["予約名と人数を確認","荷物と席を案内","注意事項を厨房と共有"]],
    ["料理名を理解し、置く場所、向き、言葉を統一します。分からない料理は、提供前に必ず確認します。",["提供前にテーブルを整える","料理名を短く正確に伝える","ドリンクとグラスを再確認"]],
    ["呼ばれてから動くのではなく、表情、手元、グラス、料理の進みから必要なことを読み取ります。",["会話を邪魔しない","視線を送りすぎない","必要な瞬間だけ静かに近づく"]],
    ["報告は短く、事実から伝えます。推測を混ぜず、誰が・何を・いつ・どうしたかを整理します。",["予約名と席番号を入れる","お客様の言葉を勝手に変えない","違和感は小さいうちに共有"]],
    ["安全、料金、予約、アレルギー、苦情は、一人で決めません。確認することは弱さではなく、店を守る行動です。",["『確認してまいります』と言える","分からないまま答えない","勝手な約束をしない"]]
  ];
  const [intro, points] = bodies[index];
  $("detailTitle").textContent = `${lesson[0]}｜${lesson[1]}`;
  $("detailBody").innerHTML = `<p>${esc(intro)}</p><div class="detail-section"><h3>今日の確認</h3><ul class="steps">${points.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div><div class="card notice" style="margin-top:16px"><strong>確認問題</strong><p style="margin:6px 0 0">迷ったときに、自己判断せず確認すべきことを一つ挙げてください。</p></div>`;
  openModal("detailModal");
}

function openModal(id) { $(id).classList.add("open"); }
function closeModal(id) { $(id).classList.remove("open"); }
function closeAllModals() { document.querySelectorAll(".modal").forEach((modal) => modal.classList.remove("open")); }

function renderAdminLists() {
  $("adminDrinkList").innerHTML = draftConfig.drinks.length ? draftConfig.drinks.map((item) => `<div class="admin-item">${mediaHtml(item, "admin-thumb")}<div><strong>${esc(item.name)}</strong><br><span class="small muted">${esc(item.category)}／${esc(item.glass)}</span></div><button class="admin-edit" data-edit-drink="${esc(item.id)}">編集</button></div>`).join("") : `<div class="empty">ドリンクがありません。</div>`;
  $("adminGlassList").innerHTML = draftConfig.glasses.length ? draftConfig.glasses.map((item) => `<div class="admin-item">${mediaHtml(item, "admin-thumb")}<div><strong>${esc(item.name)}</strong><br><span class="small muted">${esc(item.use)}</span></div><button class="admin-edit" data-edit-glass="${esc(item.id)}">編集</button></div>`).join("") : `<div class="empty">グラスがありません。</div>`;
  document.querySelectorAll("[data-edit-drink]").forEach((button) => button.addEventListener("click", () => openItemEditor("drink", button.dataset.editDrink)));
  document.querySelectorAll("[data-edit-glass]").forEach((button) => button.addEventListener("click", () => openItemEditor("glass", button.dataset.editGlass)));
}

function openOwner() {
  draftConfig = clone(config);
  $("quoteInput").value = draftConfig.quote;
  $("noticeInput").value = draftConfig.notice;
  $("ownerPassword").value = sessionStorage.getItem("amoretto-owner-password") || "";
  $("ownerMessage").textContent = "";
  renderAdminLists();
  openModal("ownerModal");
}

function markDraftChanged() {
  $("ownerMessage").textContent = "未保存の変更があります。";
}

function openItemEditor(type, id = "") {
  editingType = type;
  editingId = id;
  selectedImageFile = null;
  const isDrink = type === "drink";
  const list = isDrink ? draftConfig.drinks : draftConfig.glasses;
  const item = list.find((entry) => entry.id === id) || (isDrink
    ? {id:"",name:"",category:"",icon:"",image:"",glass:"",ingredients:[],steps:[],standard:[],note:""}
    : {id:"",name:"",icon:"",image:"",use:"",location:"",handling:"",reject:""});

  $("itemEyebrow").textContent = isDrink ? "Drink" : "Glass";
  $("itemTitle").textContent = `${isDrink ? "ドリンク" : "グラス"}を${id ? "編集" : "追加"}`;
  $("itemId").value = item.id;
  $("itemType").value = type;
  $("itemName").value = item.name || "";
  $("itemIcon").value = item.icon || "";
  $("itemImageUrl").value = item.image || "";
  $("itemImageFile").value = "";
  $("drinkFields").style.display = isDrink ? "block" : "none";
  $("glassFields").style.display = isDrink ? "none" : "block";
  $("deleteItem").style.visibility = id ? "visible" : "hidden";

  if (isDrink) {
    $("itemCategory").value = item.category || "";
    $("itemGlass").value = item.glass || "";
    $("itemIngredients").value = (item.ingredients || []).join("\n");
    $("itemSteps").value = (item.steps || []).join("\n");
    $("itemStandard").value = (item.standard || []).join("\n");
    $("itemNote").value = item.note || "";
  } else {
    $("itemUse").value = item.use || "";
    $("itemLocation").value = item.location || "";
    $("itemHandling").value = item.handling || "";
    $("itemReject").value = item.reject || "";
  }
  updateImagePreview(item.image || "");
  openModal("itemModal");
}

function updateImagePreview(url, objectUrl = false) {
  const preview = $("itemImagePreview");
  if (!url) {
    preview.className = "image-preview empty-preview";
    preview.textContent = "写真なし";
    return;
  }
  preview.className = "image-preview";
  preview.innerHTML = `<img src="${esc(url)}" alt="登録写真">`;
  if (objectUrl) preview.dataset.objectUrl = url;
}

async function uploadSelectedImage(password) {
  if (!selectedImageFile) return $("itemImageUrl").value;
  const formData = new FormData();
  formData.append("password", password);
  formData.append("file", selectedImageFile);
  const response = await fetch("/api/standard/image", {method:"POST",body:formData});
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "画像を保存できませんでした。");
  return result.url;
}

async function saveEditedItem() {
  const name = $("itemName").value.trim();
  if (!name) return showToast("名称を入力してください。");
  const password = $("ownerPassword").value;
  $("saveItem").disabled = true;
  $("saveItem").textContent = selectedImageFile ? "写真を保存中…" : "反映中…";
  try {
    const image = await uploadSelectedImage(password);
    const id = editingId || `${editingType}-${Date.now()}`;
    let item;
    if (editingType === "drink") {
      item = {id,name,icon:$("itemIcon").value.trim() || "◇",image,category:$("itemCategory").value.trim() || "その他",glass:$("itemGlass").value.trim() || "要登録",ingredients:lines($("itemIngredients").value),steps:lines($("itemSteps").value),standard:lines($("itemStandard").value),note:$("itemNote").value.trim()};
      const index = draftConfig.drinks.findIndex((entry) => entry.id === id);
      if (index >= 0) draftConfig.drinks[index] = item; else draftConfig.drinks.push(item);
    } else {
      item = {id,name,icon:$("itemIcon").value.trim() || "◇",image,use:$("itemUse").value.trim() || "要登録",location:$("itemLocation").value.trim() || "要登録",handling:$("itemHandling").value.trim(),reject:$("itemReject").value.trim()};
      const index = draftConfig.glasses.findIndex((entry) => entry.id === id);
      if (index >= 0) draftConfig.glasses[index] = item; else draftConfig.glasses.push(item);
    }
    renderAdminLists();
    markDraftChanged();
    closeModal("itemModal");
  } catch (error) {
    showToast(error.message || "登録に失敗しました。");
  } finally {
    $("saveItem").disabled = false;
    $("saveItem").textContent = "登録内容に反映";
  }
}

function deleteEditedItem() {
  if (!editingId) return;
  if (!window.confirm("この項目を削除しますか？")) return;
  if (editingType === "drink") draftConfig.drinks = draftConfig.drinks.filter((item) => item.id !== editingId);
  else draftConfig.glasses = draftConfig.glasses.filter((item) => item.id !== editingId);
  renderAdminLists();
  markDraftChanged();
  closeModal("itemModal");
}

async function saveSharedConfig() {
  const password = $("ownerPassword").value;
  if (!password) return showToast("店主パスワードを入力してください。");
  draftConfig.quote = $("quoteInput").value.trim() || defaultConfig.quote;
  draftConfig.notice = $("noticeInput").value.trim();
  $("saveOwnerContent").disabled = true;
  $("saveOwnerContent").textContent = "全スタッフへ保存中…";
  $("ownerMessage").textContent = "共有データを更新しています。";
  try {
    const response = await fetch("/api/standard/config", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({password,config:draftConfig})});
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "保存できませんでした。");
    config = normalizeConfig(result.config);
    localStorage.setItem("amoretto-standard-cache", JSON.stringify(config));
    renderAll();
    setSyncStatus("synced", "共有済");
    sessionStorage.setItem("amoretto-owner-password", password);
    closeModal("ownerModal");
    showToast("全スタッフへ共有保存しました。");
  } catch (error) {
    $("ownerMessage").textContent = error.message || "保存できませんでした。";
    showToast(error.message || "保存できませんでした。");
  } finally {
    $("saveOwnerContent").disabled = false;
    $("saveOwnerContent").textContent = "全スタッフへ保存";
  }
}

function setupInstall() {
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  if (isStandalone) return;
  $("installCard").classList.add("show");
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  if (isIOS) {
    $("installBtn").textContent = "手順を見る";
    $("installHelp").textContent = "共有ボタンから「ホーム画面に追加」を選びます。";
    $("installBtn").addEventListener("click", () => alert("Safari下部の共有ボタンを押し、「ホーム画面に追加」を選んでください。"));
  } else {
    $("installBtn").addEventListener("click", async () => {
      if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        await deferredInstallPrompt.userChoice;
        deferredInstallPrompt = null;
        $("installCard").classList.remove("show");
      } else {
        alert("Chrome右上の︙から「アプリをインストール」または「ホーム画面に追加」を選んでください。");
      }
    });
  }
}

function bindEvents() {
  document.querySelectorAll(".nav-btn").forEach((button) => button.addEventListener("click", () => {
    document.querySelectorAll(".nav-btn").forEach((item) => item.classList.remove("active"));
    document.querySelectorAll(".screen").forEach((screen) => screen.classList.remove("active"));
    button.classList.add("active");
    $(button.dataset.screen).classList.add("active");
    window.scrollTo({top:0,behavior:"smooth"});
  }));
  document.querySelectorAll("[data-close]").forEach((button) => button.addEventListener("click", closeAllModals));
  document.querySelectorAll("[data-close-item]").forEach((button) => button.addEventListener("click", () => closeModal("itemModal")));
  document.querySelectorAll(".modal").forEach((modal) => modal.addEventListener("click", (event) => { if (event.target === modal) closeModal(modal.id); }));
  $("drinkSearch").addEventListener("input", renderDrinks);
  $("resetChecks").addEventListener("click", () => { localStorage.removeItem(checkKey(currentCheckTab)); renderChecks(); });
  $("ownerBtn").addEventListener("click", openOwner);
  $("syncBtn").addEventListener("click", () => loadSharedConfig(true));
  $("rememberPassword").addEventListener("click", () => {
    const password = $("ownerPassword").value;
    if (!password) return showToast("パスワードを入力してください。");
    sessionStorage.setItem("amoretto-owner-password", password);
    showToast("この画面を閉じるまで記憶しました。");
  });
  document.querySelectorAll("[data-admin-tab]").forEach((button) => button.addEventListener("click", () => {
    document.querySelectorAll("[data-admin-tab]").forEach((item) => item.classList.remove("active"));
    document.querySelectorAll(".admin-panel").forEach((panel) => panel.classList.remove("active"));
    button.classList.add("active");
    $(button.dataset.adminTab).classList.add("active");
  }));
  $("quoteInput").addEventListener("input", markDraftChanged);
  $("noticeInput").addEventListener("input", markDraftChanged);
  $("addDrinkBtn").addEventListener("click", () => openItemEditor("drink"));
  $("addGlassBtn").addEventListener("click", () => openItemEditor("glass"));
  $("itemImageFile").addEventListener("change", () => {
    selectedImageFile = $("itemImageFile").files?.[0] || null;
    if (selectedImageFile) updateImagePreview(URL.createObjectURL(selectedImageFile), true);
    else updateImagePreview($("itemImageUrl").value);
  });
  $("saveItem").addEventListener("click", saveEditedItem);
  $("deleteItem").addEventListener("click", deleteEditedItem);
  $("saveOwnerContent").addEventListener("click", saveSharedConfig);

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    $("installCard").classList.add("show");
  });
  window.addEventListener("appinstalled", () => $("installCard").classList.remove("show"));
}

$("todayDate").textContent = formatDate();
renderScenes();
renderCheckTabs();
renderLessons();
bindEvents();
setupInstall();
loadSharedConfig();
