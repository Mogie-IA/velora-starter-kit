"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createPaymentLink,
  listPaymentLinks,
  listPaymentsForMerchant,
  setPaymentLinkStatus,
} from "@/app/actions/payments";
import type {
  ActionResult,
  CreatePaymentLinkInput,
  PaymentLink,
} from "../types";

function unwrap<T>(result: ActionResult<T>): T {
  if (!result.ok) throw new Error(result.error);
  return result.data;
}

export function usePaymentLinks(merchantWallet: string | null) {
  return useQuery({
    queryKey: ["payment-links", merchantWallet],
    enabled: Boolean(merchantWallet),
    queryFn: async () => unwrap(await listPaymentLinks(merchantWallet ?? "")),
  });
}

export function useCreatePaymentLink(merchantWallet: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreatePaymentLinkInput): Promise<PaymentLink> =>
      unwrap(await createPaymentLink(input)),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["payment-links", merchantWallet],
      });
    },
  });
}

export function useMerchantPayments(merchantWallet: string | null) {
  return useQuery({
    queryKey: ["merchant-payments", merchantWallet],
    enabled: Boolean(merchantWallet),
    queryFn: async () =>
      unwrap(await listPaymentsForMerchant(merchantWallet ?? "")),
  });
}

export function useSetPaymentLinkStatus(merchantWallet: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: string; status: "draft" | "active" }) =>
      unwrap(await setPaymentLinkStatus(vars.id, vars.status)),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["payment-links", merchantWallet],
      });
    },
  });
}
