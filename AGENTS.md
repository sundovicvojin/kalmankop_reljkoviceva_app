# Agent Notes

Ovo je single-project aplikacija za KALMAN KOP - Reljkoviceva 59. Ne pretvarati je u multi-project CMS.

## Arhitektura

- Next.js App Router, TypeScript strict, Prisma i PostgreSQL.
- Public deo cita stanove iz baze.
- Admin menja samo status stanova.
- Ne dodavati filtere, search, sort, contact backend ili genericki CMS.

## Viewer

- Viewer konfiguracija je u `config/viewer.ts`.
- View podrzava `static` i `sequence` mode.
- `static` koristi jedan placeholder/render.
- `sequence` je pripremljen za `/public/building/view-XX/frames/0001.webp` format bez preloadovanja svih frejmova.

## Assets

- Renderi: `public/building/view-XX/placeholder.webp`
- Overlay: `public/overlays/VideoN.svg` (`Video1.svg` do `Video5.svg`)
- Tlocrti: `public/floorplans/...`
- Logo placeholder: `public/brand/kalman-logo-placeholder.svg`

Zamena stvarnih rendera i SVG-ova ne sme zahtevati promenu glavne viewer logike.

## SVG i stanovi

SVG elementi koriste `data-apartment-id="APT_01"`. Isti `externalId` u bazi povezuje SVG oblik sa stanom.

## Dizajn

Pravac je dark architectural luxury: graphite/crna, warm white, champagne/gold accent, kontrolisan glass, velike zaobljene povrsine, premium tipografija. Ne kopirati Zoned Panonka i ne praviti genericki SaaS dashboard.

## Responsive

Mobile portrait je primarni zahtev. Nema rotate-device ekrana kao resenja. Desktop koristi side drawer, mobile bottom sheet. Bez horizontalnog overflow-a.

## Security

Admin ruta nije linkovana iz public aplikacije. Auth je server-side, cookie je HTTP-only, SameSite Strict, kratkog trajanja. Credentials nikada ne idu client-side.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
