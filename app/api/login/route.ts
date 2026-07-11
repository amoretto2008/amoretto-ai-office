import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/app-config";
import { createAuthToken } from "@/lib/auth-token";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const inputPassword = body.password;

    const appPassword = process.env.APP_PASSWORD;
    const sessionSecret = process.env.APP_SESSION_SECRET;

    if (!appPassword || !sessionSecret) {
      return NextResponse.json(
        { error: "ログイン設定が未設定です。" },
        { status: 500 }
      );
    }

    if (inputPassword !== appPassword) {
      return NextResponse.json(
        { error: "パスワードが違います。" },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ success: true });
    const token = await createAuthToken(sessionSecret);

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "ログインに失敗しました。" },
      { status: 500 }
    );
  }
}
