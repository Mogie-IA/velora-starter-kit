import type { Metadata } from "next";

import { LandingPage } from "@/features/site/components/LandingPage";
import { CLIENT } from "@/features/site/content";

export const metadata: Metadata = {
  title: "Build back home without losing the money",
  description:
    "Velora holds your money in escrow and only pays your contractor once an independent inspector confirms the work — in person, stage by stage.",
};

export default function ClientsPage() {
  return <LandingPage content={CLIENT} />;
}
