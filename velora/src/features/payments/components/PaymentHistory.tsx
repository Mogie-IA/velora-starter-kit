"use client";

import { useMemo, useState } from "react";
import {
  Receipt,
  ExternalLink,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  XCircle,
  Check,
  Copy,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  getExplorerTxUrl,
  shortenAddress,
} from "@/lib/solana/config";
import { useMerchantPayments } from "../hooks/usePaymentLinks";
import { formatAmount } from "../format";
import type { Currency, PaymentStatus } from "../types";

const STATUS_VARIANT: Record<PaymentStatus, "success" | "warning" | "error"> = {
  confirmed: "success",
  pending: "warning",
  failed: "error",
};

const STATUS_ICON: Record<PaymentStatus, React.ElementType> = {
  confirmed: CheckCircle2,
  pending: Clock,
  failed: XCircle,
};

type Filter = "all" | PaymentStatus;

function StatusBadge({ status }: { status: PaymentStatus }) {
  const Icon = STATUS_ICON[status];
  return (
    <Badge variant={STATUS_VARIANT[status]}>
      <Icon className="w-3 h-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

function CopySignature({ signature }: { signature: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(signature);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard may be unavailable (insecure context); fail silently.
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      aria-label="Copy transaction signature"
      className="text-[#797588] hover:text-[#5427e6] transition-colors"
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-[#007d51]" />
      ) : (
        <Copy className="w-3.5 h-3.5" />
      )}
    </button>
  );
}

export function PaymentHistory({ merchantWallet }: { merchantWallet: string | null }) {
  const { data: payments, isLoading, error } = useMerchantPayments(merchantWallet);
  const [filter, setFilter] = useState<Filter>("all");

  const counts = useMemo(() => {
    const base = { all: 0, confirmed: 0, pending: 0, failed: 0 };
    if (!payments) return base;
    for (const p of payments) {
      base.all += 1;
      base[p.status] += 1;
    }
    return base;
  }, [payments]);

  const filtered = useMemo(() => {
    if (!payments) return [];
    if (filter === "all") return payments;
    return payments.filter((p) => p.status === filter);
  }, [payments, filter]);

  if (!merchantWallet) return null;

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "confirmed", label: "Confirmed" },
    { key: "pending", label: "Pending" },
    { key: "failed", label: "Failed" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-headline-md text-[#1a1b21] mb-1">Payment history</h2>
          <p className="text-body-md text-[#484556]">
            Every payment received across your links, with on-chain transaction
            details.
          </p>
        </div>
      </div>

      {/* Status filter */}
      {!isLoading && !error && payments && payments.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-label-sm font-medium transition-colors border",
                filter === f.key
                  ? "bg-[#1a1b21] text-white border-[#1a1b21]"
                  : "bg-white text-[#484556] border-[#e8e7ef] hover:border-[#c9c4d9]"
              )}
            >
              {f.label}
              <span
                className={cn(
                  "tabular-nums rounded-full px-1.5 text-[11px]",
                  filter === f.key
                    ? "bg-white/20 text-white"
                    : "bg-[#f4f3fb] text-[#797588]"
                )}
              >
                {counts[f.key]}
              </span>
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <HistorySkeleton />
      ) : error ? (
        <Card hoverable={false} className="p-5">
          <p className="text-body-sm text-[#484556]">
            Couldn&apos;t load payment history: {(error as Error).message}
          </p>
        </Card>
      ) : payments && payments.length > 0 ? (
        filtered.length > 0 ? (
          <Card hoverable={false} className="overflow-hidden p-0">
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#eeedf5] text-label-sm text-[#797588]">
                    <th className="px-5 py-3 font-medium">Payment</th>
                    <th className="px-5 py-3 font-medium">Amount</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium">Transaction</th>
                    <th className="px-5 py-3 font-medium text-right">View</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-[#f4f3fb] last:border-0 text-body-sm"
                    >
                      <td className="px-5 py-3.5 text-[#1a1b21] font-medium">
                        {p.payment_links?.title ?? "Payment"}
                      </td>
                      <td className="px-5 py-3.5 text-[#1a1b21]">
                        {formatAmount(Number(p.amount), p.currency as Currency)}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="px-5 py-3.5 text-[#484556]">
                        {new Date(p.confirmed_at ?? p.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5">
                        {p.tx_signature ? (
                          <span className="inline-flex items-center gap-2">
                            <a
                              href={getExplorerTxUrl(p.tx_signature)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[#5427e6] font-mono"
                            >
                              {shortenAddress(p.tx_signature, 6)}
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                            <CopySignature signature={p.tx_signature} />
                          </span>
                        ) : (
                          <span className="text-[#797588]">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {p.payment_links?.slug ? (
                          <a
                            href={`/checkout/${p.payment_links.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[#5427e6]"
                          >
                            Payment
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </a>
                        ) : (
                          <span className="text-[#797588]">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-[#f4f3fb]">
              {filtered.map((p) => (
                <div key={p.id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-title-sm font-semibold text-[#1a1b21] truncate">
                      {p.payment_links?.title ?? "Payment"}
                    </span>
                    <StatusBadge status={p.status} />
                  </div>
                  <div className="flex items-center justify-between text-body-sm">
                    <span className="text-[#1a1b21] font-medium">
                      {formatAmount(Number(p.amount), p.currency as Currency)}
                    </span>
                    <span className="text-[#484556]">
                      {new Date(p.confirmed_at ?? p.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-body-sm">
                    {p.tx_signature ? (
                      <span className="inline-flex items-center gap-2">
                        <a
                          href={getExplorerTxUrl(p.tx_signature)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[#5427e6] font-mono"
                        >
                          {shortenAddress(p.tx_signature, 6)}
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <CopySignature signature={p.tx_signature} />
                      </span>
                    ) : (
                      <span className="text-[#797588]">No signature</span>
                    )}
                    {p.payment_links?.slug && (
                      <a
                        href={`/checkout/${p.payment_links.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#5427e6]"
                      >
                        Payment
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <Card hoverable={false} className="p-8 flex flex-col items-center text-center">
            <p className="text-body-md text-[#484556]">
              No {filter} payments.
            </p>
          </Card>
        )
      ) : (
        <EmptyHistory />
      )}
    </div>
  );
}

function HistorySkeleton() {
  return (
    <Card hoverable={false} className="p-5 space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="h-4 w-40 bg-[#e2e2e9] rounded-full animate-pulse" />
          <div className="h-4 w-20 bg-[#eeedf5] rounded-full animate-pulse" />
          <div className="h-4 w-16 bg-[#eeedf5] rounded-full animate-pulse ml-auto" />
        </div>
      ))}
    </Card>
  );
}

function EmptyHistory() {
  return (
    <Card hoverable={false} className="p-10 flex flex-col items-center text-center">
      <div className="w-14 h-14 rounded-[16px] bg-[rgba(84,39,230,0.08)] flex items-center justify-center mb-4">
        <Receipt className="w-6 h-6 text-[#5427e6]" />
      </div>
      <h3 className="text-title-md font-semibold text-[#1a1b21]">No payments yet</h3>
      <p className="text-body-md text-[#484556] mt-1 max-w-sm">
        When a customer pays one of your links, the transaction will appear here
        with its on-chain signature.
      </p>
    </Card>
  );
}
