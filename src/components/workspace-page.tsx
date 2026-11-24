"use client";
import { ArrowLeftRight, LockKeyhole } from "lucide-react";
import { useEffect } from "react";
import { Assistant } from "./assistant";
import { CRM } from "./crm";
import { Dashboard, Portfolios } from "./dashboard";
import { useDemo } from "./demo-context";
import { WorkspaceForms } from "./forms";
import { Admin, ApiDocs, Integrations, Ownership } from "./management";
import { Marketing } from "./marketing";
import { Calendar, Documents, Messages, Reports } from "./portal";
import { Login, Shell } from "./shell";
import { Empty } from "./ui";

export function WorkspacePage({ page }: { page: string }) {
  const d = useDemo();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);
  if (page === "login") return <Login />;
  if (page === "root" && !d.signedIn) return <Login />;
  if (["platform", "approach", "proposal"].includes(page))
    return <Marketing page={page} />;
  const activePage = page === "root" ? "overview" : page;
  const restricted =
    (["admin", "ownership"].includes(activePage) && d.role !== "Admin") ||
    (d.role === "Client" &&
      ["crm", "integrations", "api-docs"].includes(activePage));
  const screens: Record<string, React.ReactNode> = {
    overview: <Dashboard />,
    portfolios: <Portfolios />,
    crm: <CRM />,
    assistant: <Assistant />,
    calendar: <Calendar />,
    documents: <Documents />,
    messages: <Messages />,
    reports: <Reports />,
    admin: <Admin />,
    ownership: <Ownership />,
    integrations: <Integrations />,
    "api-docs": <ApiDocs />,
  };
  return (
    <Shell page={activePage}>
      {restricted ? (
        <section className="panel restricted-panel">
          <Empty
            icon={LockKeyhole}
            title="A different workspace is needed"
            text={`This view belongs to the ${["admin", "ownership"].includes(activePage) ? "admin" : "advisor"} demo. Choose a role to explore it.`}
          />
          <button className="btn primary" onClick={() => d.go("login")}>
            <ArrowLeftRight size={15} />
            Choose a workspace
          </button>
        </section>
      ) : (
        (screens[activePage] ?? <Dashboard />)
      )}
      <WorkspaceForms />
    </Shell>
  );
}
