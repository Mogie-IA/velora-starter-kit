"use client";

import { useState } from "react";
import { CheckCircle2, ExternalLink, Copy, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MerchantAvatar } from "@/features/merchant/components/MerchantAvatar";
import { shortenAddress, getExplorerTxUrl } from "@/lib/solana/config";
import { formatAmount } from "../../format";
import type { PaymentReceipt as Receipt } from "../../types";

export function PaymentReceipt({
  receipt,
  merchantLogoUrl,
}: {
  receipt: Receipt;
  merchantLogoUrl?: string | null;
}) {
  const { payment, link } = receipt;
  const [copied, setCopied] = useState(false);

  async function copySignature() {
    if (!payment.tx_signature) return;
    try {
      await navigator.clipboard.writeText(payment.tx_signature);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable — no-op */
    }
  }

  return (
    <div className="flex flex-col items-center text-center animate-slide-up">
      <div className="w-16 h-16 rounded-full bg-[rgba(0,125,81,0.1)] flex items-center justify-center mb-4 animate-receipt-pop">
        <CheckCircle2 className="w-9 h-9 text-[#007d51]" />
      </div>
      <h2 className="text-headline-md text-[#1a1b21]">Payment successful</h2>
      <p className="text-body-md text-[#484556] mt-1">
        Your receipt for <strong>{link.title}</strong>
      </p>

      <div className="mt-4 flex items-center gap-2">
        <MerchantAvatar
          name={link.merchant_name}
          logoUrl={merchantLogoUrl}
          size={24}
        />
        <span className="text-label-md text-[#484556]">
          {link.merchant_name}
        </span>
      </div>

      <div className="w-full bg-[#f4f3fb] rounded-[16px] border border-[#e8e7ef] p-5 mt-6 text-left space-y-3">
        <Row label="Amount">
          <span className="font-semibold text-[#1a1b21]">
            {formatAmount(Number(payment.amount), link.currency)}
          </span>
        </Row>
        <Row label="Currency">{link.currency}</Row>
        <Row label="Paid to">{link.merchant_name}</Row>
        <Row label="Merchant wallet">
          <span className="font-mono">{shortenAddress(link.merchant_wallet)}</span>
        </Row>
        <Row label="From wallet">
          <span className="font-mono">{shortenAddress(payment.payer_wallet)}</span>
        </Row>
        <Row label="Date">
          {new Date(payment.confirmed_at ?? payment.created_at).toLocaleString()}
        </Row>
        <Row label="Status">
          <Badge variant="success">Confirmed</Badge>
        </Row>
        <Row label="Network">
          <Badge variant="warning">Devnet</Badge>
        </Row>
        <Row label="Transaction">
          {payment.tx_signature ? (
            <a
              href={getExplorerTxUrl(payment.tx_signature)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[#5427e6] font-mono"
            >
              {shortenAddress(payment.tx_signature, 6)}
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : (
            <span className="text-[#797588]">—</span>
          )}
        </Row>
      </div>

      <div className="w-full flex flex-col sm:flex-row gap-3 mt-6">
        {payment.tx_signature && (
          <Button
            variant="secondary"
            onClick={copySignature}
            className="flex-1 inline-flex items-center justify-center gap-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy signature
              </>
            )}
          </Button>
        )}
        <a href="/merchant/payments" className="btn-primary flex-1 text-center">
          Back to dashboard
        </a>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 text-body-sm">
      <span className="text-[#797588]">{label}</span>
      <span className="text-[#1a1b21] text-right">{children}</span>
    </div>
  );
}
