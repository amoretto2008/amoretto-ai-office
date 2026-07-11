import { NextResponse } from "next/server";
import { z } from "zod";
import { DEFAULT_BUSINESS_ID } from "@/lib/app-config";
import { getBusinessProfile } from "@/lib/businesses";
import { generateJson } from "@/lib/ai/generate-json";
import { buildPostGeneratorPrompts } from "@/lib/prompts/post-generator";
import { createPostHistory } from "@/lib/server/post-history-repository";

const requestSchema = z.object({
  situation: z.string().min(1),
  purpose: z.enum(["today_seats","meo_boost","anniversary","lunch","review_reply","regular_customer"]),
  photoMemo: z.string().optional().default(""),
  businessId: z.string().optional().default(DEFAULT_BUSINESS_ID),
});
const outputSchema = z.object({ googlePost:z.string(), instagramPost:z.string(), instagramStory:z.string(), lineMessage:z.string(), strategyNote:z.string(), photoAdvice:z.string(), hashtags:z.array(z.string()) });

export async function POST(request: Request) {
  try {
    const input = requestSchema.parse(await request.json());
    const profile = getBusinessProfile(input.businessId);
    const prompts = buildPostGeneratorPrompts(profile, input);
    const result = await generateJson({ ...prompts, schema: outputSchema, temperature: 0.45 });
    await createPostHistory({ businessId: input.businessId, situation: input.situation, purpose: input.purpose, photoMemo: input.photoMemo, googlePost: result.googlePost, instagramPost: result.instagramPost, instagramStory: result.instagramStory, lineMessage: result.lineMessage, strategyNote: result.strategyNote, photoAdvice: result.photoAdvice, hashtags: result.hashtags });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Generate route error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "生成に失敗しました。" }, { status: 500 });
  }
}
