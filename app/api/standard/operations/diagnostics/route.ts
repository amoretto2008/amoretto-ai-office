import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { requireStandardOwner } from "@/lib/server/standard-owner-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKET = "amoretto-standard";

type Check = {
  label: string;
  ok: boolean;
  detail: string;
};

function escapeHtml(value: unknown) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[char] ?? char));
}

function errorDetails(error: unknown) {
  const record = error && typeof error === "object" ? (error as Record<string, unknown>) : {};
  const message = String(record.message ?? error ?? "不明なエラー");
  const code = String(record.code ?? record.error ?? "");
  const status = Number(record.statusCode ?? record.status ?? 0);
  return { message, code, status };
}

function projectRef(url: string) {
  try {
    const host = new URL(url).hostname;
    return host.endsWith(".supabase.co") ? host.split(".")[0] : host;
  } catch {
    return "URL形式が不正";
  }
}

function keyType(key: string) {
  if (key.startsWith("sb_secret_")) return "Supabase secret key";
  if (key.startsWith("eyJ")) {
    try {
      const payload = JSON.parse(Buffer.from(key.split(".")[1] ?? "", "base64url").toString("utf8")) as Record<string, unknown>;
      return `JWT（role: ${String(payload.role ?? "不明")}）`;
    } catch {
      return "JWT形式（内容判定不可）";
    }
  }
  return "形式不明";
}

function isMissingObject(error: unknown) {
  const { message, code, status } = errorDetails(error);
  const text = `${message} ${code}`.toLowerCase();
  return status === 404 || text.includes("object not found") || (text.includes("not found") && !text.includes("bucket"));
}

