/**
 * Site copy, from the revised Velora brand & content brief.
 *
 * Positioning is outcome-led: what the visitor can accomplish comes first, and
 * the protection mechanics support it rather than lead it. The voice is clear,
 * reassuring, human, practical and empowering — and deliberately avoids
 * absolute promises ("your money is always safe") in favour of precise ones
 * ("payments follow the defined inspection and approval process").
 *
 * Copy lives here as data so the page components stay layout-only.
 *
 * The brief marks a number of answers "[Confirm]" — product rules that are not
 * settled yet. Three kinds of handling appear below, each marked at its point
 * of use:
 *   - OPEN-OMITTED: no truthful answer exists yet, so the entry is left out
 *     rather than invented.
 *   - OPEN-ANSWERED: the brief flagged it, but the shipped escrow program
 *     already determines the answer, so it is answered from what the code does.
 *   - BRIEF-DEVIATION: the brief's copy would promise something the product
 *     does not do, so the copy states what it actually does.
 */

import type { MarketplaceRole } from "@/types/marketplace";

export interface Cta {
  label: string;
  href: string;
}

export interface Item {
  /** Small kicker above the title, e.g. "Distance", "Coordination". */
  label?: string;
  title: string;
  body: string;
}

export interface Hero {
  eyebrow: string;
  headline: string;
  body: string;
  primaryCta: Cta;
  secondaryCta?: Cta;
  /** Three short proof lines under the buttons. */
  microcopy?: string[];
}

interface BlockBase {
  /** Anchor id, for nav links and deep links. */
  id?: string;
  eyebrow?: string;
  title: string;
  /** One entry per paragraph. */
  body?: string[];
  cta?: Cta;
  secondaryCta?: Cta;
}

export type Block =
  | (BlockBase & { kind: "cards"; cards: Item[] })
  | (BlockBase & { kind: "features"; features: Item[] })
  | (BlockBase & { kind: "steps"; steps: Item[] })
  | (BlockBase & { kind: "points"; points: string[] })
  | (BlockBase & { kind: "fee"; rate: string; applied: string; note?: string });

export interface FaqItem {
  q: string;
  a: string;
}

export interface RoleContent {
  role: MarketplaceRole;
  path: string;
  /** Header nav label. */
  navLabel: string;
  audience: string;
  hero: Hero;
  blocks: Block[];
  faq: FaqItem[];
  finalCta: { headline: string; body: string; cta: Cta; microcopy?: string };
}

// ---------------------------------------------------------------------------
// Brand
// ---------------------------------------------------------------------------

export const BRAND_TAGLINE = "Build back home. Stay in control from anywhere.";

export const BRAND_STATEMENT =
  "Build your home in your hometown, even when you're living abroad. Velora connects you with contractors and inspectors, helps you manage your project, and gives you a clearer way to follow your progress from wherever you are.";

export const FOOTER_BLURB =
  "Connect clients, contractors, and inspectors to make construction projects easier to manage across borders.";

export const FOOTER_TRUST_LINE =
  "Clear project stages, defined review processes, and transparent payment information.";

// ---------------------------------------------------------------------------
// Homepage
// ---------------------------------------------------------------------------

export const HOME = {
  hero: {
    eyebrow: "Construction, connected.",
    headline: "Build back home. From wherever you are.",
    body: "Whether you're building your home abroad, looking for your next construction project, or offering professional inspection services, Velora helps connect the people and work that bring construction projects to life.",
    primaryCta: { label: "Get started", href: "/signup" },
    secondaryCta: { label: "Explore how it works", href: "/how-it-works" },
  } satisfies Hero,
  roleSection: {
    title: "What brings you to Velora?",
    body: "Choose how you'd like to use Velora.",
  },
  supporting: {
    title: "A clearer way to bring construction projects to life.",
    body: "From the first project brief to completed work, Velora helps clients, contractors, and inspectors work together through a structured construction experience.",
    features: [
      {
        title: "Plan your project",
        body: "Define what you're building, where it's located, your budget, and the stages involved.",
      },
      {
        title: "Connect with the right people",
        body: "Find contractors and inspectors based on your project needs and professional experience.",
      },
      {
        title: "Follow the work",
        body: "Stay informed about construction progress and use the required review and approval steps before stage payments are made.",
      },
    ] satisfies Item[],
  },
  finalCta: {
    headline: "Your next construction project starts here.",
    body: "Whether you're building, bidding, or inspecting, get started with Velora.",
    cta: { label: "Get started", href: "/signup" },
  },
};

