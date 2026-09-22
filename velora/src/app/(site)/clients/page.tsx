import type { Metadata } from "next";

import { LandingPage } from "@/features/site/components/LandingPage";
import { CLIENT } from "@/features/site/content";

export const metadata: Metadata = {
  title: "Build back home, from anywhere",
  description: CLIENT.hero.body,
};

export default function ClientsPage() {
  return <LandingPage content={CLIENT} />;
}
