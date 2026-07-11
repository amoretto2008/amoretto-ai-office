import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { isMultiTenantSchemaEnabled } from "@/lib/feature-flags";

export type CreatePostHistoryInput = {
  businessId: string;
  situation: string;
  purpose: string;
  photoMemo: string;
  googlePost: string;
  instagramPost: string;
  instagramStory: string;
  lineMessage: string;
  strategyNote: string;
  photoAdvice: string;
  hashtags: string[];
};

function requireSupabase() {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabaseが未設定です。");
  return supabase;
}

export async function createPostHistory(input: CreatePostHistoryInput) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;

  const payload: Record<string, unknown> = {
    situation: input.situation,
    purpose: input.purpose,
    photo_memo: input.photoMemo,
    google_post: input.googlePost,
    instagram_post: input.instagramPost,
    instagram_story: input.instagramStory,
    line_message: input.lineMessage,
    strategy_note: input.strategyNote,
    photo_advice: input.photoAdvice,
    hashtags: input.hashtags,
  };

  if (isMultiTenantSchemaEnabled()) payload.business_id = input.businessId;

  const { error } = await supabase.from("post_histories").insert(payload);
  if (error) console.error("History insert error:", error);
}

export async function listPostHistories(businessId: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  let query = supabase
    .from("post_histories")
    .select("id, created_at, purpose, situation, google_post, is_posted, posted_at")
    .order("created_at", { ascending: false })
    .limit(20);

  if (isMultiTenantSchemaEnabled()) query = query.eq("business_id", businessId);

  const { data, error } = await query;
  if (error) {
    console.error("History fetch error:", error);
    return [];
  }
  return data ?? [];
}

export async function deletePostHistory(id: string, businessId: string) {
  const supabase = requireSupabase();
  let query = supabase.from("post_histories").delete().eq("id", id);
  if (isMultiTenantSchemaEnabled()) query = query.eq("business_id", businessId);
  const { data, error } = await query.select("id");
  if (error) throw new Error("履歴の削除に失敗しました。");
  return data ?? [];
}

export async function updatePostHistoryStatus(
  id: string,
  businessId: string,
  isPosted: boolean
) {
  const supabase = requireSupabase();
  let query = supabase
    .from("post_histories")
    .update({
      is_posted: isPosted,
      posted_at: isPosted ? new Date().toISOString() : null,
    })
    .eq("id", id);

  if (isMultiTenantSchemaEnabled()) query = query.eq("business_id", businessId);

  const { data, error } = await query
    .select("id, is_posted, posted_at")
    .single();
  if (error) throw new Error("投稿済み状態の更新に失敗しました。");
  return data;
}
