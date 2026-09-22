import type { Metadata } from "next";

import { listContractors } from "@/app/actions/marketplace";
import { ProfileDirectory } from "@/features/marketplace/components/ProfileDirectory";

export const metadata: Metadata = { title: "Browse contractors" };
export const dynamic = "force-dynamic";

export default async function ContractorDirectoryPage() {
  const result = await listContractors();
  return <ProfileDirectory role="contractor" profiles={result.ok ? result.data : []} />;
}
