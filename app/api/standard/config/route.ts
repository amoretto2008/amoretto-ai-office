import { NextResponse } from "next/server";
import { z } from "zod";
import { requireStandardOwner } from "@/lib/server/standard-owner-auth";
import { readStandardConfig, writeStandardConfig } from "@/lib/server/standard-storage";

export const dynamic = "force-dynamic";

const shortText = z.string().max(300);
const mediumText = z.string().max(3000);
const idText = z.string().min(1).max(160).regex(/^[a-zA-Z0-9_-]+$/);
const stringList = z.array(z.string().max(500)).max(80);

const announcementSchema = z.object({
  id: idText,
  title: z.string().min(1).max(160),
  body: mediumText,
  level: z.enum(["info", "important", "urgent"]).default("info"),
  startsAt: z.string().max(40).optional().default(""),
  endsAt: z.string().max(40).optional().default(""),
  active: z.boolean().default(true),
});

const sceneSchema = z.object({
  id: idText,
  category: shortText.default("接客"),
  title: z.string().min(1).max(200),
  lead: mediumText,
  do: stringList,
  say: mediumText,
  dont: stringList,
  ask: mediumText,
  tags: stringList.default([]),
  active: z.boolean().default(true),
});

const drinkSchema = z.object({
  id: idText,
  name: z.string().min(1).max(200),
  category: shortText,
  icon: z.string().max(16).default("🥃"),
  image: z.string().url().or(z.literal("")).default(""),
  glass: shortText,
  ingredients: stringList,
  steps: stringList,
  standard: stringList,
  note: mediumText,
  tags: stringList.default([]),
  active: z.boolean().default(true),
});

const glassSchema = z.object({
  id: idText,
  name: z.string().min(1).max(200),
  icon: z.string().max(16).default("🍷"),
  image: z.string().url().or(z.literal("")).default(""),
  use: mediumText,
  location: mediumText,
  handling: mediumText,
  reject: mediumText,
  tags: stringList.default([]),
  active: z.boolean().default(true),
});

const checklistItemSchema = z.object({
  id: idText,
  text: z.string().min(1).max(500),
  required: z.boolean().default(true),
});

const checklistSchema = z.object({
  id: idText,
  title: z.string().min(1).max(120),
  description: mediumText.default(""),
  items: z.array(checklistItemSchema).max(100),
  active: z.boolean().default(true),
});

const quizSchema = z.object({
  question: mediumText,
  choices: z.array(z.string().max(500)).min(2).max(8),
  answer: z.number().int().min(0).max(7),
  explanation: mediumText,
});

const lessonSchema = z.object({
  id: idText,
  day: z.string().max(40),
  title: z.string().min(1).max(200),
  summary: mediumText,
  content: z.string().max(12000),
  points: stringList,
  quiz: quizSchema,
  active: z.boolean().default(true),
});

const configSchema = z.object({
  schemaVersion: z.number().int().min(1).max(20).default(3),
  appVersion: z.string().max(40).default("3.0.0"),
  revision: z.number().int().min(0).default(0),
  quote: z.string().max(500),
  notice: z.string().max(3000),
  updatedAt: z.string().max(50).nullable().optional(),
  updatedBy: z.string().max(120).default("店主"),
  changeNote: z.string().max(500).default(""),
  announcements: z.array(announcementSchema).max(50).default([]),
  scenes: z.array(sceneSchema).max(150),
  drinks: z.array(drinkSchema).max(150),
  glasses: z.array(glassSchema).max(150),
  checklists: z.array(checklistSchema).max(30),
  lessons: z.array(lessonSchema).max(80),
});

const saveSchema = z.object({
  config: configSchema,
  baseUpdatedAt: z.string().nullable().optional(),
  changeSummary: z.string().max(300).optional().default("共有内容を更新"),
});

export async function GET() {
  try {
    const config = await readStandardConfig();
    return NextResponse.json(
      { config },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("STANDARD config read error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "共有データの読み込みに失敗しました。" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireStandardOwner();
    const input = saveSchema.parse(await request.json());
    const current = await readStandardConfig();
    const currentUpdatedAt = typeof current?.updatedAt === "string" ? current.updatedAt : null;

    if (currentUpdatedAt && input.baseUpdatedAt !== currentUpdatedAt) {
      return NextResponse.json(
        {
          error: "別の端末で内容が更新されています。最新データを読み込んでから、もう一度編集してください。",
          code: "CONFIG_CONFLICT",
          currentUpdatedAt,
        },
        { status: 409 }
      );
    }

    const now = new Date().toISOString();
    const config = {
      ...input.config,
      schemaVersion: 3,
      appVersion: "3.0.0",
      revision: Number(current?.revision ?? 0) + 1,
      updatedAt: now,
      changeNote: input.changeSummary,
    };

    await writeStandardConfig(config, input.changeSummary);
    return NextResponse.json({ success: true, config });
  } catch (error) {
    if (error instanceof Error && error.message === "OWNER_AUTH_REQUIRED") {
      return NextResponse.json({ error: "店主ログインが必要です。" }, { status: 401 });
    }
    console.error("STANDARD config save error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "共有データの保存に失敗しました。" },
      { status: 400 }
    );
  }
}
