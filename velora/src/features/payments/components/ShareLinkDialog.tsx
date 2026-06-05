"use client";

import { useMemo } from "react";
import { ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CopyButton } from "./CopyButton";
import { PaymentLinkQR } from "./PaymentLinkQR";
import { StatusBadge } from "./StatusBadge";
import { effectiveStatus } from "../status";
import { formatAmount } from "../format";
import type { PaymentLink } from "../types";

interface ShareLinkDialogProps {
  link: PaymentLink | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareLinkDialog({ link, open, onOpenChange }: ShareLinkDialogProps) {
  const checkoutUrl = useMemo(() => {
    if (!link) return "";
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/checkout/${link.slug}`;
  }, [link]);

  if (!link) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share payment link</DialogTitle>
          <DialogDescription>
            Anyone with this link can pay <strong>{link.title}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
          <PaymentLinkQR value={checkoutUrl} size={196} />

          <div className="flex items-center gap-3">
            <span className="text-headline-sm text-[#1a1b21]">
              {formatAmount(Number(link.amount), link.currency)}
            </span>
            <StatusBadge status={effectiveStatus(link)} />
          </div>
        </div>

        <div className="space-y-1.5 mt-5">
          <Label htmlFor="share-url">Checkout link</Label>
          <div className="flex gap-2">
            <Input id="share-url" readOnly value={checkoutUrl} className="font-mono text-[13px]" />
            <CopyButton value={checkoutUrl} label="Copy" />
          </div>
        </div>

        <a
          href={checkoutUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary w-full mt-3 inline-flex items-center justify-center gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          Open checkout page
        </a>
      </DialogContent>
    </Dialog>
  );
}
