/**
 * Proxy for the Logo.dev Search API. Keeps your secret (sk_) key on the
 * server — never call api.logo.dev directly from the browser.
 *
 * NOTE: This route is unauthenticated. Add your own rate limiting and/or
 * auth before shipping it on a public site.
 */

const SEARCH_API_URL = "https://api.logo.dev/search";
const MAX_QUERY_LENGTH = 100;
const HTTP_BAD_REQUEST = 400;
const HTTP_NOT_FOUND = 404;
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
    upstream = await fetch(`${SEARCH_API_URL}?q=${encodeURIComponent(query)}`, {
      headers: { Authorization: `Bearer ${key}` },
    });
  } catch {
    return Response.json([], { status: HTTP_BAD_GATEWAY });
  }

  // The Search API returns 404 when nothing matches — that's an empty
  // result, not an error.
  if (upstream.status === HTTP_NOT_FOUND) {
    return Response.json([]);
  }
  if (!upstream.ok) {
    return Response.json([], { status: HTTP_BAD_GATEWAY });
  }

  const results: unknown = await upstream.json();
  return Response.json(results, {
    headers: {
      "Cache-Control": "private, max-age=60, stale-while-revalidate=300",
    },
  });
}
