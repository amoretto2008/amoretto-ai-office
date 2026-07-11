import { NextResponse } from "next/server";
import { APP_CONFIG, DEFAULT_BUSINESS_ID } from "@/lib/app-config";
import { getBusinessProfile } from "@/lib/businesses";

export const dynamic = "force-dynamic";

export async function GET() {
  const business = getBusinessProfile(DEFAULT_BUSINESS_ID);

  return NextResponse.json({
    status: "ok",
    app: {
      name: APP_CONFIG.name,
      module: APP_CONFIG.moduleName,
      version: APP_CONFIG.version,
      stage: APP_CONFIG.stage,
    },
    business: {
      id: business.id,
      name: business.name,
    },
    configured: {
      openai: Boolean(process.env.OPENAI_API_KEY),
      supabase: Boolean(
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
          process.env.SUPABASE_SERVICE_ROLE_KEY
      ),
      auth: Boolean(
        process.env.APP_PASSWORD && process.env.APP_SESSION_SECRET
      ),
    },
  });
}
