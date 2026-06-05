"use client";

import { CheckCircle2, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { shortenAddress, getExplorerTxUrl } from "@/lib/solana/config";
import { formatAmount } from "../../format";
import type { PaymentReceipt as Receipt } from "../../types";

export function PaymentReceipt({ receipt }: { receipt: Receipt }) {
  const { payment, link } = receipt;

  return (
    <div className="flex flex-col items-center text-center animate-slide-up">
      <div className="w-16 h-16 rounded-full bg-[rgba(0,125,81,0.1)] flex items-center justify-center mb-4">
        <CheckCircle2 className="w-9 h-9 text-[#007d51]" />
      </div>
      <h2 className="text-headline-md text-[#1a1b21]">Payment successful</h2>
      <p className="text-body-md text-[#484556] mt-1">
        Your receipt for <strong>{link.title}</strong>
      </p>

      <div className="w-full bg-[#f4f3fb] rounded-[16px] border border-[#e8e7ef] p-5 mt-6 text-left space-y-3">
        <Row label="Amount">
          <span className="font-semibold text-[#1a1b21]">
            {formatAmount(Number(payment.amount), link.currency)}
          </span>
        </Row>
        <Row label="Paid to">{link.merchant_name}</Row>
        <Row label="From wallet">
          <span className="font-mono">{shortenAddress(payment.payer_wallet)}</span>
        </Row>
        <Row label="Date">
          {new Date(payment.confirmed_at ?? payment.created_at).toLocaleString()}
        </Row>
        <Row label="Network">
          <Badge variant="warning">Devnet · Test</Badge>
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
            <span className="text-[#797588]">Simulated — no on-chain signature</span>
          )}
        </Row>
      </div>

      <p className="text-label-sm text-[#797588] mt-4 max-w-sm">
        This is a Phase 2 foundation receipt. No real funds were transferred —
        on-chain settlement arrives in a later phase.
      </p>
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
