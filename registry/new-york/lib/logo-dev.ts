/**
 * Logo.dev URL builder and shared types.
 *
 * Docs: https://docs.logo.dev
 * Get a free publishable (pk_) key: https://www.logo.dev/dashboard
 */

const LOGO_DEV_IMG_BASE = "https://img.logo.dev";
const MIN_SIZE = 1;
const MAX_SIZE = 800;
const DEFAULT_SIZE = 64;

/**
 * One of the five Logo.dev lookup types. A plain string is treated as a
 * domain (`"stripe.com"`).
 */
export type LogoSource =
  | { domain: string }
  | { name: string }
  | { ticker: string }
  | { crypto: string }
  | { isin: string };

export type LogoKind = "domain" | "name" | "ticker" | "crypto" | "isin";

export interface LogoUrlOptions {
  /**
   * What the API returns when no logo exists: `monogram` (default) serves a
   * generated letter tile with HTTP 200; `404` returns an HTTP 404 so an
   * `onError` handler can render a local fallback instead.
   */
  fallback?: "monogram" | "404";
  /** Image format. `svg` requires an Enterprise plan — never used by default. */
  format?: "webp" | "png" | "jpg" | "svg";
  /** Return a black-and-white version of the logo. */
  greyscale?: boolean;
  /** Render at 2× the requested size for high-density displays. */
  retina?: boolean;
  /** Logical pixel size (width and height). Clamped to 1–800. Default 64. */
  size?: number;
  /**
   * `light` inverts dark logos for light backgrounds, `dark` inverts light
   * logos for dark backgrounds. `auto` (default) requests the logo as-is.
   */
  theme?: "light" | "dark" | "auto";
  /** Publishable (pk_) key. Defaults to NEXT_PUBLIC_LOGO_DEV_TOKEN. */
  token?: string;
}

/** A result row from the Logo.dev Brand Search API. */
export interface BrandSearchResult {
  domain: string;
  logo_url: string;
  name: string;
}

let warnedMissingToken = false;

const envToken = (): string | undefined => {
  if (typeof process === "undefined") {
    // Non-Node bundlers (e.g. Vite) don't define `process`; pass `token` instead.
    return;
  }
  return process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN;
};

/**
 * Resolve the publishable API token: explicit argument first, then the
 * NEXT_PUBLIC_LOGO_DEV_TOKEN environment variable.
 */
export const getLogoDevToken = (token?: string): string => {
  const resolved = token ?? envToken() ?? "";
  if (!(resolved || warnedMissingToken) && typeof console !== "undefined") {
    warnedMissingToken = true;
    console.warn(
      "[logo.dev] No API token found. Set NEXT_PUBLIC_LOGO_DEV_TOKEN or pass `token`. Get a free key at https://www.logo.dev/dashboard"
    );
  }
  return resolved;
};

/** Normalize a LogoSource (or bare domain string) into its kind and value. */
export const logoSourceValue = (
  source: LogoSource | string
): { kind: LogoKind; value: string } => {
  if (typeof source === "string") {
    return { kind: "domain", value: source };
  }
  if ("domain" in source) {
    return { kind: "domain", value: source.domain };
  }
  if ("name" in source) {
    return { kind: "name", value: source.name };
  }
  if ("ticker" in source) {
    return { kind: "ticker", value: source.ticker };
  }
  if ("crypto" in source) {
    return { kind: "crypto", value: source.crypto };
  }
  return { kind: "isin", value: source.isin };
};

const buildPath = (kind: LogoKind, value: string): string => {
  const encoded = encodeURIComponent(value.trim());
  return kind === "domain" ? encoded : `${kind}/${encoded}`;
};

const clampSize = (size: number): number => {
  if (!Number.isFinite(size)) {
    return DEFAULT_SIZE;
  }
  return Math.min(MAX_SIZE, Math.max(MIN_SIZE, Math.round(size)));
};

/** Build an img.logo.dev URL for any lookup type. */
export const logoDevUrl = (
  source: LogoSource | string,
  options: LogoUrlOptions = {}
): string => {
  const { kind, value } = logoSourceValue(source);
  const {
    size = DEFAULT_SIZE,
    format = "webp",
    theme,
    greyscale,
    retina,
    fallback,
    token,
  } = options;

  const params = new URLSearchParams();
  params.set("token", getLogoDevToken(token));
  params.set("size", String(clampSize(size)));
  params.set("format", format);
  if (theme === "light" || theme === "dark") {
    params.set("theme", theme);
  }
  if (greyscale) {
    params.set("greyscale", "true");
  }
  if (retina) {
    params.set("retina", "true");
  }
  if (fallback === "404") {
    params.set("fallback", "404");
  }

  return `${LOGO_DEV_IMG_BASE}/${buildPath(kind, value)}?${params.toString()}`;
};

/**
 * Build `src` and a 1x/2x `srcSet` for crisp logos on high-density displays.
 * The 2x candidate uses the API's `retina` parameter, which renders at twice
 * the requested size.
 */
export const logoDevSrcSet = (
  source: LogoSource | string,
  options: LogoUrlOptions = {}
): { src: string; srcSet: string } => {
  const src = logoDevUrl(source, { ...options, retina: false });
  const src2x = logoDevUrl(source, { ...options, retina: true });
  return { src, srcSet: `${src} 1x, ${src2x} 2x` };
};

/**
 * Append or override image parameters on an existing img.logo.dev URL, such
 * as the `logo_url` returned by the Brand Search API (which already carries
 * a token). Returns the input unchanged if it isn't a valid URL.
 */
export const withLogoParams = (
  logoUrl: string,
  options: Omit<LogoUrlOptions, "token"> = {}
): string => {
  let url: URL;
  try {
    url = new URL(logoUrl);
  } catch {
    return logoUrl;
  }
  const { size, format, theme, greyscale, retina, fallback } = options;
  if (size !== undefined) {
    url.searchParams.set("size", String(clampSize(size)));
  }
  if (format) {
    url.searchParams.set("format", format);
  }
  if (theme === "light" || theme === "dark") {
    url.searchParams.set("theme", theme);
  }
  if (greyscale !== undefined) {
    url.searchParams.set("greyscale", greyscale ? "true" : "false");
  }
  if (retina !== undefined) {
    url.searchParams.set("retina", retina ? "true" : "false");
  }
  if (fallback === "404") {
    url.searchParams.set("fallback", "404");
  }
  return url.toString();
};

const WORD_SEPARATORS = /[\s\-_]+/;

/**
 * Initials for a local fallback tile: first letters of the first two words
 * ("Andreessen Horowitz" → "AH"), or the first character for single words
 * and domains ("stripe.com" → "S").
 */
export const logoInitials = (label: string): string => {
  const words = label.trim().split(WORD_SEPARATORS).filter(Boolean);
  const first = words.at(0)?.at(0);
  if (!first) {
    return "?";
  }
  const second = words.length > 1 ? words.at(1)?.at(0) : undefined;
  return `${first}${second ?? ""}`.toUpperCase();
};
