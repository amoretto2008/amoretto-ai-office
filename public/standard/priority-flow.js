(function(){
  "use strict";

  const FILTER_KEY="amoretto-standard-priority-filter";
  const PRIORITY_ORDER=["urgent","today","info"];
  const LABELS={urgent:"最優先",today:"今日中",info:"確認のみ"};
  let renderTimer=null;
  let anchorSequence=0;
  let lastUrgentSignature="";

  const byId=(value)=>document.getElementById(value);
  const escapeHtml=(value)=>String(value??"").replace(/[&<>'"]/g,(char)=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));
  const cleanText=(value)=>String(value||"").replace(/\s+/g," ").trim();
  const todayKey=()=>{
    const now=new Date();
    return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
  };
  const cssEscape=(value)=>window.CSS?.escape?window.CSS.escape(String(value)):String(value).replace(/["\\]/g,"\\$&");

  function loadFilter(){
    const raw=localStorage.getItem(FILTER_KEY);
    if(!raw)return {date:todayKey(),filter:"all"};
    try{
      const parsed=JSON.parse(raw);
      if(parsed?.date===todayKey()&&["all",...PRIORITY_ORDER].includes(parsed.filter))return parsed;
    }catch{
      // 旧形式の保存値は営業日を特定できないため、安全のため引き継がない。
    }
    return {date:todayKey(),filter:"all"};
  }

  let filterState=loadFilter();
  let selectedFilter=filterState.filter;

  function persistFilter(){
    filterState={date:todayKey(),filter:selectedFilter};
    localStorage.setItem(FILTER_KEY,JSON.stringify(filterState));
  }

  function ensureCurrentDate(){
    const current=todayKey();
    if(filterState.date===current)return;
    filterState={date:current,filter:"all"};
    selectedFilter="all";
    lastUrgentSignature="";
    persistFilter();
  }

  function injectStyles(){
    if(byId("priorityFlowStyles"))return;
    const style=document.createElement("style");
    style.id="priorityFlowStyles";
    style.textContent=`
      .ops-priority-card{border-left:4px solid var(--deep);background:#fbfaf7}
      .ops-priority-filter{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:12px 0}
      .ops-priority-filter button{border:1px solid var(--line);border-radius:10px;background:white;color:var(--ink);padding:8px 5px;font-size:10px;font-weight:800}
      .ops-priority-filter button.active{background:var(--deep);border-color:var(--deep);color:white}
      .ops-priority-filter small{display:block;font-size:9px;font-weight:600;opacity:.82;margin-top:2px}
      .ops-priority-section{margin-top:12px}
      .ops-priority-heading{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px}
      .ops-priority-heading strong{font-size:12px}
      .ops-priority-list{display:grid;gap:6px}
      .ops-priority-item{width:100%;display:flex;align-items:flex-start;justify-content:space-between;gap:9px;text-align:left;border:1px solid var(--line);border-radius:11px;padding:10px;background:white;color:var(--ink)}
      .ops-priority-item>span:first-child{min-width:0}
      .ops-priority-item strong,.ops-priority-item small{display:block}
      .ops-priority-item strong{font-size:12px}
      .ops-priority-item small{font-size:10px;color:var(--muted);margin-top:3px;line-height:1.45}
      .ops-priority-item.urgent{background:#fff0ee;border-color:#e1b8b2}
      .ops-priority-item.today{background:#fff8ee;border-color:#e0c4aa}
      .ops-priority-item.info{background:#f7f3ed}
      .ops-priority-mark{flex:0 0 auto;border-radius:999px;padding:3px 7px;font-size:9px;font-weight:800;background:white;border:1px solid var(--line)}
      .ops-priority-empty{font-size:11px;color:var(--muted);padding:8px 0}
      .ops-priority-highlight{outline:3px solid rgba(115,70,75,.24);outline-offset:3px;transition:outline .2s ease}
      @media(max-width:390px){.ops-priority-filter{grid-template-columns:1fr 1fr}}
    `;
    document.head.appendChild(style);
  }

  function ensureCard(){
    const block=byId("operationsTodayBlock");
    if(!block)return null;
    let card=byId("opsPriorityCard");
    if(card)return card;
    card=document.createElement("div");
    card.className="card ops-priority-card";
    card.id="opsPriorityCard";
    card.innerHTML=`<div class="ops-card-title"><div><div class="eyebrow">Priority</div><h3>今日の優先確認</h3></div><span class="ops-count" id="opsPriorityTotal">0件</span></div><p class="small muted no-bottom">急ぐことと、確認だけでよいことを分けて表示します。</p><div class="ops-priority-filter" id="opsPriorityFilter"></div><div id="opsPriorityBody"></div>`;
    block.insertBefore(card,block.firstChild);
    card.addEventListener("click",handleCardClick);
    return card;
  }

  function sourceAnchor(element){
    if(!element)return "";
    if(!element.dataset.opsPriorityAnchor){
      anchorSequence+=1;
      element.dataset.opsPriorityAnchor=`ops-priority-source-${anchorSequence}`;
    }
    return element.dataset.opsPriorityAnchor;
  }

  function addItem(items,priority,title,detail,element){
    items.push({priority,title:cleanText(title),detail:cleanText(detail),anchor:sourceAnchor(element)});
  }

  function reservationItems(items){
    document.querySelectorAll("#todayReservationList .ops-reservation").forEach((card)=>{
      const title=cleanText(card.querySelector(".ops-reservation-top strong")?.textContent)||"予約確認";
      const text=cleanText(card.textContent);
      const reasons=[];
      if(card.classList.contains("ops-important")||/アレルギー\s*未確認/.test(text))reasons.push("アレルギー未確認");
      if(/退店\s*要確認/.test(text))reasons.push("同伴の退店希望時刻が未確認");
      if(/ケーキ\s*(未確認|購入必要)/.test(text))reasons.push("ケーキの確認が必要");
      if(/花束\s*(未確認|購入必要)/.test(text))reasons.push("花束の確認が必要");
      const unchecked=[...card.querySelectorAll('input[type="checkbox"]')].filter((input)=>!input.checked).length;
      if(unchecked)reasons.push(`記念日準備 ${unchecked}項目未完了`);
      if(reasons.length)addItem(items,"urgent",title,reasons.join("／"),card);
      else addItem(items,"info",title,"予約内容は登録済みです。営業前に確認してください。",card);
    });
  }

  function inventoryItems(items){
    const card=byId("inventoryAlertCard");
    if(!card||card.classList.contains("hidden"))return;
    card.querySelectorAll(".ops-alert").forEach((row)=>{
      const title=cleanText(row.querySelector("strong")?.textContent)||"在庫確認";
      const detail=cleanText(row.querySelector(".small")?.textContent)||"在庫状態を確認";
      const urgent=Boolean(row.querySelector(".ops-urgent"));
      addItem(items,urgent?"urgent":"today",title,detail,row);
    });
  }

  function updateItems(items){
    const card=byId("importantUpdateCard");
    if(!card||card.classList.contains("hidden"))return;
    card.querySelectorAll(".ops-update").forEach((row)=>{
      const title=cleanText(row.querySelector("strong")?.textContent)||"重要な基準変更";
      addItem(items,"today",title,"正本を確認し、「確認しました」を記録してください。",row);
    });
  }

  function parseMinutes(text){
    const match=String(text||"").match(/^(\d{1,2}):(\d{2})$/);
    if(!match)return null;
    return Number(match[1])*60+Number(match[2]);
  }

  function timelineItem(items){
    const rows=[...document.querySelectorAll("#todayTimeline .ops-timeline-row")];
    if(!rows.length)return;
    const now=new Date();
    const current=now.getHours()*60+now.getMinutes();
    const timed=rows
      .map((row)=>({row,minutes:parseMinutes(cleanText(row.querySelector(".ops-timeline-time")?.textContent))}))
      .filter((entry)=>entry.minutes!==null&&entry.minutes>=current);
    const next=timed[0];
    if(next){
      const time=cleanText(next.row.querySelector(".ops-timeline-time")?.textContent);
      const title=cleanText(next.row.querySelector("strong")?.textContent)||"営業タイムライン";
      const detail=cleanText(next.row.querySelector(".small")?.textContent);
      addItem(items,"today",`${time}　${title}`,detail,next.row);
      return;
    }
    const closing=rows.find((row)=>/閉店チェック/.test(cleanText(row.textContent)));
    if(closing)addItem(items,"today","退店後　閉店チェック","本日の時刻付き予定は終了しています。最終退店後に確認してください。",closing);
  }

  function collectItems(){
    const items=[];
    reservationItems(items);
    inventoryItems(items);
    updateItems(items);
    timelineItem(items);
    return items;
  }

  function renderFilters(items){
    const target=byId("opsPriorityFilter");
    if(!target)return;
    const counts={urgent:0,today:0,info:0};
    items.forEach((item)=>{counts[item.priority]+=1;});
    if(!["all",...PRIORITY_ORDER].includes(selectedFilter))selectedFilter="all";
    const buttons=[{key:"all",label:"すべて",count:items.length},...PRIORITY_ORDER.map((key)=>({key,label:LABELS[key],count:counts[key]}))];
    target.innerHTML=buttons.map((button)=>`<button type="button" class="${selectedFilter===button.key?"active":""}" data-priority-filter="${button.key}">${escapeHtml(button.label)}<small>${button.count}件</small></button>`).join("");
  }

  function renderBody(items){
    const target=byId("opsPriorityBody");
    if(!target)return;
    if(!items.length){
      target.innerHTML='<div class="ops-priority-empty">現在、確認事項はありません。営業情報が登録されると表示します。</div>';
      return;
    }
    const priorities=selectedFilter==="all"?PRIORITY_ORDER:[selectedFilter];
    const sections=priorities.map((priority)=>{
      const filtered=items.filter((item)=>item.priority===priority);
      if(!filtered.length)return "";
      return `<div class="ops-priority-section"><div class="ops-priority-heading"><strong>${escapeHtml(LABELS[priority])}</strong><span class="small muted">${filtered.length}件</span></div><div class="ops-priority-list">${filtered.map((item)=>`<button type="button" class="ops-priority-item ${priority}" data-priority-anchor="${escapeHtml(item.anchor)}"><span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.detail)}</small></span><span class="ops-priority-mark">${escapeHtml(LABELS[priority])}</span></button>`).join("")}</div></div>`;
    }).join("");
    target.innerHTML=sections||'<div class="ops-priority-empty">この重要度の項目はありません。</div>';
  }

  function render(){
    ensureCurrentDate();
    if(!ensureCard())return;
    const items=collectItems();
    const urgentSignature=items.filter((item)=>item.priority==="urgent").map((item)=>`${item.title}|${item.detail}`).join("||");
    if(urgentSignature&&urgentSignature!==lastUrgentSignature&&!['all','urgent'].includes(selectedFilter)){
      selectedFilter="urgent";
      persistFilter();
    }
    lastUrgentSignature=urgentSignature;
    byId("opsPriorityTotal").textContent=`${items.length}件`;
    renderFilters(items);
    renderBody(items);
  }

  function handleCardClick(event){
    const filter=event.target.closest("[data-priority-filter]");
    if(filter){
      selectedFilter=filter.dataset.priorityFilter;
      persistFilter();
      render();
      return;
    }
    const item=event.target.closest("[data-priority-anchor]");
    if(!item)return;
    const source=document.querySelector(`[data-ops-priority-anchor="${cssEscape(item.dataset.priorityAnchor)}"]`);
    if(!source)return;
    source.scrollIntoView({behavior:"smooth",block:"center"});
    source.classList.add("ops-priority-highlight");
    setTimeout(()=>source.classList.remove("ops-priority-highlight"),1800);
  }

  function scheduleRender(){
    clearTimeout(renderTimer);
    renderTimer=setTimeout(render,80);
  }

  function watch(block){
    const observer=new MutationObserver((mutations)=>{
      const relevant=mutations.some((mutation)=>{
        const element=mutation.target.nodeType===1?mutation.target:mutation.target.parentElement;
        return !element?.closest?.("#opsPriorityCard");
      });
      if(relevant)scheduleRender();
    });
    observer.observe(block,{childList:true,subtree:true,attributes:true,attributeFilter:["class"]});
  }

  function start(){
    injectStyles();
    const tryStart=()=>{
      const block=byId("operationsTodayBlock");
      if(!block){setTimeout(tryStart,80);return;}
      ensureCard();
      render();
      watch(block);
      window.addEventListener("online",scheduleRender);
      document.addEventListener("visibilitychange",()=>{if(!document.hidden)scheduleRender();});
      setInterval(scheduleRender,60*1000);
    };
    tryStart();
  }

  start();
})();