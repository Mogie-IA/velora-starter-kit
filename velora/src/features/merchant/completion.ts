import type { MerchantProfile } from "./types";

interface CompletionField {
  key: keyof MerchantProfile;
  label: string;
}

/**
 * Fields that count toward a "complete" merchant profile. `business_name` is
 * required for the profile to exist at all, so it always counts; the rest are
 * optional polish that improves the checkout experience.
 */
const COMPLETION_FIELDS: CompletionField[] = [
  { key: "business_name", label: "Business name" },
  { key: "display_name", label: "Display name" },
  { key: "description", label: "Description" },
  { key: "logo_url", label: "Logo" },
  { key: "website", label: "Website" },
  { key: "support_email", label: "Support email" },
];

export interface ProfileCompletion {
  /** 0–100 percentage of completion fields filled. */
  percent: number;
  filledCount: number;
  totalCount: number;
  missing: string[];
  isComplete: boolean;
}

export function computeProfileCompletion(
  profile: MerchantProfile | null
): ProfileCompletion {
  const total = COMPLETION_FIELDS.length;

  if (!profile) {
    return {
      percent: 0,
      filledCount: 0,
      totalCount: total,
      missing: COMPLETION_FIELDS.map((f) => f.label),
      isComplete: false,
    };
  }

  const missing: string[] = [];
  let filled = 0;

  for (const field of COMPLETION_FIELDS) {
    const value = profile[field.key];
    if (typeof value === "string" && value.trim().length > 0) {
      filled += 1;
    } else {
      missing.push(field.label);
    }
  }

  return {
    percent: Math.round((filled / total) * 100),
    filledCount: filled,
    totalCount: total,
    missing,
    isComplete: missing.length === 0,
  };
}
