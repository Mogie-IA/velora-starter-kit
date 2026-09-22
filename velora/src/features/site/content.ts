/**
 * Site copy, straight from the Velora Design & Content Brief.
 *
 * The brief supplies real copy rather than placeholders, so it lives here as
 * data and the page components stay layout-only. One idea carries every page:
 * money is safe not because Velora is honest, but because Velora physically
 * cannot move it alone.
 *
 * Three lines depart from the brief, each because the brief's own "Open
 * questions" section left them unresolved and shipping the written version
 * would promise something the product does not do yet. Every such spot is
 * marked BRIEF-DEVIATION with the reason.
 */

import type { MarketplaceRole } from "@/types/marketplace";

export interface FaqItem {
  q: string;
  a: string;
}

export interface Step {
  title: string;
  body: string;
}

export interface RoleContent {
  role: MarketplaceRole;
  /** URL segment for the landing page: /clients, /contractors, /inspectors */
  path: string;
  /** Header nav label pointing visitors at this page from the other two. */
  switchLabel: string;
  audience: string;
  hero: {
    eyebrow: string;
    headline: string;
    subhead: string;
    primaryCta: string;
    secondaryCta: string;
  };
  pain: {
    title: string;
    points: string[];
    bridge: string;
    /** Client-only: the number that makes the fear concrete. */
    stat?: { value: string; body: string };
  };
  howItWorks: { title: string; steps: Step[]; callout?: string };
  /** Free-standing proof sections between "how" and "fees". */
  panels: Array<{ title: string; body: string }>;
  fees: { title: string; rate: string; body: string };
  /** Client-only: the "why this needs to work differently" essay block. */
  why?: { title: string; body: string };
  faq: FaqItem[];
  finalCta: { headline: string; body?: string; cta: string };
}

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

