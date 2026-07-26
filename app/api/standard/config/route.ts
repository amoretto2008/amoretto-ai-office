import { NextResponse } from "next/server";
import { z } from "zod";
import { readStandardConfig, writeStandardConfig } from "@/lib/server/standard-storage";

export const dynamic = "force-dynamic";

const itemSchema = z.object({
  id: z.string().min(1).max(100),
  name: z.string().min(1).max(200),
}).passthrough();

const configSchema = z.object({
  quote: z.string().max(500),
  notice: z.string().max(3000),
  updatedAt: z.string().optional(),
  drinks: z.array(itemSchema).max(100),
  glasses: z.array(itemSchema).max(100),
}).passthrough();

const saveSchema = z.object({
  password: z.string().min(1),
  config: configSchema,
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
    const input = saveSchema.parse(await request.json());
    const appPassword = process.env.APP_PASSWORD;

    if (!appPassword || input.password !== appPassword) {
      return NextResponse.json({ error: "店主パスワードが違います。" }, { status: 401 });
    }

    const config = {
      ...input.config,
      updatedAt: new Date().toISOString(),
    };

    await writeStandardConfig(config);
    return NextResponse.json({ success: true, config });
  } catch (error) {
    console.error("STANDARD config save error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "共有データの保存に失敗しました。" },
      { status: 400 }
    );
  }
}
