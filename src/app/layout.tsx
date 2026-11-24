import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/inter/latin-700.css";
import "@fontsource/lora/latin-400.css";
import "@fontsource/lora/latin-500.css";
import "@fontsource/lora/latin-600.css";
import "./globals.css";
import "./workspace.css";
import "./marketing.css";
import "./responsive.css";
import "./admin-login.css";
import { DemoProvider } from "@/components/demo-context";
export const metadata: Metadata = {
  title: {
    default: "Vesttara — Wealth Platform Demo",
    template: "%s · Vesttara",
  },
  description:
    "An interactive, fictional wealth management workspace for advisors, clients, and administrators.",
  icons: { icon: "/vesttara.svg" },
};
export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#142d40",
};
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <DemoProvider>{children}</DemoProvider>
      </body>
    </html>
  );
}
