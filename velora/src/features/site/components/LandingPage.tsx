import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import { BlockSection, Faq, Section, SectionHeader, SmartLink } from "./sections";
import type { Hero as HeroContent, RoleContent } from "@/features/site/content";

/**
 * One layout, three landing pages.
 *
 * Each page is a hero plus an ordered list of blocks, so the three roles can
 * share components without being forced into the same section order. Section
 * backgrounds alternate automatically.
 */
export function LandingPage({ content }: { content: RoleContent }) {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader role={content.role} />

      <main>
        <Hero hero={content.hero} />

        {content.blocks.map((block, i) => (
          <BlockSection
            key={block.title}
            block={block}
            tone={i % 2 === 1 ? "muted" : "default"}
          />
        ))}

        <Section id="faq" tone={content.blocks.length % 2 === 1 ? "muted" : "default"}>
          <SectionHeader title="Frequently asked questions" />
          <Faq items={content.faq} />
        </Section>

        <Section className="pb-24">
          <div className="rounded-card bg-velora-gradient p-10 text-center shadow-primary-glow sm:p-14">
            <h2 className="mx-auto max-w-2xl text-headline-lg font-semibold tracking-tight text-on-primary sm:text-[36px] sm:leading-[1.15]">
              {content.finalCta.headline}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-body-lg text-on-primary-container">
              {content.finalCta.body}
            </p>
            <Button asChild size="lg" variant="secondary" className="mt-8">
              <SmartLink cta={content.finalCta.cta} />
            </Button>
            {content.finalCta.microcopy && (
              <p className="mt-4 text-body-sm text-on-primary-container">
                {content.finalCta.microcopy}
              </p>
            )}
          </div>
        </Section>
      </main>

      <SiteFooter />
    </div>
  );
}

export function Hero({ hero }: { hero: HeroContent }) {
  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[560px] bg-hero-mesh"
      />
      <div className="relative mx-auto w-full max-w-6xl px-4 pb-16 pt-16 sm:px-6 sm:pb-20 sm:pt-24">
        <p className="text-label-sm uppercase tracking-wide text-primary">{hero.eyebrow}</p>
        <h1 className="mt-4 max-w-4xl text-[34px] font-bold leading-[1.1] tracking-tight text-on-surface sm:text-[52px]">
          {hero.headline}
        </h1>
        <p className="mt-5 max-w-2xl text-body-lg text-on-surface-variant">{hero.body}</p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button asChild size="lg">
            <SmartLink cta={hero.primaryCta} />
          </Button>
          {hero.secondaryCta && (
            <Button asChild variant="secondary">
              <SmartLink cta={hero.secondaryCta} />
            </Button>
          )}
        </div>

        {hero.microcopy && (
          <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
            {hero.microcopy.map((line) => (
              <li key={line} className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary-fixed text-primary"
                >
                  <Check className="h-3 w-3" />
                </span>
                <span className="text-body-sm font-medium text-on-surface">{line}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
