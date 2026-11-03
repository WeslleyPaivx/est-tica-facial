import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";
import { PageHeader, Section } from "@/design-system/components/layout";
import { Badge } from "@/design-system/components/feedback";
import { requireOrgSession, can } from "@/server/session";
import { ROLE_LABEL } from "@/lib/security/permissions";
import { AuditList } from "@/components/organizations/audit-list";

export const metadata: Metadata = { title: "Visão geral" };

export default async function OverviewPage() {
  const s = await requireOrgSession();
  const org = s.active.organization;
  const canMembers = can(s, "members.read");
  const { count: memberCount } = canMembers
    ? await s.supabase.from("organization_members").select("id", { count: "exact", head: true }).eq("organization_id", org.id)
    : { count: null };

  const steps = [
    { done: true, label: "Organização criada", href: "/settings/organization" },
    { done: s.aal.current === "aal2", label: "Verificação em duas etapas ativa", href: "/settings/security" },
    ...(canMembers ? [{ done: (memberCount ?? 0) > 1, label: "Equipe convidada", href: "/settings/members" }] : []),
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={org.name} description={`Você acessa como ${ROLE_LABEL[s.active.role].toLowerCase()}.`} />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <Section title="Configuração inicial">
          <ul className="flex flex-col gap-2">
            {steps.map((st) => (
              <li key={st.label}>
                <Link href={st.href} className="flex items-center gap-2 rounded-md px-1 py-1 text-[13px] hover:bg-surface-2">
                  {st.done ? (
                    <CheckCircle2 aria-hidden className="size-4 text-success" strokeWidth={1.75} />
                  ) : (
                    <Circle aria-hidden className="size-4 text-muted" strokeWidth={1.75} />
                  )}
                  <span className={st.done ? "text-muted" : "text-fg"}>{st.label}</span>
                  <span className="sr-only">{st.done ? "(concluído)" : "(pendente)"}</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-3 text-xs text-muted">
            <span>Identificador</span>
            <Badge>{org.slug}</Badge>
            {memberCount !== null ? (
              <>
                <span className="ml-2">Membros</span>
                <Badge>{memberCount}</Badge>
              </>
            ) : null}
          </div>
        </Section>
        {can(s, "audit.read") ? (
          <Section title="Atividade recente" description="Eventos administrativos desta organização.">
            <AuditList organizationId={org.id} limit={8} compact />
          </Section>
        ) : null}
      </div>
    </div>
  );
}
