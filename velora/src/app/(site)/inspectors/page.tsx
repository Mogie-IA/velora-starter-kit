import type { Metadata } from "next";

import { LandingPage } from "@/features/site/components/LandingPage";
import { INSPECTOR } from "@/features/site/content";

export const metadata: Metadata = {
  title: "Paid site inspections for licensed professionals",
  description:
    "Get paid to do exactly what you're trained for — visit a site, confirm the work is real — for diaspora clients who have no one else to check.",
};

export default function InspectorsPage() {
  return <LandingPage content={INSPECTOR} />;
}
