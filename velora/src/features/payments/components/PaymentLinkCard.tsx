"use client";

import { useMemo } from "react";
import { Share2, ExternalLink, Power } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "./StatusBadge";
import { CopyButton } from "./CopyButton";
import { effectiveStatus } from "../status";
import { formatAmount, formatDate } from "../format";
import { useSetPaymentLinkStatus } from "../hooks/usePaymentLinks";
import type { PaymentLink } from "../types";

interface PaymentLinkCardProps {
  link: PaymentLink;
  merchantWallet: string;
  onShare: (link: PaymentLink) => void;
}

export function PaymentLinkCard({ link, merchantWallet, onShare }: PaymentLinkCardProps) {
  const status = effectiveStatus(link);
  const setStatus = useSetPaymentLinkStatus(merchantWallet);

  const checkoutUrl = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/checkout/${link.slug}`;
  }, [link.slug]);

  return (
    <Card hoverable={false} className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-title-md font-semibold text-[#1a1b21] truncate">
            {link.title}
          </h3>
          {link.description && (
            <p className="text-body-sm text-[#484556] mt-0.5 line-clamp-2">
              {link.description}
            </p>
          )}
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="flex items-baseline gap-2 mt-4">
        <span className="text-headline-sm text-[#1a1b21]">
          {formatAmount(Number(link.amount), link.currency)}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-label-sm text-[#797588]">
        <span>Created {formatDate(link.created_at)}</span>
        {link.expires_at && <span>Expires {formatDate(link.expires_at)}</span>}
        {link.customer_contact && (
          <span className="truncate max-w-[180px]">For {link.customer_contact}</span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-[#eeedf5]">
        <button
          type="button"
          onClick={() => onShare(link)}
          className="btn-secondary inline-flex items-center gap-2"
        >
          <Share2 className="w-4 h-4" />
          Share
        </button>
        <CopyButton value={checkoutUrl} label="Copy link" />
        <a
          href={checkoutUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost inline-flex items-center gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          View
        </a>
        {status === "draft" && (
          <button
            type="button"
            onClick={() => setStatus.mutate({ id: link.id, status: "active" })}
            disabled={setStatus.isPending}
            className="btn-ghost inline-flex items-center gap-2 text-[#5427e6]"
          >
            <Power className="w-4 h-4" />
            {setStatus.isPending ? "Activating…" : "Activate"}
          </button>
        )}
      </div>
    </Card>
  );
}
