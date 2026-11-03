"use client";

import { useActionState } from "react";
import { Button } from "@/design-system/components/button";
import { Field, Input, Select } from "@/design-system/components/field";
import { FormStatus } from "@/design-system/components/feedback";
import {
  inviteMemberAction,
  removeMemberAction,
  renameOrganizationAction,
  updateMemberRoleAction,
} from "@/server/actions/organizations";
import { ROLE_LABEL, type Role } from "@/lib/security/permissions";

export function RenameOrgForm({ name, disabled }: { name: string; disabled: boolean }) {
  const [state, action, pending] = useActionState(renameOrganizationAction, {});
  return (
    <form action={action} className="flex max-w-md flex-col gap-4">
      <Field label="Nome" htmlFor="org-name">
        <Input id="org-name" name="name" defaultValue={name} required maxLength={120} disabled={disabled} />
      </Field>
      <FormStatus state={state} />
      {!disabled ? (
        <div>
          <Button type="submit" disabled={pending}>{pending ? "Salvando…" : "Salvar"}</Button>
        </div>
      ) : null}
    </form>
  );
}

export function InviteForm({ roles }: { roles: Role[] }) {
  const [state, action, pending] = useActionState(inviteMemberAction, {});
  return (
    <form action={action} className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px_auto] sm:items-end">
        <Field label="E-mail" htmlFor="invite-email">
          <Input id="invite-email" name="email" type="email" required autoComplete="off" />
        </Field>
        <Field label="Papel" htmlFor="invite-role">
          <Select id="invite-role" name="role" defaultValue={roles.at(-1)}>
            {roles.map((r) => (
              <option key={r} value={r}>{ROLE_LABEL[r]}</option>
            ))}
          </Select>
        </Field>
        <Button type="submit" disabled={pending}>{pending ? "Convidando…" : "Convidar"}</Button>
      </div>
      <FormStatus state={state} />
    </form>
  );
}

export function MemberRoleForm({ memberId, role, roles, label }: { memberId: string; role: Role; roles: Role[]; label: string }) {
  const [state, action, pending] = useActionState(updateMemberRoleAction, {});
  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="memberId" value={memberId} />
      <Select name="role" defaultValue={role} aria-label={`Papel de ${label}`} className="h-8 w-40 text-[13px]">
        {roles.map((r) => (
          <option key={r} value={r}>{ROLE_LABEL[r]}</option>
        ))}
      </Select>
      <Button type="submit" size="sm" variant="secondary" disabled={pending}>Salvar</Button>
      {state.error ? <span role="alert" className="text-xs text-danger">{state.error}</span> : null}
      {state.ok ? <span role="status" className="text-xs text-success">Salvo</span> : null}
    </form>
  );
}

export function RemoveMemberForm({ memberId, label, self }: { memberId: string; label: string; self: boolean }) {
  const [state, action, pending] = useActionState(removeMemberAction, {});
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(self ? "Sair desta organização?" : `Remover ${label} da organização?`)) e.preventDefault();
      }}
      className="flex items-center justify-end gap-2"
    >
      <input type="hidden" name="memberId" value={memberId} />
      {state.error ? <span role="alert" className="text-xs text-danger">{state.error}</span> : null}
      <Button type="submit" size="sm" variant="danger" disabled={pending}>{self ? "Sair" : "Remover"}</Button>
    </form>
  );
}
