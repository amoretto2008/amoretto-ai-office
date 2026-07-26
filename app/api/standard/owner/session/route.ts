import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import {
  STANDARD_OWNER_COOKIE,
  STANDARD_OWNER_MAX_AGE,
  createStandardOwnerToken,
  isStandardOwner,
} from "@/lib/server/standard-owner-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a, "utf8");
  const right = Buffer.from(b, "utf8");
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export async function GET() {
  return NextResponse.json(
    { authenticated: await isStandardOwner() },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const password = typeof body?.password === "string" ? body.password : "";
    const appPassword = process.env.APP_PASSWORD;

    if (!appPassword || !safeEqual(password, appPassword)) {
      return NextResponse.json({ error: "店主パスワードが違います。" }, { status: 401 });
    }

    const token = await createStandardOwnerToken();
    const response = NextResponse.json({ success: true, authenticated: true });
    response.cookies.set(STANDARD_OWNER_COOKIE, token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: STANDARD_OWNER_MAX_AGE,
    });
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "ログインに失敗しました。" },
      { status: 400 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, authenticated: false });
  response.cookies.set(STANDARD_OWNER_COOKIE, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
