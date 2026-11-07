import type { Metadata, Viewport } from "next";
import "./globals.css";
import { DepthProvider } from "@/components/DepthProvider";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CommandPalette } from "@/components/CommandPalette";
import { ConsoleRecord } from "@/components/ConsoleRecord";
import { OreField } from "@/components/OreField";
import { DepthToast } from "@/components/DepthToast";
import { MotionToggle } from "@/components/MotionToggle";
import { profile } from "@/content/profile";
import { shareImage, siteUrl } from "@/content/site";

export const metadata: Metadata = {
  metadataBase: new URL(new URL(siteUrl).origin),
  title: { default: `${profile.name}, AI and data engineering`, template: `%s | ${profile.name}` },
  description:
    "Software engineer building AI and data systems that show their evidence: LLM extraction pipelines on Databricks, source-checked research tools and hardened LLM gateways.",
  authors: [{ name: profile.name, url: profile.github }],
  openGraph: {
    type: "website",
    title: `${profile.name}, AI and data engineering`,
    description: "Pipelines and LLM systems you can check, with claims re-verified against the code.",
    url: `${siteUrl}/`,
    images: [shareImage],
  },
  twitter: { card: "summary_large_image", images: [shareImage] },
};

export const viewport: Viewport = {
  themeColor: "#121518",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-depth="gold">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: profile.name,
              jobTitle: profile.role,
              url: `${siteUrl}/`,
              sameAs: [profile.github, profile.linkedin],
            }),
          }}
        />
        <DepthProvider>
          <OreField />
          <SiteHeader />
          <main id="main">{children}</main>
          <SiteFooter />
          <CommandPalette />
          <ConsoleRecord />
          <DepthToast />
          <MotionToggle />
        </DepthProvider>
      </body>
    </html>
  );
}
