"use client";

import type { ComponentProps } from "react";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Logo, type LogoSourceProps } from "@/registry/new-york/ui/logo";

type LogoAvatarProps = LogoSourceProps &
  // `size` is omitted because some shadcn Avatar variants define their own
  // (string) size prop; ours is the pixel dimension below.
  Omit<ComponentProps<typeof Avatar>, "children" | "size"> & {
    /** Avatar dimension in pixels. Default 32. */
    size?: number;
    /** Display name used for alt text and initials (e.g. "Apple" for ticker AAPL). */
    label?: string;
    theme?: "light" | "dark" | "auto";
    greyscale?: boolean;
    /** Publishable (pk_) key. Defaults to NEXT_PUBLIC_LOGO_DEV_TOKEN. */
    token?: string;
  };

/**
 * A company logo in a shadcn Avatar shell with an initials fallback — for
 * CRM rows, transaction feeds, and anywhere you'd show a user avatar.
 *
 * Defaults to rounded-md: full circles crop most logos. Pass
 * className="rounded-full" if you want circular avatars anyway.
 */
function LogoAvatar({
  domain,
  name,
  ticker,
  crypto,
  isin,
  size = 32,
  label,
  theme,
  greyscale,
  token,
  className,
  style,
  ...avatarProps
}: LogoAvatarProps) {
  const sourceProps = {
    crypto,
    domain,
    isin,
    name,
    ticker,
  } as LogoSourceProps;

  return (
    <Avatar
      className={cn("rounded-md", className)}
      style={{ height: size, width: size, ...style }}
      {...avatarProps}
    >
      <Logo
        {...sourceProps}
        className="size-full rounded-[inherit] object-contain"
        fallback="initials"
        greyscale={greyscale}
        label={label}
        size={size}
        theme={theme}
        token={token}
      />
    </Avatar>
  );
}

export type { LogoAvatarProps };
export { LogoAvatar };
