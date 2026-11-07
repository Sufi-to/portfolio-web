# Refinery — Tomas Teclehaimanot's portfolio

A portfolio built like a data pipeline: raw evidence goes in, checkable claims
come out. Every project can be read at three depths. The case studies' claims
link to the file, line and commit behind them, and a script re-checks each one
against that commit.

## Run it

Requires Node.js 20 or newer.

```sh
npm install
npm run dev          # http://localhost:3000 with hot reload
```

Production build (static HTML in `out/`, deployable to GitHub Pages, Cloudflare
Pages, Netlify or Vercel):

```sh
npm run build
npm start            # serves out/ at http://localhost:3000
```

Refresh the GitHub data: commit timeline, language totals and profile facts.
New public repositories are found automatically (clones metadata only, into `.cache/`):

```sh
npm run ingest       # rewrites src/data/bronze.json
```

## Keyboard

| Key | Action |
| --- | --- |
| Cmd/Ctrl + K | Command palette: pages, projects, detail level, copy email |
| G / S / B | Gold, Silver or Bronze detail, on the pages where depth applies |
| P | Switch between the PATCH canvas and the stacked READ view |
| / | Focus the project filter (on /projects) |
| Esc | Close the palette or clear the filter |

Single-key shortcuts can be turned off from the palette. The MOTION chip and the
transport bar stop the ground, cables and auto-cycling, and the choice is remembered.

## How it's organised

```
src/
  content/            all words and facts; no JSX
    profile.ts          name, links, the hero's raw post and extracted record
    projects.ts         every project: gold line, silver write-up, evidence, diagram
    site.ts             navigation and depth labels
    types.ts            the content model
  data/bronze.json    git history snapshot written by scripts/ingest.mjs
  lib/query.ts        the catalog's filter language and its SQL rendering
  components/         presentation only
  app/                routes: /, /projects, /projects/[slug], /lab, /about, /contact
scripts/ingest.mjs    Bronze ingestion from GitHub
```

**Adding a project** means adding one object to `src/content/projects.ts`.
Give it a `diagram` and it gets a replayable architecture trace; give it
`evidence` and it gets Bronze links, checked by `npm run verify`. Its page under `/projects/<slug>/` is
generated automatically.

**Adding a page** means one entry in `src/content/site.ts` and a folder under
`src/app/`.

## Design tokens

A dark patch of operators: near-black ground, `#101013` panels, one signal green
(`--signal`) for anything live or selected. Red Hat Display for reading, Sometype
Mono for labels and data, IBM Plex Mono for raw text. Gold, silver and bronze
appear only on the depth control, where they name the levels.

Above 1280px the home page is a floating patch: panels in `.stage` take their
position from `--x`, `--y` and `--w`, and `PatchCables` joins their ports. Below
that, and in READ mode, the same panels stack. The ground is `OreField`, and the
`ore_0x` operators in `OreOps` really control it through `src/lib/ore.ts`.

## Open items

- CV: set `profile.cvUrl` in `src/content/profile.ts` once the PDF is in `public/`.
- Education and current role are not on the site yet. Location, affiliation and
  availability come from the GitHub profile through `npm run ingest`.
- No custom domain yet; the site is on GitHub Pages.
- Case-study pages show the same content as the expanded rows; long-form
  write-ups are the next iteration.
- Light theme is not implemented; the site is dark only.
