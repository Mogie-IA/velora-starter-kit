"use client";

import { useState } from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { Check, CheckCircle2, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { WalletButton } from "@/features/marketplace/components/WalletButton";
import { useWalletProof } from "@/features/marketplace/useWalletProof";
import { saveProfile } from "@/app/actions/marketplace";
import { cn } from "@/lib/utils";
import { ROLE_CONTENT } from "@/features/site/content";
import {
  PROFESSION_OPTIONS,
  REGION_OPTIONS,
  SIGNUP_COPY,
  SPECIALTY_OPTIONS,
} from "@/features/site/signup-fields";
import type { MarketplaceRole } from "@/types/marketplace";

/**
 * The three sign-up forms.
 *
 * Fields and copy come from the brief. The role is already chosen by the time
 * anyone gets here — from a landing page CTA or the role picker — so the form
 * never asks again; it only offers a way back if they clicked wrong.
 *
 * Tone here is "committing": confident and brief, and every field that isn't
 * self-explanatory earns its helper line.
 */

interface FormState {
  fullName: string;
  companyName: string;
  email: string;
  phone: string;
  yearsExperience: string;
  location: string;
  specialties: string[];
  profession: string;
  licenseNumber: string;
  licensingBody: string;
  serviceAreas: string[];
  terms: boolean;
}

const EMPTY: FormState = {
  fullName: "",
  companyName: "",
  email: "",
  phone: "",
  yearsExperience: "",
  location: "",
  specialties: [],
  profession: "",
  licenseNumber: "",
  licensingBody: "",
  serviceAreas: [],
  terms: false,
};

type Errors = Partial<Record<keyof FormState, string>>;

export function SignupForm({ role }: { role: MarketplaceRole }) {
  const { connected } = useWallet();
  const { createProof, walletAddress } = useWalletProof();
  const copy = SIGNUP_COPY[role];

  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [systemError, setSystemError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  };

  const toggle = (key: "specialties" | "serviceAreas", value: string) => {
    setForm((f) => {
      const next = f[key].includes(value)
        ? f[key].filter((v) => v !== value)
        : [...f[key], value];
      return { ...f, [key]: next };
    });
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  };

  const validate = (): Errors => {
    const next: Errors = {};

    if (!form.fullName.trim()) next.fullName = "Enter your full name.";
    if (!form.email.includes("@")) next.email = "Enter a valid email address.";
    if (form.phone.replace(/[^\d]/g, "").length < 7) next.phone = "Enter a valid phone number.";
    if (!form.terms) next.terms = "Please agree to the Terms of Service and Privacy Policy to continue.";

    if (role === "contractor") {
      if (!form.companyName.trim()) next.companyName = "Enter your company name.";
      if (!form.location) next.location = "Select where you work.";
      if (form.specialties.length === 0) next.specialties = "Select at least one specialty.";
    }

    if (role === "inspector") {
      if (!form.profession) next.profession = "Select your profession.";
      if (!form.licenseNumber.trim()) next.licenseNumber = "Enter your licence number.";
      if (!form.licensingBody.trim()) next.licensingBody = "Enter the organization that issued your licence.";
      if (form.serviceAreas.length === 0) next.serviceAreas = "Select at least one service area.";
    }

    return next;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSystemError(null);

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    // BRIEF-DEVIATION: the brief's forms end in "Create a password". Velora
    // accounts are wallet accounts — every write is authorised by a signature,
    // and there is no password to store — so connecting a wallet takes its place.
    if (!connected) {
      setSystemError("Connect your wallet to finish creating your account.");
      return;
    }

    setSubmitting(true);
    try {
      const years = Number.parseInt(form.yearsExperience, 10);
      const result = await saveProfile(await createProof("save-profile"), role, {
        displayName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        country: "NG",
        city: role === "contractor" ? form.location : null,
        companyName: role === "contractor" ? form.companyName.trim() : null,
        yearsExperience: Number.isFinite(years) ? years : null,
        specialties: role === "contractor" ? form.specialties : null,
        qualification: role === "inspector" ? form.profession : null,
        licenseNumber: role === "inspector" ? form.licenseNumber.trim() : null,
        serviceAreas: role === "inspector" ? form.serviceAreas : null,
        // BRIEF-DEVIATION: there is no `licensing_body` column yet, so the
        // issuing body is written as the profile's opening line, where it reads
        // naturally on a public profile. Worth a column of its own later.
        bio:
          role === "inspector" ? `Licensed by ${form.licensingBody.trim()}.` : null,
      });

      if (!result.ok) {
        setSystemError(result.error);
        return;
      }
      setDone(role === "contractor" ? form.companyName.trim() : firstName(form.fullName));
    } catch (err) {
      setSystemError(
        err instanceof Error
          ? err.message
          : "We couldn't create your account. This email may already be registered. Try logging in or use a different email address."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (done !== null) {
    return <SuccessScreen role={role} name={done} />;
  }

  return (
    <form noValidate onSubmit={submit} className="space-y-6">
      {role === "contractor" && (
        <Field
          id="companyName"
          label="Company name"
          helper="Or your own name if you work independently."
          error={errors.companyName}
        >
          <Input
            id="companyName"
            value={form.companyName}
            onChange={(v) => set("companyName", v)}
            invalid={Boolean(errors.companyName)}
            autoComplete="organization"
          />
        </Field>
      )}

      <Field
        id="fullName"
        label={role === "contractor" ? "Your full name" : "Full name"}
        error={errors.fullName}
      >
        <Input
          id="fullName"
          value={form.fullName}
          onChange={(v) => set("fullName", v)}
          invalid={Boolean(errors.fullName)}
          autoComplete="name"
        />
      </Field>

      {role === "inspector" && (
        <>
          <Field id="profession" label="What's your profession?" error={errors.profession}>
            <Select
              id="profession"
              value={form.profession}
              onChange={(v) => set("profession", v)}
              invalid={Boolean(errors.profession)}
              placeholder="Choose one"
              options={[...PROFESSION_OPTIONS]}
            />
          </Field>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field
              id="licenseNumber"
              label="Licence number"
              helper="We verify this before your profile goes live."
              error={errors.licenseNumber}
            >
              <Input
                id="licenseNumber"
                value={form.licenseNumber}
                onChange={(v) => set("licenseNumber", v)}
                invalid={Boolean(errors.licenseNumber)}
              />
            </Field>
            <Field id="licensingBody" label="Licensing body" error={errors.licensingBody}>
              <Input
                id="licensingBody"
                value={form.licensingBody}
                onChange={(v) => set("licensingBody", v)}
                invalid={Boolean(errors.licensingBody)}
                placeholder="The organization that issued your licence"
              />
            </Field>
          </div>
        </>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="email" label="Email address" error={errors.email}>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(v) => set("email", v)}
            invalid={Boolean(errors.email)}
            placeholder="name@example.com"
            autoComplete="email"
          />
        </Field>
        <Field
          id="phone"
          label="Phone number"
          // BRIEF-DEVIATION: the brief promises "We'll text a code to confirm
          // it's you." There is no SMS verification, so this says what the
          // number is actually for instead of promising a text that never comes.
          helper={role === "client" ? undefined : "We'll use this to help confirm your account."}
          error={errors.phone}
        >
          <Input
            id="phone"
            type="tel"
            value={form.phone}
            onChange={(v) => set("phone", v)}
            invalid={Boolean(errors.phone)}
            autoComplete="tel"
          />
        </Field>
      </div>

      {role !== "client" && (
        <div className="grid gap-6 sm:grid-cols-2">
          <Field id="yearsExperience" label="Years of experience">
            <Input
              id="yearsExperience"
              type="number"
              value={form.yearsExperience}
              onChange={(v) => set("yearsExperience", v)}
              invalid={false}
            />
          </Field>
          {role === "contractor" && (
            <Field
              id="location"
              label="Where do you work?"
              helper="State or region where you work."
              error={errors.location}
            >
              <Select
                id="location"
                value={form.location}
                onChange={(v) => set("location", v)}
                invalid={Boolean(errors.location)}
                placeholder="Choose a state"
                options={[...REGION_OPTIONS]}
              />
            </Field>
          )}
        </div>
      )}

      {role === "contractor" && (
        <Field id="specialties" label="What do you build?" helper="Select all that apply." error={errors.specialties}>
          <Chips
            options={[...SPECIALTY_OPTIONS]}
            selected={form.specialties}
            onToggle={(v) => toggle("specialties", v)}
          />
        </Field>
      )}

      {role === "inspector" && (
        <Field
          id="serviceAreas"
          label="Where can you inspect?"
          helper="States or regions where you can inspect."
          error={errors.serviceAreas}
        >
          <Chips
            options={[...REGION_OPTIONS]}
            selected={form.serviceAreas}
            onToggle={(v) => toggle("serviceAreas", v)}
          />
        </Field>
      )}

      {/* Wallet, in place of the brief's password field. */}
      <div className="rounded-card border border-outline-variant bg-surface-container-low p-5">
        <p className="text-label-lg font-semibold text-on-surface">Connect your wallet</p>
        <p className="mt-1 text-body-sm text-on-surface-variant">
          Your wallet is your Velora account — no password to lose. You&apos;ll sign a short message
          to prove it&apos;s you. Signing it cannot move any money.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <WalletButton />
          {connected && walletAddress && (
            <span className="inline-flex items-center gap-1.5 text-body-sm text-tertiary">
              <CheckCircle2 className="h-4 w-4" aria-hidden />
              {walletAddress.slice(0, 4)}…{walletAddress.slice(-4)}
            </span>
          )}
        </div>
      </div>

      <div>
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={form.terms}
            onChange={(e) => set("terms", e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 rounded border-outline-variant text-primary focus-visible:ring-2 focus-visible:ring-primary"
          />
          <span className="text-body-sm text-on-surface-variant">
            I agree to Velora&apos;s Terms of Service and Privacy Policy.
          </span>
        </label>
        {errors.terms && <ErrorText>{errors.terms}</ErrorText>}
      </div>

      {systemError && (
        <p
          role="alert"
          className="rounded-[14px] border border-error/30 bg-error-container p-4 text-body-sm text-on-error-container"
        >
          {systemError}
        </p>
      )}

      <div>
        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting ? "Creating your account…" : SIGNUP_COPY[role].submitCta}
        </Button>
        <p className="mt-4 text-center text-body-sm text-on-surface-variant">
          Already have an account?{" "}
          <Link href="/build" className="font-medium text-primary underline underline-offset-4">
            Log in
          </Link>
        </p>
      </div>
    </form>
  );
}

function SuccessScreen({ role, name }: { role: MarketplaceRole; name: string }) {
  const { success } = SIGNUP_COPY[role];
  return (
    <div className="rounded-card border border-outline-variant bg-surface-container-lowest p-8 text-center shadow-surface sm:p-10">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-tertiary-container text-on-tertiary-container">
        <Check className="h-6 w-6" aria-hidden />
      </span>
      <h2 className="mt-5 text-headline-md font-semibold text-on-surface">{success.title(name)}</h2>
      <p className="mx-auto mt-3 max-w-md text-body-md text-on-surface-variant">{success.body}</p>

      {success.status && (
        <p className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full bg-surface-container px-3.5 py-1.5 text-body-sm text-on-surface-variant">
          <Clock className="h-4 w-4" aria-hidden />
          {success.status}
        </p>
      )}

      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <Button asChild size="lg">
          <Link href={success.href}>{success.cta}</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href={success.secondaryHref}>{success.secondaryCta}</Link>
        </Button>
      </div>

      <p className="mt-5 text-body-sm text-on-surface-variant">
        Or{" "}
        <Link href={ROLE_CONTENT[role].path} className="text-primary underline underline-offset-4">
          read how it works
        </Link>{" "}
        first.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Field primitives
// ---------------------------------------------------------------------------

function Field({
  id,
  label,
  helper,
  error,
  children,
}: {
  id: string;
  label: string;
  helper?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-label-lg font-medium text-on-surface">
        {label}
      </label>
      {helper && <p className="text-body-sm text-on-surface-variant">{helper}</p>}
      {children}
      {error && <ErrorText>{error}</ErrorText>}
    </div>
  );
}

function ErrorText({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="text-body-sm text-error">
      {children}
    </p>
  );
}

const controlClass =
  "h-12 w-full rounded-input border bg-surface-container-lowest px-3.5 text-body-md text-on-surface outline-none transition-colors placeholder:text-outline focus-visible:ring-2 focus-visible:ring-primary";

function Input({
  id,
  value,
  onChange,
  invalid,
  type = "text",
  placeholder,
  autoComplete,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  invalid: boolean;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      placeholder={placeholder}
      autoComplete={autoComplete}
      aria-invalid={invalid || undefined}
      onChange={(e) => onChange(e.target.value)}
      className={cn(controlClass, invalid ? "border-error" : "border-outline-variant")}
    />
  );
}

function Select({
  id,
  value,
  onChange,
  invalid,
  placeholder,
  options,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  invalid: boolean;
  placeholder: string;
  options: string[];
}) {
  return (
    <select
      id={id}
      value={value}
      aria-invalid={invalid || undefined}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        controlClass,
        invalid ? "border-error" : "border-outline-variant",
        value ? "text-on-surface" : "text-outline"
      )}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

function Chips({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = selected.includes(option);
        return (
          <button
            key={option}
            type="button"
            aria-pressed={active}
            onClick={() => onToggle(option)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-label-md transition-colors",
              active
                ? "border-primary bg-primary text-on-primary"
                : "border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:border-primary/40 hover:text-on-surface"
            )}
          >
            {active && <Check className="h-3.5 w-3.5" aria-hidden />}
            {option}
          </button>
        );
      })}
    </div>
  );
}

function firstName(full: string): string {
  return full.trim().split(/\s+/)[0] || full.trim();
}
