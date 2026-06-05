import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS } from "../status";
import type { PaymentLinkStatus } from "../types";

const VARIANT: Record<
  PaymentLinkStatus,
  "default" | "secondary" | "success" | "warning" | "error" | "outline"
> = {
  draft: "secondary",
  active: "success",
  paid: "default",
  expired: "warning",
};

export function StatusBadge({ status }: { status: PaymentLinkStatus }) {
  return <Badge variant={VARIANT[status]}>{STATUS_LABELS[status]}</Badge>;
}
