/**
 * Proxy for the Logo.dev Search API. Keeps your secret (sk_) key on the
 * server — never call api.logo.dev directly from the browser.
 *
 * NOTE: This route is unauthenticated. Add your own rate limiting and/or
 * auth before shipping it on a public site.
 */

const SEARCH_API_URL = "https://api.logo.dev/v2/search";
const MAX_QUERY_LENGTH = 100;
const HTTP_BAD_REQUEST = 400;
const HTTP_PAYMENT_REQUIRED = 402;
const HTTP_TOO_MANY_REQUESTS = 429;
const HTTP_SERVER_ERROR = 500;
const HTTP_BAD_GATEWAY = 502;

export async function GET(request: Request): Promise<Response> {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (!query) {
    return Response.json([]);
  }
  if (query.length > MAX_QUERY_LENGTH) {
    return Response.json(
      { error: "Query too long" },
      { status: HTTP_BAD_REQUEST }
    );
  }

  const key = process.env.LOGO_DEV_SECRET_KEY;
  if (!key || key.startsWith("pk_")) {
    return Response.json(
      {
        error:
          "Set LOGO_DEV_SECRET_KEY to a secret (sk_) key. Get one at https://www.logo.dev/dashboard",
      },
      { status: HTTP_SERVER_ERROR }
    );
  }

  let upstream: Response;
  try {
    upstream = await fetch(
      `${SEARCH_API_URL}?q=${encodeURIComponent(query)}&method=typeahead`,
      { headers: { Authorization: `Bearer ${key}` } }
    );
  } catch {
    return Response.json([], { status: HTTP_BAD_GATEWAY });
  }

  if (upstream.status === HTTP_PAYMENT_REQUIRED) {
    return Response.json(
      {
        error:
          "Your Logo.dev account is out of API credits. Add credits at https://www.logo.dev/dashboard",
      },
      {
        headers: { "Cache-Control": "no-store" },
        status: HTTP_PAYMENT_REQUIRED,
      }
    );
  }
  if (upstream.status === HTTP_TOO_MANY_REQUESTS) {
    const headers = new Headers({ "Cache-Control": "no-store" });
    const reset = upstream.headers.get("RateLimit-Reset");
    if (reset) {
      headers.set("Retry-After", reset);
    }
    return Response.json(
      { error: "Too many searches. Try again in about a minute." },
      { headers, status: HTTP_TOO_MANY_REQUESTS }
    );
  }
  if (!upstream.ok) {
    return Response.json([], { status: HTTP_BAD_GATEWAY });
  }

  // useBrandSearch reads a bare array, so a custom `endpoint` only has to
  // return the list.
  const { data } = (await upstream.json()) as { data: unknown[] };
  return Response.json(data, {
    headers: {
      "Cache-Control": "private, max-age=60, stale-while-revalidate=300",
    },
  });
}
