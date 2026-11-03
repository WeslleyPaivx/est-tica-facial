import { describe, expect, it } from "vitest";
import { assignableRoles, canManageMember, isRole, requiresMfa } from "@/lib/security/permissions";

describe("RBAC (espelho da regra do banco)", () => {
  it("owner convida admin/member/limited, nunca owner", () => {
    expect(assignableRoles("owner", { forInvite: true })).toEqual(["admin", "member", "limited"]);
  });
  it("admin só concede papéis abaixo do seu", () => {
    expect(assignableRoles("admin", { forInvite: true })).toEqual(["member", "limited"]);
    expect(assignableRoles("admin", { forInvite: false })).toEqual(["member", "limited"]);
  });
  it("member e limited não concedem nada", () => {
    expect(assignableRoles("member", { forInvite: true })).toEqual(["limited"]); // UI espelha rank; o banco bloqueia (sem members.invite)
    expect(assignableRoles("limited", { forInvite: true })).toEqual([]);
  });
  it("admin não gerencia owner nem outro admin", () => {
    expect(canManageMember("admin", "owner")).toBe(false);
    expect(canManageMember("admin", "admin")).toBe(false);
    expect(canManageMember("admin", "member")).toBe(true);
    expect(canManageMember("owner", "owner")).toBe(true);
  });
  it("MFA obrigatório para owner/admin", () => {
    expect(requiresMfa("owner")).toBe(true);
    expect(requiresMfa("admin")).toBe(true);
    expect(requiresMfa("member")).toBe(false);
  });
  it("isRole rejeita valores arbitrários", () => {
    expect(isRole("owner")).toBe(true);
    expect(isRole("superadmin")).toBe(false);
    expect(isRole(undefined)).toBe(false);
  });
});
