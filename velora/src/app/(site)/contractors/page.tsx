import type { Metadata } from "next";

import { LandingPage } from "@/features/site/components/LandingPage";
import { CONTRACTOR } from "@/features/site/content";

export const metadata: Metadata = {
  title: "Bid on building projects from clients abroad",
  description: CONTRACTOR.hero.body,
};

export default function ContractorsPage() {
  return <LandingPage content={CONTRACTOR} />;
}
