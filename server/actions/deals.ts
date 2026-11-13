"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireOrgSession } from "@/server/session";
import { defaultPipeline } from "@/server/deals";
import { safeDbMessage } from "@/lib/security/errors";
import { closeDealSchema, dealSchema } from "@/features/crm/deals";
import { idSchema } from "@/features/organizations/schemas";
import type { ActionState } from "@/types/domain";

// organization_id e pipeline vêm do servidor (membership ativa + funil padrão); RLS decide a permissão; toda escrita
// filtra por id E organização e exige linha afetada.

const FIELDS = ["title", "value_cents", "source", "stage_id", "contact_id", "company_id", "owner_id", "next_action", "next_action_at"] as const;

export async function saveDealAction(_: ActionState, form: FormData): Promise<ActionState> {
  const parsed = dealSchema.safeParse(Object.fromEntries(FIELDS.map((k) => [k, form.get(k)])));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const s = await requireOrgSession();
  const orgId = s.active.organization_id;
  const rawId = form.get("id");
  const id = rawId ? idSchema.safeParse(rawId) : null;
  if (id && !id.success) return { error: "Registro inválido." };

  let res;
  if (id) {
    res = await s.supabase.from("deals").update(parsed.data).eq("id", id.data).eq("organization_id", orgId).select("id");
  } else {
    const requestId = idSchema.safeParse(form.get("request_id"));
    if (!requestId.success) return { error: "Formulário expirado. Recarregue a página." };
    const pipeline = await defaultPipeline(s);
    if (!pipeline) return { error: "Funil não encontrado." };
    res = await s.supabase
      .from("deals")
      .insert({ ...parsed.data, organization_id: orgId, pipeline_id: pipeline.id, request_id: requestId.data })
      .select("id");
  }
  const repeated = res.error?.code === "23505" && /_request_uniq/.test(res.error.message ?? "");
  if (!repeated && (res.error || !res.data?.length)) return { error: safeDbMessage(res.error ?? { code: "42501" }) };
  revalidatePath("/deals");
  redirect(id ? `/deals/${id.data}` : "/deals");
}

// Arrastar no quadro: só troca a etapa. Retorna o resultado para o quadro desfazer a mudança otimista se falhar.
export async function moveDealAction(dealId: string, stageId: string): Promise<ActionState> {
  const ids = idSchema.safeParse(dealId);
  const stage = idSchema.safeParse(stageId);
  if (!ids.success || !stage.success) return { error: "Registro inválido." };
  const s = await requireOrgSession();
  const { data, error } = await s.supabase
    .from("deals").update({ stage_id: stage.data })
    .eq("id", ids.data).eq("organization_id", s.active.organization_id).eq("status", "open").select("id");
  if (error || !data?.length) return { error: safeDbMessage(error ?? { code: "42501" }, "Não foi possível mover a oportunidade.") };
  revalidatePath("/deals");
  return { ok: true };
}

export async function closeDealAction(_: ActionState, form: FormData): Promise<ActionState> {
  const id = idSchema.safeParse(form.get("id"));
  if (!id.success) return { error: "Registro inválido." };
  const parsed = closeDealSchema.safeParse({ status: form.get("status"), lost_reason: form.get("lost_reason") ?? undefined });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const s = await requireOrgSession();
  const { data, error } = await s.supabase
    .from("deals").update(parsed.data).eq("id", id.data).eq("organization_id", s.active.organization_id).select("id");
  if (error || !data?.length) return { error: safeDbMessage(error ?? { code: "42501" }) };
  revalidatePath("/deals");
  revalidatePath(`/deals/${id.data}`);
  return { ok: true, message: parsed.data.status === "won" ? "Marcada como ganha." : parsed.data.status === "lost" ? "Marcada como perdida." : "Reaberta." };
}

export async function deleteDealAction(_: ActionState, form: FormData): Promise<ActionState> {
  const id = idSchema.safeParse(form.get("id"));
  if (!id.success) return { error: "Registro inválido." };
  const s = await requireOrgSession();
  const { data, error } = await s.supabase.from("deals").delete().eq("id", id.data).eq("organization_id", s.active.organization_id).select("id");
  if (error || !data?.length) return { error: safeDbMessage(error ?? { code: "42501" }) };
  revalidatePath("/deals");
  redirect("/deals");
}
