import { NextResponse } from "next/server";
import { z } from "zod";
import { requireStandardOwner } from "@/lib/server/standard-owner-auth";
import {
  createStandardKnowledge,
  deleteStandardKnowledge,
  listPublishedStandardKnowledge,
  listStandardKnowledge,
  updateStandardKnowledge,
} from "@/lib/server/standard-knowledge-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const idSchema = z.string().regex(/^knowledge-[a-f0-9-]{20,100}$/i);
const categorySchema = z.enum(["接客", "料理", "ドリンク", "記念日", "安全", "営業準備", "その他"]);
const tagSchema = z.array(z.string().trim().min(1).max(80)).max(20).default([]);

const createSchema = z.object({
  title: z.string().trim().min(1).max(160),
  body: z.string().trim().min(1).max(3000),
  category: categorySchema.default("その他"),
  tags: tagSchema,
  requestedScope: z.enum(["shared", "official_candidate"]).default("shared"),
  staffName: z.string().trim().min(1).max(80),
  staffRole: z.string().trim().max(80).default(""),
  website: z.string().max(200).optional().default(""),
});

const updateSchema = z.object({
  id: idSchema,
  title: z.string().trim().min(1).max(160).optional(),
  body: z.string().trim().min(1).max(3000).optional(),
  category: categorySchema.optional(),
  tags: tagSchema.optional(),
  status: z.enum(["pending", "published", "archived"]).optional(),
  ownerReply: z.string().max(2000).optional(),
});

const deleteSchema = z.object({ id: idSchema });

function containsContactInformation(value: string) {
  const email = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
  const phone = /(?:^|\D)0\d{1,4}[-ー－\s]?\d{1,4}[-ー－\s]?\d{3,4}(?:\D|$)/;
  return email.test(value) || phone.test(value);
}

export async function GET(request: Request) {
  try {
    const ownerView = new URL(request.url).searchParams.get("owner") === "1";
    if (ownerView) {
      await requireStandardOwner();
      return NextResponse.json(
        { entries: await listStandardKnowledge() },
        { headers: { "Cache-Control": "no-store" } }
      );
    }
    return NextResponse.json(
      { entries: await listPublishedStandardKnowledge() },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "OWNER_AUTH_REQUIRED") {
      return NextResponse.json({ error: "店主ログインが必要です。" }, { status: 401 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "ナレッジを読み込めませんでした。" },
      { status: 400 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const input = createSchema.parse(await request.json());
    if (input.website) return NextResponse.json({ success: true });
    const combined = `${input.title}\n${input.body}\n${input.tags.join("\n")}`;
    if (containsContactInformation(combined)) {
      return NextResponse.json(
        { error: "電話番号やメールアドレスはナレッジへ記録できません。" },
        { status: 400 }
      );
    }
    const entry = await createStandardKnowledge(input);
    return NextResponse.json({ success: true, entry });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "ナレッジを送信できませんでした。" },
      { status: 400 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    await requireStandardOwner();
    const input = updateSchema.parse(await request.json());
    const entry = await updateStandardKnowledge(input.id, input);
    return NextResponse.json({ success: true, entry });
  } catch (error) {
    if (error instanceof Error && error.message === "OWNER_AUTH_REQUIRED") {
      return NextResponse.json({ error: "店主ログインが必要です。" }, { status: 401 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "ナレッジを更新できませんでした。" },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await requireStandardOwner();
    const input = deleteSchema.parse(await request.json());
    return NextResponse.json({ success: true, deleted: await deleteStandardKnowledge(input.id) });
  } catch (error) {
    if (error instanceof Error && error.message === "OWNER_AUTH_REQUIRED") {
      return NextResponse.json({ error: "店主ログインが必要です。" }, { status: 401 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "ナレッジを削除できませんでした。" },
      { status: 400 }
    );
  }
}
