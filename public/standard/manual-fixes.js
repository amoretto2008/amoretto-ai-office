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

    const closing = (merged.checklists || []).find((item) => item.id === "closing");
    const closingTrash = closing && (closing.items || []).find((item) => item.id === "manual-closing-01");
    if (closingTrash) {
      closingTrash.text = "厨房・シンク・トイレのゴミを回収し、各ゴミ箱に新しい袋を付けてから捨てに行く";
    }

    return merged;
  };
})();
