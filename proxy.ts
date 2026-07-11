import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/app-config";
import { createAuthToken } from "@/lib/auth-token";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/login") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname === "/manifest.webmanifest" ||
    pathname.startsWith("/icon-") ||
    pathname === "/apple-touch-icon.png"
  ) {
    return NextResponse.next();
  }

  const sessionSecret = process.env.APP_SESSION_SECRET;
  const authCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (sessionSecret && authCookie) {
    const expectedToken = await createAuthToken(sessionSecret);

    if (authCookie === expectedToken) {
      return NextResponse.next();
    }
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
