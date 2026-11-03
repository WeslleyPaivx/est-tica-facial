import { describe, expect, it } from "vitest";
import { companySchema, contactSchema, parsePage, sanitizeSearch } from "@/features/crm/schemas";

describe("busca segura", () => {
  it("remove sintaxe de filtro do PostgREST", () => {
    expect(sanitizeSearch("ana,organization_id.eq.x")).toBe("ana organization_id eq x");
    expect(sanitizeSearch("a%)(*")).toBe("a");
    expect(sanitizeSearch("  João   Silva ")).toBe("João Silva");
    expect(sanitizeSearch(undefined)).toBe("");
    expect(sanitizeSearch("x".repeat(200))).toHaveLength(80);
  });
  it("página inválida volta para 1", () => {
    expect(parsePage("3")).toBe(3);
    expect(parsePage("-1")).toBe(1);
    expect(parsePage("abc")).toBe(1);
    expect(parsePage("1.5")).toBe(1);
  });
});

describe("schemas de CRM", () => {
  it("campos vazios viram null", () => {
    const c = contactSchema.parse({ full_name: " Ana ", email: "", phone: "", company_id: "", owner_id: "", notes: "" });
    expect(c).toEqual({ full_name: "Ana", email: null, phone: null, company_id: null, owner_id: null, notes: null });
  });
  it("rejeita valores inválidos", () => {
    expect(contactSchema.safeParse({ full_name: "", email: null }).success).toBe(false);
    expect(contactSchema.safeParse({ full_name: "Ana", email: "x" }).success).toBe(false);
    expect(contactSchema.safeParse({ full_name: "Ana", company_id: "not-a-uuid" }).success).toBe(false);
    expect(companySchema.safeParse({ name: "Beta", website: "javascript:alert(1)" }).success).toBe(false);
    expect(companySchema.safeParse({ name: "Beta", website: "https://beta.test" }).success).toBe(true);
  });
});
