import { describe, expect, it } from "vitest";
import { assertSafeHref, isExternalHttpUrl, isSafeHref } from "@/lib/safe-url";

describe("safe-url", () => {
  describe("isSafeHref", () => {
    it("accepts valid https URLs, mailto links, internal paths, root path, and hash anchors", () => {
      expect(isSafeHref("https://www.linkedin.com/in/shlomi-goland-37659346")).toBe(true);
      expect(isSafeHref("HTTPS://EXAMPLE.COM/path")).toBe(true);
      expect(isSafeHref("mailto:golandsh@gmail.com")).toBe(true);
      expect(isSafeHref("/")).toBe(true);
      expect(isSafeHref("/portfolio")).toBe(true);
      expect(isSafeHref("  /portfolio  ")).toBe(true);
      expect(isSafeHref("/#career")).toBe(true);
      expect(isSafeHref("#about")).toBe(true);
    });

    it("rejects dangerous schemes, obfuscated control chars, backslashes, relative non-root paths, and empty values", () => {
      expect(isSafeHref("javascript:alert(1)")).toBe(false);
      expect(isSafeHref("  JAVASCRIPT:alert(1)  ")).toBe(false);
      expect(isSafeHref("java\tscript:alert(1)")).toBe(false);
      expect(isSafeHref("java\nscript:alert(1)")).toBe(false);
      expect(isSafeHref("data:text/html,<script>alert(1)</script>")).toBe(false);
      expect(isSafeHref("vbscript:msgbox(1)")).toBe(false);
      expect(isSafeHref("file:///etc/passwd")).toBe(false);
      expect(isSafeHref("ftp://files.example.com")).toBe(false);
      expect(isSafeHref("blob:https://example.com/uuid")).toBe(false);
      expect(isSafeHref("http://insecure.example.com")).toBe(false);
      expect(isSafeHref("//evil.example.com/phish")).toBe(false);
      expect(isSafeHref("/\\evil.example.com/phish")).toBe(false);
      expect(isSafeHref("/\t/evil.example.com/phish")).toBe(false);
      expect(isSafeHref("/\n/evil.example.com/phish")).toBe(false);
      expect(isSafeHref("portfolio")).toBe(false);
      expect(isSafeHref("../secret")).toBe(false);
      expect(isSafeHref("")).toBe(false);
      expect(isSafeHref("   ")).toBe(false);
      expect(isSafeHref("#")).toBe(false);
      expect(isSafeHref("#invalid space")).toBe(false);
    });
  });

  describe("isExternalHttpUrl", () => {
    it("accepts only trimmed https URLs without control characters or backslashes", () => {
      expect(isExternalHttpUrl("https://example.com")).toBe(true);
      expect(isExternalHttpUrl("  https://example.com/demo  ")).toBe(true);
      expect(isExternalHttpUrl("HTTPS://EXAMPLE.COM")).toBe(true);

      expect(isExternalHttpUrl("http://example.com")).toBe(false);
      expect(isExternalHttpUrl("mailto:golandsh@gmail.com")).toBe(false);
      expect(isExternalHttpUrl("/portfolio")).toBe(false);
      expect(isExternalHttpUrl("#anchor")).toBe(false);
      expect(isExternalHttpUrl("")).toBe(false);
      expect(isExternalHttpUrl("javascript:void(0)")).toBe(false);
      expect(isExternalHttpUrl("https://example.com\\evil")).toBe(false);
    });
  });

  describe("assertSafeHref", () => {
    it("returns trimmed safe hrefs and throws on unsafe values", () => {
      expect(assertSafeHref("  https://example.com  ")).toBe("https://example.com");
      expect(assertSafeHref("  /portfolio  ")).toBe("/portfolio");
      expect(assertSafeHref("  #career  ")).toBe("#career");

      expect(() => assertSafeHref("")).toThrowError(/Unsafe href rejected/);
      expect(() => assertSafeHref("http://insecure.example.com")).toThrowError(
        /Unsafe href rejected/,
      );
      expect(() => assertSafeHref("//evil.example.com")).toThrowError(
        /Unsafe href rejected/,
      );
      expect(() => assertSafeHref("javascript:alert(1)")).toThrowError(
        /Unsafe href rejected/,
      );
    });
  });
});
