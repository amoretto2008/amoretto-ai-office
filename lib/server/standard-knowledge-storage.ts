import { getSupabaseAdmin } from "@/lib/supabase-admin";

const BUCKET = "amoretto-standard";
const PREFIX = "knowledge";
const MAX_ENTRIES = 300;

type JsonRecord = Record<string, unknown>;

function requireSupabase() {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabaseが未設定です。");
  return supabase;
}

function safeId(value: string) {
  if (!/^knowledge-[a-f0-9-]{20,100}$/i.test(value)) {
    throw new Error("ナレッジ識別子が正しくありません。");
  }
  return value;
}

async function readJson(path: string): Promise<JsonRecord | null> {
  const supabase = requireSupabase();
  const { data, error } = await supabase.storage.from(BUCKET).download(path);
  if (error) {
    const message = error.message.toLowerCase();
    if (message.includes("not found") || message.includes("object not found")) return null;
    throw new Error("ナレッジの読み込みに失敗しました。");
  }
  try {
    return JSON.parse(await data.text()) as JsonRecord;
  } catch {
    throw new Error("ナレッジの形式が正しくありません。");
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
  if (error) throw new Error("ナレッジの保存に失敗しました。");
}

async function listFiles(limit = MAX_ENTRIES) {
  const supabase = requireSupabase();
  const { data, error } = await supabase.storage.from(BUCKET).list(PREFIX, {
    limit,
    sortBy: { column: "created_at", order: "desc" },
  });
  if (error) throw new Error("ナレッジ一覧の読み込みに失敗しました。");
  return (data ?? []).filter((item) => item.name.endsWith(".json"));
}

export async function createStandardKnowledge(input: JsonRecord) {
  const files = await listFiles(MAX_ENTRIES + 1);
  if (files.length >= MAX_ENTRIES) {
    throw new Error("保存できるナレッジ数の上限に達しました。店主へ整理を依頼してください。");
  }

  const now = new Date().toISOString();
  const id = `knowledge-${crypto.randomUUID()}`;
  const entry: JsonRecord = {
    id,
    title: String(input.title ?? "").slice(0, 160),
    body: String(input.body ?? "").slice(0, 3000),
    category: String(input.category ?? "その他").slice(0, 80),
    tags: Array.isArray(input.tags) ? input.tags.slice(0, 20).map((tag) => String(tag).slice(0, 80)) : [],
    requestedScope: input.requestedScope === "official_candidate" ? "official_candidate" : "shared",
    status: "pending",
    staffName: String(input.staffName ?? "匿名").slice(0, 80),
    staffRole: String(input.staffRole ?? "").slice(0, 80),
    ownerReply: "",
    createdAt: now,
    updatedAt: now,
    publishedAt: "",
  };

  await writeJson(`${PREFIX}/${id}.json`, entry);
  return entry;
}

export async function listStandardKnowledge() {
  const files = await listFiles(MAX_ENTRIES);
  const entries = await Promise.all(files.map((item) => readJson(`${PREFIX}/${item.name}`)));
  return entries
    .filter(Boolean)
    .sort((a, b) => String(b?.createdAt ?? "").localeCompare(String(a?.createdAt ?? "")));
}

export async function listPublishedStandardKnowledge() {
  const entries = await listStandardKnowledge();
  return entries
    .filter((entry) => entry?.status === "published")
    .map((entry) => ({
      id: entry?.id,
      title: entry?.title,
      body: entry?.body,
      category: entry?.category,
      tags: entry?.tags,
      staffName: entry?.staffName,
      createdAt: entry?.createdAt,
      publishedAt: entry?.publishedAt,
    }));
}

export async function updateStandardKnowledge(id: string, patch: JsonRecord) {
  const clean = safeId(id);
  const current = await readJson(`${PREFIX}/${clean}.json`);
  if (!current) throw new Error("対象のナレッジが見つかりません。");

  const status = ["pending", "published", "archived"].includes(String(patch.status))
    ? String(patch.status)
    : String(current.status ?? "pending");
  const now = new Date().toISOString();
  const next: JsonRecord = {
    ...current,
    title: patch.title === undefined ? current.title : String(patch.title).slice(0, 160),
    body: patch.body === undefined ? current.body : String(patch.body).slice(0, 3000),
    category: patch.category === undefined ? current.category : String(patch.category).slice(0, 80),
    tags: patch.tags === undefined
      ? current.tags
      : Array.isArray(patch.tags)
        ? patch.tags.slice(0, 20).map((tag) => String(tag).slice(0, 80))
        : [],
    status,
    ownerReply: patch.ownerReply === undefined ? current.ownerReply : String(patch.ownerReply).slice(0, 2000),
    updatedAt: now,
    publishedAt: status === "published" ? String(current.publishedAt || now) : "",
  };

  await writeJson(`${PREFIX}/${clean}.json`, next);
  return next;
}

export async function deleteStandardKnowledge(id: string) {
  const clean = safeId(id);
  const supabase = requireSupabase();
  const { error } = await supabase.storage.from(BUCKET).remove([`${PREFIX}/${clean}.json`]);
  if (error) throw new Error("ナレッジを削除できませんでした。");
  return { id: clean };
}
