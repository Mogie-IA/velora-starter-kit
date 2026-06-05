"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getMerchantProfile,
  upsertMerchantProfile,
} from "@/app/actions/merchant";
import type {
  ActionResult,
  MerchantProfile,
  UpsertMerchantProfileInput,
} from "../types";

function unwrap<T>(result: ActionResult<T>): T {
  if (!result.ok) throw new Error(result.error);
  return result.data;
}

export function useMerchantProfile(walletAddress: string | null) {
  return useQuery({
    queryKey: ["merchant-profile", walletAddress],
    enabled: Boolean(walletAddress),
    queryFn: async () =>
      unwrap(await getMerchantProfile(walletAddress ?? "")),
  });
}

export function useUpsertMerchantProfile(walletAddress: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      input: UpsertMerchantProfileInput
    ): Promise<MerchantProfile> => unwrap(await upsertMerchantProfile(input)),
    onSuccess: (data) => {
      queryClient.setQueryData(["merchant-profile", walletAddress], data);
      queryClient.invalidateQueries({
        queryKey: ["merchant-profile", walletAddress],
      });
    },
  });
}
