import { BusinessProfile } from "@/lib/businesses";
import { formatBusinessProfileForPrompt } from "@/lib/prompts/business-context";

export function buildReviewReplyPrompts(profile: BusinessProfile, input: { reviewText: string; goodPoint: string; tone: string }) {
  const tone = input.tone === "short" ? "短め" : input.tone === "very_polite" ? "より丁寧" : "標準";
  return {
    systemPrompt: `あなたは店舗専属の口コミ返信AIです。\n${formatBusinessProfileForPrompt(profile)}\n- 来店への感謝から始める\n- 口コミの具体的な内容に触れる\n- 宣伝、言い訳、過剰な表現を避ける\n- 指摘がある場合は受け止め、事実不明な内容を断定しない\n- 状況が合えば「${profile.signaturePhrases.reviewClosing}」で締める\n- 入力にない事実を創作しない\n- JSONだけを返す。`,
    userPrompt: `【口コミ本文】${input.reviewText}\n【触れたい点】${input.goodPoint || "指定なし"}\n【温度感】${tone}\n\n{\n  "mainReply": "標準返信",\n  "shortReply": "短め返信",\n  "politeReply": "丁寧な返信",\n  "strategyNote": "返信の狙い",\n  "cautionNote": "返信前の確認点"\n}`,
  };
}
