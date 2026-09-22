import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SignupForm } from "@/features/site/components/SignupForm";
import { SiteFooter } from "@/features/site/components/SiteFooter";
import { SiteHeader } from "@/features/site/components/SiteHeader";
import { ROLE_ORDER, isMarketplaceRole } from "@/features/site/content";
import { SIGNUP_COPY } from "@/features/site/signup-fields";

/** Carries its own article — "an inspector", not "a inspector". */
const ROLE_NOUN = {
  client: "a client",
  contractor: "a contractor",
  inspector: "an inspector",
} as const;

export function generateStaticParams() {
  return ROLE_ORDER.map((role) => ({ role }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ role: string }>;
}): Promise<Metadata> {
  const { role } = await params;
  if (!isMarketplaceRole(role)) return { title: "Create your Velora account" };
  return { title: SIGNUP_COPY[role].title, description: SIGNUP_COPY[role].subtitle };
}

export default async function SignupRolePage({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  const { role } = await params;
  if (!isMarketplaceRole(role)) notFound();

  const copy = SIGNUP_COPY[role];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader role={role} />

      <main className="flex-1">
        <div className="mx-auto w-full max-w-2xl px-4 py-14 sm:px-6 sm:py-20">
          {/* The escape hatch for a wrong click — the role was chosen for them. */}
          <Link
            href="/signup"
            className="text-body-sm text-on-surface-variant underline underline-offset-4 transition-colors hover:text-primary"
          >
            Not {ROLE_NOUN[role]}? Switch roles
          </Link>

          <h1 className="mt-5 text-headline-lg font-semibold tracking-tight text-on-surface">
            {copy.title}
          </h1>
          <p className="mt-2 text-body-lg text-on-surface-variant">{copy.subtitle}</p>

          <div className="mt-10">
            <SignupForm role={role} />
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
