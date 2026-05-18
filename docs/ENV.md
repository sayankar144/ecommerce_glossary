# Environment variables (frontend)

All public configuration is exposed via `NEXT_PUBLIC_*` variables (embedded at build time for client bundles).

| Name | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Base URL for the RetailOS API (must include `/api/v1`) |
| `NEXT_PUBLIC_SITE_NAME` | Site title + default metadata |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL (used for `metadataBase`) |
| `NEXT_PUBLIC_DEFAULT_THEME` | Theme key applied to `<html data-theme="...">` |
| `NEXT_PUBLIC_DEFAULT_CURRENCY` | Display currency code for prices (until product payloads include currency) |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Optional analytics |
| `NEXT_PUBLIC_META_PIXEL_ID` | Optional marketing pixel |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Optional maps |
| `NEXT_PUBLIC_CDN_BASE_URL` | Optional CDN prefix for static assets |

See `retailos-frontend/.env.example`.
