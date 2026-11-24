import { notFound } from "next/navigation";
import { WorkspacePage } from "@/components/workspace-page";
const pages = [
  "overview",
  "login",
  "portfolios",
  "crm",
  "calendar",
  "assistant",
  "documents",
  "messages",
  "reports",
  "integrations",
  "api-docs",
  "admin",
  "ownership",
  "platform",
  "approach",
  "proposal",
];
export const dynamicParams = false;
export function generateStaticParams() {
  return pages.map((section) => ({ section }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  return {
    title:
      section === "crm"
        ? "Clients & CRM"
        : section === "assistant"
          ? "AI Assistant"
          : section
              .split("-")
              .map((s) => s[0].toUpperCase() + s.slice(1))
              .join(" "),
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (!pages.includes(section)) notFound();
  return <WorkspacePage page={section} />;
}
