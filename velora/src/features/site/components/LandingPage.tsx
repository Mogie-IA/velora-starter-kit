import Link from "next/link";
import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import { Faq, FeeCallout, Section, SectionTitle, Steps, TrustStrip } from "./sections";
import { GENERAL_FAQ, type RoleContent } from "@/features/site/content";

/**
 * One layout, three landing pages.
 *
 * The pages differ only in copy, so they share a structure: hero → trust strip
 * → the fear, named plainly → how it works → proof panels → fees → FAQ → final
 * CTA. Every primary CTA jumps straight into that role's sign-up form, since
 * the role is already implied by the page they clicked from.
 */
export function LandingPage({ content }: { content: RoleContent }) {
  const signupHref = `/signup/${content.role}`;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader role={content.role} />

      <main>
        {/* ── Hero ───────────────────────────────────────────────────────── */}
        <div className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[560px] bg-hero-mesh"
          />
          <div className="relative mx-auto w-full max-w-6xl px-4 pb-14 pt-16 sm:px-6 sm:pb-16 sm:pt-24">
            <p className="text-label-sm uppercase tracking-wide text-primary">
              {content.hero.eyebrow}
            </p>
            <h1 className="mt-4 max-w-4xl text-[34px] font-bold leading-[1.1] tracking-tight text-on-surface sm:text-[52px]">
              {content.hero.headline}
            </h1>
            <p className="mt-5 max-w-2xl text-body-lg text-on-surface-variant">
              {content.hero.subhead}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link href={signupHref}>{content.hero.primaryCta}</Link>
              </Button>
              <Button asChild variant="secondary">
                <a href="#how-it-works">{content.hero.secondaryCta}</a>
              </Button>
            </div>
          </div>
        </div>

        <div className="pb-4">
          <TrustStrip />
        </div>

        {/* ── The fear, named before the fix ─────────────────────────────── */}
        <Section className="pt-14">
          <SectionTitle>{content.pain.title}</SectionTitle>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {content.pain.points.map((point) => (
              <li
                key={point}
                className="flex gap-3 rounded-card border border-outline-variant bg-surface-container-lowest p-5"
              >
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-on-surface-variant" aria-hidden />
                <p className="text-body-md text-on-surface">{point}</p>
              </li>
            ))}
          </ul>

          {content.pain.stat && (
            <div className="mt-8 rounded-card bg-inverse-surface p-8 sm:p-10">
              <p className="text-display-sm leading-none text-inverse-primary">
                {content.pain.stat.value}
              </p>
              <p className="mt-4 max-w-2xl text-body-lg text-inverse-on-surface">
                {content.pain.stat.body}
              </p>
            </div>
          )}

          <p className="mt-8 max-w-3xl border-l-2 border-primary pl-5 text-body-lg text-on-surface">
            {content.pain.bridge}
          </p>
        </Section>

        {/* ── How it works ───────────────────────────────────────────────── */}
        <Section id="how-it-works" className="border-y border-outline-variant bg-surface-container-low">
          <SectionTitle>{content.howItWorks.title}</SectionTitle>
          <Steps steps={content.howItWorks.steps} />
          {content.howItWorks.callout && (
            <p className="mt-10 max-w-3xl rounded-card border border-primary/25 bg-primary-fixed p-6 text-body-lg font-medium text-on-primary-fixed">
              {content.howItWorks.callout}
            </p>
          )}
        </Section>

        {/* ── Proof panels ───────────────────────────────────────────────── */}
        <Section>
          <div className="grid gap-4 md:grid-cols-2">
            {content.panels.map((panel) => (
              <div
                key={panel.title}
                className="rounded-card border border-outline-variant bg-surface-container-lowest p-8 shadow-surface"
              >
                <h2 className="text-title-lg font-semibold text-on-surface">{panel.title}</h2>
                <p className="mt-3 text-body-md text-on-surface-variant">{panel.body}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Fees ───────────────────────────────────────────────────────── */}
        <Section id="fees" className="border-y border-outline-variant bg-surface-container-low">
          <SectionTitle>{content.fees.title}</SectionTitle>
          <FeeCallout rate={content.fees.rate} body={content.fees.body} />

          {content.why && (
            <div className="mt-12 max-w-3xl">
              <h3 className="text-title-lg font-semibold text-on-surface">{content.why.title}</h3>
              <p className="mt-3 text-body-lg text-on-surface-variant">{content.why.body}</p>
            </div>
          )}
        </Section>

        {/* ── FAQ ────────────────────────────────────────────────────────── */}
        <Section id="faq">
          <SectionTitle>Frequently asked questions</SectionTitle>
          <Faq items={[...content.faq, ...GENERAL_FAQ]} />
        </Section>

        {/* ── Final CTA ──────────────────────────────────────────────────── */}
        <Section className="pb-24">
          <div className="rounded-card bg-velora-gradient p-10 text-center shadow-primary-glow sm:p-14">
            <h2 className="mx-auto max-w-2xl text-headline-lg font-semibold tracking-tight text-on-primary sm:text-[36px] sm:leading-[1.15]">
              {content.finalCta.headline}
            </h2>
            {content.finalCta.body && (
              <p className="mx-auto mt-4 max-w-xl text-body-lg text-on-primary-container">
                {content.finalCta.body}
              </p>
            )}
            <Button asChild size="lg" variant="secondary" className="mt-8">
              <Link href={signupHref}>{content.finalCta.cta}</Link>
            </Button>
          </div>
        </Section>
      </main>

      <SiteFooter />
    </div>
  );
}
