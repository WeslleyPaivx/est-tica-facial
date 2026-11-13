import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PageHeader, Section } from "@/design-system/components/layout";
import { Checklist, Comments, DeleteTask, TaskForm, ToggleTask } from "@/components/tasks/task-forms";
import { can, requireOrgSession } from "@/server/session";
import { loadTask } from "@/server/tasks";
import { taskFormOptions } from "@/server/task-options";
import { idSchema } from "@/features/organizations/schemas";
import { RECURRENCE_LABEL } from "@/features/crm/tasks";

export const metadata: Metadata = { title: "Tarefa" };

const fmt = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" });

export default async function TaskPage({ params }: { params: Promise<{ id: string }> }) {
  const s = await requireOrgSession();
  if (!can(s, "tasks.read")) redirect("/");
  const id = idSchema.safeParse((await params).id);
  if (!id.success) notFound();
  const [found, o] = await Promise.all([loadTask(s, id.data), taskFormOptions(s)]);
  if (!found) notFound(); // id de outra organização ou inexistente: mesma resposta
  const { task, checklist, comments, completedBy } = found;
  const canWrite = can(s, "tasks.write");
  // a oportunidade vinculada pode estar fechada (fora da lista de abertas): mantém no select
  const deals = task.deal_id && !o.deals.some((d) => d.id === task.deal_id) ? [...o.deals, { id: task.deal_id, label: "Oportunidade fechada" }] : o.deals;
  const recurrence = task.recurrence ? RECURRENCE_LABEL[task.recurrence as keyof typeof RECURRENCE_LABEL] : null;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={task.title}
        description={[recurrence ? `Repete: ${recurrence.toLowerCase()}` : null, task.completed_at && completedBy ? `Concluída por ${completedBy} em ${fmt.format(new Date(task.completed_at))}` : null].filter(Boolean).join(" · ") || undefined}
      />
      {canWrite ? <ToggleTask id={task.id} done={Boolean(task.completed_at)} title={task.title} size="md" showStatus /> : null}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <TaskForm values={task} owners={o.owners} contacts={o.contacts} companies={o.companies} deals={deals} readOnly={!canWrite} />
        <div className="flex flex-col gap-6">
          <Section title="Checklist"><Checklist taskId={task.id} items={checklist} canWrite={canWrite} /></Section>
          <Section title="Comentários"><Comments taskId={task.id} comments={comments} canWrite={canWrite} /></Section>
          {can(s, "tasks.delete") ? <Section title="Excluir"><DeleteTask id={task.id} title={task.title} /></Section> : null}
        </div>
      </div>
    </div>
  );
}
