import Link from "next/link";
import { ArrowRight, Hammer, Home, ShieldCheck } from "lucide-react";

import { ROLE_CARDS } from "@/features/site/content";
import type { MarketplaceRole } from "@/types/marketplace";

/**
 * The three role cards, used in both places a role gets chosen.
 *
 * Destination and wording differ by context: from the homepage a card opens
 * that role's landing page with the fuller description, because a visitor
 * arriving cold has not been told anything yet. From /signup it opens the
 * form with a shorter line, because they have already decided.
 */

const ICONS: Record<MarketplaceRole, typeof Home> = {
  client: Home,
  contractor: Hammer,
  inspector: ShieldCheck,
};

export function RoleCards({ variant }: { variant: "home" | "signup" }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {ROLE_CARDS.map((card) => {
        const Icon = ICONS[card.role];
        const href = variant === "home" ? `/${card.role}s` : `/signup/${card.role}`;
        const label = variant === "home" ? card.homeCta : card.signupCta;
        const body = variant === "home" ? card.description : card.shortDescription;

        return (
          <Link
            key={card.role}
            href={href}
            className="group flex flex-col rounded-card border border-outline-variant bg-surface-container-lowest p-6 shadow-surface transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-surface-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <span className="grid h-11 w-11 place-items-center rounded-[14px] bg-primary-fixed text-primary">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <h3 className="mt-5 text-title-lg font-semibold text-on-surface">{card.label}</h3>
            <p className="mt-2 flex-1 text-body-md text-on-surface-variant">{body}</p>
            <span className="mt-6 inline-flex items-center gap-1.5 text-label-lg font-semibold text-primary">
              {label}
              <ArrowRight
                className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5"
                aria-hidden
              />
            </span>
          </Link>
        );
      })}
    </div>
  );
}
