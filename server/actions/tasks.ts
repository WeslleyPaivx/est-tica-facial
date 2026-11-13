"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireOrgSession } from "@/server/session";
import { safeDbMessage } from "@/lib/security/errors";
import { checklistLabelSchema, commentSchema, taskSchema } from "@/features/crm/tasks";
import { idSchema } from "@/features/organizations/schemas";
import type { ActionState } from "@/types/domain";

// organization_id vem da membership ativa; RLS decide a permissão; toda escrita filtra por id E organização e exige
// linha afetada. Quem concluiu e quando é definido pelo banco.

const FIELDS = ["title", "description", "due_date", "priority", "owner_id", "contact_id", "company_id", "deal_id", "recurrence"] as const;
const fail = (error: { code?: string; message?: string } | null) => ({ error: safeDbMessage(error ?? { code: "42501" }) });
function touched(taskId?: string) {
  revalidatePath("/tasks");
  revalidatePath("/", "layout"); // contador de tarefas no menu
  if (taskId) revalidatePath(`/tasks/${taskId}`);
}

export async function saveTaskAction(_: ActionState, form: FormData): Promise<ActionState> {
  const parsed = taskSchema.safeParse(Object.fromEntries(FIELDS.map((k) => [k, form.get(k)])));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const s = await requireOrgSession();
  const orgId = s.active.organization_id;
  const rawId = form.get("id");
  const id = rawId ? idSchema.safeParse(rawId) : null;
  if (id && !id.success) return { error: "Registro inválido." };
  let res;
  if (id) {
    res = await s.supabase.from("tasks").update(parsed.data).eq("id", id.data).eq("organization_id", orgId).select("id");
  } else {
    const requestId = idSchema.safeParse(form.get("request_id"));
    if (!requestId.success) return { error: "Formulário expirado. Recarregue a página." };
    res = await s.supabase.from("tasks").insert({ ...parsed.data, organization_id: orgId, request_id: requestId.data }).select("id");
  }
  const repeated = res.error?.code === "23505" && /_request_uniq/.test(res.error.message ?? "");
  if (!repeated && (res.error || !res.data?.length)) return fail(res.error);
  touched(id?.data);
  redirect(id ? `/tasks/${id.data}` : "/tasks");
}

// concluir/reabrir (usado na lista e na página da tarefa)
export async function toggleTaskAction(_: ActionState, form: FormData): Promise<ActionState> {
  const id = idSchema.safeParse(form.get("id"));
  if (!id.success) return { error: "Registro inválido." };
  const done = form.get("done") === "1";
  const s = await requireOrgSession();
  const { data, error } = await s.supabase
    .from("tasks").update({ completed_at: done ? new Date().toISOString() : null })
    .eq("id", id.data).eq("organization_id", s.active.organization_id).select("id, recurrence");
  if (error || !data?.length) return fail(error);
  touched(id.data);
  const recurrent = done && (data[0] as { recurrence: string | null }).recurrence;
  return { ok: true, message: done ? (recurrent ? "Concluída. A próxima ocorrência já foi criada." : "Concluída.") : "Reaberta." };
}

export async function deleteTaskAction(_: ActionState, form: FormData): Promise<ActionState> {
  const id = idSchema.safeParse(form.get("id"));
  if (!id.success) return { error: "Registro inválido." };
  const s = await requireOrgSession();
  const { data, error } = await s.supabase.from("tasks").delete().eq("id", id.data).eq("organization_id", s.active.organization_id).select("id");
  if (error || !data?.length) return fail(error);
  touched();
  redirect("/tasks");
}

export async function addChecklistItemAction(_: ActionState, form: FormData): Promise<ActionState> {
  const taskId = idSchema.safeParse(form.get("task_id"));
  const label = checklistLabelSchema.safeParse(form.get("label"));
  if (!taskId.success) return { error: "Registro inválido." };
  if (!label.success) return { error: label.error.issues[0]?.message };
  const s = await requireOrgSession();
  const orgId = s.active.organization_id;
  const { count } = await s.supabase.from("task_checklist_items").select("id", { count: "exact", head: true }).eq("task_id", taskId.data).eq("organization_id", orgId);
  if ((count ?? 0) >= 100) return { error: "Limite de 100 itens por tarefa." };
  const { data, error } = await s.supabase
    .from("task_checklist_items").insert({ organization_id: orgId, task_id: taskId.data, label: label.data, position: Math.min(count ?? 0, 999) }).select("id");
  if (error || !data?.length) return fail(error);
  touched(taskId.data);
  return { ok: true };
}

export async function toggleChecklistItemAction(_: ActionState, form: FormData): Promise<ActionState> {
  const id = idSchema.safeParse(form.get("id"));
  const taskId = idSchema.safeParse(form.get("task_id"));
  if (!id.success || !taskId.success) return { error: "Registro inválido." };
  const s = await requireOrgSession();
  const { data, error } = await s.supabase
    .from("task_checklist_items").update({ done: form.get("done") === "1" })
    .eq("id", id.data).eq("task_id", taskId.data).eq("organization_id", s.active.organization_id).select("id");
  if (error || !data?.length) return fail(error);
  touched(taskId.data);
  return { ok: true };
}

export async function deleteChecklistItemAction(_: ActionState, form: FormData): Promise<ActionState> {
  const id = idSchema.safeParse(form.get("id"));
  const taskId = idSchema.safeParse(form.get("task_id"));
  if (!id.success || !taskId.success) return { error: "Registro inválido." };
  const s = await requireOrgSession();
  const { data, error } = await s.supabase
    .from("task_checklist_items").delete().eq("id", id.data).eq("task_id", taskId.data).eq("organization_id", s.active.organization_id).select("id");
  if (error || !data?.length) return fail(error);
  touched(taskId.data);
  return { ok: true };
}

export async function addCommentAction(_: ActionState, form: FormData): Promise<ActionState> {
  const taskId = idSchema.safeParse(form.get("task_id"));
  const body = commentSchema.safeParse(form.get("body"));
  if (!taskId.success) return { error: "Registro inválido." };
  if (!body.success) return { error: body.error.issues[0]?.message };
  const s = await requireOrgSession();
  const { data, error } = await s.supabase
    .from("task_comments").insert({ organization_id: s.active.organization_id, task_id: taskId.data, body: body.data }).select("id");
  if (error || !data?.length) return fail(error);
  touched(taskId.data);
  return { ok: true };
}

export async function deleteCommentAction(_: ActionState, form: FormData): Promise<ActionState> {
  const id = idSchema.safeParse(form.get("id"));
  const taskId = idSchema.safeParse(form.get("task_id"));
  if (!id.success || !taskId.success) return { error: "Registro inválido." };
  const s = await requireOrgSession();
  const { data, error } = await s.supabase
    .from("task_comments").delete().eq("id", id.data).eq("task_id", taskId.data).eq("organization_id", s.active.organization_id).select("id");
  if (error || !data?.length) return fail(error);
  touched(taskId.data);
  return { ok: true };
}
