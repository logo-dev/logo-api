"use client";

import { useEffect, useRef, useState } from "react";
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

const performSearch = async (
  endpoint: string,
  query: string,
  limit: number,
  signal: AbortSignal
): Promise<BrandSearchResult[]> => {
  const response = await fetch(`${endpoint}?q=${encodeURIComponent(query)}`, {
    signal,
  });
  if (!response.ok) {
    throw new Error(`Brand search failed (${response.status})`);
  }
  const data = (await response.json()) as BrandSearchResult[];
  return data.slice(0, limit);
};

const isAbortError = (caught: unknown): boolean =>
  caught instanceof DOMException && caught.name === "AbortError";

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
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (!(enabled && trimmed)) {
      abortRef.current?.abort();
      setResults([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    const timer = setTimeout(() => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setIsLoading(true);

      performSearch(endpoint, trimmed, limit, controller.signal)
        .then((data) => {
          setResults(data);
          setError(null);
        })
        .catch((caught: unknown) => {
          if (!isAbortError(caught)) {
            setError(
              caught instanceof Error
                ? caught
                : new Error("Brand search failed")
            );
          }
        })
        .finally(() => {
          // A newer request may already own the loading state.
          if (abortRef.current === controller) {
            setIsLoading(false);
          }
        });
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, enabled, endpoint, debounceMs, limit]);

  useEffect(() => () => abortRef.current?.abort(), []);

  return { error, isLoading, query, results, setQuery };
}

export type { UseBrandSearchOptions };
export { useBrandSearch };
