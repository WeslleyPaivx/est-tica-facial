import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { PageHeader } from "@/design-system/components/layout";
import { EmptyState } from "@/design-system/components/feedback";
import { buttonClass } from "@/design-system/components/button";
import { cx } from "@/design-system/components/cx";
import { SearchForm } from "@/components/crm/list-controls";
import { TaskList } from "@/components/tasks/task-list";
import { can, requireOrgSession } from "@/server/session";
import { loadTasks } from "@/server/tasks";
import { sanitizeSearch } from "@/features/crm/schemas";
import { BUCKET_LABEL, dueBucket, type DueBucket } from "@/features/crm/tasks";

export const metadata: Metadata = { title: "Tarefas" };

const BUCKETS: DueBucket[] = ["overdue", "today", "upcoming", "none"];

export default async function TasksPage({ searchParams }: { searchParams: Promise<{ done?: string; all?: string; q?: string }> }) {
  const s = await requireOrgSession();
  if (!can(s, "tasks.read")) redirect("/");
  const sp = await searchParams;
  const done = sp.done === "1";
  const mine = sp.all !== "1";
  const q = sanitizeSearch(sp.q);
  const { tasks, failed, today } = await loadTasks(s, { done, mine, q });
  const canWrite = can(s, "tasks.write");
  const href = (o: { done?: boolean; mine?: boolean }) => {
    const p = new URLSearchParams();
    if (o.done ?? done) p.set("done", "1");
    if (!(o.mine ?? mine)) p.set("all", "1");
    if (q) p.set("q", q);
    const qs = p.toString();
    return qs ? `/tasks?${qs}` : "/tasks";
  };
  const groups = BUCKETS.map((b) => ({ b, items: tasks.filter((t) => dueBucket(t.due_date, today) === b) })).filter((g) => g.items.length);
  const overdue = tasks.filter((t) => dueBucket(t.due_date, today) === "overdue").length;
  const forToday = tasks.filter((t) => dueBucket(t.due_date, today) === "today").length;
  const pill = (active: boolean) => cx("rounded-full px-3 py-1 text-sm", active ? "bg-ink text-ink-fg" : "text-muted hover:text-fg");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Tarefas"
        description={!done && (overdue || forToday) ? `${overdue} atrasada${overdue === 1 ? "" : "s"} · ${forToday} para hoje` : "O que precisa ser feito, por quem e até quando."}
        actions={canWrite ? <Link href="/tasks/new" className={buttonClass("primary")}><Plus aria-hidden className="size-4" />Nova tarefa</Link> : null}
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <nav aria-label="Situação" className="inline-flex rounded-full border border-border p-0.5">
            <Link href={href({ done: false })} aria-current={!done ? "page" : undefined} className={pill(!done)}>Abertas</Link>
            <Link href={href({ done: true })} aria-current={done ? "page" : undefined} className={pill(done)}>Concluídas</Link>
          </nav>
          <nav aria-label="Responsável" className="inline-flex rounded-full border border-border p-0.5">
            <Link href={href({ mine: true })} aria-current={mine ? "page" : undefined} className={pill(mine)}>Minhas</Link>
            <Link href={href({ mine: false })} aria-current={!mine ? "page" : undefined} className={pill(!mine)}>Todas</Link>
          </nav>
        </div>
        <SearchForm q={q} placeholder="Buscar pelo título" />
      </div>

      {failed ? (
        <EmptyState title="Não foi possível carregar as tarefas." description="Tente novamente em instantes." />
      ) : tasks.length === 0 ? (
        <EmptyState
          title={q ? "Nenhuma tarefa encontrada." : done ? "Nenhuma tarefa concluída." : mine ? "Você não tem tarefas abertas." : "Nenhuma tarefa aberta."}
          action={canWrite && !done ? <Link href="/tasks/new" className={buttonClass("primary", "sm")}>Nova tarefa</Link> : undefined}
        />
      ) : done ? (
        <TaskList tasks={tasks} today={today} canWrite={canWrite} />
      ) : (
        groups.map((g) => (
          <section key={g.b} aria-labelledby={`grupo-${g.b}`} className="flex flex-col gap-2">
            <h2 id={`grupo-${g.b}`} className={cx("text-sm", g.b === "overdue" ? "text-danger" : "text-muted")}>
              {BUCKET_LABEL[g.b]} <span className="tabular">· {g.items.length}</span>
            </h2>
            <TaskList tasks={g.items} today={today} canWrite={canWrite} />
          </section>
        ))
      )}
    </div>
  );
}
