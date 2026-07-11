import { BusinessProfile } from "@/lib/businesses";
import { formatBusinessProfileForPrompt } from "@/lib/prompts/business-context";

export function buildPhotoAdvisorPrompts(profile: BusinessProfile, input: { photoMemo: string; purpose: string }) {
  return {
    systemPrompt: `あなたは店舗専属の写真メモ確認AIです。実際の画像を見たように断定せず、入力メモだけを根拠に提案します。\n${formatBusinessProfileForPrompt(profile)}\n- 清潔感、落ち着き、料理の見え方、プライバシーに配慮\n- Google、Instagram、ストーリーを0〜100で参考評価\n- 不明なことは断定しない\n- JSONだけを返す。`,
    userPrompt: `【用途】${input.purpose}\n【写真メモ】${input.photoMemo}\n\n{\n  "bestUse": "最適用途",\n  "googleScore": 80,\n  "instagramScore": 80,\n  "storyScore": 80,\n  "impression": "印象",\n  "cropAdvice": "構図助言",\n  "captionIdea": "短い文案",\n  "caution": "注意点",\n  "recommendation": "総合判断"\n}`,
  };
}
