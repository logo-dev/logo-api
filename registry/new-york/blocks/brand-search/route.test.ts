import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

const NOTION = {
  domain: "notion.com",
  logo_url: "https://img.logo.dev/notion.com?token=pk_test",
  name: "Notion",
  object: "search_result",
};

const upstream = vi.fn<typeof fetch>();

const search = (query: string) =>
  GET(new Request(`http://localhost/api/logo-dev/search?q=${query}`));

const respondWith = (status: number, body: unknown, headers?: HeadersInit) =>
  upstream.mockResolvedValue(Response.json(body, { headers, status }));

beforeEach(() => {
  upstream.mockReset();
  vi.stubGlobal("fetch", upstream);
  vi.stubEnv("LOGO_DEV_SECRET_KEY", "sk_test");
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("GET /api/logo-dev/search", () => {
  it("calls v2 search in typeahead mode with the secret key", async () => {
    respondWith(200, { data: [], metadata: { request_id: "request_1" } });

    await search("at%26t");

    const [url, init] = upstream.mock.calls[0] ?? [];
    expect(url).toBe(
      "https://api.logo.dev/v2/search?q=at%26t&method=typeahead"
    );
    expect(init?.headers).toEqual({ Authorization: "Bearer sk_test" });
  });

  it("returns the v2 data list as a bare array", async () => {
    respondWith(200, {
      data: [NOTION],
      metadata: { request_id: "request_1" },
    });

    const response = await search("notion");

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([NOTION]);
  });

  it("returns 402 with a dashboard link when credits run out", async () => {
    respondWith(402, {
      error: { code: "insufficient_credits", message: "out of credits" },
    });

    const response = await search("notion");

    expect(response.status).toBe(402);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(await response.json()).toEqual({
      error:
        "Your Logo.dev account is out of API credits. Add credits at https://www.logo.dev/dashboard",
    });
  });

  it("returns 429 with the wait from RateLimit-Reset", async () => {
    respondWith(
      429,
      { error: { code: "rate_limited", message: "rate limit reached" } },
      { "RateLimit-Reset": "42" }
    );

    const response = await search("notion");

    expect(response.status).toBe(429);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(response.headers.get("Retry-After")).toBe("42");
    expect(await response.json()).toEqual({
      error: "Too many searches. Try again in about a minute.",
    });
  });

  it("returns 502 for any other upstream failure", async () => {
    respondWith(500, { error: { code: "internal", message: "failed" } });

    const response = await search("notion");

    expect(response.status).toBe(502);
  });

  it("does not call the API for an empty query", async () => {
    const response = await search("%20");

    expect(await response.json()).toEqual([]);
    expect(upstream).not.toHaveBeenCalled();
  });
});
