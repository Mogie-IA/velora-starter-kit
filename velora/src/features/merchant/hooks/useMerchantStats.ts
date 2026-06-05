"use client";

import { useQuery } from "@tanstack/react-query";
import { getMerchantDashboardStats } from "@/app/actions/merchant";
import type { ActionResult } from "../types";

function unwrap<T>(result: ActionResult<T>): T {
  if (!result.ok) throw new Error(result.error);
  return result.data;
}

export function useMerchantDashboardStats(walletAddress: string | null) {
  return useQuery({
    queryKey: ["merchant-stats", walletAddress],
    enabled: Boolean(walletAddress),
    queryFn: async () =>
      unwrap(await getMerchantDashboardStats(walletAddress ?? "")),
  });
}
