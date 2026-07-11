import { PostPurpose } from "@/lib/types";

export type HistoryItem = {
  id: string;
  created_at: string;
  purpose: PostPurpose;
  situation: string;
  google_post: string;
  is_posted: boolean;
  posted_at: string | null;
};

export type ReviewTone = "standard" | "short" | "very_polite";
export type ReviewReplyResult = {
  mainReply: string;
  shortReply: string;
  politeReply: string;
  strategyNote: string;
  cautionNote: string;
};

export type MeoCheckResult = {
  brandScore: number;
  meoScore: number;
  salesPressure: string;
  keywordStuffing: string;
  goodPoints: string[];
  improvements: string[];
  revisedPost: string;
  summary: string;
};

export type PhotoPurpose =
  | "google_post"
  | "instagram"
  | "story"
  | "anniversary"
  | "meo"
  | "line";

export type PhotoSelectResult = {
  bestUse: string;
  googleScore: number;
  instagramScore: number;
  storyScore: number;
  impression: string;
  cropAdvice: string;
  captionIdea: string;
  caution: string;
  recommendation: string;
};
