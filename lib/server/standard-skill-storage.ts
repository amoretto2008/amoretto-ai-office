import { getSupabaseAdmin } from "@/lib/supabase-admin";

const BUCKET = "amoretto-standard";
const PREFIX = "skills";
const MAX_PROFILES = 80;

type JsonRecord = Record<string, unknown>;

function requireSupabase() {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabaseが未設定です。");
  return supabase;
}

function safeStaffId(value: string) {
  if (!/^staff-[a-f0-9-]{36}$/i.test(value)) throw new Error("スタッフ識別子が正しくありません。");
  return value;
}

function isMissingObject(message: string) {
  const normalized = message.toLowerCase();
  return normalized.includes("not found") || normalized.includes("object not found");
}

async function readJson(path: string): Promise<JsonRecord | null> {
  const supabase = requireSupabase();
  const { data, error } = await supabase.storage.from(BUCKET).download(path);
  if (error) {
    if (isMissingObject(error.message)) return null;
    throw new Error("スキル情報の読み込みに失敗しました。");
  }
  try {
    return JSON.parse(await data.text()) as JsonRecord;
  } catch {
    throw new Error("スキル情報の形式が正しくありません。");
  }
}

async function writeJson(path: string, value: unknown) {
  const supabase = requireSupabase();
  const body = Buffer.from(JSON.stringify(value, null, 2), "utf8");
  const { error } = await supabase.storage.from(BUCKET).upload(path, body, {
    contentType: "application/json",
    upsert: true,
    cacheControl: "0",
  });
  if (error) throw new Error("スキル情報の保存に失敗しました。");
}

async function listFiles(limit = MAX_PROFILES) {
  const supabase = requireSupabase();
  const { data, error } = await supabase.storage.from(BUCKET).list(PREFIX, {
    limit,
    sortBy: { column: "created_at", order: "asc" },
  });
  if (error) throw new Error("スキル情報の一覧取得に失敗しました。");
  return (data ?? []).filter((item) => item.name.endsWith(".json"));
}

export async function readStandardSkillProfile(staffId: string) {
  const clean = safeStaffId(staffId);
  return readJson(`${PREFIX}/${clean}.json`);
}

export async function writeStandardSkillProfile(staffId: string, profile: JsonRecord) {
  const clean = safeStaffId(staffId);
  const current = await readStandardSkillProfile(clean);
  if (!current) {
    const files = await listFiles(MAX_PROFILES + 1);
    if (files.length >= MAX_PROFILES) throw new Error("登録できるスタッフ数の上限に達しました。");
  }
  await writeJson(`${PREFIX}/${clean}.json`, profile);
  return profile;
}

export async function listStandardSkillProfiles() {
  const files = await listFiles(MAX_PROFILES);
  const records = await Promise.all(files.map((item) => readJson(`${PREFIX}/${item.name}`)));
  return records
    .filter(Boolean)
    .sort((a, b) => String(a?.name ?? "").localeCompare(String(b?.name ?? ""), "ja"));
}

export async function deleteStandardSkillProfile(staffId: string) {
  const clean = safeStaffId(staffId);
  const supabase = requireSupabase();
  const { error } = await supabase.storage.from(BUCKET).remove([`${PREFIX}/${clean}.json`]);
  if (error) throw new Error("スタッフのスキル情報を削除できませんでした。");
  return { staffId: clean };
}
