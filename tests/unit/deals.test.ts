import { describe, expect, it } from "vitest";
import { closeDealSchema, dealSchema, formatCents, parseMoneyToCents } from "@/features/crm/deals";

const STAGE = "6b1f6a52-2f0e-4c1c-9d8e-6f0a9b1c2d3e";

describe("valor em reais", () => {
  it.each([
    ["1.234,56", 123456],
    ["1234,5", 123450],
    ["R$ 1.234", 123400],
    ["450.000,00", 45000000],
    ["1234.56", 123456],
    ["1.000", 100000],
    ["0", 0],
  ])("%s -> %i centavos", (raw, cents) => expect(parseMoneyToCents(raw)).toBe(cents));
  it("vazio vira null", () => expect(parseMoneyToCents("  ")).toBeNull());
  it.each(["abc", "1,2,3", "-10", "12,345"])("recusa %s", (raw) => expect(Number.isNaN(parseMoneyToCents(raw))).toBe(true));
  it("formata em reais", () => expect(formatCents(123456).replace(/\s/g, " ")).toBe("R$ 1.234,56"));
});

describe("formulário da oportunidade", () => {
  it("aceita o mínimo e converte vazios em null", () => {
    const r = dealSchema.safeParse({ title: " Venda ", value_cents: "", source: "", stage_id: STAGE, contact_id: "", next_action_at: "" });
    expect(r.success && r.data).toMatchObject({ title: "Venda", value_cents: null, source: null, contact_id: null, next_action_at: null });
  });
  it("recusa valor inválido com mensagem clara", () => {
    const r = dealSchema.safeParse({ title: "X", value_cents: "dez reais", stage_id: STAGE });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0]?.message).toMatch(/Valor inválido/);
  });
  it("recusa id que não é UUID (proteção contra adulteração)", () => {
    expect(dealSchema.safeParse({ title: "X", stage_id: STAGE, contact_id: "1 or 1=1" }).success).toBe(false);
  });
  it("perda exige motivo", () => {
    expect(closeDealSchema.safeParse({ status: "lost", lost_reason: " " }).success).toBe(false);
    expect(closeDealSchema.safeParse({ status: "lost", lost_reason: "Preço" }).success).toBe(true);
    expect(closeDealSchema.safeParse({ status: "won" }).success).toBe(true);
  });
});
