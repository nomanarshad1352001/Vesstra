"use client";
import {
  accounts as initialAccounts,
  allocation as initialAllocation,
  clients as initialClients,
  holdings as initialHoldings,
  initialAudit,
  initialDocs,
  initialLeads,
  initialMeetings,
  initialMessages,
  initialNotes,
  initialTasks,
  integrations as initialIntegrations,
  profiles,
  transactions as initialTransactions,
  users as initialUsers,
  type Account,
  type AllocationSlice,
  type AuditEntry,
  type ChatMessage,
  type Client,
  type DocItem,
  type Holding,
  type Integration,
  type Role,
  type Transaction,
  type UserRecord,
} from "@data/demo";
import {
  ownership as initialOwnership,
  permissions as initialPermissions,
  type OwnershipCard,
  type PermissionRow,
} from "@data/platform";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type DialogKind =
  | "task"
  | "note"
  | "meeting"
  | "lead"
  | "client"
  | "account"
  | "holding"
  | "transaction"
  | "doc"
  | "user"
  | "integration"
  | "permission"
  | "audit"
  | "ownership"
  | "allocation";

function useDemoState() {
  const router = useRouter();
  const [signedIn, setSignedIn] = useState(false);
  const [role, setRole] = useState<Role>("Advisor");
  const [activeUserId, setActiveUserId] = useState<string>(profiles.Advisor.id);
  const [dark, setDark] = useState(false);
  const [selected, setSelected] = useState("all");

  // Complete reactive session stores — Admin can add, edit, and delete every record
  const [clientList, setClientList] = useState<Client[]>(initialClients);
  const [accountList, setAccountList] = useState<Account[]>(initialAccounts);
  const [holdingList, setHoldingList] = useState<Holding[]>(initialHoldings);
  const [allocationList, setAllocationList] =
    useState<AllocationSlice[]>(initialAllocation);
  const [transactionList, setTransactionList] =
    useState<Transaction[]>(initialTransactions);
  const [notes, setNotes] = useState(initialNotes);
  const [tasks, setTasks] = useState(initialTasks);
  const [docs, setDocs] = useState<DocItem[]>(initialDocs);
  const [meetings, setMeetings] = useState(initialMeetings);
  const [leads, setLeads] = useState(initialLeads);
  const [messages, setMessages] = useState(initialMessages);
  const [userList, setUserList] = useState<UserRecord[]>(initialUsers);
  const [permissionList, setPermissionList] =
    useState<PermissionRow[]>(initialPermissions);
  const [audit, setAudit] = useState<AuditEntry[]>(initialAudit);
  const [integrationList, setIntegrationList] =
    useState<Integration[]>(initialIntegrations);
  const [ownershipList, setOwnershipList] =
    useState<OwnershipCard[]>(initialOwnership);
  const [conversations, setConversations] = useState<
    Record<string, ChatMessage[]>
  >({});

  const [crmTab, setCrmTab] = useState("Households");
  const [portfolioTab, setPortfolioTab] = useState("Holdings");
  const [dialog, setDialog] = useState<{
    kind: DialogKind;
    clientId?: string;
    date?: string;
  } | null>(null);
  const [toast, setToast] = useState<{ text: string; stamp: number } | null>(
    null,
  );
  const [notificationsRead, setNotificationsRead] = useState(false);

  const notify = useCallback(
    (text: string) => setToast({ text, stamp: Date.now() }),
    [],
  );

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const go = useCallback(
    (path: string) =>
      router.push(path === "overview" ? "/overview" : `/${path}`),
    [router],
  );

  const profile = useMemo<UserRecord>(() => {
    const matched = userList.find((u) => u.id === activeUserId);
    if (matched) return matched;
    return profiles[role];
  }, [userList, activeUserId, role]);

  const totalValue = useMemo(
    () => clientList.reduce((sum, c) => sum + c.value, 0),
    [clientList],
  );

  const avgReturn = useMemo(() => {
    if (!clientList.length || totalValue <= 0) return 0;
    const weighted = clientList.reduce(
      (sum, c) => sum + c.returns * c.value,
      0,
    );
    return Number((weighted / totalValue).toFixed(2));
  }, [clientList, totalValue]);

  const isAdmin = role === "Admin";

  const clientScopeId = useMemo(() => {
    if (role !== "Client") return selected;
    const own = clientList.find(
      (c) =>
        c.id === activeUserId ||
        c.email.toLowerCase() === profile.email.toLowerCase(),
    );
    return own?.id ?? clientList[0]?.id ?? "c1";
  }, [role, selected, clientList, activeUserId, profile.email]);

  const log = useCallback(
    (event: AuditEntry["event"], detail: string, actorOverride?: string) => {
      setAudit((prev) => [
        {
          id: crypto.randomUUID(),
          event,
          actor: actorOverride ?? profile.name,
          detail,
          time: "This session",
        },
        ...prev,
      ]);
    },
    [profile.name],
  );

  // Sync a client's portfolio value whenever accounts are created/edited/deleted
  const syncClientTotals = useCallback(
    (nextAccounts: Account[], affectedClientIds: string[]) => {
      const ids = new Set(affectedClientIds);
      setClientList((prev) =>
        prev.map((c) => {
          if (!ids.has(c.id)) return c;
          const clientAccounts = nextAccounts.filter((a) => a.clientId === c.id);
          const sum = clientAccounts.reduce((s, a) => s + a.balance, 0);
          return { ...c, value: sum };
        }),
      );
    },
    [],
  );

  function signInUser(user: UserRecord, method: "credentials" | "quick" = "quick") {
    setRole(user.role);
    setActiveUserId(user.id);
    setSignedIn(true);
    setSelected(
      user.role === "Client"
        ? (clientList.find(
            (c) =>
              c.id === user.id ||
              c.email.toLowerCase() === user.email.toLowerCase(),
          )?.id ??
          clientList[0]?.id ??
          "c1")
        : "all",
    );
    setDialog(null);
    setAudit((p) => [
      {
        id: crypto.randomUUID(),
        event: "Login",
        actor: user.name,
        detail:
          method === "credentials"
            ? `Signed in as ${user.role.toLowerCase()} (${user.email})`
            : `Entered ${user.role.toLowerCase()} demo workspace`,
        time: "This session",
      },
      ...p,
    ]);
    router.push("/overview");
    notify(
      user.role === "Admin"
        ? `Signed in as ${user.name} (Admin — full edit access)`
        : `${user.role} workspace is ready`,
    );
  }

  function enter(next: Role) {
    const defaultId = profiles[next].id;
    const liveUser =
      userList.find((u) => u.id === defaultId) ??
      userList.find((u) => u.role === next) ??
      profiles[next];
    signInUser(liveUser, "quick");
  }

  function signInWithCredentials(
    email: string,
    password: string,
  ): { ok: true } | { ok: false; error: string } {
    const normalized = email.trim().toLowerCase();
    const pwd = password.trim();
    if (!normalized || !pwd) {
      return {
        ok: false,
        error: "Enter both email and password, or choose an autofill account above.",
      };
    }
    const found = userList.find(
      (u) => u.email.toLowerCase() === normalized,
    );
    if (!found) {
      return {
        ok: false,
        error:
          "No demo account matches that email. Pick an autofill option above to fill valid credentials.",
      };
    }
    if (found.status === "Suspended") {
      return {
        ok: false,
        error: "This demo account is marked as Suspended. Sign in as Admin to reactivate it.",
      };
    }
    if (found.password !== pwd) {
      return {
        ok: false,
        error:
          "Incorrect demo password. Click Autofill on a role card to populate the matching password.",
      };
    }
    signInUser(found, "credentials");
    return { ok: true };
  }

  function signOut() {
    log("Login", `Signed out of ${role.toLowerCase()} workspace`);
    setSignedIn(false);
    setDialog(null);
    router.push("/login");
    notify("Signed out of demo workspace");
  }

  function resetDemo() {
    setClientList(initialClients);
    setAccountList(initialAccounts);
    setHoldingList(initialHoldings);
    setAllocationList(initialAllocation);
    setTransactionList(initialTransactions);
    setNotes(initialNotes);
    setTasks(initialTasks);
    setDocs(initialDocs);
    setMeetings(initialMeetings);
    setLeads(initialLeads);
    setMessages(initialMessages);
    setUserList(initialUsers);
    setPermissionList(initialPermissions);
    setIntegrationList(initialIntegrations);
    setOwnershipList(initialOwnership);
    setConversations({});
    setSelected(role === "Client" ? "c1" : "all");
    setAudit([
      {
        id: crypto.randomUUID(),
        event: "Edit",
        actor: profile.name,
        detail: "Reset all workspace demo data to defaults",
        time: "This session",
      },
      ...initialAudit,
    ]);
    notify("All demo data restored to defaults");
  }

  return {
    signedIn,
    role,
    isAdmin,
    profile,
    activeUserId,
    enter,
    signInWithCredentials,
    signOut,
    resetDemo,
    dark,
    setDark,
    selected: role === "Client" ? clientScopeId : selected,
    setSelected,
    clients: clientList,
    setClients: setClientList,
    accounts: accountList,
    setAccounts: setAccountList,
    syncClientTotals,
    holdings: holdingList,
    setHoldings: setHoldingList,
    allocation: allocationList,
    setAllocation: setAllocationList,
    transactions: transactionList,
    setTransactions: setTransactionList,
    totalValue,
    avgReturn,
    notes,
    setNotes,
    tasks,
    setTasks,
    docs,
    setDocs,
    meetings,
    setMeetings,
    leads,
    setLeads,
    messages,
    setMessages,
    users: userList,
    setUsers: setUserList,
    permissions: permissionList,
    setPermissions: setPermissionList,
    audit,
    setAudit,
    log,
    integrations: integrationList,
    setIntegrations: setIntegrationList,
    ownership: ownershipList,
    setOwnership: setOwnershipList,
    conversations,
    setConversations,
    crmTab,
    setCrmTab,
    portfolioTab,
    setPortfolioTab,
    dialog,
    setDialog,
    toast,
    notify,
    go,
    notificationsRead,
    setNotificationsRead,
  };
}

const Context = createContext<ReturnType<typeof useDemoState> | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const state = useDemoState();
  return (
    <Context.Provider value={state}>
      <div className={`app-theme ${state.dark ? "dark-theme" : ""}`}>
        {children}
        {state.toast && (
          <div className="toast" role="status">
            <span className="toast-check">✓</span>
            {state.toast.text}
          </div>
        )}
      </div>
    </Context.Provider>
  );
}

export function useDemo() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("Workspace provider required");
  return ctx;
}
