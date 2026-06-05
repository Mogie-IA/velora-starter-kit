"use client";

import { useState } from "react";
import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { shortenAddress } from "@/lib/solana/config";
import { LogoUploader } from "./LogoUploader";
import { useUpsertMerchantProfile } from "../hooks/useMerchantProfile";
import { merchantProfileSchema } from "../schemas";
import type { MerchantProfile } from "../types";

interface MerchantProfileFormProps {
  walletAddress: string;
  profile: MerchantProfile | null;
  /** Compact spacing for use inside the onboarding dialog. */
  compact?: boolean;
  submitLabel?: string;
  onSaved?: (profile: MerchantProfile) => void;
}

type FieldErrors = Partial<Record<string, string>>;

export function MerchantProfileForm({
  walletAddress,
  profile,
  compact = false,
  submitLabel = "Save profile",
  onSaved,
}: MerchantProfileFormProps) {
  const upsert = useUpsertMerchantProfile(walletAddress);

  const [businessName, setBusinessName] = useState(profile?.business_name ?? "");
  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [description, setDescription] = useState(profile?.description ?? "");
  const [website, setWebsite] = useState(profile?.website ?? "");
  const [supportEmail, setSupportEmail] = useState(profile?.support_email ?? "");
  const [logoUrl, setLogoUrl] = useState(profile?.logo_url ?? "");

  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSaved(false);

    const parsed = merchantProfileSchema.safeParse({
      businessName,
      displayName,
      description,
      website,
      supportEmail,
      logoUrl,
    });

    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !fieldErrors[key]) {
          fieldErrors[key] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});

    try {
      const result = await upsert.mutateAsync({
        walletAddress,
        businessName: parsed.data.businessName,
        displayName: parsed.data.displayName || null,
        description: parsed.data.description || null,
        website: parsed.data.website || null,
        supportEmail: parsed.data.supportEmail || null,
        logoUrl: parsed.data.logoUrl || null,
      });
      setSaved(true);
      onSaved?.(result);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Could not save your profile."
      );
    }
  }

  const gap = compact ? "space-y-4" : "space-y-5";

  return (
    <form onSubmit={handleSubmit} className={gap}>
      <Field
        id="businessName"
        label="Business name"
        required
        error={errors.businessName}
      >
        <Input
          id="businessName"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder="Acme Coffee Co."
          maxLength={80}
        />
      </Field>

      <Field
        id="displayName"
        label="Display name"
        hint="Shown on the dashboard greeting. Defaults to your business name."
        error={errors.displayName}
      >
        <Input
          id="displayName"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Acme"
          maxLength={60}
        />
      </Field>

      <Field
        id="description"
        label="Description"
        hint="A short line customers see at checkout."
        error={errors.description}
      >
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Specialty coffee, roasted to order."
          maxLength={500}
        />
      </Field>

      <div className="space-y-1.5">
        <Label>Logo</Label>
        <LogoUploader
          walletAddress={walletAddress}
          businessName={businessName || displayName}
          value={logoUrl}
          onChange={setLogoUrl}
        />
        {errors.logoUrl && (
          <p className="text-label-sm text-[#ba1a1a]">{errors.logoUrl}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field id="website" label="Website" error={errors.website}>
          <Input
            id="website"
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://acme.coffee"
          />
        </Field>

        <Field
          id="supportEmail"
          label="Support email"
          error={errors.supportEmail}
        >
          <Input
            id="supportEmail"
            type="email"
            value={supportEmail}
            onChange={(e) => setSupportEmail(e.target.value)}
            placeholder="hello@acme.coffee"
          />
        </Field>
      </div>

      <div className="flex items-center gap-2 rounded-[12px] bg-[#f4f3fb] px-4 py-3">
        <span className="w-2 h-2 rounded-full bg-[#007d51] flex-shrink-0" />
        <p className="text-label-sm text-[#484556]">
          Receiving wallet:{" "}
          <span className="font-mono text-[#1a1b21]">
            {shortenAddress(walletAddress)}
          </span>{" "}
          · Devnet
        </p>
      </div>

      {formError && (
        <div className="flex items-start gap-2 text-label-md text-[#ba1a1a] bg-[#fdf3f3] rounded-[12px] px-3 py-2.5">
          <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{formError}</span>
        </div>
      )}

      <div className="flex items-center gap-3 pt-1">
        <Button
          type="submit"
          variant="primary"
          disabled={upsert.isPending}
          className="inline-flex items-center gap-2"
        >
          {upsert.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {upsert.isPending ? "Saving…" : submitLabel}
        </Button>
        {saved && !upsert.isPending && (
          <span className="text-label-sm text-[#007d51]">
            Saved ✓
          </span>
        )}
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  hint,
  required,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-[#ba1a1a]"> *</span>}
      </Label>
      {children}
      {error ? (
        <p className="text-label-sm text-[#ba1a1a]">{error}</p>
      ) : hint ? (
        <p className="text-label-sm text-[#797588]">{hint}</p>
      ) : null}
    </div>
  );
}
