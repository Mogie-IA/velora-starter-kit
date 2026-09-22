import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { Hero } from "@/features/site/components/LandingPage";
import { RoleCards } from "@/features/site/components/RoleCards";
import { SiteFooter } from "@/features/site/components/SiteFooter";
import { SiteHeader } from "@/features/site/components/SiteHeader";
import { Section, SectionHeader, SmartLink } from "@/features/site/components/sections";
import { BRAND_STATEMENT, HOME } from "@/features/site/content";

export const metadata: Metadata = {
  // Absolute, so the layout template doesn't render "Velora … | Velora".
  title: { absolute: "Velora — Build back home. Stay in control from anywhere." },
  description: BRAND_STATEMENT,
};

/**
 * The homepage is a neutral starting point.
 *
 * It helps visitors who haven't chosen a role identify where they belong, then
 * hands them to the page written for them. Persuasion happens there, not here.
 */
export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        <Hero hero={HOME.hero} />

        <Section tone="muted">
          <SectionHeader title={HOME.roleSection.title} body={[HOME.roleSection.body]} />
          <div className="mt-10">
            <RoleCards variant="home" />
          </div>
        </Section>

        <Section>
          <SectionHeader title={HOME.supporting.title} body={[HOME.supporting.body]} />
          <ul className="mt-10 grid gap-x-8 gap-y-9 sm:grid-cols-3">
            {HOME.supporting.features.map((feature) => (
              <li key={feature.title}>
                <span aria-hidden className="block h-1 w-10 rounded-full bg-primary" />
                <h3 className="mt-4 text-title-md font-semibold text-on-surface">
                  {feature.title}
                </h3>
                <p className="mt-2 text-body-md text-on-surface-variant">{feature.body}</p>
              </li>
            ))}
          </ul>
        </Section>

        <Section className="pb-24">
          <div className="rounded-card bg-velora-gradient p-10 text-center shadow-primary-glow sm:p-14">
            <h2 className="mx-auto max-w-2xl text-headline-lg font-semibold tracking-tight text-on-primary sm:text-[36px] sm:leading-[1.15]">
              {HOME.finalCta.headline}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-body-lg text-on-primary-container">
              {HOME.finalCta.body}
            </p>
            <Button asChild size="lg" variant="secondary" className="mt-8">
              <SmartLink cta={HOME.finalCta.cta} />
            </Button>
          </div>
        </Section>
      </main>

      <SiteFooter />
    </div>
  );
}
