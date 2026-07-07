"use client";

import {
  type ComponentProps,
  type CSSProperties,
  type ReactEventHandler,
  type ReactNode,
  useState,
} from "react";
import { cn } from "@/lib/utils";
import {
  type LogoSource,
  type LogoUrlOptions,
  logoDevSrcSet,
  logoDevUrl,
  logoInitials,
  logoSourceValue,
} from "@/registry/new-york/lib/logo-dev";

/** Exactly one lookup identifier: domain, name, ticker, crypto, or isin. */
type LogoSourceProps =
  | {
      domain: string;
      name?: never;
      ticker?: never;
      crypto?: never;
      isin?: never;
    }
  | {
      name: string;
      domain?: never;
      ticker?: never;
      crypto?: never;
      isin?: never;
    }
  | {
      ticker: string;
      domain?: never;
      name?: never;
      crypto?: never;
      isin?: never;
    }
  | {
      crypto: string;
      domain?: never;
      name?: never;
      ticker?: never;
      isin?: never;
    }
  | {
      isin: string;
      domain?: never;
      name?: never;
      ticker?: never;
      crypto?: never;
    };

type LogoProps = LogoSourceProps &
  Omit<ComponentProps<"img">, "src" | "srcSet" | "children"> & {
    /** Logical pixel size; sets width and height so the layout never shifts. */
    size?: number;
    /** Image format. `svg` requires an Enterprise plan. */
    format?: "webp" | "png" | "jpg" | "svg";
    /**
     * `auto` (default) renders light and dark variants toggled by the `dark:`
     * Tailwind variant, so the right logo shows in both color schemes with
     * no theme provider. `light`/`dark` render a single variant.
     */
    theme?: "light" | "dark" | "auto";
    greyscale?: boolean;
    /** Serve a 1x/2x srcSet for high-density displays. Default true. */
    retina?: boolean;
    /**
     * What renders when no logo exists: `monogram` (default) shows the
     * API-generated letter tile, `initials` shows a local initials tile, or
     * pass any React node for a custom fallback.
     */
    fallback?: "monogram" | "initials" | ReactNode;
    /** Display name used for alt text and initials (e.g. "Apple" for ticker AAPL). */
    label?: string;
    /** Publishable (pk_) key. Defaults to NEXT_PUBLIC_LOGO_DEV_TOKEN. */
    token?: string;
  };

const MIN_TILE_FONT_PX = 10;
const TILE_FONT_RATIO = 0.4;

interface InitialsTileProps {
  /** Accessible name. An empty string marks the tile decorative. */
  alt: string;
  className?: string;
  height: number | string;
  label: string;
  style?: CSSProperties;
  width: number | string;
}

const InitialsTile = ({
  alt,
  label,
  width,
  height,
  className,
  style,
}: InitialsTileProps) => {
  const numericHeight = typeof height === "number" ? height : undefined;
  const fontSize = numericHeight
    ? Math.max(MIN_TILE_FONT_PX, Math.round(numericHeight * TILE_FONT_RATIO))
    : undefined;
  const decorative = alt === "";
  return (
    <span
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : alt}
      className={cn(
        "inline-flex select-none items-center justify-center rounded-md bg-muted font-medium text-muted-foreground",
        className
      )}
      // Decorative tiles keep role="img" but are removed from the a11y tree by
      // aria-hidden, so screen readers skip them entirely.
      role="img"
      style={{ fontSize, height, width, ...style }}
    >
      {logoInitials(label)}
    </span>
  );
};

const toLogoSource = (parts: {
  domain?: string;
  name?: string;
  ticker?: string;
  crypto?: string;
  isin?: string;
}): LogoSource => {
  if (parts.name !== undefined) {
    return { name: parts.name };
  }
  if (parts.ticker !== undefined) {
    return { ticker: parts.ticker };
  }
  if (parts.crypto !== undefined) {
    return { crypto: parts.crypto };
  }
  if (parts.isin !== undefined) {
    return { isin: parts.isin };
  }
  return { domain: parts.domain ?? "" };
};

