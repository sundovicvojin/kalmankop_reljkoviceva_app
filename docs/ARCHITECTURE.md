# Architecture

## Runtime

- Next.js App Router
- React Server Components za ucitavanje podataka
- Client components samo za viewer interakcije i admin status formu
- PostgreSQL + Prisma

## Data

`Apartment` sadrzi osnovne podatke i linkove za tlocrt, brosuru i interior. `ApartmentRoom` cuva prostorije za kasnije detaljnije prikaze.

## Viewer

`BuildingViewer` orkestrira prikaz. `FrameSequence` renderuje static poster sada, a kasnije moze lazy ucitavati WebP sequence. `SvgOverlay` ucitava SVG preko `img` sloja i hvata pointer/keyboard interakcije iz koordinatno poravnatog wrappera.

## Admin

Admin je na konfigurabilnoj ruti `/manage-reljkoviceva`. Login koristi Argon2id hash iz env-a, kratku signed cookie sesiju i server-side autorizaciju na svakoj akciji.
