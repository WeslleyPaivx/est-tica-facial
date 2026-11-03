import { describe, expect, it } from "vitest";
import { safeNextPath } from "@/lib/security/redirect";

describe("safeNextPath", () => {
  it.each(["/", "/settings/members", "/x?y=1#z"])("aceita caminho interno %s", (p) => {
    expect(safeNextPath(p)).toBe(p);
  });
  it.each([
    "https://evil.test",
    "//evil.test",
    "/\\evil.test",
    "javascript:alert(1)",
    "evil",
    "/\u0000x",
    "",
    null,
    undefined,
  ])("rejeita %s", (p) => {
    expect(safeNextPath(p as string, "/fallback")).toBe("/fallback");
  });
});
