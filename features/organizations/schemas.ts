import { z } from "zod";
import { ROLES } from "@/lib/security/permissions";

export const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,46}[a-z0-9]$/;

export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
    .replace(/-+$/g, "");
}

export const orgNameSchema = z.string().trim().min(2, "Nome muito curto.").max(120, "Nome muito longo.");

export const createOrgSchema = z.object({
  name: orgNameSchema,
  slug: z.string().trim().toLowerCase().regex(SLUG_RE, "Use 3–48 letras minúsculas, números ou hífens."),
});

export const inviteSchema = z.object({
  email: z.string().trim().toLowerCase().max(254).pipe(z.email({ message: "E-mail inválido." })),
  role: z.enum(ROLES).refine((r) => r !== "owner", "Convites não concedem propriedade."),
});

export const idSchema = z.uuid();
export const memberRoleSchema = z.object({ memberId: idSchema, role: z.enum(ROLES) });
