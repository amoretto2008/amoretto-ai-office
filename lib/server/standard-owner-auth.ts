import { cookies } from "next/headers";
import { createAuthToken } from "@/lib/auth-token";

export const STANDARD_OWNER_COOKIE = "amoretto_standard_owner";
export const STANDARD_OWNER_MAX_AGE = 60 * 60 * 12;

async function expectedOwnerToken() {
  const secret = process.env.APP_SESSION_SECRET;
  if (!secret) return null;
  return createAuthToken(`${secret}:amoretto-standard-owner:v1`);
}

export async function isStandardOwner() {
  const expected = await expectedOwnerToken();
  if (!expected) return false;
  const store = await cookies();
  return store.get(STANDARD_OWNER_COOKIE)?.value === expected;
}

export async function requireStandardOwner() {
  if (!(await isStandardOwner())) {
    throw new Error("OWNER_AUTH_REQUIRED");
  }
}

export async function createStandardOwnerToken() {
  const token = await expectedOwnerToken();
  if (!token) throw new Error("店主ログイン設定が未設定です。");
  return token;
}
