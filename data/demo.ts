export type Role = "Admin" | "Advisor" | "Client";
export type Stage =
  | "Prospect"
  | "Meeting"
  | "Proposal"
  | "Onboarding"
  | "Client";
export const stages: Stage[] = [
  "Prospect",
  "Meeting",
  "Proposal",
  "Onboarding",
  "Client",
];
export const avatarColors = [
  "sage",
  "sand",
  "lilac",
  "blue",
  "rose",
  "peach",
] as const;
export const snapshot = "2025-06-30";

export const money = (n: number, digits = 0) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(n);

export const compact = (n: number) =>
  n >= 1000000 ? `$${(n / 1000000).toFixed(2)}M` : money(n);

export const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((x) => x[0]?.toUpperCase() ?? "")
    .join("") || "V";

export const displayDate = (date: string) => {
  if (!date) return "—";
  const parsed = new Date(date.slice(0, 10) + "T12:00:00");
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const demoCredentials: Record<
  Role,
  { email: string; password: string; name: string; summary: string }
> = {
  Admin: {
    email: "robin.vale@example.com",
    password: "VesttaraAdmin!2025",
    name: "Robin Vale",
    summary: "Full access — add, edit & delete everything",
  },
  Advisor: {
    email: "adrian.mercer@example.com",
    password: "VesttaraAdvisor!2025",
    name: "Adrian Mercer",
    summary: "Portfolios, CRM, tasks, notes & AI assistant",
  },
  Client: {
    email: "john.everly@example.com",
    password: "VesttaraClient!2025",
    name: "John Everly",
    summary: "Own accounts, reports, documents & advisor chat",
  },
};

const names = [
  "John Everly",
  "Olivia Hartwell",
  "James Alder",
  "Eleanor Wren",
  "Theo Merrick",
  "Clara Finch",
  "Miles Roswell",
  "Isla Bellamy",
  "Noah Fenwick",
  "Cora Marlow",
  "Owen Ashby",
  "Vera Linden",
];
const values = [
  3842650, 3215800, 2734000, 2415000, 2230000, 2025000, 1860000, 1670000,
  1490000, 1320000, 1160000, 900000,
];
values[11] += 24862450 - values.reduce((a, b) => a + b, 0);

export type Client = {
  id: string;
  name: string;
  household: string;
  email: string;
  value: number;
  returns: number;
  color: string;
  advisorId: string;
  risk: string;
  joined: string;
  location: string;
};

export const clients: Client[] = names.map((name, i) => ({
  id: `c${i + 1}`,
  name,
  household: `${name.split(" ")[1]} household`,
  email: `${name.toLowerCase().replace(" ", ".")}@example.com`,
  value: values[i],
  returns: [
    14.62, 12.18, 15.34, 9.85, 11.92, 13.44, 14.02, 10.3, 12.68, 11.14, 13.86,
    12.29,
  ][i],
  color: ["sage", "sand", "lilac", "blue", "rose", "peach"][i % 6],
  advisorId: i % 3 === 0 ? "a2" : "a1",
  risk: ["Balanced", "Growth", "Conservative"][i % 3],
  joined: `${2018 + (i % 6)}`,
  location: ["Portland, OR", "Boulder, CO", "Raleigh, NC", "Austin, TX"][i % 4],
}));

export type UserRecord = {
  id: string;
  name: string;
  role: Role;
  email: string;
  password: string;
  color: string;
  status: "Active" | "Invited" | "Suspended";
};

export const staff: UserRecord[] = [
  {
    id: "admin1",
    name: "Robin Vale",
    role: "Admin",
    email: "robin.vale@example.com",
    password: demoCredentials.Admin.password,
    color: "lilac",
    status: "Active",
  },
  {
    id: "a1",
    name: "Adrian Mercer",
    role: "Advisor",
    email: "adrian.mercer@example.com",
    password: demoCredentials.Advisor.password,
    color: "sage",
    status: "Active",
  },
  {
    id: "a2",
    name: "Tessa Rowan",
    role: "Advisor",
    email: "tessa.rowan@example.com",
    password: demoCredentials.Advisor.password,
    color: "sand",
    status: "Active",
  },
];

export const users: UserRecord[] = [
  ...staff,
  ...clients.map((c) => ({
    id: c.id,
    name: c.name,
    role: "Client" as Role,
    email: c.email,
    password: demoCredentials.Client.password,
    color: c.color,
    status: "Active" as const,
  })),
];

export const profiles: Record<Role, UserRecord> = {
  Admin: staff[0],
  Advisor: staff[1],
  Client: users[3],
};

export type Account = {
  id: string;
  clientId: string;
  type: string;
  balance: number;
  last4: string;
  custodian: string;
};

export const accounts: Account[] = clients.flatMap((c, i) => {
  const types =
    i < 6
      ? ["Traditional IRA", "Taxable brokerage", "401(k)"]
      : ["Traditional IRA", "Taxable brokerage"];
  const parts = i < 6 ? [0.43, 0.35, 0.22] : [0.56, 0.44];
  let remaining = c.value;
  return types.map((type, j) => {
    const balance =
      j === types.length - 1 ? remaining : Math.round(c.value * parts[j]);
    remaining -= balance;
    return {
      id: `acc-${i + 1}-${j + 1}`,
      clientId: c.id,
      type,
      balance,
      last4: String(4102 + i * 31 + j * 47),
      custodian: ["Northline Custody", "Meridian Trust"][i % 2],
    };
  });
});

export type Transaction = {
  id: string;
  clientId: string;
  accountId: string;
  type: string;
  description: string;
  amount: number;
  date: string;
};

export const transactions: Transaction[] = Array.from(
  { length: 200 },
  (_, i) => {
    const account = accounts[(i * 7) % 30];
    const date = new Date(Date.UTC(2025, 5, 30 - Math.floor(i / 3)));
    return {
      id: `TX-${5200 - i}`,
      clientId: account.clientId,
      accountId: account.id,
      type: ["Dividend", "Contribution", "Purchase", "Distribution"][i % 4],
      description: [
        "Quarterly dividend",
        "Scheduled contribution",
        "Fund purchase",
        "Account distribution",
      ][i % 4],
      amount: Math.round((125 + ((i * 347.73) % 12800)) * 100) / 100,
      date: date.toISOString().slice(0, 10),
    };
  },
);

export type Note = {
  id: string;
  clientId: string;
  title: string;
  body: string;
  date: string;
};

const noteSamples = [
  [
    "Quarterly portfolio review",
    "Reviewed the current allocation, upcoming cash needs, and long-term retirement goals. The household prefers to maintain its balanced profile.",
  ],
  [
    "Retirement planning check-in",
    "Discussed retirement timing and requested an updated household spending estimate before the next review.",
  ],
  [
    "Document follow-up",
    "Requested the latest account statements and confirmed the secure document checklist.",
  ],
  [
    "Annual review preparation",
    "Prepared the household summary and confirmed meeting availability for the next quarterly review.",
  ],
];

export const initialNotes: Note[] = Array.from({ length: 40 }, (_, i) => ({
  id: `n${i}`,
  clientId: clients[i % 12].id,
  title: noteSamples[i % 4][0],
  body: noteSamples[i % 4][1],
  date: new Date(Date.UTC(2025, 5, 26 - i)).toISOString().slice(0, 10),
}));

export type Task = {
  id: string;
  clientId: string;
  title: string;
  due: string;
  priority: "Normal" | "High";
  done: boolean;
};

export const initialTasks: Task[] = [
  {
    id: "t1",
    clientId: "c1",
    title: "Prepare quarterly review for John",
    due: "2025-06-30",
    priority: "High",
    done: false,
  },
  {
    id: "t2",
    clientId: "c2",
    title: "Review updated retirement goals",
    due: "2025-07-01",
    priority: "Normal",
    done: false,
  },
  {
    id: "t3",
    clientId: "c4",
    title: "Send the household document checklist",
    due: "2025-07-02",
    priority: "Normal",
    done: false,
  },
];

export type Meeting = {
  id: string;
  clientId: string;
  title: string;
  date: string;
  time: string;
  kind: string;
};

export const initialMeetings: Meeting[] = [
  {
    id: "m1",
    clientId: "c1",
    title: "Quarterly portfolio review",
    date: "2025-07-02",
    time: "10:00",
    kind: "Video call",
  },
  {
    id: "m2",
    clientId: "c2",
    title: "Retirement planning session",
    date: "2025-07-03",
    time: "14:00",
    kind: "Office meeting",
  },
  {
    id: "m3",
    clientId: "c4",
    title: "Household check-in",
    date: "2025-07-07",
    time: "09:30",
    kind: "Video call",
  },
];

export type DocItem = {
  id: string;
  clientId: string;
  name: string;
  category: string;
  date: string;
  size: string;
};

export const initialDocs: DocItem[] = Array.from({ length: 15 }, (_, i) => ({
  id: `doc${i}`,
  clientId: clients[i % 12].id,
  name:
    [
      "Q2 2025 portfolio report",
      "Investment policy statement",
      "Household financial plan",
      "Quarterly review notes",
    ][i % 4] + ".pdf",
  category: ["Report", "Agreement", "Plan", "Meeting notes"][i % 4],
  date: "2025-06-26",
  size: `${128 + i * 22} KB`,
}));

export type AllocationSlice = {
  id: string;
  name: string;
  pct: number;
  color: string;
};

export const allocation: AllocationSlice[] = [
  { id: "alloc1", name: "U.S. equities", pct: 45, color: "#203c51" },
  { id: "alloc2", name: "Fixed income", pct: 25, color: "#b8a16c" },
  { id: "alloc3", name: "Int’l equities", pct: 18, color: "#8fa99b" },
  { id: "alloc4", name: "Alternatives", pct: 8, color: "#a7b6c6" },
  { id: "alloc5", name: "Cash", pct: 4, color: "#dedbce" },
];

export type Holding = {
  id: string;
  symbol: string;
  name: string;
  asset: string;
  weight: number;
  change: number;
};

export const holdings: Holding[] = [
  {
    id: "h1",
    symbol: "NLEQ",
    name: "Northline U.S. Equity Fund",
    asset: "U.S. equities",
    weight: 32,
    change: 1.28,
  },
  {
    id: "h2",
    symbol: "MTBD",
    name: "Meridian Core Bond Fund",
    asset: "Fixed income",
    weight: 25,
    change: 0.34,
  },
  {
    id: "h3",
    symbol: "ATIN",
    name: "Atlas International Index",
    asset: "Int’l equities",
    weight: 18,
    change: 0.87,
  },
  {
    id: "h4",
    symbol: "LGEQ",
    name: "Linden Growth Equity",
    asset: "U.S. equities",
    weight: 13,
    change: 1.63,
  },
  {
    id: "h5",
    symbol: "ALTR",
    name: "Alder Real Assets Fund",
    asset: "Alternatives",
    weight: 8,
    change: -0.22,
  },
  {
    id: "h6",
    symbol: "CASH",
    name: "Cash & equivalents",
    asset: "Cash",
    weight: 4,
    change: 0,
  },
];

const months = [
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
];

// Cumulative sample returns, normalized to the opening balance. The chart's
// first and final valuations reconcile with the headline return for each scope.
const anchors = [
  0, 0.019, 0.009, 0.035, 0.057, 0.043, 0.065, 0.082, 0.069, 0.101, 0.09, 0.117,
  0.1284,
];

export const priceHistory = Array.from({ length: 144 }, (_, i) => {
  const m = Math.floor(i / 12),
    f = (i % 12) / 12;
  const noise =
    Math.sin(i * 2.37) * 0.0033 +
    Math.sin(i * 0.84) * 0.0035 +
    Math.sin(i * 1.71) * 0.0018;
  const change =
    i === 143 ? 0.1284 : anchors[m] + (anchors[m + 1] - anchors[m]) * f + noise;
  const benchmark =
    i === 143
      ? 0.0964
      : (i / 143) * 0.0964 +
        Math.sin(i * 0.15) * 0.0037 +
        Math.sin(i * 1.2) * 0.0012;
  return {
    month: months[m],
    label: `${months[m]} ${m < 6 ? "2024" : "2025"}`,
    day: i === 143 ? 30 : Math.round(1 + (i % 12) * 2.55),
    value: 1 + change,
    benchmark: 1 + benchmark,
  };
});

export type Lead = {
  id: string;
  name: string;
  stage: Stage;
  value: number;
  topic: string;
  color: string;
};

export const initialLeads: Lead[] = [
  ["Lyra West", "Prospect", 850000, "Retirement planning"],
  ["Evan Hale", "Prospect", 1200000, "Family wealth"],
  ["Alma Reid", "Meeting", 640000, "Investment review"],
  ["Jude Vale", "Proposal", 1500000, "Estate planning"],
  ["Mira Ellery", "Onboarding", 920000, "Portfolio transfer"],
  ["John Everly", "Client", 3842650, "Wealth management"],
].map((r, i) => ({
  id: `lead${i}`,
  name: String(r[0]),
  stage: r[1] as Stage,
  value: Number(r[2]),
  topic: String(r[3]),
  color: ["sage", "sand", "lilac"][i % 3],
}));

export type AuditEntry = {
  id: string;
  event: "Login" | "View" | "Edit" | "Delete";
  actor: string;
  detail: string;
  time: string;
};

export const initialAudit: AuditEntry[] = [
  {
    id: "aud1",
    event: "Login",
    actor: "Adrian Mercer",
    detail: "Entered advisor workspace",
    time: "Jun 30, 9:42 AM",
  },
  {
    id: "aud2",
    event: "View",
    actor: "John Everly",
    detail: "Viewed quarterly portfolio report",
    time: "Jun 30, 9:27 AM",
  },
  {
    id: "aud3",
    event: "Edit",
    actor: "Tessa Rowan",
    detail: "Updated a household note",
    time: "Jun 30, 9:15 AM",
  },
  {
    id: "aud4",
    event: "View",
    actor: "Robin Vale",
    detail: "Reviewed workspace permissions",
    time: "Jun 30, 8:50 AM",
  },
];

export type Integration = {
  id: string;
  name: string;
  description: string;
  provider: string;
  connected: boolean;
  icon: "custodian" | "crm" | "email" | "calendar" | "documents" | "custom";
};

export const integrations: Integration[] = [
  {
    id: "int1",
    name: "Custodian feed",
    description: "Consolidated balances, positions, and transaction history.",
    provider: "Northline Custody",
    connected: true,
    icon: "custodian",
  },
  {
    id: "int2",
    name: "CRM",
    description:
      "Household profiles, relationship notes, and pipeline activity.",
    provider: "Vesttara CRM",
    connected: true,
    icon: "crm",
  },
  {
    id: "int3",
    name: "Email",
    description: "Keep client correspondence alongside relationship records.",
    provider: "Email workspace",
    connected: false,
    icon: "email",
  },
  {
    id: "int4",
    name: "Calendar",
    description: "Coordinate advisor availability and client review meetings.",
    provider: "Workspace calendar",
    connected: true,
    icon: "calendar",
  },
  {
    id: "int5",
    name: "Document storage",
    description: "Organize reports, statements, and household documents.",
    provider: "Document vault",
    connected: false,
    icon: "documents",
  },
];

export const totalValue = clients.reduce((s, c) => s + c.value, 0);

export type ChatMessage = {
  id: string;
  who: "assistant" | "user";
  text: string;
  source?: { name: string; snippet: string };
  task?: boolean;
};

export type DirectMessage = {
  id: string;
  clientId: string;
  from: "client" | "advisor";
  text: string;
  time: string;
};

export const initialMessages: DirectMessage[] = [
  {
    id: "msg1",
    clientId: "c1",
    from: "advisor",
    text: "Hi John, your quarterly review is ready. You can find the sample report in your documents. I look forward to our next meeting.",
    time: "Jun 26, 10:15 AM",
  },
];
