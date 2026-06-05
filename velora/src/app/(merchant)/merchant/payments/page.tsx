import type { Metadata } from "next";
import { PaymentsView } from "@/features/payments";

export const metadata: Metadata = { title: "Payment Links" };

export default function MerchantPaymentsPage() {
  return <PaymentsView />;
}
