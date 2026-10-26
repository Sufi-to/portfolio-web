// Site map. The header, footer and command palette all read from this list,
// so a new section is one entry here plus its route folder.

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