/** The three role cards, on the homepage and at /signup. */
export const ROLE_CARDS = [
  {
    role: "client" as const,
    label: "I'm building",
    /** Homepage wording — longer, explains the whole offer. */
    description:
      "Build or renovate your home back home while living abroad. Manage your project, connect with contractors, and follow progress from anywhere.",
    /** Sign-up wording — shorter, the visitor has already decided. */
    shortDescription:
      "Build or renovate your home back home while living abroad.",
    homeCta: "Build from abroad",
    signupCta: "Continue as a client",
  },
  {
    role: "contractor" as const,
    label: "I build",
    description:
      "Find construction projects posted by clients abroad, submit bids, and showcase your work to new clients.",
    shortDescription:
      "Find construction projects from clients abroad and submit your bids.",
    homeCta: "Find projects",
    signupCta: "Continue as a contractor",
  },
  {
    role: "inspector" as const,
    label: "I inspect",
    description:
      "Connect with clients who need qualified professionals to inspect construction work and document site progress.",
    shortDescription:
      "Connect with clients who need qualified professionals to inspect their construction projects.",
    homeCta: "Find inspection work",
    signupCta: "Continue as an inspector",
  },
];

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

export const CLIENT: RoleContent = {
  role: "client",
  path: "/clients",
  navLabel: "For clients",
  audience:
    "Nigerians living abroad who want to build or renovate a home in their hometown.",
  hero: {
    eyebrow: "For Nigerians building from abroad",
    headline: "Your home. Your hometown. Your project — from anywhere.",
    body: "Build your home back home without needing to be there every step of the way. Create your project, connect with contractors and inspectors, and follow your construction progress from the comfort of your home abroad.",
    primaryCta: { label: "Start your build", href: "/signup/client" },
    secondaryCta: { label: "See how it works", href: "#how-it-works" },
    microcopy: [
      "Manage your project from anywhere.",
      "Connect with contractors and inspectors.",
      "Track work through construction stages.",
    ],
  },
  blocks: [
    {
      kind: "cards",
      eyebrow: "Building from abroad",
      title: "You shouldn't have to be on a plane to know how your home is coming along.",
      body: [
        "Building in your hometown while living abroad comes with enough to think about. Finding the right contractor, following up on progress, and knowing what is happening on site shouldn't all fall on you.",
        "Velora gives you a structured way to manage your project and stay connected to the work, even when you're far away.",
      ],
      cards: [
        {
          label: "Distance",
          title: "Your building site is far away.",
          body: "You can't always be there to check what's happening. Stay connected to your project from wherever you live.",
        },
        {
          label: "Coordination",
          title: "Too many people to follow up with.",
          body: "Keep your project, contractor, inspector, and construction stages connected in one place.",
        },
        {
          label: "Visibility",
          title: "You deserve to know how your project is progressing.",
          body: "Follow stage updates and review the work completed before making the next payment decision.",
        },
        {
          label: "Payment confidence",
          title: "Know what your money is going toward.",
          body: "Connect project funding to defined construction stages and the required review and approval process.",
        },
      ],
      cta: { label: "See how Velora works", href: "#how-it-works" },
    },
    {
      kind: "features",
      title: "Everything you need to manage your build, in one place.",
      body: [
        "From setting up your project to reviewing completed work, Velora helps you stay involved without having to manage everything through calls, chats, and scattered updates.",
      ],
      features: [
        {
          title: "Create your project",
          body: "Define what you're building, where it is, your budget, and the stages you want to complete.",
        },
        {
          title: "Find contractors and inspectors",
          body: "Explore contractor profiles, compare bids, and choose an independent inspector for your project.",
        },
        {
          title: "Follow project progress",
          body: "Keep track of your construction stages and see the updates shared by your project team.",
        },
        {
          title: "Review before payment",
          body: "Follow the required inspection and approval process before funds for a completed stage are paid out.",
        },
      ],
    },
    {
      kind: "steps",
      id: "how-it-works",
      eyebrow: "Your build, step by step",
      title: "From your first idea to your next completed stage.",
      body: [
        "Set up your project, find the people you need, and stay involved as the work progresses.",
      ],
      steps: [
        {
          title: "Create your project",
          body: "Tell us what you're building, where you're building it, your budget, and the stages of your project.",
        },
        {
          title: "Choose your contractor",
          body: "Review profiles, compare bids, and select the contractor you want to work with.",
        },
        {
          title: "Choose an inspector",
          body: "Select a qualified independent inspector who can visit your site and review the work in person.",
        },
        {
          title: "Fund a construction stage",
          body: "Allocate funds for the agreed stage through your project payment process. See the amount before you confirm.",
        },
        {
          title: "Follow the work",
          body: "Your contractor shares progress updates while your inspector checks the stage on site.",
        },
        {
          title: "Review and approve",
          body: "Review the completed stage and follow the required approval process before payment is released.",
        },
      ],
      cta: { label: "Start your build", href: "/signup/client" },
    },
    {
      kind: "points",
      title: "Find the people who can bring your project to life.",
      body: [
        "Explore contractor profiles, review their experience, and compare bids before making your decision. Choose a team that fits your project requirements and budget.",
      ],
      points: [
        "Review contractor experience and specialties.",
        "Browse project portfolios and completed work.",
        "Compare bids and proposed timelines.",
        "Connect with a qualified inspector for independent site checks.",
      ],
      cta: { label: "Browse contractors", href: "/build/contractors" },
      secondaryCta: { label: "Find an inspector", href: "/build/inspectors" },
    },
    {
      kind: "points",
      title: "Know what's happening on site, even when you're not there.",
      body: [
        "You choose your inspector, and they visit the site to review completed work in person. Their findings help you make informed decisions about each construction stage.",
      ],
      points: [
        "Independent site visits.",
        "Documented inspection findings.",
        "Review and approval before stage payment, according to project rules.",
      ],
      cta: { label: "Learn about inspections", href: "/how-it-works" },
    },
    {
      kind: "features",
      title: "A clearer way to manage construction payments.",
      body: [
        "Your project is divided into construction stages, helping you understand what you're funding and when payments are expected. The required inspection and approval steps are connected to each stage.",
      ],
      features: [
        {
          title: "Stage-based funding",
          body: "Allocate funds for the specific construction work you're ready to undertake.",
        },
        {
          title: "Clear amounts",
          body: "See the amount involved before you confirm a funding transaction.",
        },
        {
          title: "Approval process",
          body: "Follow the required review and approval steps before the contractor receives payment.",
        },
      ],
    },
    {
      kind: "fee",
      id: "fees",
      eyebrow: "Simple, transparent pricing",
      title: "Know the cost before you fund a stage.",
      body: [
        "Velora charges a 3% fee when you fund a construction stage. You'll see the applicable amount before confirming your payment.",
      ],
      rate: "3%",
      applied: "When funding a construction stage",
      note: "See the amount before confirmation.",
      cta: { label: "Start your project", href: "/signup/client" },
    },
  ],
  faq: [
    {
      q: "Can I use Velora while living abroad?",
      a: "Yes. Velora is designed to help clients manage construction projects back home while living abroad. You can create a project, connect with contractors and inspectors, and follow the project through its stages.",
    },
    {
      q: "Can I choose my contractor?",
      a: "Yes. You can review contractor profiles and bids, then choose the contractor you want to work with.",
    },
    {
      q: "Do I need to know a building inspector?",
      a: "No. You can browse the available inspector directory and select a qualified professional based on your project requirements and the areas they cover.",
    },
    {
      q: "How does the inspection process work?",
      a: "Your selected inspector visits the construction site and reviews the relevant stage in person. They document their findings, which are used in the project's review and approval process.",
    },
    {
      q: "How are construction payments handled?",
      a: "Project payments are structured around construction stages. The required inspection and approval steps are completed before payment is released according to the project rules.",
    },
    {
      q: "What is the Velora service fee?",
      a: "Velora charges 3% when you fund a construction stage. The applicable amount is shown before you confirm the payment.",
    },
    {
      q: "What happens if the contractor doesn't complete a stage?",
      a:
        // OPEN-ANSWERED: the brief marks this [Confirm], but the escrow program
        // already settles it — `refund_milestone` succeeds before the contractor
        // submits and is rejected afterwards, which the contract tests cover.
        // Answered from what the code actually does rather than left blank.
        "If the contractor hasn't submitted any work for a stage you've funded, you can withdraw those funds back to your own wallet. Once work has been submitted for review, the stage follows the inspection and approval process instead.",
    },
    {
      q: "Do I need to understand cryptocurrency?",
      a:
        // BRIEF-DEVIATION / OPEN: the brief marks the funding experience
        // [Confirm] and assumes conversion may happen behind the scenes. No
        // fiat on-ramp exists, so this describes the flow that is actually
        // built. Revisit if an on-ramp ships.
        "You'll need a Solana wallet, and Velora walks you through setting one up in a few minutes. Project funds are held and paid out in USDC, a digital dollar built to always equal $1, so the amounts you see match the amounts you'd expect.",
    },
  ],
  finalCta: {
    headline: "Your home back home starts with a plan.",
    body: "Create your project, connect with the right people, and start building with a clearer way to stay involved from abroad.",
    cta: { label: "Start your build", href: "/signup/client" },
    microcopy: "Create your account and set up your first project.",
  },
};

