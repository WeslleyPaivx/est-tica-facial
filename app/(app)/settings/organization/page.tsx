import type { Metadata } from "next";
import { PageHeader, Section } from "@/design-system/components/layout";
import { Badge } from "@/design-system/components/feedback";
import { RenameOrgForm } from "@/components/organizations/org-forms";
import { can, requireOrgSession } from "@/server/session";

export const metadata: Metadata = { title: "Organização" };

export default async function OrganizationSettingsPage() {
  const s = await requireOrgSession();
  const org = s.active.organization;
  const editable = can(s, "org.update");
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Organização" description="Dados gerais do espaço de trabalho." />
      <Section title="Identificação" description={editable ? undefined : "Somente proprietários e administradores podem editar."}>
        <RenameOrgForm name={org.name} disabled={!editable} />
        <dl className="mt-5 grid max-w-md grid-cols-[120px_1fr] gap-y-2 border-t border-border pt-4 text-[13px]">
          <dt className="text-muted">Identificador</dt>
          <dd className="font-mono">{org.slug}</dd>
          <dt className="text-muted">Status</dt>
          <dd><Badge tone={org.status === "active" ? "success" : "warning"}>{org.status === "active" ? "Ativa" : "Suspensa"}</Badge></dd>
        </dl>
      </Section>
    </div>
  );
}
