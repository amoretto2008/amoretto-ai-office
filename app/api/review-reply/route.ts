import { NextResponse } from "next/server";
import { z } from "zod";
import { DEFAULT_BUSINESS_ID } from "@/lib/app-config";
import { getBusinessProfile } from "@/lib/businesses";
import { generateJson } from "@/lib/ai/generate-json";
import { buildReviewReplyPrompts } from "@/lib/prompts/review-reply";
const requestSchema=z.object({reviewText:z.string().min(1),goodPoint:z.string().optional().default(""),tone:z.enum(["standard","short","very_polite"]).default("standard"),businessId:z.string().optional().default(DEFAULT_BUSINESS_ID)});
const outputSchema=z.object({mainReply:z.string(),shortReply:z.string(),politeReply:z.string(),strategyNote:z.string(),cautionNote:z.string()});
export async function POST(request:Request){try{const input=requestSchema.parse(await request.json());const prompts=buildReviewReplyPrompts(getBusinessProfile(input.businessId),input);return NextResponse.json(await generateJson({...prompts,schema:outputSchema,temperature:0.35}));}catch(error){console.error(error);return NextResponse.json({error:error instanceof Error?error.message:"口コミ返信の生成に失敗しました。"},{status:500});}}
