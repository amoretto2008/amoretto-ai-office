import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireStandardOwner } from "@/lib/server/standard-owner-auth";
import {
  deleteStandardSkillProfile,
  listStandardSkillProfiles,
  readStandardSkillProfile,
  writeStandardSkillProfile,
} from "@/lib/server/standard-skill-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_SKILL_IDS = new Set([
  "welcome",
  "seat-guide",
  "oshibori-menu",
  "order-confirm",
  "water-observe",
  "clear-plate",
  "payment-farewell",
  "beer",
  "highball",
  "wine",
  "non-alcohol",
  "aburi",
  "foiegras",
  "soup-bread",
  "abalone",
  "salad",
  "meat",
  "garlic-rice",
  "anniversary",
  "cake-prepare",
  "cake-serve-photo",
  "cake-cut",
  "allergy",
  "complaint",
  "fire-smoke",
  "gas",
  "equipment",
]);

const staffIdSchema = z.string().regex(/^staff-[a-f0-9-]{36}$/i);
const tokenSchema = z.string().min(40).max(200);
const skillIdSchema = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-z0-9_-]+$/i)
  .refine((value) => ALLOWED_SKILL_IDS.has(value), "登録されていないスキルです。");
const skillUpdateSchema = z.object({
  id: skillIdSchema,
  selfLevel: z.number().int().min(0).max(1),
  requestReview: z.boolean().optional().default(false),
});

const readSchema = z.object({
  action: z.literal("read"),
  staffId: staffIdSchema,
  token: tokenSchema,
});

const selfSchema = z.object({
  action: z.literal("self"),
  staffId: staffIdSchema,
  token: tokenSchema,
  name: z.string().trim().min(1).max(80),
  role: z.string().trim().max(80).default(""),
  skills: z.array(skillUpdateSchema).max(ALLOWED_SKILL_IDS.size),
  website: z.string().max(200).optional().default(""),
});

const ownerUpdateSchema = z.object({
  staffId: staffIdSchema,
  skillId: skillIdSchema,
  ownerLevel: z.number().int().min(0).max(3),
  clearRequest: z.boolean().optional().default(true),
});

const deleteSchema = z.object({ staffId: staffIdSchema });

type JsonRecord = Record<string, unknown>;

function hashToken(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function safeEqual(leftValue: string, rightValue: string) {
  const left = Buffer.from(leftValue, "utf8");
  const right = Buffer.from(rightValue, "utf8");
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as JsonRecord) : {};
}

function withoutSecret(profile: JsonRecord) {
  const { tokenHash: _tokenHash, ...safe } = profile;
  return safe;
}

function verifyProfileToken(profile: JsonRecord, token: string) {
  const expected = String(profile.tokenHash ?? "");
  if (!expected || !safeEqual(expected, hashToken(token))) {
    throw new Error("この端末のスキル情報を確認できませんでした。");
  }
}

export async function GET() {
  try {
    await requireStandardOwner();
    const profiles = await listStandardSkillProfiles();
    return NextResponse.json(
      { profiles: profiles.map((profile) => withoutSecret(profile as JsonRecord)) },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "OWNER_AUTH_REQUIRED") {
      return NextResponse.json({ error: "店主ログインが必要です。" }, { status: 401 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "スキル情報の読み込みに失敗しました。" },
      { status: 400 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const raw = await request.json();
    const action = raw?.action;

    if (action === "read") {
      const input = readSchema.parse(raw);
      const profile = await readStandardSkillProfile(input.staffId);
      if (!profile) {
        return NextResponse.json(
          { profile: null },
          { headers: { "Cache-Control": "no-store" } }
        );
      }
      verifyProfileToken(profile, input.token);
      return NextResponse.json(
        { profile: withoutSecret(profile) },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    const input = selfSchema.parse(raw);
    if (input.website) return NextResponse.json({ success: true });

    const current = await readStandardSkillProfile(input.staffId);
    if (current) verifyProfileToken(current, input.token);

    const now = new Date().toISOString();
    const currentSkills = asRecord(current?.skills);
    const nextSkills: JsonRecord = {};

    for (const update of input.skills) {
      const previous = asRecord(currentSkills[update.id]);
      const ownerLevel = Math.max(0, Math.min(3, Number(previous.ownerLevel ?? 0)));
      let requestedAt = String(previous.requestedAt ?? "");
      if (update.requestReview) requestedAt = now;
      if (update.selfLevel === 0 && ownerLevel < 2) requestedAt = "";
      nextSkills[update.id] = {
        ...previous,
        selfLevel: update.selfLevel,
        ownerLevel,
        requestedAt,
        certifiedAt: String(previous.certifiedAt ?? ""),
        updatedAt: now,
      };
    }

    const profile: JsonRecord = {
      ...(current ?? {}),
      id: input.staffId,
      tokenHash: current?.tokenHash ?? hashToken(input.token),
      name: input.name,
      role: input.role,
      skills: nextSkills,
      createdAt: current?.createdAt ?? now,
      updatedAt: now,
    };

    await writeStandardSkillProfile(input.staffId, profile);
    return NextResponse.json({ success: true, profile: withoutSecret(profile) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "スキル情報の保存に失敗しました。" },
      { status: 400 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    await requireStandardOwner();
    const input = ownerUpdateSchema.parse(await request.json());
    const current = await readStandardSkillProfile(input.staffId);
    if (!current) throw new Error("対象のスタッフが見つかりません。");

    const now = new Date().toISOString();
    const skills = asRecord(current.skills);
    const previous = asRecord(skills[input.skillId]);
    skills[input.skillId] = {
      ...previous,
      selfLevel: Math.max(0, Math.min(1, Number(previous.selfLevel ?? 0))),
      ownerLevel: input.ownerLevel,
      requestedAt: input.clearRequest ? "" : String(previous.requestedAt ?? ""),
      certifiedAt: input.ownerLevel >= 2 ? now : "",
      updatedAt: now,
    };

    const profile: JsonRecord = {
      ...current,
      skills,
      ownerUpdatedAt: now,
      updatedAt: now,
    };
    await writeStandardSkillProfile(input.staffId, profile);
    return NextResponse.json({ success: true, profile: withoutSecret(profile) });
  } catch (error) {
    if (error instanceof Error && error.message === "OWNER_AUTH_REQUIRED") {
      return NextResponse.json({ error: "店主ログインが必要です。" }, { status: 401 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "認定内容を更新できませんでした。" },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await requireStandardOwner();
    const input = deleteSchema.parse(await request.json());
    return NextResponse.json({ success: true, deleted: await deleteStandardSkillProfile(input.staffId) });
  } catch (error) {
    if (error instanceof Error && error.message === "OWNER_AUTH_REQUIRED") {
      return NextResponse.json({ error: "店主ログインが必要です。" }, { status: 401 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "スタッフ情報を削除できませんでした。" },
      { status: 400 }
    );
  }
}
