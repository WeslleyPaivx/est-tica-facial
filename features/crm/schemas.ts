import { z } from "zod";

// Campos opcionais de formulário: ausente ou vazio vira null.
const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess((v) => {
    if (v == null) return null;
    if (typeof v !== "string") return v;
    return v.trim() === "" ? null : v.trim();
  }, schema.nullable());

const email = optional(z.email({ message: "E-mail inválido." }).max(254));
const phone = optional(z.string().regex(/^[0-9+() -]{6,30}$/, "Telefone inválido."));
const notes = optional(z.string().max(5000, "Notas muito longas."));
const uuid = optional(z.uuid());

export const companySchema = z.object({
  name: z.string().trim().min(1, "Informe o nome.").max(200),
  email,
  phone,
  website: optional(z.string().max(200).regex(/^https?:\/\/\S+$/i, "Use um endereço começando com http:// ou https://.")),
  notes,
});

export const contactSchema = z.object({
  full_name: z.string().trim().min(1, "Informe o nome.").max(200),
  email,
  phone,
  company_id: uuid,
  owner_id: uuid,
  notes,
});

export const PAGE_SIZE = 25;

// Remove caracteres com significado na sintaxe de filtros do PostgREST (or/ilike) antes de interpolar.
export function sanitizeSearch(q: unknown): string {
  return typeof q === "string" ? q.replace(/[,()*%\\:."']/g, " ").replace(/\s+/g, " ").trim().slice(0, 80) : "";
}

export function parsePage(p: unknown): number {
  const n = Number(p);
  return Number.isInteger(n) && n >= 1 && n <= 10_000 ? n : 1;
}
