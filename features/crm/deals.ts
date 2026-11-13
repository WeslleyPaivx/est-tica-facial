import { z } from "zod";

// Oportunidades (leads e negócios): validação do formulário e do dinheiro. O banco revalida tudo (checks e RLS).

export const DEAL_SOURCES = ["Indicação", "Site", "Instagram", "WhatsApp", "Google", "Evento", "Ligação", "Outro"] as const;
export const DEAL_STATUS_LABEL = { open: "Aberta", won: "Ganha", lost: "Perdida" } as const;
export type DealStatus = keyof typeof DEAL_STATUS_LABEL;

// "1.234,56", "1234,5", "R$ 1.234" ou "1234.56" -> centavos; vazio -> null; inválido -> NaN (o schema recusa)
export function parseMoneyToCents(raw: unknown): number | null {
  if (raw == null) return null;
  const s = String(raw).replace(/R\$|\s/g, "").trim();
  if (s === "") return null;
  if (!/^\d{1,3}(\.\d{3})*(,\d{1,2})?$|^\d+(,\d{1,2})?$|^\d+(\.\d{1,2})?$/.test(s)) return Number.NaN;
  const normalized = s.includes(",") ? s.replace(/\./g, "").replace(",", ".") : /\.\d{3}$/.test(s) ? s.replace(/\./g, "") : s;
  return Math.round(Number(normalized) * 100);
}

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
export const formatCents = (cents: number | null) => (cents == null ? "" : brl.format(cents / 100));
export const centsToInput = (cents: number | null) =>
  cents == null ? "" : (cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const optionalText = (max: number) =>
  z.preprocess((v) => (typeof v === "string" && v.trim() !== "" ? v.trim() : null), z.string().max(max).nullable());
const optionalUuid = z.preprocess((v) => (typeof v === "string" && v !== "" ? v : null), z.uuid().nullable());

export const dealSchema = z.object({
  title: z.string().trim().min(1, "Informe o título.").max(200, "Título muito longo."),
  value_cents: z.preprocess(
    parseMoneyToCents,
    z.number({ message: "Valor inválido. Use o formato 1.234,56." }).int().min(0).max(100_000_000_000).nullable(),
  ),
  source: optionalText(60),
  stage_id: z.uuid({ message: "Escolha a etapa." }),
  contact_id: optionalUuid,
  company_id: optionalUuid,
  owner_id: optionalUuid,
  next_action: optionalText(200),
  next_action_at: z.preprocess(
    (v) => (typeof v === "string" && v !== "" ? v : null),
    z.iso.date({ message: "Data inválida." }).nullable(),
  ),
});

export const closeDealSchema = z.discriminatedUnion("status", [
  z.object({ status: z.literal("won") }),
  z.object({ status: z.literal("lost"), lost_reason: z.string().trim().min(1, "Informe o motivo da perda.").max(500) }),
  z.object({ status: z.literal("open") }),
]);