/**
 * A company logo from Logo.dev that never breaks: retina srcSet, automatic
 * dark-mode variants, and layered fallbacks (API monogram, local initials,
 * or a custom node).
 */
function Logo(props: LogoProps) {
  const {
    domain,
    name,
    ticker,
    crypto,
    isin,
    size = 32,
    format,
    theme = "auto",
    greyscale,
    retina = true,
    fallback = "monogram",
    label,
    token,
    alt,
    className,
    width,
    height,
    style,
    loading = "lazy",
    decoding = "async",
    onError,
    ...imgProps
  } = props;

  const source = toLogoSource({ crypto, domain, isin, name, ticker });
  const { kind, value } = logoSourceValue(source);
  const labelText = label ?? name ?? value;
  const resolvedAlt = alt ?? `${labelText} logo`;

  // The API returns HTTP 200 with a generated monogram on a miss, so onError
  // only ever fires for a missing logo when the URL requests fallback=404.
  const wantsLocalFallback = fallback !== "monogram";
  const urlFallback: LogoUrlOptions["fallback"] = wantsLocalFallback
    ? "404"
    : undefined;

  // Reset the error flag whenever anything that changes the requested image
  // changes (identifier, token, or any URL option), so the new image is
  // retried instead of staying stuck on a stale fallback.
  const identityKey = [
    kind,
    value,
    token ?? "",
    urlFallback ?? "",
    format ?? "",
    theme,
    greyscale ? "g" : "",
    size,
  ].join(":");
  const [errored, setErrored] = useState(false);
  const [prevKey, setPrevKey] = useState(identityKey);
  if (prevKey !== identityKey) {
    setPrevKey(identityKey);
    setErrored(false);
  }

  const resolvedWidth = width ?? size;
  const resolvedHeight = height ?? size;

  if (errored) {
    if (fallback === "monogram" || fallback === "initials") {
      return (
        <InitialsTile
          alt={resolvedAlt}
          className={className}
          height={resolvedHeight}
          label={labelText}
          style={style}
          width={resolvedWidth}
        />
      );
    }
    return <>{fallback}</>;
  }

  const sharedOptions: LogoUrlOptions = {
    fallback: urlFallback,
    format,
    greyscale,
    size,
    token,
  };

  const srcFor = (variant?: "light" | "dark") => {
    const options = { ...sharedOptions, theme: variant };
    if (retina) {
      return logoDevSrcSet(source, options);
    }
    return {
      src: logoDevUrl(source, { ...options, retina: false }),
      srcSet: undefined,
    };
  };

  const handleError: ReactEventHandler<HTMLImageElement> = (event) => {
    setErrored(true);
    onError?.(event);
  };

  const shared = {
    decoding,
    loading,
    onError: handleError,
    style,
    ...imgProps,
  };

  if (theme !== "auto") {
    const { src, srcSet } = srcFor(theme);
    return (
      <img
        {...shared}
        alt={resolvedAlt}
        className={cn("inline-block", className)}
        height={resolvedHeight}
        src={src}
        srcSet={srcSet}
        width={resolvedWidth}
      />
    );
  }

  const light = srcFor("light");
  const dark = srcFor("dark");
  return (
    <>
      <img
        {...shared}
        alt={resolvedAlt}
        className={cn("inline-block dark:hidden", className)}
        height={resolvedHeight}
        src={light.src}
        srcSet={light.srcSet}
        width={resolvedWidth}
      />
      <img
        {...shared}
        alt={resolvedAlt}
        className={cn("hidden dark:inline-block", className)}
        height={resolvedHeight}
        src={dark.src}
        srcSet={dark.srcSet}
        width={resolvedWidth}
      />
    </>
  );
}

export type { LogoProps, LogoSourceProps };
export { Logo };
