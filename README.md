<a name="readme-top"></a>

<div align="center">

<a href="https://www.logo.dev">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/logo-dark.svg" />
    <img src="assets/logo-light.svg" alt="Logo.dev" width="280" />
  </picture>
</a>

<h3>Every company logo, one API request</h3>

<p>Pass a domain, ticker, or company name. Get back a clean logo from a global CDN.<br />No sourcing, no hosting, no broken images.</p>

[![Website](https://img.shields.io/badge/Website-logo.dev-18181B?style=flat-square)](https://www.logo.dev)
[![Docs](https://img.shields.io/badge/Docs-logo.dev%2Fdocs-18181B?style=flat-square)](https://www.logo.dev/docs)
[![Get an API key](https://img.shields.io/badge/API%20key-free-18181B?style=flat-square)](https://www.logo.dev/signup)
[![License: MIT](https://img.shields.io/badge/License-MIT-18181B?style=flat-square)](LICENSE)

**100M+ companies** · **30M+ requests/day** · **80K+ developers** · **&lt;50ms median** · **500K free/month**

[Docs](https://www.logo.dev/docs) · [Get an API key](https://www.logo.dev/signup) · [Pricing](https://www.logo.dev/pricing) · [Changelog](https://www.logo.dev/docs/changelog)

</div>

---

## Why Logo.dev

- **A URL is the integration.** No SDK, no scraper, no image storage. Put the URL in an `<img>` tag.
- **Works in any stack.** It is an image, so it renders in HTML, React, iOS, Android, email, and spreadsheets.
- **Fast everywhere.** A global CDN answers in under 50ms at the median, from 150+ edge locations.
- **Always current.** 100M+ companies, refreshed daily. Rebrands show up without a code change.
- **Five ways to look up a company.** Domain, company name, stock ticker, crypto symbol, or ISIN.
- **More than logos.** Turn a domain into a full brand profile, or a company name into its domain.

## Products

| Product | What it does | Call |
| --- | --- | --- |
| **[Logo API](https://www.logo.dev/docs/logo-images/introduction)** | Logo images by domain, name, ticker, crypto, or ISIN | `GET img.logo.dev/{domain}` |
| **[Search API](https://www.logo.dev/docs/brand-search/introduction)** | Find a company's domain from its name, with typeahead | `GET api.logo.dev/search?q=` |
| **[Brand API](https://www.logo.dev/docs/brand/introduction)** | Logo, brandmark, colors, description, and socials as JSON | `GET api.logo.dev/brand/{domain}` |
| **[Transaction API](https://www.logo.dev/docs/transaction/introduction)** | Turn a card transaction string into a merchant and its brand. Private beta. | `POST api.logo.dev/transaction` |

The Logo API takes your publishable key (`pk_`) and is safe in a browser. The REST APIs take your secret key (`sk_`) and belong on a server. Both keys are on your [dashboard](https://www.logo.dev/dashboard/api-keys).

---

## Quickstart

[Sign up](https://www.logo.dev/signup) for a free key, then pick what you need.

### Show a logo

```html
<img src="https://img.logo.dev/stripe.com?token=LOGO_DEV_PUBLISHABLE_KEY" alt="Stripe logo" />
```

Swap `stripe.com` for any domain. That is the whole integration.

<details>
<summary><strong>React, cURL, Python</strong></summary>

<br />

```jsx
// React. In Next.js, read the key from process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN.
function CompanyLogo({ domain }) {
  return (
    <img
      src={`https://img.logo.dev/${domain}?token=LOGO_DEV_PUBLISHABLE_KEY`}
      alt={`${domain} logo`}
    />
  );
}
```

```bash
# cURL: save a 128px PNG
curl "https://img.logo.dev/stripe.com?token=LOGO_DEV_PUBLISHABLE_KEY&size=128&format=png" --output stripe.png
```

```python
# Python
import requests

def get_company_logo(domain: str) -> bytes:
    url = f"https://img.logo.dev/{domain}?token=LOGO_DEV_PUBLISHABLE_KEY"
    return requests.get(url).content
```

More stacks (Next.js, Vue, Ruby, PHP, Swift, Kotlin, Google Sheets, Excel) are in the [docs](https://www.logo.dev/docs/integrations/introduction).

</details>

### Look up by something other than a domain

| Lookup | URL |
| --- | --- |
| Domain | `img.logo.dev/stripe.com` |
| Company name | `img.logo.dev/name/stripe` |
| Stock ticker | `img.logo.dev/ticker/AAPL` |
| Crypto symbol | `img.logo.dev/crypto/BTC` |
| ISIN | `img.logo.dev/isin/US0378331005` |

Every lookup takes the same parameters:

| Parameter | Values | Default |
| --- | --- | --- |
| `size` | 1 to 800 pixels | `128` |
| `format` | `jpg`, `png`, `webp`, or `svg` (Enterprise) | `jpg` |
| `theme` | `auto`, `light`, or `dark` | `auto` |
| `retina` | `true` renders at 2× the size | `false` |
| `greyscale` | `true` returns a black-and-white logo | `false` |
| `fallback` | `monogram`, or `404` to handle a missing logo yourself | `monogram` |

### Get a full brand profile

```bash
curl --header "Authorization: Bearer LOGO_DEV_SECRET_KEY" "https://api.logo.dev/brand/sweetgreen.com"
```

<details>
<summary><strong>Response</strong></summary>

<br />

```json
{
  "name": "sweetgreen",
  "domain": "sweetgreen.com",
  "description": "Simple, seasonal, healthy salads and grain bowls made in-house from scratch.",
  "socials": {
    "instagram": "https://www.instagram.com/sweetgreen/",
    "twitter": "https://x.com/sweetgreen"
  },
  "logo": "https://img.logo.dev/sweetgreen.com?token=LOGO_DEV_PUBLISHABLE_KEY",
  "brandmark": "https://img.logo.dev/brand/sweetgreen.com/…?token=LOGO_DEV_PUBLISHABLE_KEY",
  "colors": [
    { "hex": "#e4ff55", "r": 228, "g": 255, "b": 85 },
    { "hex": "#0a4b2b", "r": 10, "g": 75, "b": 43 }
  ]
}
```

Abridged. All fields are in the [Brand API docs](https://www.logo.dev/docs/brand/introduction).

</details>

### Find a company by name

```bash
curl --header "Authorization: Bearer LOGO_DEV_SECRET_KEY" "https://api.logo.dev/search?q=notion"
```

<details>
<summary><strong>Response</strong></summary>

<br />

```json
[
  { "name": "Notion", "domain": "notion.com", "logo_url": "https://img.logo.dev/notion.com?token=…" },
  { "name": "Notion Capital", "domain": "notioncapital.com", "logo_url": "https://img.logo.dev/notioncapital.com?token=…" }
]
```

</details>

---

## React components

This repo is the official Logo.dev [shadcn/ui](https://ui.shadcn.com) registry. Add production-ready logo components to your app with one command:

```bash
npx shadcn@latest add https://www.logo.dev/r/logo.json
```

| Component | What you get |
| --- | --- |
| `logo` | A logo that never breaks. Five lookup types, retina `srcSet`, dark-mode variants, and monogram or initials fallbacks. |
| `logo-avatar` | A logo in a shadcn Avatar, with an initials fallback. For CRM rows and transaction feeds. |
| `brand-search` | Company autocomplete on the Search API, with a Next.js route that keeps your secret key on the server. |
| `logo-wall` | A customer logo grid from a list of domains, grey until hover. |
| `attribution` | The link free plans show in production. |
| `logo-lib` | The typed URL builder under all of the above. |

The CLI adds the key variables to `.env.local`. The components work in Radix and Base UI projects. You can also install from this repo, pinned to a branch, tag, or commit: `npx shadcn@latest add logo-dev/logo-api/logo`. Full guide: [shadcn/ui components](https://www.logo.dev/docs/integrations/shadcn).

<details>
<summary><strong>Developing the registry</strong></summary>

<br />

```bash
pnpm install
pnpm test        # URL builder and registry tests
pnpm typecheck
pnpm build       # shadcn build → r/*.json (committed; CI checks it's in sync)
pnpm validate    # shadcn registry validate
pnpm smoke       # dry-run `shadcn add` of every item from the built r/
STYLE=base-nova pnpm smoke  # the same, into a Base UI project
scripts/smoke-install.sh url https://www.logo.dev/r  # through the live URL (runs daily in CI)
```

Component sources live in `registry/new-york/`. An item that depends on another of our items names it in the GitHub form (`logo-dev/logo-api/logo`), never a bare name (that means the built-in shadcn item) or a www.logo.dev URL. `components/ui/` holds vendored shadcn primitives used only for typechecking. Consumers get those from ui.shadcn.com.

</details>

## Integrations

| Build with | Spreadsheets and slides |
| --- | --- |
| [Next.js](https://www.logo.dev/docs/integrations/nextjs) · [shadcn/ui](https://www.logo.dev/docs/integrations/shadcn) · [v0](https://www.logo.dev/docs/integrations/v0) · [Lovable](https://www.logo.dev/docs/integrations/lovable) · [Bolt](https://www.logo.dev/docs/integrations/bolt) | [Google Sheets](https://www.logo.dev/docs/integrations/google-sheets) · [Excel](https://www.logo.dev/docs/integrations/excel) · [PowerPoint](https://www.logo.dev/docs/integrations/powerpoint) |

---

## Migrating from Clearbit

**Clearbit's Logo API shut down on December 8, 2025.** If your app still points at `logo.clearbit.com`, its logos are broken.

We are the team that built the original Clearbit Logo API, and Clearbit and HubSpot recommend Logo.dev as the replacement. Swap the base URL and add a token. Your parameters keep working.

```diff
- https://logo.clearbit.com/stripe.com
+ https://img.logo.dev/stripe.com?token=LOGO_DEV_PUBLISHABLE_KEY
```

Full guide: [Migrating from Clearbit](https://www.logo.dev/docs/migrations/clearbit). Coming from Brandfetch? See [that guide](https://www.logo.dev/docs/migrations/brandfetch).

> "We built logo enrichment at Clearbit because developers needed it. Logo.dev is what I wish we could have built. Comprehensive, fast, and they actually keep the logos updated. Clear upgrade."
>
> **Alex MacCaw**, Founder, Clearbit

<!-- LIVE DEMO: uncomment after swapping LOGO_DEV_PUBLISHABLE_KEY for the team's public demo publishable key,
     so the row renders real logos straight from img.logo.dev on the repo page:

<p align="center">
  <img src="https://img.logo.dev/stripe.com?token=LOGO_DEV_PUBLISHABLE_KEY&size=64" alt="Stripe" height="40" />
  <img src="https://img.logo.dev/shopify.com?token=LOGO_DEV_PUBLISHABLE_KEY&size=64" alt="Shopify" height="40" />
  <img src="https://img.logo.dev/airbnb.com?token=LOGO_DEV_PUBLISHABLE_KEY&size=64" alt="Airbnb" height="40" />
  <img src="https://img.logo.dev/spotify.com?token=LOGO_DEV_PUBLISHABLE_KEY&size=64" alt="Spotify" height="40" />
</p>
-->

## Attribution

Commercial use on the free plan needs a visible link back. Personal projects and paid plans don't. Add this wherever you show logos:

```html
<a href="https://logo.dev">Logos provided by Logo.dev</a>
```

Or use the badge: [<img src="assets/powered-by-logo-dev.svg" alt="Powered by Logo.dev" />](https://logo.dev)

```html
<a href="https://logo.dev"><img src="https://raw.githubusercontent.com/logo-dev/logo-api/main/assets/powered-by-logo-dev.svg" alt="Powered by Logo.dev" /></a>
```

Placement rules: [Attribution](https://www.logo.dev/docs/platform/attribution).

## FAQ

**Is it free?**
Yes. The free plan includes 500K logo requests a month. See [pricing](https://www.logo.dev/pricing).

**What happens when a logo isn't found?**
You get a generated monogram. Pass `fallback=404` to get a `404` and show your own fallback instead.

**Can I use the logos in my README or docs?**
Yes. Every logo is an image URL, so it renders in Markdown. Add the attribution link on the free plan if the use is commercial.

**How do I report a wrong logo?**
[Open an issue](https://github.com/logo-dev/logo-api/issues) or [request an update](https://www.logo.dev/docs/support/request-updates). Most corrections ship within 24 hours.

## Resources

- [Documentation](https://www.logo.dev/docs): API reference and guides
- [Get an API key](https://www.logo.dev/signup): free, no credit card
- [Pricing](https://www.logo.dev/pricing): free and paid plans
- [Dashboard](https://www.logo.dev/dashboard): keys and usage
- [Status](https://www.logo.dev/docs/support/status): uptime and incidents

## Contributing

Found a wrong logo, hit a bug, or want a feature? [Open an issue](https://github.com/logo-dev/logo-api/issues). We triage every one.

## License

[MIT](LICENSE) © Logo.dev

<p align="right"><a href="#readme-top">Back to top ↑</a></p>
