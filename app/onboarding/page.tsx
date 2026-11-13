import type { Metadata } from "next";
import AuthLayout from "../(auth)/layout";
import { CreateOrgForm } from "@/components/organizations/create-org-form";
import { Alert } from "@/design-system/components/feedback";
import { buttonClass } from "@/design-system/components/button";
import { requireSession } from "@/server/session";
import { acceptInvitationAction } from "@/server/actions/organizations";
import { signOutAction } from "@/server/actions/auth";
import { ROLE_LABEL, isRole } from "@/lib/security/permissions";
import { SubmitButton } from "@/design-system/components/submit-button";

export const metadata: Metadata = { title: "Organização" };

type Invite = { id: string; organization_name: string; role: string; expires_at: string };

export default async function OnboardingPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const s = await requireSession();
  const { error } = await searchParams;
  const { data } = await s.supabase.rpc("my_pending_invitations");
  const invites = (data ?? []) as Invite[];

  return (
    <AuthLayout>
      <h1 className="mb-1.5 text-2xl">Sua organização</h1>
      <p className="mb-7 text-sm text-muted">Aceite um convite pendente ou crie uma nova organização.</p>
      {error === "invite" ? <div className="mb-4"><Alert tone="danger">Convite indisponível, expirado ou já utilizado.</Alert></div> : null}
      {!s.user.emailVerified ? (
        <Alert tone="warning">Confirme seu e-mail para continuar.</Alert>
      ) : (
        <div className="flex flex-col gap-6">
          {invites.length > 0 ? (
            <ul className="flex flex-col divide-y divide-border rounded-md border border-border">
              {invites.map((inv) => (
                <li key={inv.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm">{inv.organization_name}</p>
                    <p className="text-xs text-muted">{isRole(inv.role) ? ROLE_LABEL[inv.role] : inv.role}</p>
                  </div>
                  <form action={acceptInvitationAction}>
                    <input type="hidden" name="invitationId" value={inv.id} />
                    <SubmitButton className={buttonClass("primary", "sm")} pendingLabel="Aceitando…">Aceitar</SubmitButton>
                  </form>
                </li>
              ))}
            </ul>
          ) : null}
          <CreateOrgForm />
        </div>
      )}
      <form action={signOutAction} className="mt-5 text-sm text-muted">
        <SubmitButton className="hover:text-fg" pendingLabel="Saindo…">Sair</SubmitButton>
      </form>
    </AuthLayout>
  );
}
