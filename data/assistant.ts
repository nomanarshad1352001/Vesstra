import {
  money,
  type Account,
  type AllocationSlice,
  type Client,
  type Meeting,
  type Note,
  type Role,
  type Task,
} from "./demo";

export type Reply = {
  text: string;
  source?: { name: string; snippet: string };
  taskFor?: string;
};

export const suggestions = [
  "Summarize this client’s portfolio",
  "What did we discuss last meeting?",
  "Create a follow-up task for John",
];

export function demoReply(
  prompt: string,
  client: Client,
  role: Role,
  notes: Note[],
  meetings: Meeting[],
  tasks: Task[],
  allClients: Client[],
  allAccounts: Account[],
  allAllocation: AllocationSlice[],
): Reply {
  const q = prompt.toLowerCase();
  if (
    role === "Client" &&
    allClients.some(
      (c) =>
        c.id !== client.id &&
        c.name
          .toLowerCase()
          .split(" ")
          .some((n) => n && new RegExp(`\\b${n}\\b`, "i").test(q)),
    )
  )
    return {
      text: "This portal is scoped to your own household. I can summarize your accounts, documents, and meetings, but not another client’s information.",
    };
  if (
    /\b(buy|sell|recommend|should|advice|rebalance|pick|picks|undervalued|invest in|best stock|best fund|allocate)\b/.test(
      q,
    )
  )
    return {
      text: "I can explain the information in this demo, but I can’t provide personalized investment advice, recommend trades, or make suitability decisions. Please discuss investment decisions with your qualified advisor.\n\nWould you like a factual summary of the current portfolio instead?",
      source: {
        name: "Demo compliance policy",
        snippet:
          "Information only. No personal recommendations, trade execution, or financial decisions.",
      },
    };
  if (/(create|add|make).*task|follow.up task/.test(q)) {
    if (role === "Client")
      return {
        text: "Task creation is available in the advisor workspace. You can send your advisor a message or book a review from your calendar.",
      };
    const target =
      allClients.find((c) => q.includes(c.name.split(" ")[0].toLowerCase())) ??
      client;
    return {
      text: `I’ve created a follow-up task for ${target.name}.\n\nTask: Follow up on ${target.name.split(" ")[0]}’s quarterly review\nDue: July 2, 2025 · Normal priority\n\nIt’s ready in Clients & CRM → Tasks.`,
      taskFor: target.id,
      source: {
        name: "CRM task register",
        snippet: `A session-only follow-up task linked to the ${target.household}.`,
      },
    };
  }
  if (/last meeting|discuss|note|last review/.test(q)) {
    const n = notes.find((n) => n.clientId === client.id);
    return {
      text: `Here’s the latest discussion on file for the ${client.household}:\n\n${n?.body ?? "There are no meeting notes for this household yet."}\n\nThis summary reflects the local note, not a new recommendation.`,
      source: {
        name: n?.title ?? "Household notes",
        snippet: n?.body.slice(0, 135) ?? "No notes on file.",
      },
    };
  }
  if (/meeting|calendar|schedule|book/.test(q)) {
    const ms = meetings.filter((m) => m.clientId === client.id);
    return {
      text: ms.length
        ? `The next meeting for the ${client.household} is “${ms[0].title}” on ${ms[0].date} at ${ms[0].time} Eastern. It is a 30-minute ${ms[0].kind.toLowerCase()}.\n\nOpen Calendar to review the schedule or book another appointment.`
        : `There are no upcoming meetings for the ${client.household}. Open Calendar and choose “Book meeting” to schedule a review.`,
      source: {
        name: "Workspace calendar",
        snippet: `${ms.length} upcoming meeting${ms.length === 1 ? "" : "s"} for this household.`,
      },
    };
  }
  if (/priority|priorities|tasks|briefing/.test(q)) {
    const open = tasks.filter((t) => !t.done && t.clientId === client.id);
    return {
      text: `The ${client.household} has ${open.length} open task${open.length === 1 ? "" : "s"}. ${open.length ? "The next item is “" + open[0].title + "”, due " + open[0].due + "." : "There are no pending action items."}\n\nThe current portfolio value is ${money(client.value)}, across ${allAccounts.filter((a) => a.clientId === client.id).length} accounts.`,
      source: {
        name: "Household activity summary",
        snippet:
          "Local portfolio balances and open task records, as of June 30, 2025.",
      },
    };
  }
  if (
    /portfol|balance|allocation|account|performance|summar|return|asset/.test(q)
  ) {
    const ac = allAccounts.filter((a) => a.clientId === client.id);
    const sortedAlloc = [...allAllocation].sort((a, b) => b.pct - a.pct);
    const topLine =
      sortedAlloc.length >= 2
        ? `${sortedAlloc[0].name} leads allocation at ${sortedAlloc[0].pct}%, followed by ${sortedAlloc[1].name.toLowerCase()} at ${sortedAlloc[1].pct}%.`
        : sortedAlloc[0]
          ? `${sortedAlloc[0].name} represents ${sortedAlloc[0].pct}% of allocation.`
          : "";
    return {
      text: `The ${client.household} holds ${money(client.value)} across ${ac.length} account${ac.length === 1 ? "" : "s"}, with a simulated one-year return of ${client.returns.toFixed(2)}%.\n\n${ac.length ? ac.map((a) => `${a.type}: ${money(a.balance)}`).join("\n") : "No linked accounts recorded."}\n\n${topLine} These are illustrative balances, not investment recommendations.`,
      source: {
        name: "Q2 2025 portfolio report.pdf",
        snippet: `June 30 snapshot · ${money(client.value)} in total assets · ${client.returns.toFixed(2)}% one-year return.`,
      },
    };
  }
  if (/document|report/.test(q))
    return {
      text: "Your document library contains the reports and records for this household. Open Documents to inspect a record or Reports to open the sample quarterly PDF. Demo uploads retain only a filename and size in this session.",
      source: {
        name: "Document library guide",
        snippet:
          "All reports are samples. Uploaded files are not transferred or stored.",
      },
    };
  return {
    text: "I’m a scripted demo assistant. I can summarize this household’s portfolio, recall the latest meeting note, or explain upcoming meetings. In an advisor workspace I can also create a follow-up task.\n\nTry “Summarize this client’s portfolio” to see a source-backed example.",
  };
}