export const CLIENT: RoleContent = {
  role: "client",
  path: "/clients",
  switchLabel: "Building from abroad?",
  audience:
    "Nigerians living abroad who want to build or renovate a house back home and have no reliable way to supervise it in person.",
  hero: {
    eyebrow: "For Nigerians building from abroad",
    headline: "You wired the money. Six months later, is anyone still building?",
    subhead:
      "Velora holds your money in escrow and only pays your contractor once an independent inspector confirms the work — in person, stage by stage, no matter where you live.",
    primaryCta: "Start your build",
    secondaryCta: "See how it works",
  },
  pain: {
    title: "Sound familiar?",
    points: [
      "A contractor asks for 50–100% upfront — then goes quiet.",
      "The quote was cheap. Three months in, the price keeps 'coming up' for reasons you can't check.",
      "You paid for granite countertops. What actually goes in might be nothing like it.",
      "Something feels off, but you're thousands of miles away and can't just drive over to look.",
    ],
    stat: {
      value: "$2–6 billion",
      body:
        "Nigerians abroad send an estimated $2–6 billion home every year to build. By some estimates, close to half of it never becomes a house.",
    },
    bridge:
      "There's no national list of dishonest contractors, and almost none of this is ever reported, let alone prosecuted. Velora exists so you don't need one to protect your money.",
  },
  howItWorks: {
    title: "How Velora actually works",
    steps: [
      {
        title: "Post your project.",
        body: "What you're building, where, your budget, and how many stages.",
      },
      {
        title: "Pick your team.",
        body:
          "Browse contractor profiles and bids, then choose an independent inspector — quantity surveyor, structural engineer, or architect — to check the work in person.",
      },
      {
        title: "Fund one stage at a time.",
        body:
          "Your money goes into an escrow account tied to your project — not to Velora's account, not to the contractor's.",
      },
      {
        title: "Your inspector visits the site.",
        body: "They confirm, in person, that the stage is actually done — before anything is paid.",
      },
      {
        title: "You approve.",
        body:
          "Only then does the contractor get paid, the inspector gets paid, and Velora takes its fee — all three, at once.",
      },
    ],
    callout:
      "Fund a stage and nothing gets built? Pull your money back. Nobody can spend it without your sign-off — not your contractor, not your inspector, not Velora.",
  },
  panels: [
    {
      title: "An inspector who answers to you, not your contractor",
      body:
        "You choose your inspector — your contractor doesn't. They visit the site in person at every stage and confirm what they actually find before a single dollar moves.",
    },
    {
      title: "Pick a contractor based on proof, not promises",
      body:
        "Every contractor on Velora has a public profile: years of experience, specialties, and a portfolio of completed builds with photos. Compare real bids side by side before you commit to anyone.",
    },
  ],
  fees: {
    title: "What it costs",
    rate: "3%",
    body: "added when you fund a stage. You see the exact number before you pay — never a surprise fee added after the fact.",
  },
  why: {
    title: "Why this needs to work differently",
    body:
      "A normal escrow means trusting a company's bank account. Velora's escrow is enforced by the system itself: funds release only when you and your inspector both confirm a stage, and no one — including Velora — can move them any other way. It's also why sending money through Velora settles in seconds for under 1%, instead of the roughly 8.5% and multi-day wait that banks charge. Velora runs on Solana and settles in USDC, a digital dollar built to always equal $1.",
  },
  faq: [
    {
      q: "What happens if a stage is funded but the contractor doesn't do the work?",
      a: "You get your money back — if nothing is submitted for a stage you've funded, you can pull those funds out of escrow.",
    },
    {
      q: "Do I need to understand crypto to use this?",
      a:
        // BRIEF-DEVIATION: the brief answers "No — Velora handles the conversion
        // behind the scenes." That describes a fiat on-ramp that does not exist
        // (the brief's own Open question #1). Answering it as written would
        // promise a funding path we cannot deliver, so this states what the
        // product actually does today.
        "You'll need a Solana wallet, and Velora walks you through setting one up in a couple of minutes. Your money is held and paid out in USDC — a digital dollar built to always equal $1 — so the amounts you see are the amounts you'd recognise.",
    },
    {
      q: "What if I don't know any inspectors?",
      a: "You don't need to. Browse Velora's inspector directory — every listed inspector is a licensed quantity surveyor, structural engineer, or architect with a public profile and past reviews.",
    },
    {
      q: "What does this actually cost me?",
      a: "3%, added when you fund each stage. You'll see the exact amount before you confirm payment.",
    },
    {
      q: "Where does my money actually sit?",
      a: "Each stage you fund goes into its own escrow account tied only to your project — not in Velora's account, and not in the contractor's.",
    },
    {
      q: "Can Velora take my money?",
      a: "No. Velora can't release, freeze, or move funds on its own. The same two-approval rule applies to everyone, including us.",
    },
  ],
  finalCta: {
    headline: "Build it right, from wherever you are.",
    body: "Post your project in minutes. You don't pay anything until you're ready to fund the first stage.",
    cta: "Start your build",
  },
};

// ---------------------------------------------------------------------------
// Contractor
// ---------------------------------------------------------------------------

