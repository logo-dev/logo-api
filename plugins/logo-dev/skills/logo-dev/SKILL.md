---
name: logo-dev
description: Show company logos and fetch brand data with Logo.dev. The Logo.dev CDN returns logo images by domain, stock ticker, crypto symbol, ISIN, or brand name for websites and apps. The Logo.dev API returns JSON brand profiles, logo and brandmark files, and brand search results for servers. Use when an application needs to display a company logo, store a logo file, enrich records with brand data, or resolve a brand name to a domain.
license: MIT
compatibility: HTTP. The Logo.dev CDN (img.logo.dev) works client-side. The Logo.dev API (api.logo.dev/v2) is server-side only.
metadata:
  author: logo-dev
  homepage: https://www.logo.dev
  docs: https://www.logo.dev/docs
---

# Logo.dev

Logo.dev has three products: the Logo.dev CDN, the Logo.dev API, and the Logo.dev MCP for AI agents. Your code calls the first two directly, each with its own key. Pick one first:

| You need | Use | Key |
| --- | --- | --- |
| A logo shown on a website or in an app | Logo.dev CDN, `https://img.logo.dev` | Publishable key (`pk_`) in `?token=` |
| A logo file to store, put in a PDF or email, or process; brand data; brand search | Logo.dev API, `https://api.logo.dev/v2` | Secret key (`sk_`) in `Authorization: Bearer` |

Never put a secret key in client-side code. Never download from the CDN to store a copy; use the API. Keys: https://www.logo.dev/docs/platform/api-keys.md

## Logo.dev CDN

Put the URL straight in an `<img>` tag:

```
https://img.logo.dev/:domain?token=pk_...          # stripe.com
https://img.logo.dev/name/:name?token=pk_...       # name/Stripe (URL-encode)
https://img.logo.dev/ticker/:ticker?token=pk_...   # ticker/AAPL, ticker/7203.T
https://img.logo.dev/isin/:isin?token=pk_...       # isin/US0378331005
https://img.logo.dev/crypto/:symbol?token=pk_...   # crypto/BTC
```

Common parameters: `size` (default 128, max 800), `format` (`jpg`, `png`, `webp`), `theme` (`light`, `dark`; needs `format=png` or `format=webp`), `greyscale`, `retina`, and `fallback` (`monogram`, the default, or `404`). A lookup with no logo returns a generated monogram unless `fallback=404`.

Details: https://www.logo.dev/docs/api-reference/logo-cdn/get-a-logo

## Logo.dev API

Call it from your server with the secret key. A successful response is `{ "data": ..., "metadata": ... }`. An error returns an `error` object with a `code` instead, and an authentication failure returns `msg`. Branch on the status code first.

| Route | Returns |
| --- | --- |
| `GET /v2/brands?domain=` (or `ticker`, `isin`, `crypto`, `name`) | A brand profile: name, description, colors, socials, and logo, brandmark, and banner image objects |
| `GET /v2/brands/{id}` | The same brand by its stable `brand_` id |
| `GET /v2/brands/logo?domain=` | The logo file as a download `url`, with `etag` and dimensions |
| `GET /v2/brands/brandmark?domain=` | The brandmark (the wide logo lockup) file, the same way |
| `GET /v2/search?q=&method=typeahead` | Brand candidates, each with a domain and a CDN `logo_url` |

```bash
curl --header "Authorization: Bearer sk_..." "https://api.logo.dev/v2/brands?domain=stripe.com"
```

- A first lookup of a brand Logo.dev has not indexed yet returns `202` with `Retry-After`. Retry after that many seconds.
- Image download URLs expire. Store the file, and download again only when `etag` changes.
- Key your records on `data.id`, not on the domain.

Details: https://www.logo.dev/docs/brand/introduction.md, https://www.logo.dev/docs/brand-search/introduction.md, https://www.logo.dev/docs/platform/errors.md

Do not use the deprecated v1 routes (`/search`, `/brand/:domain`, `/describe/:domain`).

## Limits and attribution

CDN requests draw on a monthly allowance, and API requests spend API credits. On the free plan, the CDN also has per-minute limits for each IP address and each account; over either, it returns `429` with a `Retry-After` header. See https://www.logo.dev/docs/platform/rate-limits.md. For what each API request costs and what is billed, see https://www.logo.dev/docs/platform/credits.md. On the free plan, commercial use needs an attribution link. See https://www.logo.dev/docs/platform/attribution.md

Report a wrong or missing logo at https://www.logo.dev/update. Full documentation: https://www.logo.dev/docs
