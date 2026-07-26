import { getSupabaseAdmin } from "@/lib/supabase-admin";

const CONFIG_BUCKET = "amoretto-standard";
const ASSET_BUCKET = "amoretto-standard-assets";
const CONFIG_PATH = "config.json";
const HISTORY_PREFIX = "history";
const NOTES_PREFIX = "notes";
const MAX_HISTORY = 30;
const MAX_NOTES = 200;

type JsonRecord = Record<string, unknown>;

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
    fileSizeLimit: isPublic ? 5 * 1024 * 1024 : 2 * 1024 * 1024,
    allowedMimeTypes: isPublic
      ? ["image/jpeg", "image/png", "image/webp", "image/gif"]
      : ["application/json"],
  });

  if (createError && !createError.message.toLowerCase().includes("already exists")) {
    throw new Error("保存先の作成に失敗しました。");
  }
}

function safeId(value: string) {
  if (!/^[a-zA-Z0-9_-]{1,160}$/.test(value)) throw new Error("識別子が正しくありません。");
  return value;
}

async function readJson(path: string): Promise<JsonRecord | null> {
  const supabase = requireSupabase();
  await ensureBucket(CONFIG_BUCKET, false);
  const { data, error } = await supabase.storage.from(CONFIG_BUCKET).download(path);
  if (error) {
    const message = error.message.toLowerCase();
    if (message.includes("not found") || message.includes("object not found")) return null;
    throw new Error("共有データの読み込みに失敗しました。");
  }
  try {
    return JSON.parse(await data.text()) as JsonRecord;
  } catch {
    throw new Error("共有データの形式が正しくありません。");
  }
}

async function writeJson(path: string, value: unknown) {
  const supabase = requireSupabase();
  await ensureBucket(CONFIG_BUCKET, false);
  const body = Buffer.from(JSON.stringify(value, null, 2), "utf8");
  const { error } = await supabase.storage.from(CONFIG_BUCKET).upload(path, body, {
    contentType: "application/json",
    upsert: true,
    cacheControl: "0",
  });
  if (error) throw new Error("共有データの保存に失敗しました。");
}

async function listJson(prefix: string, limit: number) {
  const supabase = requireSupabase();
  await ensureBucket(CONFIG_BUCKET, false);
  const { data, error } = await supabase.storage.from(CONFIG_BUCKET).list(prefix, {
    limit,
    sortBy: { column: "created_at", order: "desc" },
  });
  if (error) throw new Error("保存データの一覧取得に失敗しました。");
  return (data ?? []).filter((item) => item.name.endsWith(".json"));
}

export async function readStandardConfig() {
  return readJson(CONFIG_PATH);
}

async function saveHistorySnapshot(config: unknown, action: string, summary: string) {
  const now = new Date().toISOString();
  const id = `${Date.now()}-${crypto.randomUUID()}`;
  await writeJson(`${HISTORY_PREFIX}/${id}.json`, {
    id,
    createdAt: now,
    action,
    summary: summary.slice(0, 300),
    config,
  });

  const files = await listJson(HISTORY_PREFIX, 100);
  if (files.length > MAX_HISTORY) {
    const supabase = requireSupabase();
    const stale = files.slice(MAX_HISTORY).map((item) => `${HISTORY_PREFIX}/${item.name}`);
    if (stale.length) await supabase.storage.from(CONFIG_BUCKET).remove(stale);
  }
}

export async function writeStandardConfig(config: JsonRecord, summary = "共有内容を更新") {
  await writeJson(CONFIG_PATH, config);
  await saveHistorySnapshot(config, "save", summary);
}

export async function listStandardHistory() {
  const files = await listJson(HISTORY_PREFIX, MAX_HISTORY);
  const entries = await Promise.all(
    files.map(async (item) => {
      const record = await readJson(`${HISTORY_PREFIX}/${item.name}`);
      if (!record) return null;
      return {
        id: String(record.id ?? item.name.replace(/\.json$/, "")),
        createdAt: String(record.createdAt ?? item.created_at ?? ""),
        action: String(record.action ?? "save"),
        summary: String(record.summary ?? "更新"),
        revision: Number((record.config as JsonRecord | undefined)?.revision ?? 0),
      };
    })
  );
  return entries.filter(Boolean);
}

export async function restoreStandardHistory(id: string) {
  const clean = safeId(id);
  const record = await readJson(`${HISTORY_PREFIX}/${clean}.json`);
  if (!record || !record.config || typeof record.config !== "object") {
    throw new Error("復元する履歴が見つかりません。");
  }
  const current = await readStandardConfig();
  const restored = {
    ...(record.config as JsonRecord),
    updatedAt: new Date().toISOString(),
    revision: Number(current?.revision ?? 0) + 1,
  };
  await writeStandardConfig(restored, `履歴から復元：${String(record.summary ?? "以前の版")}`);
  return restored;
}

export async function createStandardNote(input: JsonRecord) {
  const id = `${Date.now()}-${crypto.randomUUID()}`;
  const note = {
    id,
    type: String(input.type ?? "suggestion"),
    staffName: String(input.staffName ?? "匿名").slice(0, 80),
    title: String(input.title ?? "").slice(0, 160),
    body: String(input.body ?? "").slice(0, 3000),
    relatedType: String(input.relatedType ?? "").slice(0, 80),
    relatedId: String(input.relatedId ?? "").slice(0, 160),
    status: "open",
    ownerReply: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await writeJson(`${NOTES_PREFIX}/${id}.json`, note);

  const files = await listJson(NOTES_PREFIX, MAX_NOTES + 50);
  if (files.length > MAX_NOTES) {
    const supabase = requireSupabase();
    const stale = files.slice(MAX_NOTES).map((item) => `${NOTES_PREFIX}/${item.name}`);
    if (stale.length) await supabase.storage.from(CONFIG_BUCKET).remove(stale);
  }
  return note;
}

export async function listStandardNotes() {
  const files = await listJson(NOTES_PREFIX, MAX_NOTES);
  const notes = await Promise.all(
    files.map((item) => readJson(`${NOTES_PREFIX}/${item.name}`))
  );
  return notes.filter(Boolean).sort((a, b) =>
    String(b?.createdAt ?? "").localeCompare(String(a?.createdAt ?? ""))
  );
}

export async function updateStandardNote(id: string, patch: JsonRecord) {
  const clean = safeId(id);
  const current = await readJson(`${NOTES_PREFIX}/${clean}.json`);
  if (!current) throw new Error("対象のメモが見つかりません。");
  const next = {
    ...current,
    status: patch.status === "resolved" ? "resolved" : "open",
    ownerReply: String(patch.ownerReply ?? current.ownerReply ?? "").slice(0, 2000),
    updatedAt: new Date().toISOString(),
  };
  await writeJson(`${NOTES_PREFIX}/${clean}.json`, next);
  return next;
}

export async function deleteStandardNote(id: string) {
  const clean = safeId(id);
  const supabase = requireSupabase();
  await ensureBucket(CONFIG_BUCKET, false);
  const { error } = await supabase.storage.from(CONFIG_BUCKET).remove([
    `${NOTES_PREFIX}/${clean}.json`,
  ]);
  if (error) throw new Error("メモの削除に失敗しました。");
  return { id: clean };
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
