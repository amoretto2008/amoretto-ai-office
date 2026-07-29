(function(){
  const previousNormalizeConfig = normalizeConfig;

  normalizeConfig = function(raw) {
    const merged = previousNormalizeConfig(raw);

    const condimentScene = (merged.scenes || []).find((item) => item.id === "hall-flow-05-6-condiments");
    if (condimentScene) {
      condimentScene.do = [
        "メイン提供前に、ニンニク醤油、わさび・にんにくチップ、アンデスの岩塩を用意する",
        "置き順を確認する",
        "肉と焼き野菜に使うことを伝える"
      ];
      condimentScene.say = "こちらから順に、ニンニク醤油、わさび・にんにくチップ、アンデスの岩塩でございます。お肉と焼き野菜にお使いください。";
    }

    const garlicRiceScene = (merged.scenes || []).find((item) => item.id === "hall-observe-10-garlic-rice");
    if (garlicRiceScene) {
      garlicRiceScene.do = [
        "お客様のコース進行と厨房の状況を確認する",
        "提供タイミングと次の動きを厨房へ共有する"
      ];
      garlicRiceScene.dont = ["厨房と確認せず、自分の判断だけで提供を進めない"];
    }

    const opening = (merged.checklists || []).find((item) => item.id === "opening");
    if (opening) {
      opening.description = "営業前に上から順に確認する。";
      opening.items = [
        {id:"manual-opening-01",text:"おしぼりを裏から持ってくる（火・水・金）",required:true},
        {id:"manual-opening-01b",text:"おしぼりをウォーマーの後ろへ補充する",required:true},
        {id:"manual-opening-02",text:"看板の電気を確認する",required:true},
        {id:"manual-opening-03",text:"トイレで着替える",required:true},
        {id:"manual-opening-03b",text:"トイレの便座電源・ペーパー・ゴミ箱を確認する",required:true},
        {id:"manual-opening-04",text:"当日の予約内容を確認する",required:true},
        {id:"manual-opening-04b",text:"翌日の予約内容を確認する",required:true},
        {id:"manual-opening-05",text:"洗浄機の電源を入れる",required:true},
        {id:"manual-opening-05b",text:"ポットに水を補給し、電源を入れる",required:true},
        {id:"manual-opening-05c",text:"おしぼりウォーマーの電源を入れる",required:true},
        {id:"manual-opening-06",text:"テーブルをセットする",required:true},
        {id:"manual-opening-06b",text:"椅子を拭く",required:true},
        {id:"manual-opening-07",text:"予約札を置く",required:true},
        {id:"manual-opening-08",text:"米の合数を確認し、炊飯をセットする",required:true},
        {id:"manual-opening-09",text:"シルバーの洗浄・拭き上げを確認する",required:true},
        {id:"manual-opening-10",text:"ドリンクを補充する（ソーダを重点確認）",required:true},
        {id:"manual-opening-10b",text:"水を優先して用意する",required:true},
        {id:"manual-opening-10c",text:"烏龍茶を茶葉2パックで用意する",required:true},
        {id:"manual-opening-11",text:"カスターセットを補充する",required:true},
        {id:"manual-opening-12",text:"鉄板を磨く",required:true},
        {id:"manual-opening-13",text:"ビールサーバーを洗浄する",required:true},
        {id:"manual-opening-14",text:"灰皿を洗う",required:true}
      ];
    }

    const closing = (merged.checklists || []).find((item) => item.id === "closing");
    const closingTrash = closing && (closing.items || []).find((item) => item.id === "manual-closing-01");
    if (closingTrash) {
      closingTrash.text = "厨房・シンク・トイレのゴミを回収し、各ゴミ箱に新しい袋を付けてから捨てに行く";
    }

    return merged;
  };
})();