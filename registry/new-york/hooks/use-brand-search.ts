"use client";

import { useEffect, useState } from "react";
import type { BrandSearchResult } from "@/registry/new-york/lib/logo-dev";

interface UseBrandSearchOptions {
  debounceMs?: number;
  enabled?: boolean;
  /**
   * Server endpoint that proxies the Logo.dev Search API with your secret
   * key. Defaults to the Next.js route installed with the brand-search
   * block; point it at your own proxy on other stacks.
   */
  endpoint?: string;
  /** Maximum results to keep (the API returns up to 10). Default 8. */
  limit?: number;
}

const DEFAULT_DEBOUNCE_MS = 200;
const DEFAULT_LIMIT = 8;

/** A failed response from the search endpoint, with its HTTP status. */
class BrandSearchError extends Error {
  readonly status: number;

  constructor(status: number) {
    super(`Brand search failed (${status})`);
    this.name = "BrandSearchError";
    this.status = status;
  }
}

const performSearch = async (
  endpoint: string,
  query: string,
  limit: number,
  signal: AbortSignal
): Promise<BrandSearchResult[]> => {
  // Append `q` with the right separator so a custom endpoint that already has
  // query params (e.g. "/api/search?tenant=acme") stays valid.
  const separator = endpoint.includes("?") ? "&" : "?";
  const response = await fetch(
    `${endpoint}${separator}q=${encodeURIComponent(query)}`,
    { signal }
  );
  if (!response.ok) {
    throw new BrandSearchError(response.status);
  }
  const data = (await response.json()) as BrandSearchResult[];
  return data.slice(0, limit);
};

/**
 * Debounced company search against the Logo.dev Search API. Stale in-flight
 * requests are aborted, and previous results stay visible while a new query
 * loads so the list doesn't flicker.
 */
function useBrandSearch({
  endpoint = "/api/logo-dev/search",
  debounceMs = DEFAULT_DEBOUNCE_MS,
  limit = DEFAULT_LIMIT,
  enabled = true,
}: UseBrandSearchOptions = {}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BrandSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (!(enabled && trimmed)) {
      setResults([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    // One controller per query. Cleanup aborts it, so an in-flight request for
    // a previous query can never overwrite results for the current one, even if
    // it resolves during the next debounce window.
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setIsLoading(true);
      performSearch(endpoint, trimmed, limit, controller.signal)
        .then((data) => {
          if (!controller.signal.aborted) {
            setResults(data);
            setError(null);
          }
        })
        .catch((caught: unknown) => {
          if (!controller.signal.aborted) {
            // Results for the previous query would hide the failure.
            setResults([]);
            setError(
              caught instanceof Error
                ? caught
                : new Error("Brand search failed")
            );
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setIsLoading(false);
          }
        });
    }, debounceMs);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, enabled, endpoint, debounceMs, limit]);

  return { error, isLoading, query, results, setQuery };
}

export type { UseBrandSearchOptions };
export { BrandSearchError, useBrandSearch };
