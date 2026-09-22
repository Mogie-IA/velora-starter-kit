import Link from "next/link";

import { FOOTER_TAGLINE, FOOTER_TRUST_LINE } from "@/features/site/content";

/**
 * Shared footer. The per-role columns each point at that role's own landing
 * page sections, so the anchors resolve wherever the visitor currently is.
 */

interface Column {
  heading: string;
  links: Array<{ label: string; href: string }>;
}

const COLUMNS: Column[] = [
  {
    heading: "For clients",
    links: [
      { label: "How it works", href: "/clients#how-it-works" },
      { label: "Fees", href: "/clients#fees" },
      { label: "FAQ", href: "/clients#faq" },
      { label: "Browse contractors", href: "/build/contractors" },
      { label: "Browse inspectors", href: "/build/inspectors" },
    ],
  },
  {
    heading: "For contractors",
    links: [
      { label: "How it works", href: "/contractors#how-it-works" },
      { label: "Fees", href: "/contractors#fees" },
      { label: "FAQ", href: "/contractors#faq" },
      { label: "Find jobs", href: "/build/jobs" },
    ],
  },
  {
    heading: "For inspectors",
    links: [
      { label: "How it works", href: "/inspectors#how-it-works" },
      { label: "Fees", href: "/inspectors#fees" },
      { label: "FAQ", href: "/inspectors#faq" },
      { label: "Find jobs", href: "/build/jobs" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/" },
      { label: "Contact", href: "/" },
      { label: "Terms", href: "/" },
      { label: "Privacy", href: "/" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-outline-variant bg-surface-container-low">
      <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1.1fr)_repeat(4,minmax(0,1fr))]">
          <div className="max-w-xs">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-primary text-title-sm font-bold text-on-primary">
                V
              </span>
              <span className="text-title-md font-semibold tracking-tight text-on-surface">
                Velora
              </span>
            </div>
            <p className="mt-3 text-body-sm text-on-surface-variant">{FOOTER_TAGLINE}</p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h2 className="text-label-sm uppercase tracking-wide text-on-surface-variant">
                {col.heading}
              </h2>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={`${col.heading}-${link.label}`}>
                    <Link
                      href={link.href}
                      className="text-body-sm text-on-surface-variant underline-offset-4 transition-colors hover:text-primary hover:underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-12 max-w-3xl border-t border-outline-variant pt-6 text-body-sm text-on-surface-variant">
          {FOOTER_TRUST_LINE}
        </p>
        <p className="mt-4 text-label-md text-outline">© 2026 Velora. All rights reserved.</p>
      </div>
    </footer>
  );
}
