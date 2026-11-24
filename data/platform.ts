export type PermissionRow = {
  id: string;
  name: string;
  Admin: string;
  Advisor: string;
  Client: string;
};

export const permissionLevels = [
  "Full access",
  "All households",
  "Own household",
  "View only",
  "No access",
] as const;

export const permissions: PermissionRow[] = [
  {
    id: "p1",
    name: "View portfolios",
    Admin: "Full access",
    Advisor: "All households",
    Client: "Own household",
  },
  {
    id: "p2",
    name: "Edit holdings, accounts & transactions",
    Admin: "Full access",
    Advisor: "View only",
    Client: "No access",
  },
  {
    id: "p3",
    name: "Manage CRM and pipeline",
    Admin: "Full access",
    Advisor: "All households",
    Client: "No access",
  },
  {
    id: "p4",
    name: "Create, edit & delete notes and tasks",
    Admin: "Full access",
    Advisor: "All households",
    Client: "No access",
  },
  {
    id: "p5",
    name: "Ask the assistant",
    Admin: "Full access",
    Advisor: "All households",
    Client: "Own household",
  },
  {
    id: "p6",
    name: "Documents and reports",
    Admin: "Full access",
    Advisor: "All households",
    Client: "Own household",
  },
  {
    id: "p7",
    name: "Book & manage meetings",
    Admin: "Full access",
    Advisor: "All households",
    Client: "Own household",
  },
  {
    id: "p8",
    name: "Manage integrations",
    Admin: "Full access",
    Advisor: "View only",
    Client: "No access",
  },
  {
    id: "p9",
    name: "Manage users, permissions & audit log",
    Admin: "Full access",
    Advisor: "No access",
    Client: "No access",
  },
  {
    id: "p10",
    name: "Manage ownership settings",
    Admin: "Full access",
    Advisor: "No access",
    Client: "No access",
  },
];

export type OwnershipCard = {
  id: string;
  title: string;
  body: string;
};

export const ownership: OwnershipCard[] = [
  {
    id: "own1",
    title: "Your source code",
    body: "The proposed engagement places the application repository in your organization. Your team retains the source, full commit history, and the ability to appoint a different development partner.",
  },
  {
    id: "own2",
    title: "Your hosting",
    body: "Production hosting, domains, billing, and deployment projects would be created in client-owned accounts. No dependency on a developer’s personal subscription.",
  },
  {
    id: "own3",
    title: "Your admin access",
    body: "Named client administrators would control access, integrations, recovery credentials, and offboarding. Partner access would be permissioned and revocable.",
  },
  {
    id: "own4",
    title: "A documented handoff",
    body: "Delivery would include architecture notes, deployment instructions, dependency licenses, a configuration inventory, and a walkthrough for your internal team.",
  },
];

export const roadmap = [
  {
    phase: "01",
    days: "DAYS 01–30",
    title: "Discover & prototype",
    body: "Map advisor workflows, agree on the permissions model, and validate a clickable prototype with your team.",
    outcome: "Approved workflows & prototype",
  },
  {
    phase: "02",
    days: "DAYS 31–60",
    title: "Build & connect",
    body: "Develop the approved experience, connect sandbox providers, and test household-level data boundaries.",
    outcome: "Integrated staging workspace",
  },
  {
    phase: "03",
    days: "DAYS 61–90",
    title: "Validate & hand over",
    body: "Complete acceptance testing, accessibility checks, security review, and a client-owned deployment.",
    outcome: "Pilot release & documented handoff",
  },
];

export const approach = [
  {
    capability: "Portfolio visualization",
    build: "Your reporting experience",
    reuse: "Recharts & React",
    internal: "Approve report definitions",
  },
  {
    capability: "Advisor workflows",
    build: "Households, notes & tasks",
    reuse: "Accessible UI primitives",
    internal: "Define working practices",
  },
  {
    capability: "Intelligence",
    build: "Context & guardrails",
    reuse: "Approved model provider",
    internal: "Review compliance policy",
  },
  {
    capability: "Platform operations",
    build: "Deployment & runbooks",
    reuse: "Managed infrastructure",
    internal: "Own accounts & access",
  },
];

export const faqs = [
  {
    q: "Is this connected to real client accounts?",
    a: "No. Every person, balance, document, and transaction is fictional. The demo uses local fixtures and never connects to custodians, email accounts, or a database.",
  },
  {
    q: "What happens to changes I make?",
    a: "Changes stay in React state while you navigate this session. Refreshing the page resets the demo. Uploaded file contents are never read or transmitted.",
  },
  {
    q: "Does the assistant give investment advice?",
    a: "No. It uses keyword-based templates to summarize sample records. It does not call a model provider, recommend trades, or make investment decisions.",
  },
  {
    q: "Who would own the finished platform?",
    a: "The proposed engagement puts source code, hosting, domains, administrator accounts, and documentation under your firm’s control, subject to the final agreement.",
  },
];
