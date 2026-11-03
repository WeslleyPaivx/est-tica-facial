import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";
import { PageHeader, Section, StatCard } from "@/design-system/components/layout";
import { requireOrgSession, can, type OrgSession } from "@/server/session";
import { ROLE_LABEL } from "@/lib/security/permissions";
import { AuditList } from "@/components/organizations/audit-list";

export const metadata: Metadata = { title: "Visão geral" };

// Contagem real sob RLS; null quando o papel não tem a permissão (o card não aparece).
async function count(s: OrgSession, table: string, permission: string, pendingOnly = false) {
  if (!can(s, permission)) return null;
  let q = s.supabase.from(table).select("id", { count: "exact", head: true }).eq("organization_id", s.active.organization_id);
  if (pendingOnly) q = q.eq("status", "pending").gt("expires_at", new Date().toISOString());
  const { count: n } = await q;
  return n ?? 0;
}

export default async function OverviewPage() {
  const s = await requireOrgSession();
  const org = s.active.organization;

  const [members, invites, companies, contacts] = await Promise.all([
    count(s, "organization_members", "members.read"),
    count(s, "organization_invitations", "members.invite", true),
    count(s, "companies", "companies.read"),
    count(s, "contacts", "contacts.read"),
  ]);

  const stats = [
    { value: members, label: "Membros na organização", accent: "forest" },
    { value: invites, label: "Convites pendentes", accent: "pink" },
    { value: companies, label: "Empresas cadastradas", accent: "accent" },
    { value: contacts, label: "Contatos cadastrados", accent: "butter" },
  ] as const;

  const steps = [
    { done: true, label: "Organização criada", href: "/settings/organization" },
    { done: s.aal.current === "aal2", label: "Verificação em duas etapas ativa", href: "/settings/security" },
    ...(members !== null ? [{ done: members > 1, label: "Equipe convidada", href: "/settings/members" }] : []),
  ];

  return (
    <div className="flex flex-col gap-10">
      <PageHeader title={org.name} description={`Você acessa como ${ROLE_LABEL[s.active.role].toLowerCase()}.`} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.filter((st) => st.value !== null).map((st) => (
          <StatCard key={st.label} value={st.value} label={st.label} accent={st.accent} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <Section title="Configuração inicial">
          <ul className="flex flex-col gap-1">
            {steps.map((st) => (
              <li key={st.label}>
                <Link href={st.href} className="flex items-center gap-3 rounded-sm px-2 py-2 text-sm hover:bg-surface-2">
                  {st.done ? (
                    <CheckCircle2 aria-hidden className="size-5 text-success" strokeWidth={1.5} />
                  ) : (
                    <Circle aria-hidden className="size-5 text-muted" strokeWidth={1.5} />
                  )}
                  <span className={st.done ? "text-muted" : "text-fg"}>{st.label}</span>
                  <span className="sr-only">{st.done ? "(concluído)" : "(pendente)"}</span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-xs text-muted">
            Identificador <span className="font-mono text-fg">{org.slug}</span>
          </p>
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
