"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button, buttonClass } from "@/design-system/components/button";
import { Field, Input, Select, Textarea } from "@/design-system/components/field";
import { FormStatus } from "@/design-system/components/feedback";
import { deleteCompanyAction, deleteContactAction, saveCompanyAction, saveContactAction } from "@/server/actions/crm";

type Option = { id: string; label: string };

export type CompanyValues = { id?: string; name: string; email: string | null; phone: string | null; website: string | null; notes: string | null };
export type ContactValues = {
  id?: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  company_id: string | null;
  owner_id: string | null;
  notes: string | null;
};

function Actions({ pending, cancelHref, readOnly }: { pending: boolean; cancelHref: string; readOnly: boolean }) {
  return (
    <div className="flex gap-2">
      {!readOnly ? <Button type="submit" disabled={pending}>{pending ? "Salvando…" : "Salvar"}</Button> : null}
      <Link href={cancelHref} className={buttonClass("secondary")}>{readOnly ? "Voltar" : "Cancelar"}</Link>
    </div>
  );
}

export function CompanyForm({ values, readOnly }: { values: CompanyValues; readOnly: boolean }) {
  const [state, action, pending] = useActionState(saveCompanyAction, {});
  return (
    <form action={action} className="flex max-w-2xl flex-col gap-5">
      {values.id ? <input type="hidden" name="id" value={values.id} /> : null}
      <fieldset disabled={readOnly} className="flex flex-col gap-5">
        <Field label="Nome" htmlFor="name"><Input id="name" name="name" required maxLength={200} defaultValue={values.name} /></Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="E-mail" htmlFor="email"><Input id="email" name="email" type="email" maxLength={254} defaultValue={values.email ?? ""} /></Field>
          <Field label="Telefone" htmlFor="phone"><Input id="phone" name="phone" type="tel" maxLength={30} defaultValue={values.phone ?? ""} /></Field>
        </div>
        <Field label="Site" htmlFor="website"><Input id="website" name="website" type="url" placeholder="https://" maxLength={200} defaultValue={values.website ?? ""} /></Field>
        <Field label="Notas administrativas" htmlFor="notes"><Textarea id="notes" name="notes" maxLength={5000} defaultValue={values.notes ?? ""} /></Field>
      </fieldset>
      <FormStatus state={state} />
      <Actions pending={pending} cancelHref="/companies" readOnly={readOnly} />
    </form>
  );
}

export function ContactForm({ values, companies, owners, readOnly }: { values: ContactValues; companies: Option[]; owners: Option[]; readOnly: boolean }) {
  const [state, action, pending] = useActionState(saveContactAction, {});
  return (
    <form action={action} className="flex max-w-2xl flex-col gap-5">
      {values.id ? <input type="hidden" name="id" value={values.id} /> : null}
      <fieldset disabled={readOnly} className="flex flex-col gap-5">
        <Field label="Nome" htmlFor="full_name"><Input id="full_name" name="full_name" required maxLength={200} defaultValue={values.full_name} /></Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="E-mail" htmlFor="email"><Input id="email" name="email" type="email" maxLength={254} defaultValue={values.email ?? ""} /></Field>
          <Field label="Telefone" htmlFor="phone"><Input id="phone" name="phone" type="tel" maxLength={30} defaultValue={values.phone ?? ""} /></Field>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Empresa" htmlFor="company_id">
            <Select id="company_id" name="company_id" defaultValue={values.company_id ?? ""}>
              <option value="">Sem empresa</option>
              {companies.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </Select>
          </Field>
          <Field label="Responsável" htmlFor="owner_id">
            <Select id="owner_id" name="owner_id" defaultValue={values.owner_id ?? ""}>
              <option value="">Sem responsável</option>
              {owners.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
            </Select>
          </Field>
        </div>
        <Field label="Notas administrativas" htmlFor="notes"><Textarea id="notes" name="notes" maxLength={5000} defaultValue={values.notes ?? ""} /></Field>
      </fieldset>
      <FormStatus state={state} />
      <Actions pending={pending} cancelHref="/contacts" readOnly={readOnly} />
    </form>
  );
}

export function DeleteRecord({ entity, id, label }: { entity: "companies" | "contacts"; id: string; label: string }) {
  const [state, action, pending] = useActionState(entity === "companies" ? deleteCompanyAction : deleteContactAction, {});
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(`Excluir ${label}? Esta ação não pode ser desfeita.`)) e.preventDefault();
      }}
      className="flex flex-col items-start gap-2"
    >
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variant="danger" disabled={pending}>{pending ? "Excluindo…" : "Excluir"}</Button>
      <FormStatus state={state} />
    </form>
  );
}
