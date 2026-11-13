"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { Check, Circle, Trash2 } from "lucide-react";
import { Button, buttonClass } from "@/design-system/components/button";
import { Field, Input, Select, Textarea } from "@/design-system/components/field";
import { FormStatus } from "@/design-system/components/feedback";
import { cx } from "@/design-system/components/cx";
import { PRIORITY_LABEL, RECURRENCE_LABEL, TASK_PRIORITIES, TASK_RECURRENCES, type TaskPriority } from "@/features/crm/tasks";
import {
  addChecklistItemAction,
  addCommentAction,
  deleteChecklistItemAction,
  deleteCommentAction,
  deleteTaskAction,
  saveTaskAction,
  toggleChecklistItemAction,
  toggleTaskAction,
} from "@/server/actions/tasks";

type Option = { id: string; label: string };
export type TaskValues = {
  id?: string;
  request_id?: string;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: TaskPriority;
  owner_id: string | null;
  contact_id: string | null;
  company_id: string | null;
  deal_id: string | null;
  recurrence: string | null;
};

export function TaskForm({ values, owners, contacts, companies, deals, readOnly }: {
  values: TaskValues; owners: Option[]; contacts: Option[]; companies: Option[]; deals: Option[]; readOnly: boolean;
}) {
  const [state, action, pending] = useActionState(saveTaskAction, {});
  const select = (name: keyof TaskValues, label: string, empty: string, options: Option[]) => (
    <Field label={label} htmlFor={name}>
      <Select id={name} name={name} defaultValue={(values[name] as string | null) ?? ""}>
        <option value="">{empty}</option>
        {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
      </Select>
    </Field>
  );
  return (
    <form action={action} className="flex max-w-2xl flex-col gap-5">
      {values.id ? <input type="hidden" name="id" value={values.id} /> : null}
      {values.request_id ? <input type="hidden" name="request_id" value={values.request_id} /> : null}
      <fieldset disabled={readOnly} className="flex flex-col gap-5">
        <Field label="Título" htmlFor="title">
          <Input id="title" name="title" required maxLength={200} defaultValue={values.title} placeholder="Ex.: Ligar para confirmar consulta" />
        </Field>
        <Field label="Descrição" htmlFor="description">
          <Textarea id="description" name="description" maxLength={5000} defaultValue={values.description ?? ""} className="min-h-24" />
        </Field>
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Prazo" htmlFor="due_date">
            <Input id="due_date" name="due_date" type="date" defaultValue={values.due_date ?? ""} />
          </Field>
          <Field label="Prioridade" htmlFor="priority">
            <Select id="priority" name="priority" defaultValue={values.priority}>
              {TASK_PRIORITIES.map((p) => <option key={p} value={p}>{PRIORITY_LABEL[p]}</option>)}
            </Select>
          </Field>
          <Field label="Repetir" htmlFor="recurrence">
            <Select id="recurrence" name="recurrence" defaultValue={values.recurrence ?? ""}>
              <option value="">Não repetir</option>
              {TASK_RECURRENCES.map((r) => <option key={r} value={r}>{RECURRENCE_LABEL[r]}</option>)}
            </Select>
          </Field>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {select("owner_id", "Responsável", "Sem responsável", owners)}
          {select("deal_id", "Oportunidade", "Nenhuma", deals)}
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {select("contact_id", "Contato", "Nenhum", contacts)}
          {select("company_id", "Empresa", "Nenhuma", companies)}
        </div>
      </fieldset>
      <FormStatus state={state} />
      <div className="flex gap-2">
        {!readOnly ? <Button type="submit" disabled={pending}>{pending ? "Salvando…" : "Salvar"}</Button> : null}
        <Link href={values.id ? `/tasks/${values.id}` : "/tasks"} className={buttonClass("secondary")}>{readOnly ? "Voltar" : "Cancelar"}</Link>
      </div>
    </form>
  );
}

// Círculo de concluir/reabrir: um formulário por tarefa, travado enquanto envia (sem clique duplo).
export function ToggleTask({ id, done, title, size = "sm", showStatus = false }: { id: string; done: boolean; title: string; size?: "sm" | "md"; showStatus?: boolean }) {
  const [state, action, pending] = useActionState(toggleTaskAction, {});
  const Icon = done ? Check : Circle;
  return (
    <form action={action} className={cx("flex items-center gap-2", showStatus && "flex-wrap")}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="done" value={done ? "0" : "1"} />
      <button
        type="submit"
        disabled={pending}
        aria-label={done ? `Reabrir "${title}"` : `Concluir "${title}"`}
        className={cx(
          "grid shrink-0 place-items-center rounded-full border transition-colors duration-100 disabled:opacity-50",
          size === "sm" ? "size-6" : "size-8",
          done ? "border-brand bg-brand text-ink-fg" : "border-border-strong text-transparent hover:border-brand hover:text-brand",
        )}
      >
        <Icon aria-hidden className={size === "sm" ? "size-3.5" : "size-4"} strokeWidth={2.5} />
      </button>
      {showStatus ? <span className="text-sm text-muted">{done ? "Concluída" : "Marcar como concluída"}</span> : null}
      {state.error ? <span role="alert" className="text-xs text-danger">{state.error}</span> : null}
      {showStatus && state.ok ? <span role="status" className="text-xs text-success">{state.message}</span> : null}
    </form>
  );
}

export function Checklist({ taskId, items, canWrite }: { taskId: string; items: { id: string; label: string; done: boolean }[]; canWrite: boolean }) {
  const [state, action, pending] = useActionState(addChecklistItemAction, {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state.ok) ref.current?.reset(); }, [state]);
  const done = items.filter((i) => i.done).length;
  return (
    <div className="flex flex-col gap-3">
      {items.length ? <p className="text-xs text-muted tabular">{done} de {items.length} concluídos</p> : null}
      <ul className="flex flex-col gap-1">
        {items.map((it) => <ChecklistRow key={it.id} taskId={taskId} item={it} canWrite={canWrite} />)}
      </ul>
      {canWrite ? (
        <form ref={ref} action={action} className="flex gap-2">
          <input type="hidden" name="task_id" value={taskId} />
          <label htmlFor="new-item" className="sr-only">Novo item do checklist</label>
          <Input id="new-item" name="label" maxLength={200} placeholder="Adicionar item" className="h-9" />
          <Button type="submit" size="sm" variant="secondary" disabled={pending} className="h-9">Adicionar</Button>
        </form>
      ) : null}
      <FormStatus state={state.error ? state : {}} />
    </div>
  );
}

