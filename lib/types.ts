export type PostPurpose =
  | "today_seats"
  | "meo_boost"
  | "anniversary"
  | "lunch"
  | "review_reply"
  | "regular_customer";

export type GeneratedPosts = {
  googlePost: string;
  instagramPost: string;
  instagramStory: string;
  lineMessage: string;
  strategyNote: string;
  photoAdvice: string;
  hashtags: string[];
};

export const purposeLabels: Record<PostPurpose, string> = {
  today_seats: "今日の空席案内",
  meo_boost: "MEO強化投稿",
  anniversary: "記念日訴求",
  lunch: "ランチ案内",
  review_reply: "口コミ返信",
  regular_customer: "常連様へのご案内",
};

export const purposeBadgeStyles: Record<PostPurpose, string> = {
  today_seats: "border-stone-300 bg-stone-50 text-stone-700",
  meo_boost: "border-amoretto-gold bg-amoretto-gold/20 text-amoretto-navy",
  anniversary: "border-amoretto-wine bg-amoretto-wine/10 text-amoretto-wine",
  lunch: "border-amber-300 bg-amber-50 text-amber-800",
  review_reply: "border-sky-300 bg-sky-50 text-sky-800",
  regular_customer: "border-emerald-300 bg-emerald-50 text-emerald-800",
};
