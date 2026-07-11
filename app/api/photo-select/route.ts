import { NextResponse } from "next/server";
import { z } from "zod";
import { DEFAULT_BUSINESS_ID } from "@/lib/app-config";
import { getBusinessProfile } from "@/lib/businesses";
import { generateJson } from "@/lib/ai/generate-json";
import { buildPhotoAdvisorPrompts } from "@/lib/prompts/photo-advisor";
const requestSchema=z.object({photoMemo:z.string().min(1),purpose:z.enum(["google_post","instagram","story","anniversary","meo","line"]).default("google_post"),businessId:z.string().optional().default(DEFAULT_BUSINESS_ID)});
const outputSchema=z.object({bestUse:z.string(),googleScore:z.number().min(0).max(100),instagramScore:z.number().min(0).max(100),storyScore:z.number().min(0).max(100),impression:z.string(),cropAdvice:z.string(),captionIdea:z.string(),caution:z.string(),recommendation:z.string()});
export async function POST(request:Request){try{const input=requestSchema.parse(await request.json());const prompts=buildPhotoAdvisorPrompts(getBusinessProfile(input.businessId),input);return NextResponse.json(await generateJson({...prompts,schema:outputSchema,temperature:0.35}));}catch(error){console.error(error);return NextResponse.json({error:error instanceof Error?error.message:"写真メモの確認に失敗しました。"},{status:500});}}
