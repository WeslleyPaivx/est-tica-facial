import { z } from "zod";

// Tarefas: validação dos formulários e agrupamento por prazo. O banco revalida tudo (checks, FKs e RLS).

export const TASK_PRIORITIES = ["low", "normal", "high", "urgent"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];
export const PRIORITY_LABEL: Record<TaskPriority, string> = { low: "Baixa", normal: "Normal", high: "Alta", urgent: "Urgente" };

export const TASK_RECURRENCES = ["daily", "weekly", "monthly"] as const;
export const RECURRENCE_LABEL: Record<(typeof TASK_RECURRENCES)[number], string> = { daily: "Todo dia", weekly: "Toda semana", monthly: "Todo mês" };

const blankToNull = (v: unknown) => (typeof v === "string" && v.trim() !== "" ? v.trim() : null);
const optionalUuid = z.preprocess(blankToNull, z.uuid().nullable());

export const taskSchema = z.object({
  title: z.string().trim().min(1, "Informe o título.").max(200, "Título muito longo."),
  description: z.preprocess(blankToNull, z.string().max(5000, "Descrição muito longa.").nullable()),
  due_date: z.preprocess(blankToNull, z.iso.date({ message: "Data inválida." }).nullable()),
  priority: z.enum(TASK_PRIORITIES, { message: "Prioridade inválida." }),
  owner_id: optionalUuid,
  contact_id: optionalUuid,
  company_id: optionalUuid,
  deal_id: optionalUuid,
  recurrence: z.preprocess(blankToNull, z.enum(TASK_RECURRENCES, { message: "Recorrência inválida." }).nullable()),
});

export const checklistLabelSchema = z.string().trim().min(1, "Escreva o item.").max(200, "Item muito longo.");
export const commentSchema = z.string().trim().min(1, "Escreva o comentário.").max(2000, "Comentário muito longo.");

export type DueBucket = "overdue" | "today" | "upcoming" | "none";
export const BUCKET_LABEL: Record<DueBucket, string> = { overdue: "Atrasadas", today: "Para hoje", upcoming: "Próximas", none: "Sem prazo" };

// today no formato AAAA-MM-DD (dia de São Paulo); comparação de texto funciona para datas ISO
export function dueBucket(due: string | null, today: string): DueBucket {
  if (!due) return "none";
  return due < today ? "overdue" : due === today ? "today" : "upcoming";
}

export function todayInSaoPaulo(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(now);
}
