"use client";

import { type SVGProps, useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useBrandSearch } from "@/registry/new-york/hooks/use-brand-search";
import {
  type BrandSearchResult,
  withLogoParams,
} from "@/registry/new-york/lib/logo-dev";

// Inlined so the component needs no icon library. Consumers on any icon
// setup (lucide, radix, none) install this without extra dependencies.
const ChevronsUpDownIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    aria-hidden="true"
    fill="none"
    height="24"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
    width="24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="m7 15 5 5 5-5" />
    <path d="m7 9 5-5 5 5" />
  </svg>
);

interface BrandSearchProps {
  className?: string;
  defaultValue?: BrandSearchResult | null;
  disabled?: boolean;
  /** Server endpoint proxying the Logo.dev Search API. */
  endpoint?: string;
  /** Maximum results shown. Default 8. */
  limit?: number;
  onSelect?: (brand: BrandSearchResult) => void;
  placeholder?: string;
  /** Controlled selection. Leave undefined for uncontrolled use. */
  value?: BrandSearchResult | null;
}

const RESULT_LOGO_PX = 20;

const resultLogoUrl = (brand: BrandSearchResult) =>
  // logo_url already carries a token; just request a crisp, small render.
  withLogoParams(brand.logo_url, {
    format: "webp",
    size: RESULT_LOGO_PX * 2,
  });

const BrandSearchResultItem = ({
  brand,
  onSelect,
}: {
  brand: BrandSearchResult;
  onSelect: (brand: BrandSearchResult) => void;
}) => {
  const handleSelect = useCallback(() => {
    onSelect(brand);
  }, [brand, onSelect]);
  return (
    <CommandItem onSelect={handleSelect} value={brand.domain}>
      <img
        alt=""
        className="rounded-sm"
        height={RESULT_LOGO_PX}
        loading="lazy"
        src={resultLogoUrl(brand)}
        width={RESULT_LOGO_PX}
      />
      <span className="truncate">{brand.name}</span>
      <span className="ml-auto text-muted-foreground text-xs">
        {brand.domain}
      </span>
    </CommandItem>
  );
};

/**
 * Company autocomplete backed by the Logo.dev Search API — pick a company by
 * name and get its domain and logo. Requires the API route installed with
 * this block (your sk_ key stays on the server).
 */
function BrandSearch({
  value,
  defaultValue,
  onSelect,
  endpoint,
  placeholder = "Search for a company…",
  limit,
  disabled,
  className,
}: BrandSearchProps) {
  const [open, setOpen] = useState(false);
  const [internal, setInternal] = useState<BrandSearchResult | null>(
    defaultValue ?? null
  );
  const selected = value === undefined ? internal : value;

  const { query, setQuery, results, isLoading, error } = useBrandSearch({
    enabled: open,
    endpoint,
    limit,
  });

  const handleSelect = useCallback(
    (brand: BrandSearchResult) => {
      if (value === undefined) {
        setInternal(brand);
      }
      onSelect?.(brand);
      setOpen(false);
    },
    [value, onSelect]
  );

  const showStatus = results.length === 0;
  let status: string | null = null;
  if (showStatus && isLoading) {
    status = "Searching…";
  } else if (showStatus && error) {
    status = "Something went wrong. Try again.";
  } else if (showStatus && query.trim()) {
    status = "No companies found.";
  }

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          aria-expanded={open}
          className={cn("w-full justify-between font-normal", className)}
          disabled={disabled}
          role="combobox"
          variant="outline"
        >
          {selected ? (
            <span className="flex min-w-0 items-center gap-2">
              <img
                alt=""
                className="rounded-sm"
                height={RESULT_LOGO_PX}
                src={resultLogoUrl(selected)}
                width={RESULT_LOGO_PX}
              />
              <span className="truncate">{selected.name}</span>
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDownIcon className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-(--radix-popover-trigger-width) p-0"
      >
        {/* The API filters server-side; local cmdk filtering must stay off. */}
        <Command shouldFilter={false}>
          <CommandInput
            onValueChange={setQuery}
            placeholder={placeholder}
            value={query}
          />
          <CommandList>
            {status ? (
              <p className="py-6 text-center text-muted-foreground text-sm">
                {status}
              </p>
            ) : (
              <CommandGroup>
                {results.map((brand) => (
                  <BrandSearchResultItem
                    brand={brand}
                    key={brand.domain}
                    onSelect={handleSelect}
                  />
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export type { BrandSearchProps };
export { BrandSearch };
