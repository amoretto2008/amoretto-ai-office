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

    const nextPlateScene = (merged.scenes || []).find((item) => item.id === "hall-observe-06-next-plate");
    if (nextPlateScene) {
      nextPlateScene.dont = ["器や皿を出し間違えない", "温めが必要な皿を忘れない"];
    }

    const refillScene = (merged.scenes || []).find((item) => item.id === "hall-observe-15-refill-bottle");
    if (refillScene) {
      refillScene.dont = ["品切れ直前になってから慌てて冷やさない"];
    }

    const anniversaryToolsScene = (merged.scenes || []).find((item) => item.id === "anniversary-04-forks-firework");
    if (anniversaryToolsScene) {
      anniversaryToolsScene.dont = ["フォークや花火の本数不足・置き忘れをしない"];
    }

    const anniversaryTimingScene = (merged.scenes || []).find((item) => item.id === "anniversary-05-timing");
    if (anniversaryTimingScene) {
      anniversaryTimingScene.dont = ["食事の流れを確認せず、早すぎる・遅すぎるタイミングで提供しない"];
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
        {id:"manual-opening-06",text:"テーブルをセットする（スプーンがなければ後回し）",required:true},
        {id:"manual-opening-06b",text:"椅子を拭く",required:true},
        {id:"manual-opening-07",text:"予約札を置く",required:true},
        {id:"manual-opening-08",text:"米の合数を確認し、炊飯をセットする",required:true},
        {id:"manual-opening-09",text:"シルバーの洗浄・拭き上げを確認する",required:true},
        {id:"manual-opening-10",text:"ドリンクを補充する（ソーダを重点確認）",required:true},
        {id:"manual-opening-10b",text:"水を優先して用意する",required:true},
        {id:"manual-opening-10c",text:"烏龍茶を茶葉2パックで用意する",required:true},
        {id:"manual-opening-11",text:"カスターセットを補充する（オリーブ油・塩・胡椒・醤油・水）",required:true},
        {id:"manual-opening-12",text:"鉄板を磨く",required:true},
        {id:"manual-opening-13",text:"ビールサーバーを洗浄する",required:true},
        {id:"manual-opening-14",text:"灰皿を洗う",required:true}
      ];
    }

    const idle = (merged.checklists || []).find((item) => item.id === "idle-time");
    if (idle) {
      idle.description = "客席を最優先し、余裕がある時だけ進める。";
      idle.items = [
        {id:"manual-idle-01",text:"カウンター後ろの棚と酒瓶を拭く",required:false},
        {id:"manual-idle-01b",text:"客席後ろの棚と酒瓶を拭く",required:false},
        {id:"manual-idle-02",text:"ワイングラスを拭く",required:false},
        {id:"manual-idle-03",text:"換気扇を掃除する",required:false},
        {id:"manual-idle-03b",text:"エアコンフィルターを掃除する",required:false},
        {id:"manual-idle-03c",text:"コンロを掃除する",required:false}
      ];
    }

    const closing = (merged.checklists || []).find((item) => item.id === "closing");
    if (closing) {
      closing.description = "営業終了後、上から順に確認する。";
      closing.items = [
        {id:"manual-closing-01",text:"厨房・シンク・トイレのゴミを回収し、各ゴミ箱に新しい袋を付けてから捨てに行く",required:true},
        {id:"manual-closing-02",text:"おしぼりを裏へ出す",required:true},
        {id:"manual-closing-03",text:"ご飯を釜から器へ移し、冷蔵庫に保管する",required:true},
        {id:"manual-closing-04",text:"鉄板を磨く",required:true},
        {id:"manual-closing-05",text:"翌日のテーブルセットを行う",required:true},
        {id:"manual-closing-06",text:"灰皿を手洗いする",required:true},
        {id:"manual-closing-06b",text:"ビールの受け皿を洗う",required:true},
        {id:"manual-closing-06c",text:"コーヒーの受け皿を洗う",required:true},
        {id:"manual-closing-07",text:"洗浄機の水を抜く",required:true},
        {id:"manual-closing-07b",text:"洗浄機を洗浄する",required:true},
        {id:"manual-closing-08",text:"看板の電源を確認する",required:true},
        {id:"manual-closing-08b",text:"ポットの電源を確認する",required:true},
        {id:"manual-closing-08c",text:"おしぼりウォーマーの電源を確認する",required:true},
        {id:"manual-closing-08d",text:"エアコンの電源を確認する",required:true},
        {id:"manual-closing-08e",text:"鉄板の電源を確認する",required:true},
        {id:"manual-closing-08f",text:"トイレの電源を確認する",required:true},
        {id:"manual-closing-09",text:"ガスを確認する",required:true}
      ];
    }

    const inventory = (merged.checklists || []).find((item) => item.id === "inventory");
    if (inventory) {
      const inventoryTextById = new Map([
        ["inventory-004", "ジンジャーエール：基準数 10"],
        ["inventory-025", "わさび：基準数 1"],
        ["inventory-026", "ニンニク醤油：基準数 1"],
        ["inventory-049", "CAMUS カミュ V.S.O.P：基準数 1"]
      ]);
      (inventory.items || []).forEach((item) => {
        const text = inventoryTextById.get(item.id);
        if (text) item.text = text;
      });
    }

    return merged;
  };
})();