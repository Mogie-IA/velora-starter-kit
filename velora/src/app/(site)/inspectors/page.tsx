import type { Metadata } from "next";

import { LandingPage } from "@/features/site/components/LandingPage";
import { INSPECTOR } from "@/features/site/content";

export const metadata: Metadata = {
  title: "Paid inspection work for licensed professionals",
  description: INSPECTOR.hero.body,
};

export default function InspectorsPage() {
  return <LandingPage content={INSPECTOR} />;
}
