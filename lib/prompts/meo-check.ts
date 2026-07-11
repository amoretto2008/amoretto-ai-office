import { BusinessProfile } from "@/lib/businesses";
import { formatBusinessProfileForPrompt } from "@/lib/prompts/business-context";

export function buildMeoCheckPrompts(profile: BusinessProfile, text: string) {
  return {
    systemPrompt: `あなたは店舗専属のMEO文章確認AIです。検索順位の実測ではなく、文章の参考評価を行います。\n${formatBusinessProfileForPrompt(profile)}\n- brandScore は店舗らしさを0〜100で評価\n- meoScore は地域語・業態語の自然さを0〜100で評価\n- キーワード詰め込みと押し売り感を厳しく見る\n- 修正版は元文の良さを残し、入力にない事実を追加しない\n- JSONだけを返す。`,
    userPrompt: `【確認する文章】${text}\n\n{\n  "brandScore": 90,\n  "meoScore": 85,\n  "salesPressure": "低い",\n  "keywordStuffing": "なし",\n  "goodPoints": ["良い点"],\n  "improvements": ["改善点"],\n  "revisedPost": "修正版",\n  "summary": "総評"\n}`,
  };
}
