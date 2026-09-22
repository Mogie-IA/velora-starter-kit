import type { Metadata } from "next";

import { RoleCards } from "@/features/site/components/RoleCards";
import { SiteFooter } from "@/features/site/components/SiteFooter";
import { SiteHeader } from "@/features/site/components/SiteHeader";
import { ROLE_PICKER } from "@/features/site/content";

export const metadata: Metadata = {
  title: "Create your Velora account",
  description: ROLE_PICKER.subtitle,
};

/**
 * The one place the role picker appears before a form.
 *
 * Every landing page CTA skips this screen, because the role is already known
 * from the page it was clicked on. This exists for people who arrive at
 * /signup directly or through Login's "New here?" link, where there is no
 * prior page to infer a role from.
 */
export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <h1 className="text-headline-lg font-semibold tracking-tight text-on-surface sm:text-[40px] sm:leading-[1.15]">
            {ROLE_PICKER.title}
          </h1>
          <p className="mt-3 max-w-xl text-body-lg text-on-surface-variant">
            {ROLE_PICKER.subtitle}
          </p>
          <div className="mt-10">
            <RoleCards variant="signup" />
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
