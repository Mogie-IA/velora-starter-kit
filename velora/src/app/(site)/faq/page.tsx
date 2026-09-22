import type { Metadata } from "next";

import { SiteFooter } from "@/features/site/components/SiteFooter";
import { SiteHeader } from "@/features/site/components/SiteHeader";
import { Faq, Section, SectionHeader } from "@/features/site/components/sections";
import { CLIENT, CONTRACTOR, GENERAL_FAQ, INSPECTOR } from "@/features/site/content";

export const metadata: Metadata = {
  title: "Frequently asked questions",
  description:
    "Answers about building from abroad, working with contractors, inspections, and how project payments work.",
};

/**
 * Every question in one place, grouped by who's asking.
 *
 * The role sections reuse each landing page's own FAQ rather than duplicating
 * the answers, so there is one place to correct a wrong answer.
 */
export default function FaqPage() {
  const groups = [
    { title: "General", items: GENERAL_FAQ },
    { title: "For clients", items: CLIENT.faq },
    { title: "For contractors", items: CONTRACTOR.faq },
    { title: "For inspectors", items: INSPECTOR.faq },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        <div className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[360px] bg-hero-mesh"
          />
          <div className="relative mx-auto w-full max-w-6xl px-4 pb-8 pt-16 sm:px-6 sm:pt-24">
            <h1 className="max-w-3xl text-[34px] font-bold leading-[1.1] tracking-tight text-on-surface sm:text-[48px]">
              Questions about Velora? Let&apos;s make things clear.
            </h1>
            <p className="mt-5 max-w-2xl text-body-lg text-on-surface-variant">
              Find answers about building from abroad, working with contractors, inspections, and
              how project payments work.
            </p>
          </div>
        </div>

        {groups.map((group, i) => (
          <Section
            key={group.title}
            id={group.title.toLowerCase().replace(/\s+/g, "-")}
            tone={i % 2 === 1 ? "muted" : "default"}
            className={i === groups.length - 1 ? "pb-24" : undefined}
          >
            <SectionHeader title={group.title} />
            <Faq items={group.items} />
          </Section>
        ))}
      </main>

      <SiteFooter />
    </div>
  );
}
