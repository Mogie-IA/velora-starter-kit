import type { Metadata } from "next";

import { listInspectors } from "@/app/actions/marketplace";
import { ProfileDirectory } from "@/features/marketplace/components/ProfileDirectory";

export const metadata: Metadata = { title: "Browse inspectors" };
export const dynamic = "force-dynamic";

export default async function InspectorDirectoryPage() {
  const result = await listInspectors();
  return <ProfileDirectory role="inspector" profiles={result.ok ? result.data : []} />;
}
