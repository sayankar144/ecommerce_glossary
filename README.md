# RetailOS — Frontend

Customer **storefront** and a lightweight **admin shell** for RetailOS, built as a **standalone Next.js** application. It talks to the backend **only over HTTP** using typed service modules—**no direct database access**. Configure a different client by changing **public environment variables** and the **theme** (CSS variables), without forking the API.

---

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Data | REST via `src/services/*` + `src/lib/api.ts` |

---

## Requirements

- **Node.js** 20+ (aligned with Next.js 15)  
- A running **RetailOS API** (see [../retailos-backend/README.md](../retailos-backend/README.md))

---

## Quick start

```bash
cd retailos-frontend
cp .env.example .env.local
```

Edit `.env.local` at minimum:

- `NEXT_PUBLIC_API_URL` — must include the API version prefix, e.g. `http://localhost:4000/api/v1`

Then:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Next.js dev server (Turbopack/webpack per Next defaults) |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | `next lint` |

---

## Environment configuration

**All public configuration uses `NEXT_PUBLIC_*` variables** (embedded at build time for code that runs in the browser).

- **Template:** [.env.example](./.env.example)  
- **Reference:** [docs/ENV.md](./docs/ENV.md)  
- **Runtime parsing:** [src/lib/env.ts](./src/lib/env.ts) (Zod; sensible local defaults where noted)

Important variables:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Backend base URL including `/api/v1` |
| `NEXT_PUBLIC_SITE_NAME` | Brand / site title (metadata) |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL (Open Graph, `metadataBase`) |
| `NEXT_PUBLIC_DEFAULT_THEME` | Theme key: `default`, `emerald`, or your own |
| `NEXT_PUBLIC_DEFAULT_CURRENCY` | ISO currency shown with prices in the UI |

Optional: analytics (`NEXT_PUBLIC_GA_MEASUREMENT_ID`), Meta Pixel, Google Maps, CDN base URL—see `.env.example`.

---

## Architecture

### API layer

- **[src/lib/api.ts](./src/lib/api.ts)** — `fetch` wrapper: base URL, JSON, `Authorization`, `X-Session-Id`.  
- **[src/services/](./src/services/)** — Domain calls only (`auth`, `product`, `cart`, `order`, `cms`). **Do not** add Mongo or server-only secrets here; keep secrets on the backend.

### App routes (high level)

| Path | Role |
| --- | --- |
| `/` | Home (CMS homepage blocks or default hero + featured products) |
| `/shop` | Product listing |
| `/product/[slug]` | Product detail + add to cart |
| `/cart` | Cart (guest session id in `localStorage`) |
| `/checkout` | Checkout demo (COD) |
| `/admin` | Staff sign-in + simple analytics dashboard |

### Theme engine

- Global tokens live in **[src/app/globals.css](./src/app/globals.css)** under `html[data-theme='…']`.  
- The active theme is set on `<html>` via `NEXT_PUBLIC_DEFAULT_THEME` in **[src/app/layout.tsx](./src/app/layout.tsx)**.  
- **Add a theme:**  
  1. Add a new `html[data-theme='your-theme'] { … }` block with your colors/spacing.  
  2. Set `NEXT_PUBLIC_DEFAULT_THEME=your-theme` for that deployment.

---

## Project structure (overview)

```
retailos-frontend/
├── src/
│   ├── app/                   # App Router pages & layouts
│   ├── components/            # Reusable UI (header, footer, cart actions, …)
│   ├── sections/              # CMS block renderer, marketing sections
│   ├── services/              # API clients (auth, products, cart, orders, cms)
│   ├── lib/                   # env validation, apiFetch helper
│   └── …                      # hooks, store, utils (extend as needed)
├── public/
├── docs/
│   └── ENV.md
├── .env.example
├── Dockerfile
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## Docker

Build and run (ensure `NEXT_PUBLIC_API_URL` is reachable from the **browser**, e.g. your public API URL—not only `localhost` inside the container):

```bash
docker build -t retailos-web .
docker run --rm -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://api.example.com/api/v1 \
  -e NEXT_PUBLIC_SITE_URL=https://www.example.com \
  -e NEXT_PUBLIC_SITE_NAME="My Shop" \
  retailos-web
```

For a full stack example, use the **repository root** [docker-compose.yml](../docker-compose.yml).

---

## SEO and performance

- Use **`metadata` / `generateMetadata`** in route segments as you add pages.  
- Root metadata uses `NEXT_PUBLIC_SITE_URL` as `metadataBase` in [src/app/layout.tsx](./src/app/layout.tsx).  
- Prefer **Next.js `Image`** for remote media once domains are listed in [next.config.ts](./next.config.ts) (`images.remotePatterns`).  
- Keep list views **paginated** via API query params (`page`, `limit`) where supported.

---

## Related

- **Backend API:** [../retailos-backend/README.md](../retailos-backend/README.md)  
- **Monorepo overview:** [../README.md](../README.md)
