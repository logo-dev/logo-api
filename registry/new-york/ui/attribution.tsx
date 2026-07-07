import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

interface AttributionProps
  extends Omit<ComponentProps<"a">, "href" | "children"> {
  label?: string;
}

/**
 * Attribution link required on Logo.dev free plans in production.
 * See https://docs.logo.dev/platform/attribution
 *
 * Uses rel="noopener" without "noreferrer" on purpose: the referrer is how
 * attribution is verified.
 */
function Attribution({
  label = "Logos provided by Logo.dev",
  className,
  ...props
}: AttributionProps) {
  return (
    <a
      className={cn(
        "text-muted-foreground text-xs underline-offset-4 hover:text-foreground hover:underline",
        className
      )}
      href="https://logo.dev"
      rel="noopener"
      target="_blank"
      {...props}
    >
      {label}
    </a>
  );
}

export type { AttributionProps };
export { Attribution };
