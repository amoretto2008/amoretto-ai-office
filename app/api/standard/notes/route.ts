import { NextResponse } from "next/server";
import { z } from "zod";
import { requireStandardOwner } from "@/lib/server/standard-owner-auth";
import {
  createStandardNote,
  deleteStandardNote,
  listStandardNotes,
  updateStandardNote,
} from "@/lib/server/standard-storage";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  type: z.enum(["suggestion", "handover", "incident"]).default("suggestion"),
  staffName: z.string().max(80).default("匿名"),
  title: z.string().min(1).max(160),
  body: z.string().min(1).max(3000),
  relatedType: z.string().max(80).default(""),
  relatedId: z.string().max(160).default(""),
  website: z.string().max(0).optional().default(""),
});

const updateSchema = z.object({
  id: z.string().min(1).max(160),
  status: z.enum(["open", "resolved"]),
  ownerReply: z.string().max(2000).default(""),
});

const deleteSchema = z.object({ id: z.string().min(1).max(160) });

export async function GET() {
  try {
    await requireStandardOwner();
    return NextResponse.json(
      { notes: await listStandardNotes() },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "OWNER_AUTH_REQUIRED") {
      return NextResponse.json({ error: "店主ログインが必要です。" }, { status: 401 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "メモの読み込みに失敗しました。" },
      { status: 400 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const input = createSchema.parse(await request.json());
    if (input.website) return NextResponse.json({ success: true });
    const note = await createStandardNote(input);
    return NextResponse.json({ success: true, note });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "メモの送信に失敗しました。" },
      { status: 400 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    await requireStandardOwner();
    const input = updateSchema.parse(await request.json());
    const note = await updateStandardNote(input.id, input);
    return NextResponse.json({ success: true, note });
  } catch (error) {
    if (error instanceof Error && error.message === "OWNER_AUTH_REQUIRED") {
      return NextResponse.json({ error: "店主ログインが必要です。" }, { status: 401 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "メモの更新に失敗しました。" },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await requireStandardOwner();
    const input = deleteSchema.parse(await request.json());
    return NextResponse.json({ success: true, deleted: await deleteStandardNote(input.id) });
  } catch (error) {
    if (error instanceof Error && error.message === "OWNER_AUTH_REQUIRED") {
      return NextResponse.json({ error: "店主ログインが必要です。" }, { status: 401 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "メモの削除に失敗しました。" },
      { status: 400 }
    );
  }
}