// ---------------------------------------------------------------------------
// Contractor
// ---------------------------------------------------------------------------

export const CONTRACTOR: RoleContent = {
  role: "contractor",
  path: "/contractors",
  navLabel: "For contractors",
  audience:
    "Contractors and construction companies looking to win projects from clients abroad.",
  hero: {
    eyebrow: "For contractors and building firms",
    headline: "Bid on building projects from clients abroad.",
    body: "Connect with Nigerians in the diaspora who are looking to build or renovate back home. Browse available projects, submit your bids, and showcase your work to clients who need your expertise.",
    primaryCta: { label: "Find projects", href: "/build/jobs" },
    secondaryCta: { label: "See how it works", href: "#how-it-works" },
    microcopy: [
      "Discover construction projects.",
      "Submit bids with your terms.",
      "Build your professional track record.",
    ],
  },
  blocks: [
    {
      kind: "cards",
      title: "Your next project could be closer than you think.",
      body: [
        "Clients abroad are looking for contractors who can help them bring their building plans to life. Velora gives you a place to discover relevant opportunities, share your experience, and submit bids for projects that match your capabilities.",
      ],
      cards: [
        {
          title: "Reach new clients",
          body: "Connect with people abroad who need contractors for projects in Nigeria.",
        },
        {
          title: "Find relevant work",
          body: "Review project requirements, location, budget, and stages before deciding whether to bid.",
        },
        {
          title: "Showcase your expertise",
          body: "Build a profile that highlights your experience, specialties, and completed projects.",
        },
        {
          title: "Understand the payment process",
          body: "See the agreed stage structure and applicable payment terms before beginning work.",
        },
      ],
    },
    {
      kind: "points",
      title: "Spend more time building. Find less work through guesswork.",
      body: [
        "Getting the right project often depends on personal networks, referrals, and finding clients at the right time. Velora helps you discover new opportunities and present your work to clients looking to build back home.",
      ],
      points: [
        "Finding clients outside your existing network.",
        "Reaching people abroad who want to build in Nigeria.",
        "Spending time on projects that don't match your capabilities.",
        "Following up repeatedly on payment after completed work.",
        "Finding ways to demonstrate your experience to new clients.",
      ],
      cta: { label: "Explore project opportunities", href: "/build/jobs" },
    },
    {
      kind: "steps",
      id: "how-it-works",
      title: "Find a project. Submit your bid. Start building.",
      steps: [
        {
          title: "Browse open projects",
          body: "Review projects posted by clients abroad, including the location, requirements, budget, and proposed stages.",
        },
        {
          title: "Submit your bid",
          body: "Share your price, estimated timeline, and proposed approach to completing the work.",
        },
        {
          title: "Get selected",
          body: "If your bid is chosen, agree on the project details and prepare to begin.",
        },
        {
          title: "Complete the agreed stage",
          body: "Carry out the work and submit the required progress evidence.",
        },
        {
          title: "Get paid for approved work",
          body: "Once the required inspection and client approval steps are complete, payment is processed according to the project rules.",
        },
      ],
      cta: { label: "Find your next project", href: "/build/jobs" },
    },
    {
      kind: "points",
      title: "Let your work speak for you.",
      body: [
        "Your Velora profile gives clients a way to understand your experience before they choose a contractor. Add your company details, specialties, years of experience, and completed projects.",
      ],
      points: [
        "Company name and contact details.",
        "Years of experience.",
        "Construction specialties.",
        "Service location.",
        "Project portfolio.",
        "Completed work and relevant reviews, where available.",
      ],
      cta: { label: "Create your contractor profile", href: "/signup/contractor" },
    },
    {
      kind: "points",
      title: "Know what's agreed before you start.",
      body: [
        "Review the project's stage structure and payment terms before beginning. As you complete the work, the required inspection and approval steps help guide when payment is processed.",
      ],
      points: [
        "Review the project stage and agreed terms.",
        "Submit required evidence of completed work.",
        "Receive payment according to the approved process.",
      ],
    },
    {
      kind: "fee",
      id: "fees",
      title: "What Velora costs you.",
      body: [
        "Velora's contractor fee is deducted from a stage payment you receive — never upfront, and never on work that hasn't been paid for.",
      ],
      rate: "1%",
      applied: "Deducted from a stage payment you receive",
      note: "See your net payout before you bid.",
      cta: { label: "Find projects", href: "/build/jobs" },
    },
  ],
  faq: [
    {
      q: "Who can bid on Velora projects?",
      a: "Contractors and building firms can create a profile and bid on available construction projects. Create your profile with your company details, experience, and specialties to start bidding.",
    },
    {
      q: "What kind of projects can I find?",
      a: "Projects may include residential construction and renovation work. The available categories depend on the projects posted on Velora.",
    },
    {
      q: "Can I choose which projects to bid on?",
      a: "Yes. Browse available project details and submit bids for opportunities that match your experience, location, and capabilities.",
    },
    {
      q: "What should I include in my bid?",
      a: "Your proposed price, estimated timeline, and approach to completing the project. Include any additional details requested by the client.",
    },
    {
      q: "How do I get paid?",
      a: "Payment is processed after the required inspection and client approval steps for the relevant construction stage. The exact payment conditions are determined by the project rules.",
    },
    {
      q: "What is Velora's fee?",
      a: "1%, deducted from a stage payment you receive. Nothing is charged upfront, and nothing is charged on work you haven't been paid for.",
    },
    {
      q: "Can I create a profile without a large portfolio?",
      a: "Yes. Add whatever experience you have, even a single project. Work you complete through Velora is added to your profile as it's approved.",
    },
    // OPEN-OMITTED: "What happens if a client doesn't approve completed work?"
    // The dispute and escalation path is not defined, and the brief says so.
    // Contractors will ask this immediately — it should ship once decided.
  ],
  finalCta: {
    headline: "Find your next construction opportunity.",
    body: "Connect with clients abroad, submit bids for projects that fit your expertise, and grow your professional presence on Velora.",
    cta: { label: "Join as a contractor", href: "/signup/contractor" },
  },
};

