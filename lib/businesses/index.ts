import { DEFAULT_BUSINESS_ID } from "@/lib/app-config";
import { AMORETTO_PROFILE } from "./amoretto";
import { BusinessProfile } from "./types";

const businessProfiles: Record<string, BusinessProfile> = {
  [AMORETTO_PROFILE.id]: AMORETTO_PROFILE,
};

export function getBusinessProfile(
  businessId = DEFAULT_BUSINESS_ID
): BusinessProfile {
  const profile = businessProfiles[businessId];

  if (!profile) {
    throw new Error(`未登録の店舗IDです: ${businessId}`);
  }

  return profile;
}

export { AMORETTO_PROFILE };
export type { BusinessProfile };
