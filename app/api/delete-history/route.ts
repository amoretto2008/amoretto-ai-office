import { NextResponse } from "next/server";
import { z } from "zod";
import { DEFAULT_BUSINESS_ID } from "@/lib/app-config";
import { getBusinessProfile } from "@/lib/businesses";
import { deletePostHistory } from "@/lib/server/post-history-repository";
const schema=z.object({id:z.string().min(1),businessId:z.string().optional().default(DEFAULT_BUSINESS_ID)});
export async function POST(request:Request){try{const input=schema.parse(await request.json());getBusinessProfile(input.businessId);return NextResponse.json({success:true,deleted:await deletePostHistory(input.id,input.businessId)});}catch(error){console.error(error);return NextResponse.json({error:error instanceof Error?error.message:"履歴の削除に失敗しました。"},{status:500});}}
