import { z } from "zod";

const optionalTrimmed = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, `Keep ${label} under ${max} characters`)
    .optional()
    .or(z.literal(""));

/**
 * `z.string().url()` accepts any scheme, including `javascript:` and `data:`.
 * Since these values are rendered as `href`/image `src` on the public checkout,
 * restrict them to http(s) to avoid injecting unsafe links.
 */
function isHttpUrl(value: string): boolean {
  try {
    const protocol = new URL(value).protocol;
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

export const merchantProfileSchema = z.object({
  businessName: z
    .string()
    .trim()
    .min(1, "Business name is required")
    .max(80, "Keep the business name under 80 characters"),
  displayName: optionalTrimmed(60, "the display name"),
  description: optionalTrimmed(500, "the description"),
  website: z
    .string()
    .trim()
    .max(200, "Keep the website under 200 characters")
    .url("Enter a valid URL (including https://)")
    .refine(isHttpUrl, "Website must start with http:// or https://")
    .optional()
    .or(z.literal("")),
  supportEmail: z
    .string()
    .trim()
    .max(120, "Keep the email under 120 characters")
    .email("Enter a valid email address")
    .optional()
    .or(z.literal("")),
  logoUrl: z
    .string()
    .trim()
    .max(400, "Keep the logo URL under 400 characters")
    .url("Enter a valid image URL (including https://)")
    .refine(isHttpUrl, "Logo URL must start with http:// or https://")
    .optional()
    .or(z.literal("")),
});

export type MerchantProfileValues = z.infer<typeof merchantProfileSchema>;
