# Logo.dev agent plugins

The `logo-dev` plugin connects your AI coding agent to Logo.dev. It adds two things:

- **The Logo.dev MCP server** at `https://mcp.logo.dev/mcp`. Your agent can search brands by name, look up a brand by domain, ticker, ISIN, crypto symbol, or name, and get its logo or brandmark. It can also manage your brand subscriptions and webhook endpoints, check your plan and API credit balance, and submit domains for review.
- **The Logo.dev skill**, which tells your agent how to use the Logo.dev CDN and the Logo.dev API in your code.

The first time your agent calls a tool, sign in to Logo.dev in your browser. You don't need an API key. Each tool runs as your team, with the same access checks and rate limits as the Logo.dev API, and spends API credits at the same rates as API requests.

## Install

### Claude Code

```
/plugin marketplace add logo-dev/logo-api
/plugin install logo-dev@logo-dev
```

Then run `/mcp`, select **logo-dev**, and select **Authenticate**.

### Cursor

Install **logo-dev** from the Cursor Marketplace, or add this repository as a team marketplace. Then open **Cursor Settings**, then **Tools & MCPs**, and select **Connect** next to **logo-dev**.

### Other clients

The plugin follows the [Agent Plugins](https://agent-plugins.org) format in `plugins/logo-dev`. To connect the MCP server without a plugin, see [Choose your client](https://www.logo.dev/docs/mcp/clients).

## Try it

> Use Logo.dev to look up the brand for the ticker AAPL. Give me its name, its domain, and its brand colors in hex.

## Links

- [MCP server docs](https://www.logo.dev/docs/mcp/introduction)
- [Tools](https://www.logo.dev/docs/mcp/tools)
- [Revoke access](https://www.logo.dev/docs/mcp/revoke-access)
- [Privacy policy](https://www.logo.dev/legal/privacy)
- Support: support@logo.dev
