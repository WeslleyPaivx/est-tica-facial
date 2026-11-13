import { describe, expect, it } from "vitest";
import { commentSchema, dueBucket, taskSchema, todayInSaoPaulo } from "@/features/crm/tasks";

describe("prazo das tarefas", () => {
  it.each([
    ["2026-11-12", "overdue"],
    ["2026-11-13", "today"],
    ["2026-12-01", "upcoming"],
    [null, "none"],
  ] as const)("%s -> %s", (due, bucket) => expect(dueBucket(due, "2026-11-13")).toBe(bucket));
  it("o dia é o de São Paulo, não o UTC", () => {
    // 02:00 UTC de 14/11 ainda é 23:00 de 13/11 em São Paulo
    expect(todayInSaoPaulo(new Date("2026-11-14T02:00:00Z"))).toBe("2026-11-13");
  });
});

describe("formulário da tarefa", () => {
  it("aceita o mínimo e converte vazios em null", () => {
    const r = taskSchema.safeParse({ title: " Ligar ", description: "", due_date: "", priority: "normal", recurrence: "", deal_id: "" });
    expect(r.success && r.data).toMatchObject({ title: "Ligar", description: null, due_date: null, recurrence: null, deal_id: null });
  });
  it("recusa prioridade e recorrência fora da lista", () => {
    expect(taskSchema.safeParse({ title: "X", priority: "maxima" }).success).toBe(false);
    expect(taskSchema.safeParse({ title: "X", priority: "normal", recurrence: "yearly" }).success).toBe(false);
  });
  it("recusa id adulterado", () => {
    expect(taskSchema.safeParse({ title: "X", priority: "normal", owner_id: "'; drop table tasks;--" }).success).toBe(false);
  });
  it("comentário vazio ou enorme é recusado", () => {
    expect(commentSchema.safeParse("   ").success).toBe(false);
    expect(commentSchema.safeParse("a".repeat(2001)).success).toBe(false);
  });
});
