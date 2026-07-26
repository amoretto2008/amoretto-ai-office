import { NextResponse } from "next/server";
import { z } from "zod";
import { requireStandardOwner } from "@/lib/server/standard-owner-auth";
import { listStandardHistory, restoreStandardHistory } from "@/lib/server/standard-storage";

export const dynamic = "force-dynamic";

const restoreSchema = z.object({ id: z.string().min(1).max(160) });

export async function GET() {
  try {
    await requireStandardOwner();
    return NextResponse.json(
      { history: await listStandardHistory() },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "OWNER_AUTH_REQUIRED") {
      return NextResponse.json({ error: "店主ログインが必要です。" }, { status: 401 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "更新履歴の読み込みに失敗しました。" },
      { status: 400 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireStandardOwner();
    const input = restoreSchema.parse(await request.json());
    const config = await restoreStandardHistory(input.id);
    return NextResponse.json({ success: true, config });
  } catch (error) {
    if (error instanceof Error && error.message === "OWNER_AUTH_REQUIRED") {
      return NextResponse.json({ error: "店主ログインが必要です。" }, { status: 401 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "更新履歴の復元に失敗しました。" },
      { status: 400 }
    );
  }
}
