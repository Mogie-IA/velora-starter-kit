import type { MarketplaceRole } from "@/types/marketplace";

/**
 * Sign-up field content, per role, from the brief.
 *
 * Every field below maps to a column on `marketplace_profiles`, with two
 * exceptions, both marked BRIEF-DEVIATION at their point of use in
 * `SignupForm.tsx`:
 *
 *   - Password. Velora accounts are wallet accounts: a mutation is authorised
 *     by a signature from the connected wallet, not by a password, and the
 *     profile table has no password column. The field is replaced by connecting
 *     a wallet, which is the same step performed honestly.
 *   - Terms. Gated client-side. There is nowhere to record consent yet, so the
 *     checkbox blocks submission but is not stored.
 */

export const SPECIALTY_OPTIONS = [
  "Residential",
  "Renovation",
  "Roofing",
  "Electrical",
  "Plumbing",
  "Other",
] as const;

export const PROFESSION_OPTIONS = [
  "Quantity surveyor",
  "Structural engineer",
  "Architect",
  "Other",
] as const;

/** Where contractors work and inspectors travel. */
export const REGION_OPTIONS = [
  "Lagos",
  "Abuja (FCT)",
  "Ogun",
  "Oyo",
  "Rivers",
  "Kano",
  "Kaduna",
  "Enugu",
  "Anambra",
  "Delta",
  "Edo",
  "Abia",
  "Imo",
  "Akwa Ibom",
  "Cross River",
  "Plateau",
  "Ondo",
  "Osun",
  "Ekiti",
  "Kwara",
] as const;

export interface SignupCopy {
  title: string;
  subtitle: string;
  submitCta: string;
  success: {
    title: (name: string) => string;
    body: string;
    cta: string;
    href: string;
    secondaryCta: string;
    secondaryHref: string;
    /** Inspectors only: a standing note in place of a verification ETA. */
    status?: string;
  };
}

export const SIGNUP_COPY: Record<MarketplaceRole, SignupCopy> = {
  client: {
    title: "Let's get your build started.",
    subtitle: "Create your account to set up your project and begin exploring your options.",
    submitCta: "Create my account",
    success: {
      title: (name: string) => `You're in, ${name}.`,
      body: "Let's get your first project set up. Tell us what you're building and where you're planning to build.",
      cta: "Start my first project",
      href: "/build/jobs/new",
      secondaryCta: "Go to dashboard",
      secondaryHref: "/build",
    },
  },
  contractor: {
    title: "Get your business in front of new clients.",
    subtitle:
      "Create your account and build your contractor profile so you can start exploring available projects.",
    submitCta: "Create my account",
    success: {
      title: (name: string) => `Welcome, ${name}.`,
      body: "Your account is ready. Complete your profile to help clients understand your experience and discover relevant projects.",
      cta: "Complete my profile",
      href: "/build/jobs",
      secondaryCta: "Go to dashboard",
      secondaryHref: "/build",
    },
  },
  inspector: {
    title: "Put your qualifications to work.",
    subtitle:
      "Create your profile to discover inspection opportunities and connect with clients who need professional site visits.",
    submitCta: "Create my account",
    success: {
      title: (name: string) => `Welcome, ${name}.`,
      body: "Your account has been created. We'll review your credentials and let you know when your profile is ready.",
      cta: "Complete my profile",
      href: "/build",
      secondaryCta: "Browse open jobs",
      secondaryHref: "/build/jobs",
      // Shown instead of a turnaround time, which is still undefined.
      status: "Credential verification is in progress.",
    },
  },
};
