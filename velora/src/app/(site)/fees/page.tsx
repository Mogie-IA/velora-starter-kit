import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/features/site/components/SiteFooter";
import { SiteHeader } from "@/features/site/components/SiteHeader";
import { Section, SectionHeader, SmartLink } from "@/features/site/components/sections";
import { FEES_PAGE } from "@/features/site/content";

export const metadata: Metadata = {
  title: "Fees",
  description: FEES_PAGE.hero.body,
};

/**
 * Pricing, per role.
 *
 * Each tier leads with the number and says exactly when it applies, because
 * the visitor reading this page is checking for a catch.
 */
export default function FeesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        <div className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[380px] bg-hero-mesh"
          />
          <div className="relative mx-auto w-full max-w-6xl px-4 pb-12 pt-16 sm:px-6 sm:pt-24">
            <h1 className="max-w-3xl text-[34px] font-bold leading-[1.1] tracking-tight text-on-surface sm:text-[48px]">
              {FEES_PAGE.hero.title}
            </h1>
            <p className="mt-5 max-w-2xl text-body-lg text-on-surface-variant">
              {FEES_PAGE.hero.body}
            </p>
          </div>
        </div>

        <Section>
          <div className="grid gap-4 sm:grid-cols-3">
            {FEES_PAGE.tiers.map((tier) => (
              <div
                key={tier.eyebrow}
                className="flex flex-col rounded-card border border-outline-variant bg-surface-container-lowest p-8 shadow-surface"
              >
                <p className="text-label-sm uppercase tracking-wide text-primary">
                  {tier.eyebrow}
                </p>
                <p className="mt-4 text-display-sm leading-none text-primary">{tier.rate}</p>
                <p className="mt-4 text-title-sm font-semibold text-on-surface">{tier.applied}</p>
                <p className="mt-2 flex-1 text-body-md text-on-surface-variant">{tier.body}</p>
                <Button asChild variant="secondary" className="mt-7 w-full">
                  <SmartLink cta={tier.cta} />
                </Button>
              </div>
            ))}
          </div>
        </Section>

        <Section tone="muted" className="pb-24">
          <SectionHeader
            title={FEES_PAGE.clarification.title}
            body={FEES_PAGE.clarification.body}
          />
        </Section>
      </main>

      <SiteFooter />
    </div>
  );
}
