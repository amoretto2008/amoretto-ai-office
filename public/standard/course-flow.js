(function(){
  const FLOW_STEPS=[
    {label:"ご来店",terms:["ご来店"]},
    {label:"注文確認",terms:["メニュー確認","注文確認"]},
    {label:"焼き霜降り",terms:["牛肉の焼き霜降り","焼き霜降り"]},
    {label:"フォアグラ",terms:["フォアグラ"]},
    {label:"スープ",terms:["スープ・パン","スープ"]},
    {label:"あわび",terms:["あわび"]},
    {label:"焼き野菜",terms:["焼き野菜"]},
    {label:"お肉",terms:["お肉"]},
    {label:"ガーリックライス",terms:["ガーリックライス"]},
    {label:"デザート",terms:["デザート"],exclude:["前","準備","片付け"]},
    {label:"お見送り",terms:["お見送り"]}
  ];

  function addStyles(){
    if(document.getElementById("courseFlowStyles"))return;
    const style=document.createElement("style");
    style.id="courseFlowStyles";
    style.textContent=`
      .course-flow-card{background:#f8f4ee;border:1px solid var(--line);border-radius:18px;padding:15px;margin:14px 0 12px}
      .course-flow-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:10px}
      .course-flow-head h2{margin-bottom:0}
      .course-flow-row{display:flex;align-items:center;gap:6px;overflow-x:auto;padding:2px 1px 8px;scrollbar-width:none;overscroll-behavior-inline:contain}
      .course-flow-row::-webkit-scrollbar{display:none}
      .course-flow-step{flex:0 0 auto;border:1px solid var(--line);background:white;color:var(--ink);border-radius:999px;padding:9px 12px;font-size:12px;font-weight:700;white-space:nowrap;box-shadow:0 2px 8px rgba(31,42,38,.04)}
      .course-flow-step:active{background:var(--accent-soft);border-color:#d8bbc1}
      .course-flow-step:focus-visible{outline:3px solid rgba(127,47,61,.22);outline-offset:2px}
      .course-flow-arrow{flex:0 0 auto;color:#9a948b;font-size:18px;line-height:1}
      .course-flow-note{margin:2px 0 0;line-height:1.6}
    `;
    document.head.appendChild(style);
  }

  function findScene(step,scenes){
    const candidates=scenes.filter((scene)=>{
      const title=String(scene.title||"");
      const included=step.terms.some((term)=>title.includes(term));
      const excluded=(step.exclude||[]).some((term)=>title.includes(term));
      return included&&!excluded;
    });
    return candidates[0]||null;
  }

  function renderCourseFlow(){
    const filters=document.getElementById("sceneFilters");
    if(!filters||typeof config==="undefined"||!Array.isArray(config.scenes))return;
    let card=document.getElementById("courseFlowNav");
    if(!card){
      card=document.createElement("section");
      card.id="courseFlowNav";
      card.className="course-flow-card";
      card.setAttribute("aria-label","基本コースの流れ");
      filters.parentNode.insertBefore(card,filters);
    }

    const scenes=config.scenes.filter((scene)=>scene&&scene.active!==false);
    const matched=FLOW_STEPS.map((step)=>({step,scene:findScene(step,scenes)})).filter((item)=>item.scene);
    card.replaceChildren();

    const head=document.createElement("div");
    head.className="course-flow-head";
    head.innerHTML='<div><div class="eyebrow">Course guide</div><h2>基本コースの流れ</h2></div><span class="badge">押すだけ</span>';
    card.appendChild(head);

    const row=document.createElement("div");
    row.className="course-flow-row";
    matched.forEach((item,index)=>{
      if(index){
        const arrow=document.createElement("span");
        arrow.className="course-flow-arrow";
        arrow.setAttribute("aria-hidden","true");
        arrow.textContent="›";
        row.appendChild(arrow);
      }
      const button=document.createElement("button");
      button.type="button";
      button.className="course-flow-step";
      button.textContent=item.step.label;
      button.setAttribute("aria-label",`${item.step.label}のマニュアルを開く`);
      button.addEventListener("click",()=>window.openItem&&window.openItem("scene",item.scene.id));
      row.appendChild(button);
    });
    card.appendChild(row);

    const note=document.createElement("p");
    note.className="small muted course-flow-note";
    note.textContent="現在位置は記録しません。確認したい料理名を押すと、登録済みマニュアルが開きます。";
    card.appendChild(note);
  }

  addStyles();
  const originalRenderScenes=window.renderScenes;
  if(typeof originalRenderScenes==="function"){
    window.renderScenes=function(){
      originalRenderScenes();
      renderCourseFlow();
    };
  }
  setTimeout(renderCourseFlow,0);
})();
