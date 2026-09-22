"use client";

import { useMemo, useState } from "react";
import { BadgeCheck, Briefcase, MapPin, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import type { MarketplaceProfile, MarketplaceRole } from "@/types/marketplace";

/**
 * The contractor and inspector directories.
 *
 * A client browses these before choosing anyone, so what a card shows is the
 * evidence the brief promises: for contractors, experience and what they build;
 * for inspectors, the licence and where they can travel. Filtering is in-memory
 * because a directory this size does not need a round trip per keystroke.
 */

const COPY: Record<
  Extract<MarketplaceRole, "contractor" | "inspector">,
  { title: string; subtitle: string; searchLabel: string; empty: string; none: string }
> = {
  contractor: {
    title: "Contractors",
    subtitle:
      "Every contractor here has a public profile: years of experience, specialties, and the builds they've completed. Compare before you commit.",
    searchLabel: "Search by name, company, or specialty",
    empty: "No contractors match that search.",
    none: "No contractors have joined yet. Be the first — it takes a minute.",
  },
  inspector: {
    title: "Inspectors",
    subtitle:
      "Licensed quantity surveyors, structural engineers, and architects who visit the site in person and confirm each stage before any money moves.",
    searchLabel: "Search by name, profession, or area",
    empty: "No inspectors match that search.",
    none: "No inspectors have joined yet. Be the first — it takes a minute.",
  },
};

export function ProfileDirectory({
  role,
  profiles,
  /** Rendered inside each card — lets the job-creation flow add a "Choose" button. */
  action,
}: {
  role: "contractor" | "inspector";
  profiles: MarketplaceProfile[];
  action?: (profile: MarketplaceProfile) => React.ReactNode;
}) {
  const copy = COPY[role];
  const [query, setQuery] = useState("");
  const [area, setArea] = useState("");

  const areas = useMemo(() => {
    const all = new Set<string>();
    for (const p of profiles) {
      if (p.city) all.add(p.city);
      for (const a of p.serviceAreas ?? []) all.add(a);
    }
    return [...all].sort();
  }, [profiles]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return profiles.filter((p) => {
      if (area && p.city !== area && !(p.serviceAreas ?? []).includes(area)) return false;
      if (!q) return true;
      const haystack = [
        p.displayName,
        p.companyName,
        p.qualification,
        p.city,
        ...(p.specialties ?? []),
        ...(p.serviceAreas ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [profiles, query, area]);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="text-headline-lg font-semibold tracking-tight text-on-surface">{copy.title}</h1>
      <p className="mt-2 max-w-2xl text-body-md text-on-surface-variant">{copy.subtitle}</p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-outline"
            aria-hidden
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label={copy.searchLabel}
            placeholder={copy.searchLabel}
            className="h-12 w-full rounded-input border border-outline-variant bg-surface-container-lowest pl-10 pr-3.5 text-body-md text-on-surface outline-none placeholder:text-outline focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>
        {areas.length > 0 && (
          <select
            value={area}
            onChange={(e) => setArea(e.target.value)}
            aria-label="Filter by area"
            className="h-12 rounded-input border border-outline-variant bg-surface-container-lowest px-3.5 text-body-md text-on-surface outline-none focus-visible:ring-2 focus-visible:ring-primary sm:w-56"
          >
            <option value="">All areas</option>
            {areas.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-10 rounded-card border border-dashed border-outline-variant p-10 text-center text-body-md text-on-surface-variant">
          {profiles.length === 0 ? copy.none : copy.empty}
        </p>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {filtered.map((p) => (
            <li key={p.id}>
              <ProfileCard profile={p} role={role} action={action?.(p)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function ProfileCard({
  profile,
  role,
  action,
}: {
  profile: MarketplaceProfile;
  role: "contractor" | "inspector";
  action?: React.ReactNode;
}) {
  const heading = role === "contractor" ? profile.companyName || profile.displayName : profile.displayName;
  const sub = role === "contractor" ? profile.displayName : profile.qualification;
  const tags = role === "contractor" ? profile.specialties : profile.serviceAreas;
  const place = role === "contractor" ? profile.city : (profile.serviceAreas ?? [])[0];

  return (
    <div className="flex h-full flex-col rounded-card border border-outline-variant bg-surface-container-lowest p-5 shadow-surface">
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary-fixed text-title-md font-semibold text-primary">
          {heading.slice(0, 1).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-title-sm font-semibold text-on-surface">{heading}</h2>
            <VerificationPill status={profile.verificationStatus} />
          </div>
          {sub && <p className="mt-0.5 text-body-sm text-on-surface-variant">{sub}</p>}
        </div>
      </div>

      {profile.bio && <p className="mt-3 text-body-sm text-on-surface-variant">{profile.bio}</p>}

      <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-body-sm text-on-surface-variant">
        {place && (
          <div className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" aria-hidden />
            <dd>{place}</dd>
          </div>
        )}
        {profile.yearsExperience != null && (
          <div className="inline-flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5" aria-hidden />
            <dd>
              {profile.yearsExperience} {profile.yearsExperience === 1 ? "year" : "years"}
            </dd>
          </div>
        )}
        <div className="inline-flex items-center gap-1.5">
          <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
          <dd>
            {profile.jobsCompleted} {role === "inspector" ? "inspected" : "completed"} on Velora
          </dd>
        </div>
      </dl>

      {tags && tags.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {tags.slice(0, 5).map((tag) => (
            <li
              key={tag}
              className="rounded-full bg-surface-container px-2.5 py-1 text-label-sm font-medium text-on-surface-variant"
            >
              {tag}
            </li>
          ))}
          {tags.length > 5 && (
            <li className="px-1 py-1 text-label-sm text-outline">+{tags.length - 5}</li>
          )}
        </ul>
      )}

      {action && <div className="mt-5 pt-1">{action}</div>}
    </div>
  );
}

function VerificationPill({ status }: { status: MarketplaceProfile["verificationStatus"] }) {
  const label = {
    verified: "Verified",
    pending: "Verifying",
    unverified: "Unverified",
    rejected: "Unverified",
  }[status];

  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-label-sm",
        status === "verified"
          ? "bg-tertiary-container text-on-tertiary-container"
          : "bg-surface-container text-on-surface-variant"
      )}
    >
      {label}
    </span>
  );
}
