import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader, Section } from "@/design-system/components/layout";
import { Badge, EmptyState } from "@/design-system/components/feedback";
import { buttonClass } from "@/design-system/components/button";
import { Table, Td, Th } from "@/design-system/components/table";
import { InviteForm, MemberRoleForm, RemoveMemberForm } from "@/components/organizations/org-forms";
import { can, requireOrgSession } from "@/server/session";
import { revokeInvitationAction } from "@/server/actions/organizations";
import { ROLE_LABEL, assignableRoles, canManageMember, isRole, type Role } from "@/lib/security/permissions";
import { SubmitButton } from "@/design-system/components/submit-button";

export const metadata: Metadata = { title: "Membros" };

type MemberRow = { id: string; user_id: string; role: string; created_at: string };
type InviteRow = { id: string; email: string; role: string; expires_at: string };

const fmt = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeZone: "America/Sao_Paulo" });

export default async function MembersPage() {
  const s = await requireOrgSession();
  if (!can(s, "members.read")) redirect("/");
  const orgId = s.active.organization_id;
  const canManage = can(s, "members.manage");
  const canInvite = can(s, "members.invite");

  const [{ data: memberData }, { data: inviteData }] = await Promise.all([
    s.supabase.from("organization_members").select("id, user_id, role, created_at").eq("organization_id", orgId).order("created_at"),
    canInvite
      ? s.supabase
          .from("organization_invitations")
          .select("id, email, role, expires_at")
          .eq("organization_id", orgId)
          .eq("status", "pending")
          .gt("expires_at", new Date().toISOString())
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] as InviteRow[] }),
  ]);
  const members = (memberData ?? []) as MemberRow[];
  const invites = (inviteData ?? []) as InviteRow[];
  const { data: profileData } = await s.supabase.from("profiles").select("id, full_name").in("id", members.map((m) => m.user_id));
  const names = new Map((profileData ?? []).map((p: { id: string; full_name: string }) => [p.id, p.full_name]));
  const me = s.active.role;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Membros" description="Pessoas com acesso a esta organização e seus papéis." />

      {canInvite ? (
        <Section title="Convidar" description="A pessoa entra com o e-mail convidado (verificado) e aceita o convite.">
          <InviteForm roles={assignableRoles(me, { forInvite: true })} />
        </Section>
      ) : null}

      <Table>
        <thead>
          <tr><Th>Nome</Th><Th>Papel</Th><Th>Desde</Th><Th className="text-right"><span className="sr-only">Ações</span></Th></tr>
        </thead>
        <tbody>
          {members.map((m) => {
            const role = (isRole(m.role) ? m.role : "limited") as Role;
            const self = m.user_id === s.user.id;
            const label = names.get(m.user_id) || "Sem nome";
            const manageable = canManage && !self && canManageMember(me, role);
            return (
              <tr key={m.id}>
                <Td>
                  <span className="">{label}</span>
                  {self ? <span className="ml-2 text-xs text-muted">(você)</span> : null}
                </Td>
                <Td>
                  {manageable ? (
                    <MemberRoleForm memberId={m.id} role={role} roles={assignableRoles(me, { forInvite: false })} label={label} />
                  ) : (
                    <Badge>{ROLE_LABEL[role]}</Badge>
                  )}
                </Td>
                <Td className="text-muted">{fmt.format(new Date(m.created_at))}</Td>
                <Td>{manageable || self ? <RemoveMemberForm memberId={m.id} label={label} self={self} /> : null}</Td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      {canInvite ? (
        <Section title="Convites pendentes">
          {invites.length === 0 ? (
            <EmptyState title="Nenhum convite pendente." />
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {invites.map((inv) => (
                <li key={inv.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                  <span className="min-w-0 truncate">
                    {inv.email} <span className="text-muted">· {isRole(inv.role) ? ROLE_LABEL[inv.role] : inv.role} · expira {fmt.format(new Date(inv.expires_at))}</span>
                  </span>
                  <form action={revokeInvitationAction}>
                    <input type="hidden" name="invitationId" value={inv.id} />
                    <SubmitButton className={buttonClass("secondary", "sm")} pendingLabel="Revogando…">Revogar</SubmitButton>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </Section>
      ) : null}
    </div>
  );
}
