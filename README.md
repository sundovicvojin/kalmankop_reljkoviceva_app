# KALMAN KOP - Reljkoviceva 59

Interaktivni web birac stanova za jedan objekat: KALMAN KOP - Reljkoviceva 59.

## Install

```bash
npm install
```

## Env

Kopiraj `.env.example` u `.env` i unesi vrednosti:

- `DATABASE_URL`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD_HASH`
- `SESSION_SECRET`
- `NEXT_PUBLIC_CONTACT_URL`

Hash lozinke generisi lokalno:

```bash
npm run auth:hash -- "nova-lozinka"
```

## Database

```bash
npm run prisma:migrate
npm run prisma:seed
```

Lokalna baza moze da radi iz Dockera. Za Vercel produkciju koristi hosted PostgreSQL
servis kao Neon, Supabase ili Prisma Postgres i isti `DATABASE_URL` format.

## Dev

```bash
npm run dev
```

Public aplikacija je na `/`. Admin je na `/manage-reljkoviceva`.

## Stanovi, garaze i SVG

Stanovi i garaze se povezuju sa SVG mapom preko `externalId`:

```svg
<path id="APT_S1" />
```

Moze i `data-apartment-id="APT_S1"`. Isti `externalId` mora da postoji u bazi. Svaki pogled ucitava svoj SVG iz
`public/overlays` foldera:

- `public/overlays/Video1.svg`
- `public/overlays/Video2.svg`
- `public/overlays/Video3.svg`
- `public/overlays/Video4.svg`
- `public/overlays/Video5.svg`

Tlocrti se ucitavaju po `externalId` iz `public/floorplans`; modal prvo trazi
`.webp`, pa `.png`:

- `public/floorplans/APT_S1.webp`
- `public/floorplans/APT_S1.png`

Brosure se ucitavaju po `externalId` iz `public/brochures`:

- `public/brochures/APT_S1.pdf`

Admin podrzava promenu statusa, tipa (`APARTMENT` ili `GARAGE`), kvadrature,
sobnosti, cene i valute.

## Build

```bash
npm run lint
npm run typecheck
npm run build
```

## GitHub

```bash
git init
git add .
git commit -m "Initial Reljkoviceva 59 app"
git branch -M main
git remote add origin https://github.com/USERNAME/reljkoviceva59.git
git push -u origin main
```

Ne commitovati `.env`, `.next` ili `node_modules`.

## Deploy

Projekat je spreman za Vercel. Podesi production env varijable, povezi
PostgreSQL bazu, pokreni Prisma migraciju nad production bazom i deployuj domen:

`reljkoviceva59.kalmankop.rs`
