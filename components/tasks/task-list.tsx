import Link from "next/link";
import { CalendarClock, ListChecks, Repeat, User } from "lucide-react";
import { cx } from "@/design-system/components/cx";
import { ToggleTask } from "@/components/tasks/task-forms";
import { dueBucket, PRIORITY_LABEL } from "@/features/crm/tasks";
import type { TaskItem } from "@/server/tasks";

const dateFmt = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", timeZone: "UTC" });

export function TaskList({ tasks, today, canWrite }: { tasks: TaskItem[]; today: string; canWrite: boolean }) {
  return (
    <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
      {tasks.map((t) => {
        const overdue = !t.completed_at && dueBucket(t.due_date, today) === "overdue";
        return (
          <li key={t.id} className="flex items-start gap-3 px-4 py-3">
            {canWrite ? <div className="pt-0.5"><ToggleTask id={t.id} done={Boolean(t.completed_at)} title={t.title} /></div> : null}
            <div className="min-w-0 flex-1">
              <Link href={`/tasks/${t.id}`} className={cx("text-sm hover:underline", t.completed_at && "text-muted line-through")}>{t.title}</Link>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                {t.priority === "high" || t.priority === "urgent" ? (
                  <span className={cx("rounded-full px-2 py-0.5", t.priority === "urgent" ? "bg-danger-bg text-danger" : "bg-warning-bg text-warning")}>{PRIORITY_LABEL[t.priority]}</span>
                ) : null}
                {t.due_date ? (
                  <span className={cx("flex items-center gap-1", overdue && "text-danger")}>
                    <CalendarClock aria-hidden className="size-3" strokeWidth={1.5} />{dateFmt.format(new Date(`${t.due_date}T12:00:00Z`))}
                  </span>
                ) : null}
                {t.owner ? <span className="flex items-center gap-1"><User aria-hidden className="size-3" strokeWidth={1.5} />{t.owner}</span> : null}
                {t.checklist.total ? <span className="flex items-center gap-1 tabular"><ListChecks aria-hidden className="size-3" strokeWidth={1.5} />{t.checklist.done}/{t.checklist.total}</span> : null}
                {t.recurrence ? <span className="flex items-center gap-1"><Repeat aria-hidden className="size-3" strokeWidth={1.5} />Recorrente</span> : null}
                {t.link ? <span className="truncate">{t.link}</span> : null}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
