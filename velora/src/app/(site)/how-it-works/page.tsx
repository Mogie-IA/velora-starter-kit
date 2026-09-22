import type { Metadata } from "next";
import { ArrowRight, Hammer, Home, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/features/site/components/SiteFooter";
import { SiteHeader } from "@/features/site/components/SiteHeader";
import { Section, SectionHeader, SmartLink } from "@/features/site/components/sections";
import { HOW_IT_WORKS } from "@/features/site/content";
import type { MarketplaceRole } from "@/types/marketplace";

export const metadata: Metadata = {
  title: "How Velora works",
  description: HOW_IT_WORKS.hero.body,
};

const ICONS: Record<MarketplaceRole, typeof Home> = {
  client: Home,
  contractor: Hammer,
  inspector: ShieldCheck,
};

/**
 * The shared explanation, so nobody has to read a role-specific landing page
 * just to understand what the product does.
 */
export default function HowItWorksPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        <div className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-hero-mesh"
          />
          <div className="relative mx-auto w-full max-w-6xl px-4 pb-12 pt-16 sm:px-6 sm:pt-24">
            <h1 className="max-w-3xl text-[34px] font-bold leading-[1.1] tracking-tight text-on-surface sm:text-[48px]">
              {HOW_IT_WORKS.hero.title}
            </h1>
            <p className="mt-5 max-w-2xl text-body-lg text-on-surface-variant">
              {HOW_IT_WORKS.hero.body}
            </p>
          </div>
        </div>

        <Section>
          <div className="grid gap-4 sm:grid-cols-3">
            {HOW_IT_WORKS.roles.map((r) => {
              const Icon = ICONS[r.role];
              return (
                <Link
                  key={r.role}
                  href={r.cta.href}
                  className="group flex flex-col rounded-card border border-outline-variant bg-surface-container-lowest p-6 shadow-surface transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-surface-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-[14px] bg-primary-fixed text-primary">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <p className="mt-5 text-label-sm uppercase tracking-wide text-primary">
                    {r.eyebrow}
                  </p>
                  <h2 className="mt-2 text-title-lg font-semibold text-on-surface">{r.title}</h2>
                  <p className="mt-2 flex-1 text-body-md text-on-surface-variant">{r.body}</p>
                  <span className="mt-6 inline-flex items-center gap-1.5 text-label-lg font-semibold text-primary">
                    {r.cta.label}
                    <ArrowRight
                      className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </span>
                </Link>
              );
            })}
          </div>
        </Section>

        <Section tone="muted">
          <SectionHeader
            title={HOW_IT_WORKS.workflow.title}
            body={[HOW_IT_WORKS.workflow.body]}
          />
          <ol className="mt-10 max-w-3xl space-y-0">
            {HOW_IT_WORKS.workflow.steps.map((step, i) => (
              <li key={step} className="flex gap-4 border-t border-outline-variant py-5 first:border-t-0 first:pt-0">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-body-sm font-bold text-on-primary">
                  {i + 1}
                </span>
                <span className="pt-1 text-body-lg text-on-surface">{step}</span>
              </li>
            ))}
          </ol>
          <div className="mt-10">
            <Button asChild size="lg">
              <SmartLink cta={HOW_IT_WORKS.workflow.cta} />
            </Button>
          </div>
        </Section>
      </main>

      <SiteFooter />
    </div>
  );
}
