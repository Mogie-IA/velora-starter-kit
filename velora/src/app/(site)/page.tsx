import type { Metadata } from "next";

import { RoleCards } from "@/features/site/components/RoleCards";
import { SiteFooter } from "@/features/site/components/SiteFooter";
import { SiteHeader } from "@/features/site/components/SiteHeader";
import { TrustStrip } from "@/features/site/components/sections";
import { FOOTER_TAGLINE } from "@/features/site/content";

export const metadata: Metadata = {
  // Absolute, so the layout template doesn't render "Velora … | Velora".
  title: { absolute: "Velora — Escrow-backed construction payments, verified in person" },
  description: FOOTER_TAGLINE,
};

/**
 * The homepage is a chooser, not a pitch.
 *
 * Anyone arriving without a role in mind — organic search, word of mouth —
 * lands here first, picks the page written for them, and gets persuaded there.
 * Selling to all three audiences at once would sell to none of them.
 */
export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        <div className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[460px] bg-hero-mesh"
          />
          <div className="relative mx-auto w-full max-w-6xl px-4 pb-12 pt-20 sm:px-6 sm:pt-28">
            <h1 className="max-w-3xl text-[34px] font-bold leading-[1.1] tracking-tight text-on-surface sm:text-[48px]">
              Escrow-backed construction payments, verified in person.
            </h1>
            <p className="mt-5 max-w-xl text-body-lg text-on-surface-variant">
              How will you use Velora?
            </p>
            <div className="mt-10">
              <RoleCards hrefFor={(role) => `/${role}s`} />
            </div>
          </div>
        </div>

        <div className="pb-20 pt-4">
          <TrustStrip />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
