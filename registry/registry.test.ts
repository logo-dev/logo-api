import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import registry from "../registry.json";

const ROOT = join(import.meta.dirname, "..");
const OWN_ITEMS = new Set(registry.items.map((item) => item.name));

// Install form for one of our own items. A bare name would resolve to the
// built-in shadcn item of that name, and a www.logo.dev URL sits behind the
// Vercel bot checkpoint, which answers the shadcn CLI with HTTP 429.
const GITHUB_ITEM = /^logo-dev\/logo-api\/([a-z-]+)$/;
const SHADCN_ITEM = /^[a-z-]+$/;

const builtItems = () =>
  readdirSync(join(ROOT, "r"))
    .filter((file) => file !== "registry.json")
    .map(
      (file) =>
        JSON.parse(readFileSync(join(ROOT, "r", file), "utf8")) as {
          name: string;
          docs?: string;
          registryDependencies?: string[];
          files: { content: string }[];
        }
    );

describe("registry.json", () => {
  it.each(
    registry.items
  )("$name names its own items in the GitHub form", (item) => {
    for (const dep of item.registryDependencies ?? []) {
      const own = GITHUB_ITEM.exec(dep);
      if (own) {
        expect(OWN_ITEMS).toContain(own[1]);
      } else {
        // Anything else must be a built-in shadcn item, never a URL.
        expect(dep).toMatch(SHADCN_ITEM);
        expect(OWN_ITEMS).not.toContain(dep);
      }
    }
  });

  it.each(registry.items)("$name has install docs", (item) => {
    expect(item.docs).toBeTruthy();
  });
});

describe("built r/ output", () => {
  it("has one file per item", () => {
    expect(
      builtItems()
        .map((item) => item.name)
        .sort()
    ).toEqual([...OWN_ITEMS].sort());
  });

  it.each(builtItems())("$name links only to live docs", (item) => {
    const text = [item.docs ?? "", ...item.files.map((file) => file.content)];
    for (const chunk of text) {
      expect(chunk).not.toContain("docs.logo.dev");
      expect(chunk).not.toContain("www.logo.dev/r/");
    }
    for (const dep of item.registryDependencies ?? []) {
      expect(dep).not.toContain("www.logo.dev");
    }
  });
});
