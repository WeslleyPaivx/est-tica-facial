"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Button, buttonClass } from "@/design-system/components/button";
import { Field, Input, Select, Textarea } from "@/design-system/components/field";
import { FormStatus } from "@/design-system/components/feedback";
import { centsToInput, DEAL_SOURCES } from "@/features/crm/deals";
import { closeDealAction, deleteDealAction, saveDealAction } from "@/server/actions/deals";

type Option = { id: string; label: string };
export type DealValues = {
  id?: string;
  request_id?: string;
  title: string;
  value_cents: number | null;
  source: string | null;
  stage_id: string;
  contact_id: string | null;
  company_id: string | null;
  owner_id: string | null;
  next_action: string | null;
  next_action_at: string | null;
};

export function DealForm({ values, stages, contacts, companies, owners, readOnly }: {
  values: DealValues; stages: Option[]; contacts: Option[]; companies: Option[]; owners: Option[]; readOnly: boolean;
}) {
  const [state, action, pending] = useActionState(saveDealAction, {});
  const sources = values.source && !DEAL_SOURCES.includes(values.source as (typeof DEAL_SOURCES)[number]) ? [...DEAL_SOURCES, values.source] : DEAL_SOURCES;
  return (
    <form action={action} className="flex max-w-2xl flex-col gap-5">
      {values.id ? <input type="hidden" name="id" value={values.id} /> : null}
      {values.request_id ? <input type="hidden" name="request_id" value={values.request_id} /> : null}
      <fieldset disabled={readOnly} className="flex flex-col gap-5">
        <Field label="Título" htmlFor="title">
          <Input id="title" name="title" required maxLength={200} defaultValue={values.title} placeholder="Ex.: Implante — Maria Souza" />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Valor (R$)" htmlFor="value_cents">
            <Input id="value_cents" name="value_cents" inputMode="decimal" placeholder="0,00" defaultValue={centsToInput(values.value_cents)} />
          </Field>
          <Field label="Etapa" htmlFor="stage_id">
            <Select id="stage_id" name="stage_id" defaultValue={values.stage_id} required>
              {stages.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </Select>
          </Field>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Origem" htmlFor="source">
            <Select id="source" name="source" defaultValue={values.source ?? ""}>
              <option value="">Não informada</option>
              {sources.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </Field>
          <Field label="Responsável" htmlFor="owner_id">
            <Select id="owner_id" name="owner_id" defaultValue={values.owner_id ?? ""}>
              <option value="">Sem responsável</option>
              {owners.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
            </Select>
          </Field>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Contato" htmlFor="contact_id">
            <Select id="contact_id" name="contact_id" defaultValue={values.contact_id ?? ""}>
              <option value="">Sem contato</option>
              {contacts.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </Select>
          </Field>
          <Field label="Empresa" htmlFor="company_id">
            <Select id="company_id" name="company_id" defaultValue={values.company_id ?? ""}>
              <option value="">Sem empresa</option>
              {companies.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </Select>
          </Field>
        </div>
        <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_180px]">
          <Field label="Próxima ação" htmlFor="next_action">
            <Input id="next_action" name="next_action" maxLength={200} defaultValue={values.next_action ?? ""} placeholder="Ex.: Ligar para enviar orçamento" />
          </Field>
          <Field label="Data" htmlFor="next_action_at">
            <Input id="next_action_at" name="next_action_at" type="date" defaultValue={values.next_action_at ?? ""} />
          </Field>
        </div>
      </fieldset>
      <FormStatus state={state} />
      <div className="flex gap-2">
        {!readOnly ? <Button type="submit" disabled={pending}>{pending ? "Salvando…" : "Salvar"}</Button> : null}
        <Link href={values.id ? `/deals/${values.id}` : "/deals"} className={buttonClass("secondary")}>{readOnly ? "Voltar" : "Cancelar"}</Link>
      </div>
    </form>
  );
}

// Ganhar, perder (com motivo) ou reabrir.
export function CloseDeal({ id, status }: { id: string; status: "open" | "won" | "lost" }) {
  const [state, action, pending] = useActionState(closeDealAction, {});
  const [losing, setLosing] = useState(false);
  if (status !== "open") {
    return (
      <form action={action} className="flex flex-col items-start gap-2">
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="status" value="open" />
        <Button type="submit" variant="secondary" disabled={pending}>{pending ? "Reabrindo…" : "Reabrir oportunidade"}</Button>
        <FormStatus state={state} />
      </form>
    );
  }
  return (
    <div className="flex flex-col items-start gap-3">
      <div className="flex flex-wrap gap-2">
        <form action={action}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="status" value="won" />
          <Button type="submit" disabled={pending}>{pending ? "Salvando…" : "Marcar como ganha"}</Button>
        </form>
        <Button type="button" variant="secondary" onClick={() => setLosing((v) => !v)} aria-expanded={losing} disabled={pending}>
          Marcar como perdida
        </Button>
      </div>
      {losing ? (
        <form action={action} className="flex w-full max-w-md flex-col gap-3">
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="status" value="lost" />
          <Field label="Motivo da perda" htmlFor="lost_reason">
            <Textarea id="lost_reason" name="lost_reason" required maxLength={500} placeholder="Ex.: Preço acima do orçamento" className="min-h-20" />
          </Field>
          <Button type="submit" variant="danger" disabled={pending} className="self-start">{pending ? "Salvando…" : "Confirmar perda"}</Button>
        </form>
      ) : null}
      <FormStatus state={state} />
    </div>
  );
}

export function DeleteDeal({ id, title }: { id: string; title: string }) {
  const [state, action, pending] = useActionState(deleteDealAction, {});
  return (
    <form action={action} onSubmit={(e) => { if (!confirm(`Excluir "${title}"? O histórico também será apagado.`)) e.preventDefault(); }} className="flex flex-col items-start gap-2">
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variant="danger" disabled={pending}>{pending ? "Excluindo…" : "Excluir"}</Button>
      <FormStatus state={state} />
    </form>
  );
}
