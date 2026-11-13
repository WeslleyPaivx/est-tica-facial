import { randomUUID } from "node:crypto";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/design-system/components/layout";
import { TaskForm } from "@/components/tasks/task-forms";
import { can, requireOrgSession } from "@/server/session";
import { taskFormOptions } from "@/server/task-options";
import { idSchema } from "@/features/organizations/schemas";

export const metadata: Metadata = { title: "Nova tarefa" };

// ?deal=, ?contact= ou ?company= já preenchem o vínculo (vindo da página da oportunidade, por exemplo)
export default async function NewTaskPage({ searchParams }: { searchParams: Promise<{ deal?: string; contact?: string; company?: string }> }) {
  const s = await requireOrgSession();
  if (!can(s, "tasks.write")) redirect("/tasks");
  const sp = await searchParams;
  const pre = (v?: string) => (idSchema.safeParse(v).success ? (v as string) : null);
  const o = await taskFormOptions(s);
  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Nova tarefa" />
      <TaskForm
        values={{ request_id: randomUUID(), title: "", description: null, due_date: null, priority: "normal", owner_id: s.user.id,
          contact_id: pre(sp.contact), company_id: pre(sp.company), deal_id: pre(sp.deal), recurrence: null }}
        owners={o.owners} contacts={o.contacts} companies={o.companies} deals={o.deals} readOnly={false}
      />
    </div>
  );
}
