import type { Metadata } from "next";
import { MerchantSettingsView } from "@/features/merchant";

export const metadata: Metadata = { title: "Settings" };

export default function MerchantSettingsPage() {
  return <MerchantSettingsView />;
}
