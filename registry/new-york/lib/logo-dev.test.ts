import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getLogoDevToken,
  logoDevSrcSet,
  logoDevUrl,
  logoInitials,
  logoSourceValue,
  withLogoParams,
} from "./logo-dev";

const TOKEN = "pk_test_token";

const paramsOf = (url: string) => new URL(url).searchParams;

beforeEach(() => {
  vi.unstubAllEnvs();
});

describe("logoSourceValue", () => {
  it("treats a bare string as a domain", () => {
    expect(logoSourceValue("stripe.com")).toEqual({
      kind: "domain",
      value: "stripe.com",
    });
  });

  it("normalizes each object form to its kind", () => {
    expect(logoSourceValue({ ticker: "AAPL" }).kind).toBe("ticker");
    expect(logoSourceValue({ crypto: "btc" }).kind).toBe("crypto");
    expect(logoSourceValue({ isin: "US0378331005" }).kind).toBe("isin");
    expect(logoSourceValue({ name: "Nike" }).kind).toBe("name");
    expect(logoSourceValue({ domain: "nike.com" }).kind).toBe("domain");
  });
});

describe("logoDevUrl", () => {
  it("builds a domain URL with defaults", () => {
    const url = logoDevUrl("stripe.com", { token: TOKEN });
    expect(url.startsWith("https://img.logo.dev/stripe.com?")).toBe(true);
    expect(paramsOf(url).get("token")).toBe(TOKEN);
    expect(paramsOf(url).get("size")).toBe("64");
    expect(paramsOf(url).get("format")).toBe("webp");
  });

  it("prefixes non-domain kinds with their path segment", () => {
    expect(logoDevUrl({ ticker: "AAPL" }, { token: TOKEN })).toContain(
      "/ticker/AAPL?"
    );
    expect(logoDevUrl({ crypto: "btc" }, { token: TOKEN })).toContain(
      "/crypto/btc?"
    );
    expect(logoDevUrl({ isin: "US0378331005" }, { token: TOKEN })).toContain(
      "/isin/US0378331005?"
    );
  });

  it("URL-encodes brand names", () => {
    expect(logoDevUrl({ name: "AT&T" }, { token: TOKEN })).toContain(
      "/name/AT%26T?"
    );
  });

  it("clamps and rounds size", () => {
    const big = logoDevUrl("a.com", { size: 9999, token: TOKEN });
    const small = logoDevUrl("a.com", { size: 0, token: TOKEN });
    const fraction = logoDevUrl("a.com", { size: 24.7, token: TOKEN });
    expect(paramsOf(big).get("size")).toBe("800");
    expect(paramsOf(small).get("size")).toBe("1");
    expect(paramsOf(fraction).get("size")).toBe("25");
  });

  it("omits theme for auto and sets it for light/dark", () => {
    const auto = logoDevUrl("a.com", { theme: "auto", token: TOKEN });
    const dark = logoDevUrl("a.com", { theme: "dark", token: TOKEN });
    expect(paramsOf(auto).has("theme")).toBe(false);
    expect(paramsOf(dark).get("theme")).toBe("dark");
  });

  it("only emits fallback=404 when requested", () => {
    const monogram = logoDevUrl("a.com", { token: TOKEN });
    const notFound = logoDevUrl("a.com", { fallback: "404", token: TOKEN });
    expect(paramsOf(monogram).has("fallback")).toBe(false);
    expect(paramsOf(notFound).get("fallback")).toBe("404");
  });

  it("emits greyscale and retina flags when enabled", () => {
    const url = logoDevUrl("a.com", {
      greyscale: true,
      retina: true,
      token: TOKEN,
    });
    expect(paramsOf(url).get("greyscale")).toBe("true");
    expect(paramsOf(url).get("retina")).toBe("true");
  });
});

describe("getLogoDevToken", () => {
  it("prefers an explicit token over the environment", () => {
    vi.stubEnv("NEXT_PUBLIC_LOGO_DEV_TOKEN", "pk_from_env");
    expect(getLogoDevToken("pk_explicit")).toBe("pk_explicit");
    expect(getLogoDevToken()).toBe("pk_from_env");
  });
});

describe("logoDevSrcSet", () => {
  it("returns a 1x/2x srcSet where only the 2x is retina", () => {
    const { src, srcSet } = logoDevSrcSet("stripe.com", {
      size: 40,
      token: TOKEN,
    });
    const [oneX, twoX] = srcSet.split(", ");
    expect(oneX?.endsWith(" 1x")).toBe(true);
    expect(twoX?.endsWith(" 2x")).toBe(true);
    expect(src).toBe(oneX?.slice(0, -" 1x".length));
    expect(paramsOf(src).has("retina")).toBe(false);
    expect(paramsOf(twoX?.slice(0, -" 2x".length) ?? "").get("retina")).toBe(
      "true"
    );
  });
});

describe("withLogoParams", () => {
  it("overrides params while keeping the existing token", () => {
    const url = withLogoParams(`https://img.logo.dev/nike.com?token=${TOKEN}`, {
      format: "webp",
      size: 40,
    });
    expect(paramsOf(url).get("token")).toBe(TOKEN);
    expect(paramsOf(url).get("size")).toBe("40");
    expect(paramsOf(url).get("format")).toBe("webp");
  });

  it("returns invalid URLs unchanged", () => {
    expect(withLogoParams("not a url", { size: 40 })).toBe("not a url");
  });
});

describe("logoInitials", () => {
  it("uses the first letters of the first two words", () => {
    expect(logoInitials("Andreessen Horowitz")).toBe("AH");
  });

  it("uses a single letter for single words and domains", () => {
    expect(logoInitials("stripe.com")).toBe("S");
    expect(logoInitials("Nike")).toBe("N");
  });

  it("falls back to ? for empty labels", () => {
    expect(logoInitials("   ")).toBe("?");
  });
});
