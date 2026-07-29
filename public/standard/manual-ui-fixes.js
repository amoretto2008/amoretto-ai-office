(function(){
  function isChecklistHeading(item) {
    const text = String(item && item.text || "").trim();
    return Boolean(item && item.required === false && /^【.+】$/.test(text));
  }

  function actionableItems(list) {
    return (list && Array.isArray(list.items) ? list.items : []).filter((item) => !isChecklistHeading(item));
  }

  openSceneDetail = function(s) {
    $("detailTitle").textContent = s.title;
    const say = String(s.say || "").trim();
    const saySection = say
      ? `<div class="detail-section"><h3>言葉の例</h3><div class="quote-box">「${esc(say)}」</div></div>`
      : "";
    $("detailBody").innerHTML = `${detailHeader("scene",s)}<div class="card notice"><strong>まずすること</strong><p class="no-bottom" style="margin-top:6px">${esc(s.lead)}</p></div><div class="detail-section"><h3>行動</h3><ol class="steps">${s.do.map((x)=>`<li>${esc(x)}</li>`).join("")}</ol></div>${saySection}<div class="detail-section"><h3>してはいけないこと</h3><ul class="steps">${s.dont.map((x)=>`<li>${esc(x)}</li>`).join("")}</ul></div><div class="detail-section"><h3>店主へ確認する基準</h3><p>${esc(s.ask)}</p></div>${relatedNoteButton("scene",s)}`;
    openModal("detailModal");
  };

  renderChecks = function() {
    const lists = activeItems(config.checklists);
    if (!lists.some((x) => x.id === currentChecklistId)) currentChecklistId = lists[0]?.id || "";
    $("checkTabs").innerHTML = lists.map((l)=>`<button class="pill ${l.id===currentChecklistId?"active":""}" onclick="setChecklist('${esc(l.id)}')">${esc(l.title)}</button>`).join("");
    const list = lists.find((x) => x.id === currentChecklistId);
    if (!list) {
      $("checkList").innerHTML = `<div class="empty">チェックリストがありません。</div>`;
      return;
    }

    const checked = getCheckState(list.id);
    const items = actionableItems(list);
    const completedCount = items.filter((item) => checked.includes(item.id)).length;
    $("checkTitle").textContent = list.title;
    $("checkProgressText").textContent = `${completedCount}／${items.length} 完了`;
    $("checkProgressBar").style.width = `${items.length ? completedCount / items.length * 100 : 0}%`;
    $("checkList").innerHTML = list.items.map((item)=>{
      if (isChecklistHeading(item)) {
        return `<div class="check-section-heading"><strong>${esc(item.text)}</strong></div>`;
      }
      return `<label class="check-item ${checked.includes(item.id)?"completed":""}"><input type="checkbox" ${checked.includes(item.id)?"checked":""} onchange="toggleCheck('${esc(item.id)}',this.checked)"><span>${esc(item.text)}${item.required?'<span class="required-mark">必須</span>':''}</span></label>`;
    }).join("");

    const required = items.filter((x) => x.required !== false);
    const complete = required.length > 0 && required.every((x) => checked.includes(x.id));
    $("checkCompleteCard").classList.toggle("hidden", !complete);
    const memoKey = `amoretto-standard-memo:${todayKey()}`;
    $("dailyMemo").value = localStorage.getItem(memoKey) || "";
    renderCheckHistory(list);
    renderToday();
  };

  renderCheckHistory = function(list) {
    const rows = [];
    const items = actionableItems(list);
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = todayKey(d);
      const checked = getCheckState(list.id, key);
      const completedCount = items.filter((item) => checked.includes(item.id)).length;
      const pct = items.length ? Math.round(completedCount / items.length * 100) : 0;
      rows.push(`<div class="history-day"><span>${i===0?"今日":formatDate(d,{month:"numeric",day:"numeric",weekday:"short"})}</span><div class="history-bar"><span style="width:${pct}%"></span></div><strong>${pct}%</strong></div>`);
    }
    $("checkHistory").innerHTML = `<div class="card">${rows.join("")}</div>`;
  };

  if (!document.getElementById("manualUiFixStyles")) {
    const style = document.createElement("style");
    style.id = "manualUiFixStyles";
    style.textContent = ".check-section-heading{padding:18px 4px 8px}.check-section-heading:first-child{padding-top:4px}";
    document.head.appendChild(style);
  }
})();