function ChecklistRow({ taskId, item, canWrite }: { taskId: string; item: { id: string; label: string; done: boolean }; canWrite: boolean }) {
  const [, toggle, toggling] = useActionState(toggleChecklistItemAction, {});
  const [, remove, removing] = useActionState(deleteChecklistItemAction, {});
  return (
    <li className="group flex items-center gap-2 rounded-sm px-1 py-1 hover:bg-surface-2">
      <form action={toggle}>
        <input type="hidden" name="id" value={item.id} />
        <input type="hidden" name="task_id" value={taskId} />
        <input type="hidden" name="done" value={item.done ? "0" : "1"} />
        <button type="submit" disabled={!canWrite || toggling} aria-label={item.done ? `Desmarcar "${item.label}"` : `Marcar "${item.label}"`}
          className={cx("grid size-5 place-items-center rounded-[4px] border disabled:cursor-default", item.done ? "border-brand bg-brand text-ink-fg" : "border-border-strong text-transparent")}>
          <Check aria-hidden className="size-3" strokeWidth={3} />
        </button>
      </form>
      <span className={cx("min-w-0 flex-1 text-sm", item.done && "text-muted line-through")}>{item.label}</span>
      {canWrite ? (
        <form action={remove}>
          <input type="hidden" name="id" value={item.id} />
          <input type="hidden" name="task_id" value={taskId} />
          <button type="submit" disabled={removing} aria-label={`Remover "${item.label}"`} className="grid size-7 place-items-center rounded-full text-muted hover:text-danger">
            <Trash2 aria-hidden className="size-3.5" strokeWidth={1.5} />
          </button>
        </form>
      ) : null}
    </li>
  );
}

const fmt = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" });

export function Comments({ taskId, comments, canWrite }: { taskId: string; comments: { id: string; body: string; author: string; created_at: string; mine: boolean }[]; canWrite: boolean }) {
  const [state, action, pending] = useActionState(addCommentAction, {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state.ok) ref.current?.reset(); }, [state]);
  return (
    <div className="flex flex-col gap-4">
      {comments.length ? (
        <ol className="flex flex-col gap-4">
          {comments.map((c) => (
            <li key={c.id} className="text-sm">
              <p className="text-xs text-muted">{c.author} · {fmt.format(new Date(c.created_at))}</p>
              <p className="mt-1 whitespace-pre-wrap break-words">{c.body}</p>
              {c.mine && canWrite ? <DeleteComment taskId={taskId} id={c.id} /> : null}
            </li>
          ))}
        </ol>
      ) : <p className="text-sm text-muted">Nenhum comentário.</p>}
      {canWrite ? (
        <form ref={ref} action={action} className="flex flex-col gap-2">
          <input type="hidden" name="task_id" value={taskId} />
          <label htmlFor="comment-body" className="sr-only">Novo comentário</label>
          <Textarea id="comment-body" name="body" maxLength={2000} placeholder="Escreva um comentário" className="min-h-20" />
          <Button type="submit" size="sm" disabled={pending} className="self-start">{pending ? "Enviando…" : "Comentar"}</Button>
          <FormStatus state={state.error ? state : {}} />
        </form>
      ) : null}
    </div>
  );
}

function DeleteComment({ taskId, id }: { taskId: string; id: string }) {
  const [, action, pending] = useActionState(deleteCommentAction, {});
  return (
    <form action={action} onSubmit={(e) => { if (!confirm("Apagar este comentário?")) e.preventDefault(); }}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="task_id" value={taskId} />
      <button type="submit" disabled={pending} className="mt-1 text-xs text-muted hover:text-danger">Apagar</button>
    </form>
  );
}

export function DeleteTask({ id, title }: { id: string; title: string }) {
  const [state, action, pending] = useActionState(deleteTaskAction, {});
  return (
    <form action={action} onSubmit={(e) => { if (!confirm(`Excluir "${title}"? Checklist e comentários também serão apagados.`)) e.preventDefault(); }} className="flex flex-col items-start gap-2">
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variant="danger" disabled={pending}>{pending ? "Excluindo…" : "Excluir"}</Button>
      <FormStatus state={state} />
    </form>
  );
}
