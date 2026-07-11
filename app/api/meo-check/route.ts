import { NextResponse } from "next/server";
import { z } from "zod";
import { DEFAULT_BUSINESS_ID } from "@/lib/app-config";
import { getBusinessProfile } from "@/lib/businesses";
import { generateJson } from "@/lib/ai/generate-json";
import { buildMeoCheckPrompts } from "@/lib/prompts/meo-check";
const requestSchema=z.object({text:z.string().min(1),purpose:z.string().optional(),businessId:z.string().optional().default(DEFAULT_BUSINESS_ID)});
const outputSchema=z.object({brandScore:z.number().min(0).max(100),meoScore:z.number().min(0).max(100),salesPressure:z.string(),keywordStuffing:z.string(),goodPoints:z.array(z.string()),improvements:z.array(z.string()),revisedPost:z.string(),summary:z.string()});
export async function POST(request:Request){try{const input=requestSchema.parse(await request.json());const prompts=buildMeoCheckPrompts(getBusinessProfile(input.businessId),input.text);return NextResponse.json(await generateJson({...prompts,schema:outputSchema,temperature:0.25}));}catch(error){console.error(error);return NextResponse.json({error:error instanceof Error?error.message:"MEOチェックに失敗しました。"},{status:500});}}
