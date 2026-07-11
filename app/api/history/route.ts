import { NextResponse } from "next/server";
import { DEFAULT_BUSINESS_ID } from "@/lib/app-config";
import { getBusinessProfile } from "@/lib/businesses";
import { listPostHistories } from "@/lib/server/post-history-repository";
export const dynamic="force-dynamic";
export async function GET(request:Request){try{const businessId=new URL(request.url).searchParams.get("businessId")||DEFAULT_BUSINESS_ID;getBusinessProfile(businessId);return NextResponse.json({histories:await listPostHistories(businessId)},{headers:{"Cache-Control":"no-store"}});}catch(error){console.error(error);return NextResponse.json({histories:[]},{headers:{"Cache-Control":"no-store"}});}}
