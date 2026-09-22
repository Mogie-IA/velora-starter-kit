"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";

import { Button } from "@/components/ui/button";
import { postJob } from "@/app/actions/marketplace";
import { useWalletProof } from "@/features/marketplace/useWalletProof";

export default function NewJobPage() {
  const router = useRouter();
  const { connected } = useWallet();
  const { createProof } = useWalletProof();

  const [form, setForm] = useState({
    title: "",
    description: "",
    locationCity: "",
    locationState: "",
    budgetMin: "",
    budgetMax: "",
    expectedMilestones: "4",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await postJob(await createProof("post-job"), {
        title: form.title.trim(),
        description: form.description.trim(),
        locationCity: form.locationCity.trim(),
        locationState: form.locationState.trim() || null,
        country: "NG",
        budgetMinUsd: form.budgetMin ? Number(form.budgetMin) : null,
        budgetMaxUsd: form.budgetMax ? Number(form.budgetMax) : null,
        expectedMilestones: Number(form.expectedMilestones) || 4,
      });

      if (!res.ok) setError(res.error);
      else router.push(`/build/jobs/${res.data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not post the job");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-headline-md font-semibold text-on-surface">Post a build</h1>
      <p className="mt-2 max-w-prose text-body-md text-on-surface-variant">
        Describe what you want built. Contractors bid, you choose, and your money stays in escrow
        until each stage is verified.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-5">
        <Field label="What are you building?" htmlFor="title">
          <input
            id="title"
            required
            value={form.title}
            onChange={set("title")}
            placeholder="Three-bedroom bungalow, Enugu"
            className={inputClass}
          />
        </Field>

        <Field label="Describe the work" htmlFor="description">
          <textarea
            id="description"
            required
            rows={5}
            value={form.description}
            onChange={set("description")}
            placeholder="Plot size, storeys, finish level, anything a contractor needs to quote accurately."
            className={`${inputClass} h-auto py-3`}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="City" htmlFor="city">
            <input
              id="city"
              required
              value={form.locationCity}
              onChange={set("locationCity")}
              placeholder="Enugu"
              className={inputClass}
            />
          </Field>
          <Field label="State (optional)" htmlFor="state">
            <input
              id="state"
              value={form.locationState}
              onChange={set("locationState")}
              placeholder="Enugu State"
              className={inputClass}
            />
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Budget from (USD)" htmlFor="min">
            <input
              id="min"
              type="number"
              min="0"
              value={form.budgetMin}
              onChange={set("budgetMin")}
              placeholder="20000"
              className={inputClass}
            />
          </Field>
          <Field label="Budget to (USD)" htmlFor="max">
            <input
              id="max"
              type="number"
              min="0"
              value={form.budgetMax}
              onChange={set("budgetMax")}
              placeholder="35000"
              className={inputClass}
            />
          </Field>
          <Field label="Number of stages" htmlFor="stages">
            <input
              id="stages"
              type="number"
              min="1"
              max="12"
              value={form.expectedMilestones}
              onChange={set("expectedMilestones")}
              className={inputClass}
            />
          </Field>
        </div>

        {error && (
          <p role="alert" className="text-body-sm text-error">
            {error}
          </p>
        )}

        <Button type="submit" disabled={saving || !connected}>
          {saving ? "Posting…" : connected ? "Post job" : "Connect wallet to post"}
        </Button>
      </form>
    </div>
  );
}

const inputClass =
  "h-12 w-full rounded-[12px] border border-outline-variant bg-surface-container-lowest px-3 text-body-md text-on-surface outline-none placeholder:text-outline focus-visible:ring-2 focus-visible:ring-primary";

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="text-label-md font-medium text-on-surface">
        {label}
      </label>
      {children}
    </div>
  );
}