export const CONTRACTOR: RoleContent = {
  role: "contractor",
  path: "/contractors",
  switchLabel: "Bidding on builds?",
  audience:
    "Contractors and building firms who want steady, verifiable work — especially from clients who'd normally never trust someone they've never met.",
  hero: {
    eyebrow: "For contractors ready to build",
    headline: "Diaspora clients want to hire you. Give them a reason to say yes.",
    subhead:
      "Bid on funded projects, prove your work stage by stage, and get paid automatically the moment it's verified — no chasing clients for money.",
    primaryCta: "Find your next job",
    secondaryCta: "See how it works",
  },
  pain: {
    title: "You do good work. Getting paid for it is the hard part.",
    points: [
      "A client abroad won't wire real money to a stranger — even when your work is solid.",
      "You finish the job. Then it's weeks of calls just to get paid.",
      "One bad contractor scams a family, and suddenly every contractor looks like a risk.",
    ],
    bridge:
      "Velora solves the trust problem from the client's side, so you can focus on building instead of chasing invoices.",
  },
  howItWorks: {
    title: "How it works",
    steps: [
      { title: "Browse open jobs.", body: "See budget, stage breakdown, and location before you bid." },
      { title: "Bid with your terms.", body: "Your price, your timeline, your proposed stage breakdown." },
      {
        title: "Win the job — the money's already there.",
        body: "The client funds the first stage into escrow before you start.",
      },
      { title: "Finish the stage. Upload proof.", body: "Photos or video of the completed work." },
      {
        title: "Get paid, automatically.",
        body: "An independent inspector confirms it in person, the client approves, and you're paid — no invoice, no follow-up call.",
      },
    ],
  },
  panels: [
    {
      title: "Every job becomes proof",
      body:
        "Your public profile shows your company, years of experience, specialties, and a portfolio of completed builds with photos — the evidence future clients see before they even read your bid.",
    },
    {
      title: "The money's real before you start",
      body:
        "A client funds a stage into escrow before you lift a shovel. You're not waiting on someone's word — you're waiting on an inspection.",
    },
  ],
  fees: {
    title: "What it costs",
    rate: "1%",
    body: "deducted only from a stage you've actually been paid for — never upfront, never on work that's still pending. You see your exact net payout before you bid.",
  },
  faq: [
    // BRIEF-DEVIATION: the brief's first contractor FAQ — "What if the client
    // won't approve my finished work?" — is written as an open question with no
    // answer (Open question #2, the dispute path). It is omitted rather than
    // answered with something invented. It should ship once that path is decided.
    {
      q: "How do I get paid?",
      a: "Automatically. The moment your inspector confirms a stage and your client approves it, funds move to you.",
    },
    { q: "What does Velora take?", a: "1%, deducted only from a stage you've been paid for." },
    {
      q: "Do I need my own inspector?",
      a: "No. Your client selects an independent inspector — either from Velora's directory or one who bid to inspect the job. You don't pay them and don't deal with them directly.",
    },
    {
      q: "What if I don't have a portfolio yet?",
      a: "Add whatever you have, even one project. Every job you complete on Velora is added automatically once it's approved.",
    },
  ],
  finalCta: {
    headline: "Stop selling trust. Start proving it.",
    cta: "Join as a contractor",
  },
};

// ---------------------------------------------------------------------------
// Inspector
// ---------------------------------------------------------------------------

export const INSPECTOR: RoleContent = {
  role: "inspector",
  path: "/inspectors",
  switchLabel: "Licensed to inspect?",
  audience:
    "Licensed quantity surveyors, structural engineers, and architects who want paid, flexible work that uses their credentials.",
  hero: {
    eyebrow: "For quantity surveyors, structural engineers & architects",
    headline: "Your licence is worth more than one firm's project list.",
    subhead:
      "Get paid to do exactly what you're trained for — visit a site, confirm the work is real — for diaspora clients who have no one else to check on their behalf.",
    primaryCta: "Start inspecting",
    secondaryCta: "See how it works",
  },
  pain: {
    title: "Between contracts, your expertise sits idle.",
    points: [
      "Firm work comes in waves — steady one season, gone the next.",
      "There's no simple way for a family building from abroad to find someone qualified to check on their site.",
      "One-off site visits for independent clients rarely pay what your time is worth.",
    ],
    bridge:
      "Velora connects your licence to a job that needs exactly what you already do — for pay, per visit, on your own schedule.",
  },
  howItWorks: {
    title: "How it works",
    steps: [
      { title: "Set up your profile.", body: "Licence number, qualifications, and the areas you cover." },
      {
        title: "Get work two ways.",
        body: "Bid on open jobs, or get picked directly by a client from your public profile.",
      },
      { title: "Visit the site.", body: "Confirm — or reject — each stage in person, with photos." },
      {
        title: "Get paid per stage.",
        body: "Automatically, the moment the client approves what you confirmed.",
      },
    ],
  },
  panels: [
    {
      title: "Every inspection builds your record",
      body:
        "Your public profile shows your qualifications, service areas, the projects you've inspected, and client reviews — so the next job finds you.",
    },
    {
      title: "You work for the client, not the contractor",
      body:
        "A client picks you directly, or you win the job by bidding — never the contractor. Your job is to say what you actually found on site. Nothing moves until you do.",
    },
  ],
  fees: {
    title: "What it costs",
    rate: "1%",
    body: "deducted only from what you're paid for a confirmed stage — nothing upfront, nothing on jobs you haven't done yet.",
  },
  faq: [
    {
      q: "Who decides which jobs I inspect?",
      a: "Either you, by bidding on open jobs, or a client, who can select you directly from your public profile.",
    },
    {
      q: "What do I need to sign up?",
      a: "Your professional credentials and licence number, as a quantity surveyor, structural engineer, or architect.",
    },
    {
      q: "How and when do I get paid?",
      a: "Per stage you confirm, automatically, the moment the client approves it. Velora takes 1% from that payment — nothing upfront.",
    },
    // BRIEF-DEVIATION: "What happens if I reject a stage?" is written as an open
    // question (Open question #3 — whether the contractor may redo the work, and
    // whether the inspector is still paid for the visit). Omitted rather than
    // guessed at; inspectors will ask, so it should ship once decided.
  ],
  finalCta: {
    headline: "Get paid for what you already know how to check.",
    cta: "Join as an inspector",
  },
};

