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

Refresh the commit timeline from GitHub (clones metadata only, into `.cache/`):

```sh
npm run ingest       # rewrites src/data/bronze.json
```

## Keyboard

| Key | Action |
| --- | --- |
| Cmd/Ctrl + K | Command palette: pages, projects, detail level, copy email |
| G / S / B | Gold, Silver or Bronze detail, on the pages where depth applies |
| / | Focus the project filter (on /projects) |
| Esc | Close the palette or clear the filter |

Single-key shortcuts can be turned off from the palette. The Pause motion button
stops the ground and cables, and the choice is remembered.

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

Slate-ore background, quartz text, Archivo (variable width axis) for
everything readable, IBM Plex Mono only for data and panel labels. Gold, silver
and bronze mark the three detail levels: `--metal` follows the current depth
and recolours the ports, cables and dithered ground with it. Trace blue marks
anything live or focused. Narrow type means raw; wide type means refined.

The layout is a pipeline patch, in the spirit of node editors: content sits in
titled operator panels (`Panel`), and on the home page cables (`PatchCables`)
join their ports in the order the story runs. Cables are desktop only.

## Open items

- CV: set `profile.cvUrl` in `src/content/profile.ts` once the PDF is in `public/`.
- Location, education and current role are not on the site yet.
- Domain name and hosting are not chosen.
- Case-study pages show the same content as the expanded rows; long-form
  write-ups are the next iteration.
- Light theme is not implemented; the site is dark only.
