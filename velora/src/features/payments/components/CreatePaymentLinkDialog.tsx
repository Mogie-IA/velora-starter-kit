"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createPaymentLinkSchema, CURRENCIES } from "../schemas";
import { useCreatePaymentLink } from "../hooks/usePaymentLinks";
import type { Currency, PaymentLink } from "../types";

interface CreatePaymentLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  merchantWallet: string;
  merchantName: string;
  merchantUserId: string | null;
  onCreated: (link: PaymentLink) => void;
}

type FieldErrors = Partial<
  Record<"title" | "description" | "amount" | "customerContact" | "expiresAt" | "form", string>
>;

const EMPTY = {
  title: "",
  description: "",
  amount: "",
  currency: "SOL" as Currency,
  customerContact: "",
  expiresAt: "",
  saveAsDraft: false,
};

export function CreatePaymentLinkDialog({
  open,
  onOpenChange,
  merchantWallet,
  merchantName,
  merchantUserId,
  onCreated,
}: CreatePaymentLinkDialogProps) {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const createMutation = useCreatePaymentLink(merchantWallet);

  function reset() {
    setValues(EMPTY);
    setErrors({});
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const parsed = createPaymentLinkSchema.safeParse(values);
    if (!parsed.success) {
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FieldErrors;
        if (key && !next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }

    try {
      const link = await createMutation.mutateAsync({
        ...parsed.data,
        merchantWallet,
        merchantName,
        merchantUserId,
      });
      reset();
      onOpenChange(false);
      onCreated(link);
    } catch (err) {
      setErrors({
        form: err instanceof Error ? err.message : "Failed to create payment link.",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New payment link</DialogTitle>
          <DialogDescription>
            Create a shareable checkout link. Payments settle to your connected
            wallet on Solana Devnet.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="pl-title">Title</Label>
            <Input
              id="pl-title"
              placeholder="e.g. Pro plan — one-time setup"
              value={values.title}
              onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
              autoFocus
            />
            <FieldError message={errors.title} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pl-description">Description (optional)</Label>
            <Textarea
              id="pl-description"
              placeholder="What is the customer paying for?"
              value={values.description}
              onChange={(e) =>
                setValues((v) => ({ ...v, description: e.target.value }))
              }
            />
            <FieldError message={errors.description} />
          </div>

          <div className="grid grid-cols-[1fr_120px] gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="pl-amount">Amount</Label>
              <Input
                id="pl-amount"
                type="number"
                inputMode="decimal"
                step="any"
                min="0"
                placeholder="0.00"
                value={values.amount}
                onChange={(e) =>
                  setValues((v) => ({ ...v, amount: e.target.value }))
                }
              />
              <FieldError message={errors.amount} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pl-currency">Currency</Label>
              <select
                id="pl-currency"
                className="velora-input"
                value={values.currency}
                onChange={(e) =>
                  setValues((v) => ({ ...v, currency: e.target.value as Currency }))
                }
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pl-contact">Customer email or wallet (optional)</Label>
            <Input
              id="pl-contact"
              placeholder="name@email.com or wallet address"
              value={values.customerContact}
              onChange={(e) =>
                setValues((v) => ({ ...v, customerContact: e.target.value }))
              }
            />
            <FieldError message={errors.customerContact} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pl-expiry">Expires (optional)</Label>
            <Input
              id="pl-expiry"
              type="datetime-local"
              value={values.expiresAt}
              onChange={(e) =>
                setValues((v) => ({ ...v, expiresAt: e.target.value }))
              }
            />
            <FieldError message={errors.expiresAt} />
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-[#c9c4d9] text-[#5427e6] focus:ring-[#5427e6]"
              checked={values.saveAsDraft}
              onChange={(e) =>
                setValues((v) => ({ ...v, saveAsDraft: e.target.checked }))
              }
            />
            <span className="text-label-md text-[#484556]">
              Save as draft (not payable until activated)
            </span>
          </label>

          {errors.form && (
            <p className="text-label-md text-[#ba1a1a] bg-[#fdf3f3] rounded-[12px] px-3 py-2.5">
              {errors.form}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-1">
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating…" : "Create link"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-label-sm text-[#ba1a1a]">{message}</p>;
}