export const ROLE_CONTENT: Record<MarketplaceRole, RoleContent> = {
  client: CLIENT,
  contractor: CONTRACTOR,
  inspector: INSPECTOR,
};

export const ROLE_ORDER: MarketplaceRole[] = ["client", "contractor", "inspector"];

export function isMarketplaceRole(value: string): value is MarketplaceRole {
  return value === "client" || value === "contractor" || value === "inspector";
}

// ---------------------------------------------------------------------------
// Shared components
// ---------------------------------------------------------------------------

/** Three badges, near the hero or fees section, on every page. */
export const TRUST_BADGES = [
  "Two approvals needed before any money moves",
  "Held in an account tied to your project, not to Velora",
  "Settles in seconds, not days",
] as const;

export const FOOTER_TAGLINE = "Escrow-backed construction payments, verified in person.";

export const FOOTER_TRUST_LINE =
  "Built on Solana. Settled in USDC. No single party — not the contractor, not the client, not Velora — can move escrowed funds alone.";

export const GENERAL_FAQ: FaqItem[] = [
  {
    q: "What is USDC?",
    a: "A digital dollar — each one is built to always equal $1. Velora uses it to move money instantly and cheaply across borders.",
  },
  {
    q: "Why Solana?",
    a: "It settles payments in seconds for a fraction of a cent, which is what makes near-instant, low-fee escrow possible.",
  },
  {
    q: "Where is Velora available?",
    a:
      // BRIEF-DEVIATION: left open in the brief (Open question #5). Answered from
      // what the rest of the brief already assumes — a Nigerian build funded from
      // anywhere — so the question isn't left visibly unanswered on every page.
      // Confirm the real scope before launch.
      "Velora is starting with builds in Nigeria, funded from anywhere in the world. More countries follow as we verify inspectors in them.",
  },
];

/** The role picker at /signup, and the three cards on the homepage. */
export const ROLE_PICKER = {
  title: "How will you use Velora?",
  subtitle: "Pick one to get started — you can add another role later from your account.",
  cards: [
    {
      role: "client" as const,
      label: "I'm building",
      description: "Hire a contractor and pay only for work an inspector has verified.",
      cta: "Continue as a client",
    },
    {
      role: "contractor" as const,
      label: "I build",
      description: "Bid on funded jobs and get paid the moment your work is confirmed.",
      cta: "Continue as a contractor",
    },
    {
      role: "inspector" as const,
      label: "I inspect",
      description: "Verify site work as a licensed QS, structural engineer, or architect.",
      cta: "Continue as an inspector",
    },
  ],
};
