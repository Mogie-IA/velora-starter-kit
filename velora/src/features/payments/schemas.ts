import { z } from "zod";

export const CURRENCIES = ["SOL", "USDC"] as const;

export const createPaymentLinkSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Title is required")
      .max(80, "Keep the title under 80 characters"),
    description: z
      .string()
      .trim()
      .max(500, "Keep the description under 500 characters")
      .optional()
      .or(z.literal("")),
    amount: z.coerce
      .number()
      .positive("Amount must be greater than 0")
      .max(1_000_000, "Amount is too large"),
    currency: z.enum(CURRENCIES),
    customerContact: z
      .string()
      .trim()
      .max(120, "Keep this under 120 characters")
      .optional()
      .or(z.literal("")),
    expiresAt: z.string().optional().or(z.literal("")),
    saveAsDraft: z.boolean().optional(),
  })
  .refine(
    (d) => {
      if (!d.expiresAt) return true;
      const t = new Date(d.expiresAt).getTime();
      return !Number.isNaN(t) && t > Date.now();
    },
    { message: "Expiry must be a future date", path: ["expiresAt"] }
  );

export type CreatePaymentLinkValues = z.infer<typeof createPaymentLinkSchema>;
