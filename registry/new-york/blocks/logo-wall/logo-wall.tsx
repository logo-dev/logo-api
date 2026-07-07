import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { Attribution } from "@/registry/new-york/ui/attribution";
import { Logo } from "@/registry/new-york/ui/logo";

type LogoWallBrand = string | { domain: string; name?: string; href?: string };

interface LogoWallProps extends ComponentProps<"div"> {
  /**
   * Renders the Logo.dev attribution link below the grid. Required on free
   * plans in production (https://docs.logo.dev/platform/attribution) — only
   * disable this on a paid plan.
   */
  attribution?: boolean;
  /** Domains to display, optionally with a display name and link. */
  brands: LogoWallBrand[];
  /** Grid columns from the `sm` breakpoint up (2 below it). Default 4. */
  columns?: 2 | 3 | 4 | 5 | 6;
  /** Muted grayscale logos that regain color on hover. Default true. */
  grayscale?: boolean;
  /** Logo height in pixels. Default 32. */
  size?: number;
  theme?: "light" | "dark" | "auto";
  /** Publishable (pk_) key. Defaults to NEXT_PUBLIC_LOGO_DEV_TOKEN. */
  token?: string;
}

const COLUMN_CLASSES: Record<NonNullable<LogoWallProps["columns"]>, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
  5: "sm:grid-cols-5",
  6: "sm:grid-cols-6",
};

const normalizeBrand = (brand: LogoWallBrand) =>
  typeof brand === "string" ? { domain: brand } : brand;

/**
 * A customer or integration logo grid from a list of domains. Server-safe:
 * hover color is pure CSS, so it renders fine in React Server Components.
 */
function LogoWall({
  brands,
  size = 32,
  columns = 4,
  grayscale = true,
  theme,
  attribution = true,
  token,
  className,
  ...props
}: LogoWallProps) {
  return (
    <div className={cn("w-full", className)} {...props}>
      <ul
        className={cn(
          "grid grid-cols-2 items-center justify-items-center gap-x-8 gap-y-6",
          COLUMN_CLASSES[columns]
        )}
      >
        {brands.map(normalizeBrand).map(({ domain, name, href }) => {
          const logo = (
            <Logo
              className={cn(
                grayscale &&
                  "opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0 motion-reduce:transition-none"
              )}
              domain={domain}
              label={name}
              size={size}
              theme={theme}
              token={token}
            />
          );
          return (
            <li key={domain}>
              {href ? (
                <a href={href} rel="noopener noreferrer" target="_blank">
                  {logo}
                </a>
              ) : (
                logo
              )}
            </li>
          );
        })}
      </ul>
      {attribution ? (
        <div className="mt-6 text-center">
          <Attribution />
        </div>
      ) : null}
    </div>
  );
}

export type { LogoWallBrand, LogoWallProps };
export { LogoWall };
