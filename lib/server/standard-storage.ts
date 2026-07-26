import { getSupabaseAdmin } from "@/lib/supabase-admin";

const CONFIG_BUCKET = "amoretto-standard";
const ASSET_BUCKET = "amoretto-standard-assets";
const CONFIG_PATH = "config.json";

function requireSupabase() {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabaseが未設定です。");
  return supabase;
}

async function ensureBucket(name: string, isPublic: boolean) {
  const supabase = requireSupabase();
  const { data, error } = await supabase.storage.listBuckets();
  if (error) throw new Error("保存先の確認に失敗しました。");
  if (data?.some((bucket) => bucket.name === name)) return;

  const { error: createError } = await supabase.storage.createBucket(name, {
    public: isPublic,
    fileSizeLimit: isPublic ? 5 * 1024 * 1024 : 1024 * 1024,
    allowedMimeTypes: isPublic
      ? ["image/jpeg", "image/png", "image/webp", "image/gif"]
      : ["application/json"],
  });

  if (createError && !createError.message.toLowerCase().includes("already exists")) {
    throw new Error("保存先の作成に失敗しました。");
  }
}

export async function readStandardConfig() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  await ensureBucket(CONFIG_BUCKET, false);
  const { data, error } = await supabase.storage.from(CONFIG_BUCKET).download(CONFIG_PATH);

  if (error) {
    const message = error.message.toLowerCase();
    if (message.includes("not found") || message.includes("object not found")) return null;
    throw new Error("共有データの読み込みに失敗しました。");
  }

  try {
    return JSON.parse(await data.text());
  } catch {
    throw new Error("共有データの形式が正しくありません。");
  }
}

export async function writeStandardConfig(config: unknown) {
  const supabase = requireSupabase();
  await ensureBucket(CONFIG_BUCKET, false);

  const body = Buffer.from(JSON.stringify(config, null, 2), "utf8");
  const { error } = await supabase.storage.from(CONFIG_BUCKET).upload(CONFIG_PATH, body, {
    contentType: "application/json; charset=utf-8",
    upsert: true,
    cacheControl: "0",
  });

  if (error) throw new Error("共有データの保存に失敗しました。");
}

export async function uploadStandardImage(file: File) {
  const supabase = requireSupabase();
  await ensureBucket(ASSET_BUCKET, true);

  const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `images/${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from(ASSET_BUCKET).upload(path, bytes, {
    contentType: file.type,
    upsert: false,
    cacheControl: "31536000",
  });

  if (error) throw new Error("画像の保存に失敗しました。");

  const { data } = supabase.storage.from(ASSET_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
