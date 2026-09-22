import Link from "next/link";
import { ArrowRight, Hammer, Home, ShieldCheck } from "lucide-react";

import { ROLE_PICKER } from "@/features/site/content";
import type { MarketplaceRole } from "@/types/marketplace";

/**
 * The three role cards, used in both places a role gets chosen.
 *
 * They lead to different destinations depending on where they are: from the
 * homepage a card opens that role's landing page, because a visitor arriving
 * cold has not been sold anything yet. From /signup a card opens the form,
 * because anyone who got there has already decided.
 */

const ICONS: Record<MarketplaceRole, typeof Home> = {
  client: Home,
  contractor: Hammer,
  inspector: ShieldCheck,
};

export function RoleCards({
  hrefFor,
  showCta = true,
}: {
  hrefFor: (role: MarketplaceRole) => string;
  showCta?: boolean;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {ROLE_PICKER.cards.map((card) => {
        const Icon = ICONS[card.role];
        return (
          <Link
            key={card.role}
            href={hrefFor(card.role)}
            className="group flex flex-col rounded-card border border-outline-variant bg-surface-container-lowest p-6 shadow-surface transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-surface-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <span className="grid h-11 w-11 place-items-center rounded-[14px] bg-primary-fixed text-primary">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <h2 className="mt-5 text-title-lg font-semibold text-on-surface">{card.label}</h2>
            <p className="mt-2 flex-1 text-body-md text-on-surface-variant">{card.description}</p>
            {showCta && (
              <span className="mt-6 inline-flex items-center gap-1.5 text-label-lg font-semibold text-primary">
                {card.cta}
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5"
                  aria-hidden
                />
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
