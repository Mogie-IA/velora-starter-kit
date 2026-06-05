import type { PaymentLink, PaymentLinkStatus } from "./types";

type StatusInput = Pick<PaymentLink, "status" | "expires_at">;

/**
 * Resolve the *effective* status of a payment link, accounting for expiry that
 * may not yet be persisted. Paid and Draft are terminal/explicit; an Active link
 * past its expiry reads as Expired.
 */
export function effectiveStatus(link: StatusInput): PaymentLinkStatus {
  if (link.status === "paid") return "paid";
  if (link.status === "draft") return "draft";
  if (link.status === "expired") return "expired";
  if (link.expires_at && new Date(link.expires_at).getTime() < Date.now()) {
    return "expired";
  }
  return "active";
}

export function isPayable(link: StatusInput): boolean {
  return effectiveStatus(link) === "active";
}

export const STATUS_LABELS: Record<PaymentLinkStatus, string> = {
  draft: "Draft",
  active: "Active",
  paid: "Paid",
  expired: "Expired",
};
