// Site map. The header, footer and command palette all read from this list,
// so a new section is one entry here plus its route folder.

/** Where the site lives. A custom domain only needs changing here and in the deploy workflow. */
export const siteUrl = "https://sufi-to.github.io/portfolio-web";

/** The link preview, shared by every page. A page's own title would otherwise drop it. */
export const shareImage = {
  url: `${siteUrl}/opengraph.png`,
  width: 1200,
  height: 630,
  alt: "Tomas Teclehaimanot's portfolio: I turn messy data into systems you can check.",
};

/** Set at build time for hosts that serve the site under a sub-path. */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** The address of a file in public/; next/link adds the base path itself, plain tags don't. */
export const asset = (path: string) => `${basePath}${path}`;

export const nav = [
  { href: "/", label: "Home" },
  { href: "/projects/", label: "Projects" },
  { href: "/lab/", label: "Lab" },
  { href: "/about/", label: "About" },
  { href: "/contact/", label: "Contact" },
] as const;

export const depthInfo = {
  gold: { key: "G", label: "Gold", hint: "Outcomes at a glance" },
  silver: { key: "S", label: "Silver", hint: "How it was built" },
  bronze: { key: "B", label: "Bronze", hint: "The code that proves it" },
} as const;
