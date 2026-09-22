"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Block, Cta, FaqItem, Item } from "@/features/site/content";

/**
 * The building blocks the landing pages are assembled from.
 *
 * Each page is a list of blocks rather than a fixed template, because the
 * three roles need the same components in different orders and quantities.
 * Backgrounds alternate automatically so sections stay visually separated
 * without every page having to specify it.
 */

export function Section({
  id,
  tone = "default",
  className,
  children,
}: {
  id?: string;
  tone?: "default" | "muted";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-20 py-16 sm:py-20",
        tone === "muted" && "border-y border-outline-variant bg-surface-container-low",
        className
      )}
    >
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">{children}</div>
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  body,
}: {
  eyebrow?: string;
  title: string;
  body?: string[];
}) {
  return (
    <div className="max-w-3xl">
      {eyebrow && (
        <p className="text-label-sm uppercase tracking-wide text-primary">{eyebrow}</p>
      )}
      <h2
        className={cn(
          "text-headline-lg font-semibold tracking-tight text-on-surface sm:text-[36px] sm:leading-[1.15]",
          eyebrow && "mt-3"
        )}
      >
        {title}
      </h2>
      {body?.map((paragraph) => (
        <p key={paragraph} className="mt-4 text-body-lg text-on-surface-variant">
          {paragraph}
        </p>
      ))}
    </div>
  );
}

function Actions({ cta, secondaryCta }: { cta?: Cta; secondaryCta?: Cta }) {
  if (!cta && !secondaryCta) return null;
  return (
    <div className="mt-10 flex flex-wrap items-center gap-3">
      {cta && (
        <Button asChild>
          <SmartLink cta={cta} />
        </Button>
      )}
      {secondaryCta && (
        <Button asChild variant="secondary">
          <SmartLink cta={secondaryCta} />
        </Button>
      )}
    </div>
  );
}

/** In-page anchors need a plain <a>; everything else routes through Next. */
function SmartLink({ cta, className }: { cta: Cta; className?: string }) {
  if (cta.href.startsWith("#")) {
    return (
      <a href={cta.href} className={className}>
        {cta.label}
      </a>
    );
  }
  return (
    <Link href={cta.href} className={className}>
      {cta.label}
    </Link>
  );
}

export { SmartLink };

// ---------------------------------------------------------------------------
// Block bodies
// ---------------------------------------------------------------------------

function Cards({ items }: { items: Item[] }) {
  return (
    <ul className="mt-10 grid gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <li
          key={item.title}
          className="rounded-card border border-outline-variant bg-surface-container-lowest p-6 shadow-surface"
        >
          {item.label && (
            <p className="text-label-sm uppercase tracking-wide text-primary">{item.label}</p>
          )}
          <h3
            className={cn(
              "text-title-md font-semibold text-on-surface",
              item.label ? "mt-2" : ""
            )}
          >
            {item.title}
          </h3>
          <p className="mt-2 text-body-md text-on-surface-variant">{item.body}</p>
        </li>
      ))}
    </ul>
  );
}

function Features({ items }: { items: Item[] }) {
  return (
    <ul className="mt-10 grid gap-x-8 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <li key={item.title}>
          <span
            aria-hidden
            className="block h-1 w-10 rounded-full bg-primary"
          />
          <h3 className="mt-4 text-title-sm font-semibold text-on-surface">{item.title}</h3>
          <p className="mt-2 text-body-md text-on-surface-variant">{item.body}</p>
        </li>
      ))}
    </ul>
  );
}

function Steps({ items }: { items: Item[] }) {
  return (
    <ol className="mt-10 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, i) => (
        <li key={item.title} className="flex gap-4">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-title-sm font-bold text-on-primary">
            {i + 1}
          </span>
          <div className="pt-1">
            <h3 className="text-title-sm font-semibold text-on-surface">{item.title}</h3>
            <p className="mt-1.5 text-body-md text-on-surface-variant">{item.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function Points({ items }: { items: string[] }) {
  return (
    <ul className="mt-9 grid gap-x-8 gap-y-3.5 sm:grid-cols-2">
      {items.map((point) => (
        <li key={point} className="flex items-start gap-3">
          <span
            aria-hidden
            className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary-fixed text-primary"
          >
            <Check className="h-3 w-3" />
          </span>
          <span className="text-body-md text-on-surface">{point}</span>
        </li>
      ))}
    </ul>
  );
}

/** The fee number is the headline. It is never buried inside a sentence. */
export function FeeCard({
  rate,
  applied,
  note,
  className,
}: {
  rate: string;
  applied: string;
  note?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-card border border-outline-variant bg-surface-container-lowest p-8 shadow-surface",
        className
      )}
    >
      <p className="text-display-sm leading-none text-primary">{rate}</p>
      <p className="mt-4 text-title-sm font-semibold text-on-surface">{applied}</p>
      {note && <p className="mt-2 text-body-md text-on-surface-variant">{note}</p>}
    </div>
  );
}

/** Renders one block from a page's block list. */
export function BlockSection({ block, tone }: { block: Block; tone: "default" | "muted" }) {
  return (
    <Section id={block.id} tone={tone}>
      <SectionHeader eyebrow={block.eyebrow} title={block.title} body={block.body} />

      {block.kind === "cards" && <Cards items={block.cards} />}
      {block.kind === "features" && <Features items={block.features} />}
      {block.kind === "steps" && <Steps items={block.steps} />}
      {block.kind === "points" && <Points items={block.points} />}
      {block.kind === "fee" && (
        <FeeCard
          className="mt-10 max-w-md"
          rate={block.rate}
          applied={block.applied}
          note={block.note}
        />
      )}

      <Actions cta={block.cta} secondaryCta={block.secondaryCta} />
    </Section>
  );
}

// ---------------------------------------------------------------------------
// FAQ
// ---------------------------------------------------------------------------

export function Faq({ items }: { items: FaqItem[] }) {
  return (
    <div className="mt-10 max-w-3xl divide-y divide-outline-variant border-y border-outline-variant">
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
