import { BusinessProfile } from "@/lib/businesses";

function list(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

export function formatBusinessProfileForPrompt(profile: BusinessProfile) {
  return `
【店舗情報】
- 店舗ID：${profile.id}
- 店名：${profile.name}（${profile.reading}）
- 地域：${profile.area}
- 住所：${profile.address}
- 業態：${profile.industry}
- 店の方向性：${profile.style}

【大切にする価値観】
${list(profile.values)}

【主な訴求】
${list(profile.mainAppeals)}

【優先MEO語句】
${list(profile.priorityMeoKeywords)}

【MEOで自然に使える言葉】
${list(profile.meoKeywords)}

【避けたい表現】
${list(profile.prohibitedExpressions)}

【好ましい表現】
${list(profile.preferredExpressions)}

【店舗固有の基準文】
- 投稿冒頭：${profile.signaturePhrases.opening}
- 投稿の軸：${profile.signaturePhrases.anchor}
- 投稿の締め：${profile.signaturePhrases.postClosing}
- 口コミ返信の締め：${profile.signaturePhrases.reviewClosing}
`;
}
