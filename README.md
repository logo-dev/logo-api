<div align="center">

# Logo.dev

### Every company logo, one API request

**The highest-quality logo and brand API.** Pass a domain, ticker, or crypto symbol — get back a clean, correctly-sized logo, served from a global CDN. No sourcing, no hosting, no broken images.

[![Website](https://img.shields.io/badge/Website-logo.dev-18181B?style=flat-square)](https://www.logo.dev)
[![Documentation](https://img.shields.io/badge/Docs-docs.logo.dev-18181B?style=flat-square)](https://docs.logo.dev)
[![Get an API key](https://img.shields.io/badge/Get%20an%20API%20key-free-18181B?style=flat-square)](https://www.logo.dev/signup)
[![License: MIT](https://img.shields.io/badge/License-MIT-18181B?style=flat-square)](LICENSE)

**50M+ companies** · **30M+ requests/day** · **55K+ developers** · **&lt;50ms median** · **150+ edge locations** · **500K free/mo**

</div>

---

## One `<img>` tag, any logo

There's no SDK to install and no logo files to host. Get your free [publishable key](https://www.logo.dev/dashboard), then hotlink the CDN:

```html
<img src="https://img.logo.dev/stripe.com?token=LOGO_DEV_PUBLISHABLE_KEY" alt="Stripe logo" />
```

That's the whole integration. Swap `stripe.com` for any domain and you get a crisp, correctly-sized logo back in milliseconds.

<!-- LIVE DEMO — uncomment after swapping LOGO_DEV_PUBLISHABLE_KEY for the team's public demo publishable key,
     so the row renders real logos straight from img.logo.dev on the repo page:

> **Live demo:** the row below renders straight from `img.logo.dev`:
>
> <img src="https://img.logo.dev/stripe.com?token=LOGO_DEV_PUBLISHABLE_KEY&size=64" alt="Stripe" height="40" />
> <img src="https://img.logo.dev/shopify.com?token=LOGO_DEV_PUBLISHABLE_KEY&size=64" alt="Shopify" height="40" />
> <img src="https://img.logo.dev/airbnb.com?token=LOGO_DEV_PUBLISHABLE_KEY&size=64" alt="Airbnb" height="40" />
> <img src="https://img.logo.dev/spotify.com?token=LOGO_DEV_PUBLISHABLE_KEY&size=64" alt="Spotify" height="40" />
-->

---

## Why logo.dev

- **No infrastructure.** No scraping, storing, resizing, or cache-busting. A URL is the integration.
- **One tag, every framework.** It's just an image — drop it into HTML, React, Vue, iOS, Android, or a spreadsheet.
- **Built for production.** A global CDN with a `<50ms` median response across `150+` edge locations.
- **Always current.** `50M+` companies, updated daily — no stale or broken logos.
- **Flexible output.** Size, retina, format (`PNG`/`WebP`), and light/dark `theme` variants via query params.
- **More than logos.** Resolve companies by stock ticker or crypto symbol, search brands by name, or pull structured brand data.

---

## Endpoints

Every logo is a `GET` against `img.logo.dev`. The REST endpoints return structured brand data.

| Lookup | Example | Docs |
| --- | --- | --- |
| **By domain** | `img.logo.dev/stripe.com` | [Logo images →](https://docs.logo.dev/logo-images/introduction) |
| **By stock ticker** | `img.logo.dev/ticker/AAPL` | [Ticker →](https://docs.logo.dev/logo-images/ticker) |
| **By crypto symbol** | `img.logo.dev/crypto/BTC` | [Crypto →](https://docs.logo.dev/logo-images/crypto) |
| **By company name** | `img.logo.dev/name/stripe` | [Name →](https://docs.logo.dev/logo-images/name) |
| **Brand Search** | Find a company when you only have a name | [Brand Search →](https://docs.logo.dev/brand-search/introduction) |
| **Describe** | Colors, socials, and structured brand fields | [Describe →](https://docs.logo.dev/describe/introduction) |

Common parameters: `token` (required), `size`, `retina`, `format`, `theme`. Full reference at [docs.logo.dev](https://docs.logo.dev).

---

## Quickstart

Lead with HTML, then reach for your stack. Every snippet uses the same CDN URL — only the wrapper changes.

```html
<!-- HTML -->
<img src="https://img.logo.dev/stripe.com?token=LOGO_DEV_PUBLISHABLE_KEY" alt="Stripe logo" />
```

```jsx
// React — works with any bundler; in Next.js, read the token from
// process.env.NEXT_PUBLIC_LOGO_DEV_PUBLISHABLE_KEY instead
const LOGO_DEV_TOKEN = "LOGO_DEV_PUBLISHABLE_KEY";

function CompanyLogo({ domain }) {
  return (
    <img
      src={`https://img.logo.dev/${domain}?token=${LOGO_DEV_TOKEN}`}
      alt={`${domain} logo`}
    />
  );
}
```

```bash
# cURL
curl "https://img.logo.dev/stripe.com?token=LOGO_DEV_PUBLISHABLE_KEY&size=128&format=png" --output stripe.png
```

```python
# Python
import requests

def get_company_logo(domain: str) -> bytes:
    url = f"https://img.logo.dev/{domain}?token=LOGO_DEV_PUBLISHABLE_KEY"
    return requests.get(url).content
```

<details>
<summary><strong>More languages</strong> — Next.js, Vue, Ruby, PHP, Swift (iOS), Kotlin (Android), Google Sheets &amp; Excel</summary>

<br />

Full, copy-paste-ready snippets for every stack live in the docs: **[docs.logo.dev →](https://docs.logo.dev)**

- **Next.js** — `next/image` with `img.logo.dev` allowlisted in `remotePatterns`
- **Vue** — bind the URL to `:src`
- **Ruby** — `Net::HTTP.get`
- **PHP** — `file_get_contents`
- **Swift (iOS)** — `AsyncImage`
- **Android (Kotlin)** — Coil or Picasso
- **Google Sheets / Excel** — `=IMAGE("https://img.logo.dev/" & A1 & "?token=LOGO_DEV_PUBLISHABLE_KEY")`

</details>

---

## React components (shadcn/ui)

For React apps, this repo is also the official Logo.dev [shadcn/ui](https://ui.shadcn.com) registry. It ships production-grade components for the logo patterns most apps end up rebuilding by hand: image fallbacks, dark mode, retina, and debounced company search.

Install a component with the shadcn CLI:

```bash
npx shadcn@latest add https://www.logo.dev/r/logo.json
```

You can also install straight from this repo, pinned to a branch, tag, or commit:

```bash
npx shadcn@latest add logo-dev/logo-api/logo
```

| Component | What you get |
| --- | --- |
| `logo` | A logo that never breaks: domain/name/ticker/crypto/ISIN lookup, retina srcSet, automatic dark-mode variants, monogram/initials/custom fallbacks |
| `logo-avatar` | A logo in a shadcn Avatar shell with initials fallback — CRM rows, transaction feeds |
| `brand-search` | Company autocomplete combobox backed by the Search API, with a Next.js route that keeps your secret key server-side |
| `logo-wall` | Customer/integration logo grid from a list of domains, grayscale-to-color hover |
| `attribution` | The attribution link free plans require in production |
| `logo-lib` | The typed URL builder underneath all of the above, useful on its own |

Components read your publishable key from `NEXT_PUBLIC_LOGO_DEV_TOKEN`; `brand-search` also needs `LOGO_DEV_SECRET_KEY` on the server. Both are added to `.env.local` on install. Full guide: **[shadcn/ui components →](https://docs.logo.dev/integrations/shadcn)**

<details>
<summary><strong>Developing the registry</strong></summary>

<br />

```bash
pnpm install
pnpm test        # URL builder unit tests
pnpm typecheck
pnpm build       # shadcn build → r/*.json (committed; CI checks it's in sync)
```

Component sources live in `registry/new-york/`. `components/ui/` holds vendored shadcn primitives used only for typechecking — consumers get those from ui.shadcn.com.

</details>

---

## Migrating from Clearbit

**Clearbit's Logo API shut down on December 8, 2025.** If your app still points at `logo.clearbit.com`, the logos are broken.

**We're the same team that originally built the Clearbit Logo API**, and logo.dev is the migration path recommended by Clearbit / HubSpot. It's a drop-in replacement — swap the base URL and add a token. Your existing parameters keep working.

```diff
- https://logo.clearbit.com/stripe.com
+ https://img.logo.dev/stripe.com?token=LOGO_DEV_PUBLISHABLE_KEY
```

Most migrations take a few minutes. Full guide: **[Migrating from Clearbit →](https://docs.logo.dev/migrations/clearbit)**

> "We built logo enrichment at Clearbit because developers needed it. Logo.dev is what I wish we could have built. Comprehensive, fast, and they actually keep the logos updated. Clear upgrade."
>
> — **Alex MacCaw**, Founder, Clearbit

---

## Trusted by developers

`55K+` developers build on logo.dev — from CRMs and fintech dashboards to AI products.

<!-- CUSTOMER STRIP — uncomment after swapping LOGO_DEV_PUBLISHABLE_KEY for the public demo key.
     Renders customer logos live through the API itself (companies from logo.dev's public reference set):

<p>
  <img src="https://img.logo.dev/linear.app?token=LOGO_DEV_PUBLISHABLE_KEY&size=48" alt="Linear" height="32" />&nbsp;&nbsp;
  <img src="https://img.logo.dev/close.com?token=LOGO_DEV_PUBLISHABLE_KEY&size=48" alt="Close" height="32" />&nbsp;&nbsp;
  <img src="https://img.logo.dev/perplexity.ai?token=LOGO_DEV_PUBLISHABLE_KEY&size=48" alt="Perplexity" height="32" />&nbsp;&nbsp;
  <img src="https://img.logo.dev/mutinyhq.com?token=LOGO_DEV_PUBLISHABLE_KEY&size=48" alt="Mutiny" height="32" />
</p>
-->

---

## Use logo.dev logos in your own README or site

Because every logo is just an `<img>` URL, you can render any company's logo directly in your Markdown, docs, or app:

```html
<img src="https://img.logo.dev/github.com?token=LOGO_DEV_PUBLISHABLE_KEY" alt="GitHub" />
```

On the **free plan, commercial use requires a visible link back**; personal projects don't. Add this wherever you display logos:

```html
<a href="https://logo.dev">Logos provided by Logo.dev</a>
```

Prefer a badge? Drop in [`assets/powered-by-logo-dev.svg`](assets/powered-by-logo-dev.svg):

[<img src="assets/powered-by-logo-dev.svg" alt="Powered by Logo.dev" />](https://logo.dev)

```html
<!-- Hotlink from your own site or README (URL resolves once this repo's default branch carries the asset): -->
<a href="https://logo.dev"><img src="https://raw.githubusercontent.com/logo-dev/logo-api/main/assets/powered-by-logo-dev.svg" alt="Powered by Logo.dev" /></a>
```

Full rules and placement guidance: **[Attribution →](https://docs.logo.dev/platform/attribution)**

---

## FAQ

**Is it really free?**
Yes — `500K` requests/month on the free tier. Commercial use on the free plan needs attribution; paid plans remove it. See [pricing](https://www.logo.dev/pricing).

**Do I need attribution?**
Only for commercial use on the free plan. Personal projects don't. Details and edge cases: [Attribution](https://docs.logo.dev/platform/attribution).

**I'm coming from Clearbit — what changes?**
Swap the base URL and add a `token`. Your parameters carry over. See the [Clearbit migration guide](https://docs.logo.dev/migrations/clearbit).

**What formats and sizes are supported?**
`PNG` and `WebP`, with `size`, `retina`, and light/dark `theme` options. See the [logo image docs](https://docs.logo.dev/logo-images/introduction).

**What happens when a logo isn't found?**
You get a monogram fallback by default, or request a `404` to handle fallbacks yourself.

---

## Resources

- 📚 **[Documentation](https://docs.logo.dev)** — full API reference and guides
- 🔑 **[Get an API key](https://www.logo.dev/signup)** — free, no credit card
- 💳 **[Pricing](https://www.logo.dev/pricing)** — free tier and paid plans
- 🖥️ **[Dashboard](https://www.logo.dev/dashboard)** — manage keys and usage
- 🐛 **[Report an issue](https://github.com/logo-dev/logo-api/issues)** — bugs, incorrect logos, or feature requests

## Contributing

Found an incorrect logo, hit a problem, or have a feature request? [Open an issue](https://github.com/logo-dev/logo-api/issues) — we triage them actively, and most logo corrections ship within 24 hours.

## License

[MIT](LICENSE) © Logo.dev
