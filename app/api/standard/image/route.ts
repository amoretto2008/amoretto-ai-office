import { NextResponse } from "next/server";
import { uploadStandardImage } from "@/lib/server/standard-storage";

export const runtime = "nodejs";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const password = formData.get("password");
    const file = formData.get("file");
    const appPassword = process.env.APP_PASSWORD;

    if (!appPassword || typeof password !== "string" || password !== appPassword) {
      return NextResponse.json({ error: "店主パスワードが違います。" }, { status: 401 });
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "画像を選んでください。" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: "JPEG、PNG、WebP、GIFのみ使用できます。" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "画像は5MB以下にしてください。" }, { status: 400 });
    }

    const url = await uploadStandardImage(file);
    return NextResponse.json({ url });
  } catch (error) {
    console.error("STANDARD image upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "画像の保存に失敗しました。" },
      { status: 400 }
    );
  }
}