function renderPage(checks: Check[], diagnosis: string, nextAction: string) {
  const rows = checks.map((check) => `
    <div class="row ${check.ok ? "ok" : "ng"}">
      <span class="mark">${check.ok ? "✓" : "!"}</span>
      <div><strong>${escapeHtml(check.label)}</strong><p>${escapeHtml(check.detail)}</p></div>
    </div>`).join("");

  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>AMORÉTTO STANDARD 接続診断</title>
<style>
  :root{color-scheme:light;--ink:#262724;--deep:#22312b;--wine:#8c3040;--line:#ddd8cc;--paper:#fbfaf6;--muted:#6c6d68}
  *{box-sizing:border-box}body{margin:0;background:var(--deep);font-family:-apple-system,BlinkMacSystemFont,"Noto Sans JP",sans-serif;color:var(--ink)}
  main{max-width:720px;margin:40px auto;background:var(--paper);min-height:calc(100vh - 80px);padding:28px;border-radius:20px}
  .eyebrow{letter-spacing:.18em;color:var(--wine);font-size:12px;font-weight:800}h1{font-size:25px;margin:8px 0 4px}h2{font-size:18px;margin:26px 0 10px}.sub{color:var(--muted);margin:0 0 22px}
  .row{display:flex;gap:12px;padding:14px;border:1px solid var(--line);border-radius:13px;background:white;margin:9px 0}.row.ok{border-left:5px solid #38734e}.row.ng{border-left:5px solid var(--wine)}
  .mark{display:grid;place-items:center;width:28px;height:28px;border-radius:50%;font-weight:900;background:#f0eee8;flex:0 0 auto}.row strong{font-size:14px}.row p{font-size:13px;color:var(--muted);margin:5px 0 0;line-height:1.55}
  .diagnosis{padding:16px;border-radius:13px;background:#f2eee7;border:1px solid var(--line);line-height:1.65}.action{padding:16px;border-radius:13px;background:#fff3f0;border:1px solid #dfbbb6;line-height:1.65}
  a{display:inline-block;margin-top:20px;background:var(--wine);color:white;text-decoration:none;padding:12px 18px;border-radius:12px;font-weight:800}
  small{display:block;color:var(--muted);margin-top:20px;line-height:1.5}@media(max-width:760px){main{margin:0;min-height:100vh;border-radius:0;padding:22px}}
</style>
</head>
<body><main>
<div class="eyebrow">OWNER ONLY / CONNECTION CHECK</div>
<h1>AMORÉTTO STANDARD 接続診断</h1>
<p class="sub">秘密鍵そのものは表示・送信していません。</p>
${rows}
<h2>診断結果</h2><div class="diagnosis">${escapeHtml(diagnosis)}</div>
<h2>次の対応</h2><div class="action">${escapeHtml(nextAction)}</div>
<a href="/standard/index.html">STANDARDへ戻る</a>
<small>診断時に個人情報は読み書きしません。接続確認用の小さなJSONを一時保存し、直後に削除します。</small>
</main></body></html>`;
}

export async function GET() {
  try {
    await requireStandardOwner();
  } catch {
    return new NextResponse(renderPage(
      [{ label: "店主認証", ok: false, detail: "店主ログインが確認できませんでした。" }],
      "診断を実行できませんでした。",
      "AMORÉTTO STANDARDで店主ログインした後、この診断ページを開き直してください。"
    ), { status: 401, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
  }

  const checks: Check[] = [];
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

  checks.push({
    label: "Supabase URL",
    ok: Boolean(url),
    detail: url ? `設定あり（接続先: ${projectRef(url)}）` : "NEXT_PUBLIC_SUPABASE_URLが未設定です。",
  });
  checks.push({
    label: "サーバー用キー",
    ok: Boolean(key),
    detail: key ? `設定あり（${keyType(key)}）` : "SUPABASE_SERVICE_ROLE_KEYが未設定です。",
  });

  if (!url || !key) {
    return new NextResponse(renderPage(
      checks,
      "Vercel ProductionのSupabase環境変数が不足しています。",
      "VercelのEnvironment Variablesで不足項目を設定し、Productionを再デプロイしてください。"
    ), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    checks.push({ label: "Supabaseクライアント", ok: false, detail: "サーバー側クライアントを作成できませんでした。" });
    return new NextResponse(renderPage(checks, "環境変数を読み込めていません。", "Vercel Productionの環境変数を保存し直して再デプロイしてください。"), {
      headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
    });
  }

  const { data: listed, error: listError } = await supabase.storage.from(BUCKET).list("", { limit: 5 });
  if (listError) {
    const detail = errorDetails(listError);
    checks.push({
      label: "非公開保存先への接続",
      ok: false,
      detail: `${detail.message}${detail.status ? `（HTTP ${detail.status}）` : ""}${detail.code ? `［${detail.code}］` : ""}`,
    });

    const text = `${detail.message} ${detail.code}`.toLowerCase();
    const authProblem = detail.status === 401 || detail.status === 403 || text.includes("unauthorized") || text.includes("invalid api key") || text.includes("jwt");
    const bucketProblem = detail.status === 404 || text.includes("bucket");
    const diagnosis = authProblem
      ? "接続先URLとサーバー用キーの組み合わせ、またはキーの権限に問題があります。"
      : bucketProblem
        ? `接続先Supabaseに非公開バケット「${BUCKET}」が存在しません。`
        : "Supabase Storageへの接続でエラーが発生しています。";
    const nextAction = authProblem
      ? "VercelのNEXT_PUBLIC_SUPABASE_URLとSUPABASE_SERVICE_ROLE_KEYを、同じSupabaseプロジェクトの値でそろえて再デプロイしてください。"
      : bucketProblem
        ? `Supabase Storageで「${BUCKET}」という非公開バケットを作成してください。`
        : "表示されたエラー文をスクリーンショットで共有してください。";

    return new NextResponse(renderPage(checks, diagnosis, nextAction), {
      headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
    });
  }

  checks.push({
    label: "非公開保存先への接続",
    ok: true,
    detail: `「${BUCKET}」へ接続できました（ルート項目 ${listed?.length ?? 0}件）。`,
  });

  const { error: configError } = await supabase.storage.from(BUCKET).download("config.json");
  checks.push({
    label: "既存STANDARDデータ",
    ok: !configError || isMissingObject(configError),
    detail: !configError
      ? "config.jsonを読み込めました。"
      : isMissingObject(configError)
        ? "config.jsonは未作成ですが、保存先には接続できています。"
        : errorDetails(configError).message,
  });

  const diagnosticPath = `operations/_diagnostics/${Date.now()}-${crypto.randomUUID()}.json`;
  const payload = Buffer.from(JSON.stringify({ purpose: "connection-check", createdAt: new Date().toISOString() }), "utf8");
  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(diagnosticPath, payload, {
    contentType: "application/json",
    upsert: false,
    cacheControl: "0",
  });

  if (uploadError) {
    const detail = errorDetails(uploadError);
    checks.push({
      label: "営業データの保存テスト",
      ok: false,
      detail: `${detail.message}${detail.status ? `（HTTP ${detail.status}）` : ""}${detail.code ? `［${detail.code}］` : ""}`,
    });
    return new NextResponse(renderPage(
      checks,
      "保存先は読めますが、新しい営業データを書き込めません。",
      "Supabaseのキー権限、Storageの制限、またはバケット設定を確認する必要があります。表示されたエラー文を共有してください。"
    ), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
  }

  checks.push({ label: "営業データの保存テスト", ok: true, detail: "接続確認用JSONを保存できました。" });
  const { error: removeError } = await supabase.storage.from(BUCKET).remove([diagnosticPath]);
  checks.push({
    label: "診断データの削除",
    ok: !removeError,
    detail: removeError ? errorDetails(removeError).message : "接続確認用JSONを削除しました。",
  });

  return new NextResponse(renderPage(
    checks,
    "VercelとSupabase Storageの接続・読込・書込は正常です。",
    "この結果で営業画面だけが失敗する場合は、営業データの形式検証を次に調査します。診断画面のスクリーンショットを共有してください。"
  ), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
}
