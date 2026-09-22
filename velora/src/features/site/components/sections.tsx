"use client";

import { useState } from "react";
import { ChevronDown, Lock, Wallet, Zap } from "lucide-react";

import { cn } from "@/lib/utils";
import { TRUST_BADGES, type FaqItem } from "@/features/site/content";

/**
 * The repeating blocks shared by all three landing pages.
 *
 * Tone is set per section, per the brief: pain sections name the fear plainly,
 * how-it-works sections are one idea per numbered step, and fee sections lead
 * with the number instead of burying it in a sentence.
 */

export function Section({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={cn("scroll-mt-20 py-16 sm:py-20", className)}>
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">{children}</div>
    </section>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="max-w-3xl text-headline-lg font-semibold tracking-tight text-on-surface sm:text-[36px] sm:leading-[1.15]">
      {children}
    </h2>
  );
}

/** Three plain-language badges. No jargon, no icons that need explaining. */
export function TrustStrip() {
  const icons = [Lock, Wallet, Zap];
  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <ul className="grid gap-3 rounded-card border border-outline-variant bg-surface-container-lowest p-3 shadow-surface sm:grid-cols-3">
        {TRUST_BADGES.map((badge, i) => {
          const Icon = icons[i];
          return (
            <li key={badge} className="flex items-start gap-3 rounded-[16px] px-3 py-3">
              <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-primary-fixed text-primary">
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <span className="text-body-sm font-medium text-on-surface">{badge}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Numbered steps. The number is the visual anchor, one idea per step. */
export function Steps({ steps }: { steps: Array<{ title: string; body: string }> }) {
  return (
    <ol className="mt-10 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
      {steps.map((step, i) => (
        <li key={step.title} className="flex gap-4">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-title-sm font-bold text-on-primary">
            {i + 1}
          </span>
          <div className="pt-1">
            <h3 className="text-title-sm font-semibold text-on-surface">{step.title}</h3>
            <p className="mt-1.5 text-body-md text-on-surface-variant">{step.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Fee section: the percentage is the headline, never buried in prose. */
export function FeeCallout({ rate, body }: { rate: string; body: string }) {
  return (
    <div className="mt-8 flex flex-col gap-6 rounded-card border border-outline-variant bg-surface-container-lowest p-8 shadow-surface sm:flex-row sm:items-center sm:gap-10">
      <p className="text-display-sm leading-none text-primary">{rate}</p>
      <p className="max-w-xl text-body-lg text-on-surface-variant">{body}</p>
    </div>
  );
}

export function Faq({ items }: { items: FaqItem[] }) {
  return (
    <div className="mt-8 max-w-3xl divide-y divide-outline-variant border-y border-outline-variant">
      {items.map((item) => (
        <FaqRow key={item.q} item={item} />
      ))}
    </div>
  );
}

function FaqRow({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-start justify-between gap-6 py-5 text-left"
      >
        <span className="text-title-sm font-semibold text-on-surface">{item.q}</span>
        <ChevronDown
          aria-hidden
          className={cn(
            "mt-0.5 h-5 w-5 shrink-0 text-on-surface-variant transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      {open && <p className="-mt-1 pb-5 pr-10 text-body-md text-on-surface-variant">{item.a}</p>}
    </div>
  );
}
