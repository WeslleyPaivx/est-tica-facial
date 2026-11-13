import "server-only";
import { can, type OrgSession } from "@/server/session";
import { nameMaps } from "@/server/crm";
import { todayInSaoPaulo, type TaskPriority } from "@/features/crm/tasks";

// Leitura das tarefas sob RLS, sempre filtrada pela organização ativa. DTOs só com o que as telas mostram.

type TaskRow = {
  id: string; title: string; due_date: string | null; priority: TaskPriority; owner_id: string | null; recurrence: string | null;
  completed_at: string | null; contact_id: string | null; company_id: string | null; deal_id: string | null;
};
export type TaskItem = Omit<TaskRow, "owner_id" | "contact_id" | "company_id" | "deal_id"> & {
  owner: string | null; link: string | null; checklist: { done: number; total: number };
};

const uniq = (xs: (string | null)[]) => [...new Set(xs.filter((v): v is string => Boolean(v)))];

// shortcut: até 300 tarefas por consulta; paginar quando passar disso
export async function loadTasks(s: OrgSession, opts: { done: boolean; mine: boolean; q: string }) {
  const orgId = s.active.organization_id;
  let query = s.supabase
    .from("tasks")
    .select("id, title, due_date, priority, owner_id, recurrence, completed_at, contact_id, company_id, deal_id")
    .eq("organization_id", orgId)
    .limit(300);
  query = opts.done
    ? query.not("completed_at", "is", null).order("completed_at", { ascending: false })
    : query.is("completed_at", null).order("due_date", { ascending: true, nullsFirst: false }).order("created_at");
  if (opts.mine) query = query.eq("owner_id", s.user.id);
  if (opts.q) query = query.ilike("title", `%${opts.q}%`);
  const { data, error } = await query;
  const rows = (data ?? []) as TaskRow[];
  const ids = rows.map((r) => r.id);
  const dealIds = uniq(rows.map((r) => r.deal_id));
  const contactIds = uniq(rows.map((r) => r.contact_id));
  const [names, { data: items }, { data: deals }, { data: contacts }] = await Promise.all([
    nameMaps(s, uniq(rows.map((r) => r.company_id)), uniq(rows.map((r) => r.owner_id))),
    ids.length ? s.supabase.from("task_checklist_items").select("task_id, done").eq("organization_id", orgId).in("task_id", ids) : Promise.resolve({ data: [] }),
    dealIds.length && can(s, "deals.read") ? s.supabase.from("deals").select("id, title").in("id", dealIds) : Promise.resolve({ data: [] }),
    contactIds.length ? s.supabase.from("contacts").select("id, full_name").in("id", contactIds) : Promise.resolve({ data: [] }),
  ]);
  const deal = new Map((deals ?? []).map((d: { id: string; title: string }) => [d.id, d.title]));
  const contact = new Map((contacts ?? []).map((c: { id: string; full_name: string }) => [c.id, c.full_name]));
  const checklist = new Map<string, { done: number; total: number }>();
  for (const it of (items ?? []) as { task_id: string; done: boolean }[]) {
    const c = checklist.get(it.task_id) ?? { done: 0, total: 0 };
    c.total += 1;
    if (it.done) c.done += 1;
    checklist.set(it.task_id, c);
  }
  const tasks: TaskItem[] = rows.map(({ owner_id, contact_id, company_id, deal_id, ...r }) => ({
    ...r,
    owner: owner_id ? names.owner.get(owner_id) || "Sem nome" : null,
    link: (deal_id && deal.get(deal_id)) || (contact_id && contact.get(contact_id)) || (company_id && names.company.get(company_id)) || null,
    checklist: checklist.get(r.id) ?? { done: 0, total: 0 },
  }));
  return { tasks, failed: Boolean(error), today: todayInSaoPaulo() };
}

export async function loadTask(s: OrgSession, id: string) {
  const orgId = s.active.organization_id;
  const { data } = await s.supabase
    .from("tasks")
    .select("id, title, description, due_date, priority, owner_id, contact_id, company_id, deal_id, recurrence, completed_at, completed_by, created_at")
    .eq("id", id).eq("organization_id", orgId).maybeSingle();
  if (!data) return null;
  const [{ data: checklist }, { data: comments }] = await Promise.all([
    s.supabase.from("task_checklist_items").select("id, label, done, position").eq("task_id", id).eq("organization_id", orgId).order("position").order("created_at"),
    s.supabase.from("task_comments").select("id, body, author_id, created_at").eq("task_id", id).eq("organization_id", orgId).order("created_at"),
  ]);
  const people = uniq([...((comments ?? []) as { author_id: string }[]).map((c) => c.author_id), data.completed_by]);
  const names = await nameMaps(s, [], people);
  return {
    task: data as {
      id: string; title: string; description: string | null; due_date: string | null; priority: TaskPriority; owner_id: string | null;
      contact_id: string | null; company_id: string | null; deal_id: string | null; recurrence: string | null; completed_at: string | null;
      completed_by: string | null; created_at: string;
    },
    completedBy: data.completed_by ? names.owner.get(data.completed_by) || "Sem nome" : null,
    checklist: (checklist ?? []) as { id: string; label: string; done: boolean; position: number }[],
    comments: ((comments ?? []) as { id: string; body: string; author_id: string; created_at: string }[]).map((c) => ({
      id: c.id, body: c.body, created_at: c.created_at, author: names.owner.get(c.author_id) || "Sem nome", mine: c.author_id === s.user.id,
    })),
  };
}

// aviso do menu: minhas tarefas abertas atrasadas ou para hoje
export async function myDueTaskCount(s: OrgSession): Promise<number> {
  if (!can(s, "tasks.read")) return 0;
  const { count } = await s.supabase
    .from("tasks").select("id", { count: "exact", head: true })
    .eq("organization_id", s.active.organization_id).eq("owner_id", s.user.id).is("completed_at", null)
    .lte("due_date", todayInSaoPaulo());
  return count ?? 0;
}
