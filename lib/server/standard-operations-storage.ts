import { getSupabaseAdmin } from "@/lib/supabase-admin";

const BUCKET = "amoretto-standard";
const PREFIX = "operations";
const MAX_RESERVATIONS_PER_YEAR = 2500;
const MAX_INVENTORY_ITEMS = 150;
const MAX_UPDATES = 100;

type JsonRecord = Record<string, unknown>;

function requireSupabase() {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabaseが未設定です。");
  return supabase;
}

function isMissingObject(message: string) {
  const normalized = message.toLowerCase();
  return normalized.includes("not found") || normalized.includes("object not found");
}

function safeYear(value: number) {
  if (!Number.isInteger(value) || value < 2020 || value > 2100) {
    throw new Error("対象年が正しくありません。");
  }
  return value;
}

async function readJson(path: string): Promise<JsonRecord | null> {
  const supabase = requireSupabase();
  const { data, error } = await supabase.storage.from(BUCKET).download(path);
  if (error) {
    if (isMissingObject(error.message)) return null;
    throw new Error("営業データの読み込みに失敗しました。");
  }
  try {
    return JSON.parse(await data.text()) as JsonRecord;
  } catch {
    throw new Error("営業データの形式が正しくありません。");
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
  if (error) throw new Error("営業データの保存に失敗しました。");
}

export async function readOperationsSettings() {
  return (await readJson(`${PREFIX}/settings.json`)) ?? {};
}

export async function writeOperationsSettings(value: JsonRecord) {
  await writeJson(`${PREFIX}/settings.json`, value);
  return value;
}

export async function readOperationsReservations(year: number) {
  const clean = safeYear(year);
  const record = await readJson(`${PREFIX}/reservations/${clean}.json`);
  const list = Array.isArray(record?.reservations) ? record.reservations : [];
  return list.filter((item): item is JsonRecord => Boolean(item && typeof item === "object" && !Array.isArray(item)));
}

export async function writeOperationsReservations(year: number, reservations: JsonRecord[]) {
  const clean = safeYear(year);
  if (reservations.length > MAX_RESERVATIONS_PER_YEAR) {
    throw new Error("1年分の予約件数が上限を超えています。");
  }
  const value = {
    year: clean,
    reservations,
    updatedAt: new Date().toISOString(),
  };
  await writeJson(`${PREFIX}/reservations/${clean}.json`, value);
  return value;
}

export async function readOperationsInventory() {
  const record = await readJson(`${PREFIX}/inventory.json`);
  const items = Array.isArray(record?.items) ? record.items : [];
  return items.filter((item): item is JsonRecord => Boolean(item && typeof item === "object" && !Array.isArray(item)));
}

export async function writeOperationsInventory(items: JsonRecord[]) {
  if (items.length > MAX_INVENTORY_ITEMS) throw new Error("在庫項目数が上限を超えています。");
  const value = { items, updatedAt: new Date().toISOString() };
  await writeJson(`${PREFIX}/inventory.json`, value);
  return value;
}

export async function readOperationsManualMeta() {
  const record = await readJson(`${PREFIX}/manual-meta.json`);
  return record && typeof record === "object" ? record : {};
}

export async function writeOperationsManualMeta(value: JsonRecord) {
  await writeJson(`${PREFIX}/manual-meta.json`, value);
  return value;
}

export async function readOperationsUpdates() {
  const record = await readJson(`${PREFIX}/important-updates.json`);
  const updates = Array.isArray(record?.updates) ? record.updates : [];
  return updates
    .filter((item): item is JsonRecord => Boolean(item && typeof item === "object" && !Array.isArray(item)))
    .slice(0, MAX_UPDATES);
}

export async function writeOperationsUpdates(updates: JsonRecord[]) {
  if (updates.length > MAX_UPDATES) throw new Error("重要改訂の件数が上限を超えています。");
  const value = { updates, updatedAt: new Date().toISOString() };
  await writeJson(`${PREFIX}/important-updates.json`, value);
  return value;
}

export async function deleteOperationsReservationsYear(year: number) {
  const clean = safeYear(year);
  const supabase = requireSupabase();
  const { error } = await supabase.storage.from(BUCKET).remove([
    `${PREFIX}/reservations/${clean}.json`,
  ]);
  if (error && !isMissingObject(error.message)) {
    throw new Error("営業履歴の削除に失敗しました。");
  }
  return { year: clean };
}
