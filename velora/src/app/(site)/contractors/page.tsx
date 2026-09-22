import type { Metadata } from "next";

import { LandingPage } from "@/features/site/components/LandingPage";
import { CONTRACTOR } from "@/features/site/content";

export const metadata: Metadata = {
  title: "Win diaspora clients and get paid on time",
  description:
    "Bid on funded projects, prove your work stage by stage, and get paid automatically the moment it's verified.",
};

export default function ContractorsPage() {
  return <LandingPage content={CONTRACTOR} />;
}
