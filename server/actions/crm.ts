"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireOrgSession } from "@/server/session";
import { safeDbMessage } from "@/lib/security/errors";
import { companySchema, contactSchema } from "@/features/crm/schemas";
import { idSchema } from "@/features/organizations/schemas";
import type { ActionState } from "@/types/domain";

type Entity = "companies" | "contacts";
const PATH: Record<Entity, string> = { companies: "/companies", contacts: "/contacts" };

function fields(form: FormData, keys: readonly string[]) {
  return Object.fromEntries(keys.map((k) => [k, form.get(k)]));
}

// Cria ou atualiza. organization_id vem da membership ativa (servidor); RLS decide a permissão.
// Na criação, request_id (único por organização no banco) faz o reenvio do mesmo formulário virar no-op.
async function save(entity: Entity, data: Record<string, unknown>, form: FormData): Promise<ActionState> {
  const s = await requireOrgSession();
  const orgId = s.active.organization_id;
  const rawId = form.get("id");
  const id = rawId ? idSchema.safeParse(rawId) : null;
  if (id && !id.success) return { error: "Registro inválido." };
  const requestId = id ? null : idSchema.safeParse(form.get("request_id"));
  if (requestId && !requestId.success) return { error: "Formulário expirado. Recarregue a página." };

  const { data: rows, error } = id
    ? await s.supabase.from(entity).update(data).eq("id", id.data).eq("organization_id", orgId).select("id")
    : await s.supabase.from(entity).insert({ ...data, organization_id: orgId, request_id: requestId?.data }).select("id");
  const repeated = error?.code === "23505" && /_request_uniq/.test(error.message ?? "");
  if (!repeated && (error || !rows?.length)) return { error: safeDbMessage(error ?? { code: "42501" }) };

  revalidatePath(PATH[entity]);
  redirect(PATH[entity]);
}

async function remove(entity: Entity, rawId: FormDataEntryValue | null): Promise<ActionState> {
  const s = await requireOrgSession();
  const id = idSchema.safeParse(rawId);
  if (!id.success) return { error: "Registro inválido." };
  const { data: rows, error } = await s.supabase
    .from(entity)
    .delete()
    .eq("id", id.data)
    .eq("organization_id", s.active.organization_id)
    .select("id");
  if (error || !rows?.length) return { error: safeDbMessage(error ?? { code: "42501" }) };
  revalidatePath(PATH[entity]);
  redirect(PATH[entity]);
}

export async function saveCompanyAction(_: ActionState, form: FormData): Promise<ActionState> {
  const parsed = companySchema.safeParse(fields(form, ["name", "email", "phone", "website", "notes"]));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  return save("companies", parsed.data, form);
}

export async function deleteCompanyAction(_: ActionState, form: FormData): Promise<ActionState> {
  return remove("companies", form.get("id"));
}

export async function saveContactAction(_: ActionState, form: FormData): Promise<ActionState> {
  const parsed = contactSchema.safeParse(fields(form, ["full_name", "email", "phone", "company_id", "owner_id", "notes"]));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  return save("contacts", parsed.data, form);
}

export async function deleteContactAction(_: ActionState, form: FormData): Promise<ActionState> {
  return remove("contacts", form.get("id"));
}
