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
  success: { title: (name: string) => string; body: string; cta: string; href: string };
}

export const SIGNUP_COPY = {
  client: {
    title: "Create your Velora account",
    subtitle: "Post a project, compare contractors, and fund one stage at a time.",
    submitCta: "Create my account",
    success: {
      title: (name: string) => `You're in, ${name}.`,
      body: "Tell us what you're building next, so we can help you find a contractor and an inspector.",
      cta: "Start my first project",
      href: "/build/jobs/new",
    },
  },
  contractor: {
    title: "Join Velora as a contractor",
    subtitle: "Bid on funded jobs and get paid the moment your work is verified.",
    submitCta: "Create my account",
    success: {
      title: (name: string) => `Welcome, ${name}.`,
      body: "Finish your profile so you show up in searches and can start bidding.",
      cta: "Complete my profile",
      href: "/build/jobs",
    },
  },
  inspector: {
    title: "Join Velora as an inspector",
    subtitle: "Put your licence to work — paid site visits, on your own schedule.",
    submitCta: "Create my account",
    success: {
      title: (name: string) => `Welcome, ${name}.`,
      body: "We're verifying your credentials — we'll email you the moment your profile goes live.",
      cta: "Browse open jobs",
      href: "/build/jobs",
    },
  },
} satisfies Record<string, SignupCopy>;
