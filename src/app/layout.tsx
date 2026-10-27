import type { Metadata, Viewport } from "next";
import "./globals.css";
import { DepthProvider } from "@/components/DepthProvider";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CommandPalette } from "@/components/CommandPalette";
import { ConsoleRecord } from "@/components/ConsoleRecord";
import { profile } from "@/content/profile";

export const metadata: Metadata = {
  title: { default: `${profile.name}, AI and data engineering`, template: `%s | ${profile.name}` },
  description:
    "Software engineer building AI and data systems that show their evidence: LLM extraction pipelines on Databricks, source-checked research tools and hardened LLM gateways.",
  authors: [{ name: profile.name, url: profile.github }],
  openGraph: {
    type: "website",
    title: `${profile.name}, AI and data engineering`,
    description: "Pipelines and LLM systems you can check. Every project claim links to the code behind it.",
  },
};

export const viewport: Viewport = {
  themeColor: "#1a1e21",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-depth="gold">
      <body>
        <DepthProvider>
          <SiteHeader />
          <main id="main">{children}</main>
          <SiteFooter />
          <CommandPalette />
          <ConsoleRecord />
        </DepthProvider>
      </body>
    </html>
  );
}