// ---------------------------------------------------------------------------
// Inspector
// ---------------------------------------------------------------------------

export const INSPECTOR: RoleContent = {
  role: "inspector",
  path: "/inspectors",
  navLabel: "For inspectors",
  audience:
    "Licensed quantity surveyors, structural engineers, and architects who want paid inspection opportunities.",
  hero: {
    eyebrow: "For quantity surveyors, structural engineers, and architects",
    headline: "Put your professional expertise to work on construction projects.",
    body: "Connect with clients abroad who need qualified professionals to inspect their building projects in person. Find inspection opportunities, document your findings, and earn from your expertise.",
    primaryCta: { label: "Find inspection work", href: "/build/jobs" },
    secondaryCta: { label: "See how it works", href: "#how-it-works" },
    microcopy: [
      "Find assignments in your service areas.",
      "Document findings from every site visit.",
      "Build a public professional record.",
    ],
  },
  blocks: [
    {
      kind: "cards",
      title: "More opportunities to use what you already know.",
      body: [
        "Your professional expertise can support clients who aren't able to visit their building sites themselves. Velora helps connect you with construction projects that need qualified inspection services.",
      ],
      cards: [
        {
          title: "Find inspection assignments",
          body: "Browse available jobs that match your qualifications and service areas.",
        },
        {
          title: "Work with clients abroad",
          body: "Support clients who need someone on the ground to inspect their construction work.",
        },
        {
          title: "Build your professional record",
          body: "Showcase your qualifications, inspection history, and client reviews where available.",
        },
        {
          title: "Work around your schedule",
          body: "Discover opportunities that fit your availability and service areas, subject to project requirements.",
        },
      ],
    },
    {
      kind: "points",
      title: "Your expertise shouldn't depend on one firm's project list.",
      body: [
        "Inspection work can be tied to larger contracts, personal networks, or opportunities that come and go. Velora provides a way for qualified professionals to discover additional assignments and connect with clients who need their services.",
      ],
      points: [
        "Finding inspection opportunities between larger contracts.",
        "Reaching clients who need independent site visits.",
        "Finding work that fits your location.",
        "Building a public professional profile.",
        "Keeping track of your completed inspection experience.",
      ],
    },
    {
      kind: "steps",
      id: "how-it-works",
      title: "Your qualifications. Your expertise. New opportunities.",
      steps: [
        {
          title: "Create your professional profile",
          body: "Add your qualifications, licence number, experience, and service areas.",
        },
        {
          title: "Discover available assignments",
          body: "Browse open inspection jobs or allow clients to find you through your public profile.",
        },
        {
          title: "Submit a bid or accept an assignment",
          body: "Follow the relevant project process to secure the inspection work.",
        },
        {
          title: "Visit the construction site",
          body: "Inspect the assigned stage in person and document your findings with the required evidence.",
        },
        {
          title: "Submit your findings",
          body: "Record whether the work meets the inspection requirements and submit your report.",
        },
        {
          title: "Receive payment",
          body: "Get paid according to the inspection assignment and the applicable approval and payment process.",
        },
      ],
      cta: { label: "Find inspection work", href: "/build/jobs" },
    },
    {
      kind: "points",
      title: "Make your expertise easier to find.",
      body: [
        "Your profile helps clients understand your professional background and the areas where you can provide inspection services.",
      ],
      points: [
        "Professional qualifications.",
        "Licence number and licensing body.",
        "Years of experience.",
        "Service areas.",
        "Inspection history.",
        "Client reviews, where available.",
      ],
      cta: { label: "Create your inspector profile", href: "/signup/inspector" },
    },
    {
      kind: "points",
      title: "Your role is to inspect the work and report what you find.",
      body: [
        "Clients need reliable information about the progress of their construction projects. Your role is to visit the site, assess the assigned stage, document your findings, and submit your inspection according to the project requirements.",
      ],
      points: [
        "The client selects an inspector or uses the available assignment process.",
        "Inspections are conducted on site.",
        "Findings are documented and submitted for the required review.",
      ],
      cta: { label: "Find inspection opportunities", href: "/build/jobs" },
    },
    {
      kind: "fee",
      id: "fees",
      title: "Clear assignments. Structured payments.",
      body: [
        "Know what you're being asked to inspect and how payment is handled before you take on an assignment. Velora's fee is deducted from the payment for a confirmed stage — nothing upfront.",
      ],
      rate: "1%",
      applied: "Deducted from payment for a confirmed stage",
      note: "Nothing upfront, nothing on work you haven't done.",
      cta: { label: "Find inspection work", href: "/build/jobs" },
    },
  ],
  faq: [
    {
      q: "Who can register as an inspector?",
      a: "Velora is intended for qualified quantity surveyors, structural engineers, and architects. You'll be asked to provide your professional credentials and licence details when you sign up.",
    },
    {
      q: "Can I choose which inspection jobs to take?",
      a: "You can bid on open jobs, or be selected directly by a client from your public profile. Assignment availability depends on the project requirements.",
    },
    {
      q: "What happens during an inspection?",
      a: "You visit the construction site, review the assigned stage in person, and document your findings using the required process.",
    },
    {
      q: "Who chooses the inspector?",
      a: "A client can select an inspector directly from the inspector directory, or choose from the professionals who bid to inspect their project.",
    },
    {
      q: "How do I get paid?",
      a: "Payment is handled according to the inspection assignment's requirements and approval process, per confirmed stage, after client approval.",
    },
    {
      q: "What is Velora's fee?",
      a: "1%, deducted from the payment for a confirmed stage. Nothing is charged upfront.",
    },
    // OPEN-OMITTED: "What happens if I reject a stage?" — the rework path and
    // whether the inspector is paid for the visit are undefined.
    // OPEN-OMITTED: "How long does credential verification take?" — no
    // turnaround time has been set, and publishing one would be a guess.
  ],
  finalCta: {
    headline: "Get paid for the expertise you bring to every site visit.",
    body: "Create your profile, discover inspection opportunities, and connect with clients who need qualified professionals.",
    cta: { label: "Join as an inspector", href: "/signup/inspector" },
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
// Shared: How it works
// ---------------------------------------------------------------------------

export const HOW_IT_WORKS = {
  hero: {
    title: "One place to connect, manage, and inspect construction projects.",
    body: "Velora brings clients, contractors, and inspectors together to make construction projects easier to coordinate — whether you're building from abroad, completing a project, or providing professional inspection services.",
  },
  roles: [
    {
      role: "client" as const,
      eyebrow: "For clients",
      title: "Build from anywhere.",
      body: "Create your project, find contractors and inspectors, and stay involved through each construction stage.",
      cta: { label: "Build with Velora", href: "/clients" },
    },
    {
      role: "contractor" as const,
      eyebrow: "For contractors",
      title: "Find your next project.",
      body: "Browse construction opportunities from clients abroad, submit bids, and showcase your work.",
      cta: { label: "Find projects", href: "/contractors" },
    },
    {
      role: "inspector" as const,
      eyebrow: "For inspectors",
      title: "Put your expertise to work.",
      body: "Connect with clients who need qualified professionals to inspect construction work in person.",
      cta: { label: "Find inspection work", href: "/inspectors" },
    },
  ],
  workflow: {
    title: "From project setup to completed work.",
    body: "The process varies by role, but each project is structured around clear requirements, construction stages, and the relevant review and payment steps.",
    steps: [
      "A client creates a project.",
      "Contractors review the project and submit bids.",
      "The client selects a contractor and inspector.",
      "The project is organized into construction stages.",
      "Contractors complete work and submit updates.",
      "Inspectors review the relevant work in person.",
      "The client follows the required approval process.",
      "Payment is processed according to the project rules.",
    ],
    cta: { label: "Get started", href: "/signup" },
  },
};

// ---------------------------------------------------------------------------
// Shared: Fees
// ---------------------------------------------------------------------------

export const FEES_PAGE = {
  hero: {
    title: "Know what you're paying for.",
    body: "Velora makes applicable service fees visible before you confirm a transaction. The amount and conditions depend on your role and the type of activity you're completing.",
  },
  tiers: [
    {
      eyebrow: "For clients",
      rate: "3%",
      applied: "When funding a construction stage",
      body: "The applicable service fee is shown before you confirm your funding transaction.",
      cta: { label: "Start your build", href: "/signup/client" },
    },
    {
      eyebrow: "For contractors",
      rate: "1%",
      applied: "Deducted from applicable stage payments",
      body: "The fee is deducted from a stage payment you receive, after the required approvals are complete.",
      cta: { label: "Find projects", href: "/build/jobs" },
    },
    {
      eyebrow: "For inspectors",
      rate: "1%",
      applied: "Deducted from applicable stage payments",
      body: "The fee is deducted from the payment for a confirmed stage, after client approval.",
      cta: { label: "Find inspection work", href: "/build/jobs" },
    },
  ],
  clarification: {
    title: "See the details before you confirm.",
    body: [
      "The exact fee, applicable payment conditions, and final amount are visible to you before you complete a transaction.",
      "Velora's service fee is separate from any network transaction cost charged for settling the payment itself. Where both apply, they are shown separately rather than combined into one number.",
    ],
  },
};

// ---------------------------------------------------------------------------
// Shared: FAQ
// ---------------------------------------------------------------------------

export const GENERAL_FAQ: FaqItem[] = [
  {
    q: "What is Velora?",
    a: "Velora is a construction project platform that connects clients, contractors, and inspectors. It helps clients manage building projects from abroad and gives professionals a way to find relevant construction and inspection opportunities.",
  },
  {
    q: "Who is Velora for?",
    a: "Velora is designed for three main groups: clients building or renovating from abroad, contractors looking for construction projects, and qualified professionals who provide inspection services.",
  },
  {
    q: "Where can I use Velora?",
    a:
      // OPEN: the brief marks the supported regions [Confirm]. This reflects
      // the only scope the rest of the product assumes — Nigerian builds funded
      // from abroad — rather than leaving the question visibly unanswered.
      // Confirm the real scope before launch.
      "Velora is starting with construction projects in Nigeria, funded by clients living abroad. Support for more locations will follow as qualified inspectors are verified in them.",
  },
  {
    q: "How are construction payments handled?",
    a: "Payments are organised around construction stages. For each stage, funds are allocated up front and released after the required inspection and client approval steps are complete.",
  },
  {
    q: "Can Velora move project funds on its own?",
    a:
      // OPEN-ANSWERED: the brief marks this [Confirm]. The escrow program has
      // no instruction that releases funds without both approvals, and the
      // admin key can only change fee rates — verified by the contract test
      // suite and on devnet. Safe to state plainly.
      "No. Releasing funds for a stage requires approval from both your inspector and you. There is no separate step that lets Velora release, freeze, or redirect project funds on its own, and the same rule applies to every party on a project.",
  },
  {
    q: "Do I need to know anything about cryptocurrency?",
    a:
      // BRIEF-DEVIATION / OPEN: see the matching client FAQ entry.
      "You'll need a Solana wallet, which Velora helps you set up. Project funds are held and paid out in USDC — a digital dollar built to always equal $1 — so amounts stay recognisable throughout your project.",
  },
  // OPEN-OMITTED: "What happens if there is a dispute?" The dispute workflow is
  // an open product question; publishing a policy before it exists would
  // commit Velora to something it cannot yet honour.
];

// ---------------------------------------------------------------------------
// Sign-up role picker
// ---------------------------------------------------------------------------

export const ROLE_PICKER = {
  title: "How will you use Velora?",
  subtitle:
    "Choose the option that best describes what you want to do. You can add another role later from your account.",
};
